const fs = require('fs');

function buildBoneTree(bones) {
  const map = {};
  const roots = [];
  for (const b of bones) {
    map[b.name] = {
      name: b.name,
      x: b.transform?.x || 0,
      y: b.transform?.y || 0,
      rotation: b.transform?.rotate || 0,
      scaleX: b.transform?.scaleX ?? 1,
      scaleY: b.transform?.scaleY ?? 1,
      children: [],
      animX: 0, animY: 0, animRot: 0,
    };
  }
  for (const b of bones) {
    if (b.parent && map[b.parent]) {
      map[b.parent].children.push(map[b.name]);
    } else if (!b.parent) {
      roots.push(map[b.name]);
    }
  }
  return { map, roots };
}

function getAnimatedValue(frames, totalDuration, currentFrame, defaultVal) {
  if (!frames || frames.length === 0) return defaultVal;
  let elapsed = 0;
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const nextElapsed = elapsed + f.duration;
    if (currentFrame < nextElapsed || i === frames.length - 1) {
      const nextFrame = frames[(i + 1) % frames.length];
      const progress = f.duration > 0 ? (currentFrame - elapsed) / f.duration : 0;
      const t = Math.max(0, Math.min(1, progress));
      const eased = f.tweenEasing !== undefined ? t : 0;
      const fromVal = f.rotate ?? f.x ?? f.y ?? 0;
      const toVal = nextFrame.rotate ?? nextFrame.x ?? nextFrame.y ?? 0;
      return fromVal + (toVal - fromVal) * eased;
    }
    elapsed = nextElapsed;
  }
  return defaultVal;
}

function applyAnimation(boneMap, animData, frame) {
  for (const name in boneMap) {
    boneMap[name].animX = 0;
    boneMap[name].animY = 0;
    boneMap[name].animRot = 0;
  }
  if (!animData || !animData.bone) return;
  const totalDuration = animData.duration || 24;
  const loopFrame = frame % totalDuration;

  for (const boneAnim of animData.bone) {
    const bone = boneMap[boneAnim.name];
    if (!bone) continue;
    if (boneAnim.rotateFrame) {
      bone.animRot = getAnimatedValue(boneAnim.rotateFrame, totalDuration, loopFrame, 0);
    }
    if (boneAnim.translateFrame) {
      let elapsed = 0;
      for (let i = 0; i < boneAnim.translateFrame.length; i++) {
        const f = boneAnim.translateFrame[i];
        const nextElapsed = elapsed + f.duration;
        if (loopFrame < nextElapsed || i === boneAnim.translateFrame.length - 1) {
          const next = boneAnim.translateFrame[(i + 1) % boneAnim.translateFrame.length];
          const progress = f.duration > 0 ? (loopFrame - elapsed) / f.duration : 0;
          const t = Math.max(0, Math.min(1, progress));
          bone.animX = (f.x || 0) + ((next.x || 0) - (f.x || 0)) * t;
          bone.animY = (f.y || 0) + ((next.y || 0) - (f.y || 0)) * t;
          break;
        }
        elapsed = nextElapsed;
      }
    }
  }
}

const data = JSON.parse(fs.readFileSync('c:/projects/focus-rpg/public/assets/arctron/arctron_skeleton.json', 'utf8'));
const bones = data.armature[0].bone;
const walkAnim = data.armature[0].animation.find(a => a.name === 'walk');
const idleAnim = data.armature[0].animation.find(a => a.name === 'idle');

const boneTree = buildBoneTree(bones);

function computeGlobalPositions() {
  if (!boneTree.roots.length) return;
  
  function recurse(bone, px = 0, py = 0, prot = 0) {
    let tx = bone.x + bone.animX;
    let ty = bone.y + bone.animY;
    let rot = bone.rotation + bone.animRot;

    const rad = prot * Math.PI / 180;
    const rx = tx * Math.cos(rad) - ty * Math.sin(rad);
    const ry = tx * Math.sin(rad) + ty * Math.cos(rad);

    const gx = px + rx;
    const gy = py + ry;
    const grot = prot + rot;

    bone.gx = 300 + gx * 1.5;
    bone.gy = 600 + gy * 1.5;
    bone.grot = grot;
    bone.gx_rel = gx;
    bone.gy_rel = gy;

    console.log(`  Bone: ${bone.name}, local: (${bone.x.toFixed(1)}, ${bone.y.toFixed(1)}), anim: (${bone.animX.toFixed(1)}, ${bone.animY.toFixed(1)}), rot: ${bone.rotation.toFixed(1)}+${bone.animRot.toFixed(1)}, global: (${bone.gx.toFixed(1)}, ${bone.gy.toFixed(1)})`);

    for (const child of bone.children) {
      recurse(child, gx, gy, grot);
    }
  }

  for (const root of boneTree.roots) {
    recurse(root, 0, 0, 0);
  }
}

console.log('--- TEST IDLE ANIMATION FRAME 0 ---');
applyAnimation(boneTree.map, idleAnim, 0);
computeGlobalPositions();

console.log('--- TEST WALK ANIMATION FRAME 0 ---');
applyAnimation(boneTree.map, walkAnim, 0);
computeGlobalPositions();
