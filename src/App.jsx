import { useEffect } from 'react'
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

  // Init auth on mount
  useEffect(() => { init() }, [])

  // Load cloud save when user logs in
  useEffect(() => {
    if (!user) return
    loadSave(user.id).then((save) => {
      if (save) loadPlayer(save)
    })
  }, [user?.id])

  // Auto-sync save every 30s + on session complete
  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      syncSave(user.id, player)
    }, 30000)
    return () => clearInterval(interval)
  }, [user?.id, player])

  if (loading) {
    return (
      <div style={styles.root}>
        <div style={styles.phone}>
          <div style={styles.loadingWrap}>
            <div style={{ fontSize: 48 }}>⚡</div>
            <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#00e5ff', letterSpacing: 3, marginTop: 12 }}>LOADING...</div>
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
  phone: { width: 390, minHeight: 844, maxHeight: '95vh', background: '#080d1a', border: '1.5px solid #1a3a5c', borderRadius: 40, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 40px rgba(0,180,255,0.15), 0 0 80px rgba(0,80,180,0.08)' },
  content: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  loadingWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
}
