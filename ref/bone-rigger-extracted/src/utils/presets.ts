import { SpritePreset, Bone, Animation } from '../types';

// Encodes raw SVGs into clean, inline Data URLs
function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

// -------------------------------------------------------------
// PRESET 1: Wobbly Slime Pet
// -------------------------------------------------------------
const slimeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <!-- Body background glow -->
  <path d="M 30,150 C 30,80 50,40 100,40 C 150,40 170,80 170,150 C 170,180 150,180 100,180 C 50,180 30,180 30,150 Z" fill="#10B981" fill-opacity="0.85" stroke="#047857" stroke-width="4"/>
  <!-- Cute Eyes -->
  <ellipse cx="75" cy="110" rx="10" ry="12" fill="#1F2937" />
  <ellipse cx="125" cy="110" rx="10" ry="12" fill="#1F2937" />
  <!-- Eye Highlights -->
  <ellipse cx="72" cy="106" rx="4" ry="5" fill="#FFFFFF" />
  <ellipse cx="122" cy="106" rx="4" ry="5" fill="#FFFFFF" />
  <!-- Cheeks -->
  <ellipse cx="60" cy="122" rx="8" ry="4" fill="#F472B6" />
  <ellipse cx="140" cy="122" rx="8" ry="4" fill="#F472B6" />
  <!-- Mouth -->
  <path d="M 90,125 Q 100,135 110,125" fill="none" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/>
</svg>
`;

const slimeBones: Bone[] = [
  {
    id: 'slime_base',
    name: 'Base Root',
    parentId: null,
    restStart: { x: 100, y: 180 },
    restEnd: { x: 100, y: 130 },
    length: 50,
    restAngle: -Math.PI / 2, // -90 deg
    color: '#3B82F6',
  },
  {
    id: 'slime_body',
    name: 'Body Center',
    parentId: 'slime_base',
    restStart: { x: 100, y: 130 },
    restEnd: { x: 100, y: 80 },
    length: 50,
    restAngle: -Math.PI / 2, // -90 deg
    color: '#10B981',
  },
  {
    id: 'slime_head',
    name: 'Crown Top',
    parentId: 'slime_body',
    restStart: { x: 100, y: 80 },
    restEnd: { x: 100, y: 45 },
    length: 35,
    restAngle: -Math.PI / 2, // -90 deg
    color: '#EC4899',
  }
];

const slimeAnimations: Animation[] = [
  {
    id: 'wobble',
    name: 'Cute Jiggle',
    duration: 40,
    keyframes: [
      {
        frame: 0,
        boneTransforms: {
          slime_base: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_body: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_head: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 10,
        boneTransforms: {
          slime_base: { rotation: 0.25, translation: { x: 0, y: 0 } },
          slime_body: { rotation: -0.15, translation: { x: 0, y: 0 } },
          slime_head: { rotation: -0.1, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 20,
        boneTransforms: {
          slime_base: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_body: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_head: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 30,
        boneTransforms: {
          slime_base: { rotation: -0.25, translation: { x: 0, y: 0 } },
          slime_body: { rotation: 0.15, translation: { x: 0, y: 0 } },
          slime_head: { rotation: 0.1, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 40,
        boneTransforms: {
          slime_base: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_body: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_head: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      }
    ]
  },
  {
    id: 'bounce',
    name: 'Bouncy Hop',
    duration: 30,
    keyframes: [
      {
        frame: 0,
        boneTransforms: {
          slime_base: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_body: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_head: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 8,
        boneTransforms: {
          // Squash down
          slime_base: { rotation: 0, translation: { x: 0, y: 15 } },
          slime_body: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_head: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 15,
        boneTransforms: {
          // Leap up
          slime_base: { rotation: 0, translation: { x: 0, y: -25 } },
          slime_body: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_head: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 22,
        boneTransforms: {
          // Overshoot squash on land
          slime_base: { rotation: 0, translation: { x: 0, y: 10 } },
          slime_body: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_head: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 30,
        boneTransforms: {
          slime_base: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_body: { rotation: 0, translation: { x: 0, y: 0 } },
          slime_head: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      }
    ]
  }
];

// -------------------------------------------------------------
// PRESET 2: Waving Autumn Tree
// -------------------------------------------------------------
const treeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
  <!-- Ground Shadow -->
  <ellipse cx="100" cy="230" rx="40" ry="8" fill="#1F2937" fill-opacity="0.15"/>
  <!-- Trunk -->
  <path d="M 85,230 L 115,230 L 106,140 L 94,140 Z" fill="#78350F" stroke="#451A03" stroke-width="4" stroke-linejoin="round"/>
  <!-- Lower branch left -->
  <path d="M 95,160 Q 70,140 55,140" fill="none" stroke="#451A03" stroke-width="5" stroke-linecap="round"/>
  <!-- Lower branch right -->
  <path d="M 105,150 Q 130,130 145,130" fill="none" stroke="#451A03" stroke-width="5" stroke-linecap="round"/>
  <!-- Foliage / Leaves (Autumn theme) -->
  <circle cx="100" cy="90" r="48" fill="#EA580C" stroke="#C2410C" stroke-width="3" />
  <circle cx="60" cy="120" r="32" fill="#D97706" stroke="#B45309" stroke-width="3" />
  <circle cx="140" cy="110" r="32" fill="#F59E0B" stroke="#D97706" stroke-width="3" />
  <circle cx="100" cy="50" r="32" fill="#EF4444" stroke="#B91C1C" stroke-width="3" />
</svg>
`;

const treeBones: Bone[] = [
  {
    id: 'tree_trunk',
    name: 'Tree Trunk',
    parentId: null,
    restStart: { x: 100, y: 230 },
    restEnd: { x: 100, y: 140 },
    length: 90,
    restAngle: -Math.PI / 2,
    color: '#8B5CF6',
  },
  {
    id: 'tree_left',
    name: 'Left Foliage',
    parentId: 'tree_trunk',
    restStart: { x: 100, y: 140 },
    restEnd: { x: 60, y: 120 },
    length: Math.sqrt(40**2 + 20**2),
    restAngle: Math.atan2(-20, -40),
    color: '#D97706',
  },
  {
    id: 'tree_right',
    name: 'Right Foliage',
    parentId: 'tree_trunk',
    restStart: { x: 100, y: 140 },
    restEnd: { x: 140, y: 110 },
    length: Math.sqrt(40**2 + 30**2),
    restAngle: Math.atan2(-30, 40),
    color: '#F59E0B',
  },
  {
    id: 'tree_crown',
    name: 'Crown Top',
    parentId: 'tree_trunk',
    restStart: { x: 100, y: 140 },
    restEnd: { x: 100, y: 50 },
    length: 90,
    restAngle: -Math.PI / 2,
    color: '#EF4444',
  }
];

const treeAnimations: Animation[] = [
  {
    id: 'wind',
    name: 'Autumn Breeze',
    duration: 60,
    keyframes: [
      {
        frame: 0,
        boneTransforms: {
          tree_trunk: { rotation: 0, translation: { x: 0, y: 0 } },
          tree_left: { rotation: 0, translation: { x: 0, y: 0 } },
          tree_right: { rotation: 0, translation: { x: 0, y: 0 } },
          tree_crown: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 15,
        boneTransforms: {
          tree_trunk: { rotation: 0.12, translation: { x: 0, y: 0 } },
          tree_left: { rotation: -0.15, translation: { x: 0, y: 0 } },
          tree_right: { rotation: 0.08, translation: { x: 0, y: 0 } },
          tree_crown: { rotation: 0.15, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 30,
        boneTransforms: {
          tree_trunk: { rotation: -0.05, translation: { x: 0, y: 0 } },
          tree_left: { rotation: 0.05, translation: { x: 0, y: 0 } },
          tree_right: { rotation: -0.05, translation: { x: 0, y: 0 } },
          tree_crown: { rotation: -0.08, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 45,
        boneTransforms: {
          tree_trunk: { rotation: 0.08, translation: { x: 0, y: 0 } },
          tree_left: { rotation: -0.08, translation: { x: 0, y: 0 } },
          tree_right: { rotation: 0.04, translation: { x: 0, y: 0 } },
          tree_crown: { rotation: 0.1, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 60,
        boneTransforms: {
          tree_trunk: { rotation: 0, translation: { x: 0, y: 0 } },
          tree_left: { rotation: 0, translation: { x: 0, y: 0 } },
          tree_right: { rotation: 0, translation: { x: 0, y: 0 } },
          tree_crown: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      }
    ]
  }
];

// -------------------------------------------------------------
// PRESET 3: Flexible Mechanical Arm
// -------------------------------------------------------------
const armSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250" width="200" height="250">
  <!-- Grid lines background behind arm for industrial look -->
  <line x1="20" y1="200" x2="180" y2="200" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="4,4"/>
  <!-- Industrial Base -->
  <path d="M 40,240 L 160,240 L 140,200 L 60,200 Z" fill="#374151" stroke="#1F2937" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="100" cy="200" r="16" fill="#F59E0B" stroke="#D97706" stroke-width="3"/>
  <!-- Link 1 (Lower Arm) -->
  <rect x="88" y="100" width="24" height="100" rx="12" fill="#4B5563" stroke="#1F2937" stroke-width="3"/>
  <circle cx="100" cy="100" r="12" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
  <!-- Link 2 (Upper Arm) -->
  <rect x="90" y="30" width="20" height="70" rx="10" fill="#9CA3AF" stroke="#374151" stroke-width="3"/>
  <circle cx="100" cy="30" r="10" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
  <!-- Gripper Claws -->
  <path d="M 85,30 Q 70,10 82,6 M 115,30 Q 130,10 118,6" stroke="#1F2937" stroke-width="4" stroke-linecap="round" fill="none"/>
</svg>
`;

const armBones: Bone[] = [
  {
    id: 'arm_base',
    name: 'Shoulder Joint',
    parentId: null,
    restStart: { x: 100, y: 200 },
    restEnd: { x: 100, y: 100 },
    length: 100,
    restAngle: -Math.PI / 2,
    color: '#3B82F6',
  },
  {
    id: 'arm_forearm',
    name: 'Elbow Joint',
    parentId: 'arm_base',
    restStart: { x: 100, y: 100 },
    restEnd: { x: 100, y: 30 },
    length: 70,
    restAngle: -Math.PI / 2,
    color: '#F59E0B',
  }
];

const armAnimations: Animation[] = [
  {
    id: 'reach',
    name: 'Reach & Grab',
    duration: 50,
    keyframes: [
      {
        frame: 0,
        boneTransforms: {
          arm_base: { rotation: 0, translation: { x: 0, y: 0 } },
          arm_forearm: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 15,
        boneTransforms: {
          arm_base: { rotation: 0.6, translation: { x: 0, y: 0 } },
          arm_forearm: { rotation: -0.8, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 30,
        boneTransforms: {
          arm_base: { rotation: -0.4, translation: { x: 0, y: 0 } },
          arm_forearm: { rotation: 0.8, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 50,
        boneTransforms: {
          arm_base: { rotation: 0, translation: { x: 0, y: 0 } },
          arm_forearm: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      }
    ]
  },
  {
    id: 'crane',
    name: 'Hydraulic Piston',
    duration: 40,
    keyframes: [
      {
        frame: 0,
        boneTransforms: {
          arm_base: { rotation: 0, translation: { x: 0, y: 0 } },
          arm_forearm: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 10,
        boneTransforms: {
          arm_base: { rotation: -0.3, translation: { x: 0, y: 0 } },
          arm_forearm: { rotation: -0.4, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 20,
        boneTransforms: {
          arm_base: { rotation: -0.6, translation: { x: 0, y: 0 } },
          arm_forearm: { rotation: 0.6, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 30,
        boneTransforms: {
          arm_base: { rotation: 0.4, translation: { x: 0, y: 0 } },
          arm_forearm: { rotation: -0.4, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 40,
        boneTransforms: {
          arm_base: { rotation: 0, translation: { x: 0, y: 0 } },
          arm_forearm: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      }
    ]
  }
];

// -------------------------------------------------------------
// PRESET 4: Puppet Knight
// -------------------------------------------------------------
const knightSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
  <!-- Body/Shield Plate -->
  <path d="M 60,110 C 60,80 140,80 140,110 C 140,170 120,200 100,200 C 80,200 60,170 60,110 Z" fill="#3F83F8" stroke="#1C64F2" stroke-width="5" stroke-linejoin="round"/>
  <!-- Crest Cross -->
  <path d="M 100,105 L 100,165 M 80,125 L 120,125" stroke="#FBBF24" stroke-width="6" stroke-linecap="round"/>
  <!-- Helmet -->
  <circle cx="100" cy="65" r="32" fill="#4B5563" stroke="#1F2937" stroke-width="4"/>
  <path d="M 75,65 L 125,65 M 100,30 L 100,65" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
  <!-- T-Visor -->
  <path d="M 82,56 H 118 V 66 M 100,66 V 82" stroke="#1F2937" stroke-width="5" stroke-linecap="round" fill="none"/>
  <!-- Left Hand / Fist -->
  <circle cx="40" cy="130" r="14" fill="#FBBF24" stroke="#D97706" stroke-width="3" />
  <!-- Right Hand holding Sword -->
  <g transform="translate(160, 130)">
    <circle cx="0" cy="0" r="14" fill="#FBBF24" stroke="#D97706" stroke-width="3" />
    <!-- Golden Hilt -->
    <path d="M -15, -15 L 15, 15 M -5, -5 L -20, 0 M -5, -5 L 0, -20" stroke="#D97706" stroke-width="4" stroke-linecap="round"/>
    <!-- Iron Blade -->
    <path d="M -5, -5 L -35, -35 L -30, -40 L 0, -10 Z" fill="#E5E7EB" stroke="#4B5563" stroke-width="2"/>
  </g>
  <!-- Feet -->
  <ellipse cx="80" cy="210" rx="16" ry="8" fill="#1F2937" />
  <ellipse cx="120" cy="210" rx="16" ry="8" fill="#1F2937" />
</svg>
`;

const knightBones: Bone[] = [
  {
    id: 'knight_torso',
    name: 'Torso/Core',
    parentId: null,
    restStart: { x: 100, y: 190 },
    restEnd: { x: 100, y: 105 },
    length: 85,
    restAngle: -Math.PI / 2,
    color: '#3B82F6',
  },
  {
    id: 'knight_head',
    name: 'Helmet Head',
    parentId: 'knight_torso',
    restStart: { x: 100, y: 105 },
    restEnd: { x: 100, y: 55 },
    length: 50,
    restAngle: -Math.PI / 2,
    color: '#EF4444',
  },
  {
    id: 'knight_left_hand',
    name: 'Shield Fist',
    parentId: 'knight_torso',
    restStart: { x: 100, y: 105 },
    restEnd: { x: 40, y: 130 },
    length: Math.sqrt(60**2 + 25**2),
    restAngle: Math.atan2(25, -60),
    color: '#10B981',
  },
  {
    id: 'knight_right_hand',
    name: 'Sword Hand',
    parentId: 'knight_torso',
    restStart: { x: 100, y: 105 },
    restEnd: { x: 160, y: 130 },
    length: Math.sqrt(60**2 + 25**2),
    restAngle: Math.atan2(25, 60),
    color: '#F59E0B',
  }
];

const knightAnimations: Animation[] = [
  {
    id: 'salute',
    name: 'Heroic Salute',
    duration: 50,
    keyframes: [
      {
        frame: 0,
        boneTransforms: {
          knight_torso: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_head: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_left_hand: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_right_hand: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 12,
        boneTransforms: {
          knight_torso: { rotation: 0.05, translation: { x: 0, y: 0 } },
          knight_head: { rotation: -0.1, translation: { x: 0, y: 0 } },
          knight_left_hand: { rotation: -0.4, translation: { x: 0, y: 0 } },
          knight_right_hand: { rotation: -0.8, translation: { x: 0, y: 0 } }, // Raise sword high
        }
      },
      {
        frame: 24,
        boneTransforms: {
          knight_torso: { rotation: -0.05, translation: { x: 0, y: 0 } },
          knight_head: { rotation: 0.1, translation: { x: 0, y: 0 } },
          knight_left_hand: { rotation: -0.2, translation: { x: 0, y: 0 } },
          knight_right_hand: { rotation: -1.2, translation: { x: 0, y: 0 } }, // Raise sword even higher!
        }
      },
      {
        frame: 36,
        boneTransforms: {
          knight_torso: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_head: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_left_hand: { rotation: -0.1, translation: { x: 0, y: 0 } },
          knight_right_hand: { rotation: -0.6, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 50,
        boneTransforms: {
          knight_torso: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_head: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_left_hand: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_right_hand: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      }
    ]
  },
  {
    id: 'walk',
    name: 'March Loop',
    duration: 30,
    keyframes: [
      {
        frame: 0,
        boneTransforms: {
          knight_torso: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_head: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_left_hand: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_right_hand: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 7,
        boneTransforms: {
          knight_torso: { rotation: 0.05, translation: { x: 0, y: -4 } }, // slight dip/bob
          knight_head: { rotation: -0.05, translation: { x: 0, y: 0 } },
          knight_left_hand: { rotation: 0.3, translation: { x: 0, y: 0 } }, // hand forward
          knight_right_hand: { rotation: -0.3, translation: { x: 0, y: 0 } }, // hand back
        }
      },
      {
        frame: 15,
        boneTransforms: {
          knight_torso: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_head: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_left_hand: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_right_hand: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      },
      {
        frame: 22,
        boneTransforms: {
          knight_torso: { rotation: -0.05, translation: { x: 0, y: -4 } },
          knight_head: { rotation: 0.05, translation: { x: 0, y: 0 } },
          knight_left_hand: { rotation: -0.3, translation: { x: 0, y: 0 } }, // hand back
          knight_right_hand: { rotation: 0.3, translation: { x: 0, y: 0 } }, // hand forward
        }
      },
      {
        frame: 30,
        boneTransforms: {
          knight_torso: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_head: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_left_hand: { rotation: 0, translation: { x: 0, y: 0 } },
          knight_right_hand: { rotation: 0, translation: { x: 0, y: 0 } },
        }
      }
    ]
  }
];

// -------------------------------------------------------------
// PRESET 5: Legendary Full-Body Hero
// -------------------------------------------------------------
const warriorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
  <defs>
    <radialGradient id="shieldGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#06B6D4" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#EF4444"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>

  <circle cx="100" cy="120" r="80" fill="url(#shieldGlow)" />

  <!-- Red Cape -->
  <path d="M 75,90 L 40,220 C 60,230 140,230 160,220 L 125,90 Z" fill="#DC2626" stroke="#991B1B" stroke-width="3"/>

  <!-- Left Leg / Boot -->
  <rect x="72" y="170" width="18" height="50" rx="6" fill="#1F2937" stroke="#111827" stroke-width="3"/>
  <ellipse cx="81" cy="220" rx="12" ry="6" fill="#111827"/>

  <!-- Right Leg / Boot -->
  <rect x="110" y="170" width="18" height="50" rx="6" fill="#1F2937" stroke="#111827" stroke-width="3"/>
  <ellipse cx="119" cy="220" rx="12" ry="6" fill="#111827"/>

  <!-- Torso Plate Armor -->
  <path d="M 65,95 C 65,95 135,95 135,95 C 135,145 125,180 100,180 C 75,180 65,145 65,95 Z" fill="#4B5563" stroke="#1F2937" stroke-width="4" stroke-linejoin="round"/>
  <!-- Chest Emblem (Glowing Energy Core) -->
  <circle cx="100" cy="130" r="14" fill="#06B6D4" stroke="#0891B2" stroke-width="3"/>
  <circle cx="100" cy="130" r="6" fill="#E0F7FA"/>

  <!-- Helmet -->
  <rect x="78" y="35" width="44" height="48" rx="10" fill="#374151" stroke="#111827" stroke-width="4"/>
  <path d="M 85,55 H 115 V 63 H 85 Z" fill="#06B6D4" /> <!-- Visor -->
  <!-- Red Plume -->
  <path d="M 100,35 Q 80,10 60,25 Q 85,25 100,35" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>

  <!-- Left Arm & Shield Fist -->
  <g transform="translate(50, 110)">
    <rect x="-10" y="-10" width="20" height="40" rx="6" fill="#4B5563" stroke="#1F2937" stroke-width="3"/>
    <circle cx="0" cy="30" r="12" fill="#FBBF24" stroke="#D97706" stroke-width="2.5"/>
  </g>

  <!-- Right Arm holding Giant Sword -->
  <g transform="translate(150, 110)">
    <rect x="-10" y="-10" width="20" height="40" rx="6" fill="#4B5563" stroke="#1F2937" stroke-width="3"/>
    <circle cx="0" cy="30" r="12" fill="#FBBF24" stroke="#D97706" stroke-width="2.5"/>
    <!-- Sword Blade (Holding in hand) -->
    <path d="M 0,25 L 35,-10 L 55,0 L 15,35 Z" fill="url(#bladeGrad)" stroke="#111827" stroke-width="2.5"/>
    <!-- Guard -->
    <path d="M -5,15 L 15,35" stroke="#FBBF24" stroke-width="4" stroke-linecap="round"/>
  </g>

</svg>
`;

const warriorBones: Bone[] = [
  {
    id: 'hero_hip',
    name: 'Pelvis Root',
    parentId: null,
    restStart: { x: 100, y: 175 },
    restEnd: { x: 100, y: 140 },
    length: 35,
    restAngle: -Math.PI / 2,
    color: '#3B82F6',
  },
  {
    id: 'hero_torso',
    name: 'Chest Torso',
    parentId: 'hero_hip',
    restStart: { x: 100, y: 140 },
    restEnd: { x: 100, y: 90 },
    length: 50,
    restAngle: -Math.PI / 2,
    color: '#EF4444',
  },
  {
    id: 'hero_head',
    name: 'Helmet Head',
    parentId: 'hero_torso',
    restStart: { x: 100, y: 90 },
    restEnd: { x: 100, y: 40 },
    length: 50,
    restAngle: -Math.PI / 2,
    color: '#EC4899',
  },
  {
    id: 'hero_left_arm',
    name: 'L Shoulder',
    parentId: 'hero_torso',
    restStart: { x: 80, y: 105 },
    restEnd: { x: 50, y: 140 },
    length: 46.1,
    restAngle: 2.28,
    color: '#10B981',
  },
  {
    id: 'hero_right_arm',
    name: 'R Shoulder',
    parentId: 'hero_torso',
    restStart: { x: 120, y: 105 },
    restEnd: { x: 150, y: 140 },
    length: 46.1,
    restAngle: 0.86,
    color: '#F59E0B',
  },
  {
    id: 'hero_left_leg',
    name: 'L Leg Boot',
    parentId: 'hero_hip',
    restStart: { x: 82, y: 175 },
    restEnd: { x: 81, y: 220 },
    length: 45,
    restAngle: Math.PI / 2,
    color: '#8B5CF6',
  },
  {
    id: 'hero_right_leg',
    name: 'R Leg Boot',
    parentId: 'hero_hip',
    restStart: { x: 118, y: 175 },
    restEnd: { x: 119, y: 220 },
    length: 45,
    restAngle: Math.PI / 2,
    color: '#14B8A6',
  }
];

const warriorAnimations: Animation[] = [
  {
    id: 'hero_attack_biasa',
    name: 'Attack Biasa (Normal Attack)',
    duration: 40,
    keyframes: [
      {
        frame: 0,
        boneTransforms: {
          hero_hip: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_torso: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_head: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_left_arm: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_left_leg: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_right_leg: { rotation: 0, translation: { x: 0, y: 0 } }
        }
      },
      {
        frame: 10,
        boneTransforms: {
          hero_torso: { rotation: 0.15, translation: { x: 0, y: 0 } },
          hero_head: { rotation: -0.1, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: -0.5, translation: { x: 0, y: 0 } },
          hero_left_arm: { rotation: 0.3, translation: { x: 0, y: 0 } }
        }
      },
      {
        frame: 20,
        boneTransforms: {
          hero_hip: { rotation: 0, translation: { x: 15, y: 5 } },
          hero_torso: { rotation: -0.2, translation: { x: 0, y: 0 } },
          hero_head: { rotation: 0.1, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: 1.2, translation: { x: 0, y: 0 } },
          hero_left_arm: { rotation: -0.4, translation: { x: 0, y: 0 } }
        }
      },
      {
        frame: 30,
        boneTransforms: {
          hero_hip: { rotation: 0, translation: { x: 5, y: 0 } },
          hero_torso: { rotation: -0.1, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: 0.8, translation: { x: 0, y: 0 } }
        }
      },
      {
        frame: 40,
        boneTransforms: {
          hero_hip: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_torso: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_head: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_left_arm: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_left_leg: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_right_leg: { rotation: 0, translation: { x: 0, y: 0 } }
        }
      }
    ]
  },
  {
    id: 'hero_attack_ulti',
    name: 'Attack Ulti (Ultimate Attack)',
    duration: 60,
    keyframes: [
      {
        frame: 0,
        boneTransforms: {
          hero_hip: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_torso: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_head: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_left_arm: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_left_leg: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_right_leg: { rotation: 0, translation: { x: 0, y: 0 } }
        }
      },
      {
        frame: 10,
        boneTransforms: {
          hero_hip: { rotation: 0, translation: { x: -30, y: 10 } },
          hero_torso: { rotation: 0.3, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: -1.0, translation: { x: 0, y: 0 } },
          hero_left_arm: { rotation: 0.6, translation: { x: 0, y: 0 } }
        }
      },
      {
        frame: 18,
        boneTransforms: {
          hero_hip: { rotation: 0, translation: { x: 40, y: 5 } },
          hero_torso: { rotation: -0.2, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: -0.2, translation: { x: 0, y: 0 } }
        }
      },
      {
        frame: 30,
        boneTransforms: {
          hero_hip: { rotation: 0, translation: { x: 60, y: -70 } },
          hero_left_leg: { rotation: 0.5, translation: { x: 0, y: 0 } },
          hero_right_leg: { rotation: -0.5, translation: { x: 0, y: 0 } },
          hero_torso: { rotation: 0.1, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: -1.8, translation: { x: 0, y: 0 } }
        }
      },
      {
        frame: 45,
        boneTransforms: {
          hero_hip: { rotation: 0, translation: { x: 90, y: 15 } },
          hero_torso: { rotation: -0.4, translation: { x: 0, y: 0 } },
          hero_left_leg: { rotation: -0.6, translation: { x: 0, y: 0 } },
          hero_right_leg: { rotation: 0.6, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: 1.4, translation: { x: 0, y: 0 } },
          hero_left_arm: { rotation: -0.8, translation: { x: 0, y: 0 } }
        }
      },
      {
        frame: 52,
        boneTransforms: {
          hero_hip: { rotation: 0, translation: { x: 80, y: 10 } },
          hero_torso: { rotation: -0.1, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: 0.6, translation: { x: 0, y: 0 } }
        }
      },
      {
        frame: 60,
        boneTransforms: {
          hero_hip: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_torso: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_head: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_left_arm: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_right_arm: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_left_leg: { rotation: 0, translation: { x: 0, y: 0 } },
          hero_right_leg: { rotation: 0, translation: { x: 0, y: 0 } }
        }
      }
    ]
  }
];

export const PRESETS: SpritePreset[] = [
  {
    id: 'hero',
    name: 'Legendary Full-Body Hero',
    imageUrl: svgToDataUrl(warriorSvg),
    defaultBones: warriorBones,
    defaultAnimations: warriorAnimations,
  },
  {
    id: 'slime',
    name: 'Wobbly Slime Pet',
    imageUrl: svgToDataUrl(slimeSvg),
    defaultBones: slimeBones,
    defaultAnimations: slimeAnimations,
  },
  {
    id: 'knight',
    name: 'Chibi Puppet Knight',
    imageUrl: svgToDataUrl(knightSvg),
    defaultBones: knightBones,
    defaultAnimations: knightAnimations,
  },
  {
    id: 'arm',
    name: 'Robot Arm Mechanism',
    imageUrl: svgToDataUrl(armSvg),
    defaultBones: armBones,
    defaultAnimations: armAnimations,
  },
  {
    id: 'tree',
    name: 'Waving Autumn Tree',
    imageUrl: svgToDataUrl(treeSvg),
    defaultBones: treeBones,
    defaultAnimations: treeAnimations,
  }
];
