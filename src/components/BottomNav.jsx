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
          <span style={{ ...styles.label, color: screen === n.id ? '#f5a623' : '#4a8fa8' }}>{n.label}</span>
        </button>
      ))}
    </nav>
  )
}

const styles = {
  nav: { display: 'flex', borderTop: '1px solid #0d2a50', background: 'rgba(5,10,25,0.98)' },
  item: { flex: 1, padding: '10px 0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer' },
  label: { fontFamily: 'monospace', fontSize: 8, letterSpacing: 1 },
}
