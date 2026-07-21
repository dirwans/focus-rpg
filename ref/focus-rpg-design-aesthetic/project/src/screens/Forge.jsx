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

  const [activeTab, setActiveTab] = useState('upgrade') // 'upgrade' | 'refine' | 'enhance'
  const [selectedSacrificeUid, setSelectedSacrificeUid] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [sparks, setSparks] = useState([])

  // Enhancement States
  const [selectedEnhanceSlot, setSelectedEnhanceSlot] = useState('')
  const [useLuckyRelic, setUseLuckyRelic] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhanceResult, setEnhanceResult] = useState(null)

  const stats = getStats()


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
    <div style={styles.screen}>
      <div style={styles.resBar}>
        <button onClick={() => useGameStore.getState().setScreen('main')} style={{background:'transparent', border:'none', color:'#00e5ff', fontSize: 20, cursor:'pointer', padding: '0 8px 0 0', display:'flex', alignItems:'center'}}>❮</button>
        <span style={styles.chip('#f5a623')}>⬡ {player.resources.anium.toLocaleString()}</span>
        <span style={styles.chip('#00e5ff')}>◈ {player.resources.credits}</span>
      </div>

      <div className="no-scrollbar" style={styles.tabs}>
        <div style={activeTab === 'upgrade' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('upgrade')}>{t('upgrade_stats_tab')}</div>
        <div style={activeTab === 'refine' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('refine')}>{t('weapon_smith_tab')}</div>
        <div style={activeTab === 'enhance' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('enhance')}>{t('item_enhancement_tab')}</div>
        <div style={activeTab === 'legendary' ? {...styles.tabActive, color: '#f5a623', borderBottomColor: '#f5a623'} : styles.tab} onClick={() => setActiveTab('legendary')}>⚔️ LEGENDARY</div>
        <div style={activeTab === 'setshop' ? {...styles.tabActive, color: '#cc44ff', borderBottomColor: '#cc44ff'} : styles.tab} onClick={() => setActiveTab('setshop')}>👑 SET SHOP</div>
      </div>


      {/* UPGRADE STATS TAB */}
      {activeTab === 'upgrade' && (
        <div style={{ padding: '0 16px' }}>
          {Object.entries(upgradesConfig).map(([key, cfg]) => {
            const level = player.upgrades?.[key] || 0
            const cost = getUpgradeCost(key)
            const canAfford = player.resources.anium >= cost
            const currentVal = stats[cfg.statKey]

            return (
              <div key={key} className={`glass-panel cyber-panel panel-${key === 'atk' ? 'orange' : key === 'def' ? 'cyan' : 'red'}`} style={styles.card}>
                <div style={{ ...styles.cardTitle, color: cfg.color }}>{t('upgrade_title', { emoji: cfg.emoji, label: cfg.label })}</div>
                <div style={styles.statRow}>
                  {t('upgrade_current', { val: currentVal?.toLocaleString(), level: level, next: cfg.perLevel })}
                </div>
                <button
                  style={styles.upgradeBtn(cfg.color, canAfford)}
                  onClick={() => upgrade(key)}
                  disabled={!canAfford || !player.race}
                >
                  {player.race
                    ? canAfford
                      ? t('upgrade_btn_label', { cost: cost.toLocaleString() })
                      : t('upgrade_need_more', { need: (cost - player.resources.anium).toLocaleString() })
                    : t('select_race_first')
                  }
                </button>
              </div>
            )
          })}
        </div>
      )}


      {/* WEAPON SMITH TAB */}
      {activeTab === 'refine' && (
        <div style={{ padding: '0 16px' }}>
          {!equippedWeapon ? (
            <div style={styles.empty}>
              <div style={{ fontSize: 32 }}>⚠️</div>
              <div>{t('no_weapon_equipped')}</div>
              <div style={{ fontSize: 13, color: '#7ec8e3', marginTop: 4 }}>
                {t('no_weapon_equipped_desc')}
              </div>
            </div>
          ) : (
            <div>
              {/* REFINEMENT PANEL */}
              <div style={{ ...styles.sectionTitle, paddingLeft: 8, marginBottom: 8 }}>{t('weapon_rarity_refinement')}</div>
              <div className="glass-panel cyber-panel panel-cyan" style={{ ...styles.refinePanel, marginTop: 0 }}>
                
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
                      return <div style={styles.maxGradeMsg}>{t('max_grade_reached')}</div>
                    }

                    const hasTalics = ownedIgnorance >= cost.talics
                    const hasAnium = player.resources.anium >= cost.anium
                    const canUpgrade = hasTalics && hasAnium

                    return (
                      <div>
                        <div style={styles.refineNextGrade}>
                          {t('next_grade', { grade: cost.next.toUpperCase(), pct: cost.next === 'advanced' ? '5' : cost.next === 'rare' ? '10' : cost.next === 'epic' ? '15' : cost.next === 'legendary' ? '20' : '30' })}
                        </div>

                        {/* Visual connections list */}
                        <div style={styles.refineCosts}>
                          <div style={styles.costItem(hasTalics)}>
                            <span>{t('talic_ignorance_label')}</span>
                            <span>{ownedIgnorance} / {cost.talics}</span>
                          </div>
                          <div style={styles.costItem(hasAnium)}>
                            <span>{t('anium_cost_label')}</span>
                            <span>{cost.anium.toLocaleString()}</span>
                          </div>
                        </div>

                        <button style={styles.smithBtn(canUpgrade)} disabled={!canUpgrade} onClick={handleRefine}>
                          {t('refine_btn')}
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </div>


              {/* COMBINING PANEL */}
              <div style={{ ...styles.sectionTitle, paddingLeft: 8, marginBottom: 8, marginTop: 16 }}>{t('craft_vampiric_weapon')}</div>
              <div className="glass-panel cyber-panel panel-orange" style={{ ...styles.combinePanel, marginTop: 0 }}>
                <div style={{ fontSize: 13, color: '#88aadd', marginBottom: 12 }}>
                  {t('craft_vampiric_desc')}
                </div>

                {equippedWeapon.specialProperty === 'vampire' ? (
                  <div style={styles.vampireActive}>
                    {t('vampire_active')}
                  </div>
                ) : !isEpicOrHigher(equippedWeapon) ? (
                  <div style={styles.warningBox}>
                    {t('vampire_epic_required')}
                  </div>
                ) : (
                  <div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>{t('select_sacrifice_wep')}</label>
                      <select
                        value={selectedSacrificeUid}
                        onChange={(e) => setSelectedSacrificeUid(e.target.value)}
                        style={styles.select}
                      >
                        <option value="">{t('choose_sacrifice_wep')}</option>
                        {sacrificePool.map(it => (
                          <option key={it.uid} value={it.uid}>
                            {it.emoji} {it.name} (Lv.{it.level})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.refineCosts}>
                      <div style={styles.costItem(sacrificePool.length > 0)}>
                        <span>{t('sacrifice_weapon_label')}</span>
                        <span>{selectedSacrificeUid ? '1/1' : '0/1'}</span>
                      </div>
                      <div style={styles.costItem(ownedFavor >= 1)}>
                        <span>{t('talic_favor_label')}</span>
                        <span>{ownedFavor} / 1</span>
                      </div>
                    </div>

                    <button
                      style={styles.smithBtn(selectedSacrificeUid && ownedFavor >= 1)}
                      disabled={!selectedSacrificeUid || ownedFavor < 1}
                      onClick={handleCombine}
                    >
                      {t('forge_vampiric_btn')}
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}

      {/* ENHANCEMENT TAB */}
      {activeTab === 'enhance' && (
        <div style={{ padding: '0 16px' }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('select_equip_to_enhance')}</label>
            <select
              value={selectedEnhanceSlot}
              onChange={(e) => {
                setSelectedEnhanceSlot(e.target.value)
                setEnhanceResult(null)
              }}
              style={styles.select}
            >
              <option value="">{t('choose_equip_slot')}</option>
              {player.equipment && Object.entries(player.equipment).map(([slot, item]) => {
                if (!item || ['amulet1', 'amulet2', 'ring1', 'ring2', 'ascension_arms'].includes(slot)) return null
                return (
                  <option key={slot} value={slot}>
                    {slot.toUpperCase()}: {item.emoji} {item.name} (+{item.enhancement || 0})
                  </option>
                )
              })}
            </select>
          </div>

          {/* Result notification */}
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

          {selectedEnhanceSlot && player.equipment?.[selectedEnhanceSlot] ? (() => {
            const item = player.equipment[selectedEnhanceSlot]
            const currentEnh = item.enhancement || 0
            const maxed = currentEnh >= 8

            // Costs
            const DIVINE_CREST_COSTS = [20, 40, 60, 80, 100, 120, 150, 200]
            const crestCost = DIVINE_CREST_COSTS[currentEnh] || 0
            
            // Owned materials
            const arcaniteOwned = player.inventory.filter(it => it.id === 'mat_arcanite').length
            const crestOwned = player.inventory.filter(it => it.id === 'mat_divine_crest').length
            const relicOwned = player.inventory.filter(it => it.id === 'mat_lucky_relic').length

            // Rates: +1 (100%), +2 (90%), +3 (70%), +4 (50%), +5 (35%), +6 (20%), +7 (10%), +8 (5%)
            const BASE_SUCCESS_RATES = [100, 90, 70, 50, 35, 20, 10, 5]
            const baseRate = BASE_SUCCESS_RATES[currentEnh] || 0
            const finalRate = useLuckyRelic ? Math.min(100, baseRate + 10) : baseRate

            // Validity checks
            const hasArcanite = arcaniteOwned >= 1
            const hasCrests = crestOwned >= crestCost
            const hasRelic = !useLuckyRelic || relicOwned >= 1
            const canAfford = hasArcanite && hasCrests && hasRelic && !maxed

            return (
              <div className="glass-panel cyber-panel panel-cyan" style={{ padding: 14, marginBottom: 12 }}>
                {/* Central Tempering Chamber Display */}
                <div style={styles.temperingChamber}>
                  <div style={styles.chamberRing(isEnhancing)}>
                    <svg width="110" height="110" style={styles.chamberSvg(isEnhancing)}>
                      <circle cx="55" cy="55" r="46" fill="transparent" stroke="var(--neon-glow)" strokeWidth="1.5" strokeDasharray="6,4" />
                      <circle cx="55" cy="55" r="38" fill="transparent" stroke="var(--neon-glow)" strokeWidth="1" strokeDasharray="30,8" />
                    </svg>
                    <div style={styles.chamberSlot}>
                      {item.image ? (
                        <img referrerPolicy="no-referrer" src={item.image} style={{ width: 36, height: 36, objectFit: 'contain' }} alt={item.name} />
                      ) : (
                        <span style={{ fontSize: 36 }}>{item.emoji}</span>
                      )}
                    </div>

                    {/* Sparks */}
                    {(isEnhancing || isRefining) && sparks.map(s => (
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
                    <div style={styles.wepName}>{item.name} <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>+{currentEnh}</span></div>
                    <div style={{ fontSize: 13, color: '#88aadd', marginTop: 4 }}>
                      Slot: {selectedEnhanceSlot.toUpperCase()}
                    </div>
                  </div>
                </div>

                {maxed ? (
                  <div style={styles.maxGradeMsg}>⭐ Maximum enhancement level (+8) reached!</div>
                ) : (
                  <div>
                    {/* Stat changes preview */}
                    <div style={{ ...styles.refineCosts, background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.1)', padding: 10, marginBottom: 12 }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#e0f4ff', fontWeight: 'bold', marginBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4 }}>
                        📈 STATS PREVIEW (+{currentEnh} ➜ +{currentEnh + 1}):
                      </div>
                      {item.type === 'weapon' ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 13, color: '#fff' }}>
                          <span>ATK Bonus:</span>
                          <span>
                            {Math.floor((item.bonus?.atk || 0) * (1 + currentEnh * 0.1))} ➜ <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{Math.floor((item.bonus?.atk || 0) * (1 + (currentEnh + 1) * 0.1))}</span>
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 13, color: '#fff' }}>
                            <span>DEF Bonus:</span>
                            <span>
                              {Math.floor((item.bonus?.def || 0) * (1 + currentEnh * 0.1))} ➜ <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{Math.floor((item.bonus?.def || 0) * (1 + (currentEnh + 1) * 0.1))}</span>
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 13, color: '#fff' }}>
                            <span>HP Bonus:</span>
                            <span>
                              {Math.floor((item.bonus?.hp || 0) * (1 + currentEnh * 0.1))} ➜ <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{Math.floor((item.bonus?.hp || 0) * (1 + (currentEnh + 1) * 0.1))}</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Success Rate */}
                    <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#ffcc00', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Success Rate:</span>
                      <span style={{ fontWeight: 'bold' }}>{finalRate}% {useLuckyRelic && <span style={{ fontSize: 11, color: '#00ff88' }}>(+10% Boosted)</span>}</span>
                    </div>

                    {/* Destruction Warning Alert */}
                    {currentEnh >= 5 && (
                      <div style={{
                        background: 'rgba(255, 68, 68, 0.15)',
                        border: '1.5px dashed #ff4444',
                        color: '#ff6666',
                        padding: '10px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        marginBottom: 12,
                        textAlign: 'center',
                        lineHeight: 1.4,
                        boxShadow: '0 0 10px rgba(255, 68, 68, 0.2)'
                      }}>
                        {t('enhance_destroy_warning')}
                      </div>
                    )}

                    {/* Checkbox Lucky Relic */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <input
                        type="checkbox"
                        id="useLuckyRelic"
                        checked={useLuckyRelic}
                        onChange={(e) => setUseLuckyRelic(e.target.checked)}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                      <label htmlFor="useLuckyRelic" style={{ fontFamily: 'monospace', fontSize: 13, color: '#fff', cursor: 'pointer', userSelect: 'none' }}>
                        {t('lucky_relic_shield_label')}
                      </label>
                    </div>

                    {/* Materials Display */}
                    <div style={{ ...styles.sectionTitle, marginBottom: 6 }}>REQUIRED MATERIALS</div>
                    <div style={styles.refineCosts}>
                      <div style={styles.costItem(hasArcanite)}>
                        <span>{t('mat_arcanite_label')}</span>
                        <span>{arcaniteOwned} / 1</span>
                      </div>
                      <div style={styles.costItem(hasCrests)}>
                        <span>{t('mat_divine_crest_label')}</span>
                        <span>{crestOwned} / {crestCost}</span>
                      </div>
                      {useLuckyRelic && (
                        <div style={styles.costItem(hasRelic)}>
                          <span>{t('mat_lucky_relic_label')}</span>
                          <span>{relicOwned} / 1</span>
                        </div>
                      )}
                    </div>



                    <button
                      style={styles.smithBtn(canAfford && !isEnhancing)}
                      disabled={!canAfford || isEnhancing}
                      onClick={handleEnhance}
                    >
                      {isEnhancing ? 'ENHANCING...' : t('enhance_btn_label')}
                    </button>
                  </div>
                )}
              </div>
            )
          })() : (
            <div style={styles.empty}>
              <div style={{ fontSize: 32 }}>🛡️</div>
              <div>No item selected.</div>
              <div style={{ fontSize: 13, color: '#7ec8e3', marginTop: 4 }}>
                Select an equipped weapon or armor piece above to enhance its stats.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content spacer */}

      <div style={{ height: 20 }} />

      {/* ───────── LEGENDARY CRAFTING TAB ───────── */}
      {activeTab === 'legendary' && (() => {
        const allItems = itemsData.items
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
          { id: 'leg_shield', label: 'Legendary Shield',  emoji: '🛡️', baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
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
            <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#f5a623', letterSpacing: 1, marginBottom: 16, textAlign: 'center', borderBottom: '1px solid rgba(245,166,35,0.3)', paddingBottom: 8 }}>
              ⚔️ LEGENDARY FORGE — Craft equipment of legendary power
            </div>
            {RECIPES.map(recipe => {
              const baseOwned = countOf(recipe.baseId)
              const shardCounts = SHARD_TYPES.map(s => ({ ...s, owned: countOf(s.id), need: recipe.shards }))
              const canCraft = baseOwned >= 1 && shardCounts.every(s => s.owned >= s.need)
              return (
                <div key={recipe.id} style={{ marginBottom: 14, background: 'rgba(3,8,20,0.6)', border: `1px solid ${canCraft ? 'rgba(245,166,35,0.4)' : 'rgba(0,229,255,0.1)'}`, borderRadius: 12, padding: 14, boxShadow: canCraft ? '0 0 12px rgba(245,166,35,0.15)' : 'none' }}>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: `1px solid ${baseOwned >= 1 ? 'rgba(57,255,20,0.4)' : 'rgba(255,68,68,0.3)'}`, fontSize: 12, color: baseOwned >= 1 ? '#39ff14' : '#ff6666', fontWeight: 700 }}>
                      📦 {recipe.baseLabel} ×1 ({baseOwned}/1)
                    </div>
                    {/* Shards */}
                    {shardCounts.map(s => (
                      <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: `1px solid ${s.owned >= s.need ? 'rgba(57,255,20,0.4)' : 'rgba(255,68,68,0.3)'}`, fontSize: 12, color: s.owned >= s.need ? '#39ff14' : '#ff6666', fontWeight: 700 }}>
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
                    style={{ width: '100%', border: 'none', borderRadius: 8, padding: '10px 0', fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, cursor: canCraft ? 'pointer' : 'not-allowed', background: canCraft ? 'linear-gradient(135deg,#f5a623,#ff6b35)' : 'rgba(28,36,56,0.8)', color: canCraft ? '#000' : '#4a8fa8', letterSpacing: 1, boxShadow: canCraft ? '0 0 12px rgba(245,166,35,0.4)' : 'none', transition: 'all 0.2s' }}
                  >
                    {canCraft ? `⚡ CRAFT ${recipe.label.toUpperCase()}` : '🔒 BAHAN KURANG'}
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
              { id: 'eminence_helmet', name: 'Helmet',    price: 100000000 },
              { id: 'eminence_armor',  name: 'Armor',     price: 100000000 },
              { id: 'eminence_gloves', name: 'Gloves',    price: 100000000 },
              { id: 'eminence_pants',  name: 'Pants',     price: 100000000 },
              { id: 'eminence_boots',  name: 'Boots',     price: 100000000 },
              { id: 'eminence_cape',   name: 'Cape',      price: 100000000 },
              { id: 'eminence_staff',  name: 'Leadership Staff', price: 200000000 },
            ]
          },
          {
            setId: 'vice_eminence',
            name: 'Vice Eminence Set',
            emoji: '⚜️',
            color: '#cc44ff',
            total: 6,
            fullBonus: 'ATK+80 | DEF+80 | HP+1500 | Crit+1%',
            pieces: [
              { id: 'vice_helmet', name: 'Helmet', price: 75000000 },
              { id: 'vice_armor',  name: 'Armor',  price: 75000000 },
              { id: 'vice_gloves', name: 'Gloves', price: 75000000 },
              { id: 'vice_pants',  name: 'Pants',  price: 75000000 },
              { id: 'vice_boots',  name: 'Boots',  price: 75000000 },
              { id: 'vice_cape',   name: 'Cape',   price: 75000000 },
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
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#7ab0d0', textAlign: 'center', marginBottom: 16 }}>
              ◈ CRD Kamu: <span style={{ color: '#00e5ff', fontWeight: 800 }}>{credits.toLocaleString()}</span>
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
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', fontFamily: 'var(--font-body)', paddingBottom: 80 },
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
