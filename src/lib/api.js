// Client ID unik per device/tab — biar SSE ga echo balik ke pengirim
let clientId = localStorage.getItem('focus-rpg-client-id')
if (!clientId) {
  clientId = Math.random().toString(36).slice(2) + Date.now().toString(36)
  localStorage.setItem('focus-rpg-client-id', clientId)
}
export const CLIENT_ID = clientId

const TOKEN_KEY = 'focus-rpg-token'
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json', 'X-Client-Id': CLIENT_ID }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const apiRegister = (username, password) => api('/register', { method: 'POST', body: { username, password } })
export const apiLogin    = (username, password) => api('/login',    { method: 'POST', body: { username, password } })
export const apiMe       = () => api('/me')
export const apiLogout   = () => api('/logout', { method: 'POST' })
export const apiLoadSave = () => api('/save').then((d) => d.game_state)
export const apiSyncSave = (gameState) => api('/save', { method: 'POST', body: { game_state: gameState } })
