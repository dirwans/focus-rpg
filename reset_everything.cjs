const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'focus-rpg', 'data');
const files = fs.readdirSync(dir).filter(f => f.startsWith('save_') && f.endsWith('.json'));

for(const f of files) {
    const p = path.join(dir, f);
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    d.level = 1;
    d.exp = 0;
    d.job = null;
    d.sector = 1;
    d.highestSector = 1;
    d.streak = 0;
    
    d.resources = { anium: 0, credits: 0, potions: 0 };
    d.upgrades = { atk: 0, def: 0, hp: 0 };
    d.equipment = { 
        weapon: null, armor: null, shield: null, helmet: null, 
        mantle: null, gloves: null, boots: null, pants: null, 
        amulet1: null, amulet2: null, ring1: null, ring2: null 
    };
    d.inventory = [];
    
    d.stats = { atk: 0, def: 0, hp: 0, title: '' };
    d.cp = 0;
    
    if (d.__session) {
        d.__session.state = 'idle';
        d.__session.startedAt = 0;
        d.__session.endsAt = 0;
    }

    // CRUCIAL: Set savedAt far in the future so that the server rejects any incoming syncs
    // from currently open clients, forcing them to download this new clean state!
    d.savedAt = Date.now() + 1000 * 60 * 60 * 24 * 365; 
    
    fs.writeFileSync(p, JSON.stringify(d));
    console.log('Fully reset ' + f);
}
