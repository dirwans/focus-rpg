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
const tree = buildBoneTree(bones);

console.log('Map keys:', Object.keys(tree.map));
console.log('Roots:', tree.roots.map(r => r.name));
console.log('Body children:', tree.map['body'].children.map(c => c.name));
console.log('Root children:', tree.map['root'].children.map(c => c.name));
