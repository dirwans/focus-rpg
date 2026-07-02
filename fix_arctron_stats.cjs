const fs = require('fs');
const jobsPath = 'src/data/jobs.json';
const jobs = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));

jobs.acreton = {
  tier1: [
    { id: 'destroyer', name: 'Destroyer', desc: 'Frontline heavy melee unit.', bonus: { hp: 210, atk: 27, def: 22 }, skills: ['Mangle', 'Shield Battery'], levelReq: 1 },
    { id: 'gunner', name: 'Gunner', desc: 'Heavy weapons ranged specialist.', bonus: { hp: 175, atk: 33, def: 15 }, skills: ['Flash-Bang', 'Heavy Shot'], levelReq: 1 },
    { id: 'engineer', name: 'Engineer', desc: 'Tactical defense structure builder.', bonus: { hp: 180, atk: 25, def: 18 }, skills: ['Set Guard Tower', 'Repair Matrix'], levelReq: 1 }
  ],
  tier2: [
    { id: 'vanguard', name: 'Vanguard', levelReq: 32, desc: 'Elite frontline assault warrior.', bonus: { hp: 35, atk: 6, def: 5 }, skills: ['Frenzy', 'Final Fortress'] },
    { id: 'marksman', name: 'Marksman', levelReq: 32, desc: 'Precision long-range shooter.', bonus: { hp: 20, atk: 8, def: 3 }, skills: ['Siege Mode', 'Compound Siege'] },
    { id: 'architect', name: 'Architect', levelReq: 32, desc: 'Advanced battlefield structure engineer.', bonus: { hp: 15, atk: 5, def: 4 }, skills: ['Gauge Recovery', 'Instant Repair'] }
  ],
  tier3: [
    { id: 'juggernaut', name: 'Juggernaut', levelReq: 42, desc: 'Unstoppable armored siege warrior.', bonus: { hp: 50, atk: 8, def: 8 }, skills: ['Excel Charger', 'Solid Stance'] },
    { id: 'railgunner', name: 'Railgunner', levelReq: 42, desc: 'Heavy artillery bombardment unit.', bonus: { hp: 25, atk: 10, def: 3 }, skills: ['Doom Blast', 'Fierce Attack'] },
    { id: 'core_engineer', name: 'Core Engineer', levelReq: 42, desc: 'Core systems warfare specialist.', bonus: { hp: 20, atk: 6, def: 5 }, skills: ['Nimble Joint', 'Solid Mode'] }
  ],
  tier4: [
    { id: 'dreadnought', name: 'Dreadnought', levelReq: 55, desc: 'Supreme warmachine overlord.', bonus: { hp: 70, atk: 10, def: 10 }, skills: ['Annihilation Strike'] },
    { id: 'annihilator', name: 'Annihilator', levelReq: 55, desc: 'Ultimate ranged devastation master.', bonus: { hp: 35, atk: 12, def: 4 }, skills: ['Orbital Barrage'] },
    { id: 'cybermancer', name: 'Cybermancer', levelReq: 55, desc: 'Apex nanotech warfare architect.', bonus: { hp: 25, atk: 8, def: 6 }, skills: ['Titan Assembly'] }
  ]
};

fs.writeFileSync(jobsPath, JSON.stringify(jobs, null, 2));
console.log('Arctron jobs fixed with CORRECT stats from reference!');
