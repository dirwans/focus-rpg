const { Jimp } = require('jimp');
const path = require('path');

async function fixWatermark() {
  const file = "C:/projects/focus-rpg/public/assets/arctron/def_warrior_armor_set_lv1_battle/spritesheet_idle_battle_cropped_clean.png";
  
  try {
    const image = await Jimp.read(file);
    const w = image.bitmap.width;
    const h = image.bitmap.height;
    
    // The user mentioned 6 frames earlier for this spritesheet
    const frames = 6;
    const fw = Math.floor(w / frames);
    
    // Google Imagen / AI watermark is usually around 80x40 in the bottom right corner.
    // Let's wipe the bottom-right 80x40 pixels of EACH frame to be safe.
    for (let i = 0; i < frames; i++) {
      const frameRight = (i + 1) * fw;
      const startX = frameRight - 80;
      const startY = h - 40;
      
      for (let y = startY; y < h; y++) {
        for (let x = startX; x < frameRight; x++) {
          if (x >= 0 && x < w && y >= 0 && y < h) {
            const idx = (w * y + x) * 4;
            // Set Alpha to 0 (Transparent)
            image.bitmap.data[idx + 3] = 0; 
          }
        }
      }
    }
    
    await image.write(file);
    console.log("Watermarks removed successfully from", file);
  } catch (err) {
    console.error("Error:", err);
  }
}

fixWatermark();
