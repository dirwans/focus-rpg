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
  
  // 1. Direct match by slug
  for (const [url, img] of Object.entries(sitemapImages)) {
    if (url.endsWith('/' + slug)) return img;
  }

  // 2. Slot/Type specific fallbacks
  const urlKeys = Object.keys(sitemapImages);
  
  if (type === 'weapon') {
    // Look for weapon URL with name keywords
    const keywords = cleanName.split(' ');
    const match = urlKeys.find(url => url.includes('/weapon/') && keywords.every(kw => url.includes(kw)));
    if (match) return sitemapImages[match];
    
    // Generic weapon type fallback
    const fallbackMatch = urlKeys.find(url => url.includes('/weapon/') && url.includes(keywords[keywords.length - 1]));
    if (fallbackMatch) return sitemapImages[fallbackMatch];
  }
  
  if (type === 'shield') {
    const match = urlKeys.find(url => url.includes('/shield/') || (url.includes('/armor/') && url.includes('shield')));
    if (match) return sitemapImages[match];
  }
  
  if (type === 'helmet') {
    const rKey = race === 'acreton' ? 'accretia' : race === 'belterra' ? 'bellato' : race === 'coralis' ? 'cora' : '';
    let match = urlKeys.find(url => url.includes('/armor/') && (url.includes('helmet') || url.includes('cap') || url.includes('circlet')) && rKey && url.includes(rKey));
    if (!match) {
      match = urlKeys.find(url => url.includes('/armor/') && (url.includes('helmet') || url.includes('cap') || url.includes('circlet')));
    }
    if (match) return sitemapImages[match];
  }
  
  if (type === 'mantle') {
    const match = urlKeys.find(url => url.includes('/cloak/') || url.includes('mantle') || url.includes('cape') || url.includes('veil'));
    if (match) return sitemapImages[match];
  }
  
  if (type === 'armor') {
    const rKey = race === 'acreton' ? 'accretia' : race === 'belterra' ? 'bellato' : race === 'coralis' ? 'cora' : '';
    let match = urlKeys.find(url => url.includes('/armor/') && (url.includes('upper') || url.includes('suit') || url.includes('robe') || url.includes('frame') || url.includes('armor')) && rKey && url.includes(rKey));
    if (!match) {
      match = urlKeys.find(url => url.includes('/armor/') && (url.includes('upper') || url.includes('suit') || url.includes('robe') || url.includes('frame') || url.includes('armor')));
    }
    if (match) return sitemapImages[match];
  }
  
  if (type === 'gloves') {
    const rKey = race === 'acreton' ? 'accretia' : race === 'belterra' ? 'bellato' : race === 'coralis' ? 'cora' : '';
    let match = urlKeys.find(url => url.includes('/armor/') && (url.includes('gloves') || url.includes('gauntlet') || url.includes('hands')) && rKey && url.includes(rKey));
    if (!match) {
      match = urlKeys.find(url => url.includes('/armor/') && (url.includes('gloves') || url.includes('gauntlet') || url.includes('hands')));
    }
    if (match) return sitemapImages[match];
  }
  
  if (type === 'boots') {
    const rKey = race === 'acreton' ? 'accretia' : race === 'belterra' ? 'bellato' : race === 'coralis' ? 'cora' : '';
    let match = urlKeys.find(url => url.includes('/armor/') && (url.includes('boots') || url.includes('shoes') || url.includes('strider')) && rKey && url.includes(rKey));
    if (!match) {
      match = urlKeys.find(url => url.includes('/armor/') && (url.includes('boots') || url.includes('shoes') || url.includes('strider')));
    }
    if (match) return sitemapImages[match];
  }
  
  if (type === 'material' || type === 'consumable') {
    const keywords = cleanName.split(' ');
    const match = urlKeys.find(url => url.includes('/item/') && keywords.every(kw => url.includes(kw)));
    if (match) return sitemapImages[match];
  }

  // 3. Fallback to any sitemap image containing the item slug keyword
  const lastResort = urlKeys.find(url => url.includes(slug));
  if (lastResort) return sitemapImages[lastResort];

  return null;
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
        image: findItemImage(getWepName(race, lvl), 'weapon', race)
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
        image: findItemImage(getArmName(race, lvl), race === 'All' ? 'shield' : 'armor', race)
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
  image: findItemImage("Mahkota Solaris", "helmet", "belterra")
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
  image: findItemImage("Jubah Solaris Regalia", "mantle", "belterra")
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
  image: findItemImage("Armor Helios Core", "armor", "belterra")
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
  image: findItemImage("Sarung Tangan Aether Drive", "gloves", "belterra")
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
  image: findItemImage("Sepatu Quantum Strider", "boots", "belterra")
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
  image: findItemImage("Sunbreaker", "weapon", "belterra")
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
  image: findItemImage("Tiara Celestia", "helmet", "coralis")
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
  image: findItemImage("Astral Veil", "mantle", "coralis")
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
  image: findItemImage("Robe of Eternal Stars", "armor", "coralis")
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
  image: findItemImage("Gauntlet of Moondust", "gloves", "coralis")
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
  image: findItemImage("Boots of Lunar Path", "boots", "coralis")
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
  image: findItemImage("Starfall Scepter", "weapon", "coralis")
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
  image: findItemImage("Helm Dominion Prime", "helmet", "acreton")
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
  image: findItemImage("Iron Dominion Mantle", "mantle", "acreton")
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
  image: findItemImage("Titan Warframe Armor", "armor", "acreton")
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
  image: findItemImage("Gauntlet of Annihilation", "gloves", "acreton")
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
  image: findItemImage("Mag-Lev Assault Boots", "boots", "acreton")
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
  image: findItemImage("Oblivion Cannon", "weapon", "acreton")
});

fs.writeFileSync(path.join(__dirname, '../src/data/items.json'), JSON.stringify({ items }, null, 2));

