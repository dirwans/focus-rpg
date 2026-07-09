import { useGameStore } from '../store/gameStore'

const API_BASE = import.meta.env.VITE_API_URL || ''

// Faction primary colors
const FACTION_PRIMARY = {
  arctron:  '#ff5222',
  bionex:   '#ffd600',
  celestra: '#00e5ff',
}
const getFactionPrimary = (race) => FACTION_PRIMARY[race] || '#00e5ff'

// Original tabs — TIDAK DIUBAH
const NAV_ITEMS = [
  { id: 'main',      label: 'BASE' },
  { id: 'unit',      label: 'CHAR' },
  { id: 'inventory', label: 'GEARS' },
  { id: 'ranks',     label: 'RANKS' },
  { id: 'battle',    label: 'BATTLE' },
  { id: 'mine',      label: 'T-MINE' },
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
    case 'inventory':
      return (
        <svg style={s} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      )
    case 'battle':
      return (
        <svg style={s} width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4M5 5v4M5 5h4"/>
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
      display:              'flex',
      flexShrink:            0,
      position:              'relative',
      background:            'rgba(12,14,20,0.55)',
      backdropFilter:        'blur(14px) saturate(180%)',
      WebkitBackdropFilter:  'blur(14px) saturate(180%)',
      borderTop:             `1px solid ${primary}55`,
      boxShadow:             `inset 0 1px 0 rgba(255,255,255,0.08), 0 -6px 24px ${primary}22`,
      padding:               '9px 6px 11px',
      gap:                   4,
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
            <div style={{
              display:        'flex',
              alignItems:     'flex-start',
              justifyContent: 'center',
              height:         22,
              width:          '100%',
              overflow:       'hidden',
            }}>
              <span style={{
                fontFamily:  "'Oxanium', sans-serif",
                fontStyle:   'italic',
                fontSize:    10.5,
                fontWeight:  800,
                letterSpacing: 0.5,
                color:       isActive ? '#fff' : '#8a94a3',
                textShadow:  isActive ? `0 0 8px ${primary}99` : 'none',
                whiteSpace:  'nowrap',
                textAlign:   'center',
                lineHeight:  1,
              }}>
                {n.label}
              </span>
            </div>
            <div style={{
              width: 4, height: 4, borderRadius: '50%',
              background: primary, boxShadow: `0 0 6px ${primary}`,
              marginTop: -2,
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'scale(1)' : 'scale(0)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}/>
          </button>
        )
      })}
    </nav>
  )
}
