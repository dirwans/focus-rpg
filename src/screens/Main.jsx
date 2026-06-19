import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
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

  const { user } = useAuthStore()
  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || '—'

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
        <span style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#7ab0d0', fontWeight: 700 }}>
            {race ? race.emoji + ' ' + race.name : '—'}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a8fa8', fontWeight: 400 }}>
            @{username}
          </span>
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
          {isRunning && timer.mode === 'fight' && battle.currentMob && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <div style={{ fontFamily: 'monospace', fontSize: battle.isBoss ? 13 : 11, color: battle.isBoss ? '#ff4466' : '#4a8fa8', fontWeight: battle.isBoss ? 900 : 400 }}>
                {battle.isBoss ? `⚠️ BOSS: ${battle.currentMob.emoji} ${battle.currentMob.name}` : `${battle.currentMob.emoji} ${battle.currentMob.name}`}
              </div>
              <div style={{ width: '80%', height: 4, background: '#0d1f35', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.max(0, (battle.enemyHp / battle.enemyMaxHp) * 100)}%`, background: battle.isBoss ? '#ff4466' : '#00c8ff', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#4a8fa8' }}>
                HP {battle.enemyHp}/{battle.enemyMaxHp}
                {battle.killStreak > 2 && <span style={{ color: '#f5a623', marginLeft: 8 }}>🔥 {battle.killStreak}x STREAK</span>}
              </div>
            </div>
          )}
          {isRunning && timer.mode === 'gather' && (
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#4a8fa8', marginTop: 4 }}>⛏️ Gathering resources...</div>
          )}
          {isDone && <div style={{ color: '#f5a623', fontFamily: 'monospace', fontSize: 13, marginTop: 4 }}>✅ SESSION COMPLETE!</div>}
        </div>

        {/* Battle log */}
        {battle.log.length > 0 && (
          <div style={styles.battleLog}>
            {battle.log.slice(-4).map((l, i, arr) => (
              <div key={i} style={{ fontFamily: 'monospace', fontSize: 13, color: l.includes('BOSS') || l.includes('CRIT') ? '#ffdd44' : l.includes('✅') || l.includes('🆙') ? '#00ff88' : '#c0dff0', opacity: 0.6 + (i / arr.length) * 0.4, fontWeight: i === arr.length - 1 ? 700 : 400 }}>{l}</div>
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
          <span style={{ color: '#c0dff0', fontFamily: 'monospace', fontSize: 14, fontWeight: 700 }}>
            ⚔️ {battle.kills} kills &nbsp;|&nbsp; <span style={{ color: '#f5a623' }}>+{battle.sessionAnium}⬡</span> &nbsp;|&nbsp; <span style={{ color: '#00e5ff' }}>+{battle.sessionExp} EXP</span>
          </span>
        </div>
      )}
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', gap: 0 },
  resBar: { display: 'flex', gap: 8, padding: '14px 16px 10px', alignItems: 'center' },
  resPill: (c) => ({ background: '#0a1628', border: `2px solid ${c}`, borderRadius: 20, padding: '6px 14px', fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: c }),
  expSection: { padding: '0 16px 10px' },
  expLabel: { fontFamily: 'monospace', fontSize: 13, color: '#00e5ff', letterSpacing: 2, marginBottom: 5, fontWeight: 700 },
  expBg: { height: 10, background: '#0a1628', borderRadius: 5, overflow: 'hidden', border: '1px solid #1a3a6a' },
  expFill: { height: '100%', background: 'linear-gradient(90deg,#0066ff,#00e5ff)', borderRadius: 5, transition: 'width 0.5s' },
  expText: { fontFamily: 'monospace', fontSize: 12, color: '#7ab0d0', marginTop: 4, textAlign: 'right' },
  statRow: { display: 'flex', gap: 8, padding: '0 16px 10px' },
  statCard: { flex: 1, background: '#0a1628', border: '2px solid #1a3a6a', borderRadius: 10, padding: '10px 8px', textAlign: 'center' },
  statLabel: { fontFamily: 'monospace', fontSize: 11, letterSpacing: 1, color: '#7ab0d0', marginBottom: 4, fontWeight: 700 },
  statVal: { fontFamily: 'monospace', fontSize: 20, fontWeight: 900 },
  arena: { margin: '0 16px 10px', background: '#060f20', border: '2px solid #1a3a6a', borderRadius: 16, padding: 16, position: 'relative', minHeight: 190, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  arenaBadge: { position: 'absolute', top: 10, left: 12, background: '#1a0800', border: '2px solid #ff6400', borderRadius: 6, padding: '4px 10px', fontFamily: 'monospace', fontSize: 12, color: '#ff8c40', fontWeight: 700 },
  arenaRight: { position: 'absolute', top: 10, right: 12, fontFamily: 'monospace', fontSize: 12, color: '#00e5ff', textAlign: 'right', fontWeight: 700 },
  timerDisplay: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  battleLog: { marginTop: 10, width: '100%', display: 'flex', flexDirection: 'column', gap: 3 },
  modeRow: { display: 'flex', gap: 8, padding: '0 16px 10px' },
  modeBtn: (active) => ({ flex: 1, padding: 12, borderRadius: 10, fontFamily: 'monospace', fontSize: 15, fontWeight: 700, cursor: 'pointer', border: `2px solid ${active ? '#00c8ff' : '#1a3a6a'}`, background: active ? '#0a2a4a' : '#080f1e', color: active ? '#00e5ff' : '#7ab0d0' }),
  combatStats: { margin: '0 16px 10px', background: '#060f20', border: '2px solid #1a3a6a', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-around' },
  cstat: { textAlign: 'center' },
  cstatLabel: { fontFamily: 'monospace', fontSize: 11, letterSpacing: 1, color: '#7ab0d0', marginBottom: 4, fontWeight: 700 },
  cstatVal: { fontFamily: 'monospace', fontSize: 22, fontWeight: 900 },
  timerRow: { display: 'flex', gap: 8, padding: '0 16px 10px' },
  timerBtn: (active) => ({ flex: 1, padding: 12, borderRadius: 10, fontFamily: 'monospace', fontSize: 15, fontWeight: 700, cursor: 'pointer', border: `2px solid ${active ? '#00c8ff' : '#1a3a6a'}`, background: active ? '#0a2a4a' : '#080f1e', color: active ? '#fff' : '#7ab0d0' }),
  deployBtn: { margin: '0 16px 10px', padding: 18, borderRadius: 12, border: 'none', background: 'linear-gradient(90deg,#0050cc,#00a8ff)', fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2, cursor: 'pointer' },
  sessionSummary: { textAlign: 'center', padding: '0 16px 10px' },
}
