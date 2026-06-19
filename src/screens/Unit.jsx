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
          <div style={styles.sectionLabel}>RACE SPECIALIZATION — {race.name.toUpperCase()}</div>
          <div style={styles.desc}>{race.description}</div>
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
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)' },
  header: { padding: 16, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)' },
  avatar: { width: 48, height: 48, borderRadius: '50%', border: '2px solid #00e5ff', background: 'linear-gradient(135deg, #0030a0, #001040)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)' },
  name: { fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 700, color: '#e0f4ff', letterSpacing: 1 },
  sub: { fontFamily: 'var(--font-mono)', fontSize: 14, color: '#4a8fa8', marginTop: 2, fontWeight: 800 },
  selectBtn: { background: 'linear-gradient(95deg, #0050cc, #00a8ff)', border: '1px solid #00e5ff', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-title)', fontSize: 14, color: '#fff', cursor: 'pointer', boxShadow: '0 0 10px rgba(0, 168, 255, 0.4)', transition: 'all 0.2s', fontWeight: 800 },
  resRow: { display: 'flex', gap: 8, padding: '10px 16px' },
  resChip: (c) => ({ flex: 1, background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 10, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 14, color: c, fontWeight: 800, boxShadow: `0 0 10px ${c}33, inset 0 0 6px ${c}22` }),
  section: { margin: '0 16px 12px', background: 'var(--bg-glass)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: 14, padding: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 0 8px rgba(0, 229, 255, 0.05)', backdropFilter: 'blur(8px)' },
  sectionLabel: { fontFamily: 'var(--font-title)', fontSize: 14, letterSpacing: 2, color: '#4a8fa8', marginBottom: 10, fontWeight: 800, textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  expBg: { height: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 4, overflow: 'hidden', marginBottom: 4, border: '1px solid rgba(0, 229, 255, 0.2)' },
  expFill: { height: '100%', background: 'linear-gradient(90deg, #0066ff, #00e5ff)', borderRadius: 4, boxShadow: '0 0 8px #00e5ff' },
  expText: { fontFamily: 'var(--font-mono)', fontSize: 14, color: '#4a8fa8', textAlign: 'right', fontWeight: 800 },
  statsGrid: { display: 'flex', gap: 8 },
  statBox: { flex: 1, background: 'rgba(3, 8, 20, 0.6)', border: '1px solid rgba(0, 229, 255, 0.15)', borderRadius: 10, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 14, alignItems: 'center', boxShadow: 'inset 0 0 8px rgba(0, 229, 255, 0.05)', fontWeight: 800 },
  statNum: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#e0f4ff', textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  desc: { fontFamily: 'var(--font-body)', fontSize: 14, color: '#6a9ab8', marginBottom: 8, lineHeight: 1.5, fontWeight: 600 },
  specSection: { display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, border: '1px solid rgba(0,229,255,0.08)' },
  specTitle: { fontFamily: 'var(--font-title)', fontSize: 14, color: '#7ab0d0', letterSpacing: 0.5, marginTop: 4, fontWeight: 800 },
  specItem: (c) => ({ fontFamily: 'var(--font-body)', fontSize: 14, color: c, lineHeight: 1.4, fontWeight: 600 }),
  progRow: { display: 'flex', justifyContent: 'space-around' },
  progItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  progNum: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#00e5ff', textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  progLabel: { fontFamily: 'var(--font-title)', fontSize: 14, color: '#4a8fa8', fontWeight: 800 },
}
