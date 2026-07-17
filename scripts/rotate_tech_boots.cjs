const sharp = require('sharp');
const path = require('path');

const BOOT_DIR = path.join(__dirname, '..', 'public', 'assets', 'arctron', 'def_technician_armor_set_lv1');

async function rotateBootImage(filename, degrees) {
  const inputPath = path.join(BOOT_DIR, filename);
  const outputPath = inputPath; // overwrite in place

  // Read original, rotate, save back
  const buffer = await sharp(inputPath)
    .rotate(degrees, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp(buffer).toFile(outputPath);
  console.log(`Rotated ${filename} by ${degrees}° → saved`);
}

async function main() {
  // boot_l is the left foot (shown on right side of screen) - rotate 5° clockwise
  await rotateBootImage('boots_l.png', 5);
  // boot_r is the right foot (shown on left side of screen) - rotate -5° counter-clockwise  
  await rotateBootImage('boots_r.png', -5);
  console.log('Done!');
}

main().catch(console.error);
