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
  celestra: [
    { title: "Warrior Path", indices: [[0], [0], [0], [0]] },
    { title: "Pathfinder Path", indices: [[1], [1], [1], [1]] },
    { title: "Summoner Path", indices: [[2], [2], [2], [2]] },
    { title: "Mage Path", indices: [[3], [3], [3], [3]] }
  ],
  arctron: [
    { title: "Warrior Path", indices: [[0], [0], [0], [0]] },
    { title: "Ranger Path", indices: [[1], [1], [1], [1]] },
    { title: "Technician Path", indices: [[2], [2], [2], [2]] }
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
  const depositToWarehouse = useGameStore((s) => s.depositToWarehouse)
  const withdrawFromWarehouse = useGameStore((s) => s.withdrawFromWarehouse)
  const upgradeInventorySlots = useGameStore((s) => s.upgradeInventorySlots)
  const upgradeWarehouseSlots = useGameStore((s) => s.upgradeWarehouseSlots)

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
            {subView === 'arsenal_keeper' && '⚔️ Arsenal Keeper'}
            {subView === 'armory_keeper' && '🛡️ Armory Keeper'}
            {subView === 'forge_master' && '✨ Forge Master'}
            {subView === 'master_artisan' && '🔨 Master Artisan'}
            {subView === 'guild_steward' && '🏰 Guild Steward'}
            {subView === 'vault_keeper' && '📦 Vault Keeper'}
            {subView === 'grand_warden' && '📜 Grand Warden'}
            {subView === 'trade_broker' && '💰 Trade Broker'}
          </span>
        </div>

        {/* View Router */}
        <div style={styles.modalBody}>
          {subView === 'lobby' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: '#88aadd', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: 0.5 }}>
                🏛️ NPC BASE — Headquarters
              </p>

              {/* Faction Specialist */}
              <button onClick={() => setSubView('specialist')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🤖</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>{specialistName}</div>
                    <div style={styles.lobbyCardDesc}>Job Class & Promotion</div>
                  </div>
                </div>
              </button>

              {/* Race Hero */}
              <button onClick={() => setSubView('hero')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🏆</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>{heroName}</div>
                    <div style={styles.lobbyCardDesc}>Archon Equipment Shop</div>
                  </div>
                </div>
              </button>

              {/* Arsenal Keeper */}
              <button onClick={() => setSubView('arsenal_keeper')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>⚔️</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Arsenal Keeper</div>
                    <div style={styles.lobbyCardDesc}>Buy / Sell Weapons</div>
                  </div>
                </div>
              </button>

              {/* Armory Keeper */}
              <button onClick={() => setSubView('armory_keeper')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🛡️</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Armory Keeper</div>
                    <div style={styles.lobbyCardDesc}>Buy / Sell Armor & Shield</div>
                  </div>
                </div>
              </button>

              {/* Forge Master */}
              <button onClick={() => setSubView('forge_master')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>✨</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Forge Master</div>
                    <div style={styles.lobbyCardDesc}>Enhancement Equipment +1~+8</div>
                  </div>
                </div>
              </button>

              {/* Master Artisan */}
              <button onClick={() => setSubView('master_artisan')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🔨</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Master Artisan</div>
                    <div style={styles.lobbyCardDesc}>Craft Cape & Ascension Components</div>
                  </div>
                </div>
              </button>

              {/* Guild Steward */}
              <button onClick={() => setSubView('guild_steward')} className="cyber-panel" style={{...styles.lobbyCard, opacity: 0.6}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🏰</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Guild Steward</div>
                    <div style={styles.lobbyCardDesc}>Guild Management — Coming Soon</div>
                  </div>
                </div>
              </button>

              {/* Vault Keeper */}
              <button onClick={() => setSubView('vault_keeper')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>📦</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Vault Keeper</div>
                    <div style={styles.lobbyCardDesc}>Personal Warehouse & Upgrades</div>
                  </div>
                </div>
              </button>

              {/* Grand Warden */}
              <button onClick={() => setSubView('grand_warden')} className="cyber-panel" style={{...styles.lobbyCard, opacity: 0.6}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>📜</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Grand Warden</div>
                    <div style={styles.lobbyCardDesc}>Quest & Achievement — Coming Soon</div>
                  </div>
                </div>
              </button>

              {/* Trade Broker */}
              <button onClick={() => setSubView('trade_broker')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>💰</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Trade Broker</div>
                    <div style={styles.lobbyCardDesc}>Astrum Mercatus Exchange Broker</div>
                  </div>
                </div>
              </button>

              {/* Potion Merchant */}
              <button onClick={() => setSubView('potion_merchant')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🧪</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Potion Merchant</div>
                    <div style={styles.lobbyCardDesc}>Buy HP & FP Potion consumables</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* ─── ARSENAL KEEPER ─── */}
          {subView === 'arsenal_keeper' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={styles.avatarRow}>
                <div style={styles.npcAvatarLarge}><span style={{ fontSize: 52 }}>⚔️</span></div>
                <div style={styles.npcDialog}>"Every warrior needs a reliable blade. Tell me what you seek."</div>
              </div>
              <div style={styles.statusBox}>
                <div style={styles.statusLabel}>ROLE</div>
                <div style={styles.statusVal}>Weapon NPC</div>
              </div>
              {/* Price Table */}
              <div style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', fontWeight: 800, marginBottom: 10 }}>COMMON WEAPON SHOP</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#88aadd', marginBottom: 10 }}>Harga sesuai Map/Sektor saat ini</div>
                {[{ type: 'weapon', label: '⚔️ Weapon', mult: 1.0 }].map(({ type, label, mult }) => {
                  const BASE = [125000, 225000, 450000, 900000, 1800000]
                  const sec = Math.min((player.sector || 1) - 1, 4)
                  const price = Math.round(BASE[sec] * mult)
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e0f4ff' }}>{label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00ff88' }}>{price.toLocaleString()} CRD</div>
                      </div>
                      <button
                        style={{ background: 'linear-gradient(135deg,#00e5ff,#0088bb)', border: 'none', borderRadius: 6, color: '#000', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 12, padding: '7px 14px', cursor: 'pointer' }}
                        onClick={() => { useGameStore.getState().buyFromNpc(type); }}
                      >BUY</button>
                    </div>
                  )
                })}
              </div>
              {/* Price Reference by Map */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#88aadd', marginBottom: 8, fontWeight: 700 }}>HARGA REFERENSI PER MAP</div>
                {[
                  { map: '🌱 Map 1 (Lv.1-12)', weapon: '125,000' },
                  { map: '🌿 Map 2 (Lv.13-25)', weapon: '225,000' },
                  { map: '⚙️ Map 3 (Lv.26-38)', weapon: '450,000' },
                  { map: '🔥 Map 4 (Lv.39-52)', weapon: '900,000' },
                  { map: '☢️ Map 5 (Lv.53-66)', weapon: '1,800,000' },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '3px 0', color: '#e0f4ff' }}>
                    <span>{m.map}</span><span style={{ color: '#ffcc00' }}>{m.weapon} CRD</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ARMORY KEEPER ─── */}
          {subView === 'armory_keeper' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={styles.avatarRow}>
                <div style={styles.npcAvatarLarge}><span style={{ fontSize: 52 }}>🛡️</span></div>
                <div style={styles.npcDialog}>"A good shield can save your life. Choose your armor wisely."</div>
              </div>
              <div style={styles.statusBox}>
                <div style={styles.statusLabel}>ROLE</div>
                <div style={styles.statusVal}>Armor NPC</div>
              </div>
              {/* Buy Shop */}
              <div style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', fontWeight: 800, marginBottom: 10 }}>COMMON ARMOR SHOP</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#88aadd', marginBottom: 6 }}>Harga sesuai Map/Sektor saat ini</div>
                {[
                  { type: 'armor', label: '🛡️ Armor', mult: 1.0 },
                  { type: 'shield', label: '🛡️ Shield', mult: 0.8 },
                  { type: 'helmet', label: '🪖 Helmet', mult: 0.5 },
                  { type: 'pants', label: '👖 Pants', mult: 0.8 },
                  { type: 'gloves', label: '🧎 Gloves', mult: 0.4 },
                  { type: 'boots', label: '👢 Boots', mult: 0.4 },
                ].map(({ type, label, mult }) => {
                  const BASE = [125000, 225000, 450000, 900000, 1800000]
                  const sec = Math.min((player.sector || 1) - 1, 4)
                  const price = Math.round(BASE[sec] * mult)
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#e0f4ff' }}>{label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00ff88' }}>{price.toLocaleString()} CRD</div>
                      </div>
                      <button
                        style={{ background: 'linear-gradient(135deg,#00e5ff,#0088bb)', border: 'none', borderRadius: 6, color: '#000', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 11, padding: '6px 12px', cursor: 'pointer' }}
                        onClick={() => { useGameStore.getState().buyFromNpc(type); }}
                      >BUY</button>
                    </div>
                  )
                })}
              </div>
              {/* Price Reference */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#88aadd', marginBottom: 6, fontWeight: 700 }}>HARGA PER MAP (ARMOR)</div>
                {[
                  { map: '🌱 Map 1', armor: '125K', helmet: '62.5K', pants: '100K', gloves: '50K', boots: '50K', shield: '100K' },
                  { map: '🌿 Map 2', armor: '225K', helmet: '112.5K', pants: '180K', gloves: '90K', boots: '90K', shield: '180K' },
                  { map: '⚙️ Map 3', armor: '450K', helmet: '225K', pants: '360K', gloves: '180K', boots: '180K', shield: '360K' },
                  { map: '🔥 Map 4', armor: '900K', helmet: '450K', pants: '720K', gloves: '360K', boots: '360K', shield: '720K' },
                  { map: '☢️ Map 5', armor: '1.8M', helmet: '900K', pants: '1.44M', gloves: '720K', boots: '720K', shield: '1.44M' },
                ].map((m, i) => (
                  <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 0', color: '#e0f4ff', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <span style={{ color: '#88aadd' }}>{m.map}</span> — Armor:<span style={{ color: '#ffcc00' }}>{m.armor}</span> Helmet:<span style={{ color: '#ffcc00' }}>{m.helmet}</span> Pants:<span style={{ color: '#ffcc00' }}>{m.pants}</span> Gloves:<span style={{ color: '#ffcc00' }}>{m.gloves}</span> Boots:<span style={{ color: '#ffcc00' }}>{m.boots}</span> Shield:<span style={{ color: '#ffcc00' }}>{m.shield}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── FORGE MASTER ─── */}
          {subView === 'forge_master' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={styles.avatarRow}>
                <div style={styles.npcAvatarLarge}><span style={{ fontSize: 52 }}>✨</span></div>
                <div style={styles.npcDialog}>"Bring me your equipment and the sacred materials. I will temper it beyond its limits."</div>
              </div>
              <div style={styles.statusBox}>
                <div style={styles.statusLabel}>ROLE</div>
                <div style={styles.statusVal}>Enhancement NPC</div>
              </div>
              <div style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', fontWeight: 800, marginBottom: 10 }}>SERVICES</div>
                <ul style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e0f4ff', listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 6 }}>✨ Enhancement Equipment <strong>+1 hingga +8</strong></li>
                  <li style={{ marginBottom: 6 }}>🪨 Material: <strong>Arcanite</strong> × 1 (setiap level)</li>
                  <li style={{ marginBottom: 6 }}>🛡️ Material: <strong>Divine Crest</strong> × 20~200</li>
                  <li>🍀 Opsional: <strong>Lucky Relic</strong> × 1 (+10% success rate)</li>
                </ul>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: 8, padding: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00ff88' }}>
                  ✅ <strong>+1~+5 Gagal:</strong><br/>Material hilang, equipment aman
                </div>
                <div style={{ flex: 1, background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.25)', borderRadius: 8, padding: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ff6666' }}>
                  ⚠️ <strong>+6~+8 Gagal:</strong><br/>Material hilang, equipment hancur!
                </div>
              </div>
              <div style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#00e5ff', textAlign: 'center' }}>
                🔨 Buka tab <strong>FORGE → Enhancement</strong> untuk memulai!
              </div>
            </div>
          )}

          {/* ─── MASTER ARTISAN ─── */}
          {subView === 'master_artisan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={styles.avatarRow}>
                <div style={styles.npcAvatarLarge}><span style={{ fontSize: 52 }}>🔨</span></div>
                <div style={styles.npcDialog}>"The finest crafts require the rarest components. Bring me what is needed."</div>
              </div>
              <div style={styles.statusBox}>
                <div style={styles.statusLabel}>ROLE</div>
                <div style={styles.statusVal}>Crafting NPC</div>
              </div>
              <div style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', fontWeight: 800, marginBottom: 10 }}>SERVICES</div>
                <ul style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e0f4ff', listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}>🦸 Craft <strong>Cape</strong> <span style={{ color: '#88aadd', fontSize: 11 }}>(semua bangsa)</span></li>
                  <li style={{ marginBottom: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                    ⚙️ Craft <strong>ARES Components</strong>
                    <span style={{ display: 'block', fontSize: 11, color: '#ff3d00', fontWeight: 700, marginTop: 2 }}>⚠️ Khusus bangsa ARCTRON</span>
                  </li>
                  <li style={{ marginBottom: 8, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                    🤖 Craft <strong>M.E.U. Components</strong>
                    <span style={{ display: 'block', fontSize: 11, color: '#ffd600', fontWeight: 700, marginTop: 2 }}>⚠️ Khusus bangsa BIONEX</span>
                  </li>
                  <li style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                    👻 Craft <strong>Ancient Spirit Components</strong>
                    <span style={{ display: 'block', fontSize: 11, color: '#00e5ff', fontWeight: 700, marginTop: 2 }}>⚠️ Khusus bangsa CELESTRA</span>
                  </li>
                </ul>
              </div>
              <div style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#00e5ff', textAlign: 'center' }}>
                🔨 Buka tab <strong>FORGE → Ascension Lab</strong> untuk memulai!
              </div>
            </div>
          )}

          {/* ─── COMING SOON NPCs ─── */}
          {['guild_steward', 'grand_warden'].includes(subView) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', paddingTop: 20 }}>
              <div style={{ fontSize: 64 }}>
                {subView === 'guild_steward' && '🏰'}
                {subView === 'grand_warden' && '📜'}
              </div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: '#00e5ff', fontWeight: 900, textAlign: 'center', letterSpacing: 1 }}>
                {subView === 'guild_steward' && 'Guild Steward'}
                {subView === 'grand_warden' && 'Grand Warden'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#88aadd', textAlign: 'center', lineHeight: 1.6 }}>
                {subView === 'guild_steward' && '"The Guild Hall is under construction. Come back soon, Commander."'}
                {subView === 'grand_warden' && '"I have quests for brave souls, but the mission board is not ready yet."'}
              </div>
              <div style={{ background: 'rgba(255, 204, 0, 0.1)', border: '1.5px dashed rgba(255,204,0,0.4)', borderRadius: 10, padding: '12px 20px', fontFamily: 'var(--font-title)', fontSize: 14, color: '#ffcc00', fontWeight: 800, letterSpacing: 1, textAlign: 'center' }}>
                🚧 COMING SOON
              </div>
            </div>
          )}

          {/* ─── Vault Keeper / Personal Warehouse ─── */}
          {subView === 'vault_keeper' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'hidden' }}>
              {/* Header with credits */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, border: '1px solid rgba(0, 229, 255, 0.15)' }}>
                <span style={{ fontSize: 12, color: '#7ab0d0', fontWeight: 'bold' }}>CREDITS BALANCE</span>
                <span style={{ color: '#00e5ff', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>◈ {(player.resources.credits || 0).toLocaleString()} CRD</span>
              </div>

              {/* Slots Upgrades Section */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  onClick={upgradeInventorySlots}
                  style={{ flex: 1, padding: 8, background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.4)', borderRadius: 6, color: '#00e5ff', fontFamily: 'var(--font-title)', fontSize: 11, fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🎒 UPGRADE BAG (+20 Slot)<br/>
                  <span style={{ fontSize: 9, color: '#aaa', fontWeight: 'normal' }}>{player.inventorySlots || 100}/300 Slot · 1M CRD</span>
                </button>
                <button 
                  onClick={upgradeWarehouseSlots}
                  style={{ flex: 1, padding: 8, background: 'rgba(245, 166, 35, 0.08)', border: '1px solid rgba(245, 166, 35, 0.4)', borderRadius: 6, color: '#f5a623', fontFamily: 'var(--font-title)', fontSize: 11, fontWeight: 'bold', cursor: 'pointer' }}
                >
                  📦 UPGRADE VAULT (+50 Slot)<br/>
                  <span style={{ fontSize: 9, color: '#aaa', fontWeight: 'normal' }}>{player.warehouseSlots || 200}/600 Slot · 2.5M CRD</span>
                </button>
              </div>

              {/* Columns Container */}
              <div style={{ display: 'flex', gap: 10, flex: 1, minHeight: 0 }}>
                {/* Left Column: Inventory */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 8, minHeight: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 'bold', color: '#00e5ff', fontFamily: 'var(--font-title)' }}>🎒 INVENTORY</span>
                    <span style={{ fontSize: 10, color: '#7ab0d0', fontFamily: 'var(--font-mono)' }}>{player.inventory.length}/{(player.inventorySlots || 100)}</span>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }} className="no-scrollbar">
                    {player.inventory.map((item) => (
                      <div 
                        key={item.uid} 
                        onClick={() => depositToWarehouse(item.uid)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: 6, borderRadius: 6, cursor: 'pointer', transition: 'background 0.2s' }}
                        title="Klik untuk Simpan ke Warehouse"
                      >
                        <span style={{ fontSize: 20 }}>{item.emoji}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontSize: 11, fontWeight: 'bold', color: '#fff' }}>{item.name}</span>
                          <span style={{ fontSize: 9, color: '#aaa' }}>{item.type} {item.enhancement ? `+${item.enhancement}` : ''}</span>
                        </div>
                      </div>
                    ))}
                    {player.inventory.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 20, fontSize: 11, color: '#aaa' }}>Inventory Kosong</div>
                    )}
                  </div>
                </div>

                {/* Right Column: Warehouse */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: 8, minHeight: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 'bold', color: '#f5a623', fontFamily: 'var(--font-title)' }}>📦 WAREHOUSE</span>
                    <span style={{ fontSize: 10, color: '#7ab0d0', fontFamily: 'var(--font-mono)' }}>{(player.warehouse || []).length}/{(player.warehouseSlots || 200)}</span>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }} className="no-scrollbar">
                    {(player.warehouse || []).map((item) => (
                      <div 
                        key={item.uid} 
                        onClick={() => withdrawFromWarehouse(item.uid)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: 6, borderRadius: 6, cursor: 'pointer', transition: 'background 0.2s' }}
                        title="Klik untuk Ambil ke Inventory"
                      >
                        <span style={{ fontSize: 20 }}>{item.emoji}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontSize: 11, fontWeight: 'bold', color: '#fff' }}>{item.name}</span>
                          <span style={{ fontSize: 9, color: '#aaa' }}>{item.type} {item.enhancement ? `+${item.enhancement}` : ''}</span>
                        </div>
                      </div>
                    ))}
                    {(player.warehouse || []).length === 0 && (
                      <div style={{ textAlign: 'center', padding: 20, fontSize: 11, color: '#aaa' }}>Warehouse Kosong</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Trade Broker / Auction House Entrance ─── */}
          {subView === 'trade_broker' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', paddingTop: 20 }}>
              <div style={{ fontSize: 64 }}>💰</div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: '#00e5ff', fontWeight: 900, textAlign: 'center', letterSpacing: 1 }}>
                Trade Broker
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#88aadd', textAlign: 'center', lineHeight: 1.6, maxWidth: '85%' }}>
                "Selamat datang di Astrum Mercatus, Galactic Exchange Network. Di sini Anda dapat memperdagangkan Equipment, Cape, dan Material Crafting dengan pilot lainnya secara real-time."
              </div>
              <button 
                onClick={() => {
                  useGameStore.getState().setScreen('trade')
                  onClose()
                }}
                style={{
                  marginTop: 10,
                  padding: '12px 24px',
                  borderRadius: 8,
                  border: '1.5px solid #00e5ff',
                  background: 'linear-gradient(135deg, #0050cc 0%, #00a8ff 100%)',
                  color: '#fff',
                  fontFamily: 'var(--font-title)',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: 1,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
                }}
              >
                🤝 ENTER AUCTION HOUSE
              </button>
            </div>
          )}

          {/* ─── Potion Merchant ─── */}
          {subView === 'potion_merchant' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'hidden' }}>
              {/* Header with credits */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, border: '1px solid rgba(0, 229, 255, 0.15)' }}>
                <span style={{ fontSize: 12, color: '#7ab0d0', fontWeight: 'bold' }}>CREDITS BALANCE</span>
                <span style={{ color: '#00e5ff', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>◈ {(player.resources.credits || 0).toLocaleString()} CRD</span>
              </div>

              {/* NPC avatar & bubble */}
              <div style={styles.avatarRow}>
                <div style={styles.npcAvatarLarge}>
                  <span style={{ fontSize: 44 }}>🧪</span>
                </div>
                <div style={styles.npcDialog}>"Butuh ramuan penyembuh HP atau pengisi FP untuk mecha-mu, Commander? Kualitas nomor satu!"</div>
              </div>

              <div style={{ fontFamily: 'var(--font-title)', color: '#00e5ff', fontSize: 13, borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: 6 }}>
                DAFTAR ITEM POTION
              </div>

              {/* Potions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', flex: 1 }} className="no-scrollbar">
                {[
                  { id: 'hp', name: 'HP Potion [S]', emoji: '🧪', desc: 'Memulihkan 1,000 HP seketika.', cost: 2500 },
                  { id: 'fp', name: 'FP Potion [S]', emoji: '🧪', desc: 'Memulihkan 2,500 FP seketika.', cost: 10000 }
                ].map((pot) => {
                  const hasCredits = (player.resources.credits || 0) >= pot.cost
                  return (
                    <div key={pot.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 32, background: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 6, border: '1px solid rgba(0,229,255,0.1)' }}>{pot.emoji}</div>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold', color: '#fff', fontSize: 14 }}>{pot.name}</div>
                        <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{pot.desc}</div>
                        <div style={{ fontSize: 11, color: '#00ff88', marginTop: 4, fontFamily: 'var(--font-mono)' }}>Harga: {pot.cost.toLocaleString()} CRD</div>
                      </div>
                      <button 
                        onClick={() => {
                          const invSlots = player.inventorySlots || 100
                          if (player.inventory.length >= invSlots) {
                            alert("Inventory penuh! Kosongkan slot atau upgrade bag Anda.")
                            return
                          }
                          const credits = player.resources.credits || 0
                          if (credits < pot.cost) {
                            alert(`Credits (CRD) tidak cukup! Membutuhkan ${pot.cost.toLocaleString()} CRD.`)
                            return
                          }

                          const potItem = itemsData.items.find(it => it.id === (pot.id === 'hp' ? 'pot_hp' : 'pot_fp'))
                          if (!potItem) return

                          const newItem = { ...potItem, uid: Date.now() }
                          useGameStore.setState((s) => ({
                            player: {
                              ...s.player,
                              inventory: [...s.player.inventory, newItem],
                              resources: {
                                ...s.player.resources,
                                credits: credits - pot.cost
                              },
                              savedAt: Date.now()
                            }
                          }))
                          alert(`Berhasil membeli ${pot.name}!`)
                        }}
                        style={{
                          background: hasCredits ? 'linear-gradient(90deg, #0088ff, #00e5ff)' : 'rgba(255,255,255,0.1)',
                          border: 'none',
                          color: hasCredits ? '#000' : '#666',
                          fontFamily: 'var(--font-title)',
                          fontWeight: 900,
                          fontSize: 12,
                          padding: '8px 16px',
                          borderRadius: 4,
                          cursor: hasCredits ? 'pointer' : 'not-allowed',
                          boxShadow: hasCredits ? '0 0 8px rgba(0, 229, 255, 0.3)' : 'none'
                        }}
                        disabled={!hasCredits}
                      >
                        BELI
                      </button>
                    </div>
                  )
                })}
              </div>
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
                  const raceColor = player.race === 'arctron' ? '#ff3d00' : player.race === 'bionex' ? '#ffd600' : '#00e5ff'

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
                  const raceAccent = player.race === 'arctron' ? 'rgba(255,61,0,0.18)' : player.race === 'bionex' ? 'rgba(255,214,0,0.18)' : 'rgba(0,229,255,0.18)'
                  const tabHeroJob = activeLane ? (() => {
                    const t1Idx = activeLane.indices[0]?.[0]
                    if (t1Idx !== undefined && jobs[player.race]?.tier1[t1Idx]) return { tier: 1, job: jobs[player.race].tier1[t1Idx] }
                    const t2Idx = activeLane.indices[1]?.[0]
                    if (t2Idx !== undefined && jobs[player.race]?.tier2[t2Idx]) return { tier: 2, job: jobs[player.race].tier2[t2Idx] }
                    return null
                  })() : null

                  return (
                    <div className="class-tree-col" style={{ ...styles.treeCol, width: '100%' }}>
                      {/* Hero Sprite & Tier 1 Card Area */}
                      {(bionexHeroSprite || tabHeroJob) && (() => {
                        if (!tabHeroJob) return null;
                        const j = tabHeroJob.job;
                        if (!j) return null;
                        const jTier = tabHeroJob.tier;
                        
                        const isActive = player.job === j.id;
                        const isUnlocked = tier >= jTier;
                        const reqLevel = j.levelReq || 1;
                        
                        const isPromoEligible = tier === 0 && player.level >= reqLevel;
                        const isReclassEligible = tier === 1 && !isActive && player.job !== null;
                        const isLocked = !isActive && !isPromoEligible && !isReclassEligible && (!isUnlocked || jTier > tier);
                        const cardClass = `job-node-card panel-${player.race} ${isActive ? 'active-job-node' : ''}`;
                        
                        return (
                          <div style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 16,
                            marginBottom: 12,
                          }}>
                            {/* Left Side: BIG SPRITE */}
                            <div style={{
                              flex: '0 0 clamp(110px, 35%, 160px)',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'flex-end',
                              height: 'auto',
                              minHeight: 'clamp(150px, 28vw, 210px)',
                              maxHeight: 220,
                              position: 'relative',
                              overflow: 'hidden',
                              borderRadius: 12,
                              border: `1.5px solid ${player.race === 'arctron' ? 'rgba(255,87,34,0.4)' : player.race === 'bionex' ? 'rgba(255,214,0,0.4)' : 'rgba(0,229,255,0.4)'}`,
                              background: 'rgba(3, 8, 20, 0.55)',
                              boxShadow: `inset 0 0 16px ${player.race === 'arctron' ? 'rgba(255,87,34,0.15)' : player.race === 'bionex' ? 'rgba(255,214,0,0.15)' : 'rgba(0,229,255,0.15)'}`,
                            }}>
                              <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 170,
                                height: 50,
                                borderRadius: '50%',
                                background: `radial-gradient(ellipse, ${player.race === 'arctron' ? 'rgba(255,87,34,0.65)' : player.race === 'bionex' ? 'rgba(255,214,0,0.65)' : 'rgba(0,229,255,0.65)'} 0%, transparent 70%)`,
                                filter: 'blur(8px)',
                              }} />
                              {bionexHeroSprite ? (
                                <img
                                  src={bionexHeroSprite}
                                  alt={activeLane.title}
                                  style={{ height: 200, width: 'auto', objectFit: 'contain', objectPosition: 'bottom', opacity: 1, filter: 'brightness(1.25) contrast(1.1)', position: 'relative', zIndex: 1 }}
                                />
                              ) : (
                                <div style={{ position: 'relative', zIndex: 1, height: 200, display: 'flex', alignItems: 'flex-end' }}>
                                  <PilotSprite race={player.race} job={j.id} size={200} />
                                </div>
                              )}
                            </div>
                            
                            {/* Right Side: Tier 1 Job Node */}
                            <div className={cardClass} style={{
                              ...styles.jobNodeCard,
                              flex: 1,
                              opacity: isLocked ? 0.45 : 1,
                              border: isActive ? `2px solid var(--neon-glow)` : '1.5px solid rgba(255,255,255,0.18)',
                              background: isActive ? '#0d1d3d' : '#060d1f',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              position: 'relative'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={styles.cardJobName}>{j.name}</span>
                                {isActive && <span style={styles.activeBadge}>✓ ACTIVE</span>}
                              </div>
                              <div style={styles.cardJobDesc}>{j.desc}</div>
                              <div style={{ ...styles.cardJobBonus, display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 14 }}>
                                {(() => {
                                  // Base stats for the first job in the lane (either T1 or T2)
                                  if (jTier === tabHeroJob?.tier) {
                                    if (player.race === 'bionex') {
                                      let bHp = 0, bAtk = 0, bDef = 0;
                                      const laneT = activeLane.title.toLowerCase();
                                      if (laneT.includes('guardian')) { bHp = 210; bAtk = 27; bDef = 22; }
                                      else if (laneT.includes('marksman')) { bHp = 175; bAtk = 33; bDef = 15; }
                                      else if (laneT.includes('engineer')) { bHp = 175; bAtk = 25; bDef = 17; }
                                      else if (laneT.includes('psion')) { bHp = 165; bAtk = 31; bDef = 14; }
                                      return (
                                        <>
                                          <span><span style={{color: '#ff4444'}}>HP</span> {bHp}</span>
                                          <span><span style={{color: '#ffaa00'}}>ATK</span> {bAtk}</span>
                                          <span><span style={{color: '#00ccff'}}>DEF</span> {bDef}</span>
                                        </>
                                      );
                                    } else if (player.race === 'celestra') {
                                      let bHp = 0, bAtk = 0, bDef = 0;
                                      const laneT = activeLane.title.toLowerCase();
                                      if (laneT.includes('warrior')) { bHp = 195; bAtk = 29; bDef = 20; }
                                      else if (laneT.includes('ranger')) { bHp = 170; bAtk = 34; bDef = 14; }
                                      else if (laneT.includes('summoner')) { bHp = 160; bAtk = 23; bDef = 15; }
                                      else if (laneT.includes('mage')) { bHp = 165; bAtk = 32; bDef = 13; }
                                      return (
                                        <>
                                          <span><span style={{color: '#ff4444'}}>HP</span> {bHp}</span>
                                          <span><span style={{color: '#ffaa00'}}>ATK</span> {bAtk}</span>
                                          <span><span style={{color: '#00ccff'}}>DEF</span> {bDef}</span>
                                        </>
                                      );
                                    } else if (player.race === 'arctron') {
                                      let bHp = 0, bAtk = 0, bDef = 0;
                                      const laneT = activeLane.title.toLowerCase();
                                      if (laneT.includes('warrior')) { bHp = 220; bAtk = 28; bDef = 24; }
                                      else if (laneT.includes('ranger')) { bHp = 180; bAtk = 32; bDef = 16; }
                                      else if (laneT.includes('technician')) { bHp = 170; bAtk = 24; bDef = 18; }
                                      return (
                                        <>
                                          <span><span style={{color: '#ff4444'}}>HP</span> {bHp}</span>
                                          <span><span style={{color: '#ffaa00'}}>ATK</span> {bAtk}</span>
                                          <span><span style={{color: '#00ccff'}}>DEF</span> {bDef}</span>
                                        </>
                                      );
                                    }
                                  }
                                  return (
                                    <>
                                      <span><span style={{color: '#ff4444'}}>HP</span> +{j.bonus.hp}</span>
                                      <span><span style={{color: '#ffaa00'}}>ATK</span> +{j.bonus.atk}</span>
                                      <span><span style={{color: '#00ccff'}}>DEF</span> +{j.bonus.def}</span>
                                    </>
                                  );
                                })()}
                              </div>
                              {j.skills && j.skills.length > 0 && (
                                <div style={styles.cardJobSkills}>
                                  <div style={{ fontWeight: 'bold', marginBottom: 6, fontSize: 13, color: '#aaa', letterSpacing: 0.5 }}>⚡ SKILLS:</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {j.skills.map((sk, skIdx) => {
                                      const isObj = typeof sk === 'object';
                                      const skName = isObj ? sk.name : sk;
                                      const skDesc = isObj ? sk.desc : '';
                                      return (
                                        <div key={skIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                              
                              {/* Action Buttons for Tier 1 */}
                              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                                {isLocked && !isPromoEligible && !isReclassEligible && (
                                  <div style={styles.lockedBadge}>🔒 Requires LV.{reqLevel}</div>
                                )}
                                {isPromoEligible && (
                                  <button style={{...styles.actionBtn('#00e5ff', '#007482'), width: '100%'}} onClick={() => handlePromote(j.id)}>
                                    {canPromote ? (promoCost > 0 ? t('promo_btn').replace('{fee}', promoCost) : t('promo_btn_free')) : t('insufficient_anium_warn')}
                                  </button>
                                )}
                                {isReclassEligible && (
                                  <button style={{...styles.actionBtn('#da70d6', '#7a3e78'), width: '100%'}} onClick={() => handleReclass(j.id)}>
                                    {canReclass ? t('reclass_btn').replace('{fee}', RECLASS_COST) : t('insufficient_anium_warn')}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {tierJobs.filter(tInfo => tabHeroJob ? tInfo.tier > tabHeroJob.tier : tInfo.tier > 1).map((tInfo, idx) => {
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
