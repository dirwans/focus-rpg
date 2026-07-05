const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
    console.log('Data directory does not exist.');
    process.exit(0);
}

const files = fs.readdirSync(dataDir);
for (const file of files) {
    const filePath = path.join(dataDir, file);
    if (file === 'users.json') {
        fs.writeFileSync(filePath, '[]');
        console.log('Wiped users.json');
    } else if (file === 'sessions.json') {
        fs.writeFileSync(filePath, '{}');
        console.log('Wiped sessions.json');
    } else if (file.startsWith('save_') && file.endsWith('.json')) {
        fs.unlinkSync(filePath);
        console.log(`Deleted ${file}`);
    }
}
console.log('Data wipe complete.');
