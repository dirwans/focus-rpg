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
              <div style={styles.bonuses}>
                {race.bonuses.expMultiplier > 1 && <span style={styles.tag}>+EXP ×{race.bonuses.expMultiplier}</span>}
                {race.bonuses.atkMultiplier > 1 && <span style={styles.tag}>+ATK ×{race.bonuses.atkMultiplier}</span>}
                {race.bonuses.defMultiplier > 1 && <span style={styles.tag}>+DEF ×{race.bonuses.defMultiplier}</span>}
                {race.bonuses.hpMultiplier > 1  && <span style={styles.tag}>+HP ×{race.bonuses.hpMultiplier}</span>}
                {race.bonuses.gatherMultiplier > 1 && <span style={styles.tag}>+GATHER ×{race.bonuses.gatherMultiplier}</span>}
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
  modal: { background: '#080d1a', border: '1px solid #1a3a5c', borderRadius: 16, padding: 24, width: 340, display: 'flex', flexDirection: 'column', gap: 12 },
  title: { fontFamily: 'monospace', fontSize: 16, fontWeight: 900, color: '#00e5ff', textAlign: 'center', letterSpacing: 2 },
  sub: { fontFamily: 'monospace', fontSize: 10, color: '#4a8fa8', textAlign: 'center', marginBottom: 4 },
  card: { background: 'rgba(0,20,50,0.8)', border: '1px solid #0d3060', borderRadius: 12, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s' },
  emoji: { fontSize: 36 },
  info: { flex: 1 },
  raceName: { fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#e0f4ff', marginBottom: 4 },
  raceDesc: { fontFamily: 'monospace', fontSize: 10, color: '#4a8fa8', marginBottom: 8, lineHeight: 1.5 },
  bonuses: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  tag: { background: 'rgba(0,200,255,0.1)', border: '1px solid #00c8ff', borderRadius: 10, padding: '2px 8px', fontFamily: 'monospace', fontSize: 9, color: '#00e5ff' },
}
