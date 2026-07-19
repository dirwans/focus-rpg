import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import enemies from '../data/enemies.json'
import upgradesConfig from '../data/upgrades.json'
import itemsDataRaw from '../data/items.json'
import arctronGears from '../data/arctron_gears.json'
import bionexGears from '../data/bionex_gears.json'
import celestraGears from '../data/celestra_gears.json'
import universalGears from '../data/universal_gears.json'

const itemsData = {
  items: [
    ...(itemsDataRaw.items || []),
    ...(itemsDataRaw.materials || []),
    ...arctronGears,
    ...bionexGears,
    ...celestraGears,
    ...universalGears
  ],
  materials: itemsDataRaw.materials || []
}

import archonData from '../data/archon.json'
import titlesData from '../data/titles.json'
import { getWeaponRarityBonus } from '../lib/rarity'
import { TRANSLATIONS } from '../lib/translationData'
import baseStatsData from '../data/baseStats.json'
import ascensionArmsData from '../data/ascensionArms.json'

function tStore(key, replacements = {}, playerState = null) {
  const language = playerState?.language || 'en'
  const dict = TRANSLATIONS[language] || TRANSLATIONS['en']
  let text = dict[key] || TRANSLATIONS['en'][key] || key
  Object.entries(replacements).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v)
  })
  return text
}


export function isStackableItem(item) {
  if (!item) return false
  const equipTypes = ['weapon', 'armor', 'shield', 'helmet', 'mantle', 'gloves', 'boots', 'pants', 'amulet', 'ring', 'ascension_arms']
  return !equipTypes.includes(item.type)
}

export function addToInventory(inventory, item, count = 1) {
  const newInv = [...inventory]

  if (!isStackableItem(item)) {
    // Defensive guard: never let the exact same uid land in the bag twice.
    // A genuine duplicate uid can only mean this exact item add already
    // happened (e.g. a double-fired unequip/sync), not two distinct items.
    if (item.uid && newInv.some((i) => i.uid === item.uid)) {
      return newInv
    }
    for (let i = 0; i < count; i++) {
      const uid = i === 0 && item.uid ? item.uid : Date.now() + Math.floor(Math.random() * 1000000)
      newInv.push({ ...item, uid, count: 1, qty: 1 })
    }
    return newInv
  }

  let remaining = count
  for (let i = 0; i < newInv.length; i++) {
    if (newInv[i].id === item.id) {
      const currentCount = newInv[i].count || newInv[i].qty || 1
      if (currentCount < 99) {
        const addable = 99 - currentCount
        const toAdd = Math.min(addable, remaining)
        newInv[i] = {
          ...newInv[i],
          count: currentCount + toAdd,
          qty: currentCount + toAdd
        }
        remaining -= toAdd
        if (remaining <= 0) break
      }
    }
  }

  while (remaining > 0) {
    const toAdd = Math.min(99, remaining)
    const uid = Date.now() + Math.floor(Math.random() * 1000000)
    newInv.push({
      ...item,
      uid,
      count: toAdd,
      qty: toAdd
    })
    remaining -= toAdd
  }

  return newInv
}

// Caster-lineage jobs (Celestra Mage + Summoner, Bionex Psion) use staffs instead of
// the default sword/axe — Arctron has no caster lineage, so it never matches here.
const STAFF_JOBS = [
  'mage', 'rune_caster', 'mystic', 'archmage',
  'oracle', 'celestial_oracle', 'conjurer', 'divine_summoner',
  'psion', 'esper', 'ascendant', 'transcendent',
  'arcanist'
]

// Ranger-lineage jobs (agility/ranged attacker) across all 3 factions use bows.
const BOW_JOBS = [
  'ranger', 'marksman', 'railgunner', 'annihilator',
  'revenant', 'deadeye', 'predator',
  'pathfinder', 'windrunner', 'shadow_hunter', 'stargazer'
]

// Warrior-lineage jobs across all 3 factions (used for bespoke armor-set art lookup).
const WARRIOR_JOBS = [
  'warrior', 'vanguard', 'juggernaut', 'dreadnought',
  'guardian', 'centurion', 'protector', 'imperator',
  'sentinel', 'warden', 'knight', 'blademaster'
]

// Technician/specialist-lineage jobs (used for bespoke armor-set art lookup).
const TECHNICIAN_JOBS = [
  'technician', 'architect', 'core_engineer', 'cybermancer',
  'mechanist', 'techmaster', 'overseer',
  'engineer'
]

// Which race+lineage combos have a bespoke 5-piece armor set illustrated so far.
// Extend this as more race/class armor sets get art — everything else falls
// through to `item.image` (no dedicated per-tier sprite).
const ARMOR_SET_LINEAGES = {
  arctron: ['warrior', 'ranger', 'technician'],
  bionex: ['guardian', 'marksman', 'psion'],
  celestra: ['warrior', 'ranger', 'mage']
}

// Resolves the sprite for a bespoke default armor-set piece (arctron/helmet/gloves/boots/pants),
// keyed by race + job lineage + level tier. Returns null if no bespoke set exists yet for
// that race/lineage — callers should fall back to `item.image` in that case.
// Shared by resolveArmorSetImage (below) and any battle-sprite folder resolution
// (ArctronBattleIdleSprite etc.) that needs to land in the exact same
// def_{lineage}_armor_set_lv{tier} bucket as the character's actual equipped-armor art.
export function getArmorSetLineageAndTier(playerRace, playerJob, level) {
  let lineage = WARRIOR_JOBS.includes(playerJob) ? 'warrior'
    : TECHNICIAN_JOBS.includes(playerJob) ? 'technician'
    : BOW_JOBS.includes(playerJob) ? 'ranger'
    : STAFF_JOBS.includes(playerJob) ? 'mage'
    : null
  if (playerRace === 'bionex') {
    if (lineage === 'warrior') lineage = 'guardian'
    else if (lineage === 'technician' || lineage === 'ranger') lineage = 'marksman'
    else if (lineage === 'mage') lineage = 'psion'
  }
  if (!lineage) return { lineage: null, tier: 1 }

  const lvl = level || 1
  let tier = 1
  if (playerRace === 'arctron') {
    tier = lvl >= 55 ? 55 : lvl >= 42 ? 42 : lvl >= 32 ? 32 : 1
  } else {
    tier = lvl >= 66 ? 66 : lvl >= 55 ? 55 : lvl >= 42 ? 42 : lvl >= 32 ? 32 : 1
  }
  return { lineage, tier }
}

function resolveArmorSetImage(slot, playerRace, playerJob, level, playerGender) {
  const { lineage, tier } = getArmorSetLineageAndTier(playerRace, playerJob, level)
  if (!lineage) return null
  const available = ARMOR_SET_LINEAGES[playerRace] || []
  if (!available.includes(lineage)) return null

  if (playerRace === 'bionex') {
    return `/assets/bionex/defbionex${lineage}lv${tier}${slot}.png?v=5`
  } else if (playerRace === 'celestra') {
    if (playerGender === 'male') {
      return `/assets/celestra/male/defcelestra${lineage}lv${tier}${slot}_male.png?v=14`
    }
    return `/assets/celestra/defcelestra${lineage}lv${tier}${slot}.png?v=14`
  }
  return `/assets/arctron/def_${lineage}_armor_set_lv${tier}/${slot}.png?v=12`
}

export function resolveItemImage(item, playerRace, playerJob, playerGender) {
  if (!item) return null
  if (item.id === 'tool_mining_pickaxe') {
    const race = playerRace || 'arctron'
    return `/assets/${race}/mining_tool_${race}_rembg.png`
  }
  if (item.id === 'tool_auto_mining') {
    const race = playerRace || 'arctron'
    return `/assets/${race}/auto_mining_tool_${race}.png`
  }
  const idStr = (item.id || '').toLowerCase();
  if (item.type === 'ring' || item.type === 'amulet' || idStr.startsWith('rng_') || idStr.startsWith('amu_')) {
    let race = 'all';
    if ((idStr.includes('_arc_') || idStr.includes('arctron')) && !idStr.includes('_cor_arc_')) race = 'arctron';
    else if (idStr.includes('_bio_') || idStr.includes('bionex')) race = 'bionex';
    else if (idStr.includes('_cor_') || idStr.includes('_cel_') || idStr.includes('celestra') || idStr.includes('cora')) race = 'celestra';
    
    let level = '0';
    const lastChar = idStr.substring(idStr.length - 1);
    if (['0','1','2','3','4'].includes(lastChar)) {
        level = lastChar;
    }
    
    if (idStr.includes('rng') || idStr.includes('ring') || item.type === 'ring') {
        if (race === 'all') return `/assets/accessories/rings/rng_all_${level}.png`;
        if (race === 'bionex') return `/assets/bionex/rings/rng_bio_${level}.png`;
        if (race === 'celestra') return `/assets/celestra/rings/rng_cor_${level}.png`;
        return `/assets/arctron/rings/rng_arc_${level}.png`;
    } else {
        if (race === 'all') return `/assets/accessories/amulets/amu_all_${level}.png`;
        if (race === 'celestra') return `/assets/celestra/amulets/amu_cor_${level}.png`;
        return `/assets/arctron/amulets/amu_arc_${level}.png`;
    }
  }
  if (item.type === 'shield' && item.id && item.id.startsWith('arm_All_')) {
    const lvl = item.level || 1
    const race = playerRace || 'arctron'

    if (race === 'bionex') {
      if (lvl >= 55) return '/assets/bionex/shields/lv55bionexshielddef.png?v=2'
      if (lvl >= 42) return '/assets/bionex/shields/lv42bionexshielddef.png?v=2'
      if (lvl >= 32) return '/assets/bionex/shields/lv32bionexshielddef.png?v=2'
      return '/assets/bionex/shields/lv1bionexshielddefault.png?v=2'
    } else if (race === 'celestra') {
      if (lvl >= 55) return '/assets/celestra/shields/lv55celesshielddef.png?v=2'
      if (lvl >= 42) return '/assets/celestra/shields/lv42celesshielddef.png?v=2'
      if (lvl >= 32) return '/assets/celestra/shields/lv32celesshielddef.png?v=2'
      return '/assets/celestra/shields/lv1celesshielddefault.png?v=2'
      // Arctron
      if (lvl >= 55) return '/assets/arctron/shields/lv55arctronshielddef.png?v=9'
      if (lvl >= 42) return '/assets/arctron/shields/lv42arctronshielddef.png?v=9'
      if (lvl >= 32) return '/assets/arctron/shields/lv32arctronshielddef.png?v=9'
      if (lvl >= 10) return '/assets/arctron/shields/lv10arctronshielddefault.png?v=10'
      return '/assets/arctron/shields/lv1arctronshielddefault.png?v=10'
    }
  }
  if (item.type === 'weapon') {
    let lvl = item.level || 1
    
    // Parse level from ID suffix if level is not explicitly defined (e.g. wpn_arc_war_3)
    if (!item.level && item.id) {
      const numMatch = idStr.match(/_(\d+)$/);
      if (numMatch) {
        const val = parseInt(numMatch[1], 10);
        if (val === 1 || val === 0) lvl = 1;
        else if (val === 30 || val === 32) lvl = 32;
        else if (val === 40 || val === 42) lvl = 42;
        else if (val === 50 || val === 55) lvl = 55;
        else if (val === 60 || val === 65 || val === 66) lvl = 66;
        else if (idStr.includes('war_') || idStr.includes('ran_') || idStr.includes('mys_') || idStr.includes('spe_')) {
          if (val === 2) lvl = 32;
          else if (val === 3) lvl = 42;
          else if (val === 4) lvl = 55;
          else if (val === 5) lvl = 66;
        }
      }
    }

    const isCaster = STAFF_JOBS.includes(playerJob) || idStr.includes('_psi_') || idStr.includes('_ora_') || (idStr.includes('_arc_') && !idStr.includes('_cor_arc_'))
    const seed = item.uid || (item.id ? item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0)

    if (isCaster) {
      const tier = lvl >= 55 ? '55' : (lvl >= 42 ? '42' : (lvl >= 32 ? '32' : '1'));
      if (tier === '1') {
        const index = (seed % 2) + 1;
        return `/assets/weapons/defbioncelestralv1staff${index}.png?v=2`;
      }
      return `/assets/weapons/defbioncelestralv${tier}staff.png?v=2`;
    }

    const isRanger = BOW_JOBS.includes(playerJob) || TECHNICIAN_JOBS.includes(playerJob) || idStr.includes('_ran_') || idStr.includes('_pat_') || idStr.includes('_mar_') || idStr.includes('_eng_')
    if (isRanger) {
      const weaponKind = playerRace === 'celestra' ? 'bow' : 'gun'
      const tier = lvl >= 55 ? '55' : (lvl >= 42 ? '42' : (lvl >= 32 ? '32' : '1'));
      const ver = weaponKind === 'bow' ? '3' : '2'
      return `/assets/weapons/defallfactionslv${tier}${weaponKind}.png?v=${ver}`
    }

    // Arctron warrior/technician exclusive special launcher at Lv.32+
    if (playerRace === 'arctron' && !idStr?.includes('war_') && !item.name?.toLowerCase().includes('blade') && !item.name?.toLowerCase().includes('edge')) {
      const tier = lvl >= 55 ? '55' : (lvl >= 42 ? '42' : (lvl >= 32 ? '32' : '1'));
      if (tier !== '1') {
        return `/assets/weapons/defarctronlv${tier}special.png?v=2`;
      }
    }

    const nameLower = (item.name || '').toLowerCase();
    const idLower = (item.id || '').toLowerCase();
    const isAxe = idLower.includes('axe') || idLower.includes('reaver') || idLower.includes('cleaver') || idLower.includes('scythe') || idLower.includes('hatchet') || nameLower.includes('axe') || nameLower.includes('reaver') || nameLower.includes('cleaver') || nameLower.includes('scythe');

    const tier = lvl >= 55 ? '55' : (lvl >= 42 ? '42' : (lvl >= 32 ? '32' : '1'));
    if (isAxe && tier !== '1') {
      return `/assets/weapons/defallfactionslv${tier}axe.png?v=2`
    }

    if (tier === '1') {
      const index = (seed % 4) + 1
      return `/assets/weapons/defallfactionslv1sword${index}.png?v=10`
    }
    return `/assets/weapons/defallfactionslv${tier}sword.png?v=10`
  }
  // Bespoke default armor-set pieces (id namespace `*_armorset_*`, e.g.
  // `armor_armorset_arctron_lv1`) resolve dynamically by race/job/level tier;
  // pre-existing per-race armor items (e.g. `arm_arctron_1_C`) are untouched.
  if (['armor', 'helmet', 'gloves', 'boots', 'pants'].includes(item.type) && item.id && item.id.includes('_armorset_')) {
    const bespoke = resolveArmorSetImage(item.type, playerRace, playerJob, item.level, playerGender)
    if (bespoke) return bespoke
  }
  if (item.type === 'ascension_arms') {
    // Bionex M.E.U. Attacker
    if (item.id === 'meu_atk_32') return '/assets/bionex/MEUattacklv32.png'
    if (item.id === 'meu_atk_42') return '/assets/bionex/MEUattacklv42.png'
    if (item.id === 'meu_atk_55') return '/assets/bionex/MEUattacklv55.png'
    if (item.id === 'meu_atk_65') return '/assets/bionex/MEUattacklv65.png'
    // Bionex M.E.U. Defender
    if (item.id === 'meu_def_32') return '/assets/bionex/MEUdevlv32.png'
    if (item.id === 'meu_def_42') return '/assets/bionex/MEUdevlv42.png'
    if (item.id === 'meu_def_55') return '/assets/bionex/MEUdevlv55.png'
    if (item.id === 'meu_def_65') return '/assets/bionex/MEUdevlv65.png'
    // Arctron A.R.E.S.
    if (item.id === 'ares_x') return '/assets/arctron/ARESlv32arctron.png'
    if (item.id === 'ares_nemesis') return '/assets/arctron/ARESlv42arctron.png'
    if (item.id === 'ares_dominator') return '/assets/arctron/ARESlv55arctron.png'
    if (item.id === 'ares_apocalypse') return '/assets/arctron/ARESlv65arctron.png'
    // Celestra Ancient Spirit - Seraphys
    if (item.id === 'spirit_seraphys_32') return '/assets/celestra/spirit_seraphys_32.png?v=4'
    if (item.id === 'spirit_seraphys_42') return '/assets/celestra/spirit_seraphys_42.png?v=4'
    if (item.id === 'spirit_seraphys_55') return '/assets/celestra/spirit_seraphys_55.png?v=4'
    if (item.id === 'spirit_seraphys_65') return '/assets/celestra/spirit_seraphys_65.png?v=4'
    // Celestra Ancient Spirit - Noctyrna
    if (item.id === 'spirit_noctyrna_32') return '/assets/celestra/spirit_noctyrna_32.png?v=4'
    if (item.id === 'spirit_noctyrna_42') return '/assets/celestra/spirit_noctyrna_42.png?v=4'
    if (item.id === 'spirit_noctyrna_55') return '/assets/celestra/spirit_noctyrna_55.png?v=7'
    if (item.id === 'spirit_noctyrna_65') return '/assets/celestra/spirit_noctyrna_65.png?v=17'
  }
  let imgPath = item.image;
  if (imgPath && typeof imgPath === 'string') {
    if (imgPath.startsWith('/assets/bionex/')) {
      imgPath = imgPath.replace('/assets/bionex/', '/assets/bionex/');
    } else if (imgPath.startsWith('/assets/celestra/')) {
      imgPath = imgPath.replace('/assets/celestra/', '/assets/celestra/');
    } else if (imgPath.startsWith('/assets/arctron/')) {
      imgPath = imgPath.replace('/assets/arctron/', '/assets/arctron/');
    }
  }

  // Force cache-buster for LV1 Arctron shield and weapon masterpieces if resolved via static path
  if (imgPath && typeof imgPath === 'string') {
    if (imgPath.includes('lv1arctronshielddefault.png') || imgPath.includes('defallfactionslv1sword')) {
      const base = imgPath.split('?')[0];
      return `${base}?v=10`;
    }
  }

  return imgPath;
}

export function verifyStarterShield(player) {
  if (!player || !player.race || player.level > 1) return player
  
  // Check if they already have any shield (checks equipment or inventory for shield item)
  const hasShield = !!(player.equipment?.shield || player.inventory.some(i => i.type === 'shield'))
  if (hasShield) return player

  // Generate starter shield
  let starterShield = null
  if (player.race === 'arctron') {
    starterShield = {
      uid: Date.now() + Math.floor(Math.random() * 100000),
      id: "arm_All_1_D",
      name: "[D] Lv.1 Arctron Bulwark",
      emoji: "🛡️",
      rarity: "D",
      type: "shield",
      race: "All",
      level: 1,
      bonus: { def: 12, hp: 120 },
      image: "/assets/arctron/shields/lv1arctronshielddefault.png",
      enhancement_level: 0
    }
  } else if (player.race === 'bionex') {
    starterShield = {
      uid: Date.now() + Math.floor(Math.random() * 100000),
      id: "arm_All_1_D",
      name: "[D] Lv.1 Bionex Shield",
      emoji: "🛡️",
      rarity: "D",
      type: "shield",
      race: "All",
      level: 1,
      bonus: { def: 12, hp: 120 },
      image: "/assets/bionex/shields/lv1bionexshielddefault.png",
      enhancement_level: 0
    }
  } else if (player.race === 'celestra') {
    starterShield = {
      uid: Date.now() + Math.floor(Math.random() * 100000),
      id: "arm_All_1_D",
      name: "[D] Lv.1 Celestra Aegis",
      emoji: "🛡️",
      rarity: "D",
      type: "shield",
      race: "All",
      level: 1,
      bonus: { def: 12, hp: 120 },
      image: "/assets/celestra/shields/lv1celesshielddefault.png",
      enhancement_level: 0
    }
  }

  if (starterShield) {
    const newInventory = [...(player.inventory || []), starterShield]
    return {
      ...player,
      inventory: newInventory
    }
  }
  return player
}

export function verifyStarterWeapon(player) {
  if (!player || !player.race || !player.job) return player

  const eq = player.equipment || {}
  if (eq.weapon) return player

  // If an old-style grant already left an unequipped weapon sitting in the bag,
  // equip that instead of minting a duplicate.
  const existingWeapon = (player.inventory || []).find((i) => i.type === 'weapon')
  if (existingWeapon) {
    return { ...player, equipment: { ...eq, weapon: existingWeapon } }
  }

  const isCaster = STAFF_JOBS.includes(player.job)
  const isRanger = BOW_JOBS.includes(player.job)
  const isTech = TECHNICIAN_JOBS.includes(player.job)

  // Default weapon: Greatsword (Melee Warrior)
  let starterWeaponId = "wep_All_1_D"

  if (player.race === 'arctron') {
    if (isRanger) {
      starterWeaponId = "wep_job_gunner_D"
    } else if (isTech) {
      starterWeaponId = "wep_arctron_1_D"
    }
  } else if (player.race === 'bionex') {
    if (isRanger) {
      starterWeaponId = "wep_bionex_1_D"
    } else if (isTech) {
      starterWeaponId = "wep_job_bionex_engineer_D"
    } else if (isCaster) {
      starterWeaponId = "wep_job_bionex_spiritualist_D"
    }
  } else if (player.race === 'celestra') {
    if (isCaster) {
      starterWeaponId = "wep_celestra_1_D"
    } else if (isRanger) {
      starterWeaponId = "wep_job_mystic_archer_D"
    }
  }

  const weaponDef = itemsData.items.find((it) => it.id === starterWeaponId)
  if (weaponDef) {
    const newWeapon = { ...weaponDef, uid: Date.now() + 99, enhancement_level: 0 }
    return {
      ...player,
      equipment: { ...eq, weapon: newWeapon }
    }
  }
  return player
}

// Auto-equips the Lv.1 bespoke armor-set (arctron/helmet/gloves/boots/pants) for a fresh
// character, if their race+job-lineage has one illustrated yet (see ARMOR_SET_LINEAGES).
// Mirrors verifyStarterShield but equips directly instead of just granting to inventory,
// since a brand-new character otherwise looks completely bare in the Gears tab.
export function verifyStarterArmorSet(player) {
  if (!player || !player.race || !player.job) return player

  let lineage = WARRIOR_JOBS.includes(player.job) ? 'warrior'
    : TECHNICIAN_JOBS.includes(player.job) ? 'technician'
    : BOW_JOBS.includes(player.job) ? 'ranger'
    : STAFF_JOBS.includes(player.job) ? 'mage'
    : null
  const isWarriorLineage = lineage === 'warrior'
  if (player.race === 'bionex') {
    if (lineage === 'warrior') lineage = 'guardian'
    else if (lineage === 'technician' || lineage === 'ranger') lineage = 'marksman'
    else if (lineage === 'mage') lineage = 'psion'
  }
  if (!lineage) return player
  const available = ARMOR_SET_LINEAGES[player.race] || []
  if (!available.includes(lineage)) return player

  const eq = player.equipment || {}
  const alreadyHasSet = ['armor', 'helmet', 'gloves', 'boots', 'pants'].some((slot) => eq[slot])
  if (alreadyHasSet) return player

  const slots = ['armor', 'helmet', 'gloves', 'boots', 'pants']
  const lineageInfix = isWarriorLineage ? '' : `${lineage}_`
  const newEquipment = { ...eq }
  let changed = false
  slots.forEach((slot, i) => {
    const itemDef = itemsData.items.find((it) => it.id === `${slot}_armorset_${player.race}_${lineageInfix}lv1`)
    if (itemDef) {
      if (slot === 'boots') {
        // Boots are a matched pair — both slots share the SAME item object/uid,
        // same as equipItem, so unequip returns exactly one item to the bag.
        const pairItem = { ...itemDef, uid: Date.now() + i, enhancement_level: 0 }
        newEquipment['boots_l'] = pairItem
        newEquipment['boots_r'] = pairItem
      } else if (slot === 'gloves') {
        const pairItem = { ...itemDef, uid: Date.now() + i, enhancement_level: 0 }
        newEquipment['gloves_l'] = pairItem
        newEquipment['gloves_r'] = pairItem
      } else {
        newEquipment[slot] = { ...itemDef, uid: Date.now() + i, enhancement_level: 0 }
      }
      changed = true
    }
  })
  if (!changed) return player
  return { ...player, equipment: newEquipment }
}

// Title/Achievement System: title is NOT a permanent unlock — it is derived live from the
// player's current PvP rank (#1/#2/#3 within their own race). Per the Title Qualification
// Database rules: separate per race, not permanent, switches automatically when rank changes,
// and is lost immediately (with its bonus) the moment the player drops out of the top 3.
export function getActiveTitle(player) {
  if (!player || !player.race || !player.pvpRank) return null
  const raceTitles = titlesData[player.race] || []
  return raceTitles.find((tt) => tt.pvpRank === player.pvpRank) || null
}

function removeFromInventory(inventory, uid, count = 1) {
  return inventory.filter((i) => i.uid !== uid)
}



function calcUpgradeCost(key, level) {
  const cfg = upgradesConfig[key]
  const lvl = level || 0
  return Math.floor(cfg.baseCost * Math.pow(cfg.costMultiplier, lvl))
}

function calcStat(key, upgradeLevel, raceId) {
  const cfg = upgradesConfig[key]
  const race = races[raceId]
  const lvl = upgradeLevel || 0
  const base = cfg.baseValue + cfg.perLevel * lvl
  if (!race) return base
  const multiplier = key === 'hp'
    ? race.bonuses.hpMultiplier
    : key === 'atk'
    ? race.bonuses.atkMultiplier
    : race.bonuses.defMultiplier
  return Math.floor(base * multiplier)
}

function getMinutesToNextLevel(level) {
  if (level <= 10) return 5
  if (level <= 20) return 10
  if (level <= 30) return 20
  if (level === 31) return 30
  if (level <= 41) {
    return 30 + (level - 31) * 15
  }
  if (level <= 54) return 480
  if (level <= 65) return 960
  return 1440
}

function getSector(level) {
  if (level <= 12) return 1
  if (level <= 25) return 2
  if (level <= 38) return 3
  if (level <= 52) return 4
  return 5
}

function randomMob(sectorIdx, isDungeon = false) {
  const sector = isDungeon ? enemies.dungeons[sectorIdx] : enemies.sectors[sectorIdx]
  const mobs = sector.mobs
  return mobs[Math.floor(Math.random() * mobs.length)]
}

function spawnEnemy(sectorIdx, playerLevel, isDungeon = false) {
  const sector = isDungeon ? enemies.dungeons[sectorIdx] : enemies.sectors[sectorIdx]

  if (isDungeon) {
    return { mob: sector.boss, isBoss: true, isCulprit: false, hp: sector.boss.hp }
  }

  // World Map
  const maxLevels = [12, 25, 38, 52, 66, 999]
  const isMaxLevelForMap = playerLevel === maxLevels[sectorIdx]

  if (isMaxLevelForMap) {
    const isCulprit = Math.random() < 0.20
    const targetBoss = sector.boss
    if (isCulprit) {
      const culpritBoss = {
        ...targetBoss,
        name: 'Culprit ' + targetBoss.name,
        hp: targetBoss.hp * 2,
        atk: targetBoss.atk * 2,
        expReward: targetBoss.expReward * 2,
        crdReward: targetBoss.crdReward * 2
      }
      return { mob: culpritBoss, isBoss: true, isCulprit: true, hp: culpritBoss.hp }
    }
    return { mob: targetBoss, isBoss: true, isCulprit: false, hp: targetBoss.hp }
  }

  const baseMob = randomMob(sectorIdx, false)
  const isElite = sectorIdx >= 4 && Math.random() < 0.15
  if (isElite) {
    const eliteMob = {
      ...baseMob,
      name: 'Elite ' + baseMob.name,
      hp: Math.floor(baseMob.hp * 1.5),
      atk: Math.floor(baseMob.atk * 1.5),
      expReward: Math.floor(baseMob.expReward * 1.5),
      crdReward: Math.floor(baseMob.crdReward * 1.5)
    }
    return { mob: eliteMob, isBoss: false, isCulprit: false, hp: eliteMob.hp }
  }

  const isCulprit = Math.random() < 0.20
  if (isCulprit) {
    const culpritMob = {
      ...baseMob,
      name: 'Culprit ' + baseMob.name,
      hp: baseMob.hp * 2,
      atk: baseMob.atk * 2,
      expReward: baseMob.expReward * 2,
      crdReward: baseMob.crdReward * 2
    }
    return { mob: culpritMob, isBoss: false, isCulprit: true, hp: culpritMob.hp }
  }

  return { mob: baseMob, isBoss: false, isCulprit: false, hp: baseMob.hp }
}

// Frac 0..1 deterministik dari seed integer (buat item drop yg sama di semua device)
function seededFrac(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function getDropTier(seed, mode, isStageBoss) {
  const r = seededFrac(seed)
  if (mode === 'gather') return 'material'
  if (isStageBoss) {
    if (r < 0.02) return 'SSS'
    if (r < 0.10) return 'SS'
    if (r < 0.30) return 'S'
    return 'A'
  }
  // Normal grind
  if (r < 0.00001) return 'UR'    // 0.001%
  if (r < 0.0001) return 'SSR'   // 0.01%
  if (r < 0.001) return 'SR'     // 0.1%
  if (r < 0.004) return 'SSS'    // 0.4%
  if (r < 0.015) return 'SS'     // 1.5%
  if (r < 0.08) return 'S'       // 8%
  if (r < 0.20) return 'A'       // 20%
  if (r < 0.40) return 'B'       // 40% (cumulative)
  if (r < 0.70) return 'C'       // 70%
  if (r < 0.95) return 'D'       // 95%
  return 'material'              // 5% fallback
}

// Reward DETERMINISTIK berdasar lama waktu + stats → semua device hitung sama
function computeRewards(player, stats, mode, minutes, selectedZone = 'world') {
  const race = races[player.race]
  if (!race) return { kills: 0, exp: 0, crd: 0 }
  const elapsedSec = Math.max(0, Math.floor(minutes * 60))
  const isDungeon = selectedZone && selectedZone.startsWith('dungeon_')

  if (isDungeon) {
    const dungeonIdx = parseInt(selectedZone.split('_')[1]) - 1
    const dungeon = enemies.dungeons[dungeonIdx]
    const boss = dungeon.boss
    const avgHp = boss.hp
    const avgDef = boss.def

    // Enemy passive abilities
    const bDodge     = (boss.dodge          || 0) / 100
    const bStun      = (boss.stun           || 0) / 100
    const bSelfHeal  = (boss.selfHeal        || 0) / 100
    const bDoubleHit = (boss.doubleHitChance || 0) / 100
    
    // Use actual stats from getStats()
    const group = getPlayerClassGroup(player.job, player.race)
    let activeAtk = stats.atk
    if (group === 'warrior') activeAtk = stats.meleeAtk
    else if (group === 'ranger') activeAtk = stats.rangedAtk
    else if (group === 'mage') activeAtk = stats.forceAtk
    else activeAtk = Math.max(stats.meleeAtk, stats.rangedAtk)

    // Calculate Hit Rate (vs 5% base enemy dodge)
    const hitRate = Math.max(0.05, Math.min(1.0, 0.95 - (stats.dodge || 0)))
    const critRate = Math.min(1.0, stats.crit || 0)
    const critMult = 1.0 + (critRate * 0.5)
    // Passive: dodge + stun reduce player DPS, selfHeal inflates effective HP
    const dps = Math.max(1, activeAtk - avgDef) * critMult * hitRate * (1 - bDodge) * (1 - bStun)
    const effectiveHp = avgHp * (1 + bSelfHeal / 2)
    const secPerKill = Math.max(2, effectiveHp / dps)
    const kills = Math.floor(elapsedSec / secPerKill)

    const baseCrdPerKill = dungeonIdx === 0 ? 3 : dungeonIdx === 1 ? 6 : 12
    let totalCreditsGained = 0
    for (let i = 0; i < kills; i++) {
      totalCreditsGained += Math.floor(baseCrdPerKill * (0.8 + seededFrac(minutes * 100 + i) * 0.4))
    }

    return {
      kills,
      exp: Math.floor(elapsedSec / 60),
      crd: totalCreditsGained
    }
  }

  if (mode === 'gather') {
    return {
      kills: 0,
      exp: Math.floor(elapsedSec / 60),
      crd: Math.floor(elapsedSec * 0.72 * race.bonuses.gatherMultiplier)
    }
  }
  const sectorIdx = (player.selectedMapIdx !== undefined && player.selectedMapIdx !== null)
    ? player.selectedMapIdx
    : (getSector(player.level) - 1)
  const mobs = enemies.sectors[sectorIdx].mobs
  const avg = (f) => mobs.reduce((a, m) => a + f(m), 0) / mobs.length
  let avgHp, avgDef, avgAni
  let avgDodge = 0, avgStun = 0, avgSelfHeal = 0, avgDoubleHit = 0
  const maxLevels = [12, 25, 38, 52, 66, 999]
  if (player.level === maxLevels[sectorIdx]) {
    const boss = enemies.sectors[sectorIdx].boss
    avgHp = boss.hp; avgDef = boss.def; avgAni = boss.crdReward
    avgDodge     = (boss.dodge          || 0) / 100
    avgStun      = (boss.stun           || 0) / 100
    avgSelfHeal  = (boss.selfHeal        || 0) / 100
    avgDoubleHit = (boss.doubleHitChance || 0) / 100
  } else {
    avgHp        = avg((m) => m.hp) * 1.2
    avgDef       = avg((m) => m.def)
    avgAni       = avg((m) => m.crdReward) * 1.2
    avgDodge     = avg((m) => (m.dodge          || 0)) / 100
    avgStun      = avg((m) => (m.stun           || 0)) / 100
    avgSelfHeal  = avg((m) => (m.selfHeal        || 0)) / 100
    avgDoubleHit = avg((m) => (m.doubleHitChance || 0)) / 100
  }
  
  // Use actual stats from getStats()
  const group = getPlayerClassGroup(player.job, player.race)
  let activeAtk = stats.atk
  if (group === 'warrior') activeAtk = stats.meleeAtk
  else if (group === 'ranger') activeAtk = stats.rangedAtk
  else if (group === 'mage') activeAtk = stats.forceAtk
  else activeAtk = Math.max(stats.meleeAtk, stats.rangedAtk)

  const hitRate = Math.max(0.05, Math.min(1.0, 0.95 - (stats.dodge || 0)))
  const critRate = Math.min(1.0, stats.crit || 0)
  const critMult = 1.0 + (critRate * 0.5)
  // Passive: dodge + stun reduce player DPS, selfHeal inflates effective HP
  const dps = Math.max(1, activeAtk - avgDef) * critMult * hitRate * (1 - avgDodge) * (1 - avgStun)
  const effectiveHp = avgHp * (1 + avgSelfHeal / 2)
  const secPerKill = Math.max(2, effectiveHp / dps)
  const kills = Math.floor(elapsedSec / secPerKill)

  let totalCrdGained = 0
  for (let i = 0; i < kills; i++) {
    totalCrdGained += Math.floor(avgAni)
  }

  // CRD per kill sesuai map level
  const MAP_CRD_RANGES = [
    [500, 1000],       // Map 1 Lv.1-12
    [1500, 3000],      // Map 2 Lv.13-25
    [4000, 8000],      // Map 3 Lv.26-38
    [10000, 18000],    // Map 4 Lv.39-52
    [20000, 35000],    // Map 5 Lv.53-66
  ]
  const crdRange = MAP_CRD_RANGES[Math.min(sectorIdx, 4)]
  let totalCreditsGained = 0
  for (let i = 0; i < kills; i++) {
    const frac = seededFrac(minutes * 100 + i + 77)
    totalCreditsGained += Math.floor(crdRange[0] + frac * (crdRange[1] - crdRange[0]))
  }

  return {
    kills,
    exp: Math.floor(elapsedSec / 60),
    crd: totalCrdGained + totalCreditsGained
  }
}

export function getPlayerClassGroup(jobId, raceId) {
  const job = jobId ? jobId.toLowerCase() : '';
  
  const warriors = [
    'sentinel', 'warden', 'knight', 'blademaster',
    'warrior', 'vanguard', 'juggernaut', 'dreadnought',
    'guardian', 'centurion', 'protector', 'imperator'
  ];
  const rangers = [
    'pathfinder', 'windrunner', 'shadow_hunter', 'stargazer',
    'ranger', 'marksman', 'railgunner', 'annihilator',
    'revenant', 'deadeye', 'predator'
  ];
  const mages = [
    'arcanist', 'rune_caster', 'mystic', 'archmage',
    'psion', 'esper', 'ascendant', 'transcendent'
  ];
  const specialists = [
    'oracle', 'celestial_oracle', 'conjurer', 'divine_summoner',
    'technician', 'architect', 'core_engineer', 'cybermancer',
    'engineer', 'mechanist', 'techmaster', 'overseer'
  ];

  if (warriors.includes(job)) return 'warrior';
  if (rangers.includes(job)) return 'ranger';
  if (mages.includes(job)) return 'mage';
  if (specialists.includes(job)) return 'specialist';
  
  return 'novice';
}
export function getKillsPerPT(level) {
  const lvl = level || 1
  if (lvl <= 10) return 100
  if (lvl <= 20) return 200
  if (lvl <= 30) return 350
  if (lvl <= 40) return 500
  if (lvl <= 50) return 700
  if (lvl <= 55) return 1000
  if (lvl <= 60) return 1500
  return 2000
}

export function getPTCaps(race, job, level) {
  const r = (race || '').toLowerCase()
  const group = getPlayerClassGroup(job, race)

  // Max PT cap at level group (from Image 1 table)
  const lvl = level || 1
  let maxPTAtLevel = 99
  if (lvl <= 10) maxPTAtLevel = 10
  else if (lvl <= 20) maxPTAtLevel = 20
  else if (lvl <= 30) maxPTAtLevel = 30
  else if (lvl <= 40) maxPTAtLevel = 45
  else if (lvl <= 50) maxPTAtLevel = 60
  else if (lvl <= 55) maxPTAtLevel = 75
  else if (lvl <= 60) maxPTAtLevel = 90
  else maxPTAtLevel = 99

  const caps = {
    melee: 99,
    range: 99,
    force: 99,
    shield: 99,
    defense: 99,
    special: 99,
    production: 99
  }

  // Set limits based on class group
  if (group === 'warrior') {
    caps.melee = 99
    caps.defense = 99
    caps.shield = 99
    caps.range = 30
    caps.force = 30
    caps.special = 10
    caps.production = 50
  } else if (group === 'ranger') {
    caps.range = 99
    caps.defense = 80
    caps.melee = 30
    caps.shield = 30
    caps.force = 30
    caps.special = 10
    caps.production = 50
  } else if (group === 'mage') {
    caps.force = 99
    caps.defense = 60
    caps.melee = 10
    caps.range = 10
    caps.shield = 10
    caps.special = 50
    caps.production = 30
  } else if (group === 'specialist') {
    caps.special = 99
    caps.defense = 80
    caps.melee = 50
    caps.range = 50
    caps.shield = 50
    caps.force = 50
    caps.production = 99
  } else {
    // Novice
    caps.melee = 30
    caps.range = 30
    caps.defense = 30
    caps.shield = 30
    caps.force = 30
    caps.special = 10
    caps.production = 30
  }

  // Arctron has no Force or Summon (Special)
  if (r === 'arctron') {
    caps.force = 0
    caps.special = 0
  }

  // Apply level scaling to caps
  return {
    melee: Math.min(caps.melee, maxPTAtLevel),
    range: Math.min(caps.range, maxPTAtLevel),
    force: Math.min(caps.force, maxPTAtLevel),
    shield: Math.min(caps.shield, maxPTAtLevel),
    defense: Math.min(caps.defense, maxPTAtLevel),
    special: Math.min(caps.special, maxPTAtLevel),
    production: Math.min(caps.production, maxPTAtLevel),
  }
}

export function getInitialPT(race, job, level) {
  const caps = getPTCaps(race, job, level)
  return {
    melee: { val: Math.min(caps.melee, 1), pct: 0 },
    range: { val: Math.min(caps.range, 1), pct: 0 },
    force: { val: Math.min(caps.force, 1), pct: 0 },
    shield: { val: Math.min(caps.shield, 1), pct: 0 },
    defense: { val: Math.min(caps.defense, 1), pct: 0 },
    special: { val: Math.min(caps.special, 1), pct: 0 },
    production: { val: Math.min(caps.production, 1), pct: 0 }
  }
}

export function advancePT(ptState, mode, minutes, race, job, level, hasShield, kills) {
  const caps = getPTCaps(race, job, level)
  const nextPt = { ...ptState }
  
  const rates = {
    melee: 0.5,
    range: 0.5,
    force: 0.5,
    shield: 0.5,
    defense: 0.5,
    special: 0.5,
    production: 1.0
  }

  const group = getPlayerClassGroup(job, race)

  if (mode === 'fight') {
    if (group === 'warrior') {
      rates.melee = 5.0
      rates.defense = 3.0
      rates.shield = hasShield ? 4.0 : 1.0
    } else if (group === 'ranger') {
      rates.range = 5.0
      rates.defense = 2.0
    } else if (group === 'mage') {
      rates.force = 5.0
      rates.defense = 1.5
    } else if (group === 'specialist') {
      rates.special = 4.0
      rates.defense = 2.0
      rates.shield = hasShield ? 3.0 : 1.0
    } else {
      rates.melee = 2.0
      rates.range = 2.0
      rates.defense = 2.0
    }
  } else {
    // Gather / Crafting mode
    if (group === 'specialist') {
      rates.production = 8.0
    } else {
      rates.production = 3.0
    }
  }

  // Disable force/special for arctron
  if (race === 'arctron') {
    rates.force = 0
    if (group !== 'specialist') {
      rates.special = 0
    }
  }

  const actions = mode === 'fight' ? (kills || 0) : Math.max(0, Math.floor(minutes * 15))
  const requiredActions = getKillsPerPT(level)

  const logs = []
  const ptLabels = {
    melee: 'Close Range PT',
    range: 'Long Range PT',
    force: 'Force PT',
    shield: 'Shield PT',
    defense: 'Defense PT',
    special: 'Race Special PT',
    production: 'Production PT'
  }

  Object.keys(ptLabels).forEach((key) => {
    const cap = caps[key] || 0
    if (cap <= 0) {
      nextPt[key] = { val: 0, pct: 0 }
      return
    }

    const current = ptState?.[key] || { val: 1, pct: 0 }
    if (current.val >= cap) {
      nextPt[key] = { val: cap, pct: 0 }
      return
    }

    const rate = rates[key] || 0.5
    const addedPct = (100 / requiredActions) * rate * actions
    let newPct = current.pct + addedPct
    let newVal = current.val
    let levelsGained = 0

    while (newPct >= 100 && newVal < cap) {
      newPct -= 100
      newVal += 1
      levelsGained += 1
    }

    if (newVal >= cap) {
      newVal = cap
      newPct = 0
    }

    nextPt[key] = { val: newVal, pct: parseFloat(newPct.toFixed(2)) }

    if (levelsGained > 0) {
      logs.push(`${ptLabels[key]} Up! Level ${newVal}/${cap} Pt`)
    }
  })

  return { nextPt, logs }
}

const initialPlayer = {
  name: 'PILOT #1',
  race: null,
  job: null,
  level: 1,
  exp: 0,
  pt: {
    melee: { val: 1, pct: 0 },
    range: { val: 1, pct: 0 },
    force: { val: 1, pct: 0 },
    shield: { val: 1, pct: 0 },
    defense: { val: 1, pct: 0 },
    special: { val: 1, pct: 0 },
    production: { val: 1, pct: 0 }
  },
  resources: { crd: 5000, potions: 5, nxc: 0 },
  upgrades: { atk: 0, def: 0, hp: 0 },
  equipment: { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves_l: null, gloves_r: null, boots_l: null, boots_r: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null },
  ascensionLoadout: { head: null, upper: null, lower: null, arms: null, arms2: null, options: null },
  celestraAnimus: {}, // e.g. { seraphys: 1, noctyrna: 5 }
  celestraAnimusUnseal: {}, // e.g. { seraphys: 32 }
  activeAnimus: null,
  sector: 1,
  highestSector: 1,
  streak: 0,
  lastSessionDate: null,
  inventory: [],
  friends: [],
  warehouse: [],             // Personal Warehouse inventory
  totalSessions: 0,
  totalMinutes: 0,
  savedAt: 0,
  language: 'en',
  settings: {
    autoHpPotion: 'OFF',
    autoFpPotion: 'OFF',
    autoSkill: false,
    autoLoot: false,
    alertWorldBoss: true,
    alertCoreWar: true,
    alertDungeon: true
  },
  combatStats: {
    totalMonsterKill: 0,
    dungeonClear: 0,
    worldBossKill: 0,
    coreWarVictory: 0,
    highestEnhancement: 0
  },
  guild: null, // { name: string, level: number, role: string, members: number }
  inventorySlots: 100,       // default 100, max 300 (upgrade +20 per 1M CRD)
  warehouseSlots: 200,       // default 200, max 600 (upgrade +50 per 2.5M CRD)
  dungeonAttempts: {         // daily dungeon entry counter — reset at 00:00 server
    '1': 0,                  // Echo Burrow: max 3/day
    '2': 0,                  // Infernal Forge: max 2/day
    '3': 0,                  // Trinity Core Chamber: max 1/day
    lastResetDate: ''
  },
  miningTimer: {
    state: 'idle',           // 'idle' | 'running' | 'completed'
    startedAt: 0,
    endsAt: 0,
    duration: 0              // in minutes
  },
  activeBoosts: {},          // { expBoost: {mult:2, expiresAt:ts}, dropBoost: {pct:5, expiresAt:ts}, atkPot: {pct:25, expiresAt:ts}, defPot: {pct:25, expiresAt:ts} }
  selectedMapIdx: null
}

const initialTimer = {
  selectedMinutes: 25,
  secondsLeft: 25 * 60,
  state: 'idle',   // idle | running | completed
  mode: 'fight',   // fight | gather
  startedAt: 0,    // epoch ms — sumber kebenaran countdown (sync antar device)
  endsAt: 0,       // epoch ms
  selectedZone: 'world', // world | dungeon_1 | dungeon_2 | dungeon_3
}

const initialBattle = {
  log: [],
  enemyHp: 0,
  enemyMaxHp: 0,
  playerHp: 0,
  playerMaxHp: 0,
  playerFp: 0,
  playerMaxFp: 0,
  playerSp: 0,
  playerMaxSp: 0,
  deaths: 0,
  respawnTicks: 0,
  currentMob: null,
  isBoss: false,
  isPitBoss: false,
  isCulprit: false,
  kills: 0,
  killStreak: 0,
  sessionExp: 0,
  sessionCrd: 0,
  sessionCredits: 0,
  levelUps: 0,
  activeSeconds: 0,      // seconds ticked while the screen was in foreground (Active Mode)
  totalTickSeconds: 0,   // total seconds ticked this session (foreground + background)
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      player: initialPlayer,
      timer: initialTimer,
      battle: initialBattle,
      archons: null,
      gearCoords: null,
      winnerRace: 'bionex', // Core War winner
      runnerUpRace: 'arctron',
      lastPlaceRace: 'celestra',
      screen: 'main',
      showRaceSelect: false,
      isScreenActive: true, // Idle/AFK System: true = Active Mode (screen in foreground), false = Idle Mode

      fetchGearCoords: async () => {
        try {
          const API_BASE = import.meta.env.VITE_API_URL || ''
          const res = await fetch(`${API_BASE}/api/game/gear_coords`)
          if (res.ok) {
            const data = await res.json()
            set({ gearCoords: data })
          }
        } catch (e) { console.error('Failed to fetch gear coords', e) }
      },

      // ── Navigation ──────────────────────────────────────
      setScreen: (screen) => set({ screen }),
      setArchons: (archons) => set({ archons }),
      setWinnerRace: (race) => set({ winnerRace: race }),
      setRunnerUpRace: (race) => set({ runnerUpRace: race }),
      setLastPlaceRace: (race) => set({ lastPlaceRace: race }),
      setScreenActive: (active) => set({ isScreenActive: active }),
      setNotification: (notif) => set({ notification: notif }),
      setSelectedMapIdx: (idx) => {
        set((s) => ({ player: { ...s.player, selectedMapIdx: idx, savedAt: Date.now() } }))
      },

      setPvpRank: (rank) => set((s) => ({ player: { ...s.player, pvpRank: rank, savedAt: Date.now() } })),

      // ── Legendary Crafting ───────────────────────────────
      craftLegendary: (recipeId) => {
        const { player } = get()
        const allItems = itemsData.items
        const RECIPES = {
          leg_weapon:  { base: 'mat_epic_weapon', shards: 6 },
          leg_armor:   { base: 'mat_epic_armor',  shards: 4 },
          leg_helmet:  { base: 'mat_epic_armor',  shards: 4 },
          leg_mantle:  { base: 'mat_epic_armor',  shards: 4 },
          leg_gloves:  { base: 'mat_epic_armor',  shards: 4 },
          leg_boots:   { base: 'mat_epic_armor',  shards: 4 },
          leg_shield:  { base: 'mat_epic_armor',  shards: 4 },
          leg_ring:    { base: 'mat_epic_ring',   shards: 5 },
          leg_amulet:  { base: 'mat_epic_amulet', shards: 5 },
          leg_cape:    { base: 'mat_epic_cape',   shards: 5 },
        }
        const recipe = RECIPES[recipeId]
        if (!recipe) return { ok: false, msg: 'Unknown recipe' }

        const inv = player.inventory

        // Check base material
        const baseCount = inv.filter(i => i.id === recipe.base).length
        if (baseCount < 1) return { ok: false, msg: 'Missing base material' }

        // Check shards (need recipe.shards * 5 of generic epic shard)
        const requiredShards = recipe.shards * 5
        const cnt = inv.filter(i => i.id === 'shard_epic').reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
        if (cnt < requiredShards) return { ok: false, msg: `Need ${requiredShards}x Epic Shard (E)` }

        // Consume ingredients
        let newInv = [...inv]
        // Remove 1 base
        const baseIdx = newInv.findIndex(i => i.id === recipe.base)
        newInv.splice(baseIdx, 1)
        
        // Remove shards using stack logic
        let remaining = requiredShards
        newInv = newInv.map(i => {
            if (i.id === 'shard_epic' && remaining > 0) {
                const current = i.count || i.qty || 1
                if (current > remaining) {
                    const updated = { ...i, count: current - remaining }
                    remaining = 0
                    return updated
                } else {
                    remaining -= current
                    return null // stack fully consumed
                }
            }
            return i
        }).filter(Boolean)

        // Add legendary output
        const outputDef = allItems.find(i => i.id === recipeId)
        if (!outputDef) return { ok: false, msg: 'Output item not found' }
        const uid = Date.now() + Math.floor(Math.random() * 10000)
        newInv.push({ ...outputDef, uid })

        set({ player: { ...player, inventory: newInv, savedAt: Date.now() } })
        return { ok: true, item: outputDef }
      },

      craftShard: (element, tier) => {
         const actualTier = tier || element;
         const { player, addToInventory } = get()
         const costCrd = actualTier === 'common' ? 10000 : actualTier === 'rare' ? 25000 : 50000;
         if (player.resources.crd < costCrd) return { ok: false, msg: 'Not enough CRD' }
         
         const reqOreId = `ore_${actualTier}`
         const targetShardId = `shard_${actualTier}`
         
         let totalOre = player.inventory.filter(i => i.id === reqOreId).reduce((s, i) => s + (i.count || i.qty || 1), 0)
         if (totalOre < 5) return { ok: false, msg: 'Need 5x Ore' }
         
         // deduct
         let newInv = [...player.inventory]
         let remainingToDeduct = 5
         newInv = newInv.map(i => {
             if (i.id === reqOreId && remainingToDeduct > 0) {
                 const current = i.count || i.qty || 1
                 if (current > remainingToDeduct) {
                     const updated = { ...i, count: current - remainingToDeduct }
                     remainingToDeduct = 0
                     return updated
                 } else {
                     remainingToDeduct -= current
                     return null // completely consume this stack
                 }
             }
             return i
         }).filter(Boolean)
         
         set({ player: { ...player, resources: { ...player.resources, crd: player.resources.crd - costCrd }, inventory: newInv, savedAt: Date.now() } })
         // Use addToInventory to properly stack the new shard
         const allItems = itemsData.items
         const shardDef = allItems.find(i => i.id === targetShardId)
         if(shardDef) {
             get().addToInventory({ ...shardDef, count: 1 })
         }
         return { ok: true, msg: 'Success' }
      },

      craftArcanite: (arcaniteType) => {
         const { player, addToInventory } = get()
         const costCrd = 100000;
         if (player.resources.crd < costCrd) return { ok: false, msg: 'Not enough CRD' }
         
         const recipes = {
             mat_arcanite_fury: [{id: 'shard_epic', req: 2}],
             mat_arcanite_ruin: [{id: 'shard_epic', req: 2}],
             mat_arcanite_spirit: [{id: 'shard_epic', req: 2}],
             mat_arcanite_vital: [{id: 'shard_epic', req: 2}],
             mat_arcanite_guard: [{id: 'shard_epic', req: 2}],
             mat_arcanite_precision: [{id: 'shard_epic', req: 2}],
             mat_arcanite_agility: [{id: 'shard_epic', req: 2}],
             mat_arcanite_focus: [{id: 'shard_epic', req: 2}],
         }
         const reqs = recipes[arcaniteType]
         if (!reqs) return { ok: false, msg: 'Unknown arcanite type' }
         
         // check reqs
         for (const r of reqs) {
            let total = player.inventory.filter(i => i.id === r.id).reduce((s, i) => s + (i.count || i.qty || 1), 0)
            if (total < r.req) return { ok: false, msg: `Need ${r.req}x ${r.id}` }
         }
         
         let newInv = [...player.inventory]
         for (const r of reqs) {
             let remaining = r.req
             newInv = newInv.map(i => {
                 if (i.id === r.id && remaining > 0) {
                     const current = i.count || i.qty || 1
                     if (current > remaining) {
                         const updated = { ...i, count: current - remaining }
                         remaining = 0
                         return updated
                     } else {
                         remaining -= current
                         return null
                     }
                 }
                 return i
             }).filter(Boolean)
         }
         
         set({ player: { ...player, resources: { ...player.resources, crd: player.resources.crd - costCrd }, inventory: newInv, savedAt: Date.now() } })
         const allItems = itemsData.items
         const arcDef = allItems.find(i => i.id === arcaniteType)
         if(arcDef) {
             get().addToInventory({ ...arcDef, count: 1 })
         }
         return { ok: true, msg: 'Success' }
      },

      // ── Set Shop: Buy Eminence/Vice Eminence/Council Items ─
      buySetItem: (itemId) => {
        const { player } = get()
        const allItems = itemsData.items
        const itemDef = allItems.find(i => i.id === itemId)
        if (!itemDef) return { ok: false, msg: 'Item not found' }
        const price = itemDef.price || 0
        if (player.resources.crd < price) return { ok: false, msg: 'CRD tidak cukup!' }
        const uid = Date.now() + Math.floor(Math.random() * 10000)
        set({ player: {
          ...player,
          resources: { ...player.resources, crd: player.resources.crd - price },
          inventory: [...player.inventory, { ...itemDef, uid }],
          savedAt: Date.now()
        }})
        return { ok: true, item: itemDef }
      },

      // ── NXC Premium Currency ─────────────────────────────
      addNxc: (amount) => set((s) => ({
        player: { ...s.player, resources: { ...s.player.resources, nxc: (s.player.resources.nxc || 0) + amount }, savedAt: Date.now() }
      })),

      // ── Premium Shop: Buy with NXC ───────────────────────
      buyPremiumItem: (itemId, nxcCost, meta) => {
        const { player } = get()
        const nxc = player.resources.nxc || 0
        if (nxc < nxcCost) return { ok: false, msg: 'NXC tidak cukup!' }

        const now = Date.now()
        let updates = { resources: { ...player.resources, nxc: nxc - nxcCost } }

        // Handle booster items
        if (meta?.type === 'exp_boost') {
          const current = player.activeBoosts?.expBoost
          const base = current && current.expiresAt > now ? current.expiresAt : now
          const boosts = { ...(player.activeBoosts || {}), expBoost: { mult: meta.mult, expiresAt: base + meta.days * 86400000 } }
          updates.activeBoosts = boosts
        } else if (meta?.type === 'drop_boost') {
          const current = player.activeBoosts?.dropBoost
          const base = current && current.expiresAt > now ? current.expiresAt : now
          const boosts = { ...(player.activeBoosts || {}), dropBoost: { pct: meta.pct, expiresAt: base + meta.days * 86400000 } }
          updates.activeBoosts = boosts
        } else if (meta?.type === 'atk_pot') {
          const boosts = { ...(player.activeBoosts || {}), atkPot: { pct: 25, expiresAt: now + 3 * 60000 } }
          updates.activeBoosts = boosts
        } else if (meta?.type === 'def_pot') {
          const boosts = { ...(player.activeBoosts || {}), defPot: { pct: 25, expiresAt: now + 3 * 60000 } }
          updates.activeBoosts = boosts
        } else if (meta?.type === 'mystery_box') {
          // Add mystery box to inventory
          const uid = Date.now() + Math.floor(Math.random() * 10000)
          const boxItem = { id: itemId, name: meta.name, emoji: '📦', rarity: 'epic', type: 'consumable', race: 'All', level: 1, bonus: {}, uid, description: meta.name }
          updates.inventory = addToInventory(player.inventory || [], boxItem, 1)
        } else if (meta?.type === 'rename_card') {
          const uid = Date.now() + Math.floor(Math.random() * 10000)
          const card = { id: 'rename_card', name: 'Character Rename Card', emoji: '📛', rarity: 'legendary', type: 'consumable', race: 'All', level: 1, bonus: {}, uid, description: 'Allows you to change your character name.' }
          updates.inventory = addToInventory(player.inventory || [], card, 1)
        } else if (meta?.type === 'rental') {
          // Add rental item with expiry
          const uid = Date.now() + Math.floor(Math.random() * 10000)
          const rentalItem = { id: itemId, name: meta.name, emoji: meta.emoji || '⏰', rarity: 'epic', type: meta.slot || 'weapon', race: 'All', level: 1, bonus: meta.bonus || { atk: 80 }, uid, isRental: true, rentalExpiresAt: now + meta.days * 86400000, description: `Rental — expires in ${meta.days} day(s)` }
          updates.inventory = addToInventory(player.inventory || [], rentalItem, 1)
        }

        set({ player: { ...player, ...updates, savedAt: Date.now() } })
        return { ok: true }
      },

      changeCharacterName: (newName, useCard = false) => {
        const { player } = get()
        if (!newName || newName.trim().length < 3) {
          return { ok: false, msg: 'Nama terlalu pendek (minimal 3 karakter)' }
        }
        const cleanedName = newName.trim()

        if (!useCard) {
          if (player.hasChangedName) {
            return { ok: false, msg: 'Ganti nama gratis sudah terpakai! Gunakan Rename Card.' }
          }
          set({
            player: {
              ...player,
              name: cleanedName,
              hasChangedName: true,
              savedAt: Date.now()
            }
          })
          return { ok: true }
        } else {
          const cardIdx = player.inventory.findIndex(i => i.id === 'rename_card')
          if (cardIdx === -1) {
            return { ok: false, msg: 'Kamu tidak memiliki Character Rename Card!' }
          }
          const newInv = [...player.inventory]
          const cardItem = newInv[cardIdx]
          const currentCount = cardItem.count || cardItem.qty || 1
          if (currentCount > 1) {
            newInv[cardIdx] = {
              ...cardItem,
              count: currentCount - 1,
              qty: currentCount - 1
            }
          } else {
            newInv.splice(cardIdx, 1)
          }
          set({
            player: {
              ...player,
              name: cleanedName,
              inventory: newInv,
              savedAt: Date.now()
            }
          })
          return { ok: true }
        }
      },

      addFriend: (username) => {
        const { player } = get()
        if (!username || username.trim().length === 0) return { ok: false, msg: 'Nama tidak boleh kosong!' }
        const cleanName = username.trim().replace(/^@/, '')
        if (cleanName.toLowerCase() === player.name?.toLowerCase()) {
          return { ok: false, msg: 'Tidak bisa menambahkan diri sendiri!' }
        }
        const friendsList = player.friends || []
        if (friendsList.length >= 100) {
          return { ok: false, msg: 'Daftar teman sudah penuh (maksimal 100)!' }
        }
        if (friendsList.some(f => f.username.toLowerCase() === cleanName.toLowerCase())) {
          return { ok: false, msg: `${cleanName} sudah ada di daftar teman!` }
        }

        const races = ['arctron', 'bionex', 'celestra']
        const jobsByRace = {
          arctron: ['Warrior', 'Ranger', 'Technician'],
          bionex: ['Guardian', 'Marksman', 'Engineer', 'Psion'],
          celestra: ['Sentinel', 'Pathfinder', 'Oracle', 'Arcanist']
        }
        const randomRace = races[Math.floor(Math.random() * races.length)]
        const jobs = jobsByRace[randomRace]
        const randomJob = jobs[Math.floor(Math.random() * jobs.length)]
        const randomLevel = Math.floor(Math.random() * 66) + 1

        const newFriend = {
          id: 'friend_' + Date.now() + Math.floor(Math.random() * 1000),
          username: cleanName,
          race: randomRace,
          job: randomJob,
          level: randomLevel,
          online: Math.random() > 0.3
        }

        set({
          player: {
            ...player,
            friends: [...friendsList, newFriend],
            savedAt: Date.now()
          }
        })
        return { ok: true }
      },

      removeFriend: (id) => {
        const { player } = get()
        const friendsList = player.friends || []
        set({
          player: {
            ...player,
            friends: friendsList.filter(f => f.id !== id),
            savedAt: Date.now()
          }
        })
        return { ok: true }
      },

      depositToWarehouse: (itemUid) => set((s) => {
        const { player } = s
        const inv = player.inventory || []
        const wh = player.warehouse || []
        const maxWh = player.warehouseSlots || 200

        const idx = inv.findIndex(i => i.uid === itemUid)
        if (idx === -1) return {}

        const item = inv[idx]
        const isStackable = isStackableItem(item)

        // Check slots capacity
        let canStack = false
        if (isStackable) {
          for (let i = 0; i < wh.length; i++) {
            if (wh[i].id === item.id && (wh[i].count || wh[i].qty || 1) < 99) {
              canStack = true
              break
            }
          }
        }

        if (!canStack && wh.length >= maxWh) {
          alert(`Warehouse penuh! Maksimal ${maxWh} slot.`)
          return {}
        }

        const newInv = [...inv]
        newInv.splice(idx, 1) // Remove from inventory

        // Add/Merge to warehouse
        let newWh = [...wh]
        if (isStackable) {
          let remaining = item.count || item.qty || 1
          // Try merging to existing non-full stacks
          for (let i = 0; i < newWh.length; i++) {
            if (newWh[i].id === item.id) {
              const currentCount = newWh[i].count || newWh[i].qty || 1
              if (currentCount < 99) {
                const addable = 99 - currentCount
                const toAdd = Math.min(addable, remaining)
                newWh[i] = {
                  ...newWh[i],
                  count: currentCount + toAdd,
                  qty: currentCount + toAdd
                }
                remaining -= toAdd
                if (remaining <= 0) break
              }
            }
          }
          // If still remaining, push new stack
          while (remaining > 0) {
            const toAdd = Math.min(99, remaining)
            newWh.push({
              ...item,
              uid: Date.now() + Math.floor(Math.random() * 1000000),
              count: toAdd,
              qty: toAdd
            })
            remaining -= toAdd
          }
        } else {
          newWh.push(item)
        }

        return {
          player: {
            ...player,
            inventory: newInv,
            warehouse: newWh,
            savedAt: Date.now()
          }
        }
      }),

      withdrawFromWarehouse: (itemUid) => set((s) => {
        const { player } = s
        const inv = player.inventory || []
        const wh = player.warehouse || []
        const maxInv = player.inventorySlots || 100

        const idx = wh.findIndex(i => i.uid === itemUid)
        if (idx === -1) return {}

        const item = wh[idx]
        const isStackable = isStackableItem(item)

        // Check slot capacity in inventory
        let canStack = false
        if (isStackable) {
          for (let i = 0; i < inv.length; i++) {
            if (inv[i].id === item.id && (inv[i].count || inv[i].qty || 1) < 99) {
              canStack = true
              break
            }
          }
        }

        if (!canStack && inv.length >= maxInv) {
          alert(`Inventory penuh! Maksimal ${maxInv} slot.`)
          return {}
        }

        const newWh = [...wh]
        newWh.splice(idx, 1) // Remove from warehouse

        // Add/Merge to inventory
        let newInv = [...inv]
        if (isStackable) {
          let remaining = item.count || item.qty || 1
          // Try merging to existing non-full stacks
          for (let i = 0; i < newInv.length; i++) {
            if (newInv[i].id === item.id) {
              const currentCount = newInv[i].count || newInv[i].qty || 1
              if (currentCount < 99) {
                const addable = 99 - currentCount
                const toAdd = Math.min(addable, remaining)
                newInv[i] = {
                  ...newInv[i],
                  count: currentCount + toAdd,
                  qty: currentCount + toAdd
                }
                remaining -= toAdd
                if (remaining <= 0) break
              }
            }
          }
          // If still remaining, push new stack
          while (remaining > 0) {
            const toAdd = Math.min(99, remaining)
            newInv.push({
              ...item,
              uid: Date.now() + Math.floor(Math.random() * 1000000),
              count: toAdd,
              qty: toAdd
            })
            remaining -= toAdd
          }
        } else {
          newInv.push(item)
        }

        return {
          player: {
            ...player,
            inventory: newInv,
            warehouse: newWh,
            savedAt: Date.now()
          }
        }
      }),

      upgradeInventorySlots: () => set((s) => {
        const { player } = s
        const currentSlots = player.inventorySlots || 100
        const crd = player.resources.crd || 0
        const upgradeCost = 1000000

        if (currentSlots >= 300) {
          alert("Inventory sudah mencapai batas maksimum (300 slot)!")
          return {}
        }
        if (crd < upgradeCost) {
          alert(`CRD tidak cukup! Membutuhkan ${upgradeCost.toLocaleString()} CRD.`)
          return {}
        }

        return {
          player: {
            ...player,
            inventorySlots: currentSlots + 20,
            resources: {
              ...player.resources,
              crd: crd - upgradeCost
            },
            savedAt: Date.now()
          }
        }
      }),

      upgradeWarehouseSlots: () => set((s) => {
        const { player } = s
        const currentSlots = player.warehouseSlots || 200
        const crd = player.resources.crd || 0
        const upgradeCost = 2500000

        if (currentSlots >= 600) {
          alert("Warehouse sudah mencapai batas maksimum (600 slot)!")
          return {}
        }
        if (crd < upgradeCost) {
          alert(`CRD tidak cukup! Membutuhkan ${upgradeCost.toLocaleString()} CRD.`)
          return {}
        }

        return {
          player: {
            ...player,
            warehouseSlots: currentSlots + 50,
            resources: {
              ...player.resources,
              crd: crd - upgradeCost
            },
            savedAt: Date.now()
          }
        }
      }),
      startMining: (durationMinutes) => set((s) => {
        const { player } = s
        const miningTimer = player.miningTimer || { state: 'idle', startedAt: 0, endsAt: 0, duration: 0 }
        if (miningTimer.state !== 'idle') {
          alert("Penambangan sedang berjalan!")
          return {}
        }
        return {
          player: {
            ...player,
            miningTimer: {
              state: 'running',
              startedAt: Date.now(),
              endsAt: Date.now() + durationMinutes * 60 * 1000,
              duration: durationMinutes
            },
            savedAt: Date.now()
          }
        }
      }),

      cancelMining: () => set((s) => {
        const { player } = s
        if (!window.confirm("Apakah Anda yakin ingin membatalkan penambangan? Semua progress akan hilang.")) return {}
        return {
          player: {
            ...player,
            miningTimer: {
              state: 'idle',
              startedAt: 0,
              endsAt: 0,
              duration: 0
            },
            savedAt: Date.now()
          }
        }
      }),

      claimMiningRewards: () => set((s) => {
        const { player, winnerRace, runnerUpRace, lastPlaceRace } = s
        const miningTimer = player.miningTimer || { state: 'idle', startedAt: 0, endsAt: 0, duration: 0 }
        if (miningTimer.state !== 'running') return {}
        if (Date.now() < miningTimer.endsAt) {
          alert("Penambangan belum selesai!")
          return {}
        }

        const duration = miningTimer.duration || 10
        let oreCount = 1
        if (duration === 10) {
          oreCount = 1 + Math.floor(Math.random() * 3)   // 1-3
        } else if (duration === 30) {
          oreCount = 3 + Math.floor(Math.random() * 3)   // 3-5
        } else if (duration === 60) {
          oreCount = 5 + Math.floor(Math.random() * 4)   // 5-8
        } else if (duration === 120) {
          oreCount = 8 + Math.floor(Math.random() * 5)   // 8-12
        } else if (duration === 240) {
          oreCount = 12 + Math.floor(Math.random() * 7)  // 12-18
        } else if (duration === 480) {
          oreCount = 20 + Math.floor(Math.random() * 11) // 20-30
        }

        // Faction rankings and grade bonuses
        const rankings = [winnerRace, runnerUpRace, lastPlaceRace]
        const playerRankIdx = rankings.indexOf(player.race)
        const bonus = playerRankIdx === 0 ? 5 : playerRankIdx === 1 ? 3 : 0
        const epicBonus = playerRankIdx === 0 ? 1 : 0

        // Probabilities per floor — base rates + faction rank bonus
        let pCommon = 100, pRare = 0, pEpic = 0
        if (duration === 10) {
          pCommon = 100 - bonus
          pRare   = Math.max(0, bonus - epicBonus)
          pEpic   = epicBonus
        } else if (duration === 30) {
          pCommon = 80 - bonus
          pRare   = 20 + bonus - epicBonus
          pEpic   = epicBonus
        } else if (duration === 60) {
          pCommon = 60 - bonus
          pRare   = 35 + bonus - epicBonus
          pEpic   = 5 + epicBonus
        } else if (duration === 120) {
          pCommon = 45 - bonus
          pRare   = 45 + bonus - epicBonus
          pEpic   = 10 + epicBonus
        } else if (duration === 240) {
          pCommon = 30 - bonus
          pRare   = 50 + bonus - epicBonus
          pEpic   = 20 + epicBonus
        } else if (duration === 480) {
          pCommon = 15 - bonus
          pRare   = 35 + bonus - epicBonus
          pEpic   = 50 + epicBonus
        }

        let newInventory = [...player.inventory]
        const invSlots = player.inventorySlots || 100
        const mailbox = player.mailbox ? [...player.mailbox] : []

        let claimedOres = []
        let mailCount = 0

        for (let i = 0; i < oreCount; i++) {
          const roll = Math.random() * 100
          let grade = 'common'
          if (roll < pEpic) {
            grade = 'epic'
          } else if (roll < pEpic + pRare) {
            grade = 'rare'
          }

          const itemId = `ore_${grade}`
          const itemTemplate = itemsData.items.find(it => it.id === itemId)
          if (!itemTemplate) continue

          const newItem = { ...itemTemplate }
          claimedOres.push(newItem)

          // Stacking check
          let canStack = false
          for (let s = 0; s < newInventory.length; s++) {
            if (newInventory[s].id === itemId && (newInventory[s].count || newInventory[s].qty || 1) < 99) {
              canStack = true
              break
            }
          }

          if (canStack || newInventory.length < invSlots) {
            newInventory = addToInventory(newInventory, newItem, 1)
          } else {
            const finalNewItem = { ...newItem, uid: Date.now() + i, count: 1, qty: 1 }
            mailbox.push({
              id: Math.random().toString(36).slice(2) + Date.now().toString(36),
              type: 'Mining Overflow',
              sender: 'Mining Station',
              subject: `Mining Overflow: ${newItem.name}`,
              body: `Bag Anda penuh (${invSlots}/${invSlots}) saat mengklaim hasil tambang. ORE ini telah dikirim ke Mailbox.`,
              item: finalNewItem,
              receivedAt: Date.now()
            })
            mailCount++
          }
        }

        const report = claimedOres.map(o => `${o.emoji} ${o.name}`).join(', ')
        alert(`🎉 Berhasil mengklaim hasil tambang!\n\nDidapatkan: ${report}${mailCount > 0 ? `\n\n⚠️ ${mailCount} Ore dikirim ke Mailbox karena bag penuh!` : ''}`)

        return {
          player: {
            ...player,
            inventory: newInventory,
            mailbox,
            miningTimer: {
              state: 'idle',
              startedAt: 0,
              endsAt: 0,
              duration: 0
            },
            savedAt: Date.now()
          }
        }
      }),

      processOreToShard: (recipeType, oreGrade) => set((s) => {
        const actualGrade = oreGrade || recipeType;
        const { player } = s
        const oreId = `ore_${actualGrade}`
        const shardId = `shard_${actualGrade}`

        const crdCost = actualGrade === 'common' ? 20000 : actualGrade === 'rare' ? 50000 : 100000
        const crd = player.resources.crd || 0

        if (crd < crdCost) {
          alert(`CRD tidak cukup! Membutuhkan ${crdCost.toLocaleString()} CRD.`)
          return {}
        }

        const oreCount = player.inventory
          .filter(it => it.id === oreId)
          .reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
        if (oreCount < 10) {
          alert(`Bahan tidak cukup! Membutuhkan 10 Ore sejenis (Milik Anda: ${oreCount}/10).`)
          return {}
        }

        const template = itemsData.items.find(it => it.id === shardId)
        if (!template) {
          alert("Resep tidak ditemukan.")
          return {}
        }

        // Consume 10 ores
        let needed = 10
        const newInv = []
        for (let i = 0; i < player.inventory.length; i++) {
          const it = player.inventory[i]
          if (it.id === oreId && needed > 0) {
            const currentCount = it.count || it.qty || 1
            if (currentCount <= needed) {
              needed -= currentCount
            } else {
              newInv.push({
                ...it,
                count: currentCount - needed,
                qty: currentCount - needed
              })
              needed = 0
            }
          } else {
            newInv.push(it)
          }
        }

        // Add 1 Shard
        const updatedInventory = addToInventory(newInv, template, 1)

        return {
          player: {
            ...player,
            inventory: updatedInventory,
            resources: {
              ...player.resources,
              crd: crd - crdCost
            },
            savedAt: Date.now()
          }
        }
      }),

      updateSettings: (newSettings) => set((s) => ({

        player: {
          ...s.player,
          settings: { ...(s.player.settings || { autoHpPotion: 'OFF', autoFpPotion: 'OFF', autoSkill: false, autoLoot: false, alertWorldBoss: true, alertCoreWar: true, alertDungeon: true }), ...newSettings },
          savedAt: Date.now()
        }
      })),

      // ── Race Selection ───────────────────────────────────
      openRaceSelect: () => set({ showRaceSelect: true }),
      closeRaceSelect: () => set({ showRaceSelect: false }),
      selectRace: (raceId) => {
        set((s) => ({
          showRaceSelect: false,
          player: {
            ...s.player,
            race: raceId,
            job: null,
            upgrades: { atk: 0, def: 0, hp: 0 },
            equipment: { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves_l: null, gloves_r: null, boots_l: null, boots_r: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null },
            ascensionLoadout: { head: null, upper: null, lower: null, arms: null, arms2: null, options: null },
  celestraAnimus: {}, // e.g. { seraphys: 1, noctyrna: 5 }
  celestraAnimusUnseal: {}, // e.g. { seraphys: 32 }
  activeAnimus: null,
            savedAt: Date.now(),
          },
        }))
      },

      // ── Job Promotion ────────────────────────────────────
      selectJob: (jobId) => {
        set((s) => ({
          player: {
            ...s.player,
            job: jobId,
            savedAt: Date.now(),
          },
        }))
      },

      reclassJob: (jobId, cost = 5000) => {
        set((s) => ({
          player: {
            ...s.player,
            job: jobId,
            resources: {
              ...s.player.resources,
              crd: Math.max(0, s.player.resources.crd - cost),
            },
            savedAt: Date.now(),
          },
        }))
      },


      // ── Timer ────────────────────────────────────────────
      setTimerMinutes: (min) => {
        const { timer } = get()
        if (timer.state === 'running') return
        set({ timer: { ...timer, state: 'idle', selectedMinutes: min, secondsLeft: min * 60 }, player: { ...get().player, savedAt: Date.now() } })
      },
      setMode: (mode) => {
        const { timer } = get()
        if (timer.state === 'running') return
        set({ timer: { ...timer, state: 'idle', mode }, player: { ...get().player, savedAt: Date.now() } })
      },
      setSelectedZone: (zone) => {
        const { timer } = get()
        if (timer.state === 'running') return
        set({ timer: { ...timer, state: 'idle', selectedZone: zone }, player: { ...get().player, savedAt: Date.now() } })
      },

      startTimer: () => {
        const { player, timer } = get()
        if (!player.race) { set({ showRaceSelect: true }); return }
        if (timer.state !== 'idle') return
        const now = Date.now()
        
        const isDungeon = timer.selectedZone && timer.selectedZone.startsWith('dungeon_')
        let sector, mob, isBoss, hp

        if (isDungeon) {
          const dungeonIdx = parseInt(timer.selectedZone.split('_')[1]) - 1
          const dungeonKey = String(dungeonIdx + 1)
          sector = enemies.dungeons[dungeonIdx]
          if (player.level < sector.minLevel) return

          // ── Daily Dungeon Entry Limit check ──
          const DUNGEON_MAX_DAILY = { '1': 3, '2': 2, '3': 1 }
          const today = new Date().toDateString()
          const attempts = player.dungeonAttempts || { '1': 0, '2': 0, '3': 0, lastResetDate: '' }
          const freshAttempts = attempts.lastResetDate !== today
            ? { '1': 0, '2': 0, '3': 0, lastResetDate: today }
            : attempts
          const currentCount = freshAttempts[dungeonKey] || 0
          const maxAllowed = DUNGEON_MAX_DAILY[dungeonKey] || 1
          if (currentCount >= maxAllowed) {
            alert(`⏰ Batas masuk Dungeon ${dungeonKey} hari ini sudah habis (${maxAllowed}x/hari). Reset jam 00:00 Server Time.`)
            return
          }
          // Increment counter
          const newAttempts = { ...freshAttempts, [dungeonKey]: currentCount + 1 }
          set({ player: { ...player, dungeonAttempts: newAttempts, savedAt: now } })

          const spawned = spawnEnemy(dungeonIdx, player.level, true)
          mob = spawned.mob
          isBoss = spawned.isBoss
          hp = spawned.hp
        } else {
          const sectorIdx = (player.selectedMapIdx !== undefined && player.selectedMapIdx !== null)
            ? player.selectedMapIdx
            : (getSector(player.level) - 1)
          sector = enemies.sectors[sectorIdx]
          const spawned = spawnEnemy(sectorIdx, player.level, false)
          mob = spawned.mob
          isBoss = spawned.isBoss
          hp = spawned.hp
        }

        const playerStats = get().getStats()
        const playerMaxHp = playerStats.hp
        const playerMaxFp = playerStats.fp
        const playerMaxSp = playerStats.sp
        set({
          timer: {
            ...timer,
            state: 'running',
            secondsLeft: timer.selectedMinutes * 60,
            startedAt: now,
            endsAt: now + timer.selectedMinutes * 60 * 1000,
          },
          player: { ...player, savedAt: now },
          battle: {
            ...initialBattle,
            log: [isBoss ? `⚠️ STAGE BOSS: ${mob.emoji} ${mob.name}!` : `⚔️ Entering ${sector.name}...`],
            enemyHp: hp,
            enemyMaxHp: hp,
            playerHp: playerMaxHp,
            playerMaxHp: playerMaxHp,
            playerFp: playerMaxFp,
            playerMaxFp: playerMaxFp,
            playerSp: playerMaxSp,
            playerMaxSp: playerMaxSp,
            currentMob: mob,
            isBoss,
            isCulprit: mob.name?.startsWith('Culprit') || false
          },
        })
      },

      stopTimer: () => {
        const { timer } = get()
        if (timer.state !== 'running') return
        const elapsedMin = Math.floor((timer.selectedMinutes * 60 - timer.secondsLeft) / 60)
        set((s) => ({
          timer: { ...s.timer, state: 'idle', secondsLeft: s.timer.selectedMinutes * 60, startedAt: 0, endsAt: 0 },
          player: { ...s.player, totalMinutes: s.player.totalMinutes + elapsedMin, savedAt: Date.now() },
          battle: { ...initialBattle },
        }))
      },

      tick: () => {
        const { timer, player, battle } = get()
        if (timer.state !== 'running') return
        const remaining = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000))
        if (remaining <= 0) { get().completeSession(); return }

        // Simulated Event Notifications (World Boss, Core War, Dungeon Reset)
        const settings = player.settings || {}
        if (get().isScreenActive && Math.random() < 0.005) {
          const alerts = []
          if (settings.alertWorldBoss) alerts.push('👹 World Boss: Pyraxis Overlord has spawned in Pyraxis Sanctum!')
          if (settings.alertCoreWar) alerts.push('⚔️ Core War: Zero Flux conflict starting in 5 minutes!')
          if (settings.alertDungeon) alerts.push('🔑 Daily Reset: Dungeon entry attempts have refreshed!')
          if (alerts.length > 0) {
            const randomAlert = alerts[Math.floor(Math.random() * alerts.length)]
            alert(randomAlert)
          }
        }

        // visual combat (cosmetic, lokal)
        if (timer.mode === 'fight') get()._combatTick()
        else get()._gatherTick()
        // reward DETERMINISTIK (sama di semua device) — override angka cosmetic
        const total = timer.selectedMinutes * 60
        const r = computeRewards(player, get().getStats(), timer.mode, (total - remaining) / 60, timer.selectedZone)

        // Apply death penalties
        const deaths = battle.deaths || 0
        const deathPenaltyExp = deaths * 15
        const deathPenaltyCrd = deaths * 30
        const deathPenaltyKills = deaths * 1

        // Idle/AFK System: Active Mode (screen in foreground) grants +10% EXP, applied
        // proportionally to how much of the session so far was spent in Active Mode.
        const totalTickSeconds = (battle.totalTickSeconds || 0) + 1
        const activeSeconds = (battle.activeSeconds || 0) + (get().isScreenActive ? 1 : 0)
        const activeFraction = totalTickSeconds > 0 ? activeSeconds / totalTickSeconds : 0
        const isExpBoostActive = player.activeBoosts?.expBoost && player.activeBoosts.expBoost.expiresAt > Date.now()
        const expBoostMult = isExpBoostActive ? player.activeBoosts.expBoost.mult : 1
        const expBonusMult = (1 + 0.10 * activeFraction) * expBoostMult

        const finalKills = Math.max(0, r.kills - deathPenaltyKills)
        const finalExp = Math.floor(Math.max(0, r.exp - deathPenaltyExp) * expBonusMult)
        const finalCrd = Math.max(0, r.crd - deathPenaltyCrd)

        set((s) => ({
          timer: { ...s.timer, secondsLeft: remaining },
          battle: {
            ...s.battle,
            kills: finalKills,
            sessionExp: finalExp,
            sessionCrd: finalCrd,
            activeSeconds,
            totalTickSeconds,
          },
        }))
      },

      _combatTick: () => {
        const { player, battle, timer } = get()
        
        // Initialize if state hasn't been set for combat yet
        if (!battle.currentMob) {
          const sectorIdx = getSector(player.level) - 1
          const { mob, isBoss, isPitBoss, hp } = spawnEnemy(sectorIdx, player.level)
          const playerStats = get().getStats()
          const playerMaxHp = playerStats.hp
          const playerMaxFp = playerStats.fp
          const playerMaxSp = playerStats.sp
          set({
            battle: {
              ...battle,
              currentMob: mob,
              isBoss,
              isPitBoss,
              isCulprit: mob.name?.startsWith('Culprit') || false,
              enemyHp: hp, 
              enemyMaxHp: hp, 
              playerHp: playerMaxHp, 
              playerMaxHp: playerMaxHp,
              playerFp: playerMaxFp,
              playerMaxFp: playerMaxFp,
              playerSp: playerMaxSp,
              playerMaxSp: playerMaxSp,
              deaths: 0,
              respawnTicks: 0
            } 
          })
          return
        }

        // Auto-initialize player HP and FP if they are missing or NaN in synced session
        if (!battle.playerHp || !battle.playerMaxHp || isNaN(battle.playerHp) || isNaN(battle.playerMaxHp)) {
          const playerStats = get().getStats()
          const playerMaxHp = playerStats.hp
          const playerMaxFp = playerStats.fp
          const playerMaxSp = playerStats.sp
          set({
            battle: {
              ...battle,
              playerHp: playerMaxHp,
              playerMaxHp: playerMaxHp,
              playerFp: battle.playerFp || playerMaxFp,
              playerMaxFp: playerMaxFp,
              playerSp: battle.playerSp || playerMaxSp,
              playerMaxSp: playerMaxSp
            }
          })
          return
        }

        let newLog = [...battle.log]
        
        // 1. Handle reboot / respawn countdown state
        if (battle.respawnTicks > 0) {
          const remainingTicks = battle.respawnTicks - 1
          if (newLog.length > 7) newLog = newLog.slice(-7)
          if (remainingTicks === 0) {
            const playerStats = get().getStats()
            const playerMaxHp = playerStats.hp
            const playerMaxFp = playerStats.fp
            const playerMaxSp = playerStats.sp
            newLog.push(`⚡ Systems online! Pilot ready for battle!`)
            set({ 
              battle: { 
                ...battle, 
                respawnTicks: 0, 
                playerHp: playerMaxHp, 
                playerMaxHp: playerMaxHp,
                playerFp: playerMaxFp,
                playerMaxFp: playerMaxFp,
                playerSp: playerMaxSp,
                playerMaxSp: playerMaxSp,
                log: newLog 
              } 
            })
          } else {
            newLog.push(`☠️ Pilot K.O. System rebooting... (${remainingTicks}s)`)
            set({ 
              battle: { 
                ...battle, 
                respawnTicks: remainingTicks, 
                log: newLog 
              } 
            })
          }
          return
        }

        // 2. Passive FP regeneration (RF Online style based on Race)
        let fpRegenRate = 12 // Default standard
        if (player.race === 'celestra') {
          fpRegenRate = 25 // Celestra: high magic affinity
        } else if (player.race === 'bionex') {
          fpRegenRate = 15 // Bellato: hybrid
        } else if (player.race === 'arctron') {
          fpRegenRate = 5  // Accretia: android, low natural flow
        }
        const playerMaxFp = battle.playerMaxFp || 200
        let nextPlayerFp = Math.min(playerMaxFp, (battle.playerFp ?? playerMaxFp) + fpRegenRate)

        // 3. Player attacks enemy turn
        const playerStats = get().getStats()
        const group = getPlayerClassGroup(player.job, player.race)
        let playerAtk = playerStats.atk
        if (group === 'warrior') {
          playerAtk = playerStats.meleeAtk
        } else if (group === 'ranger') {
          playerAtk = playerStats.rangedAtk
        } else if (group === 'mage') {
          playerAtk = playerStats.forceAtk
        } else {
          playerAtk = Math.max(playerStats.meleeAtk, playerStats.rangedAtk)
        }
        const mob = battle.currentMob
        
        let dmgToEnemy = 0
        let isCrit = false
        let isSkill = false
        const isEnemyDodge = Math.random() < 0.05 // Base 5% Dodge for enemy

        if (isEnemyDodge) {
          if (newLog.length > 7) newLog = newLog.slice(-7)
          newLog.push(`💨 MISS! Serangan ke ${mob.emoji} meleset (Dodge).`)
        } else {
          // Normal Attack Damage Formula
          isCrit = Math.random() < playerStats.crit
          let rawDmg = Math.max(1, playerAtk - mob.def)

          // Auto FP Potion logic
          if (player.settings?.autoFpPotion === 'ON' && nextPlayerFp < 50) {
            const fpPotIdx = player.inventory.findIndex(it => it.id === 'pot_fp')
            if (fpPotIdx !== -1) {
              nextPlayerFp = Math.min(playerMaxFp, nextPlayerFp + 2500)
              const newInv = [...player.inventory]
              const potItem = newInv[fpPotIdx]
              const currentCount = potItem.count || potItem.qty || 1
              if (currentCount > 1) {
                newInv[fpPotIdx] = {
                  ...potItem,
                  count: currentCount - 1,
                  qty: currentCount - 1
                }
              } else {
                newInv.splice(fpPotIdx, 1)
              }
              const sisa = newInv
                .filter(it => it.id === 'pot_fp')
                .reduce((sum, it) => sum + (it.count || it.qty || 1), 0)

              if (newLog.length > 7) newLog = newLog.slice(-7)
              newLog.push(`🧪 [Auto-Potion] FP Potion [S]! (+2,500 FP, Sisa: ${sisa})`)

              set({
                player: {
                  ...player,
                  inventory: newInv,
                  savedAt: Date.now()
                }
              })
            }
          }

          // Auto-Skill Logic
          let skillMultiplier = 0
          if (player.settings?.autoSkill && nextPlayerFp >= 40) {
            // Find job skill
            let pJob = null
            Object.values(jobs[player.race] || {}).forEach(tier => {
              if (Array.isArray(tier)) {
                const j = tier.find(x => x.id === player.job)
                if (j) pJob = j
              }
            })
            if (pJob && pJob.skills && pJob.skills.length > 0) {
              const skillDesc = pJob.skills[0].desc || ""
              const match = skillDesc.match(/(\d+)% ATK/)
              if (match) {
                skillMultiplier = parseInt(match[1]) / 100
                isSkill = true
                nextPlayerFp -= 40
              }
            }
          }

          if (isSkill) {
            rawDmg = Math.max(1, Math.floor(playerAtk * skillMultiplier) - mob.def)
            if (newLog.length > 7) newLog = newLog.slice(-7)
            newLog.push(`✨ [Skill Cast] Pilot melancarkan Skill! (${skillMultiplier*100}% ATK)`)
          }

          dmgToEnemy = isCrit ? Math.floor(rawDmg * 1.5) : rawDmg
        }
        let newEnemyHp = battle.enemyHp - dmgToEnemy
        if (newEnemyHp > 0 && mob.regen) {
          newEnemyHp = Math.min(battle.enemyMaxHp, newEnemyHp + mob.regen)
        }
        let nextMob = mob, nextIsBoss = battle.isBoss, nextMaxHp = battle.enemyMaxHp

        let nextPlayerHp = battle.playerHp
        if (player.equipment?.weapon?.specialProperty === 'vampire') {
          const lifesteal = Math.floor(dmgToEnemy * 0.10)
          const playerMaxHp = get().getStats().hp
          nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + lifesteal)
          if (newLog.length > 7) newLog = newLog.slice(-7)
          newLog.push(`🩸 Vampire! Menyedot +${lifesteal} HP dari ${mob.emoji} ${mob.name}!`)
        }

        // 4. Enemy attacks player turn
        let newDeaths = battle.deaths || 0
        let nextRespawnTicks = 0

        // Enemy action: 45% attack chance
        if (Math.random() < 0.45) {
          const performEnemyAttack = (isDouble = false) => {
            const enemyAtk = mob.atk || 5
            const playerDef = playerStats.def || 2
            
            let dmgToPlayer = 0
            const isPlayerDodge = Math.random() < playerStats.dodge
            const hasShield = !!player.equipment?.shield
            const isPlayerBlock = hasShield && (Math.random() < playerStats.blockRate)
            
            if (isPlayerDodge) {
              if (newLog.length > 7) newLog = newLog.slice(-7)
              newLog.push(`💨 MISS! ${isDouble ? '[Double Hit] ' : ''}Serangan ${mob.name} berhasil dihindari! (Dodge)`)
            } else {
              // Enemy crit chance scales by mob grade (Sector/Boss/Culprit)
              const enemyCritChance = mob.critical !== undefined ? (mob.critical / 100) : (battle.isBoss ? 0.18 : battle.isCulprit ? 0.14 : 0.08)
              const isEnemyCrit = Math.random() < enemyCritChance
              
              // Damage Formula: Final ATK - Final DEF
              let baseDmg = Math.max(1, enemyAtk - playerDef)
              let baseDmgPlayer = isEnemyCrit ? Math.floor(baseDmg * 1.5) : baseDmg

              // Apply Elemental Resist mitigation
              const avgResist = (playerStats.resistances.fire + playerStats.resistances.water + playerStats.resistances.earth + playerStats.resistances.wind) / 4
              baseDmgPlayer = Math.max(1, Math.floor(baseDmgPlayer * (1 - avgResist / 100)))
              
              if (isPlayerBlock) {
                // Block reduces final damage by 60%
                dmgToPlayer = Math.max(1, Math.floor(baseDmgPlayer * 0.40))
                if (newLog.length > 7) newLog = newLog.slice(-7)
                newLog.push(`🛡️ BLOCK! ${isDouble ? '[Double Hit] ' : ''}Tameng menahan serangan! Damage berkurang 60% (-${dmgToPlayer} Shield HP)`)
              } else {
                dmgToPlayer = baseDmgPlayer
                if (newLog.length > 7) newLog = newLog.slice(-7)
                if (isEnemyCrit) {
                  newLog.push(`💥 CRIT! ${isDouble ? '[Double Hit] ' : ''}${mob.emoji} ${mob.name} melancarkan serangan kritis! -${dmgToPlayer} Shield HP`)
                } else {
                  newLog.push(`💥 ${isDouble ? '[Double Hit] ' : ''}${mob.emoji} ${mob.name} menyerang Pilot! -${dmgToPlayer} Shield HP`)
                }
              }
            }
            
            nextPlayerHp = Math.max(0, nextPlayerHp - dmgToPlayer)
          }

          // First attack
          performEnemyAttack(false)

          // Check for double hit chance
          if (mob.doubleHitChance && Math.random() < (mob.doubleHitChance / 100)) {
            performEnemyAttack(true)
          }

          // --- DUAL AUTO-HEAL SYSTEM ---
          const playerMaxHp = battle.playerMaxHp || get().getStats().hp
          // Trigger heal only when health is critical (below 35%)
          if (nextPlayerHp > 0 && nextPlayerHp < playerMaxHp * 0.35) {
            const hasSkill = ['oracle', 'celestial_oracle', 'conjurer', 'divine_summoner', 'technician', 'architect', 'core_engineer', 'cybermancer', 'engineer', 'mechanist', 'techmaster', 'overseer'].includes(player.job)
            
            if (hasSkill) {
               if (nextPlayerFp >= 50) {
                 // Cast healing skill
                 nextPlayerFp -= 50
                 const healAmount = Math.floor(playerMaxHp * 0.35)
                 nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + healAmount)
                 
                 const skillName = ['technician', 'architect', 'core_engineer', 'cybermancer', 'engineer', 'mechanist', 'techmaster', 'overseer'].includes(player.job) ? 'Repair Matrix' : 'Spiritual Heal'
                 if (newLog.length > 7) newLog = newLog.slice(-7)
                 newLog.push(`✨ [Skill] Pilot menggunakan ${skillName}! (+${healAmount} HP, -50 FP)`)
              } else if (player.settings?.autoHpPotion === 'ON') {
                // Try fallback to potion if FP is empty
                const hpPotIdx = player.inventory.findIndex(it => it.id === 'pot_hp')
                if (hpPotIdx !== -1) {
                  const healAmount = 1000
                  nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + healAmount)
                  const newInv = [...player.inventory]
                  const potItem = newInv[hpPotIdx]
                  const currentCount = potItem.count || potItem.qty || 1
                  if (currentCount > 1) {
                    newInv[hpPotIdx] = {
                      ...potItem,
                      count: currentCount - 1,
                      qty: currentCount - 1
                    }
                  } else {
                    newInv.splice(hpPotIdx, 1)
                  }
                  const sisa = newInv
                    .filter(it => it.id === 'pot_hp')
                    .reduce((sum, it) => sum + (it.count || it.qty || 1), 0)

                  if (newLog.length > 7) newLog = newLog.slice(-7)
                  newLog.push(`🧪 [Auto-Potion] HP Potion [S]! (+1,000 HP, Sisa: ${sisa})`)

                  set({
                    player: {
                      ...player,
                      inventory: newInv,
                      savedAt: Date.now()
                    }
                  })
                } else if (player.resources.potions > 0) {
                  const healAmount = Math.floor(playerMaxHp * 0.30)
                  nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + healAmount)
                  const remainingPotions = Math.max(0, player.resources.potions - 1)
                  
                  if (newLog.length > 7) newLog = newLog.slice(-7)
                  newLog.push(`🧪 [Auto-Potion] Menggunakan Potion! (+${healAmount} Shield HP, Sisa: ${remainingPotions})`)
                  
                  set({
                    player: {
                      ...player,
                      resources: {
                        ...player.resources,
                        potions: remainingPotions
                      },
                      savedAt: Date.now()
                    }
                  })
                }
              }
            } else if (player.settings?.autoHpPotion === 'ON') {
              // Non-healer classes potion check
              const hpPotIdx = player.inventory.findIndex(it => it.id === 'pot_hp')
              if (hpPotIdx !== -1) {
                const healAmount = 1000
                nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + healAmount)
                const newInv = [...player.inventory]
                const potItem = newInv[hpPotIdx]
                const currentCount = potItem.count || potItem.qty || 1
                if (currentCount > 1) {
                  newInv[hpPotIdx] = {
                    ...potItem,
                    count: currentCount - 1,
                    qty: currentCount - 1
                  }
                } else {
                  newInv.splice(hpPotIdx, 1)
                }
                const sisa = newInv
                  .filter(it => it.id === 'pot_hp')
                  .reduce((sum, it) => sum + (it.count || it.qty || 1), 0)

                if (newLog.length > 7) newLog = newLog.slice(-7)
                newLog.push(`🧪 [Auto-Potion] HP Potion [S]! (+1,000 HP, Sisa: ${sisa})`)

                set({
                  player: {
                    ...player,
                    inventory: newInv,
                    savedAt: Date.now()
                  }
                })
              } else if (player.resources.potions > 0) {
                const healAmount = Math.floor(playerMaxHp * 0.30)
                nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + healAmount)
                const remainingPotions = Math.max(0, player.resources.potions - 1)
                
                if (newLog.length > 7) newLog = newLog.slice(-7)
                newLog.push(`🧪 [Auto-Potion] Menggunakan Potion! (+${healAmount} Shield HP, Sisa: ${remainingPotions})`)
                
                set({
                  player: {
                    ...player,
                    resources: {
                      ...player.resources,
                      potions: remainingPotions
                    },
                    savedAt: Date.now()
                  }
                })
              } else {
                if (newLog.length > 7) newLog = newLog.slice(-7)
                newLog.push(`⚠️ HP Potion habis!`)
              }
            }
          }

          if (nextPlayerHp <= 0) {
            newDeaths += 1
            nextRespawnTicks = 5
            if (newLog.length > 7) newLog = newLog.slice(-7)
            newLog.push(`☠️ Pilot K.O. oleh ${mob.emoji} ${mob.name}! Rebooting... (5s)`)
          }
        }

        // 5. Enemy defeat or Critical Hit updates
        if (nextRespawnTicks === 0) {
          if (newEnemyHp <= 0) {
            if (newLog.length > 7) newLog = newLog.slice(-7)
            newLog.push(battle.isBoss ? `🏆 STAGE BOSS SLAIN! ${mob.emoji}` : `⚔️ Killed ${mob.emoji} ${mob.name}`)

            const isDungeon = timer.selectedZone && timer.selectedZone.startsWith('dungeon_')
            const zoneIdx = isDungeon ? (parseInt(timer.selectedZone.split('_')[1]) - 1) : (getSector(player.level) - 1)
            const next = spawnEnemy(zoneIdx, player.level, isDungeon)

            nextMob = next.mob; nextIsBoss = next.isBoss; nextMaxHp = next.hp; newEnemyHp = next.hp
            if (next.isBoss) newLog.push(`⚠️ STAGE BOSS: ${next.mob.emoji} ${next.mob.name}!`)
          } else if (isCrit && !isEnemyDodge) {
            if (newLog.length > 7) newLog = newLog.slice(-7)
            newLog.push(`💥 CRIT! -${dmgToEnemy} ${mob.emoji}`)
          }
        } else {
          // Reset current enemy HP if player died
          newEnemyHp = battle.enemyMaxHp
        }

        set({ 
          battle: { 
            ...battle, 
            enemyHp: newEnemyHp, 
            enemyMaxHp: nextMaxHp, 
            currentMob: nextMob, 
            isBoss: nextIsBoss, 
            log: newLog,
            playerHp: nextPlayerHp,
            playerFp: nextPlayerFp,
            deaths: newDeaths,
            respawnTicks: nextRespawnTicks
          } 
        })
      },

      _gatherTick: () => {
        const { battle } = get()
        if (Math.random() > 0.82) {
          let newLog = [...battle.log]
          if (newLog.length > 7) newLog = newLog.slice(-7)
          newLog.push(`⛏️ Gathering resources...`)
          set({ battle: { ...battle, log: newLog } })
        }
      },

      completeSession: () => {
        const { player, timer, battle } = get()
        if (timer.state !== 'running') return // hindari double-complete (sudah completed via sync)

        const r = computeRewards(player, get().getStats(), timer.mode || 'fight', timer.selectedMinutes, timer.selectedZone)
        const today = new Date().toDateString()
        const isNewDay = player.lastSessionDate !== today
        const newStreak = isNewDay ? player.streak + 1 : player.streak

        // Apply death penalties
        const deaths = battle.deaths || 0
        const deathPenaltyExp = deaths * 2 // 2 minutes penalty per death
        const deathPenaltyCrd = deaths * 30
        const deathPenaltyKills = deaths * 1

        // Idle/AFK System: Active Mode (screen in foreground) grants +10% EXP and +5% Drop Rate,
        // scaled by the fraction of this session spent in Active Mode.
        const totalTickSeconds = battle.totalTickSeconds || 0
        const activeFraction = totalTickSeconds > 0 ? (battle.activeSeconds || 0) / totalTickSeconds : 0
        const isExpBoostActive = player.activeBoosts?.expBoost && player.activeBoosts.expBoost.expiresAt > Date.now()
        const expBoostMult = isExpBoostActive ? player.activeBoosts.expBoost.mult : 1
        const expBonusMult = (1 + 0.10 * activeFraction) * expBoostMult

        const isDropBoostActive = player.activeBoosts?.dropBoost && player.activeBoosts.dropBoost.expiresAt > Date.now()
        const dropBoostAdd = isDropBoostActive ? (player.activeBoosts.dropBoost.pct / 100) : 0
        const dropRateBonus = 0.05 * activeFraction + dropBoostAdd

        const finalKills = Math.max(0, r.kills - deathPenaltyKills)
        const finalExp = Math.floor(Math.max(0, r.exp - deathPenaltyExp) * expBonusMult)
        let finalCrd = Math.max(0, r.crd - deathPenaltyCrd)

        let newExp = player.exp + finalExp
        let newLevel = player.level
        let expToNext = getMinutesToNextLevel(newLevel)
        let levelUps = 0
        while (newExp >= expToNext && newLevel < 66) {
          newExp -= expToNext; newLevel += 1; levelUps += 1; expToNext = getMinutesToNextLevel(newLevel)
        }
        const newSector = getSector(newLevel)

        // Item drop deterministik berdasar sistem Rarity
        let newInventory = [...player.inventory]
        const invSlots = player.inventorySlots || 100
        const mailbox = player.mailbox ? [...player.mailbox] : []
        let dropLog = ''

        const pushOrMail = (item, logString, count = 1) => {
          let canStack = false
          if (isStackableItem(item)) {
            for (let s = 0; s < newInventory.length; s++) {
              if (newInventory[s].id === item.id && (newInventory[s].count || newInventory[s].qty || 1) < 99) {
                canStack = true
                break
              }
            }
          }
          if (canStack || newInventory.length < invSlots) {
            newInventory = addToInventory(newInventory, item, count)
            dropLog += logString
          } else {
            const finalItem = { ...item, count, qty: count }
            mailbox.push({
              id: Math.random().toString(36).slice(2) + Date.now().toString(36),
              type: 'Inventory Overflow',
              sender: 'Trade Commissioner',
              subject: `Bag Overflow: ${item.name}`,
              body: `Bag Anda penuh (${invSlots}/${invSlots}) saat menerima item dari grind session.\nItem ini telah dikirim ke Mailbox.`,
              item: finalItem,
              receivedAt: Date.now()
            })
            dropLog += logString + ' (📬 Ke Mailbox)'
          }
        }

        // Stage saat sesi berlangsung (untuk gate loot berdasar minStage)
        const fightSector = getSector(player.level)

        // Elite monster: 15% chance muncul di stage 5+ saat mode fight
        // Kalau ada elite → drop tier naik 1 level (seperti Stage Boss)
        const eliteRoll = seededFrac(timer.startedAt * 7 + 13)
        const killedElite = fightSector >= 5 && eliteRoll < 0.15 && finalKills > 0
        
        // Cek apakah boss mati (finalKills > 0)
        const killedStageBoss = battle.isBoss && finalKills > 0

        // Elite memperlakukan dirinya seperti Stage Boss untuk drop
        const effectiveStageBoss = killedStageBoss || killedElite

        if (killedElite) {
            dropLog += `\n⚡ ELITE MONSTER appeared! Bonus drop!`
        }

        // ────────────────────────────────────────────────────────────────
        // OFFICIAL DROP RATE SYSTEM
        // ────────────────────────────────────────────────────────────────
        const isDungeon = timer.selectedZone && timer.selectedZone.startsWith('dungeon_')
        const dungeonIdx = isDungeon ? parseInt(timer.selectedZone.split('_')[1]) - 1 : -1
        const killedBoss = killedStageBoss && finalKills > 0

        // Helper: random item from pool by type+rarity
        const pickItem = (rarity, seed) => {
          const pool = itemsData.items.filter(it =>
            (it.type === 'weapon' || it.type === 'armor' || it.type === 'shield' ||
             it.type === 'helmet' || it.type === 'mantle' || it.type === 'gloves' ||
             it.type === 'boots' || it.type === 'pants' || it.type === 'amulet' || it.type === 'ring') &&
            it.rarity === rarity &&
            (!it.race || (Array.isArray(it.race) ? (it.race.includes('All') || it.race.includes(player.race)) : (it.race === 'All' || it.race === player.race))) &&
            it.level <= player.level + 10 &&
            (it.type !== 'weapon' || !it.job || (Array.isArray(it.job) ? it.job.includes(player.job) : it.job === player.job)) &&
            (it.minStage === undefined || it.minStage <= fightSector)
          )
          if (pool.length === 0) return null
          return pool[Math.floor(seededFrac(seed) * pool.length)]
        }

        const pickMat = (id) => itemsData.items.find(it => it.id === id)

        const RARITY_COMMON = 'C'     // Common
        const RARITY_UNCOMMON = 'B'   // Uncommon
        const RARITY_RARE = 'A'       // Rare
        const RARITY_EPIC = 'S'       // Epic

        if (isDungeon) {
          // ── DUNGEON MONSTER (normal): EXP + CRD only, NO gear, NO material ──
          // (loot already handled via credits in computeRewards)

          if (killedBoss) {
            // ── DUNGEON BOSS DROP ──
            // Guaranteed: CRD (handled via computeRewards), 1 Random Equipment (Common or Uncommon)
            const bossEquipRoll = seededFrac(timer.startedAt + 200)
            const bossEquipRarity = bossEquipRoll < 0.5 ? RARITY_COMMON : RARITY_UNCOMMON
            const bossEquip = pickItem(bossEquipRarity, timer.startedAt + 201)
            if (bossEquip) { pushOrMail({ ...bossEquip, uid: Date.now() + 200 }, `\n🎁 Boss Drop: ${bossEquip.emoji} ${bossEquip.name}`) }

            // Boss CRD bonus
            const DUNGEON_BOSS_CRD = [
              [50000, 80000],       // Echo Burrow
              [200000, 350000],     // Infernal Forge
              [700000, 1000000],    // Trinity Core Chamber
            ]
            const brdRange = DUNGEON_BOSS_CRD[Math.min(dungeonIdx, 2)]
            const bossCrd = Math.floor(brdRange[0] + seededFrac(timer.startedAt + 202) * (brdRange[1] - brdRange[0]))
            finalCrd += bossCrd
            dropLog += `\n💰 Boss CRD: ${bossCrd.toLocaleString()}`

            // Random: Rare Equipment 25%
            if (seededFrac(timer.startedAt + 203) < 0.25 + dropRateBonus) {
              const rareEquip = pickItem(RARITY_RARE, timer.startedAt + 204)
              if (rareEquip) { pushOrMail({ ...rareEquip, uid: Date.now() + 203 }, `\n🔵 Rare Drop: ${rareEquip.emoji} ${rareEquip.name}`) }
            }
            // Random: Epic Equipment 5%
            if (seededFrac(timer.startedAt + 205) < 0.05 + dropRateBonus) {
              const epicEquip = pickItem(RARITY_EPIC, timer.startedAt + 206)
              if (epicEquip) { pushOrMail({ ...epicEquip, uid: Date.now() + 205 }, `\n🟣 Epic Drop: ${epicEquip.emoji} ${epicEquip.name}`) }
            }
            // Divine Crest: 100% (5-15 pcs)
            const crestCount = 5 + Math.floor(seededFrac(timer.startedAt + 207) * 11)
            const crestItem = pickMat('mat_divine_crest')
            if (crestItem) {
              for (let c = 0; c < crestCount; c++) pushOrMail({ ...crestItem, uid: Date.now() + 210 + c }, c === 0 ? `\n🛡️ Divine Crest ×${crestCount}` : '')
            }
            // Cape Component: 20%
            if (seededFrac(timer.startedAt + 208) < 0.20 + dropRateBonus) {
              const capeComp = pickMat('mat_cape_component')
              if (capeComp) { pushOrMail({ ...capeComp, uid: Date.now() + 208 }, `\n🦸 Cape Component`) }
            }
            // Arcanite: 0.10% (Super Ultra Rare)
            if (seededFrac(timer.startedAt + 209) < 0.001 + dropRateBonus) {
              const arc = pickMat('mat_arcanite')
              if (arc) { pushOrMail({ ...arc, uid: Date.now() + 209 }, `\n🪨 ARCANITE!!! (Super Ultra Rare)`) }
            }
          }
        } else {
          // ── WORLD MAP ──
          if (killedStageBoss) {
            // ── WORLD BOSS DROP ──
            // Guaranteed: CRD (below) + 1 Random Equipment (Common or Uncommon)
            const bossEquipRoll = seededFrac(timer.startedAt + 100)
            const bossEquipRarity = bossEquipRoll < 0.5 ? RARITY_COMMON : RARITY_UNCOMMON
            const bossEquip = pickItem(bossEquipRarity, timer.startedAt + 101)
            if (bossEquip) { pushOrMail({ ...bossEquip, uid: Date.now() + 100 }, `\n🎁 Boss Drop: ${bossEquip.emoji} ${bossEquip.name}`) }

            // World Boss CRD by sector boss
            const WORLD_BOSS_CRD = [
              [100000, 200000],       // Lumora Behemoth
              [300000, 500000],       // Sylvan Fanglord
              [700000, 1000000],      // Iron Juggernaut
              [1500000, 2500000],     // Pyraxis Overlord
              [4000000, 6000000],     // Trinity Overlord
            ]
            const wrdRange = WORLD_BOSS_CRD[Math.min(fightSector - 1, 4)]
            const bossCrd = Math.floor(wrdRange[0] + seededFrac(timer.startedAt + 102) * (wrdRange[1] - wrdRange[0]))
            finalCrd += bossCrd
            dropLog += `\n💰 Boss CRD: ${bossCrd.toLocaleString()}`

            // Random: Rare Equipment 15%
            if (seededFrac(timer.startedAt + 103) < 0.15 + dropRateBonus) {
              const rareEquip = pickItem(RARITY_RARE, timer.startedAt + 104)
              if (rareEquip) { pushOrMail({ ...rareEquip, uid: Date.now() + 103 }, `\n🔵 Rare Drop: ${rareEquip.emoji} ${rareEquip.name}`) }
            }
            // Divine Crest: 100% (1-5 pcs)
            const crestCount = 1 + Math.floor(seededFrac(timer.startedAt + 105) * 5)
            const crestItem = pickMat('mat_divine_crest')
            if (crestItem) {
              for (let c = 0; c < crestCount; c++) pushOrMail({ ...crestItem, uid: Date.now() + 110 + c }, c === 0 ? `\n🛡️ Divine Crest ×${crestCount}` : '')
            }
            // Cape Component: 20%
            if (seededFrac(timer.startedAt + 106) < 0.20 + dropRateBonus) {
              const capeComp = pickMat('mat_cape_component')
              if (capeComp) { pushOrMail({ ...capeComp, uid: Date.now() + 106 }, `\n🦸 Cape Component`) }
            }
            // Arcanite: 0.05% (Super Ultra Rare)
            if (seededFrac(timer.startedAt + 107) < 0.0005 + dropRateBonus) {
              const arc = pickMat('mat_arcanite')
              if (arc) { pushOrMail({ ...arc, uid: Date.now() + 107 }, `\n🪨 ARCANITE!!! (Super Ultra Rare)`) }
            }
          } else {
            // ── NORMAL MONSTER DROP ──
            // HP Potion: 0.2% chance per kill
            let hpCount = 0
            for (let i = 0; i < finalKills; i++) {
              if (seededFrac(timer.startedAt + 50 + i) < 0.002 + dropRateBonus / 100) {
                hpCount++
              }
            }
            if (hpCount > 0) {
              const hpPotion = pickMat('pot_hp')
              if (hpPotion) { pushOrMail(hpPotion, `\n❤️ HP Potion [S] ×${hpCount}`, hpCount) }
            }

            // FP Potion: 0.1% chance per kill
            let fpCount = 0
            for (let i = 0; i < finalKills; i++) {
              if (seededFrac(timer.startedAt + 53 + i) < 0.001 + dropRateBonus / 200) {
                fpCount++
              }
            }
            if (fpCount > 0) {
              const fpPotion = pickMat('pot_fp')
              if (fpPotion) { pushOrMail(fpPotion, `\n🔷 FP Potion [S] ×${fpCount}`, fpCount) }
            }

            // Common Equipment: 0.1% chance per kill (max 3 items to prevent inventory flood)
            let equipCount = 0
            for (let i = 0; i < finalKills && equipCount < 3; i++) {
              if (seededFrac(timer.startedAt + 51 + i) < 0.001 + dropRateBonus / 200) {
                const commonEquip = pickItem(RARITY_COMMON, timer.startedAt + 52 + i)
                if (commonEquip) {
                  pushOrMail({ ...commonEquip, uid: Date.now() + 51 + i }, `\n⚪ Common Drop: ${commonEquip.emoji} ${commonEquip.name}`)
                  equipCount++
                }
              }
            }
          }
        }
        let currentPt = player.pt
        if (!currentPt) {
          currentPt = getInitialPT(player.race, player.job, player.level)
        }
        const hasShield = !!(player.equipment && player.equipment.shield)
        const { nextPt, logs: ptLogs } = advancePT(
          currentPt,
          timer.mode || 'fight',
          timer.selectedMinutes,
          player.race,
          player.job,
          player.level,
          hasShield,
          finalKills
        )

        const finalLog = []
        if (levelUps > 0) finalLog.push(`🆙 LEVEL UP! LV.${newLevel} — Sector ${newSector}!`)
        ptLogs.forEach((l) => finalLog.push(`📈 ${l}`))
        if (activeFraction > 0) {
          finalLog.push(`🎮 Active Mode: ${Math.round(activeFraction * 100)}% sesi ini | +${Math.round(activeFraction * 10)}% EXP, +${(activeFraction * 5).toFixed(1)}% Drop Rate`)
        }
        finalLog.push(`✅ Done! ${finalKills} kills | +${finalCrd.toLocaleString()} CRD | +${finalExp} Menit${deaths > 0 ? ` (Died ${deaths} times)` : ''}${dropLog}`)

        set((s) => ({
          timer: { ...s.timer, state: 'completed', secondsLeft: 0 },
          player: {
            ...s.player,
            exp: newExp,
            level: newLevel,
            pt: nextPt,
            sector: newSector,
            highestSector: Math.max(s.player.highestSector, newSector),
            resources: {
              ...s.player.resources,
              crd: s.player.resources.crd + finalCrd,
              credits: 0 // clean up legacy
            },
            streak: newStreak,
            lastSessionDate: today,
            totalSessions: s.player.totalSessions + 1,
            totalMinutes: s.player.totalMinutes + timer.selectedMinutes,
            inventory: newInventory,
            mailbox,
            combatStats: {
              ...(s.player.combatStats || { totalMonsterKill: 0, dungeonClear: 0, worldBossKill: 0, coreWarVictory: 0, highestEnhancement: 0 }),
              totalMonsterKill: (s.player.combatStats?.totalMonsterKill || 0) + finalKills,
              dungeonClear: (s.player.combatStats?.dungeonClear || 0) + (isDungeon && killedStageBoss ? 1 : 0),
              worldBossKill: (s.player.combatStats?.worldBossKill || 0) + (!isDungeon && killedStageBoss ? 1 : 0)
            },
            savedAt: Date.now(),
          },
          battle: { ...s.battle, kills: finalKills, sessionExp: finalExp, sessionCrd: finalCrd, levelUps, log: finalLog },
        }))
      },

      resetTimer: () => {
        set((s) => ({
          timer: { ...s.timer, state: 'idle', secondsLeft: s.timer.selectedMinutes * 60, startedAt: 0, endsAt: 0 },
          player: { ...s.player, savedAt: Date.now() },
          battle: initialBattle,
        }))
      },

      // ── Upgrade ──────────────────────────────────────────
      upgrade: (key) => {
        const { player } = get()
        const upgrades = player.upgrades || { atk: 0, def: 0, hp: 0 }
        const currentLevel = upgrades[key] || 0
        const cost = calcUpgradeCost(key, currentLevel)
        if (player.resources?.crd < cost) return
        set((s) => {
          const sUpgrades = s.player.upgrades || { atk: 0, def: 0, hp: 0 }
          return {
            player: {
              ...s.player,
              resources: { ...s.player.resources, crd: s.player.resources.crd - cost },
              upgrades: { ...sUpgrades, [key]: (sUpgrades[key] || 0) + 1 },
              savedAt: Date.now(),
            },
          }
        })
      },

      // ── Sync (player + session) ──────────────────────────
      getSyncState: () => {
        const { player, timer } = get()
        return {
          ...player,
          stats: get().getStats(), // sync computed stats so server can filter PvP targets!
          __session: {
            state: timer.state,
            mode: timer.mode,
            selectedMinutes: timer.selectedMinutes,
            startedAt: timer.startedAt,
            endsAt: timer.endsAt,
          },
        }
      },
      applySyncState: (gs) => {
        if (!gs) return
        const { __session, ...playerPart } = gs
        set((s) => {
          const next = {
            player: {
              ...initialPlayer,
              ...playerPart,
              resources: {
                ...initialPlayer.resources,
                ...(playerPart.resources || {})
              },
              upgrades: {
                ...initialPlayer.upgrades,
                ...(playerPart.upgrades || {})
              }
            }
          }

          // Hydrate / Migrate PT stats
          if (!next.player.pt) {
            next.player.pt = getInitialPT(next.player.race, next.player.job, next.player.level)
          } else {
            // Ensure all 7 keys are present
            const defaultPt = getInitialPT(next.player.race, next.player.job, next.player.level)
            next.player.pt = {
              ...defaultPt,
              ...next.player.pt
            }
          }
          
          // Force reset if the loaded race is obsolete
          const raceMap = { 
            'accretians': 'arctron', 'accretia': 'arctron', 'arctron': 'arctron',
            'bellians': 'bionex', 'bellato': 'bionex', 'bionex': 'bionex',
            'corvus': 'celestra', 'cora': 'celestra', 'celestra': 'celestra'
          }
          if (next.player.race && raceMap[next.player.race]) {
            next.player.race = raceMap[next.player.race]
          } 

          // Migrate inventory items
          if (next.player.inventory) {
             next.player.inventory = next.player.inventory.map(i => raceMap[i.race] ? { ...i, race: raceMap[i.race] } : i)
             
             // Cleanup legacy duplicated boots/gloves from unequipping un-split items
             const baseUids = new Set(next.player.inventory.filter(i => !String(i.uid).endsWith('_r')).map(i => String(i.uid)));
             next.player.inventory = next.player.inventory.filter(i => {
               const uidStr = String(i.uid);
               if (uidStr.endsWith('_r') && baseUids.has(uidStr.replace('_r', ''))) {
                 return false; // Remove the _r duplicate if the base item exists
               }
               return true;
             });
          }

          // Restore boots/gloves that were accidentally wiped by the legacy cleanup script
          if (next.player.race === 'arctron' && next.player.inventory && next.player.equipment) {
            const eq = next.player.equipment
            const inv = next.player.inventory
            const hasBootsEquipped = eq.boots_l || eq.boots_r || eq.boots
            const hasBootsInv = inv.some(i => i.type === 'boots')
            const hasGlovesEquipped = eq.gloves_l || eq.gloves_r || eq.gloves
            const hasGlovesInv = inv.some(i => i.type === 'gloves')

            const WARRIOR_LINE = ['warrior', 'vanguard', 'juggernaut', 'dreadnought']
            const RANGER_LINE = ['ranger', 'sharpshooter', 'deadeye', 'apex_hunter']
            const TECH_LINE = ['technician', 'architect', 'core_engineer', 'cybermancer']
            const job = (next.player.job || '').toLowerCase()

            let bootsId = null, glovesId = null
            if (WARRIOR_LINE.includes(job)) {
              bootsId = 'boots_armorset_arctron_lv1'
              glovesId = 'gloves_armorset_arctron_lv1'
            } else if (RANGER_LINE.includes(job)) {
              bootsId = 'boots_armorset_arctron_ranger_lv1'
              glovesId = 'gloves_armorset_arctron_ranger_lv1'
            } else if (TECH_LINE.includes(job)) {
              bootsId = 'boots_armorset_arctron_technician_lv1'
              glovesId = 'gloves_armorset_arctron_technician_lv1'
            }

            if (bootsId && !hasBootsEquipped && !hasBootsInv) {
              const bootsDef = itemsData.items.find(it => it.id === bootsId)
              if (bootsDef) {
                const restoredBoots = { ...bootsDef, uid: Date.now() + 777, enhancement_level: 0 }
                next.player.equipment.boots_l = restoredBoots
                next.player.equipment.boots_r = restoredBoots
                console.log('[Migration] Restored missing boots:', bootsId)
              }
            }
            if (glovesId && !hasGlovesEquipped && !hasGlovesInv) {
              const glovesDef = itemsData.items.find(it => it.id === glovesId)
              if (glovesDef) {
                const restoredGloves = { ...glovesDef, uid: Date.now() + 888, enhancement_level: 0 }
                next.player.equipment.gloves_l = restoredGloves
                next.player.equipment.gloves_r = restoredGloves
                console.log('[Migration] Restored missing gloves:', glovesId)
              }
            }
          }

          if (next.player.equipment) {
             // Migrate gloves/boots to gloves_l/boots_l if they exist
             if (next.player.equipment.gloves) {
               next.player.equipment.gloves_l = next.player.equipment.gloves
               next.player.equipment.gloves_r = { ...next.player.equipment.gloves, uid: next.player.equipment.gloves.uid + '_r' }
               delete next.player.equipment.gloves
             }
             if (next.player.equipment.boots) {
               next.player.equipment.boots_l = next.player.equipment.boots
               next.player.equipment.boots_r = { ...next.player.equipment.boots, uid: next.player.equipment.boots.uid + '_r' }
               delete next.player.equipment.boots
             }
             // Self-healing duplicate for players whose profile already deleted the legacy slots
             if (next.player.equipment.gloves_l && !next.player.equipment.gloves_r) {
               next.player.equipment.gloves_r = { ...next.player.equipment.gloves_l, uid: next.player.equipment.gloves_l.uid + '_r' }
             }
             if (next.player.equipment.boots_l && !next.player.equipment.boots_r) {
               next.player.equipment.boots_r = { ...next.player.equipment.boots_l, uid: next.player.equipment.boots_l.uid + '_r' }
             }
             next.player.equipment = {
               weapon: null, armor: null, shield: null,
               helmet: null, mantle: null, gloves_l: null, gloves_r: null, boots_l: null, boots_r: null,
               pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null,
               ...next.player.equipment
             }
             if (next.player.equipment.weapon && raceMap[next.player.equipment.weapon.race]) next.player.equipment.weapon.race = raceMap[next.player.equipment.weapon.race]
             if (next.player.equipment.armor && raceMap[next.player.equipment.armor.race]) next.player.equipment.armor.race = raceMap[next.player.equipment.armor.race]
             if (next.player.equipment.shield && raceMap[next.player.equipment.shield.race]) next.player.equipment.shield.race = raceMap[next.player.equipment.shield.race]
             if (next.player.equipment.helmet && raceMap[next.player.equipment.helmet.race]) next.player.equipment.helmet.race = raceMap[next.player.equipment.helmet.race]
             if (next.player.equipment.mantle && raceMap[next.player.equipment.mantle.race]) next.player.equipment.mantle.race = raceMap[next.player.equipment.mantle.race]
             if (next.player.equipment.gloves_l && raceMap[next.player.equipment.gloves_l.race]) next.player.equipment.gloves_l.race = raceMap[next.player.equipment.gloves_l.race]
             if (next.player.equipment.gloves_r && raceMap[next.player.equipment.gloves_r.race]) next.player.equipment.gloves_r.race = raceMap[next.player.equipment.gloves_r.race]
             if (next.player.equipment.boots_l && raceMap[next.player.equipment.boots_l.race]) next.player.equipment.boots_l.race = raceMap[next.player.equipment.boots_l.race]
             if (next.player.equipment.boots_r && raceMap[next.player.equipment.boots_r.race]) next.player.equipment.boots_r.race = raceMap[next.player.equipment.boots_r.race]
          }

          if (next.player.race && !races[next.player.race]) {
            next.player.race = null
            next.player.job = null
            next.player.upgrades = { atk: 0, def: 0, hp: 0 }
            next.player.equipment = { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves_l: null, gloves_r: null, boots_l: null, boots_r: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null }
          }

          if (__session) {
            const remaining = __session.state === 'running'
              ? Math.max(0, Math.ceil((__session.endsAt - Date.now()) / 1000))
              : __session.state === 'completed' ? 0 : __session.selectedMinutes * 60
            next.timer = {
              ...s.timer,
              state: __session.state,
              mode: __session.mode,
              selectedMinutes: __session.selectedMinutes,
              startedAt: __session.startedAt,
              endsAt: __session.endsAt,
              secondsLeft: remaining,
            }
          }
          next.player = verifyStarterArmorSet(verifyStarterWeapon(verifyStarterShield(next.player)))
          return next
        })
      },

      // ── Helpers ──────────────────────────────────────────
      getStats: () => {
        const { player, archons, winnerRace } = get()
        if (!player.race) return { atk: 0, def: 0, hp: 0, title: '' }
        
        const myRaceArchon = archons ? archons[player.race] : null
        const isArchon = myRaceArchon && myRaceArchon.toLowerCase() === player.username?.toLowerCase()
        
        const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves_l: null, gloves_r: null, boots_l: null, boots_r: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null }
        
        // Base Stats Lookups
        const baseStats = player.job && baseStatsData[player.race] && baseStatsData[player.race][player.job] 
                          ? baseStatsData[player.race][player.job] 
                          : { str: 5, dex: 5, int: 5, vit: 5 }
        
        // Job bonus
        let jobBonus = { atk: 0, def: 0, hp: 0 }
        if (player.job && jobs[player.race]) {
           for (const tier of Object.values(jobs[player.race])) {
             const j = tier.find(x => x.id === player.job)
             if (j) { jobBonus = j.bonus; break; }
           }
        }

        const eqSlots = ['weapon', 'armor', 'shield', 'helmet', 'mantle', 'gloves_l', 'gloves_r', 'boots_l', 'boots_r', 'pants', 'amulet1', 'amulet2', 'ring1', 'ring2', 'ascension_arms']
        let flatAtk = jobBonus.atk || 0
        let flatDef = jobBonus.def || 0
        let flatHp = jobBonus.hp || 0
        
        let percentAtk = 0
        let percentDef = 0
        let percentHp = 0
        let critBonus = 0
        eqSlots.forEach(slot => {
          const item = eq[slot]
          if (item && item.bonus) {
            // Skip Archon gear stats if not the Archon
            if (item.id && item.id.startsWith('archon_') && !isArchon) {
              return
            }

            let itemAtk = item.bonus.atk || 0
            let itemDef = item.bonus.def || 0
            let itemHp = item.bonus.hp || 0

            // Apply refinement/rarity bonus if it's the weapon
            if (slot === 'weapon' && item.rarityGrade) {
              const rBonus = getWeaponRarityBonus(item.rarityGrade)
              itemAtk = Math.floor(itemAtk * (1 + rBonus / 100))
            }

            // Apply enhancement bonus (+1 to +8) using specific Arcanite rules (+5% per level)
            if (item.enhancement) {
              const mult = 1 + (item.enhancement * 0.05)
              const bonusPercent = (mult - 1) * 100
              
              if (item.arcanite_type === 'mat_arcanite_fury') {
                if (itemAtk > 0) itemAtk = Math.floor(itemAtk * mult)
                else percentAtk += bonusPercent
              } else if (item.arcanite_type === 'mat_arcanite_vital') {
                if (itemHp > 0) itemHp = Math.floor(itemHp * mult)
                else percentHp += bonusPercent
              } else if (item.arcanite_type === 'mat_arcanite_guard') {
                if (itemDef > 0) itemDef = Math.floor(itemDef * mult)
                else percentDef += bonusPercent
              } else if (item.arcanite_type === 'mat_arcanite_focus') {
                critBonus += (item.enhancement * 5)
              } else if (!item.arcanite_type) {
                // Legacy fallback
                if (item.type === 'weapon') {
                  itemAtk = Math.floor(itemAtk * mult)
                } else {
                  itemDef = Math.floor(itemDef * mult)
                  itemHp = Math.floor(itemHp * mult)
                }
              }
            }

            flatAtk += itemAtk
            flatDef += itemDef
            flatHp += itemHp

            // Percent upgrades
            if (item.bonus.atkPercent) percentAtk += item.bonus.atkPercent
            if (item.bonus.defPercent) percentDef += item.bonus.defPercent
            if (item.bonus.hpPercent) percentHp += item.bonus.hpPercent
            if (item.bonus.crit) critBonus += item.bonus.crit
          }
        })

        // Add stats from ascensionLoadout if ascension arms is equipped
        if (player.equipment && player.equipment.ascension_arms && player.ascensionLoadout) {
          Object.values(player.ascensionLoadout).forEach(p => {
            if (!p) return;
            if (p.def) flatDef += p.def;
            if (p.hp) flatHp += p.hp;
            if (p.minAtk || p.maxAtk) {
              flatAtk += Math.floor(((p.minAtk || 0) + (p.maxAtk || 0)) / 2);
            }
            if (p.pt) {
            }
          })
        }

        // Active Arctron ARES Siege Multiplier Bonus (% Attack Boost)
        if (player.race === 'arctron' && player.equipment?.ascension_arms) {
          const aresId = player.equipment.ascension_arms.id;
          const evolutions = ascensionArmsData.arctron?.evolutions || [];
          const currentEvo = evolutions.find(e => e.id === aresId);
          if (currentEvo && currentEvo.atkPercent && !player.equipment.ascension_arms.bonus?.atkPercent) {
            percentAtk += currentEvo.atkPercent;
          }
        }

        // Active Celestra Animus (Seraphys / Noctyrna) Bonus
        if (player.race === 'celestra' && player.activeAnimus) {
          const animusLv = player.celestraAnimus?.[player.activeAnimus] || 1
          const lvBonus = Math.max(0, animusLv - 1)
          const animusInfo = ascensionArmsData.celestra?.animus?.[player.activeAnimus]
          if (animusInfo) {
            if (player.activeAnimus === 'seraphys') {
              flatHp += Math.round((animusInfo.baseHp || 0) + ((animusInfo.growthHp || 0) * lvBonus))
              flatDef += Math.round((animusInfo.baseDef || 0) + ((animusInfo.growthDef || 0) * lvBonus))
            } else if (player.activeAnimus === 'noctyrna') {
              const minForce = (animusInfo.baseForceAtkMin || 0) + ((animusInfo.growthForceAtkMin || 0) * lvBonus)
              const maxForce = (animusInfo.baseForceAtkMax || 0) + ((animusInfo.growthForceAtkMax || 0) * lvBonus)
              flatAtk += Math.round((minForce + maxForce) / 2)
              flatHp += Math.round((animusInfo.baseHp || 0) + ((animusInfo.growthHp || 0) * lvBonus))
              flatDef += Math.round((animusInfo.baseDef || 0) + ((animusInfo.growthDef || 0) * lvBonus))
              critBonus += (animusInfo.baseCrit || 0) + ((animusInfo.growthCrit || 0) * lvBonus)
            }
          }
        }

        // GM PT and Ascension Arms Bonuses
        const pt = player.pt || {}
        const gmMelee = pt.melee?.val >= 99
        const gmRange = pt.range?.val >= 99
        const gmForce = pt.force?.val >= 99
        const gmShield = pt.shield?.val >= 99

        if (gmMelee) {
          flatAtk += 50
          critBonus += 1
        }
        if (gmRange) {
          flatAtk += 50
          critBonus += 1
        }
        if (gmForce) {
          flatAtk += 50
          critBonus += 1
        }
        if (gmShield) {
          flatDef += 50
          flatHp += 500
        }

        // Ascension Arms Bonus: active if all eligible GM PTs (class cap at max level >= 99) are at 99
        const absoluteCaps = getPTCaps(player.race, player.job, 66)
        const eligibleGMKeys = Object.keys(absoluteCaps).filter(key => absoluteCaps[key] >= 99)
        const allGMMaxed = eligibleGMKeys.length > 0 && eligibleGMKeys.every(key => pt[key]?.val >= 99)

        if (allGMMaxed) {
          flatAtk += 50
          flatDef += 50
          flatHp += 500
          critBonus += 1
        }

        // Title/Achievement Bonus: derived live from current PvP rank (#1/#2/#3 in own race) —
        // not a permanent unlock. Lost immediately if the player drops out of the top 3.
        const activeTitleObj = getActiveTitle(player)
        if (activeTitleObj) {
          flatAtk += activeTitleObj.bonus.atk || 0
          flatDef += activeTitleObj.bonus.def || 0
          flatHp += activeTitleObj.bonus.hp || 0
        }

        // Base HP, DEF, ATK Math using STR, DEX, INT, VIT
        let baseAtkScaling = 0
        if (baseStats.str >= 12 && baseStats.str > baseStats.dex && baseStats.str > baseStats.int) { // Warrior
            baseAtkScaling = (baseStats.str * 2.5) + (baseStats.dex * 0.5)
        } else if (baseStats.dex >= 12 && baseStats.dex > baseStats.str && baseStats.dex > baseStats.int) { // Ranger
            baseAtkScaling = (baseStats.dex * 2.5) + (baseStats.str * 0.5)
        } else if (baseStats.int >= 14) { // Spiritualist
            baseAtkScaling = (baseStats.int * 2.5) + (baseStats.dex * 0.5)
        } else { // Specialist
            baseAtkScaling = (baseStats.str * 1.5) + (baseStats.dex * 1.0) + (baseStats.int * 1.0)
        }

        let baseHpScaling = (baseStats.vit * 25) + (baseStats.str * 5)
        let baseDefScaling = (baseStats.vit * 1.5) + (baseStats.str * 0.5)

        let levelGrowth = { hp: 0, atk: 0, def: 0 }
        if (player.job) {
          let growth = null;
          
          if (player.race === 'bionex') {
            const guardianJobs = ['guardian', 'centurion', 'protector', 'imperator'];
            const marksmanJobs = ['marksman', 'revenant', 'deadeye', 'predator'];
            const engineerJobs = ['technician', 'mechanist', 'techmaster', 'overseer'];
            const psionJobs = ['psion', 'esper', 'ascendant', 'transcendent'];
            if (guardianJobs.includes(player.job)) {
              growth = { hp: 13, atk: 2, def: 2 }
              baseHpScaling = 210; baseAtkScaling = 27; baseDefScaling = 22;
            } else if (marksmanJobs.includes(player.job)) {
              growth = { hp: 10, atk: 3, def: 1 }
              baseHpScaling = 175; baseAtkScaling = 33; baseDefScaling = 15;
            } else if (engineerJobs.includes(player.job)) {
              growth = { hp: 9, atk: 2, def: 1.5 }
              baseHpScaling = 175; baseAtkScaling = 25; baseDefScaling = 17;
            } else if (psionJobs.includes(player.job)) {
              growth = { hp: 8, atk: 3, def: 1 }
              baseHpScaling = 165; baseAtkScaling = 31; baseDefScaling = 14;
            }
          } else if (player.race === 'arctron') {
            const warriorJobs = ['warrior', 'vanguard', 'juggernaut', 'dreadnought'];
            const rangerJobs = ['ranger', 'marksman', 'railgunner', 'annihilator'];
            const techJobs = ['technician', 'architect', 'core_engineer', 'cybermancer'];
            if (warriorJobs.includes(player.job)) {
              growth = { hp: 14, atk: 2, def: 2 }
              baseHpScaling = 220; baseAtkScaling = 28; baseDefScaling = 24;
            } else if (rangerJobs.includes(player.job)) {
              growth = { hp: 10, atk: 3, def: 1 }
              baseHpScaling = 180; baseAtkScaling = 32; baseDefScaling = 16;
            } else if (techJobs.includes(player.job)) {
              growth = { hp: 9, atk: 2, def: 1.5 }
              baseHpScaling = 170; baseAtkScaling = 24; baseDefScaling = 18;
            }
          } else if (player.race === 'celestra') {
            const sentinelJobs = ['sentinel', 'warden', 'knight', 'blademaster'];
            const pathfinderJobs = ['pathfinder', 'windrunner', 'shadow_hunter', 'stargazer'];
            const oracleJobs = ['oracle', 'celestial_oracle', 'conjurer', 'divine_summoner'];
            const arcanistJobs = ['arcanist', 'rune_caster', 'mystic', 'archmage'];
            if (sentinelJobs.includes(player.job)) {
              growth = { hp: 12, atk: 2, def: 2 }
              baseHpScaling = 195; baseAtkScaling = 29; baseDefScaling = 20;
            } else if (pathfinderJobs.includes(player.job)) {
              growth = { hp: 9, atk: 3, def: 1 }
              baseHpScaling = 165; baseAtkScaling = 35; baseDefScaling = 14;
            } else if (oracleJobs.includes(player.job)) {
              growth = { hp: 8, atk: 2, def: 1.5 }
              baseHpScaling = 170; baseAtkScaling = 28; baseDefScaling = 16;
            } else if (arcanistJobs.includes(player.job)) {
              growth = { hp: 8, atk: 3, def: 1 }
              baseHpScaling = 160; baseAtkScaling = 34; baseDefScaling = 13;
            }
          }

          if (growth) {
            const levelUps = Math.max(0, (player.level || 1) - 1)
            levelGrowth.hp = growth.hp * levelUps
            levelGrowth.atk = growth.atk * levelUps
            levelGrowth.def = growth.def * levelUps
          }
        }

        let baseAtk = baseAtkScaling + calcStat('atk', player.upgrades?.atk || 0, player.race) + flatAtk + levelGrowth.atk
        let baseDef = baseDefScaling + calcStat('def', player.upgrades?.def || 0, player.race) + flatDef + levelGrowth.def
        let baseHp = baseHpScaling + calcStat('hp', player.upgrades?.hp || 0, player.race) + flatHp + levelGrowth.hp

        // Set bonus verification (requires being the Archon)
        const isBionexSet = isArchon &&
          eq.helmet?.id === 'archon_bionex_helmet' &&
          eq.mantle?.id === 'archon_bionex_mantle' &&
          eq.armor?.id === 'archon_bionex_armor' &&
          (eq.gloves_l?.id === 'archon_bionex_gloves' || eq.gloves_r?.id === 'archon_bionex_gloves') &&
          (eq.boots_l?.id === 'archon_bionex_boots' || eq.boots_r?.id === 'archon_bionex_boots') &&
          eq.weapon?.id === 'archon_bionex_weapon';
          
        const isCelestraSet = isArchon &&
          eq.helmet?.id === 'archon_celestra_helmet' &&
          eq.mantle?.id === 'archon_celestra_mantle' &&
          eq.armor?.id === 'archon_celestra_armor' &&
          (eq.gloves_l?.id === 'archon_celestra_gloves' || eq.gloves_r?.id === 'archon_celestra_gloves') &&
          (eq.boots_l?.id === 'archon_celestra_boots' || eq.boots_r?.id === 'archon_celestra_boots') &&
          eq.weapon?.id === 'archon_celestra_weapon';

        const isArctronSet = isArchon &&
          eq.helmet?.id === 'archon_arctron_helmet' &&
          eq.mantle?.id === 'archon_arctron_mantle' &&
          eq.armor?.id === 'archon_arctron_armor' &&
          (eq.gloves_l?.id === 'archon_arctron_gloves' || eq.gloves_r?.id === 'archon_arctron_gloves') &&
          (eq.boots_l?.id === 'archon_arctron_boots' || eq.boots_r?.id === 'archon_arctron_boots') &&
          eq.weapon?.id === 'archon_arctron_weapon';

        if (isBionexSet && player.race === 'bionex') {
          percentHp += 30
          percentDef += 20
        } else if (isCelestraSet && player.race === 'celestra') {
          percentAtk += 30
          percentDef += 20
        } else if (isArctronSet && player.race === 'arctron') {
          percentAtk += 30
          percentDef += 20
        }

        // ── Premium Set Bonus Detection ──
        const allEquipped = Object.values(eq).filter(Boolean)
        const setCountMap = {}
        const uniqueSetTypes = new Set()
        allEquipped.forEach(item => {
          if (item.setId) {
            const typeKey = `${item.setId}_${item.type}`
            if (!uniqueSetTypes.has(typeKey)) {
              uniqueSetTypes.add(typeKey)
              setCountMap[item.setId] = (setCountMap[item.setId] || 0) + 1
            }
          }
        })
        // Eminence Set 7/7
        if ((setCountMap['eminence'] || 0) >= 7) {
          flatAtk += 100; flatDef += 100; flatHp += 2000; critBonus += 2
        }
        // Vice Eminence Set 6/6
        if ((setCountMap['vice_eminence'] || 0) >= 6) {
          flatAtk += 80; flatDef += 80; flatHp += 1500; critBonus += 1
        }
        // Attack Council Set 6/6
        if ((setCountMap['council_atk'] || 0) >= 6) {
          flatAtk += 100; flatDef += 50; flatHp += 1200
        }
        // Defense Council Set 6/6
        if ((setCountMap['council_def'] || 0) >= 6) {
          flatAtk += 50; flatDef += 100; flatHp += 1200
        }
        // Support Council Set 6/6
        if ((setCountMap['council_sup'] || 0) >= 6) {
          flatAtk += 70; flatDef += 70; flatHp += 1200
        }


        // ── PvP Title Bonus ──
        const pvpRank = player.pvpRank || 0
        let titleAtk = 0, titleDef = 0, titleHp = 0
        if (pvpRank === 1)      { titleAtk = 45; titleDef = 25; titleHp = 5000 }
        else if (pvpRank === 2) { titleAtk = 40; titleDef = 20; titleHp = 3000 }
        else if (pvpRank === 3) { titleAtk = 35; titleDef = 20; titleHp = 2000 }
        flatAtk += titleAtk; flatDef += titleDef; flatHp += titleHp

        const lvl = player.level || 1
        let tierAtkPercent = 0
        let tierDefPercent = 0
        let tierHpPercent = 0
        let tierCrit = 0
        let tierDodge = 0

        if (lvl >= 55) {
          tierAtkPercent = 20
          tierDefPercent = 20
          tierHpPercent = 20
          tierCrit = 10
          tierDodge = 5
        } else if (lvl >= 42) {
          tierAtkPercent = 15
          tierDefPercent = 15
          tierHpPercent = 15
          tierCrit = 5
          tierDodge = 0
        } else if (lvl >= 32) {
          tierAtkPercent = 10
          tierDefPercent = 10
          tierHpPercent = 10
          tierCrit = 0
          tierDodge = 0
        }

        // ATK & DEF Potion Boosts
        const isAtkPotActive = player.activeBoosts?.atkPot && player.activeBoosts.atkPot.expiresAt > Date.now()
        if (isAtkPotActive) {
          percentAtk += 25
        }
        const isDefPotActive = player.activeBoosts?.defPot && player.activeBoosts.defPot.expiresAt > Date.now()
        if (isDefPotActive) {
          percentDef += 25
        }

        percentAtk += tierAtkPercent
        percentDef += tierDefPercent
        percentHp += tierHpPercent

        let atk = baseAtk * (1 + percentAtk / 100)
        let def = baseDef * (1 + percentDef / 100)
        let hp = baseHp * (1 + percentHp / 100)

        // Vampire weapon life steal gives +10% HP
        if (eq.weapon && eq.weapon.specialProperty === 'vampire') {
          hp += hp * 0.10
        }

        // Archon mantle and aura rules
        if (archons) {
          const myRaceArchon = archons[player.race]
          const archonRules = archonData[player.race]
          if (archonRules) {
            if (myRaceArchon && myRaceArchon.toLowerCase() === player.username?.toLowerCase()) {
              if (archonRules.mantle.bonus.atkPercent) atk += baseAtk * (archonRules.mantle.bonus.atkPercent / 100)
              if (archonRules.mantle.bonus.defPercent) def += baseDef * (archonRules.mantle.bonus.defPercent / 100)
            }
            if (myRaceArchon) {
              if (archonRules.aura.bonus.hpPercent) hp += baseHp * (archonRules.aura.bonus.hpPercent / 100)
              if (archonRules.aura.bonus.atkPercent) atk += baseAtk * (archonRules.aura.bonus.atkPercent / 100)
            }
          }
        }

        // Guild Role Buffs
        if (player.guild) {
          if (player.guild.role === 'Guildmaster') {
            hp += baseHp * 0.03
            atk += baseAtk * 0.03
            def += baseDef * 0.03
          } else if (player.guild.role === 'Vice Guildmaster') {
            hp += baseHp * 0.02
            atk += baseAtk * 0.02
            def += baseDef * 0.02
          }
        }

        // ── Core War Victory Buff ──
        if (winnerRace && winnerRace === player.race) {
          hp += baseHp * 0.10
          atk += baseAtk * 0.10
          def += baseDef * 0.10
        }

        let activeTitle = ''
        if (isBionexSet && player.race === 'bionex') {
          activeTitle = 'Solar Sovereign'
        } else if (isCelestraSet && player.race === 'celestra') {
          activeTitle = 'Astral Emperor'
        } else if (isArctronSet && player.race === 'arctron') {
          activeTitle = 'Iron Overlord'
        } else if (pvpRank === 1) {
          activeTitle = '👑 Hero'
        } else if (pvpRank === 2) {
          activeTitle = '⚜️ Savior'
        } else if (pvpRank === 3) {
          activeTitle = '🤝 Benefactor'
        }

        // Fallback for baseStats attributes (specifically for Bionex where they aren't STR/DEX/INT/VIT based)
        const str = baseStats.str || 5
        const dex = baseStats.dex || 5
        const int = baseStats.int || 5
        const vit = baseStats.vit || 5

        // Calculate Block Rate (5% base + 0.5% per Shield PT) if shield equipped
        const hasShield = !!eq.shield
        const blockRate = hasShield ? (0.05 + (pt.shield?.val || 1) * 0.005) : 0

        // Calculate Elemental Resistances based on class group and equipment
        let fireResist = 0
        let waterResist = 0
        let earthResist = 0
        let windResist = 0
        const classGroup = getPlayerClassGroup(player.job, player.race)
        if (classGroup === 'mage') {
          fireResist = 15; waterResist = 15; earthResist = 15; windResist = 15;
        } else if (classGroup === 'ranger' || classGroup === 'specialist') {
          fireResist = 5; waterResist = 5; earthResist = 5; windResist = 5;
        }
        eqSlots.forEach(slot => {
          const item = eq[slot]
          if (item && item.bonus) {
            if (item.bonus.fireResist) fireResist += item.bonus.fireResist
            if (item.bonus.waterResist) waterResist += item.bonus.waterResist
            if (item.bonus.earthResist) earthResist += item.bonus.earthResist
            if (item.bonus.windResist) windResist += item.bonus.windResist
          }
        })

        // Calculate final Crit and Dodge rates (base + tier + gear)
        const baseCrit = player.race === 'celestra' ? 15 : 12
        const critRate = Math.min(1.0, (baseCrit + tierCrit + critBonus) / 100)
        // Race dodge modifier: Celestra (agile/mystic) +5%, Bionex (tech/balanced) +2%, Arctron 0%
        const raceDodgeBonus = player.race === 'celestra' ? 5 : player.race === 'bionex' ? 2 : 0
        const dodgeRate = Math.min(0.80, (5 + raceDodgeBonus + tierDodge) / 100)

        return {
          meleeAtk: Math.floor(atk * (1 + (pt.melee?.val || 1) * 0.015) + (str * 3)),
          rangedAtk: Math.floor(atk * (1 + (pt.range?.val || 1) * 0.015) + (dex * 3)),
          forceAtk: player.race === 'arctron' ? 0 : Math.floor(atk * (1 + (pt.force?.val || 1) * 0.015) + (int * 3)),
          atk: Math.floor(atk),
          def: Math.floor(def * (1 + (pt.defense?.val || 1) * 0.01) + (vit * 0.5)),
          hp: Math.floor(hp * (1 + (pt.defense?.val || 1) * 0.005 + (pt.shield?.val || 1) * 0.005) + (vit * 10)),
          fp: Math.floor(200 + (lvl * 5) + (int * 5)),
          sp: Math.floor(100 + (lvl * 3) + (dex * 2)),
          blockRate: Math.min(0.75, blockRate), // Cap at 75%
          resistances: {
            fire: fireResist,
            water: waterResist,
            earth: earthResist,
            wind: windResist
          },
          crit: critRate,
          dodge: dodgeRate,
          str: str,
          dex: dex,
          int: int,
          vit: vit,
          title: activeTitle
        }
      },
      equipItem: (uid) => {
        const { player, archons } = get()
        const item = player.inventory.find((i) => i.uid === uid)
        if (!item) return

        if (player.level < (item.level || 0)) {
          alert(tStore('alert_req_level', { level: item.level }, player))
          return
        }

        if (item.race) {
          const allowedRaces = Array.isArray(item.race) ? item.race : [item.race]
          if (!allowedRaces.includes('All') && !allowedRaces.includes(player.race)) {
            alert(tStore('alert_restricted_race', { race: allowedRaces.map((r) => r.toUpperCase()).join('/') }, player))
            return
          }
        }

        if (item.job) {
          const allowedJobs = Array.isArray(item.job) ? item.job : [item.job]
          if (!allowedJobs.includes(player.job)) {
            alert(tStore('alert_restricted_job', { job: allowedJobs.map((j) => j.toUpperCase()).join('/') }, player))
            return
          }
        }
        
        if (item.type === 'ascension_arms') {
          const allowedJobs = {
            arctron: ['technician', 'architect', 'core_engineer', 'cybermancer'],
            bionex: ['engineer', 'mechanist', 'techmaster', 'overseer'],
            celestra: ['oracle', 'celestial_oracle', 'conjurer', 'divine_summoner']
          }
          const userRace = player.race ? player.race.toLowerCase() : ''
          const userJob = player.job ? player.job.toLowerCase() : ''
          const allowedForRace = allowedJobs[userRace] || []
          if (!allowedForRace.includes(userJob)) {
            alert(`Hanya pilot dengan job kelas ARES/M.E.U./Oracle yang dapat menggunakan Ascension Arms!`)
            return
          }
        }


        const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves_l: null, gloves_r: null, boots_l: null, boots_r: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null }

        // Determine target slot — amulet and ring have dual slots (can mix two
        // different items). Boots/gloves are a matched PAIR: one inventory item
        // fills both the _l and _r equipment slots together and can never be
        // split across two different items.
        let slot = null
        let pairSlots = null
        if (item.type === 'amulet') {
          slot = !eq.amulet1 ? 'amulet1' : 'amulet2'
        } else if (item.type === 'ring') {
          slot = !eq.ring1 ? 'ring1' : 'ring2'
        } else if (item.type === 'boots') {
          pairSlots = ['boots_l', 'boots_r']
        } else if (item.type === 'gloves') {
          pairSlots = ['gloves_l', 'gloves_r']
        } else if (['weapon','armor','shield','helmet','mantle','pants','ascension_arms'].includes(item.type)) {
          slot = item.type
        }
        if (!slot && !pairSlots) return

        let newInventory = player.inventory.filter((i) => i.uid !== uid)
        const newEquipment = { ...eq }

        if (pairSlots) {
          const oldUids = new Set()
          pairSlots.forEach((s) => {
            const oldItem = eq[s]
            if (oldItem && !oldUids.has(oldItem.uid)) {
              newInventory.push(oldItem)
              oldUids.add(oldItem.uid)
            }
            newEquipment[s] = item
          })
        } else {
          const oldItem = eq[slot]
          if (oldItem) newInventory.push(oldItem)
          newEquipment[slot] = item
        }

        set({
          player: {
            ...player,
            inventory: newInventory,
            equipment: newEquipment,
            savedAt: Date.now()
          }
        })
      },
      unequipItem: (slot) => {
        const { player } = get()
        const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves_l: null, gloves_r: null, boots_l: null, boots_r: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null }
        const item = eq[slot]
        if (!item) return

        // Boots/gloves are a matched pair — unequipping one foot/hand unequips
        // both together, since they can never hold two different items.
        const pairMap = { boots_l: 'boots_r', boots_r: 'boots_l', gloves_l: 'gloves_r', gloves_r: 'gloves_l' }
        const pairSlot = pairMap[slot]

        let newInventory = addToInventory(player.inventory, item)
        const newEquipment = { ...eq, [slot]: null }

        // Both slots normally hold the SAME item object (equipped as a pair) —
        // only return the paired slot's item separately if it's actually a
        // different item (leftover from old data before this pairing existed).
        if (pairSlot && eq[pairSlot] && eq[pairSlot].uid !== item.uid) {
          newInventory = addToInventory(newInventory, eq[pairSlot])
        }
        if (pairSlot) newEquipment[pairSlot] = null

        set({
          player: {
            ...player,
            inventory: newInventory,
            equipment: newEquipment,
            savedAt: Date.now()
          }
        })
      },
      sellItem: (uid) => {
        const { player } = get()
        const item = player.inventory.find((i) => i.uid === uid)
        if (!item) return

        // Cape tidak bisa dijual ke NPC
        if (item.type === 'cape' || item.type === 'mantle') {
          alert('🦸 Cape tidak dapat dijual ke NPC. Gunakan Auction House atau simpan.')
          return
        }

        // Harga jual resmi berdasar rarity + type (dalam CRD)
        const SELL_PRICES = {
          C: { weapon: 50000, armor: 40000, shield: 40000, helmet: 40000, mantle: 40000, gloves: 40000, boots: 40000, pants: 40000, ring: 100000, amulet: 100000 },
          B: { weapon: 150000, armor: 120000, shield: 120000, helmet: 120000, mantle: 120000, gloves: 120000, boots: 120000, pants: 120000, ring: 300000, amulet: 300000 },
          A: { weapon: 500000, armor: 400000, shield: 400000, helmet: 400000, mantle: 400000, gloves: 400000, boots: 400000, pants: 400000, ring: 1000000, amulet: 1000000 },
          S: { weapon: 2000000, armor: 1500000, shield: 1500000, helmet: 1500000, mantle: 1500000, gloves: 1500000, boots: 1500000, pants: 1500000, ring: 4000000, amulet: 4000000 },
        }
        const rarityPrices = SELL_PRICES[item.rarity]
        const price = rarityPrices ? (rarityPrices[item.type] || 0) : 0
        if (price === 0) {
          alert(`Item ini tidak dapat dijual ke NPC.`)
          return
        }

        const newInventory = removeFromInventory(player.inventory, uid, 1)
        set({
          player: {
            ...player,
            inventory: newInventory,
            resources: {
              ...player.resources,
              crd: (player.resources.crd || 0) + price
            },
            savedAt: Date.now()
          }
        })
      },
      // ── NPC Buy (Common Equipment) ─────────────────────────
      // Harga beli Common equipment dari NPC, per sektor/level tier
      buyFromNpc: (type) => {
        const { player } = get()
        const invSlots = player.inventorySlots || 100
        if (player.inventory.length >= invSlots) {
          alert(`Inventory penuh! Maksimal ${invSlots} slot. Kosongkan slot atau upgrade bag Anda.`)
          return false
        }
        // Base weapon price per Map (Sector)
        const NPC_BASE_WEAPON_PRICE = [125000, 225000, 450000, 900000, 1800000]
        // Multiplier per equipment type (relative to weapon price)
        const TYPE_MULT = {
          weapon: 1.0, armor: 1.0, helmet: 0.5,
          pants: 0.8, shield: 0.8, gloves: 0.4, boots: 0.4,
          mantle: 0.5
        }
        const sector = Math.min((player.sector || 1) - 1, 4)
        const baseWeapon = NPC_BASE_WEAPON_PRICE[sector]
        const mult = TYPE_MULT[type]
        if (mult === undefined) { alert('Item ini tidak dijual di NPC.'); return false }
        const price = Math.round(baseWeapon * mult)

        if ((player.resources.crd || 0) < price) {
          alert(`CRD tidak cukup! Dibutuhkan ${price.toLocaleString()} CRD.`)
          return false
        }

        // Pick a random Common item of this type from items pool
        const pool = itemsData.items.filter(it => {
          if (it.type !== type || it.rarity !== 'C' || it.level > player.level + 5) return false
          const allowedRaces = it.race == null ? null : (Array.isArray(it.race) ? it.race : [it.race])
          if (allowedRaces && !allowedRaces.includes('All') && !allowedRaces.includes(player.race)) return false
          const allowedJobs = it.job == null ? null : (Array.isArray(it.job) ? it.job : [it.job])
          if (allowedJobs && !allowedJobs.includes(player.job)) return false
          return true
        })
        if (pool.length === 0) { alert('Stock habis untuk saat ini.'); return false }
        const item = pool[Math.floor(Math.random() * pool.length)]
        const newItem = { ...item, uid: Date.now() }
        set((s) => ({
          player: {
            ...s.player,
            inventory: addToInventory(s.player.inventory, newItem),
            resources: {
              ...s.player.resources,
              crd: (s.player.resources.crd || 0) - price
            },
            savedAt: Date.now()
          }
        }))
        return true
      },
      buyPotions: (count = 10) => {
        const { player } = get()
        const cost = count * 20 // 20 CRD per potion
        if ((player.resources.crd || 0) < cost) {
          alert(tStore('alert_not_enough_crd', { cost }, player))
          return false
        }

        const potionItem = itemsData.items.find(i => i.id === 'pot_hp')
        
        set((s) => ({
          player: {
            ...s.player,
            resources: {
              ...s.player.resources,
              crd: s.player.resources.crd - cost
            },
            inventory: addToInventory(s.player.inventory, potionItem, count),
            savedAt: Date.now()
          }
        }))
        return true
      },
      useItem: (uid) => {
        const { player, battle, timer } = get()
        const itemIdx = player.inventory.findIndex((i) => i.uid === uid)
        if (itemIdx === -1) return
        const item = player.inventory[itemIdx]
        if (item.type !== 'consumable') return
        
        const newInventory = [...player.inventory]
        const currentCount = item.count || item.qty || 1
        if (currentCount > 1) {
          newInventory[itemIdx] = {
            ...item,
            count: currentCount - 1,
            qty: currentCount - 1
          }
        } else {
          newInventory.splice(itemIdx, 1)
        }

        // Healing consumables
        if (item.id === 'pot_hp' || (item.bonus && item.bonus.hp)) {
            alert(`Berhasil memindahkan ${item.name} ke Quick Potion Slot! (+1 Quick Potion)`)
            set({
                player: {
                  ...player,
                  inventory: newInventory,
                  resources: {
                    ...player.resources,
                    potions: (player.resources.potions || 0) + 1
                  },
                  savedAt: Date.now()
                }
            })
            return
        }
        if (item.id === 'pot_fp') {
            alert(`FP Potion [S] otomatis digunakan dari tas saat FP kritis selama pertarungan.`)
            return
        }

      },
      getUpgradeCost: (key) => calcUpgradeCost(key, get().player.upgrades?.[key] || 0),
      loadPlayer: (savedPlayer) => set((s) => {
        const player = { ...initialPlayer, ...savedPlayer }
        return { player: verifyStarterArmorSet(verifyStarterWeapon(verifyStarterShield(player))) }
      }),
      getExpToNext: () => getMinutesToNextLevel(get().player.level),

      // ── Weapon Refining & Combining ───────────────────────
      refineWeapon: () => {
        const { player } = get()
        const weapon = player.equipment?.weapon
        if (!weapon) {
          alert(tStore('alert_no_equipped_weapon', {}, player))
          return
        }
        const currentGrade = (weapon.rarityGrade || 'normal').toLowerCase()
        const REFINE_COSTS = {
          normal: { next: 'advanced', talics: 1, crd: 5000 },
          advanced: { next: 'rare', talics: 2, crd: 10000 },
          rare: { next: 'epic', talics: 3, crd: 20000 },
          epic: { next: 'legendary', talics: 5, crd: 50000 },
          legendary: { next: 'mythic', talics: 10, crd: 100000 }
        }
        const cost = REFINE_COSTS[currentGrade]
        if (!cost) {
          alert(tStore('alert_max_mythic', {}, player))
          return
        }

        const talicCount = player.inventory
          .filter(it => it.id === 'talic_ignorance')
          .reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
        if (talicCount < cost.talics) {
          alert(tStore('alert_missing_ignorance', { talics: cost.talics, owned: talicCount }, player))
          return
        }
        if (player.resources.crd < cost.crd) {
          alert(tStore('alert_missing_crd', { crd: cost.crd, owned: player.resources.crd }, player))
          return
        }

        let needed = cost.talics
        const newInventory = []
        for (let i = 0; i < player.inventory.length; i++) {
          const it = player.inventory[i]
          if (it.id === 'talic_ignorance' && needed > 0) {
            const currentCount = it.count || it.qty || 1
            if (currentCount <= needed) {
              needed -= currentCount
            } else {
              newInventory.push({
                ...it,
                count: currentCount - needed,
                qty: currentCount - needed
              })
              needed = 0
            }
          } else {
            newInventory.push(it)
          }
        }

        const upgradedWeapon = {
          ...weapon,
          rarityGrade: cost.next
        }

        set({
          player: {
            ...player,
            resources: {
              ...player.resources,
              crd: player.resources.crd - cost.crd
            },
            inventory: newInventory,
            equipment: {
              ...player.equipment,
              weapon: upgradedWeapon
            },
            savedAt: Date.now()
          }
        })
      },

      createGuild: (name) => {
        const { player } = get()
        if (player.level < 30) return false
        if (player.resources.crd < 10000000) return false
        if (player.guild) return false

        const initialApplicants = [
          { id: 'app_1', name: 'Zack', level: 32, online: true },
          { id: 'app_2', name: 'Nexus_Core', level: 35, online: false }
        ]
        const initialMembers = [
          { id: 'gm', name: player.username || player.name, role: 'Guildmaster', level: player.level, online: true }
        ]

        set({
          player: {
            ...player,
            resources: { ...player.resources, crd: player.resources.crd - 10000000 },
            guild: { name, level: 1, role: 'Guildmaster', members: 1, membersList: initialMembers, applicants: initialApplicants },
            savedAt: Date.now()
          }
        })
        return true
      },

      upgradeGuild: () => {
        const { player } = get()
        if (!player.guild || player.guild.role !== 'Guildmaster') return false
        
        const upgradeCosts = [
          0, // lv 1
          10000000, // to lv 2
          20000000, // to lv 3
          40000000, // to lv 4
          80000000, // to lv 5
          150000000, // to lv 6
          300000000, // to lv 7
          500000000, // to lv 8
          750000000, // to lv 9
          1000000000, // to lv 10
        ]

        const currentLv = player.guild.level
        if (currentLv >= 10) return false
        
        const cost = upgradeCosts[currentLv]
        if (player.resources.crd < cost) return false

        set({
          player: {
            ...player,
            resources: { ...player.resources, crd: player.resources.crd - cost },
            guild: { ...player.guild, level: currentLv + 1 },
            savedAt: Date.now()
          }
        })
        return true
      },

      acceptApplicant: (applicantId) => {
        const { player } = get()
        if (!player.guild || player.guild.role !== 'Guildmaster') return false
        const applicants = player.guild.applicants || []
        const applicant = applicants.find(a => a.id === applicantId)
        if (!applicant) return false

        const newApplicants = applicants.filter(a => a.id !== applicantId)
        const membersList = player.guild.membersList || [{ id: 'gm', name: player.username || player.name, role: 'Guildmaster', level: player.level, online: true }]
        const newMembersList = [...membersList, { ...applicant, role: 'Member' }]

        set({
          player: {
            ...player,
            guild: {
              ...player.guild,
              members: newMembersList.length,
              membersList: newMembersList,
              applicants: newApplicants
            },
            savedAt: Date.now()
          }
        })
        return true
      },

      rejectApplicant: (applicantId) => {
        const { player } = get()
        if (!player.guild || player.guild.role !== 'Guildmaster') return false
        const applicants = player.guild.applicants || []
        const newApplicants = applicants.filter(a => a.id !== applicantId)

        set({
          player: {
            ...player,
            guild: {
              ...player.guild,
              applicants: newApplicants
            },
            savedAt: Date.now()
          }
        })
        return true
      },

      kickMember: (memberId) => {
        const { player } = get()
        if (!player.guild || player.guild.role !== 'Guildmaster') return false
        const membersList = player.guild.membersList || []
        const newMembersList = membersList.filter(m => m.id !== memberId)

        set({
          player: {
            ...player,
            guild: {
              ...player.guild,
              members: newMembersList.length,
              membersList: newMembersList
            },
            savedAt: Date.now()
          }
        })
        return true
      },

      promoteMember: (memberId) => {
        const { player } = get()
        if (!player.guild || player.guild.role !== 'Guildmaster') return false
        const membersList = player.guild.membersList || []
        const newMembersList = membersList.map(m => {
          if (m.id === memberId) {
            return { ...m, role: m.role === 'Member' ? 'Vice Guildmaster' : 'Member' }
          }
          return m
        })

        set({
          player: {
            ...player,
            guild: {
              ...player.guild,
              membersList: newMembersList
            },
            savedAt: Date.now()
          }
        })
        return true
      },

      combineWeapon: (sacrificeUid) => {
        const { player } = get()
        const weapon = player.equipment?.weapon
        if (!weapon) {
          alert(tStore('alert_no_equipped_weapon', {}, player))
          return
        }
        const isEpicOrHigher = (item) => {
          if (!item) return false
          const r = (item.rarityGrade || item.rarity || '').toLowerCase()
          return ['epic', 'legendary', 'mythic', 'ssr', 'ur'].includes(r)
        }

        if (!isEpicOrHigher(weapon)) {
          alert(tStore('alert_epic_or_higher_req', {}, player))
          return
        }
        if (weapon.specialProperty === 'vampire') {
          alert(tStore('alert_already_vampire', {}, player))
          return
        }

        const sacrifice = player.inventory.find(it => it.uid === sacrificeUid)
        if (!sacrifice) {
          alert(tStore('alert_sacrifice_not_found', {}, player))
          return
        }
        if (sacrifice.type !== 'weapon') {
          alert(tStore('alert_sacrifice_must_weapon', {}, player))
          return
        }
        if (!isEpicOrHigher(sacrifice)) {
          alert(tStore('alert_sacrifice_epic_req', {}, player))
          return
        }

        const talicCount = player.inventory
          .filter(it => it.id === 'talic_favor')
          .reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
        const reqTalics = 5
        const reqCrd = 30000

        if (talicCount < reqTalics) {
          alert(tStore('alert_missing_favor', { talics: reqTalics, owned: talicCount }, player))
          return
        }
        if (player.resources.crd < reqCrd) {
          alert(tStore('alert_missing_crd', { crd: reqCrd, owned: player.resources.crd }, player))
          return
        }

        let neededTalics = reqTalics
        const newInventory = []
        for (let i = 0; i < player.inventory.length; i++) {
          const it = player.inventory[i]
          if (it.uid === sacrificeUid) {
            continue
          }
          if (it.id === 'talic_favor' && neededTalics > 0) {
            const currentCount = it.count || it.qty || 1
            if (currentCount <= neededTalics) {
              neededTalics -= currentCount
            } else {
              newInventory.push({
                ...it,
                count: currentCount - neededTalics,
                qty: currentCount - neededTalics
              })
              neededTalics = 0
            }
          } else {
            newInventory.push(it)
          }
        }

        const combinedWeapon = {
          ...weapon,
          specialProperty: 'vampire'
        }

        set({
          player: {
            ...player,
            resources: {
              ...player.resources,
              crd: player.resources.crd - reqCrd
            },
            inventory: newInventory,
            equipment: {
              ...player.equipment,
              weapon: combinedWeapon
            },
            savedAt: Date.now()
          }
        })
      },

      enhanceItem: (slot, useLuckyRelic, arcaniteId) => {
        const { player } = get()
        const item = player.equipment?.[slot]
        if (!item) {
          alert('Tidak ada item terpasang di slot ini.')
          return { success: false, status: 'error' }
        }

        const currentEnhancement = item.enhancement || 0
        if (currentEnhancement >= 8) {
          alert(tStore('alert_max_enhancement', {}, player))
          return { success: false, status: 'error' }
        }

        const requiredArcaniteId = item.arcanite_type || arcaniteId || 'mat_arcanite'

        // Materials verification
        const arcaniteCount = player.inventory
          .filter(it => it.id === requiredArcaniteId)
          .reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
        if (arcaniteCount < 1) {
          alert(tStore('alert_missing_arcanite', { owned: arcaniteCount }, player))
          return { success: false, status: 'error' }
        }

        const DIVINE_CREST_COSTS = [20, 40, 60, 80, 100, 120, 150, 200]
        const crestCost = DIVINE_CREST_COSTS[currentEnhancement]
        const crestCount = player.inventory
          .filter(it => it.id === 'mat_divine_crest')
          .reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
        if (crestCount < crestCost) {
          alert(tStore('alert_missing_crests', { required: crestCost, owned: crestCount }, player))
          return { success: false, status: 'error' }
        }

        if (useLuckyRelic) {
          const relicCount = player.inventory
            .filter(it => it.id === 'mat_lucky_relic')
            .reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
          if (relicCount < 1) {
            alert(tStore('alert_missing_relics', { owned: relicCount }, player))
            return { success: false, status: 'error' }
          }
        }

        // Consume materials
        let neededArcanite = 1
        let neededCrests = crestCost
        let neededRelics = useLuckyRelic ? 1 : 0

        const newInventory = []
        for (let i = 0; i < player.inventory.length; i++) {
          const it = player.inventory[i]
          let currentCount = it.count || it.qty || 1
          
          if (it.id === requiredArcaniteId && neededArcanite > 0) {
            if (currentCount <= neededArcanite) {
              neededArcanite -= currentCount
            } else {
              newInventory.push({
                ...it,
                count: currentCount - neededArcanite,
                qty: currentCount - neededArcanite
              })
              neededArcanite = 0
            }
          } else if (it.id === 'mat_divine_crest' && neededCrests > 0) {
            if (currentCount <= neededCrests) {
              neededCrests -= currentCount
            } else {
              newInventory.push({
                ...it,
                count: currentCount - neededCrests,
                qty: currentCount - neededCrests
              })
              neededCrests = 0
            }
          } else if (useLuckyRelic && it.id === 'mat_lucky_relic' && neededRelics > 0) {
            if (currentCount <= neededRelics) {
              neededRelics -= currentCount
            } else {
              newInventory.push({
                ...it,
                count: currentCount - neededRelics,
                qty: currentCount - neededRelics
              })
              neededRelics = 0
            }
          } else {
            newInventory.push(it)
          }
        }

        // Enhancement math
        // Rates: +1 (100%), +2 (90%), +3 (70%), +4 (50%), +5 (35%), +6 (20%), +7 (10%), +8 (5%)
        const BASE_SUCCESS_RATES = [1.0, 0.9, 0.7, 0.5, 0.35, 0.20, 0.10, 0.05]
        let successChance = BASE_SUCCESS_RATES[currentEnhancement] || 0.0
        if (useLuckyRelic) {
          successChance += 0.10
        }
        // Production PT GM (val >= 99) grants +3% enchant success rate
        if ((player.pt?.production?.val || 0) >= 99) {
          successChance += 0.03
        }
        successChance = Math.min(1.0, successChance)

        const roll = Math.random()
        let isSuccess = roll < successChance

        if (isSuccess) {
          const nextEnhancement = currentEnhancement + 1
          const updatedItem = {
            ...item,
            enhancement: nextEnhancement,
            arcanite_type: requiredArcaniteId
          }

          const newCombatStats = {
            ...(player.combatStats || { totalMonsterKill: 0, dungeonClear: 0, worldBossKill: 0, coreWarVictory: 0, highestEnhancement: 0 }),
          }
          if (nextEnhancement > (newCombatStats.highestEnhancement || 0)) {
            newCombatStats.highestEnhancement = nextEnhancement
          }

          set({
            player: {
              ...player,
              inventory: newInventory,
              equipment: {
                ...player.equipment,
                [slot]: updatedItem
              },
              combatStats: newCombatStats,
              savedAt: Date.now()
            }
          })

          return { success: true, status: 'success', level: nextEnhancement }
        } else {
          // Failure outcome:
          // If current level is 5, 6, or 7 (target level is 6, 7, 8): destruction!
          const isDestructionLevel = currentEnhancement >= 5
          if (isDestructionLevel) {
            const updatedEquipment = { ...player.equipment }
            delete updatedEquipment[slot] // Completely delete item from slot

            set({
              player: {
                ...player,
                inventory: newInventory,
                equipment: updatedEquipment,
                savedAt: Date.now()
              }
            })

            return { success: false, status: 'destroyed', level: 0 }
          } else {
            // Safe level (0 to 4): level remains the same
            set({
              player: {
                ...player,
                inventory: newInventory,
                savedAt: Date.now()
              }
            })
            return { success: false, status: 'fail', level: currentEnhancement }
          }
        }
      },

      craftAscensionArms: (evoData, raceAresName) => {
        const { player } = get()
        const userRace = player.race ? player.race.toLowerCase() : ''
        const userJob = player.job ? player.job.toLowerCase() : ''

        if (userRace === 'arctron') {
          const owned = player.ownedSiegeKits || []
          if (!owned.includes(evoData.id)) {
            alert(`Anda belum memiliki material/item Siege Kit untuk level ini! Beli terlebih dahulu di Parts Shop.`)
            return false
          }
        } else {
          if (player.resources.crd < evoData.cost) {
            alert('CRD tidak cukup!')
            return false
          }
        }

        if (player.level < evoData.levelReq) {
          alert(`Level ${evoData.levelReq} dibutuhkan!`)
          return false
        }

        const allowedJobs = {
          arctron: ['technician', 'architect', 'core_engineer', 'cybermancer'],
          bionex: ['engineer', 'mechanist', 'techmaster', 'overseer'],
          celestra: ['oracle', 'celestial_oracle', 'conjurer', 'divine_summoner']
        }
        const allowedForRace = allowedJobs[userRace] || []
        if (!allowedForRace.includes(userJob)) {
          alert(`Hanya pilot dengan job kelas ${raceAresName === 'ARES' ? 'Technician' : raceAresName === 'M.E.U.' ? 'Engineer' : 'Oracle'} (dan lanjutannya) yang dapat merakit Ascension Arms!`)
          return false
        }

        const newItem = {
          uid: Date.now(),
          id: evoData.id,
          name: evoData.name,
          type: 'ascension_arms',
          rarity: 'ssr', // Always SSR equivalent
          emoji: raceAresName === 'ARES' ? '🤖' : raceAresName === 'M.E.U.' ? '⚙️' : '🌿',
          bonus: {
            atk: evoData.atk || 0,
            hp: evoData.hp || 0,
            crit: evoData.crit || 0,
            atkPercent: evoData.atkPercent || 0,
            defPercent: evoData.defPercent || 0
          },
          isEquipped: true
        }

        const crdCost = userRace === 'arctron' ? 0 : evoData.cost

        set({
          player: {
            ...player,
            resources: {
              ...player.resources,
              crd: player.resources.crd - crdCost
            },
            equipment: {
              ...player.equipment,
              ascension_arms: newItem
            },
            savedAt: Date.now()
          }
        })
        return true
      },

      buySiegeKit: (evoId, cost) => {
        const { player } = get()
        if (player.resources.crd < cost) {
          alert('CRD tidak cukup!')
          return false
        }
        const owned = player.ownedSiegeKits || []
        if (owned.includes(evoId)) {
          alert('Anda sudah membeli Siege Kit ini!')
          return false
        }
        set({
          player: {
            ...player,
            resources: {
              ...player.resources,
              crd: player.resources.crd - cost
            },
            ownedSiegeKits: [...owned, evoId],
            savedAt: Date.now()
          }
        })
        return true
      },

      // ── Archon Purchasing (Premium Shop) ───────────────────
      craftArchonItem: (itemId) => {
        const { player } = get()
        const ARCHON_PRICES = {
          archon_bionex_helmet: 15000,
          archon_bionex_gloves: 15000,
          archon_bionex_boots: 15000,
          archon_bionex_armor: 25000,
          archon_bionex_mantle: 25000,
          archon_bionex_weapon: 25000,

          archon_celestra_helmet: 15000,
          archon_celestra_gloves: 15000,
          archon_celestra_boots: 15000,
          archon_celestra_armor: 25000,
          archon_celestra_mantle: 25000,
          archon_celestra_weapon: 25000,

          archon_arctron_helmet: 15000,
          archon_arctron_gloves: 15000,
          archon_arctron_boots: 15000,
          archon_arctron_armor: 25000,
          archon_arctron_mantle: 25000,
          archon_arctron_weapon: 25000
        }
        const price = ARCHON_PRICES[itemId]
        if (price === undefined) {
          alert(tStore('invalid_item', {}, player))
          return
        }

        const itemTemplate = itemsData.items.find(it => it.id === itemId)
        if (!itemTemplate) {
          alert(tStore('item_not_found', {}, player))
          return
        }
        if (itemTemplate.race !== player.race) {
          alert(tStore('restricted_race', { race: itemTemplate.race.toUpperCase() }, player))
          return
        }

        if (player.resources.crd < price) {
          alert(tStore('need_more_crd', { need: price.toLocaleString(), owned: player.resources.crd.toLocaleString() }, player))
          return
        }


        // Add item to inventory directly without consuming any materials
        const purchasedItem = {
          ...itemTemplate,
          uid: Date.now()
        }
        
        const newInventory = addToInventory(player.inventory, purchasedItem)

        set({
          player: {
            ...player,
            resources: {
              ...player.resources,
              crd: player.resources.crd - price
            },
            inventory: newInventory,
            savedAt: Date.now()
          }
        })
      },

    }),
    {
      name: 'focus-rpg-save',
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState
        if (persistedState.player) {
          // Migrasi nama Faction lama -> baru
          if (persistedState.player.race === 'acreton') persistedState.player.race = 'arctron';
          if (persistedState.player.race === 'belterra') persistedState.player.race = 'bionex';
          if (persistedState.player.race === 'coralis') persistedState.player.race = 'celestra';
        }
        const mergedPlayer = {
          ...currentState.player,
          ...(persistedState.player || {}),
          resources: {
            ...currentState.player?.resources,
            ...(persistedState.player?.resources || {})
          },
          upgrades: {
            ...currentState.player?.upgrades,
            ...(persistedState.player?.upgrades || {})
          },
          equipment: {
            ...currentState.player?.equipment,
            ...(persistedState.player?.equipment || {})
          }
        }
        if (mergedPlayer.race && mergedPlayer.job) {
          const validJobs = jobs[mergedPlayer.race]
            ? [
                ...jobs[mergedPlayer.race].tier1.map(j => j.id),
                ...jobs[mergedPlayer.race].tier2.map(j => j.id),
                ...jobs[mergedPlayer.race].tier3.map(j => j.id),
                ...(jobs[mergedPlayer.race].tier4 ? jobs[mergedPlayer.race].tier4.map(j => j.id) : [])
              ]
            : []
          if (!validJobs.includes(mergedPlayer.job)) {
            mergedPlayer.job = null
          }
        }
        return {
          ...currentState,
          ...persistedState,
          player: mergedPlayer,
          timer: {
            ...currentState.timer,
            ...(persistedState.timer || {})
          },
          battle: {
            ...currentState.battle,
            ...(persistedState.battle || {})
          }
        }
      }
    }
  )
)
