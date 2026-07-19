import express from 'express'
import XLSX from 'xlsx'
import fs, { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { OAuth2Client } from 'google-auth-library'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 4001
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 hari
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '907888183137-oq3l4kpui0fc2e7rcmu1i76tlk4kmdd0.apps.googleusercontent.com'
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

const app = express()
app.use(express.json({ limit: '10mb' }))

// Custom CORS middleware for Android/Capacitor requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Id')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

// ── Storage paths ──────────────────────────────────────────────────────────
const DATA_DIR      = join(__dirname, 'data')
const USERS_FILE    = join(DATA_DIR, 'users.json')
const SESSIONS_FILE = join(DATA_DIR, 'sessions.json')
const saveFile = (username) => join(DATA_DIR, `save_${username}.json`)

try { mkdirSync(DATA_DIR, { recursive: true }) } catch {}

// ── Users ────────────────────────────────────────────────────────────────────
let users = []
function loadUsers() {
  try { users = JSON.parse(readFileSync(USERS_FILE, 'utf8')) } catch { users = [] }
}
function saveUsers() {
  try { writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)) } catch (e) { console.error('[users] save fail', e) }
}
function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString('hex')
}
function verifyPassword(password, salt, storedHash) {
  try {
    const hash = Buffer.from(scryptSync(password, salt, 64))
    const stored = Buffer.from(storedHash, 'hex')
    return hash.length === stored.length && timingSafeEqual(hash, stored)
  } catch { return false }
}
loadUsers()

// ── Sessions: token → { username, expiresAt } ─────────────────────────────────
const sessions = new Map()
function loadSessions() {
  try {
    const raw = JSON.parse(readFileSync(SESSIONS_FILE, 'utf8'))
    const now = Date.now()
    for (const [token, s] of Object.entries(raw)) {
      if (!s.expiresAt || s.expiresAt > now) sessions.set(token, s)
    }
  } catch {}
}
function saveSessions() {
  const obj = {}
  for (const [token, s] of sessions) obj[token] = s
  try { writeFileSync(SESSIONS_FILE, JSON.stringify(obj)) } catch {}
}
function getSession(req) {
  const auth = req.headers.authorization ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return null
  const s = sessions.get(token)
  if (!s) return null
  if (s.expiresAt && s.expiresAt < Date.now()) { sessions.delete(token); saveSessions(); return null }

  // Guard: pastikan user terdaftar di database
  const userExists = users.some(u => u.username.toLowerCase() === s.username.toLowerCase())
  if (!userExists) {
    sessions.delete(token)
    saveSessions()
    return null
  }

  return s
}
function requireSession(req, res) {
  const s = getSession(req)
  if (!s) { res.status(401).json({ error: 'Sesi habis — login ulang' }); return null }
  return s
}
loadSessions()

// ── Save storage ──────────────────────────────────────────────────────────────
function loadSave(username) {
  try { return JSON.parse(readFileSync(saveFile(username), 'utf8')) } catch { return null }
}
async function writeSave(username, gameState) {
  await writeFile(saveFile(username), JSON.stringify(gameState)).catch((e) => console.error('[save] fail', e))
}

// ── SSE: realtime push per user ────────────────────────────────────────────────
// Map<username, Set<{ res, id }>>
const sseClients = new Map()
function broadcast(username, gameState, exceptId) {
  const set = sseClients.get(username)
  if (!set) return
  const payload = `data: ${JSON.stringify(gameState)}\n\n`
  for (const c of set) {
    if (c.id === exceptId) continue
    try { c.res.write(payload) } catch {}
  }
}


// ── Market Storage ────────────────────────────────────────────────────────────
const MARKET_FILE = join(DATA_DIR, 'market.json')
let marketItems = []
function loadMarket() {
  try { marketItems = JSON.parse(readFileSync(MARKET_FILE, 'utf8')) } catch { marketItems = [] }
}
function saveMarket() {
  try { writeFileSync(MARKET_FILE, JSON.stringify(marketItems, null, 2)) } catch {}
}
loadMarket()


// ── Market Endpoints ────────────────────────────────────────────────────────
app.get('/api/market', (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  res.json({ items: marketItems })
})

app.post('/api/market/sell', async (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  const { item, price } = req.body ?? {}
  if (!item || !price || price < 1) return res.status(400).json({ error: 'Invalid item or price' })

  // Verify 10 listings limit
  const myListings = marketItems.filter(m => m.seller === s.username).length
  if (myListings >= 10) {
    return res.status(400).json({ error: 'Maksimal listing Anda adalah 10 item!' })
  }

  // Verify user has the item
  const sv = loadSave(s.username)
  if (!sv || !sv.inventory) return res.status(400).json({ error: 'No save found' })
  
  const invIdx = sv.inventory.findIndex(i => i.uid === item.uid)
  if (invIdx === -1) return res.status(400).json({ error: 'Item not in inventory' })

  // Remove from inventory
  sv.inventory.splice(invIdx, 1)
  
  // Add to market
  const marketItem = {
    ...item,
    marketId: Math.random().toString(36).slice(2) + Date.now().toString(36),
    seller: s.username,
    price: Math.floor(price),
    listedAt: Date.now()
  }
  marketItems.push(marketItem)
  
  saveMarket()
  sv.savedAt = Date.now()
  await writeSave(s.username, sv)
  broadcast(s.username, sv, null)
  
  res.json({ ok: true, game_state: sv })
})

app.post('/api/market/cancel', async (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  const { marketId } = req.body ?? {}

  const mIdx = marketItems.findIndex(m => m.marketId === marketId)
  if (mIdx === -1) return res.status(404).json({ error: 'Item tidak ditemukan di market' })
  const mItem = marketItems[mIdx]

  if (mItem.seller !== s.username) {
    return res.status(403).json({ error: 'Bukan item milik Anda!' })
  }

  // Remove from market
  marketItems.splice(mIdx, 1)
  saveMarket()

  // Return to inventory
  const sv = loadSave(s.username)
  if (sv) {
    if (!sv.inventory) sv.inventory = []
    const returnedItem = { ...mItem }


    delete returnedItem.marketId
    delete returnedItem.seller
    delete returnedItem.price
    delete returnedItem.listedAt
    returnedItem.uid = Date.now()
    sv.inventory.push(returnedItem)
    sv.savedAt = Date.now()
    await writeSave(s.username, sv)
    broadcast(s.username, sv, null)
    return res.json({ ok: true, game_state: sv })
  }
  res.status(500).json({ error: 'Gagal membatalkan listing' })
})

app.post('/api/market/buy', async (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  const { marketId } = req.body ?? {}
  
  const mIdx = marketItems.findIndex(m => m.marketId === marketId)
  if (mIdx === -1) return res.status(404).json({ error: 'Item not found' })
  const mItem = marketItems[mIdx]
  
  if (mItem.seller === s.username) return res.status(400).json({ error: 'Cannot buy your own item' })
  
  // Verify buyer has enough CRD
  const buyerSv = loadSave(s.username)
  if (!buyerSv || !buyerSv.resources) {
    return res.status(400).json({ error: 'Save file not found or empty!' })
  }
  
  // Migration support
  const buyerCrd = (buyerSv.resources.crd || 0) + (buyerSv.resources.credits || 0)
  buyerSv.resources.credits = 0 // clean up legacy
  buyerSv.resources.crd = buyerCrd

  if (buyerSv.resources.crd < mItem.price) {
    return res.status(400).json({ error: 'CRD tidak cukup!' })
  }
  
  // Subtract CRD, add item
  buyerSv.resources.crd -= mItem.price
  
  // Strip market metadata before giving item
  const purchasedItem = { ...mItem, uid: Date.now() }
  delete purchasedItem.marketId
  delete purchasedItem.seller
  delete purchasedItem.price
  delete purchasedItem.listedAt
  
  buyerSv.inventory.push(purchasedItem)
  buyerSv.savedAt = Date.now()
  
  // Remove from market
  marketItems.splice(mIdx, 1)
  saveMarket()
  await writeSave(s.username, buyerSv)
  broadcast(s.username, buyerSv, null)
  
  // Send mail to seller containing the credits (95% after 5% tax)
  const sellerSv = loadSave(mItem.seller)
  if (sellerSv) {
    if (!sellerSv.mailbox) sellerSv.mailbox = []
    const netCredits = Math.floor(mItem.price * 0.95)
    sellerSv.mailbox.push({
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      type: 'Auction Sold',
      sender: 'Trade Commissioner',
      subject: `Item Sold: ${mItem.name}`,
      body: `Item Anda "${mItem.name}" berhasil terjual seharga ${mItem.price.toLocaleString()} CRD.\nSetelah dipotong pajak transaksi 5% CRD, Anda menerima ${netCredits.toLocaleString()} CRD.`,
      crd: netCredits,
      receivedAt: Date.now()
    })
    sellerSv.savedAt = Date.now()
    await writeSave(mItem.seller, sellerSv)
    broadcast(mItem.seller, sellerSv, null)
  }
  
  res.json({ ok: true, game_state: buyerSv })
})

app.post('/api/mailbox/claim', async (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  const { mailId } = req.body ?? {}

  const sv = loadSave(s.username)
  if (!sv || !sv.mailbox) return res.status(400).json({ error: 'Mailbox kosong' })

  const mIdx = sv.mailbox.findIndex(m => m.id === mailId)
  if (mIdx === -1) return res.status(404).json({ error: 'Mail tidak ditemukan' })
  const mail = sv.mailbox[mIdx]

  // Claim logic
  if (mail.item) {
    if (!sv.inventory) sv.inventory = []
    sv.inventory.push(mail.item)
  }
  if (mail.credits || mail.crd) {
    if (!sv.resources) sv.resources = {}
    const amount = mail.credits || mail.crd || 0
    sv.resources.crd = (sv.resources.crd || 0) + amount
    sv.resources.credits = 0 // clean up legacy
  }

  // Delete mail after claim
  sv.mailbox.splice(mIdx, 1)
  sv.savedAt = Date.now()
  await writeSave(s.username, sv)
  broadcast(s.username, sv, null)

  res.json({ ok: true, game_state: sv })
})

// ── Auth endpoints ──────────────────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  const { username, password } = req.body ?? {}
  if (!username || !password) return res.status(400).json({ error: 'Username & password wajib diisi' })
  if (username.length < 3) return res.status(400).json({ error: 'Username minimal 3 karakter' })
  if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' })
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Username sudah dipakai' })
  }
  const salt = randomBytes(16).toString('hex')
  users.push({ username, passwordHash: hashPassword(password, salt), salt, createdAt: new Date().toISOString() })
  saveUsers()
  const token = randomBytes(24).toString('hex')
  sessions.set(token, { username, expiresAt: Date.now() + SESSION_TTL_MS })
  saveSessions()
  res.json({ ok: true, token, username })
})

// ── Google OAuth endpoint ──────────────────────────────────────────────────────
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body ?? {}
  if (!credential) return res.status(400).json({ error: 'No credential provided' })
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID })
    const payload = ticket.getPayload()
    const googleId = payload.sub
    const displayName = payload.name || payload.email?.split('@')[0] || 'pilot'

    // Find existing user by googleId
    let user = users.find(u => u.googleId === googleId)

    if (!user) {
      // Derive username from Google display name
      let base = displayName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
      if (base.length < 3) base = 'pilot_' + base
      if (base.length > 20) base = base.slice(0, 20)
      let username = base
      let counter = 2
      while (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        username = base + counter; counter++
      }
      user = { username, googleId, passwordHash: null, salt: null, createdAt: new Date().toISOString() }
      users.push(user)
      saveUsers()
    }

    const token = randomBytes(24).toString('hex')
    sessions.set(token, { username: user.username, expiresAt: Date.now() + SESSION_TTL_MS })
    saveSessions()
    res.json({ ok: true, token, username: user.username })
  } catch (e) {
    console.error('[google-auth] verify fail:', e.message)
    res.status(401).json({ error: 'Google token tidak valid' })
  }
})

app.post('/api/login', (req, res) => {
  const { username, password } = req.body ?? {}
  const user = users.find(u => u.username.toLowerCase() === (username ?? '').toLowerCase())
  if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
    return res.status(401).json({ error: 'Username atau password salah' })
  }
  const token = randomBytes(24).toString('hex')
  sessions.set(token, { username: user.username, expiresAt: Date.now() + SESSION_TTL_MS })
  saveSessions()
  res.json({ ok: true, token, username: user.username })
})

app.get('/api/me', (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  res.json({ username: s.username })
})

app.post('/api/logout', (req, res) => {
  const auth = req.headers.authorization ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (token) { sessions.delete(token); saveSessions() }
  res.json({ ok: true })
})

app.get('/api/admin/reset-save/:username', (req, res) => {
  const { username } = req.params
  const savePath = saveFile(username)
  if (fs.existsSync(savePath)) {
    fs.unlinkSync(savePath)
    res.json({ ok: true, message: `Save file for ${username} has been deleted.` })
  } else {
    res.json({ ok: false, message: `Save file for ${username} not found.` })
  }
})

// ── Save endpoints ────────────────────────────────────────────────────────────
app.get('/api/save', (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  checkChipWarReset()
  res.json({
    game_state: loadSave(s.username),
    winnerRace: chipWarData.winnerRace || 'bionex',
    runnerUpRace: chipWarData.runnerUpRace || 'arctron',
    lastPlaceRace: chipWarData.lastPlaceRace || 'celestra'
  })
})

app.post('/api/save', async (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  const gameState = req.body?.game_state
  if (!gameState) return res.status(400).json({ error: 'game_state wajib' })

  // Guard: tolak save yang LEBIH LAMA dari yang tersimpan (cegah clobber lintas device)
  const current = loadSave(s.username)
  const inTs = gameState.savedAt || 0
  const curTs = current?.savedAt || 0

  if (current && inTs < curTs) {
    // kirim balik state terbaru biar pengirim mengoreksi diri
    return res.json({ ok: true, stale: true, game_state: current })
  }

  // Server-side validation for cheating/level jumps
  if (current) {
    const levelDiff = (gameState.level || 1) - (current.level || 1)
    const timeDiffMs = Math.max(1000, Math.abs(Date.now() - curTs))
    
    // Scale allowed level difference based on current level and time difference.
    // Allow faster leveling at lower levels (under lvl 30) where early stages jump levels rapidly.
    const maxHourDiff = current.level < 30 ? 35 : 15
    const timeRatio = Math.min(1, timeDiffMs / 3600000)
    // Always allow at least 15 levels difference as early levels can jump 15 levels in a single 10-minute session!
    const maxAllowedDiff = Math.max(15, Math.floor(maxHourDiff * timeRatio) + 5)

    if (levelDiff > maxAllowedDiff && !gameState.isDeveloper) {
      console.warn(`[Anti-Cheat] User ${s.username} attempted invalid level jump. Current: ${current.level}, Requested: ${gameState.level}, Allowed: ${maxAllowedDiff}`)
      return res.status(400).json({ error: 'Save rejected: Invalid state progression detected.' })
    }
  } else {
    // New user starting condition
    if ((gameState.level || 1) > 2 && !gameState.isDeveloper) {
      console.warn(`[Anti-Cheat] New user ${s.username} attempted to start at level ${gameState.level}`)
      return res.status(400).json({ error: 'Save rejected: Invalid starting state.' })
    }
  }

  await writeSave(s.username, gameState)
  const clientId = req.headers['x-client-id'] || null
  broadcast(s.username, gameState, clientId)
  res.json({
    ok: true,
    winnerRace: chipWarData.winnerRace || 'bionex',
    runnerUpRace: chipWarData.runnerUpRace || 'arctron',
    lastPlaceRace: chipWarData.lastPlaceRace || 'celestra'
  })
})

// SSE stream — token & client id lewat query (EventSource ga bisa set header)
app.get('/api/save/stream', (req, res) => {
  const token = req.query.token
  const s = token ? sessions.get(token) : null
  if (!s || (s.expiresAt && s.expiresAt < Date.now())) {
    res.status(401).end()
    return
  }
  // Guard: pastikan user terdaftar di database
  const userExists = users.some(u => u.username.toLowerCase() === s.username.toLowerCase())
  if (!userExists) {
    if (token) { sessions.delete(token); saveSessions() }
    res.status(401).end()
    return
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // nonaktifkan buffering nginx
  })
  res.write(': connected\n\n')

  const id = randomBytes(8).toString('hex')
  if (!sseClients.has(s.username)) sseClients.set(s.username, new Set())
  sseClients.get(s.username).add({ res, id })

  const keepAlive = setInterval(() => { try { res.write(': ping\n\n') } catch {} }, 25000)

  req.on('close', () => {
    clearInterval(keepAlive)
    const set = sseClients.get(s.username)
    if (set) {
      for (const c of set) if (c.res === res) set.delete(c)
      if (set.size === 0) sseClients.delete(s.username)
    }
  })
})

// ── Admin: key dari data/admin_key.txt (auto-generate, gitignored) ────────────
const ADMIN_KEY_FILE = join(DATA_DIR, 'admin_key.txt')
let ADMIN_KEY = ''
try { ADMIN_KEY = readFileSync(ADMIN_KEY_FILE, 'utf8').trim() } catch {}
if (!ADMIN_KEY) {
  ADMIN_KEY = randomBytes(16).toString('hex')
  try { writeFileSync(ADMIN_KEY_FILE, ADMIN_KEY) } catch {}
  console.log('[admin] generated key:', ADMIN_KEY)
}
function requireAdmin(req, res) {
  if (req.query.key !== ADMIN_KEY) { res.status(403).json({ error: 'forbidden' }); return false }
  return true
}

// Ringkasan seluruh state server — buat debug dari cloud/HP tanpa SSH
app.get('/api/admin/state', (req, res) => {
  if (!requireAdmin(req, res)) return
  const userList = users.map(u => {
    const sv = loadSave(u.username)
    return {
      username: u.username,
      createdAt: u.createdAt,
      save: sv ? {
        race: sv.race, level: sv.level, exp: sv.exp,
        crd: sv.resources?.crd, sector: sv.sector, highestSector: sv.highestSector,
        upgrades: sv.upgrades, totalSessions: sv.totalSessions, totalMinutes: sv.totalMinutes,
        session: sv.__session ?? null, savedAt: sv.savedAt,
      } : null,
    }
  })
  res.json({
    userCount: users.length,
    sessionCount: sessions.size,
    sseConnections: [...sseClients.entries()].map(([u, set]) => ({ username: u, devices: set.size })),
    uptimeSec: Math.floor(process.uptime()),
    users: userList,
  })
})

// Lihat save mentah 1 user
app.get('/api/admin/save/:username', (req, res) => {
  if (!requireAdmin(req, res)) return
  res.json({ username: req.params.username, game_state: loadSave(req.params.username) })
})

// ── Leaderboard (bonus — manfaat server) ────────────────────────────────────
app.get('/api/leaderboard', (_req, res) => {
  const board = users.map(u => {
    const sv = loadSave(u.username)
    if (!sv || !sv.race || sv.race === 'unknown') return null
    return {
      username: u.username,
      level: sv.level ?? 1,
      sector: sv.highestSector ?? 1,
      totalSessions: sv.totalSessions ?? 0,
      totalMinutes: sv.totalMinutes ?? 0,
      cp: sv.cp ?? 1000,
      race: sv.race,
      gender: sv.gender ?? 'male'
    }
  }).filter(Boolean).sort((a, b) => (b.cp || 0) - (a.cp || 0) || b.level - a.level).slice(0, 50)
  res.json({ board })
})

// ── PvP System ─────────────────────────────────────────────────────────────
app.get('/api/pvp/targets', (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  const username = s.username

  // Find users except self
  let targets = users.map(u => {
    if (u.username === username) return null
    const sv = loadSave(u.username)
    if (!sv || !sv.stats) return null
    return {
      username: u.username,
      level: sv.level ?? 1,
      race: sv.race ?? 'unknown',
      job: sv.job ?? null,
      cp: sv.cp ?? 1000,
      stats: sv.stats,
      gender: sv.gender ?? 'male'
    }
  }).filter(Boolean)

  // Shuffle targets and pick top 10 random
  targets = targets.sort(() => 0.5 - Math.random()).slice(0, 10)
  res.json({ targets })
})

app.post('/api/pvp/battle', async (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  const p1Name = s.username
  const { target: p2Name } = req.body
  if (!p2Name) return res.status(400).json({ error: 'invalid payload' })

  const p1Save = loadSave(p1Name)
  const p2Save = loadSave(p2Name)
  if (!p1Save || !p2Save) return res.status(404).json({ error: 'players not found' })

  const p1Stat = p1Save.stats || { hp: 100, atk: 10, def: 5, meleeAtk: 10, rangedAtk: 10, forceAtk: 10, evasion: 0, crit: 0 }
  const p2Stat = p2Save.stats || { hp: 100, atk: 10, def: 5, meleeAtk: 10, rangedAtk: 10, forceAtk: 10, evasion: 0, crit: 0 }

  // Use the highest specific attack stat to simulate their class strength
  const p1_activeAtk = Math.max(p1Stat.atk || 0, p1Stat.meleeAtk || 0, p1Stat.rangedAtk || 0, p1Stat.forceAtk || 0)
  const p2_activeAtk = Math.max(p2Stat.atk || 0, p2Stat.meleeAtk || 0, p2Stat.rangedAtk || 0, p2Stat.forceAtk || 0)

  // Basic damage
  let p1_dmg = Math.max(1, p1_activeAtk - (p2Stat.def || 0))
  let p2_dmg = Math.max(1, p2_activeAtk - (p1Stat.def || 0))
  
  let log = []
  
  // RNG for Miss (Evasion) and Crit
  const p1MissChance = Math.max(0, Math.min(0.7, (p2Stat.evasion || 0))) // Max 70% miss chance
  const p2MissChance = Math.max(0, Math.min(0.7, (p1Stat.evasion || 0)))
  
  let p1Hit = Math.random() > p1MissChance
  let p2Hit = Math.random() > p2MissChance
  
  if (!p1Hit) {
    p1_dmg = 0
    log.push(`${p1Name} attacks but ${p2Name} dodged! (Miss)`)
  } else if (Math.random() < (p1Stat.crit || 0.05)) {
    p1_dmg = Math.floor(p1_dmg * 1.5)
    log.push(`${p1Name} lands a CRITICAL hit! Deals ${p1_dmg} damage.`)
  } else {
    log.push(`${p1Name} attacks! Deals ${p1_dmg} damage.`)
  }
  
  if (!p2Hit) {
    p2_dmg = 0
    log.push(`${p2Name} attacks but ${p1Name} dodged! (Miss)`)
  } else if (Math.random() < (p2Stat.crit || 0.05)) {
    p2_dmg = Math.floor(p2_dmg * 1.5)
    log.push(`${p2Name} lands a CRITICAL hit! Deals ${p2_dmg} damage.`)
  } else {
    log.push(`${p2Name} attacks! Deals ${p2_dmg} damage.`)
  }

  // To prevent infinite loops if both miss, give 1 min dmg if turns go too long,
  // but for simple calculation, we'll use average DPS over time to find turns.
  const p1_dps = p1_activeAtk * (1.0 + (p1Stat.crit || 0.05) * 0.5) * (1.0 - p1MissChance)
  const p2_dps = p2_activeAtk * (1.0 + (p2Stat.crit || 0.05) * 0.5) * (1.0 - p2MissChance)
  
  const p1_eff_dmg = Math.max(1, p1_dps - (p2Stat.def || 0))
  const p2_eff_dmg = Math.max(1, p2_dps - (p1Stat.def || 0))

  const p1_turns = Math.ceil((p2Stat.hp || 1) / p1_eff_dmg)
  const p2_turns = Math.ceil((p1Stat.hp || 1) / p2_eff_dmg)

  const p1_wins = p1_turns <= p2_turns

  p1Save.cp = p1Save.cp || 1000
  p2Save.cp = p2Save.cp || 1000

  if (p1_wins) {
    p1Save.cp += 20
    p2Save.cp -= 10
    p1Save.resources = p1Save.resources || { crd: 0 }
    p1Save.resources.crd += 1500
    log.push(`${p1Name} overpowers ${p2Name} in approx ${p1_turns} rounds!`)
  } else {
    p1Save.cp -= 10
    p2Save.cp += 15
    log.push(`${p1Name} was crushed by ${p2Name} in approx ${p2_turns} rounds!`)
  }

  p2Save.cp = Math.max(0, p2Save.cp)
  p1Save.cp = Math.max(0, p1Save.cp)

  await writeSave(p1Name, p1Save)
  await writeSave(p2Name, p2Save)

  broadcast(p1Name, p1Save)
  broadcast(p2Name, p2Save)

  res.json({
    win: p1_wins,
    log,
    rewards: p1_wins ? { crd: 1500, cp: 20 } : { cp: -10 },
    p1Cp: p1Save.cp,
    p2Cp: p2Save.cp
  })
})

app.get('/api/pvp/war', (req, res) => {
  const scores = { arctron: 0, bionex: 0, celestra: 0 }
  users.forEach(u => {
    const sv = loadSave(u.username)
    if (!sv || !sv.race || !sv.stats) return
    
    // Consider dynamic stats for total power
    const atk = Math.max(sv.stats.atk || 0, sv.stats.meleeAtk || 0, sv.stats.rangedAtk || 0, sv.stats.forceAtk || 0)
    const evasionScore = (sv.stats.evasion || 0) * 100000 // Evasion is 0.0-1.0
    const critScore = (sv.stats.crit || 0) * 100000
    const power = (sv.stats.hp || 0) + atk + (sv.stats.def || 0) + evasionScore + critScore
    
    if (scores[sv.race] !== undefined) {
      scores[sv.race] += power
    }
  })
  res.json({ scores })
})

// ── Chip War System ──────────────────────────────────────────────────────────
// Schedule: 6AM, 12PM, 10PM  (1h countdown + 2h active per wave)
const CHIP_WAR_COUNTDOWN_MS = 60 * 60 * 1000   // 1 hour
const CHIP_WAR_DURATION_MS  = 2 * 60 * 60 * 1000  // 2 hours
const TOWER_HP = 500_000_000  // 500 million

function getNextWarWindow() {
  const now = Date.now()
  const duration = 2 * 60 * 60 * 1000 // 2 hours
  const countdown = 60 * 60 * 1000 // 1 hour

  const today = new Date()
  const candidateHours = [12, 18, 21]
  
  const windows = []
  for (const dayOffset of [-1, 0, 1]) {
    for (const h of candidateHours) {
      const start = new Date(today)
      start.setDate(today.getDate() + dayOffset)
      start.setHours(h, 0, 0, 0)
      const startTime = start.getTime()
      windows.push({
        start: startTime,
        countdownEnd: startTime - countdown,
        end: startTime + duration
      })
    }
  }

  let activeWindow = null
  let nearestWindow = null
  let minDiff = Infinity

  for (const w of windows) {
    if (now >= w.start && now < w.end) {
      activeWindow = w
      break
    }
    if (w.countdownEnd <= now && now < w.start) {
      activeWindow = w
      break
    }
    if (w.countdownEnd > now) {
      const diff = w.countdownEnd - now
      if (diff < minDiff) {
        minDiff = diff
        nearestWindow = w
      }
    }
  }

  if (activeWindow) {
    const isCountdown = now < activeWindow.start
    return {
      phase: isCountdown ? 'countdown' : 'active',
      start: activeWindow.start,
      countdownEnd: activeWindow.countdownEnd,
      end: activeWindow.end
    }
  }

  if (nearestWindow) {
    return {
      phase: 'inactive',
      start: nearestWindow.start,
      countdownEnd: nearestWindow.countdownEnd,
      end: nearestWindow.end
    }
  }

  return { phase: 'inactive', start: 0, countdownEnd: 0, end: 0 }
}

function getPreviousWarWindow() {
  const now = Date.now()
  const duration = 2 * 60 * 60 * 1000
  const countdown = 60 * 60 * 1000
  const today = new Date()
  const candidateHours = [12, 18, 21]
  
  const windows = []
  for (const dayOffset of [-1, 0, 1]) {
    for (const h of candidateHours) {
      const start = new Date(today)
      start.setDate(today.getDate() + dayOffset)
      start.setHours(h, 0, 0, 0)
      const startTime = start.getTime()
      windows.push({
        start: startTime,
        countdownEnd: startTime - countdown,
        end: startTime + duration
      })
    }
  }

  const ended = windows.filter(w => now >= w.end)
  if (ended.length === 0) return null
  ended.sort((a, b) => b.end - a.end)
  return ended[0]
}

let chipWarData = {
  towers: {
    arctron: { hp: TOWER_HP, maxHp: TOWER_HP },
    bionex: { hp: TOWER_HP, maxHp: TOWER_HP },
    celestra:  { hp: TOWER_HP, maxHp: TOWER_HP },
  },
  // Track damage per player per tower (for leaderboard)
  damage: {},   // { username: { arctron: N, bionex: N, celestra: N } }
  // Track total damage RECEIVED per tower (sum of all attackers, any race)
  raceDamage: { arctron: 0, bionex: 0, celestra: 0 },
  // Track total damage DEALT by each attacking race to enemy towers (used to determine the winner)
  raceDealt: { arctron: 0, bionex: 0, celestra: 0 },
  lastReset: 0,
  winnerRace: 'bionex', // Core War winner
  runnerUpRace: 'arctron',
  lastPlaceRace: 'celestra',
}

const CHIP_WAR_FILE = join(__dirname, 'chip_war_data.json')

try {
  if (fs.existsSync(CHIP_WAR_FILE)) {
    const loaded = JSON.parse(fs.readFileSync(CHIP_WAR_FILE, 'utf8'))
    // Validate structure
    if (loaded.towers && loaded.towers.arctron) {
      // Backfill raceDealt for save files persisted before it existed
      if (!loaded.raceDealt) loaded.raceDealt = { arctron: 0, bionex: 0, celestra: 0 }
      chipWarData = loaded
    }
  }
} catch (e) {
  console.error('[ChipWar] Load failed:', e.message)
}

function saveChipWar() {
  try { fs.writeFileSync(CHIP_WAR_FILE, JSON.stringify(chipWarData)) } catch {}
}

// Resets the war state and declares winner/runnerUp/lastPlace.
// `winner` may be pre-decided (instant last-hit destruction) or omitted (ranked by damage dealt to enemies at time-up).
function resolveChipWar(resetTime, winner) {
  const races = ['arctron', 'bionex', 'celestra']
  const dealt = (r) => chipWarData.raceDealt[r] || 0

  let winnerRace = winner
  let remaining = races.filter(r => r !== winnerRace)
  if (!winnerRace) {
    // No tower was destroyed before time ran out — winner is whoever dealt the most damage to enemy towers.
    const ranked = [...races].sort((a, b) => dealt(b) - dealt(a))
    winnerRace = ranked[0]
    remaining = ranked.slice(1)
  }
  remaining.sort((a, b) => dealt(b) - dealt(a))
  const runnerUp = remaining[0]
  const lastPlace = remaining[1]

  chipWarData = {
    towers: {
      arctron: { hp: TOWER_HP, maxHp: TOWER_HP },
      bionex: { hp: TOWER_HP, maxHp: TOWER_HP },
      celestra:  { hp: TOWER_HP, maxHp: TOWER_HP },
    },
    damage: {},
    raceDamage: { arctron: 0, bionex: 0, celestra: 0 },
    raceDealt: { arctron: 0, bionex: 0, celestra: 0 },
    lastReset: resetTime,
    winnerRace: winnerRace || chipWarData.winnerRace || 'bionex',
    runnerUpRace: runnerUp || chipWarData.runnerUpRace || 'arctron',
    lastPlaceRace: lastPlace || chipWarData.lastPlaceRace || 'celestra',
  }
  saveChipWar()
  console.log(`[ChipWar] Faction ${winnerRace} declared winner of Core War!`)
}

function checkChipWarReset() {
  const prev = getPreviousWarWindow()
  if (prev && chipWarData.lastReset < prev.start) {
    console.log(`[ChipWar] Processing end of war starting at ${new Date(prev.start).toLocaleTimeString()}.`)
    // Time ran out with no Trinity Core destroyed — winner ranked by damage dealt to enemy towers.
    resolveChipWar(prev.start)
  }
}

function checkMarketExpirations() {
  const now = Date.now()
  const expirationTime = 24 * 60 * 60 * 1000 // 24 hours
  let changed = false

  for (let i = marketItems.length - 1; i >= 0; i--) {
    const item = marketItems[i]
    if (now - item.listedAt > expirationTime) {
      console.log(`[Auction] Listing expired for ${item.name} (Seller: ${item.seller})`)
      
      // Remove from market list
      marketItems.splice(i, 1)
      changed = true

      // Send item to seller's mailbox
      const sellerSv = loadSave(item.seller)
      if (sellerSv) {
        if (!sellerSv.mailbox) sellerSv.mailbox = []
        const returnedItem = { ...item }
        delete returnedItem.marketId
        delete returnedItem.seller
        delete returnedItem.price
        delete returnedItem.listedAt
        returnedItem.uid = Date.now()

        sellerSv.mailbox.push({
          id: Math.random().toString(36).slice(2) + Date.now().toString(36),
          type: 'Auction Return',
          sender: 'Trade Commissioner',
          subject: `Expired Listing: ${item.name}`,
          body: `Listing Anda untuk "${item.name}" telah kedaluwarsa setelah 24 jam.\nItem telah dikembalikan ke Mailbox Anda.`,
          item: returnedItem,
          receivedAt: Date.now()
        })
        sellerSv.savedAt = Date.now()
        writeSave(item.seller, sellerSv).catch(() => {})
        broadcast(item.seller, sellerSv, null)
      }
    }
  }

  if (changed) {
    saveMarket()
  }
}

// Check reset and expirations
setInterval(checkChipWarReset, 60000)
checkChipWarReset()
setInterval(checkMarketExpirations, 5 * 60 * 1000) // check every 5 mins
checkMarketExpirations()

app.get('/api/chip-war', (req, res) => {
  checkChipWarReset()
  const window = getNextWarWindow()
  res.json({
    towers: chipWarData.towers,
    raceDamage: chipWarData.raceDamage,
    window,
    winnerRace: chipWarData.winnerRace || 'bionex',
    runnerUpRace: chipWarData.runnerUpRace || 'arctron',
    lastPlaceRace: chipWarData.lastPlaceRace || 'celestra',
  })
})

app.post('/api/chip-war/attack', (req, res) => {
  const s = requireSession(req, res)
  if (!s) return

  checkChipWarReset()
  const { towerId } = req.body
  const window = getNextWarWindow()

  if (window.phase !== 'active') {
    return res.status(403).json({ error: 'Chip War is not active' })
  }

  if (!chipWarData.towers[towerId]) {
    return res.status(400).json({ error: 'Invalid tower' })
  }

  const sv = loadSave(s.username)
  if (!sv || !sv.stats) {
    return res.status(400).json({ error: 'Player stats not found' })
  }
  if (!sv.race) {
    return res.status(400).json({ error: 'Race not set' })
  }
  if (towerId === sv.race) {
    return res.status(403).json({ error: 'Tidak bisa menyerang Trinity Core milik bangsa sendiri' })
  }

  // Calculate actual DPS based on saved stats
  const activeAtk = Math.max(sv.stats.atk || 0, sv.stats.meleeAtk || 0, sv.stats.rangedAtk || 0, sv.stats.forceAtk || 0)
  const critMult = 1.0 + (sv.stats.crit || 0.05) * 0.5
  // Tower doesn't evade, but let's just use raw DPS calculation
  const attackPower = Math.floor(activeAtk * critMult * 2.0) // 2x multiplier for Chip War scaling

  const tower = chipWarData.towers[towerId]
  const hpPct = tower.hp / tower.maxHp

  // Damage multiplier based on tower HP %
  let multiplier = 1.0
  if (hpPct <= 0.10) multiplier = 0.30
  else if (hpPct <= 0.30) multiplier = 0.50
  else if (hpPct <= 0.50) multiplier = 0.70

  const actualDmg = Math.floor(attackPower * multiplier)
  const wasAlive = tower.hp > 0
  tower.hp = Math.max(0, tower.hp - actualDmg)

  // Track per-player damage
  const username = s.username
  if (!chipWarData.damage[username]) {
    chipWarData.damage[username] = { arctron: 0, bionex: 0, celestra: 0 }
  }
  chipWarData.damage[username][towerId] = (chipWarData.damage[username][towerId] || 0) + actualDmg
  chipWarData.raceDamage[towerId] = (chipWarData.raceDamage[towerId] || 0) + actualDmg
  chipWarData.raceDealt[sv.race] = (chipWarData.raceDealt[sv.race] || 0) + actualDmg

  // Last Hit: if this attack just destroyed the Trinity Core, the attacker's race
  // instantly wins the Core War — no need to wait for the 2-hour window to end.
  const lastHit = wasAlive && tower.hp <= 0
  if (lastHit) {
    console.log(`[ChipWar] ${sv.race} landed the last hit on ${towerId}'s Trinity Core!`)
    resolveChipWar(Date.now(), sv.race)
    return res.json({
      dealt: actualDmg,
      multiplier,
      hpPct: 0,
      towerHp: 0,
      towerMaxHp: TOWER_HP,
      warEnded: true,
      winnerRace: sv.race,
    })
  }

  saveChipWar()

  res.json({
    dealt: actualDmg,
    multiplier,
    hpPct,
    towerHp: tower.hp,
    towerMaxHp: tower.maxHp,
  })
})

// ── Archon System ─────────────────────────────────────────────────────────
const ARCHON_PERIOD_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

let archonData = {
  endAt: Date.now() + ARCHON_PERIOD_MS,
  archons: { bionex: null, celestra: null, arctron: null },
  votes: { bionex: {}, celestra: {}, arctron: {} }
}

try {
  if (fs.existsSync(join(__dirname, 'archon_data.json'))) {
    archonData = JSON.parse(fs.readFileSync(join(__dirname, 'archon_data.json'), 'utf8'))
  } else {
    fs.writeFileSync(join(__dirname, 'archon_data.json'), JSON.stringify(archonData))
  }
} catch (e) {
  console.error('[Archon] Failed to load archon_data.json', e)
}

function saveArchonData() {
  fs.writeFileSync(join(__dirname, 'archon_data.json'), JSON.stringify(archonData, null, 2))
}

function processArchonElection() {
  console.log('[Archon] Processing elections...')
  const races = ['bionex', 'celestra', 'arctron']
  
  for (const r of races) {
    const voteCounts = {}
    for (const [voter, candidate] of Object.entries(archonData.votes[r] || {})) {
      if (!voteCounts[candidate]) voteCounts[candidate] = 0
      voteCounts[candidate]++
    }
    
    let winner = null
    let maxVotes = 0
    for (const [candidate, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count
        winner = candidate
      }
    }
    
    if (winner) {
      archonData.archons[r] = winner
      console.log(`[Archon] New ${r} Archon: ${winner} with ${maxVotes} votes.`)
    } else {
      archonData.archons[r] = null
    }
  }
  
  archonData.votes = { bionex: {}, celestra: {}, arctron: {} }
  archonData.endAt = Date.now() + ARCHON_PERIOD_MS
  saveArchonData()
}

setInterval(() => {
  if (Date.now() >= archonData.endAt) {
    processArchonElection()
  }
}, 60000)

app.get('/api/archon', (req, res) => {
  const candidates = { bionex: [], celestra: [], arctron: [] }
  users.forEach(u => {
    const sv = loadSave(u.username)
    if (sv && sv.race && sv.level >= 30) {
      candidates[sv.race].push({ username: u.username, cp: sv.cp, level: sv.level, job: sv.job })
    }
  })
  
  const tallies = { bionex: {}, celestra: {}, arctron: {} }
  for (const r of ['bionex', 'celestra', 'arctron']) {
    for (const [voter, candidate] of Object.entries(archonData.votes[r] || {})) {
      if (!tallies[r][candidate]) tallies[r][candidate] = 0
      tallies[r][candidate]++
    }
  }
  
  const s = getSession(req)
  res.json({
    endAt: archonData.endAt,
    archons: archonData.archons,
    candidates,
    tallies,
    myVote: s ? archonData.votes[loadSave(s.username)?.race]?.[s.username] : null
  })
})

app.post('/api/archon/vote', (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  
  const { candidate } = req.body
  const voterSave = loadSave(s.username)
  if (!voterSave || !voterSave.race || voterSave.level < 10) {
    return res.status(400).json({ error: 'Level 10 required to vote.' })
  }
  
  if (candidate) {
    const candidateSave = loadSave(candidate)
    if (!candidateSave || candidateSave.race !== voterSave.race || candidateSave.level < 30) {
      return res.status(400).json({ error: 'Invalid candidate.' })
    }
    archonData.votes[voterSave.race][s.username] = candidate
  } else {
    // Un-vote
    delete archonData.votes[voterSave.race][s.username]
  }
  
  saveArchonData()
  res.json({ success: true })
})

app.post('/api/archon/force-end', (req, res) => {
  processArchonElection()
  res.json({ success: true, newArchons: archonData.archons })
})
app.get('/api/proxy-image', async (req, res) => {
  const imageUrl = req.query.url
  if (!imageUrl) return res.status(400).json({ error: 'url parameter is required' })
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`)
    const contentType = response.headers.get('content-type')
    if (contentType) res.setHeader('Content-Type', contentType)
    res.setHeader('Access-Control-Allow-Origin', '*')
    const arrayBuffer = await response.arrayBuffer()
    res.send(Buffer.from(arrayBuffer))
  } catch (error) {
    console.error('Image proxy error:', error)
    res.status(500).json({ error: 'Failed to fetch image' })
  }
})

// ── Auditor Endpoints ───────────────────────────────────────────────────────
const AUDIT_DRAFTS_FILE = join(DATA_DIR, 'audit_drafts.json')
const DRAFTS_IMG_DIR = join(__dirname, 'public', 'assets', 'drafts')
try { mkdirSync(DRAFTS_IMG_DIR, { recursive: true }) } catch {}

const resolveGearFile = (id) => {
  const idLower = (id || '').toLowerCase();
  if ((idLower.includes('_arc_') || idLower.includes('arctron') || idLower.includes('_arc')) && !idLower.includes('_cor_arc_')) {
    return 'arctron.json';
  } else if (idLower.includes('_bio_') || idLower.includes('bionex') || idLower.includes('_bio')) {
    return 'bionex.json';
  } else if (idLower.includes('_cor_') || idLower.includes('_cel_') || idLower.includes('celestra') || idLower.includes('cora')) {
    return 'celestra.json';
  }
  return 'accessories.json';
};

const syncGearToGameGears = (gearPieceId, stats) => {
  if (!gearPieceId || !stats) return;
  const match = gearPieceId.match(/^set_([a-z]+)_(\d)_([a-z]+)_([a-z]+)/);
  if (!match) return;
  const fact = match[1];
  const tier = match[2];
  const piece = match[3];
  const lin = match[4];

  let race = '';
  let level = '1';
  if (tier === '1') level = '1';
  else if (tier === '2') level = '32';
  else if (tier === '3') level = '42';
  else if (tier === '4') level = '55';
  else if (tier === '5') level = '66';

  let suffix = '';
  if (fact === 'arc') {
    race = 'arctron';
    if (lin === 'warrior') suffix = '';
    else if (lin === 'ranger') suffix = '_ranger';
    else if (lin === 'technician') suffix = '_technician';
  } else if (fact === 'bio') {
    race = 'bionex';
    if (lin === 'guardian') suffix = '';
    else if (lin === 'marksman') suffix = '_marksman';
    else if (lin === 'engineer') suffix = '_engineer';
    else if (lin === 'psion') suffix = '_psion';
  } else if (fact === 'cor') {
    race = 'celestra';
    if (lin === 'sentinel') suffix = '';
    else if (lin === 'pathfinder') suffix = '_ranger';
    else if (lin === 'oracle') suffix = '_summoner';
    else if (lin === 'arcanist') suffix = '_mage';
  }

  const gameItemId = `${piece}_armorset_${race}${suffix}_lv${level}`;
  let gameGearsFile = '';
  if (gameItemId.includes('celestra')) gameGearsFile = join(__dirname, 'src', 'data', 'celestra_gears.json');
  else if (gameItemId.includes('bionex')) gameGearsFile = join(__dirname, 'src', 'data', 'bionex_gears.json');
  else if (gameItemId.includes('arctron')) gameGearsFile = join(__dirname, 'src', 'data', 'arctron_gears.json');

  if (gameGearsFile) {
    try {
      const gameContent = JSON.parse(readFileSync(gameGearsFile, 'utf8'));
      const idx = gameContent.findIndex(i => i.id === gameItemId);
      if (idx >= 0) {
        const cleanStats = {};
        Object.keys(stats).forEach(k => {
          if (typeof stats[k] === 'number' || (typeof stats[k] === 'string' && stats[k].trim() !== '')) {
            const val = parseInt(stats[k], 10);
            if (!isNaN(val)) cleanStats[k] = val;
            else cleanStats[k] = stats[k];
          }
        });
        gameContent[idx].bonus = cleanStats;
        writeFileSync(gameGearsFile, JSON.stringify(gameContent, null, 2));
        console.log(`[audit] Synced gear piece ${gearPieceId} stats to game item ${gameItemId}`);
      }
    } catch (err) {
      console.error(`[audit] Failed to sync gear piece stats to game item:`, err);
    }
  }
};


app.get('/api/audit/all_data', (req, res) => {
  try {
    const SRC_DATA_DIR = join(__dirname, 'src', 'data')
    const readJson = (filename) => {
      try { return JSON.parse(readFileSync(join(SRC_DATA_DIR, filename), 'utf8')) }
      catch { return null }
    }
    const readGear = (filename) => {
      try { return JSON.parse(readFileSync(join(SRC_DATA_DIR, 'gears', filename), 'utf8')) }
      catch { return null }
    }

    let drafts = []
    try { drafts = JSON.parse(readFileSync(AUDIT_DRAFTS_FILE, 'utf8')) } catch {}

    const data = {
      items: (() => {
        const raw = readJson('items.json') || {};
        const arctron = readJson('arctron_gears.json') || [];
        const bionex = readJson('bionex_gears.json') || [];
        const celestra = readJson('celestra_gears.json') || [];
        const universal = readJson('universal_gears.json') || [];
        return {
          items: [
            ...(raw.items || []),
            ...arctron,
            ...bionex,
            ...celestra,
            ...universal
          ],
          materials: raw.materials || []
        };
      })(),
      enemies: readJson('enemies.json'),
      races: readJson('races.json'),
      jobs: readJson('jobs.json'),
      recipes: readJson('recipes.json') || [],
      drafts: drafts || [],
      gears: {
        arctron: readGear('arctron.json'),
        bionex: readGear('bionex.json'),
        celestra: readGear('celestra.json'),
        accessories: readGear('accessories.json')
      }
    }
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'Failed to read data' })
  }
})

app.get('/api/game/gear_coords', (req, res) => {
  try {
    const coordsPath = join(__dirname, 'src', 'data', 'LOCK-GEARS-CALIBRATION.json')
    if (existsSync(coordsPath)) {
      const data = JSON.parse(readFileSync(coordsPath, 'utf8'))
      res.json(data)
    } else {
      res.json({})
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to read coords' })
  }
})

// Recursive listing of public/assets image files, used by animation-lab.html's
// Asset Library panel so gear pieces can be loaded by clicking instead of going
// through the OS file picker every time.
app.get('/api/asset-library', (req, res) => {
  try {
    const baseDir = join(__dirname, 'public', 'assets')
    const IMAGE_EXT = /\.(png|jpg|jpeg|webp|gif)$/i
    const files = []
    function walk(dir, relPath) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const entryRel = relPath ? `${relPath}/${entry.name}` : entry.name
        if (entry.isDirectory()) walk(join(dir, entry.name), entryRel)
        else if (IMAGE_EXT.test(entry.name)) files.push({ path: `/assets/${entryRel}`, name: entry.name, folder: relPath })
      }
    }
    if (existsSync(baseDir)) walk(baseDir, '')
    res.json({ files })
  } catch (err) {
    res.status(500).json({ error: 'Failed to list asset library', message: err.message })
  }
})

app.post('/api/audit/save_gear_coords', (req, res) => {
  const { race, jobLineage, coords } = req.body
  try {
    const coordsPath = join(__dirname, 'src', 'data', 'LOCK-GEARS-CALIBRATION.json')
    let current = {}
    if (existsSync(coordsPath)) {
      current = JSON.parse(readFileSync(coordsPath, 'utf8'))
    }
    
    if (!current[race]) current[race] = {}
    
    // Smart merge: preserve splitSuffix/label/color from existing data
    // if incoming data doesn't have them (prevents Dressing Room from
    // wiping calibration metadata on save)
    const existing = current[race][jobLineage] || {}
    const PRESERVE_KEYS = ['splitSuffix', 'label', 'color']
    const merged = {}
    for (const [slot, newPoints] of Object.entries(coords)) {
      if (!Array.isArray(newPoints)) { merged[slot] = newPoints; continue }
      const oldPoints = existing[slot] || []
      merged[slot] = newPoints.map((pt, i) => {
        const old = oldPoints[i] || {}
        const out = { ...pt }
        for (const key of PRESERVE_KEYS) {
          if (out[key] === undefined && old[key] !== undefined) {
            out[key] = old[key]
          }
        }
        return out
      })
    }
    current[race][jobLineage] = merged
    
    writeFileSync(coordsPath, JSON.stringify(current, null, 2))
    
    // Broadcast via SSE to trigger instant update on all active clients
    const payload = `data: ${JSON.stringify({ type: 'coord_update' })}\n\n`
    for (const [username, set] of sseClients.entries()) {
      for (const c of set) {
        try { c.res.write(payload) } catch {}
      }
    }
    
    res.json({ success: true })
  } catch (err) {
    console.error('[API] Error saving gear coords:', err)
    res.status(500).json({ error: 'Failed to save coords' })
  }
})

app.post('/api/audit/submit', (req, res) => {
  const { pin, data, imageBase64, imageName } = req.body
  if (pin !== '12345') {
    return res.status(401).json({ error: 'PIN Salah!' })
  }

  let drafts = []
  try { drafts = JSON.parse(readFileSync(AUDIT_DRAFTS_FILE, 'utf8')) } catch {}

  let savedImagePath = null
  if (imageBase64 && imageName) {
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const ext = imageName.split('.').pop() || 'png'
      const filename = `draft_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
      writeFileSync(join(DRAFTS_IMG_DIR, filename), buffer)
      savedImagePath = `/assets/drafts/${filename}`
    } catch (e) {
      console.error('[audit] image save fail', e)
    }
  }

  const draftEntry = {
    id: Date.now().toString(),
    submittedAt: new Date().toISOString(),
    image: savedImagePath,
    data: data
  }
  
  drafts.push(draftEntry)
  
  try {
    writeFileSync(AUDIT_DRAFTS_FILE, JSON.stringify(drafts, null, 2))
    res.json({ ok: true, message: 'Berhasil disimpan ke ruang tunggu!' })
  } catch (e) {
    console.error('[audit] data save fail', e)
    res.status(500).json({ error: 'Gagal menyimpan data' })
  }
})

// ── Master Console Direct Endpoints (No-Code GM Tools) ──────────────────────
app.post('/api/audit/upload_asset', (req, res) => {
  const { pin, imageBase64, imageName, subDir } = req.body
  if (pin !== '12345') return res.status(401).json({ error: 'PIN Salah!' })
  if (!imageBase64 || !imageName) return res.status(400).json({ error: 'Gambar tidak valid!' })

  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const safeSubDir = (subDir || '').replace(/\.\./g, '')
    const targetDir = join(__dirname, 'public', 'assets', safeSubDir)
    try { mkdirSync(targetDir, { recursive: true }) } catch {}

    const filename = imageName.replace(/[^a-zA-Z0-9_.-]/g, '_')
    writeFileSync(join(targetDir, filename), buffer)

    // Sync to dist if exists so live app sees it immediately
    try {
      const distDir = join(__dirname, 'dist', 'assets', safeSubDir)
      mkdirSync(distDir, { recursive: true })
      writeFileSync(join(distDir, filename), buffer)
    } catch {}

    const webPath = `/assets/${safeSubDir ? safeSubDir + '/' : ''}${filename}`
    res.json({ ok: true, path: webPath, message: 'Aset berhasil diupload!' })
  } catch (e) {
    console.error('[audit] upload_asset fail', e)
    res.status(500).json({ error: 'Gagal upload gambar ke server' })
  }
})

app.post('/api/audit/save_monster', (req, res) => {
  const { pin, sectorIndex, isDungeon, isBoss, monsterData } = req.body
  if (pin !== '12345') return res.status(401).json({ error: 'PIN Salah!' })

  try {
    const enemiesPath = join(__dirname, 'src', 'data', 'enemies.json')
    const enemies = JSON.parse(readFileSync(enemiesPath, 'utf8'))
    const listKey = isDungeon ? 'dungeons' : 'sectors'
    const targetSector = enemies[listKey] && enemies[listKey][sectorIndex]

    if (!targetSector) return res.status(404).json({ error: 'Sector tidak ditemukan!' })

    if (isBoss) {
      targetSector.boss = { ...targetSector.boss, ...monsterData }
    } else if (monsterData._editIndex !== undefined && targetSector.mobs[monsterData._editIndex]) {
      const idx = monsterData._editIndex
      const clean = { ...monsterData }
      delete clean._editIndex
      targetSector.mobs[idx] = clean
    } else {
      const clean = { ...monsterData }
      delete clean._editIndex
      targetSector.mobs.push(clean)
    }

    writeFileSync(enemiesPath, JSON.stringify(enemies, null, 2))
    res.json({ ok: true, message: 'Candidate Monster berhasil disinkronkan ke enemies.json!' })
  } catch (e) {
    console.error('[audit] save_monster fail', e)
    res.status(500).json({ error: 'Gagal menyimpan monster' })
  }
})


app.post('/api/audit/save_item_direct', (req, res) => {
  const { pin, category, subCategory, itemData } = req.body
  if (pin !== '12345') return res.status(401).json({ error: 'PIN Salah!' })

  try {
    const SRC_DATA_DIR = join(__dirname, 'src', 'data')
    const cleanData = { ...itemData }
    Object.keys(cleanData).forEach(k => { if (k.startsWith('_')) delete cleanData[k] })

    let targetFile = ''
    if (category === 'items') {
      const typeLower = (cleanData.type || '').toLowerCase();
      const raceLower = (cleanData.race || '').toLowerCase();
      const isGear = ['weapon', 'shield', 'armor', 'helmet', 'pants', 'gloves', 'boots', 'cape', 'mantle', 'ring', 'amulet'].includes(typeLower);
      if (isGear) {
        if (raceLower === 'arctron') {
          targetFile = join(SRC_DATA_DIR, 'arctron_gears.json')
        } else if (raceLower === 'bionex') {
          targetFile = join(SRC_DATA_DIR, 'bionex_gears.json')
        } else if (raceLower === 'celestra') {
          targetFile = join(SRC_DATA_DIR, 'celestra_gears.json')
        } else {
          targetFile = join(SRC_DATA_DIR, 'universal_gears.json')
        }
      } else {
        targetFile = join(SRC_DATA_DIR, 'items.json')
      }
    }
    else if (category === 'gears') {
      const fileName = resolveGearFile(cleanData.id || cleanData.code || cleanData.name);
      targetFile = join(SRC_DATA_DIR, 'gears', fileName);
    }
    else if (category === 'races') targetFile = join(SRC_DATA_DIR, 'races.json')
    else if (category === 'jobs') targetFile = join(SRC_DATA_DIR, 'jobs.json')
    else return res.status(400).json({ error: 'Kategori tidak valid' })

    const fileContent = JSON.parse(readFileSync(targetFile, 'utf8'))

    if (Array.isArray(fileContent)) {
      const idx = fileContent.findIndex(i => (i.id && i.id === cleanData.id) || (i.code && i.code === cleanData.code))
      if (idx >= 0) fileContent[idx] = { ...fileContent[idx], ...cleanData }
      else fileContent.push(cleanData)
    } else if (category === 'items') {
      let updated = false;
      if (Array.isArray(fileContent.materials)) {
        const idx = fileContent.materials.findIndex(i => i.id === cleanData.id);
        if (idx >= 0) {
          fileContent.materials[idx] = { ...fileContent.materials[idx], ...cleanData };
          updated = true;
        }
      }
      if (!updated && Array.isArray(fileContent.items)) {
        const idx = fileContent.items.findIndex(i => i.id === cleanData.id);
        if (idx >= 0) {
          fileContent.items[idx] = { ...fileContent.items[idx], ...cleanData };
          updated = true;
        }
      }
      if (!updated) {
        const isMaterialType = cleanData.type === 'material' || (cleanData.id && (cleanData.id.startsWith('ore_') || cleanData.id.startsWith('shard_') || cleanData.id.startsWith('mat_')));
        if (isMaterialType && Array.isArray(fileContent.materials)) {
          fileContent.materials.push(cleanData);
        } else if (Array.isArray(fileContent.items)) {
          fileContent.items.push(cleanData);
        }
      }
    } else if (typeof fileContent === 'object') {
      // Find where key is located
      let updated = false
      const updateRecursive = (obj) => {
        if (!obj || typeof obj !== 'object') return
        if (Array.isArray(obj)) {
          const match = (cleanData.id || '').match(/^(set_[a-z]+_\d+)_(helmet|armor|pants|gloves|boots)/);
          if (match) {
            const parentId = match[1];
            const pieceName = match[2].charAt(0).toUpperCase() + match[2].slice(1);
            const parentIdx = obj.findIndex(i => i.id === parentId);
            if (parentIdx >= 0) {
              if (!obj[parentIdx].stats) obj[parentIdx].stats = {};
              obj[parentIdx].stats[pieceName] = { ...obj[parentIdx].stats[pieceName], ...cleanData.stats };
              updated = true;
              syncGearToGameGears(cleanData.id, cleanData.stats);
              return;
            }
          }
          const idx = obj.findIndex(i => (i.id && i.id === cleanData.id) || (i.name && i.name === cleanData.name))
          if (idx >= 0) { obj[idx] = { ...obj[idx], ...cleanData }; updated = true; }
        } else {
          Object.keys(obj).forEach(k => {
            if (k === cleanData.id || (obj[k] && obj[k].id === cleanData.id)) {
              obj[k] = { ...obj[k], ...cleanData }
              updated = true
            } else {
              updateRecursive(obj[k])
            }
          })
        }
      }
      updateRecursive(fileContent)
    }

    writeFileSync(targetFile, JSON.stringify(fileContent, null, 2))
    res.json({ ok: true, message: 'Balancing stat berhasil disimpan langsung ke database!' })
  } catch (e) {
    console.error('[audit] save_item_direct fail', e)
    res.status(500).json({ error: 'Gagal update database langsung' })
  }
})

app.post('/api/audit/save_recipe', (req, res) => {
  const { pin, recipeData } = req.body
  if (pin !== '12345') return res.status(401).json({ error: 'PIN Salah!' })

  try {
    const recipesPath = join(__dirname, 'src', 'data', 'recipes.json')
    let recipes = []
    try { recipes = JSON.parse(readFileSync(recipesPath, 'utf8')) } catch {}

    const idx = recipes.findIndex(r => r.id === recipeData.id || r.name === recipeData.name)
    if (idx >= 0) recipes[idx] = { ...recipes[idx], ...recipeData, updatedAt: new Date().toISOString() }
    else recipes.push({ ...recipeData, id: recipeData.id || `recipe_${Date.now()}`, updatedAt: new Date().toISOString() })

    writeFileSync(recipesPath, JSON.stringify(recipes, null, 2))
    res.json({ ok: true, message: 'Resep tersimpan & sinkron <=> ke Database & Guides!' })
  } catch (e) {
    console.error('[audit] save_recipe fail', e)
    res.status(500).json({ error: 'Gagal menyimpan resep' })
  }
})

app.post('/api/audit/delete_recipe', (req, res) => {
  const { id } = req.body
  try {
    const recipesPath = join(__dirname, 'src', 'data', 'recipes.json')
    let recipes = []
    try { recipes = JSON.parse(readFileSync(recipesPath, 'utf8')) } catch {}
    
    const newRecipes = recipes.filter(r => r.id !== id)
    writeFileSync(recipesPath, JSON.stringify(newRecipes, null, 2))
    res.json({ ok: true, message: 'Resep berhasil dihapus!' })
  } catch (e) {
    console.error('[audit] delete_recipe fail', e)
    res.status(500).json({ error: 'Gagal menghapus resep' })
  }
})

app.post('/api/audit/publish_draft', (req, res) => {
  const { pin, draftId } = req.body
  if (pin !== '12345') return res.status(401).json({ error: 'PIN Salah!' })

  try {
    let drafts = JSON.parse(readFileSync(AUDIT_DRAFTS_FILE, 'utf8'))
    const draftIdx = drafts.findIndex(d => d.id === draftId)
    if (draftIdx < 0) return res.status(404).json({ error: 'Draft tidak ditemukan!' })

    const draft = drafts[draftIdx]
    const dData = draft.data
    const cat = dData.category
    const sub = dData.subCategory
    let cleanDef = {}
    try { cleanDef = typeof dData.definition === 'string' ? JSON.parse(dData.definition) : dData.definition } catch {}

    const SRC_DATA_DIR = join(__dirname, 'src', 'data')
    if (cat === 'items') {
      const typeLower = (cleanDef.type || '').toLowerCase();
      const raceLower = (cleanDef.race || '').toLowerCase();
      const isGear = ['weapon', 'shield', 'armor', 'helmet', 'pants', 'gloves', 'boots', 'cape', 'mantle', 'ring', 'amulet'].includes(typeLower);
      let p = join(SRC_DATA_DIR, 'items.json')
      
      if (isGear) {
        if (raceLower === 'arctron') {
          p = join(SRC_DATA_DIR, 'arctron_gears.json')
        } else if (raceLower === 'bionex') {
          p = join(SRC_DATA_DIR, 'bionex_gears.json')
        } else if (raceLower === 'celestra') {
          p = join(SRC_DATA_DIR, 'celestra_gears.json')
        } else {
          p = join(SRC_DATA_DIR, 'universal_gears.json')
        }
      }

      const obj = JSON.parse(readFileSync(p, 'utf8'))
      if (Array.isArray(obj)) {
        const idx = obj.findIndex(i => i.id === (cleanDef.id || dData.id))
        if (idx >= 0) obj[idx] = { ...obj[idx], ...cleanDef }
        else obj.push(cleanDef)
        writeFileSync(p, JSON.stringify(obj, null, 2))
      } else {
        let updated = false;
        if (Array.isArray(obj.materials)) {
          const idx = obj.materials.findIndex(i => i.id === (cleanDef.id || dData.id));
          if (idx >= 0) {
            obj.materials[idx] = { ...obj.materials[idx], ...cleanDef };
            updated = true;
          }
        }
        if (!updated && Array.isArray(obj.items)) {
          const idx = obj.items.findIndex(i => i.id === (cleanDef.id || dData.id));
          if (idx >= 0) {
            obj.items[idx] = { ...obj.items[idx], ...cleanDef };
            updated = true;
          }
        }
        if (!updated) {
          const isMaterialType = cleanDef.type === 'material' || (cleanDef.id && (cleanDef.id.startsWith('ore_') || cleanDef.id.startsWith('shard_') || cleanDef.id.startsWith('mat_'))) || (dData.id && (dData.id.startsWith('ore_') || dData.id.startsWith('shard_') || dData.id.startsWith('mat_')));
          if (isMaterialType && Array.isArray(obj.materials)) {
            obj.materials.push(cleanDef);
          } else if (Array.isArray(obj.items)) {
            obj.items.push(cleanDef);
          }
        }
        writeFileSync(p, JSON.stringify(obj, null, 2))
      }
    } else if (cat === 'gears') {
      const fileName = resolveGearFile(cleanDef.id || dData.id || cleanDef.code || cleanDef.name);
      const p = join(SRC_DATA_DIR, 'gears', fileName)
      const obj = JSON.parse(readFileSync(p, 'utf8'))
      const updateRec = (o) => {
        if (Array.isArray(o)) {
          const match = (cleanDef.id || '').match(/^(set_[a-z]+_\d+)_(helmet|armor|pants|gloves|boots)/);
          if (match) {
            const parentId = match[1];
            const pieceName = match[2].charAt(0).toUpperCase() + match[2].slice(1);
            const parentIdx = o.findIndex(i => i.id === parentId);
            if (parentIdx >= 0) {
              if (!o[parentIdx].stats) o[parentIdx].stats = {};
              o[parentIdx].stats[pieceName] = { ...o[parentIdx].stats[pieceName], ...cleanDef.stats };
              syncGearToGameGears(cleanDef.id, cleanDef.stats);
              return;
            }
          }
          const idx = o.findIndex(i => (i.id && i.id === cleanDef.id) || (i.name && i.name === cleanDef.name))
          if (idx >= 0) o[idx] = { ...o[idx], ...cleanDef }
        } else if (o && typeof o === 'object') {
          Object.keys(o).forEach(k => updateRec(o[k]))
        }
      }
      updateRec(obj)
      writeFileSync(p, JSON.stringify(obj, null, 2))
    }

    drafts.splice(draftIdx, 1)
    writeFileSync(AUDIT_DRAFTS_FILE, JSON.stringify(drafts, null, 2))
    res.json({ ok: true, message: 'Draft berhasil di-publish & di-apply ke Live Database!' })
  } catch (e) {
    console.error('[audit] publish_draft fail', e)
    res.status(500).json({ error: 'Gagal publish draft' })
  }
})

app.post('/api/audit/delete_draft', (req, res) => {
  const { pin, draftId } = req.body
  if (pin !== '12345') return res.status(401).json({ error: 'PIN Salah!' })

  try {
    let drafts = JSON.parse(readFileSync(AUDIT_DRAFTS_FILE, 'utf8'))
    drafts = drafts.filter(d => d.id !== draftId)
    writeFileSync(AUDIT_DRAFTS_FILE, JSON.stringify(drafts, null, 2))
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Gagal menghapus draft' })
  }
})

// ── Excel Template Download ───────────────────────────────────────────────────
app.get('/api/audit/excel_template', (req, res) => {
  if (req.query.pin !== '12345') return res.status(401).json({ error: 'PIN Salah!' })
  try {
    const SRC_DATA_DIR = join(__dirname, 'src', 'data')
    const readJson = (f) => { try { return JSON.parse(readFileSync(join(SRC_DATA_DIR, f), 'utf8')) } catch { return null } }
    const readGear = (f) => { try { return JSON.parse(readFileSync(join(SRC_DATA_DIR, 'gears', f), 'utf8')) } catch { return null } }

    const wb = XLSX.utils.book_new()

    // ── Sheet 1: ITEMS ──
    const itemsRaw = readJson('items.json') || {}
    let itemsList = []
    if (Array.isArray(itemsRaw)) {
      itemsList = itemsRaw
    } else {
      itemsList = [
        ...(itemsRaw.items || []),
        ...(itemsRaw.materials || [])
      ]
    }
    const itemsMapForExport = new Map();
    itemsList.forEach(it => {
      if (it && it.id) itemsMapForExport.set(it.id, it);
    });
    const seenNamesForExport = new Set();
    const deduplicatedItemsList = [];
    for (const it of Array.from(itemsMapForExport.values())) {
      const nameLower = (it.name || '').toLowerCase();
      const isOreOrShard = nameLower.includes('ore') || nameLower.includes('shard');
      if (isOreOrShard) {
        if (seenNamesForExport.has(nameLower)) continue;
        seenNamesForExport.add(nameLower);
      }
      deduplicatedItemsList.push(it);
    }

    const itemRows = deduplicatedItemsList.map(it => ({
      id: it.id || '', name: it.name || '', emoji: it.emoji || '',
      type: it.type || '', rarity: it.rarity || '', race: it.race || '',
      level: it.level || 1, image: it.image || '', description: it.description || '',
      bonus_atk: it.bonus?.atk || '', bonus_def: it.bonus?.def || '',
      bonus_hp: it.bonus?.hp || '', bonus_dodge: it.bonus?.dodge || ''
    }))
    if (!itemRows.length) itemRows.push({ id:'', name:'', emoji:'', type:'material', rarity:'common', race:'All', level:1, image:'', description:'', bonus_atk:'', bonus_def:'', bonus_hp:'', bonus_dodge:'' })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemRows), 'ITEMS')

    // ── Sheet 2: GEARS ──
    const gearRows = []
    for (const [faction, file] of [['arctron','arctron.json'],['bionex','bionex.json'],['celestra','celestra.json']]) {
      const g = readGear(file) || {}
      const paths = ['warrior','ranger','technician','guardian','marksman','engineer','psion','sentinel','pathfinder','oracle','arcanist','mage','summoner']
      for (const path of paths) {
        const pathData = g[path]
        if (!pathData) continue
        const weapons = pathData.weapons || (Array.isArray(pathData) ? pathData : [])
        for (const w of weapons) {
          gearRows.push({ id: w.id||'', name: w.name||'', faction, path, level:'', type:'weapon', grade: w.grade||'', atk: w.atk||'', def:'', hp:'', dodge:'', image: w.image||'', race_lock: faction, job_lock: path })
        }
        const armors = pathData.armors || []
        for (const a of armors) {
          gearRows.push({ id: a.id||'', name: a.name||'', faction, path, level: a.level||'', type:'armor', grade: a.grade||'', atk: a.atk||'', def: a.def||'', hp: a.hp||'', dodge:'', image: a.image||'', race_lock: faction, job_lock: path })
        }
      }
      for (const sh of (g.shields||[])) {
        gearRows.push({ id: sh.id||'', name: sh.name||'', faction, path:'', level: sh.level||'', type:'shield', grade: sh.grade||'', atk:'', def: sh.def||'', hp:'', dodge:'', image: sh.image||'', race_lock: faction, job_lock:'' })
      }
    }
    if (!gearRows.length) gearRows.push({ id:'', name:'', faction:'arctron', path:'warrior', level:32, type:'weapon', grade:'Rare', atk:'', def:'', hp:'', dodge:'', image:'', race_lock:'', job_lock:'' })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gearRows), 'GEARS')

    // ── Sheet 3: MOBS ──
    const enemies = readJson('enemies.json') || {}
    const mobRows = []
    for (const sector of (enemies.sectors||[])) {
      for (const mob of (sector.mobs||[])) {
        mobRows.push({ zone_id: sector.id, zone_name: sector.name, zone_minlv: sector.minLevel, zone_maxlv: sector.maxLevel, mob_name: mob.name||'', emoji: mob.emoji||'', hp: mob.hp||'', atk: mob.atk||'', def: mob.def||'', exp: mob.expReward||'', crd: mob.crdReward||'', image: mob.image||'', critical: mob.critical||0, is_boss: false })
      }
      for (const boss of (sector.boss||[])) {
        mobRows.push({ zone_id: sector.id, zone_name: sector.name, zone_minlv: sector.minLevel, zone_maxlv: sector.maxLevel, mob_name: boss.name||'', emoji: boss.emoji||'', hp: boss.hp||'', atk: boss.atk||'', def: boss.def||'', exp: boss.expReward||'', crd: boss.crdReward||'', image: boss.image||'', critical: boss.critical||0, is_boss: true })
      }
    }
    if (!mobRows.length) mobRows.push({ zone_id:1, zone_name:'Lumora Fields', zone_minlv:1, zone_maxlv:12, mob_name:'', emoji:'', hp:'', atk:'', def:'', exp:'', crd:'', image:'', critical:0, is_boss:false })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(mobRows), 'MOBS')

    // ── Sheet 4: DROPS ──
    const dropRows = []
    for (const sector of (enemies.sectors||[])) {
      for (const mob of [...(sector.mobs||[]),...(sector.boss||[])]) {
        for (const drop of (mob.drops||[])) {
          dropRows.push({ zone_id: sector.id, mob_name: mob.name, item_id: drop.item_id||drop.id||'', drop_rate: drop.rate||drop.drop_rate||'', min_qty: drop.min_qty||1, max_qty: drop.max_qty||1 })
        }
      }
    }
    if (!dropRows.length) dropRows.push({ zone_id:1, mob_name:'Puffling', item_id:'mat_scrap', drop_rate:0.15, min_qty:1, max_qty:3 })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dropRows), 'DROPS')

    // ── Sheet 5: SELL_PRICES ──
    const priceRows = [
      { rarity:'C', type:'weapon',  sell_price:50000,   buy_s1:125000, buy_s2:225000, buy_s3:450000, buy_s4:900000, buy_s5:1800000 },
      { rarity:'C', type:'armor',   sell_price:40000,   buy_s1:125000, buy_s2:225000, buy_s3:450000, buy_s4:900000, buy_s5:1800000 },
      { rarity:'C', type:'shield',  sell_price:40000,   buy_s1:100000, buy_s2:180000, buy_s3:360000, buy_s4:720000, buy_s5:1440000 },
      { rarity:'C', type:'helmet',  sell_price:40000,   buy_s1:62500,  buy_s2:112500, buy_s3:225000, buy_s4:450000, buy_s5:900000 },
      { rarity:'C', type:'ring',    sell_price:100000,  buy_s1:'—', buy_s2:'—', buy_s3:'—', buy_s4:'—', buy_s5:'—' },
      { rarity:'C', type:'amulet',  sell_price:100000,  buy_s1:'—', buy_s2:'—', buy_s3:'—', buy_s4:'—', buy_s5:'—' },
      { rarity:'B', type:'weapon',  sell_price:150000,  buy_s1:'—', buy_s2:'—', buy_s3:'—', buy_s4:'—', buy_s5:'—' },
      { rarity:'B', type:'armor',   sell_price:120000,  buy_s1:'—', buy_s2:'—', buy_s3:'—', buy_s4:'—', buy_s5:'—' },
      { rarity:'A', type:'weapon',  sell_price:500000,  buy_s1:'—', buy_s2:'—', buy_s3:'—', buy_s4:'—', buy_s5:'—' },
      { rarity:'S', type:'weapon',  sell_price:2000000, buy_s1:'—', buy_s2:'—', buy_s3:'—', buy_s4:'—', buy_s5:'—' },
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(priceRows), 'SELL_PRICES')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    res.setHeader('Content-Disposition', 'attachment; filename="focus_rpg_template.xlsx"')
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.send(buf)
  } catch (e) {
    console.error('[audit] excel_template fail', e)
    res.status(500).json({ error: 'Gagal generate template' })
  }
})

// ── Excel Import ──────────────────────────────────────────────────────────────
app.post('/api/audit/import_excel', (req, res) => {
  const { pin, fileBase64 } = req.body
  if (pin !== '12345') return res.status(401).json({ error: 'PIN Salah!' })
  if (!fileBase64) return res.status(400).json({ error: 'File tidak valid!' })

  try {
    const SRC_DATA_DIR = join(__dirname, 'src', 'data')
    const readJson = (f) => { try { return JSON.parse(readFileSync(join(SRC_DATA_DIR, f), 'utf8')) } catch { return null } }
    const readGear = (f) => { try { return JSON.parse(readFileSync(join(SRC_DATA_DIR, 'gears', f), 'utf8')) } catch { return null } }
    const saveJson = (f, data) => writeFileSync(join(SRC_DATA_DIR, f), JSON.stringify(data, null, 2), 'utf8')
    const saveGear = (f, data) => writeFileSync(join(SRC_DATA_DIR, 'gears', f), JSON.stringify(data, null, 2), 'utf8')

    const buf = Buffer.from(fileBase64.replace(/^data:[^;]+;base64,/, ''), 'base64')
    const wb = XLSX.read(buf, { type: 'buffer' })
    const sheetToRows = (name) => {
      const ws = wb.Sheets[name]
      return ws ? XLSX.utils.sheet_to_json(ws, { defval: '' }) : []
    }

    const report = { items: 0, gears: 0, mobs: 0, drops: 0, errors: [] }

    // ── ITEMS sheet ──
    const itemRows = sheetToRows('ITEMS')
    if (itemRows.length) {
      const existing = readJson('items.json') || {}
      let existingItems = []
      let existingMaterials = []
      if (Array.isArray(existing)) {
        existingItems = existing.filter(i => i.type !== 'material' && !(i.id && (i.id.startsWith('ore_') || i.id.startsWith('shard_') || i.id.startsWith('mat_'))))
        existingMaterials = existing.filter(i => i.type === 'material' || (i.id && (i.id.startsWith('ore_') || i.id.startsWith('shard_') || i.id.startsWith('mat_'))))
      } else {
        existingItems = existing.items || []
        existingMaterials = existing.materials || []
      }

      const itemsMap = Object.fromEntries(existingItems.map(i => [i.id, i]))
      const matsMap = Object.fromEntries(existingMaterials.map(i => [i.id, i]))

      for (const r of itemRows) {
        if (!r.id) continue
        const bonus = {}
        if (r.bonus_atk) bonus.atk = Number(r.bonus_atk)
        if (r.bonus_def) bonus.def = Number(r.bonus_def)
        if (r.bonus_hp)  bonus.hp  = Number(r.bonus_hp)
        if (r.bonus_dodge) bonus.dodge = Number(r.bonus_dodge)

        const isMaterial = r.type === 'material' || (r.id && (r.id.startsWith('ore_') || r.id.startsWith('shard_') || r.id.startsWith('mat_')));
        const itemObj = {
          id: r.id,
          name: r.name,
          emoji: r.emoji || '',
          type: r.type,
          rarity: r.rarity,
          race: r.race || 'All',
          level: Number(r.level) || 1,
          image: r.image || '',
          description: r.description || '',
          bonus
        }

        if (isMaterial) {
          matsMap[r.id] = { ...(matsMap[r.id] || {}), ...itemObj }
        } else {
          itemsMap[r.id] = { ...(itemsMap[r.id] || {}), ...itemObj }
        }
        report.items++
      }

      const finalResult = {
        items: Object.values(itemsMap),
        materials: Object.values(matsMap)
      }
      saveJson('items.json', finalResult)
    }

    // ── GEARS sheet ──
    const gearRows = sheetToRows('GEARS')
    if (gearRows.length) {
      const gearFiles = { arctron: 'arctron.json', bionex: 'bionex.json', celestra: 'celestra.json' }
      const gearData = {}
      for (const [fac, file] of Object.entries(gearFiles)) gearData[fac] = readGear(file) || {}

      for (const r of gearRows) {
        if (!r.id || !r.faction || !gearData[r.faction]) continue
        const g = gearData[r.faction]
        const item = { id: r.id, name: r.name, grade: r.grade||'Common' }
        if (r.atk)   item.atk   = Number(r.atk)
        if (r.def)   item.def   = Number(r.def)
        if (r.hp)    item.hp    = Number(r.hp)
        if (r.image) item.image = r.image
        if (r.level) item.level = Number(r.level)
        if (r.race_lock) item.race = r.race_lock
        if (r.job_lock)  item.job  = r.job_lock

        if (r.type === 'shield') {
          if (!g.shields) g.shields = []
          const idx = g.shields.findIndex(x => x.id === r.id)
          if (idx >= 0) g.shields[idx] = { ...g.shields[idx], ...item }
          else g.shields.push(item)
        } else if (r.path) {
          if (!g[r.path]) g[r.path] = { weapons: [], armors: [] }
          const arr = r.type === 'weapon' ? (g[r.path].weapons||=[]) : (g[r.path].armors||=[])
          const idx = arr.findIndex(x => x.id === r.id)
          if (idx >= 0) arr[idx] = { ...arr[idx], ...item }
          else arr.push(item)
        }
        report.gears++
      }
      for (const [fac, file] of Object.entries(gearFiles)) saveGear(file, gearData[fac])
    }

    // ── MOBS sheet ──
    const mobRows = sheetToRows('MOBS')
    if (mobRows.length) {
      const enemies = readJson('enemies.json') || { sectors: [], dungeons: [] }
      const sectorMap = Object.fromEntries((enemies.sectors||[]).map(s => [s.id, s]))
      for (const r of mobRows) {
        if (!r.zone_id || !r.mob_name) continue
        if (!sectorMap[r.zone_id]) {
          sectorMap[r.zone_id] = { id: Number(r.zone_id), name: r.zone_name||`Zone ${r.zone_id}`, emoji:'🗺️', type:'map', minLevel: Number(r.zone_minlv)||1, maxLevel: Number(r.zone_maxlv)||99, mobs:[], boss:[] }
        }
        const sec = sectorMap[r.zone_id]
        const mob = { name: r.mob_name, emoji: r.emoji||'👾', hp: Number(r.hp)||100, atk: Number(r.atk)||10, def: Number(r.def)||5, expReward: Number(r.exp)||10, crdReward: Number(r.crd)||5, image: r.image||'', critical: Number(r.critical)||0 }
        const arr = r.is_boss === true || r.is_boss === 'true' || r.is_boss === 1 ? sec.boss : sec.mobs
        const idx = arr.findIndex(x => x.name === r.mob_name)
        if (idx >= 0) arr[idx] = { ...arr[idx], ...mob }
        else arr.push(mob)
        report.mobs++
      }
      enemies.sectors = Object.values(sectorMap).sort((a,b) => a.id - b.id)
      saveJson('enemies.json', enemies)
    }

    // ── DROPS sheet ──
    const dropRows = sheetToRows('DROPS')
    if (dropRows.length) {
      const enemies = readJson('enemies.json') || { sectors: [] }
      for (const r of dropRows) {
        if (!r.mob_name || !r.item_id) continue
        const sector = (enemies.sectors||[]).find(s => s.id == r.zone_id)
        if (!sector) continue
        const mob = [...(sector.mobs||[]),...(sector.boss||[])].find(m => m.name === r.mob_name)
        if (!mob) continue
        if (!mob.drops) mob.drops = []
        const didx = mob.drops.findIndex(d => d.item_id === r.item_id)
        const drop = { item_id: r.item_id, rate: Number(r.drop_rate)||0.1, min_qty: Number(r.min_qty)||1, max_qty: Number(r.max_qty)||1 }
        if (didx >= 0) mob.drops[didx] = drop
        else mob.drops.push(drop)
        report.drops++
      }
      saveJson('enemies.json', enemies)
    }

    res.json({ ok: true, report })
  } catch (e) {
    console.error('[audit] import_excel fail', e)
    res.status(500).json({ error: `Import gagal: ${e.message}` })
  }
})

// ── Serve React build ─────────────────────────────────────────────────────────
// Hashed assets (JS/CSS) can be cached forever; index.html must revalidate
// Serve public assets (gear images, sprites, materials) from public/assets
// Redirect old dressing-room.html → arctron-dressing.html
app.get('/dressing-room.html', (_req, res) => res.redirect(301, '/arctron-dressing.html'))

app.use('/assets', express.static(join(__dirname, 'public', 'assets'), {
  maxAge: '1d',
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
}))
// Hashed assets (JS/CSS) can be cached forever; index.html must revalidate
app.use('/assets', express.static(join(__dirname, 'dist', 'assets'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
}))
app.use(express.static(join(__dirname, 'dist'), {
  maxAge: 0,
  etag: false,
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (filePath.endsWith('.html') || filePath.endsWith('/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
    }
  }
}))
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'not found' })
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, async () => {
  console.log(`[FocusRPG] server running on :${PORT} — ${users.length} user(s)`)
})
