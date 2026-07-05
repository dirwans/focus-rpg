import React, { useState } from 'react'
import { useGameStore, getPTCaps } from '../store/gameStore'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import archonData from '../data/archon.json'
import { PilotSprite } from '../components/PilotSprites'
import { t } from '../lib/translate'

// Import Faction Bag Icons
import arctronBagIcon from '../assets/arctron_bag_icon_rembg.png'
import bionexBagIcon from '../assets/bionex_bag_icon_rembg.png'
import celestraBagIcon from '../assets/celestra_bag_icon_rembg.png'

const BIONEX_SPRITES = {
  guardian:     '/ref/Bellterra/Class-sprites-cleaned/Bellterra-warrior-cleaned.png',
  marksman:     '/ref/Bellterra/Class-sprites-cleaned/Bellterra-ranger-cleaned.png',
  psion:        '/ref/Bellterra/Class-sprites-cleaned/Bellterra-Spiritualist-cleaned.png',
  engineer:     '/ref/Bellterra/Class-sprites-cleaned/Bellterra-specialist-cleaned.png',
}

const BAG_ICONS = {
  arctron: arctronBagIcon,
  bionex: bionexBagIcon,
  celestra: celestraBagIcon,
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
      @keyframes heroRuneRev { from{transform:translate(-50%,-50%) rotate(0deg);} to{transform:translate(-50%,-50%) rotate(-360deg);} }
    `
    document.head.appendChild(s)
  }
  const [tab, setTab] = useState('stats')
  const [activeTooltip, setActiveTooltip] = useState(null)
  
  // Accordion Open/Closed States
  const [statusOpen, setStatusOpen] = useState(true)
  const [abilityOpen, setAbilityOpen] = useState(false)
  const [equipOpen, setEquipOpen] = useState(true)
  
  // Inventory Bags States
  const [activeBag, setActiveBag] = useState(null)
  const [selectedBagItem, setSelectedBagItem] = useState(null)

  const unequipItem = useGameStore((s) => s.unequipItem)
  const equipItem = useGameStore((s) => s.equipItem)
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

  const screenBg = {
    arctron: 'radial-gradient(circle at 30% 0%, #201f22 0%, #0a0a0c 60%)',
    bionex: 'radial-gradient(circle at 30% 0%, #13243a 0%, #060b12 60%)',
    celestra: 'radial-gradient(circle at 30% 0%, #1a1642 0%, #07061a 60%)'
  }[player.race] || '#08080d'

  return (
    <div className="no-scrollbar" style={{ ...styles.screen, background: screenBg }} onClick={() => { setActiveTooltip(null); setSelectedBagItem(null); }}>
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
        const offColor = { arctron: '#8a94a3', bionex: '#7d92a3', celestra: '#8188c2' }[player.race] || '#8a94a3'
        return (
          <div style={{ position: 'relative', zIndex: 4, display: 'flex', gap: 8, padding: '2px 16px 8px' }}>
            <div onClick={() => setTab('stats')} style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 9, cursor: 'pointer',
              fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1,
              color: tab === 'stats' ? '#fff' : offColor,
              background: tab === 'stats' ? 'rgba(255,255,255,0.07)' : 'transparent',
              border: `1px solid ${fp}4d`,
            }}>CHARACTER INFO</div>
            <div onClick={() => setTab('profile')} style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 9, cursor: 'pointer',
              fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1,
              color: tab === 'profile' ? '#fff' : offColor,
              background: tab === 'profile' ? 'rgba(255,255,255,0.07)' : 'transparent',
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
            
            // Dynamic SVG Rune & Animation
            let runeAnimation = 'heroRune 26s linear infinite'
            let runeSvgElements = (
              <>
                <circle cx="105" cy="105" r="100" fill="none" stroke={`${fp}4d`} strokeWidth="1"/>
                <circle cx="105" cy="105" r="86" fill="none" stroke="rgba(199,204,214,0.22)" strokeWidth="1" stroke-dasharray="3 9"/>
              </>
            )
            
            if (player.race === 'bionex') {
              runeAnimation = 'heroRuneRev 28s linear infinite'
              runeSvgElements = (
                <>
                  <circle cx="105" cy="105" r="100" fill="none" stroke={`${fp}4d`} strokeWidth="1"/>
                  <circle cx="105" cy="105" r="86" fill="none" stroke="rgba(199,204,214,0.22)" strokeWidth="1" stroke-dasharray="3 9"/>
                  <line x1="105" y1="5" x2="105" y2="205" stroke={`${fp}26`} strokeWidth="1"/>
                  <line x1="5" y1="105" x2="205" y2="105" stroke={`${fp}26`} strokeWidth="1"/>
                </>
              )
            } else if (player.race === 'celestra') {
              runeAnimation = 'heroRune 24s linear infinite'
              runeSvgElements = (
                <>
                  <circle cx="105" cy="105" r="100" fill="none" stroke={`${fp}59`} strokeWidth="1"/>
                  <circle cx="105" cy="105" r="86" fill="none" stroke="rgba(232,192,122,0.22)" strokeWidth="1" stroke-dasharray="3 9"/>
                  <polygon points="105,10 168,142 42,142" fill="none" stroke="rgba(217,179,255,0.2)" strokeWidth="1"/>
                </>
              )
            }

            return (
              <div style={{
                position: 'relative', height: 322, minHeight: 322, flexShrink: 0, margin: '0 16px 10px',
                borderRadius: 16, overflow: 'hidden',
                background: `radial-gradient(90% 70% at 50% 28%, ${fp}17, transparent 70%)`,
                border: `1px solid ${fp}24`,
              }}>
                <div style={{ position: 'absolute', top: '47%', left: '50%', width: 210, height: 210, animation: runeAnimation, opacity: 0.4 }}>
                  <svg width="210" height="210" viewBox="0 0 210 210">
                    {runeSvgElements}
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
            const TIER_UNLOCK = { tier1: 1, tier2: 32, tier3: 42, tier4: 55 }
            // Dynamic job names from classIndex
            const raceJobs  = jobs[player.race] || {}
            const ci = classIndex >= 0 ? classIndex : 0
            const tierNames = TIER_KEYS.map(tk => {
              const arr = raceJobs[tk] || []
              return arr[ci] ? arr[ci].name : tk
            })
            const currentTierIdx = TIER_KEYS.indexOf('tier' + (tier || 1))
            const linePct = currentTierIdx > 0 ? `${Math.round((currentTierIdx / 3) * 100)}%` : '0%'

            // Faction-based dark backgrounds for past nodes
            const pastBg = {
              arctron: 'rgba(255, 82, 34, 0.25)',
              bionex: 'rgba(59, 130, 246, 0.25)',
              celestra: 'rgba(168, 85, 247, 0.25)'
            }[player.race] || 'rgba(0, 229, 255, 0.25)'

            return (
              <div style={{ margin: '0 16px 10px', padding: '12px 12px 13px', background: 'rgba(8,22,36,0.4)', backdropFilter: 'blur(8px)', border: `1px solid ${fp}38`, borderRadius: 12 }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#8a94a3', marginBottom: 11 }}>
                  CLASS PATH - {baseClass.toUpperCase()}
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
                          background: isActive ? 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)' : isPast ? pastBg : 'rgba(8,22,36,0.6)',
                          border: isActive ? '1px solid #ffffff' : isLocked ? `1.5px dashed ${fp}4d` : `1.5px solid ${fp}`,
                          boxShadow: isActive ? '0 0 16px 3px rgba(255, 255, 255, 0.6)' : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <span style={{ transform: 'rotate(-45deg)', fontFamily: "'Orbitron', sans-serif", fontWeight: 800, fontSize: isActive ? 12 : 11, color: isActive ? '#16181c' : isLocked ? `${fa}4d` : fa }}>
                            {TIER_LABELS[idx]}
                          </span>
                        </div>
                        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, textAlign: 'center', lineHeight: 1.1, color: isActive ? '#fff' : isLocked ? 'rgba(138,148,163,0.4)' : '#8a94a3', fontWeight: isActive ? 800 : 400 }}>
                          {tierNames[idx]}
                        </span>
                        {isActive && <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: fp, fontWeight: 700 }}>◆ ACTIVE</span>}
                        {isLocked && <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: 'rgba(138,148,163,0.4)' }}>LV.{TIER_UNLOCK[tk]}</span>}
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

                const renderEquipSlot = (slotKey, label, svgIcon, styleType = 'full') => {
                  const item = player.equipment && player.equipment[slotKey];
                  const isEmpty = !item;
                  
                  if (isEmpty) {
                    return (
                      <div style={{ width: styleType === 'full' ? '100%' : 48, height: 48, borderRadius: 7, background: 'rgba(3,8,20,0.55)', border: `1.5px dashed ${fp}4d`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: 'rgba(255,183,119,0.35)' }}>+</span>
                        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: 'rgba(138,148,163,0.5)' }}>{label}</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div style={{ width: styleType === 'full' ? '100%' : 48, height: 48, borderRadius: 7, background: `linear-gradient(135deg,${fp}33,rgba(0,0,0,0.5))`, border: `1.5px solid ${fp}80`, boxShadow: `0 0 10px ${fp}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, position: 'relative' }}>
                      {item.image ? (
                        <img referrerPolicy="no-referrer" src={item.image} style={{ width: 22, height: 22, objectFit: 'contain' }} alt={item.name} />
                      ) : item.emoji ? (
                        <span style={{ fontSize: 18, marginTop: -2 }}>{item.emoji}</span>
                      ) : (
                        svgIcon
                      )}
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: fa }}>{label}</span>
                      {item.enhancement_level > 0 && (
                         <span style={{ position: 'absolute', top: 2, right: 3, fontSize: 8, fontWeight: 900, color: '#00ffaa', fontFamily: 'var(--font-mono)' }}>
                           +{item.enhancement_level}
                         </span>
                      )}
                    </div>
                  );
                };
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
                <div 
                  onClick={() => setStatusOpen(!statusOpen)}
                  style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#8a94a3', marginBottom: 7, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ fontSize: 9 }}>{statusOpen ? '▼' : '▶'}</span> STATUS INFO
                </div>
                {statusOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    
                    {/* 1. BASIC POOLS & ATTRIBUTES */}
                    <div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: fa, marginBottom: 5, borderLeft: `3px solid ${fp}`, paddingLeft: 6 }}>
                        BASIC ATTRIBUTES
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                        {[
                          { lbl: 'HP', val: stats.hp.toLocaleString(), color: '#ff4466' },
                          { lbl: 'FP', val: stats.fp.toLocaleString(), color: '#00c8ff' },
                          { lbl: 'SP', val: stats.sp.toLocaleString(), color: '#ffcc00' },
                          { lbl: 'DEF', val: stats.def.toLocaleString(), color: '#eef3fb' },
                          { lbl: 'STR', val: stats.str, color: fa },
                          { lbl: 'DEX', val: stats.dex, color: fa },
                          { lbl: 'INT', val: stats.int, color: fa },
                          { lbl: 'VIT', val: stats.vit, color: fa }
                        ].map((s, idx) => (
                          <div key={idx} style={{ padding: '6px 2px', textAlign: 'center', background: 'rgba(8,22,36,0.5)', border: `1px solid ${fp}22`, borderRadius: 8 }}>
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, fontWeight: 700, color: '#8a94a3' }}>{s.lbl}</div>
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, color: s.color }}>{s.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2. OFFENSIVE RATINGS */}
                    <div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: fa, marginBottom: 5, borderLeft: `3px solid ${fp}`, paddingLeft: 6 }}>
                        OFFENSIVE RATINGS
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                        {[
                          { lbl: '⚔️ MELEE', val: stats.meleeAtk, color: '#ff6a4d' },
                          { lbl: '🏹 RANGED', val: stats.rangedAtk, color: '#5fe08a' },
                          { lbl: '⚡ FORCE', val: player.race === 'arctron' ? '-' : stats.forceAtk, color: '#a855f7' }
                        ].map((s, idx) => (
                          <div key={idx} style={{ padding: '8px 4px', textAlign: 'center', background: 'rgba(8,22,36,0.5)', border: `1px solid ${fp}22`, borderRadius: 8 }}>
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, fontWeight: 700, color: '#8a94a3' }}>{s.lbl}</div>
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 800, color: s.color, textShadow: `0 0 6px ${s.color}40` }}>{s.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. COMBAT PERFORMANCE */}
                    <div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: fa, marginBottom: 5, borderLeft: `3px solid ${fp}`, paddingLeft: 6 }}>
                        COMBAT PERFORMANCE
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                        {[
                          { lbl: 'ACCURACY', val: '100%', color: '#eef3fb' },
                          { lbl: 'EVASION', val: Math.round(stats.dodge * 100) + '%', color: '#00e5ff' },
                          { lbl: 'CRITICAL', val: Math.round(stats.crit * 100) + '%', color: '#ffaa00' },
                          { lbl: 'BLOCK RATE', val: player.equipment?.shield ? Math.round(stats.blockRate * 100) + '%' : '0%', color: '#ff4466' }
                        ].map((s, idx) => (
                          <div key={idx} style={{ padding: '6px 2px', textAlign: 'center', background: 'rgba(8,22,36,0.5)', border: `1px solid ${fp}22`, borderRadius: 8 }}>
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 8, fontWeight: 700, color: '#8a94a3' }}>{s.lbl}</div>
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, color: s.color }}>{s.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. ELEMENTAL RESISTANCES */}
                    <div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: fa, marginBottom: 5, borderLeft: `3px solid ${fp}`, paddingLeft: 6 }}>
                        ELEMENTAL RESISTANCES
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                        {[
                          { lbl: '🔥 FIRE', val: (stats.resistances?.fire || 0) + '%', color: '#ff6a4d' },
                          { lbl: '❄️ WATER', val: (stats.resistances?.water || 0) + '%', color: '#3b82f6' },
                          { lbl: '⛰️ EARTH', val: (stats.resistances?.earth || 0) + '%', color: '#f5a623' },
                          { lbl: '🌀 WIND', val: (stats.resistances?.wind || 0) + '%', color: '#5fe08a' }
                        ].map((s, idx) => (
                          <div key={idx} style={{ padding: '6px 2px', textAlign: 'center', background: 'rgba(8,22,36,0.5)', border: `1px solid ${fp}22`, borderRadius: 8 }}>
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, fontWeight: 700, color: '#8a94a3' }}>{s.lbl}</div>
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 800, color: s.color }}>{s.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
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
                <div 
                  onClick={() => setAbilityOpen(!abilityOpen)}
                  style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#8a94a3', marginBottom: 7, cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ fontSize: 9 }}>{abilityOpen ? '▼' : '▶'}</span> ABILITY INFO
                </div>
                {abilityOpen && (
                  <>
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
                  </>
                )}
              </div>
            )
          })()}

          {/* ============ COMBAT PT ============ */}
          {(() => {
            const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const fa = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'

                const renderEquipSlot = (slotKey, label, svgIcon, styleType = 'full') => {
                  const item = player.equipment && player.equipment[slotKey];
                  const isEmpty = !item;
                  
                  if (isEmpty) {
                    return (
                      <div style={{ width: styleType === 'full' ? '100%' : 48, height: 48, borderRadius: 7, background: 'rgba(3,8,20,0.55)', border: `1.5px dashed ${fp}4d`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 16, color: 'rgba(255,183,119,0.35)' }}>+</span>
                        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: 'rgba(138,148,163,0.5)' }}>{label}</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div style={{ width: styleType === 'full' ? '100%' : 48, height: 48, borderRadius: 7, background: `linear-gradient(135deg,${fp}33,rgba(0,0,0,0.5))`, border: `1.5px solid ${fp}80`, boxShadow: `0 0 10px ${fp}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, position: 'relative' }}>
                      {item.image ? (
                        <img referrerPolicy="no-referrer" src={item.image} style={{ width: 22, height: 22, objectFit: 'contain' }} alt={item.name} />
                      ) : item.emoji ? (
                        <span style={{ fontSize: 18, marginTop: -2 }}>{item.emoji}</span>
                      ) : (
                        svgIcon
                      )}
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: fa }}>{label}</span>
                      {item.enhancement_level > 0 && (
                         <span style={{ position: 'absolute', top: 2, right: 3, fontSize: 8, fontWeight: 900, color: '#00ffaa', fontFamily: 'var(--font-mono)' }}>
                           +{item.enhancement_level}
                         </span>
                      )}
                    </div>
                  );
                };
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
                    const capVal = absoluteCaps[item.key] || 0
                    const levelCap = caps[item.key] || 0
                    const isCapped = currentVal >= levelCap
                    if (capVal === 0) return null
                    
                    return (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 9, background: 'rgba(8,22,36,0.45)', border: `1px solid ${fp}2e` }}>
                        <span style={{ fontFamily: "'Saira', sans-serif", fontSize: 13, color: '#cdd5e0' }}>{item.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: currentPct >= 50 ? '#16181c' : fa, background: currentPct >= 50 ? 'linear-gradient(135deg,#dde2ea,#9aa2ae)' : `${fp}24`, padding: '2px 7px', borderRadius: 5 }}>
                            {currentPct.toFixed(2)}%
                          </span>
                          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: isCapped ? '#ffa500' : '#8a94a3' }}>
                            {currentVal} / {capVal} Pt {isCapped && <span style={{ fontSize: 9, color: '#ffa500', fontWeight: 'bold', marginLeft: 2 }}>[CAP]</span>}
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
                    const capVal = absoluteCaps[item.key] || 0
                    const levelCap = caps[item.key] || 0
                    const isCapped = currentVal >= levelCap
                    if (capVal === 0) return null
                    
                    return (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 9, background: 'rgba(8,22,36,0.45)', border: `1px solid ${fp}2e` }}>
                        <span style={{ fontFamily: "'Saira', sans-serif", fontSize: 13, color: '#cdd5e0' }}>{item.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: currentPct >= 50 ? '#16181c' : fa, background: currentPct >= 50 ? 'linear-gradient(135deg,#dde2ea,#9aa2ae)' : `${fp}24`, padding: '2px 7px', borderRadius: 5 }}>
                            {currentPct.toFixed(2)}%
                          </span>
                          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, color: isCapped ? '#ffa500' : '#8a94a3' }}>
                            {currentVal} / {capVal} Pt {isCapped && <span style={{ fontSize: 9, color: '#ffa500', fontWeight: 'bold', marginLeft: 2 }}>[CAP]</span>}
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
            
            // Silhouettes
            const amuletSvg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3c0 6 3 10 6 13 3-3 6-7 6-13" /><polygon points="12,15 9,19 12,22 15,19" fill="currentColor" fillOpacity="0.25" /></svg>;
            const helmetSvg = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 0-10 10c0 5.5 6 8 10 10 4-2 10-4.5 10-10A10 10 0 0 0 12 2z" /><path d="M12 6a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z" /><path d="M8 14h8" /></svg>;
            const weaponSvg = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5L3 6M17.5 14.5L6 3" /><path d="M13 3l8 8M19 19v-4M19 19h-4" /><path d="M5 5v4M5 5h4" /></svg>;
            const armorSvg = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5L12 2z" /><path d="M12 6v10M8 9h8" /></svg>;
            const shieldSvg = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
            const glovesSvg = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10V8a3 3 0 0 0-6 0v2" /><path d="M14 10V6a2 2 0 0 0-4 0v4" /><path d="M10 10V5a2 2 0 0 0-4 0v5" /><path d="M6 10v7a6 6 0 0 0 12 0v-7" /></svg>;
            const pantsSvg = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12v7l-2 1v12h-3v-7h-2v7H8V10L6 9V2z" /></svg>;
            const mantleSvg = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h16l-2 8 2 10-8-3-8 3 2-10L4 3z" /></svg>;
            const ringSvg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="14" r="6" /><path d="M9 8l3-5 3 5" /></svg>;
            const bootsSvg = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h3v10l3 2v4H5v-4l2-2V4z" /><path d="M14 4h3v10l3 2v4h-8v-4l2-2V4z" /></svg>;
            const aresSvg = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" strokeDasharray="3 3" /><circle cx="12" cy="12" r="5" /><polygon points="12,4 14,9 19,10 15,13 16,19 12,16 8,19 9,13 5,10 10,9" fill="currentColor" fillOpacity="0.2" /></svg>;

            const renderEquipSlot = (slotKey, label, svgIcon, isCircle = false, width = '100%', height = 'auto', aspectRatio = '1 / 1') => {
              const item = player.equipment && player.equipment[slotKey];
              const isEmpty = !item;
              const showTooltip = activeTooltip === slotKey;

              const slotStyle = {
                width: width,
                height: height,
                aspectRatio: aspectRatio,
                borderRadius: isCircle ? '50%' : 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              };

              if (isEmpty) {
                return (
                  <div
                    style={{
                      ...slotStyle,
                      background: 'rgba(5, 10, 20, 0.85)',
                      border: '2px solid rgba(55, 65, 80, 0.85)',
                      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.85)',
                      color: 'rgba(138, 148, 163, 0.25)',
                    }}
                  >
                    <div style={{ opacity: 0.16, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                      {svgIcon}
                    </div>
                  </div>
                );
              }

              const borderColors = {
                common: 'rgba(100, 110, 125, 0.95)',
                uncommon: 'rgba(50, 180, 100, 0.95)',
                rare: 'rgba(50, 120, 240, 0.95)',
                epic: 'rgba(160, 50, 240, 0.95)',
                legendary: 'rgba(240, 150, 30, 0.95)'
              };
              const itemRarity = item.rarity || 'common';
              const borderCol = borderColors[itemRarity] || 'rgba(100, 110, 125, 0.95)';

              return (
                <div
                  style={{
                    ...slotStyle,
                    background: 'rgba(10, 15, 25, 0.95)',
                    border: `2px solid ${borderCol}`,
                    boxShadow: '0 0 10px rgba(0,0,0,0.7), inset 0 0 4px rgba(255,255,255,0.1)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === slotKey ? null : slotKey);
                  }}
                  onMouseEnter={() => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      setActiveTooltip(slotKey);
                    }
                  }}
                  onMouseLeave={() => {
                    if (window.matchMedia('(hover: hover)').matches) {
                      setActiveTooltip(null);
                    }
                  }}
                >
                  {item.image ? (
                    <img referrerPolicy="no-referrer" src={item.image} style={{ width: '92%', height: '92%', objectFit: 'contain', borderRadius: 2 }} alt={item.name} />
                  ) : item.emoji ? (
                    <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                  ) : (
                    svgIcon
                  )}
                  {item.enhancement_level > 0 && (
                    <span style={{ position: 'absolute', top: 2, right: 3, fontSize: 8, fontWeight: 900, color: '#00ffaa', fontFamily: 'var(--font-mono)' }}>
                      +{item.enhancement_level}
                    </span>
                  )}

                  {/* Info Icon Indicator */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 1,
                      right: 1,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.85)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      color: '#fff',
                      fontSize: 8,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                    }}
                  >
                    i
                  </div>

                  {/* Tooltip Popup */}
                  {showTooltip && (
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '110%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(5, 12, 28, 0.98)',
                        border: '1.5px solid rgba(138,148,163,0.5)',
                        borderRadius: 8,
                        padding: 10,
                        width: 170,
                        zIndex: 100,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.85)',
                        color: '#fff',
                        fontFamily: 'var(--font-body)',
                        fontSize: 12,
                        textAlign: 'left',
                        cursor: 'default'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ fontWeight: 800, color: borderCol, fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4, marginBottom: 6, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.name.toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#a0c0d8' }}>
                        <div>Type: {item.type.toUpperCase()}</div>
                        <div>Rarity: {item.rarity.toUpperCase()}</div>
                        {item.bonus && (
                          <div style={{ color: '#00ff88', marginTop: 2, fontWeight: 700 }}>
                            {item.bonus.atk && `ATK +${item.bonus.atk} `}
                            {item.bonus.def && `DEF +${item.bonus.def} `}
                            {item.bonus.hp && `HP +${item.bonus.hp} `}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          unequipItem(slotKey);
                          setActiveTooltip(null);
                        }}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(90deg, #ff2255, #ff5588)',
                          border: 'none',
                          borderRadius: 4,
                          color: '#fff',
                          padding: '4px 0',
                          fontFamily: 'var(--font-title)',
                          fontSize: 10,
                          fontWeight: 800,
                          marginTop: 8,
                          cursor: 'pointer'
                        }}
                      >
                        UNEQUIP
                      </button>
                    </div>
                  )}
                </div>
              );
            };
            const typeSvgs = {
              amulet: amuletSvg,
              helmet: helmetSvg,
              weapon: weaponSvg,
              armor: armorSvg,
              shield: shieldSvg,
              gloves: glovesSvg,
              pants: pantsSvg,
              mantle: mantleSvg,
              ring: ringSvg,
              boots: bootsSvg,
              ascension_arms: aresSvg
            };
            const defaultItemSvg = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12,2 2,7 12,12 22,7" /><path d="M2,17 l10,5 l10,-5" /><path d="M2,12 l10,5 l10,-5" /></svg>;

            return (
              <>
                <div 
                  onClick={() => setEquipOpen(!equipOpen)}
                  style={{ margin: '0 16px 8px', fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: '#8a94a3', cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ fontSize: 9 }}>{equipOpen ? '▼' : '▶'}</span> EQUIPMENT & INVENTORY
                </div>
                
                {equipOpen && (
                  <>
                    <div style={{
                      margin: '0 auto 12px',
                      padding: '8px',
                      background: 'rgba(5, 8, 12, 0.95)',
                      border: '2px solid rgba(50, 58, 70, 0.8)',
                      borderRadius: 6,
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 3,
                      overflow: 'visible',
                      width: 'calc(100% - 32px)',
                      maxWidth: 320,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.6)',
                    }}>
                      {/* Left Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 3, alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 3, width: '100%', marginBottom: 'calc(50% + 3px)' }}>
                          {renderEquipSlot('amulet1', 'AM1', amuletSvg, false, 'calc(50% - 1.5px)', 'auto', '1 / 1')}
                          {renderEquipSlot('amulet2', 'AM2', amuletSvg, false, 'calc(50% - 1.5px)', 'auto', '1 / 1')}
                        </div>
                        <div style={{ width: '100%' }}>
                          {renderEquipSlot('weapon', 'WPN', weaponSvg, false, '100%', 'auto', '1 / 1')}
                        </div>
                        <div style={{ width: '100%' }}>
                          {renderEquipSlot('gloves', 'GLV', glovesSvg, false, '100%', 'auto', '1 / 1')}
                        </div>
                        <div style={{ marginTop: 'calc(20% + 3px)', width: '100%', display: 'flex', justifyContent: 'center' }}>
                          {renderEquipSlot('ring1', 'RG1', ringSvg, false, '60%', 'auto', '1 / 1')}
                        </div>
                      </div>

                      {/* Center Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 3, alignItems: 'center' }}>
                        <div style={{ width: '100%' }}>
                          {renderEquipSlot('helmet', 'HELM', helmetSvg, false, '100%', 'auto', '1 / 1')}
                        </div>
                        <div style={{ width: '100%' }}>
                          {renderEquipSlot('armor', 'ARM', armorSvg, false, '100%', 'auto', '1 / 1')}
                        </div>
                        <div style={{ width: '100%' }}>
                          {renderEquipSlot('pants', 'PNT', pantsSvg, false, '100%', 'auto', '1 / 1')}
                        </div>
                        <div style={{ width: '100%' }}>
                          {renderEquipSlot('boots', 'BTS', bootsSvg, false, '100%', 'auto', '1 / 1')}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 3, alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 3, width: '100%', marginBottom: 'calc(50% + 3px)' }}>
                          {renderEquipSlot('ascension_arms', 'ARES', aresSvg, false, 'calc(50% - 1.5px)', 'auto', '1 / 1')}
                          {/* Decorative Core Slot for Symmetry */}
                          <div style={{
                            width: 'calc(50% - 1.5px)',
                            aspectRatio: '1 / 1',
                            borderRadius: 4,
                            background: 'rgba(5, 10, 20, 0.85)',
                            border: '2px solid rgba(55, 65, 80, 0.5)',
                            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.85)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(138,148,163,0.12)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                          </div>
                        </div>
                        <div style={{ width: '100%' }}>
                          {renderEquipSlot('shield', 'SHD', shieldSvg, false, '100%', 'auto', '1 / 1')}
                        </div>
                        <div style={{ width: '100%' }}>
                          {renderEquipSlot('mantle', 'CPE', mantleSvg, false, '100%', 'auto', '1 / 1')}
                        </div>
                        <div style={{ marginTop: 'calc(20% + 3px)', width: '100%', display: 'flex', justifyContent: 'center' }}>
                          {renderEquipSlot('ring2', 'RG2', ringSvg, false, '60%', 'auto', '1 / 1')}
                        </div>
                      </div>
                    </div>
                    
                    {/* bags */}
                    <div style={{
                      display: 'flex',
                      gap: 3,
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                      width: 'calc(100% - 32px)',
                      maxWidth: 320,
                    }}>
                      {[1, 2, 3, 4, 5].map((bagNum) => {
                        let isUnlocked = false;
                        if (bagNum <= 2) isUnlocked = true;
                        else if (bagNum === 3 && player.level >= 32) isUnlocked = true;
                        else if (bagNum === 4 && player.level >= 42) isUnlocked = true;
                        else if (bagNum === 5 && player.level >= 55) isUnlocked = true;

                        const isBagActive = activeBag === bagNum
                        const bagIcon = BAG_ICONS[player.race]

                        if (isUnlocked) {
                          return (
                            <div
                              key={bagNum}
                              onClick={() => {
                                setActiveBag(isBagActive ? null : bagNum)
                                setSelectedBagItem(null)
                              }}
                              style={{
                                flex: 1,
                                aspectRatio: '1 / 1',
                                borderRadius: 4,
                                background: isBagActive ? `rgba(8, 22, 36, 0.35)` : 'rgba(20, 25, 35, 0.9)',
                                border: isBagActive ? `2px solid ${fp}` : '2px solid rgba(85, 95, 110, 0.85)',
                                boxShadow: isBagActive ? `0 2px 4px rgba(0,0,0,0.4), 0 0 10px ${fp}80` : '0 2px 4px rgba(0,0,0,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: "'Orbitron', sans-serif",
                                fontSize: 13,
                                fontWeight: 800,
                                color: fa,
                                cursor: 'pointer',
                                overflow: 'hidden'
                              }}
                            >
                              {bagNum === 1 && bagIcon ? (
                                <img src={bagIcon} alt="Bag 1" style={{ width: '98%', height: '98%', objectFit: 'contain', filter: `drop-shadow(0 0 5px ${fa}4d)` }} />
                              ) : (
                                bagNum
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={bagNum}
                              style={{
                                flex: 1,
                                aspectRatio: '1 / 1',
                                borderRadius: 4,
                                background: 'rgba(5, 8, 12, 0.85)',
                                border: '2px solid rgba(40, 45, 55, 0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: "'Orbitron', sans-serif",
                                fontSize: 13,
                                fontWeight: 800,
                                color: '#444',
                                opacity: 0.5
                              }}
                            >
                              {bagNum}
                            </div>
                          );
                        }
                      })}
                    </div>

                    {/* Inventory grid panel drawer */}
                    {activeBag !== null && (
                      <div style={{
                        margin: '8px auto 14px',
                        width: 'calc(100% - 32px)',
                        maxWidth: 320,
                        background: 'rgba(6, 9, 14, 0.97)',
                        border: `2px solid ${fp}73`,
                        borderRadius: 8,
                        boxShadow: '0 10px 24px rgba(0,0,0,0.6)',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderBottom: `1px solid ${fp}40`,
                          background: `${fp}14`
                        }}>
                          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: 1.5, color: fa }}>
                            BAG {activeBag}
                          </span>
                          <span 
                            onClick={() => {
                              setActiveBag(null)
                              setSelectedBagItem(null)
                            }} 
                            style={{ cursor: 'pointer', color: '#8a94a3', fontSize: 13, fontWeight: 800, padding: '2px 6px' }}
                          >
                            ✕
                          </span>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, padding: 10, position: 'relative' }}>
                          {(() => {
                            const startIdx = (activeBag - 1) * 10
                            const endIdx = activeBag * 10
                            const bagItems = player.inventory ? player.inventory.slice(startIdx, endIdx) : []
                            
                            const paddedBagItems = [...bagItems]
                            while (paddedBagItems.length < 10) {
                              paddedBagItems.push(null)
                            }
                            
                            return paddedBagItems.map((item, idx) => {
                              if (item === null) {
                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      aspectRatio: '1 / 1',
                                      borderRadius: 4,
                                      background: 'rgba(5, 8, 12, 0.85)',
                                      border: '1.5px solid rgba(40, 45, 55, 0.6)'
                                    }}
                                  />
                                )
                              }
                              
                              const borderColors = {
                                common: 'rgba(100, 110, 125, 0.95)',
                                uncommon: 'rgba(50, 180, 100, 0.95)',
                                rare: 'rgba(50, 120, 240, 0.95)',
                                epic: 'rgba(160, 50, 240, 0.95)',
                                legendary: 'rgba(240, 150, 30, 0.95)'
                              };
                              const borderCol = borderColors[item.rarity || 'common'] || 'rgba(100, 110, 125, 0.95)';
                              const isSelected = selectedBagItem?.uid === item.uid
                              
                              const svgIcon = typeSvgs[item.type] || defaultItemSvg
                              
                              return (
                                <div
                                  key={item.uid || idx}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedBagItem(isSelected ? null : item)
                                  }}
                                  style={{
                                    aspectRatio: '1 / 1',
                                    borderRadius: 4,
                                    background: isSelected ? 'rgba(20, 30, 50, 0.95)' : 'rgba(15, 20, 30, 0.9)',
                                    border: `1.5px solid ${borderCol}`,
                                    boxShadow: isSelected ? `0 0 8px ${borderCol}, inset 0 0 4px rgba(255,255,255,0.2)` : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {item.image ? (
                                    <img referrerPolicy="no-referrer" src={item.image} style={{ width: '80%', height: '80%', objectFit: 'contain' }} alt={item.name} />
                                  ) : item.emoji ? (
                                    <span style={{ fontSize: 18 }}>{item.emoji}</span>
                                  ) : (
                                    <div style={{ color: borderCol, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {svgIcon}
                                    </div>
                                  )}
                                  
                                  {item.level && (
                                    <span style={{ position: 'absolute', top: 1, left: 2, fontFamily: "'Share Tech Mono', monospace", fontSize: 7, fontWeight: 800, color: '#fff', background: 'rgba(0,0,0,0.65)', padding: '0 2px', borderRadius: 2 }}>
                                      {item.level}LV
                                    </span>
                                  )}
                                  
                                  {item.count && item.count > 1 && (
                                    <span style={{ position: 'absolute', bottom: 1, right: 3, fontFamily: "'Share Tech Mono', monospace", fontSize: 9, fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                                      {item.count}
                                    </span>
                                  )}
                                </div>
                              )
                            })
                          })()}
                        </div>
                        
                        {/* Selected item tooltip info inside the bag drawer */}
                        {selectedBagItem && (() => {
                          const item = selectedBagItem
                          const borderColors = {
                            common: 'rgba(100, 110, 125, 0.95)',
                            uncommon: 'rgba(50, 180, 100, 0.95)',
                            rare: 'rgba(50, 120, 240, 0.95)',
                            epic: 'rgba(160, 50, 240, 0.95)',
                            legendary: 'rgba(240, 150, 30, 0.95)'
                          };
                          const borderCol = borderColors[item.rarity || 'common'] || 'rgba(100, 110, 125, 0.95)';
                          const isEquipable = ['weapon','armor','shield','helmet','mantle','gloves','boots','pants','amulet','ring'].includes(item.type)
                          
                          return (
                            <div 
                              style={{
                                position: 'absolute',
                                bottom: '5px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(5, 12, 28, 0.98)',
                                border: `1.5px solid ${borderCol}`,
                                borderRadius: 8,
                                padding: 10,
                                width: 'calc(100% - 20px)',
                                zIndex: 100,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.85)',
                                color: '#fff',
                                textAlign: 'left'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4, marginBottom: 6 }}>
                                <span style={{ fontWeight: 800, color: borderCol, fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '85%' }}>
                                  {item.name.toUpperCase()}
                                </span>
                                <button onClick={() => setSelectedBagItem(null)} style={{ background: 'transparent', border: 'none', color: '#8a94a3', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}>✕</button>
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#a0c0d8' }}>
                                <div>Type: {item.type.toUpperCase()}</div>
                                <div>Rarity: {item.rarity.toUpperCase()}</div>
                                {item.level && <div>Req Level: {item.level}</div>}
                                {item.bonus && (
                                  <div style={{ color: '#00ff88', marginTop: 2, fontWeight: 700 }}>
                                    {item.bonus.atk && `ATK +${item.bonus.atk} `}
                                    {item.bonus.def && `DEF +${item.bonus.def} `}
                                    {item.bonus.hp && `HP +${item.bonus.hp} `}
                                  </div>
                                )}
                                {item.desc && <div style={{ color: '#8a94a3', marginTop: 4, fontStyle: 'italic', fontSize: 10 }}>{item.desc}</div>}
                              </div>
                              
                              {isEquipable && (
                                <button
                                  onClick={() => {
                                    equipItem(item.uid);
                                    setSelectedBagItem(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    background: `linear-gradient(90deg, ${fp}, ${fa})`,
                                    border: 'none',
                                    borderRadius: 4,
                                    color: '#fff',
                                    padding: '6px 0',
                                    fontFamily: "'Orbitron', sans-serif",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    marginTop: 8,
                                    cursor: 'pointer',
                                    boxShadow: `0 0 8px ${fp}80`
                                  }}
                                >
                                  EQUIP ITEM
                                </button>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </>
                )}
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
  screen: { display: 'flex', flexDirection: 'column', flex: 1, fontFamily: "'Saira', sans-serif", background: '#0e1116' },

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

