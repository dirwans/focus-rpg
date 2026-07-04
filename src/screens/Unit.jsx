import React, { useState } from 'react'
import { useGameStore, getPTCaps } from '../store/gameStore'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import archonData from '../data/archon.json'
import { PilotSprite } from '../components/PilotSprites'
import { t } from '../lib/translate'

const BIONEX_SPRITES = {
  guardian:     '/ref/Bellterra/Class-sprites-cleaned/Bellterra-warrior-cleaned.png',
  marksman:     '/ref/Bellterra/Class-sprites-cleaned/Bellterra-ranger-cleaned.png',
  psion:        '/ref/Bellterra/Class-sprites-cleaned/Bellterra-Spiritualist-cleaned.png',
  engineer:     '/ref/Bellterra/Class-sprites-cleaned/Bellterra-specialist-cleaned.png',
}

function getBionexJobSprite(jobId) {
  if (!jobId || !jobs.bionex) return null
  const tiers = ['tier1', 'tier2', 'tier3', 'tier4']
  for (let ti = 0; ti < tiers.length; ti++) {
    const arr = jobs.bionex[tiers[ti]]
    if (!arr) continue
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === jobId) {
        if (i === 0) return BIONEX_SPRITES.guardian
        if (i === 1) return BIONEX_SPRITES.marksman
        if (i === 2) return BIONEX_SPRITES.engineer
        if (i === 3) return BIONEX_SPRITES.psion
      }
    }
  }
  return null
}

function getJobInfo(raceId, jobId) {
  if (!raceId || !jobs[raceId]) return { tier: 0, job: null, classIndex: -1 }
  const rJobs = jobs[raceId]
  const tiers = ['tier1', 'tier2', 'tier3', 'tier4']
  for (let ti = 0; ti < tiers.length; ti++) {
    const t = tiers[ti]
    if (!rJobs[t]) continue
    const idx = rJobs[t].findIndex(j => j.id === jobId)
    if (idx !== -1) return { tier: parseInt(t.replace('tier', '')), job: rJobs[t][idx], classIndex: idx }
  }
  return { tier: 0, job: null, classIndex: -1 }
}

// Reusable accordion section
function AccordionSection({ label, raceClass, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`glass-panel cyber-panel ${raceClass}`} style={styles.section}>
      <div
        style={styles.sectionHeader}
        onClick={() => setOpen(o => !o)}
      >
        <span style={styles.sectionLabel}>{open ? '▾' : '▸'} {label}</span>
        <span style={styles.chevron}>{open ? '−' : '+'}</span>
      </div>
      {open && (
        <div style={styles.sectionBody}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function Unit() {
  const [tab, setTab] = useState('stats')
  const player = useGameStore((s) => s.player)
  const archons = useGameStore((s) => s.archons)
  const getStats = useGameStore((s) => s.getStats)
  const getExpToNext = useGameStore((s) => s.getExpToNext)
  const openRaceSelect = useGameStore((s) => s.openRaceSelect)
  const winnerRace = useGameStore((s) => s.winnerRace)
  const stats = getStats()
  const expMax = getExpToNext()
  const expPct = Math.floor((player.exp / expMax) * 100)
  const race = player.race ? races[player.race] : null
  const { tier, job, classIndex } = getJobInfo(player.race, player.job)

  const CLASS_NAMES = {
    celestra: ['Warrior', 'Ranger', 'Summoner', 'Mage'],
    arctron:  ['Warrior', 'Ranger', 'Specialist'],
    bionex:   ['Warrior', 'Ranger', 'Specialist', 'Mage']
  }
  const baseClass = (classIndex >= 0 && player.race && CLASS_NAMES[player.race])
    ? CLASS_NAMES[player.race][classIndex]?.toUpperCase() || 'NOVICE'
    : 'NOVICE'

  const pt = player.pt || {
    melee: { val: 1, pct: 0 },
    range: { val: 1, pct: 0 },
    force: { val: 1, pct: 0 },
    shield: { val: 1, pct: 0 },
    defense: { val: 1, pct: 0 },
    special: { val: 1, pct: 0 },
    production: { val: 1, pct: 0 },
  }
  const caps = getPTCaps(player.race, player.job, player.level)

  const gmMelee = pt.melee?.val >= 99
  const gmRange = pt.range?.val >= 99
  const gmForce = pt.force?.val >= 99
  const gmShield = pt.shield?.val >= 99

  const absoluteCaps = getPTCaps(player.race, player.job, 70)
  const eligibleGMKeys = Object.keys(absoluteCaps).filter(key => absoluteCaps[key] >= 99)
  const allGMMaxed = eligibleGMKeys.length > 0 && eligibleGMKeys.every(key => pt[key]?.val >= 99)

  const activeSkill = job && job.skills && job.skills[0] ? job.skills[0] : { name: 'Basic Attack', desc: 'Active' }
  const passiveSkill = job && job.skills && job.skills[1] ? job.skills[1] : { name: 'Defense Focus', desc: 'Passive' }

  const eq = player.equipment || {}
  const hasArchonEquipped = Object.values(eq).some(item => item && item.id && item.id.startsWith('archon_'))
  const isArchon = archons && player.race && archons[player.race] && player.username && archons[player.race].toLowerCase() === player.username.toLowerCase()

  const raceClass = player.race ? 'panel-' + player.race : ''

  return (
    <div className="no-scrollbar" style={styles.screen}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => useGameStore.getState().setScreen('main')} style={{background:'transparent', border:'none', color:'#00e5ff', fontSize: 20, cursor:'pointer', padding: '0 8px 0 0', display:'flex', alignItems:'center'}}>❮</button>
        <div style={{ flex: 1, textAlign: 'center', marginRight: 24 }}>
          <span style={{ fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2, textShadow: '0 0 10px var(--neon-glow)' }}>CHARACTER</span>
        </div>
      </div>

      {/* Resources */}
      <div style={styles.resRow}>
        <div style={styles.resChip('#f5a623')}>⬡ Anium: {player.resources.anium.toLocaleString()}</div>
        <div style={styles.resChip('#00e5ff')}>◈ Credits: {player.resources.credits}</div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={tab === 'stats' ? styles.tabActive : styles.tab} onClick={() => setTab('stats')}>Character Info</button>
        <button style={tab === 'profile' ? styles.tabActive : styles.tab} onClick={() => setTab('profile')}>Profile</button>
      </div>

      {tab === 'stats' && (
        <>
          {/* Skill Slots */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', margin: '8px 16px 12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                border: '1.5px solid var(--border-neon)',
                background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(0,0,0,0.6))',
                boxShadow: '0 0 10px rgba(0,229,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20
              }} title={activeSkill.name}>
                ⚔️
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7ec8e3', fontWeight: 800 }}>{activeSkill.name.toUpperCase()}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                border: '1.5px solid var(--border-neon)',
                background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(0,0,0,0.6))',
                boxShadow: '0 0 10px rgba(0,229,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20
              }} title={passiveSkill.name}>
                🛡️
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#da70d6', fontWeight: 800 }}>{passiveSkill.name.toUpperCase()}</span>
            </div>
          </div>

          {/* GENERAL INFO (Profile ID Card relocated inside) */}
          <AccordionSection label="General Info" raceClass={raceClass} defaultOpen={true}>
            <div 
              className={`profile-id-card ${player.race ? 'panel-' + player.race : ''}`}
              style={{ margin: '4px 0', zIndex: 1 }}
            >
              <div className="id-corner-circle tl" />
              <div className="id-corner-circle tr" />
              <div className="id-corner-circle bl" />
              <div className="id-corner-circle br" />

              <div className="id-tab top" />
              <div className="id-tab bottom" />

              <div className="id-edge-notch left-top" />
              <div className="id-edge-notch left-bot" />
              <div className="id-edge-notch right-top" />
              <div className="id-edge-notch right-bot" />

              <div className="profile-id-card-inner">
                <div className="profile-id-body">
                  {/* Avatar side */}
                  <div className="profile-avatar-glow-wrap">
                    <div className="profile-corner tl" />
                    <div className="profile-corner tr" />
                    <div className="profile-corner bl" />
                    <div className="profile-corner br" />
                    <div className="profile-avatar-inner">
                      <div className="profile-avatar-grid" />
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', zIndex: 2,
                        boxShadow: 'inset 0 0 8px 4px rgba(0,0,0,0.85)' }}>
                        {(() => {
                          const bionexSprite = player.race === 'bionex' ? getBionexJobSprite(player.job) : null
                          if (bionexSprite) {
                            return (
                              <img
                                src={bionexSprite}
                                alt={player.job}
                                style={{
                                  height: 340,
                                  width: 'auto',
                                  position: 'absolute',
                                  top: -4,
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                }}
                              />
                            )
                          }
                          return <PilotSprite race={player.race} job={player.job} width={112} height={150} fill={true} />
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Details side */}
                  <div className="profile-details-wrap">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className="profile-details-username">{player.name.toUpperCase()}</div>
                    </div>

                    <div className="profile-data-rows">
                      <div className="profile-data-row">
                        <span className="profile-data-key">FACTION</span>
                        <span style={{ fontSize: 11 }} className="profile-data-val">{race ? race.name.toUpperCase() : 'UNKNOWN'}</span>
                      </div>
                      <div className="profile-data-row">
                        <span className="profile-data-key">CLASS</span>
                        <span style={{ fontSize: 11 }} className="profile-data-val accent">{baseClass}</span>
                      </div>
                      <div className="profile-data-row">
                        <span className="profile-data-key">JOB</span>
                        <span style={{ fontSize: 11 }} className="profile-data-val">{job ? job.name.toUpperCase() : 'NOVICE'}</span>
                      </div>
                    </div>

                    <div className="profile-active-status">
                      <div className="profile-status-led" />
                      <span>STATUS: <span className="status-active-txt">ACTIVE</span></span>
                    </div>

                    <div className="profile-data-divider" />

                    <div className="profile-id-block-new">
                      <span className="profile-id-lbl">{baseClass} ID</span>
                      <span className="profile-id-num">PLT-{player.level || 1}09X</span>
                    </div>

                    {/* EXP bar */}
                    <div className="profile-status-panel" style={{ marginTop: 6 }}>
                      <div className="profile-status-bar">
                        {Array.from({ length: 12 }).map((_, idx) => {
                          const litThreshold = (idx + 1) * (100 / 12)
                          const isLit = expPct >= litThreshold
                          return (
                            <div key={idx} className={`profile-status-segment ${isLit ? '' : 'dim'}`} />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* STATUS INFO */}
          <AccordionSection label="Status Info" raceClass={raceClass} defaultOpen={true}>
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <span style={{ color: '#f5a623', fontSize: 10 }}>⚡ ATK</span>
                <span style={styles.statNum}>{stats.atk}</span>
              </div>
              <div style={styles.statBox}>
                <span style={{ color: '#00c8ff', fontSize: 10 }}>🛡️ DEF</span>
                <span style={styles.statNum}>{stats.def}</span>
              </div>
              <div style={styles.statBox}>
                <span style={{ color: '#ff4466', fontSize: 10 }}>❤️ HP</span>
                <span style={styles.statNum}>{stats.hp.toLocaleString()}</span>
              </div>
              <div style={styles.statBox}>
                <span style={{ color: '#ffaa00', fontSize: 10 }}>💥 CRIT</span>
                <span style={styles.statNum}>{Math.round((stats.crit || 0.12) * 100)}%</span>
              </div>
              <div style={styles.statBox}>
                <span style={{ color: '#da70d6', fontSize: 10 }}>🔷 FP</span>
                <span style={styles.statNum}>{200 + (player.level * 5)}</span>
              </div>
              <div style={styles.statBox}>
                <span style={{ color: '#00e5ff', fontSize: 10 }}>🌀 DODGE</span>
                <span style={styles.statNum}>{Math.round((stats.dodge || 0.05) * 100)}%</span>
              </div>
            </div>
          </AccordionSection>

          {/* ABILITY INFO */}
          <AccordionSection label="Ability Info" raceClass={raceClass} defaultOpen={false}>
            {job && (
              <div style={styles.infoBox('#4a8fa8')}>
                <span style={{ fontWeight: 800 }}>{job.name} Bonus:</span>{' '}
                +{job.bonus.hp} HP | +{job.bonus.atk} ATK | +{job.bonus.def} DEF
              </div>
            )}

            {winnerRace && winnerRace === player.race && (
              <div style={styles.infoBox('#ffcc00')}>
                <span style={{ fontWeight: 800 }}>🏆 CORE WAR VICTORY BUFF ACTIVE:</span>{' '}
                +10% HP | +10% ATK | +10% DEF
              </div>
            )}

            {player.race && (
              <div style={styles.infoBox('#00ff88')}>
                <span style={{ fontWeight: 800 }}>{t('archon_set_status')}</span>{' '}
                {stats.title ? (
                  <span style={{ color: '#00ff88', fontWeight: 800 }}>
                    {t('archon_set_active', { set: stats.title === 'Solar Sovereign' ? 'Solaris Set' : stats.title === 'Astral Emperor' ? 'Astral Set' : 'Dominion Set' })}
                  </span>
                ) : (
                  <span style={{ color: '#6a9ab8' }}>{t('archon_set_inactive')}</span>
                )}
              </div>
            )}

            {hasArchonEquipped && !isArchon && (
              <div style={styles.infoBox('#f5a623')}>
                <span style={{ fontWeight: 800 }}>ℹ️ INFO:</span> {t('archon_notice_unit')}
              </div>
            )}

            {archons && archons[player.race] && archonData[player.race] && (
              <div style={styles.infoBox('#f5a623')}>
                {archons[player.race].toLowerCase() === player.username?.toLowerCase() && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ color: '#f5a623', fontWeight: 'bold', fontSize: 13 }}>
                      {t('archon_equipped')} {archonData[player.race].mantle.name}
                    </div>
                    <div style={{ color: '#e0f4ff', fontSize: 13, marginTop: 4 }}>
                      {archonData[player.race].mantle.bonus.atkPercent && `+${archonData[player.race].mantle.bonus.atkPercent}% ATK `}
                      {archonData[player.race].mantle.bonus.defPercent && `+${archonData[player.race].mantle.bonus.defPercent}% DEF `}
                      {archonData[player.race].mantle.bonus.gatherSpeedPercent && `+${archonData[player.race].mantle.bonus.gatherSpeedPercent}% Gather Spd `}
                      {archonData[player.race].mantle.bonus.atkSpeedPercent && `+${archonData[player.race].mantle.bonus.atkSpeedPercent}% ATK Spd `}
                    </div>
                  </div>
                )}
                <div style={{ color: '#00e5ff', fontSize: 13 }}>
                  <span style={{ fontWeight: 'bold' }}>{t('race_aura_label', { name: archonData[player.race].aura.name })}</span>{' '}
                  {archonData[player.race].aura.desc}
                </div>
              </div>
            )}

            {gmMelee && (
              <div style={styles.infoBox('#00ff88')}>
                <span style={{ fontWeight: 800 }}>⚔️ MELEE PT GM ACTIVE:</span> +50 ATK | +1% Critical
              </div>
            )}
            {gmRange && (
              <div style={styles.infoBox('#00ff88')}>
                <span style={{ fontWeight: 800 }}>🏹 RANGED PT GM ACTIVE:</span> +50 ATK | +1% Critical
              </div>
            )}
            {gmForce && (
              <div style={styles.infoBox('#00ff88')}>
                <span style={{ fontWeight: 800 }}>✨ FORCE PT GM ACTIVE:</span> +50 Force ATK | +1% Critical
              </div>
            )}
            {gmShield && (
              <div style={styles.infoBox('#00ff88')}>
                <span style={{ fontWeight: 800 }}>🛡️ SHIELD PT GM ACTIVE:</span> +50 DEF | +500 HP
              </div>
            )}
            {allGMMaxed && (
              <div style={styles.infoBox('#eab308')}>
                <span style={{ fontWeight: 800 }}>🔥 ASCENSION ARMS ACTIVE:</span> +50 ATK | +50 DEF | +500 HP | +1% Critical
              </div>
            )}
          </AccordionSection>

          {/* Combat PT */}
          <div style={styles.ptCategoryHeader}>Combat</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: '0 16px 12px' }}>
            {[
              { key: 'melee', label: 'Close Range PT' },
              { key: 'range', label: 'Long Range PT' },
              { key: 'special', label: 'Race Special PT' },
              { key: 'force', label: 'Force PT' },
              { key: 'shield', label: 'Shield PT' },
              { key: 'defense', label: 'Defense PT' }
            ].map((item) => {
              const currentVal = pt[item.key]?.val || 1
              const currentPct = pt[item.key]?.pct || 0
              const capVal = caps[item.key] || 0
              if (capVal === 0) return null // Hide unavailable PTs for the race
              
              return (
                <div key={item.key} style={styles.ptRow}>
                  <span style={styles.ptLabel}>{item.label}</span>
                  <div style={styles.ptValueContainer}>
                    <div style={styles.ptPctBox}>
                      {currentPct.toFixed(2)}%
                    </div>
                    <span style={styles.ptPoints}>
                      {currentVal} / {capVal} Pt
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Crafting PT */}
          <div style={styles.ptCategoryHeader}>Crafting</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: '0 16px 12px' }}>
            {[
              { key: 'production', label: 'Production PT' }
            ].map((item) => {
              const currentVal = pt[item.key]?.val || 1
              const currentPct = pt[item.key]?.pct || 0
              const capVal = caps[item.key] || 0
              if (capVal === 0) return null
              
              return (
                <div key={item.key} style={styles.ptRow}>
                  <span style={styles.ptLabel}>{item.label}</span>
                  <div style={styles.ptValueContainer}>
                    <div style={styles.ptPctBox}>
                      {currentPct.toFixed(2)}%
                    </div>
                    <span style={styles.ptPoints}>
                      {currentVal} / {capVal} Pt
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

        </>
      )}

      {tab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
          <div className="glass-panel cyber-panel" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: 15, fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: 6 }}>
              📊 Combat Statistics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#c0dff0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Total Monster Kill:</span>
                <span style={{ fontWeight: 'bold' }}>{player.combatStats?.totalMonsterKill || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• World Boss Kill:</span>
                <span style={{ fontWeight: 'bold' }}>{player.combatStats?.worldBossKill || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Dungeon Clear:</span>
                <span style={{ fontWeight: 'bold' }}>{player.combatStats?.dungeonClear || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Core War Victory:</span>
                <span style={{ fontWeight: 'bold' }}>{player.combatStats?.coreWarVictory || 0}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel cyber-panel" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: 15, fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: 6 }}>
              ⏱️ General Statistics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#c0dff0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Total Play Time:</span>
                <span style={{ fontWeight: 'bold' }}>{Math.floor((player.totalMinutes || 0)/60)}h {(player.totalMinutes || 0)%60}m</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>• Highest Enhancement:</span>
                <span style={{ fontWeight: 'bold' }}>+{player.combatStats?.highestEnhancement || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Bottom spacer */}
      <div style={{ height: 16 }} />

    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)' },

  // Header
  header: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)', flexShrink: 0 },
  avatar: { width: 48, height: 48, borderRadius: '50%', border: '2px solid #00e5ff', background: 'linear-gradient(135deg, #0030a0, #001040)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)', flexShrink: 0 },
  name: { fontFamily: 'var(--font-title)', fontSize: 16, fontWeight: 700, color: '#e0f4ff', letterSpacing: 1 },
  sub: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ec8e3', marginTop: 2, fontWeight: 800 },
  actionBtn: (borderColor, bgStart) => ({
    background: `linear-gradient(95deg, ${bgStart}, ${borderColor})`,
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    padding: '7px 10px',
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: '#fff',
    cursor: 'pointer',
    boxShadow: `0 0 10px ${borderColor}66`,
    transition: 'all 0.2s',
    fontWeight: 800,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  }),
  actionBtnDisabled: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '7px 10px',
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    cursor: 'not-allowed',
    fontWeight: 800,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },

  // Resources
  resRow: { display: 'flex', gap: 8, padding: '8px 16px', flexShrink: 0 },
  resChip: (c) => ({
    flex: 1,
    background: 'rgba(3, 8, 20, 0.8)',
    border: `1px solid ${c}`,
    borderRadius: 10,
    padding: '7px 10px',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: c,
    fontWeight: 800,
    boxShadow: `0 0 10px ${c}33`,
    textAlign: 'center'
  }),

  // Tabs
  tabs: { display: 'flex', gap: 8, padding: '0 16px', margin: '8px 0', flexShrink: 0 },
  tab: { 
    flex: 1, padding: '10px', background: 'rgba(0,0,0,0.5)', 
    border: '1px solid rgba(0, 229, 255, 0.2)', color: '#7ab0d0', 
    borderRadius: 8, fontFamily: 'var(--font-title)', 
    fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1, textAlign: 'center'
  },
  tabActive: { 
    flex: 1, padding: '10px', background: 'rgba(0, 229, 255, 0.15)', 
    border: '1px solid #00e5ff', color: '#fff', 
    borderRadius: 8, fontFamily: 'var(--font-title)', 
    fontSize: 13, fontWeight: 'bold', cursor: 'pointer', 
    boxShadow: '0 0 12px rgba(0,229,255,0.4)', letterSpacing: 1, textAlign: 'center'
  },

  // Accordion
  section: { margin: '0 16px 10px', padding: 0, overflow: 'hidden', flexShrink: 0 },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none'
  },
  sectionLabel: { fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1.5, color: '#7ec8e3', fontWeight: 800, textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  chevron: { fontFamily: 'var(--font-mono)', fontSize: 16, color: '#00e5ff', fontWeight: 900, lineHeight: 1 },
  sectionBody: { padding: '0 14px 12px' },

  // EXP
  expBg: { height: 10, background: 'rgba(0,0,0,0.4)', borderRadius: 5, overflow: 'hidden', marginBottom: 6, border: '1px solid rgba(0, 229, 255, 0.2)' },
  expFill: { height: '100%', background: 'linear-gradient(90deg, #0066ff, #00e5ff)', borderRadius: 5, boxShadow: '0 0 8px #00e5ff' },
  expText: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ec8e3', textAlign: 'right', fontWeight: 800 },

  // Stats
  baseStatsGrid: { display: 'flex', gap: 6, marginBottom: 10 },
  baseStatBox: { flex: 1, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  baseStatLabel: { fontFamily: 'var(--font-title)', fontSize: 12, color: '#88aadd', fontWeight: 800, letterSpacing: 0.5 },
  baseStatNum: { fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff', fontWeight: 900 },

  statsGrid: { display: 'flex', gap: 8 },
  statBox: { flex: 1, background: 'rgba(3, 8, 20, 0.6)', border: '1px solid rgba(0, 229, 255, 0.15)', borderRadius: 10, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 13, alignItems: 'center', boxShadow: 'inset 0 0 8px rgba(0, 229, 255, 0.05)', fontWeight: 800 },
  statNum: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#e0f4ff', textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },

  // Generic info box
  infoBox: (c) => ({
    marginTop: 10,
    fontSize: 13,
    color: c,
    padding: '8px 10px',
    borderRadius: 8,
    background: `${c}0d`,
    border: `1px solid ${c}33`,
    lineHeight: 1.5
  }),

  // Lore / Race
  desc: { fontFamily: 'var(--font-body)', fontSize: 13, color: '#6a9ab8', marginBottom: 10, lineHeight: 1.6, fontWeight: 600 },
  specSection: { display: 'flex', flexDirection: 'column', gap: 3, background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(0,229,255,0.08)' },
  specTitle: { fontFamily: 'var(--font-title)', fontSize: 14, color: '#7ab0d0', letterSpacing: 0.5, fontWeight: 800, marginBottom: 8, borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: 4 },
  specItem: (c) => ({ fontFamily: 'var(--font-body)', fontSize: 13, color: c, lineHeight: 1.5, fontWeight: 600 }),

  growthTable: { width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-mono)', marginBottom: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 6, overflow: 'hidden' },
  th: { padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#88aadd', fontWeight: 'bold' },
  td: { padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e0f4ff' },

  filosofiBox: { display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, border: '1px solid rgba(0,229,255,0.1)' },
  filosofiItem: { fontSize: 13, fontFamily: 'var(--font-body)', color: '#a0c4d8', lineHeight: 1.4 },

  // Progress
  progRow: { display: 'flex', justifyContent: 'space-around', gap: 4 },
  progItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 },
  progNum: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#00e5ff', textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  progLabel: { fontFamily: 'var(--font-title)', fontSize: 13, color: '#7ec8e3', fontWeight: 800, textAlign: 'center' },

  // Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', padding: 16 },
  modalBox: { background: '#081020', border: '1px solid #00e5ff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, boxShadow: '0 0 30px rgba(0,229,255,0.3)', maxHeight: '85vh', overflowY: 'auto' },
  modalTitle: { fontFamily: 'var(--font-title)', fontSize: 20, color: '#fff', textAlign: 'center', textShadow: '0 0 10px #00e5ff', margin: 0, marginBottom: 8 },
  modalDesc: { fontFamily: 'var(--font-body)', fontSize: 13, color: '#88aadd', textAlign: 'center', marginTop: 0 },
  jobBtn: { background: 'rgba(0,0,0,0.5)', border: '1px solid #00e5ff', borderRadius: 8, padding: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' },

  // NPC dialogue box styling
  npcDialog: {
    fontStyle: 'italic',
    color: '#88aadd',
    fontSize: 13,
    background: 'rgba(3, 8, 20, 0.7)',
    borderLeft: '3px solid #00e5ff',
    padding: '8px 12px',
    borderRadius: '0 8px 8px 0',
    lineHeight: 1.5,
    fontFamily: 'var(--font-body)',
  },

  titleBadge: (race) => {
    const colors = {
      bionex: 'linear-gradient(135deg, #eab308, #ca8a04)',
      celestra: 'linear-gradient(135deg, #a855f7, #7e22ce)',
      arctron: 'linear-gradient(135deg, #ef4444, #b91c1c)'
    }
    const borderColors = {
      bionex: '#eab308',
      celestra: '#a855f7',
      arctron: '#ef4444'
    }
    return {
      background: colors[race] || 'linear-gradient(135deg, #00e5ff, #008bbb)',
      border: `1px solid ${borderColors[race] || '#00e5ff'}`,
      borderRadius: 4,
      padding: '2px 6px',
      fontSize: 13,
      fontFamily: 'var(--font-title)',
      fontWeight: 900,
      color: '#fff',
      textShadow: '0 1px 2px rgba(0,0,0,0.6)',
      boxShadow: `0 0 8px ${borderColors[race] || '#00e5ff'}aa`,
      display: 'inline-block',
      whiteSpace: 'nowrap'
    }
  },
  buyShopBtn: {
    background: 'linear-gradient(90deg, #ff8c00, #ffaa00)',
    border: 'none',
    borderRadius: 6,
    padding: '6px 12px',
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: '#fff',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 0 8px rgba(255, 140, 0, 0.4)',
    transition: 'all 0.2s',
  },
  buyShopBtnDisabled: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    padding: '6px 12px',
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: 800,
    cursor: 'not-allowed',
  },
  ptCategoryHeader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '10px 16px 8px',
    padding: '4px 12px',
    background: 'rgba(4, 9, 21, 0.9)',
    border: '1px solid rgba(0, 229, 255, 0.25)',
    borderRadius: '15px',
    fontFamily: 'var(--font-title)',
    fontSize: 12,
    fontWeight: 800,
    color: '#00e5ff',
    letterSpacing: '1.5px',
    textShadow: '0 0 5px rgba(0, 229, 255, 0.3)',
    boxShadow: '0 0 8px rgba(0, 229, 255, 0.1)',
  },
  ptRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px',
    background: 'rgba(3, 8, 20, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    marginBottom: '2px'
  },
  ptLabel: {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    fontWeight: 700,
    color: '#e0f4ff'
  },
  ptValueContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12
  },
  ptPctBox: {
    width: 64,
    textAlign: 'center',
    background: '#000000',
    border: '1px solid rgba(0, 229, 255, 0.15)',
    borderRadius: '4px',
    padding: '2px 4px',
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: '#00ff88',
    fontWeight: 800
  },
  ptPoints: {
    width: 68,
    textAlign: 'right',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 800,
    color: '#eab308'
  }
}

