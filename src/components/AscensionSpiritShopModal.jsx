import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function AscensionSpiritShopModal({ onClose, colors, raceData, player }) {
  const buyAnimusReaver = useGameStore((s) => s.buyAnimusReaver)
  const upgradeAnimus = useGameStore((s) => s.upgradeAnimus)
  const setActiveAnimus = useGameStore((s) => s.setActiveAnimus)

  const [activeSlot, setActiveSlot] = useState('seraphys')
  
  const animusKeys = Object.keys(raceData.animus || {})

  const handleBuy = (animusKey, animusData) => {
    if (confirm(`Panggil (Summon) ${animusData.name} seharga ${animusData.reaverCost?.toLocaleString()} CRD?`)) {
      buyAnimusReaver(animusKey, animusData.reaverCost)
    }
  }

  const handleUpgrade = (animusKey, animusData, currentLv) => {
    const upgradeCost = animusData.upgradeCostBase * currentLv
    if (confirm(`Upgrade ${animusData.name} ke Lv.${currentLv + 1} seharga ${upgradeCost.toLocaleString()} CRD?`)) {
      upgradeAnimus(animusKey, upgradeCost)
    }
  }

  const handleEquip = (animusKey) => {
    setActiveAnimus(animusKey)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: '#0a0d15', border: `2px solid ${colors.border}`, borderRadius: 12,
        width: '100%', maxWidth: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: `0 0 20px ${colors.glow}`
      }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: `1px solid ${colors.border}4d` }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, color: colors.accent, fontWeight: 900, textShadow: `0 0 10px ${colors.glow}` }}>
            🔮 SHRINE OF SPIRITS
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>
            &times;
          </button>
        </div>

        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e0f4ff' }}>
          Panggil Ancient Spirit untuk bertempur bersamamu. Beri persembahan untuk meningkatkan kekuatan mereka!
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* SIDEBAR TABS */}
          <div style={{ width: 140, borderRight: `1px solid ${colors.border}4d`, overflowY: 'auto' }}>
            {animusKeys.map(k => {
              const a = raceData.animus[k]
              const isSummoned = !!player.celestraAnimus?.[k]
              
              return (
                <button
                  key={k}
                  onClick={() => setActiveSlot(k)}
                  style={{
                    width: '100%', padding: '12px 8px', textAlign: 'left',
                    background: activeSlot === k ? `rgba(255,255,255,0.1)` : 'transparent',
                    border: 'none', borderBottom: `1px solid rgba(255,255,255,0.05)`,
                    color: activeSlot === k ? '#fff' : (isSummoned ? '#44ff88' : '#88aadd'),
                    fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: 14 }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: isSummoned ? '#00ff88' : '#aaa' }}>
                    {isSummoned ? `Lv.${player.celestraAnimus[k]}` : 'Unsummoned'}
                  </div>
                </button>
              )
            })}
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
            {activeSlot && raceData.animus[activeSlot] && (() => {
              const aData = raceData.animus[activeSlot]
              const currentLv = player.celestraAnimus?.[activeSlot] || 0
              const isSummoned = currentLv > 0
              const isEquipped = player.activeAnimus === activeSlot
              const upgradeCost = aData.upgradeCostBase * currentLv
              
              const currentAtk = aData.baseAtk + (aData.growthAtk * Math.max(0, currentLv - 1))
              const currentHp = aData.baseHp + (aData.growthHp * Math.max(0, currentLv - 1))
              const currentDef = aData.baseDef + (aData.growthDef * Math.max(0, currentLv - 1))
              const currentCrit = aData.baseCrit + (aData.growthCrit * Math.max(0, currentLv - 1))

              return (
                <div>
                  <div style={{ marginBottom: 20, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 24, color: '#fff', fontWeight: 900, marginBottom: 4 }}>
                      {aData.name} <span style={{ color: '#44ff88', fontSize: 16 }}>{isSummoned ? `Lv.${currentLv}` : ''}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#aaa' }}>{aData.description}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 8, border: `1px solid ${colors.border}4d` }}>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: '#88aadd', marginBottom: 8 }}>CURRENT STATS</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff' }}>
                        <div>ATK: <span style={{ color: '#ff4444' }}>{currentAtk.toLocaleString()}</span></div>
                        <div>DEF: <span style={{ color: '#4488ff' }}>{currentDef.toLocaleString()}</span></div>
                        <div>HP: <span style={{ color: '#44ff88' }}>{currentHp.toLocaleString()}</span></div>
                        <div>CRIT: <span style={{ color: '#ffcc00' }}>{currentCrit.toFixed(1)}%</span></div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 8, border: `1px solid ${colors.border}4d` }}>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: '#ffcc00', marginBottom: 8 }}>GROWTH / LVL</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 13, color: '#aaa' }}>
                        <div>ATK: <span style={{ color: '#fff' }}>+{aData.growthAtk}</span></div>
                        <div>DEF: <span style={{ color: '#fff' }}>+{aData.growthDef}</span></div>
                        <div>HP: <span style={{ color: '#fff' }}>+{aData.growthHp}</span></div>
                        <div>CRIT: <span style={{ color: '#fff' }}>+{aData.growthCrit}%</span></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {!isSummoned ? (
                      <div style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: `1px solid ${colors.border}`, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, color: '#fff', marginBottom: 8 }}>BELI SPIRIT REAVER</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#ffcc00', marginBottom: 12, fontWeight: 800 }}>
                          {aData.reaverCost.toLocaleString()} CRD
                        </div>
                        <button
                          onClick={() => handleBuy(activeSlot, aData)}
                          disabled={player.resources.crd < aData.reaverCost}
                          style={{
                            padding: '10px 24px', background: player.resources.crd >= aData.reaverCost ? colors.accent : 'rgba(255,68,68,0.2)',
                            color: player.resources.crd >= aData.reaverCost ? '#000' : '#ff4444',
                            border: 'none', borderRadius: 4, fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer'
                          }}
                        >
                          SUMMON SPIRIT
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(0,0,0,0.4)', borderRadius: 8, border: `1px solid ${colors.border}4d` }}>
                          <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, color: '#fff' }}>
                            UPGRADE KE LV.{currentLv + 1}
                            <div style={{ fontSize: 12, color: '#ffcc00', marginTop: 4 }}>Biaya: {upgradeCost.toLocaleString()} CRD</div>
                          </div>
                          <button
                            onClick={() => handleUpgrade(activeSlot, aData, currentLv)}
                            disabled={player.resources.crd < upgradeCost || currentLv >= aData.maxLevel}
                            style={{
                              padding: '8px 16px', background: player.resources.crd >= upgradeCost ? '#44ff88' : 'rgba(255,255,255,0.1)',
                              color: '#000', border: 'none', borderRadius: 4, fontFamily: 'var(--font-title)', fontWeight: 800, cursor: 'pointer'
                            }}
                          >
                            {currentLv >= aData.maxLevel ? 'MAX LEVEL' : 'BERI PERSEMBAHAN'}
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleEquip(activeSlot)}
                          disabled={isEquipped}
                          style={{
                            width: '100%', padding: '12px', background: isEquipped ? 'rgba(0,255,136,0.2)' : `linear-gradient(90deg, ${colors.accent}, ${colors.border})`,
                            color: isEquipped ? '#00ff88' : '#000', border: isEquipped ? '1px solid #00ff88' : 'none', borderRadius: 6,
                            fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 900, cursor: isEquipped ? 'default' : 'pointer'
                          }}
                        >
                          {isEquipped ? '✨ ACTIVE SPIRIT ✨' : 'JADIKAN ACTIVE SPIRIT'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
