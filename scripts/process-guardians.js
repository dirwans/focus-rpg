import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcPath = path.join(rootDir, 'public/ref/Trinity-Mine/Trinity-mine-guards-src.png');
const outDir = path.join(rootDir, 'src/assets/trinity_guardians');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// ─── Load source ───────────────────────────────────────────────────────────
const { data, info } = await sharp(srcPath)
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: W, height: H, channels: CH } = info;
console.log(`Source: ${W}x${H}`);

// ─── Sample background color from 4 corners (10x10 px avg) ────────────────
function avgRegion(x0, y0, size = 10) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const px = Math.min(x0 + dx, W - 1);
      const py = Math.min(y0 + dy, H - 1);
      const i = (py * W + px) * CH;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
  }
  return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
}

const bg = avgRegion(5, 5);
console.log(`Background color: rgb(${bg.r},${bg.g},${bg.b})`);

// ─── Color-distance helper ─────────────────────────────────────────────────
function dist(r, g, b) {
  return Math.sqrt((r - bg.r) ** 2 + (g - bg.g) ** 2 + (b - bg.b) ** 2);
}

// ─── Guardian crop boxes (x1, y1, x2, y2) ──────────────────────────────────
// Derived from pixel analysis above:
// - Astra:     x=22-180, y=25-519
// - Vex:       x=185-365, y=22-592
// - Soren:     x=365-450, y=20-595
// - Nyx:       x=450-670, y=32-592
// - Cade:      x=670-810, y=19-583
const TOLERANCE = 55; // color distance threshold for background removal

const guardians = [
  { name: 'astra', x1: 22, y1: 25, x2: 180, y2: 519 },
  { name: 'vex',   x1: 185, y1: 22, x2: 365, y2: 592 },
  { name: 'soren', x1: 365, y1: 20, x2: 450, y2: 595 },
  { name: 'nyx',   x1: 450, y1: 32, x2: 670, y2: 592 },
  { name: 'cade',  x1: 670, y1: 19, x2: 810, y2: 583 },
];

// ─── Process each guardian ──────────────────────────────────────────────────
for (const g of guardians) {
  const cw = g.x2 - g.x1;
  const ch = g.y2 - g.y1;
  console.log(`\nProcessing ${g.name} (${cw}x${ch})...`);

  // Build per-pixel alpha buffer
  // 0 = transparent (bg), 255 = opaque (character)
  const alpha = Buffer.alloc(cw * ch, 0);

  for (let ly = 0; ly < ch; ly++) {
    for (let lx = 0; lx < cw; lx++) {
      const sx = g.x1 + lx;
      const sy = g.y1 + ly;
      const si = (sy * W + sx) * CH;
      const d = dist(data[si], data[si + 1], data[si + 2]);
      alpha[ly * cw + lx] = d > TOLERANCE ? 255 : 0;
    }
  }

  // ── Edge smoothing passes (anti-aliasing fringe) ──────────────────────────
  // Pass 1: semi-transparent edge halo — pixels adjacent to opaque ones
  //         that were wrongly killed by the threshold
  for (let pass = 0; pass < 2; pass++) {
    const prev = Buffer.from(alpha);
    for (let ly = 1; ly < ch - 1; ly++) {
      for (let lx = 1; lx < cw - 1; lx++) {
        const i = ly * cw + lx;
        if (prev[i] === 0) {
          // Count fully-opaque neighbors
          const opaque = [prev[i - 1], prev[i + 1], prev[i - cw], prev[i + cw]]
            .filter(v => v > 200).length;
          if (opaque >= 3) alpha[i] = 80; // faint fringe
          else if (opaque >= 2) alpha[i] = 40; // very faint
        }
      }
    }
  }

  // Pass 2: clean up stray isolated opaque pixels (< 3 neighbors → semi-transparent)
  {
    const prev = Buffer.from(alpha);
    for (let ly = 2; ly < ch - 2; ly++) {
      for (let lx = 2; lx < cw - 2; lx++) {
        const i = ly * cw + lx;
        if (prev[i] > 0) {
          let opaque = 0;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              if (dx === 0 && dy === 0) continue;
              if (prev[(ly + dy) * cw + (lx + dx)] > 0) opaque++;
            }
          }
          if (opaque === 0) alpha[i] = 0; // remove noise pixel
          else if (opaque < 3) alpha[i] = Math.min(alpha[i], 100);
        }
      }
    }
  }

  // ── Crop to tight bounding box (remove empty rows/cols) ───────────────────
  let xMin = cw, xMax = -1, yMin = ch, yMax = -1;
  for (let ly = 0; ly < ch; ly++) {
    for (let lx = 0; lx < cw; lx++) {
      if (alpha[ly * cw + lx] > 0) {
        xMin = Math.min(xMin, lx); xMax = Math.max(xMax, lx);
        yMin = Math.min(yMin, ly); yMax = Math.max(yMax, ly);
      }
    }
  }

  if (xMax === -1) { console.log(`  WARNING: no content found for ${g.name}!`); continue; }

  // Add a 2px padding around the crop
  const PAD = 2;
  xMin = Math.max(0, xMin - PAD); xMax = Math.min(cw - 1, xMax + PAD);
  yMin = Math.max(0, yMin - PAD); yMax = Math.min(ch - 1, yMax + PAD);

  const newW = xMax - xMin + 1;
  const newH = yMax - yMin + 1;
  console.log(`  Cropped to: ${newW}x${newH} (from ${cw}x${ch})`);

  // Extract cropped pixel data + alpha
  const cropR = Buffer.alloc(newW * newH);
  const cropG = Buffer.alloc(newW * newH);
  const cropB = Buffer.alloc(newW * newH);
  const cropA = Buffer.alloc(newW * newH);

  for (let ly = yMin; ly <= yMax; ly++) {
    for (let lx = xMin; lx <= xMax; lx++) {
      const si = ((g.y1 + ly) * W + (g.x1 + lx)) * CH;
      const di = ((ly - yMin) * newW + (lx - xMin));
      cropR[di] = data[si];
      cropG[di] = data[si + 1];
      cropB[di] = data[si + 2];
      cropA[di] = alpha[ly * cw + lx];
    }
  }

  // Composite RGBA from raw channels
  const rgba = Buffer.alloc(newW * newH * 4);
  for (let i = 0; i < newW * newH; i++) {
    rgba[i * 4]     = cropR[i];
    rgba[i * 4 + 1] = cropG[i];
    rgba[i * 4 + 2] = cropB[i];
    rgba[i * 4 + 3] = cropA[i];
  }

  await sharp(rgba, { raw: { width: newW, height: newH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, `${g.name}.png`));

  console.log(`  -> saved ${g.name}.png`);
}

console.log('\nDone! All 5 guardians saved to:', outDir);
