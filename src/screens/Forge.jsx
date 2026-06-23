import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import upgradesConfig from '../data/upgrades.json'
import itemsData from '../data/items.json'
import { getWeaponRarityDisplayName, getWeaponRarityColor } from '../lib/rarity'

export default function Forge() {
  const player = useGameStore((s) => s.player)
  const upgrade = useGameStore((s) => s.upgrade)
  const getStats = useGameStore((s) => s.getStats)
  const getUpgradeCost = useGameStore((s) => s.getUpgradeCost)
  const refineWeapon = useGameStore((s) => s.refineWeapon)
  const combineWeapon = useGameStore((s) => s.combineWeapon)
  const craftArchonItem = useGameStore((s) => s.craftArchonItem)

  const [activeTab, setActiveTab] = useState('upgrade') // 'upgrade' | 'archon' | 'refine'
  const [selectedSacrificeUid, setSelectedSacrificeUid] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [sparks, setSparks] = useState([])

  const stats = getStats()

  // Archon Items for Player's Race
  const archonItems = player.race
    ? itemsData.items.filter(it => it.id.startsWith(`archon_${player.race}`))
    : []

  const ARCHON_RECIPES = {
    archon_belterra_helmet: { materials: { mat_carbon: 10, mat_mecha: 5, mat_aether: 3 }, anium: 15000 },
    archon_belterra_gloves: { materials: { mat_carbon: 10, mat_mecha: 5, mat_aether: 3 }, anium: 15000 },
    archon_belterra_boots: { materials: { mat_carbon: 10, mat_mecha: 5, mat_aether: 3 }, anium: 15000 },
    archon_belterra_armor: { materials: { mat_carbon: 15, mat_mecha: 8, mat_aether: 5, mat_warlord: 1 }, anium: 25000 },
    archon_belterra_mantle: { materials: { mat_carbon: 15, mat_mecha: 8, mat_aether: 5, mat_warlord: 1 }, anium: 25000 },
    archon_belterra_weapon: { materials: { mat_carbon: 15, mat_mecha: 8, mat_aether: 5, mat_warlord: 1 }, anium: 25000 },

    archon_coralis_helmet: { materials: { mat_carbon: 10, mat_mecha: 5, mat_aether: 3 }, anium: 15000 },
    archon_coralis_gloves: { materials: { mat_carbon: 10, mat_mecha: 5, mat_aether: 3 }, anium: 15000 },
    archon_coralis_boots: { materials: { mat_carbon: 10, mat_mecha: 5, mat_aether: 3 }, anium: 15000 },
    archon_coralis_armor: { materials: { mat_carbon: 15, mat_mecha: 8, mat_aether: 5, mat_warlord: 1 }, anium: 25000 },
    archon_coralis_mantle: { materials: { mat_carbon: 15, mat_mecha: 8, mat_aether: 5, mat_warlord: 1 }, anium: 25000 },
    archon_coralis_weapon: { materials: { mat_carbon: 15, mat_mecha: 8, mat_aether: 5, mat_warlord: 1 }, anium: 25000 },

    archon_acreton_helmet: { materials: { mat_carbon: 10, mat_mecha: 5, mat_aether: 3 }, anium: 15000 },
    archon_acreton_gloves: { materials: { mat_carbon: 10, mat_mecha: 5, mat_aether: 3 }, anium: 15000 },
    archon_acreton_boots: { materials: { mat_carbon: 10, mat_mecha: 5, mat_aether: 3 }, anium: 15000 },
    archon_acreton_armor: { materials: { mat_carbon: 15, mat_mecha: 8, mat_aether: 5, mat_warlord: 1 }, anium: 25000 },
    archon_acreton_mantle: { materials: { mat_carbon: 15, mat_mecha: 8, mat_aether: 5, mat_warlord: 1 }, anium: 25000 },
    archon_acreton_weapon: { materials: { mat_carbon: 15, mat_mecha: 8, mat_aether: 5, mat_warlord: 1 }, anium: 25000 }
  }

  const getMaterialStatus = (matId, reqAmount) => {
    const owned = player.inventory.filter(it => it.id === matId).length
    const matTemplate = itemsData.items.find(it => it.id === matId)
    const name = matTemplate ? matTemplate.name : matId
    const emoji = matTemplate ? matTemplate.emoji : '📦'
    return { name, emoji, owned, required: reqAmount, satisfied: owned >= reqAmount }
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

  return (
    <div style={styles.screen}>
      <div style={styles.resBar}>
        <span style={styles.chip('#f5a623')}>⬡ {player.resources.anium.toLocaleString()}</span>
        <span style={styles.chip('#00e5ff')}>◈ {player.resources.credits}</span>
      </div>

      <div style={styles.tabs}>
        <div style={activeTab === 'upgrade' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('upgrade')}>UPGRADE STATS</div>
        <div style={activeTab === 'archon' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('archon')}>ARCHON FORGE</div>
        <div style={activeTab === 'refine' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('refine')}>WEAPON SMITH</div>
      </div>

      {/* UPGRADE STATS TAB */}
      {activeTab === 'upgrade' && (
        <div style={{ padding: '0 16px' }}>
          {Object.entries(upgradesConfig).map(([key, cfg]) => {
            const level = player.upgrades[key]
            const cost = getUpgradeCost(key)
            const canAfford = player.resources.anium >= cost
            const currentVal = stats[cfg.statKey]

            return (
              <div key={key} className={`glass-panel cyber-panel panel-${key === 'atk' ? 'orange' : key === 'def' ? 'cyan' : 'red'}`} style={styles.card}>
                <div style={{ ...styles.cardTitle, color: cfg.color }}>{cfg.emoji} {cfg.label} Upgrade</div>
                <div style={styles.statRow}>
                  Current: <strong style={{ color: cfg.color }}>{currentVal?.toLocaleString()}</strong>
                  &nbsp;|&nbsp; Stage: Lv.{level}
                  &nbsp;|&nbsp; Next: +{cfg.perLevel}
                </div>
                <button
                  style={styles.upgradeBtn(cfg.color, canAfford)}
                  onClick={() => upgrade(key)}
                  disabled={!canAfford || !player.race}
                >
                  {player.race
                    ? canAfford
                      ? `UPGRADE (${cost.toLocaleString()} ANIUM)`
                      : `NEED ${(cost - player.resources.anium).toLocaleString()} MORE ⬡`
                    : 'SELECT RACE FIRST'
                  }
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* ARCHON FORGE TAB */}
      {activeTab === 'archon' && (
        <div style={{ padding: '0 16px' }}>
          {!player.race ? (
            <div style={styles.empty}>Silakan pilih Ras terlebih dahulu untuk mengakses Archon Forge.</div>
          ) : (
            <div>
              <div style={styles.introHeader}>
                FORGE ARCHON SET ({player.race.toUpperCase()})
                <div style={{ fontSize: 13, color: '#88aadd', marginTop: 4, textTransform: 'none', fontWeight: 600 }}>
                  Kumpulkan material langka untuk menempa 6 bagian set perlengkapan legendaris Archon. Lengkapi semuanya untuk membuka stat bonus +30% HP/Defense/Attack!
                </div>
              </div>

              {archonItems.map(item => {
                const recipe = ARCHON_RECIPES[item.id]
                if (!recipe) return null

                // Check materials satisfaction
                let allMaterialsSatisfied = true
                const materialsList = Object.entries(recipe.materials).map(([matId, amount]) => {
                  const status = getMaterialStatus(matId, amount)
                  if (!status.satisfied) allMaterialsSatisfied = false
                  return status
                })

                const canCraft = allMaterialsSatisfied && player.resources.anium >= recipe.anium

                return (
                  <div key={item.id} className="glass-panel cyber-panel panel-orange" style={styles.forgeCard}>
                    <div style={styles.forgeHeader}>
                      {item.image ? (
                        <img referrerPolicy="no-referrer" src={item.image} style={{ width: 24, height: 24, objectFit: 'contain' }} alt={item.name} />
                      ) : (
                        <span style={{ fontSize: 24 }}>{item.emoji}</span>
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={styles.forgeItemName}>{item.name}</div>
                        <div style={styles.forgeItemSlot}>{item.type.toUpperCase()} · REQUIREMENT: LV.55</div>
                      </div>
                    </div>

                    {/* SVG Drawn Recipe Tree */}
                    <div style={styles.recipeTreeWrapper}>
                      <div style={styles.recipeInputs}>
                        {materialsList.map((m, idx) => (
                          <div key={idx} style={styles.ingredientBadge(m.satisfied)}>
                            <span>{m.emoji} {m.name}</span>
                            <span style={{ fontFamily: 'monospace' }}>{m.owned}/{m.required}</span>
                          </div>
                        ))}
                        <div style={styles.ingredientBadge(player.resources.anium >= recipe.anium)}>
                          <span>⬡ Anium</span>
                          <span style={{ fontFamily: 'monospace' }}>{recipe.anium.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Connecting Paths */}
                      <div style={styles.recipeConnectors}>
                        <svg width="40" height={100} style={{ display: 'block' }}>
                          <defs>
                            <filter id="green-glow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="2" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          {/* Curved bezier paths from materials (left) to item (right) */}
                          {materialsList.map((m, idx) => {
                            const yStart = 15 + idx * 24
                            const yEnd = 50
                            const strokeColor = m.satisfied ? '#39ff14' : 'rgba(0, 229, 255, 0.15)'
                            const glow = m.satisfied ? 'url(#green-glow)' : 'none'
                            return (
                              <path
                                key={idx}
                                d={`M 0,${yStart} C 20,${yStart} 20,${yEnd} 40,${yEnd}`}
                                fill="transparent"
                                stroke={strokeColor}
                                strokeWidth="2"
                                filter={glow}
                                style={{ transition: 'all 0.5s' }}
                              />
                            )
                          })}
                        </svg>
                      </div>

                      <div style={styles.recipeOutput}>
                        <div style={styles.outputSlot(canCraft)}>
                            {item.image ? (
                              <img referrerPolicy="no-referrer" src={item.image} style={{ width: 28, height: 28, objectFit: 'contain' }} alt={item.name} />
                            ) : (
                              <span style={{ fontSize: 28 }}>{item.emoji}</span>
                            )}
                          <span style={{ fontSize: 11, color: '#4a8fa8', fontWeight: 800 }}>READY</span>
                        </div>
                      </div>
                    </div>

                    <button
                      style={styles.forgeBtn(canCraft)}
                      disabled={!canCraft}
                      onClick={() => craftArchonItem(item.id)}
                    >
                      {canCraft ? 'TEMPA ITEM ARCHON' : 'BAHAN TIDAK CUKUP'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* WEAPON SMITH TAB */}
      {activeTab === 'refine' && (
        <div style={{ padding: '0 16px' }}>
          {!equippedWeapon ? (
            <div style={styles.empty}>
              <div style={{ fontSize: 32 }}>⚠️</div>
              <div>Anda tidak memiliki senjata yang dilengkapi.</div>
              <div style={{ fontSize: 13, color: '#4a8fa8', marginTop: 4 }}>
                Lengkapi senjata di layar <strong>Cargo</strong> terlebih dahulu untuk melakukan Weapon Refining & Combining.
              </div>
            </div>
          ) : (
            <div>
              {/* REFINEMENT PANEL */}
              <div className="glass-panel cyber-panel panel-cyan" style={styles.refinePanel}>
                <div style={styles.sectionTitle}>▸ WEAPON RARITY REFINEMENT</div>
                
                {/* Central Tempering Chamber Display */}
                <div style={styles.temperingChamber}>
                  <div style={styles.chamberRing(isRefining)}>
                    <svg width="110" height="110" style={styles.chamberSvg(isRefining)}>
                      <circle cx="55" cy="55" r="46" fill="transparent" stroke="var(--neon-glow)" strokeWidth="1.5" strokeDasharray="6,4" />
                      <circle cx="55" cy="55" r="38" fill="transparent" stroke="var(--neon-glow)" strokeWidth="1" strokeDasharray="30,8" />
                    </svg>
                    <div style={styles.chamberSlot}>
                      {equippedWeapon.image ? (
                        <img referrerPolicy="no-referrer" src={equippedWeapon.image} style={{ width: 36, height: 36, objectFit: 'contain' }} alt={equippedWeapon.name} />
                      ) : (
                        <span style={{ fontSize: 36 }}>{equippedWeapon.emoji}</span>
                      )}
                    </div>

                    {/* Sparks */}
                    {isRefining && sparks.map(s => (
                      <div
                        key={s.id}
                        className="spark-particle"
                        style={{
                          transform: `rotate(${s.angle}deg) translate(${s.dist}px) scale(${s.scale})`
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <div style={styles.wepName}>{equippedWeapon.name}</div>
                    <div style={{ ...styles.wepRarity, color: getWeaponRarityColor(equippedWeapon.rarityGrade || equippedWeapon.rarity) }}>
                      Grade: {getWeaponRarityDisplayName(equippedWeapon.rarityGrade || equippedWeapon.rarity)}
                    </div>
                  </div>
                </div>

                <div style={styles.refineDetails}>
                  {(() => {
                    const grade = (equippedWeapon.rarityGrade || 'normal').toLowerCase()
                    const cost = REFINE_COSTS[grade]
                    if (!cost) {
                      return <div style={styles.maxGradeMsg}>⭐ Senjata Anda telah mencapai tingkat maksimal (Mythic)!</div>
                    }

                    const hasTalics = ownedIgnorance >= cost.talics
                    const hasAnium = player.resources.anium >= cost.anium
                    const canUpgrade = hasTalics && hasAnium

                    return (
                      <div>
                        <div style={styles.refineNextGrade}>
                          NEXT GRADE: <span style={{ color: getWeaponRarityColor(cost.next), fontWeight: 'bold' }}>{cost.next.toUpperCase()}</span> (+{cost.next === 'advanced' ? '5%' : cost.next === 'rare' ? '10%' : cost.next === 'epic' ? '15%' : cost.next === 'legendary' ? '20%' : '30%'} bonus ATK)
                        </div>

                        {/* Visual connections list */}
                        <div style={styles.refineCosts}>
                          <div style={styles.costItem(hasTalics)}>
                            <span>🔺 Ignorance Talic</span>
                            <span>{ownedIgnorance} / {cost.talics}</span>
                          </div>
                          <div style={styles.costItem(hasAnium)}>
                            <span>⬡ Anium</span>
                            <span>{cost.anium.toLocaleString()}</span>
                          </div>
                        </div>

                        <button style={styles.smithBtn(canUpgrade)} disabled={!canUpgrade} onClick={handleRefine}>
                          UPGRADE KELANGKAAN SENJATA
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* COMBINING PANEL */}
              <div className="glass-panel cyber-panel panel-orange" style={styles.combinePanel}>
                <div style={styles.sectionTitle}>▸ CRAFT VAMPIRIC WEAPON</div>
                <div style={{ fontSize: 13, color: '#88aadd', marginBottom: 12 }}>
                  Gabungkan senjata <strong>Epic atau lebih tinggi</strong> dengan senjata tumbal sejenis dan <strong>Favor Talics</strong> untuk menambahkan properti **Vampire** (+10% HP total & 10% Lifesteal serangan).
                </div>

                {equippedWeapon.specialProperty === 'vampire' ? (
                  <div style={styles.vampireActive}>
                    🩸 Senjata ini telah diberkati dengan kekuatan **Vampire**!
                  </div>
                ) : !isEpicOrHigher(equippedWeapon) ? (
                  <div style={styles.warningBox}>
                    ⚠️ Senjata yang Anda lengkapi harus berperingkat **Epic** atau lebih tinggi untuk ditransformasi menjadi Vampiric.
                  </div>
                ) : (
                  <div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>PILIH SENJATA TUMBAL (EPIC+ DI INVENTORI):</label>
                      <select
                        value={selectedSacrificeUid}
                        onChange={(e) => setSelectedSacrificeUid(e.target.value)}
                        style={styles.select}
                      >
                        <option value="">-- Pilih Senjata Tumbal --</option>
                        {sacrificePool.map(it => (
                          <option key={it.uid} value={it.uid}>
                            {it.emoji} {it.name} (Lv.{it.level})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.refineCosts}>
                      <div style={styles.costItem(sacrificePool.length > 0)}>
                        <span>🗡️ Sacrifice Weapon</span>
                        <span>{selectedSacrificeUid ? '1/1' : '0/1'}</span>
                      </div>
                      <div style={styles.costItem(ownedFavor >= 1)}>
                        <span>🔺 Favor Talic</span>
                        <span>{ownedFavor} / 1</span>
                      </div>
                    </div>

                    <button
                      style={styles.smithBtn(selectedSacrificeUid && ownedFavor >= 1)}
                      disabled={!selectedSacrificeUid || ownedFavor < 1}
                      onClick={handleCombine}
                    >
                      FORGE VAMPIRIC WEAPON
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)', paddingBottom: 80 },
  resBar: { display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(0, 229, 255, 0.15)', background: 'rgba(3, 8, 20, 0.4)' },
  chip: (c) => ({ background: 'rgba(3, 8, 20, 0.8)', border: `1px solid ${c}`, borderRadius: 20, padding: '4px 10px', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: c }),
  tabs: { display: 'flex', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', background: 'rgba(3, 8, 20, 0.4)', marginBottom: 12 },
  tab: { flex: 1, padding: '10px 4px', textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1, color: '#4a8fa8', fontWeight: 800, cursor: 'pointer' },
  tabActive: { flex: 1, padding: '10px 4px', textAlign: 'center', fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1, color: '#f5a623', borderBottom: '2px solid #f5a623', fontWeight: 800, cursor: 'pointer' },
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
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#7ab0d0', fontFamily: 'var(--font-body)', fontSize: 13, textAlign: 'center', gap: 10 },
  introHeader: { fontFamily: 'var(--font-title)', fontSize: 14, color: '#f5a623', letterSpacing: 1, marginBottom: 12, borderBottom: '1px solid rgba(0,229,255,0.15)', paddingBottom: 8 },
  forgeCard: { margin: '0 0 12px 0', padding: 14 },
  forgeHeader: { display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 },
  forgeItemName: { fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 800, color: '#fff' },
  forgeItemSlot: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#4a8fa8', marginTop: 2, fontWeight: 700 },
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
