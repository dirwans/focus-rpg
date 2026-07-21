import { useEffect, useRef, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { useAuthStore } from './store/authStore'
import { useTimer } from './hooks/useTimer'
import { useVisibility } from './hooks/useVisibility'
import { useIsLandscape } from './hooks/useIsLandscape'
import { loadSave, syncSave, subscribeSave } from './lib/saveSync'
import { apiGetArchon, apiChipWar } from './lib/api'
import { t } from './lib/translate'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import Navmenu from './components/Navmenu'
import races from './data/races.json'
import CharacterCreate from './components/CharacterCreate'
import Auth from './screens/Auth'
import Main from './screens/Main'
import Unit from './screens/Unit'
import Ranks from './screens/Ranks'
import Cargo from './screens/Cargo'
import Trade from './screens/Trade'
import Battle from './screens/Battle'
import Mine from './screens/Mine'
import PremiumShop from './screens/PremiumShop'
import Ascension from './screens/Ascension'
import Inventory from './screens/Inventory'
import AuditorRoom from './screens/AuditorRoom'
import HQScreen from './screens/HQScreen'

import { handleBackButtonStack } from './lib/backButtonManager'

const SCREENS = { main: Main, hq: HQScreen, unit: Unit, ranks: Ranks, cargo: Cargo, trade: Trade, battle: Battle, mine: Mine, premium: PremiumShop, ascension: Ascension, inventory: Inventory }

const snap = (gs) => JSON.stringify(gs ?? {})

export default function App() {
  useTimer()
  useVisibility()
  const isLandscape = useIsLandscape()

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
  const [loadingSave, setLoadingSave] = useState(false)
  const [backExitToast, setBackExitToast] = useState(false)
  const lastBackPressRef = useRef(0)

  // Enforce screen orientation lock to landscape in Web View / Browser
  useEffect(() => {
    const lockLandscape = () => {
      try {
        if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {})
        }
      } catch (e) {}
    }
    lockLandscape()
    window.addEventListener('resize', lockLandscape)
    return () => window.removeEventListener('resize', lockLandscape)
  }, [])

  // Capacitor hardware back button handler
  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      // 1. Lek ana modal / pop-up terdaftar ing stack → tutup dhisik modal paling ndhuwur
      if (handleBackButtonStack()) {
        return
      }

      // Fallback lek ana legacy __closeNpcModal
      if (typeof window.__closeNpcModal === 'function') {
        window.__closeNpcModal()
        return
      }

      const state = useGameStore.getState()
      // 2. Lek dudu home screen (hq) → balik ke home dhisik
      if (state.screen !== 'hq') {
        state.setScreen('hq')
        return
      }

      // 3. Wes nang home screen (hq) lan ora ana modal → Double-Tap back button to exit
      const now = Date.now()
      if (now - lastBackPressRef.current < 2000) {
        if (Capacitor.isNativePlatform()) {
          CapApp.exitApp()
        } else {
          const confirmExit = window.confirm(t('confirm_exit', 'Are you sure you want to logout / exit app?', state.player))
          if (confirmExit && Capacitor.isNativePlatform()) {
            CapApp.exitApp()
          }
        }
      } else {
        lastBackPressRef.current = now
        setBackExitToast(true)
        setTimeout(() => setBackExitToast(false), 2000)
      }
    })
    return () => {
      listener.then(l => l.remove()).catch(() => {})
    }
  }, [])

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
      'accretians': 'arctron', 'accretia': 'arctron', 'arctron': 'arctron',
      'bellians': 'bionex', 'bellato': 'bionex', 'bionex': 'bionex',
      'corvus': 'celestra', 'cora': 'celestra', 'celestra': 'celestra'
    }
    
    let nextPlayer = { ...curPlayer }
    let dirty = false
    
    if (nextPlayer.race && raceMap[nextPlayer.race]) {
      nextPlayer.race = raceMap[nextPlayer.race]
      dirty = true
    }
    
    if (nextPlayer.inventory) {
       nextPlayer.inventory = nextPlayer.inventory.map(i => (i && raceMap[i.race]) ? { ...i, race: raceMap[i.race] } : i)
       dirty = true
    }
    if (nextPlayer.equipment) {
       nextPlayer.equipment = { ...nextPlayer.equipment }
       if (nextPlayer.equipment.weapon && raceMap[nextPlayer.equipment.weapon.race]) { nextPlayer.equipment.weapon.race = raceMap[nextPlayer.equipment.weapon.race]; dirty = true; }
       if (nextPlayer.equipment.armor && raceMap[nextPlayer.equipment.armor.race]) { nextPlayer.equipment.armor.race = raceMap[nextPlayer.equipment.armor.race]; dirty = true; }
       if (nextPlayer.equipment.shield && raceMap[nextPlayer.equipment.shield.race]) { nextPlayer.equipment.shield.race = raceMap[nextPlayer.equipment.shield.race]; dirty = true; }
    }

    if (nextPlayer.resources && nextPlayer.resources.anium !== undefined) {
       nextPlayer.resources = { ...nextPlayer.resources, crd: nextPlayer.resources.anium }
       delete nextPlayer.resources.anium
       dirty = true
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

  // Fetch Core War winner on launch
  useEffect(() => {
    if (!user) return
    apiChipWar().then(res => {
      if (res && res.winnerRace) {
        useGameStore.getState().setWinnerRace(res.winnerRace)
        if (res.runnerUpRace) useGameStore.getState().setRunnerUpRace(res.runnerUpRace)
        if (res.lastPlaceRace) useGameStore.getState().setLastPlaceRace(res.lastPlaceRace)
      }
    }).catch(() => {})
  }, [user])

  // Login + hydrated → server jadi sumber kebenaran. Ada save server → pakai itu.
  useEffect(() => {
    if (!user || !hydrated) return
    readyRef.current = false
    // Immediately wipe stale state from previous user so nothing bleeds through during load
    useGameStore.setState((s) => ({
      player: { ...s.player, username: user.username, name: s.player.username === user.username ? s.player.name : user.username, race: null },
    }))
    localStorage.removeItem('focus-rpg-save')
    setLoadingSave(true)
    loadSave().then((cloud) => {
      if (cloud) {
        // Force-apply correct username regardless of what's stored on server, preserve custom name
        const correctedCloud = { ...cloud, username: user.username, name: cloud.name || user.username }
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
          pt: {
            melee: { val: 1, pct: 0 },
            range: { val: 1, pct: 0 },
            force: { val: 1, pct: 0 },
            shield: { val: 1, pct: 0 },
            defense: { val: 1, pct: 0 },
            special: { val: 1, pct: 0 },
            production: { val: 1, pct: 0 }
          },
          resources: { crd: 200, nxc: 10, potions: 5 },
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
      setTimeout(() => { 
        readyRef.current = true 
        setLoadingSave(false)
      }, 600)
    })
    
    // Load archon data early to apply Auras & Mantles
    apiGetArchon().then(res => {
      if (res && res.archons) {
        useGameStore.getState().setArchons(res.archons)
      }
    }).catch(e => console.error('[Archon] fetch error', e))
  }, [user?.username, hydrated])

  // Sync player username to user.username from auth store
  useEffect(() => {
    if (user?.username && hydrated) {
      const curPlayer = useGameStore.getState().player
      if (curPlayer.username !== user.username) {
        useGameStore.setState((s) => ({
          player: {
            ...s.player,
            username: user.username
          }
        }))
      }
    }
  }, [user?.username, hydrated, player.username])

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

  // Fetch live gear calibration coordinates
  useEffect(() => {
    useGameStore.getState().fetchGearCoords()
    const onCoordUpdate = () => useGameStore.getState().fetchGearCoords()
    window.addEventListener('coord_update', onCoordUpdate)
    return () => window.removeEventListener('coord_update', onCoordUpdate)
  }, [])

  // Set data-faction dynamically on root element for theme styling
  useEffect(() => {
    if (player?.race) {
      document.documentElement.setAttribute('data-faction', player.race)
    } else {
      document.documentElement.removeAttribute('data-faction')
    }
  }, [player?.race])

  const race = (player?.race || '').toLowerCase()
  let containerBg = 'radial-gradient(120% 65% at 50% -5%, #0f1c3f 0%, #080f24 50%, #03060f 100%)' // default deep space blue
  if (race === 'arctron') {
    containerBg = 'radial-gradient(120% 65% at 50% -5%, #201f22 0%, #141317 50%, #0a0a0c 100%)'
  } else if (race === 'bionex') {
    containerBg = 'radial-gradient(120% 65% at 50% -5%, #0c1f48 0%, #07132c 50%, #040a1c 100%)'
  } else if (race === 'celestra') {
    containerBg = 'radial-gradient(120% 65% at 50% -5%, #1a1642 0%, #100e2c 50%, #07061a 100%)'
  }

  // Secret Auditor Route (bisa lewat path atau subdomain)
  if (window.location.pathname === '/rahasia-auditor' || window.location.hostname.startsWith('audit')) {
    return <AuditorRoom />
  }

  if (loading || !hydrated || loadingSave) {
    return (
      <div className="game-root">
        <div className={`game-container ${isLandscape ? 'landscape' : ''}`} data-faction={player?.race || ''} style={{ background: containerBg }}>
          <div style={styles.center}>
            <div style={{ fontSize: 48 }}>⚡</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#00e5ff', letterSpacing: 3, marginTop: 12 }}>LOADING...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="game-root">
        <div className={`game-container ${isLandscape ? 'landscape' : ''}`} data-faction={player?.race || ''} style={{ background: containerBg }}>
          <Auth />
        </div>
      </div>
    )
  }

  // Lock user in Character Creator if no active character exists
  if (!player?.race) {
    return (
      <div className="game-root">
        <div className="game-container landscape" data-faction={player?.race || ''} style={{ background: containerBg }}>
          <CharacterCreate />
        </div>
      </div>
    )
  }

  const Screen = SCREENS[screen] || HQScreen

  return (
    <div className="game-root">
      <div className="game-container landscape" data-faction={player?.race || ''} style={{ background: containerBg }}>
        <div className="no-scrollbar" style={styles.content}><Screen /></div>
        <Navmenu />
        {backExitToast && (
          <div style={{
            position: 'fixed',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 20, 35, 0.95)',
            color: '#00e5ff',
            border: '1px solid #00e5ff',
            boxShadow: '0 0 15px rgba(0,229,255,0.4)',
            padding: '8px 18px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 'bold',
            zIndex: 99999,
            pointerEvents: 'none',
            textAlign: 'center',
            letterSpacing: 0.5,
            whiteSpace: 'nowrap'
          }}>
            {t('press_back_again_to_exit', 'Tekan sekali lagi untuk keluar', player)}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  content: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, height: '100%' },
  center:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
}
