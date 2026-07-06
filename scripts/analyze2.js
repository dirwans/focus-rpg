import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcPath = path.join(rootDir, 'public/ref/Trinity-Mine/Trinity-mine-guards-src.png');

const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const bg = { r: 163, g: 163, b: 163 };

// Find content pixels - return true if pixel is not background
function isContent(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return false;
  const idx = (y * width + x) * channels;
  const dr = data[idx] - bg.r, dg = data[idx + 1] - bg.g, db = data[idx + 2] - bg.b;
  return Math.sqrt(dr*dr + dg*dg + db*db) > 40;
}

// Scan the bottom portion (y=400 to end) to find individual character column boundaries
// This is where the 4 bottom-row characters should be
const SCAN_Y_START = 400;
const SCAN_Y_END = 590;

let colDensity = [];
for (let x = 0; x < width; x++) {
  let count = 0;
  for (let y = SCAN_Y_START; y < SCAN_Y_END; y++) {
    if (isContent(x, y)) count++;
  }
  colDensity.push(count);
}

// Find the peaks (character columns) and valleys (gaps)
const maxDensity = Math.max(...colDensity);
const threshold = maxDensity * 0.1;

// Find contiguous content regions
let inContent = false;
let regions = [];
let start = -1;
for (let x = 0; x < width; x++) {
  if (colDensity[x] > threshold && !inContent) { start = x; inContent = true; }
  if (colDensity[x] <= threshold && inContent) { regions.push({ start, end: x - 1 }); inContent = false; }
}
if (inContent) regions.push({ start, end: width - 1 });

console.log(`Column regions (y=${SCAN_Y_START}-${SCAN_Y_END}), threshold=${threshold.toFixed(1)}:`);
regions.forEach((r, i) => console.log(`  Region ${i + 1}: x=${r.start}-${r.end} (w=${r.end - r.start + 1}), density=${colDensity.slice(r.start, r.end + 1).reduce((a, b) => a + b, 0)}`));

// Also scan the top portion for Astra
console.log('\n--- Top area scan (y=20-350) ---');
let topColDensity = [];
for (let x = 0; x < width; x++) {
  let count = 0;
  for (let y = 20; y < 350; y++) {
    if (isContent(x, y)) count++;
  }
  topColDensity.push(count);
}
let topRegions = [];
inContent = false;
start = -1;
for (let x = 0; x < width; x++) {
  if (topColDensity[x] > threshold * 0.5 && !inContent) { start = x; inContent = true; }
  if (topColDensity[x] <= threshold * 0.5 && inContent) { topRegions.push({ start, end: x - 1 }); inContent = false; }
}
if (inContent) topRegions.push({ start, end: width - 1 });
console.log('Top regions (Astra likely):');
topRegions.forEach((r, i) => console.log(`  Region ${i + 1}: x=${r.start}-${r.end} (w=${r.end - r.start + 1})`));

// Scan the WHOLE image by y for bottom row content
console.log('\n--- Find bottom row (where do all 4 characters exist?) ---');
// Scan from y=300 to y=600 in steps of 10
for (let y = 300; y < 600; y += 10) {
  let count = 0;
  for (let x = 0; x < width; x++) {
    if (isContent(x, y)) count++;
  }
  console.log(`y=${y}: ${count} content pixels`);
}
