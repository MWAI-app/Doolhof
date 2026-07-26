const TIERS = [
  { id: "bronze", maxLevel: 5, label: "Boer", colors: ["#f0c088", "#cd7f32", "#7a4a1e"] },
  { id: "silver", maxLevel: 10, label: "Queen", colors: ["#f6f6f6", "#c0c0c0", "#6e6e6e"] },
  { id: "gold", maxLevel: 15, label: "King", colors: ["#fff3b0", "#ffd700", "#a8790a"] },
  { id: "diamond", maxLevel: 20, label: "Ace", colors: ["#ffffff", "#bfe9ff", "#4fa3d1"] },
];

function coinSvg(tier) {
  const [light, mid, dark] = tier.colors;
  const gradId = `coin-grad-${tier.id}`;
  const letter = tier.label[0];
  return `
    <svg viewBox="0 0 100 100" class="trophy-icon" role="img" aria-label="${tier.label} munt">
      <defs>
        <radialGradient id="${gradId}" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stop-color="${light}" />
          <stop offset="55%" stop-color="${mid}" />
          <stop offset="100%" stop-color="${dark}" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#${gradId})" stroke="${dark}" stroke-width="3" />
      <circle cx="50" cy="50" r="36" fill="none" stroke="${light}" stroke-width="2" opacity="0.6" />
      <text x="50" y="66" text-anchor="middle" font-size="42" font-family="Georgia, serif" font-weight="bold" fill="${dark}">${letter}</text>
    </svg>
  `;
}

function dragonCupSvg() {
  return `
    <svg viewBox="0 0 100 120" class="trophy-icon trophy-cup" role="img" aria-label="Bokaal met draak">
      <defs>
        <linearGradient id="cup-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff3b0" />
          <stop offset="50%" stop-color="#ffd700" />
          <stop offset="100%" stop-color="#a8790a" />
        </linearGradient>
      </defs>
      <path d="M30 12 H70 V30 C70 45 60 52 50 52 C40 52 30 45 30 30 Z" fill="url(#cup-grad)" stroke="#7a5a0a" stroke-width="2"/>
      <path d="M30 16 C18 16 14 26 20 34 C24 39 30 39 30 32" fill="none" stroke="#a8790a" stroke-width="3"/>
      <path d="M70 16 C82 16 86 26 80 34 C76 39 70 39 70 32" fill="none" stroke="#a8790a" stroke-width="3"/>
      <rect x="46" y="52" width="8" height="18" fill="url(#cup-grad)" stroke="#7a5a0a" stroke-width="2"/>
      <path d="M28 70 H72 L66 82 H34 Z" fill="url(#cup-grad)" stroke="#7a5a0a" stroke-width="2"/>
      <g transform="translate(46 6)">
        <path d="M-11 9 C-18 6 -19 -3 -11 -6 C-14 -2 -13 4 -7 6" fill="none" stroke="#1c6a38" stroke-width="2" stroke-linecap="round"/>
        <path d="M-4 -7 C-9 -12 -4 -17 2 -14 C-1 -11 0 -8 3 -7 Z" fill="#3fbf6b" stroke="#1c6a38" stroke-width="1.2"/>
        <ellipse cx="0" cy="4" rx="9" ry="7" fill="#2f9e57" stroke="#1c6a38" stroke-width="1.5"/>
        <polygon points="-4,-2 -2,-8 0,-2" fill="#1c6a38"/>
        <polygon points="2,-3 4,-9 6,-3" fill="#1c6a38"/>
        <ellipse cx="10" cy="-1" rx="5.5" ry="4.5" fill="#2f9e57" stroke="#1c6a38" stroke-width="1.5"/>
        <path d="M14 -2 L20 0 L14 2 Z" fill="#2f9e57" stroke="#1c6a38" stroke-width="1"/>
        <path d="M8 -5 L10 -9 L11.5 -5 Z" fill="#1c6a38"/>
        <circle cx="11" cy="-2" r="1.1" fill="#0c2c17"/>
      </g>
    </svg>
  `;
}

export function getTrophy(level) {
  if (level > 20) {
    return {
      id: "dragon-cup",
      label: "Kampioensbokaal",
      svg: dragonCupSvg(),
      motto: "You are on top of the world!",
    };
  }
  const tier = TIERS.find((t) => level <= t.maxLevel);
  return { id: tier.id, label: tier.label, svg: coinSvg(tier), motto: null };
}
