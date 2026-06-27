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
app.use(express.json({ limit: '256kb' }))

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
  await writeSave(s.username, sv)
  broadcast(s.username, sv, null)
  
  res.json({ ok: true, game_state: sv })
})

app.post('/api/market/buy', async (req, res) => {
  const s = requireSession(req, res)
  if (!s) return
  const { marketId } = req.body ?? {}
  
  const mIdx = marketItems.findIndex(m => m.marketId === marketId)
  if (mIdx === -1) return res.status(404).json({ error: 'Item not found' })
  const mItem = marketItems[mIdx]
  
  if (mItem.seller === s.username) return res.status(400).json({ error: 'Cannot buy your own item' })
  
  // Verify buyer has enough anium
  const buyerSv = loadSave(s.username)
  if (!buyerSv || !buyerSv.resources || buyerSv.resources.anium < mItem.price) {
    return res.status(400).json({ error: 'Not enough Anium' })
  }
  
  // Subtract anium, add item
  buyerSv.resources.anium -= mItem.price
  
  // Strip market metadata before giving item
  const purchasedItem = { ...mItem, uid: Date.now() }
  delete purchasedItem.marketId
  delete purchasedItem.seller
  delete purchasedItem.price
  delete purchasedItem.listedAt
  
  buyerSv.inventory.push(purchasedItem)
  
  // Remove from market
  marketItems.splice(mIdx, 1)
  saveMarket()
  await writeSave(s.username, buyerSv)
  broadcast(s.username, buyerSv, null)
  
  // Credit seller (95% after 5% tax)
  const sellerSv = loadSave(mItem.seller)
  if (sellerSv) {
    if (!sellerSv.resources) sellerSv.resources = { anium: 0 }
    sellerSv.resources.anium += Math.floor(mItem.price * 0.95)
    await writeSave(mItem.seller, sellerSv)
    broadcast(mItem.seller, sellerSv, null)
  }
  
  res.json({ ok: true, game_state: buyerSv })
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
  res.json({ game_state: loadSave(s.username) })
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

    if (levelDiff > maxAllowedDiff) {
      console.warn(`[Anti-Cheat] User ${s.username} attempted invalid level jump. Current: ${current.level}, Requested: ${gameState.level}, Allowed: ${maxAllowedDiff}`)
      return res.status(400).json({ error: 'Save rejected: Invalid state progression detected.' })
    }
  } else {
    // New user starting condition
    if ((gameState.level || 1) > 2) {
      console.warn(`[Anti-Cheat] New user ${s.username} attempted to start at level ${gameState.level}`)
      return res.status(400).json({ error: 'Save rejected: Invalid starting state.' })
    }
  }

  await writeSave(s.username, gameState)
  const clientId = req.headers['x-client-id'] || null
  broadcast(s.username, gameState, clientId)
  res.json({ ok: true })
})

// SSE stream — token & client id lewat query (EventSource ga bisa set header)
app.get('/api/save/stream', (req, res) => {
  const token = req.query.token
  const s = token ? sessions.get(token) : null
  if (!s || (s.expiresAt && s.expiresAt < Date.now())) {
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
        anium: sv.resources?.anium, sector: sv.sector, highestSector: sv.highestSector,
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
    return {
      username: u.username,
      level: sv?.level ?? 1,
      sector: sv?.highestSector ?? 1,
      totalSessions: sv?.totalSessions ?? 0,
      totalMinutes: sv?.totalMinutes ?? 0,
      cp: sv?.cp ?? 1000,
      race: sv?.race || 'unknown'
    }
  }).sort((a, b) => (b.cp || 0) - (a.cp || 0) || b.level - a.level).slice(0, 50)
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
      stats: sv.stats
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

  const p1Stat = p1Save.stats || { hp: 100, atk: 10, def: 5 }
  const p2Stat = p2Save.stats || { hp: 100, atk: 10, def: 5 }

  const p1_dmg = Math.max(1, p1Stat.atk - p2Stat.def)
  const p2_dmg = Math.max(1, p2Stat.atk - p1Stat.def)

  const p1_turns = Math.ceil(p2Stat.hp / p1_dmg)
  const p2_turns = Math.ceil(p1Stat.hp / p2_dmg)

  const p1_wins = p1_turns <= p2_turns

  p1Save.cp = p1Save.cp || 1000
  p2Save.cp = p2Save.cp || 1000

  let log = []
  if (p1_wins) {
    p1Save.cp += 20
    p2Save.cp -= 10
    p1Save.resources = p1Save.resources || { anium: 0 }
    p1Save.resources.anium += 1500
    log = [`${p1Name} attacks! Deals ${p1_dmg} damage.`, `${p2Name} attacks! Deals ${p2_dmg} damage.`, `${p1Name} overpowers ${p2Name} in ${p1_turns} rounds!`]
  } else {
    p1Save.cp -= 10
    p2Save.cp += 15
    log = [`${p1Name} attacks! Deals ${p1_dmg} damage.`, `${p2Name} attacks! Deals ${p2_dmg} damage.`, `${p1Name} was crushed by ${p2Name} in ${p2_turns} rounds!`]
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
    rewards: p1_wins ? { anium: 1500, cp: 20 } : { cp: -10 },
    p1Cp: p1Save.cp,
    p2Cp: p2Save.cp
  })
})

app.get('/api/pvp/war', (req, res) => {
  const scores = { acreton: 0, belterra: 0, coralis: 0 }
  users.forEach(u => {
    const sv = loadSave(u.username)
    if (!sv || !sv.race || !sv.stats) return
    const power = sv.stats.hp + sv.stats.atk + sv.stats.def
    if (scores[sv.race] !== undefined) {
      scores[sv.race] += power
    }
  })
  res.json({ scores })
})

// ── Archon System ─────────────────────────────────────────────────────────
const ARCHON_PERIOD_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

let archonData = {
  endAt: Date.now() + ARCHON_PERIOD_MS,
  archons: { belterra: null, coralis: null, acreton: null },
  votes: { belterra: {}, coralis: {}, acreton: {} }
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
  const races = ['belterra', 'coralis', 'acreton']
  
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
  
  archonData.votes = { belterra: {}, coralis: {}, acreton: {} }
  archonData.endAt = Date.now() + ARCHON_PERIOD_MS
  saveArchonData()
}

setInterval(() => {
  if (Date.now() >= archonData.endAt) {
    processArchonElection()
  }
}, 60000)

app.get('/api/archon', (req, res) => {
  const candidates = { belterra: [], coralis: [], acreton: [] }
  users.forEach(u => {
    const sv = loadSave(u.username)
    if (sv && sv.race && sv.level >= 30) {
      candidates[sv.race].push({ username: u.username, cp: sv.cp, level: sv.level, job: sv.job })
    }
  })
  
  const tallies = { belterra: {}, coralis: {}, acreton: {} }
  for (const r of ['belterra', 'coralis', 'acreton']) {
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
  try {
    const ironewanSave = loadSave('ironewan')
    if (ironewanSave && ironewanSave.level === 1) {
      const updated = {
        ...ironewanSave,
        level: 4,
        exp: 0,
        sector: 2,
        highestSector: 2,
        resources: {
          ...ironewanSave.resources,
          anium: (ironewanSave.resources?.anium || 200) + 3829
        },
        savedAt: Date.now()
      }
      await writeSave('ironewan', updated)
      console.log('[restore] ironewan character progress successfully restored to Level 4 & 4029 Anium')
    }
  } catch (e) {
    console.error('[restore] failed to auto-restore ironewan:', e)
  }
})
