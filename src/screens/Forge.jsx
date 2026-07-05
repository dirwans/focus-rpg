import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import upgradesConfig from '../data/upgrades.json'
import ascensionData from '../data/ascensionArms.json'
import itemsData from '../data/items.json'
import { getWeaponRarityDisplayName, getWeaponRarityColor } from '../lib/rarity'
import { t } from '../lib/translate'

export default function Forge() {
  const player = useGameStore((s) => s.player)
  const upgrade = useGameStore((s) => s.upgrade)
  const getStats = useGameStore((s) => s.getStats)
  const getUpgradeCost = useGameStore((s) => s.getUpgradeCost)
  const refineWeapon = useGameStore((s) => s.refineWeapon)
  const combineWeapon = useGameStore((s) => s.combineWeapon)
  const craftAscensionArms = useGameStore((s) => s.craftAscensionArms)
  const enhanceItem = useGameStore((s) => s.enhanceItem)
  const craftLegendary = useGameStore((s) => s.craftLegendary)
  const buySetItem = useGameStore((s) => s.buySetItem)

  const [activeTab, setActiveTab] = useState('refine') // 'refine' | 'enhance'
  const [selectedSacrificeUid, setSelectedSacrificeUid] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [sparks, setSparks] = useState([])

  // Enhancement States
  const [selectedEnhanceSlot, setSelectedEnhanceSlot] = useState('')
  const [useLuckyRelic, setUseLuckyRelic] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhanceResult, setEnhanceResult] = useState(null)

  const stats = getStats()

  // Faction thematic mappings
  const faction = player.race || 'arctron'
  const theme = {
    arctron: {
      primary: '#ff5222',
      light: '#ffb48f',
      glowColor: 'rgba(255, 82, 34, 0.5)',
      tabInactiveColor: '#8a94a3',
      bgGradient: 'radial-gradient(120% 65% at 50% -5%, #201f22 0%, #141317 50%, #0a0a0c 100%)',
      glowBorder: 'rgba(255, 82, 34, 0.22)',
      bgDotColor: 'rgba(255, 82, 34, 0.06)',
      weaponSmithSvg: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffb48f" strokeWidth="1.7">
          <path d="M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4M5 5v4M5 5h4" />
        </svg>
      )
    },
    bionex: {
      primary: '#3b82f6',
      light: '#a9c8ff',
      glowColor: 'rgba(59, 130, 246, 0.5)',
      tabInactiveColor: '#7d92a3',
      bgGradient: 'radial-gradient(120% 65% at 50% -5%, #0c1f48 0%, #07132c 50%, #040a1c 100%)',
      glowBorder: 'rgba(59, 130, 246, 0.22)',
      bgDotColor: 'rgba(59, 130, 246, 0.06)',
      weaponSmithSvg: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#a9c8ff" strokeWidth="1.7">
          <path d="M12 2v20M4 12h16" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      )
    },
    celestra: {
      primary: '#9b4dff',
      light: '#c9aeff',
      glowColor: 'rgba(155, 77, 255, 0.5)',
      tabInactiveColor: '#8188c2',
      bgGradient: 'radial-gradient(120% 65% at 50% -5%, #1a1642 0%, #100e2c 50%, #07061a 100%)',
      glowBorder: 'rgba(155, 77, 255, 0.22)',
      bgDotColor: 'rgba(155, 77, 255, 0.06)',
      weaponSmithSvg: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#c9aeff" strokeWidth="1.7">
          <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5z" />
        </svg>
      )
    }
  }[faction] || {
    primary: '#ff5222',
    light: '#ffb48f',
    glowColor: 'rgba(255, 82, 34, 0.5)',
    tabInactiveColor: '#8a94a3',
    bgGradient: 'radial-gradient(120% 65% at 50% -5%, #201f22 0%, #141317 50%, #0a0a0c 100%)',
    glowBorder: 'rgba(255, 82, 34, 0.22)',
    bgDotColor: 'rgba(255, 82, 34, 0.06)',
    weaponSmithSvg: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffb48f" strokeWidth="1.7">
        <path d="M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4M5 5v4M5 5h4" />
      </svg>
    )
  }

  const tabStyle = (tabId) => {
    const on = activeTab === tabId
    return {
      flex: 1,
      textAlign: 'center',
      padding: '7px 2px',
      borderRadius: '7px',
      cursor: 'pointer',
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '10px',
      fontWeight: '800',
      letterSpacing: '0.3px',
      color: on ? '#fff' : theme.tabInactiveColor,
      background: on ? `${theme.primary}33` : 'transparent',
      border: `1px solid ${on ? theme.primary : 'rgba(255,255,255,0.08)'}`,
      transition: 'all 0.2s',
      whiteSpace: 'nowrap'
    }
  }
  // Weapon Smith Data
  const equippedWeapon = player.equipment?.weapon
  const REFINE_COSTS = {
    normal: { next: 'advanced', talics: 1, anium: 5000 },
    advanced: { next: 'rare', talics: 2, anium: 10000 },
    rare: { next: 'epic', talics: 3, anium: 20000 },
    epic: { next: 'legendary', talics: 5, anium: 50000 },
    legendary: { next: 'mythic', talics: 10, anium: 100000 }
  }

  const isEpicOrHigher = (item) => {
    if (!item) return false
    const r = (item.rarityGrade || item.rarity || '').toLowerCase()
    return ['epic', 'legendary', 'mythic', 'ssr', 'ur'].includes(r)
  }

  const ownedIgnorance = player.inventory.filter(it => it.id === 'talic_ignorance').length
  const ownedFavor = player.inventory.filter(it => it.id === 'talic_favor').length
  
  // Eligible Sacrifice Weapons in Inventory
  const sacrificePool = player.inventory.filter(it => it.type === 'weapon' && isEpicOrHigher(it))

  const handleRefine = () => {
    setIsRefining(true)
    const newSparks = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      angle: Math.random() * 360,
      dist: 25 + Math.random() * 50,
      scale: 0.4 + Math.random() * 0.8
    }))
    setSparks(newSparks)

    refineWeapon()

    setTimeout(() => {
      setIsRefining(false)
      setSparks([])
    }, 1000)
  }

  const handleCombine = () => {
    if (!selectedSacrificeUid) {
      alert('Pilih senjata tumbal terlebih dahulu.')
      return
    }
    combineWeapon(Number(selectedSacrificeUid))
    setSelectedSacrificeUid('')
  }

  const handleEnhance = () => {
    if (!selectedEnhanceSlot) return
    setIsEnhancing(true)
    setEnhanceResult(null)

    const newSparks = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      angle: Math.random() * 360,
      dist: 25 + Math.random() * 50,
      scale: 0.4 + Math.random() * 0.8
    }))
    setSparks(newSparks)

    setTimeout(() => {
      const res = enhanceItem(selectedEnhanceSlot, useLuckyRelic)
      setIsEnhancing(false)
      setSparks([])
      if (res && res.status !== 'error') {
        setEnhanceResult(res)
        if (res.status === 'destroyed') {
          setSelectedEnhanceSlot('')
        }
      }
    }, 1000)
  }

  return (
    <div style={{ ...styles.screen, background: theme.bgGradient }}>
      {/* Background Dots Overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${theme.bgDotColor} 1px, transparent 1px)`, backgroundSize: '20px 20px', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`, boxShadow: `0 0 12px ${theme.primary}`, zIndex: 5 }}></div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 4, display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px 8px' }}>
        <div
          onClick={() => useGameStore.getState().setScreen('main')}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(8,22,36,0.5)',
            border: `1px solid ${theme.primary}59`,
            cursor: 'pointer',
            color: theme.light,
            fontSize: '16px',
            flexShrink: 0
          }}
        >
          ❮
        </div>
        <div style={{ flex: 1, textAlign: 'center', marginRight: '32px', fontFamily: "'Orbitron', sans-serif", fontSize: '18px', fontWeight: '800', letterSpacing: '2px', color: '#fff', textShadow: `0 0 10px ${theme.glowColor}` }}>FORGE</div>
      </div>

      {/* Resources bar */}
      <div style={{ position: 'relative', zIndex: 4, display: 'flex', gap: 8, padding: '0 16px 8px' }}>
        {/* Anium */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(8,22,36,0.5)', backdropFilter: 'blur(8px)', border: `1px solid ${theme.primary}59`, borderRadius: '20px', padding: '4px 12px 4px 9px' }}>
          <svg width="13" height="15" viewBox="0 0 14 16">
            <polygon points="7,0 14,4 14,12 7,16 0,12 0,4" fill="none" stroke={theme.primary} strokeWidth="1.4"/>
          </svg>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', fontWeight: '700', color: theme.light }}>
            {(player.resources?.anium || 0).toLocaleString()}
          </span>
        </div>
        {/* Credits */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(8,22,36,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(199,204,214,0.4)', borderRadius: '20px', padding: '4px 12px 4px 9px' }}>
          <svg width="12" height="12" viewBox="0 0 13 13">
            <rect x="1.5" y="1.5" width="10" height="10" transform="rotate(45 6.5 6.5)" fill="none" stroke="#c7ccd6" strokeWidth="1.4"/>
          </svg>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', fontWeight: '700', color: '#c7ccd6' }}>
            {(player.resources?.credits || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Sub-tabs Row */}
      <div style={{ position: 'relative', zIndex: 4, display: 'flex', gap: 3, padding: '2px 12px 8px' }}>
        <div onClick={() => setActiveTab('refine')} style={tabStyle('refine')}>SMITH</div>
        <div onClick={() => setActiveTab('enhance')} style={tabStyle('enhance')}>ENHANCE</div>
        <div onClick={() => setActiveTab('legendary')} style={tabStyle('legendary')}>LEGEND</div>
        <div onClick={() => setActiveTab('setshop')} style={tabStyle('setshop')}>SET SHOP</div>
      </div>

      {/* Scrollable Main Content */}
      <div className="fg-scroll" style={{ position: 'relative', zIndex: 3, flex: 1, overflowY: 'auto', padding: '2px 0 6px' }}>


        {/* ───────── WEAPON SMITH TAB ───────── */}
        {activeTab === 'refine' && (() => {
          const hasWeapon = !!equippedWeapon
          const weaponName = hasWeapon ? equippedWeapon.name : 'NO WEAPON EQUIPPED'
          const weaponGrade = hasWeapon ? getWeaponRarityDisplayName(equippedWeapon.rarityGrade || equippedWeapon.rarity).toUpperCase() : 'NONE'
          
          const grade = hasWeapon ? (equippedWeapon.rarityGrade || 'normal').toLowerCase() : 'normal'
          const cost = REFINE_COSTS[grade]
          
          const nextRarity = hasWeapon && cost ? cost.next.toUpperCase() : (hasWeapon ? 'MAX' : 'NONE')
          const nextPercent = hasWeapon && cost ? (cost.next === 'advanced' ? '5%' : cost.next === 'rare' ? '10%' : cost.next === 'epic' ? '15%' : cost.next === 'legendary' ? '20%' : '30%') : '0%'

          const requiredTalicsText = hasWeapon && cost ? `${ownedIgnorance}/${cost.talics}` : `0/0`
          const requiredAniumText = hasWeapon && cost ? `${(cost.anium / 1000).toFixed(0)}K` : '0K'
          const hasTalics = hasWeapon && cost ? (ownedIgnorance >= cost.talics) : false
          const hasAnium = hasWeapon && cost ? (player.resources.anium >= cost.anium) : false
          const canUpgrade = hasWeapon && cost ? (hasTalics && hasAnium) : false

          return (
            <div style={{ padding: '2px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', color: theme.light }}>WEAPON SMITH & REFINE</div>
                
                {/* Refining Section */}
                <div style={{ padding: '16px 14px 14px', borderRadius: '14px', background: 'rgba(6, 9, 14, 0.75)', border: `1.5px solid ${theme.primary}52`, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  
                  {/* Rotating Circle SVG Chamber */}
                  <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 12px' }}>
                    <svg width="220" height="220" style={{ position: 'absolute', top: 0, left: 0, animation: 'runeSpinRev 14s linear infinite' }}>
                      <circle cx="110" cy="110" r="100" fill="none" stroke={`${theme.primary}4d`} strokeWidth="1.5" strokeDasharray="6,4"/>
                    </svg>
                    <div style={{ position: 'absolute', top: 14, left: 14, width: 192, height: 192, borderRadius: '50%', background: `conic-gradient(from 0deg, transparent 0deg, ${theme.primary} 55deg, transparent 130deg, transparent 360deg)`, animation: 'spinFlow 4s linear infinite' }}></div>
                    <div style={{ position: 'absolute', top: 25, left: 25, width: 170, height: 170, borderRadius: '50%', background: '#06090e' }}></div>
                    <svg width="220" height="220" style={{ position: 'absolute', top: 0, left: 0, animation: 'runeSpin 20s linear infinite' }}>
                      <circle cx="110" cy="110" r="85" fill="none" stroke="rgba(199,204,214,0.3)" strokeWidth="1" strokeDasharray="20,6"/>
                    </svg>

                    {/* Indicators */}
                    {/* Top: Next Rarity */}
                    <div style={{ position: 'absolute', top: 0, left: 88, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(245,166,35,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 7, fontWeight: 800, color: '#8a94a3', letterSpacing: '0.3px' }}>NEXT</span>
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, fontWeight: 800, color: '#f5a623' }}>
                        {nextRarity}
                      </span>
                    </div>

                    {/* Right: Required Talics */}
                    <div style={{ position: 'absolute', top: 132, left: 164, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(95,224,138,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5fe08a" strokeWidth="1.8">
                        <path d="M12 2C8 8 5 12 5 15a7 7 0 0 0 14 0c0-3-3-7-7-13z"/>
                      </svg>
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, fontWeight: 800, color: '#5fe08a' }}>
                        {requiredTalicsText}
                      </span>
                    </div>

                    {/* Left: Required Anium */}
                    <div style={{ position: 'absolute', top: 132, left: 12, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(255,95,122,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff8080" strokeWidth="1.8">
                        <polygon points="7,0 14,4 14,12 7,16 0,12 0,4" transform="translate(5,4)"/>
                      </svg>
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 7, fontWeight: 800, color: '#ff8080' }}>
                        {requiredAniumText}
                      </span>
                    </div>

                    {/* Center slot */}
                    <div style={{ position: 'absolute', top: 74, left: 74, width: 72, height: 72, borderRadius: 14, background: `linear-gradient(135deg, ${theme.primary}47, rgba(0,0,0,0.65))`, border: `2.5px solid ${theme.primary}`, boxShadow: `0 0 16px ${theme.primary}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
                      {isRefining ? (
                        theme.weaponSmithSvg
                      ) : hasWeapon ? (
                        equippedWeapon.image ? (
                          <img referrerPolicy="no-referrer" src={equippedWeapon.image} style={{ width: 36, height: 36, objectFit: 'contain' }} alt={equippedWeapon.name} />
                        ) : (
                          <span style={{ fontSize: 32 }}>{equippedWeapon.emoji}</span>
                        )
                      ) : (
                        <span style={{ fontSize: 32, opacity: 0.45 }}>⚔️</span>
                      )}
                    </div>

                    {/* Sparks */}
                    {isRefining && sparks.map(s => (
                      <div
                        key={s.id}
                        className="spark-particle"
                        style={{
                          position: 'absolute',
                          top: 110,
                          left: 110,
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: theme.primary,
                          boxShadow: `0 0 8px ${theme.primary}`,
                          pointerEvents: 'none',
                          transform: `rotate(${s.angle}deg) translate(${s.dist}px) scale(${s.scale})`,
                          transition: 'transform 1s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1s',
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '15px', fontWeight: '800', color: '#fff' }}>{weaponName}</div>
                    <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '12px', color: '#f5a623', marginTop: '2px' }}>
                      Grade: {weaponGrade}
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '14px 0' }}></div>

                  {!hasWeapon ? (
                    <button
                      disabled={true}
                      style={{
                        width: '100%',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '11px 0',
                        textAlign: 'center',
                        background: 'rgba(28,36,56,0.8)',
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '13px',
                        fontWeight: '800',
                        color: '#4a8fa8',
                        letterSpacing: '1px',
                        cursor: 'not-allowed'
                      }}
                    >
                      NO WEAPON EQUIPPED
                    </button>
                  ) : !cost ? (
                    <div style={{ color: '#00ff88', fontFamily: "'Share Tech Mono', monospace", fontSize: '13px', fontWeight: 'bold', textAlign: 'center', padding: '10px 0' }}>
                      MAX RARITY GRADE REACHED
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', fontWeight: '700', color: theme.light, letterSpacing: '0.5px', marginBottom: '12px' }}>
                        NEXT GRADE: {cost.next.toUpperCase()} (+{nextPercent} ATK)
                      </div>
                      <button
                        disabled={!canUpgrade || isRefining}
                        onClick={handleRefine}
                        style={{
                          width: '100%',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '11px 0',
                          textAlign: 'center',
                          background: canUpgrade ? `linear-gradient(135deg, ${theme.primary}, #b32c0d)` : 'rgba(28,36,56,0.8)',
                          boxShadow: canUpgrade ? `0 0 14px ${theme.primary}66` : 'none',
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: '13px',
                          fontWeight: '800',
                          color: canUpgrade ? '#fff' : '#4a8fa8',
                          letterSpacing: '1px',
                          cursor: canUpgrade ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {isRefining ? 'SMITHING...' : canUpgrade ? 'REFINE WEAPON' : 'LACKING MATERIALS'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Combining Section */}
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', color: theme.light, marginTop: 10 }}>CRAFT VAMPIRIC WEAPON</div>
                <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(6,9,14,0.72)', border: `1.5px solid ${theme.primary}4d` }}>
                  <div style={{ fontFamily: "'Saira', sans-serif", fontSize: '13px', color: '#a8b4c4', lineHeight: 1.5, marginBottom: '12px' }}>
                    Sacrifice an Epic+ weapon to imbue your weapon with a lifesteal property.
                  </div>

                  {!hasWeapon ? (
                    <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '13px', textAlign: 'center', lineHeight: 1.4 }}>
                      NO WEAPON EQUIPPED
                    </div>
                  ) : equippedWeapon.specialProperty === 'vampire' ? (
                    <div style={{ background: 'rgba(95,224,138,0.1)', border: '1px solid #5fe08a', color: '#5fe08a', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>
                      VAMPIRIC EFFECT ALREADY ACTIVE
                    </div>
                  ) : !isEpicOrHigher(equippedWeapon) ? (
                    <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '13px', textAlign: 'center', lineHeight: 1.4 }}>
                      WEAPON OF EPIC GRADE OR HIGHER REQUIRED
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                        <label style={{ fontFamily: 'monospace', fontSize: '13px', color: '#88aadd' }}>Select Sacrificial Weapon</label>
                        <select
                          value={selectedSacrificeUid}
                          onChange={(e) => setSelectedSacrificeUid(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0a1628', border: '1px solid #1a3a6a', borderRadius: '8px', color: '#e0f4ff', fontFamily: 'monospace', fontSize: '13px' }}
                        >
                          <option value="">-- Choose Weapon --</option>
                          {sacrificePool.map(it => (
                            <option key={it.uid} value={it.uid}>
                              {it.emoji} {it.name} (Lv.{it.level})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '12px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 11px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${selectedSacrificeUid ? '#5fe08a' : 'rgba(255,255,255,0.08)'}` }}>
                          <span style={{ fontFamily: "'Saira', sans-serif", fontSize: '13px', color: '#cdd5e0' }}>Sacrifice Weapon</span>
                          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '13px', color: selectedSacrificeUid ? '#5fe08a' : '#ff8080', fontWeight: 700 }}>{selectedSacrificeUid ? '1 / 1' : '0 / 1'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 11px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${ownedFavor >= 1 ? '#5fe08a' : 'rgba(255,255,255,0.08)'}` }}>
                          <span style={{ fontFamily: "'Saira', sans-serif", fontSize: '13px', color: '#cdd5e0' }}>Favor Talic</span>
                          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '13px', color: ownedFavor >= 1 ? '#5fe08a' : '#ff8080', fontWeight: 700 }}>{ownedFavor} / 1</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCombine}
                        disabled={!selectedSacrificeUid || ownedFavor < 1}
                        style={{
                          width: '100%',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '11px 0',
                          textAlign: 'center',
                          background: (selectedSacrificeUid && ownedFavor >= 1) ? `linear-gradient(135deg, ${theme.primary}, #b32c0d)` : 'rgba(28,36,56,0.8)',
                          boxShadow: (selectedSacrificeUid && ownedFavor >= 1) ? `0 0 14px ${theme.primary}66` : 'none',
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: '13px',
                          fontWeight: '800',
                          color: (selectedSacrificeUid && ownedFavor >= 1) ? '#fff' : '#4a8fa8',
                          letterSpacing: '1px',
                          cursor: (selectedSacrificeUid && ownedFavor >= 1) ? 'pointer' : 'not-allowed'
                        }}
                      >
                        FORGE VAMPIRIC WEAPON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        {/* ───────── ITEM ENHANCEMENT TAB ───────── */}
        {activeTab === 'enhance' && (() => {
          const hasItem = !!(selectedEnhanceSlot && player.equipment?.[selectedEnhanceSlot])
          const item = hasItem ? player.equipment[selectedEnhanceSlot] : null
          const currentEnh = item ? (item.enhancement || 0) : 0
          const maxed = item ? currentEnh >= 8 : false

          // Costs
          const DIVINE_CREST_COSTS = [20, 40, 60, 80, 100, 120, 150, 200]
          const crestCost = item ? (DIVINE_CREST_COSTS[currentEnh] || 0) : 0
          
          // Owned materials
          const arcaniteOwned = player.inventory.filter(it => it.id === 'mat_arcanite').length
          const crestOwned = player.inventory.filter(it => it.id === 'mat_divine_crest').length
          const relicOwned = player.inventory.filter(it => it.id === 'mat_lucky_relic').length

          // Rates: +1 (100%), +2 (90%), +3 (70%), +4 (50%), +5 (35%), +6 (20%), +7 (10%), +8 (5%)
          const BASE_SUCCESS_RATES = [100, 90, 70, 50, 35, 20, 10, 5]
          const baseRate = item ? (BASE_SUCCESS_RATES[currentEnh] || 0) : 0
          const finalRate = hasItem ? (useLuckyRelic ? Math.min(100, baseRate + 10) : baseRate) : 0

          // Validity checks
          const hasArcanite = arcaniteOwned >= 1
          const hasCrests = crestOwned >= crestCost
          const hasRelic = !useLuckyRelic || relicOwned >= 1
          const canAfford = hasItem && hasArcanite && hasCrests && hasRelic && !maxed

          return (
            <div style={{ padding: '2px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                <label style={{ fontFamily: 'monospace', fontSize: '13px', color: '#88aadd' }}>Select Equipment to Enhance</label>
                <select
                  value={selectedEnhanceSlot}
                  onChange={(e) => {
                    setSelectedEnhanceSlot(e.target.value)
                    setEnhanceResult(null)
                  }}
                  style={{ width: '100%', padding: '10px', background: '#0a1628', border: '1px solid #1a3a6a', borderRadius: '8px', color: '#e0f4ff', fontFamily: 'monospace', fontSize: '13px' }}
                >
                  <option value="">-- Choose Slot --</option>
                  {player.equipment && Object.entries(player.equipment).map(([slot, it]) => {
                    if (!it || ['amulet1', 'amulet2', 'ring1', 'ring2', 'ascension_arms'].includes(slot)) return null
                    return (
                      <option key={slot} value={slot}>
                        {slot.toUpperCase()}: {it.emoji} {it.name} (+{it.enhancement || 0})
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Results display */}
              {enhanceResult && (
                <div style={{
                  padding: 10,
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  background: enhanceResult.status === 'success' ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                  border: `1px solid ${enhanceResult.status === 'success' ? '#00ff88' : '#ff4444'}`,
                  color: enhanceResult.status === 'success' ? '#00ff88' : '#ff4444',
                  marginBottom: 12
                }}>
                  {enhanceResult.status === 'success' && t('enhance_success_msg', { level: enhanceResult.level })}
                  {enhanceResult.status === 'fail' && t('enhance_fail_msg')}
                  {enhanceResult.status === 'destroyed' && t('enhance_destroyed_msg')}
                </div>
              )}

              {/* Layout Chamber Panel */}
              <div style={{ padding: '16px 14px 14px', borderRadius: '14px', background: 'rgba(6,9,14,0.75)', border: `1.5px solid ${theme.primary}52`, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                
                {/* Large SVGs tempering circle */}
                <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto 12px' }}>
                  <svg width="260" height="260" style={{ position: 'absolute', top: 0, left: 0, animation: 'runeSpinRev 14s linear infinite' }}>
                    <circle cx="130" cy="130" r="120" fill="none" stroke={`${theme.primary}4d`} strokeWidth="1.5" strokeDasharray="6,4"/>
                  </svg>
                  <div style={{ position: 'absolute', top: 20, left: 20, width: 220, height: 220, borderRadius: '50%', background: `conic-gradient(from 0deg, transparent 0deg, ${theme.primary} 55deg, transparent 130deg, transparent 360deg)`, animation: 'spinFlow 4s linear infinite' }}></div>
                  <div style={{ position: 'absolute', top: 32, left: 32, width: 196, height: 196, borderRadius: '50%', background: '#06090e' }}></div>
                  <svg width="260" height="260" style={{ position: 'absolute', top: 0, left: 0, animation: 'runeSpin 20s linear infinite' }}>
                    <circle cx="130" cy="130" r="100" fill="none" stroke="rgba(199,204,214,0.3)" strokeWidth="1" strokeDasharray="20,6"/>
                  </svg>

                  {/* Orbit Indicators */}
                  {/* Top: SUCCESS RATE */}
                  <div style={{ position: 'absolute', top: 10, left: 108, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(95,224,138,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, fontWeight: 800, color: '#5fe08a' }}>{finalRate}%</span>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 6, fontWeight: 800, color: '#8a94a3', letterSpacing: '0.3px' }}>RATE</span>
                  </div>

                  {/* Right: CREST SLOTS */}
                  <div style={{ position: 'absolute', top: 78, left: 201, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(255,95,122,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff8080" strokeWidth="1.8">
                      <polygon points="12 2 20 7 20 17 12 22 4 17 4 7"/>
                    </svg>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, fontWeight: 800, color: '#ff8080' }}>{crestOwned}/{crestCost}</span>
                  </div>

                  {/* Right Bottom: ARCANITE CHECK */}
                  <div style={{ position: 'absolute', top: 187, left: 166, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(95,224,138,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5fe08a" strokeWidth="1.8">
                      <path d="M12 2C8 8 5 12 5 15a7 7 0 0 0 14 0c0-3-3-7-7-13z"/>
                    </svg>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, fontWeight: 800, color: '#5fe08a' }}>{arcaniteOwned}/1</span>
                  </div>

                  {/* Left Bottom: LUCKY RELIC */}
                  <div
                    onClick={() => hasItem && !maxed && setUseLuckyRelic(!useLuckyRelic)}
                    style={{ position: 'absolute', top: 187, left: 50, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: `2px solid ${useLuckyRelic ? theme.primary : 'rgba(255,255,255,0.2)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3, cursor: hasItem ? 'pointer' : 'default' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={useLuckyRelic ? theme.primary : '#8a94a3'} strokeWidth="1.8">
                      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 6, fontWeight: 800, color: useLuckyRelic ? theme.light : '#8a94a3', letterSpacing: '0.2px' }}>
                      {useLuckyRelic ? 'RELIC ON' : 'RELIC'}
                    </span>
                  </div>

                  {/* Left: CURRENT LEVEL */}
                  <div style={{ position: 'absolute', top: 78, left: 15, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(199,204,214,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, fontWeight: 900, color: '#c7ccd6' }}>+{currentEnh}</span>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 6, fontWeight: 800, color: '#8a94a3' }}>LEVEL</span>
                  </div>

                  {/* Center equipped slot */}
                  <div style={{ position: 'absolute', top: 90, left: 90, width: 80, height: 80, borderRadius: 14, background: `linear-gradient(135deg, ${theme.primary}47, rgba(0,0,0,0.65))`, border: `2.5px solid ${theme.primary}`, boxShadow: `0 0 16px ${theme.primary}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
                    {isEnhancing ? (
                      theme.weaponSmithSvg
                    ) : hasItem ? (
                      item.image ? (
                        <img referrerPolicy="no-referrer" src={item.image} style={{ width: 36, height: 36, objectFit: 'contain' }} alt={item.name} />
                      ) : (
                        <span style={{ fontSize: 36 }}>{item.emoji}</span>
                      )
                    ) : (
                      <span style={{ fontSize: 36, opacity: 0.45 }}>🛡️</span>
                    )}
                  </div>

                  {/* Sparks */}
                  {isEnhancing && sparks.map(s => (
                    <div
                      key={s.id}
                      className="spark-particle"
                      style={{
                        position: 'absolute',
                        top: 130,
                        left: 130,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: theme.primary,
                        boxShadow: `0 0 8px ${theme.primary}`,
                        pointerEvents: 'none',
                        transform: `rotate(${s.angle}deg) translate(${s.dist}px) scale(${s.scale})`,
                        transition: 'transform 1s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1s',
                      }}
                    />
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '15px', fontWeight: '800', color: '#fff' }}>
                    {hasItem ? `${item.name} +${currentEnh} ➜ +${currentEnh + 1}` : 'NO ITEM SELECTED'}
                  </div>
                </div>

                {!hasItem ? (
                  <button
                    disabled={true}
                    style={{
                      width: '100%',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '11px 0',
                      textAlign: 'center',
                      background: 'rgba(28,36,56,0.8)',
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '13px',
                      fontWeight: '800',
                      color: '#4a8fa8',
                      letterSpacing: '1px',
                      cursor: 'not-allowed'
                    }}
                  >
                    SELECT AN ITEM FIRST
                  </button>
                ) : maxed ? (
                  <div style={{ color: '#00ff88', fontFamily: "'Share Tech Mono', monospace", fontSize: '13px', fontWeight: 'bold', textAlign: 'center', padding: '10px 0' }}>
                    ⭐ MAXIMUM ENHANCEMENT LEVEL (+8) REACHED!
                  </div>
                ) : (
                  <div>
                    {/* Stat Preview Panel */}
                    <div style={{ padding: '10px 12px', borderRadius: '8px', background: `${theme.primary}12`, border: `1px solid ${theme.primary}47`, margin: '14px 0 12px' }}>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', fontWeight: '800', color: theme.light, letterSpacing: '0.5px', marginBottom: '6px' }}>STATS PREVIEW (+{currentEnh} ➜ +{currentEnh + 1})</div>
                      {item.type === 'weapon' ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '13px', color: '#cdd5e0' }}>
                          <span>ATK Bonus:</span>
                          <span>{Math.floor((item.bonus?.atk || 0) * (1 + currentEnh * 0.1))} ➜ <b style={{ color: '#5fe08a' }}>{Math.floor((item.bonus?.atk || 0) * (1 + (currentEnh + 1) * 0.1))}</b></span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '13px', color: '#cdd5e0' }}>
                            <span>DEF Bonus:</span>
                            <span>{Math.floor((item.bonus?.def || 0) * (1 + currentEnh * 0.1))} ➜ <b style={{ color: '#5fe08a' }}>{Math.floor((item.bonus?.def || 0) * (1 + (currentEnh + 1) * 0.1))}</b></span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '13px', color: '#cdd5e0' }}>
                            <span>HP Bonus:</span>
                            <span>{Math.floor((item.bonus?.hp || 0) * (1 + currentEnh * 0.1))} ➜ <b style={{ color: '#5fe08a' }}>{Math.floor((item.bonus?.hp || 0) * (1 + (currentEnh + 1) * 0.1))}</b></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Destruction warning alert */}
                    {currentEnh >= 5 && (
                      <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,68,68,0.12)', border: '1.5px dashed #ff4444', fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', color: '#ff8080', textAlign: 'center', lineHeight: 1.4, marginBottom: '12px' }}>
                        ⚠ +5 AND ABOVE RISKS ITEM DESTRUCTION ON FAILURE
                      </div>
                    )}

                    {/* Checkbox Lucky Relic in form */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <input
                        type="checkbox"
                        id="useLuckyRelicChk"
                        checked={useLuckyRelic}
                        onChange={(e) => setUseLuckyRelic(e.target.checked)}
                        style={{ cursor: 'pointer', width: 15, height: 15 }}
                      />
                      <label htmlFor="useLuckyRelicChk" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#fff', cursor: 'pointer', userSelect: 'none' }}>
                        Gunakan Lucky Relic (+10% Success Rate)
                      </label>
                    </div>

                    <button
                      onClick={handleEnhance}
                      disabled={!canAfford || isEnhancing}
                      style={{
                        width: '100%',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '11px 0',
                        textAlign: 'center',
                        background: canAfford ? `linear-gradient(135deg, ${theme.primary}, #b32c0d)` : 'rgba(28,36,56,0.8)',
                        boxShadow: canAfford ? `0 0 14px ${theme.primary}66` : 'none',
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '13px',
                        fontWeight: '800',
                        color: canAfford ? '#fff' : '#4a8fa8',
                        letterSpacing: '1px',
                        cursor: canAfford ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {isEnhancing ? 'ENHANCING...' : 'ENHANCE ITEM'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {activeTab === 'legendary' && (() => {
          const SHARD_TYPES = [
            { id: 'shard_ignis_epic',  label: 'Ignis',  emoji: '🔴' },
            { id: 'shard_virel_epic',  label: 'Virel',  emoji: '🔵' },
            { id: 'shard_kryos_epic',  label: 'Kryos',  emoji: '🟢' },
            { id: 'shard_zephra_epic', label: 'Zephra', emoji: '🟡' },
            { id: 'shard_umbrix_epic', label: 'Umbrix', emoji: '⚫' },
          ]
          const inv = player.inventory
          const countOf = (id) => inv.filter(i => i.id === id).length

          const RECIPES = [
            { id: 'leg_weapon', label: 'Legendary Weapon',  emoji: '⚔️',  baseId: 'mat_epic_weapon',  baseLabel: 'Epic Weapon',  shards: 6 },
            { id: 'leg_armor',  label: 'Legendary Armor',   emoji: '🦾',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
            { id: 'leg_helmet', label: 'Legendary Helmet',  emoji: '⛑️',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
            { id: 'leg_mantle', label: 'Legendary Mantle',  emoji: '🥋',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
            { id: 'leg_gloves', label: 'Legendary Gloves',  emoji: '🧤',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
            { id: 'leg_boots',  label: 'Legendary Boots',   emoji: '👢',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
            { id: 'leg_shield', label: 'Legendary Shield',  emoji: '🛡️',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
            { id: 'leg_ring',   label: 'Legendary Ring',    emoji: '💍',  baseId: 'mat_epic_ring',    baseLabel: 'Epic Ring',    shards: 5 },
            { id: 'leg_amulet', label: 'Legendary Amulet',  emoji: '📿',  baseId: 'mat_epic_amulet',  baseLabel: 'Epic Amulet',  shards: 5 },
            { id: 'leg_cape',   label: 'Legendary Cape',    emoji: '🦸',  baseId: 'mat_epic_cape',    baseLabel: 'Epic Cape',    shards: 5 },
          ]

          const LEGEND_STATS = {
            leg_weapon: 'ATK+200 | HP+2000 | Crit+5%',
            leg_armor:  'DEF+120 | HP+2500 (per piece)',
            leg_helmet: 'DEF+120 | HP+2500 (per piece)',
            leg_mantle: 'DEF+120 | HP+2500 (per piece)',
            leg_gloves: 'DEF+120 | HP+2500 (per piece)',
            leg_boots:  'DEF+120 | HP+2500 (per piece)',
            leg_shield: 'DEF+120 | HP+2500',
            leg_ring:   'ATK+100 | HP+1500 | Crit+3% (per piece)',
            leg_amulet: 'DEF+100 | HP+2000 (per piece)',
            leg_cape:   'ATK+80 | DEF+80 | HP+2000 | Crit+2%',
          }

          return (
            <div style={{ padding: '0 16px 80px' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: '#f5a623', letterSpacing: 1, marginBottom: 14, textAlign: 'center', borderBottom: '1px solid rgba(245,166,35,0.3)', paddingBottom: 8 }}>
                ⚔️ LEGENDARY FORGE — Craft equipment of legendary power
              </div>
              {RECIPES.map(recipe => {
                const baseOwned = countOf(recipe.baseId)
                const shardCounts = SHARD_TYPES.map(s => ({ ...s, owned: countOf(s.id), need: recipe.shards }))
                const canCraft = baseOwned >= 1 && shardCounts.every(s => s.owned >= s.need)
                return (
                  <div key={recipe.id} style={{ marginBottom: 14, background: 'rgba(3,8,20,0.6)', border: `1.5px solid ${canCraft ? '#f5a623' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: 14 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ fontSize: 28 }}>{recipe.emoji}</div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 800, color: '#f5a623' }}>{recipe.label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#88aadd', marginTop: 2 }}>{LEGEND_STATS[recipe.id]}</div>
                      </div>
                    </div>
                    {/* Ingredients */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                      {/* Base material */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: `1px solid ${baseOwned >= 1 ? 'rgba(95,224,138,0.4)' : 'rgba(255,95,122,0.3)'}`, fontSize: 12, color: baseOwned >= 1 ? '#5fe08a' : '#ff6a4d', fontWeight: 700 }}>
                        📦 {recipe.baseLabel} ×1 ({baseOwned}/1)
                      </div>
                      {/* Shards */}
                      {shardCounts.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: `1px solid ${s.owned >= s.need ? 'rgba(95,224,138,0.4)' : 'rgba(255,95,122,0.3)'}`, fontSize: 12, color: s.owned >= s.need ? '#5fe08a' : '#ff6a4d', fontWeight: 700 }}>
                          {s.emoji} {s.label} ×{s.need} ({s.owned}/{s.need})
                        </div>
                      ))}
                    </div>
                    {/* Craft Button */}
                    <button
                      onClick={() => {
                        const result = craftLegendary(recipe.id)
                        if (result?.ok) alert(`✨ ${recipe.label} berhasil dibuat!`)
                        else alert(`❌ ${result?.msg || 'Gagal craft'}`)
                      }}
                      disabled={!canCraft}
                      style={{ width: '100%', border: 'none', borderRadius: 8, padding: '10px 0', fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 800, cursor: canCraft ? 'pointer' : 'not-allowed', background: canCraft ? 'linear-gradient(135deg,#f5a623,#ff6b35)' : 'rgba(28,36,56,0.8)', color: canCraft ? '#1a0f00' : '#4a8fa8', letterSpacing: 1, boxShadow: canCraft ? '0 0 12px rgba(245,166,35,0.4)' : 'none', transition: 'all 0.2s' }}
                    >
                      {canCraft ? `⚡ CRAFT ${recipe.label.toUpperCase()}` : '🔒 MATERIALS MISSING'}
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* ───────── SET SHOP TAB ───────── */}
        {activeTab === 'setshop' && (() => {
          const credits = player.resources.credits
          const inv = player.inventory
          const countInInvOrEquip = (setId) => {
            const eq = player.equipment || {}
            const inInv = inv.filter(i => i.setId === setId).length
            const inEq = Object.values(eq).filter(i => i && i.setId === setId).length
            return inInv + inEq
          }

          const SETS = [
            {
              setId: 'eminence',
              name: 'Eminence Set',
              emoji: '👑',
              color: '#f5a623',
              total: 7,
              fullBonus: 'ATK+100 | DEF+100 | HP+2000 | Crit+2%',
              pieces: [
                { id: 'emi_helmet', name: 'Helmet', price: 100000000 },
                { id: 'emi_armor',  name: 'Armor',  price: 100000000 },
                { id: 'emi_pants',  name: 'Pants',  price: 100000000 },
                { id: 'emi_gloves', name: 'Gloves', price: 100000000 },
                { id: 'emi_boots',  name: 'Boots',  price: 100000000 },
                { id: 'emi_ring',   name: 'Ring',   price: 100000000 },
                { id: 'emi_amulet', name: 'Amulet', price: 100000000 },
              ]
            },
            {
              setId: 'council_atk',
              name: 'Attack Council Set',
              emoji: '⚔️',
              color: '#ff4444',
              total: 6,
              fullBonus: 'ATK+100 | DEF+50 | HP+1200',
              pieces: [
                { id: 'council_atk_helmet', name: 'Helmet', price: 50000000 },
                { id: 'council_atk_armor',  name: 'Armor',  price: 50000000 },
                { id: 'council_atk_gloves', name: 'Gloves', price: 50000000 },
                { id: 'council_atk_pants',  name: 'Pants',  price: 50000000 },
                { id: 'council_atk_boots',  name: 'Boots',  price: 50000000 },
                { id: 'council_atk_cape',   name: 'Cape',   price: 50000000 },
              ]
            },
            {
              setId: 'council_def',
              name: 'Defense Council Set',
              emoji: '🛡️',
              color: '#00aaff',
              total: 6,
              fullBonus: 'ATK+50 | DEF+100 | HP+1200',
              pieces: [
                { id: 'council_def_helmet', name: 'Helmet', price: 50000000 },
                { id: 'council_def_armor',  name: 'Armor',  price: 50000000 },
                { id: 'council_def_gloves', name: 'Gloves', price: 50000000 },
                { id: 'council_def_pants',  name: 'Pants',  price: 50000000 },
                { id: 'council_def_boots',  name: 'Boots',  price: 50000000 },
                { id: 'council_def_cape',   name: 'Cape',   price: 50000000 },
              ]
            },
            {
              setId: 'council_sup',
              name: 'Support Council Set',
              emoji: '🤝',
              color: '#00ffaa',
              total: 6,
              fullBonus: 'ATK+70 | DEF+70 | HP+1200',
              pieces: [
                { id: 'council_sup_helmet', name: 'Helmet', price: 50000000 },
                { id: 'council_sup_armor',  name: 'Armor',  price: 50000000 },
                { id: 'council_sup_gloves', name: 'Gloves', price: 50000000 },
                { id: 'council_sup_pants',  name: 'Pants',  price: 50000000 },
                { id: 'council_sup_boots',  name: 'Boots',  price: 50000000 },
                { id: 'council_sup_cape',   name: 'Cape',   price: 50000000 },
              ]
            },
          ]

          return (
            <div style={{ padding: '0 16px 80px' }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#cc44ff', letterSpacing: 1, marginBottom: 16, textAlign: 'center', borderBottom: '1px solid rgba(204,68,255,0.3)', paddingBottom: 8 }}>
                👑 SET SHOP — Per piece: ATK+20-30 | DEF+20-30 | HP+300-500
              </div>
              {SETS.map(set => {
                const owned = countInInvOrEquip(set.setId)
                const isComplete = owned >= set.total
                return (
                  <div key={set.setId} style={{ marginBottom: 18, background: 'rgba(3,8,20,0.6)', border: `1px solid ${isComplete ? set.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, overflow: 'hidden', boxShadow: isComplete ? `0 0 16px ${set.color}33` : 'none' }}>
                    {/* Set Header */}
                    <div style={{ background: `linear-gradient(135deg, ${set.color}22, rgba(3,8,20,0.95))`, padding: '12px 14px', borderBottom: `1px solid ${set.color}33` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 22 }}>{set.emoji}</span>
                          <div>
                            <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, color: set.color }}>{set.name}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#88aadd', marginTop: 2 }}>Full Set ({set.total}/{set.total}): {set.fullBonus}</div>
                          </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: isComplete ? set.color : '#7ab0d0', fontWeight: 800 }}>
                          {owned}/{set.total} {isComplete ? '✓' : ''}
                        </div>
                      </div>
                    </div>
                    {/* Pieces */}
                    <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {set.pieces.map(piece => {
                        const inInv = inv.filter(i => i.id === piece.id).length
                        const inEq = Object.values(player.equipment || {}).some(e => e && e.id === piece.id)
                        const alreadyOwned = inInv > 0 || inEq
                        const canAfford = credits >= piece.price
                        return (
                          <div key={piece.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: 8, border: `1px solid ${alreadyOwned ? set.color + '44' : 'rgba(255,255,255,0.05)'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 16 }}>{set.emoji}</span>
                              <div>
                                <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 700, color: alreadyOwned ? set.color : '#e0f4ff' }}>{piece.name} {alreadyOwned ? '✓' : ''}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: canAfford && !alreadyOwned ? '#00ff88' : '#7ab0d0' }}>◈ {(piece.price / 1000000).toFixed(0)}M CRD</div>
                              </div>
                            </div>
                            <button
                              disabled={alreadyOwned || !canAfford}
                              onClick={() => {
                                const result = buySetItem(piece.id)
                                if (result?.ok) alert(`✅ ${piece.name} berhasil dibeli!`)
                                else alert(`❌ ${result?.msg}`)
                              }}
                              style={{ border: 'none', borderRadius: 6, padding: '6px 12px', fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 800, cursor: alreadyOwned || !canAfford ? 'not-allowed' : 'pointer', background: alreadyOwned ? 'rgba(57,255,20,0.15)' : canAfford ? set.color : 'rgba(28,36,56,0.8)', color: alreadyOwned ? '#39ff14' : canAfford ? '#000' : '#4a8fa8', whiteSpace: 'nowrap' }}
                            >
                              {alreadyOwned ? 'OWNED' : canAfford ? 'BELI' : 'CRD ❌'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>
    </div>
  )
}


const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%', fontFamily: 'var(--font-body)' },
  resBar: { display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)' },
  chip: (c) => ({ background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 20, padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: c }),
  tabs: { display: 'flex', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', background: 'rgba(3, 8, 20, 0.4)', marginBottom: 12, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' },
  tab: { flex: '0 0 auto', minWidth: 120, padding: '12px 10px', textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 0.5, color: '#7ec8e3', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' },
  tabActive: { flex: '0 0 auto', minWidth: 120, padding: '12px 10px', textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 0.5, color: '#f5a623', borderBottom: '2px solid #f5a623', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' },
  card: { margin: '0 0 12px 0', padding: 14 },
  cardTitle: { fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, marginBottom: 8, letterSpacing: 1 },
  statRow: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#c0dff0', marginBottom: 10, fontWeight: 700 },
  upgradeBtn: (color, active) => ({
    width: '100%', border: 'none', borderRadius: 8, padding: 10,
    fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, cursor: active ? 'pointer' : 'not-allowed',
    background: active ? color : '#1c2438',
    color: active ? '#000' : '#4a8fa8',
    boxShadow: active ? `0 0 10px ${color}33` : 'none',
    transition: 'all 0.2s',
    letterSpacing: 1
  }),
  infoBox: (c) => ({
    fontSize: 13,
    color: c,
    padding: '8px 10px',
    borderRadius: 8,
    background: `${c}0d`,
    border: `1px solid ${c}33`,
    lineHeight: 1.5,
    marginBottom: 12
  }),
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#7ab0d0', fontFamily: 'var(--font-body)', fontSize: 13, textAlign: 'center', gap: 10 },
  introHeader: { fontFamily: 'var(--font-title)', fontSize: 14, color: '#f5a623', letterSpacing: 1, marginBottom: 12, borderBottom: '1px solid rgba(0,229,255,0.15)', paddingBottom: 8 },
  forgeCard: { margin: '0 0 12px 0', padding: 14 },
  forgeHeader: { display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 },
  forgeItemName: { fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 800, color: '#fff' },
  forgeItemSlot: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ec8e3', marginTop: 2, fontWeight: 700 },
  ingredients: { marginTop: 10 },
  ingredientLabel: { fontFamily: 'var(--font-title)', fontSize: 13, color: '#7ab0d0', fontWeight: 800, marginBottom: 6 },
  ingredientsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  ingredientRow: (satisfied) => ({ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'rgba(0,0,0,0.2)', border: `1px solid ${satisfied ? 'rgba(57,255,20,0.2)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 6, fontSize: 13, color: satisfied ? '#00ff88' : '#7ab0d0', fontWeight: 600 }),
  forgeBtn: (active) => ({
    width: '100%', border: 'none', borderRadius: 8, padding: 12,
    fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, cursor: active ? 'pointer' : 'not-allowed',
    background: active ? '#ff8c00' : '#1c2438',
    color: active ? '#fff' : '#4a8fa8',
    marginTop: 10,
    letterSpacing: 1
  }),
  refinePanel: { padding: 14, marginBottom: 12 },
  sectionTitle: { fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', letterSpacing: 1, marginBottom: 12, fontWeight: 800 },
  refineDetails: { display: 'flex', flexDirection: 'column', gap: 10 },
  wepName: { fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 800, color: '#fff' },
  wepRarity: { fontFamily: 'monospace', fontSize: 13, marginTop: 2 },
  maxGradeMsg: { color: '#00ff88', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', textAlign: 'center', padding: '10px 0' },
  refineNextGrade: { fontFamily: 'monospace', fontSize: 13, color: '#e0f4ff', margin: '6px 0' },
  refineCosts: { display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0, 0, 0, 0.2)', padding: 8, borderRadius: 6, margin: '6px 0' },
  costItem: (satisfied) => ({ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 13, color: satisfied ? '#00ff88' : '#ff4444', fontWeight: 700 }),
  smithBtn: (active) => ({
    width: '100%', border: 'none', borderRadius: 8, padding: 12,
    fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, cursor: active ? 'pointer' : 'not-allowed',
    background: active ? '#00e5ff' : '#1a2a3a',
    color: active ? '#000' : '#7ab0d0',
    marginTop: 8,
    letterSpacing: 1
  }),
  combinePanel: { padding: 14 },
  vampireActive: { background: 'rgba(255, 51, 102, 0.1)', border: '1px solid #ff3366', color: '#ff3366', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  warningBox: { background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 13, textAlign: 'center', lineHeight: 1.4 },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 },
  label: { fontFamily: 'monospace', fontSize: 13, color: '#88aadd' },
  select: { width: '100%', padding: 10, background: '#0a1628', border: '1px solid #1a3a6a', borderRadius: 8, color: '#e0f4ff', fontFamily: 'monospace', fontSize: 13 },
  
  // Recipe Tree Specific Styles
  recipeTreeWrapper: { display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 10px', background: 'rgba(0, 0, 0, 0.2)', padding: 10, borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.05)' },
  recipeInputs: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  ingredientBadge: (satisfied) => ({ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6, background: 'rgba(3, 8, 20, 0.6)', border: `1.5px solid ${satisfied ? '#39ff14' : 'rgba(0, 229, 255, 0.15)'}`, fontSize: 13, color: satisfied ? '#00ff88' : '#7ab0d0', fontWeight: 600, boxShadow: satisfied ? '0 0 6px rgba(57,255,20,0.1)' : 'none' }),
  recipeConnectors: { width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  recipeOutput: { width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  outputSlot: (canCraft) => ({ width: 64, height: 64, borderRadius: 10, border: `2px solid ${canCraft ? '#f5a623' : 'rgba(255,255,255,0.08)'}`, background: 'rgba(3, 8, 20, 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, boxShadow: canCraft ? '0 0 10px rgba(245,166,35,0.3)' : 'none' }),

  // Tempering Chamber Specific Styles
  temperingChamber: { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0 16px', background: 'rgba(0, 0, 0, 0.35)', padding: 16, borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative', overflow: 'hidden' },
  chamberRing: (isRefining) => ({ width: 110, height: 110, borderRadius: '50%', background: 'rgba(3, 8, 20, 0.6)', border: '1.5px solid rgba(0, 229, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', animation: isRefining ? 'heartbeatPulse 0.5s infinite ease-in-out' : 'none', boxShadow: '0 0 12px rgba(0, 229, 255, 0.05)' }),
  chamberSvg: (isRefining) => ({ position: 'absolute', top: 0, left: 0, transform: 'rotate(0deg)', animation: isRefining ? 'rotateClockwise 1.5s infinite linear' : 'none' }),
  chamberSlot: { zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
