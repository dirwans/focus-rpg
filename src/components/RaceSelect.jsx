import { useGameStore } from '../store/gameStore'
import races from '../data/races.json'

export default function RaceSelect() {
  const selectRace = useGameStore((s) => s.selectRace)

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.title}>⚔️ CHOOSE YOUR RACE</div>
        <div style={styles.sub}>This cannot be changed later</div>
        {Object.values(races).map((race) => (
          <button key={race.id} style={styles.card} onClick={() => selectRace(race.id)}>
            <span style={styles.emoji}>{race.emoji}</span>
            <div style={styles.info}>
              <div style={styles.raceName}>{race.name.toUpperCase()}</div>
              <div style={styles.raceDesc}>{race.description}</div>
              <div style={styles.specSection}>
                <div style={styles.specTitle}>ADVANTAGES:</div>
                {race.strengths.map((str, i) => (
                  <div key={i} style={styles.specItem('#44ff88')}>{str}</div>
                ))}
                <div style={styles.specTitle}>DISADVANTAGES:</div>
                {race.weaknesses.map((weak, i) => (
                  <div key={i} style={styles.specItem('#ff4444')}>{weak}</div>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { background: '#080d1a', border: '1px solid #1a3a5c', borderRadius: 16, padding: 20, width: 360, display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '90vh', overflowY: 'auto' },
  title: { fontFamily: 'monospace', fontSize: 16, fontWeight: 900, color: '#00e5ff', textAlign: 'center', letterSpacing: 2 },
  sub: { fontFamily: 'monospace', fontSize: 10, color: '#4a8fa8', textAlign: 'center', marginBottom: 4 },
  card: { background: 'rgba(0,20,50,0.8)', border: '1px solid #0d3060', borderRadius: 12, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s', width: '100%' },
  emoji: { fontSize: 36 },
  info: { flex: 1 },
  raceName: { fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#e0f4ff', marginBottom: 4 },
  raceDesc: { fontFamily: 'monospace', fontSize: 10, color: '#4a8fa8', marginBottom: 4, lineHeight: 1.5 },
  specSection: { marginTop: 4, display: 'flex', flexDirection: 'column', gap: 1 },
  specTitle: { fontFamily: 'monospace', fontSize: 8, color: '#7ab0d0', letterSpacing: 0.5, marginTop: 4, fontWeight: 700 },
  specItem: (c) => ({ fontFamily: 'monospace', fontSize: 10, color: c, lineHeight: 1.3 }),
}
