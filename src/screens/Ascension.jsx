import React from 'react'
import { useGameStore } from '../store/gameStore'
import ascensionData from '../data/ascensionArms.json'
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
  // Celestra Ancient Spirit
  spirit_sylph:     '/assets/celestra_mystic_female.png?v=2',
  spirit_sanctus:   '/assets/celestra_mystic_male.png?v=2',
  spirit_seraph:    '/assets/celestra_specialist_female.png?v=2',
  spirit_empyrean:  '/assets/celestra_specialist_male.png?v=2',
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

          {/* COMPONENTS SECTION */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 16, color: colors.accent, marginBottom: 12, fontWeight: 800, borderBottom: `1px solid ${colors.border}4d`, paddingBottom: 6 }}>
              {data.componentsTitle}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#88aadd' }}>Component</th>
                  <th style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#88aadd' }}>Harga</th>
                </tr>
              </thead>
              <tbody>
                {data.components.map((c, i) => (
                  <tr key={i}>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '6px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: colors.border, textAlign: 'right', fontWeight: 800 }}>{c.cost.toLocaleString()} CRD</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 12, fontFamily: 'var(--font-title)', fontSize: 14, color: '#ffcc00', fontWeight: 900 }}>
              {data.totalLabel}: 5,000,000 CRD
            </div>
          </div>

          <div style={{ fontFamily: 'var(--font-title)', fontSize: 16, color: colors.accent, marginBottom: 12, fontWeight: 800, borderBottom: `1px solid ${colors.border}4d`, paddingBottom: 6 }}>
            {data.name} Evolution
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.evolutions.map((evo, i) => {
              const isUnlocked = player.equipment?.ascension_arms?.id === evo.id
              const canAfford = player.resources.crd >= evo.cost
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
                          filter: !levelMet ? 'grayscale(70%) brightness(0.6)' : isUnlocked ? `drop-shadow(0 0 12px ${colors.accent})` : 'none',
                          transition: 'filter 0.3s ease',
                        }}
                      />
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13, fontFamily: 'var(--font-mono)', color: '#e0f4ff', flexWrap: 'wrap' }}>
                    <div><span style={{color: '#f5a623'}}>⚔️ ATK</span> +{evo.atk.toLocaleString()}</div>
                    <div><span style={{color: '#44ff88'}}>❤️ HP</span> +{evo.hp.toLocaleString()}</div>
                    <div><span style={{color: colors.accent}}>💥 CRIT</span> +{evo.crit}%</div>
                  </div>

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
                      UPGRADE: {evo.costLabel}
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
        </div>
      </div>
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)', background: 'linear-gradient(180deg, #030814 0%, #050d1f 100%)' },
  resBar: { display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)' },
  chip: (c) => ({ background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 20, padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: c }),
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#7ab0d0', fontFamily: 'var(--font-body)', fontSize: 13, textAlign: 'center', gap: 10 }
}
