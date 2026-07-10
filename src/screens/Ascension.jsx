import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import ascensionData from '../data/ascensionArms.json'
import AscensionShopModal from '../components/AscensionShopModal'
import AscensionSpiritShopModal from '../components/AscensionSpiritShopModal'
import { t } from '../lib/translate'

// Peta gambar per evolution ID dengan cache-buster ?v=2
const EVO_IMAGES = {
  // Bionex M.E.U. Attacker
  meu_atk_32:       '/assets/MEUattacklv32.png?v=2',
  meu_atk_42:       '/assets/MEUattacklv42.png?v=2',
  meu_atk_55:       '/assets/MEUattacklv55.png?v=2',
  meu_atk_65:       '/assets/MEUattacklv65.png?v=2',
  // Bionex M.E.U. Defender
  meu_def_32:       '/assets/MEUdevlv32.png?v=2',
  meu_def_42:       '/assets/MEUdevlv42.png?v=2',
  meu_def_55:       '/assets/MEUdevlv55.png?v=2',
  meu_def_65:       '/assets/MEUdevlv65.png?v=2',
  // Arctron A.R.E.S.
  ares_x:           '/assets/ARESlv32arctron.png?v=2',
  ares_nemesis:     '/assets/ARESlv42arctron.png?v=2',
  ares_dominator:   '/assets/ARESlv55arctron.png?v=2',
  ares_apocalypse:  '/assets/ARESlv65arctron.png?v=2',
  // Celestra Ancient Spirit - Seraphys
  spirit_seraphys_32: '/assets/spirit_seraphys_32.png?v=4',
  spirit_seraphys_42: '/assets/spirit_seraphys_42.png?v=4',
  spirit_seraphys_55: '/assets/spirit_seraphys_55.png?v=4',
  spirit_seraphys_65: '/assets/spirit_seraphys_65.png?v=4',
  // Celestra Ancient Spirit - Noctyrna
  spirit_noctyrna_32: '/assets/spirit_noctyrna_32.png?v=4',
  spirit_noctyrna_42: '/assets/spirit_noctyrna_42.png?v=4',
  spirit_noctyrna_55: '/assets/spirit_noctyrna_55.png?v=7',
  spirit_noctyrna_65: '/assets/spirit_noctyrna_65.png?v=5',
}

const RACE_COLORS = {
  celestra: {
    accent: '#cc44ff', // purple title
    glow: 'rgba(204, 68, 255, 0.5)',
    border: '#cc44ff', // purple frame
    bg: 'rgba(204, 68, 255, 0.15)',
    bgLight: 'rgba(204, 68, 255, 0.08)'
  },
  arctron: {
    accent: '#ff8c00', // orange title
    glow: 'rgba(255, 140, 0, 0.5)',
    border: '#ff8c00', // orange frame
    bg: 'rgba(255, 140, 0, 0.15)',
    bgLight: 'rgba(255, 140, 0, 0.08)'
  },
  bionex: {
    accent: '#ffdd00', // yellow title like logo
    glow: 'rgba(255, 221, 0, 0.5)',
    border: '#00bfff', // sky blue frame
    bg: 'rgba(0, 191, 255, 0.15)',
    bgLight: 'rgba(0, 191, 255, 0.08)'
  }
}

export default function Ascension() {
  const player = useGameStore((s) => s.player)
  const craftAscensionArms = useGameStore((s) => s.craftAscensionArms)
  const buySiegeKit = useGameStore((s) => s.buySiegeKit)
  const [bionexTab, setBionexTab] = useState('attacker')
  const [activeTab, setActiveTab] = useState('hangar')
  const [isShopModalOpen, setIsShopModalOpen] = useState(false)
  const [isSpiritModalOpen, setIsSpiritModalOpen] = useState(false)
  const [kitType, setKitType] = useState('launcher')
  const [spiritTab, setSpiritTab] = useState('seraphys') // celestra spirit type
  const [spiritLevel, setSpiritLevel] = useState(32)     // selected preview level

  if (!player.race) {
    return (
      <div style={styles.screen}>
        <div style={styles.empty}>
          <div style={{ fontSize: 40 }}>🔒</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#7ab0d0', marginTop: 8 }}>
            Pilih bangsa (faction) terlebih dahulu untuk membuka Ascension Lab.
          </div>
        </div>
      </div>
    )
  }
  const data = ascensionData[player.race]
  if (!data) {
    return (
      <div style={styles.screen}>
        <div style={styles.empty}>
          <div style={{ color: '#ff4444' }}>Data Ascension tidak ditemukan.</div>
        </div>
      </div>
    )
  }

  const colors = RACE_COLORS[player.race] || RACE_COLORS.celestra

  return (
    <div style={styles.screen}>
      <div style={styles.resBar}>
        <button onClick={() => useGameStore.getState().setScreen('main')} style={{background:'transparent', border:'none', color: colors.border, fontSize: 20, cursor:'pointer', padding: '0 8px 0 0', display:'flex', alignItems:'center'}}>❮</button>
        <span style={styles.chip('#f5a623')}>◈ {player.resources.crd.toLocaleString()} CRD</span>
      </div>

      <div style={{ padding: '16px 16px 80px' }}>
        <div className={`glass-panel cyber-panel panel-${player.race}`} style={{ padding: 16, border: `1px solid ${colors.border}`, boxShadow: `inset 0 0 20px ${colors.bg}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, borderBottom: `1px solid ${colors.border}4d`, paddingBottom: 10 }}>
            <div style={{ fontSize: 40 }}>{data.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 22, fontWeight: 900, color: colors.accent, letterSpacing: 1, textShadow: `0 0 10px ${colors.glow}` }}>{data.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e0f4ff', fontWeight: 600, marginTop: 4 }}>{data.description}</div>
            </div>
          </div>

          

          {/* MAIN TABS (HANGAR vs PARTS SHOP) */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setActiveTab('hangar')}
              style={{
                flex: 1, padding: '10px 0', fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 900,
                background: activeTab === 'hangar' ? `linear-gradient(90deg, ${colors.accent}, ${colors.border})` : 'rgba(0,0,0,0.4)',
                color: activeTab === 'hangar' ? '#000' : colors.accent,
                border: `1px solid ${colors.accent}`, borderRadius: 6, cursor: 'pointer'
              }}
            >
              {player.race === 'celestra' ? '🔮 SANCTUARY' : '🏗️ HANGAR'}
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              style={{
                flex: 1, padding: '10px 0', fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 900,
                background: activeTab === 'shop' ? `linear-gradient(90deg, ${colors.accent}, ${colors.border})` : 'rgba(0,0,0,0.4)',
                color: activeTab === 'shop' ? '#000' : colors.accent,
                border: `1px solid ${colors.accent}`, borderRadius: 6, cursor: 'pointer'
              }}
            >
              {player.race === 'celestra' ? '⛩️ SHRINE' : '⚙️ PARTS SHOP'}
            </button>
          </div>

          {activeTab === 'hangar' ? (
            <>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 16, color: colors.accent, marginBottom: 12, fontWeight: 800, borderBottom: `1px solid ${colors.border}4d`, paddingBottom: 6 }}>
                {data.name} Evolution
              </div>
              
              {player.race === 'celestra' && (() => {
                if (!player.activeAnimus) {
                  return <div style={{ color: '#ff4444', fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 12 }}>Tidak ada Ascension Spirit yang dipanggil.</div>
                }
                const aData = data.animus[player.activeAnimus]
                const currentLv = player.celestraAnimus?.[player.activeAnimus] || 1
                const lvBonus = Math.max(0, currentLv - 1)
                return (
                  <div style={{ marginTop: 16, background: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 8, border: `1px solid ${colors.border}4d` }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, color: '#44ff88', marginBottom: 8 }}>✨ ACTIVE SPIRIT: {aData.name} (Lv.{currentLv})</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 13, color: '#fff' }}>
                      {player.activeAnimus === 'seraphys' ? (
                        <>
                          <div>✨ HEAL: <span style={{ color: '#44ff88' }}>+{(aData.baseHeal + (aData.growthHeal * lvBonus)).toLocaleString()} HP/s</span></div>
                          <div>🛡️ DEF: <span style={{ color: '#4488ff' }}>+{(aData.baseDef + (aData.growthDef * lvBonus)).toLocaleString()}</span></div>
                          <div>❤️ HP: <span style={{ color: '#ff4444' }}>+{(aData.baseHp + (aData.growthHp * lvBonus)).toLocaleString()}</span></div>
                          <div>🩹 CURE: <span style={{ color: '#ffcc00' }}>+{(aData.baseCure + (aData.growthCure * lvBonus)).toFixed(1)}% Rate</span></div>
                        </>
                      ) : (
                        <>
                          <div>🌑 DPS: <span style={{ color: '#ff4444' }}>{(aData.baseForceAtkMin + (aData.growthForceAtkMin * lvBonus)).toLocaleString()}-{(aData.baseForceAtkMax + (aData.growthForceAtkMax * lvBonus)).toLocaleString()}</span></div>
                          <div>💥 CRIT: <span style={{ color: '#ffcc00' }}>+{(aData.baseCrit + (aData.growthCrit * lvBonus)).toFixed(1)}%</span></div>
                          <div>⚡ STUN: <span style={{ color: '#44ccff' }}>+{(aData.baseStun + (aData.growthStun * lvBonus)).toFixed(1)}%</span></div>
                          <div>❤️ HP: <span style={{ color: '#44ff88' }}>{(aData.baseHp + (aData.growthHp * lvBonus)).toLocaleString()}</span></div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* CELESTRA SPIRIT SHOWCASE - Glass card + neon glow style */}
              {player.race === 'celestra' && (
                <div style={{ marginTop: 24 }}>
                  {/* Header */}
                  <div style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: 18,
                    fontWeight: 900,
                    color: colors.accent,
                    marginBottom: 14,
                    letterSpacing: 2,
                    textAlign: 'center',
                    textShadow: `0 0 12px ${colors.glow}, 0 0 24px ${colors.glow}`,
                    borderBottom: `2px solid ${colors.accent}44`,
                    paddingBottom: 8
                  }}>
                    ✦ ANCIENT SPIRIT EVOLUTION ✦
                  </div>

                  {/* Spirit type tab */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {[
                      { key: 'seraphys', icon: '✨', label: 'SERAPHYS', sub: 'Healer' },
                      { key: 'noctyrna', icon: '🌑', label: 'NOCTYRNA', sub: 'Aggressor' },
                    ].map(tab => {
                      const active = spiritTab === tab.key
                      return (
                        <button
                          key={tab.key}
                          onClick={() => { setSpiritTab(tab.key); setSpiritLevel(32) }}
                          style={{
                            flex: 1,
                            padding: '10px 4px',
                            fontFamily: 'var(--font-title)',
                            fontWeight: 900,
                            fontSize: 13,
                            letterSpacing: 1,
                            background: active
                              ? `linear-gradient(135deg, ${colors.accent}33, ${colors.border}22)`
                              : 'rgba(0,0,0,0.4)',
                            border: active
                              ? `2px solid ${colors.accent}`
                              : `1px solid ${colors.border}44`,
                            borderRadius: 8,
                            cursor: 'pointer',
                            color: active ? colors.accent : '#7590B7',
                            boxShadow: active ? `0 0 16px ${colors.glow}, inset 0 0 12px ${colors.bg}` : 'none',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <div style={{ fontSize: 18, marginBottom: 2 }}>{tab.icon}</div>
                          <div>{tab.label}</div>
                          <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>{tab.sub}</div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Spirit level selector */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                    {[32, 42, 55, 65].map(lv => {
                      const active = spiritLevel === lv
                      const isUnlocked = (player.celestraAnimus?.[spiritTab] || 1) >= lv
                      return (
                        <button
                          key={lv}
                          onClick={() => setSpiritLevel(lv)}
                          style={{
                            flex: 1,
                            padding: '8px 2px',
                            fontFamily: 'var(--font-title)',
                            fontWeight: 900,
                            fontSize: 14,
                            letterSpacing: 1,
                            background: active
                              ? `linear-gradient(135deg, ${colors.accent}55, ${colors.border}33)`
                              : 'rgba(0,0,0,0.3)',
                            border: active
                              ? `2px solid ${colors.accent}`
                              : isUnlocked
                                ? `1px solid ${colors.accent}66`
                                : `1px solid rgba(255,68,68,0.3)`,
                            borderRadius: 6,
                            cursor: 'pointer',
                            color: active ? '#fff' : isUnlocked ? colors.accent : '#555',
                            boxShadow: active ? `0 0 14px ${colors.glow}` : 'none',
                            transition: 'all 0.25s ease',
                          }}
                        >
                          <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 600 }}>LV</div>
                          <div>{lv}</div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Main spirit card - glass + neon style */}
                  {(() => {
                    const aData = data.animus[spiritTab]
                    const isSeraphys = spiritTab === 'seraphys'
                    const isUnlocked = (player.celestraAnimus?.[spiritTab] || 1) >= spiritLevel

                    const calc = (base, growth) => (base + growth * (spiritLevel - 1)).toLocaleString()
                    const calcF = (base, growth) => (base + growth * (spiritLevel - 1)).toFixed(1)

                    return (
                      <div style={{
                        borderRadius: 12,
                        padding: 2,
                        background: `linear-gradient(135deg, ${colors.accent}88, ${colors.border}44, ${colors.accent}88)`,
                        boxShadow: `0 0 20px ${colors.glow}, 0 0 40px ${colors.bg}`,
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        {/* Inner glass */}
                        <div style={{
                          background: 'linear-gradient(180deg, rgba(5,10,25,0.95) 0%, rgba(10,15,35,0.92) 100%)',
                          borderRadius: 10,
                          padding: '16px 14px',
                          backdropFilter: 'blur(8px)',
                          border: `1px solid ${colors.border}66`,
                        }}>
                          {/* Spirit name header */}
                          <div style={{
                            fontFamily: 'var(--font-title)',
                            fontSize: 20,
                            fontWeight: 900,
                            letterSpacing: 2,
                            textAlign: 'center',
                            color: '#fff',
                            textShadow: `0 0 10px ${colors.accent}, 0 0 20px ${colors.accent}, 0 0 30px ${colors.glow}`,
                            marginBottom: 4,
                          }}>
                            {aData.name}
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-title)',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 3,
                            textAlign: 'center',
                            color: colors.accent,
                            textShadow: `0 0 6px ${colors.accent}`,
                            marginBottom: 12,
                          }}>
                            {isSeraphys ? 'SACRED HEALER SPIRIT' : 'DARK AGGRESSOR SPIRIT'}
                          </div>

                          {/* Sprite */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: 14,
                            minHeight: 280,
                            position: 'relative',
                          }}>
                            {/* Background glow */}
                            <div style={{
                              position: 'absolute',
                              width: 200,
                              height: 200,
                              borderRadius: '50%',
                              background: `radial-gradient(circle, ${colors.glow}44 0%, transparent 70%)`,
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                            }}/>
                            <img
                              src={EVO_IMAGES[`spirit_${spiritTab}_${spiritLevel}`] || `/assets/spirit_${spiritTab}_${spiritLevel}.png?v=1`}
                              alt={`${aData.name} Lv.${spiritLevel}`}
                              style={{
                                maxHeight: 280,
                                maxWidth: '85%',
                                objectFit: 'contain',
                                position: 'relative',
                                zIndex: 1,
                                filter: isUnlocked
                                  ? `drop-shadow(0 0 18px ${colors.accent}) brightness(1.15) contrast(1.1)`
                                  : `brightness(0.5) saturate(0.5)`,
                                transition: 'filter 0.4s ease',
                              }}
                            />
                          </div>

                          {/* Locked overlay */}
                          {!isUnlocked && (
                            <div style={{
                              textAlign: 'center',
                              fontFamily: 'var(--font-title)',
                              fontSize: 12,
                              fontWeight: 900,
                              color: '#ff4444',
                              letterSpacing: 1,
                              marginBottom: 8,
                              textShadow: '0 0 8px rgba(255,68,68,0.8)',
                            }}>
                              🔒 NOT YET UNLOCKED — RAISE SPIRIT LEVEL
                            </div>
                          )}

                          {/* Stats panel */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 6,
                            padding: 12,
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: 8,
                            border: `1px solid ${colors.border}55`,
                            marginBottom: 10,
                          }}>
                            {isSeraphys ? (
                              <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 13, color: '#88aadd' }}>
                                  <span style={{ color: '#44ff88', textShadow: '0 0 6px rgba(68,255,136,0.6)' }}>✨</span>
                                  <span>HEAL</span>
                                  <span style={{ color: '#44ff88', textShadow: '0 0 6px rgba(68,255,136,0.6)' }}>{calc(aData.baseHeal, aData.growthHeal)} HP/s</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 13, color: '#88aadd' }}>
                                  <span style={{ color: '#4488ff', textShadow: '0 0 6px rgba(68,136,255,0.6)' }}>🛡️</span>
                                  <span>DEF</span>
                                  <span style={{ color: '#4488ff', textShadow: '0 0 6px rgba(68,136,255,0.6)' }}>{calc(aData.baseDef, aData.growthDef)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 13, color: '#88aadd' }}>
                                  <span style={{ color: '#ff4444', textShadow: '0 0 6px rgba(255,68,68,0.6)' }}>❤️</span>
                                  <span>HP</span>
                                  <span style={{ color: '#ff4444', textShadow: '0 0 6px rgba(255,68,68,0.6)' }}>{calc(aData.baseHp, aData.growthHp)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 13, color: '#88aadd' }}>
                                  <span style={{ color: '#ffcc00', textShadow: '0 0 6px rgba(255,204,0,0.6)' }}>🩹</span>
                                  <span>CURE</span>
                                  <span style={{ color: '#ffcc00', textShadow: '0 0 6px rgba(255,204,0,0.6)' }}>+{calcF(aData.baseCure, aData.growthCure)}%</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 13, color: '#88aadd', gridColumn: '1/-1' }}>
                                  <span style={{ color: '#ff4444', textShadow: '0 0 6px rgba(255,68,68,0.6)' }}>🌑 DPS</span>
                                  <span style={{ color: '#ff4444', textShadow: '0 0 6px rgba(255,68,68,0.6)' }}>{calc(aData.baseForceAtkMin, aData.growthForceAtkMin)} — {calc(aData.baseForceAtkMax, aData.growthForceAtkMax)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 13, color: '#88aadd' }}>
                                  <span style={{ color: '#ffcc00', textShadow: '0 0 6px rgba(255,204,0,0.6)' }}>💥</span>
                                  <span>CRIT</span>
                                  <span style={{ color: '#ffcc00', textShadow: '0 0 6px rgba(255,204,0,0.6)' }}>+{calcF(aData.baseCrit, aData.growthCrit)}%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 13, color: '#88aadd' }}>
                                  <span style={{ color: '#44ccff', textShadow: '0 0 6px rgba(68,204,255,0.6)' }}>⚡</span>
                                  <span>STUN</span>
                                  <span style={{ color: '#44ccff', textShadow: '0 0 6px rgba(68,204,255,0.6)' }}>+{calcF(aData.baseStun, aData.growthStun)}%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 13, color: '#88aadd' }}>
                                  <span style={{ color: '#44ff88', textShadow: '0 0 6px rgba(68,255,136,0.6)' }}>❤️</span>
                                  <span>HP</span>
                                  <span style={{ color: '#44ff88', textShadow: '0 0 6px rgba(68,255,136,0.6)' }}>{calc(aData.baseHp, aData.growthHp)}</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Preview note */}
                          <div style={{
                            fontSize: 10,
                            fontFamily: 'var(--font-title)',
                            fontWeight: 700,
                            letterSpacing: 2,
                            color: '#7590B7',
                            textAlign: 'center',
                            padding: 6,
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: 4,
                            border: `1px solid ${colors.border}22`,
                            textShadow: '0 0 4px rgba(117,144,183,0.4)',
                          }}>
                            ▶ SPIRIT PREVIEW · LV.{spiritLevel} · {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Both spirits at a glance */}
                  <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {Object.keys(data.animus).map(animusKey => {
                      const aData = data.animus[animusKey]
                      const currentLv = player.celestraAnimus?.[animusKey] || 1
                      const isSeraphys = animusKey === 'seraphys'
                      return (
                        <button
                          key={animusKey}
                          onClick={() => { setSpiritTab(animusKey); setSpiritLevel(Math.min(32, currentLv)) }}
                          style={{
                            padding: '10px 10px',
                            background: spiritTab === animusKey
                              ? `linear-gradient(135deg, ${colors.accent}22, ${colors.border}11)`
                              : 'rgba(0,0,0,0.3)',
                            border: spiritTab === animusKey
                              ? `2px solid ${colors.accent}`
                              : `1px solid ${colors.border}33`,
                            borderRadius: 8,
                            cursor: 'pointer',
                            textAlign: 'left',
                            boxShadow: spiritTab === animusKey ? `0 0 12px ${colors.glow}` : 'none',
                            transition: 'all 0.25s ease',
                          }}
                        >
                          <div style={{ fontFamily: 'var(--font-title)', fontWeight: 900, fontSize: 13, color: '#fff', letterSpacing: 1, textShadow: spiritTab === animusKey ? `0 0 8px ${colors.accent}` : 'none' }}>
                            {isSeraphys ? '✨' : '🌑'} {aData.name}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: colors.accent, marginTop: 3, textShadow: `0 0 4px ${colors.accent}` }}>
                            Current: Lv.{currentLv}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#7590B7', marginTop: 2 }}>
                            {isSeraphys ? 'Healer · HP Boost' : 'Aggressor · DPS'}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

          {/* TAB UNTUK BIONEX */}
          {player.race === 'bionex' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setBionexTab('attacker')}
                style={{
                  flex: 1, padding: '10px 0', fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 900,
                  background: bionexTab === 'attacker' ? `linear-gradient(90deg, ${colors.accent}, ${colors.border})` : 'rgba(0,0,0,0.4)',
                  color: bionexTab === 'attacker' ? '#000' : colors.accent,
                  border: `1px solid ${colors.accent}`, borderRadius: 6, cursor: 'pointer'
                }}
              >
                🚀 M.E.U. ATTACKER
              </button>
              <button
                onClick={() => setBionexTab('defender')}
                style={{
                  flex: 1, padding: '10px 0', fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 900,
                  background: bionexTab === 'defender' ? `linear-gradient(90deg, ${colors.accent}, ${colors.border})` : 'rgba(0,0,0,0.4)',
                  color: bionexTab === 'defender' ? '#000' : colors.accent,
                  border: `1px solid ${colors.accent}`, borderRadius: 6, cursor: 'pointer'
                }}
              >
                🛡️ M.E.U. DEFENDER
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(data.evolutions || [])
              .filter(evo => {
                if (player.race === 'bionex') {
                  return bionexTab === 'attacker' ? evo.id.includes('_atk_') : evo.id.includes('_def_')
                }
                return true
              })
              .map((evo, i) => {
              const isUnlocked = player.equipment?.ascension_arms?.id === evo.id
              const hasMaterial = player.race === 'arctron' ? (player.ownedSiegeKits || []).includes(evo.id) : true
              const canAfford = player.race === 'arctron' ? hasMaterial : player.resources.crd >= evo.cost
              const levelMet = player.level >= evo.levelReq
              
              const evoImg = EVO_IMAGES[evo.id]
              return (
                <div key={evo.id} style={{
                  background: isUnlocked ? colors.bg : 'rgba(0,0,0,0.3)',
                  border: isUnlocked ? `1px solid ${colors.border}` : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: 12,
                  position: 'relative'
                }}>
                  {/* Header: nama + level */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 16, color: isUnlocked ? '#fff' : '#88aadd', fontWeight: 800 }}>
                      {evo.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: levelMet ? '#44ff88' : '#ff4444', fontWeight: 900 }}>
                      Lv. {evo.levelReq}
                    </div>
                  </div>

                  {/* Gambar MEU / ARES / Spirit */}
                  {evoImg && (
                    <div style={{
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      marginBottom: 10,
                      background: isUnlocked ? colors.bgLight : 'rgba(0,0,0,0.2)',
                      borderRadius: 8,
                      padding: '8px 0',
                      border: isUnlocked ? `1px solid ${colors.border}4d` : '1px solid rgba(255,255,255,0.05)',
                      minHeight: 120,
                    }}>
                      <img
                        src={evoImg}
                        alt={evo.name}
                        style={{
                          maxHeight: 120,
                          maxWidth: '85%',
                          objectFit: 'contain',
                          filter: !levelMet ? 'brightness(0.75) drop-shadow(0 0 5px rgba(255,255,255,0.1))' : isUnlocked ? `drop-shadow(0 0 15px ${colors.accent}) brightness(1.2)` : `drop-shadow(0 0 8px ${colors.border}) brightness(1.05)`,
                          transition: 'filter 0.3s ease',
                        }}
                      />
                    </div>
                  )}
                  
                  {/* STATS & BLUEPRINT HANGAR */}
                  {(() => {
                    if (player.race !== 'bionex' || !data.parts || !data.parts[bionexTab]) {
                      // Non-bionex or missing data, just show the hardcoded ATK/HP/CRIT
                      return (
                        <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13, fontFamily: 'var(--font-mono)', color: '#e0f4ff', flexWrap: 'wrap' }}>
                          <div><span style={{color: '#f5a623'}}>⚔️ ATK</span> +{evo.atk.toLocaleString()}</div>
                          {evo.atkPercent && <div><span style={{color: '#ff6600', fontWeight: 'bold'}}>🔥 SIEGE ATK</span> +{evo.atkPercent}%</div>}
                          <div><span style={{color: '#44ff88'}}>❤️ HP</span> +{evo.hp.toLocaleString()}</div>
                          <div><span style={{color: colors.accent}}>💥 CRIT</span> +{evo.crit}%</div>
                        </div>
                      );
                    }

                    const parts = { head: player.ascensionLoadout?.head || null, upper: player.ascensionLoadout?.upper || null, lower: player.ascensionLoadout?.lower || null, arms: player.ascensionLoadout?.arms || null, arms2: player.ascensionLoadout?.arms2 || null, options: player.ascensionLoadout?.options || null };

                    let tPT = 0, tDef = 0, tAttM = 0, tDefM = 0;
                    let tFire = 0, tWater = 0, tSoil = 0, tWind = 0;
                    let tMinAtk = 0, tMaxAtk = 0;
                    let tBoostCharge = 0, tBoostSpeed = 0;

                    Object.values(parts).forEach(p => {
                      if (!p) return;
                      tPT += (p.pt || 0);
                      tDef += (p.def || 0);
                      tAttM += (p.attM || 0);
                      tDefM += (p.defM || 0);
                      tFire += (p.fire || 0);
                      tWater += (p.water || 0);
                      tSoil += (p.soil || 0);
                      tWind += (p.wind || 0);
                      tMinAtk += (p.minAtk || 0);
                      tMaxAtk += (p.maxAtk || 0);
                      tBoostCharge += (p.boostCharge || 0);
                      tBoostSpeed += (p.boostSpeed || 0);
                    });

                    return (
                      <div style={{ marginBottom: 16 }}>
                        {/* TOTAL STATS */}
                        <div style={{ padding: 12, background: 'rgba(0,0,0,0.6)', border: `1px solid ${colors.accent}`, borderRadius: 6, marginBottom: 8 }}>
                          <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: colors.accent, marginBottom: 8, letterSpacing: 1, borderBottom: '1px dashed rgba(255,255,255,0.2)', paddingBottom: 6 }}>
                            [ TOTAL STATS ]
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13, fontFamily: 'var(--font-title)', color: '#fff', fontWeight: 800 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#44ff88' }}></div>DEF <span style={{color: '#44ff88', marginLeft: 'auto'}}>{tDef.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f5a623' }}></div>PT <span style={{color: '#f5a623', marginLeft: 'auto'}}>{tPT.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4444' }}></div>ATK <span style={{color: '#ff4444', marginLeft: 'auto'}}>{tMinAtk.toLocaleString()} - {tMaxAtk.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#88aadd' }}></div>AttM <span style={{color: '#88aadd', marginLeft: 'auto'}}>{tAttM.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#88aadd' }}></div>DefM <span style={{color: '#88aadd', marginLeft: 'auto'}}>{tDefM.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff8844' }}></div>Fire <span style={{color: '#ff8844', marginLeft: 'auto'}}>{tFire.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#44ccff' }}></div>Water <span style={{color: '#44ccff', marginLeft: 'auto'}}>{tWater.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#aadd88' }}></div>Soil <span style={{color: '#aadd88', marginLeft: 'auto'}}>{tSoil.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#dddddd' }}></div>Wind <span style={{color: '#dddddd', marginLeft: 'auto'}}>{tWind.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff44ff' }}></div>Boost <span style={{color: '#ff44ff', marginLeft: 'auto'}}>{tBoostCharge}/{tBoostSpeed}</span></div>
                          </div>
                        </div>

                        {/* ACCORDION SPARE PARTS DETAILS */}
                        <details style={{ background: 'rgba(0,0,0,0.4)', border: `1px dashed ${colors.border}80`, borderRadius: 6 }}>
                          <summary style={{ padding: 10, cursor: 'pointer', fontFamily: 'var(--font-title)', fontSize: 12, color: colors.accent, fontWeight: 800, outline: 'none' }}>
                            [ VIEW SPARE PARTS DETAILS ]
                          </summary>
                          <div style={{ padding: '0 12px 12px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                              { key: 'head', label: '1. Head', color: '#88aadd' },
                              { key: 'upper', label: '2. Core', color: '#88aadd' },
                              { key: 'lower', label: '3. Legs', color: '#88aadd' },
                              { key: 'arms', label: '4. Arms', color: '#f5a623' },
                              { key: 'arms2', label: '5. Arms-II', color: '#f5a623' },
                              { key: 'options', label: '6. Boost', color: '#44ff88' },
                            ].map((slot) => {
                              const p = parts[slot.key];
                              if (!p) return null;
                              return (
                                <div key={slot.key} style={{ borderLeft: `3px solid ${slot.color}`, paddingLeft: 10, background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '0 4px 4px 0' }}>
                                  <div style={{ color: slot.color, fontWeight: 900, fontSize: 14, marginBottom: 4 }}>
                                    {slot.label} : <span style={{ color: '#fff' }}>{p.name}</span>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 4, fontSize: 12, fontFamily: 'var(--font-title)', fontWeight: 800, color: '#b5d4f1' }}>
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
                                    {p.price !== undefined && <><div style={{ color: '#88aadd' }}>STD PRICE</div><div>{p.price.toLocaleString()} CRD</div></>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      </div>
                    );
                  })()}

                  {evo.locked ? (
                    <button
                      disabled
                      style={{
                        width: '100%',
                        padding: '10px 0',
                        background: 'rgba(255, 68, 68, 0.1)',
                        border: '1px solid rgba(255, 68, 68, 0.2)',
                        borderRadius: 6,
                        color: '#ff4444',
                        fontFamily: 'var(--font-title)',
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: 'not-allowed'
                      }}
                    >
                      🔒 LOCKED (BELUM DILIRIS)
                    </button>
                  ) : !isUnlocked ? (
                    <button
                      onClick={() => craftAscensionArms(evo, data.name)}
                      disabled={!canAfford || !levelMet}
                      style={{
                        width: '100%',
                        padding: '10px 0',
                        background: canAfford && levelMet ? `linear-gradient(90deg, ${colors.accent}, ${colors.border})` : 'rgba(255,255,255,0.05)',
                        border: canAfford && levelMet ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6,
                        color: canAfford && levelMet ? '#000' : 'rgba(255,255,255,0.3)',
                        fontFamily: 'var(--font-title)',
                        fontSize: 14,
                        fontWeight: 900,
                        cursor: canAfford && levelMet ? 'pointer' : 'not-allowed',
                        textShadow: canAfford && levelMet ? '0 1px 1px rgba(255,255,255,0.3)' : 'none'
                      }}
                    >
                      {player.race === 'arctron'
                        ? (!hasMaterial ? `BUTUH MATERIAL: ${evo.name}` : `UPGRADE & PASANG`)
                        : `UPGRADE: ${evo.costLabel}`}
                    </button>
                  ) : (
                    <div style={{
                      width: '100%', padding: '10px 0', textAlign: 'center',
                      background: colors.bg, color: colors.accent,
                      borderRadius: 6, fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 900
                    }}>
                      ✓ EQUIPPED
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          </>
          ) : player.race === 'celestra' ? (
            <AscensionSpiritShopModal colors={colors} raceData={data} player={player} />
          ) : (
            // PARTS SHOP TAB
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: 16, borderRadius: 8, border: `1px solid ${colors.border}` }}>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 16, color: '#fff', marginBottom: 12, textAlign: 'center' }}>
                {player.race === 'bionex' ? 'M.E.U. PARTS SHOP' : player.race === 'arctron' ? 'A.R.E.S. ASSEMBLY SHOP' : 'ANCIENT SPIRIT SHRINE'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#b5d4f1', textAlign: 'center', marginBottom: 20 }}>
                {player.race === 'bionex' 
                  ? "Beli dan rakit suku cadang untuk memperkuat M.E.U. kamu. Stats dari spare parts yang kamu beli akan langsung diakumulasikan ke mecha kamu!" 
                  : player.race === 'arctron'
                  ? "Siege Kit untuk Launcher — senjata pemusnah eksklusif ras Arctron. Beli dari NPC vendor di bawah ini."
                  : "Shop sedang dalam persiapan. (Segera Hadir)"}
              </div>
              
              {player.race === 'bionex' ? (
                <button
                  onClick={() => setIsShopModalOpen(true)}
                  style={{
                    width: '100%', padding: '12px 0', fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 900,
                    background: `linear-gradient(90deg, ${colors.accent}, ${colors.border})`,
                    color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer',
                    boxShadow: `0 0 10px ${colors.glow}`
                  }}
                >
                  🛒 BUKA KATALOG PARTS
                </button>
              ) : player.race === 'arctron' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* SUB-TABS: LAUNCHER vs FLAME */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    <button
                      onClick={() => setKitType('launcher')}
                      style={{
                        flex: 1, padding: '8px 0', fontSize: 11, fontFamily: 'var(--font-title)', fontWeight: 900,
                        background: kitType === 'launcher' ? `linear-gradient(90deg, ${colors.accent}, ${colors.border})` : 'rgba(0,0,0,0.4)',
                        color: kitType === 'launcher' ? '#000' : colors.accent,
                        border: `1px solid ${colors.border}`, borderRadius: 6, cursor: 'pointer'
                      }}
                    >
                      🚀 LAUNCHER (PHYSICAL)
                    </button>
                    <button
                      onClick={() => setKitType('fire')}
                      style={{
                        flex: 1, padding: '8px 0', fontSize: 11, fontFamily: 'var(--font-title)', fontWeight: 900,
                        background: kitType === 'fire' ? `linear-gradient(90deg, ${colors.accent}, ${colors.border})` : 'rgba(0,0,0,0.4)',
                        color: kitType === 'fire' ? '#000' : colors.accent,
                        border: `1px solid ${colors.border}`, borderRadius: 6, cursor: 'pointer'
                      }}
                    >
                      🔥 FLAME LAUNCHER (FIRE)
                    </button>
                  </div>

                  {[
                    {
                      lv: 32,
                      priceVal: 5000000,
                      price: '5,000,000 CRD',
                      desc: 'Basic launcher/flame thrower kit untuk pemula.',
                      options: {
                        launcher: {
                          name: 'Sonium Siege Kit',
                          type: 'Siege Kit (launcher)',
                          reqLvl: 30,
                          durability: '1,000 / 1,000',
                          effects: ['Increase Attack Power 20% Increase', 'Launcher Attack Speed 0.10 Decrease(secs)'],
                          distance: '1 - 50',
                          icon: '🚀'
                        },
                        fire: {
                          name: 'Magius Siege Kit',
                          type: 'Siege Kit (fire)',
                          reqLvl: 30,
                          durability: '1,000 / 1,000',
                          effects: ['Increase Attack Power 20% Increase', 'Launcher Attack Speed 0.10 Decrease(secs)'],
                          distance: '1 - 50',
                          icon: '🔥'
                        }
                      }
                    },
                    {
                      lv: 42,
                      priceVal: 100000000,
                      price: '100,000,000 CRD',
                      desc: 'Siege kit tingkat menengah dengan jarak tembak lebih jauh.',
                      options: {
                        launcher: {
                          name: 'Advanced Siege Kit',
                          type: 'Siege Kit (launcher)',
                          reqLvl: 40,
                          durability: '1,500 / 1,500',
                          effects: ['Increase Attack Power 40% Increase', 'Launcher Attack Speed 0.10 Decrease(secs)'],
                          distance: '1 - 57',
                          icon: '🚀'
                        },
                        fire: {
                          name: 'Advanced Flame Siege Kit',
                          type: 'Siege Kit (fire)',
                          reqLvl: 40,
                          durability: '1,500 / 1,500',
                          effects: ['Increase Attack Power 40% Increase', 'Attack Accuracy 20 Increase', 'Launcher Attack Speed 0.10 Decrease(secs)'],
                          distance: '1 - 57',
                          icon: '🔥'
                        }
                      }
                    },
                    {
                      lv: 55,
                      priceVal: 500000000,
                      price: '500,000,000 CRD',
                      desc: 'Siege kit bercahaya — daya tembak sangat tinggi.',
                      options: {
                        launcher: {
                          name: 'Shining Siege Kit',
                          type: 'Siege Kit (launcher)',
                          reqLvl: 55,
                          durability: '2,000 / 2,000',
                          effects: ['Increase Attack Power 55% Increase', 'Launcher Attack Speed 0.10 Decrease(secs)'],
                          distance: '1 - 65',
                          icon: '🚀'
                        },
                        fire: {
                          name: 'Fire Shining Siege Kit',
                          type: 'Siege Kit (fire)',
                          reqLvl: 55,
                          durability: '1,500 / 1,500',
                          effects: ['Increase Attack Power 50% Increase', 'Attack Accuracy 20 Increase', 'Curse Force Duration 10% Decrease', 'Launcher Attack Speed 0.10 Decrease(secs)'],
                          distance: '1 - 57',
                          icon: '🔥'
                        }
                      }
                    },
                    {
                      lv: 65,
                      priceVal: 2000000000,
                      price: '2,000,000,000 CRD',
                      desc: 'Siege kit elit. Senjata pamungkas Arctron.',
                      locked: true,
                      options: {
                        launcher: {
                          name: 'Adv. Shining Siege Kit',
                          type: 'Siege Kit (launcher)',
                          reqLvl: 65,
                          durability: '2,500 / 2,500',
                          effects: ['Increase Attack Power 65% Increase', 'Launcher Attack Speed 0.10 Decrease(secs)'],
                          distance: '1 - 72',
                          icon: '🚀'
                        },
                        fire: {
                          name: 'Adv. Fire Shining Siege Kit',
                          type: 'Siege Kit (fire)',
                          reqLvl: 65,
                          durability: '2,500 / 2,500',
                          effects: ['Increase Attack Power 60% Increase', 'Attack Accuracy 20 Increase', 'Curse Force Duration 10% Decrease', 'Launcher Attack Speed 0.10 Decrease(secs)'],
                          distance: '1 - 72',
                          icon: '🔥'
                        }
                      }
                    }
                  ].map((kit) => {
                    const evoId = kit.lv === 32 ? 'ares_x' : kit.lv === 42 ? 'ares_nemesis' : kit.lv === 55 ? 'ares_dominator' : 'ares_apocalypse'
                    const isMaterialOwned = (player.ownedSiegeKits || []).includes(evoId)
                    const isEquipped = player.equipment?.ascension_arms?.id === evoId
                    const canAfford = player.resources.crd >= kit.priceVal
                    const levelMet = player.level >= kit.lv

                    const opt = kit.options[kitType] || kit.options.launcher

                    const handleBuyKit = () => {
                      if (confirm(`Beli material ${opt.name} seharga ${kit.price}?`)) {
                        buySiegeKit(evoId, kit.priceVal)
                      }
                    }

                    return (
                      <div key={kit.lv} style={{ padding: 12, border: `1px solid ${colors.border}4d`, borderRadius: 8, background: isEquipped ? 'rgba(255,140,0,0.12)' : isMaterialOwned ? 'rgba(255,140,0,0.06)' : 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ fontFamily: 'var(--font-title)', fontSize: 15, color: colors.accent, fontWeight: 900 }}>
                            {kit.locked ? '🔒 ' : opt.icon + ' '}{opt.name}
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#fff', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: 4, fontWeight: 800 }}>
                            Lv.{kit.lv}
                          </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#8899aa', marginBottom: 10 }}>
                          {kit.desc}
                        </div>
                        
                        {/* RFDB SPECIFICATIONS TABLE */}
                        <div style={{ marginBottom: 12, border: '1px solid #7590b74d', borderRadius: 6, overflow: 'hidden' }}>
                          <table style={{ width: '100%', color: '#fff', fontSize: 12, fontFamily: 'var(--font-mono)', borderCollapse: 'collapse', background: '#0e1721' }}>
                            <tbody>
                              <tr style={{ borderBottom: '1px solid rgba(117,144,183,0.15)' }}>
                                <td style={{ padding: '6px 8px', color: '#7590B7', textAlign: 'right', width: '130px', fontWeight: 600 }}>Type</td>
                                <td style={{ padding: '6px 8px' }}>{opt.type}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid rgba(117,144,183,0.15)' }}>
                                <td style={{ padding: '6px 8px', color: '#7590B7', textAlign: 'right', fontWeight: 600 }}>Required Level</td>
                                <td style={{ padding: '6px 8px' }}>{opt.reqLvl}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid rgba(117,144,183,0.15)' }}>
                                <td style={{ padding: '6px 8px', color: '#7590B7', textAlign: 'right', fontWeight: 600 }}>Race</td>
                                <td style={{ padding: '6px 8px' }}>Accretia Empire</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid rgba(117,144,183,0.15)' }}>
                                <td style={{ padding: '6px 8px', color: '#7590B7', textAlign: 'right', fontWeight: 600 }}>Durability</td>
                                <td style={{ padding: '6px 8px' }}>{opt.durability}</td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid rgba(117,144,183,0.15)' }}>
                                <td style={{ padding: '6px 8px', color: '#7590B7', textAlign: 'right', fontWeight: 600, verticalAlign: 'top' }}>Special Effects</td>
                                <td style={{ padding: '6px 8px', color: '#ffcc00', fontWeight: 'bold' }}>
                                  {opt.effects.map((eff, index) => (
                                    <div key={index} style={{ marginBottom: 2 }}>• {eff}</div>
                                  ))}
                                </td>
                              </tr>
                              <tr style={{ borderBottom: '1px solid rgba(117,144,183,0.15)' }}>
                                <td style={{ padding: '6px 8px', color: '#7590B7', textAlign: 'right', fontWeight: 600 }}>Min - Max Distance</td>
                                <td style={{ padding: '6px 8px', color: '#44ccff' }}>{opt.distance}</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '6px 8px', color: '#7590B7', textAlign: 'right', fontWeight: 600 }}>Std Price</td>
                                <td style={{ padding: '6px 8px', color: '#f5a623', fontWeight: 800 }}>{kit.price}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {kit.locked ? (
                          <div style={{ padding: '6px 0', textAlign: 'center', color: '#ff4444', fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 900, background: 'rgba(255,68,68,0.1)', borderRadius: 4 }}>
                            🔒 LOCKED (BELUM DILIRIS)
                          </div>
                        ) : isEquipped ? (
                          <div style={{ padding: '6px 0', textAlign: 'center', color: '#44ff88', fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 900, background: 'rgba(68,255,136,0.1)', borderRadius: 4 }}>
                            ✓ EQUIPPED & ACTIVE
                          </div>
                        ) : isMaterialOwned ? (
                          <div style={{ padding: '6px 0', textAlign: 'center', color: '#f5a623', fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 900, background: 'rgba(245,166,35,0.1)', borderRadius: 4 }}>
                            ✓ MATERIAL OWNED (PASANG DI HANGAR)
                          </div>
                        ) : (
                          <button
                            onClick={handleBuyKit}
                            disabled={!canAfford || !levelMet}
                            style={{
                              width: '100%', padding: '8px 0', fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 900,
                              background: canAfford && levelMet ? `linear-gradient(90deg, ${colors.accent}, ${colors.border})` : 'rgba(255,255,255,0.05)',
                              color: canAfford && levelMet ? '#000' : 'rgba(255,255,255,0.3)',
                              border: 'none', borderRadius: 4, cursor: canAfford && levelMet ? 'pointer' : 'not-allowed'
                            }}
                          >
                            {!levelMet ? `BUTUH LV.${kit.lv}` : `BELI MATERIAL SIEGE KIT`}
                          </button>
                        )}
                      </div>
                    )
                  })}

                  {/* NPC VENDOR INFO */}
                  {data.npcVendors && data.npcVendors.length > 0 && (
                    <details style={{ background: 'rgba(0,0,0,0.3)', border: `1px dashed ${colors.border}80`, borderRadius: 6 }}>
                      <summary style={{ padding: 10, cursor: 'pointer', fontFamily: 'var(--font-title)', fontSize: 13, color: colors.accent, fontWeight: 800, outline: 'none' }}>
                        🏪 NPC VENDOR LOCATIONS ({data.npcVendors.length})
                      </summary>
                      <div style={{ padding: '0 12px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {data.npcVendors.map((npc, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 4, borderLeft: `3px solid ${colors.accent}` }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#fff', fontWeight: 800 }}>
                                {npc.name}
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff8c00', marginTop: 2 }}>
                                📍 {npc.location}
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#7590B7', marginTop: 2 }}>
                                {npc.info}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* ITEM PROPERTIES */}
                  <div style={{ padding: 10, background: 'rgba(255,140,0,0.06)', borderRadius: 6, border: `1px solid ${colors.border}33` }}>
                    <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: colors.accent, marginBottom: 6, fontWeight: 800 }}>
                      📋 ITEM PROPERTIES
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#b5d4f1' }}>
                      <div>Trade to Player: <span style={{ color: '#44ff88' }}>✓ Yes</span></div>
                      <div>Sell to NPC: <span style={{ color: '#44ff88' }}>✓ Yes</span></div>
                      <div>Drop to Ground: <span style={{ color: '#44ff88' }}>✓ Yes</span></div>
                      <div>Store to Bank: <span style={{ color: '#44ff88' }}>✓ Yes</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 20, textAlign: 'center', color: '#ff4444', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
                  [ OUT OF STOCK ]
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {isShopModalOpen && <AscensionShopModal onClose={() => setIsShopModalOpen(false)} colors={colors} raceData={data} player={player} bionexTab={bionexTab} />}
    </div>
  )
}
const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)', background: 'linear-gradient(180deg, #030814 0%, #050d1f 100%)' },
  resBar: { display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)' },
  chip: (c) => ({ background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 20, padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: c }),
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#7ab0d0', fontFamily: 'var(--font-body)', fontSize: 13, textAlign: 'center', gap: 10 }
}



