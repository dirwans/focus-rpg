const fs = require('fs');

// 1. Update jobs.json - Arctron (acreton) with 3 paths x 4 tiers
const jobsPath = 'src/data/jobs.json';
const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));

jobs.acreton = {
  tier1: [
    { id: 'destroyer', name: 'Destroyer', desc: 'Frontline heavy melee unit.', bonus: { hp: 210, atk: 27, def: 22 }, skills: ['Mangle', 'Shield Battery'], levelReq: 1 },
    { id: 'gunner', name: 'Gunner', desc: 'Heavy weapons ranged specialist.', bonus: { hp: 175, atk: 33, def: 15 }, skills: ['Flash-Bang', 'Heavy Shot'], levelReq: 1 },
    { id: 'engineer', name: 'Engineer', desc: 'Tactical defense structure builder.', bonus: { hp: 180, atk: 25, def: 18 }, skills: ['Set Guard Tower', 'Repair Matrix'], levelReq: 1 }
  ],
  tier2: [
    { id: 'assaulter', name: 'Assaulter', levelReq: 32, desc: 'Close-range devastation specialist.', bonus: { hp: 350, atk: 50, def: 35 }, skills: ['Frenzy', 'Final Fortress'] },
    { id: 'striker', name: 'Striker', levelReq: 32, desc: 'Rocket and launcher siege unit.', bonus: { hp: 280, atk: 60, def: 25 }, skills: ['Siege Mode', 'Compound Siege'] },
    { id: 'scientist', name: 'Scientist', levelReq: 32, desc: 'Nanotech battlefield support unit.', bonus: { hp: 250, atk: 45, def: 28 }, skills: ['Gauge Recovery', 'Instant Repair'] }
  ],
  tier3: [
    { id: 'mercenary', name: 'Mercenary', levelReq: 42, desc: 'Unyielding main defense fortress.', bonus: { hp: 700, atk: 110, def: 80 }, skills: ['Excel Charger', 'Solid Stance'] },
    { id: 'omega_striker', name: 'Omega Striker', levelReq: 42, desc: 'Supreme heavy artillery bombardier.', bonus: { hp: 550, atk: 130, def: 55 }, skills: ['Doom Blast', 'Fierce Attack'] },
    { id: 'battle_leader', name: 'Battle Leader', levelReq: 42, desc: 'Tactical battlefield rhythm commander.', bonus: { hp: 500, atk: 100, def: 65 }, skills: ['Nimble Joint', 'Solid Mode'] }
  ],
  tier4: [
    { id: 'warmonger', name: 'Warmonger', levelReq: 55, desc: 'Supreme warmachine overlord.', bonus: { hp: 1400, atk: 250, def: 180 }, skills: ['Annihilation Strike'] },
    { id: 'siege_lord', name: 'Siege Lord', levelReq: 55, desc: 'Ultimate artillery devastation master.', bonus: { hp: 1100, atk: 290, def: 140 }, skills: ['Orbital Barrage'] },
    { id: 'grand_engineer', name: 'Grand Engineer', levelReq: 55, desc: 'Apex nanotech warfare architect.', bonus: { hp: 1000, atk: 220, def: 160 }, skills: ['Titan Assembly'] }
  ]
};

fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2));

// 2. Update baseStats.json
const baseStatsPath = 'src/data/baseStats.json';
const baseStats = JSON.parse(fs.readFileSync(baseStatsPath, 'utf8'));

baseStats.destroyer = { hp: 210, atk: 27, def: 22 };
baseStats.gunner = { hp: 175, atk: 33, def: 15 };
baseStats.engineer_arctron = { hp: 180, atk: 25, def: 18 };

fs.writeFileSync(baseStatsPath, JSON.stringify(baseStats, null, 2));

console.log('Arctron jobs and baseStats patched successfully!');
