import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function AscensionShopModal({ onClose, colors, raceData, player, bionexTab }) {
  const buyAscensionPart = useGameStore((s) => s.buyAscensionPart)
  const [activeSlot, setActiveSlot] = useState('head')

  const slots = [
    { key: 'head', label: '1. Head', icon: '⚙️', color: '#88aadd' },
    { key: 'upper', label: '2. Core', icon: '🛡️', color: '#88aadd' },
    { key: 'lower', label: '3. Legs', icon: '🦵', color: '#88aadd' },
    { key: 'arms', label: '4. Arms', icon: '⚔️', color: '#f5a623' },
    { key: 'arms2', label: '5. Arms-II', icon: '🚀', color: '#f5a623' },
    { key: 'options', label: '6. Boost', icon: '⚡', color: '#44ff88' },
  ]

  const partsList = raceData.parts && raceData.parts[bionexTab] ? raceData.parts[bionexTab][activeSlot] || [] : []

  const handleBuy = (part) => {
    if (confirm(`Beli dan pasang ${part.name} seharga ${part.price?.toLocaleString() || 0} CRD?`)) {
      buyAscensionPart(activeSlot, part)
    }
  }

  const currentEquipped = player.ascensionLoadout?.[activeSlot]

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{
        background: '#0a101d', border: `2px solid ${colors.border}`, borderRadius: 12,
        width: '100%', maxWidth: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column'
      }}>
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottom: `1px solid ${colors.border}4d` }}>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: 18, color: colors.accent, fontWeight: 900 }}>
            🛒 PARTS SHOP ({bionexTab.toUpperCase()})
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ff4444', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>
            &times;
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* SIDEBAR TABS */}
          <div style={{ width: 120, borderRight: `1px solid ${colors.border}4d`, overflowY: 'auto' }}>
            {slots.map(s => (
              <button
                key={s.key}
                onClick={() => setActiveSlot(s.key)}
                style={{
                  width: '100%', padding: '12px 8px', textAlign: 'left',
                  background: activeSlot === s.key ? `rgba(255,255,255,0.1)` : 'transparent',
                  border: 'none', borderBottom: `1px solid rgba(255,255,255,0.05)`,
                  color: activeSlot === s.key ? '#fff' : '#88aadd',
                  fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: 14 }}>{s.icon}</div>
                {s.label}
              </button>
            ))}
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
            <div style={{ marginBottom: 12, padding: 10, background: 'rgba(0,255,136,0.1)', border: '1px solid #00ff88', borderRadius: 6 }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: '#00ff88', marginBottom: 4 }}>CURRENT EQUIPPED:</div>
              {currentEquipped ? (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff' }}>{currentEquipped.name} (Lv.{currentEquipped.lvl})</div>
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#ff4444' }}>Empty</div>
              )}
            </div>

            {partsList.map((p, i) => {
              const canAfford = player.resources.crd >= (p.price || 0)
              const levelMet = player.level >= p.lvl
              const isEquipped = currentEquipped?.name === p.name

              return (
                <div key={i} style={{
                  background: 'rgba(0,0,0,0.4)', border: isEquipped ? `2px solid ${colors.accent}` : `1px solid ${colors.border}4d`,
                  borderRadius: 8, padding: 12, marginBottom: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, color: '#fff', fontWeight: 900 }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: levelMet ? '#44ff88' : '#ff4444' }}>Lv. {p.lvl}</div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 4, fontSize: 12, fontFamily: 'var(--font-title)', fontWeight: 800, color: '#b5d4f1', marginBottom: 12 }}>
                    {p.pt !== undefined && <><div style={{ color: '#88aadd' }}>PT</div><div>{p.pt}</div></>}
                    {p.def !== undefined && <><div style={{ color: '#88aadd' }}>DEF</div><div>{p.def.toLocaleString()}</div></>}
                    {p.minAtk !== undefined && <><div style={{ color: '#88aadd' }}>ATK</div><div>{p.minAtk.toLocaleString()} - {p.maxAtk.toLocaleString()}</div></>}
                    {p.attM !== undefined && <><div style={{ color: '#88aadd' }}>ATT MASTERY</div><div>{p.attM}</div></>}
                    {p.defM !== undefined && <><div style={{ color: '#88aadd' }}>DEF MASTERY</div><div>{p.defM}</div></>}
                    {p.fire !== undefined && <><div style={{ color: '#88aadd' }}>FIRE RESIST</div><div>{p.fire}</div></>}
                    {p.water !== undefined && <><div style={{ color: '#88aadd' }}>WATER RESIST</div><div>{p.water}</div></>}
                    {p.soil !== undefined && <><div style={{ color: '#88aadd' }}>SOIL RESIST</div><div>{p.soil}</div></>}
                    {p.wind !== undefined && p.wind !== null && <><div style={{ color: '#88aadd' }}>WIND RESIST</div><div>{p.wind}</div></>}
                    {p.boostCharge !== undefined && <><div style={{ color: '#88aadd' }}>BOOST CHARGE</div><div>{p.boostCharge}</div></>}
                    {p.boostSpeed !== undefined && <><div style={{ color: '#88aadd' }}>BOOST SPEED</div><div>{p.boostSpeed}</div></>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#ffcc00', fontWeight: 900 }}>
                      {p.price ? p.price.toLocaleString() : 0} CRD
                    </div>
                    {isEquipped ? (
                      <button disabled style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: '#aaa', border: 'none', borderRadius: 4, fontFamily: 'var(--font-title)' }}>EQUIPPED</button>
                    ) : (
                      <button 
                        onClick={() => handleBuy(p)}
                        disabled={!canAfford || !levelMet}
                        style={{ 
                          padding: '6px 12px', background: canAfford && levelMet ? colors.accent : 'rgba(255,68,68,0.2)', 
                          color: canAfford && levelMet ? '#000' : '#ff4444', 
                          border: 'none', borderRadius: 4, fontFamily: 'var(--font-title)', fontWeight: 800, cursor: canAfford && levelMet ? 'pointer' : 'not-allowed' 
                        }}
                      >
                        BELI & PASANG
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
