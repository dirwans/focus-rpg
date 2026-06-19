import { useEffect, useRef, useState, useCallback } from 'react'
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
  const loadPlayer = useGameStore((s) => s.loadPlayer)

  const { user, loading, init } = useAuthStore()
  const playerRef = useRef(player)
  playerRef.current = player

  const syncTimerRef = useRef(null)
  const loadedRef = useRef(false)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | ok | error

  // Track Zustand persist hydration
  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated())

  useEffect(() => {
    if (hydrated) return
    const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true))
    if (useGameStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  // Init auth on mount
  useEffect(() => { init() }, [])

  // Load cloud save SETELAH persist hydration selesai + user ready
  // Supabase selalu menang atas localStorage
  useEffect(() => {
    if (!user || !hydrated) return
    loadedRef.current = false
    setSyncStatus('syncing')
    loadSave(user.id).then(async (save) => {
      if (save) {
        loadPlayer(save)
      }
      // Selalu upload state terbaru ke cloud saat login
      await syncSave(user.id, save ? save : playerRef.current)
      setSyncStatus('ok')
      setTimeout(() => {
        loadedRef.current = true
        setSyncStatus('idle')
      }, 2000)
    }).catch(() => setSyncStatus('error'))
  }, [user?.id, hydrated])

  // Debounced sync tiap player berubah (3 detik setelah perubahan terakhir)
  useEffect(() => {
    if (!user || !hydrated || !loadedRef.current) return
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    setSyncStatus('idle')
    syncTimerRef.current = setTimeout(async () => {
      setSyncStatus('syncing')
      try {
        await syncSave(user.id, playerRef.current)
        setSyncStatus('ok')
        setTimeout(() => setSyncStatus('idle'), 3000)
      } catch {
        setSyncStatus('error')
      }
    }, 3000)
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [player, user?.id, hydrated])

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
        <div style={styles.syncBar}>
          <span style={styles.syncDot(syncStatus)}>
            {syncStatus === 'syncing' ? '⏳ syncing...' : syncStatus === 'error' ? '🔴 sync error' : '☁️ cloud save'}
          </span>
        </div>
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
  syncBar: { height: 20, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 16, background: '#050d1a' },
  syncDot: (s) => ({ fontFamily: 'monospace', fontSize: 11, letterSpacing: 1, color: s === 'syncing' ? '#f5a623' : s === 'error' ? '#ff4466' : s === 'ok' ? '#00ff88' : '#1a4a6a' }),
  content: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  loadingWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
}
