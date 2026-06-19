import { useGameStore } from '../store/gameStore'
import races from '../data/races.json'

export default function Unit() {
  const player = useGameStore((s) => s.player)
  const getStats = useGameStore((s) => s.getStats)
  const getExpToNext = useGameStore((s) => s.getExpToNext)
  const openRaceSelect = useGameStore((s) => s.openRaceSelect)

  const stats = getStats()
  const expMax = getExpToNext()
  const expPct = Math.floor((player.exp / expMax) * 100)
  const race = player.race ? races[player.race] : null

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <div style={styles.avatar}>{race ? race.emoji : '❓'}</div>
        <div style={{ flex: 1 }}>
          <div style={styles.name}>{player.name}</div>
          <div style={styles.sub}>Race: {race ? race.name : 'Not selected'} · LV.{player.level}</div>
        </div>
        {!player.race && (
          <button style={styles.selectBtn} onClick={openRaceSelect}>SELECT RACE</button>
        )}
      </div>

      <div style={styles.resRow}>
        <div style={styles.resChip('#f5a623')}>⬡ Anium: {player.resources.anium.toLocaleString()}</div>
        <div style={styles.resChip('#00e5ff')}>◈ Credits: {player.resources.credits}</div>
      </div>

      {/* EXP */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>EXPERIENCE</div>
        <div style={styles.expBg}><div style={{ ...styles.expFill, width: expPct + '%' }} /></div>
        <div style={styles.expText}>{player.exp} / {expMax} ({expPct}%)</div>
      </div>

      {/* Stats */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>COMBAT STATS</div>
        <div style={styles.statsGrid}>
          <div style={styles.statBox}><span style={{ color: '#f5a623' }}>⚡ ATK</span><span style={styles.statNum}>{stats.atk}</span></div>
          <div style={styles.statBox}><span style={{ color: '#00c8ff' }}>🛡 DEF</span><span style={styles.statNum}>{stats.def}</span></div>
          <div style={styles.statBox}><span style={{ color: '#ff4466' }}>❤ HP</span><span style={styles.statNum}>{stats.hp.toLocaleString()}</span></div>
        </div>
      </div>

      {/* Race bonuses */}
      {race && (
        <div style={styles.section}>
          <div style={styles.sectionLabel}>RACE BONUSES — {race.name.toUpperCase()}</div>
          <div style={styles.desc}>{race.description}</div>
          <div style={styles.bonusRow}>
            {Object.entries(race.bonuses).map(([k, v]) => (
              <div key={k} style={styles.bonusChip(v > 1)}>
                {k.replace('Multiplier', '').toUpperCase()} ×{v}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>PROGRESS</div>
        <div style={styles.progRow}>
          <div style={styles.progItem}><span style={styles.progNum}>{player.totalSessions}</span><span style={styles.progLabel}>Sessions</span></div>
          <div style={styles.progItem}><span style={styles.progNum}>{player.totalMinutes}</span><span style={styles.progLabel}>Minutes</span></div>
          <div style={styles.progItem}><span style={{ ...styles.progNum, color: '#ff8c40' }}>🔥{player.streak}</span><span style={styles.progLabel}>Streak</span></div>
          <div style={styles.progItem}><span style={styles.progNum}>S-{player.highestSector}</span><span style={styles.progLabel}>Best</span></div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' },
  header: { padding: 16, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #0d2a50' },
  avatar: { width: 48, height: 48, borderRadius: '50%', border: '2px solid #00c8ff', background: 'linear-gradient(135deg,#0030a0,#001040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 },
  name: { fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#e0f4ff' },
  sub: { fontFamily: 'monospace', fontSize: 11, color: '#4a8fa8', marginTop: 2 },
  selectBtn: { background: 'linear-gradient(90deg,#0050cc,#00a8ff)', border: 'none', borderRadius: 8, padding: '6px 12px', fontFamily: 'monospace', fontSize: 10, color: '#fff', cursor: 'pointer' },
  resRow: { display: 'flex', gap: 8, padding: '10px 16px' },
  resChip: (c) => ({ flex: 1, background: 'rgba(0,0,0,0.4)', border: `1px solid ${c}`, borderRadius: 8, padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, color: c }),
  section: { margin: '0 16px 12px', background: 'rgba(0,10,30,0.6)', border: '1px solid #0d2a50', borderRadius: 12, padding: 14 },
  sectionLabel: { fontFamily: 'monospace', fontSize: 9, letterSpacing: 2, color: '#4a8fa8', marginBottom: 10 },
  expBg: { height: 6, background: '#0d1f35', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  expFill: { height: '100%', background: 'linear-gradient(90deg,#0066ff,#00e5ff)', borderRadius: 3 },
  expText: { fontFamily: 'monospace', fontSize: 10, color: '#4a8fa8', textAlign: 'right' },
  statsGrid: { display: 'flex', gap: 8 },
  statBox: { flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '8px', display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace', fontSize: 11, alignItems: 'center' },
  statNum: { fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: '#e0f4ff' },
  desc: { fontFamily: 'monospace', fontSize: 11, color: '#6a9ab8', marginBottom: 8, lineHeight: 1.5 },
  bonusRow: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  bonusChip: (pos) => ({ border: `1px solid ${pos ? '#00c8ff' : '#0d2a50'}`, borderRadius: 10, padding: '3px 10px', fontFamily: 'monospace', fontSize: 9, color: pos ? '#00e5ff' : '#4a8fa8', background: pos ? 'rgba(0,200,255,0.08)' : 'transparent' }),
  progRow: { display: 'flex', justifyContent: 'space-around' },
  progItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  progNum: { fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: '#00e5ff' },
  progLabel: { fontFamily: 'monospace', fontSize: 9, color: '#4a8fa8' },
}
