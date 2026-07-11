import express from 'express'
import fs, { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
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

// ── Auditor Endpoints ───────────────────────────────────────────────────────
const AUDIT_DRAFTS_FILE = join(DATA_DIR, 'audit_drafts.json')
const DRAFTS_IMG_DIR = join(__dirname, 'public', 'assets', 'drafts')
try { mkdirSync(DRAFTS_IMG_DIR, { recursive: true }) } catch {}

app.get('/api/audit/items', (req, res) => {
  // Returns raw items data for the auditor
  try {
    const rawItems = JSON.parse(readFileSync(join(DATA_DIR, 'items.json'), 'utf8'))
    res.json(rawItems)
  } catch (e) {
    res.status(500).json({ error: 'Failed to read items' })
  }
})

app.post('/api/audit/submit', (req, res) => {
  const { pin, data, imageBase64, imageName } = req.body
  // Simple PIN protection for auditor
  if (pin !== '12345') { // Tuan Muda's PIN
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

// ── Serve React build ─────────────────────────────────────────────────────────
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
