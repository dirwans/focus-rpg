import { useEffect, useRef, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { useAuthStore } from './store/authStore'
import { useTimer } from './hooks/useTimer'
import { loadSave, syncSave } from './lib/saveSync'
import BottomNav from './components/BottomNav'
import RaceSelect from './components/RaceSelect'
import Auth from './screens/Auth'
import Main from './screens/Main'
import Unit from './screens/Unit'
import Ranks from './screens/Ranks'
import Forge from './screens/Forge'
import Cargo from './screens/Cargo'

const SCREENS = { main: Main, unit: Unit, ranks: Ranks, forge: Forge, cargo: Cargo }

export default function App() {
  useTimer()

  const screen = useGameStore((s) => s.screen)
  const showRaceSelect = useGameStore((s) => s.showRaceSelect)
  const player = useGameStore((s) => s.player)
  const timerState = useGameStore((s) => s.timer.state)
  const loadPlayer = useGameStore((s) => s.loadPlayer)

  const { user, loading, init } = useAuthStore()
  const playerRef = useRef(player)
  playerRef.current = player

  // Track Zustand persist hydration
  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated())

  useEffect(() => {
    if (hydrated) return
    const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true))
    // Fallback: kalau sudah hydrated sebelum subscribe
    if (useGameStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  // Init auth on mount
  useEffect(() => { init() }, [])

  // Load cloud save SETELAH persist hydration selesai + user ready
  // Supabase selalu menang atas localStorage
  useEffect(() => {
    if (!user || !hydrated) return
    loadSave(user.id).then((save) => {
      if (save) {
        console.log('[App] cloud save loaded, overriding local state')
        loadPlayer(save)
      } else {
        console.log('[App] no cloud save found, using local state')
      }
    })
  }, [user?.id, hydrated])

  // Sync saat session selesai (completed)
  useEffect(() => {
    if (!user || timerState !== 'completed') return
    console.log('[App] session complete, syncing to cloud...')
    syncSave(user.id, playerRef.current)
  }, [timerState, user?.id])

  // Auto-sync tiap 60 detik
  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      syncSave(user.id, playerRef.current)
    }, 60000)
    return () => clearInterval(interval)
  }, [user?.id])

  // Sync saat tab/browser ditutup
  useEffect(() => {
    if (!user) return
    const handleUnload = () => syncSave(user.id, playerRef.current)
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [user?.id])

  if (loading || !hydrated) {
    return (
      <div style={styles.root}>
        <div style={styles.phone}>
          <div style={styles.loadingWrap}>
            <div style={{ fontSize: 48 }}>⚡</div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, color: '#00e5ff', letterSpacing: 3, marginTop: 12 }}>LOADING...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={styles.root}>
        <div style={styles.phone}>
          <Auth />
        </div>
      </div>
    )
  }

  const Screen = SCREENS[screen] || Main

  return (
    <div style={styles.root}>
      <div style={styles.phone}>
        <div style={styles.content}>
          <Screen />
        </div>
        <BottomNav />
      </div>
      {showRaceSelect && <RaceSelect />}
    </div>
  )
}

const styles = {
  root: { minHeight: '100vh', background: '#050810', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 0' },
  phone: { width: 390, minHeight: 844, maxHeight: '95vh', background: '#080d1a', border: '2px solid #1a3a5c', borderRadius: 40, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  content: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  loadingWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
}
