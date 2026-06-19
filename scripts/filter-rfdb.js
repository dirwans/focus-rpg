// Filter & map RF Online data → Focus RPG format
// Usage: node scripts/filter-rfdb.js
// Input:  scripts/rfdb-raw/*.json
// Output: scripts/rfdb-filtered/weapons.json, enemies.json, items.json

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const RAW = join(__dirname, 'rfdb-raw')
const OUT = join(__dirname, 'rfdb-filtered')
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

// ── WEAPONS filter ────────────────────────────────────────────
// Ambil senjata: ada level, ada ATK, bukan event/seasonal
const SKIP_KEYWORDS = ['holiday', 'valentine', 'christmas', 'halloween', 'lunar', 'fish', 'bbq', 'skewer', 'gold-fish', 'snow', 'snowflake', 'mid-autumn', 'senjata-holiday']
const TIER_PRIORITY = { 'baalzebub': 5, 'awakened': 5, 'myth': 5, 'divine': 4, 'sagan': 4, 'saint': 3, 'patron': 3, 'selene': 3, 'darkray': 2, 'leons': 2, 'intense': 1, '': 0 }

function getTier(slug) {
  for (const [key, val] of Object.entries(TIER_PRIORITY)) {
    if (slug.includes(key)) return val
  }
  return 0
}

function slugToName(slug) {
  return slug
    .replace(/-(low|med|medium|high)$/i, '')
    .replace(/-rare-[abcd]$/i, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function cleanEffects(effects) {
  return (effects || [])
    .filter(e => e && e.length > 5 && e.length < 80)
    .filter(e => !e.match(/postid|single-weapon|nav-link|hpriority|breadcrumb|\.net\//i))
    .map(e => e.replace(/<[^>]+>/g, '').replace(/["\\/]/g, '').trim())
    .filter(e => e.length > 5)
    .slice(0, 2)
}

function getWeaponType(slug, type) {
  const s = slug + ' ' + (type || '')
  if (s.match(/knife|saber|blade|sword|estoc|harpe|bullova|beam-saber|beam-sword/i)) return 'sword'
  if (s.match(/bow|siege-bow|gun-bow/i)) return 'bow'
  if (s.match(/vulcan|gatling|rifle|bolt|machine-gun/i)) return 'gun'
  if (s.match(/lance|spear|field-lance/i)) return 'spear'
  if (s.match(/staff|wand|stick-bead/i)) return 'staff'
  if (s.match(/axe|hammer|maul/i)) return 'axe'
  if (s.match(/launcher|bazooka|missile|thrower/i)) return 'launcher'
  return 'other'
}

console.log('Reading weapons...')
const rawWeapons = JSON.parse(readFileSync(join(RAW, 'weapons.json'), 'utf8'))
console.log(`Total raw weapons: ${rawWeapons.length}`)

const filteredWeapons = rawWeapons
  .filter(w => {
    if (!w.name || !w.level || !w.atkMax) return false
    // Skip pure seasonal junk (tapi keep event weapons yang ada stats bagus)
    if (SKIP_KEYWORDS.some(k => w.slug.includes(k))) return false
    if (w.level < 1) return false
    return true
  })
  .map(w => ({
    id: w.slug,
    name: slugToName(w.slug),
    type: getWeaponType(w.slug, w.type),
    tier: getTier(w.slug),
    level: w.level,
    atkMin: w.atkMin,
    atkMax: w.atkMax,
    race: (w.race || 'All').replace(/\s*Required Skill.*/i, '').trim(),
    effects: cleanEffects(w.effects),
  }))
  // Hanya buang duplikat persis (slug sama)
  .filter((w, idx, arr) => arr.findIndex(x => x.id === w.id) === idx)
  .sort((a, b) => a.level - b.level || a.tier - b.tier)

console.log(`Filtered weapons: ${filteredWeapons.length}`)
writeFileSync(join(OUT, 'weapons.json'), JSON.stringify(filteredWeapons, null, 2))

// ── Stats summary ────────────────────────────────────────────
const byType = {}
for (const w of filteredWeapons) {
  byType[w.type] = (byType[w.type] || 0) + 1
}
console.log('By type:', byType)

const byTier = {}
for (const w of filteredWeapons) {
  byTier[w.tier] = (byTier[w.tier] || 0) + 1
}
console.log('By tier:', byTier)

// ── ARMOR filter (kalau sudah ada) ───────────────────────────
if (existsSync(join(RAW, 'armors.json'))) {
  console.log('\nReading armors...')
  const rawArmors = JSON.parse(readFileSync(join(RAW, 'armors.json'), 'utf8'))
  console.log(`Total raw armors: ${rawArmors.length}`)

  const filteredArmors = rawArmors
    .filter(a => a.name && a.level && a.defMax && a.level >= 40)
    .filter(a => !SKIP_KEYWORDS.some(k => a.slug.includes(k)))
    .map(a => ({
      id: a.slug,
      name: a.name,
      slot: a.slot || 'unknown',
      tier: getTier(a.slug),
      level: a.level,
      defMin: a.defMin,
      defMax: a.defMax,
      race: a.race || 'All',
    }))
    .reduce((acc, a) => {
      const baseSlug = a.id.replace(/-(low|med|medium|high|rare-[abcd])$/i, '')
      const existing = acc.find(x => x.id.replace(/-(low|med|medium|high|rare-[abcd])$/i, '') === baseSlug)
      if (!existing || a.tier > existing.tier) {
        return [...acc.filter(x => x.id.replace(/-(low|med|medium|high|rare-[abcd])$/i, '') !== baseSlug), a]
      }
      return acc
    }, [])
    .sort((a, b) => a.level - b.level)

  console.log(`Filtered armors: ${filteredArmors.length}`)
  writeFileSync(join(OUT, 'armors.json'), JSON.stringify(filteredArmors, null, 2))
} else {
  console.log('\nArmors belum selesai di-scrape, skip.')
}

// ── MONSTERS filter (kalau sudah ada) ────────────────────────
if (existsSync(join(RAW, 'monsters.json'))) {
  console.log('\nReading monsters...')
  const rawMonsters = JSON.parse(readFileSync(join(RAW, 'monsters.json'), 'utf8'))
  console.log(`Total raw monsters: ${rawMonsters.length}`)

  const filteredMonsters = rawMonsters
    .filter(m => m.name && m.level && m.hp)
    .map(m => ({
      id: m.slug,
      name: m.name,
      level: m.level,
      hp: m.hp,
      atk: m.atk || Math.floor(m.hp * 0.05),
      def: m.def || Math.floor(m.hp * 0.02),
      exp: m.exp || Math.floor(m.hp * 0.3),
    }))
    .sort((a, b) => a.level - b.level)

  console.log(`Filtered monsters: ${filteredMonsters.length}`)
  writeFileSync(join(OUT, 'monsters.json'), JSON.stringify(filteredMonsters, null, 2))
} else {
  console.log('\nMonsters belum selesai di-scrape, skip.')
}

console.log('\nDone! Output di scripts/rfdb-filtered/')
