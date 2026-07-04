import React, { useState } from 'react'
import { useGameStore, getPTCaps } from '../store/gameStore'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import archonData from '../data/archon.json'
import { PilotSprite } from '../components/PilotSprites'
import { t } from '../lib/translate'
// v2: faction filter
import { getWeaponRarityColor, getWeaponRarityDisplayName } from '../lib/rarity'


const RARITY_COLOR = {
  common: '#6a9ab8',
  uncommon: '#44ff88',
  rare: '#f5a623',
  epic: '#cc44ff',
  consumable: '#ff4466',
  UR: '#eab308',
  ur: '#eab308',
  ssr: '#ef4444',
  sr: '#a855f7',
  sss: '#a855f7',
  ss: '#3b82f6',
  s: '#22c55e',
  a: '#6a9ab8',
  b: '#6a9ab8',
  c: '#6a9ab8',
  d: '#6a9ab8'
}

// Maps slot names to item.type for filtering
const SLOT_TO_TYPE = {
  weapon: 'weapon', armor: 'armor', shield: 'shield',
  helmet: 'helmet', mantle: 'mantle', gloves: 'gloves',
  boots: 'boots', pants: 'pants',
  amulet1: 'amulet', amulet2: 'amulet',
  ring1: 'ring', ring2: 'ring',
  ascension_arms: 'ascension_arms'
}



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

// Add hero animation keyframes to document (once)
if (typeof document !== 'undefined' && !document.getElementById('hero-stage-kf')) {
  const styleEl = document.createElement('style')
  styleEl.id = 'hero-stage-kf'
  styleEl.textContent = `
    @keyframes heroFloat { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(-9px); } }
    @keyframes heroRune  { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
    @keyframes heroRuneRev { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(-360deg); } }
    @keyframes ledBlink  { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
  `
  document.head.appendChild(styleEl)
}

  const [tab, setTab] = useState('stats')

  const [selectedItem, setSelectedItem] = useState(null)
  const [slotFilter, setSlotFilter] = useState(null)
  const [activeBag, setActiveBag] = useState('bag1')
  const [tooltipItem, setTooltipItem] = useState(null)

  const equipItem = useGameStore((s) => s.equipItem)
  const unequipItem = useGameStore((s) => s.unequipItem)
  const sellItem = useGameStore((s) => s.sellItem)

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

    const handleSell = (uid) => {
    sellItem(uid)
    setSelectedItem(null)
  }

  const handleEquip = (uid) => {
    equipItem(uid)
    setSelectedItem(null)
  }

  const getSellPrice = (item) => {
    return (item.level || 1) * 8 + (item.rarity === 'epic' ? 100 : item.rarity === 'rare' ? 50 : 10)
  }

  const getItemColor = (item) => {
    if (!item) return '#4a6a9a'
    if (item.type === 'weapon') {
      return getWeaponRarityColor(item.rarityGrade || item.rarity)
    }
    return RARITY_COLOR[item.rarity] || RARITY_COLOR[item.rarity?.toUpperCase()] || '#4a8fa8'
  }

  const getItemName = (item) => {
    if (!item) return ''
    if (item.type === 'weapon') {
      const displayName = getWeaponRarityDisplayName(item.rarityGrade || item.rarity)
      const vampSuffix = item.specialProperty === 'vampire' ? ' [Vampire]' : ''
      return `${item.name}${vampSuffix} (${displayName})`
    }
    return item.name
  }

  // Slot type for this slot
  const getSlotType = (slot) => SLOT_TO_TYPE[slot] || slot

  const handleSlotClick = (slot) => {
    const type = getSlotType(slot)
    setSlotFilter(prev => prev === type ? null : type)
  }

  const renderSlot = (slot, defaultEmoji = '➕', slotLabel = slot.toUpperCase(), isSmall = false) => {
    const item = eq[slot]
    const color = getItemColor(item)
    const slotType = getSlotType(slot)
    const isFilterActive = slotFilter === slotType
    const filterGlow = isFilterActive ? '#00e5ff' : null
    return (
      <div
        key={slot}
        role="button"
        tabIndex={0}
        style={{
          flex: isSmall ? 'none' : 1,
          width: isSmall ? 52 : '100%',
          minHeight: isSmall ? 52 : 90,
          height: isSmall ? 52 : 90,
          padding: '4px 2px',
          background: isFilterActive
            ? 'linear-gradient(135deg, rgba(0,229,255,0.18), rgba(0,229,255,0.06))'
            : item ? `linear-gradient(135deg, ${color}22, ${color}08)` : 'rgba(3, 8, 20, 0.55)',
          border: `1.5px ${item ? 'solid' : 'dashed'} ${isFilterActive ? '#00e5ff' : color}`,
          borderRadius: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          cursor: 'pointer',
          boxShadow: isFilterActive
            ? '0 0 14px rgba(0,229,255,0.4), inset 0 0 8px rgba(0,229,255,0.15)'
            : item ? `0 0 10px ${color}33, inset 0 0 6px ${color}22` : 'none',
          color: '#fff',
          outline: 'none',
          transition: 'all 0.2s',
          position: 'relative',
          zIndex: 2,
          overflow: 'visible',
        }}
        onClick={() => handleSlotClick(slot)}
      >
        {!item && (
          <div style={{ 
            fontSize: isSmall ? 28 : 48, 
            opacity: isFilterActive ? 0.6 : 0.35, 
            filter: isFilterActive ? 'drop-shadow(0 0 8px #00e5ff)' : 'grayscale(100%) brightness(0.9)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'absolute',
            inset: 0
          }}>
            {defaultEmoji}
          </div>
        )}
        {item ? (
          <>
            {item.image ? (
              <img referrerPolicy="no-referrer" src={item.image} style={{ width: isSmall ? 32 : 56, height: isSmall ? 32 : 56, objectFit: 'contain' }} alt={item.name} />
            ) : (
              <span style={{ fontSize: isSmall ? 22 : 36 }}>{item.emoji}</span>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Toggle balloon tooltip
                setTooltipItem(tooltipItem?.uid === item.uid ? null : { ...item, slot })
              }}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: 'rgba(3, 8, 20, 0.95)',
                border: `1px solid ${color}`,
                color: color,
                fontSize: 12,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                zIndex: 15,
                boxShadow: `0 0 5px ${color}55`,
              }}
              title="Info/Unequip"
            >
              ℹ
            </button>

            {/* Balloon Tooltip */}
            {tooltipItem?.uid === item.uid && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '105%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(5, 12, 28, 0.98)',
                  border: `1.5px solid ${color}`,
                  borderRadius: 10,
                  padding: 10,
                  width: 170,
                  zIndex: 100,
                  boxShadow: `0 8px 24px rgba(0,0,0,0.8), 0 0 10px ${color}44`,
                  color: '#fff',
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  textAlign: 'left',
                  cursor: 'default'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ fontWeight: 800, color: color, fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4, marginBottom: 6, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
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
                  onClick={() => {
                    unequipItem(slot)
                    setTooltipItem(null)
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #ff2255, #ff5588)',
                    border: 'none',
                    borderRadius: 4,
                    color: '#fff',
                    padding: '4px 0',
                    fontFamily: 'var(--font-title)',
                    fontSize: 11,
                    fontWeight: 800,
                    marginTop: 8,
                    cursor: 'pointer'
                  }}
                >
                  UNEQUIP
                </button>
              </div>
            )}
          </>
        ) : null}

      </div>
    )
  }

  // Filtered inventory
  const filteredInventory = slotFilter
    ? (player.inventory || []).filter(item => item.type === slotFilter)
    : (player.inventory || [])

  const raceClass = player.race ? 'panel-' + player.race : ''

  return (
    <div className="no-scrollbar" style={styles.screen}>
      {/* ===== HEADER ===== */}
      {(() => {
        const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
        return (
          <div style={{ position: 'relative', zIndex: 4, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 8px' }}>
            <button onClick={() => useGameStore.getState().setScreen('main')} style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(8,22,36,0.5)', border: `1px solid ${fp}55`, cursor: 'pointer', color: fp, fontSize: 16, flexShrink: 0,
            }}>❮</button>
            <div style={{ flex: 1, textAlign: 'center', marginRight: 32, fontFamily: 'var(--font-title)', fontSize: 18, fontWeight: 800, letterSpacing: 2, color: '#fff', textShadow: `0 0 10px ${fp}80` }}>
              CHARACTER
            </div>
          </div>
        )
      })()}

      {/* ===== RESOURCES ===== */}
      {(() => {
        const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
        return (
          <div style={{ position: 'relative', zIndex: 4, display: 'flex', gap: 8, padding: '0 16px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(8,22,36,0.5)', backdropFilter: 'blur(8px)', border: `1px solid ${fp}55`, borderRadius: 20, padding: '4px 12px 4px 9px' }}>
              <svg width="13" height="15" viewBox="0 0 14 16"><polygon points="7,0 14,4 14,12 7,16 0,12 0,4" fill="none" stroke={fp} strokeWidth="1.4"/></svg>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 700, color: { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3' }}>
                {(player.resources?.anium || 0).toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(8,22,36,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(199,204,214,0.4)', borderRadius: 20, padding: '4px 12px 4px 9px' }}>
              <svg width="12" height="12" viewBox="0 0 13 13"><rect x="1.5" y="1.5" width="10" height="10" transform="rotate(45 6.5 6.5)" fill="none" stroke="#c7ccd6" strokeWidth="1.4"/></svg>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 700, color: '#c7ccd6' }}>
                {(player.resources?.credits || 0).toLocaleString()}
              </span>
            </div>
          </div>
        )
      })()}

      {/* ===== CHARACTER INFO / PROFILE TABS ===== */}
      {(() => {
        const fp = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
        return (
          <div style={{ display: 'flex', gap: 8, padding: '2px 16px 8px', position: 'relative', zIndex: 4 }}>
            <div onClick={() => setTab('stats')} style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 9, cursor: 'pointer',
              fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 800, letterSpacing: 1,
              color: tab === 'stats' ? '#fff' : '#8a94a3',
              background: tab === 'stats' ? `${fp}22` : 'transparent',
              border: `1px solid ${fp}44`,
            }}>CHARACTER INFO</div>
            <div onClick={() => setTab('profile')} style={{
              flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 9, cursor: 'pointer',
              fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 800, letterSpacing: 1,
              color: tab === 'profile' ? '#fff' : '#8a94a3',
              background: tab === 'profile' ? `${fp}22` : 'transparent',
              border: `1px solid ${fp}44`,
            }}>PROFILE</div>
          </div>
        )
      })()}

      {/* =============================================
          HERO INSPECTION STAGE — always visible
         ============================================= */}
      {(() => {
        const factionPrimary = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
        const factionAccent  = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
        const factionLabel   = player.race ? player.race.toUpperCase() : 'UNKNOWN'
        const hexSymbol      = { arctron: '⬡', bionex: '◎', celestra: '✦' }[player.race] || '◈'

        // Detect sprite to show
        const bionexSprite = player.race === 'bionex' ? getBionexJobSprite(player.job) : null

        return (
          <div style={{
            position:   'relative',
            height:     290,
            margin:     '0 16px 0',
            borderRadius: 16,
            overflow:   'hidden',
            background: `radial-gradient(90% 70% at 50% 28%, ${factionPrimary}18, transparent 70%)`,
            border:     `1px solid ${factionPrimary}22`,
          }}>
            {/* Animated rune rings */}
            <div style={{
              position:  'absolute', top: '46%', left: '50%',
              width: 200, height: 200,
              animation: 'heroRune 26s linear infinite',
              opacity: 0.35,
              pointerEvents: 'none',
            }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="96" fill="none" stroke={factionPrimary} strokeWidth="1" opacity="0.5"/>
                <circle cx="100" cy="100" r="78" fill="none" stroke={factionAccent} strokeWidth="1" strokeDasharray="3 8" opacity="0.4"/>
              </svg>
            </div>
            <div style={{
              position:  'absolute', top: '46%', left: '50%',
              width: 200, height: 200,
              animation: 'heroRuneRev 18s linear infinite',
              opacity: 0.2,
              pointerEvents: 'none',
            }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="60" fill="none" stroke={factionPrimary} strokeWidth="1.5" strokeDasharray="5 12"/>
              </svg>
            </div>

            {/* Grid floor perspective */}
            <div style={{
              position:   'absolute', bottom: 0, left: 0, right: 0,
              height:     70,
              backgroundImage: `linear-gradient(${factionPrimary}18 1px, transparent 1px), linear-gradient(90deg, ${factionPrimary}14 1px, transparent 1px)`,
              backgroundSize: '18px 18px',
              transform:  'perspective(220px) rotateX(64deg)',
              transformOrigin: 'bottom',
              WebkitMaskImage: 'linear-gradient(to top, #000, transparent)',
              maskImage:  'linear-gradient(to top, #000, transparent)',
              pointerEvents: 'none',
            }}/>

            {/* Top gradient overlay */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 60,
              background: 'linear-gradient(to bottom, rgba(8,8,12,0.5), transparent)',
              pointerEvents: 'none', zIndex: 3,
            }}/>

            {/* LV badge — top left */}
            <div style={{
              position: 'absolute', top: 12, left: 12, zIndex: 4,
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(8,22,36,0.6)',
              backdropFilter: 'blur(6px)',
              border: `1px solid ${factionPrimary}55`,
              borderRadius: 22, padding: '3px 4px 3px 11px',
            }}>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 700, letterSpacing: 1, color: factionAccent }}>LV</span>
              <span style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg, #dde2ea, #9aa2ae)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800,
                color: '#16181c', boxShadow: '0 0 12px rgba(199,204,214,0.5)',
              }}>{player.level || 1}</span>
            </div>

            {/* Faction badge — top right */}
            <div style={{
              position: 'absolute', top: 14, right: 14, zIndex: 4,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, letterSpacing: 2, color: factionAccent }}>
                {hexSymbol} {factionLabel}
              </span>
            </div>

            {/* Hero sprite (floating) */}
            <div style={{
              position:  'absolute', bottom: 0, left: '50%',
              transform: 'translateX(-50%)',
              animation: 'heroFloat 5.4s ease-in-out infinite',
              zIndex: 2,
            }}>
              {bionexSprite ? (
                <img src={bionexSprite} alt={player.job}
                  style={{ height: 272, width: 'auto', filter: `drop-shadow(0 16px 24px rgba(0,0,0,0.7)) drop-shadow(0 0 28px ${factionPrimary}33)` }}
                />
              ) : (
                <PilotSprite race={player.race} job={player.job} width={112} height={150} fill={true}
                  style={{ filter: `drop-shadow(0 0 20px ${factionPrimary}55)` }}
                />
              )}
            </div>
          </div>
        )
      })()}


      {tab === 'stats' && (
        <>
          {/* ===== GENERAL INFO (new design) ===== */}
          {(() => {
            const factionPrimary = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const factionAccent  = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
            const jobName = job ? job.name : (player.job || 'NOVICE')
            const EXP_SEGS = 12
            const filledSegs = Math.round((player.exp / expMax) * EXP_SEGS)
            const playerId = `${baseClass.slice(0,3)}-${(player.username || 'PLT').slice(0,3).toUpperCase()}X`

            return (
              <div style={{
                position: 'relative', margin: '0 16px 10px',
                padding: '12px 15px 13px', borderRadius: 14,
                background: 'linear-gradient(180deg, rgba(24,23,26,0.42), rgba(16,15,17,0.88))',
                border: `1px solid ${factionPrimary}44`,
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}>
                {/* Name + ACTIVE */}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--font-title)', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: 0.5, textShadow: `0 0 16px ${factionPrimary}80` }}>
                    {(player.name || 'UNNAMED').toUpperCase()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 700, color: '#5fe08a' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5fe08a', boxShadow: '0 0 8px #5fe08a', display: 'inline-block', animation: 'ledBlink 1.6s infinite' }}/>
                    ACTIVE
                  </span>
                </div>

                {/* FACTION | CLASS | JOB row */}
                <div style={{ display: 'flex', margin: '0 -15px', borderTop: `1px solid ${factionPrimary}22`, borderBottom: `1px solid ${factionPrimary}22` }}>
                  {[
                    { label: 'FACTION', value: player.race ? player.race.toUpperCase() : 'UNKNOWN', color: '#eef3fb' },
                    { label: 'CLASS',   value: baseClass,  color: factionAccent },
                    { label: 'JOB',     value: (jobName || 'NOVICE').toUpperCase(), color: '#eef3fb' },
                  ].map((col, i, arr) => (
                    <div key={col.label} style={{
                      flex: 1, padding: '7px 0', textAlign: 'center',
                      borderRight: i < arr.length - 1 ? `1px solid ${factionPrimary}18` : 'none',
                    }}>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: 10, letterSpacing: 1, color: '#8a94a3' }}>{col.label}</div>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 700, color: col.color, marginTop: 2 }}>{col.value}</div>
                    </div>
                  ))}
                </div>

                {/* Player ID + % TO NEXT */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontFamily: 'var(--font-title)', fontSize: 11, color: '#8a94a3' }}>
                    {baseClass} ID · <span style={{ color: '#c7ccd6' }}>{playerId}</span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-title)', fontSize: 11, color: '#b9c0c9' }}>{expPct}% TO NEXT</span>
                </div>

                {/* EXP 12-segment bar */}
                <div style={{ display: 'flex', gap: 3, marginTop: 7 }}>
                  {Array.from({ length: EXP_SEGS }).map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 7, borderRadius: 2,
                      background: i < filledSegs
                        ? `linear-gradient(90deg, ${factionPrimary}bb, ${factionPrimary})`
                        : `${factionPrimary}22`,
                      boxShadow: i < filledSegs && i === filledSegs - 1 ? `0 0 6px ${factionPrimary}` : 'none',
                    }}/>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* ===== CLASS PATH — Dynamic from jobs.json ===== */}
          {(() => {
            const factionPrimary = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const factionAccent  = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'

            // Tier unlock levels
            const TIER_UNLOCK = { tier1: 1, tier2: 15, tier3: 32, tier4: 55 }
            const TIER_LABELS = ['I', 'II', 'III', 'IV']
            const TIER_KEYS   = ['tier1', 'tier2', 'tier3', 'tier4']

            const raceJobs = jobs[player.race] || {}
            // Get names for classIndex column
            const tierNames = TIER_KEYS.map(tk => {
              const arr = raceJobs[tk] || []
              const j = arr[classIndex >= 0 ? classIndex : 0]
              return j ? j.name : tk
            })

            // Which tier is the player currently on?
            const currentTierKey = tier || 'tier1'
            const currentTierIdx = TIER_KEYS.indexOf(currentTierKey)

            return (
              <div style={{
                margin: '0 16px 10px',
                padding: '12px 12px 13px',
                background: 'rgba(8,22,36,0.42)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${factionPrimary}33`,
                borderRadius: 12,
              }}>
                <div style={{
                  fontFamily: 'var(--font-title)', fontSize: 11, fontWeight: 700,
                  letterSpacing: 1.5, color: '#8a94a3', marginBottom: 12,
                }}>
                  CLASS PATH · {baseClass}
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {/* Progress line */}
                  <div style={{
                    position: 'absolute', top: 16, left: '12%', right: '12%', height: 2,
                    background: `linear-gradient(90deg, ${factionPrimary} 0%, ${factionPrimary} ${(currentTierIdx / 3) * 100}%, ${factionPrimary}22 ${(currentTierIdx / 3) * 100}%, ${factionPrimary}22 100%)`,
                  }}/>
                  {TIER_KEYS.map((tk, idx) => {
                    const isActive = idx === currentTierIdx
                    const isPast   = idx < currentTierIdx
                    const isLocked = idx > currentTierIdx
                    const unlockLv = TIER_UNLOCK[tk]
                    return (
                      <div key={tk} style={{
                        position: 'relative', zIndex: 2,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                        width: '24%',
                      }}>
                        {/* Diamond node */}
                        <div style={{
                          width:        isActive ? 38 : 32,
                          height:       isActive ? 38 : 32,
                          borderRadius: isActive ? 9 : 8,
                          transform:    'rotate(45deg)',
                          background:   isActive
                            ? 'linear-gradient(135deg, #dde2ea, #9aa2ae)'
                            : isPast
                            ? `${factionPrimary}30`
                            : 'rgba(8,22,36,0.6)',
                          border:  isLocked
                            ? `1.5px dashed ${factionPrimary}40`
                            : `1.5px solid ${isPast ? factionPrimary : factionPrimary}`,
                          boxShadow: isActive ? '0 0 16px rgba(199,204,214,0.6)' : isPast ? `0 0 6px ${factionPrimary}66` : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginTop: isActive ? -3 : 0,
                        }}>
                          <span style={{
                            transform: 'rotate(-45deg)',
                            fontFamily: 'var(--font-title)', fontSize: isActive ? 12 : 11, fontWeight: 800,
                            color: isActive ? '#16181c' : isLocked ? `${factionAccent}66` : factionAccent,
                          }}>{TIER_LABELS[idx]}</span>
                        </div>
                        {/* Name */}
                        <span style={{
                          fontFamily: 'var(--font-title)', fontSize: 10, textAlign: 'center', lineHeight: 1.1,
                          color: isActive ? '#fff' : isLocked ? 'rgba(138,148,163,0.5)' : factionAccent,
                          fontWeight: isActive ? 800 : 400,
                        }}>{tierNames[idx]}</span>
                        {/* Sub-label */}
                        {isActive && (
                          <span style={{ fontFamily: 'var(--font-title)', fontSize: 9, color: factionAccent }}>◆ ACTIVE</span>
                        )}
                        {isLocked && (
                          <span style={{ fontFamily: 'var(--font-title)', fontSize: 9, color: 'rgba(138,148,163,0.45)' }}>LV.{unlockLv}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* ===== SKILL LOADOUT (redesign) ===== */}
          {(() => {
            const factionPrimary = { arctron: '#ff5222', bionex: '#3b82f6', celestra: '#a855f7' }[player.race] || '#00e5ff'
            const factionAccent  = { arctron: '#ffb48f', bionex: '#a9c8ff', celestra: '#d9acff' }[player.race] || '#7ec8e3'
            const skills = [
              { kind: 'ACTIVE',  skill: activeSkill, icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={factionAccent} strokeWidth="2">
                  <path d="M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4M5 5v4M5 5h4"/>
                </svg>
              )},
              { kind: 'PASSIVE', skill: passiveSkill, icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c7ccd6" strokeWidth="2">
                  <path d="M12 2l8 3.5v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10v-6L12 2z"/>
                </svg>
              )},
            ]
            return (
              <div style={{ display: 'flex', gap: 10, margin: '0 16px 10px' }}>
                {skills.map(({ kind, skill, icon }) => (
                  <div key={kind} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 11px', borderRadius: 11,
                    background: kind === 'ACTIVE'
                      ? `linear-gradient(135deg, ${factionPrimary}28, rgba(0,0,0,0.4))`
                      : 'linear-gradient(135deg, rgba(199,204,214,0.14), rgba(0,0,0,0.4))',
                    border: kind === 'ACTIVE'
                      ? `1.5px solid ${factionPrimary}55`
                      : '1.5px solid rgba(199,204,214,0.35)',
                  }}>
                    <div style={{
                      width: 36, height: 36, flexShrink: 0, borderRadius: 7,
                      background: kind === 'ACTIVE' ? `${factionPrimary}22` : 'rgba(199,204,214,0.12)',
                      border: kind === 'ACTIVE' ? `1px solid ${factionPrimary}55` : '1px solid rgba(199,204,214,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{icon}</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: 9, letterSpacing: 1, color: '#8a94a3' }}>{kind}</div>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: 11, fontWeight: 700, color: kind === 'ACTIVE' ? factionAccent : '#c7ccd6' }}>
                        {(skill.name || kind).toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}


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
          {/* INVENTORY SECTION MOVED FROM CARGO */}
          <AccordionSection label="EQUIPMENT & INVENTORY" raceClass={raceClass} defaultOpen={true}>
            <div style={{ marginTop: 12 }}>

      {/* Equipped Gear Section (Humanoid Grid) */}
      <div style={{ ...styles.sectionLabel, paddingLeft: 16, marginBottom: 8 }}>{t('equipped_gear_title')}</div>
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={{ margin: '0 16px 14px', padding: '14px 10px', overflow: 'visible', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, justifyItems: 'center', alignItems: 'center' }}>
        
        {/* Row 1 */}
        <div style={cargoStyles.stackedSlots}>
          {renderSlot('amulet1', '💎', 'AMU I', true)}
        </div>
        {renderSlot('helmet', '⛑', 'HELMET')}
        <div style={cargoStyles.stackedSlots}>
          {renderSlot('amulet2', '💎', 'AMU II', true)}
        </div>

        {/* Row 2 */}
        {renderSlot('weapon', '⚔️', 'WEAPON')}
        {renderSlot('armor', '🛡', 'ARMOR')}
        {renderSlot('shield', '🔰', 'SHIELD')}

        {/* Row 3 */}
        {renderSlot('gloves', '🧤', 'GLOVES')}
        {renderSlot('pants', '👖', 'PANTS')}
        {renderSlot('mantle', '🦺', 'CAPE')}

        {/* Row 4 */}
        <div style={cargoStyles.ascensionCorner}>
          {renderSlot('ring1', '💍', 'RING', true)}
        </div>
        {renderSlot('boots', '👢', 'BOOTS')}
        <div style={cargoStyles.ascensionCorner}>
          {renderSlot('ascension_arms', '⚙️', 'ARES', true)}
        </div>
      </div>

      {/* Currency Display */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '0 24px 12px', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#e0f4ff', fontWeight: 600, letterSpacing: 0.5, lineHeight: 1.4, marginTop: -4 }}>
        <div>{player.resources.credits?.toLocaleString() || 0} <span style={{ color: '#00e5ff', fontWeight: 800, marginLeft: 4 }}>CRD</span></div>
        <div>{player.resources.nxc?.toLocaleString() || 0} <span style={{ color: '#ffcc00', fontWeight: 800, marginLeft: 4 }}>NXC</span></div>
      </div>

      {/* Bag Slots (Red Box Reference) */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px', justifyContent: 'center' }}>
        {[1, 2, 3, 4, 5].map(num => {
          const bagKey = `bag${num}`
          let isEquipped = false;
          if (num <= 2) isEquipped = true;
          else if (num === 3 && player.level >= 32) isEquipped = true;
          else if (num === 4 && player.level >= 42) isEquipped = true;
          else if (num === 5 && player.level >= 55) isEquipped = true;
          
          const isActive = activeBag === bagKey && !slotFilter
          return (
            <button
              key={bagKey}
              onClick={() => {
                if (isEquipped) {
                  setActiveBag(bagKey)
                  setSlotFilter(null)
                }
              }}
              style={{
                width: 52, height: 52,
                background: isActive ? 'rgba(0,229,255,0.15)' : 'rgba(10, 15, 30, 0.8)',
                border: `1.5px solid ${isActive ? '#00e5ff' : '#445566'}`,
                borderRadius: 6,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: isEquipped ? 'pointer' : 'not-allowed',
                boxShadow: isActive ? '0 0 12px rgba(0,229,255,0.4), inset 0 0 6px rgba(0,229,255,0.2)' : 'none',
                position: 'relative',
                outline: 'none',
                opacity: isEquipped ? 1 : 0.4
              }}
            >
              <div style={{ fontSize: 24, opacity: isEquipped ? 1 : 0.2 }}>🎒</div>
              <div style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 10, fontWeight: 900, color: isActive ? '#00e5ff' : (isEquipped ? '#8899aa' : '#555555'), fontFamily: 'var(--font-mono)' }}>
                {num}
              </div>
            </button>
          )
        })}
      </div>

      {/* Inventory Section */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', marginBottom: 10, gap: 8 }}>
        <div style={styles.sectionLabel}>
          {slotFilter ? `${slotFilter.toUpperCase()} ITEMS` : t('all_cargo_title')}
        </div>
        {slotFilter && (
          <button
            onClick={() => setSlotFilter(null)}
            style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid #00e5ff', borderRadius: 12, padding: '3px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: '#00e5ff', cursor: 'pointer', outline: 'none', marginLeft: 'auto' }}
          >
            ✕ SHOW ALL
          </button>
        )}
      </div>

      <div style={cargoStyles.grid}>
        {Array.from({ length: 25 }).map((_, index) => {
          const item = filteredInventory[index];
          if (item) {
            const cardColor = getItemColor(item)
            return (
              <button
                key={item.uid}
                className="premium-card glass-panel"
                style={cargoStyles.itemCard(cardColor)}
                onClick={() => setSelectedItem(item)}
              >
                <div style={cargoStyles.itemIcon}>
                  {item.image ? (
                    <img referrerPolicy="no-referrer" src={item.image} style={{ width: 34, height: 28, fontSize: 10, objectFit: 'contain' }} alt={item.name} />
                  ) : (
                    item.emoji
                  )}
                </div>
                <div style={cargoStyles.itemName}>{getItemName(item)}</div>
                <div style={cargoStyles.itemBadges}>
                  <span style={cargoStyles.rarityBadge(cardColor)}>{(item.rarityGrade || item.rarity).toUpperCase()}</span>
                </div>
                {item.qty > 1 && (
                  <span style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 11, fontWeight: 900, color: '#00ffaa', fontFamily: 'var(--font-mono)', textShadow: '0 0 4px #000, 1px 1px 2px #000' }}>
                    x{item.qty}
                  </span>
                )}
              </button>
            )
          } else {
            return (
              <div
                key={`empty-${index}`}
                style={{
                  ...cargoStyles.itemCard('rgba(0,0,0,0)'),
                  background: 'rgba(10, 15, 30, 0.4)',
                  border: '1.5px solid rgba(40, 50, 70, 0.5)',
                  cursor: 'default'
                }}
              />
            )
          }
        })}
      </div>

      {/* Item Actions Modal */}
      {selectedItem && (
        <div style={cargoStyles.modalOverlay}>
          <div className="glass-panel" style={cargoStyles.modal}>
            <div style={{ ...cargoStyles.modalName, color: getItemColor(selectedItem), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {selectedItem.image ? (
                <img referrerPolicy="no-referrer" src={selectedItem.image} style={{ width: 32, height: 32, objectFit: 'contain' }} alt={selectedItem.name} />
              ) : (
                <span>{selectedItem.emoji}</span>
              )}
              <span>{selectedItem.name.toUpperCase()}</span>
            </div>
            
            <div style={cargoStyles.modalGrid}>
              <div style={cargoStyles.modalRow}><span>{t('type_label')}:</span> <span>{selectedItem.type.toUpperCase()}</span></div>
              <div style={cargoStyles.modalRow}><span>{t('level_label')}:</span> <span>Lv.{selectedItem.level || 1}</span></div>
              <div style={cargoStyles.modalRow}><span>{t('race_label')}:</span> <span>{(selectedItem.race || 'All').toUpperCase()}</span></div>
              {selectedItem.job && (
                <div style={cargoStyles.modalRow}><span>{t('job_label')}:</span> <span style={{ color: '#ffb300' }}>{selectedItem.job.toUpperCase()}</span></div>
              )}
              {selectedItem.specialProperty && (
                <div style={cargoStyles.modalRow}><span>{t('effect_label')}:</span> <span style={{ color: '#ff3366', fontWeight: 800 }}>{selectedItem.specialProperty.toUpperCase()}</span></div>
              )}
              {selectedItem.bonus && (
                <div style={cargoStyles.modalRow}>
                  <span>{t('bonus_label')}:</span>
                  <span style={{ color: '#00ff88', fontWeight: 700, textAlign: 'right', display: 'inline-block', maxWidth: '65%' }}>
                    {selectedItem.bonus.atk && `+${selectedItem.bonus.atk} ATK `}
                    {selectedItem.bonus.def && `+${selectedItem.bonus.def} DEF `}
                    {selectedItem.bonus.hp && `+${selectedItem.bonus.hp} HP `}
                    {selectedItem.bonus.atkPercent && `+${selectedItem.bonus.atkPercent}% ATK `}
                    {selectedItem.bonus.defPercent && `+${selectedItem.bonus.defPercent}% DEF `}
                    {selectedItem.bonus.hpPercent && `+${selectedItem.bonus.hpPercent}% HP `}
                    {selectedItem.bonus.speedPercent && `+${selectedItem.bonus.speedPercent}% Speed `}
                    {selectedItem.bonus.accPercent && `+${selectedItem.bonus.accPercent}% Acc `}
                    {selectedItem.bonus.critPercent && `+${selectedItem.bonus.critPercent}% Crit `}
                  </span>
                </div>
              )}
              {selectedItem.description && (
                <div style={{ ...cargoStyles.modalRow, flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  <span>{t('description_label')}:</span>
                  <span style={{ color: '#90caf9', fontSize: 13 }}>{selectedItem.description}</span>
                </div>
              )}
              {selectedItem.id && selectedItem.id.startsWith('archon_') && (
                <div style={{ ...cargoStyles.modalRow, flexDirection: 'column', gap: 4, marginTop: 4, background: 'rgba(245, 166, 35, 0.08)', border: '1px solid rgba(245, 166, 35, 0.2)', padding: 8, borderRadius: 6 }}>
                  <span style={{ color: '#ffcc80', fontSize: 13, lineHeight: 1.4 }}>{t('archon_notice_cargo')}</span>
                </div>
              )}
            </div>


            {/* Level/Race/Job requirements checks warnings */}
            {!selectedItem.isEquipped && player.level < (selectedItem.level || 0) && (
              <div style={cargoStyles.warning}>{t('req_level_warn', { req: selectedItem.level, level: player.level })}</div>
            )}
            {!selectedItem.isEquipped && selectedItem.race && selectedItem.race !== 'All' && selectedItem.race !== player.race && (
              <div style={cargoStyles.warning}>{t('restricted_race_warn', { race: selectedItem.race.toUpperCase() })}</div>
            )}
            {!selectedItem.isEquipped && selectedItem.job && selectedItem.job !== player.job && (
              <div style={cargoStyles.warning}>{t('restricted_job_warn', { job: selectedItem.job.toUpperCase() })}</div>
            )}

            <div style={cargoStyles.modalButtons}>
              {selectedItem.isEquipped ? (
                <button
                  style={cargoStyles.modalBtn('#ff4466', true)}
                  onClick={() => {
                    unequipItem(selectedItem.slot)
                    setSelectedItem(null)
                  }}
                >
                  {t('unequip_btn')}
                </button>
              ) : (
                ['weapon', 'armor', 'shield', 'helmet', 'mantle', 'gloves', 'boots', 'pants', 'amulet', 'ring'].includes(selectedItem.type) && (
                  <button
                    style={cargoStyles.modalBtn('#00c8ff', true)}
                    onClick={() => handleEquip(selectedItem.uid)}
                    disabled={
                      player.level < (selectedItem.level || 0) ||
                      (selectedItem.race && selectedItem.race !== 'All' && selectedItem.race !== player.race) ||
                      (selectedItem.job && selectedItem.job !== player.job)
                    }
                  >
                    {t('equip_btn')}
                  </button>
                )
              )}
              {!selectedItem.isEquipped && (
                <button style={cargoStyles.modalBtn('#ff8c40', true)} onClick={() => handleSell(selectedItem.uid)}>
                  {t('sell_btn', { price: getSellPrice(selectedItem) })}
                </button>
              )}
              <button style={cargoStyles.modalBtn('#7ab0d0', false)} onClick={() => setSelectedItem(null)}>
                {t('close_btn')}
              </button>
            </div>

          </div>
        </div>
      )}

            </div>
          </AccordionSection>

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

const cargoStyles = {
  chip:         (c) => ({ background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 20, padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 800, color: c, boxShadow: `0 0 10px ${c}33, inset 0 0 6px ${c}22` }),
  slots:        { fontFamily: 'var(--font-mono)', fontSize: 14, color: '#7ab0d0', background: 'rgba(3, 8, 20, 0.8)', border: '1px solid #1a3a6a', borderRadius: 20, padding: '6px 14px', marginLeft: 'auto', fontWeight: 800 },
  section:      { margin: '0 16px 14px', padding: 14 },
  sectionLabel: { fontFamily: 'var(--font-title)', fontSize: 14, letterSpacing: 2, color: '#7ec8e3', marginBottom: 10, fontWeight: 800 },
  slotHeader:   { fontFamily: 'var(--font-title)', fontSize: 13, color: '#7ec8e3', letterSpacing: 0.5, fontWeight: 800 },
  grid:         { display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 16px 16px' },
  itemCard:     (c) => ({ width: 'calc(20% - 8px)', padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, position: 'relative', cursor: 'pointer', textAlign: 'center', border: `1.5px solid ${c}` }),
  itemIcon:     { fontSize: 28 },
  itemName:     { fontFamily: 'var(--font-body)', fontSize: 13, color: '#e0f4ff', height: 28, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3, fontWeight: 700 },
  itemBadges:   { display: 'flex', gap: 4 },
  rarityBadge:  (c) => ({ fontFamily: 'var(--font-title)', fontSize: 13, color: c, fontWeight: 800 }),
  empty:        { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', opacity: 0.6 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal:        { border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: 16, padding: 20, width: 320, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 10px 25px rgba(0,0,0,0.8)' },
  modalName:    { fontFamily: 'var(--font-title)', fontSize: 16, fontWeight: 900, textAlign: 'center', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', paddingBottom: 8 },
  modalGrid:    { display: 'flex', flexDirection: 'column', gap: 6 },
  modalRow:     { display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#c0dff0', fontWeight: 700 },
  warning:      { background: 'rgba(255,50,50,0.1)', border: '1px solid #ff4444', borderRadius: 6, padding: '6px 10px', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#ff4444', textAlign: 'center', fontWeight: 800 },
  modalButtons: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 },
  modalBtn:     (c, active) => ({ width: '100%', padding: 12, borderRadius: 8, border: active ? 'none' : `1px solid ${c}`, background: active ? c : 'transparent', color: active ? '#000' : c, fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }),
  gearRow:      { display: 'flex', gap: 5, justifyContent: 'center', marginBottom: 5, position: 'relative', zIndex: 2 },
  gearEmpty:    { flex: 1, maxWidth: 100 },
  stackedSlots: { display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },
  ascensionCorner: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },
}


