import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
const colors = { accent: '#cc44ff', border: '#cc44ff', bg: 'rgba(204, 68, 255, 0.15)', text: '#fff', bgLight: 'rgba(204, 68, 255, 0.25)' }

export default function AscensionSpiritShopModal({ player, raceData }) {
  const buyAnimusReaver = useGameStore((s) => s.buyAnimusReaver)
  const upgradeAnimus = useGameStore((s) => s.upgradeAnimus)
  const buyAnimusUnseal = useGameStore((s) => s.buyAnimusUnseal)
  const setActiveAnimus = useGameStore((s) => s.setActiveAnimus)

  const [activeSlot, setActiveSlot] = useState(null)

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
  
  const handleUnseal = (animusKey, animusData, unsealTarget, cost) => {
    if (confirm(`Beli Segel (Unseal) untuk ${animusData.name} mencapai Lv.${unsealTarget} seharga ${cost.toLocaleString()} CRD?`)) {
      buyAnimusUnseal(animusKey, unsealTarget, cost)
    }
  }

  const handleEquip = (animusKey) => {
    setActiveAnimus(animusKey)
  }

  const unsealOptions = raceData.crystals || [
    { targetLv: 32, name: 'Novice Soul Crystal', cost: 50000000, description: 'Membuka segel Animus pemula (Cap Lv.32)' },
    { targetLv: 42, name: 'Veteran Soul Crystal', cost: 150000000, description: 'Membuka segel evolusi tahap 2 (Cap Lv.42)' },
    { targetLv: 50, name: 'Master Soul Crystal', cost: 350000000, description: 'Membuka segel spiritual master (Cap Lv.50)' },
    { targetLv: 55, name: 'Grandmaster Soul Crystal', cost: 750000000, description: 'Membuka segel evolusi tahap 3 (Cap Lv.55)' },
    { targetLv: 60, name: 'High Ascendant Crystal', cost: 1500000000, description: 'Membuka segel suci Ascendant (Cap Lv.60)' },
    { targetLv: 65, name: 'Zenith Ascension Crystal', cost: 2500000000, description: 'Membuka segel kosmis final (Cap Lv.65)' }
  ]

  return (
    <div style={{ padding: 16, background: 'rgba(0,0,0,0.4)', borderRadius: 8, border: `1px solid ${colors.border}` }}>
      
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, color: colors.accent, fontWeight: 900 }}>
          ⛩️ SHRINE OF SPIRITS
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#aaa', marginTop: 8 }}>
          Beli Spirit Reaver untuk memanggil roh, berikan persembahan untuk naik level, dan buka segel (Unseal) untuk menembus batas.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* TOP SELECTOR BAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#888', textAlign: 'center' }}>
            AVAILABLE SPIRITS
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {animusKeys.map(k => {
              const a = raceData.animus[k]
              const isSummoned = !!player.celestraAnimus?.[k]
              const isEquipped = player.activeAnimus === k
              return (
                <button
                  key={k}
                  onClick={() => setActiveSlot(k)}
                  style={{
                    flex: '1 1 140px',
                    maxWidth: '200px',
                    padding: '10px 14px',
                    background: activeSlot === k ? `${colors.accent}22` : 'rgba(0,0,0,0.5)',
                    border: `1.5px solid ${activeSlot === k ? colors.accent : colors.border}`,
                    borderRadius: 8,
                    color: activeSlot === k ? '#fff' : '#aaa',
                    cursor: 'pointer',
                    textAlign: 'center',
                    boxShadow: activeSlot === k ? `0 0 12px ${colors.accent}44` : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800 }}>{a.name}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: isSummoned ? '#44ff88' : '#ff4444', marginTop: 4 }}>
                    {isSummoned ? `Lv.${player.celestraAnimus[k]}` : 'Unsummoned'}
                  </div>
                  {isEquipped && <div style={{ fontSize: 10, color: '#ffcc00', marginTop: 4, fontWeight: 'bold' }}>[EQUIPPED]</div>}
                </button>
              )
            })}
          </div>
        </div>

        {/* MAIN PANEL */}
        <div style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${colors.border}`, borderRadius: 8, padding: 16 }}>
          {activeSlot && raceData.animus[activeSlot] ? (() => {
            const aData = raceData.animus[activeSlot]
            const currentLv = player.celestraAnimus?.[activeSlot] || 0
            const maxLevelCap = player.celestraAnimusUnseal?.[activeSlot] || 32
            const isEquipped = player.activeAnimus === activeSlot
            const isSummoned = currentLv > 0

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* HEADER INFO */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '8px 0', width: '100%' }}>
                    <img
                      src={`/assets/spirit_${activeSlot}_${currentLv >= 65 ? 65 : currentLv >= 55 ? 55 : currentLv >= 42 ? 42 : 32}.png?v=1`}
                      alt={aData.name}
                      style={{
                        width: '100%',
                        maxWidth: 320,
                        height: 320,
                        objectFit: 'contain',
                        margin: '0 auto',
                        display: 'block',
                        filter: `drop-shadow(0 0 10px ${activeSlot === 'seraphys' ? 'rgba(68, 255, 136, 0.22)' : 'rgba(255, 68, 68, 0.22)'}) drop-shadow(0 0 2px ${activeSlot === 'seraphys' ? 'rgba(68, 255, 136, 0.45)' : 'rgba(255, 68, 68, 0.45)'})`
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, color: '#fff', fontWeight: 900 }}>{aData.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: colors.accent, margin: '8px 0' }}>
                      {aData.description}
                    </div>
                    {isSummoned && (
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#fff', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: 4, display: 'inline-block' }}>
                        Current: <strong style={{ color: '#44ff88' }}>Lv. {currentLv}</strong> / Max Cap: <strong style={{ color: '#ffcc00' }}>Lv. {maxLevelCap}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}4d` }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {!isSummoned ? (
                    <div style={{ padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: `1px solid ${colors.border}`, textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, color: '#fff', marginBottom: 8 }}>BELI SPIRIT REAVER</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#ffcc00', marginBottom: 12, fontWeight: 800 }}>
                        {aData.reaverCost.toLocaleString()} CRD
                      </div>
                      <button
                        onClick={() => handleBuy(activeSlot, aData)}
                        disabled={player.crd < aData.reaverCost}
                        style={{
                          width: '100%', padding: 12, background: player.crd >= aData.reaverCost ? colors.accent : '#555',
                          color: '#000', fontFamily: 'var(--font-title)', fontWeight: 900, border: 'none', borderRadius: 6, cursor: player.crd >= aData.reaverCost ? 'pointer' : 'not-allowed'
                        }}
                      >
                        SUMMON SPIRIT
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: `1px solid ${colors.border}4d` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, color: '#fff' }}>BERI PERSEMBAHAN (LEVEL UP)</div>
                        {!isEquipped && (
                          <button
                            onClick={() => handleEquip(activeSlot)}
                            style={{ padding: '4px 12px', background: 'transparent', border: `1px solid ${colors.accent}`, color: colors.accent, borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11 }}
                          >
                            EQUIP ACTIVE
                          </button>
                        )}
                      </div>
                      
                      {currentLv >= maxLevelCap ? (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ff4444', textAlign: 'center', padding: 12, background: 'rgba(255,0,0,0.1)', borderRadius: 4 }}>
                          Telah mencapai batas level maksimum (Max Cap Lv.{maxLevelCap}). Buka Segel (Unseal) untuk naik level lebih tinggi!
                        </div>
                      ) : currentLv >= aData.maxLevel ? (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ffcc00', textAlign: 'center', padding: 12, background: 'rgba(255,200,0,0.1)', borderRadius: 4 }}>
                          MAX LEVEL REACHED!
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUpgrade(activeSlot, aData, currentLv)}
                          disabled={player.crd < aData.upgradeCostBase * currentLv}
                          style={{
                            width: '100%', padding: 12, background: player.crd >= aData.upgradeCostBase * currentLv ? '#44ff88' : '#555',
                            color: '#000', fontFamily: 'var(--font-title)', fontWeight: 900, border: 'none', borderRadius: 6, cursor: player.crd >= (aData.upgradeCostBase * currentLv) ? 'pointer' : 'not-allowed',
                            marginTop: 8
                          }}
                        >
                          UPGRADE KE LV.{currentLv + 1} ({(aData.upgradeCostBase * currentLv).toLocaleString()} CRD)
                        </button>
                      )}
                    </div>
                  )}

                  {/* UNSEAL SECTION */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: `1px solid ${colors.border}4d` }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, color: '#ffcc00' }}>UNSEAL CRYSTAL SHOP</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888', marginBottom: 8 }}>Beli Crystal untuk membuka batas maksimal level Spirit ini.</div>
                    
                    {unsealOptions.map(opt => {
                      const isBought = maxLevelCap >= opt.targetLv
                      const canBuy = player.crd >= opt.cost && !isBought
                      
                      return (
                        <div key={opt.targetLv} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 4, border: `1px solid ${isBought ? '#44ff88' : colors.border}4d` }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: isBought ? '#44ff88' : '#fff' }}>{opt.name}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#aaa' }}>{opt.description || `Buka Cap Lv.${opt.targetLv}`}</div>
                          </div>
                          {isBought ? (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#44ff88' }}>OWNED</div>
                          ) : (
                            <button
                              onClick={() => handleUnseal(activeSlot, aData, opt.targetLv, opt.cost)}
                              disabled={!canBuy}
                              style={{
                                padding: '6px 12px', background: canBuy ? colors.accent : '#333', color: canBuy ? '#000' : '#888',
                                border: 'none', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 'bold',
                                cursor: canBuy ? 'pointer' : 'not-allowed'
                              }}
                            >
                              {opt.cost.toLocaleString()} CRD
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>
            )
          })() : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              Pilih salah satu Spirit di daftar sebelah kiri.
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
