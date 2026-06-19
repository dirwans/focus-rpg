import { useEffect, useRef, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { useAuthStore } from './store/authStore'
import { useTimer } from './hooks/useTimer'
import { loadSave, syncSave, subscribeSave } from './lib/saveSync'
import BottomNav from './components/BottomNav'
import RaceSelect from './components/RaceSelect'
import Auth from './screens/Auth'
import Main from './screens/Main'
import Unit from './screens/Unit'
import Ranks from './screens/Ranks'
import Forge from './screens/Forge'
import Cargo from './screens/Cargo'

const SCREENS = { main: Main, unit: Unit, ranks: Ranks, forge: Forge, cargo: Cargo }

const score = (p) => (p?.totalSessions || 0) * 1000 + (p?.level || 0)

export default function App() {
  useTimer()

  const screen         = useGameStore((s) => s.screen)
  const showRaceSelect = useGameStore((s) => s.showRaceSelect)
  const player         = useGameStore((s) => s.player)
  const loadPlayer     = useGameStore((s) => s.loadPlayer)
  const { user, loading, init } = useAuthStore()

  const playerRef   = useRef(player)
  playerRef.current = player
  const debounceRef = useRef(null)
  const readyRef    = useRef(false)

  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated())

  useEffect(() => { init() }, [])

  useEffect(() => {
    if (hydrated) return
    const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true))
    if (useGameStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  // Load save saat login + hydrated, lalu aktifkan sync
  useEffect(() => {
    if (!user || !hydrated) return
    readyRef.current = false
    loadSave().then((cloud) => {
      const local = playerRef.current
      if (cloud && score(cloud) >= score(local)) loadPlayer(cloud)
      else syncSave(local)
      setTimeout(() => { readyRef.current = true }, 800)
    })
  }, [user?.username, hydrated])

  // Debounced sync tiap player berubah (1.5s)
  useEffect(() => {
    if (!user || !readyRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => syncSave(playerRef.current), 1500)
    return () => clearTimeout(debounceRef.current)
  }, [player, user?.username])

  // SSE realtime — update instan saat device lain nyimpen
  useEffect(() => {
    if (!user) return
    const unsub = subscribeSave((cloud) => {
      if (!readyRef.current) return
      if (score(cloud) > score(playerRef.current)) {
        readyRef.current = false
        loadPlayer(cloud)
        setTimeout(() => { readyRef.current = true }, 800)
      }
    })
    return unsub
  }, [user?.username])

  // Sync saat tab ditutup
  useEffect(() => {
    if (!user) return
    const onUnload = () => syncSave(playerRef.current)
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [user?.username])

  if (loading || !hydrated) {
    return (
      <div style={styles.root}>
        <div style={styles.phone}>
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
      <div style={styles.root}>
        <div style={styles.phone}><Auth /></div>
      </div>
    )
  }

  const Screen = SCREENS[screen] || Main

  return (
    <div style={styles.root}>
      <div style={styles.phone}>
        <div style={styles.content}><Screen /></div>
        <BottomNav />
      </div>
      {showRaceSelect && <RaceSelect />}
    </div>
  )
}

const styles = {
  root:    { minHeight: '100vh', background: '#050810', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 0' },
  phone:   { width: 390, minHeight: 844, maxHeight: '95vh', background: '#080d1a', border: '2px solid #1a3a5c', borderRadius: 40, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  content: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  center:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
}
