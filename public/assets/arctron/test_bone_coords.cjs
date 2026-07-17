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

const data = JSON.parse(fs.readFileSync('c:/projects/focus-rpg/public/assets/arctron/arctron_skeleton.json', 'utf8'));
const bones = data.armature[0].bone;
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

    console.log(`Bone: ${bone.name}, local: (${bone.x}, ${bone.y}), global: (${bone.gx}, ${bone.gy})`);

    for (const child of bone.children) {
      recurse(child, gx, gy, grot);
    }
  }

  for (const root of boneTree.roots) {
    recurse(root, 0, 0, 0);
  }
}

computeGlobalPositions();
