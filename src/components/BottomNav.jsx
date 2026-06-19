import { useGameStore } from '../store/gameStore'

const NAV = [
  { id: 'main',  icon: '🏠', label: 'BASE' },
  { id: 'unit',  icon: '⚔️', label: 'UNIT' },
  { id: 'ranks', icon: '📊', label: 'RANKS' },
  { id: 'cargo', icon: '📦', label: 'CARGO' },
  { id: 'forge', icon: '🔧', label: 'FORGE' },
]

export default function BottomNav() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <nav style={styles.nav}>
      {NAV.map((n) => (
        <button key={n.id} style={styles.item} onClick={() => setScreen(n.id)}>
          <span style={{ fontSize: 22, opacity: screen === n.id ? 1 : 0.4 }}>{n.icon}</span>
          <span style={{ ...styles.label, color: screen === n.id ? '#f5a623' : '#7ab0d0' }}>{n.label}</span>
        </button>
      ))}
    </nav>
  )
}

const styles = {
  nav: { display: 'flex', borderTop: '1px solid rgba(0, 229, 255, 0.25)', background: 'rgba(4, 10, 24, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 -4px 15px rgba(0,0,0,0.5)' },
  item: { flex: 1, padding: '10px 0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
  label: { fontFamily: 'var(--font-title)', fontSize: 9, letterSpacing: 1.5, fontWeight: 700 },
}
