const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = 'c:/projects/focus-rpg/public/assets/arctron/def_warrior_armor_set_lv1_battle';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

async function processFile(file) {
  const filePath = path.join(dir, file);
  const image = sharp(filePath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  // Tampung hasil RGBA (4 channel)
  const outBuffer = Buffer.alloc(info.width * info.height * 4);
  
  for (let i = 0; i < info.width * info.height; i++) {
    let r, g, b, a;
    if (info.channels === 3) {
      r = data[i * 3];
      g = data[i * 3 + 1];
      b = data[i * 3 + 2];
      a = 255;
    } else {
      r = data[i * 4];
      g = data[i * 4 + 1];
      b = data[i * 4 + 2];
      a = data[i * 4 + 3];
    }
    
    // Jika piksel mendekati warna putih (RGB > 248), set Alpha (a) dadi 0 (transparent)
    // Gunakan toleransi threshold 248 untuk membersihkan sisa compression artifacts di pinggiran
    if (r > 248 && g > 248 && b > 248) {
      a = 0;
    }
    
    outBuffer[i * 4] = r;
    outBuffer[i * 4 + 1] = g;
    outBuffer[i * 4 + 2] = b;
    outBuffer[i * 4 + 3] = a;
  }
  
  const tmpPath = filePath + '.tmp.png';
  await sharp(outBuffer, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(tmpPath);
  
  // Ganti file asli dengan file hasil pembersihan background
  fs.unlinkSync(filePath);
  fs.renameSync(tmpPath, filePath);
  console.log(`Made transparent: ${file}`);
}

async function run() {
  console.log('Starting background removal for battle mecha gear slices...');
  for (const file of files) {
    await processFile(file);
  }
  console.log('Background removal completed successfully!');
}

run().catch(err => {
  console.error('Error removing background:', err);
  process.exit(1);
});
