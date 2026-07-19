const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const dir = 'public/assets/arctron/def_warrior_armor_set_lv1_battle/Idle-battle-lv1arcwar-frames';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png')).sort();

async function findBoundingBox() {
    console.log('Loading frames...', files);
    const images = [];
    for (const f of files) {
        images.push(await Jimp.read(path.join(dir, f)));
    }
    
    let minX = Infinity, minY = Infinity;
    let maxX = 0, maxY = 0;
    
    console.log('Calculating global bounding box ignoring white/black background with tolerance...');
    
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            const a = this.bitmap.data[idx + 3];
            
            // Ignore transparent
            if (a < 10) return;
            
            // Check if it's very close to white
            const isWhite = r > 240 && g > 240 && b > 240;
            // Check if it's very close to black
            const isBlack = r < 15 && g < 15 && b < 15;
            
            // If it's not white and not black, it's the character
            if (!isWhite && !isBlack) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        });
    }
    
    console.log(`Global bounding box: x=${minX}, y=${minY}, maxX=${maxX}, maxY=${maxY}`);
    
    // Add padding
    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(images[0].bitmap.width - 1, maxX + padding);
    maxY = Math.min(images[0].bitmap.height - 1, maxY + padding);
    
    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;
    
    console.log(`Padded bounding box: x=${minX}, y=${minY}, w=${cropWidth}, h=${cropHeight}`);
    
    const spriteWidth = cropWidth * images.length;
    const spriteHeight = cropHeight;
    
    const sprite = new Jimp({ width: spriteWidth, height: spriteHeight, color: 0x00000000 });
    
    console.log('Cropping and making white/black background transparent...');
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        
        // Remove white/black background
        img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            const isWhite = r > 240 && g > 240 && b > 240;
            const isBlack = r < 15 && g < 15 && b < 15;
            
            if (isWhite || isBlack) {
                this.bitmap.data[idx + 3] = 0; // Transparent
            }
        });
        
        img.crop({ x: minX, y: minY, w: cropWidth, h: cropHeight });
        sprite.composite(img, i * cropWidth, 0);
    }
    
    const outputPath = path.join(dir, '..', 'spritesheet_idle_battle_cropped_clean.png');
    await sprite.write(outputPath);
    console.log('Cropped spritesheet created at:', outputPath);
    console.log(`CSS animation info: width: ${cropWidth}px, height: ${cropHeight}px, frames: ${images.length}`);
}

findBoundingBox().catch(console.error);
