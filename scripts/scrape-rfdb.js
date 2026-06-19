// RF Database Scraper
// Usage: node scripts/scrape-rfdb.js
// Output: scripts/rfdb-raw/weapons.json, armors.json, items.json, monsters.json

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'rfdb-raw')
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const DELAY_MS = 300  // be polite to server

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function fetchXml(url) {
  const res = await fetch(url)
  return res.text()
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (research scraper)' }
    })
    return res.text()
  } catch {
    return ''
  }
}

function extractUrls(xml) {
  return [...xml.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)].map(m => m[1])
}

// Extract data from individual weapon page HTML
function parseWeapon(html, url) {
  const name = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || url.split('/').pop()
  const level = html.match(/Required Level[^0-9]*(\d+)/i)?.[1]
  const atkMatch = html.match(/Attack[^0-9]*(\d+)\s*[–\-]\s*(\d+)/i)
  const forceMatch = html.match(/Force Attack[^0-9]*(\d+)\s*[–\-]\s*(\d+)/i)
  const type = html.match(/Type[:\s]+([A-Za-z ]+)/i)?.[1]?.trim()
  const race = html.match(/Race[:\s]+([A-Za-z/ ]+)/i)?.[1]?.trim()

  // Extract all special effects
  const effects = []
  const effectMatches = html.matchAll(/(?:HP|Defense|Attack|Speed|Critical|Shield)[^<\n]{5,80}/gi)
  for (const m of effectMatches) {
    const text = m[0].replace(/<[^>]+>/g, '').trim()
    if (text.length > 5 && text.length < 100) effects.push(text)
  }

  return {
    name,
    slug: url.split('/').pop(),
    type: type || 'unknown',
    level: level ? parseInt(level) : null,
    atkMin: atkMatch ? parseInt(atkMatch[1]) : null,
    atkMax: atkMatch ? parseInt(atkMatch[2]) : null,
    forceAtkMin: forceMatch ? parseInt(forceMatch[1]) : null,
    forceAtkMax: forceMatch ? parseInt(forceMatch[2]) : null,
    race: race || 'All',
    effects: [...new Set(effects)].slice(0, 5),
    url,
  }
}

function parseArmor(html, url) {
  const name = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || url.split('/').pop()
  const level = html.match(/(?:Required Level|Armor Level)[^0-9]*(\d+)/i)?.[1]
  const defMatch = html.match(/Defense[^0-9]*(\d+)\s*[–\-]\s*(\d+)/i)
  const hpMatch = html.match(/HP[^0-9]*(\d+)/i)
  const race = html.match(/Race[:\s]+([A-Za-z/ ]+)/i)?.[1]?.trim()
  const slot = html.match(/(?:Head|Upper|Lower|Gloves|Shoes)/i)?.[0]

  return {
    name,
    slug: url.split('/').pop(),
    slot: slot || 'unknown',
    level: level ? parseInt(level) : null,
    defMin: defMatch ? parseInt(defMatch[1]) : null,
    defMax: defMatch ? parseInt(defMatch[2]) : null,
    hp: hpMatch ? parseInt(hpMatch[1]) : null,
    race: race || 'All',
    url,
  }
}

function parseItem(html, url) {
  const name = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || url.split('/').pop()
  const type = html.match(/Type[:\s]+([A-Za-z ]+)/i)?.[1]?.trim()
  const desc = html.match(/Description[:\s"]+([^"<\n]{5,200})/i)?.[1]?.trim()

  return {
    name,
    slug: url.split('/').pop(),
    type: type || 'item',
    description: desc || '',
    url,
  }
}

function parseMonster(html, url) {
  const name = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || url.split('/').pop()
  const level = html.match(/Level[^0-9]*(\d+)/i)?.[1]
  const hp = html.match(/HP[^0-9]*(\d+)/i)?.[1]
  const atk = html.match(/Attack[^0-9]*(\d+)/i)?.[1]
  const def = html.match(/Defense[^0-9]*(\d+)/i)?.[1]
  const exp = html.match(/(?:EXP|Experience)[^0-9]*(\d+)/i)?.[1]

  return {
    name,
    slug: url.split('/').pop(),
    level: level ? parseInt(level) : null,
    hp: hp ? parseInt(hp) : null,
    atk: atk ? parseInt(atk) : null,
    def: def ? parseInt(def) : null,
    exp: exp ? parseInt(exp) : null,
    url,
  }
}

async function scrapeCategory(sitemapUrls, parser, label) {
  console.log(`\n=== ${label} ===`)
  const allUrls = []

  for (const smUrl of sitemapUrls) {
    console.log(`  Fetching sitemap: ${smUrl}`)
    const xml = await fetchXml(smUrl)
    const urls = extractUrls(xml)
    allUrls.push(...urls)
    await sleep(DELAY_MS)
  }

  console.log(`  Total URLs: ${allUrls.length}`)
  const results = []

  for (let i = 0; i < allUrls.length; i++) {
    const url = allUrls[i]
    if (i % 20 === 0) console.log(`  [${i}/${allUrls.length}] ${url.split('/').pop()}`)
    const html = await fetchPage(url)
    if (html) results.push(parser(html, url))
    await sleep(DELAY_MS)
  }

  return results
}

async function main() {
  console.log('RF Database Scraper starting...\n')

  // Weapons (5 sitemaps)
  const weapons = await scrapeCategory(
    Array.from({length: 5}, (_, i) => `https://rfdatabase.net/weapon-sitemap${i+1}.xml`),
    parseWeapon, 'WEAPONS'
  )
  writeFileSync(join(OUT_DIR, 'weapons.json'), JSON.stringify(weapons, null, 2))
  console.log(`  Saved ${weapons.length} weapons`)

  // Armors (12 sitemaps)
  const armors = await scrapeCategory(
    Array.from({length: 12}, (_, i) => `https://rfdatabase.net/armor-sitemap${i+1}.xml`),
    parseArmor, 'ARMORS'
  )
  writeFileSync(join(OUT_DIR, 'armors.json'), JSON.stringify(armors, null, 2))
  console.log(`  Saved ${armors.length} armors`)

  // Items (6 sitemaps)
  const items = await scrapeCategory(
    Array.from({length: 6}, (_, i) => `https://rfdatabase.net/item-sitemap${i+1}.xml`),
    parseItem, 'ITEMS'
  )
  writeFileSync(join(OUT_DIR, 'items.json'), JSON.stringify(items, null, 2))
  console.log(`  Saved ${items.length} items`)

  // Monsters (2 sitemaps)
  const monsters = await scrapeCategory(
    ['https://rfdatabase.net/monster-sitemap1.xml', 'https://rfdatabase.net/monster-sitemap2.xml'],
    parseMonster, 'MONSTERS'
  )
  writeFileSync(join(OUT_DIR, 'monsters.json'), JSON.stringify(monsters, null, 2))
  console.log(`  Saved ${monsters.length} monsters`)

  console.log('\nDone! Files saved to scripts/rfdb-raw/')
}

main().catch(console.error)
