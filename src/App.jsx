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

  const screen      = useGameStore((s) => s.screen)
  const showRaceSelect = useGameStore((s) => s.showRaceSelect)
  const player      = useGameStore((s) => s.player)
  const loadPlayer  = useGameStore((s) => s.loadPlayer)
  const { user, loading, init } = useAuthStore()

  const playerRef   = useRef(player)
  playerRef.current = player

  const debounceRef = useRef(null)
  const readyRef    = useRef(false)  // true setelah cloud load selesai

  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated())

  useEffect(() => { init() }, [])

  useEffect(() => {
    if (hydrated) return
    const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true))
    if (useGameStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  // Step 1: saat login + hydrated → load cloud, lalu aktifkan sync
  useEffect(() => {
    if (!user || !hydrated) return
    readyRef.current = false
    loadSave(user.id).then((cloud) => {
      const local = playerRef.current
      const score = (p) => (p?.totalSessions || 0) * 1000 + (p?.level || 0)
      if (cloud && score(cloud) >= score(local)) {
        // Cloud lebih maju atau sama → pakai cloud
        loadPlayer(cloud)
      } else {
        // Local lebih maju → push ke cloud sekarang
        syncSave(user.id, local)
      }
      // Baru aktifkan debounced sync setelah 1 detik
      setTimeout(() => { readyRef.current = true }, 1000)
    })
  }, [user?.id, hydrated])

  // Step 2: tiap player berubah → debounce 4 detik → push ke cloud
  useEffect(() => {
    if (!user || !readyRef.current) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      syncSave(user.id, playerRef.current)
    }, 4000)
    return () => clearTimeout(debounceRef.current)
  }, [player, user?.id])

  // Step 3: sync saat tab ditutup
  useEffect(() => {
    if (!user) return
    const onUnload = () => syncSave(user.id, playerRef.current)
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [user?.id])

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
