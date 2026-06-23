// RF Database Scraper
// Usage: node scripts/scrape-rfdb.js
// Output: scripts/rfdb-raw/weapons.json, armors.json, items.json, monsters.json

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'rfdb-raw')
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

const DELAY_MS = 300  // polite delay
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

const sleep = (ms) => new Promise(r => setTimeout(r, ms + Math.random() * 150))

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT }
    })
    if (!res.ok) return ''
    return await res.text()
  } catch {
    return ''
  }
}

// Extracts both loc and the first image:loc from a sitemap
function extractLocsAndImages(xml) {
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) || []
  return urlBlocks.map(block => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim()
    const image = block.match(/<image:loc>([^<]+)<\/image:loc>/)?.[1]?.trim()
    return { url: loc, image }
  }).filter(item => item.url)
}

function parseWeapon(html, url, image) {
  const name = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || url.split('/').pop()
  const level = html.match(/Required Level[^0-9]*(\d+)/i)?.[1]
  const atkMatch = html.match(/Attack[^0-9]*(\d+)\s*[–\-]\s*(\d+)/i)
  const forceMatch = html.match(/Force Attack[^0-9]*(\d+)\s*[–\-]\s*(\d+)/i)
  const type = html.match(/Type[:\s]+([A-Za-z ]+)/i)?.[1]?.trim()
  const race = html.match(/Race[:\s]+([A-Za-z/ ]+)/i)?.[1]?.trim()

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
    image: image || null
  }
}

function parseArmor(html, url, image) {
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
    image: image || null
  }
}

function parseItem(html, url, image) {
  const name = html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() || url.split('/').pop()
  const type = html.match(/Type[:\s]+([A-Za-z ]+)/i)?.[1]?.trim()
  const desc = html.match(/Description[:\s"]+([^"<\n]{5,200})/i)?.[1]?.trim()

  return {
    name,
    slug: url.split('/').pop(),
    type: type || 'item',
    description: desc || '',
    url,
    image: image || null
  }
}

function parseMonster(html, url, image) {
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
    image: image || null
  }
}

async function scrapeSitemaps(sitemapUrls) {
  const allItems = []
  for (const smUrl of sitemapUrls) {
    console.log(`  Fetching sitemap XML: ${smUrl}`)
    const xml = await fetchPage(smUrl)
    if (xml) {
      const items = extractLocsAndImages(xml)
      allItems.push(...items)
    }
    await sleep(DELAY_MS)
  }
  return allItems
}

async function main() {
  console.log('RF Database Scraper starting (Safely and Politely)...\n')

  // 1. Build a general image mapping from all sitemaps to optimize and avoid scraping pages
  console.log('=== BUILDING IMAGE MAP FROM SITEMAPS ===')
  const sitemaps = [
    // Weapons
    ...Array.from({length: 5}, (_, i) => `https://rfdatabase.net/weapon-sitemap${i+1}.xml`),
    // Armors
    ...Array.from({length: 12}, (_, i) => `https://rfdatabase.net/armor-sitemap${i+1}.xml`),
    // Items
    ...Array.from({length: 6}, (_, i) => `https://rfdatabase.net/item-sitemap${i+1}.xml`),
    // Monsters
    'https://rfdatabase.net/monster-sitemap1.xml',
    'https://rfdatabase.net/monster-sitemap2.xml',
    // Shields / Accessories / Cloaks
    'https://rfdatabase.net/shield-sitemap.xml',
    'https://rfdatabase.net/accessories-sitemap1.xml',
    'https://rfdatabase.net/accessories-sitemap2.xml',
    'https://rfdatabase.net/accessories-sitemap3.xml',
    'https://rfdatabase.net/cloak-sitemap.xml'
  ]

  const sitemapItems = await scrapeSitemaps(sitemaps)
  console.log(`  Collected ${sitemapItems.length} URL-to-Image maps.`)

  const imageMap = new Map()
  for (const item of sitemapItems) {
    if (item.url && item.image) {
      imageMap.set(item.url.toLowerCase(), item.image)
    }
  }

  // 2. WEAPONS - Enriched from imageMap if local raw exists
  const weaponsPath = join(OUT_DIR, 'weapons.json')
  let weapons = []
  if (existsSync(weaponsPath)) {
    console.log('\n=== ENRICHING EXISTING WEAPONS ===')
    weapons = JSON.parse(readFileSync(weaponsPath, 'utf8'))
    let enrichedCount = 0
    for (const w of weapons) {
      const img = imageMap.get(w.url?.toLowerCase())
      if (img) {
        w.image = img
        enrichedCount++
      }
    }
    console.log(`  Enriched ${enrichedCount}/${weapons.length} weapons with images.`)
  } else {
    console.log('\n=== SCRAPING WEAPONS (No local cache found) ===')
    const weaponUrls = sitemapItems.filter(x => x.url.includes('/weapon/'))
    for (let i = 0; i < Math.min(100, weaponUrls.length); i++) { // limit to 100 for dry run/safety if starting fresh
      const item = weaponUrls[i]
      const html = await fetchPage(item.url)
      if (html) weapons.push(parseWeapon(html, item.url, item.image))
      await sleep(DELAY_MS)
    }
  }
  writeFileSync(weaponsPath, JSON.stringify(weapons, null, 2))

  // 3. ARMORS - Enriched from imageMap if local raw exists
  const armorsPath = join(OUT_DIR, 'armors.json')
  let armors = []
  if (existsSync(armorsPath)) {
    console.log('\n=== ENRICHING EXISTING ARMORS ===')
    armors = JSON.parse(readFileSync(armorsPath, 'utf8'))
    let enrichedCount = 0
    for (const a of armors) {
      const img = imageMap.get(a.url?.toLowerCase())
      if (img) {
        a.image = img
        enrichedCount++
      }
    }
    console.log(`  Enriched ${enrichedCount}/${armors.length} armors with images.`)
  } else {
    console.log('\n=== SCRAPING ARMORS (No local cache found) ===')
    const armorUrls = sitemapItems.filter(x => x.url.includes('/armor/'))
    for (let i = 0; i < Math.min(100, armorUrls.length); i++) {
      const item = armorUrls[i]
      const html = await fetchPage(item.url)
      if (html) armors.push(parseArmor(html, item.url, item.image))
      await sleep(DELAY_MS)
    }
  }
  writeFileSync(armorsPath, JSON.stringify(armors, null, 2))

  // 4. MONSTERS - Scrape pages with details since they are empty, but only relevant ones (e.g. up to 150 monsters)
  console.log('\n=== SCRAPING MONSTERS ===')
  const monsterUrls = sitemapItems.filter(x => x.url.includes('/monster/'))
  console.log(`  Found ${monsterUrls.length} monster URLs in sitemaps. Fetching details...`)
  const monsters = []
  // We don't need all 2000 monsters, let's fetch the first 300 monsters (which includes all low and high level main mobs)
  const monsterLimit = Math.min(300, monsterUrls.length)
  for (let i = 0; i < monsterLimit; i++) {
    const item = monsterUrls[i]
    if (i % 20 === 0) console.log(`  [${i}/${monsterLimit}] Fetching: ${item.url.split('/').pop()}`)
    const html = await fetchPage(item.url)
    if (html) {
      monsters.push(parseMonster(html, item.url, item.image))
    }
    await sleep(DELAY_MS)
  }
  writeFileSync(join(OUT_DIR, 'monsters.json'), JSON.stringify(monsters, null, 2))
  console.log(`  Saved ${monsters.length} monsters.`)

  // 5. ITEMS - Scrape basic items from sitemap first 300 to populate items.json
  console.log('\n=== SCRAPING ITEMS ===')
  const itemUrls = sitemapItems.filter(x => x.url.includes('/item/'))
  console.log(`  Found ${itemUrls.length} item URLs in sitemaps. Fetching details...`)
  const items = []
  const itemLimit = Math.min(200, itemUrls.length)
  for (let i = 0; i < itemLimit; i++) {
    const item = itemUrls[i]
    if (i % 20 === 0) console.log(`  [${i}/${itemLimit}] Fetching: ${item.url.split('/').pop()}`)
    const html = await fetchPage(item.url)
    if (html) {
      items.push(parseItem(html, item.url, item.image))
    }
    await sleep(DELAY_MS)
  }
  writeFileSync(join(OUT_DIR, 'items.json'), JSON.stringify(items, null, 2))
  console.log(`  Saved ${items.length} items.`)

  console.log('\nDone! Scraping & Enrichment completed.')
}

main().catch(console.error)
