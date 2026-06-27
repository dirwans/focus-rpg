const fs = require('fs');
const path = require('path');

// Load sitemap images map
let sitemapImages = {};
const sitemapImagesPath = path.join(__dirname, 'rfdb-raw/sitemap-images.json');
if (fs.existsSync(sitemapImagesPath)) {
  try {
    sitemapImages = JSON.parse(fs.readFileSync(sitemapImagesPath, 'utf8'));
  } catch (e) {
    console.error('Failed to load sitemap images:', e);
  }
}

// Find item image by keyword search in sitemap URLs
function findItemImage(name, type, race) {
  const cleanName = name.toLowerCase().replace(/\[.*?\]\s*/i, '').replace(/lv\.\d+\s*/i, '').trim();
  const slug = cleanName.replace(/\s+/g, '-');

  // --- 1. Base Materials & Consumables Mappings ---
  const materialMappings = {
    'titanium-scrap': 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/08/tile001.png',
    'carbon-plate': 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/07/tile002.png',
    'mecha-core': 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/08/tile003.png',
    'aether-crystal': 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/08/tile004.png',
    'warlord-seal': 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/08/tile005.png',
    'sector-raid-ticket': 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/08/bxdha21.png',
    'hp-potion': 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/08/bxcsa31.png',
    'fp-potion': 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/08/bxcsa31.png',
    'hp-potion-[s]': 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/08/bxcsa31.png',
    'fp-potion-[s]': 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/08/bxcsa31.png',
    
    // Ores
    'yellow-ore': 'https://img.rfdatabase.net/items/ioyel01.png',
    'blue-ore': 'https://img.rfdatabase.net/items/ioblu01.png',
    
    // Talics
    'ignorance-talic': 'https://img.rfdatabase.net/items/ircys01.png',
    'favor-talic': 'https://img.rfdatabase.net/items/irtal06.png',
  };

  if (materialMappings[slug]) {
    return materialMappings[slug];
  }

  // If name contains certain keywords for talics or ores
  if (slug.includes('ignorance') || slug.includes('keen')) return 'https://img.rfdatabase.net/items/ircys01.png';
  if (slug.includes('favor')) return 'https://img.rfdatabase.net/items/irtal06.png';
  if (slug.includes('yellow-ore')) return 'https://img.rfdatabase.net/items/ioyel01.png';
  if (slug.includes('blue-ore')) return 'https://img.rfdatabase.net/items/ioblu01.png';

  // --- 2. Shield Mappings (Race All) ---
  if (type === 'shield') {
    return 'https://rfdb.rfdatabase.net/wp-content/uploads/2025/05/idaam80.png'; // Accretia Mythic shield look
  }

  // --- 3. Armors Mappings by Race and level ---
  if (type === 'armor' || type === 'helmet' || type === 'gloves' || type === 'boots' || type === 'mantle') {
    // Extract level if present in name
    let level = 1;
    const lvlMatch = name.match(/lv\.(\d+)/i);
    if (lvlMatch) {
      level = parseInt(lvlMatch[1]);
    }

    if (race === 'acreton') {
      if (level <= 20) return 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/07/iuacr50.png'; // Ranger chest / infant
      if (level <= 40) return 'https://rfdb.rfdatabase.net/wp-content/uploads/2024/05/ihawd70.png'; // patron / red steel look
      if (level <= 60) return 'https://rfdb.rfdatabase.net/wp-content/uploads/2024/05/iuawg55.png'; // golden suit
      if (level <= 80) return 'https://rfdb.rfdatabase.net/uploads/2026/04/armor-stealth-53-accretia-hd.webp'; // high-tech stealth
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2025/04/iuawm80.png'; // mythic end-game
    }
    
    if (race === 'belterra') {
      if (level <= 20) return 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/08/ihbwa04.png'; // leather cap / classic helmet
      if (level <= 40) return 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/08/ihbwa13.png'; // parsal circlet/helmet
      if (level <= 60) return 'https://rfdb.rfdatabase.net/wp-content/uploads/2024/05/iubcf55.png'; // Archon light blue plate armor
      if (level <= 80) return 'https://rfdb.rfdatabase.net/wp-content/uploads/2024/05/iubwm75.png'; // rare warrior armor
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2024/05/ihbwc55.png'; // ancient helmet/cloak
    }

    if (race === 'coralis') {
      if (level <= 20) return 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/07/tile002.png'; // lower robe skirt
      if (level <= 40) return 'https://rfdb.rfdatabase.net/wp-content/uploads/2024/05/ihcwk73.png'; // Cora wings/circlet
      if (level <= 60) return 'https://rfdb.rfdatabase.net/wp-content/uploads/2024/05/ihcwd75.png'; // Baalzebub Dark helm
      if (level <= 80) return 'https://rfdb.rfdatabase.net/wp-content/uploads/2023/07/iscrc50.png'; // Ranger shoes / twilight greaves
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2024/05/ihcwd75.png'; // Dark celestial Eclipse helm
    }
  }

  // --- 4. Weapons Mappings ---
  if (type === 'weapon') {
    const urlKeys = Object.keys(sitemapImages);

    // Specific word match fallbacks to ensure unique weapon images
    if (slug.includes('flame') || slug.includes('thrower')) {
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/07/Launcher_Flame-Thrower-min.png';
    }
    if (slug.includes('grenade') || slug.includes('launcher') || slug.includes('faust') || slug.includes('cannon')) {
      if (slug.includes('missile')) {
        return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/07/Launcher_Missile-Launcher-min.png';
      }
      if (slug.includes('oblivion')) {
        return 'https://rfdb.rfdatabase.net/wp-content/uploads/2021/03/Relic_Firearm_Lv55_MetalElvenGattlingCannon.gif';
      }
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/10/iwgea30.png';
    }
    if (slug.includes('vulcan') || slug.includes('gatling') || slug.includes('gun') || slug.includes('rifle') || slug.includes('blaster') || slug.includes('railgun')) {
      if (slug.includes('gatling')) {
        return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/07/FireArm_GatlingGun.gif';
      }
      if (slug.includes('blaster') || slug.includes('laser')) {
        return 'https://rfdb.rfdatabase.net/wp-content/uploads/2022/12/iwfig55.png';
      }
      if (slug.includes('dark-hall')) {
        return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/07/FireArm_Lv55_DarkGatling.gif';
      }
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/07/FireArm_BoltRifle.gif';
    }
    if (slug.includes('bow')) {
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/07/Bow_BeamBow.gif';
    }
    if (slug.includes('wand') || slug.includes('scepter')) {
      if (slug.includes('arch')) {
        return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/06/Staff_WarWand.gif';
      }
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/06/Staff_BlueWand.gif';
    }
    if (slug.includes('staff')) {
      if (slug.includes('relic')) {
        return 'https://rfdb.rfdatabase.net/wp-content/uploads/2021/03/Ancient_Staff_Lv50_HoraStaff.gif';
      }
      if (slug.includes('salamander')) {
        return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/06/Staff_Lv55_DarkStaff.gif';
      }
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2021/03/Ancient_Staff_Lv45_SickleStaff.gif';
    }
    if (slug.includes('sickle') || slug.includes('knife') || slug.includes('sword') || slug.includes('blade')) {
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/06/Knife_SickleKnife.gif';
    }
    if (slug.includes('hammer') || slug.includes('mace')) {
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2020/06/Mace_BeamGreatHammer.gif';
    }
    if (slug.includes('spear') || slug.includes('halberd')) {
      if (slug.includes('halberd')) {
        return 'https://rfdb.rfdatabase.net/wp-content/uploads/2021/03/weapon-baalzebub-halberd.png';
      }
      return 'https://rfdb.rfdatabase.net/wp-content/uploads/2021/03/Ancient_Spear_Lv50_HoraSpear.gif';
    }

    // Direct match by slug
    for (const [url, img] of Object.entries(sitemapImages)) {
      if (url.endsWith('/' + slug)) return img;
    }

    // Try keywords matching
    const keywords = cleanName.split(' ');
    const match = urlKeys.find(url => url.includes('/weapon/') && keywords.every(kw => url.includes(kw)));
    if (match) return sitemapImages[match];

    const fallbackMatch = urlKeys.find(url => url.includes('/weapon/') && url.includes(keywords[keywords.length - 1]));
    if (fallbackMatch) return sitemapImages[fallbackMatch];
  }

  // 5. Fallback to first sitemap image matching slug keyword
  const urlKeys = Object.keys(sitemapImages);
  const lastResort = urlKeys.find(url => url.includes(slug));
  if (lastResort) return sitemapImages[lastResort];

  // Return a sensible default icon if everything fails
  return 'https://rfdb.rfdatabase.net/wp-content/uploads/2022/07/item-1-6_359.png';
}



const rarities = [
  { id: 'D', mult: 1.0 },
  { id: 'C', mult: 1.2 },
  { id: 'B', mult: 1.5 },
  { id: 'A', mult: 2.0 },
  { id: 'S', mult: 3.0 },
  { id: 'SS', mult: 4.5 },
  { id: 'SSS', mult: 7.0 },
  { id: 'SR', mult: 10.0 },
  { id: 'SSR', mult: 15.0 },
  { id: 'UR', mult: 25.0 }
];

const getWepName = (race, lvl) => {
  if (race === 'acreton') {
    if (lvl <= 20) return 'Flame Thrower';
    if (lvl <= 40) return 'Grenade Launcher';
    if (lvl <= 60) return 'Missile Launcher';
    if (lvl <= 80) return 'Vulcan';
    return 'Cerberus';
  }
  if (race === 'belterra') {
    if (lvl <= 20) return 'Beam Bow';
    if (lvl <= 40) return 'Sniper Rifle';
    if (lvl <= 60) return 'Gatling Gun';
    if (lvl <= 80) return 'Laser Blaster';
    return 'Dark Hall';
  }
  if (race === 'coralis') {
    if (lvl <= 20) return 'Force Wand';
    if (lvl <= 40) return 'Arch Wand';
    if (lvl <= 60) return 'Relic Staff';
    if (lvl <= 80) return 'Soul Sickle';
    return 'Salamander';
  }
  return 'Greatsword';
}

const getArmName = (race, lvl) => {
  if (race === 'acreton') {
    if (lvl <= 20) return 'Launcher Armor';
    if (lvl <= 40) return 'Striker Frame';
    if (lvl <= 60) return 'Dreadnought Suit';
    if (lvl <= 80) return 'Legion Armor';
    return 'Titan Frame';
  }
  if (race === 'belterra') {
    if (lvl <= 20) return 'Ranger Suit';
    if (lvl <= 40) return 'Sniper Suit';
    if (lvl <= 60) return 'Commando Armor';
    if (lvl <= 80) return 'Hidden Suit';
    return 'Ghost Armor';
  }
  if (race === 'coralis') {
    if (lvl <= 20) return 'Summoner Robe';
    if (lvl <= 40) return 'Archon Robe';
    if (lvl <= 60) return 'Dark Robe';
    if (lvl <= 80) return 'Twilight Suit';
    return 'Eclipse Robe';
  }
  return 'Carbon Shield';
}

const getWepEmoji = (race) => race === 'acreton' ? '🚀' : race === 'belterra' ? '🔫' : race === 'coralis' ? '🔮' : '⚔️';
const getArmEmoji = (race) => race === 'acreton' ? '🦾' : race === 'belterra' ? '🧥' : race === 'coralis' ? '👘' : '🛡️';

const races = ['acreton', 'belterra', 'coralis', 'All'];

const items = [];

// Base materials
items.push({ id: 'mat_scrap', name: 'Titanium Scrap', emoji: '🔩', rarity: 'common', type: 'material', race: 'All', level: 1, bonus: {}, image: findItemImage('Titanium Scrap', 'material') });
items.push({ id: 'mat_carbon', name: 'Carbon Plate', emoji: '⚙️', rarity: 'uncommon', type: 'material', race: 'All', level: 10, bonus: {}, image: findItemImage('Carbon Plate', 'material') });
items.push({ id: 'mat_mecha', name: 'Mecha Core', emoji: '🔋', rarity: 'rare', type: 'material', race: 'All', level: 30, bonus: {}, image: findItemImage('Mecha Core', 'material') });
items.push({ id: 'mat_aether', name: 'Aether Crystal', emoji: '💎', rarity: 'epic', type: 'material', race: 'All', level: 50, bonus: {}, image: findItemImage('Aether Crystal', 'material') });
items.push({ id: 'mat_warlord', name: 'Warlord Seal', emoji: '🎖️', rarity: 'legendary', type: 'material', race: 'All', level: 80, bonus: {}, image: findItemImage('Warlord Seal', 'material') });
items.push({ id: 'raid_ticket', name: 'Sector Raid Ticket', emoji: '🎫', rarity: 'epic', type: 'consumable', race: 'All', level: 1, bonus: {}, description: 'Use this ticket to immediately summon a Pit Boss.', image: findItemImage('Sector Raid Ticket', 'consumable') });
items.push({ id: 'pot_hp', name: 'HP Potion [S]', emoji: '🧪', rarity: 'common', type: 'consumable', race: 'All', level: 1, bonus: {}, description: 'Restores 1000 HP instantly.', image: findItemImage('HP Potion', 'consumable') });
items.push({ id: 'pot_fp', name: 'FP Potion [S]', emoji: '🧪', rarity: 'common', type: 'consumable', race: 'All', level: 1, bonus: {}, description: 'Restores 500 FP instantly.', image: findItemImage('FP Potion', 'consumable') });
items.push({ id: 'ore_yellow', name: 'Yellow Ore', emoji: '🪨', rarity: 'uncommon', type: 'material', race: 'All', level: 10, bonus: {}, image: findItemImage('Yellow Ore', 'material') });
items.push({ id: 'ore_blue', name: 'Blue Ore', emoji: '🪨', rarity: 'uncommon', type: 'material', race: 'All', level: 20, bonus: {}, image: findItemImage('Blue Ore', 'material') });
items.push({ id: 'talic_ignorance', name: 'Ignorance Talic', emoji: '🔺', rarity: 'legendary', type: 'material', race: 'All', level: 40, bonus: {}, description: 'Used to upgrade weapons at the Hero.', image: findItemImage('Ignorance Talic', 'material') });
items.push({ id: 'talic_favor', name: 'Favor Talic', emoji: '🔻', rarity: 'legendary', type: 'material', race: 'All', level: 40, bonus: {}, description: 'Used to upgrade armors at the Hero.', image: findItemImage('Favor Talic', 'material') });

// Generate Weapons and Armors
const levels = [1, 10, 20, 30, 40, 50, 55, 60, 65, 70, 80, 90, 100];
levels.forEach(lvl => {
  const baseAtk = Math.max(10, lvl * 14);
  const baseDef = Math.max(5, lvl * 8);
  
  races.forEach(race => {
    rarities.forEach(r => {
      // Weapon
      items.push({
        id: `wep_${race}_${lvl}_${r.id}`,
        name: `[${r.id}] Lv.${lvl} ${getWepName(race, lvl)}`,
        emoji: getWepEmoji(race),
        rarity: r.id,
        type: 'weapon',
        race: race,
        level: lvl,
        bonus: { atk: Math.floor(baseAtk * r.mult) },
        image: findItemImage(getWepName(race, lvl) + ' Lv.' + lvl, 'weapon', race)
      });
      // Armor / Shield
      items.push({
        id: `arm_${race}_${lvl}_${r.id}`,
        name: `[${r.id}] Lv.${lvl} ${getArmName(race, lvl)}`,
        emoji: getArmEmoji(race),
        rarity: r.id,
        type: race === 'All' ? 'shield' : 'armor',
        race: race,
        level: lvl,
        bonus: { def: Math.floor(baseDef * r.mult) },
        image: findItemImage(getArmName(race, lvl) + ' Lv.' + lvl, race === 'All' ? 'shield' : 'armor', race)
      });
    });
  });
});

// Load and generate job weapons
const jobWeapons = require(path.join(__dirname, '../src/data/jobWeapons.json'));
Object.entries(jobWeapons).forEach(([race, list]) => {
  list.forEach(w => {
    const baseAtk = Math.floor((w.dmgMin + w.dmgMax) / 2);
    rarities.forEach(r => {
      items.push({
        id: `wep_job_${w.job}_${r.id}`,
        name: `[${r.id}] ${w.name}`,
        emoji: getWepEmoji(race),
        rarity: r.id,
        type: 'weapon',
        race: race,
        job: w.job,
        level: w.level,
        bonus: { atk: Math.floor(baseAtk * r.mult) },
        description: `Efek: ${w.effect} (Damage: ${w.dmgMin}-${w.dmgMax})`,
        image: findItemImage(w.name, 'weapon', race)
      });
    });
  });
});

// Add Archon Sets (Ultra Rare - UR, Level 55)
// Belterra — Solaris Sovereign Set
items.push({
  id: "archon_belterra_helmet",
  name: "Mahkota Solaris",
  emoji: "👑",
  rarity: "UR",
  type: "helmet",
  race: "belterra",
  level: 55,
  bonus: { hpPercent: 15, defPercent: 10 },
  image: "https://img.rfdatabase.net/items/ihbwd40.png"
});
items.push({
  id: "archon_belterra_mantle",
  name: "Jubah Solaris Regalia",
  emoji: "🧥",
  rarity: "UR",
  type: "mantle",
  race: "belterra",
  level: 55,
  bonus: { hpPercent: 10, description: "Aura meningkatkan HP pasukan sekitar." },
  image: "https://rfdb.rfdatabase.net/wp-content/uploads/2023/09/jetpackcombination.png"
});
items.push({
  id: "archon_belterra_armor",
  name: "Armor Helios Core",
  emoji: "🛡️",
  rarity: "UR",
  type: "armor",
  race: "belterra",
  level: 55,
  bonus: { defPercent: 20, description: "Resist status negatif." },
  image: "https://img.rfdatabase.net/items/iubwd40.png"
});
items.push({
  id: "archon_belterra_gloves",
  name: "Sarung Tangan Aether Drive",
  emoji: "🧤",
  rarity: "UR",
  type: "gloves",
  race: "belterra",
  level: 55,
  bonus: { atkPercent: 15, accPercent: 10 },
  image: "https://img.rfdatabase.net/items/igbwd40.png"
});
items.push({
  id: "archon_belterra_boots",
  name: "Sepatu Quantum Strider",
  emoji: "🥾",
  rarity: "UR",
  type: "boots",
  race: "belterra",
  level: 55,
  bonus: { speedPercent: 20 },
  image: "https://img.rfdatabase.net/items/isbwd40.png"
});
items.push({
  id: "archon_belterra_weapon",
  name: "Sunbreaker",
  emoji: "⚔️",
  rarity: "UR",
  type: "weapon",
  race: "belterra",
  level: 55,
  bonus: { atkPercent: 25, description: "Efek ledakan energi surya." },
  image: "https://rfdb.rfdatabase.net/wp-content/uploads/2021/03/Relic_Sword_Lv45_ManEater.gif"
});

// Coralis — Astral Ascendant Set
items.push({
  id: "archon_coralis_helmet",
  name: "Tiara Celestia",
  emoji: "👑",
  rarity: "UR",
  type: "helmet",
  race: "coralis",
  level: 55,
  bonus: { hpPercent: 15, defPercent: 10, description: "+15% Mana, +10% Magic Defense" },
  image: "https://img.rfdatabase.net/items/ihcwd40.png"
});
items.push({
  id: "archon_coralis_mantle",
  name: "Astral Veil",
  emoji: "🧥",
  rarity: "UR",
  type: "mantle",
  race: "coralis",
  level: 55,
  bonus: { description: "Aura regenerasi mana." },
  image: "https://rfdb.rfdatabase.net/wp-content/uploads/2025/05/ikcm002.png"
});
items.push({
  id: "archon_coralis_armor",
  name: "Robe of Eternal Stars",
  emoji: "🥋",
  rarity: "UR",
  type: "armor",
  race: "coralis",
  level: 55,
  bonus: { atkPercent: 20, description: "+20% Magic Power" },
  image: "https://img.rfdatabase.net/items/iucwd40.png"
});
items.push({
  id: "archon_coralis_gloves",
  name: "Gauntlet of Moondust",
  emoji: "🧤",
  rarity: "UR",
  type: "gloves",
  race: "coralis",
  level: 55,
  bonus: { description: "+15% Critical Magic" },
  image: "https://img.rfdatabase.net/items/igcwc40.png"
});
items.push({
  id: "archon_coralis_boots",
  name: "Boots of Lunar Path",
  emoji: "🥾",
  rarity: "UR",
  type: "boots",
  race: "coralis",
  level: 55,
  bonus: { description: "+20% Evasion" },
  image: "https://img.rfdatabase.net/items/iscwd40.png"
});
items.push({
  id: "archon_coralis_weapon",
  name: "Starfall Scepter",
  emoji: "🔮",
  rarity: "UR",
  type: "weapon",
  race: "coralis",
  level: 55,
  bonus: { atkPercent: 25, description: "Memanggil hujan meteor astral." },
  image: "https://rfdb.rfdatabase.net/wp-content/uploads/2020/06/Staff_Lv55_DarkStaff.gif"
});

// Acreton — Iron Dominion Set
items.push({
  id: "archon_acreton_helmet",
  name: "Helm Dominion Prime",
  emoji: "🪖",
  rarity: "UR",
  type: "helmet",
  race: "acreton",
  level: 55,
  bonus: { defPercent: 20 },
  image: "https://img.rfdatabase.net/items/ihawd40.png"
});
items.push({
  id: "archon_acreton_mantle",
  name: "Iron Dominion Mantle",
  emoji: "🧥",
  rarity: "UR",
  type: "mantle",
  race: "acreton",
  level: 55,
  bonus: { description: "Aura peningkatan damage pasukan." },
  image: "https://rfdb.rfdatabase.net/wp-content/uploads/2025/12/ikam001.png"
});
items.push({
  id: "archon_acreton_armor",
  name: "Titan Warframe Armor",
  emoji: "🦾",
  rarity: "UR",
  type: "armor",
  race: "acreton",
  level: 55,
  bonus: { hpPercent: 25, defPercent: 20 },
  image: "https://img.rfdatabase.net/items/iuawd40.png"
});
items.push({
  id: "archon_acreton_gloves",
  name: "Gauntlet of Annihilation",
  emoji: "🧤",
  rarity: "UR",
  type: "gloves",
  race: "acreton",
  level: 55,
  bonus: { atkPercent: 15 },
  image: "https://img.rfdatabase.net/items/igawd40.png"
});
items.push({
  id: "archon_acreton_boots",
  name: "Mag-Lev Assault Boots",
  emoji: "🥾",
  rarity: "UR",
  type: "boots",
  race: "acreton",
  level: 55,
  bonus: { speedPercent: 15, accPercent: 10 },
  image: "https://img.rfdatabase.net/items/isawd40.png"
});
items.push({
  id: "archon_acreton_weapon",
  name: "Oblivion Cannon",
  emoji: "🚀",
  rarity: "UR",
  type: "weapon",
  race: "acreton",
  level: 55,
  bonus: { atkPercent: 30, description: "Efek penetrasi armor." },
  image: "https://rfdb.rfdatabase.net/wp-content/uploads/2021/03/Relic_Firearm_Lv55_MetalElvenGattlingCannon.gif"
});

fs.writeFileSync(path.join(__dirname, '../src/data/items.json'), JSON.stringify({ items }, null, 2));

