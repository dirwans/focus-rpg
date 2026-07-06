import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcPath = path.join(rootDir, 'public/ref/Trinity-Mine/Trinity-mine-guards-src.png');

const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

console.log(`Image: ${width}x${height}`);

// Find rows with significant content (non-background)
// Sample background from corners
function sampleRegion(xStart, yStart, size = 10) {
  let r = 0, g = 0, b = 0, count = 0;
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const px = Math.min(xStart + dx, width - 1);
      const py = Math.min(yStart + dy, height - 1);
      const idx = (py * width + px) * channels;
      r += data[idx]; g += data[idx + 1]; b += data[idx + 2];
      count++;
    }
  }
  return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
}

const bg = sampleRegion(5, 5);
const bgBrightness = (bg.r + bg.g + bg.b) / 3;
console.log('Background color (top-left 10x10):', bg, 'brightness:', bgBrightness);

// Scan rows to find content boundaries
const isContentRow = (y) => {
  let contentPixels = 0;
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * channels;
    const dr = data[idx] - bg.r;
    const dg = data[idx + 1] - bg.g;
    const db = data[idx + 2] - bg.b;
    if (Math.sqrt(dr*dr + dg*dg + db*db) > 30) contentPixels++;
  }
  return contentPixels > width * 0.05; // more than 5% non-background
};

// Find all content rows
let inContent = false;
let rowRanges = [];
let rangeStart = -1;
for (let y = 0; y < height; y++) {
  const hasContent = isContentRow(y);
  if (hasContent && !inContent) { rangeStart = y; inContent = true; }
  if (!hasContent && inContent) { rowRanges.push({ start: rangeStart, end: y - 1 }); inContent = false; }
}
if (inContent) rowRanges.push({ start: rangeStart, end: height - 1 });

console.log('\nContent row ranges:');
rowRanges.forEach((r, i) => console.log(`  Row group ${i + 1}: y=${r.start}-${r.end} (height=${r.end - r.start + 1})`));

// For each row range, find column boundaries
for (const row of rowRanges) {
  let inColContent = false;
  let colRanges = [];
  let colStart = -1;
  for (let x = 0; x < width; x++) {
    let hasContent = false;
    for (let y = row.start; y <= row.end; y++) {
      const idx = (y * width + x) * channels;
      const dr = data[idx] - bg.r;
      const dg = data[idx + 1] - bg.g;
      const db = data[idx + 2] - bg.b;
      if (Math.sqrt(dr*dr + dg*dg + db*db) > 30) { hasContent = true; break; }
    }
    if (hasContent && !inColContent) { colStart = x; inColContent = true; }
    if (!hasContent && inColContent) { colRanges.push({ start: colStart, end: x - 1 }); inColContent = false; }
  }
  if (inColContent) colRanges.push({ start: colStart, end: width - 1 });

  console.log(`\n  Col ranges for y=${row.start}-${row.end}:`);
  colRanges.forEach((c, i) => {
    const charNum = rowRanges.indexOf(row) === 0 ? 'Astra' : `Char${rowRanges.indexOf(row) === 1 ? i + 2 : i + 2}`;
    console.log(`    ${charNum}: x=${c.start}-${c.end} (width=${c.end - c.start + 1})`);
  });
}
