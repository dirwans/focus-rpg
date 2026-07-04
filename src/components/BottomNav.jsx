import { useGameStore } from '../store/gameStore'

const API_BASE = import.meta.env.VITE_API_URL || ''

// Dynamic Faction themed SVG Icons component
const FACTION_GLOW = { arctron: '#ff6400', bionex: '#00e5ff', celestra: '#d000ff' }

const FactionIcon = ({ id, race, active }) => {
  const glowColor = FACTION_GLOW[race] || '#00e5ff'
  const color = active ? glowColor : '#7ab0d0'
  const glow = active ? `drop-shadow(0 0 5px ${glowColor})` : 'none'

  // Arctron mecha icons (sharp edges, cybernetic vectors)
  if (race === 'arctron') {
    switch (id) {
      case 'main':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M12 2v9M8 5h8M10 8h4" />
          </svg>
        )
      case 'unit':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        )
      case 'ranks':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
          </svg>
        )
      case 'battle':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4M5 5v4M5 5h4" />
          </svg>
        )
      case 'mine':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v8M9 11h6" />
          </svg>
        )
      case 'cargo':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        )
      case 'forge':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        )
      case 'ascension':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
        )
      case 'premium':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h12l4 6-10 12L2 9z" />
            <path d="M11 3L8 9l4 12 4-12-3-6" />
            <path d="M2 9h20" />
          </svg>
        )
    }
  }

  // Bionex biological icons (curves, fluid nodes, toxic vectors)
  if (race === 'bionex') {
    switch (id) {
      case 'main':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M4.5 10.5C4.5 6.35786 7.85786 3 12 3C16.1421 3 19.5 6.35786 19.5 10.5C19.5 13.5 17 17 12 21C7 17 4.5 13.5 4.5 10.5Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        )
      case 'unit':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20z" />
            <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
          </svg>
        )
      case 'ranks':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-2.5 2.5" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 2.5 2.5" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )
      case 'battle':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
          </svg>
        )
      case 'mine':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z" />
          </svg>
        )
      case 'cargo':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        )
      case 'forge':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v8L4 22h16l-6-12V2h-4z" />
            <path d="M6 18h12" />
          </svg>
        )
      case 'ascension':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 6v12M6 12h12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      case 'premium':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6a6 6 0 0 1 6 6M12 18a6 6 0 0 1-6-6" />
          </svg>
        )
    }
  }

  // Celestra ethereal/mystic icons (curves, rings, star runes)
  if (race === 'celestra') {
    switch (id) {
      case 'main':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 22 22 22" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        )
      case 'unit':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
            <path d="M12 6l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="currentColor" fillOpacity="0.2" />
          </svg>
        )
      case 'ranks':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        )
      case 'battle':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zM6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z" />
            <path d="M9 6h6M9 18h6" />
          </svg>
        )
      case 'mine':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        )
      case 'cargo':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        )
      case 'forge':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )
      case 'ascension':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        )
      case 'premium':
        return (
          <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        )
    }
  }

  // Fallback default clean outline icons
  switch (id) {
    case 'main':
      return (
        <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case 'unit':
      return (
        <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    case 'ranks':
      return (
        <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      )
    case 'battle':
      return (
        <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
          <line x1="13" y1="19" x2="19" y2="13" />
          <line x1="16" y1="16" x2="20" y2="20" />
          <line x1="19" y1="21" x2="21" y2="19" />
        </svg>
      )
    case 'mine':
      return (
        <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2L22 9.5m-5.5-4L11 11M3 21l8-8m-5.5.5l5 5" />
        </svg>
      )
    case 'cargo':
      return (
        <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="12" x2="2" y2="12" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          <line x1="6" y1="16" x2="6.01" y2="16" />
          <line x1="10" y1="16" x2="10.01" y2="16" />
        </svg>
      )
    case 'forge':
      return (
        <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    case 'ascension':
      return (
        <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    case 'premium':
      return (
        <svg style={{ filter: glow }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z" />
        </svg>
      )
    default:
      return <span>❔</span>
  }
}

const NAV_ITEMS = [
  { id: 'main',      label: 'BASE' },
  { id: 'unit',      label: 'CHARACTER' },
  { id: 'ranks',     label: 'RANKS' },
  { id: 'battle',    label: 'BATTLE' },
  { id: 'mine',      label: 'MINE' },
  
  { id: 'forge',     label: 'FORGE' },
  { id: 'ascension', label: 'ASCENSION' },
  { id: 'premium',   label: 'SHOP' },
]

export default function BottomNav() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const player = useGameStore((s) => s.player)

  const race = player?.race || 'default'

  return (
    <nav className="no-scrollbar" style={styles.nav}>
      {NAV_ITEMS.map((n) => {
        const isActive = screen === n.id
        return (
          <button key={n.id} style={{ ...styles.item, ...(isActive ? styles.itemActive : null) }} onClick={() => n.isExternal ? window.open(`${API_BASE}/library.html`, '_blank') : setScreen(n.id)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 26 }}>
              <FactionIcon id={n.id} race={race} active={isActive} />
            </div>
            <span style={{ ...styles.label, color: isActive ? 'var(--neon-glow)' : '#7ab0d0', marginTop: 2 }}>{n.label}</span>
          </button>
        )
      })}
    </nav>
  )
}



const styles = {
  nav: { display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', borderTop: '1px solid rgba(0, 229, 255, 0.25)', background: 'rgba(4, 10, 24, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 -4px 15px rgba(0,0,0,0.5)' },
  item: { minWidth: 60, flex: '1 0 auto', padding: '10px 4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
  itemActive: { background: 'color-mix(in srgb, var(--neon-glow) 10%, transparent)', boxShadow: 'inset 0 0 12px color-mix(in srgb, var(--neon-glow) 12%, transparent)' },
  label: { fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 0.5, fontWeight: 800 },
}
