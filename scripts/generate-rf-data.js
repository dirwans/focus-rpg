import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');

// ── ENEMIES & SECTORS GENERATOR ──────────────────────────────────────────────
const sectorsConfig = [
  { id: 1, name: "HQ Outpost", emoji: "🤖", mobs: ["Young Flem", "Wing", "Clod"], boss: "BULKY LUNKER", bossEmoji: "👹", mobEmojis: ["🦟", "🦇", "🐗"] },
  { id: 2, name: "Crag Mine", emoji: "💎", mobs: ["Mine Crawler", "Lazward Ward", "Mine Driller"], boss: "MINING REAVER", bossEmoji: "🌋", mobEmojis: ["🕷️", "🤖", "🐛"] },
  { id: 3, name: "Sette Desert", emoji: "🏜️", mobs: ["Sand Ingress", "Desert Demolith", "Desert Hummer"], boss: "DESERT PREDATOR", bossEmoji: "🐲", mobEmojis: ["🦂", "🗿", "🏜️"] },
  { id: 4, name: "Ether Platform", emoji: "❄️", mobs: ["Caliana Archer", "Caliana Atro", "Caliana Crew"], boss: "CALIANA PRINCESS", bossEmoji: "👑", mobEmojis: ["🧝‍♀️", "🧚", "🧜‍♀️"] },
  { id: 5, name: "Volcanic Cauldron", emoji: "🌋", mobs: ["Lava Ingress", "Infernal Demolith", "Volcano Chariot"], boss: "GREAT KURR", bossEmoji: "🔥", mobEmojis: ["🕷️", "🧱", "🛡️"] },
  { id: 6, name: "Elan Plateau", emoji: "⛰️", mobs: ["Plateau Scud", "Turncoat Ranger", "Turncoat Specialist"], boss: "DAGON INCARNATE", bossEmoji: "🐙", mobEmojis: ["🦖", "🏹", "🔧"] },
  { id: 7, name: "Beast Mountain", emoji: "🌲", mobs: ["Beast Fighter", "Mountain Crawler", "Beast Gargoyle"], boss: "BEAST KING", bossEmoji: "🦁", mobEmojis: ["🦧", "🦂", "🦅"] },
  { id: 8, name: "Outcast Land", emoji: "🍂", mobs: ["Outcast Warrior", "Outcast Sorcerer", "Lizardman Guard"], boss: "OUTCAST CHIEFTAIN", bossEmoji: "👑", mobEmojis: ["⚔️", "🔮", "🦎"] },
  { id: 9, name: "Bio Lab", emoji: "🧬", mobs: ["Mutant Soldier", "Lab Abomination", "Android Sentinel"], boss: "DR. FRANKEN", bossEmoji: "🥼", mobEmojis: ["🧟", "🧬", "🤖"] },
  { id: 10, name: "Titan Core", emoji: "💀", mobs: ["Dark Sentinel", "Void Reaper", "Star Devourer"], boss: "LORD DECEM", bossEmoji: "🌟", mobEmojis: ["🛡️", "💀", "🌌"] }
];

const enemies = {
  sectors: sectorsConfig.map((s, idx) => {
    const sLevel = s.id;
    return {
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      mobs: s.mobs.map((name, mobIdx) => {
        // Smooth logarithmic & exponential scaling matching original values
        const hp = Math.floor(80 * Math.pow(1.48, sLevel - 1) + (mobIdx * 30 * sLevel));
        const atk = Math.floor(7 * Math.pow(1.38, sLevel - 1) + (mobIdx * 2 * sLevel));
        const def = Math.floor(1.5 * Math.pow(1.5, sLevel - 1) + (mobIdx * sLevel));
        const expReward = Math.floor(10 * Math.pow(1.38, sLevel - 1) + (mobIdx * 2 * sLevel));
        const aniumReward = Math.floor(6 * Math.pow(1.4, sLevel - 1) + (mobIdx * 1.5 * sLevel));

        return {
          name,
          emoji: s.mobEmojis[mobIdx],
          hp,
          atk,
          def,
          expReward,
          aniumReward
        };
      }),
      boss: {
        name: s.boss,
        emoji: s.bossEmoji,
        hp: Math.floor(600 * Math.pow(1.4, sLevel - 1)),
        atk: Math.floor(20 * Math.pow(1.35, sLevel - 1)),
        def: Math.floor(8 * Math.pow(1.36, sLevel - 1)),
        expReward: Math.floor(80 * Math.pow(1.35, sLevel - 1)),
        aniumReward: Math.floor(60 * Math.pow(1.35, sLevel - 1))
      }
    };
  })
};

// ── ITEMS GENERATOR ─────────────────────────────────────────────────────────
const weapons = [
  // General
  { id: "novice_sword", name: "Novice Beam Saber", emoji: "⚔️", level: 1, rarity: "common", race: "All" },
  { id: "intense_blade", name: "Intense Blade", emoji: "⚔️", level: 15, rarity: "uncommon", race: "All" },
  { id: "leons_gunblade", name: "Leon's Gunblade", emoji: "🗡️", level: 40, rarity: "rare", race: "All" },
  { id: "relic_greatsword", name: "Relic Greatsword", emoji: "⚔️", level: 55, rarity: "epic", race: "All" },
  { id: "hora_spear", name: "Hora Spear", emoji: "🔱", level: 70, rarity: "epic", race: "All" },

  // Accretia (A)
  { id: "novice_launcher", name: "Novice Launcher", emoji: "🚀", level: 1, rarity: "common", race: "accretia" },
  { id: "intense_gatling", name: "Intense Gatling", emoji: "🔫", level: 25, rarity: "uncommon", race: "accretia" },
  { id: "doom_launcher", name: "Doom Launcher", emoji: "🚀", level: 40, rarity: "rare", race: "accretia" },
  { id: "relic_vulcan", name: "Relic Vulcan", emoji: "🔫", level: 55, rarity: "epic", race: "accretia" },
  { id: "archon_doom_blast", name: "Archon Doom Blast", emoji: "🚀", level: 70, rarity: "epic", race: "accretia" },

  // Bellato (B)
  { id: "novice_bow", name: "Novice Short Bow", emoji: "🏹", level: 1, rarity: "common", race: "bellato" },
  { id: "intense_composite_bow", name: "Intense Composite Bow", emoji: "🏹", level: 25, rarity: "uncommon", race: "bellato" },
  { id: "leons_gun_bow", name: "Leon's Gun Bow", emoji: "🏹", level: 40, rarity: "rare", race: "bellato" },
  { id: "saint_bow", name: "Saint Compound Bow", emoji: "🏹", level: 55, rarity: "epic", race: "bellato" },
  { id: "hora_crossbow", name: "Hora Heavy Crossbow", emoji: "🏹", level: 70, rarity: "epic", race: "bellato" },

  // Cora (C)
  { id: "novice_wand", name: "Novice Wand", emoji: "🔮", level: 1, rarity: "common", race: "cora" },
  { id: "intense_staff", name: "Intense Staff", emoji: "🔮", level: 25, rarity: "uncommon", race: "cora" },
  { id: "leons_scepter", name: "Leon's Divine Scepter", emoji: "🔮", level: 40, rarity: "rare", race: "cora" },
  { id: "darkray_staff", name: "Darkray Staff", emoji: "🔮", level: 55, rarity: "epic", race: "cora" },
  { id: "hora_scepter", name: "Hora Staff", emoji: "🔮", level: 70, rarity: "epic", race: "cora" }
];

const armors = [
  { id: "compound_shield", name: "Compound Shield", emoji: "🛡️", level: 15, rarity: "uncommon", race: "All" },
  { id: "defiance_shield", name: "Defiance Aegis Shield", emoji: "🛡️", level: 40, rarity: "rare", race: "All" },
  { id: "accretia_doom_frame", name: "Accretia Doom Frame", emoji: "🦾", level: 50, rarity: "rare", race: "accretia" },
  { id: "bellato_explorer_suit", name: "Bellato Scout Suit", emoji: "🧥", level: 50, rarity: "rare", race: "bellato" },
  { id: "cora_covenant_robe", name: "Cora Covenant Robe", emoji: "👘", level: 50, rarity: "rare", race: "cora" }
];

const materials = [
  { id: "carbon_plate", name: "Carbon Micro-Plate", emoji: "🔩", rarity: "common" },
  { id: "excelsior_black", name: "Excelsior Black Piece", emoji: "🔴", rarity: "rare" },
  { id: "excelsior_blue", name: "Excelsior Blue Piece", emoji: "🔵", rarity: "rare" },
  { id: "herodian_chip", name: "Herodian Control Chip", emoji: "🎛️", rarity: "epic" },
  { id: "red_stone", name: "Red Crystal Stone", emoji: "🧱", rarity: "epic" }
];

const consumables = [
  { id: "recovery_pot", name: "HQ Recovery Potion", emoji: "🧪", rarity: "consumable", hpBonus: 1000 },
  { id: "nano_repair_kit", name: "Nano Field Repair Kit", emoji: "🧰", rarity: "consumable", hpBonus: 3000 }
];

const itemsList = [];

// Process weapons
for (const w of weapons) {
  const rarityMultiplier = w.rarity === 'common' ? 1 : w.rarity === 'uncommon' ? 1.5 : w.rarity === 'rare' ? 2.5 : 4.5;
  const baseAtk = w.level * 4 + 10;
  itemsList.push({
    id: w.id,
    name: w.name,
    emoji: w.emoji,
    rarity: w.rarity,
    type: "weapon",
    race: w.race,
    level: w.level,
    bonus: {
      atk: Math.floor(baseAtk * rarityMultiplier)
    }
  });
}

// Process armors
for (const a of armors) {
  const rarityMultiplier = a.rarity === 'common' ? 1 : a.rarity === 'uncommon' ? 1.5 : a.rarity === 'rare' ? 2.2 : 3.8;
  const baseDef = a.level * 2.5 + 5;
  itemsList.push({
    id: a.id,
    name: a.name,
    emoji: a.emoji,
    rarity: a.rarity,
    type: a.id.includes('shield') ? "shield" : "armor",
    race: a.race,
    level: a.level,
    bonus: {
      def: Math.floor(baseDef * rarityMultiplier)
    }
  });
}

// Process materials
for (const m of materials) {
  itemsList.push({
    id: m.id,
    name: m.name,
    emoji: m.emoji,
    rarity: m.rarity,
    type: "material",
    race: "All",
    level: 1,
    bonus: {}
  });
}

// Process consumables
for (const c of consumables) {
  itemsList.push({
    id: c.id,
    name: c.name,
    emoji: c.emoji,
    rarity: c.rarity,
    type: "consumable",
    race: "All",
    level: 1,
    bonus: {
      hp: c.hpBonus
    }
  });
}

const items = { items: itemsList };

// ── SAVE TO FILES ───────────────────────────────────────────────────────────
writeFileSync(join(DATA_DIR, 'enemies.json'), JSON.stringify(enemies, null, 2));
console.log('Saved enemies.json');

writeFileSync(join(DATA_DIR, 'items.json'), JSON.stringify(items, null, 2));
console.log('Saved items.json');

console.log('Procedural RF Online Database generated successfully!');
