import { useEffect, useState, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import races from '../data/races.json'
import enemies from '../data/enemies.json'
import { PilotSprite, EnemySprite } from '../components/PilotSprites'
import TransparentSprite from '../components/TransparentSprite'
import { t } from '../lib/translate'
import SettingsModal from '../components/SettingsModal'
import NpcModal from '../components/NpcModal'


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

  const [showSettings, setShowSettings] = useState(false)
  const [showNpcModal, setShowNpcModal] = useState(false)


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
  const [playerAnim, setPlayerAnim] = useState('')
  const [enemyAnim, setEnemyAnim] = useState('')
  const lastHpRef = useRef(battle.enemyHp)
  const lastPlayerHpRef = useRef(battle.playerHp)

  // Trigger floating damage popup
  const spawnDamage = (amount, isCrit) => {
    const id = Math.random().toString()
    const newP = {
      id,
      text: isCrit ? `💥-${amount}` : `-${amount}`,
      x: 55 + Math.random() * 15,
      y: 35 + Math.random() * 15,
      isCrit,
      isPlayerDmg: false
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

      // Attack and hit animations
      setPlayerAnim('anim-attack-lunge')
      const animPlayerTimer = setTimeout(() => setPlayerAnim(''), 300)
      
      setEnemyAnim('anim-hit-shake')
      const animEnemyTimer = setTimeout(() => setEnemyAnim(''), 250)

      if (isCrit) {
        setIsCritHit(true)
        const shakeTimer = setTimeout(() => setIsCritHit(false), 300)
        return () => {
          clearTimeout(hitTimer)
          clearTimeout(animPlayerTimer)
          clearTimeout(animEnemyTimer)
          clearTimeout(shakeTimer)
        }
      }
      return () => {
        clearTimeout(hitTimer)
        clearTimeout(animPlayerTimer)
        clearTimeout(animEnemyTimer)
      }
    }

    lastHpRef.current = currentHp
  }, [battle.enemyHp, isRunning, battle.currentMob])

  // Monitor player damage events
  useEffect(() => {
    if (!isRunning || battle.playerHp === undefined) return

    const currentHp = battle.playerHp
    const prevHp = lastPlayerHpRef.current

    if (currentHp > 0 && currentHp < prevHp) {
      const diff = prevHp - currentHp
      const id = Math.random().toString()
      const newP = {
        id,
        text: `💥-${diff}`,
        x: 18 + Math.random() * 12,
        y: 35 + Math.random() * 15,
        isPlayerDmg: true
      }
      setParticles((prev) => [...prev, newP])
      const particleTimer = setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id))
      }, 800)

      // Enemy attacks, player gets hit animations
      setEnemyAnim('anim-attack-lunge-reverse')
      const animEnemyTimer = setTimeout(() => setEnemyAnim(''), 300)
      
      setPlayerAnim('anim-hit-shake')
      const animPlayerTimer = setTimeout(() => setPlayerAnim(''), 250)

      return () => {
        clearTimeout(particleTimer)
        clearTimeout(animEnemyTimer)
        clearTimeout(animPlayerTimer)
      }
    }

    lastPlayerHpRef.current = currentHp
  }, [battle.playerHp, isRunning])

  // Confirm Abandon Session
  const handleAbandon = () => {
    if (window.confirm(t('confirm_abandon'))) {
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
      <div className="no-scrollbar" style={styles.screen}>
        {/* Top corner discreet abandon button and Stage header */}
        <div style={styles.activeHeader}>
          <div style={styles.activeStageBadge}>📍 {enemy.name}</div>
          <div style={styles.activeSectorLabel}>SECTOR {player.sector}</div>
          <button onClick={handleAbandon} style={styles.smallAbandonBtn}>
            {t('abandon_btn')}
          </button>
        </div>

        {/* 1. Sleek Compact Text Timer (Top portion) */}
        <div style={styles.timerDisplayActiveCompact}>
          <span style={styles.activeTimerDigits}>{fmt(timer.secondsLeft)}</span>
          <div style={{ ...styles.activeGatherBadge, color: '#ffaa00', borderColor: 'rgba(255, 170, 0, 0.5)', boxShadow: '0 0 8px rgba(255, 170, 0, 0.3)' }}>{t('focus_active')}</div>
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
              <span>{t('pilot_shield')}</span>
              <span>{(battle.playerHp !== undefined && !isNaN(battle.playerHp)) ? battle.playerHp : stats.hp} / {battle.playerMaxHp || stats.hp} HP</span>
            </div>
            <div style={{ width: '90%', height: 6, background: '#0a1020', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(0, 229, 255, 0.5)', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${Math.max(0, (((battle.playerHp !== undefined && !isNaN(battle.playerHp)) ? battle.playerHp : stats.hp) / (battle.playerMaxHp || stats.hp || 1)) * 100)}%`, background: 'linear-gradient(90deg, #0050cc, #00e5ff)', borderRadius: 3, transition: 'width 0.2s' }} />
            </div>

            {/* Player FP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#da70d6', fontWeight: 800, textShadow: '0 0 4px #000' }}>
              <span>{t('force_point')}</span>
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

            {/* Player sprite (Full body) */}
            <div style={styles.playerSprite} className={playerAnim}>
              <div style={{
                animation: 'spritePulse 1.2s infinite ease-in-out',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                width: 160,
                height: 160,
                position: 'relative',
                flexShrink: 0
              }}>
                <PilotSprite race={player.race} size={160} />
              </div>
              <div style={styles.spriteLabel}>{username}</div>
            </div>

            <div style={{ fontSize: 24, color: 'var(--neon-glow)', fontFamily: 'var(--font-title)', fontWeight: 900, textShadow: '0 0 8px var(--neon-glow)', zIndex: 1, paddingBottom: 40 }}>VS</div>

            {/* Enemy sprite (Enlarged and border-cropped) */}
            {battle.currentMob ? (
              <div className={`${isEnemyHit ? 'hit-flash' : ''} ${enemyAnim}`} style={styles.enemySprite}>
                <div style={{ animation: 'spritePulse 1.5s infinite ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 160, height: 160, flexShrink: 0 }}>
                  {battle.currentMob.image ? (
                    <TransparentSprite 
                      src={battle.currentMob.image} 
                      alt={battle.currentMob.name} 
                      size={160} 
                      glowColor="var(--neon-glow)" 
                    />
                  ) : (
                    <EnemySprite isBoss={battle.isBoss} isPitBoss={battle.isPitBoss} size={160} />
                  )}
                </div>
                <div style={styles.spriteLabel}>{battle.currentMob.name?.split(' ')[0]}</div>
              </div>
            ) : (
              <div style={styles.enemySprite}>
                <div style={{ fontSize: 64, opacity: 0.3 }}>💤</div>
                <div style={styles.spriteLabel}>{t('debris_label')}</div>
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
                  color: p.isPlayerDmg ? '#ff4444' : '#fff',
                  textShadow: p.isPlayerDmg 
                    ? '0 0 8px #ff0033, 0 0 15px #ff0000' 
                    : p.isCrit 
                    ? '0 0 10px #ff3131, 0 0 20px #ff0000' 
                    : '0 0 8px var(--neon-glow)'
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
            ⚔️ {t('kills_label', { kills: battle.kills })} &nbsp;|&nbsp; <span style={{ color: '#f5a623' }}>+{battle.sessionAnium}⬡</span> &nbsp;|&nbsp; <span style={{ color: '#00e5ff' }}>+{battle.sessionExp} EXP</span>
          </span>
        </div>
      </div>

    )
  }

  // Normal / Lobby Layout
  return (
    <div className="no-scrollbar" style={styles.screen}>
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
          <button onClick={() => window.open(`${import.meta.env.VITE_API_URL || ''}/library.html`, '_blank')} style={styles.logoutBtn} title="Database & Guides">📖</button>
          <button onClick={() => setShowSettings(true)} style={styles.logoutBtn} title="Settings">⚙️</button>
          <button onClick={signOut} style={styles.logoutBtn} title="Logout">⏏</button>
        </span>
      </div>


      {/* EXP bar */}
      <div style={styles.expSection}>
        <div style={styles.expLabel}>LV.{player.level} — {t('to_next_exp', { pct: expPct })}</div>
        <div style={styles.expBg}><div style={{ ...styles.expFill, width: expPct + '%' }} /></div>
        <div style={styles.expText}>{player.exp} / {expMax} EXP</div>
      </div>


      {/* Stat cards */}
      <div style={styles.statRow}>
        <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.statCard}><div style={styles.statLabel}>{t('level_lbl')}</div><div style={{ ...styles.statVal, color: '#00e5ff' }}>{player.level}</div></div>
        <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.statCard}><div style={styles.statLabel}>{t('sector_lbl')}</div><div style={{ ...styles.statVal, color: '#f5a623' }}>S-{player.sector}</div></div>
        <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.statCard}><div style={styles.statLabel}>{t('streak_lbl')}</div><div style={{ ...styles.statVal, color: '#ff4466' }}>🔥{player.streak}</div></div>
      </div>


      {/* Grind Zone location header docked above the profile card */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        margin: '0 16px -6px 16px',
        padding: '6px 12px 8px 12px',
        background: 'rgba(4, 9, 21, 0.8)',
        border: '1.5px solid var(--border-neon)',
        borderBottom: 'none',
        borderRadius: '8px 8px 0 0',
        fontFamily: 'var(--font-title)',
        fontSize: 11,
        fontWeight: 800,
        color: '#7ab0d0',
        letterSpacing: '1px',
        position: 'relative',
        zIndex: 2,
        boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none" style={{ flexShrink: 0 }}>
              <polygon points="5.5,0 11,3 11,8.5 5.5,13 0,8.5 0,3" stroke="currentColor" strokeWidth="1.2" fill="none"/>
              <circle cx="5.5" cy="6" r="1.8" fill="currentColor"/>
              <line x1="5.5" y1="0" x2="5.5" y2="2.2" stroke="currentColor" strokeWidth="1"/>
              <line x1="5.5" y1="9.8" x2="5.5" y2="13" stroke="currentColor" strokeWidth="1"/>
            </svg>
            <span>{t('location_lbl')}:</span>
          <span style={{ color: 'var(--neon-glow)', textShadow: '0 0 6px var(--neon-glow)' }}>{enemy.name.toUpperCase()}</span>
        </div>
        <div>
          {t('sector_lbl')}: <span style={{ color: '#fff' }}>S-{player.sector}</span>
        </div>
      </div>

      {/* Redesigned Profile ID Card */}
      <div 
        className={`profile-id-card ${player.race ? 'panel-' + player.race : ''} ${isCritHit ? 'screen-shake' : ''}`}
        style={{ margin: '0 16px 12px', zIndex: 1 }}
      >
        {/* Metal rivet corners */}
        <div className="profile-id-rivet top-left" />
        <div className="profile-id-rivet top-right" />
        <div className="profile-id-rivet bottom-left" />
        <div className="profile-id-rivet bottom-right" />

        <div className="profile-id-body">
          {/* Avatar side */}
          <div className="profile-avatar-glow-wrap">
            <div className="profile-corner tl" />
            <div className="profile-corner tr" />
            <div className="profile-corner bl" />
            <div className="profile-corner br" />
            <div className="profile-avatar-inner">
              <div className="profile-avatar-grid" />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 2 }}>
                <PilotSprite race={player.race} width={112} height={150} fill={true} />
              </div>
            </div>
          </div>

          {/* Details side */}
          <div className="profile-details-wrap">
            <div className="profile-details-header-badge">STATUS</div>
            <div className="profile-details-username">@{username}</div>
            
            <div className="profile-status-panel">
              <div className="profile-status-online-row">
                <div className="profile-status-led" />
                STATUS: <span className="profile-status-online-val" style={{ fontWeight: 'bold', color: '#39ff14', textShadow: '0 0 6px rgba(57, 255, 20, 0.5)' }}>SYSTEM ONLINE</span>
              </div>

              {/* Dynamic Experience bar */}
              <div className="profile-status-bar">
                {Array.from({ length: 12 }).map((_, idx) => {
                  const litThreshold = (idx + 1) * (100 / 12);
                  const isLit = expPct >= litThreshold;
                  return (
                    <div 
                      key={idx} 
                      className={`profile-status-segment ${isLit ? '' : 'dim'}`} 
                    />
                  )
                })}
              </div>
            </div>

            {/* Substats boxes */}
            <div className="profile-stats-grid">
              <div className="profile-stats-col">
                <div className="profile-stats-col-lbl">PILOT ID</div>
                <div className="profile-stats-col-val">PLT-{player.level || 1}09X</div>
              </div>
              <div className="profile-stats-col">
                <div className="profile-stats-col-lbl">FACTION</div>
                <div className="profile-stats-col-val">{player.race || 'UNKNOWN'}</div>
              </div>
              <div className="profile-stats-col">
                <div className="profile-stats-col-lbl">STATUS</div>
                <div className="profile-stats-col-val">ACTIVE</div>
              </div>
            </div>

          </div>
        </div>

      </div>



      {/* Combat stats */}
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.combatStats}>
        <div style={styles.cstat}><div style={styles.cstatLabel}>{t('firepower')}</div><div style={{ ...styles.cstatVal, color: '#f5a623' }}>{stats.atk}</div></div>
        <div style={{ width: 1, background: '#0d2a50' }} />
        <div style={styles.cstat}><div style={styles.cstatLabel}>{t('armor')}</div><div style={{ ...styles.cstatVal, color: '#00c8ff' }}>{stats.def}</div></div>
        <div style={{ width: 1, background: '#0d2a50' }} />
        <div style={styles.cstat}><div style={styles.cstatLabel}>{t('shield_hp')}</div><div style={{ ...styles.cstatVal, color: '#ff4466' }}>{stats.hp.toLocaleString()}</div></div>
      </div>

      {/* Timer options */}
      <div style={styles.timerRow}>
        {[10, 25, 60].map((m) => (
          <button key={m} style={styles.timerBtn(timer.selectedMinutes === m)} onClick={() => setTimerMinutes(m)}>
            {t('minutes_short', { m })}
          </button>
        ))}
      </div>

      {/* Faction NPC Access Button */}
      {!isRunning && player.race && (
        <button style={styles.npcBtn} onClick={() => setShowNpcModal(true)}>
          🏪 {t('visit_npc')}
        </button>
      )}

      {/* Main action button */}
      {!isRunning && !isDone && (
        <button style={styles.deployBtn} onClick={player.race ? startTimer : openRaceSelect}>
          {player.race ? t('deploy_unit') : t('select_race')}
        </button>
      )}
      {isDone && (
        <button style={{ ...styles.deployBtn, background: 'linear-gradient(90deg,#006000,#00c840)' }} onClick={resetTimer}>
          {t('new_session')}
        </button>
      )}
      
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showNpcModal && <NpcModal onClose={() => setShowNpcModal(false)} />}

    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, gap: 0, fontFamily: 'var(--font-body)', zIndex: 1 },
  resBar: { display: 'flex', gap: 8, padding: '8px 16px 6px', alignItems: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)', flexShrink: 0 },
  resPill: (c) => ({ background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 20, padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: c, boxShadow: `0 0 12px ${c}33, inset 0 0 8px ${c}22` }),
  expSection: { padding: '6px 16px', background: 'rgba(3, 8, 20, 0.2)', flexShrink: 0 },
  expLabel: { fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', letterSpacing: 2, marginBottom: 5, fontWeight: 800, textShadow: '0 0 8px rgba(0, 229, 255, 0.4)' },
  expBg: { height: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0, 229, 255, 0.25)' },
  expFill: { height: '100%', background: 'linear-gradient(90deg, #0050cc, #00e5ff)', borderRadius: 4, transition: 'width 0.5s', boxShadow: '0 0 8px #00e5ff' },
  expText: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ab0d0', marginTop: 4, textAlign: 'right', fontWeight: 800 },
  statRow: { display: 'flex', gap: 8, padding: '4px 16px 4px', flexShrink: 0 },
  statCard: { flex: 1, padding: '8px 6px', textAlign: 'center' },
  statLabel: { fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1, color: '#7ab0d0', marginBottom: 4, fontWeight: 800 },
  statVal: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, textShadow: '0 0 8px rgba(0, 229, 255, 0.2)' },
  arena: { margin: '0 16px 12px', padding: '22px 12px 12px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', flexShrink: 0 },
  arenaActive: { margin: '16px', padding: '44px 16px 20px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', flex: 1, justifyContent: 'center' },
  arenaBadge: { position: 'absolute', top: 12, left: 12, background: 'rgba(26, 8, 0, 0.8)', border: '1px solid #ff6400', borderRadius: 6, padding: '3px 8px', fontFamily: 'var(--font-title)', fontSize: 13, color: '#ff8c40', fontWeight: 800, boxShadow: '0 0 10px rgba(255, 100, 0, 0.3)', zIndex: 2 },
  arenaRight: { position: 'absolute', top: 12, right: 12, fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', textAlign: 'right', fontWeight: 800, textShadow: '0 0 6px rgba(0, 229, 255, 0.3)', zIndex: 2 },
  arenaVisualContainer: { width: '100%', margin: '6px 0 0 0', padding: '16px 16px 0 16px', position: 'relative', minHeight: 130, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', background: 'transparent', border: 'none' },
  arenaVisualContainerActive: { width: '100%', margin: '16px 0 10px 0', padding: '32px 16px 0 16px', position: 'relative', minHeight: 240, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', overflow: 'visible', background: 'transparent', border: 'none' },
  arenaGridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', backgroundImage: 'linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px)', backgroundSize: '12px 12px', transform: 'perspective(40px) rotateX(60deg)', transformOrigin: 'bottom center', opacity: 0.8, pointerEvents: 'none' },
  playerSprite: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, paddingBottom: 6 },
  enemySprite: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, paddingBottom: 6 },
  spriteLabel: { fontFamily: 'var(--font-title)', fontSize: 11, letterSpacing: 0.5, color: '#7ab0d0', textTransform: 'uppercase', fontWeight: 800, background: 'rgba(3, 8, 20, 0.65)', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(0, 229, 255, 0.15)' },
  timerDisplay: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 2, marginTop: 12 },
  timerDisplayActiveCompact: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 2, margin: '12px 0 6px 0', justifyContent: 'center', flexShrink: 0 },
  activeTimerDigits: { fontSize: 44, fontFamily: 'monospace', fontWeight: 900, color: '#fff', textShadow: '0 0 10px var(--neon-glow), 0 0 20px var(--neon-glow)' },
  battleLog: { marginTop: 10, width: '100%', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0,0,0,0.35)', padding: 8, borderRadius: 8, border: '1px solid rgba(0, 229, 255, 0.1)' },
  battleLogActive: { width: '90%', display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(3, 8, 20, 0.9)', padding: 12, borderRadius: 10, border: '1.5px solid var(--neon-glow)', margin: '12px auto', boxShadow: '0 0 10px rgba(0,0,0,0.5)', flexShrink: 0 },
  modeRow: { display: 'flex', gap: 8, padding: '0 16px 10px' },
  modeBtn: (active) => ({ flex: 1, padding: 10, borderRadius: 8, fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, cursor: 'pointer', border: `1px solid ${active ? '#00e5ff' : 'rgba(0, 229, 255, 0.15)'}`, background: active ? 'linear-gradient(135deg, rgba(0, 80, 204, 0.4) 0%, rgba(0, 168, 255, 0.4) 100%)' : 'rgba(6, 15, 35, 0.6)', color: active ? '#fff' : '#7ab0d0', boxShadow: active ? '0 0 10px rgba(0, 229, 255, 0.3)' : 'none', transition: 'all 0.2s', letterSpacing: 1 }),
  combatStats: { margin: '0 16px 6px', padding: 8, display: 'flex', justifyContent: 'space-around', flexShrink: 0 },
  cstat: { textAlign: 'center' },
  cstatLabel: { fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1, color: '#7ab0d0', marginBottom: 2, fontWeight: 800 },
  cstatVal: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  timerRow: { display: 'flex', gap: 8, padding: '0 16px 6px', flexShrink: 0 },
  timerBtn: (active) => ({ flex: 1, padding: 10, borderRadius: 8, fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, cursor: 'pointer', border: `1px solid ${active ? '#00e5ff' : 'rgba(0, 229, 255, 0.15)'}`, background: active ? 'linear-gradient(135deg, rgba(0, 80, 204, 0.4) 0%, rgba(0, 168, 255, 0.4) 100%)' : 'rgba(6, 15, 35, 0.6)', color: active ? '#fff' : '#7ab0d0', boxShadow: active ? '0 0 10px rgba(0, 229, 255, 0.3)' : 'none', transition: 'all 0.2s', letterSpacing: 0.5 }),
  deployBtn: { margin: '0 16px 10px', padding: 14, borderRadius: 10, border: '1px solid #00e5ff', background: 'linear-gradient(135deg, #0050cc 0%, #00a8ff 100%)', fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: 2, cursor: 'pointer', boxShadow: '0 0 12px rgba(0, 168, 255, 0.3)', transition: 'all 0.2s', textTransform: 'uppercase', flexShrink: 0 },
  npcBtn: { margin: '0 16px 6px', padding: 12, borderRadius: 10, border: '1.5px solid var(--neon-glow)', background: 'rgba(3, 8, 20, 0.85)', fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: 1.5, cursor: 'pointer', boxShadow: '0 0 10px rgba(255, 100, 0, 0.15), inset 0 0 8px rgba(255, 100, 0, 0.1)', transition: 'all 0.2s', textTransform: 'uppercase', textAlign: 'center', flexShrink: 0 },
  sessionSummary: { textAlign: 'center', padding: '0 16px 10px' },
  sessionSummaryActive: { textAlign: 'center', padding: '12px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(3, 8, 20, 0.95)', border: '1.5px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 0 10px rgba(0,0,0,0.5)', margin: '12px 16px 16px 16px', borderRadius: 8, flexShrink: 0 },
  logoutBtn: { background: 'rgba(6, 15, 35, 0.6)', border: '1px solid rgba(0, 229, 255, 0.2)', borderRadius: 6, color: '#4a8fa8', fontSize: 13, cursor: 'pointer', padding: '4px 8px', lineHeight: 1, transition: 'all 0.2s' },
  // Abandon
  topAbandonBar: { display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0 16px', zIndex: 10 },
  smallAbandonBtn: { background: 'rgba(255, 49, 49, 0.1)', border: '1px solid rgba(255, 49, 49, 0.4)', borderRadius: 6, color: '#ff4444', fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, padding: '6px 12px', cursor: 'pointer', letterSpacing: 1, transition: 'all 0.2s', boxShadow: '0 0 8px rgba(255, 49, 49, 0.1)' },
  arenaActiveUnboxed: { margin: '0', padding: '24px 16px 0 16px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'visible', flex: 1, justifyContent: 'flex-end', width: '100%', flexShrink: 0 },
  // New Contrast Framed Active Styles
  activeHeader: { display: 'flex', justifyContent: 'space-between', padding: '10px 16px', alignItems: 'center', width: '100%', zIndex: 10, background: 'rgba(3, 8, 20, 0.9)', borderBottom: '2.5px solid rgba(0, 229, 255, 0.35)', boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)', flexShrink: 0 },
  activeStageBadge: { background: 'rgba(3, 8, 20, 0.95)', border: '1.5px solid var(--neon-glow)', borderRadius: '8px', padding: '6px 12px', fontFamily: 'var(--font-title)', fontSize: 13, color: '#fff', fontWeight: 800, boxShadow: '0 0 8px var(--neon-glow)', textShadow: '0 0 4px #000' },
  activeSectorLabel: { fontFamily: 'var(--font-title)', fontSize: 13, color: 'var(--neon-glow)', fontWeight: 800, textShadow: '0 0 8px var(--neon-glow)', background: 'rgba(3, 8, 20, 0.95)', border: '1.5px solid var(--neon-glow)', borderRadius: '8px', padding: '6px 12px', boxShadow: '0 0 8px var(--neon-glow)' },
  activeGatherBadge: { fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00e5ff', marginTop: 6, fontWeight: 800, zIndex: 2, letterSpacing: 1, background: 'rgba(3, 8, 20, 0.95)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(0, 229, 255, 0.4)', boxShadow: '0 0 8px rgba(0, 229, 255, 0.2)', textShadow: '0 0 4px #000' },
  activeHealthBarWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '90%', marginTop: 8, zIndex: 2, background: 'rgba(3, 8, 20, 0.95)', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid rgba(0, 229, 255, 0.35)', boxShadow: '0 0 10px rgba(0,0,0,0.5)', margin: '12px auto', flexShrink: 0 }
}
