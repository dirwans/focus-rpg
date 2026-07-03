import { useGameStore } from '../store/gameStore'

const API_BASE = import.meta.env.VITE_API_URL || ''

const FACTION_ICONS = {
  arctron: {
    main: '🏭',      // Cyber Factory Base
    unit: '🤖',      // Mecha Unit
    ranks: '📡',     // Radar System
    battle: '⚡',    // Beam Combat
    mine: '⚙️',      // Industrial Drill
    cargo: '💾',     // Data Drive
    forge: '🔧',     // Assembler Wrench
    ascension: '🌀', // Core Reactor
    premium: '💎',   // Nexus Crystal
  },
  bionex: {
    main: '🧬',      // Bio-Helix Base
    unit: '👽',      // Organism Mutant
    ranks: '🧠',     // Neuro-Network
    battle: '☣️',    // Biohazard Strike
    mine: '🦠',      // Organic Harvester
    cargo: '🥚',     // Chrysalis Pod
    forge: '🧪',     // Bio-Synthesizer
    ascension: '☢️', // Mutation Chamber
    premium: '💚',   // DNA Shard
  },
  celestra: {
    main: '🏰',      // Astral Sanctuary
    unit: '🔮',      // Mystic Summoner
    ranks: '🌌',     // Star Constellation
    battle: '🪄',    // Magic Wand
    mine: '✨',      // Mana Extractor
    cargo: '📿',     // Relic Container
    forge: '🕯️',     // Mystic Forge
    ascension: '🪐', // Celestial Orbit
    premium: '🌟',   // Astral Crystal
  },
  default: {
    main: '🏠',
    unit: '👤',
    ranks: '📊',
    battle: '⚔️',
    mine: '⛏️',
    cargo: '📦',
    forge: '🔧',
    ascension: '✧',
    premium: '💎',
  }
}

const NAV_ITEMS = [
  { id: 'main',      label: 'BASE' },
  { id: 'unit',      label: 'UNIT' },
  { id: 'ranks',     label: 'RANKS' },
  { id: 'battle',    label: 'BATTLE' },
  { id: 'mine',      label: 'MINE' },
  { id: 'cargo',     label: 'INVENTORY' },
  { id: 'forge',     label: 'FORGE' },
  { id: 'ascension', label: 'ASCENSION' },
  { id: 'premium',   label: 'SHOP' },
]

export default function BottomNav() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const player = useGameStore((s) => s.player)

  const race = player?.race || 'default'
  const icons = FACTION_ICONS[race] || FACTION_ICONS.default

  return (
    <nav className="no-scrollbar" style={styles.nav}>
      {NAV_ITEMS.map((n) => {
        const icon = icons[n.id] || FACTION_ICONS.default[n.id]
        return (
          <button key={n.id} style={styles.item} onClick={() => n.isExternal ? window.open(`${API_BASE}/library.html`, '_blank') : setScreen(n.id)}>
            <span style={{ fontSize: 22, opacity: screen === n.id ? 1 : 0.4 }}>{icon}</span>
            <span style={{ ...styles.label, color: screen === n.id ? '#f5a623' : '#7ab0d0' }}>{n.label}</span>
          </button>
        )
      })}
    </nav>
  )
}


const styles = {
  nav: { display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', borderTop: '1px solid rgba(0, 229, 255, 0.25)', background: 'rgba(4, 10, 24, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 -4px 15px rgba(0,0,0,0.5)' },
  item: { minWidth: 60, flex: '1 0 auto', padding: '10px 4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
  label: { fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 0.5, fontWeight: 800 },
}
