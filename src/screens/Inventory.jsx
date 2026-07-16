import React, { useState } from 'react'
import { useGameStore, resolveItemImage } from '../store/gameStore'
import { t } from '../lib/translate'

const BAG_ICONS = {
  arctron: "/assets/arctron_bag_icon_rembg.png",
  bionex: "/assets/bionex_bag_icon_rembg.png",
  celestra: "/assets/celestra_bag_icon_rembg.png",
}

export default function Inventory() {
  const [activeTooltip, setActiveTooltip] = useState(null)
  const [equipOpen, setEquipOpen] = useState(true)
  const [activeBag, setActiveBag] = useState(null)
  const [selectedBagItem, setSelectedBagItem] = useState(null)
  // NEW: which empty slot was clicked for smart-equip picker
  const [pickingSlot, setPickingSlot] = useState(null)

  const player = useGameStore((s) => s.player)
  const equipItem = useGameStore((s) => s.equipItem)
  const unequipItem = useGameStore((s) => s.unequipItem)
  const useItem = useGameStore((s) => s.useItem)
  
  if (!player) return null;

  const screenBg = {
    arctron: 'radial-gradient(circle at 30% 0%, #201f22 0%, #0a0a0c 60%)',
    bionex: 'radial-gradient(circle at 30% 0%, #13243a 0%, #060b12 60%)',
    celestra: 'radial-gradient(circle at 30% 0%, #1a1642 0%, #07061a 60%)'
  }[player?.race] || '#08080d'

  return (
    <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: "'Saira', sans-serif", background: screenBg, minHeight: '100vh', paddingBottom: 64 }} onClick={() => { setActiveTooltip(null); setSelectedBagItem(null); setPickingSlot(null); }}>
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)', flexShrink: 0 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2, textShadow: '0 0 10px #00e5ff' }}>GEAR &amp; INVENTORY</span>
        </div>
      </div>
      <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column' }}>
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

            // Slot type → normalized equip key mapping
            const slotTypeMap = {
              weapon: 'weapon', armor: 'armor', shield: 'shield',
              helmet: 'helmet', mantle: 'mantle', gloves: 'gloves',
              boots: 'boots', pants: 'pants',
              amulet: 'amulet', ring: 'ring', ascension_arms: 'ascension_arms'
            }

             // Get compatible items from inventory for a given slot key
             const getCompatibleItems = (slotKey) => {
               if (!player.inventory) return []
               const typeTarget = slotKey.replace(/[12]$/, '').replace(/_(l|r)$/, '') // amulet1→amulet, boots_l→boots
               return player.inventory.filter(item => {
                 if (item.type !== typeTarget) return false
                 
                 // Race validation (array-aware)
                 let raceOk = true
                 if (item.race) {
                   const allowedRaces = Array.isArray(item.race) ? item.race : [item.race]
                   raceOk = allowedRaces.includes('All') || allowedRaces.includes(player.race)
                 }

                 // Level validation
                 const levelOk = !item.level || item.level <= player.level

                 // Job validation (array-aware)
                 let jobOk = true
                 if (item.job) {
                   const allowedJobs = Array.isArray(item.job) ? item.job : [item.job]
                   jobOk = allowedJobs.includes(player.job)
                 }

                 return raceOk && levelOk && jobOk
               })
             }

            const TOP_ROW_SLOTS = new Set(['helmet', 'amulet1', 'amulet2', 'ascension_arms'])

            const renderEquipSlot = (slotKey, label, svgIcon, isCircle = false, width = '100%', height = 'auto', aspectRatio = '1 / 1') => {
              const item = player.equipment && player.equipment[slotKey];
              const isEmpty = !item;
              const showTooltip = activeTooltip === slotKey;
              const isPicking = pickingSlot === slotKey;

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
                      background: isPicking ? `${fp}22` : 'rgba(5, 10, 20, 0.85)',
                      border: isPicking ? `2px solid ${fp}` : '2px solid rgba(55, 65, 80, 0.85)',
                      boxShadow: isPicking ? `0 0 12px ${fp}66, inset 0 0 8px ${fp}22` : 'inset 0 0 6px rgba(0,0,0,0.85)',
                      color: isPicking ? fp : 'rgba(138, 148, 163, 0.25)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      const compatible = getCompatibleItems(slotKey)
                      if (compatible.length > 0) {
                        setPickingSlot(isPicking ? null : slotKey)
                        setActiveBag(null)
                      }
                    }}
                  >
                    <div style={{ opacity: isPicking ? 0.7 : 0.16, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                      {svgIcon}
                    </div>
                    {/* Pulse indicator if compatible items exist */}
                    {getCompatibleItems(slotKey).length > 0 && !isPicking && (
                      <div style={{
                        position: 'absolute', bottom: 2, right: 2,
                        width: 6, height: 6, borderRadius: '50%',
                        background: fp, boxShadow: `0 0 4px ${fp}`,
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }} />
                    )}
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
                    setPickingSlot(null)
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
                  {(() => {
                    let imgUrl = resolveItemImage(item, player.race, player.job)
                    if (imgUrl && player.race === 'arctron' && ['boots_l', 'boots_r', 'gloves_l', 'gloves_r'].includes(slotKey)) {
                      const suffix = slotKey.endsWith('_l') ? '_l' : '_r'
                      const base = imgUrl.split('?')[0]
                      const search = imgUrl.split('?')[1] || ''
                      const newBase = base.replace(/\.png$/i, `${suffix}.png`)
                      imgUrl = search ? `${newBase}?${search}` : newBase
                    }
                    return imgUrl ? (
                      <img
                        referrerPolicy="no-referrer"
                        src={imgUrl}
                        style={{
                          width: '92%',
                          height: '92%',
                          objectFit: 'contain',
                          borderRadius: 2,
                          imageRendering: 'auto',
                          transform: slotKey === 'weapon' ? 'scale(1.25)' : 'none',
                          transition: 'transform 0.2s ease',
                        }}
                        alt={item.name}
                      />
                    ) : item.emoji ? (
                      <span style={{ fontSize: '2rem' }}>{item.emoji}</span>
                    ) : (
                      svgIcon
                    )
                  })()}
                  {(item.enhancement > 0 || item.enhancement_level > 0) && (
                    <span style={{ position: 'absolute', top: 2, right: 3, fontSize: 8, fontWeight: 900, color: '#00ffaa', fontFamily: 'var(--font-mono)' }}>
                      +{item.enhancement || item.enhancement_level}
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
                        ...(TOP_ROW_SLOTS.has(slotKey)
                          ? { top: '110%' }
                          : { bottom: '110%' }),
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
                        {(() => {
                          const arcMap = { mat_arcanite_fury: 'Fury', mat_arcanite_ruin: 'Ruin', mat_arcanite_spirit: 'Spirit', mat_arcanite_vital: 'Vital', mat_arcanite_guard: 'Guard', mat_arcanite_precision: 'Precision', mat_arcanite_agility: 'Agility', mat_arcanite_focus: 'Focus' }
                          const arcLabel = item.arcanite_type ? `[${arcMap[item.arcanite_type] || 'Arcanite'}] ` : ''
                          const enh = item.enhancement || item.enhancement_level || 0
                          const enhLabel = enh > 0 ? `+${enh} ` : ''
                          return `${enhLabel}${arcLabel}${item.name.toUpperCase()}`
                        })()}
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
                  <span style={{ fontSize: 9 }}>{equipOpen ? '▼' : '▶'}</span> EQUIPMENT &amp; INVENTORY
                </div>
                
                {equipOpen && (
                  <>
                    {/* ── Equipment Grid ─────────────────────────────── */}
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
                        <div style={{ display: 'flex', gap: 3, width: '100%' }}>
                          {renderEquipSlot('gloves_l', 'GLV_L', glovesSvg, false, 'calc(50% - 1.5px)', 'auto', '1 / 1')}
                          {renderEquipSlot('gloves_r', 'GLV_R', glovesSvg, false, 'calc(50% - 1.5px)', 'auto', '1 / 1')}
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
                        <div style={{ display: 'flex', gap: 3, width: '100%' }}>
                          {renderEquipSlot('boots_l', 'BTS_L', bootsSvg, false, 'calc(50% - 1.5px)', 'auto', '1 / 1')}
                          {renderEquipSlot('boots_r', 'BTS_R', bootsSvg, false, 'calc(50% - 1.5px)', 'auto', '1 / 1')}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 3, alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 3, width: '100%', marginBottom: 'calc(50% + 3px)' }}>
                          {renderEquipSlot('ascension_arms', 'ARES', aresSvg, false, 'calc(50% - 1.5px)', 'auto', '1 / 1')}
                          {/* Decorative lock slot */}
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

                    {/* ── Smart Equip Picker ─────────────────────────── */}
                    {pickingSlot && (() => {
                      const compatible = getCompatibleItems(pickingSlot)
                      const slotLabel = pickingSlot.replace(/[12]$/, '').toUpperCase()
                      return (
                        <div
                          style={{
                            margin: '0 auto 10px',
                            width: 'calc(100% - 32px)',
                            background: 'rgba(6, 9, 16, 0.98)',
                            border: `2px solid ${fp}80`,
                            borderRadius: 8,
                            boxShadow: `0 0 24px ${fp}33, 0 8px 20px rgba(0,0,0,0.7)`,
                            overflow: 'hidden',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Header */}
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '8px 12px', borderBottom: `1px solid ${fp}40`,
                            background: `linear-gradient(90deg, ${fp}18, transparent)`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fontWeight: 800, color: fp, letterSpacing: 1 }}>
                                SELECT {slotLabel}
                              </span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#8a94a3' }}>
                                {compatible.length} available
                              </span>
                            </div>
                            <button
                              onClick={() => setPickingSlot(null)}
                              style={{ background: 'transparent', border: 'none', color: '#8a94a3', cursor: 'pointer', fontSize: 14, fontWeight: 'bold', padding: '0 4px' }}
                            >✕</button>
                          </div>
                          {/* Item Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: 8 }}>
                            {compatible.map(item => {
                              const bc = {
                                common: 'rgba(100,110,125,0.9)',
                                uncommon: 'rgba(50,180,100,0.9)',
                                rare: 'rgba(50,120,240,0.9)',
                                epic: 'rgba(160,50,240,0.9)',
                                legendary: 'rgba(240,150,30,0.9)',
                                D: 'rgba(100,110,125,0.9)',
                                C: 'rgba(50,180,100,0.9)',
                                B: 'rgba(50,120,240,0.9)',
                                A: 'rgba(160,50,240,0.9)',
                                S: 'rgba(240,150,30,0.9)',
                              }[item.rarity] || 'rgba(100,110,125,0.9)'
                              return (
                                <div
                                  key={item.uid}
                                  title={`${item.name} (Lv.${item.level || 1})`}
                                  onClick={() => {
                                    equipItem(item.uid)
                                    setPickingSlot(null)
                                  }}
                                  style={{
                                    aspectRatio: '1 / 1',
                                    borderRadius: 5,
                                    background: 'rgba(12, 18, 30, 0.95)',
                                    border: `1.5px solid ${bc}`,
                                    boxShadow: `0 0 6px ${bc}55`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    position: 'relative', cursor: 'pointer',
                                    transition: 'transform 0.15s, box-shadow 0.15s',
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = `0 0 12px ${bc}` }}
                                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = `0 0 6px ${bc}55` }}
                                >
                                  {resolveItemImage(item, player.race, player.job) ? (
                                    <img src={resolveItemImage(item, player.race, player.job)} style={{ width: '84%', height: '84%', objectFit: 'contain', imageRendering: 'auto' }} alt={item.name} />
                                  ) : item.emoji ? (
                                    <span style={{ fontSize: 20 }}>{item.emoji}</span>
                                  ) : (
                                    <div style={{ color: bc, opacity: 0.6 }}>{typeSvgs[item.type] || defaultItemSvg}</div>
                                  )}
                                  {item.level && (
                                    <span style={{ position: 'absolute', top: 1, left: 2, fontFamily: "'Share Tech Mono', monospace", fontSize: 7, fontWeight: 800, color: '#fff', background: 'rgba(0,0,0,0.7)', padding: '0 2px', borderRadius: 2 }}>
                                      {item.level}LV
                                    </span>
                                  )}
                                  {(item.enhancement > 0 || item.enhancement_level > 0) && (
                                    <span style={{ position: 'absolute', top: 2, right: 3, fontSize: 8, fontWeight: 900, color: '#00ffaa', fontFamily: 'var(--font-mono)' }}>
                                      +{item.enhancement || item.enhancement_level}
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}

                    {/* ── Bag Tabs ───────────────────────────────────── */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: 6,
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                      width: 'calc(100% - 32px)',
                    }}>
                      {(() => {
                        const totalBags = Math.max(5, Math.ceil((player.inventorySlots || 100) / 25))
                        const bagList = Array.from({ length: totalBags }, (_, i) => i + 1)
                        return bagList.map((bagNum) => {
                          let isUnlocked = false;
                          if (bagNum <= 2) isUnlocked = true;
                          else if (bagNum === 3 && player.level >= 42) isUnlocked = true;
                          else if (bagNum === 4 && player.level >= 55) isUnlocked = true;
                          else if (bagNum === 5 && player.level >= 66) isUnlocked = true;
                          else if (player.inventorySlots > 100 && (bagNum - 1) * 25 < player.inventorySlots) isUnlocked = true;

                          const isBagActive = activeBag === bagNum
                          const bagIcon = BAG_ICONS[player.race]

                          if (isUnlocked) {
                            return (
                              <div
                                key={bagNum}
                                onClick={() => {
                                  setActiveBag(isBagActive ? null : bagNum)
                                  setSelectedBagItem(null)
                                  setPickingSlot(null)
                                }}
                                style={{
                                  width: '100%',
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
                                  overflow: 'hidden',
                                  position: 'relative',
                                }}
                              >
                                {/* ALL unlocked bags show faction icon */}
                                {bagIcon ? (
                                  <img src={bagIcon} alt={`Bag ${bagNum}`} style={{ width: '92%', height: '92%', objectFit: 'contain', filter: `drop-shadow(0 0 5px ${fa}4d)` }} />
                                ) : (
                                  bagNum
                                )}
                                {/* Bag number badge */}
                                <span style={{
                                  position: 'absolute', bottom: 2, right: 3,
                                  fontFamily: "'Orbitron', sans-serif", fontSize: 8, fontWeight: 900,
                                  color: isBagActive ? fp : fa,
                                  textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                                }}>{bagNum}</span>
                              </div>
                            );
                          } else {
                            return (
                              <div
                                key={bagNum}
                                style={{
                                  width: '100%',
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
                        })
                      })()}
                    </div>

                    {/* ── Bag Contents Drawer ─────────────────────────── */}
                    {activeBag !== null && (
                      <div style={{
                        margin: '8px auto 14px',
                        width: 'calc(100% - 32px)',
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
                            const startIdx = (activeBag - 1) * 25
                            const endIdx = activeBag * 25
                            const bagItems = player.inventory ? player.inventory.slice(startIdx, endIdx) : []
                            
                            const paddedBagItems = [...bagItems]
                            while (paddedBagItems.length < 25) {
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
                                  {resolveItemImage(item, player.race, player.job) ? (
                                    <img referrerPolicy="no-referrer" src={resolveItemImage(item, player.race, player.job)} style={{ width: '80%', height: '80%', objectFit: 'contain', imageRendering: 'auto' }} alt={item.name} />
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
                        
                        {/* Selected item action panel */}
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
                          const isEquipable = ['weapon','armor','shield','helmet','mantle','gloves','boots','pants','amulet','ring','ascension_arms'].includes(item.type)
                          
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
                              {item.type === 'consumable' && (
                                <button
                                  onClick={() => {
                                    useItem(item.uid);
                                    setSelectedBagItem(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    background: 'linear-gradient(90deg, #0088ff, #00e5ff)',
                                    border: 'none',
                                    borderRadius: 4,
                                    color: '#000',
                                    padding: '6px 0',
                                    fontFamily: "'Orbitron', sans-serif",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    marginTop: 8,
                                    cursor: 'pointer',
                                    boxShadow: '0 0 8px rgba(0, 229, 255, 0.4)'
                                  }}
                                >
                                  USE ITEM
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

      </div>
    </div>
  )
}
