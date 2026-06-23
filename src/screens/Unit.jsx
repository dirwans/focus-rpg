import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import archonData from '../data/archon.json'
import { PilotSprite } from '../components/PilotSprites'

function getJobInfo(raceId, jobId) {
  if (!raceId || !jobId || !jobs[raceId]) return { tier: 0, job: null }
  const rJobs = jobs[raceId]
  let job = rJobs.tier1.find(j => j.id === jobId)
  if (job) return { tier: 1, job }
  job = rJobs.tier2.find(j => j.id === jobId)
  if (job) return { tier: 2, job }
  job = rJobs.tier3.find(j => j.id === jobId)
  if (job) return { tier: 3, job }
  return { tier: 0, job: null }
}

const RECLASS_COST = 5000

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
  const player = useGameStore((s) => s.player)
  const archons = useGameStore((s) => s.archons)
  const getStats = useGameStore((s) => s.getStats)
  const getExpToNext = useGameStore((s) => s.getExpToNext)
  const openRaceSelect = useGameStore((s) => s.openRaceSelect)
  const defectRace = useGameStore((s) => s.defectRace)
  const selectJob = useGameStore((s) => s.selectJob)
  const reclassJob = useGameStore((s) => s.reclassJob)

  const [showPromo, setShowPromo] = useState(false)
  const [showReclass, setShowReclass] = useState(false)

  const stats = getStats()
  const expMax = getExpToNext()
  const expPct = Math.floor((player.exp / expMax) * 100)
  const race = player.race ? races[player.race] : null
  const { tier, job } = getJobInfo(player.race, player.job)

  const eligibleForPromo = player.race && (
    (tier === 0 && player.level >= 1) ||
    (tier === 1 && player.level >= 30) ||
    (tier === 2 && player.level >= 50)
  )

  // Reclass: ganti job dalam tier yang sama, hanya jika sudah punya job (tier >= 1)
  const canReclass = tier >= 1 && player.resources.anium >= RECLASS_COST
  const sameTierJobs = () => {
    if (!player.race || !jobs[player.race]) return []
    if (tier === 1) return jobs[player.race].tier1
    if (tier === 2) return jobs[player.race].tier2
    if (tier === 3) return jobs[player.race].tier3
    return []
  }

  const handleReclass = (jobId) => {
    if (jobId === player.job) { setShowReclass(false); return }
    reclassJob(jobId, RECLASS_COST)
    setShowReclass(false)
  }

  const getAvailableJobs = () => {
    if (!player.race || !jobs[player.race]) return []
    if (tier === 0) return jobs[player.race].tier1
    if (tier === 1) return jobs[player.race].tier2
    if (tier === 2) return jobs[player.race].tier3
    return []
  }

  const handlePromote = (jobId) => {
    selectJob(jobId)
    setShowPromo(false)
  }

  const raceClass = player.race ? 'panel-' + player.race : ''

  return (
    <div style={styles.screen}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.avatar}>
          <PilotSprite race={player.race} size={40} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={styles.name}>{player.name}</span>
            {stats.title && (
              <span style={styles.titleBadge(player.race)}>{stats.title.toUpperCase()}</span>
            )}
          </div>
          <div style={styles.sub}>{job ? job.name : (race ? race.name : 'Not selected')} · LV.{player.level}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          {!player.race ? (
            <button style={styles.actionBtn('#00e5ff', '#0050cc')} onClick={openRaceSelect}>SELECT RACE</button>
          ) : eligibleForPromo ? (
            <button style={{ ...styles.actionBtn('#ffe500', '#cc8000'), animation: 'pulse 1.5s infinite' }} onClick={() => setShowPromo(true)}>PROMOTE</button>
          ) : null}
          {tier >= 1 && (
            <button
              style={canReclass ? styles.actionBtn('#bb88ff', '#6600cc') : { ...styles.actionBtn('#555', '#333'), cursor: 'not-allowed', opacity: 0.5 }}
              onClick={() => canReclass && setShowReclass(true)}
              title={canReclass ? `Ganti job (${RECLASS_COST.toLocaleString()} Anium)` : `Butuh ${RECLASS_COST.toLocaleString()} Anium`}
            >
              🔄 RECLASS
            </button>
          )}
        </div>
      </div>

      {/* Resources */}
      <div style={styles.resRow}>
        <div style={styles.resChip('#f5a623')}>⬡ Anium: {player.resources.anium.toLocaleString()}</div>
        <div style={styles.resChip('#00e5ff')}>◈ Credits: {player.resources.credits}</div>
      </div>

      {/* PILOT EXPERIENCE - open by default */}
      <AccordionSection label="PILOT EXPERIENCE" raceClass={raceClass} defaultOpen={true}>
        <div style={styles.expBg}>
          <div style={{ ...styles.expFill, width: expPct + '%' }} />
        </div>
        <div style={styles.expText}>{player.exp.toLocaleString()} / {expMax.toLocaleString()} EXP ({expPct}%)</div>
      </AccordionSection>

      {/* UNIT SPECIFICATIONS */}
      <AccordionSection label="UNIT SPECIFICATIONS" raceClass={raceClass} defaultOpen={true}>
        <div style={styles.statsGrid}>
          <div style={styles.statBox}>
            <span style={{ color: '#f5a623', fontSize: 13 }}>⚡ ATK</span>
            <span style={styles.statNum}>{stats.atk}</span>
          </div>
          <div style={styles.statBox}>
            <span style={{ color: '#00c8ff', fontSize: 13 }}>🛡 DEF</span>
            <span style={styles.statNum}>{stats.def}</span>
          </div>
          <div style={styles.statBox}>
            <span style={{ color: '#ff4466', fontSize: 13 }}>❤ HP</span>
            <span style={styles.statNum}>{stats.hp.toLocaleString()}</span>
          </div>
        </div>

        {job && (
          <div style={styles.infoBox('#4a8fa8')}>
            <span style={{ fontWeight: 800 }}>{job.name} Bonus:</span>{' '}
            +{job.bonus.hp} HP | +{job.bonus.atk} ATK | +{job.bonus.def} DEF
          </div>
        )}

        {player.race && (
          <div style={styles.infoBox('#00ff88')}>
            <span style={{ fontWeight: 800 }}>🛡️ ARCHON SET STATUS:</span>{' '}
            {stats.title ? (
              <span style={{ color: '#00ff88', fontWeight: 800 }}>
                SET AKTIF ({stats.title === 'Solar Sovereign' ? 'Solaris Set' : stats.title === 'Astral Emperor' ? 'Astral Set' : 'Dominion Set'}) — Bonus +30% HP / DEF / ATK aktif!
              </span>
            ) : (
              <span style={{ color: '#6a9ab8' }}>Set tidak aktif (Lengkapi 6 item Archon ras Anda)</span>
            )}
          </div>
        )}

        {archons && archons[player.race] && archonData[player.race] && (
          <div style={styles.infoBox('#f5a623')}>
            {archons[player.race].toLowerCase() === player.username?.toLowerCase() && (
              <div style={{ marginBottom: 6 }}>
                <div style={{ color: '#f5a623', fontWeight: 'bold', fontSize: 13 }}>
                  👑 ARCHON EQUIPPED: {archonData[player.race].mantle.name}
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
              <span style={{ fontWeight: 'bold' }}>🌐 RACE AURA ({archonData[player.race].aura.name}):</span>{' '}
              {archonData[player.race].aura.desc}
            </div>
          </div>
        )}
      </AccordionSection>

      {/* RACE LORE */}
      {race && (
        <AccordionSection label={`${race.name.toUpperCase()} LORE`} raceClass={raceClass} defaultOpen={false}>
          <div style={styles.desc}>{race.description}</div>
          <div style={styles.specSection}>
            <div style={styles.specTitle}>ADVANTAGES:</div>
            {race.strengths.map((str, i) => (
              <div key={i} style={styles.specItem('#44ff88')}>✔ {str}</div>
            ))}
            <div style={{ ...styles.specTitle, marginTop: 8 }}>DISADVANTAGES:</div>
            {race.weaknesses.map((weak, i) => (
              <div key={i} style={styles.specItem('#ff4444')}>✘ {weak}</div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* SYSTEM PROGRESS */}
      <AccordionSection label="SYSTEM PROGRESS" raceClass={raceClass} defaultOpen={true}>
        <div style={styles.progRow}>
          <div style={styles.progItem}>
            <span style={styles.progNum}>{player.totalSessions}</span>
            <span style={styles.progLabel}>Sessions</span>
          </div>
          <div style={styles.progItem}>
            <span style={styles.progNum}>{player.totalMinutes}</span>
            <span style={styles.progLabel}>Minutes</span>
          </div>
          <div style={styles.progItem}>
            <span style={{ ...styles.progNum, color: '#ff8c40' }}>🔥{player.streak}</span>
            <span style={styles.progLabel}>Streak</span>
          </div>
          <div style={styles.progItem}>
            <span style={styles.progNum}>S-{player.highestSector}</span>
            <span style={styles.progLabel}>Best Sector</span>
          </div>
        </div>
      </AccordionSection>

      {/* DEFECT RACE */}
      {player.race && (
        <AccordionSection label="DEFECT RACE ⚠️" raceClass={raceClass} defaultOpen={false}>
          <div style={styles.defectWarning}>
            Resets semua UPGRADES dan unequip semua items. Syarat: Level 40 dan 50,000 Anium.
          </div>
          <button
            style={{
              ...(player.level >= 40 && player.resources.anium >= 50000 ? styles.defectBtn : styles.defectBtnDisabled),
              width: '100%',
              marginTop: 10
            }}
            onClick={() => {
              if (window.confirm('Are you sure you want to defect? You will lose 50,000 Anium and ALL upgrades!')) {
                defectRace()
              }
            }}
            disabled={player.level < 40 || player.resources.anium < 50000}
          >
            DEFECT RACE (50,000 ⬡)
          </button>
        </AccordionSection>
      )}

      {/* Bottom spacer */}
      <div style={{ height: 16 }} />

      {/* Promotion Modal */}
      {showPromo && (
        <div style={styles.modalOverlay}>
          <div className={`glass-panel cyber-panel ${raceClass}`} style={styles.modalBox}>
            <h2 style={styles.modalTitle}>⬆️ JOB PROMOTION</h2>
            <p style={styles.modalDesc}>Pilih class path dengan hati-hati. Setiap job memberi bonus stat unik.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15 }}>
              {getAvailableJobs().map(j => (
                <button key={j.id} style={styles.jobBtn} onClick={() => handlePromote(j.id)}>
                  <div style={{ fontWeight: 'bold', fontSize: 15, color: '#00e5ff' }}>{j.name}</div>
                  <div style={{ fontSize: 13, color: '#ccc', marginBottom: 4, lineHeight: 1.4 }}>{j.desc}</div>
                  <div style={{ fontSize: 13, color: '#ff8c40', fontWeight: 'bold' }}>
                    +{j.bonus.hp} HP | +{j.bonus.atk} ATK | +{j.bonus.def} DEF
                  </div>
                </button>
              ))}
            </div>
            <button style={{ ...styles.actionBtn('#00e5ff', '#0050cc'), marginTop: 15, width: '100%' }} onClick={() => setShowPromo(false)}>CANCEL</button>
          </div>
        </div>
      )}

      {/* Reclass Modal */}
      {showReclass && (
        <div style={styles.modalOverlay}>
          <div className={`glass-panel cyber-panel ${raceClass}`} style={styles.modalBox}>
            <h2 style={styles.modalTitle}>🔄 RECLASS JOB</h2>
            <p style={styles.modalDesc}>
              Ganti job dalam tier yang sama. Biaya:{' '}
              <span style={{ color: '#f5a623', fontWeight: 800 }}>{RECLASS_COST.toLocaleString()} ⬡ Anium</span>
            </p>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#6a9ab8', margin: '4px 0 12px' }}>
              Job aktif: <span style={{ color: '#00e5ff', fontWeight: 800 }}>{job?.name}</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sameTierJobs().map(j => (
                <button
                  key={j.id}
                  style={j.id === player.job
                    ? { ...styles.jobBtn, border: '1px solid #bb88ff', background: 'rgba(100,0,200,0.2)' }
                    : styles.jobBtn
                  }
                  onClick={() => handleReclass(j.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: 15, color: j.id === player.job ? '#bb88ff' : '#00e5ff' }}>
                      {j.name} {j.id === player.job ? '✓ AKTIF' : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: '#ccc', marginBottom: 4, lineHeight: 1.4 }}>{j.desc}</div>
                  <div style={{ fontSize: 13, color: '#ff8c40', fontWeight: 'bold' }}>
                    +{j.bonus.hp} HP | +{j.bonus.atk} ATK | +{j.bonus.def} DEF
                  </div>
                </button>
              ))}
            </div>
            <button style={{ ...styles.actionBtn('#888', '#333'), marginTop: 15, width: '100%' }} onClick={() => setShowReclass(false)}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)' },

  // Header
  header: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)', flexShrink: 0 },
  avatar: { width: 48, height: 48, borderRadius: '50%', border: '2px solid #00e5ff', background: 'linear-gradient(135deg, #0030a0, #001040)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)', flexShrink: 0 },
  name: { fontFamily: 'var(--font-title)', fontSize: 16, fontWeight: 700, color: '#e0f4ff', letterSpacing: 1 },
  sub: { fontFamily: 'var(--font-mono)', fontSize: 12, color: '#4a8fa8', marginTop: 2, fontWeight: 800 },
  actionBtn: (borderColor, bgStart) => ({
    background: `linear-gradient(95deg, ${bgStart}, ${borderColor})`,
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    padding: '7px 10px',
    fontFamily: 'var(--font-title)',
    fontSize: 12,
    color: '#fff',
    cursor: 'pointer',
    boxShadow: `0 0 10px ${borderColor}66`,
    transition: 'all 0.2s',
    fontWeight: 800,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  }),

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

  // Accordion
  section: { margin: '0 16px 10px', padding: 0, overflow: 'hidden' },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none'
  },
  sectionLabel: { fontFamily: 'var(--font-title)', fontSize: 12, letterSpacing: 1.5, color: '#4a8fa8', fontWeight: 800, textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  chevron: { fontFamily: 'var(--font-mono)', fontSize: 16, color: '#00e5ff', fontWeight: 900, lineHeight: 1 },
  sectionBody: { padding: '0 14px 12px' },

  // EXP
  expBg: { height: 10, background: 'rgba(0,0,0,0.4)', borderRadius: 5, overflow: 'hidden', marginBottom: 6, border: '1px solid rgba(0, 229, 255, 0.2)' },
  expFill: { height: '100%', background: 'linear-gradient(90deg, #0066ff, #00e5ff)', borderRadius: 5, boxShadow: '0 0 8px #00e5ff' },
  expText: { fontFamily: 'var(--font-mono)', fontSize: 12, color: '#4a8fa8', textAlign: 'right', fontWeight: 800 },

  // Stats
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
  specTitle: { fontFamily: 'var(--font-title)', fontSize: 12, color: '#7ab0d0', letterSpacing: 0.5, fontWeight: 800 },
  specItem: (c) => ({ fontFamily: 'var(--font-body)', fontSize: 13, color: c, lineHeight: 1.5, fontWeight: 600 }),

  // Progress
  progRow: { display: 'flex', justifyContent: 'space-around', gap: 4 },
  progItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 },
  progNum: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#00e5ff', textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  progLabel: { fontFamily: 'var(--font-title)', fontSize: 11, color: '#4a8fa8', fontWeight: 800, textAlign: 'center' },

  // Defect
  defectWarning: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#ff4444', textAlign: 'center', fontWeight: 600, lineHeight: 1.5 },
  defectBtn: { background: 'linear-gradient(90deg, #aa0000, #ff4444)', border: '1px solid #ffaa00', borderRadius: 8, padding: '12px 24px', fontFamily: 'var(--font-title)', fontSize: 13, color: '#fff', cursor: 'pointer', fontWeight: 800, boxShadow: '0 0 15px rgba(255, 68, 68, 0.4)' },
  defectBtnDisabled: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '12px 24px', fontFamily: 'var(--font-title)', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed', fontWeight: 800 },

  // Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', padding: 16 },
  modalBox: { background: '#081020', border: '1px solid #00e5ff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, boxShadow: '0 0 30px rgba(0,229,255,0.3)', maxHeight: '85vh', overflowY: 'auto' },
  modalTitle: { fontFamily: 'var(--font-title)', fontSize: 20, color: '#fff', textAlign: 'center', textShadow: '0 0 10px #00e5ff', margin: 0, marginBottom: 8 },
  modalDesc: { fontFamily: 'var(--font-body)', fontSize: 13, color: '#88aadd', textAlign: 'center', marginTop: 0 },
  jobBtn: { background: 'rgba(0,0,0,0.5)', border: '1px solid #00e5ff', borderRadius: 8, padding: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' },

  titleBadge: (race) => {
    const colors = {
      belterra: 'linear-gradient(135deg, #eab308, #ca8a04)',
      coralis: 'linear-gradient(135deg, #a855f7, #7e22ce)',
      acreton: 'linear-gradient(135deg, #ef4444, #b91c1c)'
    }
    const borderColors = {
      belterra: '#eab308',
      coralis: '#a855f7',
      acreton: '#ef4444'
    }
    return {
      background: colors[race] || 'linear-gradient(135deg, #00e5ff, #008bbb)',
      border: `1px solid ${borderColors[race] || '#00e5ff'}`,
      borderRadius: 4,
      padding: '2px 6px',
      fontSize: 10,
      fontFamily: 'var(--font-title)',
      fontWeight: 900,
      color: '#fff',
      textShadow: '0 1px 2px rgba(0,0,0,0.6)',
      boxShadow: `0 0 8px ${borderColors[race] || '#00e5ff'}aa`,
      display: 'inline-block',
      whiteSpace: 'nowrap'
    }
  }
}
