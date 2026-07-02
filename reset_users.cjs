const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'focus-rpg', 'data');
const files = fs.readdirSync(dir).filter(f => f.startsWith('save_') && f.endsWith('.json'));
for(const f of files) {
    const p = path.join(dir, f);
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    d.level = 1;
    d.exp = 0;
    fs.writeFileSync(p, JSON.stringify(d));
    console.log('Reset ' + f);
}
