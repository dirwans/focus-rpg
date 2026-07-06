import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'public/ref/Trinity-Mine');
const outDir = path.join(rootDir, 'src/assets/enemies');
const refOutDir = path.join(rootDir, 'public/ref/Trinity-Mine');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = [
  { src: '1F-SentryDementor.png',          name: 'sentry_dementor',   label: '1F Sentry' },
  { src: '2F-BorgDementor.png',            name: 'borg_dementor',     label: '2F Borg' },
  { src: '3F-MutationDementor.png',        name: 'mutation_dementor', label: '3F Mutation' },
  { src: '4F-OrcDementor.png',             name: 'orc_dementor',      label: '4F Orc' },
  { src: '5F-GhostDementor.png',           name: 'ghost_dementor',    label: '5F Ghost' },
  { src: 'Trinity-Core-Keeper-Boss-Kaelgorath.png', name: 'kaelgorath', label: 'Boss' },
];

const PAD = 3;
const EDGE_PASSES = 2;
const TOLERANCE = 45; // base tolerance

// ── Adaptive background detection ─────────────────────────────────────────────
// Scan all 4 edges, collect color samples from pure-background pixels,
// pick the most common color cluster as the true background
function detectBackground(data, W, H, CH) {
  const edgeSamples = [];

  function addEdgeSamples(axis, pos) {
    for (let t = 0; t < 60; t++) {
      let x, y;
      if (axis === 'top')    { x = Math.floor(t / 60 * W); y = pos; }
      else if (axis === 'bottom') { x = Math.floor(t / 60 * W); y = H - 1 - pos; }
      else if (axis === 'left')  { x = pos; y = Math.floor(t / 60 * H); }
      else                       { x = W - 1 - pos; y = Math.floor(t / 60 * H); }
      x = Math.min(x, W - 1); y = Math.min(y, H - 1);
      const i = (y * W + x) * CH;
      edgeSamples.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
    }
  }

  // Scan outer 15px ring
  for (let d = 0; d < 15; d++) {
    addEdgeSamples('top', d);
    addEdgeSamples('bottom', d);
    addEdgeSamples('left', d);
    addEdgeSamples('right', d);
  }

  // Find dominant color cluster — group by luminance
  // Sort by brightness and find the densest cluster
  edgeSamples.sort((a, b) => {
    const la = (a.r + a.g + a.b) / 3;
    const lb = (b.r + b.g + b.b) / 3;
    return la - lb;
  });

  // Find the most common small bucket of brightness
  // Group into buckets of ~10 brightness levels
  const buckets = {};
  for (const s of edgeSamples) {
    const bright = Math.round((s.r + s.g + s.b) / 3 / 10);
    buckets[bright] = (buckets[bright] || 0) + 1;
  }
  const dominantBright = parseInt(Object.entries(buckets)
    .sort((a, b) => b[1] - a[1])[0][0]);

  // Average colors in that bucket
  let r = 0, g = 0, b = 0, n = 0;
  for (const s of edgeSamples) {
    const bright = Math.round((s.r + s.g + s.b) / 3 / 10);
    if (bright === dominantBright) { r += s.r; g += s.g; b += s.b; n++; }
  }
  if (n === 0) { r = 128; g = 128; b = 128; n = 1; }
  return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
}

function colorDist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

for (const f of files) {
  const srcPath = path.join(srcDir, f.src);
  console.log(`\n[${f.label}]`);

  const { data: pixels, info } = await sharp(srcPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: W, height: H, channels: CH } = info;

  // Adaptive background detection
  const bg = detectBackground(pixels, W, H, CH);
  console.log(`  BG detected: rgb(${bg.r},${bg.g},${bg.b})`);

  // Build alpha channel
  const alpha = Buffer.alloc(W * H, 0);
  for (let i = 0; i < W * H; i++) {
    const si = i * CH;
    const d = colorDist(pixels[si], pixels[si + 1], pixels[si + 2], bg.r, bg.g, bg.b);
    alpha[i] = d > TOLERANCE ? 255 : 0;
  }

  // Edge smoothing — halo pass
  for (let pass = 0; pass < EDGE_PASSES; pass++) {
    const prev = Buffer.from(alpha);
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        if (prev[i] === 0) {
          const opaque = [prev[i - 1], prev[i + 1], prev[i - W], prev[i + W]]
            .filter(v => v > 200).length;
          if (opaque >= 3) alpha[i] = 90;
          else if (opaque >= 2) alpha[i] = 50;
        }
      }
    }
  }

  // Remove noise
  {
    const prev = Buffer.from(alpha);
    for (let y = 3; y < H - 3; y++) {
      for (let x = 3; x < W - 3; x++) {
        const i = y * W + x;
        if (prev[i] > 0) {
          let opaque = 0;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              if (dx === 0 && dy === 0) continue;
              if (prev[(y + dy) * W + (x + dx)] > 0) opaque++;
            }
          }
          if (opaque < 2) alpha[i] = 0;
          else if (opaque < 4) alpha[i] = Math.min(alpha[i], 120);
        }
      }
    }
  }

  // Find bounding box
  let xMin = W, xMax = -1, yMin = H, yMax = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (alpha[y * W + x] > 0) {
        xMin = Math.min(xMin, x); xMax = Math.max(xMax, x);
        yMin = Math.min(yMin, y); yMax = Math.max(yMax, y);
      }
    }
  }

  if (xMax === -1) { console.log('  WARNING: no content!'); continue; }

  xMin = Math.max(0, xMin - PAD); xMax = Math.min(W - 1, xMax + PAD);
  yMin = Math.max(0, yMin - PAD); yMax = Math.min(H - 1, yMax + PAD);

  const nW = xMax - xMin + 1;
  const nH = yMax - yMin + 1;
  console.log(`  Crop: ${nW}x${nH}`);

  // Build RGBA
  const rgba = Buffer.alloc(nW * nH * 4);
  for (let ly = yMin; ly <= yMax; ly++) {
    for (let lx = xMin; lx <= xMax; lx++) {
      const si = (ly * W + lx) * CH;
      const di = ((ly - yMin) * nW + (lx - xMin)) * 4;
      rgba[di]     = pixels[si];
      rgba[di + 1] = pixels[si + 1];
      rgba[di + 2] = pixels[si + 2];
      rgba[di + 3] = alpha[ly * W + lx];
    }
  }

  await sharp(rgba, { raw: { width: nW, height: nH, channels: 4 } })
    .png()
    .toFile(path.join(refOutDir, `${f.name}.png`));

  await sharp(rgba, { raw: { width: nW, height: nH, channels: 4 } })
    .png()
    .toFile(path.join(outDir, `${f.name}.png`));

  // Report transparency %
  let transparent = 0;
  for (let i = 3; i < nW * nH * 4; i += 4) {
    if (rgba[i] < 10) transparent++;
  }
  console.log(`  Transparency: ${(transparent / (nW * nH) * 100).toFixed(1)}%`);
  console.log(`  -> ${f.name}.png`);
}

console.log('\nDone!');
