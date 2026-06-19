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

  const { user, signOut } = useAuthStore()
  const username = user?.username || '—'

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
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 16, color: '#7ab0d0', fontWeight: 700 }}>
              {race ? race.emoji + ' ' + race.name : '—'}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#00e5ff', fontWeight: 700 }}>
              @{username}
            </span>
          </span>
          <button onClick={signOut} style={styles.logoutBtn} title="Logout">⏏</button>
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: battle.isBoss ? 16 : 14, color: battle.isBoss ? '#ff4466' : '#4a8fa8', fontWeight: 900 }}>
                {battle.isBoss ? `⚠️ BOSS: ${battle.currentMob.emoji} ${battle.currentMob.name}` : `${battle.currentMob.emoji} ${battle.currentMob.name}`}
              </div>
              <div style={{ width: '80%', height: 4, background: '#0d1f35', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.max(0, (battle.enemyHp / battle.enemyMaxHp) * 100)}%`, background: battle.isBoss ? '#ff4466' : '#00c8ff', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#4a8fa8', fontWeight: 700 }}>
                HP {battle.enemyHp}/{battle.enemyMaxHp}
                {battle.killStreak > 2 && <span style={{ color: '#f5a623', marginLeft: 8 }}>🔥 {battle.killStreak}x STREAK</span>}
              </div>
            </div>
          )}
          {isRunning && timer.mode === 'gather' && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#4a8fa8', marginTop: 4, fontWeight: 700 }}>⛏️ Gathering resources...</div>
          )}
          {isDone && <div style={{ color: '#f5a623', fontFamily: 'var(--font-title)', fontSize: 14, marginTop: 4, fontWeight: 700 }}>✅ SESSION COMPLETE!</div>}
        </div>

        {/* Battle log */}
        {battle.log.length > 0 && (
          <div style={styles.battleLog}>
            {battle.log.slice(-4).map((l, i, arr) => (
              <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: l.includes('BOSS') || l.includes('CRIT') ? '#ffdd44' : l.includes('✅') || l.includes('🆙') ? '#00ff88' : '#c0dff0', opacity: 0.6 + (i / arr.length) * 0.4, fontWeight: 700 }}>{l}</div>
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
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', gap: 0, fontFamily: 'var(--font-body)' },
  resBar: { display: 'flex', gap: 8, padding: '16px 16px 10px', alignItems: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)' },
  resPill: (c) => ({ background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 20, padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 800, color: c, boxShadow: `0 0 12px ${c}33, inset 0 0 8px ${c}22` }),
  expSection: { padding: '12px 16px 10px', background: 'rgba(3, 8, 20, 0.2)' },
  expLabel: { fontFamily: 'var(--font-title)', fontSize: 14, color: '#00e5ff', letterSpacing: 2, marginBottom: 5, fontWeight: 800, textShadow: '0 0 8px rgba(0, 229, 255, 0.4)' },
  expBg: { height: 10, background: 'rgba(0,0,0,0.4)', borderRadius: 5, overflow: 'hidden', border: '1px solid rgba(0, 229, 255, 0.25)' },
  expFill: { height: '100%', background: 'linear-gradient(90deg, #0050cc, #00e5ff)', borderRadius: 5, transition: 'width 0.5s', boxShadow: '0 0 8px #00e5ff' },
  expText: { fontFamily: 'var(--font-mono)', fontSize: 14, color: '#7ab0d0', marginTop: 4, textAlign: 'right', fontWeight: 800 },
  statRow: { display: 'flex', gap: 8, padding: '4px 16px 12px' },
  statCard: { flex: 1, background: 'var(--bg-glass)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: 12, padding: '10px 8px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 0 8px rgba(0, 229, 255, 0.05)', backdropFilter: 'blur(8px)' },
  statLabel: { fontFamily: 'var(--font-title)', fontSize: 14, letterSpacing: 1.5, color: '#7ab0d0', marginBottom: 4, fontWeight: 800 },
  statVal: { fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 900, textShadow: '0 0 8px rgba(0, 229, 255, 0.2)' },
  arena: { margin: '0 16px 12px', background: 'rgba(4, 10, 24, 0.85)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 16, padding: 16, position: 'relative', minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.6), 0 0 15px rgba(0, 229, 255, 0.1), inset 0 0 12px rgba(0, 229, 255, 0.05)', backdropFilter: 'blur(10px)' },
  arenaBadge: { position: 'absolute', top: 10, left: 12, background: 'rgba(26, 8, 0, 0.8)', border: '1px solid #ff6400', borderRadius: 6, padding: '4px 10px', fontFamily: 'var(--font-title)', fontSize: 14, color: '#ff8c40', fontWeight: 800, boxShadow: '0 0 10px rgba(255, 100, 0, 0.3)' },
  arenaRight: { position: 'absolute', top: 10, right: 12, fontFamily: 'var(--font-title)', fontSize: 14, color: '#00e5ff', textAlign: 'right', fontWeight: 800, textShadow: '0 0 6px rgba(0, 229, 255, 0.3)' },
  timerDisplay: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' },
  battleLog: { marginTop: 12, width: '100%', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, border: '1px solid rgba(0, 229, 255, 0.1)' },
  modeRow: { display: 'flex', gap: 8, padding: '0 16px 12px' },
  modeBtn: (active) => ({ flex: 1, padding: 12, borderRadius: 10, fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, cursor: 'pointer', border: `1px solid ${active ? '#00e5ff' : 'rgba(0, 229, 255, 0.15)'}`, background: active ? 'linear-gradient(135deg, rgba(0, 80, 204, 0.4) 0%, rgba(0, 168, 255, 0.4) 100%)' : 'rgba(6, 15, 35, 0.6)', color: active ? '#fff' : '#7ab0d0', boxShadow: active ? '0 0 10px rgba(0, 229, 255, 0.3)' : 'none', transition: 'all 0.2s', letterSpacing: 1.5 }),
  combatStats: { margin: '0 16px 12px', background: 'var(--bg-glass)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: 14, padding: 14, display: 'flex', justifyContent: 'space-around', boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 0 8px rgba(0, 229, 255, 0.05)' },
  cstat: { textAlign: 'center' },
  cstatLabel: { fontFamily: 'var(--font-title)', fontSize: 14, letterSpacing: 1.5, color: '#7ab0d0', marginBottom: 4, fontWeight: 800 },
  cstatVal: { fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 900, textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  timerRow: { display: 'flex', gap: 8, padding: '0 16px 12px' },
  timerBtn: (active) => ({ flex: 1, padding: 12, borderRadius: 10, fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, cursor: 'pointer', border: `1px solid ${active ? '#00e5ff' : 'rgba(0, 229, 255, 0.15)'}`, background: active ? 'linear-gradient(135deg, rgba(0, 80, 204, 0.4) 0%, rgba(0, 168, 255, 0.4) 100%)' : 'rgba(6, 15, 35, 0.6)', color: active ? '#fff' : '#7ab0d0', boxShadow: active ? '0 0 10px rgba(0, 229, 255, 0.3)' : 'none', transition: 'all 0.2s', letterSpacing: 1 }),
  deployBtn: { margin: '0 16px 12px', padding: 18, borderRadius: 12, border: '1px solid #00e5ff', background: 'linear-gradient(135deg, #0050cc 0%, #00a8ff 100%)', fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2, cursor: 'pointer', boxShadow: '0 0 15px rgba(0, 168, 255, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)', transition: 'all 0.2s', textTransform: 'uppercase' },
  sessionSummary: { textAlign: 'center', padding: '0 16px 12px' },
  logoutBtn: { background: 'rgba(6, 15, 35, 0.6)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: 8, color: '#4a8fa8', fontSize: 16, cursor: 'pointer', padding: '6px 10px', lineHeight: 1, transition: 'all 0.2s' },
}
