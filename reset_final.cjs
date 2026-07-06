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
    d.race = null; // FORCE RACE TO NULL
    d.sector = 1;
    d.highestSector = 1;
    d.streak = 0;
    d.resources = { crd: 0, credits: 0, potions: 0 };
    d.upgrades = { atk: 0, def: 0, hp: 0 };
    d.equipment = { 
        weapon: null, armor: null, shield: null, helmet: null, 
        mantle: null, gloves: null, boots: null, pants: null, 
        amulet1: null, amulet2: null, ring1: null, ring2: null 
    };
    d.inventory = [];
    d.stats = { atk: 0, def: 0, hp: 0, title: '' };
    d.cp = 0;
    
    // Set savedAt to 15 seconds in the future! 
    // This forces the server to reject the next few saves from any open browser window
    // and returns THIS completely wiped state to the browser, forcing the browser to adopt it!
    d.savedAt = Date.now() + 15000; 
    
    fs.writeFileSync(p, JSON.stringify(d));
    console.log('Final wipe applied for ' + f);
}
