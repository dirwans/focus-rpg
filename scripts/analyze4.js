import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcPath = path.join(rootDir, 'public/ref/Trinity-Mine/Trinity-mine-guards-src.png');

const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const bg = { r: 163, g: 163, b: 163 };

function isContent(x, y, t = 40) {
  if (x < 0 || x >= width || y < 0 || y >= height) return false;
  const idx = (y * width + x) * channels;
  const dr = data[idx] - bg.r, dg = data[idx + 1] - bg.g, db = data[idx + 2] - bg.b;
  return Math.sqrt(dr*dr + dg*dg + db*db) > t;
}

// Count content pixels in an x range for a given y
function countAtY(y, x1, x2) {
  let count = 0;
  for (let x = x1; x < x2; x++) {
    if (isContent(x, y)) count++;
  }
  return count;
}

// Character x boundaries (from previous analysis)
// Astra: x=22-180
// Vex: x=185-365
// Soren: x=365-450
// Nyx: x=450-670
// Cade: x=670-810

const chars = [
  { name: 'Astra',  x1: 22, x2: 180 },
  { name: 'Vex',    x1: 185, x2: 365 },
  { name: 'Soren',  x1: 365, x2: 450 },
  { name: 'Nyx',    x1: 450, x2: 670 },
  { name: 'Cade',   x1: 670, x2: 810 },
];

for (const c of chars) {
  console.log(`\n=== ${c.name} (x=${c.x1}-${c.x2}) ===`);

  // Find top and bottom by scanning for significant content
  let top = -1, bottom = -1;
  const threshold = Math.floor((c.x2 - c.x1) * 0.1); // at least 10% of width has content

  for (let y = 0; y < height; y++) {
    const cnt = countAtY(y, c.x1, c.x2);
    if (cnt > threshold && top === -1) top = y;
    if (cnt > threshold) bottom = y;
  }

  // Fine-tune: find exact top (first row with >20% content)
  for (let y = top; y < Math.min(top + 50, height); y++) {
    const cnt = countAtY(y, c.x1, c.x2);
    if (cnt > (c.x2 - c.x1) * 0.15) { top = y; break; }
  }

  // Fine-tune: find exact bottom (last row with >15% content)
  for (let y = bottom; y > Math.max(bottom - 30, 0); y--) {
    const cnt = countAtY(y, c.x1, c.x2);
    if (cnt > (c.x2 - c.x1) * 0.12) { bottom = y; break; }
  }

  console.log(`  Content range: y=${top}-${bottom} (h=${bottom - top + 1})`);

  // Show pixel count at each y (sampling)
  console.log('  y-profile:');
  for (let y = Math.max(0, top - 5); y <= Math.min(height - 1, bottom + 5); y += 10) {
    const cnt = countAtY(y, c.x1, c.x2);
    const pct = (cnt / (c.x2 - c.x1) * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(cnt / 10));
    console.log(`    y=${y.toString().padStart(3)}: ${cnt.toString().padStart(4)} (${pct.padStart(3)}%) ${bar}`);
  }
}
