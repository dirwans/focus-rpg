import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { t } from '../lib/translate'
import arctronBagIcon from '../assets/arctron_bag_icon_rembg.png'
import bionexBagIcon from '../assets/bionex_bag_icon_rembg.png'
import celestraBagIcon from '../assets/celestra_bag_icon_rembg.png'

const BAG_ICONS = {
  arctron: arctronBagIcon,
  bionex: bionexBagIcon,
  celestra: celestraBagIcon,
}

export default function Inventory() {
  const [activeTooltip, setActiveTooltip] = useState(null)
  const [equipOpen, setEquipOpen] = useState(true)
  const [activeBag, setActiveBag] = useState(null)
  const [selectedBagItem, setSelectedBagItem] = useState(null)

  const player = useGameStore((s) => s.player)
  const equipItem = useGameStore((s) => s.equipItem)
  const unequipItem = useGameStore((s) => s.unequipItem)
  
  if (!player) return null;

  const screenBg = {
    arctron: 'radial-gradient(circle at 30% 0%, #201f22 0%, #0a0a0c 60%)',
    bionex: 'radial-gradient(circle at 30% 0%, #13243a 0%, #060b12 60%)',
    celestra: 'radial-gradient(circle at 30% 0%, #1a1642 0%, #07061a 60%)'
  }[player?.race] || '#08080d'

  return (
    <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', flex: 1, fontFamily: "'Saira', sans-serif", background: screenBg, minHeight: '100vh', paddingBottom: 64 }} onClick={() => { setActiveTooltip(null); setSelectedBagItem(null); }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)', flexShrink: 0 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2, textShadow: '0 0 10px #00e5ff' }}>GEAR & INVENTORY</span>
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
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: 6,
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                      width: 'calc(100% - 32px)',
                      maxWidth: 320,
                    }}>
                      {(() => {
                        const totalBags = Math.max(5, Math.ceil((player.inventorySlots || 100) / 25))
                        const bagList = Array.from({ length: totalBags }, (_, i) => i + 1)
                        return bagList.map((bagNum) => {
                          let isUnlocked = false;
                          if (bagNum <= 2) isUnlocked = true;
                          else if (bagNum === 3 && player.level >= 32) isUnlocked = true;
                          else if (bagNum === 4 && player.level >= 42) isUnlocked = true;
                          else if (bagNum === 5 && player.level >= 55) isUnlocked = true;
                          else if ((bagNum - 1) * 25 >= 100) isUnlocked = true;

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

      </div>
    </div>
  )
}
