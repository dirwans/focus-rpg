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
  if (typeof document !== 'undefined' && !document.getElementById('unit-kf')) {
    const s = document.createElement('style')
    s.id = 'unit-kf'
    s.textContent = `
      @keyframes heroFloat { 0%,100%{transform:translateX(-50%) translateY(0);} 50%{transform:translateX(-50%) translateY(-9px);} }
      @keyframes ledBlink  { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
      @keyframes heroRune  { from{transform:translate(-50%,-50%) rotate(0deg);} to{transform:translate(-50%,-50%) rotate(360deg);} }
    `
    document.head.appendChild(s)
  }
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
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2, textShadow: '0 0 10px var(--neon-glow)' }}>CHARACTER</span>
        </div>
      </div>

            {/* Resources */}
      {(() => {
        const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
        const fa = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
        return (
          <div style={{ position: 'relative', zIndex: 4, display: 'flex', gap: 8, padding: '0 16px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(8,22,36,0.5)', backdropFilter: 'blur(8px)', border: `1px solid ${fp}59`, borderRadius: 20, padding: '4px 12px 4px 9px' }}>
              <svg width="13" height="15" viewBox="0 0 14 16"><polygon points="7,0 14,4 14,12 7,16 0,12 0,4" fill="none" stroke={fp} strokeWidth="1.4"/></svg>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: fa }}>
                {(player.resources?.anium || 0).toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(8,22,36,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(199,204,214,0.4)', borderRadius: 20, padding: '4px 12px 4px 9px' }}>
              <svg width="12" height="12" viewBox="0 0 13 13"><rect x="1.5" y="1.5" width="10" height="10" transform="rotate(45 6.5 6.5)" fill="none" stroke="#c7ccd6" strokeWidth="1.4"/></svg>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: '#c7ccd6' }}>
                {(player.resources?.credits || 0).toLocaleString()}
              </span>
            </div>
          </div>
        )
      })()}

      {/* Tabs */}
      {(() => {
        const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
        return (
          <div style={{ position: 'relative', zIndex: 4, display: 'flex', gap: 8, padding: '2px 16px 8px' }}>
            <div onClick={() => setTab('stats')} style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 9, cursor: 'pointer',
              fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1,
              color: tab === 'stats' ? '#fff' : '#8a94a3',
              background: tab === 'stats' ? `${fp}33` : 'transparent',
              border: `1px solid ${fp}4d`,
            }}>CHARACTER INFO</div>
            <div onClick={() => setTab('profile')} style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 9, cursor: 'pointer',
              fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1,
              color: tab === 'profile' ? '#fff' : '#8a94a3',
              background: tab === 'profile' ? `${fp}33` : 'transparent',
              border: `1px solid ${fp}4d`,
            }}>PROFILE</div>
          </div>
        )
      })()}

      {tab === 'stats' && (
        <>
          {/* ============ HERO INSPECTION STAGE ============ */}
          {(() => {
            const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const fa = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
            const label = player.race ? player.race.toUpperCase() : 'UNKNOWN'
            const bionexSprite = player.race === 'bionex' ? getBionexJobSprite(player.job) : null
            return (
              <div style={{
                position: 'relative', height: 322, minHeight: 322, flexShrink: 0, margin: '0 16px 10px',
                borderRadius: 16, overflow: 'hidden',
                background: `radial-gradient(90% 70% at 50% 28%, ${fp}17, transparent 70%)`,
                border: `1px solid ${fp}24`,
              }}>
                <div style={{ position: 'absolute', top: '47%', left: '50%', width: 210, height: 210, animation: 'heroRune 26s linear infinite', opacity: 0.4 }}>
                  <svg width="210" height="210" viewBox="0 0 210 210">
                    <circle cx="105" cy="105" r="100" fill="none" stroke={`${fp}4d`} strokeWidth="1"/>
                    <circle cx="105" cy="105" r="86" fill="none" stroke="rgba(199,204,214,0.22)" strokeWidth="1" strokeDasharray="3 9"/>
                  </svg>
                </div>
                <div style={{
                  position: 'absolute', bottom: 8, left: 0, right: 0, height: 60,
                  backgroundImage: `linear-gradient(${fp}1f 1px,transparent 1px),linear-gradient(90deg,${fp}17 1px,transparent 1px)`,
                  backgroundSize: '18px 18px',
                  transform: 'perspective(220px) rotateX(64deg)', transformOrigin: 'bottom',
                  WebkitMaskImage: 'linear-gradient(to top,#000,transparent)',
                  maskImage: 'linear-gradient(to top,#000,transparent)',
                }}></div>
                <div style={{
                  position: 'absolute', top: 12, left: 12, zIndex: 4, display: 'flex', alignItems: 'center', gap: 7,
                  background: 'rgba(8,22,36,0.55)', backdropFilter: 'blur(6px)', border: `1px solid ${fp}59`, borderRadius: 22, padding: '3px 4px 3px 11px',
                }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, color: fa }}>LV</span>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#dde2ea,#9aa2ae)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 800, color: '#16181c', boxShadow: '0 0 12px rgba(199,204,214,0.5)' }}>
                    {player.level || 1}
                  </span>
                </div>
                <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="15" height="17" viewBox="0 0 16 18"><polygon points="8,0 16,4.5 16,13.5 8,18 0,13.5 0,4.5" fill={fp} fillOpacity="0.85" stroke={fp} strokeWidth="1"/></svg>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: 2, color: fa }}>{label}</span>
                </div>
                <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', animation: 'heroFloat 5.4s ease-in-out infinite', zIndex: 2 }}>
                  {bionexSprite ? (
                    <img src={bionexSprite} alt={player.job} style={{ height: 298, width: 'auto', filter: `drop-shadow(0 18px 24px rgba(0,0,0,0.6)) drop-shadow(0 0 30px ${fp}33)` }} />
                  ) : (
                    <PilotSprite race={player.race} job={player.job} width={'auto'} height={298} fill={true} style={{ filter: `drop-shadow(0 18px 24px rgba(0,0,0,0.6)) drop-shadow(0 0 30px ${fp}33)` }} />
                  )}
                </div>
              </div>
            )
          })()}

          {/* ============ GENERAL INFO / ID PLATE ============ */}
          {(() => {
            const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const fa = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
            const EXP_SEGS = 12
            const filledSegs = Math.min(EXP_SEGS, Math.round((player.exp / expMax) * EXP_SEGS))
            const idPrefix = baseClass.slice(0,3).toUpperCase()
            const idSuffix = (player.username || 'PLT').slice(0,3).toUpperCase()
            return (
              <div style={{
                position: 'relative', margin: '0 16px 10px', padding: '12px 15px 13px', borderRadius: 14,
                background: 'linear-gradient(180deg,rgba(24,23,26,0.42),rgba(16,15,17,0.85))',
                border: `1px solid ${fp}4d`, boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 21, fontWeight: 800, letterSpacing: 0.5, color: '#fff', textShadow: `0 0 16px ${fp}80` }}>
                    {(player.name || 'UNNAMED').toUpperCase()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: '#5fe08a' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5fe08a', boxShadow: '0 0 8px #5fe08a', animation: 'ledBlink 1.6s infinite' }}/>
                    ACTIVE
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 0, marginTop: 10, borderTop: `1px solid ${fp}29`, borderBottom: `1px solid ${fp}29` }}>
                  <div style={{ flex: 1, padding: '7px 0', textAlign: 'center', borderRight: `1px solid ${fp}1f` }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: 1, color: '#8a94a3' }}>FACTION</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: '#eef3fb', marginTop: 2 }}>{player.race ? player.race.toUpperCase() : 'UNKNOWN'}</div>
                  </div>
                  <div style={{ flex: 1, padding: '7px 0', textAlign: 'center', borderRight: `1px solid ${fp}1f` }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: 1, color: '#8a94a3' }}>CLASS</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: fa, marginTop: 2 }}>{baseClass.toUpperCase()}</div>
                  </div>
                  <div style={{ flex: 1, padding: '7px 0', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: 1, color: '#8a94a3' }}>JOB</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700, color: '#eef3fb', marginTop: 2 }}>{job ? job.name.toUpperCase() : 'NOVICE'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: '#8a94a3' }}>
                    {baseClass.toUpperCase()} ID · <span style={{ color: '#c7ccd6' }}>{idPrefix}-{idSuffix}X</span>
                  </span>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: '#b9c0c9' }}>{expPct}% TO NEXT</span>
                </div>
                <div style={{ display: 'flex', gap: 3, marginTop: 7 }}>
                  {Array.from({ length: EXP_SEGS }).map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 7, borderRadius: 2,
                      background: i < filledSegs ? `linear-gradient(90deg,${fp}bb,${fp})` : `${fp}29`,
                      boxShadow: i < filledSegs && i === 0 ? `0 0 6px ${fp}` : 'none',
                    }}/>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* ============ CLASS PATH ============ */}
          {(() => {
            const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const fa = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
            const TIER_KEYS   = ['tier1', 'tier2', 'tier3', 'tier4']
            const TIER_LABELS = ['I', 'II', 'III', 'IV']
            const TIER_UNLOCK = { tier1: 1, tier2: 15, tier3: 32, tier4: 55 }
            // Dynamic job names from classIndex
            const raceJobs  = jobs[player.race] || {}
            const ci = classIndex >= 0 ? classIndex : 0
            const tierNames = TIER_KEYS.map(tk => {
              const arr = raceJobs[tk] || []
              return arr[ci] ? arr[ci].name : tk
            })
            const currentTierIdx = TIER_KEYS.indexOf(tier || 'tier1')
            const linePct = currentTierIdx > 0 ? `${Math.round((currentTierIdx / 3) * 100)}%` : '0%'
            return (
              <div style={{ margin: '0 16px 10px', padding: '12px 12px 13px', background: 'rgba(8,22,36,0.4)', backdropFilter: 'blur(8px)', border: `1px solid ${fp}38`, borderRadius: 12 }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#8a94a3', marginBottom: 11 }}>
                  CLASS PATH · {baseClass.toUpperCase()}
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ position: 'absolute', top: 16, left: '12%', right: '12%', height: 2, background: `linear-gradient(90deg, ${fp} 0%, ${fp} ${linePct}, ${fp}33 ${linePct}, ${fp}33 100%)` }}/>
                  {TIER_KEYS.map((tk, idx) => {
                    const isPast   = idx < currentTierIdx
                    const isActive = idx === currentTierIdx
                    const isLocked = idx > currentTierIdx
                    return (
                      <div key={tk} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, width: '24%' }}>
                        <div style={{
                          width: isActive ? 38 : 32, height: isActive ? 38 : 32, marginTop: isActive ? -3 : 0, borderRadius: isActive ? 9 : 8, transform: 'rotate(45deg)',
                          background: isActive ? 'linear-gradient(135deg,#dde2ea,#9aa2ae)' : isPast ? `${fp}2e` : 'rgba(8,22,36,0.6)',
                          border: isLocked ? `1.5px dashed ${fp}59` : `1.5px solid ${fp}99`,
                          boxShadow: isActive ? '0 0 16px rgba(199,204,214,0.6)' : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span style={{ transform: 'rotate(-45deg)', fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: isActive ? 12 : 11, color: isActive ? '#16181c' : isLocked ? `${fa}73` : fa }}>
                            {TIER_LABELS[idx]}
                          </span>
                        </div>
                        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, textAlign: 'center', lineHeight: 1.1, color: isActive ? '#fff' : isLocked ? 'rgba(138,148,163,0.6)' : '#8a94a3', fontWeight: isActive ? 800 : 400 }}>
                          {tierNames[idx]}
                        </span>
                        {isActive && <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: fa }}>◆ ACTIVE</span>}
                        {isLocked && <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: 'rgba(138,148,163,0.5)' }}>LV.{TIER_UNLOCK[tk]}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* ============ SKILL LOADOUT ============ */}
          {(() => {
            const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const fa = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
            return (
              <div style={{ display: 'flex', gap: 12, margin: '0 16px 10px' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 11, background: `linear-gradient(135deg,${fp}29,rgba(0,0,0,0.4))`, border: `1.5px solid ${fp}66` }}>
                  <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 7, background: `${fp}26`, border: `1px solid ${fp}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fa} strokeWidth="2"><path d="M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4M5 5v4M5 5h4"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, letterSpacing: 1, color: '#8a94a3' }}>ACTIVE</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: fa }}>{activeSkill.name.toUpperCase()}</div>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 11, background: 'linear-gradient(135deg,rgba(199,204,214,0.14),rgba(0,0,0,0.4))', border: '1.5px solid rgba(199,204,214,0.35)' }}>
                  <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 7, background: 'rgba(199,204,214,0.12)', border: '1px solid rgba(199,204,214,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c7ccd6" strokeWidth="2"><path d="M12 2l8 3.5v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10v-6L12 2z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, letterSpacing: 1, color: '#8a94a3' }}>PASSIVE</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: '#c7ccd6' }}>{passiveSkill.name.toUpperCase()}</div>
                  </div>
                </div>
              </div>
            )
          })()}
          {/* ============ STATUS INFO ============ */}
          {(() => {
            const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const fa = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
            return (
              <div style={{ margin: '0 16px 10px' }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#8a94a3', marginBottom: 7 }}>
                  <span style={{ fontSize: 9 }}>▼</span> STATUS INFO
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                  {[
                    { lbl: 'ATK', val: stats.atk, c1: fp, c2: '#8a94a3' },
                    { lbl: 'DEF', val: stats.def, c1: '#eef3fb', c2: '#8a94a3' },
                    { lbl: 'HP', val: stats.hp.toLocaleString(), c1: '#ff6a4d', c2: '#8a94a3', b: 'rgba(255,110,60,0.28)' },
                    { lbl: 'CRIT', val: Math.round((stats.crit || 0.12)*100)+'%', c1: '#c7ccd6', c2: '#8a94a3', b: 'rgba(199,204,214,0.25)' },
                    { lbl: 'FP', val: 200+(player.level*5), c1: '#c7ccd6', c2: '#8a94a3', b: 'rgba(199,204,214,0.25)' },
                    { lbl: 'DODGE', val: Math.round((stats.dodge || 0.05)*100)+'%', c1: '#c7ccd6', c2: '#8a94a3', b: 'rgba(199,204,214,0.25)' }
                  ].map((s, idx) => (
                    <div key={idx} style={{ padding: '8px 4px', textAlign: 'center', background: 'rgba(8,22,36,0.5)', border: `1px solid ${s.b || fp+'40'}`, borderRadius: 10 }}>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: s.c2 }}>{s.lbl}</div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 17, fontWeight: 800, color: s.c1, textShadow: idx===0 ? `0 0 8px ${fp}66` : 'none' }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* ============ ABILITY INFO ============ */}
          {(() => {
            const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const fa = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
            
            const InfoCard = ({ title, titleColor, desc, bg, border, titleColorHex }) => (
              <div style={{ padding: '9px 12px', borderRadius: 10, background: bg || 'rgba(74,143,168,0.08)', border: border || `1px solid ${fp}38`, fontFamily: "'Saira', sans-serif", fontSize: 13, color: '#cdd5e0', marginBottom: 6 }}>
                <b style={{ color: titleColorHex || fa }}>{title}</b> {desc}
              </div>
            )

            return (
              <div style={{ margin: '0 16px 10px' }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#8a94a3', marginBottom: 7 }}>
                  <span style={{ fontSize: 9 }}>▶</span> ABILITY INFO
                </div>
                {job && (
                  <InfoCard title={`${job.name} Bonus:`} desc={`+${job.bonus.hp} HP ╖ +${job.bonus.atk} ATK ╖ +${job.bonus.def} DEF`} bg={`linear-gradient(90deg, ${fp}1a, transparent)`} border={`1px solid ${fp}40`} titleColorHex={fp} />
                )}
                {winnerRace && winnerRace === player.race && (
                  <InfoCard title="🏆 CORE WAR VICTORY BUFF ACTIVE:" desc="+10% HP ╖ +10% ATK ╖ +10% DEF" bg="rgba(255,204,0,0.08)" border="1px solid rgba(255,204,0,0.3)" titleColorHex="#ffcc00" />
                )}
                {player.race && (
                  <InfoCard title={t('archon_set_status')} desc={stats.title ? <><span style={{color:'#5fe08a', fontWeight: 800}}>{stats.title === 'Solar Sovereign' ? 'Solaris Set' : stats.title === 'Astral Emperor' ? 'Astral Set' : 'Dominion Set'}</span> ╖ <span style={{color:'#5fe08a'}}>ACTIVE</span></> : <span style={{color:'#6a9ab8'}}>{t('archon_set_inactive')}</span>} bg="rgba(95,224,138,0.06)" border="1px solid rgba(95,224,138,0.25)" titleColorHex="#5fe08a" />
                )}
                {hasArchonEquipped && !isArchon && (
                  <InfoCard title="ℹ️ INFO:" desc={t('archon_notice_unit')} bg="rgba(245,166,35,0.08)" border="1px solid rgba(245,166,35,0.3)" titleColorHex="#f5a623" />
                )}
                {archons && archons[player.race] && archonData[player.race] && (
                  <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.3)', fontFamily: "'Saira', sans-serif", fontSize: 13, color: '#cdd5e0', marginBottom: 6 }}>
                    {archons[player.race].toLowerCase() === player.username?.toLowerCase() && (
                      <div style={{ marginBottom: 4 }}>
                        <b style={{ color: '#f5a623' }}>{t('archon_equipped')} {archonData[player.race].mantle.name}</b>
                        <div style={{ color: '#e0f4ff', fontSize: 12, marginTop: 2 }}>
                          {archonData[player.race].mantle.bonus.atkPercent && `+${archonData[player.race].mantle.bonus.atkPercent}% ATK `}
                          {archonData[player.race].mantle.bonus.defPercent && `+${archonData[player.race].mantle.bonus.defPercent}% DEF `}
                          {archonData[player.race].mantle.bonus.gatherSpeedPercent && `+${archonData[player.race].mantle.bonus.gatherSpeedPercent}% Gather Spd `}
                          {archonData[player.race].mantle.bonus.atkSpeedPercent && `+${archonData[player.race].mantle.bonus.atkSpeedPercent}% ATK Spd `}
                        </div>
                      </div>
                    )}
                    <div>
                      <b style={{ color: '#00e5ff' }}>{t('race_aura_label', { name: archonData[player.race].aura.name })}</b> {archonData[player.race].aura.desc}
                    </div>
                  </div>
                )}
                {gmMelee && <InfoCard title="⚔️ MELEE PT GM ACTIVE:" desc="+50 ATK ╖ +1% Critical" bg="rgba(0,255,136,0.08)" border="1px solid rgba(0,255,136,0.3)" titleColorHex="#00ff88" />}
                {gmRange && <InfoCard title="🏹 RANGED PT GM ACTIVE:" desc="+50 ATK ╖ +1% Critical" bg="rgba(0,255,136,0.08)" border="1px solid rgba(0,255,136,0.3)" titleColorHex="#00ff88" />}
                {gmForce && <InfoCard title="✨ FORCE PT GM ACTIVE:" desc="+50 Force ATK ╖ +1% Critical" bg="rgba(0,255,136,0.08)" border="1px solid rgba(0,255,136,0.3)" titleColorHex="#00ff88" />}
                {gmShield && <InfoCard title="🛡️ SHIELD PT GM ACTIVE:" desc="+50 DEF ╖ +500 HP" bg="rgba(0,255,136,0.08)" border="1px solid rgba(0,255,136,0.3)" titleColorHex="#00ff88" />}
                {allGMMaxed && <InfoCard title="🔥 ASCENSION ARMS ACTIVE:" desc="+50 ATK ╖ +50 DEF ╖ +500 HP ╖ +1% Critical" bg="rgba(234,179,8,0.08)" border="1px solid rgba(234,179,8,0.3)" titleColorHex="#eab308" />}
              </div>
            )
          })()}

          {/* ============ COMBAT PT ============ */}
          {(() => {
            const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const fa = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
            return (
              <>
                <div style={{ margin: '0 16px 4px', fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1, color: fa, textTransform: 'uppercase' }}>Combat</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, margin: '0 16px 10px' }}>
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
                    if (capVal === 0) return null
                    
                    return (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 9, background: 'rgba(8,22,36,0.45)', border: `1px solid ${fp}2e` }}>
                        <span style={{ fontFamily: "'Saira', sans-serif", fontSize: 13, color: '#cdd5e0' }}>{item.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: currentPct >= 50 ? '#16181c' : fa, background: currentPct >= 50 ? 'linear-gradient(135deg,#dde2ea,#9aa2ae)' : `${fp}24`, padding: '2px 7px', borderRadius: 5 }}>
                            {currentPct.toFixed(2)}%
                          </span>
                          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: '#8a94a3' }}>
                            {currentVal} / {capVal} Pt
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )
          })()}

          {/* ============ CRAFTING PT ============ */}
          {(() => {
            const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const fa = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
            return (
              <>
                <div style={{ margin: '0 16px 4px', fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1, color: fa, textTransform: 'uppercase' }}>Crafting</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, margin: '0 16px 12px' }}>
                  {[
                    { key: 'production', label: 'Production PT' }
                  ].map((item) => {
                    const currentVal = pt[item.key]?.val || 1
                    const currentPct = pt[item.key]?.pct || 0
                    const capVal = caps[item.key] || 0
                    if (capVal === 0) return null
                    
                    return (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 9, background: 'rgba(8,22,36,0.45)', border: `1px solid ${fp}2e` }}>
                        <span style={{ fontFamily: "'Saira', sans-serif", fontSize: 13, color: '#cdd5e0' }}>{item.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: currentPct >= 50 ? '#16181c' : fa, background: currentPct >= 50 ? 'linear-gradient(135deg,#dde2ea,#9aa2ae)' : `${fp}24`, padding: '2px 7px', borderRadius: 5 }}>
                            {currentPct.toFixed(2)}%
                          </span>
                          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: '#8a94a3' }}>
                            {currentVal} / {capVal} Pt
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )
          })()}
                  {/* ============ EQUIPMENT ============ */}
          {(() => {
            const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const fa = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
            return (
              <>
                <div style={{ margin: '0 16px 8px', fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#8a94a3' }}>
                  <span style={{ fontSize: 9 }}>▼</span> EQUIPMENT & INVENTORY
                </div>
                <div style={{ margin: '0 16px 12px', padding: '12px 10px', background: 'rgba(8,22,36,0.4)', border: `1px solid ${fp}33`, borderRadius: 12, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, justifyItems: 'center' }}>
                  {/* Row 1 */}
                  <div style={{ width: 48, height: 48, borderRadius: 7, background: `linear-gradient(135deg,${fp}33,rgba(0,0,0,0.5))`, border: `1.5px solid ${fp}80`, boxShadow: `0 0 10px ${fp}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <svg width="16" height="16" viewBox="0 0 13 13"><rect x="1.5" y="1.5" width="10" height="10" transform="rotate(45 6.5 6.5)" fill={fa} fillOpacity="0.6" stroke={fa} strokeWidth="1"/></svg>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: fa }}>AM1</span>
                  </div>
                  <div style={{ width: '100%', height: 48, borderRadius: 7, background: `linear-gradient(135deg,${fp}33,rgba(0,0,0,0.5))`, border: `1.5px solid ${fp}80`, boxShadow: `0 0 10px ${fp}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fa} strokeWidth="1.8"><path d="M12 2l3 6 6 .5-4.5 4 1.4 6L12 15l-5.9 3.5 1.4-6L3 8.5 9 8z"/></svg>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: fa }}>HELM</span>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 7, background: 'rgba(3,8,20,0.55)', border: `1.5px dashed ${fp}4d`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: 'rgba(255,183,119,0.35)' }}>+</span>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: 'rgba(138,148,163,0.5)' }}>AM2</span>
                  </div>
                  
                  {/* Row 2 */}
                  <div style={{ width: '100%', height: 48, borderRadius: 7, background: `linear-gradient(135deg,${fp}33,rgba(0,0,0,0.5))`, border: `1.5px solid ${fp}80`, boxShadow: `0 0 10px ${fp}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fa} strokeWidth="1.8"><path d="M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4M5 5v4M5 5h4"/></svg>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: fa }}>WPN</span>
                  </div>
                  <div style={{ width: '100%', height: 48, borderRadius: 7, background: `linear-gradient(135deg,${fp}33,rgba(0,0,0,0.5))`, border: `1.5px solid ${fp}80`, boxShadow: `0 0 10px ${fp}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fa} strokeWidth="1.8"><path d="M12 2l8 3.5v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10v-6L12 2z"/></svg>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: fa }}>ARM</span>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 7, background: 'rgba(3,8,20,0.55)', border: `1.5px dashed ${fp}4d`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: 'rgba(255,183,119,0.35)' }}>+</span>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: 'rgba(138,148,163,0.5)' }}>SHD</span>
                  </div>
                  
                  {/* Row 3 */}
                  <div style={{ width: 48, height: 48, borderRadius: 7, background: 'rgba(3,8,20,0.55)', border: `1.5px dashed ${fp}4d`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: 'rgba(255,183,119,0.35)' }}>+</span>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: 'rgba(138,148,163,0.5)' }}>GLV</span>
                  </div>
                  <div style={{ width: '100%', height: 48, borderRadius: 7, background: `linear-gradient(135deg,${fp}33,rgba(0,0,0,0.5))`, border: `1.5px solid ${fp}80`, boxShadow: `0 0 10px ${fp}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <svg width="16" height="16" viewBox="0 0 13 13"><rect x="1.5" y="1.5" width="10" height="10" transform="rotate(45 6.5 6.5)" fill={fa} fillOpacity="0.6" stroke={fa} strokeWidth="1"/></svg>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: fa }}>PNT</span>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 7, background: 'rgba(3,8,20,0.55)', border: `1.5px dashed ${fp}4d`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: 'rgba(255,183,119,0.35)' }}>+</span>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: 'rgba(138,148,163,0.5)' }}>CPE</span>
                  </div>
                  
                  {/* Row 4 */}
                  <div style={{ width: 48, height: 48, borderRadius: 7, background: `linear-gradient(135deg,${fp}33,rgba(0,0,0,0.5))`, border: `1.5px solid ${fp}80`, boxShadow: `0 0 10px ${fp}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={fa} strokeWidth="2"><circle cx="12" cy="14" r="6"/><path d="M9 8l3-5 3 5"/></svg>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: fa }}>RG1</span>
                  </div>
                  <div style={{ width: '100%', height: 48, borderRadius: 7, background: `linear-gradient(135deg,${fp}33,rgba(0,0,0,0.5))`, border: `1.5px solid ${fp}80`, boxShadow: `0 0 10px ${fp}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fa} strokeWidth="1.8"><path d="M9 20h6M8 20V10l4-4 4 4v10M6 10h12"/></svg>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: fa }}>BTS</span>
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 7, background: 'rgba(3,8,20,0.55)', border: `1.5px dashed ${fp}4d`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,183,119,0.4)" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: 'rgba(138,148,163,0.5)' }}>ARES</span>
                  </div>
                </div>

                {/* bags */}
                <div style={{ display: 'flex', gap: 7, justifyContent: 'center', margin: '0 16px 14px' }}>
                  {[1, 2, 3, 4, 5].map((bagNum) => (
                    bagNum === 1 ? (
                      <div key={bagNum} style={{ width: 44, height: 44, borderRadius: 7, background: `${fp}24`, border: `1.5px solid ${fp}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, color: fa, boxShadow: `0 0 10px ${fp}4d` }}>{bagNum}</div>
                    ) : bagNum === 5 ? (
                      <div key={bagNum} style={{ width: 44, height: 44, borderRadius: 7, background: 'rgba(10,15,30,0.55)', border: '1.5px solid #2a333f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, color: '#555', opacity: 0.5 }}>{bagNum}</div>
                    ) : (
                      <div key={bagNum} style={{ width: 44, height: 44, borderRadius: 7, background: 'rgba(10,15,30,0.8)', border: '1.5px solid #445566', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, color: '#8899aa' }}>{bagNum}</div>
                    )
                  ))}
                </div>
              </>
            )
          })()}
</>

      )}

      {tab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
          <div className="glass-panel cyber-panel" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: 15, fontFamily: "'Orbitron', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
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
            <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: 15, fontFamily: "'Orbitron', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
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
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: "'Saira', sans-serif", background: '#0e1116' },

  // Header
  header: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)', flexShrink: 0 },
  avatar: { width: 48, height: 48, borderRadius: '50%', border: '2px solid #00e5ff', background: 'linear-gradient(135deg, #0030a0, #001040)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)', flexShrink: 0 },
  name: { fontFamily: "'Orbitron', sans-serif", fontSize: 16, fontWeight: 700, color: '#e0f4ff', letterSpacing: 1 },
  sub: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ec8e3', marginTop: 2, fontWeight: 800 },
  actionBtn: (borderColor, bgStart) => ({
    background: `linear-gradient(95deg, ${bgStart}, ${borderColor})`,
    border: `1px solid ${borderColor}`,
    borderRadius: 8,
    padding: '7px 10px',
    fontFamily: "'Orbitron', sans-serif",
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
    fontFamily: "'Orbitron', sans-serif",
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
    borderRadius: 8, fontFamily: "'Orbitron', sans-serif", 
    fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1, textAlign: 'center'
  },
  tabActive: { 
    flex: 1, padding: '10px', background: 'rgba(0, 229, 255, 0.15)', 
    border: '1px solid #00e5ff', color: '#fff', 
    borderRadius: 8, fontFamily: "'Orbitron', sans-serif", 
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
  sectionLabel: { fontFamily: "'Orbitron', sans-serif", fontSize: 13, letterSpacing: 1.5, color: '#7ec8e3', fontWeight: 800, textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  chevron: { fontFamily: 'var(--font-mono)', fontSize: 16, color: '#00e5ff', fontWeight: 900, lineHeight: 1 },
  sectionBody: { padding: '0 14px 12px' },

  // EXP
  expBg: { height: 10, background: 'rgba(0,0,0,0.4)', borderRadius: 5, overflow: 'hidden', marginBottom: 6, border: '1px solid rgba(0, 229, 255, 0.2)' },
  expFill: { height: '100%', background: 'linear-gradient(90deg, #0066ff, #00e5ff)', borderRadius: 5, boxShadow: '0 0 8px #00e5ff' },
  expText: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ec8e3', textAlign: 'right', fontWeight: 800 },

  // Stats
  baseStatsGrid: { display: 'flex', gap: 6, marginBottom: 10 },
  baseStatBox: { flex: 1, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  baseStatLabel: { fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: '#88aadd', fontWeight: 800, letterSpacing: 0.5 },
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
  desc: { fontFamily: "'Saira', sans-serif", fontSize: 13, color: '#6a9ab8', marginBottom: 10, lineHeight: 1.6, fontWeight: 600 },
  specSection: { display: 'flex', flexDirection: 'column', gap: 3, background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(0,229,255,0.08)' },
  specTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: 14, color: '#7ab0d0', letterSpacing: 0.5, fontWeight: 800, marginBottom: 8, borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: 4 },
  specItem: (c) => ({ fontFamily: "'Saira', sans-serif", fontSize: 13, color: c, lineHeight: 1.5, fontWeight: 600 }),

  growthTable: { width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-mono)', marginBottom: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 6, overflow: 'hidden' },
  th: { padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#88aadd', fontWeight: 'bold' },
  td: { padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e0f4ff' },

  filosofiBox: { display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, border: '1px solid rgba(0,229,255,0.1)' },
  filosofiItem: { fontSize: 13, fontFamily: "'Saira', sans-serif", color: '#a0c4d8', lineHeight: 1.4 },

  // Progress
  progRow: { display: 'flex', justifyContent: 'space-around', gap: 4 },
  progItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 },
  progNum: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, color: '#00e5ff', textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  progLabel: { fontFamily: "'Orbitron', sans-serif", fontSize: 13, color: '#7ec8e3', fontWeight: 800, textAlign: 'center' },

  // Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', padding: 16 },
  modalBox: { background: '#081020', border: '1px solid #00e5ff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400, boxShadow: '0 0 30px rgba(0,229,255,0.3)', maxHeight: '85vh', overflowY: 'auto' },
  modalTitle: { fontFamily: "'Orbitron', sans-serif", fontSize: 20, color: '#fff', textAlign: 'center', textShadow: '0 0 10px #00e5ff', margin: 0, marginBottom: 8 },
  modalDesc: { fontFamily: "'Saira', sans-serif", fontSize: 13, color: '#88aadd', textAlign: 'center', marginTop: 0 },
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
    fontFamily: "'Saira', sans-serif",
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
      fontFamily: "'Orbitron', sans-serif",
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
    fontFamily: "'Orbitron', sans-serif",
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
    fontFamily: "'Orbitron', sans-serif",
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
    fontFamily: "'Orbitron', sans-serif",
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
    fontFamily: "'Saira', sans-serif",
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

