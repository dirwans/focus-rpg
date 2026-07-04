import { useGameStore } from '../store/gameStore'

const API_BASE = import.meta.env.VITE_API_URL || ''

// Faction primary colors
const FACTION_PRIMARY = {
  arctron:  '#ff5222',
  bionex:   '#3b82f6',
  celestra: '#a855f7',
}
const getFactionPrimary = (race) => FACTION_PRIMARY[race] || '#00e5ff'

// Original tabs — TIDAK DIUBAH
const NAV_ITEMS = [
  { id: 'main',      label: 'BASE' },
  { id: 'unit',      label: 'CHARACTER' },
  { id: 'ranks',     label: 'RANKS' },
  { id: 'battle',    label: 'BATTLE' },
  { id: 'mine',      label: 'MINE' },
  { id: 'forge',     label: 'FORGE' },
  { id: 'ascension', label: 'ASC' },
  { id: 'premium',   label: 'SHOP' },
]

// Exact SVG icons from design handoff
function NavIcon({ id, active, color }) {
  const s = { filter: active ? `drop-shadow(0 0 5px ${color})` : 'none' }
  const stroke = active ? color : '#8a94a3'
  switch (id) {
    case 'main':
      return (
        <svg style={s} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M12 2v9M8 5h8M10 8h4"/>
        </svg>
      )
    case 'unit':
      return (
        <svg style={s} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      )
    case 'battle':
      return (
        <svg style={s} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4M5 5v4M5 5h4"/>
        </svg>
      )
    case 'forge':
      return (
        <svg style={s} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      )
    case 'ranks':
      return (
        <svg style={s} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      )
    case 'mine':
      return (
        <svg style={s} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2L22 9.5m-5.5-4L11 11M3 21l8-8m-5.5.5l5 5"/>
        </svg>
      )
    case 'forge':
      return (
        <svg style={s} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      )
    case 'ascension':
      return (
        <svg style={s} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    case 'premium':
      return (
        <svg style={s} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z"/>
        </svg>
      )
    default:
      return <span style={{ fontSize: 16 }}>?</span>
  }
}

export default function BottomNav() {
  const screen    = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const player    = useGameStore((s) => s.player)
  const primary   = getFactionPrimary(player?.race)

  return (
    <nav style={{
      display:        'flex',
      flexShrink:      0,
      background:     'rgba(14,14,16,0.92)',
      backdropFilter: 'blur(10px)',
      borderTop:      `1px solid ${primary}40`,
      padding:        '9px 6px 11px',
      gap:            4,
    }}>
      {NAV_ITEMS.map((n) => {
        const isActive = screen === n.id
        return (
          <button
            key={n.id}
            onClick={() => setScreen(n.id)}
            style={{
              flex:           1,
              minWidth:       0,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              gap:            3,
              background:     'none',
              border:         'none',
              cursor:         'pointer',
              padding:        '0 2px',
            }}
          >
            <NavIcon id={n.id} active={isActive} color={primary} />
            <span style={{
              fontFamily:  'var(--font-title)',
              fontSize:    10,
              fontWeight:  800,
              letterSpacing: 1,
              color:       isActive ? '#fff' : '#8a94a3',
              textShadow:  isActive ? `0 0 8px ${primary}99` : 'none',
              whiteSpace:  'nowrap',
            }}>
              {n.label}
            </span>
            {isActive && (
              <div style={{
                width: 4, height: 4, borderRadius: '50%',
                background: primary, boxShadow: `0 0 6px ${primary}`,
                marginTop: -2,
              }}/>
            )}
          </button>
        )
      })}
    </nav>
  )
}
