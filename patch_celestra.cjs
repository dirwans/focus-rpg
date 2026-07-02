const fs = require('fs');

// 1. Update baseStats.json
const baseStatsPath = 'src/data/baseStats.json';
const baseStats = JSON.parse(fs.readFileSync(baseStatsPath, 'utf8'));

baseStats.sentinel = { hp: 195, atk: 29, def: 20 };
baseStats.pathfinder = { hp: 170, atk: 34, def: 14 };
baseStats.oracle = { hp: 160, atk: 23, def: 15 };
baseStats.arcanist = { hp: 165, atk: 32, def: 13 };

// Remove old coralis stats if needed, or leave them. (guardian, mystic_archer, spirit_knight, etc)
fs.writeFileSync(baseStatsPath, JSON.stringify(baseStats, null, 2));


// 2. Update jobs.json
const jobsPath = 'src/data/jobs.json';
const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));

jobs.coralis = {
  tier1: [
    { id: 'sentinel', name: 'Sentinel', desc: 'Arcane Elven Warrior', bonus: { hp: 195, atk: 29, def: 20 }, skills: ['Aura Slash'] },
    { id: 'pathfinder', name: 'Pathfinder', desc: 'Arcane Elven Ranger', bonus: { hp: 170, atk: 34, def: 14 }, skills: ['Wind Arrow'] },
    { id: 'oracle', name: 'Oracle', desc: 'Arcane Elven Summoner', bonus: { hp: 160, atk: 23, def: 15 }, skills: ['Spirit Call'] },
    { id: 'arcanist', name: 'Arcanist', desc: 'Arcane Elven Mage', bonus: { hp: 165, atk: 32, def: 13 }, skills: ['Arcane Blast'] }
  ],
  tier2: [
    { id: 'warden', name: 'Warden', levelReq: 32, desc: 'Advanced Arcane Warrior', bonus: { hp: 300, atk: 50, def: 35 }, skills: ['Nature Guard'] },
    { id: 'windrunner', name: 'Windrunner', levelReq: 32, desc: 'Advanced Arcane Ranger', bonus: { hp: 250, atk: 60, def: 25 }, skills: ['Gale Shot'] },
    { id: 'celestial_oracle', name: 'Celestial Oracle', levelReq: 32, desc: 'Advanced Arcane Summoner', bonus: { hp: 220, atk: 40, def: 28 }, skills: ['Divine Eidolon'] },
    { id: 'rune_caster', name: 'Rune Caster', levelReq: 32, desc: 'Advanced Arcane Mage', bonus: { hp: 230, atk: 55, def: 22 }, skills: ['Rune Explosion'] }
  ],
  tier3: [
    { id: 'knight', name: 'Knight', levelReq: 42, desc: 'Elite Arcane Warrior', bonus: { hp: 600, atk: 110, def: 80 }, skills: ['Sacred Blade'] },
    { id: 'shadow_hunter', name: 'Shadow Hunter', levelReq: 42, desc: 'Elite Arcane Ranger', bonus: { hp: 500, atk: 130, def: 60 }, skills: ['Eclipse Arrow'] },
    { id: 'conjurer', name: 'Conjurer', levelReq: 42, desc: 'Elite Arcane Summoner', bonus: { hp: 450, atk: 90, def: 65 }, skills: ['Summon Behemoth'] },
    { id: 'mystic', name: 'Mystic', levelReq: 42, desc: 'Elite Arcane Mage', bonus: { hp: 470, atk: 120, def: 50 }, skills: ['Mystic Nova'] }
  ],
  tier4: [
    { id: 'blademaster', name: 'Blademaster', levelReq: 55, desc: 'Master Arcane Warrior', bonus: { hp: 1200, atk: 250, def: 180 }, skills: ['Blade Dance'] },
    { id: 'stargazer', name: 'Stargazer', levelReq: 55, desc: 'Master Arcane Ranger', bonus: { hp: 1000, atk: 290, def: 140 }, skills: ['Starfall Arrow'] },
    { id: 'divine_summoner', name: 'Divine Summoner', levelReq: 55, desc: 'Master Arcane Summoner', bonus: { hp: 900, atk: 200, def: 150 }, skills: ['Avatar of Lumina'] },
    { id: 'archmage', name: 'Archmage', levelReq: 55, desc: 'Master Arcane Mage', bonus: { hp: 950, atk: 270, def: 120 }, skills: ['Arcane Cataclysm'] }
  ]
};

fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2));
console.log('Successfully patched jobs and baseStats!');
