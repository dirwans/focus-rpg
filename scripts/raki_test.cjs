const sharp = require('sharp');
const fs = require('fs');

const mechaPath = 'c:/projects/focus-rpg/public/assets/arctron_warrior.png';
const bootPath = 'c:/projects/focus-rpg/public/assets/trial-rakit-arctron-war/boot_r.png';
const outputPath = 'c:/projects/focus-rpg/public/assets/trial-rakit-arctron-war/trial_full_combined.png';

async function combine() {
  console.log('Combining mecha right leg with boot...');

  // 1. Get mecha metadata
  const mechaMeta = await sharp(mechaPath).metadata();
  const w = mechaMeta.width; // 515
  const h = mechaMeta.height; // 1316

  // 2. We want to erase the right calf/foot.
  // The right calf/foot bounds in the original mecha are:
  // left: 255, top: 910, width: 245, height: 406.
  // We can create a transparent mask of the same size as the mecha,
  // copy the mecha over, but erase that specific region.
  
  // To do this cleanly in sharp:
  // We extract the top-left, top-right, bottom-left parts or we can use a composite mask.
  // Let's create a transparent cutout by compositing a transparent rectangle over it
  // using 'dest-out' blend mode.
  const cutoutMask = await sharp({
    create: {
      width: 245,
      height: 406,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 } // Solid mask for erasing
    }
  }).png().toBuffer();

  const mechaCutout = await sharp(mechaPath)
    .composite([{
      input: cutoutMask,
      left: 255,
      top: 910,
      blend: 'dest-out'
    }])
    .png()
    .toBuffer();

  // 3. Scale and align the boot_r.
  // The original boot_r is 188x319.
  // Let's see if we need to resize it. If we place it directly at left=250, top=910:
  // We want to overlay it cleanly at the knee joint.
  // Let's test placing the boot at top=910, left=290 (since the calf was left=255, but the boot is 188 wide).
  // Let's try left = 295, top = 910. We will scale the boot slightly if needed,
  // but let's keep original scale first to see how it fits.
  const bootBuffer = await sharp(bootPath)
    .resize(175, 297) // Scale down slightly to fit the mecha's height/width proportion perfectly
    .png()
    .toBuffer();

  await sharp(mechaCutout)
    .composite([{
      input: bootBuffer,
      left: 295,
      top: 915
    }])
    .toFile(outputPath);

  console.log(`Combined mecha saved to: ${outputPath}`);
}

combine().catch(err => {
  console.error('Error combining:', err);
});
