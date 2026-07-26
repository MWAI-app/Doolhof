export function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function joystickRadius() {
  const base = Math.min(window.innerWidth, window.innerHeight);
  return Math.max(45, Math.min(75, base * 0.12));
}

function createJoystickVisual(container) {
  const base = document.createElement("div");
  base.className = "joystick-base hidden";
  const stick = document.createElement("div");
  stick.className = "joystick-stick";
  base.appendChild(stick);
  container.appendChild(base);
  return { base, stick };
}

function setSize(visual, radius) {
  const size = radius * 2;
  visual.base.style.width = `${size}px`;
  visual.base.style.height = `${size}px`;
  visual.stick.style.width = `${size * 0.45}px`;
  visual.stick.style.height = `${size * 0.45}px`;
}

export function setupTouchControls() {
  const state = {
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
  };

  const container = document.createElement("div");
  container.id = "touch-controls";
  document.body.appendChild(container);

  const leftVisual = createJoystickVisual(container);
  const rightVisual = createJoystickVisual(container);

  let radius = joystickRadius();
  setSize(leftVisual, radius);
  setSize(rightVisual, radius);
  window.addEventListener("resize", () => {
    radius = joystickRadius();
    setSize(leftVisual, radius);
    setSize(rightVisual, radius);
  });

  let leftTouchId = null;
  let rightTouchId = null;
  const leftOrigin = { x: 0, y: 0 };
  const rightOrigin = { x: 0, y: 0 };

  function showStick(visual, origin, x, y) {
    origin.x = x;
    origin.y = y;
    visual.base.style.left = `${x}px`;
    visual.base.style.top = `${y}px`;
    visual.base.classList.remove("hidden");
    visual.stick.style.transform = "translate(-50%, -50%)";
  }

  function dragStick(visual, origin, axis, x, y) {
    let dx = x - origin.x;
    let dy = y - origin.y;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) {
      dx = (dx / dist) * radius;
      dy = (dy / dist) * radius;
    }
    visual.stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    axis.x = dx / radius;
    axis.y = -dy / radius;
  }

  function hideStick(visual, axis) {
    visual.base.classList.add("hidden");
    axis.x = 0;
    axis.y = 0;
  }

  function handleStart(e) {
    for (const touch of e.changedTouches) {
      const isLeft = touch.clientX < window.innerWidth / 2;
      if (isLeft && leftTouchId === null) {
        leftTouchId = touch.identifier;
        showStick(leftVisual, leftOrigin, touch.clientX, touch.clientY);
      } else if (!isLeft && rightTouchId === null) {
        rightTouchId = touch.identifier;
        showStick(rightVisual, rightOrigin, touch.clientX, touch.clientY);
      }
    }
  }

  function handleMove(e) {
    for (const touch of e.changedTouches) {
      if (touch.identifier === leftTouchId) {
        dragStick(leftVisual, leftOrigin, state.move, touch.clientX, touch.clientY);
      } else if (touch.identifier === rightTouchId) {
        dragStick(rightVisual, rightOrigin, state.look, touch.clientX, touch.clientY);
      }
    }
  }

  function handleEnd(e) {
    for (const touch of e.changedTouches) {
      if (touch.identifier === leftTouchId) {
        leftTouchId = null;
        hideStick(leftVisual, state.move);
      } else if (touch.identifier === rightTouchId) {
        rightTouchId = null;
        hideStick(rightVisual, state.look);
      }
    }
  }

  container.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      handleStart(e);
    },
    { passive: false }
  );
  container.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      handleMove(e);
    },
    { passive: false }
  );
  container.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      handleEnd(e);
    },
    { passive: false }
  );
  container.addEventListener(
    "touchcancel",
    (e) => {
      e.preventDefault();
      handleEnd(e);
    },
    { passive: false }
  );

  return state;
}
