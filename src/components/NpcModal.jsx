import React, { useState } from 'react'
import { useGameStore, addToInventory, resolveItemImage } from '../store/gameStore'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import itemsData from '../data/items.json'
import { PilotSprite } from './PilotSprites'
import { t } from '../lib/translate'
import { getWeaponRarityDisplayName, getWeaponRarityColor } from '../lib/rarity'
import upgradesConfig from '../data/upgrades.json'
import ascensionData from '../data/ascensionArms.json'
import miningToolArctron from '../assets/mining_tool_arctron_rembg.png'
import miningToolBionex from '../assets/mining_tool_bionex_rembg.png'
import miningToolCelestra from '../assets/mining_tool_celestra_rembg.png'
const PROMO_COSTS = {
  1: 0,
  2: 0,
  3: 0,
  4: 0
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
  // Return null to use Bionex-specific gender-differentiated sprites from PilotSprite
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
  const [premiumTab, setPremiumTab] = useState('shop') // 'topup' | 'shop'
  const [premiumCat, setPremiumCat] = useState('all')
  const [premiumNow, setPremiumNow] = useState(Date.now())
  const [premiumTestMode, setPremiumTestMode] = useState(false)
  const [questTab, setQuestTab] = useState('quests') // 'quests' | 'promotion'
  const [selectedArcanitePath, setSelectedArcanitePath] = useState('mat_arcanite_fury')

  const faction = player.race || 'arctron'
  const theme = {
    arctron: {
      primary: '#ff5222',
      light: '#ffb48f',
      glowColor: 'rgba(255, 82, 34, 0.5)',
      tabInactiveColor: '#8a94a3',
      bgGradient: 'radial-gradient(120% 65% at 50% -5%, #201f22 0%, #141317 50%, #0a0a0c 100%)',
      glowBorder: 'rgba(255, 82, 34, 0.22)',
      bgDotColor: 'rgba(255, 82, 34, 0.06)',
      weaponSmithSvg: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffb48f" strokeWidth="1.7">
          <path d="M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4M5 5v4M5 5h4" />
        </svg>
      )
    },
    bionex: {
      primary: '#3b82f6',
      light: '#a9c8ff',
      glowColor: 'rgba(59, 130, 246, 0.5)',
      tabInactiveColor: '#7d92a3',
      bgGradient: 'radial-gradient(120% 65% at 50% -5%, #0c1f48 0%, #07132c 50%, #040a1c 100%)',
      glowBorder: 'rgba(59, 130, 246, 0.22)',
      bgDotColor: 'rgba(59, 130, 246, 0.06)',
      weaponSmithSvg: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#a9c8ff" strokeWidth="1.7">
          <path d="M12 2v20M4 12h16" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      )
    },
    celestra: {
      primary: '#9b4dff',
      light: '#c9aeff',
      glowColor: 'rgba(155, 77, 255, 0.5)',
      tabInactiveColor: '#8188c2',
      bgGradient: 'radial-gradient(120% 65% at 50% -5%, #1a1642 0%, #100e2c 50%, #07061a 100%)',
      glowBorder: 'rgba(155, 77, 255, 0.22)',
      bgDotColor: 'rgba(155, 77, 255, 0.06)',
      weaponSmithSvg: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#c9aeff" strokeWidth="1.7">
          <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5z" />
        </svg>
      )
    }
  }[faction] || {
    primary: '#ff5222',
    light: '#ffb48f',
    glowColor: 'rgba(255, 82, 34, 0.5)',
    tabInactiveColor: '#8a94a3',
    bgGradient: 'radial-gradient(120% 65% at 50% -5%, #201f22 0%, #141317 50%, #0a0a0c 100%)',
    glowBorder: 'rgba(255, 82, 34, 0.22)',
    bgDotColor: 'rgba(255, 82, 34, 0.06)',
    weaponSmithSvg: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ffb48f" strokeWidth="1.7">
        <path d="M14.5 17.5L3 6M17.5 14.5L6 3M19 19v-4M19 19h-4M5 5v4M5 5h4" />
      </svg>
    )
  }

  const REFINE_COSTS = {
    normal: { next: 'advanced', talics: 1, crd: 5000 },
    advanced: { next: 'rare', talics: 2, crd: 10000 },
    rare: { next: 'epic', talics: 3, crd: 20000 },
    epic: { next: 'legendary', talics: 5, crd: 50000 },
    legendary: { next: 'mythic', talics: 10, crd: 100000 }
  }

  const isEpicOrHigher = (item) => {
    if (!item) return false
    const r = (item.rarityGrade || item.rarity || '').toLowerCase()
    return ['epic', 'legendary', 'mythic', 'ssr', 'ur'].includes(r)
  }

  const ownedIgnorance = player.inventory.filter(it => it.id === 'talic_ignorance').reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
  const ownedFavor = player.inventory.filter(it => it.id === 'talic_favor').reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
  
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
      const res = enhanceItem(selectedEnhanceSlot, useLuckyRelic, selectedArcanitePath)
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

  
  React.useEffect(() => {
    const iv = setInterval(() => setPremiumNow(Date.now()), 1000)
    return () => clearInterval(iv)
  }, [])

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

  const upgrade = useGameStore((s) => s.upgrade)
  const getUpgradeCost = useGameStore((s) => s.getUpgradeCost)
  const refineWeapon = useGameStore((s) => s.refineWeapon)
  const combineWeapon = useGameStore((s) => s.combineWeapon)
  const craftAscensionArms = useGameStore((s) => s.craftAscensionArms)
  const enhanceItem = useGameStore((s) => s.enhanceItem)
  const craftLegendary = useGameStore((s) => s.craftLegendary)
  const craftShard = useGameStore((s) => s.craftShard)
  const craftArcanite = useGameStore((s) => s.craftArcanite)
  const buySetItem = useGameStore((s) => s.buySetItem)

  const [activeTab, setActiveTab] = useState('refine') // 'refine' | 'enhance'
  const [selectedSacrificeUid, setSelectedSacrificeUid] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [sparks, setSparks] = useState([])

  // Enhancement States
  const [selectedEnhanceSlot, setSelectedEnhanceSlot] = useState('')
  const [useLuckyRelic, setUseLuckyRelic] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [enhanceResult, setEnhanceResult] = useState(null)
  
  const [craftMasterTab, setCraftMasterTab] = useState('refine') // 'refine', 'ore', 'arcanite', 'legendary', 'faction'

  
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
    (tier === 2 && player.level >= 40) ||
    (tier === 3 && player.level >= 50)
  )

  const promoCost = eligibleForPromo ? PROMO_COSTS[tier + 1] : 0
  const canPromote = eligibleForPromo && player.resources.crd >= promoCost
  const canReclass = tier >= 1 && player.resources.crd >= RECLASS_COST

  const archonItems = itemsData.items.filter(it => it.id.startsWith(`archon_${player.race}`))

  const getArchonPrice = (itemId) => {
    const isWepArmorMantle = itemId.endsWith('armor') || itemId.endsWith('mantle') || itemId.endsWith('weapon')
    return isWepArmorMantle ? 25000 : 15000
  }

  const handlePromote = (jobId) => {
    const cost = PROMO_COSTS[tier + 1]
    if (player.resources.crd < cost) return
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
    if (player.resources.crd < cost) {
      alert(t('need_more_crd', { need: cost.toLocaleString(), owned: player.resources.crd.toLocaleString() }))
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
            {subView === 'arsenal_keeper' && '⚔️ Weapon Master'}
            {subView === 'armory_keeper' && '🛡️ Armor Master'}
            {subView === 'potion_merchant' && '🧪 Potion Merchant'}
            {subView === 'mining_supplier' && '⛏️ Mining Supplier'}
            {subView === 'eminence_qm' && '🎖️ Eminence Quartermaster'}
            {subView === 'forge_master' && '✨ Enchantment Master'}
            {subView === 'master_artisan' && '🔨 Craft Master'}
            {subView === 'vault_keeper' && '📦 Warehouse Keeper'}
            {subView === 'grand_warden' && '📜 Quest Manager'}
            {subView === 'trade_broker' && '💰 Auction Manager'}
            {subView === 'guild_steward' && '🏰 Guild Manager'}
            {subView === 'premium_shop_mgr' && '💎 Premium Shop Manager'}
          </span>
        </div>

        {/* View Router */}
        <div style={styles.modalBody}>
          {subView === 'lobby' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: '#88aadd', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: 0.5 }}>
                🏛️ NPC BASE — Headquarters
              </p>

              {/* 1. Weapon Master */}
              <button onClick={() => setSubView('arsenal_keeper')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>⚔️</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Weapon Master</div>
                    <div style={styles.lobbyCardDesc}>Common Weapon Shop</div>
                  </div>
                </div>
              </button>

              {/* 2. Armor Master */}
              <button onClick={() => setSubView('armory_keeper')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🛡️</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Armor Master</div>
                    <div style={styles.lobbyCardDesc}>Common Armor &amp; Shield Shop</div>
                  </div>
                </div>
              </button>

              {/* 3. Potion Merchant */}
              <button onClick={() => setSubView('potion_merchant')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🧪</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Potion Merchant</div>
                    <div style={styles.lobbyCardDesc}>HP Potion &amp; FP Potion</div>
                  </div>
                </div>
              </button>

              {/* 4. Mining Supplier */}
              <button onClick={() => setSubView('mining_supplier')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>⛏️</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Mining Supplier</div>
                    <div style={styles.lobbyCardDesc}>Mining Tools &amp; Trinity Core Mine</div>
                  </div>
                </div>
              </button>

              {/* 5. Eminence Quartermaster */}
              <button onClick={() => setSubView('eminence_qm')} className="cyber-panel" style={{...styles.lobbyCard, opacity: 0.6}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🎖️</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Eminence Quartermaster</div>
                    <div style={styles.lobbyCardDesc}>Government Equipment — Coming Soon</div>
                  </div>
                </div>
              </button>

              {/* 6. Enchantment Master */}
              <button onClick={() => setSubView('forge_master')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>✨</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Enchantment Master</div>
                    <div style={styles.lobbyCardDesc}>Enhancement / Enchant Equipment</div>
                  </div>
                </div>
              </button>

              {/* 7. Craft Master */}
              <button onClick={() => setSubView('master_artisan')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🔨</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Craft Master</div>
                    <div style={styles.lobbyCardDesc}>Shard, Arcanite &amp; Legendary Crafting</div>
                  </div>
                </div>
              </button>

              {/* 8. Warehouse Keeper */}
              <button onClick={() => setSubView('vault_keeper')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>📦</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Warehouse Keeper</div>
                    <div style={styles.lobbyCardDesc}>Personal Warehouse &amp; Upgrades</div>
                  </div>
                </div>
              </button>

              {/* 9. Quest Manager */}
              <button onClick={() => setSubView('grand_warden')} className="cyber-panel" style={{...styles.lobbyCard, opacity: 0.6}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>📜</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Quest Manager</div>
                    <div style={styles.lobbyCardDesc}>Quest &amp; Promotion — Coming Soon</div>
                  </div>
                </div>
              </button>

              {/* 10. Auction Manager */}
              <button onClick={() => setSubView('trade_broker')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>💰</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Auction Manager</div>
                    <div style={styles.lobbyCardDesc}>Auction House — Buy, Sell, List</div>
                  </div>
                </div>
              </button>

              {/* 11. Guild Manager */}
              <button onClick={() => setSubView('guild_steward')} className="cyber-panel" style={{...styles.lobbyCard, opacity: 0.6}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🏰</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Guild Manager</div>
                    <div style={styles.lobbyCardDesc}>Guild Management — Coming Soon</div>
                  </div>
                </div>
              </button>

              {/* 12. Premium Shop Manager */}
              <button onClick={() => setSubView('premium_shop_mgr')} className="cyber-panel" style={styles.lobbyCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>💎</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>Premium Shop Manager</div>
                    <div style={styles.lobbyCardDesc}>Premium Items — NXC Currency</div>
                  </div>
                </div>
              </button>

              {/* Faction Specialist (internal) */}
              <button onClick={() => setSubView('specialist')} className="cyber-panel" style={{...styles.lobbyCard, background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.08)'}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🤖</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>{specialistName}</div>
                    <div style={styles.lobbyCardDesc}>Job Class &amp; Promotion</div>
                  </div>
                </div>
              </button>

              {/* Race Hero (internal) */}
              <button onClick={() => setSubView('hero')} className="cyber-panel" style={{...styles.lobbyCard, background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.08)'}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={styles.lobbyIcon}>🏆</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={styles.lobbyCardTitle}>{heroName}</div>
                    <div style={styles.lobbyCardDesc}>Archon Equipment Shop</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* ─── WEAPON MASTER ─── */}
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

          {/* ─── ARMOR MASTER ─── */}
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

          {/* ─── ENCHANTMENT MASTER ─── */}
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
              {/* ───────── ITEM ENHANCEMENT TAB ───────── */}
        {(() => {
          const hasItem = !!(selectedEnhanceSlot && player.equipment?.[selectedEnhanceSlot])
          const item = hasItem ? player.equipment[selectedEnhanceSlot] : null
          const currentEnh = item ? (item.enhancement || 0) : 0
          const maxed = item ? currentEnh >= 8 : false

          // Costs
          const DIVINE_CREST_COSTS = [20, 40, 60, 80, 100, 120, 150, 200]
          const crestCost = item ? (DIVINE_CREST_COSTS[currentEnh] || 0) : 0
          
          // Owned materials
          const requiredArcaniteId = item?.arcanite_type || selectedArcanitePath || 'mat_arcanite_fury'
          const arcaniteOwned = player.inventory.filter(it => it.id === requiredArcaniteId).reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
          const crestOwned = player.inventory.filter(it => it.id === 'mat_divine_crest').reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
          const relicOwned = player.inventory.filter(it => it.id === 'mat_lucky_relic').reduce((sum, it) => sum + (it.count || it.qty || 1), 0)

          // Rates: +1 (100%), +2 (90%), +3 (70%), +4 (50%), +5 (35%), +6 (20%), +7 (10%), +8 (5%)
          const BASE_SUCCESS_RATES = [100, 90, 70, 50, 35, 20, 10, 5]
          const baseRate = item ? (BASE_SUCCESS_RATES[currentEnh] || 0) : 0
          const finalRate = hasItem ? (useLuckyRelic ? Math.min(100, baseRate + 10) : baseRate) : 0

          // Validity checks
          const hasArcanite = arcaniteOwned >= 1
          const hasCrests = crestOwned >= crestCost
          const hasRelic = !useLuckyRelic || relicOwned >= 1
          const canAfford = hasItem && hasArcanite && hasCrests && hasRelic && !maxed

          return (
            <div style={{ padding: '2px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                <label style={{ fontFamily: 'monospace', fontSize: '13px', color: '#88aadd' }}>Select Equipment to Enhance</label>
                <select
                  value={selectedEnhanceSlot}
                  onChange={(e) => {
                    setSelectedEnhanceSlot(e.target.value)
                    setEnhanceResult(null)
                  }}
                  style={{ width: '100%', padding: '10px', background: '#0a1628', border: '1px solid #1a3a6a', borderRadius: '8px', color: '#e0f4ff', fontFamily: 'monospace', fontSize: '13px' }}
                >
                  <option value="">-- Choose Slot --</option>
                  {player.equipment && Object.entries(player.equipment).map(([slot, it]) => {
                    if (!it || ['amulet1', 'amulet2', 'ring1', 'ring2', 'ascension_arms'].includes(slot)) return null
                    return (
                      <option key={slot} value={slot}>
                        {slot.toUpperCase()}: {it.emoji} {it.name} (+{it.enhancement || 0})
                      </option>
                    )
                  })}
                </select>
              </div>

              {hasItem && (!item.arcanite_type || currentEnh === 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  <label style={{ fontFamily: 'monospace', fontSize: '13px', color: '#88aadd' }}>Select Arcanite Focus</label>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6 }}>
                    {[
                      { id: 'mat_arcanite_fury', color: '#ffcc00', name: 'Fury' },
                      { id: 'mat_arcanite_ruin', color: '#ff4444', name: 'Ruin' },
                      { id: 'mat_arcanite_spirit', color: '#cc44ff', name: 'Spirit' },
                      { id: 'mat_arcanite_vital', color: '#00ff88', name: 'Vital' },
                      { id: 'mat_arcanite_guard', color: '#44aaff', name: 'Guard' },
                      { id: 'mat_arcanite_precision', color: '#ffffff', name: 'Prec' },
                      { id: 'mat_arcanite_agility', color: '#00ffff', name: 'Agility' },
                      { id: 'mat_arcanite_focus', color: '#ff8800', name: 'Focus' }
                    ].map(arc => {
                      const isSelected = selectedArcanitePath === arc.id
                      const hasThisArc = player.inventory.some(it => it.id === arc.id && (it.count || it.qty || 1) >= 1)
                      return (
                        <div
                          key={arc.id}
                          onClick={() => setSelectedArcanitePath(arc.id)}
                          style={{
                            minWidth: 44, height: 44,
                            borderRadius: 8,
                            background: isSelected ? `${arc.color}22` : 'rgba(10,15,25,0.8)',
                            border: `2px solid ${isSelected ? arc.color : 'rgba(255,255,255,0.1)'}`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: hasThisArc ? 1 : 0.4
                          }}
                          title={arc.name}
                        >
                          <img src={`/assets/items/${arc.id}.png`} style={{ width: 20, height: 20, objectFit: 'contain' }} alt={arc.name} />
                          <span style={{ fontSize: 9, fontFamily: 'monospace', color: isSelected ? arc.color : '#88aadd', marginTop: 2 }}>{arc.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Results display */}
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

              {/* Layout Chamber Panel */}
              <div style={{ padding: '16px 14px 14px', borderRadius: '14px', background: 'rgba(6,9,14,0.75)', border: `1.5px solid ${theme.primary}52`, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                
                {/* Large SVGs tempering circle */}
                <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto 12px' }}>
                  <svg width="260" height="260" style={{ position: 'absolute', top: 0, left: 0, animation: 'runeSpinRev 14s linear infinite' }}>
                    <circle cx="130" cy="130" r="120" fill="none" stroke={`${theme.primary}4d`} strokeWidth="1.5" strokeDasharray="6,4"/>
                  </svg>
                  <div style={{ position: 'absolute', top: 20, left: 20, width: 220, height: 220, borderRadius: '50%', background: `conic-gradient(from 0deg, transparent 0deg, ${theme.primary} 55deg, transparent 130deg, transparent 360deg)`, animation: 'spinFlow 4s linear infinite' }}></div>
                  <div style={{ position: 'absolute', top: 32, left: 32, width: 196, height: 196, borderRadius: '50%', background: '#06090e' }}></div>
                  <svg width="260" height="260" style={{ position: 'absolute', top: 0, left: 0, animation: 'runeSpin 20s linear infinite' }}>
                    <circle cx="130" cy="130" r="100" fill="none" stroke="rgba(199,204,214,0.3)" strokeWidth="1" strokeDasharray="20,6"/>
                  </svg>

                  {/* Orbit Indicators */}
                  {/* Top: SUCCESS RATE */}
                  <div style={{ position: 'absolute', top: 10, left: 108, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(95,224,138,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, fontWeight: 800, color: '#5fe08a' }}>{finalRate}%</span>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 6, fontWeight: 800, color: '#8a94a3', letterSpacing: '0.3px' }}>RATE</span>
                  </div>

                  {/* Right: CREST SLOTS */}
                  <div style={{ position: 'absolute', top: 78, left: 201, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(255,95,122,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff8080" strokeWidth="1.8">
                      <polygon points="12 2 20 7 20 17 12 22 4 17 4 7"/>
                    </svg>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, fontWeight: 800, color: '#ff8080' }}>{crestOwned}/{crestCost}</span>
                  </div>

                  {/* Right Bottom: ARCANITE CHECK */}
                  <div style={{ position: 'absolute', top: 187, left: 166, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(95,224,138,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    <img src={`/assets/items/${requiredArcaniteId}.png`} alt="Arcanite" style={{ width: 14, height: 14, objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5fe08a" strokeWidth="1.8" style={{ display: 'none' }}>
                      <path d="M12 2C8 8 5 12 5 15a7 7 0 0 0 14 0c0-3-3-7-7-13z"/>
                    </svg>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, fontWeight: 800, color: '#5fe08a' }}>{arcaniteOwned}/1</span>
                  </div>

                  {/* Left Bottom: LUCKY RELIC */}
                  <div
                    onClick={() => hasItem && !maxed && setUseLuckyRelic(!useLuckyRelic)}
                    style={{ position: 'absolute', top: 187, left: 50, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: `2px solid ${useLuckyRelic ? theme.primary : 'rgba(255,255,255,0.2)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3, cursor: hasItem ? 'pointer' : 'default' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={useLuckyRelic ? theme.primary : '#8a94a3'} strokeWidth="1.8">
                      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 6, fontWeight: 800, color: useLuckyRelic ? theme.light : '#8a94a3', letterSpacing: '0.2px' }}>
                      {useLuckyRelic ? 'RELIC ON' : 'RELIC'}
                    </span>
                  </div>

                  {/* Left: CURRENT LEVEL */}
                  <div style={{ position: 'absolute', top: 78, left: 15, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(199,204,214,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, fontWeight: 900, color: '#c7ccd6' }}>+{currentEnh}</span>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 6, fontWeight: 800, color: '#8a94a3' }}>LEVEL</span>
                  </div>

                  {/* Center equipped slot */}
                  <div style={{ position: 'absolute', top: 90, left: 90, width: 80, height: 80, borderRadius: 14, background: `linear-gradient(135deg, ${theme.primary}47, rgba(0,0,0,0.65))`, border: `2.5px solid ${theme.primary}`, boxShadow: `0 0 16px ${theme.primary}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
                    {isEnhancing ? (
                      theme.weaponSmithSvg
                    ) : hasItem ? (
                      resolveItemImage(item, player.race, player.job) ? (
                        <img referrerPolicy="no-referrer" src={resolveItemImage(item, player.race, player.job)} style={{ width: 60, height: 60, objectFit: 'contain' }} alt={item.name} />
                      ) : null
                    ) : null}
                  </div>

                  {/* Sparks */}
                  {isEnhancing && sparks.map(s => (
                    <div
                      key={s.id}
                      className="spark-particle"
                      style={{
                        position: 'absolute',
                        top: 130,
                        left: 130,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: theme.primary,
                        boxShadow: `0 0 8px ${theme.primary}`,
                        pointerEvents: 'none',
                        transform: `rotate(${s.angle}deg) translate(${s.dist}px) scale(${s.scale})`,
                        transition: 'transform 1s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1s',
                      }}
                    />
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '15px', fontWeight: '800', color: '#fff' }}>
                    {hasItem ? `${item.name} +${currentEnh} ➜ +${currentEnh + 1}` : 'NO ITEM SELECTED'}
                  </div>
                </div>

                {!hasItem ? (
                  <button
                    disabled={true}
                    style={{
                      width: '100%',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '11px 0',
                      textAlign: 'center',
                      background: 'rgba(28,36,56,0.8)',
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '13px',
                      fontWeight: '800',
                      color: '#4a8fa8',
                      letterSpacing: '1px',
                      cursor: 'not-allowed'
                    }}
                  >
                    SELECT AN ITEM FIRST
                  </button>
                ) : maxed ? (
                  <div style={{ color: '#00ff88', fontFamily: "'Share Tech Mono', monospace", fontSize: '13px', fontWeight: 'bold', textAlign: 'center', padding: '10px 0' }}>
                    ⭐ MAXIMUM ENHANCEMENT LEVEL (+8) REACHED!
                  </div>
                ) : (
                  <div>
                    {/* Stat Preview Panel */}
                    <div style={{ padding: '10px 12px', borderRadius: '8px', background: `${theme.primary}12`, border: `1px solid ${theme.primary}47`, margin: '14px 0 12px' }}>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', fontWeight: '800', color: theme.light, letterSpacing: '0.5px', marginBottom: '6px' }}>STATS PREVIEW (+{currentEnh} ➜ +{currentEnh + 1})</div>
                      {item.type === 'weapon' ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '13px', color: '#cdd5e0' }}>
                          <span>ATK Bonus:</span>
                          <span>{Math.floor((item.bonus?.atk || 0) * (1 + currentEnh * 0.1))} ➜ <b style={{ color: '#5fe08a' }}>{Math.floor((item.bonus?.atk || 0) * (1 + (currentEnh + 1) * 0.1))}</b></span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '13px', color: '#cdd5e0' }}>
                            <span>DEF Bonus:</span>
                            <span>{Math.floor((item.bonus?.def || 0) * (1 + currentEnh * 0.1))} ➜ <b style={{ color: '#5fe08a' }}>{Math.floor((item.bonus?.def || 0) * (1 + (currentEnh + 1) * 0.1))}</b></span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '13px', color: '#cdd5e0' }}>
                            <span>HP Bonus:</span>
                            <span>{Math.floor((item.bonus?.hp || 0) * (1 + currentEnh * 0.1))} ➜ <b style={{ color: '#5fe08a' }}>{Math.floor((item.bonus?.hp || 0) * (1 + (currentEnh + 1) * 0.1))}</b></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Destruction warning alert */}
                    {currentEnh >= 5 && (
                      <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,68,68,0.12)', border: '1.5px dashed #ff4444', fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', color: '#ff8080', textAlign: 'center', lineHeight: 1.4, marginBottom: '12px' }}>
                        ⚠ +5 AND ABOVE RISKS ITEM DESTRUCTION ON FAILURE
                      </div>
                    )}

                    {/* Checkbox Lucky Relic in form */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <input
                        type="checkbox"
                        id="useLuckyRelicChk"
                        checked={useLuckyRelic}
                        onChange={(e) => setUseLuckyRelic(e.target.checked)}
                        style={{ cursor: 'pointer', width: 15, height: 15 }}
                      />
                      <label htmlFor="useLuckyRelicChk" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#fff', cursor: 'pointer', userSelect: 'none' }}>
                        Gunakan Lucky Relic (+10% Success Rate)
                      </label>
                    </div>

                    <button
                      onClick={handleEnhance}
                      disabled={!canAfford || isEnhancing}
                      style={{
                        width: '100%',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '11px 0',
                        textAlign: 'center',
                        background: canAfford ? `linear-gradient(135deg, ${theme.primary}, #b32c0d)` : 'rgba(28,36,56,0.8)',
                        boxShadow: canAfford ? `0 0 14px ${theme.primary}66` : 'none',
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '13px',
                        fontWeight: '800',
                        color: canAfford ? '#fff' : '#4a8fa8',
                        letterSpacing: '1px',
                        cursor: canAfford ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {isEnhancing ? 'ENHANCING...' : 'ENHANCE ITEM'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        
            </div>
          )}

          {/* ─── CRAFT MASTER ─── */}
          {subView === 'master_artisan' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px 8px' }}>
                {[
                  { id: 'refine', label: 'WEAPON SMITH', emoji: '🔨' },
                  { id: 'ore', label: 'ORE REFINEMENT', emoji: '💎' },
                  { id: 'arcanite', label: 'ARCANITE SYNTHESIS', emoji: '🔮' },
                  { id: 'legendary', label: 'LEGENDARY FORGE', emoji: '⚔️' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setCraftMasterTab(tab.id)}
                    style={{
                      flexShrink: 0,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: craftMasterTab === tab.id ? 'rgba(0, 229, 255, 0.15)' : 'rgba(10, 15, 25, 0.8)',
                      border: `1px solid ${craftMasterTab === tab.id ? '#00e5ff' : 'rgba(255,255,255,0.1)'}`,
                      color: craftMasterTab === tab.id ? '#00e5ff' : '#88aadd',
                      fontFamily: 'var(--font-title)',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span>{tab.emoji}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

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
              {/* ───────── WEAPON SMITH TAB ───────── */}
        {craftMasterTab === 'refine' && (() => {
          const equippedWeapon = player.equipment?.weapon
          const ownedIgnorance = player.inventory.filter(it => it.id === 'talic_ignorance').reduce((sum, it) => sum + (it.count || it.qty || 1), 0)
          const hasWeapon = !!equippedWeapon
          const weaponName = hasWeapon ? equippedWeapon.name : 'NO WEAPON EQUIPPED'
          const weaponGrade = hasWeapon ? getWeaponRarityDisplayName(equippedWeapon.rarityGrade || equippedWeapon.rarity).toUpperCase() : 'NONE'
          
          const grade = hasWeapon ? (equippedWeapon.rarityGrade || 'normal').toLowerCase() : 'normal'
          const cost = REFINE_COSTS[grade]
          
          const nextRarity = hasWeapon && cost ? cost.next.toUpperCase() : (hasWeapon ? 'MAX' : 'NONE')
          const nextPercent = hasWeapon && cost ? (cost.next === 'advanced' ? '5%' : cost.next === 'rare' ? '10%' : cost.next === 'epic' ? '15%' : cost.next === 'legendary' ? '20%' : '30%') : '0%'

          const requiredTalicsText = hasWeapon && cost ? `${ownedIgnorance}/${cost.talics}` : `0/0`
          const requiredCrdText = hasWeapon && cost ? `${(cost.crd / 1000).toFixed(0)}K` : '0K'
          const hasTalics = hasWeapon && cost ? (ownedIgnorance >= cost.talics) : false
          const hasCrd = hasWeapon && cost ? (player.resources.crd >= cost.crd) : false
          const canUpgrade = hasWeapon && cost ? (hasTalics && hasCrd) : false

          return (
            <div style={{ padding: '2px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', color: theme.light }}>WEAPON SMITH & REFINE</div>
                
                {/* Refining Section */}
                <div style={{ padding: '16px 14px 14px', borderRadius: '14px', background: 'rgba(6, 9, 14, 0.75)', border: `1.5px solid ${theme.primary}52`, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  
                  {/* Rotating Circle SVG Chamber */}
                  <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 12px' }}>
                    <svg width="220" height="220" style={{ position: 'absolute', top: 0, left: 0, animation: 'runeSpinRev 14s linear infinite' }}>
                      <circle cx="110" cy="110" r="100" fill="none" stroke={`${theme.primary}4d`} strokeWidth="1.5" strokeDasharray="6,4"/>
                    </svg>
                    <div style={{ position: 'absolute', top: 14, left: 14, width: 192, height: 192, borderRadius: '50%', background: `conic-gradient(from 0deg, transparent 0deg, ${theme.primary} 55deg, transparent 130deg, transparent 360deg)`, animation: 'spinFlow 4s linear infinite' }}></div>
                    <div style={{ position: 'absolute', top: 25, left: 25, width: 170, height: 170, borderRadius: '50%', background: '#06090e' }}></div>
                    <svg width="220" height="220" style={{ position: 'absolute', top: 0, left: 0, animation: 'runeSpin 20s linear infinite' }}>
                      <circle cx="110" cy="110" r="85" fill="none" stroke="rgba(199,204,214,0.3)" strokeWidth="1" strokeDasharray="20,6"/>
                    </svg>

                    {/* Indicators */}
                    {/* Top: Next Rarity */}
                    <div style={{ position: 'absolute', top: 0, left: 88, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(245,166,35,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 7, fontWeight: 800, color: '#8a94a3', letterSpacing: '0.3px' }}>NEXT</span>
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, fontWeight: 800, color: '#f5a623' }}>
                        {nextRarity}
                      </span>
                    </div>

                    {/* Right: Required Talics */}
                    <div style={{ position: 'absolute', top: 132, left: 164, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(95,224,138,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5fe08a" strokeWidth="1.8">
                        <path d="M12 2C8 8 5 12 5 15a7 7 0 0 0 14 0c0-3-3-7-7-13z"/>
                      </svg>
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 8, fontWeight: 800, color: '#5fe08a' }}>
                        {requiredTalicsText}
                      </span>
                    </div>

                    {/* Left: Required CRD */}
                    <div style={{ position: 'absolute', top: 132, left: 12, width: 44, height: 44, borderRadius: 9, background: 'rgba(10,15,25,0.95)', border: '2px solid rgba(255,95,122,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff8080" strokeWidth="1.8">
                        <polygon points="7,0 14,4 14,12 7,16 0,12 0,4" transform="translate(5,4)"/>
                      </svg>
                      <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 7, fontWeight: 800, color: '#ff8080' }}>
                        {requiredCrdText}
                      </span>
                    </div>

                    {/* Center slot */}
                    <div style={{ position: 'absolute', top: 74, left: 74, width: 72, height: 72, borderRadius: 14, background: `linear-gradient(135deg, ${theme.primary}47, rgba(0,0,0,0.65))`, border: `2.5px solid ${theme.primary}`, boxShadow: `0 0 16px ${theme.primary}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
                      {isRefining ? (
                        theme.weaponSmithSvg
                      ) : hasWeapon ? (
                        equippedWeapon.image ? (
                          <img referrerPolicy="no-referrer" src={equippedWeapon.image} style={{ width: 60, height: 60, objectFit: 'contain' }} alt={equippedWeapon.name} />
                        ) : null
                      ) : null}
                    </div>

                    {/* Sparks */}
                    {isRefining && sparks.map(s => (
                      <div
                        key={s.id}
                        className="spark-particle"
                        style={{
                          position: 'absolute',
                          top: 110,
                          left: 110,
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: theme.primary,
                          boxShadow: `0 0 8px ${theme.primary}`,
                          pointerEvents: 'none',
                          transform: `rotate(${s.angle}deg) translate(${s.dist}px) scale(${s.scale})`,
                          transition: 'transform 1s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1s',
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '15px', fontWeight: '800', color: '#fff' }}>{weaponName}</div>
                    <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '12px', color: '#f5a623', marginTop: '2px' }}>
                      Grade: {weaponGrade}
                    </div>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '14px 0' }}></div>

                  {!hasWeapon ? (
                    <button
                      disabled={true}
                      style={{
                        width: '100%',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '11px 0',
                        textAlign: 'center',
                        background: 'rgba(28,36,56,0.8)',
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '13px',
                        fontWeight: '800',
                        color: '#4a8fa8',
                        letterSpacing: '1px',
                        cursor: 'not-allowed'
                      }}
                    >
                      NO WEAPON EQUIPPED
                    </button>
                  ) : !cost ? (
                    <div style={{ color: '#00ff88', fontFamily: "'Share Tech Mono', monospace", fontSize: '13px', fontWeight: 'bold', textAlign: 'center', padding: '10px 0' }}>
                      MAX RARITY GRADE REACHED
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', fontWeight: '700', color: theme.light, letterSpacing: '0.5px', marginBottom: '12px' }}>
                        NEXT GRADE: {cost.next.toUpperCase()} (+{nextPercent} ATK)
                      </div>
                      <button
                        disabled={!canUpgrade || isRefining}
                        onClick={handleRefine}
                        style={{
                          width: '100%',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '11px 0',
                          textAlign: 'center',
                          background: canUpgrade ? `linear-gradient(135deg, ${theme.primary}, #b32c0d)` : 'rgba(28,36,56,0.8)',
                          boxShadow: canUpgrade ? `0 0 14px ${theme.primary}66` : 'none',
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: '13px',
                          fontWeight: '800',
                          color: canUpgrade ? '#fff' : '#4a8fa8',
                          letterSpacing: '1px',
                          cursor: canUpgrade ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {isRefining ? 'SMITHING...' : canUpgrade ? 'REFINE WEAPON' : 'LACKING MATERIALS'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Combining Section */}
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', color: theme.light, marginTop: 10 }}>CRAFT VAMPIRIC WEAPON</div>
                <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(6,9,14,0.72)', border: `1.5px solid ${theme.primary}4d` }}>
                  <div style={{ fontFamily: "'Saira', sans-serif", fontSize: '13px', color: '#a8b4c4', lineHeight: 1.5, marginBottom: '12px' }}>
                    Sacrifice an Epic+ weapon to imbue your weapon with a lifesteal property.
                  </div>

                  {!hasWeapon ? (
                    <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '13px', textAlign: 'center', lineHeight: 1.4 }}>
                      NO WEAPON EQUIPPED
                    </div>
                  ) : equippedWeapon.specialProperty === 'vampire' ? (
                    <div style={{ background: 'rgba(95,224,138,0.1)', border: '1px solid #5fe08a', color: '#5fe08a', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>
                      VAMPIRIC EFFECT ALREADY ACTIVE
                    </div>
                  ) : !isEpicOrHigher(equippedWeapon) ? (
                    <div style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '13px', textAlign: 'center', lineHeight: 1.4 }}>
                      WEAPON OF EPIC GRADE OR HIGHER REQUIRED
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                        <label style={{ fontFamily: 'monospace', fontSize: '13px', color: '#88aadd' }}>Select Sacrificial Weapon</label>
                        <select
                          value={selectedSacrificeUid}
                          onChange={(e) => setSelectedSacrificeUid(e.target.value)}
                          style={{ width: '100%', padding: '10px', background: '#0a1628', border: '1px solid #1a3a6a', borderRadius: '8px', color: '#e0f4ff', fontFamily: 'monospace', fontSize: '13px' }}
                        >
                          <option value="">-- Choose Weapon --</option>
                          {sacrificePool.map(it => (
                            <option key={it.uid} value={it.uid}>
                              {it.emoji} {it.name} (Lv.{it.level})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '12px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 11px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${selectedSacrificeUid ? '#5fe08a' : 'rgba(255,255,255,0.08)'}` }}>
                          <span style={{ fontFamily: "'Saira', sans-serif", fontSize: '13px', color: '#cdd5e0' }}>Sacrifice Weapon</span>
                          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '13px', color: selectedSacrificeUid ? '#5fe08a' : '#ff8080', fontWeight: 700 }}>{selectedSacrificeUid ? '1 / 1' : '0 / 1'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 11px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${ownedFavor >= 1 ? '#5fe08a' : 'rgba(255,255,255,0.08)'}` }}>
                          <span style={{ fontFamily: "'Saira', sans-serif", fontSize: '13px', color: '#cdd5e0' }}>Favor Talic</span>
                          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '13px', color: ownedFavor >= 1 ? '#5fe08a' : '#ff8080', fontWeight: 700 }}>{ownedFavor} / 1</span>
                        </div>
                      </div>

                      <button
                        onClick={handleCombine}
                        disabled={!selectedSacrificeUid || ownedFavor < 1}
                        style={{
                          width: '100%',
                          border: 'none',
                          borderRadius: '10px',
                          padding: '11px 0',
                          textAlign: 'center',
                          background: (selectedSacrificeUid && ownedFavor >= 1) ? `linear-gradient(135deg, ${theme.primary}, #b32c0d)` : 'rgba(28,36,56,0.8)',
                          boxShadow: (selectedSacrificeUid && ownedFavor >= 1) ? `0 0 14px ${theme.primary}66` : 'none',
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: '13px',
                          fontWeight: '800',
                          color: (selectedSacrificeUid && ownedFavor >= 1) ? '#fff' : '#4a8fa8',
                          letterSpacing: '1px',
                          cursor: (selectedSacrificeUid && ownedFavor >= 1) ? 'pointer' : 'not-allowed'
                        }}
                      >
                        FORGE VAMPIRIC WEAPON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

        
        {craftMasterTab === 'ore' && (() => {
           const ELEMENTS = [
             { id: 'ignis', label: 'Ignis', emoji: '🔴', color: '#ff4444' },
             { id: 'virel', label: 'Virel', emoji: '🔵', color: '#44aaff' },
             { id: 'kryos', label: 'Kryos', emoji: '🟢', color: '#44ff88' },
             { id: 'zephra', label: 'Zephra', emoji: '🟡', color: '#ffcc00' },
             { id: 'umbrix', label: 'Umbrix', emoji: '⚫', color: '#88aadd' }
           ]
           const TIERS = [
             { id: 'common', label: 'Common', reqCount: 5, cost: 10000 },
             { id: 'rare', label: 'Rare', reqCount: 5, cost: 25000 },
             { id: 'epic', label: 'Epic', reqCount: 5, cost: 50000 }
           ]
           return (
             <div style={{ padding: '0 16px 80px' }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: '#00e5ff', letterSpacing: 1, marginBottom: 14, textAlign: 'center', borderBottom: '1px solid rgba(0,229,255,0.3)', paddingBottom: 8 }}>
                  💎 ORE REFINEMENT — Extract Shards from Ores
                </div>
                {ELEMENTS.map(elem => (
                   <div key={elem.id} style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: 14, color: elem.color, marginBottom: 8 }}>{elem.emoji} {elem.label} Ores</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                         {TIERS.map(tier => {
                            const oreId = `ore_${elem.id}_${tier.id}`
                            const ownedOre = player.inventory.filter(i => i.id === oreId).reduce((s, i) => s + (i.count || i.qty || 1), 0)
                            const canCraft = ownedOre >= tier.reqCount && player.resources.crd >= tier.cost
                            return (
                              <div key={tier.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(3,8,20,0.6)', border: `1px solid ${canCraft ? elem.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 8 }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ fontSize: 24 }}>{elem.emoji}</div>
                                    <div>
                                       <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#fff' }}>{tier.label} {elem.label} Shard</div>
                                       <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#88aadd' }}>Req: {tier.reqCount}x Ore | Cost: {(tier.cost/1000).toFixed(0)}k CRD</div>
                                    </div>
                                 </div>
                                 <button 
                                    onClick={() => {
                                        const res = craftShard(elem.id, tier.id)
                                        if (res?.ok) alert(`✨ Berhasil craft ${tier.label} ${elem.label} Shard!`)
                                        else alert(`❌ ${res?.msg || 'Gagal craft'}`)
                                    }}
                                    disabled={!canCraft}
                                    style={{ padding: '8px 14px', borderRadius: 6, background: canCraft ? elem.color : 'rgba(255,255,255,0.1)', color: canCraft ? '#000' : '#88aadd', border: 'none', fontFamily: 'var(--font-title)', fontSize: 11, fontWeight: 800, cursor: canCraft ? 'pointer' : 'not-allowed' }}
                                 >
                                    {ownedOre}/{tier.reqCount}
                                 </button>
                              </div>
                            )
                         })}
                      </div>
                   </div>
                ))}
             </div>
           )
        })()}

        {craftMasterTab === 'arcanite' && (() => {
           const ARCANITES = [
             { id: 'mat_arcanite_fury', name: 'Fury', color: '#ffcc00', reqs: [{id: 'shard_ignis_epic', emoji:'🔴'}, {id: 'shard_virel_epic', emoji:'🔵'}] },
             { id: 'mat_arcanite_ruin', name: 'Ruin', color: '#ff4444', reqs: [{id: 'shard_ignis_epic', count:2, emoji:'🔴'}] },
             { id: 'mat_arcanite_spirit', name: 'Spirit', color: '#cc44ff', reqs: [{id: 'shard_zephra_epic', count:2, emoji:'🟡'}] },
             { id: 'mat_arcanite_vital', name: 'Vital', color: '#00ff88', reqs: [{id: 'shard_umbrix_epic', count:2, emoji:'⚫'}] },
             { id: 'mat_arcanite_guard', name: 'Guard', color: '#44aaff', reqs: [{id: 'shard_kryos_epic', count:2, emoji:'🟢'}] },
             { id: 'mat_arcanite_precision', name: 'Precision', color: '#ffffff', reqs: [{id: 'shard_zephra_epic', emoji:'🟡'}, {id: 'shard_kryos_epic', emoji:'🟢'}] },
             { id: 'mat_arcanite_agility', name: 'Agility', color: '#00ffff', reqs: [{id: 'shard_virel_epic', count:2, emoji:'🔵'}] },
             { id: 'mat_arcanite_focus', name: 'Focus', color: '#ff8800', reqs: [{id: 'shard_ignis_epic', emoji:'🔴'}, {id: 'shard_zephra_epic', emoji:'🟡'}] }
           ]
           return (
             <div style={{ padding: '0 16px 80px' }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: '#cc44ff', letterSpacing: 1, marginBottom: 14, textAlign: 'center', borderBottom: '1px solid rgba(204,68,255,0.3)', paddingBottom: 8 }}>
                  🔮 ARCANITE SYNTHESIS — Create powerful enhancement stones
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#88aadd', textAlign: 'center', marginBottom: 14 }}>Cost per Arcanite: 100K CRD</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                   {ARCANITES.map(arc => {
                      let canCraft = true
                      const checkReqs = arc.reqs.map(r => {
                          const need = r.count || 1
                          const owned = player.inventory.filter(i => i.id === r.id).reduce((s, i) => s + (i.count || i.qty || 1), 0)
                          if (owned < need) canCraft = false
                          return { ...r, need, owned }
                      })
                      if (player.resources.crd < 100000) canCraft = false
                      
                      return (
                         <div key={arc.id} style={{ padding: '10px', background: 'rgba(3,8,20,0.6)', border: `1px solid ${canCraft ? arc.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <img src={`/assets/items/${arc.id}.png`} style={{ width: 32, height: 32, objectFit: 'contain', marginBottom: 6 }} alt={arc.name} />
                            <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: arc.color, marginBottom: 4 }}>{arc.name}</div>
                            <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                               {checkReqs.map((cr, idx) => (
                                  <span key={idx} style={{ fontSize: 10, color: cr.owned >= cr.need ? '#5fe08a' : '#ff4444', fontFamily: 'monospace' }}>{cr.emoji} {cr.owned}/{cr.need}</span>
                               ))}
                            </div>
                            <button 
                                onClick={() => {
                                   const res = craftArcanite(arc.id)
                                   if (res?.ok) alert(`✨ Berhasil craft Arcanite ${arc.name}!`)
                                   else alert(`❌ ${res?.msg || 'Gagal craft'}`)
                                }}
                                disabled={!canCraft}
                                style={{ width: '100%', padding: '6px 0', borderRadius: 4, background: canCraft ? arc.color : 'rgba(255,255,255,0.1)', color: canCraft ? '#000' : '#88aadd', border: 'none', fontFamily: 'var(--font-title)', fontSize: 10, fontWeight: 800, cursor: canCraft ? 'pointer' : 'not-allowed' }}
                            >
                                CRAFT
                            </button>
                         </div>
                      )
                   })}
                </div>
             </div>
           )
        })()}

        {craftMasterTab === 'legendary' && (() => {
          const SHARD_TYPES = [
            { id: 'shard_ignis_epic',  label: 'Ignis',  emoji: '🔴' },
            { id: 'shard_virel_epic',  label: 'Virel',  emoji: '🔵' },
            { id: 'shard_kryos_epic',  label: 'Kryos',  emoji: '🟢' },
            { id: 'shard_zephra_epic', label: 'Zephra', emoji: '🟡' },
            { id: 'shard_umbrix_epic', label: 'Umbrix', emoji: '⚫' },
          ]
          const inv = player.inventory
          const countOf = (id) => inv.filter(i => i.id === id).reduce((sum, i) => sum + (i.count || i.qty || 1), 0)

          const RECIPES = [
            { id: 'leg_weapon', label: 'Legendary Weapon',  emoji: '⚔️',  baseId: 'mat_epic_weapon',  baseLabel: 'Epic Weapon',  shards: 6 },
            { id: 'leg_armor',  label: 'Legendary Armor',   emoji: '🦾',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
            { id: 'leg_helmet', label: 'Legendary Helmet',  emoji: '⛑️',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
            { id: 'leg_mantle', label: 'Legendary Mantle',  emoji: '🥋',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
            { id: 'leg_gloves', label: 'Legendary Gloves',  emoji: '🧤',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
            { id: 'leg_boots',  label: 'Legendary Boots',   emoji: '👢',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
            { id: 'leg_shield', label: 'Legendary Shield',  emoji: '🛡️',  baseId: 'mat_epic_armor',   baseLabel: 'Epic Armor',   shards: 4 },
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
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: '#f5a623', letterSpacing: 1, marginBottom: 14, textAlign: 'center', borderBottom: '1px solid rgba(245,166,35,0.3)', paddingBottom: 8 }}>
                ⚔️ LEGENDARY FORGE — Craft equipment of legendary power
              </div>
              {RECIPES.map(recipe => {
                const baseOwned = countOf(recipe.baseId)
                const shardCounts = SHARD_TYPES.map(s => ({ ...s, owned: countOf(s.id), need: recipe.shards }))
                const canCraft = baseOwned >= 1 && shardCounts.every(s => s.owned >= s.need)
                return (
                  <div key={recipe.id} style={{ marginBottom: 14, background: 'rgba(3,8,20,0.6)', border: `1.5px solid ${canCraft ? '#f5a623' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: 14 }}>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: `1px solid ${baseOwned >= 1 ? 'rgba(95,224,138,0.4)' : 'rgba(255,95,122,0.3)'}`, fontSize: 12, color: baseOwned >= 1 ? '#5fe08a' : '#ff6a4d', fontWeight: 700 }}>
                        📦 {recipe.baseLabel} ×1 ({baseOwned}/1)
                      </div>
                      {/* Shards */}
                      {shardCounts.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: `1px solid ${s.owned >= s.need ? 'rgba(95,224,138,0.4)' : 'rgba(255,95,122,0.3)'}`, fontSize: 12, color: s.owned >= s.need ? '#5fe08a' : '#ff6a4d', fontWeight: 700 }}>
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
                      disabled={!canCraft}
                      style={{ width: '100%', border: 'none', borderRadius: 8, padding: '10px 0', fontFamily: 'var(--font-title)', fontSize: 12, fontWeight: 800, cursor: canCraft ? 'pointer' : 'not-allowed', background: canCraft ? 'linear-gradient(135deg,#f5a623,#ff6b35)' : 'rgba(28,36,56,0.8)', color: canCraft ? '#1a0f00' : '#4a8fa8', letterSpacing: 1, boxShadow: canCraft ? '0 0 12px rgba(245,166,35,0.4)' : 'none', transition: 'all 0.2s' }}
                    >
                      {canCraft ? `⚡ CRAFT ${recipe.label.toUpperCase()}` : '🔒 MATERIALS MISSING'}
                    </button>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* ───────── SET SHOP TAB ───────── */}
        
            </div>
          )}

          
          {/* ─── EMINENCE QUARTERMASTER ─── */}
          {subView === 'eminence_qm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={styles.avatarRow}>
                <div style={styles.npcAvatarLarge}><span style={{ fontSize: 52 }}>🎖️</span></div>
                <div style={styles.npcDialog}>"Government equipment and Faction Sets are available here."</div>
              </div>
              <div style={styles.statusBox}>
                <div style={styles.statusLabel}>ROLE</div>
                <div style={styles.statusVal}>Eminence Quartermaster</div>
              </div>
              {(() => {
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
                { id: 'emi_helmet', name: 'Helmet', price: 100000000 },
                { id: 'emi_armor',  name: 'Armor',  price: 100000000 },
                { id: 'emi_pants',  name: 'Pants',  price: 100000000 },
                { id: 'emi_gloves', name: 'Gloves', price: 100000000 },
                { id: 'emi_boots',  name: 'Boots',  price: 100000000 },
                { id: 'emi_ring',   name: 'Ring',   price: 100000000 },
                { id: 'emi_amulet', name: 'Amulet', price: 100000000 },
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
          )}

          {/* ─── COMING SOON NPCs ─── */}
          {['guild_steward', 'grand_warden'].includes(subView) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', paddingTop: 20 }}>
              <div style={{ fontSize: 64 }}>
                {subView === 'guild_steward' && '🏰'}
                {subView === 'grand_warden' && '📜'}
                {subView === 'eminence_qm' && '🎖️'}
              </div>
              <div style={{ fontFamily: 'var(--font-title)', fontSize: 20, color: '#00e5ff', fontWeight: 900, textAlign: 'center', letterSpacing: 1 }}>
                {subView === 'guild_steward' && 'Guild Manager'}
                {subView === 'grand_warden' && 'Quest Manager'}
                {subView === 'eminence_qm' && 'Eminence Quartermaster'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#88aadd', textAlign: 'center', lineHeight: 1.6 }}>
                {subView === 'guild_steward' && '"The Guild Hall is under construction. Come back soon, Commander."'}
                {subView === 'grand_warden' && '"I handle all Guild, faction, and quest assignments. Mission board coming soon."'}
                {subView === 'eminence_qm' && '"Government equipment is reserved for council members. Access coming soon."'}
              </div>
              <div style={{ background: 'rgba(255, 204, 0, 0.1)', border: '1.5px dashed rgba(255,204,0,0.4)', borderRadius: 10, padding: '12px 20px', fontFamily: 'var(--font-title)', fontSize: 14, color: '#ffcc00', fontWeight: 800, letterSpacing: 1, textAlign: 'center' }}>
                🚧 COMING SOON
              </div>
            </div>
          )}

          {/* ─── MINING SUPPLIER ─── */}
          {subView === 'mining_supplier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={styles.avatarRow}>
                <div style={styles.npcAvatarLarge}><span style={{ fontSize: 52 }}>⛏️</span></div>
                <div style={styles.npcDialog}>"Stock up on supplies before heading into Trinity Core Mine. I have everything you need."</div>
              </div>
              <div style={styles.statusBox}>
                <div style={styles.statusLabel}>ROLE</div>
                <div style={styles.statusVal}>Mining Supply NPC</div>
              </div>
              <div style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', fontWeight: 800, marginBottom: 10 }}>MINING SUPPLIES SHOP</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#88aadd', marginBottom: 10 }}>Peralatan Mining &amp; Trinity Core Mine</div>
                {[
                  { 
                    id: 'tool_mining_pickaxe', 
                    label: player.race === 'arctron' ? 'Arctron Mining Tool' : player.race === 'bionex' ? 'Bionex Mining Tool' : 'Celestra Mining Tool', 
                    price: 50000,
                    img: player.race === 'arctron' ? miningToolArctron : player.race === 'bionex' ? miningToolBionex : miningToolCelestra
                  },
                  { id: 'pot_mining_battery_s', label: '🔋 Battery S (Mining Fuel x1)', price: 25000 },
                  { id: 'pot_mining_battery_m', label: '🔋 Battery M (Mining Fuel x3)', price: 60000 },
                  { id: 'pot_mining_battery_l', label: '🔋 Battery L (Mining Fuel x10)', price: 150000 },
                ].map(({ id, label, price, img }) => (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {img && (
                        <div style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.5)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <img src={img} alt="tool" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#e0f4ff' }}>{label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00ff88' }}>{price.toLocaleString()} CRD</div>
                      </div>
                    </div>
                    <button
                      style={{ background: 'linear-gradient(135deg,#00e5ff,#0088bb)', border: 'none', borderRadius: 6, color: '#000', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 11, padding: '6px 12px', cursor: 'pointer' }}
                      onClick={() => { useGameStore.getState().buyFromNpc(id); }}
                    >BUY</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── PREMIUM SHOP MANAGER ─── */}
          {subView === 'premium_shop_mgr' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={styles.avatarRow}>
                <div style={styles.npcAvatarLarge}><span style={{ fontSize: 52 }}>💎</span></div>
                <div style={styles.npcDialog}>"Looking for premium items? You've come to the right place. NXC accepted here."</div>
              </div>
              <div style={styles.statusBox}>
                <div style={styles.statusLabel}>ROLE</div>
                <div style={styles.statusVal}>Premium Shop NPC</div>
              </div>
              <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: 13, color: '#ffd700', fontWeight: 800, marginBottom: 6 }}>💎 PREMIUM SHOP — NXC</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#88aadd', marginBottom: 10 }}>Mata uang: NXC (Nova Exchange Credit)</div>
                {[
                  { label: '🌟 EXP Boost x2 (1 Jam)', price: 50 },
                  { label: '⚡ Drop Rate +5% (1 Jam)', price: 75 },
                  { label: '💊 ATK Potion 25% (3 Min)', price: 30 },
                  { label: '🇮🇱 Inventory Slot +20', price: 200 },
                  { label: '🏷️ Custom Title Slot', price: 500 },
                ].map(({ label, price }, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#e0f4ff' }}>{label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ffd700', fontWeight: 700 }}>{price} NXC</span>
                      <button
                        style={{ background: 'linear-gradient(135deg,#ffd700,#cc8800)', border: 'none', borderRadius: 6, color: '#000', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 11, padding: '5px 10px', cursor: 'pointer' }}
                        onClick={() => alert('Premium Shop: Feature coming soon!')}
                      >BUY</button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: 12, color: '#ffd700', fontWeight: 700, marginBottom: 8 }}>💳 TOP UP NXC</div>
                {[
                  { label: 'Starter Pack', nxc: 100, price: 'Rp 10.000' },
                  { label: 'Value Pack', nxc: 550, price: 'Rp 50.000' },
                  { label: 'Premium Pack', nxc: 1200, price: 'Rp 100.000' },
                  { label: 'Elite Pack', nxc: 2600, price: 'Rp 200.000' },
                ].map(({ label, nxc, price }, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderTop: idx > 0 ? '1px solid rgba(255,215,0,0.1)' : 'none' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#ffd700', fontWeight: 700 }}>{label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#88aadd' }}>{nxc} NXC</div>
                    </div>
                    <button
                      style={{ background: 'linear-gradient(135deg,#ffe500,#cc8000)', border: 'none', borderRadius: 6, color: '#000', fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: 11, padding: '5px 10px', cursor: 'pointer' }}
                      onClick={() => alert('Top Up: Coming soon via payment gateway!')}
                    >{price}</button>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#667799', textAlign: 'center' }}>
                Saldo NXC kamu: <strong style={{ color: '#ffd700' }}>{(player.resources?.nxc || 0).toLocaleString()} NXC</strong>
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
                          <span style={{ fontSize: 11, fontWeight: 'bold', color: '#fff' }}>{item.name} {(item.count || item.qty) > 1 ? `(x${item.count || item.qty})` : ''}</span>
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
                          <span style={{ fontSize: 11, fontWeight: 'bold', color: '#fff' }}>{item.name} {(item.count || item.qty) > 1 ? `(x${item.count || item.qty})` : ''}</span>
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
                          const credits = player.resources.credits || 0
                          if (credits < pot.cost) {
                            alert(`Credits (CRD) tidak cukup! Membutuhkan ${pot.cost.toLocaleString()} CRD.`)
                            return
                          }

                          const potItem = itemsData.items.find(it => it.id === (pot.id === 'hp' ? 'pot_hp' : 'pot_fp'))
                          if (!potItem) return

                          const invSlots = player.inventorySlots || 100
                          let canStack = false
                          for (let s = 0; s < player.inventory.length; s++) {
                            if (player.inventory[s].id === potItem.id && (player.inventory[s].count || player.inventory[s].qty || 1) < 99) {
                              canStack = true
                              break
                            }
                          }

                          if (!canStack && player.inventory.length >= invSlots) {
                            alert("Inventory penuh! Kosongkan slot atau upgrade bag Anda.")
                            return
                          }

                          useGameStore.setState((s) => ({
                            player: {
                              ...s.player,
                              inventory: addToInventory(s.player.inventory, potItem, 1),
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
                  <PilotSprite race={player.race} job={player.job} gender={player.gender} size={80} />
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
              <div style={styles.tabsContainer} className="no-scrollbar">
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
                              {/* Move glow OUTSIDE clipped container to avoid ghosting from blur+overflow-clip double composite */}
                              <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 170,
                                height: 50,
                                borderRadius: '50%',
                                background: `radial-gradient(ellipse, ${player.race === 'arctron' ? 'rgba(255,87,34,0.65)' : player.race === 'bionex' ? 'rgba(255,214,0,0.65)' : 'rgba(0,229,255,0.65)'} 0%, transparent 70%)`,
                                boxShadow: `0 0 24px ${player.race === 'arctron' ? 'rgba(255,87,34,0.5)' : player.race === 'bionex' ? 'rgba(255,214,0,0.5)' : 'rgba(0,229,255,0.5)'}`,
                                zIndex: 0,
                                pointerEvents: 'none',
                              }} />
                              {bionexHeroSprite ? (
                                <img
                                  src={bionexHeroSprite}
                                  alt={activeLane.title}
                                  style={{ height: 200, width: 'auto', objectFit: 'contain', objectPosition: 'bottom', opacity: 1, filter: 'brightness(1.25) contrast(1.1)', position: 'relative', zIndex: 1 }}
                                />
                              ) : (
                                <div style={{ position: 'relative', zIndex: 1, height: 200, display: 'flex', alignItems: 'flex-end' }}>
                                  <PilotSprite race={player.race} job={j.id} gender={player.gender} size={200} />
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
                                
                                const reqLevel = j.levelReq || (jTier === 2 ? 32 : jTier === 3 ? 42 : 55);

                                const prevTierInfo = tierJobs.find(t => t.tier === jTier - 1)
                                const prevTierJobs = prevTierInfo ? prevTierInfo.jobs : (tabHeroJob ? [tabHeroJob.job] : [])
                                const prevTierJobIds = prevTierJobs.map(pj => pj.id)

                                // Check if eligible for promotion to this node
                                const isPromoEligible = (
                                  (tier === 0 && jTier === 1 && player.level >= (j.levelReq || 1)) ||
                                  (tier === 0 && jTier === 2 && prevTierJobIds.length === 0 && player.level >= reqLevel) ||
                                  (tier === 1 && jTier === 2 && player.level >= reqLevel && prevTierJobIds.includes(player.job)) ||
                                  (tier === 2 && jTier === 3 && player.level >= reqLevel && prevTierJobIds.includes(player.job)) ||
                                  (tier === 3 && jTier === 4 && player.level >= reqLevel && prevTierJobIds.includes(player.job))
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
                                        disabled={player.resources.crd < RECLASS_COST}
                                        style={{
                                          margin: '8px 0 0 0',
                                          padding: '6px 10px',
                                          fontSize: '12px',
                                          background: player.resources.crd >= RECLASS_COST 
                                            ? 'linear-gradient(90deg, #bb88ff, #6600cc)'
                                            : 'rgba(255,255,255,0.05)',
                                          border: player.resources.crd >= RECLASS_COST 
                                            ? '1.5px solid #bb88ff'
                                            : '1.5px solid rgba(255,255,255,0.1)',
                                          color: player.resources.crd >= RECLASS_COST ? '#fff' : 'rgba(255,255,255,0.3)',
                                          cursor: player.resources.crd >= RECLASS_COST ? 'pointer' : 'not-allowed',
                                          boxShadow: player.resources.crd >= RECLASS_COST 
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
                  const canBuy = player.resources.crd >= cost
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
    padding: '24px 20px 120px 20px',
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
    overflowX: 'auto',
    gap: 8,
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: 8,
    paddingBottom: 4
  },
  tabCard: (isActive, raceColor) => ({
    flex: 1,
    minWidth: 95,
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
    transition: 'all 0.2s ease-in-out',
    flexShrink: 0
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
