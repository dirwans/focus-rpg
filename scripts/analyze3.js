import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcPath = path.join(rootDir, 'public/ref/Trinity-Mine/Trinity-mine-guards-src.png');

const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const bg = { r: 163, g: 163, b: 163 };
const T = 40;

function isContent(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return false;
  const idx = (y * width + x) * channels;
  const dr = data[idx] - bg.r, dg = data[idx + 1] - bg.g, db = data[idx + 2] - bg.b;
  return Math.sqrt(dr*dr + dg*dg + db*db) > T;
}

// For each x position, find the vertical range where content exists
let charCols = Array.from({ length: width }, () => ({ top: height, bottom: 0, count: 0 }));

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (isContent(x, y)) {
      charCols[x].top = Math.min(charCols[x].top, y);
      charCols[x].bottom = Math.max(charCols[x].bottom, y);
      charCols[x].count++;
    }
  }
}

// Look at the y=top profile — where does the top of the sprites start for each x?
// This tells us about character vertical positioning
// Also look at y=bottom profile
console.log('Top edge profile (sample every 10px):');
let currentTop = -1;
for (let x = 0; x < width; x += 10) {
  if (charCols[x].count > 5) {
    if (currentTop === -1 || Math.abs(charCols[x].top - currentTop) > 5) {
      console.log(`  x=${x}: top=${charCols[x].top}, bottom=${charCols[x].bottom}, count=${charCols[x].count}`);
      currentTop = charCols[x].top;
    }
  }
}

// Better: scan each vertical slice and find character regions by looking at column profiles
// Find gaps in x direction at different y levels
console.log('\n\nScanning y=450-560 to find gaps between characters (step 5px):');
const PROFILE_T = 30; // minimum content pixels in a column to be "occupied"

for (let y = 450; y <= 560; y += 5) {
  let row = '';
  for (let x = 0; x < width; x += 5) {
    let cnt = 0;
    for (let dx = 0; dx < 5; dx++) {
      if (isContent(x + dx, y)) cnt++;
    }
    row += cnt > 0 ? '#' : ' ';
  }
  // Compress and show gaps
  let lastHash = 0;
  let gaps = [];
  for (let x = 0; x < row.length; x++) {
    if (row[x] === '#' && lastHash === 0) { /* start */ lastHash = 1; }
    else if (row[x] === ' ' && lastHash === 1) { gaps.push(x * 5); lastHash = 0; }
  }
  if (lastHash === 1) gaps.push(width);
  console.log(`y=${y}: gaps at x=${gaps.join(',')}`);
}

// Show row profile at y=500 (middle of character)
// This ASCII art will show where characters are
console.log('\n\nASCII profile at y=500:');
let profile = '';
for (let x = 0; x < width; x += 3) {
  let cnt = 0;
  for (let dx = 0; dx < 3; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      if (isContent(x + dx, 500 + dy)) cnt++;
    }
  }
  profile += cnt > 3 ? '#' : ' ';
}
console.log(profile);
console.log('0' + ' '.repeat(78) + '80' + ' '.repeat(78) + '160' + ' '.repeat(78) + '240' + ' '.repeat(78) + '320' + ' '.repeat(78) + '400' + ' '.repeat(78) + '480' + ' '.repeat(78) + '560' + ' '.repeat(78) + '640' + ' '.repeat(78) + '720' + ' '.repeat(78) + '800');
