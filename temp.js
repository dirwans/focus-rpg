
const CANVAS_W = 780, CANVAS_H = 936;
const SPRITE_W = 523.33; // Original sprite width
const SPRITE_OFFSET = (CANVAS_W - SPRITE_W) / 2;
const canvas = document.getElementById('mechaCanvas');
const ctx = canvas.getContext('2d');
const cardContainer = document.getElementById('cardContainer');

// ─── Active Job / Tier state ────────────────────────────────────────────────
const activeJob = 'technician';
let activeTier = 1;
let selectedLayer = null;

const JOB_SKINS = {
  technician: '/assets/arctron/arctron_technician.png'
};

const JOB_BLUEPRINTS = {
  technician: '/assets/arctron/def_warrior_armor_set_lv1/bw-lv1-arctron-warrior-orig.png'
};

const JOB_BASE = {
  technician: '/assets/arctron/def_warrior_armor_set_lv1/bw-lv1-arctron-warrior.png'
};

function getShieldPath(tier) {
  if (tier >= 55) return '/assets/arctron/shields/lv55arctronshielddef.png';
  if (tier >= 42) return '/assets/arctron/shields/lv42arctronshielddef.png';
  if (tier >= 32) return '/assets/arctron/shields/lv32arctronshielddef.png';
  return '/assets/arctron/shields/lv1arctronshielddefault.png';
}

function getWeaponPath(tier) {
  if (tier >= 55) return '/assets/weapons/defbioncelestralv55staff.png';
  if (tier >= 42) return '/assets/weapons/defbioncelestralv42staff.png';
  if (tier >= 32) return '/assets/weapons/defbioncelestralv32staff.png';
  return '/assets/weapons/defbioncelestralv1staff1.png';
}

function getGearPath(job, tier, slot) {
  return `/assets/arctron/def_${job}_armor_set_lv${tier}/${slot}.png`;
}

function getSlotIcon(slot) {
  switch (slot) {
    case 'helmet': return '🪖';
    case 'armor': return '🧥';
    case 'pants': return '👖';
    case 'boots_l': case 'boots_r': return '🥾';
    case 'gloves_l': case 'gloves_r': return '🧤';
    case 'weapon': return '🪄';
    case 'shield': return '🛡️';
    default: return '⚙️';
  }
}

// ─── Preset Registry (Searchable) ───────────────────────────────────────────
const PRESET_REGISTRY = [];

// Gear layers config - Technician default coordinates (using warrior as baseline starting)
const layers = [
  {
    slot: 'armor',
    name: 'Chest Armor',
    path: '/assets/arctron/def_technician_armor_set_lv1/armor.png',
    x: 0.002, y: 0.050, ax: 0.5, ay: 0.15, size: 0.457, rot: 0, z: 1,
    scaleX: 1.0, scaleY: 1.0, locked: true, visible: true
  },
  {
    slot: 'pants',
    name: 'Pants (Pelvis)',
    path: '/assets/arctron/def_technician_armor_set_lv1/pants.png',
    x: 0.003, y: 0.341, ax: 0.5, ay: 0.22, size: 0.414, rot: 0, z: 2,
    scaleX: 1.0, scaleY: 1.0, locked: true, visible: true
  },
  {
    slot: 'boots_l',
    name: 'Boots (L) - Left Foot',
    path: '/assets/arctron/def_technician_armor_set_lv1/boots_l.png',
    x: 0.128, y: 0.652, ax: 0.5, ay: 0.15, size: 0.394, rot: 0, z: 3,
    scaleX: 1.070, scaleY: 1.125, locked: true, visible: true
  },
  {
    slot: 'boots_r',
    name: 'Boots (R) - Right Foot',
    path: '/assets/arctron/def_technician_armor_set_lv1/boots_r.png',
    x: -0.132, y: 0.651, ax: 0.5, ay: 0.15, size: 0.424, rot: 0, z: 3,
    scaleX: 0.940, scaleY: 1.045, locked: true, visible: true
  },
  {
    slot: 'gloves_l',
    name: 'Gloves (L) - Left Hand',
    path: '/assets/arctron/def_technician_armor_set_lv1/gloves_l.png',
    x: 0.209, y: 0.354, ax: 0.52, ay: 0.22, size: 0.248, rot: 0, z: 6,
    scaleX: 1.0, scaleY: 1.065, locked: true, visible: true
  },
  {
    slot: 'gloves_r',
    name: 'Gloves (R) - Right Hand',
    path: '/assets/arctron/def_technician_armor_set_lv1/gloves_r.png',
    x: -0.181, y: 0.329, ax: 0.5, ay: 0.23, size: 0.258, rot: -1, z: 5,
    scaleX: 1.035, scaleY: 1.200, locked: true, visible: true
  },
  {
    slot: 'helmet',
    name: 'Helmet (Head)',
    path: '/assets/arctron/def_technician_armor_set_lv1/helmet.png',
    x: 0.001, y: 0.066, ax: 0.5, ay: 0.5, size: 0.123, rot: 0, z: 5,
    scaleX: 0.970, scaleY: 1.045, locked: true, visible: true
  },
  {
    slot: 'weapon',
    name: 'Weapon (R-Hand)',
    path: '/assets/weapons/defbioncelestralv1staff1.png',
    x: 0.013, y: 0.689, ax: 0.33, ay: 0.63, size: 0.401, rot: -97, z: 4,
    scaleX: 1.0, scaleY: 1.0, locked: true, visible: true
  },
  {
    slot: 'shield',
    name: 'Shield (L-Hand)',
    path: '/assets/arctron/shields/lv1arctronshielddefault.png',
    x: 0.182, y: 0.503, ax: 0.5, ay: 0.5, size: 0.457, rot: 0, z: 7,
    scaleX: 1.0, scaleY: 1.0, locked: true, visible: true
  }
];

// ─── localStorage Persistence ────────────────────────────────────────────────
const STORAGE_KEY = 'dressingRoom_technician_lv' + activeTier;
const LAYOUT_VERSION = 'v16';

function saveLayersToStorage() {
  const key = 'dressingRoom_technician_lv' + activeTier;
  const data = {
    version: LAYOUT_VERSION,
    layers: layers.map(l => ({
      slot: l.slot, x: l.x, y: l.y, ax: l.ax, ay: l.ay,
      size: l.size, rot: l.rot, z: l.z,
      scaleX: l.scaleX, scaleY: l.scaleY,
      flipX: l.flipX || false, flipY: l.flipY || false,
      locked: l.locked, visible: l.visible,
      path: l.path
    }))
  };
  localStorage.setItem(key, JSON.stringify(data));
}

function loadLayersFromStorage() {
  const key = 'dressingRoom_technician_lv' + activeTier;
  const saved = localStorage.getItem(key);
  if (!saved) return false;
  try {
    const parsed = JSON.parse(saved);
    if (parsed.version !== LAYOUT_VERSION) {
      localStorage.removeItem(key);
      return false;
    }
    const data = parsed.layers;
    data.forEach(savedLayer => {
      const layer = layers.find(l => l.slot === savedLayer.slot);
      if (layer) {
        layer.x = savedLayer.x; layer.y = savedLayer.y;
        layer.ax = savedLayer.ax; layer.ay = savedLayer.ay;
        layer.size = savedLayer.size; layer.rot = savedLayer.rot;
        layer.z = savedLayer.z ?? layer.z;
        layer.scaleX = savedLayer.scaleX ?? 1.0;
        layer.scaleY = savedLayer.scaleY ?? 1.0;
        layer.flipX = savedLayer.flipX ?? false;
        layer.flipY = savedLayer.flipY ?? false;
        layer.locked = savedLayer.locked ?? false;
        layer.visible = savedLayer.visible ?? true;
        if (savedLayer.path && savedLayer.path !== layer.path) {
          layer.path = savedLayer.path;
          if (layer.img) {
            layer.img.src = layer.path + '?v=' + Date.now();
          }
        }
      }
    });
    return true;
  } catch (e) { return false; }
}

// Sprite Silhouette Masking
const spriteMaskCanvas = document.createElement('canvas');
spriteMaskCanvas.width = CANVAS_W; spriteMaskCanvas.height = CANVAS_H;
const spriteMaskCtx = spriteMaskCanvas.getContext('2d');
let spriteMaskReady = false;

// Reference images variables
const charBaseImg = new Image();
let charBaseLoaded = false;

const blueprintImg = new Image();
let blueprintLoaded = false;

const baseImg = new Image();
let baseLoaded = false;

function primeSpriteMask() {
  if (!baseLoaded) return;
  spriteMaskCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  const scale = Math.min(CANVAS_W / baseImg.naturalWidth, CANVAS_H / baseImg.naturalHeight);
  const dw = baseImg.naturalWidth * scale;
  const dh = baseImg.naturalHeight * scale;
  const dx = (CANVAS_W - dw) / 2;
  const dy = (CANVAS_H - dh) / 2;
  spriteMaskCtx.drawImage(baseImg, dx, dy, dw, dh);
  spriteMaskReady = true;
}

function drawMaskedLayer(ctx2, l) {
  if (!spriteMaskReady) primeSpriteMask();
  const off = document.createElement('canvas');
  off.width = CANVAS_W; off.height = CANVAS_H;
  const offCtx = off.getContext('2d');
  const h = l.size * CANVAS_H;
  const w = h * (l.img.naturalWidth / l.img.naturalHeight);
  const left = CANVAS_W/2 + (l.x * CANVAS_H);
  const top = l.y * CANVAS_H;
  offCtx.save();
  offCtx.translate(left, top);
  offCtx.rotate(l.rot * Math.PI/180);
  offCtx.scale(l.scaleX || 1.0, l.scaleY || 1.0);
  offCtx.drawImage(l.img, -l.ax*w, -l.ay*h, w, h);
  offCtx.restore();

  const maskData = spriteMaskCtx.getImageData(0, 0, CANVAS_W, CANVAS_H);
  const gearData = offCtx.getImageData(0, 0, CANVAS_W, CANVAS_H);
  for (let i = 3; i < gearData.data.length; i += 4) {
    gearData.data[i] = Math.min(gearData.data[i], maskData.data[i]);
  }
  offCtx.putImageData(gearData, 0, 0);
  ctx2.drawImage(off, 0, 0);
}

function drawLayer(ctx2, l) {
  if (!l.img || !l.img.complete || l.img.naturalWidth === 0) return;
  if (l.maskBox) { drawMaskedLayer(ctx2, l); return; }
  const h = l.size * CANVAS_H;
  const w = h * (l.img.naturalWidth / l.img.naturalHeight);
  const left = CANVAS_W/2 + (l.x * CANVAS_H);
  const top = l.y * CANVAS_H;

  const isArmor = ['helmet', 'armor', 'pants', 'boots_l', 'boots_r', 'gloves_l', 'gloves_r'].includes(l.slot);

  if (ctx2 === ctx && isArmor) {
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = CANVAS_W; maskCanvas.height = CANVAS_H;
    const mctx = maskCanvas.getContext('2d');
    mctx.save();
    mctx.translate(left, top);
    mctx.rotate(l.rot * Math.PI/180);
    const mfx = (l.flipX ? -1 : 1) * (l.scaleX || 1.0);
    const mfy = (l.flipY ? -1 : 1) * (l.scaleY || 1.0);
    mctx.scale(mfx, mfy);
    mctx.drawImage(l.img, -l.ax*w, -l.ay*h, w, h);
    mctx.restore();

    mctx.globalCompositeOperation = 'source-in';
    mctx.fillStyle = '#000000';
    mctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx2.save();
    ctx2.globalCompositeOperation = 'destination-out';
    ctx2.drawImage(maskCanvas, 0, 0);
    ctx2.restore();
  }

  ctx2.save();
  ctx2.translate(left, top);
  ctx2.rotate(l.rot * Math.PI/180);
  const fx = (l.flipX ? -1 : 1) * (l.scaleX || 1.0);
  const fy = (l.flipY ? -1 : 1) * (l.scaleY || 1.0);
  ctx2.scale(fx, fy);
  ctx2.drawImage(l.img, -l.ax*w, -l.ay*h, w, h);
  ctx2.restore();
}

function drawClippedHead(targetCtx, sourceImg) {
  const sx = 394 * 0.36;
  const sy = 0;
  const sWidth = 394 * 0.28;
  const sHeight = 702 * 0.16;
  const scaleX = SPRITE_W / 394;
  const scaleY = CANVAS_H / 702;
  const dx = SPRITE_OFFSET + sx * scaleX;
  const dy = sy * scaleY;
  const dWidth = sWidth * scaleX;
  const dHeight = sHeight * scaleY;
  targetCtx.drawImage(sourceImg, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
}

function drawContain(ctx, img, alpha) {
  if (!img || !img.naturalWidth) return;
  const scale = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = (CANVAS_W - dw) / 2;
  const dy = (CANVAS_H - dh) / 2;
  if (alpha !== undefined) {
    const prev = ctx.globalAlpha;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.globalAlpha = prev;
  } else {
    ctx.drawImage(img, dx, dy, dw, dh);
  }
}

function render() {
  const isHelmetVisible = layers.find(l => l.slot === 'helmet' && l.visible);

  // Preview Canvas
  const charCanvas = document.getElementById('charPreviewCanvas');
  if (charCanvas) {
    const charCtx = charCanvas.getContext('2d');
    charCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (charBaseLoaded) drawContain(charCtx, charBaseImg);
    
    const activeLayersLeft = layers.filter(l => l.visible).sort((a, b) => a.z - b.z);
    let headDrawn = false;
    activeLayersLeft.forEach(l => {
      if (!isHelmetVisible && !headDrawn && l.z >= 4) {
        if (charBaseLoaded) drawClippedHead(charCtx, charBaseImg);
        headDrawn = true;
      }
      drawLayer(charCtx, l);
    });
    if (!isHelmetVisible && !headDrawn) {
      if (charBaseLoaded) drawClippedHead(charCtx, charBaseImg);
    }
  }

  // Mannequin Canvas
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (baseLoaded) drawContain(ctx, baseImg);

  const activeLayersRight = layers.filter(l => l.visible).sort((a, b) => a.z - b.z);
  let headDrawnRight = false;
  activeLayersRight.forEach(l => {
    if (!isHelmetVisible && !headDrawnRight && l.z >= 4) {
      if (baseLoaded) drawClippedHead(ctx, baseImg);
      headDrawnRight = true;
    }
    drawLayer(ctx, l);
  });
  if (!isHelmetVisible && !headDrawnRight) {
    if (baseLoaded) drawClippedHead(ctx, baseImg);
  }

  if (blueprintLoaded && document.getElementById('blueprintToggle').checked) {
    ctx.globalAlpha = 0.45;
    ctx.drawImage(blueprintImg, SPRITE_OFFSET, 0, SPRITE_W, CANVAS_H);
    ctx.globalAlpha = 1.0;
  }

  updateUI();
}

function toggleSlot(slotName) {
  const layer = layers.find(l => l.slot === slotName);
  if (layer) {
    layer.visible = !layer.visible;
    render();
  }
}

function updateWeaponDropdownOptions() {
  const select = document.getElementById('weaponSelect');
  if (!select) return;
  
  select.innerHTML = '';
  
  const unequipOpt = document.createElement('option');
  unequipOpt.value = 'none';
  unequipOpt.textContent = '❌ Unequip / Hide Weapon';
  select.appendChild(unequipOpt);
  
  const weaponGroups = [
    {
      label: '⚔️ Swords & Axes',
      items: [
        { value: 'defallfactionslv1sword1.png', label: 'Lv.1 Sword 1 (Green)' },
        { value: 'defallfactionslv1sword2.png', label: 'Lv.1 Sword 2 (Bronze)' },
        { value: 'defallfactionslv1sword3.png', label: 'Lv.1 Sword 3 (Steel)' },
        { value: 'defallfactionslv1sword4.png', label: 'Lv.1 Sword 4 (Gold)' },
        { value: 'defallfactionslv32sword.png', label: 'Lv.32 Greatsword' },
        { value: 'defallfactionslv42sword.png', label: 'Lv.42 Greatsword' },
        { value: 'defallfactionslv55sword.png', label: 'Lv.55 Greatsword' },
        { value: 'defallfactionslv32axe.png', label: 'Lv.32 Battleaxe' },
        { value: 'defallfactionslv42axe.png', label: 'Lv.42 Battleaxe' },
        { value: 'defallfactionslv55axe.png', label: 'Lv.55 Battleaxe' }
      ]
    },
    {
      label: '🔫 Guns & Bows',
      items: [
        { value: 'defallfactionslv1gun.png', label: 'Lv.1 Rifle' },
        { value: 'defallfactionslv1bow.png', label: 'Lv.1 Bow' },
        { value: 'defallfactionslv32gun.png', label: 'Lv.32 Rifle' },
        { value: 'defallfactionslv32bow.png', label: 'Lv.32 Bow' },
        { value: 'defallfactionslv42gun.png', label: 'Lv.42 Rifle' },
        { value: 'defallfactionslv42bow.png', label: 'Lv.42 Bow' },
        { value: 'defallfactionslv55gun.png', label: 'Lv.55 Rifle' },
        { value: 'defallfactionslv55bow.png', label: 'Lv.55 Bow' }
      ]
    },
    {
      label: '🚀 Arctron Special Launchers',
      items: [
        { value: 'defarctronlv32special.png', label: 'Lv.32 Special Launcher' },
        { value: 'defarctronlv42special.png', label: 'Lv.42 Special Launcher' },
        { value: 'defarctronlv55special.png', label: 'Lv.55 Special Launcher' }
      ]
    },
    {
      label: '🔮 Staffs & Scepters',
      items: [
        { value: 'defbioncelestralv1staff1.png', label: 'Lv.1 Staff 1' },
        { value: 'defbioncelestralv1staff2.png', label: 'Lv.1 Staff 2' },
        { value: 'defbioncelestralv32staff.png', label: 'Lv.32 Staff' },
        { value: 'defbioncelestralv42staff.png', label: 'Lv.42 Staff' },
        { value: 'defbioncelestralv55staff.png', label: 'Lv.55 Staff' }
      ]
    }
  ];
  
  weaponGroups.forEach(group => {
    const optgroup = document.createElement('optgroup');
    optgroup.label = group.label;
    group.items.forEach(item => {
      const el = document.createElement('option');
      el.value = item.value;
      el.textContent = item.label;
      optgroup.appendChild(el);
    });
    select.appendChild(optgroup);
  });
  
  const weaponLayer = layers.find(l => l.slot === 'weapon');
  if (weaponLayer) {
    if (!weaponLayer.visible) {
      select.value = 'none';
    } else {
      const filename = weaponLayer.path.split('/').pop().split('?')[0];
      if (select.querySelector(`option[value="${filename}"]`)) {
        select.value = filename;
      }
    }
  }
}

function updateUI() {
  const container = document.getElementById('gearListContainer');
  if (!container) return;
  container.innerHTML = '';

  layers.forEach(l => {
    const row = document.createElement('div');
    row.className = `gear-row ${selectedLayer === l ? 'active' : ''}`;
    row.onclick = () => startCalibration(l);

    const info = document.createElement('div');
    info.className = 'gear-info';

    const icon = document.createElement('div');
    icon.className = 'gear-icon';
    icon.textContent = getSlotIcon(l.slot);

    const meta = document.createElement('div');
    meta.className = 'gear-meta';

    const label = document.createElement('div');
    label.className = 'gear-label';
    label.textContent = l.name;

    const status = document.createElement('div');
    status.className = 'gear-status';
    status.textContent = l.locked ? '🔒 locked' : '🔓 editing';

    meta.appendChild(label);
    meta.appendChild(status);
    info.appendChild(icon);
    info.appendChild(meta);

    const toggle = document.createElement('button');
    toggle.className = 'copy-btn';
    toggle.style.cssText = `margin-top: 0; width: auto; font-size: 10px; padding: 6px 12px; border-radius: 6px; background: ${l.visible ? 'var(--accent)' : '#1c273a'}; color: ${l.visible ? '#03060f' : '#a1b0cb'}; border-color: ${l.visible ? 'var(--accent)' : '#2e3c54'}; font-weight: bold;`;
    toggle.textContent = l.visible ? 'EQUIPPED' : 'EQUIP';
    toggle.onclick = (e) => {
      e.stopPropagation();
      toggleSlot(l.slot);
    };

    row.appendChild(info);
    row.appendChild(toggle);
    container.appendChild(row);
  });

  const cardPrev = document.getElementById('charPreviewContainer');
  if (cardPrev) {
    const existing = cardPrev.querySelectorAll('.hotspot-dot, .tooltip');
    existing.forEach(el => el.remove());
    
    layers.filter(l => l.visible).forEach(l => {
      const dot = document.createElement('div');
      dot.className = `hotspot-dot ${selectedLayer === l ? 'active' : ''}`;

      const leftPercent = 50 + (l.x * 120);
      const topPercent = (l.y * 100);

      dot.style.left = `${leftPercent}%`;
      dot.style.top = `${topPercent}%`;
      
      dot.onclick = (e) => {
        e.stopPropagation();
        startCalibration(l);
      };

      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.textContent = `${l.name} (x: ${l.x.toFixed(3)}, y: ${l.y.toFixed(3)})`;
      
      dot.style.zIndex = l.z + 10;
      
      cardPrev.appendChild(dot);
      cardPrev.appendChild(tip);
    });
  }

  const calibCard = document.getElementById('cardContainer');
  if (calibCard) {
    const existing = calibCard.querySelectorAll('.hotspot-dot, .tooltip');
    existing.forEach(el => el.remove());
    
    layers.filter(l => l.visible).forEach(l => {
      const dot = document.createElement('div');
      dot.className = `hotspot-dot ${selectedLayer === l ? 'active' : ''}`;

      const leftPercent = 50 + (l.x * 120);
      const topPercent = (l.y * 100);

      dot.style.left = `${leftPercent}%`;
      dot.style.top = `${topPercent}%`;
      dot.style.zIndex = l.z + 10;

      let startX = 0, startY = 0;
      let hasMoved = false;

      dot.onmousedown = (e) => {
        if (l.locked) {
          e.stopPropagation();
          selectedLayer = l;
          startCalibration(l);
          return;
        }
        e.stopPropagation();
        e.preventDefault();
        startX = e.clientX;
        startY = e.clientY;
        hasMoved = false;
        
        selectedLayer = l;
        startCalibration(l);
        
        const onMouseMove = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
          
          const rect = calibCard.getBoundingClientRect();
          let clientX = moveEvent.clientX - rect.left;
          let clientY = moveEvent.clientY - rect.top;
          
          clientX = Math.max(0, Math.min(rect.width, clientX));
          clientY = Math.max(0, Math.min(rect.height, clientY));
          
          l.x = (clientX - rect.width / 2) / rect.height;
          l.y = clientY / rect.height;
          
          dot.style.left = `${clientX}px`;
          dot.style.top = `${clientY}px`;
          
          if (tip) { tip.style.left = `${clientX}px`; tip.style.top = `${clientY}px`; }
          
          document.getElementById('slider_x').value = l.x;
          document.getElementById('slider_y').value = l.y;
          document.getElementById('val_x').textContent = l.x.toFixed(3);
          document.getElementById('val_y').textContent = l.y.toFixed(3);
          
          render();
        };
        
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          saveLayersToStorage();
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };

      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.textContent = `${l.name} (x: ${l.x.toFixed(3)}, y: ${l.y.toFixed(3)})`;
      
      calibCard.appendChild(dot);
      calibCard.appendChild(tip);
    });
  }

  // Display master coordinate output box
  const coordsBox = document.getElementById('coords');
  if (coordsBox) {
    const formatLayer = (l) => {
      let parts = [];
      parts.push(`x: ${l.x.toFixed(3)}`);
      parts.push(`y: ${l.y.toFixed(3)}`);
      parts.push(`ax: ${l.ax.toFixed(2)}`);
      parts.push(`ay: ${l.ay.toFixed(2)}`);
      parts.push(`size: ${l.size.toFixed(3)}`);
      parts.push(`rot: ${l.rot}`);
      parts.push(`z: ${l.z || 1}`);
      if (l.scaleX !== undefined && l.scaleX !== 1.0) parts.push(`scaleX: ${l.scaleX.toFixed(3)}`);
      if (l.scaleY !== undefined && l.scaleY !== 1.0) parts.push(`scaleY: ${l.scaleY.toFixed(3)}`);
      if (l.flipX) parts.push(`flipX: true`);
      if (l.flipY) parts.push(`flipY: true`);
      if (l.label) parts.push(`label: '${l.label}'`);
      if (l.splitSuffix) parts.push(`splitSuffix: '${l.splitSuffix}'`);
      return `{ ${parts.join(', ')} }`;
    };

    let out = `const GEAR_POINTS = {\n`;
    out += `  armor:  [${formatLayer(layers.find(l => l.slot === 'armor'))}],\n`;
    out += `  pants:  [${formatLayer(layers.find(l => l.slot === 'pants'))}],\n`;
    out += `  boots: [\n`;
    out += `    ${formatLayer(layers.find(l => l.slot === 'boots_l'))},\n`;
    out += `    ${formatLayer(layers.find(l => l.slot === 'boots_r'))}\n`;
    out += `  ],\n`;
    out += `  gloves: [\n`;
    out += `    ${formatLayer(layers.find(l => l.slot === 'gloves_l'))},\n`;
    out += `    ${formatLayer(layers.find(l => l.slot === 'gloves_r'))}\n`;
    out += `  ],\n`;
    out += `  shield: [${formatLayer(layers.find(l => l.slot === 'shield'))}],\n`;
    out += `  weapon: [${formatLayer(layers.find(l => l.slot === 'weapon'))}],\n`;
    out += `  helmet: [${formatLayer(layers.find(l => l.slot === 'helmet'))}]\n`;
    out += `};`;
    coordsBox.textContent = out;
  }
}

function startCalibration(layer) {
  selectedLayer = layer;
  
  document.querySelectorAll('.gear-row').forEach(row => {
    row.classList.toggle('active', row.querySelector('.gear-label').textContent === layer.name);
  });

  const panel = document.getElementById('calibrationPanel');
  panel.style.display = 'block';
  document.getElementById('calSlotName').textContent = layer.name;

  setupSlider('x', layer, -0.5, 0.5, 0.001);
  setupSlider('y', layer, 0, 1.0, 0.001);
  setupSlider('size', layer, 0, 1.0, 0.001);
  setupSlider('rot', layer, -180, 180, 1);
  setupSlider('ax', layer, 0, 1.0, 0.01);
  setupSlider('ay', layer, 0, 1.0, 0.01);
  setupSlider('scaleX', layer, 0.5, 2.0, 0.005);
  setupSlider('scaleY', layer, 0.5, 2.0, 0.005);

  updateLockBtn();
  updateFlipBtns();
  updateUI();
  render();
}

function setupSlider(prop, layer, min, max, step) {
  const slider = document.getElementById(`slider_${prop}`);
  const valDisp = document.getElementById(`val_${prop}`);
  
  slider.min = min; slider.max = max; slider.step = step;
  
  const val = layer[prop] !== undefined ? layer[prop] : (prop === 'scaleX' || prop === 'scaleY' ? 1.0 : 0.0);
  slider.value = val;
  
  const decimals = (prop === 'rot') ? 0 : (prop === 'ax' || prop === 'ay' ? 2 : 3);
  valDisp.textContent = val.toFixed(decimals);

  slider.oninput = (e) => {
    if (layer.locked) {
      slider.value = val;
      return;
    }
    const newVal = parseFloat(e.target.value);
    layer[prop] = newVal;
    valDisp.textContent = newVal.toFixed(decimals);
    render();
    saveLayersToStorage();
  };
}

function updateLockBtn() {
  const btn = document.getElementById('lockBtn');
  if (!selectedLayer) return;
  btn.textContent = selectedLayer.locked ? '🔒 LOCKED' : '🔓 UNLOCKED';
  btn.style.background = selectedLayer.locked ? '#059669' : '#1e293b';
  btn.style.borderColor = selectedLayer.locked ? '#047857' : '#334155';
}

function updateFlipBtns() {
  if (!selectedLayer) return;
  const hBtn = document.getElementById('flipHBtn');
  const vBtn = document.getElementById('flipVBtn');
  hBtn.style.background = selectedLayer.flipX ? '#0284c7' : '#1e293b';
  hBtn.style.borderColor = selectedLayer.flipX ? '#0369a1' : '#334155';
  hBtn.textContent = selectedLayer.flipX ? '↔ FLIP H ✅' : '↔ FLIP H';
  vBtn.style.background = selectedLayer.flipY ? '#0284c7' : '#1e293b';
  vBtn.style.borderColor = selectedLayer.flipY ? '#0369a1' : '#334155';
  vBtn.textContent = selectedLayer.flipY ? '↕ FLIP V ✅' : '↕ FLIP V';
}

function applyPresetCoords(parsed, silent = false) {
  let loadedCount = 0;
  const applyToLayer = (target, source) => {
    if (!target || !source) return;
    target.flipX = source.flipX || false;
    target.flipY = source.flipY || false;
    target.scaleX = source.scaleX !== undefined ? source.scaleX : 1.0;
    target.scaleY = source.scaleY !== undefined ? source.scaleY : 1.0;
    Object.assign(target, source);
    loadedCount++;
  };

  if (parsed.armor && parsed.armor[0]) { applyToLayer(layers.find(l => l.slot === 'armor'), parsed.armor[0]); }
  if (parsed.pants && parsed.pants[0]) { applyToLayer(layers.find(l => l.slot === 'pants'), parsed.pants[0]); }
  if (parsed.boots) {
    const bl = parsed.boots.find(b => b.label === 'boot_l' || b.splitSuffix === '_l');
    const br = parsed.boots.find(b => b.label === 'boot_r' || b.splitSuffix === '_r');
    applyToLayer(layers.find(l => l.slot === 'boots_l'), bl);
    applyToLayer(layers.find(l => l.slot === 'boots_r'), br);
  }
  if (parsed.gloves) {
    const gl = parsed.gloves.find(g => g.label === 'glove_l' || g.splitSuffix === '_l');
    const gr = parsed.gloves.find(g => g.label === 'glove_r' || g.splitSuffix === '_r');
    applyToLayer(layers.find(l => l.slot === 'gloves_l'), gl);
    applyToLayer(layers.find(l => l.slot === 'gloves_r'), gr);
  }
  if (parsed.shield && parsed.shield[0]) { applyToLayer(layers.find(l => l.slot === 'shield'), parsed.shield[0]); }
  if (parsed.weapon && parsed.weapon[0]) { applyToLayer(layers.find(l => l.slot === 'weapon'), parsed.weapon[0]); }
  if (parsed.helmet && parsed.helmet[0]) { applyToLayer(layers.find(l => l.slot === 'helmet'), parsed.helmet[0]); }
  if (loadedCount === 0) {
    if (!silent) alert('No matching slot coordinates found.');
    return;
  }
  layers.forEach(l => {
    if (l.scaleX === undefined) l.scaleX = 1.0;
    if (l.scaleY === undefined) l.scaleY = 1.0;
    l.defaultCoords = { x: l.x, y: l.y, ax: l.ax, ay: l.ay, size: l.size, rot: l.rot, scaleX: l.scaleX, scaleY: l.scaleY };
  });
  if (selectedLayer) startCalibration(selectedLayer);
  else { const first = layers.find(l => l.visible); if (first) startCalibration(first); }
  render();
  saveLayersToStorage();
  document.getElementById('importModal').style.display = 'none';
  if (!silent) alert(`Imported ${loadedCount} slot presets!`);
}

function renderPresetList(filter) {
  const container = document.getElementById('presetListContainer');
  container.innerHTML = '<div style="padding:10px;color:var(--text-secondary);font-size:11px;">No presets found for Technician.</div>';
}

function switchTier(tier) {
  saveLayersToStorage();
  activeTier = tier;

  // Update tier buttons
  document.querySelectorAll('.tier-sub-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.tier) === tier);
  });

  // Update level badge on cards
  document.querySelectorAll('.card-level-badge span:last-child').forEach(el => el.textContent = tier);

  // Update paths
  layers.forEach(l => {
    let newPath;
    if (l.slot === 'weapon') newPath = getWeaponPath(tier);
    else if (l.slot === 'shield') newPath = getShieldPath(tier);
    else {
      const slotBase = l.slot.replace('_l', '').replace('_r', '');
      const suffix = l.slot.includes('_l') ? '_l' : l.slot.includes('_r') ? '_r' : '';
      newPath = getGearPath(activeJob, tier, slotBase + suffix);
    }
    l.path = newPath;
    l.img = new Image();
    l.img.src = newPath + '?v=' + Date.now();
    l.img.onload = () => render();
    l.img.onerror = () => render();
  });

  loadLayersFromStorage();
  updateWeaponDropdownOptions();
  updateUI();
  render();
}

// ─── INITIALIZATION ON LOAD ──────────────────────────────────────────────────
// Setup button handlers
document.getElementById('lockBtn').onclick = () => {
  if (!selectedLayer) return;
  selectedLayer.locked = !selectedLayer.locked;
  if (selectedLayer.locked) {
    document.getElementById('calibrationPanel').style.display = 'none';
    selectedLayer = null;
  } else {
    updateLockBtn();
    updateFlipBtns();
  }
  updateUI();
  saveLayersToStorage();
};

document.getElementById('resetBtn').onclick = () => {
  if (!selectedLayer) return;
  if (confirm(`Reset ${selectedLayer.name} coordinates to default?`)) {
    if (selectedLayer.defaultCoords) {
      Object.assign(selectedLayer, selectedLayer.defaultCoords);
    }
    selectedLayer.flipX = false;
    selectedLayer.flipY = false;
    startCalibration(selectedLayer);
    saveLayersToStorage();
  }
};

document.getElementById('flipHBtn').onclick = () => {
  if (!selectedLayer || selectedLayer.locked) return;
  selectedLayer.flipX = !selectedLayer.flipX;
  updateFlipBtns(); render(); saveLayersToStorage();
};

document.getElementById('flipVBtn').onclick = () => {
  if (!selectedLayer || selectedLayer.locked) return;
  selectedLayer.flipY = !selectedLayer.flipY;
  updateFlipBtns(); render(); saveLayersToStorage();
};

document.getElementById('copyCoordsBtn').onclick = () => {
  const text = document.getElementById('coords').textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('Coordinates copied to clipboard!');
  });
};

document.getElementById('saveToKitabBtn').onclick = () => {
  const text = document.getElementById('coords').textContent;
  const filename = `lv${activeTier}-arctechnician-armorset-calib.md`;
  
  const fileContent = `# Kitab Sakti Kalibrasi Mecha Arctron Technician (LV${activeTier} Set)\n\n` +
                      `> Auto-generated from Arctron Dressing Room on ${new Date().toLocaleString()}\n\n` +
                      `## Master Coordinate Presets\n\n\`\`\`javascript\n${text}\n\`\`\`\n\n` +
                      `## Metadata\n` +
                      `- **Job**: Technician\n` +
                      `- **Tier**: LV${activeTier}\n` +
                      `- **Race**: Arctron\n` +
                      `- **Base Skin**: /assets/arctron/arctron_technician.png\n`;

  const blob = new Blob([fileContent], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  
  navigator.clipboard.writeText(text).catch(() => {});
  alert(`Saved as ${filename} and copied to clipboard!`);
};

document.querySelectorAll('.tier-sub-btn').forEach(btn => {
  btn.onclick = () => switchTier(parseInt(btn.dataset.tier));
});

document.getElementById('weaponSelect').addEventListener('change', (e) => {
  const val = e.target.value;
  const weaponLayer = layers.find(l => l.slot === 'weapon');
  if (weaponLayer) {
    if (val === 'none') {
      weaponLayer.visible = false;
    } else {
      weaponLayer.visible = true;
      weaponLayer.path = `/assets/weapons/${val}`;
      weaponLayer.img.src = weaponLayer.path + '?v=' + Date.now();
    }
    saveLayersToStorage();
    render();
  }
});

document.getElementById('blueprintToggle').onchange = render;

// Import Modal Event Listeners
const importModal = document.getElementById('importModal');
const importTextArea = document.getElementById('importTextArea');
const presetSearchInput = document.getElementById('presetSearchInput');

document.getElementById('importCoordsBtn').onclick = () => {
  importTextArea.value = '';
  presetSearchInput.value = '';
  renderPresetList('');
  importModal.style.display = 'flex';
};

presetSearchInput.oninput = (e) => renderPresetList(e.target.value);

document.getElementById('closeImportBtn').onclick = () => {
  importModal.style.display = 'none';
};

document.getElementById('applyImportBtn').onclick = () => {
  const text = importTextArea.value.trim();
  if (!text) { alert('Please paste some valid presets first!'); return; }
  try {
    const startIdx = text.indexOf('{');
    if (startIdx === -1) throw new Error("Could not find opening brace '{'");
    const parsed = new Function('return ' + text.substring(startIdx))();
    if (typeof parsed !== 'object' || parsed === null) throw new Error('Parsed result is not a valid object.');
    applyPresetCoords(parsed);
  } catch (err) {
    alert('Import failed: ' + err.message);
  }
};

// Initialize layers and load storage values before firing image loads
loadLayersFromStorage();
updateWeaponDropdownOptions();

// Initialize layer image objects
layers.forEach(l => {
  l.img = new Image();
  l.img.onload = () => render();
  l.img.src = l.path + '?v=' + Date.now();
});

// Setup and load mecha base, blueprint, and skin
charBaseImg.onload = () => { charBaseLoaded = true; render(); };
charBaseImg.src = JOB_SKINS[activeJob];

blueprintImg.onload = () => { blueprintLoaded = true; render(); };
blueprintImg.src = JOB_BLUEPRINTS[activeJob];

baseImg.onload = () => { baseLoaded = true; primeSpriteMask(); render(); };
baseImg.src = JOB_BASE[activeJob];

updateUI();
render();
