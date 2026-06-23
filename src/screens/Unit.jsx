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

export default function Unit() {
  const player = useGameStore((s) => s.player)
  const archons = useGameStore((s) => s.archons)
  const getStats = useGameStore((s) => s.getStats)
  const getExpToNext = useGameStore((s) => s.getExpToNext)
  const openRaceSelect = useGameStore((s) => s.openRaceSelect)
  const defectRace = useGameStore((s) => s.defectRace)
  const selectJob = useGameStore((s) => s.selectJob)

  const [showPromo, setShowPromo] = useState(false)

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

  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <div style={styles.avatar}>
          <PilotSprite race={player.race} size={40} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={styles.name}>{player.name}</span>
            {stats.title && (
              <span style={styles.titleBadge(player.race)}>{stats.title.toUpperCase()}</span>
            )}
          </div>
          <div style={styles.sub}>{job ? job.name : (race ? race.name : 'Not selected')} · LV.{player.level}</div>
        </div>
        {!player.race ? (
          <button style={styles.selectBtn} onClick={openRaceSelect}>SELECT RACE</button>
        ) : eligibleForPromo ? (
          <button style={styles.promoBtn} onClick={() => setShowPromo(true)}>PROMOTE</button>
        ) : null}
      </div>

      <div style={styles.resRow}>
        <div style={styles.resChip('#f5a623')}>⬡ Anium: {player.resources.anium.toLocaleString()}</div>
        <div style={styles.resChip('#00e5ff')}>◈ Credits: {player.resources.credits}</div>
      </div>

      {/* EXP */}
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.section}>
        <div style={styles.sectionLabel}>▸ PILOT EXPERIENCE</div>
        <div style={styles.expBg}><div style={{ ...styles.expFill, width: expPct + '%' }} /></div>
        <div style={styles.expText}>{player.exp} / {expMax} ({expPct}%)</div>
      </div>

      {/* Level stats */}
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.section}>
        <div style={styles.sectionLabel}>▸ UNIT SPECIFICATIONS</div>
        <div style={styles.statsGrid}>
          <div style={styles.statBox}><span style={{ color: '#f5a623' }}>⚡ ATK</span><span style={styles.statNum}>{stats.atk}</span></div>
          <div style={styles.statBox}><span style={{ color: '#00c8ff' }}>🛡 DEF</span><span style={styles.statNum}>{stats.def}</span></div>
          <div style={styles.statBox}><span style={{ color: '#ff4466' }}>❤ HP</span><span style={styles.statNum}>{stats.hp.toLocaleString()}</span></div>
        </div>
        
        {job && (
          <div style={{ marginTop: 10, fontSize: 13, color: '#4a8fa8', textAlign: 'center', fontWeight: 600 }}>
            {job.name} Bonus: +{job.bonus.hp} HP | +{job.bonus.atk} ATK | +{job.bonus.def} DEF
          </div>
        )}

        {/* Set Bonus Display */}
        {player.race && (
          <div style={{ marginTop: 10, fontSize: 13, color: '#00ff88', textAlign: 'center', padding: '6px 10px', borderRadius: 8, background: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
            <span style={{ fontWeight: 800 }}>🛡️ ARCHON SET STATUS:</span>{' '}
            {stats.title ? (
              <span style={{ color: '#00ff88', fontWeight: 800 }}>SET AKTIF ({stats.title === 'Solar Sovereign' ? 'Solaris Set' : stats.title === 'Astral Emperor' ? 'Astral Set' : 'Dominion Set'}) — Bonus +30% HP / DEF / ATK aktif!</span>
            ) : (
              <span style={{ color: '#6a9ab8' }}>Set tidak aktif (Lengkapi 6 item Archon ras Anda)</span>
            )}
          </div>
        )}
        
        {/* Archon Mantle & Aura Display */}
        {archons && archons[player.race] && archonData[player.race] && (
          <div style={{ marginTop: 15, padding: 10, borderRadius: 8, background: 'rgba(245, 166, 35, 0.1)', border: '1px solid rgba(245, 166, 35, 0.3)', textAlign: 'center' }}>
            {archons[player.race].toLowerCase() === player.username?.toLowerCase() ? (
               <div>
                 <div style={{ color: '#f5a623', fontWeight: 'bold', fontSize: 13 }}>👑 ARCHON EQUIPPED: {archonData[player.race].mantle.name}</div>
                 <div style={{ color: '#e0f4ff', fontSize: 13, marginTop: 4 }}>
                   {archonData[player.race].mantle.bonus.atkPercent && `+${archonData[player.race].mantle.bonus.atkPercent}% ATK `}
                   {archonData[player.race].mantle.bonus.defPercent && `+${archonData[player.race].mantle.bonus.defPercent}% DEF `}
                   {archonData[player.race].mantle.bonus.gatherSpeedPercent && `+${archonData[player.race].mantle.bonus.gatherSpeedPercent}% Gather Spd `}
                   {archonData[player.race].mantle.bonus.atkSpeedPercent && `+${archonData[player.race].mantle.bonus.atkSpeedPercent}% ATK Spd `}
                 </div>
               </div>
            ) : null}
            <div style={{ color: '#00e5ff', fontSize: 13, marginTop: archons[player.race].toLowerCase() === player.username?.toLowerCase() ? 8 : 0 }}>
              <span style={{ fontWeight: 'bold' }}>🌐 RACE AURA ({archonData[player.race].aura.name}):</span> {archonData[player.race].aura.desc}
            </div>
          </div>
        )}
      </div>

      {/* Race bonus details */}
      {race && (
        <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.section}>
          <div style={styles.sectionLabel}>▸ {race.name.toUpperCase()} LORE</div>
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
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.section}>
        <div style={styles.sectionLabel}>▸ SYSTEM PROGRESS</div>
        <div style={styles.progRow}>
          <div style={styles.progItem}><span style={styles.progNum}>{player.totalSessions}</span><span style={styles.progLabel}>Sessions</span></div>
          <div style={styles.progItem}><span style={styles.progNum}>{player.totalMinutes}</span><span style={styles.progLabel}>Minutes</span></div>
          <div style={styles.progItem}><span style={{ ...styles.progNum, color: '#ff8c40' }}>🔥{player.streak}</span><span style={styles.progLabel}>Streak</span></div>
          <div style={styles.progItem}><span style={styles.progNum}>S-{player.highestSector}</span><span style={styles.progLabel}>Best</span></div>
        </div>
      </div>
      
      {/* Defection */}
      {player.race && (
        <div style={styles.defectSection}>
          <div style={styles.defectWarning}>
            ⚠️ DEFECT RACE: Resets UPGRADES & unequips items. Requires Level 40 & 50,000 Anium.
          </div>
          <button 
            style={player.level >= 40 && player.resources.anium >= 50000 ? styles.defectBtn : styles.defectBtnDisabled} 
            onClick={() => {
              if (window.confirm("Are you sure you want to defect? You will lose 50,000 Anium and ALL upgrades!")) {
                defectRace()
              }
            }}
            disabled={player.level < 40 || player.resources.anium < 50000}
          >
            DEFECT RACE (50,000 ⬡)
          </button>
        </div>
      )}

      {/* Promotion Modal */}
      {showPromo && (
        <div style={styles.modalOverlay}>
          <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.modalBox}>
            <h2 style={styles.modalTitle}>JOB PROMOTION</h2>
            <p style={styles.modalDesc}>Select your class path carefully. Each job provides unique stat bonuses to your unit.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15 }}>
              {getAvailableJobs().map(j => (
                <button key={j.id} style={styles.jobBtn} onClick={() => handlePromote(j.id)}>
                  <div style={{ fontWeight: 'bold', fontSize: 16, color: '#00e5ff' }}>{j.name}</div>
                  <div style={{ fontSize: 13, color: '#ccc', marginBottom: 4 }}>{j.desc}</div>
                  <div style={{ fontSize: 13, color: '#ff8c40', fontWeight: 'bold' }}>Bonus: +{j.bonus.hp} HP | +{j.bonus.atk} ATK | +{j.bonus.def} DEF</div>
                </button>
              ))}
            </div>
            <button style={{ ...styles.selectBtn, marginTop: 15, width: '100%' }} onClick={() => setShowPromo(false)}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)' },
  header: { padding: 16, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)' },
  avatar: { width: 48, height: 48, borderRadius: '50%', border: '2px solid #00e5ff', background: 'linear-gradient(135deg, #0030a0, #001040)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)' },
  name: { fontFamily: 'var(--font-title)', fontSize: 16, fontWeight: 700, color: '#e0f4ff', letterSpacing: 1 },
  sub: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#4a8fa8', marginTop: 2, fontWeight: 800 },
  selectBtn: { background: 'linear-gradient(95deg, #0050cc, #00a8ff)', border: '1px solid #00e5ff', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-title)', fontSize: 13, color: '#fff', cursor: 'pointer', boxShadow: '0 0 10px rgba(0, 168, 255, 0.4)', transition: 'all 0.2s', fontWeight: 800 },
  promoBtn: { background: 'linear-gradient(95deg, #cc8000, #ffaa00)', border: '1px solid #ffe500', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-title)', fontSize: 13, color: '#fff', cursor: 'pointer', boxShadow: '0 0 10px rgba(255, 170, 0, 0.4)', transition: 'all 0.2s', fontWeight: 800, animation: 'pulse 1.5s infinite' },
  resRow: { display: 'flex', gap: 8, padding: '10px 16px' },
  resChip: (c) => ({ flex: 1, background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 10, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 13, color: c, fontWeight: 800, boxShadow: `0 0 10px ${c}33, inset 0 0 6px ${c}22` }),
  section: { margin: '0 16px 12px', padding: 14 },
  sectionLabel: { fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 2, color: '#4a8fa8', marginBottom: 10, fontWeight: 800, textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  expBg: { height: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 4, overflow: 'hidden', marginBottom: 4, border: '1px solid rgba(0, 229, 255, 0.2)' },
  expFill: { height: '100%', background: 'linear-gradient(90deg, #0066ff, #00e5ff)', borderRadius: 4, boxShadow: '0 0 8px #00e5ff' },
  expText: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#4a8fa8', textAlign: 'right', fontWeight: 800 },
  statsGrid: { display: 'flex', gap: 8 },
  statBox: { flex: 1, background: 'rgba(3, 8, 20, 0.6)', border: '1px solid rgba(0, 229, 255, 0.15)', borderRadius: 10, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 13, alignItems: 'center', boxShadow: 'inset 0 0 8px rgba(0, 229, 255, 0.05)', fontWeight: 800 },
  statNum: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#e0f4ff', textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  desc: { fontFamily: 'var(--font-body)', fontSize: 13, color: '#6a9ab8', marginBottom: 8, lineHeight: 1.5, fontWeight: 600, whiteSpace: 'pre-wrap' },
  specSection: { display: 'flex', flexDirection: 'column', gap: 2, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, border: '1px solid rgba(0,229,255,0.08)' },
  specTitle: { fontFamily: 'var(--font-title)', fontSize: 13, color: '#7ab0d0', letterSpacing: 0.5, marginTop: 4, fontWeight: 800 },
  specItem: (c) => ({ fontFamily: 'var(--font-body)', fontSize: 13, color: c, lineHeight: 1.4, fontWeight: 600 }),
  progRow: { display: 'flex', justifyContent: 'space-around' },
  progItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  progNum: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#00e5ff', textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  progLabel: { fontFamily: 'var(--font-title)', fontSize: 13, color: '#4a8fa8', fontWeight: 800 },
  defectSection: { margin: '16px', padding: 16, background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' },
  defectWarning: { fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ff4444', textAlign: 'center', fontWeight: 600, lineHeight: 1.4 },
  defectBtn: { background: 'linear-gradient(90deg, #aa0000, #ff4444)', border: '1px solid #ffaa00', borderRadius: 8, padding: '12px 24px', fontFamily: 'var(--font-title)', fontSize: 13, color: '#fff', cursor: 'pointer', fontWeight: 800, boxShadow: '0 0 15px rgba(255, 68, 68, 0.4)' },
  defectBtnDisabled: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '12px 24px', fontFamily: 'var(--font-title)', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed', fontWeight: 800 },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' },
  modalBox: { background: '#081020', border: '1px solid #00e5ff', borderRadius: 16, padding: 20, width: '90%', maxWidth: 400, boxShadow: '0 0 30px rgba(0,229,255,0.3)' },
  modalTitle: { fontFamily: 'var(--font-title)', fontSize: 20, color: '#fff', textAlign: 'center', textShadow: '0 0 10px #00e5ff' },
  modalDesc: { fontFamily: 'var(--font-body)', fontSize: 13, color: '#88aadd', textAlign: 'center', marginTop: 10 },
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
      display: 'inline-block'
    }
  }
}
