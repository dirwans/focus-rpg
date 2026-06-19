import { useGameStore } from '../store/gameStore'
import races from '../data/races.json'
import enemies from '../data/enemies.json'

function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

export default function Main() {
  const player   = useGameStore((s) => s.player)
  const timer    = useGameStore((s) => s.timer)
  const battle   = useGameStore((s) => s.battle)
  const getStats = useGameStore((s) => s.getStats)
  const getExpToNext = useGameStore((s) => s.getExpToNext)
  const startTimer   = useGameStore((s) => s.startTimer)
  const stopTimer    = useGameStore((s) => s.stopTimer)
  const resetTimer   = useGameStore((s) => s.resetTimer)
  const setTimerMinutes = useGameStore((s) => s.setTimerMinutes)
  const setMode      = useGameStore((s) => s.setMode)
  const openRaceSelect = useGameStore((s) => s.openRaceSelect)

  const stats   = getStats()
  const expMax  = getExpToNext()
  const expPct  = Math.floor((player.exp / expMax) * 100)
  const race    = player.race ? races[player.race] : null
  const sectorIdx = Math.min(player.sector, enemies.sectors.length) - 1
  const enemy   = enemies.sectors[sectorIdx]
  const enemyPct = battle.enemyMaxHp > 0 ? Math.floor((battle.enemyHp / battle.enemyMaxHp) * 100) : 100
  const isRunning = timer.state === 'running'
  const isDone    = timer.state === 'completed'

  return (
    <div style={styles.screen}>
      {/* Resource bar */}
      <div style={styles.resBar}>
        <span style={styles.resPill('#f5a623')}>⬡ {player.resources.anium.toLocaleString()}</span>
        <span style={styles.resPill('#00e5ff')}>◈ {player.resources.credits}</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: 11, color: '#4a8fa8' }}>
          {race ? race.emoji + ' ' + race.name : '—'}
        </span>
      </div>

      {/* EXP bar */}
      <div style={styles.expSection}>
        <div style={styles.expLabel}>LV.{player.level} — {expPct}% to next</div>
        <div style={styles.expBg}><div style={{ ...styles.expFill, width: expPct + '%' }} /></div>
        <div style={styles.expText}>{player.exp} / {expMax} EXP</div>
      </div>

      {/* Stat cards */}
      <div style={styles.statRow}>
        <div style={styles.statCard}><div style={styles.statLabel}>LEVEL</div><div style={{ ...styles.statVal, color: '#00e5ff' }}>{player.level}</div></div>
        <div style={styles.statCard}><div style={styles.statLabel}>SECTOR</div><div style={{ ...styles.statVal, color: '#f5a623' }}>S-{player.sector}</div></div>
        <div style={styles.statCard}><div style={styles.statLabel}>STREAK</div><div style={{ ...styles.statVal, color: '#ff4466' }}>🔥{player.streak}</div></div>
      </div>

      {/* Battle arena */}
      <div style={styles.arena}>
        <div style={styles.arenaBadge}>🔥 {enemy.name}</div>
        <div style={styles.arenaRight}>SECTOR {player.sector}<br /><span style={{ color: '#4a8fa8', fontSize: 9 }}>HIGHEST: S-{player.highestSector}</span></div>

        {/* Big timer display */}
        <div style={styles.timerDisplay}>
          <div style={{ fontSize: 48, fontFamily: 'monospace', fontWeight: 900, color: isRunning ? '#00e5ff' : isDone ? '#f5a623' : '#e0f4ff', textShadow: isRunning ? '0 0 20px #00c8ff' : 'none' }}>
            {fmt(timer.secondsLeft)}
          </div>
          {isRunning && (
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a8fa8', marginTop: 4 }}>
              {timer.mode === 'fight' ? `⚔️ ${enemy.emoji} HP: ${battle.enemyHp}/${battle.enemyMaxHp}` : `⛏️ Gathering resources...`}
            </div>
          )}
          {isDone && <div style={{ color: '#f5a623', fontFamily: 'monospace', fontSize: 13, marginTop: 4 }}>✅ SESSION COMPLETE!</div>}
        </div>

        {/* Battle log */}
        {battle.log.length > 0 && (
          <div style={styles.battleLog}>
            {battle.log.slice(-4).map((l, i) => (
              <div key={i} style={{ fontFamily: 'monospace', fontSize: 10, color: '#4a8fa8', opacity: 0.5 + (i * 0.17) }}>{l}</div>
            ))}
          </div>
        )}
      </div>

      {/* Mode selector */}
      <div style={styles.modeRow}>
        <button style={styles.modeBtn(timer.mode === 'fight')} onClick={() => setMode('fight')}>⚔️ FIGHT</button>
        <button style={styles.modeBtn(timer.mode === 'gather')} onClick={() => setMode('gather')}>⛏️ GATHER</button>
      </div>

      {/* Combat stats */}
      <div style={styles.combatStats}>
        <div style={styles.cstat}><div style={styles.cstatLabel}>FIREPOWER</div><div style={{ ...styles.cstatVal, color: '#f5a623' }}>{stats.atk}</div></div>
        <div style={{ width: 1, background: '#0d2a50' }} />
        <div style={styles.cstat}><div style={styles.cstatLabel}>ARMOR</div><div style={{ ...styles.cstatVal, color: '#00c8ff' }}>{stats.def}</div></div>
        <div style={{ width: 1, background: '#0d2a50' }} />
        <div style={styles.cstat}><div style={styles.cstatLabel}>SHIELD HP</div><div style={{ ...styles.cstatVal, color: '#ff4466' }}>{stats.hp.toLocaleString()}</div></div>
      </div>

      {/* Timer options */}
      <div style={styles.timerRow}>
        {[10, 25, 60].map((m) => (
          <button key={m} style={styles.timerBtn(timer.selectedMinutes === m && !isRunning)} onClick={() => setTimerMinutes(m)} disabled={isRunning}>
            {m} min
          </button>
        ))}
      </div>

      {/* Main action button */}
      {!isRunning && !isDone && (
        <button style={styles.deployBtn} onClick={player.race ? startTimer : openRaceSelect}>
          {player.race ? '⚡ DEPLOY UNIT' : '⚡ SELECT RACE'}
        </button>
      )}
      {isRunning && (
        <button style={{ ...styles.deployBtn, background: 'linear-gradient(90deg,#800000,#ff4444)' }} onClick={stopTimer}>
          ⛔ ABANDON SESSION
        </button>
      )}
      {isDone && (
        <button style={{ ...styles.deployBtn, background: 'linear-gradient(90deg,#006000,#00c840)' }} onClick={resetTimer}>
          🔄 NEW SESSION
        </button>
      )}

      {/* Session summary */}
      {(isRunning || isDone) && (
        <div style={styles.sessionSummary}>
          <span style={{ color: '#4a8fa8', fontFamily: 'monospace', fontSize: 11 }}>
            ⚔️ {battle.kills} kills &nbsp;|&nbsp; +{battle.sessionAnium}⬡ &nbsp;|&nbsp; +{battle.sessionExp} EXP
          </span>
        </div>
      )}
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' },
  resBar: { display: 'flex', gap: 8, padding: '14px 16px 10px', alignItems: 'center' },
  resPill: (c) => ({ background: 'rgba(0,0,0,0.5)', border: `1px solid ${c}`, borderRadius: 20, padding: '5px 12px', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: c }),
  expSection: { padding: '0 16px 8px' },
  expLabel: { fontFamily: 'monospace', fontSize: 10, color: '#00c8ff', letterSpacing: 2, marginBottom: 4 },
  expBg: { height: 6, background: '#0d1f35', borderRadius: 3, overflow: 'hidden' },
  expFill: { height: '100%', background: 'linear-gradient(90deg,#0066ff,#00e5ff)', borderRadius: 3, boxShadow: '0 0 8px #00c8ff', transition: 'width 0.5s' },
  expText: { fontFamily: 'monospace', fontSize: 10, color: '#4a8fa8', marginTop: 3, textAlign: 'right' },
  statRow: { display: 'flex', gap: 8, padding: '0 16px 8px' },
  statCard: { flex: 1, background: 'rgba(0,20,50,0.8)', border: '1px solid #0d3060', borderRadius: 10, padding: '8px', textAlign: 'center' },
  statLabel: { fontFamily: 'monospace', fontSize: 8, letterSpacing: 1, color: '#4a8fa8', marginBottom: 4 },
  statVal: { fontFamily: 'monospace', fontSize: 16, fontWeight: 900 },
  arena: { margin: '0 16px 8px', background: 'linear-gradient(180deg,rgba(0,30,80,0.6) 0%,rgba(0,10,30,0.9) 100%)', border: '1px solid #0d3060', borderRadius: 16, padding: 16, position: 'relative', minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  arenaBadge: { position: 'absolute', top: 10, left: 12, background: 'rgba(255,100,0,0.2)', border: '1px solid #ff6400', borderRadius: 6, padding: '3px 10px', fontFamily: 'monospace', fontSize: 9, color: '#ff8c40' },
  arenaRight: { position: 'absolute', top: 10, right: 12, fontFamily: 'monospace', fontSize: 10, color: '#00c8ff', textAlign: 'right' },
  timerDisplay: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  battleLog: { marginTop: 10, width: '100%', display: 'flex', flexDirection: 'column', gap: 2 },
  modeRow: { display: 'flex', gap: 8, padding: '0 16px 8px' },
  modeBtn: (active) => ({ flex: 1, padding: 10, borderRadius: 10, fontFamily: 'monospace', fontSize: 12, cursor: 'pointer', border: `1px solid ${active ? '#00c8ff' : '#0d3a80'}`, background: active ? 'rgba(0,100,200,0.2)' : 'rgba(0,20,60,0.8)', color: active ? '#00e5ff' : '#4a8fa8', boxShadow: active ? '0 0 10px rgba(0,180,255,0.2)' : 'none' }),
  combatStats: { margin: '0 16px 8px', background: 'rgba(0,10,30,0.8)', border: '1px solid #0d2a50', borderRadius: 10, padding: 12, display: 'flex', justifyContent: 'space-around' },
  cstat: { textAlign: 'center' },
  cstatLabel: { fontFamily: 'monospace', fontSize: 8, letterSpacing: 1, color: '#4a8fa8', marginBottom: 4 },
  cstatVal: { fontFamily: 'monospace', fontSize: 18, fontWeight: 900 },
  timerRow: { display: 'flex', gap: 8, padding: '0 16px 8px' },
  timerBtn: (active) => ({ flex: 1, padding: 10, borderRadius: 10, fontFamily: 'monospace', fontSize: 12, cursor: 'pointer', border: `1px solid ${active ? '#00c8ff' : '#0d3a80'}`, background: active ? 'rgba(0,100,200,0.2)' : 'rgba(0,20,60,0.8)', color: active ? '#00e5ff' : '#4a8fa8' }),
  deployBtn: { margin: '0 16px 8px', padding: 16, borderRadius: 12, border: 'none', background: 'linear-gradient(90deg,#0050cc,#00a8ff)', fontFamily: 'monospace', fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: 2, cursor: 'pointer', boxShadow: '0 0 20px rgba(0,150,255,0.4)' },
  sessionSummary: { textAlign: 'center', padding: '0 16px 8px' },
}
