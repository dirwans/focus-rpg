import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import itemsData from '../data/items.json'
import { PilotSprite } from './PilotSprites'
import { t } from '../lib/translate'

const PROMO_COSTS = {
  1: 0,
  2: 0,
  3: 0,
}
const RECLASS_COST = 5000

const CLASS_LANES = {
  bionex: [
    { title: "Guardian Path", indices: [[0], [0], [0], [0]] },
    { title: "Marksman Path", indices: [[1], [1], [1], [1]] },
    { title: "Engineer Path", indices: [[2], [2], [2], [2]] },
    { title: "Psion Path", indices: [[3], [3], [3], [3]] }
  ],
  coralis: [
    { title: "Warrior Lane", indices: [[0], [0], [0]] },
    { title: "Specialist Lane", indices: [[], [1], [1]] },
    { title: "Ranger Lane", indices: [[1], [2], [2]] },
    { title: "Mystic Lane", indices: [[], [3, 4], [3, 4, 5]] }
  ],
  acreton: [
    { title: "Warrior Lane", indices: [[0], [0], [0]] },
    { title: "Ranger/Launcher", indices: [[1], [1], [1]] },
    { title: "Specialist Lane", indices: [[2], [2], [2]] }
  ]
}

// Bellterra class sprite mapping: lane title keyword → cleaned sprite path
const BELLTERRA_CLASS_SPRITES = {
  warrior:      '/ref/Bellterra/Class-sprites-cleaned/Bellterra-warrior-cleaned.png',
  ranger:       '/ref/Bellterra/Class-sprites-cleaned/Bellterra-ranger-cleaned.png',
  spiritualist: '/ref/Bellterra/Class-sprites-cleaned/Bellterra-Spiritualist-cleaned.png',
  specialist:   '/ref/Bellterra/Class-sprites-cleaned/Bellterra-specialist-cleaned.png',
}

function getBionexLaneSprite(laneTitle) {
  const t = laneTitle.toLowerCase()
  if (t.includes('guardian')) return BELLTERRA_CLASS_SPRITES.warrior
  if (t.includes('marksman')) return BELLTERRA_CLASS_SPRITES.ranger
  if (t.includes('psion')) return BELLTERRA_CLASS_SPRITES.spiritualist
  if (t.includes('engineer')) return BELLTERRA_CLASS_SPRITES.specialist
  return null
}

function getJobInfo(raceId, jobId) {
  if (!raceId || !jobId || !jobs[raceId]) return { tier: 0, job: null }
  const rJobs = jobs[raceId]
  let job = rJobs.tier1.find(j => j.id === jobId)
  if (job) return { tier: 1, job }
  job = rJobs.tier2.find(j => j.id === jobId)
  if (job) return { tier: 2, job }
  job = rJobs.tier3.find(j => j.id === jobId)
  if (job) return { tier: 3, job }
  job = rJobs.tier4?.find(j => j.id === jobId)
  if (job) return { tier: 4, job }
  return { tier: 0, job: null }
}

function getPlayerLaneIndex(raceId, jobId) {
  if (!raceId || !jobId || !CLASS_LANES[raceId]) return 0
  const lanes = CLASS_LANES[raceId]
  for (let i = 0; i < lanes.length; i++) {
    const indices = lanes[i].indices
    const t1s = indices[0].map(idx => jobs[raceId].tier1[idx]?.id)
    const t2s = indices[1].map(idx => jobs[raceId].tier2[idx]?.id)
    const t3s = indices[2].map(idx => jobs[raceId].tier3[idx]?.id)
    const t4s = (indices[3] || []).map(idx => jobs[raceId].tier4?.[idx]?.id)
    if (t1s.includes(jobId) || t2s.includes(jobId) || t3s.includes(jobId) || t4s.includes(jobId)) {
      return i
    }
  }
  return 0
}

export default function NpcModal({ onClose, initialView = 'lobby' }) {
  const player = useGameStore((s) => s.player)
  const getStats = useGameStore((s) => s.getStats)
  const reclassJob = useGameStore((s) => s.reclassJob)
  const craftArchonItem = useGameStore((s) => s.craftArchonItem)

  const [subView, setSubView] = useState(initialView) // 'lobby', 'specialist', 'hero', 'promote', 'reclass', 'shop'
  const [activeLaneIdx, setActiveLaneIdx] = useState(() => getPlayerLaneIndex(player.race, player.job))

  if (!player.race) {
    return (
      <div style={styles.overlay}>
        <div className="glass-panel cyber-panel" style={styles.modal}>
          <h2 style={styles.title}>🏪 FACTION NPC</h2>
          <p style={{ textAlign: 'center', color: '#ff4444', fontFamily: 'var(--font-mono)', fontSize: 13, margin: '20px 0' }}>
            {t('select_race_first') || 'Please select a Faction first.'}
          </p>
          <button onClick={onClose} style={styles.closeBtn}>{t('close')}</button>
        </div>
      </div>
    )
  }

  const stats = getStats()
  const race = races[player.race]
  const { tier, job } = getJobInfo(player.race, player.job)

  const raceClass = 'panel-' + player.race
  
  // Specialist translations
  const specialistName = t(`npc_name_${player.race}`) || 'FACTION SPECIALIST'
  const specialistDialogue = t(`npc_dialogue_${player.race}`) || t('npc_dialogue_default')
  
  // Hero translations
  const heroName = t(`hero_name_${player.race}`) || 'RACE HERO'
  const heroDialogue = t(`hero_dialogue_${player.race}`) || 'Salute, pilot.'

  const eligibleForPromo = (
    (tier === 0 && player.level >= 1) ||
    (tier === 1 && player.level >= 30) ||
    (tier === 2 && player.level >= 40)
  )

  const promoCost = eligibleForPromo ? PROMO_COSTS[tier + 1] : 0
  const canPromote = eligibleForPromo && player.resources.anium >= promoCost
  const canReclass = tier >= 1 && player.resources.anium >= RECLASS_COST

  const archonItems = itemsData.items.filter(it => it.id.startsWith(`archon_${player.race}`))

  const getArchonPrice = (itemId) => {
    const isWepArmorMantle = itemId.endsWith('armor') || itemId.endsWith('mantle') || itemId.endsWith('weapon')
    return isWepArmorMantle ? 25000 : 15000
  }

  const handlePromote = (jobId) => {
    const cost = PROMO_COSTS[tier + 1]
    if (player.resources.anium < cost) return
    reclassJob(jobId, cost)
    setSubView('specialist')
  }

  const handleReclass = (jobId) => {
    if (jobId === player.job) { setSubView('specialist'); return }
    reclassJob(jobId, RECLASS_COST)
    setSubView('specialist')
  }

  const handleBuyArchonItem = (item) => {
    const cost = getArchonPrice(item.id)
    if (player.resources.anium < cost) {
      alert(t('need_more_anium', { need: cost.toLocaleString(), owned: player.resources.anium.toLocaleString() }))
      return
    }

    const conf = window.confirm(t('confirm_purchase', { name: item.name }))
    if (conf) {
      craftArchonItem(item.id)
    }
  }

  const getAvailableJobs = () => {
    if (!jobs[player.race]) return []
    if (tier === 0) return jobs[player.race].tier1
    if (tier === 1) return jobs[player.race].tier2
    if (tier === 2) return jobs[player.race].tier3
    return []
  }

  const sameTierJobs = () => {
    if (!jobs[player.race]) return []
    if (tier === 1) return jobs[player.race].tier1
    if (tier === 2) return jobs[player.race].tier2
    if (tier === 3) return jobs[player.race].tier3
    return []
  }

  return (
    <div style={styles.overlay} className="cyberpunk-hud-bg">
      <div className={`glass-panel cyber-panel ${raceClass}`} style={styles.modal}>
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <button 
            onClick={() => subView === 'lobby' ? onClose() : setSubView('lobby')} 
            style={{background:'transparent', border:'none', color:'#00e5ff', fontSize: 20, cursor:'pointer', padding: '0 8px 0 0', display:'flex', alignItems:'center'}}
          >
            ❮
          </button>
          <span style={styles.npcTitle}>
            {subView === 'lobby' && t('town_square')}
            {subView === 'specialist' && specialistName}
            {subView === 'hero' && heroName}
            {subView === 'promote' && specialistName}
            {subView === 'reclass' && specialistName}
            {subView === 'shop' && heroName}
          </span>
        </div>

        {/* View Router */}
        <div style={styles.modalBody}>
          {subView === 'lobby' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#ffffff', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: 0.5 }}>
                Select an NPC in the headquarters:
              </p>

              {/* Faction Specialist Card */}
              <button 
                onClick={() => setSubView('specialist')}
                className="cyber-panel" 
                style={styles.lobbyCard}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🤖</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>{specialistName}</div>
                    <div style={styles.lobbyCardDesc}>{t('visit_specialist_desc')}</div>
                  </div>
                </div>
              </button>

              {/* Race Hero Card */}
              <button 
                onClick={() => setSubView('hero')}
                className="cyber-panel" 
                style={styles.lobbyCard}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🏆</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>{heroName}</div>
                    <div style={styles.lobbyCardDesc}>{t('visit_hero_desc')}</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {subView === 'specialist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflow: 'hidden' }}>
              {/* NPC avatar & bubble */}
              <div style={styles.avatarRow}>
                <div style={styles.npcAvatarLarge}>
                  <PilotSprite race={player.race} job={player.job} size={80} />
                </div>
                <div style={styles.npcDialog}>"{specialistDialogue}"</div>
              </div>

              {/* Status Info */}
              <div style={styles.statusBox}>
                <div style={styles.statusLabel}>{t('current_status')}</div>
                <div style={styles.statusVal}>
                  {job ? job.name.toUpperCase() : t('novice')} ({t('tier_label')} {tier})
                </div>
              </div>

              {/* Lane Selector Tabs */}
              <div style={styles.tabsContainer}>
                {CLASS_LANES[player.race]?.map((lane, laneIdx) => {
                  const getTabJob = () => {
                    const t1Idx = lane.indices[0]?.[0]
                    if (t1Idx !== undefined && jobs[player.race].tier1[t1Idx]) return jobs[player.race].tier1[t1Idx]
                    const t2Idx = lane.indices[1]?.[0]
                    if (t2Idx !== undefined && jobs[player.race].tier2[t2Idx]) return jobs[player.race].tier2[t2Idx]
                    return null
                  }
                  const tabJob = getTabJob()
                  const isActive = activeLaneIdx === laneIdx
                  const raceColor = player.race === 'acreton' ? '#ff3d00' : player.race === 'bionex' ? '#ffd600' : '#00e5ff'

                  const bionexSprite = player.race === 'bionex' ? getBionexLaneSprite(lane.title) : null

                  return (
                    <div
                      key={laneIdx}
                      onClick={() => setActiveLaneIdx(laneIdx)}
                      style={styles.tabCard(isActive, raceColor)}
                    >
                      {/* Tab: label only for all factions */}
                      <span style={styles.tabTitle}>{lane.title.replace(" Lane", "").replace(" / ", "/").toUpperCase()}</span>
                    </div>
                  )
                })}
              </div>

              {/* Active Class Lane Tree */}
              <div className="class-tree-wrapper no-scrollbar" style={styles.treeWrapper}>
                {(() => {
                  const lane = CLASS_LANES[player.race]?.[activeLaneIdx]
                  if (!lane) return null

                  const tierJobs = [
                    { tier: 1, jobs: lane.indices[0].map(idx => jobs[player.race].tier1[idx]).filter(Boolean) },
                    { tier: 2, jobs: lane.indices[1].map(idx => jobs[player.race].tier2[idx]).filter(Boolean) },
                    { tier: 3, jobs: lane.indices[2].map(idx => jobs[player.race].tier3[idx]).filter(Boolean) },
                    { tier: 4, jobs: (lane.indices[3] || []).map(idx => jobs[player.race].tier4?.[idx]).filter(Boolean) }
                  ].filter(t => t.jobs.length > 0)

                  const activeLane = CLASS_LANES[player.race]?.[activeLaneIdx]
                  const bionexHeroSprite = player.race === 'bionex' && activeLane
                    ? getBionexLaneSprite(activeLane.title)
                    : null

                  // Hero sprite area — Bellterra: class sprite, others: PilotSprite
                  const raceAccent = player.race === 'acreton' ? 'rgba(255,61,0,0.18)' : player.race === 'bionex' ? 'rgba(255,214,0,0.18)' : 'rgba(0,229,255,0.18)'
                  const tabHeroJob = activeLane ? (() => {
                    const t1Idx = activeLane.indices[0]?.[0]
                    if (t1Idx !== undefined && jobs[player.race]?.tier1[t1Idx]) return jobs[player.race].tier1[t1Idx]
                    const t2Idx = activeLane.indices[1]?.[0]
                    if (t2Idx !== undefined && jobs[player.race]?.tier2[t2Idx]) return jobs[player.race].tier2[t2Idx]
                    return null
                  })() : null

                  return (
                    <div className="class-tree-col" style={{ ...styles.treeCol, width: '100%' }}>
                      {/* Hero Sprite Area — all factions */}
                      {(bionexHeroSprite || tabHeroJob) && (
                        <div style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'flex-end',
                          marginBottom: 12,
                          height: 180,
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: 12,
                          background: `linear-gradient(180deg, ${raceAccent.replace('0.18', '0.04')} 0%, rgba(0,0,0,0) 100%)`,
                        }}>
                          {/* Glow floor */}
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 160,
                            height: 40,
                            borderRadius: '50%',
                            background: `radial-gradient(ellipse, ${raceAccent} 0%, transparent 70%)`,
                            filter: 'blur(6px)',
                          }} />
                          {bionexHeroSprite ? (
                            <img
                              src={bionexHeroSprite}
                              alt={activeLane.title}
                              style={{
                                height: 175,
                                width: 'auto',
                                objectFit: 'contain',
                                objectPosition: 'bottom',
                                opacity: 1,
                                filter: 'brightness(1.25) contrast(1.1)',
                                position: 'relative',
                                zIndex: 1,
                              }}
                            />
                          ) : (
                            <div style={{ position: 'relative', zIndex: 1, height: 175, display: 'flex', alignItems: 'flex-end' }}>
                              <PilotSprite race={player.race} job={tabHeroJob.id} size={175} />
                            </div>
                          )}
                        </div>
                      )}
                      {tierJobs.map((tInfo, idx) => {
                        const jArray = tInfo.jobs
                        const jTier = tInfo.tier
                        
                        return (
                          <div key={jTier} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            {/* Vertical connector line between tiers */}
                            {idx > 0 && (
                              <div className="class-tree-connector" style={styles.connectorLine(tier >= jTier)} />
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', alignItems: 'center' }}>
                              {jArray.map((j, subIdx) => {
                                if (!j) return null
                                const isActive = player.job === j.id
                                const isUnlocked = tier >= jTier
                                
                                const reqLevel = j.levelReq || (jTier === 2 ? 30 : 40);

                                // Get previous tier job IDs
                                const prevTierJobs = idx > 0 ? tierJobs[idx - 1].jobs : []
                                const prevTierJobIds = prevTierJobs.map(pj => pj.id)

                                // Check if eligible for promotion to this node
                                const isPromoEligible = (
                                  (tier === 0 && jTier === 1 && player.level >= (j.levelReq || 1)) ||
                                  (tier === 0 && jTier === 2 && prevTierJobIds.length === 0 && player.level >= reqLevel) ||
                                  (tier === 1 && jTier === 2 && player.level >= reqLevel && prevTierJobIds.includes(player.job)) ||
                                  (tier === 2 && jTier === 3 && player.level >= reqLevel && prevTierJobIds.includes(player.job))
                                )

                                // Check if eligible for reclass to this node
                                const isReclassEligible = (
                                  tier === jTier && !isActive && player.job !== null
                                )

                                // Check if locked
                                const isLocked = !isActive && !isPromoEligible && !isReclassEligible && (!isUnlocked || jTier > tier)

                                const cardClass = `job-node-card panel-${player.race} ${isActive ? 'active-job-node' : ''}`
                                
                                return (
                                  <React.Fragment key={j.id}>
                                    {/* Connector between siblings in the same tier */}
                                    {subIdx > 0 && (
                                      <div className="class-tree-connector" style={styles.connectorLine(tier >= jTier)} />
                                    )}
                                    <div 
                                      className={cardClass} 
                                    style={{
                                      ...styles.jobNodeCard,
                                      flex: 1, // split space equally for branches
                                      minWidth: jArray.length > 1 ? '240px' : 'auto', // narrower if branching
                                      opacity: isLocked ? 0.45 : 1,
                                      border: isActive ? `2px solid var(--neon-glow)` : '1.5px solid rgba(255,255,255,0.18)',
                                      background: isActive ? '#0d1d3d' : '#060d1f'
                                    }}
                                  >
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                      {/* Dynamic Sprite Icon */}
                                      <div style={styles.cardSpriteWrap}>
                                        {j.icon ? (
                                          <img src={j.icon} style={{ width: 68, height: 68, borderRadius: 8, border: '2px solid rgba(255,255,255,0.2)', objectFit: 'cover', opacity: 1, filter: 'brightness(1.15) contrast(1.05)' }} alt={j.name} />
                                        ) : (
                                          <PilotSprite race={player.race} job={j.id} size={110} />
                                        )}
                                      </div>
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={styles.cardJobName}>{j.name}</span>
                                          {isActive && <span style={styles.activeBadge}>✓ ACTIVE</span>}
                                        </div>
                                        <div style={styles.cardJobDesc}>{j.desc}</div>
                                        <div style={styles.cardJobBonus}>
                                          +{j.bonus.hp} HP | +{j.bonus.atk} ATK | +{j.bonus.def} DEF
                                        </div>
                                        {j.skills && j.skills.length > 0 && (
                                          <div style={styles.cardJobSkills}>
                                            <div style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 13, color: '#aaa', letterSpacing: 0.5 }}>⚡ SKILLS:</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                              {j.skills.map((sk, skIdx) => {
                                                const isObj = typeof sk === 'object';
                                                const skName = isObj ? sk.name : sk;
                                                const skDesc = isObj ? sk.desc : '';
                                                const skIcon = isObj ? sk.icon : null;
                                                return (
                                                  <div key={skIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {skIcon && (
                                                      <img src={skIcon} style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: '#111' }} alt={skName} />
                                                    )}
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                      <span style={{ color: '#00e5ff', fontWeight: 700, fontSize: 13.5 }}>{skName}</span>
                                                      {skDesc && <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.2 }}>{skDesc}</span>}
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Buttons inside Card */}
                                    {isPromoEligible && (
                                      <button 
                                        onClick={() => handlePromote(j.id)}
                                        className="profile-promo-btn"
                                        style={{
                                          margin: '8px 0 0 0',
                                          padding: '6px 10px',
                                          fontSize: '12px',
                                          background: 'linear-gradient(90deg, #ffe500, #cc8000)',
                                          border: '1.5px solid #ffe500',
                                          boxShadow: '0 0 8px rgba(255, 229, 0, 0.4)'
                                        }}
                                      >
                                        🚀 UNLOCK JOB (FREE)
                                      </button>
                                    )}

                                    {isReclassEligible && (
                                      <button 
                                        onClick={() => handleReclass(j.id)}
                                        className="profile-promo-btn"
                                        disabled={player.resources.anium < RECLASS_COST}
                                        style={{
                                          margin: '8px 0 0 0',
                                          padding: '6px 10px',
                                          fontSize: '12px',
                                          background: player.resources.anium >= RECLASS_COST 
                                            ? 'linear-gradient(90deg, #bb88ff, #6600cc)'
                                            : 'rgba(255,255,255,0.05)',
                                          border: player.resources.anium >= RECLASS_COST 
                                            ? '1.5px solid #bb88ff'
                                            : '1.5px solid rgba(255,255,255,0.1)',
                                          color: player.resources.anium >= RECLASS_COST ? '#fff' : 'rgba(255,255,255,0.3)',
                                          cursor: player.resources.anium >= RECLASS_COST ? 'pointer' : 'not-allowed',
                                          boxShadow: player.resources.anium >= RECLASS_COST 
                                            ? '0 0 8px rgba(187, 136, 255, 0.4)'
                                            : 'none'
                                        }}
                                      >
                                        🌀 RECLASS CLASS (5K ⬡)
                                      </button>
                                    )}

                                    {isLocked && (
                                      <div style={styles.cardLockedBadge}>
                                        🔒 Requires LV.{reqLevel} {jTier === 3 && `& T2 Job`}
                                      </div>
                                    )}
                                  </div>
                                  </React.Fragment>
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

              <button onClick={() => setSubView('lobby')} style={styles.backBtn}>
                🔙 {t('cancel_btn')}
              </button>
            </div>
          )}

          {subView === 'shop' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={styles.subHeader}>{t('premium_shop_title')}</div>
              <p style={styles.subDesc}>{t('premium_shop_desc')}</p>

              <div style={styles.scrollList}>
                {archonItems.map(item => {
                  const cost = getArchonPrice(item.id)
                  const canBuy = player.resources.anium >= cost
                  return (
                    <div key={item.id} style={styles.shopItemRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {item.image ? (
                          <img referrerPolicy="no-referrer" src={item.image} style={{ width: 28, height: 28, objectFit: 'contain' }} alt={item.name} />
                        ) : (
                          <span style={{ fontSize: 24 }}>{item.emoji}</span>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={styles.shopItemName}>{item.name}</span>
                          <span style={styles.shopItemType}>{item.type.toUpperCase()} · LV.55</span>
                        </div>
                      </div>
                      <button
                        style={canBuy ? styles.buyBtn : styles.buyBtnDisabled}
                        disabled={!canBuy}
                        onClick={() => handleBuyArchonItem(item)}
                      >
                        {t('buy')} ({cost.toLocaleString()} ⬡)
                      </button>
                    </div>
                  )
                })}
              </div>

              <button onClick={() => setSubView('hero')} style={styles.backBtn}>
                🔙 {t('cancel_btn')}
              </button>
            </div>
          )}
        </div>

        {/* Modal Close Button */}
        {subView === 'lobby' && (
          <button onClick={onClose} style={styles.closeBtn}>
            {t('close')}
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(3, 8, 20, 0.85)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    padding: 0
  },
  modal: {
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    borderRadius: 0,
    border: 'none',
    borderTop: '3px solid var(--neon-glow)',
    borderBottom: '3px solid var(--neon-glow)',
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '24px 20px 40px 20px',
    boxSizing: 'border-box',
    overflowY: 'auto'
  },
  modalHeader: {
    borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
    paddingBottom: 10,
    textAlign: 'center'
  },
  npcTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 16,
    fontWeight: 900,
    color: '#F3E5AB',
    letterSpacing: 1.5,
    textShadow: '0 0 8px var(--neon-glow)'
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  lobbyCard: {
    background: 'rgba(3, 8, 20, 0.7)',
    border: '1.5px solid rgba(0, 229, 255, 0.2)',
    borderRadius: 10,
    padding: 12,
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s',
    outline: 'none',
    boxShadow: 'inset 0 0 8px rgba(0,229,255,0.05)'
  },
  lobbyIcon: {
    fontSize: 28,
    background: 'rgba(0,0,0,0.4)',
    padding: 10,
    borderRadius: 8,
    border: '1px solid rgba(0, 229, 255, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    flexShrink: 0
  },
  lobbyCardTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 15,
    fontWeight: 800,
    color: '#F3E5AB',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  lobbyCardDesc: {
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    color: '#e8f4ff',
    lineHeight: 1.4,
    fontWeight: 500
  },
  avatarRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center'
  },
  npcAvatar: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    border: '1.5px solid var(--neon-glow)',
    background: 'rgba(3, 8, 20, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  npcAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    border: '2px solid var(--neon-glow)',
    background: 'rgba(3, 8, 20, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    boxShadow: '0 0 12px var(--neon-glow)'
  },
  npcDialog: {
    flex: 1,
    fontStyle: 'italic',
    color: '#ffffff',
    fontSize: 14,
    background: 'rgba(3, 8, 20, 0.8)',
    borderLeft: '3px solid var(--neon-glow)',
    padding: '8px 10px',
    borderRadius: '0 6px 6px 0',
    lineHeight: 1.4,
    fontFamily: 'var(--font-body)'
  },
  statusBox: {
    background: 'rgba(3, 8, 20, 0.5)',
    border: '1px solid rgba(0, 229, 255, 0.1)',
    borderRadius: 8,
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: 13
  },
  statusLabel: {
    color: '#7ab0d0',
    fontWeight: 700
  },
  statusVal: {
    color: '#fff',
    fontWeight: 900
  },
  btnStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  infoLabel: {
    padding: '8px 10px',
    textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: '#6a9ab8',
    background: 'rgba(3, 8, 20, 0.3)',
    borderRadius: 8,
    border: '1px dashed rgba(0, 229, 255, 0.1)'
  },
  actionBtn: (borderColor, bgStart) => ({
    background: `linear-gradient(95deg, ${bgStart}, ${borderColor})`,
    border: `1.5px solid ${borderColor}`,
    borderRadius: 8,
    padding: '10px 14px',
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: '#fff',
    cursor: 'pointer',
    boxShadow: `0 0 10px ${borderColor}44`,
    transition: 'all 0.2s',
    fontWeight: 900,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  }),
  actionBtnDisabled: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: '10px 14px',
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: 'rgba(255,255,255,0.25)',
    cursor: 'not-allowed',
    fontWeight: 900,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  subHeader: {
    fontFamily: 'var(--font-title)',
    fontSize: 14,
    color: '#00e5ff',
    fontWeight: 900,
    letterSpacing: 0.5
  },
  subDesc: {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: '#7ab0d0',
    margin: 0,
    lineHeight: 1.4
  },
  activeJobLabel: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'var(--font-mono)',
    color: '#da70d6',
    background: 'rgba(218, 112, 214, 0.1)',
    border: '1px solid rgba(218, 112, 214, 0.2)',
    padding: '4px 8px',
    borderRadius: 4,
    marginBottom: 4
  },
  scrollList: {
    maxHeight: 220,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    paddingRight: 4
  },
  jobCard: {
    background: 'rgba(3, 8, 20, 0.6)',
    border: '1.5px solid rgba(0, 229, 255, 0.15)',
    borderRadius: 8,
    padding: 10,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    width: '100%'
  },
  jobCardActive: {
    background: 'rgba(100,0,200,0.15)',
    border: '1.5px solid #bb88ff',
    borderRadius: 8,
    padding: 10,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    width: '100%'
  },
  jobName: {
    fontFamily: 'var(--font-title)',
    fontWeight: 800,
    fontSize: 13,
    color: '#00e5ff',
    marginBottom: 4
  },
  jobDesc: {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: '#ccc',
    lineHeight: 1.3,
    marginBottom: 4
  },
  jobBonus: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: '#ff8c40',
    fontWeight: 700
  },
  shopItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(3, 8, 20, 0.6)',
    border: '1.5px solid rgba(0, 229, 255, 0.15)',
    padding: 8,
    borderRadius: 8
  },
  shopItemName: {
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: '#fff',
    fontWeight: 800
  },
  shopItemType: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: '#7ab0d0',
    marginTop: 2
  },
  buyBtn: {
    background: 'linear-gradient(90deg, #ff8c00, #ffaa00)',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: '#fff',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 0 8px rgba(255, 140, 0, 0.4)',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  buyBtnDisabled: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    padding: '8px 12px',
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.25)',
    fontWeight: 900,
    cursor: 'not-allowed',
    whiteSpace: 'nowrap'
  },
  backBtn: {
    width: '100%',
    padding: 10,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#7ab0d0',
    borderRadius: 8,
    fontFamily: 'var(--font-title)',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 13,
    letterSpacing: 0.5,
    marginTop: 6
  },
  jobSkills: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: '#7ab0d0',
    marginTop: 4,
    textAlign: 'left'
  },
  treeWrapper: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    overflowX: 'auto',
    flex: 1,
    padding: '4px 0 12px 0',
    width: '100%',
    boxSizing: 'border-box'
  },
  tabsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: 8
  },
  tabCard: (isActive, raceColor) => ({
    flex: 1,
    background: 'rgba(4, 10, 24, 0.7)',
    border: isActive ? `2px solid ${raceColor}` : '1.5px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '6px 4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    cursor: 'pointer',
    opacity: isActive ? 1 : 0.45,
    boxShadow: isActive ? `0 0 10px ${raceColor}` : 'none',
    transition: 'all 0.2s ease-in-out'
  }),
  tabTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  treeCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
    width: 250,
    flexShrink: 0,
    boxSizing: 'border-box'
  },
  laneTitle: {
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    fontWeight: 900,
    color: '#00e5ff',
    letterSpacing: 1.5,
    marginBottom: 10,
    textShadow: '0 0 6px rgba(0, 229, 255, 0.3)',
    textAlign: 'center'
  },
  jobNodeCard: {
    width: '100%',
    padding: 10,
    background: 'rgba(3, 8, 20, 0.7)',
    borderRadius: 8,
    boxSizing: 'border-box',
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column'
  },
  connectorLine: (unlocked) => ({
    width: 3,
    height: 24,
    background: unlocked ? 'var(--neon-glow)' : 'rgba(255,255,255,0.08)',
    boxShadow: unlocked ? '0 0 8px var(--neon-glow)' : 'none',
    zIndex: 0
  }),
  cardSpriteWrap: {
    width: 100,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.45)',
    border: '1.5px solid rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.6)'
  },
  cardJobName: {
    fontFamily: 'var(--font-title)',
    fontSize: 15,
    fontWeight: 900,
    color: '#fff',
    letterSpacing: 0.5
  },
  cardJobDesc: {
    fontFamily: 'var(--font-body)',
    fontSize: 14,
    color: '#ffffff',
    marginTop: 2,
    textAlign: 'left',
    lineHeight: 1.25
  },
  cardJobBonus: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: '#ffd700',
    marginTop: 4,
    fontWeight: 800,
    textAlign: 'left'
  },
  cardJobSkills: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: '#aae2ff',
    marginTop: 2,
    fontWeight: 800,
    textAlign: 'left'
  },
  cardLockedBadge: {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 6
  },
  activeBadge: {
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    fontWeight: 900,
    color: '#39ff14',
    background: 'rgba(57, 255, 20, 0.1)',
    border: '1.5px solid #39ff14',
    borderRadius: 4,
    padding: '1px 4px',
    boxShadow: '0 0 6px rgba(57, 255, 20, 0.2)'
  },
  closeBtn: {
    width: '100%',
    padding: 10,
    background: 'rgba(0, 229, 255, 0.05)',
    border: '1.5px solid rgba(0, 229, 255, 0.3)',
    color: '#00e5ff',
    borderRadius: 8,
    fontFamily: 'var(--font-title)',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    boxShadow: 'inset 0 0 6px rgba(0, 229, 255, 0.1)',
    transition: 'all 0.2s'
  }
}
