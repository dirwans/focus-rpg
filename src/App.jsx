import { useEffect, useRef, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { useAuthStore } from './store/authStore'
import { useTimer } from './hooks/useTimer'
import { loadSave, syncSave, subscribeSave } from './lib/saveSync'
import { apiGetArchon } from './lib/api'
import BottomNav from './components/BottomNav'
import races from './data/races.json'
import RaceSelect from './components/RaceSelect'
import Auth from './screens/Auth'
import Main from './screens/Main'
import Unit from './screens/Unit'
import Ranks from './screens/Ranks'
import Forge from './screens/Forge'
import Cargo from './screens/Cargo'
import Trade from './screens/Trade'
import Battle from './screens/Battle'

const SCREENS = { main: Main, unit: Unit, ranks: Ranks, forge: Forge, cargo: Cargo, trade: Trade, battle: Battle }

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
    
    // Migration from old names
    const raceMap = { 
      'accretians': 'acreton', 'accretia': 'acreton', 'acreton': 'acreton',
      'bellians': 'belterra', 'bellato': 'belterra', 'belterra': 'belterra',
      'corvus': 'coralis', 'cora': 'coralis', 'coralis': 'coralis'
    }
    
    let nextPlayer = { ...curPlayer }
    let dirty = false
    
    if (nextPlayer.race && raceMap[nextPlayer.race]) {
      nextPlayer.race = raceMap[nextPlayer.race]
      dirty = true
    }
    
    if (nextPlayer.inventory) {
       nextPlayer.inventory = nextPlayer.inventory.map(i => raceMap[i.race] ? { ...i, race: raceMap[i.race] } : i)
       dirty = true
    }
    if (nextPlayer.equipment) {
       nextPlayer.equipment = { ...nextPlayer.equipment }
       if (nextPlayer.equipment.weapon && raceMap[nextPlayer.equipment.weapon.race]) { nextPlayer.equipment.weapon.race = raceMap[nextPlayer.equipment.weapon.race]; dirty = true; }
       if (nextPlayer.equipment.armor && raceMap[nextPlayer.equipment.armor.race]) { nextPlayer.equipment.armor.race = raceMap[nextPlayer.equipment.armor.race]; dirty = true; }
       if (nextPlayer.equipment.shield && raceMap[nextPlayer.equipment.shield.race]) { nextPlayer.equipment.shield.race = raceMap[nextPlayer.equipment.shield.race]; dirty = true; }
    }

    if (dirty) {
      useGameStore.setState((s) => ({ player: nextPlayer }))
      return
    }

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
    // Immediately wipe stale state from previous user so nothing bleeds through during load
    useGameStore.setState((s) => ({
      player: { ...s.player, username: user.username, name: user.username, race: null },
    }))
    localStorage.removeItem('focus-rpg-save')
    loadSave().then((cloud) => {
      if (cloud) {
        // Force-apply correct username/name regardless of what's stored on server
        const correctedCloud = { ...cloud, username: user.username, name: user.username }
        applySyncState(correctedCloud)
        lastSyncRef.current = snap(correctedCloud)
      } else {
        // New user — reset to fresh state with correct username, do NOT use stale local state
        const freshState = {
          name: user.username,
          username: user.username,
          race: null,
          job: null,
          level: 1,
          exp: 0,
          resources: { anium: 200, credits: 10, potions: 5 },
          upgrades: { atk: 0, def: 0, hp: 0 },
          equipment: { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null },
          sector: 1,
          highestSector: 1,
          streak: 0,
          lastSessionDate: null,
          inventory: [],
          totalSessions: 0,
          totalMinutes: 0,
          savedAt: Date.now(),
          language: 'en',
        }
        useGameStore.setState((s) => ({ player: freshState }))
        syncSave({ ...freshState })
        lastSyncRef.current = snap(freshState)
      }
      setTimeout(() => { readyRef.current = true }, 600)
    })
    
    // Load archon data early to apply Auras & Mantles
    apiGetArchon().then(res => {
      if (res && res.archons) {
        useGameStore.getState().setArchons(res.archons)
      }
    }).catch(e => console.error('[Archon] fetch error', e))
  }, [user?.username, hydrated])

  // Sync player name and username to user.username from auth store
  useEffect(() => {
    if (user?.username && hydrated) {
      const curPlayer = useGameStore.getState().player
      if (curPlayer.username !== user.username || curPlayer.name !== user.username) {
        useGameStore.setState((s) => ({
          player: {
            ...s.player,
            username: user.username,
            name: user.username
          }
        }))
      }
    }
  }, [user?.username, hydrated, player.username, player.name])

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

  // Set data-faction dynamically on root element for theme styling
  useEffect(() => {
    if (player?.race) {
      document.documentElement.setAttribute('data-faction', player.race)
    } else {
      document.documentElement.removeAttribute('data-faction')
    }
  }, [player?.race])

  const currentSector = player?.sector || 1
  let bgImage = '/assets/hd-space-nebula.jpg'
  if (currentSector === 1) bgImage = '/assets/hq_outpost_bg.png'
  else if (currentSector === 2) bgImage = '/assets/crag_mine_bg.png'
  else if (currentSector === 3) bgImage = '/assets/sette_desert_bg.png'
  else if (currentSector === 4) bgImage = '/assets/hq_outpost_bg.png'
  else if (currentSector === 5) bgImage = '/assets/crag_mine_bg.png'
  else if (currentSector === 6) bgImage = '/assets/sette_desert_bg.png'
  else if (currentSector === 7) bgImage = '/assets/crag_mine_bg.png'
  else if (currentSector === 8) bgImage = '/assets/sette_desert_bg.png'
  else if (currentSector === 9) bgImage = '/assets/hq_outpost_bg.png'
  else if (currentSector === 10) bgImage = '/assets/hq_outpost_bg.png'

  if (loading || !hydrated) {
    return (
      <div className="game-root">
        <div className="game-container">
          <div className="parallax-bg" style={{ backgroundImage: `url('${bgImage}')` }} />
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
          <div className="parallax-bg" style={{ backgroundImage: `url('${bgImage}')` }} />
          <Auth />
        </div>
      </div>
    )
  }

  const Screen = SCREENS[screen] || Main

  return (
    <div className="game-root">
      <div className="game-container">
        <div className="parallax-bg" style={{ backgroundImage: `url('${bgImage}')` }} />
        <div className="no-scrollbar" style={styles.content}><Screen /></div>
        <BottomNav />
      </div>
      {showRaceSelect && <RaceSelect />}
    </div>
  )
}

const styles = {
  content: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 },
  center:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
}
