import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import itemsData from '../data/items.json'
import { PilotSprite } from './PilotSprites'
import { t } from '../lib/translate'

const PROMO_COSTS = {
  1: 1000,
  2: 10000,
  3: 30000,
}
const RECLASS_COST = 5000

function getJobInfo(raceId, jobId) {
  if (!raceId || !jobId || !jobs[raceId]) return { tier: 0, job: null }
  const rJobs = jobs[raceId]
  let job = rJobs.tier1.find(j => j.id === jobId)
  if (job) return { tier: 1, job }
  job = rJobs.tier2.find(j => j.id === jobId)
  if (job) return { tier: 2, job }
  job = rJobs.tier3.find(j => j.id === jobId)
  if (job) return { tier: 3, job }
  return { tier: 0, job: null }
}

export default function NpcModal({ onClose }) {
  const player = useGameStore((s) => s.player)
  const getStats = useGameStore((s) => s.getStats)
  const reclassJob = useGameStore((s) => s.reclassJob)
  const craftArchonItem = useGameStore((s) => s.craftArchonItem)

  const [subView, setSubView] = useState('lobby') // 'lobby', 'specialist', 'hero', 'promote', 'reclass', 'shop'

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
    (tier === 2 && player.level >= 50)
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
    <div style={styles.overlay}>
      <div className={`glass-panel cyber-panel ${raceClass}`} style={styles.modal}>
        {/* Modal Header */}
        <div style={styles.modalHeader}>
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
              <p style={{ margin: '0 0 4px', fontSize: 13, color: '#7ab0d0', textAlign: 'center', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* NPC avatar & bubble */}
              <div style={styles.avatarRow}>
                <div style={styles.npcAvatar}>
                  <PilotSprite race={player.race} job={player.job} size={50} />
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

              {/* Action Choices */}
              <div style={styles.btnStack}>
                {eligibleForPromo && (
                  <button
                    onClick={() => setSubView('promote')}
                    style={canPromote ? styles.actionBtn('#ffe500', '#cc8000') : styles.actionBtnDisabled}
                    disabled={!canPromote}
                  >
                    🚀 {t('promo_btn', { fee: promoCost.toLocaleString() })}
                  </button>
                )}

                {!eligibleForPromo && tier < 3 && (
                  <div style={styles.infoLabel}>
                    ℹ {tier === 0 
                      ? t('next_promo', { req: 1, level: player.level }) 
                      : tier === 1 
                      ? t('next_promo', { req: 30, level: player.level }) 
                      : t('next_promo', { req: 50, level: player.level })}
                  </div>
                )}

                {tier === 3 && (
                  <div style={styles.infoLabel}>🏆 {t('max_tier')}</div>
                )}

                {tier >= 1 && (
                  <button
                    onClick={() => setSubView('reclass')}
                    style={canReclass ? styles.actionBtn('#bb88ff', '#6600cc') : styles.actionBtnDisabled}
                    disabled={!canReclass}
                  >
                    🌀 {t('reclass_btn', { fee: RECLASS_COST.toLocaleString() })}
                  </button>
                )}
              </div>

              <button onClick={() => setSubView('lobby')} style={styles.backBtn}>
                🔙 {t('cancel_btn')}
              </button>
            </div>
          )}

          {subView === 'hero' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Hero avatar & bubble */}
              <div style={styles.avatarRow}>
                <div style={{ ...styles.npcAvatar, border: '1.5px solid #ffaa00', boxShadow: '0 0 10px rgba(255, 170, 0, 0.2)' }}>
                  <span style={{ fontSize: 32 }}>🏆</span>
                </div>
                <div style={{ ...styles.npcDialog, borderLeft: '3px solid #ffaa00' }}>"{heroDialogue}"</div>
              </div>

              <div style={styles.btnStack}>
                <button
                  onClick={() => setSubView('shop')}
                  style={styles.actionBtn('#ffaa00', '#995500')}
                >
                  🏪 {t('premium_shop_title')}
                </button>
              </div>

              <button onClick={() => setSubView('lobby')} style={styles.backBtn}>
                🔙 {t('cancel_btn')}
              </button>
            </div>
          )}

          {subView === 'promote' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={styles.subHeader}>{t('promotion_modal_title')}</div>
              <p style={styles.subDesc}>{t('promotion_modal_desc')}</p>
              
              <div style={styles.scrollList}>
                {getAvailableJobs().map(j => (
                  <button key={j.id} style={styles.jobCard} onClick={() => handlePromote(j.id)}>
                    <div style={styles.jobName}>{j.name}</div>
                    <div style={styles.jobDesc}>{j.desc}</div>
                    <div style={styles.jobBonus}>
                      +{j.bonus.hp} HP | +{j.bonus.atk} ATK | +{j.bonus.def} DEF
                    </div>
                    {j.skills && j.skills.length > 0 && (
                      <div style={styles.jobSkills}>
                        ⚡ Skills: <span style={{ color: '#00e5ff' }}>{j.skills.join(', ')}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button onClick={() => setSubView('specialist')} style={styles.backBtn}>
                🔙 {t('cancel_btn')}
              </button>
            </div>
          )}

          {subView === 'reclass' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={styles.subHeader}>{t('reclass_modal_title')}</div>
              <p style={styles.subDesc}>
                {t('reclass_modal_desc', { fee: RECLASS_COST.toLocaleString() })}
              </p>
              <div style={styles.activeJobLabel}>
                {t('reclass_active_job', { job: job ? job.name : t('novice_job_name') })}
              </div>

              <div style={styles.scrollList}>
                {sameTierJobs().map(j => (
                  <button
                    key={j.id}
                    style={j.id === player.job ? styles.jobCardActive : styles.jobCard}
                    onClick={() => handleReclass(j.id)}
                  >
                    <div style={styles.jobName}>
                      {j.name} {j.id === player.job ? `✓ ${t('active_badge')}` : ''}
                    </div>
                    <div style={styles.jobDesc}>{j.desc}</div>
                    <div style={styles.jobBonus}>
                      +{j.bonus.hp} HP | +{j.bonus.atk} ATK | +{j.bonus.def} DEF
                    </div>
                    {j.skills && j.skills.length > 0 && (
                      <div style={styles.jobSkills}>
                        ⚡ Skills: <span style={{ color: '#00e5ff' }}>{j.skills.join(', ')}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button onClick={() => setSubView('specialist')} style={styles.backBtn}>
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
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 16,
    backdropFilter: 'blur(5px)'
  },
  modal: {
    width: '100%',
    maxWidth: 380,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    background: '#040a18',
    border: '1.5px solid var(--neon-glow)',
    borderRadius: 14,
    boxShadow: '0 0 25px rgba(0, 229, 255, 0.25)',
    maxHeight: '90vh',
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
    color: '#fff',
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
    fontSize: 13,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: 4
  },
  lobbyCardDesc: {
    fontFamily: 'var(--font-body)',
    fontSize: 11,
    color: '#7ab0d0',
    lineHeight: 1.3
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
  npcDialog: {
    flex: 1,
    fontStyle: 'italic',
    color: '#88aadd',
    fontSize: 12,
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
    fontSize: 12
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
    fontSize: 12,
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
    fontSize: 12,
    color: '#7ab0d0',
    margin: 0,
    lineHeight: 1.4
  },
  activeJobLabel: {
    textAlign: 'center',
    fontSize: 11,
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
    fontSize: 12,
    color: '#ccc',
    lineHeight: 1.3,
    marginBottom: 4
  },
  jobBonus: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
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
    fontSize: 11,
    color: '#7ab0d0',
    marginTop: 2
  },
  buyBtn: {
    background: 'linear-gradient(90deg, #ff8c00, #ffaa00)',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    fontFamily: 'var(--font-title)',
    fontSize: 11,
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
    fontSize: 11,
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
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: 6
  },
  jobSkills: {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    color: '#7ab0d0',
    marginTop: 4,
    textAlign: 'left'
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
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    boxShadow: 'inset 0 0 6px rgba(0, 229, 255, 0.1)',
    transition: 'all 0.2s'
  }
}
