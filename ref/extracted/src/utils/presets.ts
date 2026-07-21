import { SpritesheetPreset, SpriteSlice, SpritesheetAnimation } from '../types';

function svgToDataUrl(svgString: string): string {
  try {
    const trimmed = svgString.trim();
    const base64 = btoa(unescape(encodeURIComponent(trimmed)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch (e) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString.trim())}`;
  }
}

// =========================================================================
// PRESET 1: Bouncing Slime Pet (400x100, 1 row of 4 cells of 100x100px)
// =========================================================================
const slimeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10B981" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#10B981" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- FRAME 1 (0 to 100): Idle / Cute -->
  <g transform="translate(0, 0)">
    <!-- Floor Shadow -->
    <ellipse cx="50" cy="85" rx="30" ry="6" fill="#1F2937" fill-opacity="0.2"/>
    <!-- Body -->
    <path d="M 20,70 C 20,35 35,20 50,20 C 65,20 80,35 80,70 C 80,82 70,80 50,80 C 30,80 20,82 20,70 Z" fill="#10B981" stroke="#047857" stroke-width="3"/>
    <!-- Face -->
    <ellipse cx="42" cy="50" rx="4" ry="5" fill="#111827"/>
    <ellipse cx="58" cy="50" rx="4" ry="5" fill="#111827"/>
    <ellipse cx="40" cy="48" rx="1.5" ry="2" fill="#FFFFFF"/>
    <ellipse cx="56" cy="48" rx="1.5" ry="2" fill="#FFFFFF"/>
    <ellipse cx="35" cy="55" rx="4" ry="2" fill="#F472B6"/>
    <ellipse cx="65" cy="55" rx="4" ry="2" fill="#F472B6"/>
    <path d="M 47,56 Q 50,59 53,56" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- FRAME 2 (100 to 200): Squash / Prepare -->
  <g transform="translate(100, 0)">
    <!-- Floor Shadow -->
    <ellipse cx="50" cy="85" rx="35" ry="5" fill="#1F2937" fill-opacity="0.25"/>
    <!-- Body (Squashed down) -->
    <path d="M 15,75 C 15,50 30,40 50,40 C 70,40 85,50 85,75 C 85,84 75,82 50,82 C 25,82 15,84 15,75 Z" fill="#059669" stroke="#047857" stroke-width="3"/>
    <!-- Face (Determined squint) -->
    <path d="M 37,56 L 45,54" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 63,56 L 55,54" stroke="#111827" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="32" cy="60" rx="3" ry="1.5" fill="#F472B6"/>
    <ellipse cx="68" cy="60" rx="3" ry="1.5" fill="#F472B6"/>
    <path d="M 46,62 Q 50,60 54,62" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- FRAME 3 (200 to 300): Stretch / Jump Airborne -->
  <g transform="translate(200, 0)">
    <!-- Floor Shadow (Small, representing distance) -->
    <ellipse cx="50" cy="90" rx="15" ry="3" fill="#1F2937" fill-opacity="0.1"/>
    <!-- Body (Stretched tall, floating high) -->
    <path d="M 28,50 C 28,15 40,5 50,5 C 60,5 72,15 72,50 C 72,68 62,65 50,65 C 38,65 28,68 28,50 Z" fill="#34D399" stroke="#047857" stroke-width="3"/>
    <!-- Face (Excited wide eyes) -->
    <circle cx="43" cy="32" r="5" fill="#111827"/>
    <circle cx="57" cy="32" r="5" fill="#111827"/>
    <circle cx="41" cy="30" r="2" fill="#FFFFFF"/>
    <circle cx="55" cy="30" r="2" fill="#FFFFFF"/>
    <path d="M 45,41 Q 50,46 55,41" fill="#F43F5E" stroke="#111827" stroke-width="1.5" stroke-linecap="round"/>
  </g>

  <!-- FRAME 4 (300 to 400): Splat / Land -->
  <g transform="translate(300, 0)">
    <!-- Floor Shadow -->
    <ellipse cx="50" cy="85" rx="42" ry="7" fill="#1F2937" fill-opacity="0.3"/>
    <!-- Body (Splatted flat) -->
    <path d="M 10,80 C 10,65 25,55 50,55 C 75,55 90,65 90,80 C 90,86 80,84 50,84 C 20,84 10,86 10,80 Z" fill="#059669" stroke="#047857" stroke-width="3"/>
    <!-- Face (Dizzy eyes) -->
    <!-- Left X Eye -->
    <path d="M 38,65 L 44,71 M 44,65 L 38,71" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
    <!-- Right X Eye -->
    <path d="M 56,65 L 62,71 M 62,65 L 56,71" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="28" cy="74" rx="4" ry="2" fill="#F472B6"/>
    <ellipse cx="72" cy="74" rx="4" ry="2" fill="#F472B6"/>
    <path d="M 47,76 Q 50,73 53,76" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round"/>
  </g>
</svg>
`;

const slimeSlices: SpriteSlice[] = [
  { id: 'slime_0', name: 'Slime Diam', x: 0, y: 0, width: 100, height: 100 },
  { id: 'slime_1', name: 'Slime Jongkok', x: 100, y: 0, width: 100, height: 100 },
  { id: 'slime_2', name: 'Slime Melayang', x: 200, y: 0, width: 100, height: 100 },
  { id: 'slime_3', name: 'Slime Mendarat', x: 300, y: 0, width: 100, height: 100 },
];

const slimeAnimations: SpritesheetAnimation[] = [
  {
    id: 'idle',
    name: 'Santai Saja (Idle)',
    frames: ['slime_0', 'slime_0', 'slime_1', 'slime_0'],
    fps: 4,
    loop: true
  },
  {
    id: 'jump',
    name: 'Lompat Tinggi (Jump)',
    frames: ['slime_1', 'slime_2', 'slime_2', 'slime_3', 'slime_0'],
    fps: 6,
    loop: true
  }
];

// =========================================================================
// PRESET 2: Cyber Knight (400x100, 1 row of 4 cells of 100x100px)
// =========================================================================
const knightSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <!-- FRAME 1 (0 to 100): Ready / Guard -->
  <g transform="translate(0, 0)">
    <ellipse cx="50" cy="85" rx="25" ry="5" fill="#1F2937" fill-opacity="0.3"/>
    <!-- Armor Plate legs -->
    <rect x="38" y="65" width="8" height="15" rx="2" fill="#4B5563" stroke="#1F2937" stroke-width="1.5"/>
    <rect x="54" y="65" width="8" height="15" rx="2" fill="#4B5563" stroke="#1F2937" stroke-width="1.5"/>
    <!-- Torso -->
    <rect x="33" y="40" width="34" height="30" rx="4" fill="#374151" stroke="#111827" stroke-width="2"/>
    <path d="M 40,40 L 40,70 M 60,40 L 60,70" stroke="#4F46E5" stroke-width="1.5"/>
    <!-- Head / Helmet -->
    <rect x="38" y="15" width="24" height="25" rx="6" fill="#1F2937" stroke="#111827" stroke-width="2"/>
    <!-- Visor -->
    <rect x="42" y="22" width="16" height="6" rx="1" fill="#6366F1"/>
    <!-- Glowing Visor Dot -->
    <circle cx="50" cy="25" r="1.5" fill="#A5B4FC"/>
    <!-- Sword (Resting Upward) -->
    <path d="M 70,60 L 70,25 L 72,21 L 74,25 L 74,60 Z" fill="#E2E8F0" stroke="#1E293B" stroke-width="1.5"/>
    <rect x="68" y="60" width="8" height="3" fill="#F59E0B"/>
    <rect x="71" y="63" width="2" height="7" fill="#64748B"/>
  </g>

  <!-- FRAME 2 (100 to 200): Prepare Attack / Wind-up -->
  <g transform="translate(100, 0)">
    <ellipse cx="50" cy="85" rx="25" ry="5" fill="#1F2937" fill-opacity="0.3"/>
    <!-- Legs squatted slightly -->
    <rect x="36" y="68" width="8" height="12" rx="2" fill="#4B5563" stroke="#1F2937" stroke-width="1.5"/>
    <rect x="52" y="68" width="8" height="12" rx="2" fill="#4B5563" stroke="#1F2937" stroke-width="1.5"/>
    <!-- Torso (Tilted) -->
    <g transform="rotate(-5, 50, 55)">
      <rect x="33" y="40" width="34" height="30" rx="4" fill="#374151" stroke="#111827" stroke-width="2"/>
      <!-- Helmet -->
      <rect x="38" y="15" width="24" height="25" rx="6" fill="#1F2937" stroke="#111827" stroke-width="2"/>
      <rect x="42" y="22" width="16" height="6" rx="1" fill="#4F46E5"/>
      <!-- Sword (Drawn back and ready) -->
      <path d="M 20,40 L -10,15 L -13,12 L -9,16 L 16,42 Z" fill="#93C5FD" stroke="#1E293B" stroke-width="1.5" transform="rotate(-30, 20, 40)"/>
    </g>
  </g>

  <!-- FRAME 3 (200 to 300): Flash Slash / Sword Sweep (Wind trail!) -->
  <g transform="translate(200, 0)">
    <ellipse cx="50" cy="85" rx="28" ry="5" fill="#1F2937" fill-opacity="0.3"/>
    <!-- Sword Swing Energy Trail (Cyan glow) -->
    <path d="M 30,15 Q 85,15 85,55 Q 85,75 70,80 Q 80,68 80,50 Q 75,30 30,28 Z" fill="#22D3EE" fill-opacity="0.3" stroke="#06B6D4" stroke-width="1.5"/>
    <path d="M 40,25 Q 75,25 75,50" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
    
    <!-- Legs (lunging forward) -->
    <rect x="28" y="66" width="9" height="14" rx="2" fill="#4B5563" stroke="#1F2937" stroke-width="1.5" transform="rotate(15, 32, 66)"/>
    <rect x="52" y="65" width="9" height="15" rx="2" fill="#4B5563" stroke="#1F2937" stroke-width="1.5" transform="rotate(-25, 56, 65)"/>
    <!-- Torso (Lunging forward) -->
    <g transform="translate(10, 2) rotate(10, 50, 55)">
      <rect x="33" y="40" width="34" height="30" rx="4" fill="#1F2937" stroke="#111827" stroke-width="2"/>
      <rect x="38" y="15" width="24" height="25" rx="6" fill="#111827" stroke="#111827" stroke-width="2"/>
      <rect x="42" y="22" width="16" height="6" rx="1" fill="#06B6D4"/>
      <!-- Sword extended forward -->
      <path d="M 68,52 L 98,52 L 102,50 L 98,48 L 68,48 Z" fill="#E2E8F0" stroke="#0891B2" stroke-width="1.5"/>
    </g>
  </g>

  <!-- FRAME 4 (300 to 400): Recover / Sheathe -->
  <g transform="translate(300, 0)">
    <ellipse cx="50" cy="85" rx="25" ry="5" fill="#1F2937" fill-opacity="0.3"/>
    <!-- Legs standing -->
    <rect x="38" y="65" width="8" height="15" rx="2" fill="#4B5563" stroke="#1F2937" stroke-width="1.5"/>
    <rect x="54" y="65" width="8" height="15" rx="2" fill="#4B5563" stroke="#1F2937" stroke-width="1.5"/>
    <!-- Torso -->
    <rect x="33" y="40" width="34" height="30" rx="4" fill="#374151" stroke="#111827" stroke-width="2"/>
    <!-- Helmet facing slightly downward -->
    <rect x="38" y="17" width="24" height="25" rx="6" fill="#1F2937" stroke="#111827" stroke-width="2"/>
    <rect x="42" y="25" width="16" height="4" rx="1" fill="#818CF8"/>
    <!-- Sword pointing down -->
    <path d="M 28,50 L 28,75 L 29,78 L 30,75 L 30,50 Z" fill="#64748B" stroke="#1E293B" stroke-width="1"/>
  </g>
</svg>
`;

const knightSlices: SpriteSlice[] = [
  { id: 'knight_0', name: 'Knight Siap', x: 0, y: 0, width: 100, height: 100 },
  { id: 'knight_1', name: 'Knight Kuda-Kuda', x: 100, y: 0, width: 100, height: 100 },
  { id: 'knight_2', name: 'Knight Tebas', x: 200, y: 0, width: 100, height: 100 },
  { id: 'knight_3', name: 'Knight Istirahat', x: 300, y: 0, width: 100, height: 100 },
];

const knightAnimations: SpritesheetAnimation[] = [
  {
    id: 'idle',
    name: 'Waspada (Ready)',
    frames: ['knight_0', 'knight_0', 'knight_3'],
    fps: 3,
    loop: true
  },
  {
    id: 'slash',
    name: 'Tebasan Kilat (Slash)',
    frames: ['knight_1', 'knight_2', 'knight_2', 'knight_3', 'knight_0'],
    fps: 8,
    loop: true
  }
];

// =========================================================================
// PRESET 3: Cosmic Magic Fireball (400x100, 1 row of 4 cells of 100x100px)
// =========================================================================
const fireballSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100" width="400" height="100">
  <defs>
    <radialGradient id="fire1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF9C4"/>
      <stop offset="40%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#EF4444" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="fire2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="30%" stop-color="#EC4899"/>
      <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- FRAME 1 (0 to 100): Spark / Ignition -->
  <g transform="translate(0, 0)">
    <circle cx="50" cy="50" r="30" fill="url(#fire1)"/>
    <path d="M 50,30 Q 55,45 50,55 Q 45,45 50,30 Z" fill="#FBBF24"/>
    <circle cx="50" cy="50" r="8" fill="#FFF"/>
    <!-- Small sparks -->
    <circle cx="35" cy="40" r="2.5" fill="#EF4444"/>
    <circle cx="62" cy="62" r="1.5" fill="#F59E0B"/>
  </g>

  <!-- FRAME 2 (100 to 200): Flamboyant Flame Flare -->
  <g transform="translate(100, 0)">
    <circle cx="50" cy="50" r="40" fill="url(#fire1)"/>
    <!-- Dynamic flame shapes -->
    <path d="M 40,70 Q 30,40 50,20 Q 70,40 60,70 Q 50,60 40,70 Z" fill="#F59E0B"/>
    <path d="M 45,65 Q 40,45 50,30 Q 60,45 55,65 Q 50,55 45,65 Z" fill="#EF4444"/>
    <path d="M 48,60 Q 47,50 50,40 Q 53,50 52,60 Q 50,55 48,60 Z" fill="#FFF9C4"/>
  </g>

  <!-- FRAME 3 (200 to 300): Supernova Flame Blast -->
  <g transform="translate(200, 0)">
    <circle cx="50" cy="50" r="45" fill="url(#fire2)"/>
    <!-- Flame tongues swirling -->
    <path d="M 30,65 Q 25,30 50,10 Q 75,30 70,65 Q 50,50 30,65 Z" fill="#8B5CF6"/>
    <path d="M 38,60 Q 35,35 50,20 Q 65,35 62,60 Q 50,48 38,60 Z" fill="#D946EF"/>
    <circle cx="50" cy="45" r="12" fill="#FFF"/>
    <!-- Particle stars -->
    <polygon points="50,25 52,29 56,30 52,31 50,35 48,31 44,30 48,29" fill="#FFF"/>
    <polygon points="25,45 27,47 30,48 27,49 25,52 23,49 20,48 23,47" fill="#A5B4FC"/>
    <polygon points="75,42 77,44 80,45 77,46 75,49 73,46 70,45 73,44" fill="#A5B4FC"/>
  </g>

  <!-- FRAME 4 (300 to 400): Sparkles and Embers / Dissolve -->
  <g transform="translate(300, 0)">
    <!-- Dying embers floating around center -->
    <circle cx="50" cy="50" r="20" fill="url(#fire2)" opacity="0.4"/>
    <circle cx="35" cy="30" r="3" fill="#8B5CF6" opacity="0.8"/>
    <circle cx="65" cy="40" r="2.5" fill="#D946EF" opacity="0.8"/>
    <circle cx="48" cy="65" r="3.5" fill="#A5B4FC" opacity="0.9"/>
    <circle cx="55" cy="22" r="2" fill="#FFF"/>
    <circle cx="28" cy="58" r="1.5" fill="#8B5CF6"/>
    <circle cx="70" cy="68" r="2" fill="#D946EF"/>
  </g>
</svg>
`;

const fireballSlices: SpriteSlice[] = [
  { id: 'fire_0', name: 'Lentera Api', x: 0, y: 0, width: 100, height: 100 },
  { id: 'fire_1', name: 'Jilatan Api', x: 100, y: 0, width: 100, height: 100 },
  { id: 'fire_2', name: 'Ledakan Kosmis', x: 200, y: 0, width: 100, height: 100 },
  { id: 'fire_3', name: 'Sisa Percikan', x: 300, y: 0, width: 100, height: 100 },
];

const fireballAnimations: SpritesheetAnimation[] = [
  {
    id: 'loop',
    name: 'Siklus Membara (Burn)',
    frames: ['fire_0', 'fire_1', 'fire_2', 'fire_3'],
    fps: 6,
    loop: true
  },
  {
    id: 'burst',
    name: 'Letupan Ledakan (Blast)',
    frames: ['fire_0', 'fire_1', 'fire_2', 'fire_2', 'fire_3'],
    fps: 10,
    loop: true
  }
];

export const PRESETS: SpritesheetPreset[] = [
  {
    id: 'slime',
    name: 'Lumpur Lincah (Slime Jumper)',
    imageUrl: svgToDataUrl(slimeSvg),
    width: 400,
    height: 100,
    defaultCols: 4,
    defaultRows: 1,
    defaultSlices: slimeSlices,
    defaultAnimations: slimeAnimations
  },
  {
    id: 'knight',
    name: 'Ksatria Siber (Cyber Knight)',
    imageUrl: svgToDataUrl(knightSvg),
    width: 400,
    height: 100,
    defaultCols: 4,
    defaultRows: 1,
    defaultSlices: knightSlices,
    defaultAnimations: knightAnimations
  },
  {
    id: 'fireball',
    name: 'Api Kosmis (Magic Fireball)',
    imageUrl: svgToDataUrl(fireballSvg),
    width: 400,
    height: 100,
    defaultCols: 4,
    defaultRows: 1,
    defaultSlices: fireballSlices,
    defaultAnimations: fireballAnimations
  }
];
