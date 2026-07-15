const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = 'c:/projects/focus-rpg/public/assets/trial-rakit-arctron-war';
const files = ['user_boot_l.png', 'user_boot_r.png', 'user_thigh.png'];

async function processImages() {
  for (const file of files) {
    const inputPath = path.join(dir, file);
    const outputPath = path.join(dir, 'trans_' + file);
    console.log(`Processing: ${file}...`);

    const image = sharp(inputPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    
    // Create new buffer for transparent image
    const outBuffer = Buffer.alloc(info.width * info.height * 4);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      let isBg = false;
      if (file === 'user_thigh.png') {
        // Grey-chroma key for light grey gradient background
        isBg = r > 225 && g > 225 && b > 225 && Math.abs(r - g) < 10 && Math.abs(g - b) < 10;
      } else {
        // Threshold key for the boots
        const keyR = data[0];
        const keyG = data[1];
        const keyB = data[2];
        const dist = Math.sqrt(Math.pow(r - keyR, 2) + Math.pow(g - keyG, 2) + Math.pow(b - keyB, 2));
        isBg = dist < 22; // Slightly wider threshold to clean borders
      }
      
      outBuffer[i] = r;
      outBuffer[i+1] = g;
      outBuffer[i+2] = b;
      outBuffer[i+3] = isBg ? 0 : 255;
    }

    // Find bounding box of non-transparent pixels
    let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * 4;
        const alpha = outBuffer[idx + 3];
        if (alpha > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    console.log(`${file} bounds: x=[${minX}, ${maxX}] (${cropW}px), y=[${minY}, ${maxY}] (${cropH}px)`);

    // Crop the transparent image using sharp
    await sharp(outBuffer, { raw: { width: info.width, height: info.height, channels: 4 } })
      .extract({ left: minX, top: minY, width: cropW, height: cropH })
      .png()
      .toFile(outputPath);

    console.log(`Saved transparent cropped image to: ${outputPath}`);
  }
}

processImages().catch(err => console.error(err));
