import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { generateMaze } from "./maze.js";
import { isTouchDevice, setupTouchControls } from "./touch-controls.js";
import { getTrophy } from "./trophies.js";
import { loadProgress, saveProgress, clearProgress } from "./save.js";
import { shareProgress } from "./share.js";

const CELL_SIZE = 4;
const WALL_HEIGHT = 3;
const WALL_THICKNESS = 0.2;
const PLAYER_RADIUS = 0.35;
const PLAYER_HEIGHT = 1.6;
const MOVE_SPEED = 5;
const TURN_SPEED = 2.2;
const START_MAZE_SIZE = 6;
const MAX_MAZE_SIZE = 20;

const hudLevel = document.getElementById("hud-level");
const hudTimer = document.getElementById("hud-timer");
const hudScore = document.getElementById("hud-score");
const overlay = document.getElementById("overlay");
const overlayInstructions = document.getElementById("overlay-instructions");
const overlayHint = document.getElementById("overlay-hint");
const startBtn = document.getElementById("start-btn");
const continueBtn = document.getElementById("continue-btn");
const levelCompleteEl = document.getElementById("level-complete");
const levelCompleteBox = document.getElementById("level-complete-box");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const rotateWarning = document.getElementById("rotate-warning");

const touchMode = isTouchDevice();
const touchState = touchMode ? setupTouchControls() : null;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a12);
scene.fog = new THREE.Fog(0x0a0a12, 10, 32);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.touchAction = "none";
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

scene.add(new THREE.HemisphereLight(0xaabbee, 0x33322a, 1.1));
const torch = new THREE.PointLight(0xffcc88, 3, 18, 1.6);
camera.add(torch);
scene.add(camera);

const controls = new PointerLockControls(camera, renderer.domElement);
const player = controls.getObject();
scene.add(player);

function enterImmersiveMode() {
  document.documentElement.requestFullscreen?.().catch(() => {});
  screen.orientation?.lock?.("landscape").catch(() => {});
}

if (touchMode) {
  document.body.classList.add("touch-mode");
  overlayInstructions.textContent = "Vind de uitgang. Linker joystick: lopen. Rechter joystick: rondkijken.";
  overlayHint.textContent = "Tik op een knop om te beginnen.";

  fullscreenBtn.classList.remove("hidden");
  fullscreenBtn.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      enterImmersiveMode();
    }
  });

  const updateOrientationWarning = () => {
    rotateWarning.classList.toggle("hidden", window.innerWidth >= window.innerHeight);
  };
  window.addEventListener("resize", updateOrientationWarning);
  window.addEventListener("orientationchange", updateOrientationWarning);
  updateOrientationWarning();
}

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x7788aa, roughness: 0.8 });
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x30323e, roughness: 1 });
const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x1c1d26, roughness: 1 });
const exitMaterial = new THREE.MeshStandardMaterial({
  color: 0x33ff66,
  emissive: 0x33ff66,
  emissiveIntensity: 0.6,
});

let mazeGroup = null;
let wallBoxes = [];
let exitCenter = new THREE.Vector2();
let level = 1;
let score = 0;
let running = false;
let totalElapsed = 0;
let levelStartTime = 0;
let transitioning = false;

const keys = { forward: false, back: false, left: false, right: false };

function mazeSizeForLevel(lvl) {
  const size = START_MAZE_SIZE + (lvl - 1) * 2;
  return Math.min(size, MAX_MAZE_SIZE);
}

function buildMaze(lvl) {
  if (mazeGroup) {
    scene.remove(mazeGroup);
  }
  mazeGroup = new THREE.Group();
  wallBoxes = [];

  const size = mazeSizeForLevel(lvl);
  const maze = generateMaze(size, size);
  const half = ((size - 1) * CELL_SIZE) / 2;

  const toWorldX = (cx) => cx * CELL_SIZE - half;
  const toWorldZ = (cy) => cy * CELL_SIZE - half;

  const addWall = (cx, cz, sx, sz) => {
    const geo = new THREE.BoxGeometry(sx, WALL_HEIGHT, sz);
    const mesh = new THREE.Mesh(geo, wallMaterial);
    mesh.position.set(cx, WALL_HEIGHT / 2, cz);
    mazeGroup.add(mesh);
    wallBoxes.push(new THREE.Box3().setFromObject(mesh));
  };

  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const cell = maze.cells[y][x];
      const wx = toWorldX(x);
      const wz = toWorldZ(y);

      if (cell.W) {
        addWall(wx - CELL_SIZE / 2, wz, WALL_THICKNESS, CELL_SIZE + WALL_THICKNESS);
      }
      if (x === maze.width - 1 && cell.E) {
        addWall(wx + CELL_SIZE / 2, wz, WALL_THICKNESS, CELL_SIZE + WALL_THICKNESS);
      }
      if (cell.S) {
        addWall(wx, wz + CELL_SIZE / 2, CELL_SIZE + WALL_THICKNESS, WALL_THICKNESS);
      }
      if (y === 0 && cell.N) {
        addWall(wx, wz - CELL_SIZE / 2, CELL_SIZE + WALL_THICKNESS, WALL_THICKNESS);
      }
    }
  }

  const floorSize = size * CELL_SIZE;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  mazeGroup.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, floorSize), ceilingMaterial);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, WALL_HEIGHT, 0);
  mazeGroup.add(ceiling);

  const exitX = toWorldX(maze.width - 1);
  const exitZ = toWorldZ(maze.height - 1);
  exitCenter.set(exitX, exitZ);
  const exitMarker = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 24), exitMaterial);
  exitMarker.position.set(exitX, 0.06, exitZ);
  mazeGroup.add(exitMarker);
  const exitLight = new THREE.PointLight(0x33ff66, 1.2, 8);
  exitLight.position.set(exitX, 1.5, exitZ);
  mazeGroup.add(exitLight);

  scene.add(mazeGroup);

  const startX = toWorldX(0);
  const startZ = toWorldZ(0);
  player.position.set(startX, PLAYER_HEIGHT, startZ);
  camera.rotation.set(0, 0, 0);
  // Cell (0,0) always has its N and W sides walled off (maze border), so
  // face whichever of S/E is actually open instead of a hardcoded corridor.
  const startCell = maze.cells[0][0];
  const startYaw = !startCell.S ? Math.PI : -Math.PI / 2;
  player.rotation.set(0, startYaw, 0);
}

function canMoveTo(x, z) {
  const box = new THREE.Box3(
    new THREE.Vector3(x - PLAYER_RADIUS, 0.1, z - PLAYER_RADIUS),
    new THREE.Vector3(x + PLAYER_RADIUS, WALL_HEIGHT - 0.1, z + PLAYER_RADIUS)
  );
  for (const wallBox of wallBoxes) {
    if (box.intersectsBox(wallBox)) return false;
  }
  return true;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function startLevel(lvl) {
  level = lvl;
  buildMaze(level);
  levelStartTime = performance.now();
  hudLevel.textContent = `Level ${level}`;
  hudScore.textContent = `Score: ${score}`;
}

function completeLevel() {
  if (transitioning) return;
  transitioning = true;
  running = false;
  controls.unlock();

  const levelTime = (performance.now() - levelStartTime) / 1000;
  const points = Math.max(100, Math.round(2000 - levelTime * 15)) * level;
  score += points;

  const nextLevel = level + 1;
  saveProgress(nextLevel, score);

  const trophy = getTrophy(level);
  const mottoHtml = trophy.motto ? `<p class="trophy-motto">${trophy.motto}</p>` : "";
  const trophyLabelText = trophy.count > 1 ? `${trophy.label} ×${trophy.count}` : trophy.label;

  levelCompleteBox.innerHTML = `
    <div class="trophy-wrap">${trophy.svg}</div>
    <h2>Level ${level} voltooid!</h2>
    <p class="trophy-label">${trophyLabelText}</p>
    ${mottoHtml}
    <p>Tijd: ${levelTime.toFixed(1)}s</p>
    <p>+${points} punten</p>
    <button id="share-btn" type="button">Deel je resultaat</button>
    <p class="share-status" aria-live="polite"></p>
    <p>Klik om verder te gaan naar level ${level + 1}</p>
  `;
  levelCompleteEl.classList.remove("hidden");

  const shareBtn = document.getElementById("share-btn");
  const shareStatus = levelCompleteBox.querySelector(".share-status");
  shareBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    shareStatus.textContent = "";
    const result = await shareProgress(level, score, trophyLabelText);
    if (result === "copied") {
      shareStatus.textContent = "Tekst gekopieerd naar klembord!";
    } else if (result === "unavailable") {
      shareStatus.textContent = "Delen is niet beschikbaar in deze browser.";
    }
  });

  const resume = () => {
    levelCompleteEl.classList.add("hidden");
    levelCompleteEl.removeEventListener("click", resume);
    startLevel(nextLevel);
    if (touchMode) {
      running = true;
    } else {
      controls.lock();
    }
    transitioning = false;
  };
  levelCompleteEl.addEventListener("click", resume);
}

function onKeyDown(e) {
  switch (e.code) {
    case "KeyW":
    case "ArrowUp":
      keys.forward = true;
      break;
    case "KeyS":
    case "ArrowDown":
      keys.back = true;
      break;
    case "KeyA":
    case "ArrowLeft":
      keys.left = true;
      break;
    case "KeyD":
    case "ArrowRight":
      keys.right = true;
      break;
  }
}

function onKeyUp(e) {
  switch (e.code) {
    case "KeyW":
    case "ArrowUp":
      keys.forward = false;
      break;
    case "KeyS":
    case "ArrowDown":
      keys.back = false;
      break;
    case "KeyA":
    case "ArrowLeft":
      keys.left = false;
      break;
    case "KeyD":
    case "ArrowRight":
      keys.right = false;
      break;
  }
}

document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

let hasBegun = false;
const savedProgress = loadProgress();

function unlockAndRun() {
  overlay.classList.add("hidden");
  if (touchMode) {
    running = true;
    enterImmersiveMode();
  } else {
    controls.lock();
  }
}

function beginGame(startLevelNum, startScore) {
  hasBegun = true;
  score = startScore;
  startLevel(startLevelNum);
  continueBtn.classList.add("hidden");
  startBtn.textContent = "Verder spelen";
  unlockAndRun();
}

if (savedProgress) {
  continueBtn.textContent = `Doorgaan (level ${savedProgress.level}, score ${savedProgress.score})`;
  continueBtn.classList.remove("hidden");
  startBtn.textContent = "Nieuw spel";
  continueBtn.addEventListener("click", () => {
    beginGame(savedProgress.level, savedProgress.score);
  });
}

startBtn.addEventListener("click", () => {
  if (hasBegun) {
    unlockAndRun();
    return;
  }
  clearProgress();
  beginGame(1, 0);
});

controls.addEventListener("lock", () => {
  overlay.classList.add("hidden");
  running = true;
});

controls.addEventListener("unlock", () => {
  if (!transitioning) {
    overlay.classList.remove("hidden");
    running = false;
  }
});

const forwardVec = new THREE.Vector3();
const rightVec = new THREE.Vector3();
const moveVec = new THREE.Vector3();

function updateMovement(delta) {
  if (!running) return;

  if (touchState && touchState.look.x !== 0) {
    camera.rotation.y -= touchState.look.x * TURN_SPEED * delta;
  }

  camera.getWorldDirection(forwardVec);
  forwardVec.y = 0;
  forwardVec.normalize();
  rightVec.set(forwardVec.z, 0, -forwardVec.x);

  let inputForward = 0;
  let inputStrafe = 0;
  if (keys.forward) inputForward += 1;
  if (keys.back) inputForward -= 1;
  if (keys.right) inputStrafe += 1;
  if (keys.left) inputStrafe -= 1;
  if (touchState) {
    inputForward += touchState.move.y;
    inputStrafe += touchState.move.x;
  }

  moveVec.set(0, 0, 0).addScaledVector(forwardVec, inputForward).addScaledVector(rightVec, inputStrafe);
  const len = moveVec.length();
  if (len > 0) {
    const speed = Math.min(len, 1) * MOVE_SPEED * delta;
    moveVec.normalize().multiplyScalar(speed);

    const pos = player.position;
    if (canMoveTo(pos.x + moveVec.x, pos.z)) pos.x += moveVec.x;
    if (canMoveTo(pos.x, pos.z + moveVec.z)) pos.z += moveVec.z;
  }

  const dist = Math.hypot(player.position.x - exitCenter.x, player.position.z - exitCenter.y);
  if (dist < CELL_SIZE * 0.4) {
    completeLevel();
  }
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  updateMovement(delta);

  if (running) {
    totalElapsed += delta;
    hudTimer.textContent = formatTime(totalElapsed);
  }

  renderer.render(scene, camera);
}

startLevel(1);
animate();
