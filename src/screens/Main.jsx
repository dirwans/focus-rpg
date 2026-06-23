import { useEffect, useState, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import races from '../data/races.json'
import enemies from '../data/enemies.json'
import { PilotSprite, EnemySprite } from '../components/PilotSprites'
import TransparentSprite from '../components/TransparentSprite'

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
  const isRunning = timer.state === 'running'
  const isDone    = timer.state === 'completed'

  // Visual Effects State
  const [particles, setParticles] = useState([])
  const [isCritHit, setIsCritHit] = useState(false)
  const [isEnemyHit, setIsEnemyHit] = useState(false)
  const lastHpRef = useRef(battle.enemyHp)

  // Trigger floating damage popup
  const spawnDamage = (amount, isCrit) => {
    const id = Math.random().toString()
    const newP = {
      id,
      text: isCrit ? `💥-${amount}` : `-${amount}`,
      x: 55 + Math.random() * 15,
      y: 35 + Math.random() * 15,
      isCrit
    }
    setParticles((prev) => [...prev, newP])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id))
    }, 800)
  }

  // Monitor damage events
  useEffect(() => {
    if (!isRunning || !battle.currentMob) return

    const currentHp = battle.enemyHp
    const prevHp = lastHpRef.current

    if (currentHp < prevHp) {
      const diff = prevHp - currentHp
      const isCrit = diff > (stats.atk * 1.3)
      spawnDamage(diff, isCrit)

      setIsEnemyHit(true)
      const hitTimer = setTimeout(() => setIsEnemyHit(false), 200)

      if (isCrit) {
        setIsCritHit(true)
        const shakeTimer = setTimeout(() => setIsCritHit(false), 300)
        return () => {
          clearTimeout(hitTimer)
          clearTimeout(shakeTimer)
        }
      }
      return () => clearTimeout(hitTimer)
    }

    lastHpRef.current = currentHp
  }, [battle.enemyHp, isRunning, battle.currentMob])

  // Confirm Abandon Session
  const handleAbandon = () => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan sesi fokus ini? Kemajuan saat ini tidak akan disimpan.")) {
      stopTimer()
    }
  }

  // Radial Progress Calculations
  const radius = 60
  const strokeWidth = 6
  const circ = 2 * Math.PI * radius
  const timerPercent = isRunning
    ? (timer.secondsLeft / (timer.selectedMinutes * 60)) * 100
    : isDone ? 0 : 100
  const strokeDashoffset = circ - (timerPercent / 100) * circ

  // Spacious Focus Screen Layout
  if (isRunning) {
    const timerPercentActive = (timer.secondsLeft / (timer.selectedMinutes * 60)) * 100
    const strokeDashoffsetActive = circ - (timerPercentActive / 100) * circ

    return (
      <div style={styles.screen}>
        {/* Top corner discreet abandon button and Stage header */}
        <div style={styles.activeHeader}>
          <div style={styles.activeStageBadge}>📍 {enemy.name}</div>
          <div style={styles.activeSectorLabel}>SECTOR {player.sector}</div>
          <button onClick={handleAbandon} style={styles.smallAbandonBtn}>
            ✕ ABANDON
          </button>
        </div>

        {/* 1. Circular SVG Timer (Top portion) */}
        <div style={styles.timerDisplayActive}>
          <div className="orb-timer" style={{ width: 140, height: 140 }}>
            <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="70" cy="70" r={radius} fill="transparent" stroke="rgba(255, 255, 255, 0.05)" strokeWidth={strokeWidth} />
              <circle cx="70" cy="70" r={radius} fill="transparent" stroke="var(--neon-glow)" strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={strokeDashoffsetActive} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s linear' }} />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 28, fontFamily: 'monospace', fontWeight: 900, color: '#fff', textShadow: '0 0 10px var(--neon-glow)' }}>{fmt(timer.secondsLeft)}</span>
            </div>
          </div>
          {timer.mode === 'gather' && (
            <div style={styles.activeGatherBadge}>⛏️ GATHERING RESOURCES...</div>
          )}
        </div>

        {/* 2. Battle logs (Middle portion - framed with solid dark background) */}
        {battle.log.length > 0 && (
          <div style={styles.battleLogActive}>
            {battle.log.slice(-3).map((l, i, arr) => (
              <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: l.includes('BOSS') || l.includes('CRIT') || l.includes('Vampire') ? '#ffdd44' : l.includes('✅') || l.includes('🆙') ? '#00ff88' : '#c0dff0', opacity: 0.7 + (i / arr.length) * 0.3, fontWeight: 700 }}>{l}</div>
            ))}
          </div>
        )}

        {/* 3. Health & Mana bars (Fight mode details) */}
        {timer.mode === 'fight' && battle.currentMob && (
          <div style={styles.activeHealthBarWrapper}>
            {/* Enemy HP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ffaa00', fontWeight: 800, textShadow: '0 0 4px #000' }}>
              <span>{battle.currentMob.emoji} {battle.currentMob.name}</span>
              <span>{Math.max(0, battle.enemyHp)} / {battle.enemyMaxHp} HP</span>
            </div>
            <div style={{ width: '90%', height: 6, background: '#0a1020', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255, 170, 0, 0.5)', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${Math.max(0, (battle.enemyHp / battle.enemyMaxHp) * 100)}%`, background: battle.isBoss ? 'linear-gradient(90deg, #ff1133, #ff4466)' : 'linear-gradient(90deg, #ff5500, #ffcc00)', borderRadius: 3, transition: 'width 0.2s' }} />
            </div>

            {/* Player HP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00e5ff', fontWeight: 800, textShadow: '0 0 4px #000' }}>
              <span>🛡️ Pilot Shield HP</span>
              <span>{(battle.playerHp !== undefined && !isNaN(battle.playerHp)) ? battle.playerHp : stats.hp} / {battle.playerMaxHp || stats.hp} HP</span>
            </div>
            <div style={{ width: '90%', height: 6, background: '#0a1020', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(0, 229, 255, 0.5)', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${Math.max(0, (((battle.playerHp !== undefined && !isNaN(battle.playerHp)) ? battle.playerHp : stats.hp) / (battle.playerMaxHp || stats.hp || 1)) * 100)}%`, background: 'linear-gradient(90deg, #0050cc, #00e5ff)', borderRadius: 3, transition: 'width 0.2s' }} />
            </div>

            {/* Player FP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#da70d6', fontWeight: 800, textShadow: '0 0 4px #000' }}>
              <span>🔮 Force Point (FP)</span>
              <span>{(battle.playerFp !== undefined && !isNaN(battle.playerFp)) ? battle.playerFp : 200} / {battle.playerMaxFp || 200} FP</span>
            </div>
            <div style={{ width: '90%', height: 6, background: '#0a1020', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(218, 112, 214, 0.5)' }}>
              <div style={{ height: '100%', width: `${Math.max(0, (((battle.playerFp !== undefined && !isNaN(battle.playerFp)) ? battle.playerFp : 200) / (battle.playerMaxFp || 200 || 1)) * 100)}%`, background: 'linear-gradient(90deg, #7b1fa2, #da70d6)', borderRadius: 3, transition: 'width 0.2s' }} />
            </div>
          </div>
        )}

        {/* 4. Battle Arena (Bottom portion - Unboxed sprites standing directly on grid floor!) */}
        <div className={isCritHit ? 'screen-shake' : ''} style={styles.arenaActiveUnboxed}>
          <div style={styles.arenaVisualContainerActive}>
            <div style={styles.arenaGridOverlay} />

            {/* Player sprite (Enlarged and border-cropped) */}
            <div style={styles.playerSprite}>
              <div style={{ animation: 'spritePulse 1.2s infinite ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PilotSprite race={player.race} size={120} />
              </div>
              <div style={styles.spriteLabel}>PILOT</div>
            </div>

            <div style={{ fontSize: 20, color: 'var(--neon-glow)', fontFamily: 'var(--font-title)', fontWeight: 900, textShadow: '0 0 8px var(--neon-glow)', zIndex: 1, paddingBottom: 28 }}>VS</div>

            {/* Enemy sprite (Enlarged and border-cropped) */}
            {battle.currentMob ? (
              <div className={isEnemyHit ? 'hit-flash' : ''} style={styles.enemySprite}>
                <div style={{ animation: 'spritePulse 1.5s infinite ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 120, height: 120, flexShrink: 0 }}>
                  {battle.currentMob.image ? (
                    <TransparentSprite 
                      src={battle.currentMob.image} 
                      alt={battle.currentMob.name} 
                      size={120} 
                      glowColor="var(--neon-glow)" 
                    />
                  ) : (
                    <EnemySprite isBoss={battle.isBoss} isPitBoss={battle.isPitBoss} size={120} />
                  )}
                </div>
                <div style={styles.spriteLabel}>{battle.currentMob.name?.split(' ')[0]}</div>
              </div>
            ) : (
              <div style={styles.enemySprite}>
                <div style={{ fontSize: 56, opacity: 0.3 }}>💤</div>
                <div style={styles.spriteLabel}>DEBRIS</div>
              </div>
            )}

            {/* Floating damage popups */}
            {particles.map((p) => (
              <div
                key={p.id}
                className="damage-particle"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y - 12}%`,
                  textShadow: p.isCrit ? '0 0 10px #ff3131, 0 0 20px #ff0000' : '0 0 8px var(--neon-glow)'
                }}
              >
                {p.text}
              </div>
            ))}
          </div>
        </div>

        {/* 5. Session summary (Bottom-most bar) */}
        <div style={styles.sessionSummaryActive}>
          <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, textShadow: '0 0 4px #000' }}>
            ⚔️ {battle.kills} kills &nbsp;|&nbsp; <span style={{ color: '#f5a623' }}>+{battle.sessionAnium}⬡</span> &nbsp;|&nbsp; <span style={{ color: '#00e5ff' }}>+{battle.sessionExp} EXP</span>
          </span>
        </div>
      </div>
    )
  }

  // Normal / Lobby Layout
  return (
    <div style={styles.screen}>
      {/* Resource bar */}
      <div style={styles.resBar}>
        <span style={styles.resPill('var(--neon-glow)')}>⬡ {player.resources.anium.toLocaleString()}</span>
        <span style={styles.resPill('#00e5ff')}>◈ {player.resources.credits}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#7ab0d0', fontWeight: 700 }}>
              {race ? race.emoji + ' ' + race.name : '—'}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#00e5ff', fontWeight: 700 }}>
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
        <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.statCard}><div style={styles.statLabel}>LEVEL</div><div style={{ ...styles.statVal, color: '#00e5ff' }}>{player.level}</div></div>
        <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.statCard}><div style={styles.statLabel}>SECTOR</div><div style={{ ...styles.statVal, color: '#f5a623' }}>S-{player.sector}</div></div>
        <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.statCard}><div style={styles.statLabel}>STREAK</div><div style={{ ...styles.statVal, color: '#ff4466' }}>🔥{player.streak}</div></div>
      </div>

      {/* 2.5D Battle Arena */}
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''} ${isCritHit ? 'screen-shake' : ''}`} style={styles.arena}>
        <div style={styles.arenaBadge}>🔥 {enemy.name}</div>
        <div style={styles.arenaRight}>SECTOR {player.sector}<br /><span style={{ color: '#4a8fa8', fontSize: 13, fontWeight: 800 }}>HIGHEST: S-{player.highestSector}</span></div>

        {/* 2.5D Character placement */}
        <div style={styles.arenaVisualContainer}>
          <div style={styles.arenaGridOverlay} />

          {/* Player unit */}
          <div style={styles.playerSprite}>
            <div>
              <PilotSprite race={player.race} size={60} />
            </div>
            <div style={styles.spriteLabel}>PILOT</div>
          </div>

          <div style={{ fontSize: 18, color: 'var(--neon-glow)', fontFamily: 'var(--font-title)', fontWeight: 900, textShadow: '0 0 8px var(--neon-glow)', zIndex: 1 }}>VS</div>

          {/* Enemy unit */}
          <div style={styles.enemySprite}>
            <div style={{ fontSize: 40, opacity: 0.3 }}>💤</div>
            <div style={styles.spriteLabel}>READY</div>
          </div>
        </div>
      </div>

      {/* Mode selector */}
      <div style={styles.modeRow}>
        <button style={styles.modeBtn(timer.mode === 'fight')} onClick={() => setMode('fight')}>⚔️ FIGHT</button>
        <button style={styles.modeBtn(timer.mode === 'gather')} onClick={() => setMode('gather')}>⛏️ GATHER</button>
      </div>

      {/* Combat stats */}
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.combatStats}>
        <div style={styles.cstat}><div style={styles.cstatLabel}>FIREPOWER</div><div style={{ ...styles.cstatVal, color: '#f5a623' }}>{stats.atk}</div></div>
        <div style={{ width: 1, background: '#0d2a50' }} />
        <div style={styles.cstat}><div style={styles.cstatLabel}>ARMOR</div><div style={{ ...styles.cstatVal, color: '#00c8ff' }}>{stats.def}</div></div>
        <div style={{ width: 1, background: '#0d2a50' }} />
        <div style={styles.cstat}><div style={styles.cstatLabel}>SHIELD HP</div><div style={{ ...styles.cstatVal, color: '#ff4466' }}>{stats.hp.toLocaleString()}</div></div>
      </div>

      {/* Timer options */}
      <div style={styles.timerRow}>
        {[10, 25, 60].map((m) => (
          <button key={m} style={styles.timerBtn(timer.selectedMinutes === m)} onClick={() => setTimerMinutes(m)}>
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
      {isDone && (
        <button style={{ ...styles.deployBtn, background: 'linear-gradient(90deg,#006000,#00c840)' }} onClick={resetTimer}>
          🔄 NEW SESSION
        </button>
      )}
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', gap: 0, fontFamily: 'var(--font-body)', zIndex: 1 },
  resBar: { display: 'flex', gap: 8, padding: '12px 16px 8px', alignItems: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)' },
  resPill: (c) => ({ background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 20, padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: c, boxShadow: `0 0 12px ${c}33, inset 0 0 8px ${c}22` }),
  expSection: { padding: '10px 16px 8px', background: 'rgba(3, 8, 20, 0.2)' },
  expLabel: { fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', letterSpacing: 2, marginBottom: 5, fontWeight: 800, textShadow: '0 0 8px rgba(0, 229, 255, 0.4)' },
  expBg: { height: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0, 229, 255, 0.25)' },
  expFill: { height: '100%', background: 'linear-gradient(90deg, #0050cc, #00e5ff)', borderRadius: 4, transition: 'width 0.5s', boxShadow: '0 0 8px #00e5ff' },
  expText: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ab0d0', marginTop: 4, textAlign: 'right', fontWeight: 800 },
  statRow: { display: 'flex', gap: 8, padding: '4px 16px 10px' },
  statCard: { flex: 1, padding: '8px 6px', textAlign: 'center' },
  statLabel: { fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1, color: '#7ab0d0', marginBottom: 4, fontWeight: 800 },
  statVal: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, textShadow: '0 0 8px rgba(0, 229, 255, 0.2)' },
  arena: { margin: '0 16px 12px', padding: '36px 12px 12px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' },
  arenaActive: { margin: '16px', padding: '44px 16px 20px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', flex: 1, justifyContent: 'center' },
  arenaBadge: { position: 'absolute', top: 12, left: 12, background: 'rgba(26, 8, 0, 0.8)', border: '1px solid #ff6400', borderRadius: 6, padding: '3px 8px', fontFamily: 'var(--font-title)', fontSize: 13, color: '#ff8c40', fontWeight: 800, boxShadow: '0 0 10px rgba(255, 100, 0, 0.3)', zIndex: 2 },
  arenaRight: { position: 'absolute', top: 12, right: 12, fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', textAlign: 'right', fontWeight: 800, textShadow: '0 0 6px rgba(0, 229, 255, 0.3)', zIndex: 2 },
  arenaVisualContainer: { width: '100%', margin: '12px 0 6px 0', padding: '16px 16px 0 16px', position: 'relative', minHeight: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', overflow: 'hidden', background: 'transparent', border: 'none' },
  arenaVisualContainerActive: { width: '100%', margin: '16px 0 10px 0', padding: '32px 16px 0 16px', position: 'relative', minHeight: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', overflow: 'visible', background: 'transparent', border: 'none' },
  arenaGridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', backgroundImage: 'linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px)', backgroundSize: '12px 12px', transform: 'perspective(40px) rotateX(60deg)', transformOrigin: 'bottom center', opacity: 0.8, pointerEvents: 'none' },
  playerSprite: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, paddingBottom: 6 },
  enemySprite: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, paddingBottom: 6 },
  spriteLabel: { fontFamily: 'var(--font-title)', fontSize: 11, letterSpacing: 0.5, color: '#7ab0d0', textTransform: 'uppercase', fontWeight: 800, background: 'rgba(3, 8, 20, 0.65)', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(0, 229, 255, 0.15)' },
  timerDisplay: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 2, marginTop: 12 },
  timerDisplayActive: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 2, margin: '24px 0', justifyContent: 'center', flex: 1 },
  battleLog: { marginTop: 10, width: '100%', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0,0,0,0.35)', padding: 8, borderRadius: 8, border: '1px solid rgba(0, 229, 255, 0.1)' },
  battleLogActive: { width: '90%', display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(3, 8, 20, 0.9)', padding: 12, borderRadius: 10, border: '1.5px solid var(--neon-glow)', margin: '12px auto', boxShadow: '0 0 10px rgba(0,0,0,0.5)' },
  modeRow: { display: 'flex', gap: 8, padding: '0 16px 10px' },
  modeBtn: (active) => ({ flex: 1, padding: 10, borderRadius: 8, fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, cursor: 'pointer', border: `1px solid ${active ? '#00e5ff' : 'rgba(0, 229, 255, 0.15)'}`, background: active ? 'linear-gradient(135deg, rgba(0, 80, 204, 0.4) 0%, rgba(0, 168, 255, 0.4) 100%)' : 'rgba(6, 15, 35, 0.6)', color: active ? '#fff' : '#7ab0d0', boxShadow: active ? '0 0 10px rgba(0, 229, 255, 0.3)' : 'none', transition: 'all 0.2s', letterSpacing: 1 }),
  combatStats: { margin: '0 16px 10px', padding: 10, display: 'flex', justifyContent: 'space-around' },
  cstat: { textAlign: 'center' },
  cstatLabel: { fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1, color: '#7ab0d0', marginBottom: 2, fontWeight: 800 },
  cstatVal: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  timerRow: { display: 'flex', gap: 8, padding: '0 16px 10px' },
  timerBtn: (active) => ({ flex: 1, padding: 10, borderRadius: 8, fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, cursor: 'pointer', border: `1px solid ${active ? '#00e5ff' : 'rgba(0, 229, 255, 0.15)'}`, background: active ? 'linear-gradient(135deg, rgba(0, 80, 204, 0.4) 0%, rgba(0, 168, 255, 0.4) 100%)' : 'rgba(6, 15, 35, 0.6)', color: active ? '#fff' : '#7ab0d0', boxShadow: active ? '0 0 10px rgba(0, 229, 255, 0.3)' : 'none', transition: 'all 0.2s', letterSpacing: 0.5 }),
  deployBtn: { margin: '0 16px 16px', padding: 14, borderRadius: 10, border: '1px solid #00e5ff', background: 'linear-gradient(135deg, #0050cc 0%, #00a8ff 100%)', fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: 2, cursor: 'pointer', boxShadow: '0 0 12px rgba(0, 168, 255, 0.3)', transition: 'all 0.2s', textTransform: 'uppercase' },
  sessionSummary: { textAlign: 'center', padding: '0 16px 10px' },
  sessionSummaryActive: { textAlign: 'center', padding: '12px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(3, 8, 20, 0.95)', border: '1.5px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 0 10px rgba(0,0,0,0.5)', margin: '12px 16px 16px 16px', borderRadius: 8 },
  logoutBtn: { background: 'rgba(6, 15, 35, 0.6)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: 6, color: '#4a8fa8', fontSize: 13, cursor: 'pointer', padding: '4px 8px', lineHeight: 1, transition: 'all 0.2s' },
  // Abandon
  topAbandonBar: { display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0 16px', zIndex: 10 },
  smallAbandonBtn: { background: 'rgba(255, 49, 49, 0.1)', border: '1px solid rgba(255, 49, 49, 0.4)', borderRadius: 6, color: '#ff4444', fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, padding: '6px 12px', cursor: 'pointer', letterSpacing: 1, transition: 'all 0.2s', boxShadow: '0 0 8px rgba(255, 49, 49, 0.1)' },
  arenaActiveUnboxed: { margin: '0', padding: '24px 16px 0 16px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'visible', flex: 1, justifyContent: 'flex-end', width: '100%' },
  // New Contrast Framed Active Styles
  activeHeader: { display: 'flex', justifyContent: 'space-between', padding: '10px 16px', alignItems: 'center', width: '100%', zIndex: 10, background: 'rgba(3, 8, 20, 0.9)', borderBottom: '2.5px solid rgba(0, 229, 255, 0.35)', boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)' },
  activeStageBadge: { background: 'rgba(3, 8, 20, 0.95)', border: '1.5px solid var(--neon-glow)', borderRadius: '8px', padding: '6px 12px', fontFamily: 'var(--font-title)', fontSize: 13, color: '#fff', fontWeight: 800, boxShadow: '0 0 8px var(--neon-glow)', textShadow: '0 0 4px #000' },
  activeSectorLabel: { fontFamily: 'var(--font-title)', fontSize: 13, color: 'var(--neon-glow)', fontWeight: 800, textShadow: '0 0 8px var(--neon-glow)', background: 'rgba(3, 8, 20, 0.95)', border: '1.5px solid var(--neon-glow)', borderRadius: '8px', padding: '6px 12px', boxShadow: '0 0 8px var(--neon-glow)' },
  activeGatherBadge: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00e5ff', marginTop: 12, fontWeight: 700, zIndex: 2, letterSpacing: 1, background: 'rgba(3, 8, 20, 0.95)', padding: '6px 16px', borderRadius: '8px', border: '1.5px solid rgba(0, 229, 255, 0.5)', boxShadow: '0 0 8px rgba(0, 229, 255, 0.3)', textShadow: '0 0 4px #000' },
  activeHealthBarWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '90%', marginTop: 8, zIndex: 2, background: 'rgba(3, 8, 20, 0.95)', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid rgba(0, 229, 255, 0.35)', boxShadow: '0 0 10px rgba(0,0,0,0.5)', margin: '12px auto' }
}
