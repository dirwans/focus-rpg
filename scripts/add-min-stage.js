/**
 * Script: add-min-stage.js
 * Tambah field `minStage` ke semua item di items.json
 * berdasarkan level & rarity, mengikuti logika RF Online.
 *
 * Run: node scripts/add-min-stage.js
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.resolve(__dirname, '../src/data/items.json')

const data = JSON.parse(readFileSync(filePath, 'utf-8'))

// ── Rarity rank (semakin tinggi = semakin rare = butuh stage lebih tinggi)
const RARITY_STAGE_BONUS = {
  D:   0,
  C:   0,
  B:   1,
  A:   1,
  S:   2,
  SS:  2,
  SSS: 3,  // Harus dari Stage Boss / Pit Boss
  SR:  4,  // Harus dari Stage Boss tinggi / Pit Boss
  SSR: 5,  // Pit Boss only territory
  UR:  6,  // Pit Boss highest stage only
}

// ── Stage dari level item (mirip RF Online level bracket)
function levelToBaseStage(level) {
  if (level <= 5)   return 1
  if (level <= 15)  return 2
  if (level <= 25)  return 3
  if (level <= 35)  return 4
  if (level <= 45)  return 5
  if (level <= 55)  return 6
  if (level <= 65)  return 7
  if (level <= 75)  return 8
  return 9
}

// ── Override manual untuk item special
const SPECIAL_MIN_STAGE = {
  mat_scrap:       1,
  mat_carbon:      2,
  mat_mecha:       4,
  mat_aether:      6,
  mat_warlord:     8,
  raid_ticket:     1,   // Bisa drop dari mana saja (meski rare)
  pot_hp:          1,
  pot_fp:          1,
  ore_yellow:      2,
  ore_blue:        3,
  talic_ignorance: 5,   // RF Online: Talic dari Pit Boss mid-high
  talic_favor:     5,
}

let updated = 0
let skipped = 0

data.items = data.items.map(item => {
  // Kalau sudah ada minStage, skip
  if (item.minStage !== undefined) {
    skipped++
    return item
  }

  // Cek override special
  if (SPECIAL_MIN_STAGE[item.id] !== undefined) {
    updated++
    return { ...item, minStage: SPECIAL_MIN_STAGE[item.id] }
  }

  // Hitung dari level + rarity bonus
  const baseStage = levelToBaseStage(item.level || 1)
  const rarityBonus = RARITY_STAGE_BONUS[item.rarity] ?? 0
  const minStage = Math.min(10, baseStage + rarityBonus)

  updated++
  return { ...item, minStage }
})

writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')

console.log(`✅ Done! Updated ${updated} items, skipped ${skipped} (already had minStage).`)
console.log(`📦 Total items: ${data.items.length}`)
console.log()

// Print sample distribusi
const distrib = {}
data.items.forEach(it => {
  const s = `S${it.minStage}`
  distrib[s] = (distrib[s] || 0) + 1
})
console.log('📊 Distribution minStage:')
Object.keys(distrib).sort().forEach(k => {
  console.log(`  ${k}: ${distrib[k]} items`)
})
