import { Character, Skill, WeatherEffect } from './types';

// Helper to create skills
const createSkills = (
  regularName: string,
  regularDesc: string,
  skillName: string,
  skillDesc: string,
  skillEffect: 'damage' | 'heal' | 'shield' | 'buff' | 'debuff',
  skillVal: number,
  skillTarget: 'single_enemy' | 'all_enemies' | 'single_ally' | 'all_allies' | 'self',
  ultName: string,
  ultDesc: string,
  ultEffect: 'damage' | 'heal' | 'shield' | 'buff' | 'debuff',
  ultVal: number,
  ultTarget: 'single_enemy' | 'all_enemies' | 'single_ally' | 'all_allies' | 'self'
): Skill[] => {
  return [
    {
      id: 'reg',
      name: regularName,
      description: regularDesc,
      type: 'regular',
      energyCost: 0,
      energyGain: 20,
      cooldown: 0,
      currentCooldown: 0,
      targetType: 'single_enemy',
      effectType: 'damage',
      effectValue: 1.0,
    },
    {
      id: 'skl',
      name: skillName,
      description: skillDesc,
      type: 'skill',
      energyCost: 0,
      energyGain: 30,
      cooldown: 2,
      currentCooldown: 0,
      targetType: skillTarget,
      effectType: skillEffect,
      effectValue: skillVal,
    },
    {
      id: 'ult',
      name: ultName,
      description: ultDesc,
      type: 'ultimate',
      energyCost: 100,
      energyGain: 0,
      cooldown: 0,
      currentCooldown: 0,
      targetType: ultTarget,
      effectType: ultEffect,
      effectValue: ultVal,
    }
  ];
};

export const getInitialCharacters = (): Character[] => [
  // === ALLIES: ELVES (4 units) ===
  {
    id: 'ally_aurelia',
    name: 'Aurelia Stella',
    race: 'elf',
    side: 'ally',
    role: 'Healer',
    maxHp: 2800,
    hp: 2800,
    maxShield: 500,
    shield: 0,
    maxEnergy: 100,
    energy: 50,
    attack: 420,
    defense: 120,
    speed: 102,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Solar Ray', 'Tembakan energi solar murni ke satu musuh.',
      'Astra Bless', 'Memulihkan HP seluruh sekutu berdasarkan Attack.', 'heal', 1.8, 'all_allies',
      'Nova Ascension', 'Restorasi energi besar-besaran & Shield global untuk tim.', 'shield', 1500, 'all_allies'
    ),
    avatarSeed: 1,
    row: 2,
    col: 0,
    animationState: 'idle'
  },
  {
    id: 'ally_kaelen',
    name: 'Kaelen Cyberbow',
    race: 'elf',
    side: 'ally',
    role: 'DPS',
    maxHp: 2400,
    hp: 2400,
    maxShield: 300,
    shield: 0,
    maxEnergy: 100,
    energy: 40,
    attack: 680,
    defense: 90,
    speed: 115,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Plasma Shot', 'Menembakkan anak panah laser ke satu musuh.',
      'Charged Singularity', 'Tembakan berdaya tinggi menembus armor musuh.', 'damage', 2.2, 'single_enemy',
      'Hyperion Rain', 'Hujan panah plasma otomatis membombardir seluruh musuh.', 'damage', 1.8, 'all_enemies'
    ),
    avatarSeed: 2,
    row: 2,
    col: 1,
    animationState: 'idle'
  },
  {
    id: 'ally_lirael',
    name: 'Lirael Chrono',
    race: 'elf',
    side: 'ally',
    role: 'Support',
    maxHp: 2600,
    hp: 2600,
    maxShield: 400,
    shield: 0,
    maxEnergy: 100,
    energy: 30,
    attack: 480,
    defense: 105,
    speed: 110,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Time Warp', 'Serangan distorsi ruang waktu ke musuh.',
      'Accelerate Matrix', 'Meningkatkan Attack & Speed satu sekutu selama 2 giliran.', 'buff', 40, 'single_ally',
      'Temporal Overdrive', 'Memberikan buff Attack global & percepat giliran tim.', 'buff', 60, 'all_allies'
    ),
    avatarSeed: 3,
    row: 2,
    col: 2,
    animationState: 'idle'
  },
  {
    id: 'ally_sylas',
    name: 'Sylas Neonblade',
    race: 'elf',
    side: 'ally',
    role: 'DPS',
    maxHp: 2500,
    hp: 2500,
    maxShield: 300,
    shield: 0,
    maxEnergy: 100,
    energy: 20,
    attack: 720,
    defense: 95,
    speed: 112,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Cyber Slash', 'Sabetan pedang neon cepat ke satu musuh.',
      'Spectral Strike', 'Melompat ke belakang garis pertahanan musuh untuk sabetan kritis.', 'damage', 2.5, 'single_enemy',
      'Infinite Blade Dance', 'Tebasan kecepatan cahaya ke target tunggal dengan damage masif.', 'damage', 4.5, 'single_enemy'
    ),
    avatarSeed: 4,
    row: 2,
    col: 3,
    animationState: 'idle'
  },
  
  // === ALLIES: HUMANS (4 units) ===
  {
    id: 'ally_marcus',
    name: 'Cmdr. Marcus',
    race: 'human',
    side: 'ally',
    role: 'Tank',
    maxHp: 4200,
    hp: 4200,
    maxShield: 1200,
    shield: 600,
    maxEnergy: 100,
    energy: 40,
    attack: 450,
    defense: 180,
    speed: 95,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Heavy Pistol', 'Menembakkan peluru gravitasi ke musuh.',
      'Iron Dome', 'Memberikan Shield kuat ke diri sendiri dan memprovokasi musuh.', 'shield', 1800, 'self',
      'Absolute Bastion', 'Membuka barier laser raksasa, kurangi damage tim & beri Shield global.', 'shield', 1500, 'all_allies'
    ),
    avatarSeed: 5,
    row: 1,
    col: 0,
    animationState: 'idle'
  },
  {
    id: 'ally_valerie',
    name: 'Dr. Valerie',
    race: 'human',
    side: 'ally',
    role: 'Healer',
    maxHp: 2900,
    hp: 2900,
    maxShield: 400,
    shield: 0,
    maxEnergy: 100,
    energy: 45,
    attack: 410,
    defense: 110,
    speed: 104,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Syringe Shot', 'Tembakan zat korosif mini ke satu musuh.',
      'Nanite Burst', 'Semburan nano-bot penyembuh ke satu sekutu berdarah rendah.', 'heal', 2.8, 'single_ally',
      'Rejuvenation Field', 'Menanam generator regenerasi yang menyembuhkan seluruh tim bertahap.', 'heal', 1.5, 'all_allies'
    ),
    avatarSeed: 6,
    row: 1,
    col: 1,
    animationState: 'idle'
  },
  {
    id: 'ally_jax',
    name: 'Jax Railgunner',
    race: 'human',
    side: 'ally',
    role: 'DPS',
    maxHp: 3200,
    hp: 3200,
    maxShield: 400,
    shield: 0,
    maxEnergy: 100,
    energy: 10,
    attack: 800,
    defense: 130,
    speed: 88,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Energy Shell', 'Menembakkan meriam bahu standar ke satu musuh.',
      'Annihilation Beam', 'Laser railgun terfokus yang membakar musuh (Damage Over Time).', 'damage', 3.0, 'single_enemy',
      'Omega Doomsday', 'Tembakan meriam kiamat penghancur seluruh barisan pertahanan musuh.', 'damage', 2.5, 'all_enemies'
    ),
    avatarSeed: 7,
    row: 1,
    col: 2,
    animationState: 'idle'
  },
  {
    id: 'ally_serena',
    name: 'Serena Void',
    race: 'human',
    side: 'ally',
    role: 'Control',
    maxHp: 2700,
    hp: 2700,
    maxShield: 300,
    shield: 0,
    maxEnergy: 100,
    energy: 50,
    attack: 580,
    defense: 100,
    speed: 118,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Void Dagger', 'Melemparkan pisau energi hampa ke musuh.',
      'Neural Disruption', 'Serangan pulsa listrik mikro yang berpotensi membekukan/stun musuh.', 'debuff', 1.5, 'single_enemy',
      'Singularity Vortex', 'Lubang hitam mini yang mengumpulkan musuh & membuat mereka linglung.', 'debuff', 2.0, 'all_enemies'
    ),
    avatarSeed: 8,
    row: 1,
    col: 3,
    animationState: 'idle'
  },

  // === ENEMIES: ROBOTS (8 units) ===
  {
    id: 'enemy_titan',
    name: 'MK-1 Titan Heavy',
    race: 'robot',
    side: 'enemy',
    role: 'Tank',
    maxHp: 4500,
    hp: 4500,
    maxShield: 1500,
    shield: 1000,
    maxEnergy: 100,
    energy: 30,
    attack: 400,
    defense: 200,
    speed: 85,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Heavy Slam', 'Hantaman tangan robotik keras ke garis depan.',
      'Kinetic Aegis', 'Mengaktifkan perisai magnetik penyerap energi damage.', 'shield', 2000, 'self',
      'Earthshaking Pulverize', 'Hantaman seismik masif yang menggoncang seluruh bumi sekutu.', 'damage', 1.8, 'all_enemies'
    ),
    avatarSeed: 101,
    row: 1,
    col: 0,
    animationState: 'idle'
  },
  {
    id: 'enemy_quantum',
    name: 'Null-Quantum Orb',
    race: 'robot',
    side: 'enemy',
    role: 'Control',
    maxHp: 2500,
    hp: 2500,
    maxShield: 500,
    shield: 0,
    maxEnergy: 100,
    energy: 40,
    attack: 520,
    defense: 110,
    speed: 106,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Pulse Blast', 'Tembakan bola energi sub-atomik.',
      'Gravity Collapse', 'Menciptakan tarikan gravitasi tinggi yang melemahkan Attack musuh.', 'debuff', 1.2, 'single_enemy',
      'Absolute Zero Void', 'Zona anti-materi raksasa yang memicu pembekuan sistem musuh.', 'damage', 1.9, 'all_enemies'
    ),
    avatarSeed: 102,
    row: 2,
    col: 0,
    animationState: 'idle'
  },
  {
    id: 'enemy_scythe',
    name: 'Cyber-Scythe v3',
    race: 'robot',
    side: 'enemy',
    role: 'DPS',
    maxHp: 2700,
    hp: 2700,
    maxShield: 300,
    shield: 0,
    maxEnergy: 100,
    energy: 50,
    attack: 740,
    defense: 90,
    speed: 114,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Laser Reap', 'Tebasan sabit laser inframerah.',
      'Serrated Pierce', 'Tusukan rantai bor yang menembus pertahanan.', 'damage', 2.3, 'single_enemy',
      'Death Protocol X', 'Memasuki mode overdrive penuh dan memutilasi target tunggal.', 'damage', 4.2, 'single_enemy'
    ),
    avatarSeed: 103,
    row: 1,
    col: 1,
    animationState: 'idle'
  },
  {
    id: 'enemy_sniper',
    name: 'Mecha-Sniper X',
    race: 'robot',
    side: 'enemy',
    role: 'DPS',
    maxHp: 2300,
    hp: 2300,
    maxShield: 200,
    shield: 0,
    maxEnergy: 100,
    energy: 25,
    attack: 780,
    defense: 80,
    speed: 108,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Charged Bullet', 'Tembakan laras panjang presisi tinggi.',
      'Lock-On Decimate', 'Sistem pengunci target otomatis, meluncurkan rudal pintar.', 'damage', 2.6, 'single_enemy',
      'Giga Rail Cannon', 'Tembakan laser horizontal membakar target dari ujung ke ujung.', 'damage', 3.8, 'single_enemy'
    ),
    avatarSeed: 104,
    row: 2,
    col: 1,
    animationState: 'idle'
  },
  {
    id: 'enemy_aegis',
    name: 'Aegis Defender S5',
    race: 'robot',
    side: 'enemy',
    role: 'Tank',
    maxHp: 3800,
    hp: 3800,
    maxShield: 1000,
    shield: 500,
    maxEnergy: 100,
    energy: 35,
    attack: 420,
    defense: 170,
    speed: 92,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Defensive Spike', 'Benturan tameng robotik memantulkan shockwave.',
      'Aegis Safeguard', 'Memberikan perlindungan tameng magnetik ke rekan sebelahnya.', 'shield', 1200, 'all_allies',
      'Fortress Protocol', 'Menyebarkan gelombang pelindung baja untuk seluruh skuad robot.', 'shield', 1300, 'all_allies'
    ),
    avatarSeed: 105,
    row: 1,
    col: 2,
    animationState: 'idle'
  },
  {
    id: 'enemy_nanoswarm',
    name: 'Nanoswarm Nest',
    race: 'robot',
    side: 'enemy',
    role: 'Healer',
    maxHp: 2600,
    hp: 2600,
    maxShield: 300,
    shield: 0,
    maxEnergy: 100,
    energy: 40,
    attack: 430,
    defense: 100,
    speed: 105,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Bio Drain', 'Penyedotan mikro-biologis ke satu musuh.',
      'Nanobot Recovery', 'Penyembuhan besar terfokus untuk unit robot yang rusak parah.', 'heal', 2.6, 'single_ally',
      'System Reboot', 'Overclock pemulihan jaringan global untuk seluruh unit robot.', 'heal', 1.8, 'all_allies'
    ),
    avatarSeed: 106,
    row: 2,
    col: 2,
    animationState: 'idle'
  },
  {
    id: 'enemy_sentinel',
    name: 'R-90 Sentinel Dual',
    race: 'robot',
    side: 'enemy',
    role: 'DPS',
    maxHp: 3000,
    hp: 3000,
    maxShield: 400,
    shield: 0,
    maxEnergy: 100,
    energy: 20,
    attack: 620,
    defense: 110,
    speed: 98,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Dual Blaster', 'Tembakan senapan kembar beruntun.',
      'Overheat Flare', 'Tembakan beruntun intens membakar sasis lawan.', 'damage', 2.1, 'single_enemy',
      'Supernova Barrage', 'Hujan rudal hulu ledak mikro menghanguskan barisan pertahanan.', 'damage', 2.0, 'all_enemies'
    ),
    avatarSeed: 107,
    row: 1,
    col: 3,
    animationState: 'idle'
  },
  {
    id: 'enemy_overlord',
    name: 'Nexus Overlord C9',
    race: 'robot',
    side: 'enemy',
    role: 'DPS',
    maxHp: 5500,
    hp: 5500,
    maxShield: 1500,
    shield: 500,
    maxEnergy: 100,
    energy: 60,
    attack: 850,
    defense: 150,
    speed: 94,
    statusEffects: [],
    isDead: false,
    skills: createSkills(
      'Laser Beam', 'Tembakan meriam dada termal.',
      'Target Devastation', 'Meluncurkan komet orbital pembakar seluruh sektor.', 'damage', 2.3, 'all_enemies',
      'Nexus Judgement', 'Sinar pemusnah massa hampa ruang menargetkan semua lawan secara absolut.', 'damage', 3.5, 'all_enemies'
    ),
    avatarSeed: 108,
    row: 2,
    col: 3,
    animationState: 'idle'
  }
];

export const WEATHER_EFFECTS: WeatherEffect[] = [
  {
    id: 'clear',
    name: 'Sistem Stabil (Clear)',
    description: 'Sistem cuaca taktis beroperasi normal tanpa modifikasi parameter.',
    statModifierText: 'Stat standar',
    effectType: 'clear'
  },
  {
    id: 'emp_storm',
    name: 'EMP Storm',
    description: 'Badai pulsa elektromagnetik. Kacepetan (Speed) unit Robot mudhun, nanging unit Elf lan Manungsa entuk tambahan kacepetan.',
    statModifierText: 'Robot Speed -15%, Elf/Human Speed +10%',
    effectType: 'emp_storm'
  },
  {
    id: 'data_corruption',
    name: 'Data Corruption',
    description: 'Virus ngrusak data sasis. Kabeh unit kelangan sebagian pertahanan (Defense), nanging Attack mundhak amarga cooling-limit dipateni.',
    statModifierText: 'Kabeh Defense -25%, Kabeh Attack +15%',
    effectType: 'data_corruption'
  },
  {
    id: 'solar_flare',
    name: 'Solar Flare',
    description: 'Radiasi plasma dhuwur ngunggahake suhu senjata. Kabeh unit entuk buff Attack nanging maks HP mudhun.',
    statModifierText: 'Kabeh Attack +25%, Kabeh HP -10%',
    effectType: 'solar_flare'
  },
  {
    id: 'nanite_rain',
    name: 'Nanite Rain',
    description: 'Udan nano-bot penyembuh otomatis. Nambah kapasitas HP maksimal lan menehi perisai (Shield) tambahan ing awal perang.',
    statModifierText: 'Maks HP +15%, Initial Shield +250',
    effectType: 'nanite_rain'
  }
];

export const applyWeather = (characters: Character[], weather: WeatherEffect): Character[] => {
  return characters.map((c) => {
    const clone = { ...c, statusEffects: [...c.statusEffects] };
    
    switch (weather.effectType) {
      case 'emp_storm':
        if (clone.race === 'robot') {
          clone.speed = Math.round(clone.speed * 0.85);
        } else {
          clone.speed = Math.round(clone.speed * 1.10);
        }
        break;
      case 'data_corruption':
        clone.defense = Math.round(clone.defense * 0.75);
        clone.attack = Math.round(clone.attack * 1.15);
        break;
      case 'solar_flare':
        clone.attack = Math.round(clone.attack * 1.25);
        clone.maxHp = Math.round(clone.maxHp * 0.90);
        clone.hp = clone.maxHp;
        break;
      case 'nanite_rain':
        clone.maxHp = Math.round(clone.maxHp * 1.15);
        clone.hp = clone.maxHp;
        clone.shield = clone.shield + 250;
        break;
      case 'clear':
      default:
        // No modifications
        break;
    }
    return clone;
  });
};

