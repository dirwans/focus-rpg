import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import enemies from '../data/enemies.json'
import upgradesConfig from '../data/upgrades.json'
import itemsData from '../data/items.json'
import archonData from '../data/archon.json'
import { getWeaponRarityBonus } from '../lib/rarity'
import { TRANSLATIONS } from '../lib/translationData'
import baseStatsData from '../data/baseStats.json'

function tStore(key, replacements = {}, playerState = null) {
  const language = playerState?.language || 'en'
  const dict = TRANSLATIONS[language] || TRANSLATIONS['en']
  let text = dict[key] || TRANSLATIONS['en'][key] || key
  Object.entries(replacements).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, v)
  })
  return text
}


function calcUpgradeCost(key, level) {
  const cfg = upgradesConfig[key]
  const lvl = level || 0
  return Math.floor(cfg.baseCost * Math.pow(cfg.costMultiplier, lvl))
}

function calcStat(key, upgradeLevel, raceId) {
  const cfg = upgradesConfig[key]
  const race = races[raceId]
  const lvl = upgradeLevel || 0
  const base = cfg.baseValue + cfg.perLevel * lvl
  if (!race) return base
  const multiplier = key === 'hp'
    ? race.bonuses.hpMultiplier
    : key === 'atk'
    ? race.bonuses.atkMultiplier
    : race.bonuses.defMultiplier
  return Math.floor(base * multiplier)
}

function getMinutesToNextLevel(level) {
  if (level <= 10) return 5
  if (level <= 20) return 10
  if (level <= 30) return 20
  if (level === 31) return 30
  if (level <= 41) return 180
  if (level <= 54) return 480
  if (level <= 65) return 960
  return 1440
}

function getSector(level) {
  if (level <= 12) return 1
  if (level <= 25) return 2
  if (level <= 38) return 3
  if (level <= 52) return 4
  if (level <= 66) return 5
  if (level <= 75) return 6
  if (level <= 85) return 7
  return 8
}

function randomMob(sectorIdx, isDungeon = false) {
  const sector = isDungeon ? enemies.dungeons[sectorIdx] : enemies.sectors[sectorIdx]
  const mobs = sector.mobs
  return mobs[Math.floor(Math.random() * mobs.length)]
}

function spawnEnemy(sectorIdx, playerLevel, forceRaid = false, isDungeon = false) {
  const sector = isDungeon ? enemies.dungeons[sectorIdx] : enemies.sectors[sectorIdx]
  
  if (isDungeon) {
    if (forceRaid) {
      return { mob: sector.pitBoss, isBoss: true, isPitBoss: true, isCulprit: false, hp: sector.pitBoss.hp }
    }
    // 5% chance of dungeon boss spawn
    if (Math.random() < 0.05) {
      return { mob: sector.boss, isBoss: true, isPitBoss: false, isCulprit: false, hp: sector.boss.hp }
    }
    const baseMob = randomMob(sectorIdx, true)
    return { mob: baseMob, isBoss: false, isPitBoss: false, isCulprit: false, hp: baseMob.hp }
  }

  // World Map
  if (forceRaid || Math.random() < 0.01) {
    return { mob: sector.pitBoss, isBoss: true, isPitBoss: true, isCulprit: false, hp: sector.pitBoss.hp }
  }
  
  const maxLevels = [12, 25, 38, 52, 66, 999]
  const isMaxLevelForMap = playerLevel === maxLevels[sectorIdx]
  
  if (isMaxLevelForMap || playerLevel % 10 === 0) {
    return { mob: sector.boss, isBoss: true, isPitBoss: false, isCulprit: false, hp: sector.boss.hp }
  }

  const baseMob = randomMob(sectorIdx, false)
  const isCulprit = Math.random() < 0.20
  if (isCulprit) {
    const culpritMob = {
      ...baseMob,
      name: 'Culprit ' + baseMob.name,
      hp: baseMob.hp * 2,
      atk: baseMob.atk * 2,
      expReward: baseMob.expReward * 2,
      aniumReward: baseMob.aniumReward * 2
    }
    return { mob: culpritMob, isBoss: false, isPitBoss: false, isCulprit: true, hp: culpritMob.hp }
  }
  
  return { mob: baseMob, isBoss: false, isPitBoss: false, isCulprit: false, hp: baseMob.hp }
}

// Frac 0..1 deterministik dari seed integer (buat item drop yg sama di semua device)
function seededFrac(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function getDropTier(seed, mode, isPitBoss, isStageBoss) {
  const r = seededFrac(seed)
  if (mode === 'gather') return 'material'
  if (isPitBoss) {
    if (r < 0.05) return 'UR'
    if (r < 0.15) return 'SSR'
    if (r < 0.35) return 'SR'
    if (r < 0.65) return 'SSS'
    return 'SS'
  }
  if (isStageBoss) {
    if (r < 0.02) return 'SSS'
    if (r < 0.10) return 'SS'
    if (r < 0.30) return 'S'
    return 'A'
  }
  // Normal grind
  if (r < 0.00001) return 'UR'    // 0.001%
  if (r < 0.0001) return 'SSR'   // 0.01%
  if (r < 0.001) return 'SR'     // 0.1%
  if (r < 0.004) return 'SSS'    // 0.4%
  if (r < 0.015) return 'SS'     // 1.5%
  if (r < 0.08) return 'S'       // 8%
  if (r < 0.20) return 'A'       // 20%
  if (r < 0.40) return 'B'       // 40% (cumulative)
  if (r < 0.70) return 'C'       // 70%
  if (r < 0.95) return 'D'       // 95%
  return 'material'              // 5% fallback
}

// Reward DETERMINISTIK berdasar lama waktu + stats → semua device hitung sama
function computeRewards(player, mode, minutes, selectedZone = 'world') {
  const race = races[player.race]
  if (!race) return { kills: 0, exp: 0, anium: 0, credits: 0 }
  const elapsedSec = Math.max(0, Math.floor(minutes * 60))
  const isDungeon = selectedZone && selectedZone.startsWith('dungeon_')

  if (isDungeon) {
    const dungeonIdx = parseInt(selectedZone.split('_')[1]) - 1
    const dungeon = enemies.dungeons[dungeonIdx]
    const mobs = dungeon.mobs
    const avg = (f) => mobs.reduce((a, m) => a + f(m), 0) / mobs.length
    const avgHp = avg((m) => m.hp) * 1.2
    const avgDef = avg((m) => m.def)
    
    const atk = calcStat('atk', player.upgrades?.atk || 0, player.race)
    const dps = Math.max(1, atk - avgDef + 3.5) * 1.096
    const secPerKill = Math.max(2, avgHp / dps)
    const kills = Math.floor(elapsedSec / secPerKill)

    const baseCrdPerKill = dungeonIdx === 0 ? 3 : dungeonIdx === 1 ? 6 : 12
    let totalCrdGained = 0
    for (let i = 0; i < kills; i++) {
      totalCrdGained += Math.floor(baseCrdPerKill * (0.8 + seededFrac(minutes * 100 + i) * 0.4))
    }

    return {
      kills,
      exp: Math.floor(elapsedSec / 60),
      anium: 0,
      credits: totalCrdGained
    }
  }

  if (mode === 'gather') {
    return {
      kills: 0,
      exp: Math.floor(elapsedSec / 60),
      anium: Math.floor(elapsedSec * 0.72 * race.bonuses.gatherMultiplier),
      credits: 0
    }
  }
  const sectorIdx = getSector(player.level) - 1
  const mobs = enemies.sectors[sectorIdx].mobs
  const avg = (f) => mobs.reduce((a, m) => a + f(m), 0) / mobs.length
  let avgHp, avgDef, avgAni
  if (player.level % 10 === 0) {
    const boss = enemies.sectors[sectorIdx].boss
    avgHp = boss.hp; avgDef = boss.def; avgAni = boss.aniumReward
  } else {
    avgHp = avg((m) => m.hp) * 1.2
    avgDef = avg((m) => m.def)
    avgAni = avg((m) => m.aniumReward) * 1.2
  }
  const atk = calcStat('atk', player.upgrades?.atk || 0, player.race)
  const dps = Math.max(1, atk - avgDef + 3.5) * 1.096 // ~rata2 crit/variance
  const secPerKill = Math.max(2, avgHp / dps)
  const kills = Math.floor(elapsedSec / secPerKill)

  let totalAniumGained = 0
  for (let i = 0; i < kills; i++) {
    totalAniumGained += Math.floor(avgAni)
  }

  // CRD per kill sesuai map level
  const MAP_CRD_RANGES = [
    [500, 1000],       // Map 1 Lv.1-12
    [1500, 3000],      // Map 2 Lv.13-25
    [4000, 8000],      // Map 3 Lv.26-38
    [10000, 18000],    // Map 4 Lv.39-52
    [20000, 35000],    // Map 5 Lv.53-66
  ]
  const crdRange = MAP_CRD_RANGES[Math.min(sectorIdx, 4)]
  let totalCrdGained = 0
  for (let i = 0; i < kills; i++) {
    const frac = seededFrac(minutes * 100 + i + 77)
    totalCrdGained += Math.floor(crdRange[0] + frac * (crdRange[1] - crdRange[0]))
  }

  return {
    kills,
    exp: Math.floor(elapsedSec / 60),
    anium: totalAniumGained,
    credits: totalCrdGained
  }
}

const initialPlayer = {
  name: 'PILOT #1',
  race: null,
  job: null,
  level: 1,
  exp: 0,
  resources: { anium: 200, credits: 10, potions: 5 },
  upgrades: { atk: 0, def: 0, hp: 0 },
  equipment: { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null },
  sector: 1,
  highestSector: 1,
  streak: 0,
  lastSessionDate: null,
  inventory: [],
  totalSessions: 0,
  totalMinutes: 0,
  savedAt: 0,
  language: 'en',
  settings: {
    autoHpPotion: 'OFF',
    autoFpPotion: 'OFF',
    autoSkill: false,
    autoLoot: false,
    alertWorldBoss: true,
    alertCoreWar: true,
    alertDungeon: true
  },
  combatStats: {
    totalMonsterKill: 0,
    worldBossKill: 0,
    dungeonClear: 0,
    coreWarVictory: 0,
    highestEnhancement: 0
  },
  guild: null // { name: string, level: number, role: string, members: number }
}

const initialTimer = {
  selectedMinutes: 25,
  secondsLeft: 25 * 60,
  state: 'idle',   // idle | running | completed
  mode: 'fight',   // fight | gather
  startedAt: 0,    // epoch ms — sumber kebenaran countdown (sync antar device)
  endsAt: 0,       // epoch ms
  selectedZone: 'world', // world | dungeon_1 | dungeon_2 | dungeon_3
}

const initialBattle = {
  log: [],
  enemyHp: 0,
  enemyMaxHp: 0,
  playerHp: 0,
  playerMaxHp: 0,
  playerFp: 0,
  playerMaxFp: 0,
  deaths: 0,
  respawnTicks: 0,
  currentMob: null,
  isBoss: false,
  isPitBoss: false,
  isCulprit: false,
  kills: 0,
  killStreak: 0,
  sessionExp: 0,
  sessionAnium: 0,
  sessionCredits: 0,
  levelUps: 0,
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      player: initialPlayer,
      timer: initialTimer,
      battle: initialBattle,
      archons: null,
      screen: 'main',
      showRaceSelect: false,

      // ── Navigation ──────────────────────────────────────
      setScreen: (screen) => set({ screen }),
      setArchons: (archons) => set({ archons }),
      setNotification: (notif) => set({ notification: notif }),

      updateSettings: (newSettings) => set((s) => ({
        player: {
          ...s.player,
          settings: { ...(s.player.settings || { autoHpPotion: 'OFF', autoFpPotion: 'OFF', autoSkill: false, autoLoot: false, alertWorldBoss: true, alertCoreWar: true, alertDungeon: true }), ...newSettings },
          savedAt: Date.now()
        }
      })),

      // ── Race Selection ───────────────────────────────────
      openRaceSelect: () => set({ showRaceSelect: true }),
      closeRaceSelect: () => set({ showRaceSelect: false }),
      selectRace: (raceId) => {
        set((s) => ({
          showRaceSelect: false,
          player: {
            ...s.player,
            race: raceId,
            job: null,
            upgrades: { atk: 0, def: 0, hp: 0 },
            equipment: { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null },
            savedAt: Date.now(),
          },
        }))
      },

      // ── Job Promotion ────────────────────────────────────
      selectJob: (jobId) => {
        set((s) => ({
          player: {
            ...s.player,
            job: jobId,
            savedAt: Date.now(),
          },
        }))
      },

      reclassJob: (jobId, cost = 5000) => {
        set((s) => ({
          player: {
            ...s.player,
            job: jobId,
            resources: {
              ...s.player.resources,
              anium: Math.max(0, s.player.resources.anium - cost),
            },
            savedAt: Date.now(),
          },
        }))
      },


      // ── Timer ────────────────────────────────────────────
      setTimerMinutes: (min) => {
        const { timer } = get()
        if (timer.state === 'running') return
        set({ timer: { ...timer, state: 'idle', selectedMinutes: min, secondsLeft: min * 60 }, player: { ...get().player, savedAt: Date.now() } })
      },
      setMode: (mode) => {
        const { timer } = get()
        if (timer.state === 'running') return
        set({ timer: { ...timer, state: 'idle', mode }, player: { ...get().player, savedAt: Date.now() } })
      },
      setSelectedZone: (zone) => {
        const { timer } = get()
        if (timer.state === 'running') return
        set({ timer: { ...timer, state: 'idle', selectedZone: zone }, player: { ...get().player, savedAt: Date.now() } })
      },

      startTimer: () => {
        const { player, timer } = get()
        if (!player.race) { set({ showRaceSelect: true }); return }
        if (timer.state !== 'idle') return
        const now = Date.now()
        
        const isDungeon = timer.selectedZone && timer.selectedZone.startsWith('dungeon_')
        let sector, mob, isBoss, isPitBoss, hp
        
        if (isDungeon) {
          const dungeonIdx = parseInt(timer.selectedZone.split('_')[1]) - 1
          sector = enemies.dungeons[dungeonIdx]
          if (player.level < sector.minLevel) return
          const spawned = spawnEnemy(dungeonIdx, player.level, false, true)
          mob = spawned.mob
          isBoss = spawned.isBoss
          isPitBoss = spawned.isPitBoss
          hp = spawned.hp
        } else {
          const sectorIdx = getSector(player.level) - 1
          sector = enemies.sectors[sectorIdx]
          const spawned = spawnEnemy(sectorIdx, player.level, false, false)
          mob = spawned.mob
          isBoss = spawned.isBoss
          isPitBoss = spawned.isPitBoss
          hp = spawned.hp
        }

        const playerMaxHp = get().getStats().hp
        const playerMaxFp = 200
        set({
          timer: {
            ...timer,
            state: 'running',
            secondsLeft: timer.selectedMinutes * 60,
            startedAt: now,
            endsAt: now + timer.selectedMinutes * 60 * 1000,
          },
          player: { ...player, savedAt: now },
          battle: {
            ...initialBattle,
            log: [(isPitBoss ? `☢️ RAID BOSS: ${mob.emoji} ${mob.name}!` : isBoss ? `⚠️ STAGE BOSS: ${mob.emoji} ${mob.name}!` : `⚔️ Entering ${sector.name}...`)],
            enemyHp: hp,
            enemyMaxHp: hp,
            playerHp: playerMaxHp,
            playerMaxHp: playerMaxHp,
            playerFp: playerMaxFp,
            playerMaxFp: playerMaxFp,
            currentMob: mob,
            isBoss,
            isPitBoss,
            isCulprit: mob.name?.startsWith('Culprit') || false
          },
        })
      },

      stopTimer: () => {
        const { timer } = get()
        if (timer.state !== 'running') return
        const elapsedMin = Math.floor((timer.selectedMinutes * 60 - timer.secondsLeft) / 60)
        set((s) => ({
          timer: { ...s.timer, state: 'idle', secondsLeft: s.timer.selectedMinutes * 60, startedAt: 0, endsAt: 0 },
          player: { ...s.player, totalMinutes: s.player.totalMinutes + elapsedMin, savedAt: Date.now() },
          battle: { ...initialBattle },
        }))
      },

      tick: () => {
        const { timer, player, battle } = get()
        if (timer.state !== 'running') return
        const remaining = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000))
        if (remaining <= 0) { get().completeSession(); return }
        // visual combat (cosmetic, lokal)
        if (timer.mode === 'fight') get()._combatTick()
        else get()._gatherTick()
        // reward DETERMINISTIK (sama di semua device) — override angka cosmetic
        const total = timer.selectedMinutes * 60
        const r = computeRewards(player, timer.mode, (total - remaining) / 60, timer.selectedZone)

        // Apply death penalties
        const deaths = battle.deaths || 0
        const deathPenaltyExp = deaths * 15
        const deathPenaltyAnium = deaths * 30
        const deathPenaltyKills = deaths * 1

        const finalKills = Math.max(0, r.kills - deathPenaltyKills)
        const finalExp = Math.max(0, r.exp - deathPenaltyExp)
        const finalAnium = Math.max(0, r.anium - deathPenaltyAnium)
        const finalCredits = Math.max(0, (r.credits || 0) - (deaths * 5))

        set((s) => ({
          timer: { ...s.timer, secondsLeft: remaining },
          battle: { 
            ...s.battle, 
            kills: finalKills, 
            sessionExp: finalExp, 
            sessionAnium: finalAnium,
            sessionCredits: finalCredits
          },
        }))
      },

      _combatTick: () => {
        const { player, battle } = get()
        
        // Initialize if state hasn't been set for combat yet
        if (!battle.currentMob) {
          const sectorIdx = getSector(player.level) - 1
          const { mob, isBoss, isPitBoss, hp } = spawnEnemy(sectorIdx, player.level)
          const playerMaxHp = get().getStats().hp
          const playerMaxFp = 200
          set({ 
            battle: { 
              ...battle, 
              currentMob: mob, 
              isBoss, 
              isPitBoss, 
              isCulprit: mob.name?.startsWith('Culprit') || false,
              enemyHp: hp, 
              enemyMaxHp: hp, 
              playerHp: playerMaxHp, 
              playerMaxHp: playerMaxHp,
              playerFp: playerMaxFp,
              playerMaxFp: playerMaxFp,
              deaths: 0,
              respawnTicks: 0
            } 
          })
          return
        }

        // Auto-initialize player HP and FP if they are missing or NaN in synced session
        if (!battle.playerHp || !battle.playerMaxHp || isNaN(battle.playerHp) || isNaN(battle.playerMaxHp)) {
          const playerMaxHp = get().getStats().hp
          const playerMaxFp = 200
          set({
            battle: {
              ...battle,
              playerHp: playerMaxHp,
              playerMaxHp: playerMaxHp,
              playerFp: battle.playerFp || playerMaxFp,
              playerMaxFp: playerMaxFp
            }
          })
          return
        }

        let newLog = [...battle.log]
        
        // 1. Handle reboot / respawn countdown state
        if (battle.respawnTicks > 0) {
          const remainingTicks = battle.respawnTicks - 1
          if (newLog.length > 7) newLog = newLog.slice(-7)
          if (remainingTicks === 0) {
            const playerMaxHp = get().getStats().hp
            const playerMaxFp = 200
            newLog.push(`⚡ Systems online! Pilot ready for battle!`)
            set({ 
              battle: { 
                ...battle, 
                respawnTicks: 0, 
                playerHp: playerMaxHp, 
                playerFp: playerMaxFp,
                log: newLog 
              } 
            })
          } else {
            newLog.push(`☠️ Pilot K.O. System rebooting... (${remainingTicks}s)`)
            set({ 
              battle: { 
                ...battle, 
                respawnTicks: remainingTicks, 
                log: newLog 
              } 
            })
          }
          return
        }

        // 2. Passive FP regeneration (RF Online style based on Race)
        let fpRegenRate = 12 // Default standard
        if (player.race === 'celestra') {
          fpRegenRate = 25 // Celestra: high magic affinity
        } else if (player.race === 'bionex') {
          fpRegenRate = 15 // Bellato: hybrid
        } else if (player.race === 'arctron') {
          fpRegenRate = 5  // Accretia: android, low natural flow
        }
        const playerMaxFp = battle.playerMaxFp || 200
        let nextPlayerFp = Math.min(playerMaxFp, (battle.playerFp ?? playerMaxFp) + fpRegenRate)

        // 3. Player attacks enemy turn
        const playerAtk = get().getStats().atk
        const mob = battle.currentMob
        
        let dmgToEnemy = 0
        let isCrit = false
        let isSkill = false
        const isEnemyDodge = Math.random() < 0.05 // Base 5% Dodge for enemy

        if (isEnemyDodge) {
          if (newLog.length > 7) newLog = newLog.slice(-7)
          newLog.push(`💨 MISS! Serangan ke ${mob.emoji} meleset (Dodge).`)
        } else {
          // Normal Attack Damage Formula
          isCrit = Math.random() < (player.race === 'celestra' ? 0.15 : 0.12)
          let rawDmg = Math.max(1, playerAtk - mob.def)

          // Auto-Skill Logic
          let skillMultiplier = 0
          if (player.settings?.autoSkill && nextPlayerFp >= 40) {
            // Find job skill
            let pJob = null
            Object.values(jobs[player.race] || {}).forEach(tier => {
              if (Array.isArray(tier)) {
                const j = tier.find(x => x.id === player.job)
                if (j) pJob = j
              }
            })
            if (pJob && pJob.skills && pJob.skills.length > 0) {
              const skillDesc = pJob.skills[0].desc || ""
              const match = skillDesc.match(/(\d+)% ATK/)
              if (match) {
                skillMultiplier = parseInt(match[1]) / 100
                isSkill = true
                nextPlayerFp -= 40
              }
            }
          }

          if (isSkill) {
            rawDmg = Math.max(1, Math.floor(playerAtk * skillMultiplier) - mob.def)
            if (newLog.length > 7) newLog = newLog.slice(-7)
            newLog.push(`✨ [Skill Cast] Pilot melancarkan Skill! (${skillMultiplier*100}% ATK)`)
          }

          dmgToEnemy = isCrit ? Math.floor(rawDmg * 1.5) : rawDmg
        }
        let newEnemyHp = battle.enemyHp - dmgToEnemy
        if (newEnemyHp > 0 && mob.regen) {
          newEnemyHp = Math.min(battle.enemyMaxHp, newEnemyHp + mob.regen)
        }
        let nextMob = mob, nextIsBoss = battle.isBoss, nextMaxHp = battle.enemyMaxHp

        if (player.equipment?.weapon?.specialProperty === 'vampire') {
          const lifesteal = Math.floor(dmgToEnemy * 0.10)
          if (newLog.length > 7) newLog = newLog.slice(-7)
          newLog.push(`🩸 Vampire! Menyedot +${lifesteal} HP dari ${mob.emoji} ${mob.name}!`)
        }

        // 4. Enemy attacks player turn
        let nextPlayerHp = battle.playerHp
        let newDeaths = battle.deaths || 0
        let nextRespawnTicks = 0

        // Enemy action: 45% attack chance
        if (Math.random() < 0.45) {
          const enemyAtk = mob.atk || 5
          const playerDef = get().getStats().def || 2
          
          let dmgToPlayer = 0
          const isPlayerDodge = Math.random() < 0.05 // Base 5% Dodge for player
          
          if (isPlayerDodge) {
            if (newLog.length > 7) newLog = newLog.slice(-7)
            newLog.push(`💨 MISS! Serangan ${mob.name} berhasil dihindari! (Dodge)`)
          } else {
            // Enemy crit chance scales by mob grade (Sector/Boss/Culprit)
            const enemyCritChance = mob.critical !== undefined ? (mob.critical / 100) : (battle.isPitBoss ? 0.22 : battle.isBoss ? 0.18 : battle.isCulprit ? 0.14 : 0.08)
            const isEnemyCrit = Math.random() < enemyCritChance
            
            // Damage Formula: Final ATK - Final DEF
            let baseDmg = Math.max(1, enemyAtk - playerDef)
            dmgToPlayer = isEnemyCrit ? Math.floor(baseDmg * 1.5) : baseDmg
            
            if (newLog.length > 7) newLog = newLog.slice(-7)
            if (isEnemyCrit) {
              newLog.push(`💥 CRIT! ${mob.emoji} ${mob.name} melancarkan serangan kritis! -${dmgToPlayer} Shield HP`)
            } else {
              newLog.push(`💥 ${mob.emoji} ${mob.name} menyerang Pilot! -${dmgToPlayer} Shield HP`)
            }
          }
          
          nextPlayerHp = Math.max(0, battle.playerHp - dmgToPlayer)

          // --- DUAL AUTO-HEAL SYSTEM ---
          const playerMaxHp = battle.playerMaxHp || get().getStats().hp
          // Trigger heal only when health is critical (below 35%)
          if (nextPlayerHp > 0 && nextPlayerHp < playerMaxHp * 0.35) {
            const hasSkill = ['acolyte', 'eidolon_caller', 'high_summoner', 'guardian', 'lumina_paladin', 'engineer', 'mechanist', 'war_engineer', 'bionex_specialist', 'craftsman', 'mental_smith', 'chandra', 'holy_chandra'].includes(player.job)
            
            if (hasSkill) {
              if (nextPlayerFp >= 50) {
                // Cast healing skill
                nextPlayerFp -= 50
                const healAmount = Math.floor(playerMaxHp * 0.35)
                nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + healAmount)
                
                const skillName = ['engineer', 'mechanist', 'war_engineer', 'bionex_specialist', 'craftsman', 'mental_smith'].includes(player.job) ? 'Repair Matrix' : 'Spiritual Heal'
                if (newLog.length > 7) newLog = newLog.slice(-7)
                newLog.push(`✨ [Skill] Pilot menggunakan ${skillName}! (+${healAmount} HP, -50 FP)`)
              } else if (player.settings?.autoHpPotion === 'ON') {
                // Try fallback to potion if FP is empty
                if (player.resources.potions > 0) {
                  const healAmount = Math.floor(playerMaxHp * 0.30)
                  nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + healAmount)
                  const remainingPotions = Math.max(0, player.resources.potions - 1)
                  
                  if (newLog.length > 7) newLog = newLog.slice(-7)
                  newLog.push(`🧪 [Auto-Potion] Menggunakan Potion! (+${healAmount} Shield HP, Sisa: ${remainingPotions})`)
                  
                  set({
                    player: {
                      ...player,
                      resources: {
                        ...player.resources,
                        potions: remainingPotions
                      },
                      savedAt: Date.now()
                    }
                  })
                }
              }
            } else if (player.settings?.autoHpPotion === 'ON') {
              // Non-healer classes potion check
              if (player.resources.potions > 0) {
                const healAmount = Math.floor(playerMaxHp * 0.30)
                nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + healAmount)
                const remainingPotions = Math.max(0, player.resources.potions - 1)
                
                if (newLog.length > 7) newLog = newLog.slice(-7)
                newLog.push(`🧪 [Auto-Potion] Menggunakan Potion! (+${healAmount} Shield HP, Sisa: ${remainingPotions})`)
                
                set({
                  player: {
                    ...player,
                    resources: {
                      ...player.resources,
                      potions: remainingPotions
                    },
                    savedAt: Date.now()
                  }
                })
              } else {
                if (newLog.length > 7) newLog = newLog.slice(-7)
                newLog.push(`⚠️ HP Potion habis!`)
              }
            }
          }

          if (nextPlayerHp <= 0) {
            newDeaths += 1
            nextRespawnTicks = 5
            if (newLog.length > 7) newLog = newLog.slice(-7)
            newLog.push(`☠️ Pilot K.O. oleh ${mob.emoji} ${mob.name}! Rebooting... (5s)`)
          }
        }

        // 5. Enemy defeat or Critical Hit updates
        if (nextRespawnTicks === 0) {
          if (newEnemyHp <= 0) {
            if (newLog.length > 7) newLog = newLog.slice(-7)
            newLog.push(battle.isPitBoss ? `☢️ RAID CLEARED! ${mob.emoji}` : battle.isBoss ? `🏆 STAGE BOSS SLAIN! ${mob.emoji}` : `⚔️ Killed ${mob.emoji} ${mob.name}`)
            
            const isDungeon = timer.selectedZone && timer.selectedZone.startsWith('dungeon_')
            const zoneIdx = isDungeon ? (parseInt(timer.selectedZone.split('_')[1]) - 1) : (getSector(player.level) - 1)
            const next = spawnEnemy(zoneIdx, player.level, false, isDungeon)
            
            nextMob = next.mob; nextIsBoss = next.isBoss; nextMaxHp = next.hp; newEnemyHp = next.hp
            if (next.isPitBoss) newLog.push(`☢️ RAID INCOMING: ${next.mob.emoji} ${next.mob.name}!`)
            else if (next.isBoss) newLog.push(`⚠️ STAGE BOSS: ${next.mob.emoji} ${next.mob.name}!`)
          } else if (isCrit && !isEnemyDodge) {
            if (newLog.length > 7) newLog = newLog.slice(-7)
            newLog.push(`💥 CRIT! -${dmgToEnemy} ${mob.emoji}`)
          }
        } else {
          // Reset current enemy HP if player died
          newEnemyHp = battle.enemyMaxHp
        }

        set({ 
          battle: { 
            ...battle, 
            enemyHp: newEnemyHp, 
            enemyMaxHp: nextMaxHp, 
            currentMob: nextMob, 
            isBoss: nextIsBoss, 
            log: newLog,
            playerHp: nextPlayerHp,
            playerFp: nextPlayerFp,
            deaths: newDeaths,
            respawnTicks: nextRespawnTicks
          } 
        })
      },

      _gatherTick: () => {
        const { battle } = get()
        if (Math.random() > 0.82) {
          let newLog = [...battle.log]
          if (newLog.length > 7) newLog = newLog.slice(-7)
          newLog.push(`⛏️ Gathering resources...`)
          set({ battle: { ...battle, log: newLog } })
        }
      },

      completeSession: () => {
        const { player, timer, battle } = get()
        if (timer.state !== 'running') return // hindari double-complete (sudah completed via sync)

        const r = computeRewards(player, timer.mode || 'fight', timer.selectedMinutes, timer.selectedZone)
        const today = new Date().toDateString()
        const isNewDay = player.lastSessionDate !== today
        const newStreak = isNewDay ? player.streak + 1 : player.streak

        // Apply death penalties
        const deaths = battle.deaths || 0
        const deathPenaltyExp = deaths * 2 // 2 minutes penalty per death
        const deathPenaltyAnium = deaths * 30
        const deathPenaltyKills = deaths * 1

        const finalKills = Math.max(0, r.kills - deathPenaltyKills)
        const finalExp = Math.max(0, r.exp - deathPenaltyExp)
        const finalAnium = Math.max(0, r.anium - deathPenaltyAnium)
        let finalCredits = r.credits || 0

        let newExp = player.exp + finalExp
        let newLevel = player.level
        let expToNext = getMinutesToNextLevel(newLevel)
        let levelUps = 0
        while (newExp >= expToNext && newLevel < 70) {
          newExp -= expToNext; newLevel += 1; levelUps += 1; expToNext = getMinutesToNextLevel(newLevel)
        }
        const newSector = getSector(newLevel)

        // Item drop deterministik berdasar sistem Rarity
        const newInventory = [...player.inventory]
        let dropLog = ''

        // Stage saat sesi berlangsung (untuk gate loot berdasar minStage)
        const fightSector = getSector(player.level)

        // Elite monster: 15% chance muncul di stage 5+ saat mode fight
        // Kalau ada elite → drop tier naik 1 level (seperti Stage Boss)
        const eliteRoll = seededFrac(timer.startedAt * 7 + 13)
        const killedElite = fightSector >= 5 && eliteRoll < 0.15 && finalKills > 0
        
        // Cek apakah boss mati (finalKills > 0)
        const killedPitBoss = battle.isPitBoss && finalKills > 0
        const killedStageBoss = battle.isBoss && !battle.isPitBoss && finalKills > 0

        // Elite memperlakukan dirinya seperti Stage Boss untuk drop (tapi bukan Pit Boss)
        const effectiveStageBoss = killedStageBoss || killedElite
        
        if (killedElite) {
            dropLog += `\n⚡ ELITE MONSTER appeared! Bonus drop!`
        }
        
        // ────────────────────────────────────────────────────────────────
        // OFFICIAL DROP RATE SYSTEM
        // ────────────────────────────────────────────────────────────────
        const isDungeon = timer.selectedZone && timer.selectedZone.startsWith('dungeon_')
        const dungeonIdx = isDungeon ? parseInt(timer.selectedZone.split('_')[1]) - 1 : -1
        const killedBoss = (killedPitBoss || killedStageBoss) && finalKills > 0

        // Helper: random item from pool by type+rarity
        const pickItem = (rarity, seed) => {
          const pool = itemsData.items.filter(it =>
            (it.type === 'weapon' || it.type === 'armor' || it.type === 'shield' ||
             it.type === 'helmet' || it.type === 'mantle' || it.type === 'gloves' ||
             it.type === 'boots' || it.type === 'pants' || it.type === 'amulet' || it.type === 'ring') &&
            it.rarity === rarity &&
            (it.race === 'All' || it.race === player.race) &&
            it.level <= player.level + 10 &&
            (it.type !== 'weapon' || !it.job || it.job === player.job) &&
            (it.minStage === undefined || it.minStage <= fightSector)
          )
          if (pool.length === 0) return null
          return pool[Math.floor(seededFrac(seed) * pool.length)]
        }

        const pickMat = (id) => itemsData.items.find(it => it.id === id)

        const RARITY_COMMON = 'C'     // Common
        const RARITY_UNCOMMON = 'B'   // Uncommon
        const RARITY_RARE = 'A'       // Rare
        const RARITY_EPIC = 'S'       // Epic

        if (isDungeon) {
          // ── DUNGEON MONSTER (normal): EXP + CRD only, NO gear, NO material ──
          // (loot already handled via credits in computeRewards)

          if (killedBoss) {
            // ── DUNGEON BOSS DROP ──
            // Guaranteed: CRD (handled via computeRewards), 1 Random Equipment (Common or Uncommon)
            const bossEquipRoll = seededFrac(timer.startedAt + 200)
            const bossEquipRarity = bossEquipRoll < 0.5 ? RARITY_COMMON : RARITY_UNCOMMON
            const bossEquip = pickItem(bossEquipRarity, timer.startedAt + 201)
            if (bossEquip) { newInventory.push({ ...bossEquip, uid: Date.now() + 200 }); dropLog += `\n🎁 Boss Drop: ${bossEquip.emoji} ${bossEquip.name}` }

            // Boss CRD bonus
            const DUNGEON_BOSS_CRD = [
              [500000, 800000],       // Echo Burrow
              [2000000, 3500000],     // Infernal Forge
              [7000000, 10000000],    // Trinity Core Chamber
            ]
            const brdRange = DUNGEON_BOSS_CRD[Math.min(dungeonIdx, 2)]
            const bossCrd = Math.floor(brdRange[0] + seededFrac(timer.startedAt + 202) * (brdRange[1] - brdRange[0]))
            finalCredits += bossCrd
            dropLog += `\n💰 Boss CRD: ${bossCrd.toLocaleString()}`

            // Random: Rare Equipment 25%
            if (seededFrac(timer.startedAt + 203) < 0.25) {
              const rareEquip = pickItem(RARITY_RARE, timer.startedAt + 204)
              if (rareEquip) { newInventory.push({ ...rareEquip, uid: Date.now() + 203 }); dropLog += `\n🔵 Rare Drop: ${rareEquip.emoji} ${rareEquip.name}` }
            }
            // Random: Epic Equipment 5%
            if (seededFrac(timer.startedAt + 205) < 0.05) {
              const epicEquip = pickItem(RARITY_EPIC, timer.startedAt + 206)
              if (epicEquip) { newInventory.push({ ...epicEquip, uid: Date.now() + 205 }); dropLog += `\n🟣 Epic Drop: ${epicEquip.emoji} ${epicEquip.name}` }
            }
            // Divine Crest: 100% (5-15 pcs)
            const crestCount = 5 + Math.floor(seededFrac(timer.startedAt + 207) * 11)
            const crestItem = pickMat('mat_divine_crest')
            if (crestItem) {
              for (let c = 0; c < crestCount; c++) newInventory.push({ ...crestItem, uid: Date.now() + 210 + c })
              dropLog += `\n🛡️ Divine Crest ×${crestCount}`
            }
            // Cape Component: 20%
            if (seededFrac(timer.startedAt + 208) < 0.20) {
              const capeComp = pickMat('mat_cape_component')
              if (capeComp) { newInventory.push({ ...capeComp, uid: Date.now() + 208 }); dropLog += `\n🦸 Cape Component` }
            }
            // Arcanite: 0.10% (Super Ultra Rare)
            if (seededFrac(timer.startedAt + 209) < 0.001) {
              const arc = pickMat('mat_arcanite')
              if (arc) { newInventory.push({ ...arc, uid: Date.now() + 209 }); dropLog += `\n🪨 ARCANITE!!! (Super Ultra Rare)` }
            }
          }
        } else {
          // ── WORLD MAP ──
          if (killedStageBoss) {
            // ── WORLD BOSS DROP ──
            // Guaranteed: CRD (below) + 1 Random Equipment (Common or Uncommon)
            const bossEquipRoll = seededFrac(timer.startedAt + 100)
            const bossEquipRarity = bossEquipRoll < 0.5 ? RARITY_COMMON : RARITY_UNCOMMON
            const bossEquip = pickItem(bossEquipRarity, timer.startedAt + 101)
            if (bossEquip) { newInventory.push({ ...bossEquip, uid: Date.now() + 100 }); dropLog += `\n🎁 Boss Drop: ${bossEquip.emoji} ${bossEquip.name}` }

            // World Boss CRD by sector boss
            const WORLD_BOSS_CRD = [
              [100000, 200000],       // Lumora Behemoth
              [300000, 500000],       // Sylvan Fanglord
              [700000, 1000000],      // Iron Juggernaut
              [1500000, 2500000],     // Pyraxis Overlord
              [4000000, 6000000],     // Trinity Overlord
            ]
            const wrdRange = WORLD_BOSS_CRD[Math.min(fightSector - 1, 4)]
            const bossCrd = Math.floor(wrdRange[0] + seededFrac(timer.startedAt + 102) * (wrdRange[1] - wrdRange[0]))
            finalCredits += bossCrd
            dropLog += `\n💰 Boss CRD: ${bossCrd.toLocaleString()}`

            // Random: Rare Equipment 15%
            if (seededFrac(timer.startedAt + 103) < 0.15) {
              const rareEquip = pickItem(RARITY_RARE, timer.startedAt + 104)
              if (rareEquip) { newInventory.push({ ...rareEquip, uid: Date.now() + 103 }); dropLog += `\n🔵 Rare Drop: ${rareEquip.emoji} ${rareEquip.name}` }
            }
            // Divine Crest: 100% (1-5 pcs)
            const crestCount = 1 + Math.floor(seededFrac(timer.startedAt + 105) * 5)
            const crestItem = pickMat('mat_divine_crest')
            if (crestItem) {
              for (let c = 0; c < crestCount; c++) newInventory.push({ ...crestItem, uid: Date.now() + 110 + c })
              dropLog += `\n🛡️ Divine Crest ×${crestCount}`
            }
            // Cape Component: 20%
            if (seededFrac(timer.startedAt + 106) < 0.20) {
              const capeComp = pickMat('mat_cape_component')
              if (capeComp) { newInventory.push({ ...capeComp, uid: Date.now() + 106 }); dropLog += `\n🦸 Cape Component` }
            }
            // Arcanite: 0.05% (Super Ultra Rare)
            if (seededFrac(timer.startedAt + 107) < 0.0005) {
              const arc = pickMat('mat_arcanite')
              if (arc) { newInventory.push({ ...arc, uid: Date.now() + 107 }); dropLog += `\n🪨 ARCANITE!!! (Super Ultra Rare)` }
            }
          } else if (killedPitBoss) {
            // Pit Boss treated same as World Boss
            const bossEquip = pickItem(RARITY_UNCOMMON, timer.startedAt + 150)
            if (bossEquip) { newInventory.push({ ...bossEquip, uid: Date.now() + 150 }); dropLog += `\n🎁 Raid Drop: ${bossEquip.emoji} ${bossEquip.name}` }
          } else {
            // ── NORMAL MONSTER DROP ──
            // HP Potion: 25% per session
            if (finalKills > 0 && seededFrac(timer.startedAt + 50) < 0.25) {
              const hpPotion = pickMat('consumable_hp_small')
              if (hpPotion) { newInventory.push({ ...hpPotion, uid: Date.now() + 50 }); dropLog += `\n❤️ HP Potion` }
            }
            // Common Equipment: 10% per session
            if (finalKills > 0 && seededFrac(timer.startedAt + 51) < 0.10) {
              const commonEquip = pickItem(RARITY_COMMON, timer.startedAt + 52)
              if (commonEquip) { newInventory.push({ ...commonEquip, uid: Date.now() + 51 }); dropLog += `\n⚪ Common Drop: ${commonEquip.emoji} ${commonEquip.name}` }
            }
          }
        }

        const finalLog = []
        if (levelUps > 0) finalLog.push(`🆙 LEVEL UP! LV.${newLevel} — Sector ${newSector}!`)
        finalLog.push(`✅ Done! ${finalKills} kills | +${finalAnium}⬡ | +${finalCredits} Credits | +${finalExp} Menit${deaths > 0 ? ` (Died ${deaths} times)` : ''}${dropLog}`)

        set((s) => ({
          timer: { ...s.timer, state: 'completed', secondsLeft: 0 },
          player: {
            ...s.player,
            exp: newExp,
            level: newLevel,
            sector: newSector,
            highestSector: Math.max(s.player.highestSector, newSector),
            resources: { 
              ...s.player.resources, 
              anium: s.player.resources.anium + finalAnium,
              credits: s.player.resources.credits + finalCredits
            },
            streak: newStreak,
            lastSessionDate: today,
            totalSessions: s.player.totalSessions + 1,
            totalMinutes: s.player.totalMinutes + timer.selectedMinutes,
            inventory: newInventory,
            combatStats: {
              ...(s.player.combatStats || { totalMonsterKill: 0, worldBossKill: 0, dungeonClear: 0, coreWarVictory: 0, highestEnhancement: 0 }),
              totalMonsterKill: (s.player.combatStats?.totalMonsterKill || 0) + finalKills,
              worldBossKill: (s.player.combatStats?.worldBossKill || 0) + (killedPitBoss ? 1 : 0),
              dungeonClear: (s.player.combatStats?.dungeonClear || 0) + (killedStageBoss ? 1 : 0)
            },
            savedAt: Date.now(),
          },
          battle: { ...s.battle, kills: finalKills, sessionExp: finalExp, sessionAnium: finalAnium, levelUps, log: finalLog },
        }))
      },

      resetTimer: () => {
        set((s) => ({
          timer: { ...s.timer, state: 'idle', secondsLeft: s.timer.selectedMinutes * 60, startedAt: 0, endsAt: 0 },
          player: { ...s.player, savedAt: Date.now() },
          battle: initialBattle,
        }))
      },

      // ── Upgrade ──────────────────────────────────────────
      upgrade: (key) => {
        const { player } = get()
        const upgrades = player.upgrades || { atk: 0, def: 0, hp: 0 }
        const currentLevel = upgrades[key] || 0
        const cost = calcUpgradeCost(key, currentLevel)
        if (player.resources?.anium < cost) return
        set((s) => {
          const sUpgrades = s.player.upgrades || { atk: 0, def: 0, hp: 0 }
          return {
            player: {
              ...s.player,
              resources: { ...s.player.resources, anium: s.player.resources.anium - cost },
              upgrades: { ...sUpgrades, [key]: (sUpgrades[key] || 0) + 1 },
              savedAt: Date.now(),
            },
          }
        })
      },

      // ── Sync (player + session) ──────────────────────────
      getSyncState: () => {
        const { player, timer } = get()
        return {
          ...player,
          stats: get().getStats(), // sync computed stats so server can filter PvP targets!
          __session: {
            state: timer.state,
            mode: timer.mode,
            selectedMinutes: timer.selectedMinutes,
            startedAt: timer.startedAt,
            endsAt: timer.endsAt,
          },
        }
      },
      applySyncState: (gs) => {
        if (!gs) return
        const { __session, ...playerPart } = gs
        set((s) => {
          const next = {
            player: {
              ...initialPlayer,
              ...playerPart,
              resources: {
                ...initialPlayer.resources,
                ...(playerPart.resources || {})
              },
              upgrades: {
                ...initialPlayer.upgrades,
                ...(playerPart.upgrades || {})
              }
            }
          }
          
          // Force reset if the loaded race is obsolete
          const raceMap = { 
            'accretians': 'arctron', 'accretia': 'arctron', 'arctron': 'arctron',
            'bellians': 'bionex', 'bellato': 'bionex', 'bionex': 'bionex',
            'corvus': 'celestra', 'cora': 'celestra', 'celestra': 'celestra'
          }
          if (next.player.race && raceMap[next.player.race]) {
            next.player.race = raceMap[next.player.race]
          } 

          // Migrate inventory items
          if (next.player.inventory) {
             next.player.inventory = next.player.inventory.map(i => raceMap[i.race] ? { ...i, race: raceMap[i.race] } : i)
          }
          if (next.player.equipment) {
             next.player.equipment = {
               weapon: null, armor: null, shield: null,
               helmet: null, mantle: null, gloves: null, boots: null,
               pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null,
               ...next.player.equipment
             }
             if (next.player.equipment.weapon && raceMap[next.player.equipment.weapon.race]) next.player.equipment.weapon.race = raceMap[next.player.equipment.weapon.race]
             if (next.player.equipment.armor && raceMap[next.player.equipment.armor.race]) next.player.equipment.armor.race = raceMap[next.player.equipment.armor.race]
             if (next.player.equipment.shield && raceMap[next.player.equipment.shield.race]) next.player.equipment.shield.race = raceMap[next.player.equipment.shield.race]
             if (next.player.equipment.helmet && raceMap[next.player.equipment.helmet.race]) next.player.equipment.helmet.race = raceMap[next.player.equipment.helmet.race]
             if (next.player.equipment.mantle && raceMap[next.player.equipment.mantle.race]) next.player.equipment.mantle.race = raceMap[next.player.equipment.mantle.race]
             if (next.player.equipment.gloves && raceMap[next.player.equipment.gloves.race]) next.player.equipment.gloves.race = raceMap[next.player.equipment.gloves.race]
             if (next.player.equipment.boots && raceMap[next.player.equipment.boots.race]) next.player.equipment.boots.race = raceMap[next.player.equipment.boots.race]
          }

          if (next.player.race && !races[next.player.race]) {
            next.player.race = null
            next.player.job = null
            next.player.upgrades = { atk: 0, def: 0, hp: 0 }
            next.player.equipment = { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null }
          }

          if (__session) {
            const remaining = __session.state === 'running'
              ? Math.max(0, Math.ceil((__session.endsAt - Date.now()) / 1000))
              : __session.state === 'completed' ? 0 : __session.selectedMinutes * 60
            next.timer = {
              ...s.timer,
              state: __session.state,
              mode: __session.mode,
              selectedMinutes: __session.selectedMinutes,
              startedAt: __session.startedAt,
              endsAt: __session.endsAt,
              secondsLeft: remaining,
            }
          }
          return next
        })
      },

      // ── Helpers ──────────────────────────────────────────
      getStats: () => {
        const { player, archons } = get()
        if (!player.race) return { atk: 0, def: 0, hp: 0, title: '' }
        
        const myRaceArchon = archons ? archons[player.race] : null
        const isArchon = myRaceArchon && myRaceArchon.toLowerCase() === player.username?.toLowerCase()
        
        const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null }
        
        // Base Stats Lookups
        const baseStats = player.job && baseStatsData[player.race] && baseStatsData[player.race][player.job] 
                          ? baseStatsData[player.race][player.job] 
                          : { str: 5, dex: 5, int: 5, vit: 5 }
        
        // Job bonus
        let jobBonus = { atk: 0, def: 0, hp: 0 }
        if (player.job && jobs[player.race]) {
           for (const tier of Object.values(jobs[player.race])) {
             const j = tier.find(x => x.id === player.job)
             if (j) { jobBonus = j.bonus; break; }
           }
        }

        const eqSlots = ['weapon', 'armor', 'shield', 'helmet', 'mantle', 'gloves', 'boots', 'pants', 'amulet1', 'amulet2', 'ring1', 'ring2', 'ascension_arms']
        let flatAtk = jobBonus.atk || 0
        let flatDef = jobBonus.def || 0
        let flatHp = jobBonus.hp || 0
        
        let percentAtk = 0
        let percentDef = 0
        let percentHp = 0
        eqSlots.forEach(slot => {
          const item = eq[slot]
          if (item && item.bonus) {
            // Skip Archon gear stats if not the Archon
            if (item.id && item.id.startsWith('archon_') && !isArchon) {
              return
            }

            let itemAtk = item.bonus.atk || 0
            let itemDef = item.bonus.def || 0
            let itemHp = item.bonus.hp || 0

            // Apply refinement/rarity bonus if it's the weapon
            if (slot === 'weapon' && item.rarityGrade) {
              const rBonus = getWeaponRarityBonus(item.rarityGrade)
              itemAtk = Math.floor(itemAtk * (1 + rBonus / 100))
            }

            // Apply enhancement bonus (+1 to +8)
            if (item.enhancement) {
              const mult = 1 + (item.enhancement * 0.1)
              if (item.type === 'weapon') {
                itemAtk = Math.floor(itemAtk * mult)
              } else {
                itemDef = Math.floor(itemDef * mult)
                itemHp = Math.floor(itemHp * mult)
              }
            }

            flatAtk += itemAtk
            flatDef += itemDef
            flatHp += itemHp

            // Percent upgrades
            if (item.bonus.atkPercent) percentAtk += item.bonus.atkPercent
            if (item.bonus.defPercent) percentDef += item.bonus.defPercent
            if (item.bonus.hpPercent) percentHp += item.bonus.hpPercent
          }
        })

        // Base HP, DEF, ATK Math using STR, DEX, INT, VIT
        let baseAtkScaling = 0
        if (baseStats.str >= 12 && baseStats.str > baseStats.dex && baseStats.str > baseStats.int) { // Warrior
            baseAtkScaling = (baseStats.str * 2.5) + (baseStats.dex * 0.5)
        } else if (baseStats.dex >= 12 && baseStats.dex > baseStats.str && baseStats.dex > baseStats.int) { // Ranger
            baseAtkScaling = (baseStats.dex * 2.5) + (baseStats.str * 0.5)
        } else if (baseStats.int >= 14) { // Spiritualist
            baseAtkScaling = (baseStats.int * 2.5) + (baseStats.dex * 0.5)
        } else { // Specialist
            baseAtkScaling = (baseStats.str * 1.5) + (baseStats.dex * 1.0) + (baseStats.int * 1.0)
        }

        let baseHpScaling = (baseStats.vit * 25) + (baseStats.str * 5)
        let baseDefScaling = (baseStats.vit * 1.5) + (baseStats.str * 0.5)

        let levelGrowth = { hp: 0, atk: 0, def: 0 }
        if (player.job) {
          let growth = null;
          
          if (player.race === 'bionex') {
            const guardianJobs = ['guardian', 'centurion', 'protector', 'imperator'];
            const marksmanJobs = ['marksman', 'revenant', 'deadeye', 'predator'];
            const engineerJobs = ['engineer', 'mechanist', 'techmaster', 'overseer'];
            const psionJobs = ['psion', 'esper', 'ascendant', 'transcendent'];
            if (guardianJobs.includes(player.job)) {
              growth = { hp: 13, atk: 2, def: 2 }
              baseHpScaling = 210; baseAtkScaling = 27; baseDefScaling = 22;
            } else if (marksmanJobs.includes(player.job)) {
              growth = { hp: 10, atk: 3, def: 1 }
              baseHpScaling = 175; baseAtkScaling = 33; baseDefScaling = 15;
            } else if (engineerJobs.includes(player.job)) {
              growth = { hp: 9, atk: 2, def: 1.5 }
              baseHpScaling = 175; baseAtkScaling = 25; baseDefScaling = 17;
            } else if (psionJobs.includes(player.job)) {
              growth = { hp: 8, atk: 3, def: 1 }
              baseHpScaling = 165; baseAtkScaling = 31; baseDefScaling = 14;
            }
          } else if (player.race === 'arctron') {
            const warriorJobs = ['destroyer', 'vanguard', 'juggernaut', 'dreadnought'];
            const rangerJobs = ['gunner', 'marksman', 'railgunner', 'annihilator'];
            const techJobs = ['engineer', 'architect', 'core_engineer', 'cybermancer'];
            if (warriorJobs.includes(player.job)) {
              growth = { hp: 14, atk: 2, def: 2 }
              baseHpScaling = 220; baseAtkScaling = 28; baseDefScaling = 24;
            } else if (rangerJobs.includes(player.job)) {
              growth = { hp: 10, atk: 3, def: 1 }
              baseHpScaling = 180; baseAtkScaling = 32; baseDefScaling = 16;
            } else if (techJobs.includes(player.job)) {
              growth = { hp: 9, atk: 2, def: 1.5 }
              baseHpScaling = 170; baseAtkScaling = 24; baseDefScaling = 18;
            }
          } else if (player.race === 'celestra') {
            const sentinelJobs = ['sentinel', 'warden', 'knight', 'blademaster'];
            const pathfinderJobs = ['pathfinder', 'windrunner', 'shadow_hunter', 'stargazer'];
            const oracleJobs = ['oracle', 'celestial_oracle', 'conjurer', 'divine_summoner'];
            const arcanistJobs = ['arcanist', 'rune_caster', 'mystic', 'archmage'];
            if (sentinelJobs.includes(player.job)) {
              growth = { hp: 12, atk: 2, def: 2 }
              baseHpScaling = 195; baseAtkScaling = 29; baseDefScaling = 20;
            } else if (pathfinderJobs.includes(player.job)) {
              growth = { hp: 9, atk: 3, def: 1 }
              baseHpScaling = 165; baseAtkScaling = 35; baseDefScaling = 14;
            } else if (oracleJobs.includes(player.job)) {
              growth = { hp: 8, atk: 2, def: 1.5 }
              baseHpScaling = 170; baseAtkScaling = 28; baseDefScaling = 16;
            } else if (arcanistJobs.includes(player.job)) {
              growth = { hp: 8, atk: 3, def: 1 }
              baseHpScaling = 160; baseAtkScaling = 34; baseDefScaling = 13;
            }
          }

          if (growth) {
            const levelUps = Math.max(0, (player.level || 1) - 1)
            levelGrowth.hp = growth.hp * levelUps
            levelGrowth.atk = growth.atk * levelUps
            levelGrowth.def = growth.def * levelUps
          }
        }

        let baseAtk = baseAtkScaling + calcStat('atk', player.upgrades?.atk || 0, player.race) + flatAtk + levelGrowth.atk
        let baseDef = baseDefScaling + calcStat('def', player.upgrades?.def || 0, player.race) + flatDef + levelGrowth.def
        let baseHp = baseHpScaling + calcStat('hp', player.upgrades?.hp || 0, player.race) + flatHp + levelGrowth.hp

        // Set bonus verification (requires being the Archon)
        const isBionexSet = isArchon &&
          eq.helmet?.id === 'archon_bionex_helmet' &&
          eq.mantle?.id === 'archon_bionex_mantle' &&
          eq.armor?.id === 'archon_bionex_armor' &&
          eq.gloves?.id === 'archon_bionex_gloves' &&
          eq.boots?.id === 'archon_bionex_boots' &&
          eq.weapon?.id === 'archon_bionex_weapon';
          
        const isCelestraSet = isArchon &&
          eq.helmet?.id === 'archon_celestra_helmet' &&
          eq.mantle?.id === 'archon_celestra_mantle' &&
          eq.armor?.id === 'archon_celestra_armor' &&
          eq.gloves?.id === 'archon_celestra_gloves' &&
          eq.boots?.id === 'archon_celestra_boots' &&
          eq.weapon?.id === 'archon_celestra_weapon';

        const isArctronSet = isArchon &&
          eq.helmet?.id === 'archon_arctron_helmet' &&
          eq.mantle?.id === 'archon_arctron_mantle' &&
          eq.armor?.id === 'archon_arctron_armor' &&
          eq.gloves?.id === 'archon_arctron_gloves' &&
          eq.boots?.id === 'archon_arctron_boots' &&
          eq.weapon?.id === 'archon_arctron_weapon';

        if (isBionexSet && player.race === 'bionex') {
          percentHp += 30
          percentDef += 20
        } else if (isCelestraSet && player.race === 'celestra') {
          percentAtk += 30 // Magic Power mapped to ATK
          percentDef += 20 // Mana Regen mapped to DEF
        } else if (isArctronSet && player.race === 'arctron') {
          percentAtk += 30
          percentDef += 20
        }

        let atk = baseAtk * (1 + percentAtk / 100)
        let def = baseDef * (1 + percentDef / 100)
        let hp = baseHp * (1 + percentHp / 100)

        // Vampire weapon life steal gives +10% HP
        if (eq.weapon && eq.weapon.specialProperty === 'vampire') {
          hp += hp * 0.10
        }

        // Archon mantle and aura rules
        if (archons) {
          const myRaceArchon = archons[player.race]
          const archonRules = archonData[player.race]
          if (archonRules) {
            if (myRaceArchon && myRaceArchon.toLowerCase() === player.username?.toLowerCase()) {
              if (archonRules.mantle.bonus.atkPercent) atk += baseAtk * (archonRules.mantle.bonus.atkPercent / 100)
              if (archonRules.mantle.bonus.defPercent) def += baseDef * (archonRules.mantle.bonus.defPercent / 100)
            }
            if (myRaceArchon) {
              if (archonRules.aura.bonus.hpPercent) hp += baseHp * (archonRules.aura.bonus.hpPercent / 100)
              if (archonRules.aura.bonus.atkPercent) atk += baseAtk * (archonRules.aura.bonus.atkPercent / 100)
            }
          }
        }

        // Guild Role Buffs
        if (player.guild) {
          if (player.guild.role === 'Guildmaster') {
            hp += baseHp * 0.03
            atk += baseAtk * 0.03
            def += baseDef * 0.03
          } else if (player.guild.role === 'Vice Guildmaster') {
            hp += baseHp * 0.02
            atk += baseAtk * 0.02
            def += baseDef * 0.02
          }
        }

        let activeTitle = ''
        if (isBionexSet && player.race === 'bionex') {
          activeTitle = 'Solar Sovereign'
        } else if (isCelestraSet && player.race === 'celestra') {
          activeTitle = 'Astral Emperor'
        } else if (isArctronSet && player.race === 'arctron') {
          activeTitle = 'Iron Overlord'
        }

        return {
          atk: Math.floor(atk),
          def: Math.floor(def),
          hp: Math.floor(hp),
          str: baseStats.str,
          dex: baseStats.dex,
          int: baseStats.int,
          vit: baseStats.vit,
          title: activeTitle
        }
      },
      equipItem: (uid) => {
        const { player, archons } = get()
        const item = player.inventory.find((i) => i.uid === uid)
        if (!item) return

        if (player.level < (item.level || 0)) {
          alert(tStore('alert_req_level', { level: item.level }, player))
          return
        }

        if (item.race && item.race !== 'All' && item.race !== player.race) {
          alert(tStore('alert_restricted_race', { race: item.race.toUpperCase() }, player))
          return
        }

        if (item.job && item.job !== player.job) {
          alert(tStore('alert_restricted_job', { job: item.job.toUpperCase() }, player))
          return
        }


        const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null }

        // Determine target slot — amulet and ring have dual slots
        let slot = null
        if (item.type === 'amulet') {
          slot = !eq.amulet1 ? 'amulet1' : 'amulet2'
        } else if (item.type === 'ring') {
          slot = !eq.ring1 ? 'ring1' : 'ring2'
        } else if (['weapon','armor','shield','helmet','mantle','gloves','boots','pants'].includes(item.type)) {
          slot = item.type
        }
        if (!slot) return
        const oldItem = eq[slot]

        let newInventory = player.inventory.filter((i) => i.uid !== uid)
        if (oldItem) {
          newInventory.push(oldItem)
        }

        set({
          player: {
            ...player,
            inventory: newInventory,
            equipment: {
              ...eq,
              [slot]: item
            },
            savedAt: Date.now()
          }
        })
      },
      unequipItem: (slot) => {
        const { player } = get()
        const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null, pants: null, amulet1: null, amulet2: null, ring1: null, ring2: null }
        const item = eq[slot]
        if (!item) return

        const newInventory = [...player.inventory, item]

        set({
          player: {
            ...player,
            inventory: newInventory,
            equipment: {
              ...eq,
              [slot]: null
            },
            savedAt: Date.now()
          }
        })
      },
      sellItem: (uid) => {
        const { player } = get()
        const item = player.inventory.find((i) => i.uid === uid)
        if (!item) return

        const price = (item.level || 1) * 8 + (item.rarity === 'epic' ? 100 : item.rarity === 'rare' ? 50 : 10)
        const newInventory = player.inventory.filter((i) => i.uid !== uid)

        set({
          player: {
            ...player,
            inventory: newInventory,
            resources: {
              ...player.resources,
              anium: player.resources.anium + price
            },
            savedAt: Date.now()
          }
        })
      },
      buyPotions: (count = 10) => {
        const { player } = get()
        const cost = count * 20 // 20 Anium per potion
        if ((player.resources.anium || 0) < cost) {
          alert(tStore('alert_not_enough_anium', { cost }, player))
          return false
        }

        set((s) => ({
          player: {
            ...s.player,
            resources: {
              ...s.player.resources,
              anium: s.player.resources.anium - cost,
              potions: (s.player.resources.potions || 0) + count
            },
            savedAt: Date.now()
          }
        }))
        return true
      },
      useItem: (uid) => {
        const { player, battle, timer } = get()
        const item = player.inventory.find((i) => i.uid === uid)
        if (!item || item.type !== 'consumable') return
        
        const newInventory = player.inventory.filter((i) => i.uid !== uid)

        if (item.id === 'raid_ticket') {
          if (timer.state !== 'running' || timer.mode !== 'fight') {
            alert(tStore('alert_fight_session_required', {}, player))
            return
          }
          const sectorIdx = getSector(player.level) - 1
          const { mob, isBoss, isPitBoss, hp } = spawnEnemy(sectorIdx, player.level, true)
          let newLog = [...battle.log]
          if (newLog.length > 7) newLog = newLog.slice(-7)
          newLog.push(`🎫 RAID TICKET USED! Summoning ${mob.name}...`)
          set({
            player: { ...player, inventory: newInventory, savedAt: Date.now() },
            battle: { ...battle, currentMob: mob, isBoss, isPitBoss, enemyHp: hp, enemyMaxHp: hp, log: newLog }
          })
          return
        }
        
        // Healing consumables
        if (item.bonus && item.bonus.hp) {
            alert(tStore('alert_used_potion', { name: item.name }, player))
            set({
                player: { ...player, inventory: newInventory, savedAt: Date.now() }
            })
            return
        }

      },
      getUpgradeCost: (key) => calcUpgradeCost(key, get().player.upgrades?.[key] || 0),
      loadPlayer: (savedPlayer) => set({ player: { ...initialPlayer, ...savedPlayer } }),
      getExpToNext: () => getMinutesToNextLevel(get().player.level),

      // ── Weapon Refining & Combining ───────────────────────
      refineWeapon: () => {
        const { player } = get()
        const weapon = player.equipment?.weapon
        if (!weapon) {
          alert(tStore('alert_no_equipped_weapon', {}, player))
          return
        }
        const currentGrade = (weapon.rarityGrade || 'normal').toLowerCase()
        const REFINE_COSTS = {
          normal: { next: 'advanced', talics: 1, anium: 5000 },
          advanced: { next: 'rare', talics: 2, anium: 10000 },
          rare: { next: 'epic', talics: 3, anium: 20000 },
          epic: { next: 'legendary', talics: 5, anium: 50000 },
          legendary: { next: 'mythic', talics: 10, anium: 100000 }
        }
        const cost = REFINE_COSTS[currentGrade]
        if (!cost) {
          alert(tStore('alert_max_mythic', {}, player))
          return
        }

        const talicCount = player.inventory.filter(it => it.id === 'talic_ignorance').length
        if (talicCount < cost.talics) {
          alert(tStore('alert_missing_ignorance', { talics: cost.talics, owned: talicCount }, player))
          return
        }
        if (player.resources.anium < cost.anium) {
          alert(tStore('alert_missing_anium', { anium: cost.anium, owned: player.resources.anium }, player))
          return
        }


        let consumed = 0
        const newInventory = player.inventory.filter(it => {
          if (it.id === 'talic_ignorance' && consumed < cost.talics) {
            consumed++
            return false
          }
          return true
        })

        const upgradedWeapon = {
          ...weapon,
          rarityGrade: cost.next
        }

        set({
          player: {
            ...player,
            resources: {
              ...player.resources,
              anium: player.resources.anium - cost.anium
            },
            inventory: newInventory,
            equipment: {
              ...player.equipment,
              weapon: upgradedWeapon
            },
            savedAt: Date.now()
          }
        })
      },

      createGuild: (name) => {
        const { player } = get()
        if (player.level < 30) return false
        if (player.resources.credits < 10000000) return false
        if (player.guild) return false

        set({
          player: {
            ...player,
            resources: { ...player.resources, credits: player.resources.credits - 10000000 },
            guild: { name, level: 1, role: 'Guildmaster', members: 1 },
            savedAt: Date.now()
          }
        })
        return true
      },

      upgradeGuild: () => {
        const { player } = get()
        if (!player.guild || player.guild.role !== 'Guildmaster') return false
        
        const upgradeCosts = [
          0, // lv 1
          10000000, // to lv 2
          20000000, // to lv 3
          40000000, // to lv 4
          80000000, // to lv 5
          150000000, // to lv 6
          300000000, // to lv 7
          500000000, // to lv 8
          750000000, // to lv 9
          1000000000, // to lv 10
        ]

        const currentLv = player.guild.level
        if (currentLv >= 10) return false
        
        const cost = upgradeCosts[currentLv]
        if (player.resources.credits < cost) return false

        set({
          player: {
            ...player,
            resources: { ...player.resources, credits: player.resources.credits - cost },
            guild: { ...player.guild, level: currentLv + 1 },
            savedAt: Date.now()
          }
        })
        return true
      },

      combineWeapon: (sacrificeUid) => {
        const { player } = get()
        const weapon = player.equipment?.weapon
        if (!weapon) {
          alert(tStore('alert_no_equipped_weapon', {}, player))
          return
        }
        const isEpicOrHigher = (item) => {
          if (!item) return false
          const r = (item.rarityGrade || item.rarity || '').toLowerCase()
          return ['epic', 'legendary', 'mythic', 'ssr', 'ur'].includes(r)
        }

        if (!isEpicOrHigher(weapon)) {
          alert(tStore('alert_epic_or_higher_req', {}, player))
          return
        }
        if (weapon.specialProperty === 'vampire') {
          alert(tStore('alert_already_vampire', {}, player))
          return
        }

        const sacrifice = player.inventory.find(it => it.uid === sacrificeUid)
        if (!sacrifice) {
          alert(tStore('alert_sacrifice_not_found', {}, player))
          return
        }
        if (sacrifice.type !== 'weapon') {
          alert(tStore('alert_sacrifice_must_weapon', {}, player))
          return
        }
        if (!isEpicOrHigher(sacrifice)) {
          alert(tStore('alert_sacrifice_epic_req', {}, player))
          return
        }

        const talicCount = player.inventory.filter(it => it.id === 'talic_favor').length
        const reqTalics = 5
        const reqAnium = 30000

        if (talicCount < reqTalics) {
          alert(tStore('alert_missing_favor', { talics: reqTalics, owned: talicCount }, player))
          return
        }
        if (player.resources.anium < reqAnium) {
          alert(tStore('alert_missing_anium', { anium: reqAnium, owned: player.resources.anium }, player))
          return
        }


        let consumedTalics = 0
        const newInventory = player.inventory.filter(it => {
          if (it.uid === sacrificeUid) return false
          if (it.id === 'talic_favor' && consumedTalics < reqTalics) {
            consumedTalics++
            return false
          }
          return true
        })

        const combinedWeapon = {
          ...weapon,
          specialProperty: 'vampire'
        }

        set({
          player: {
            ...player,
            resources: {
              ...player.resources,
              anium: player.resources.anium - reqAnium
            },
            inventory: newInventory,
            equipment: {
              ...player.equipment,
              weapon: combinedWeapon
            },
            savedAt: Date.now()
          }
        })
      },

      enhanceItem: (slot, useLuckyRelic) => {
        const { player } = get()
        const item = player.equipment?.[slot]
        if (!item) {
          alert('Tidak ada item terpasang di slot ini.')
          return { success: false, status: 'error' }
        }

        const currentEnhancement = item.enhancement || 0
        if (currentEnhancement >= 8) {
          alert(tStore('alert_max_enhancement', {}, player))
          return { success: false, status: 'error' }
        }

        // Materials verification
        const arcaniteCount = player.inventory.filter(it => it.id === 'mat_arcanite').length
        if (arcaniteCount < 1) {
          alert(tStore('alert_missing_arcanite', { owned: arcaniteCount }, player))
          return { success: false, status: 'error' }
        }

        const DIVINE_CREST_COSTS = [20, 40, 60, 80, 100, 120, 150, 200]
        const crestCost = DIVINE_CREST_COSTS[currentEnhancement]
        const crestCount = player.inventory.filter(it => it.id === 'mat_divine_crest').length
        if (crestCount < crestCost) {
          alert(tStore('alert_missing_crests', { required: crestCost, owned: crestCount }, player))
          return { success: false, status: 'error' }
        }

        if (useLuckyRelic) {
          const relicCount = player.inventory.filter(it => it.id === 'mat_lucky_relic').length
          if (relicCount < 1) {
            alert(tStore('alert_missing_relics', { owned: relicCount }, player))
            return { success: false, status: 'error' }
          }
        }

        // Consume materials
        let consumedArcanite = 0
        let consumedCrests = 0
        let consumedRelics = 0

        const newInventory = player.inventory.filter(it => {
          if (it.id === 'mat_arcanite' && consumedArcanite < 1) {
            consumedArcanite++
            return false
          }
          if (it.id === 'mat_divine_crest' && consumedCrests < crestCost) {
            consumedCrests++
            return false
          }
          if (useLuckyRelic && it.id === 'mat_lucky_relic' && consumedRelics < 1) {
            consumedRelics++
            return false
          }
          return true
        })

        // Enhancement math
        // Rates: +1 (100%), +2 (90%), +3 (70%), +4 (50%), +5 (35%), +6 (20%), +7 (10%), +8 (5%)
        const BASE_SUCCESS_RATES = [1.0, 0.9, 0.7, 0.5, 0.35, 0.20, 0.10, 0.05]
        let successChance = BASE_SUCCESS_RATES[currentEnhancement] || 0.0
        if (useLuckyRelic) {
          successChance += 0.10
        }
        successChance = Math.min(1.0, successChance)

        const roll = Math.random()
        let isSuccess = roll < successChance

        if (isSuccess) {
          const nextEnhancement = currentEnhancement + 1
          const updatedItem = {
            ...item,
            enhancement: nextEnhancement
          }

          const newCombatStats = {
            ...(player.combatStats || { totalMonsterKill: 0, worldBossKill: 0, dungeonClear: 0, coreWarVictory: 0, highestEnhancement: 0 }),
          }
          if (nextEnhancement > (newCombatStats.highestEnhancement || 0)) {
            newCombatStats.highestEnhancement = nextEnhancement
          }

          set({
            player: {
              ...player,
              inventory: newInventory,
              equipment: {
                ...player.equipment,
                [slot]: updatedItem
              },
              combatStats: newCombatStats,
              savedAt: Date.now()
            }
          })

          return { success: true, status: 'success', level: nextEnhancement }
        } else {
          // Failure outcome:
          // If current level is 5, 6, or 7 (target level is 6, 7, 8): destruction!
          const isDestructionLevel = currentEnhancement >= 5
          if (isDestructionLevel) {
            const updatedEquipment = { ...player.equipment }
            delete updatedEquipment[slot] // Completely delete item from slot

            set({
              player: {
                ...player,
                inventory: newInventory,
                equipment: updatedEquipment,
                savedAt: Date.now()
              }
            })

            return { success: false, status: 'destroyed', level: 0 }
          } else {
            // Safe level (0 to 4): level remains the same
            set({
              player: {
                ...player,
                inventory: newInventory,
                savedAt: Date.now()
              }
            })
            return { success: false, status: 'fail', level: currentEnhancement }
          }
        }
      },

      craftAscensionArms: (evoData, raceAresName) => {
        const { player } = get()
        if (player.resources.credits < evoData.cost) {
          alert('Credits (◈) tidak cukup!')
          return false
        }
        if (player.level < evoData.levelReq) {
          alert(`Level ${evoData.levelReq} dibutuhkan!`)
          return false
        }

        const newItem = {
          uid: Date.now(),
          id: evoData.id,
          name: evoData.name,
          type: 'ascension_arms',
          rarity: 'ssr', // Always SSR equivalent
          emoji: raceAresName === 'ARES' ? '🤖' : raceAresName === 'M.E.U.' ? '⚙️' : '🌿',
          bonus: {
            atk: evoData.atk,
            hp: evoData.hp,
            crit: evoData.crit
          },
          isEquipped: true
        }

        set({
          player: {
            ...player,
            resources: {
              ...player.resources,
              credits: player.resources.credits - evoData.cost
            },
            equipment: {
              ...player.equipment,
              ascension_arms: newItem
            },
            savedAt: Date.now()
          }
        })
        return true
      },

      // ── Archon Purchasing (Premium Shop) ───────────────────
      craftArchonItem: (itemId) => {
        const { player } = get()
        const ARCHON_PRICES = {
          archon_bionex_helmet: 15000,
          archon_bionex_gloves: 15000,
          archon_bionex_boots: 15000,
          archon_bionex_armor: 25000,
          archon_bionex_mantle: 25000,
          archon_bionex_weapon: 25000,

          archon_celestra_helmet: 15000,
          archon_celestra_gloves: 15000,
          archon_celestra_boots: 15000,
          archon_celestra_armor: 25000,
          archon_celestra_mantle: 25000,
          archon_celestra_weapon: 25000,

          archon_arctron_helmet: 15000,
          archon_arctron_gloves: 15000,
          archon_arctron_boots: 15000,
          archon_arctron_armor: 25000,
          archon_arctron_mantle: 25000,
          archon_arctron_weapon: 25000
        }
        const price = ARCHON_PRICES[itemId]
        if (price === undefined) {
          alert(tStore('invalid_item', {}, player))
          return
        }

        const itemTemplate = itemsData.items.find(it => it.id === itemId)
        if (!itemTemplate) {
          alert(tStore('item_not_found', {}, player))
          return
        }
        if (itemTemplate.race !== player.race) {
          alert(tStore('restricted_race', { race: itemTemplate.race.toUpperCase() }, player))
          return
        }

        if (player.resources.anium < price) {
          alert(tStore('need_more_anium', { need: price.toLocaleString(), owned: player.resources.anium.toLocaleString() }, player))
          return
        }


        // Add item to inventory directly without consuming any materials
        const purchasedItem = {
          ...itemTemplate,
          uid: Date.now()
        }
        
        const newInventory = [...player.inventory, purchasedItem]

        set({
          player: {
            ...player,
            resources: {
              ...player.resources,
              anium: player.resources.anium - price
            },
            inventory: newInventory,
            savedAt: Date.now()
          }
        })
      },

    }),
    {
      name: 'focus-rpg-save',
      merge: (persistedState, currentState) => {
        if (!persistedState) return currentState
        if (persistedState.player) {
          // Migrasi nama Faction lama -> baru
          if (persistedState.player.race === 'acreton') persistedState.player.race = 'arctron';
          if (persistedState.player.race === 'belterra') persistedState.player.race = 'bionex';
          if (persistedState.player.race === 'coralis') persistedState.player.race = 'celestra';
        }
        const mergedPlayer = {
          ...currentState.player,
          ...(persistedState.player || {}),
          resources: {
            ...currentState.player?.resources,
            ...(persistedState.player?.resources || {})
          },
          upgrades: {
            ...currentState.player?.upgrades,
            ...(persistedState.player?.upgrades || {})
          },
          equipment: {
            ...currentState.player?.equipment,
            ...(persistedState.player?.equipment || {})
          }
        }
        if (mergedPlayer.race && mergedPlayer.job) {
          const validJobs = jobs[mergedPlayer.race]
            ? [
                ...jobs[mergedPlayer.race].tier1.map(j => j.id),
                ...jobs[mergedPlayer.race].tier2.map(j => j.id),
                ...jobs[mergedPlayer.race].tier3.map(j => j.id),
                ...(jobs[mergedPlayer.race].tier4 ? jobs[mergedPlayer.race].tier4.map(j => j.id) : [])
              ]
            : []
          if (!validJobs.includes(mergedPlayer.job)) {
            mergedPlayer.job = null
          }
        }
        return {
          ...currentState,
          ...persistedState,
          player: mergedPlayer,
          timer: {
            ...currentState.timer,
            ...(persistedState.timer || {})
          },
          battle: {
            ...currentState.battle,
            ...(persistedState.battle || {})
          }
        }
      }
    }
  )
)
