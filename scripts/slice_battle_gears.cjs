const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputImage = 'c:/projects/focus-rpg/public/assets/arctron/arctron_warrior_battle_gen.png';
const outputDir = 'c:/projects/focus-rpg/public/assets/arctron/def_warrior_armor_set_lv1_battle';

// Pastikan folder output ada
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Konfigurasi koordinat potong (1024x1024 input)
const slices = [
  { name: 'helmet', left: 470, top: 40, width: 160, height: 170 },
  { name: 'armor', left: 280, top: 70, width: 420, height: 560 },
  { name: 'weapon', left: 50, top: 350, width: 620, height: 570 },
  { name: 'shield', left: 600, top: 70, width: 380, height: 680 },
  { name: 'gloves_l', left: 600, top: 300, width: 150, height: 160 }, // Shield hand
  { name: 'gloves_r', left: 130, top: 240, width: 170, height: 270 }, // Sword hand
  { name: 'boots_l', left: 100, top: 640, width: 220, height: 350 },
  { name: 'boots_r', left: 610, top: 600, width: 310, height: 380 }
];

async function run() {
  console.log('Slicing battle mecha gears...');
  for (const item of slices) {
    const outputPath = path.join(outputDir, `${item.name}.png`);
    await sharp(inputImage)
      .extract({ left: item.left, top: item.top, width: item.width, height: item.height })
      .toFile(outputPath);
    console.log(`Saved slice: ${item.name}.png`);
  }
  console.log('Slicing completed successfully!');
}

run().catch(err => {
  console.error('Error slicing images:', err);
  process.exit(1);
});
