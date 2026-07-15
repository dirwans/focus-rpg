const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const mechaPath = 'c:/projects/focus-rpg/public/assets/arctron_warrior.png';
const bootsPath = 'c:/projects/focus-rpg/public/assets/arctron/defarctronwarriorlv1boots.png';
const outputDir = 'c:/projects/focus-rpg/public/assets/trial-rakit-arctron-war';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function slice() {
  console.log('Slicing mecha and boots...');

  // 1. Slice Mecha Parts
  // Coordinates are tuned to divide cleanly at joints:
  // - Head/Helmet: 0 to 180
  // - Torso/Chest: 180 to 450
  // - Pelvis/Waist: 450 to 600
  // - Thighs (Left and Right pupu): 600 to 920 (knee joint is around 920)
  // - Calf/Foot (Left and Right betis/cakar): 920 to 1316 (bottom)
  const mechaParts = {
    head: { left: 160, top: 0, width: 195, height: 180 },
    chest: { left: 80, top: 170, width: 355, height: 280 },
    pelvis: { left: 120, top: 430, width: 275, height: 190 },
    arm_l: { left: 10, top: 100, width: 140, height: 430 },
    arm_r: { left: 365, top: 100, width: 140, height: 430 },
    
    // Split legs at the knee joint (y = 920)
    thigh_l: { left: 140, top: 580, width: 120, height: 350 },
    thigh_r: { left: 260, top: 580, width: 120, height: 350 },
    
    calf_foot_l: { left: 15, top: 910, width: 245, height: 406 },
    calf_foot_r: { left: 255, top: 910, width: 245, height: 406 }
  };

  for (const [name, rect] of Object.entries(mechaParts)) {
    const outputPath = path.join(outputDir, `${name}.png`);
    await sharp(mechaPath)
      .extract(rect)
      .toFile(outputPath);
    console.log(`Sliced mecha: ${name} -> ${outputPath}`);
  }

  // 2. Slice Boots into Left and Right boot
  // Image size: 375x319
  // Left half: x=0 to 187, Right half: x=187 to 375
  const bootParts = {
    boot_l: { left: 0, top: 0, width: 187, height: 319 },
    boot_r: { left: 187, top: 0, width: 188, height: 319 }
  };

  for (const [name, rect] of Object.entries(bootParts)) {
    const outputPath = path.join(outputDir, `${name}.png`);
    await sharp(bootsPath)
      .extract(rect)
      .toFile(outputPath);
    console.log(`Sliced boot: ${name} -> ${outputPath}`);
  }

  console.log('Slicing completed successfully!');
}

slice().catch(err => {
  console.error('Error slicing:', err);
});
