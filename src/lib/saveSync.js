import { apiLoadSave, apiSyncSave, getToken, CLIENT_ID } from './api'

export async function loadSave() {
  try { return await apiLoadSave() }
  catch (e) { console.error('[saveSync] load error:', e.message); return null }
}

export async function syncSave(gameState) {
  try { return await apiSyncSave(gameState) }
  catch (e) { console.error('[saveSync] sync error:', e.message); return null }
}

// SSE realtime — panggil onUpdate tiap save berubah dari device lain
export function subscribeSave(onUpdate) {
  const token = getToken()
  if (!token) return () => {}
  const es = new EventSource(`/api/save/stream?token=${encodeURIComponent(token)}&cid=${CLIENT_ID}`)
  es.onmessage = (e) => {
    try {
      const gameState = JSON.parse(e.data)
      if (gameState) onUpdate(gameState)
    } catch {}
  }
  es.onerror = () => { /* EventSource auto-reconnect */ }
  return () => es.close()
}
