import { useEffect, useRef, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { useAuthStore } from './store/authStore'
import { useTimer } from './hooks/useTimer'
import { loadSave, syncSave, subscribeSave } from './lib/saveSync'
import BottomNav from './components/BottomNav'
import races from './data/races.json'
import RaceSelect from './components/RaceSelect'
import Auth from './screens/Auth'
import Main from './screens/Main'
import Unit from './screens/Unit'
import Ranks from './screens/Ranks'
import Forge from './screens/Forge'
import Cargo from './screens/Cargo'

const SCREENS = { main: Main, unit: Unit, ranks: Ranks, forge: Forge, cargo: Cargo }

const snap = (gs) => JSON.stringify(gs ?? {})

export default function App() {
  useTimer()

  const screen         = useGameStore((s) => s.screen)
  const showRaceSelect = useGameStore((s) => s.showRaceSelect)
  const player         = useGameStore((s) => s.player)
  const getSyncState   = useGameStore((s) => s.getSyncState)
  const applySyncState = useGameStore((s) => s.applySyncState)
  const { user, loading, init } = useAuthStore()

  const debounceRef = useRef(null)
  const readyRef    = useRef(false)
  // snapshot terakhir yang sudah sinkron dengan server — anti echo-loop
  const lastSyncRef = useRef('')

  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated())

  useEffect(() => { init() }, [])

  useEffect(() => {
    if (hydrated) return
    const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true))
    if (useGameStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const curPlayer = useGameStore.getState().player
    if (curPlayer.race && !races[curPlayer.race]) {
      useGameStore.setState((s) => ({
        player: {
          ...s.player,
          race: null,
          upgrades: { atk: 0, def: 0, hp: 0 },
          equipment: { weapon: null, armor: null, shield: null }
        }
      }))
    }
  }, [hydrated])

  // Login + hydrated → server jadi sumber kebenaran. Ada save server → pakai itu.
  useEffect(() => {
    if (!user || !hydrated) return
    readyRef.current = false
    loadSave().then((cloud) => {
      if (cloud) {
        applySyncState(cloud)
        lastSyncRef.current = snap(cloud)
      } else {
        const local = getSyncState()
        syncSave(local)
        lastSyncRef.current = snap(local)
      }
      setTimeout(() => { readyRef.current = true }, 600)
    })
  }, [user?.username, hydrated])

  // Sync tiap state berubah (debounce 800ms) — skip kalau sama dgn snapshot terakhir
  useEffect(() => {
    if (!user || !readyRef.current) return
    const cur = snap(getSyncState())
    if (cur === lastSyncRef.current) return // ga ada perubahan riil / baru terima remote
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const gs = getSyncState()
      lastSyncRef.current = snap(gs)
      syncSave(gs).then((resp) => {
        // server nolak karena state kita lebih lama → adopsi yg terbaru
        if (resp?.stale && resp.game_state) {
          lastSyncRef.current = snap(resp.game_state)
          applySyncState(resp.game_state)
        }
      })
    }, 800)
    return () => clearTimeout(debounceRef.current)
  }, [player, user?.username])

  // SSE realtime — device lain nyimpen → selalu terapkan (server source of truth)
  useEffect(() => {
    if (!user) return
    const unsub = subscribeSave((cloud) => {
      const incoming = snap(cloud)
      if (incoming === snap(getSyncState())) return // sudah sama
      lastSyncRef.current = incoming // tandai biar ga di-push balik (anti echo)
      applySyncState(cloud)
    })
    return unsub
  }, [user?.username])

  // Sync saat tab ditutup
  useEffect(() => {
    if (!user) return
    const onUnload = () => syncSave(getSyncState())
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [user?.username])

  if (loading || !hydrated) {
    return (
      <div className="game-root">
        <div className="game-container">
          <div style={styles.center}>
            <div style={{ fontSize: 48 }}>⚡</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, color: '#00e5ff', letterSpacing: 3, marginTop: 12 }}>LOADING...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="game-root">
        <div className="game-container">
          <Auth />
        </div>
      </div>
    )
  }

  const Screen = SCREENS[screen] || Main

  return (
    <div className="game-root">
      <div className="game-container">
        <div style={styles.content}><Screen /></div>
        <BottomNav />
      </div>
      {showRaceSelect && <RaceSelect />}
    </div>
  )
}

const styles = {
  content: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  center:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
}
