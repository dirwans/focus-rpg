const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const files = [
  "C:/projects/focus-rpg/public/assets/arctron/def_warrior_armor_set_lv1_battle/Idle-battle-lv1arcwar-frames/ezgif-frame-011.png",
  "C:/projects/focus-rpg/public/assets/arctron/def_warrior_armor_set_lv1_battle/Idle-battle-lv1arcwar-frames/ezgif-frame-001.png",
  "C:/projects/focus-rpg/public/assets/arctron/def_warrior_armor_set_lv1_battle/Idle-battle-lv1arcwar-frames/ezgif-frame-006.png",
  "C:/projects/focus-rpg/public/assets/arctron/def_warrior_armor_set_lv1_battle/Idle-battle-lv1arcwar-frames/ezgif-frame-007.png",
  "C:/projects/focus-rpg/public/assets/arctron/def_warrior_armor_set_lv1_battle/Idle-battle-lv1arcwar-frames/ezgif-frame-009.png",
  "C:/projects/focus-rpg/public/assets/arctron/def_warrior_armor_set_lv1_battle/Idle-battle-lv1arcwar-frames/ezgif-frame-010.png"
];

async function processImages() {
  for (let file of files) {
    if (!fs.existsSync(file)) {
      console.log("File not found:", file);
      continue;
    }
    try {
      const img = await Jimp.read(file);
      
      // Assume top-left pixel is the background color
      const bgColorInt = img.getPixelColor(0, 0);
      const bgR = (bgColorInt >> 24) & 255;
      const bgG = (bgColorInt >> 16) & 255;
      const bgB = (bgColorInt >> 8) & 255;
      const bgA = bgColorInt & 255;
      
      if (bgA === 0) {
          console.log(`Image ${path.basename(file)} is already transparent! Skipping.`);
          // Wait, if it's already transparent, maybe the edges are transparent but the inside has a white box?
          // Let's just do a flood fill anyway on white pixels if any exist, but it's tricky.
      }
      
      const tolerance = 40;
      let removed = 0;

      // We will do a flood fill from 4 corners
      const w = img.bitmap.width;
      const h = img.bitmap.height;
      const visited = new Uint8Array(w * h);
      const stack = [[0,0], [w-1,0], [0,h-1], [w-1,h-1]];
      
      while(stack.length > 0) {
          const [x, y] = stack.pop();
          if (x < 0 || x >= w || y < 0 || y >= h) continue;
          
          const idx = y * w + x;
          if (visited[idx]) continue;
          
          const colorInt = img.getPixelColor(x, y);
          const r = (colorInt >> 24) & 255;
          const g = (colorInt >> 16) & 255;
          const b = (colorInt >> 8) & 255;
          const a = colorInt & 255;
          
          if (a === 0) {
              visited[idx] = 1;
              stack.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
              continue;
          }
          
          const dist = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));
          if (dist <= tolerance) {
              img.setPixelColor(0x00000000, x, y); // transparent
              visited[idx] = 1;
              removed++;
              stack.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
          } else {
              visited[idx] = 1;
          }
      }

      console.log(`Processed ${path.basename(file)}, removed ${removed} pixels.`);
      await img.write(file);
    } catch (e) {
      console.error("Error processing", file, e);
    }
  }
}

processImages();
