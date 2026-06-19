import express from 'express'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 4001
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 hari

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
    }
  }).sort((a, b) => b.level - a.level || b.totalSessions - a.totalSessions).slice(0, 50)
  res.json({ board })
})

// ── Serve React build ─────────────────────────────────────────────────────────
app.use(express.static(join(__dirname, 'dist')))
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'not found' })
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
