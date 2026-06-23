import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import races from '../data/races.json'
import jobs from '../data/jobs.json'
import enemies from '../data/enemies.json'
import upgradesConfig from '../data/upgrades.json'
import itemsData from '../data/items.json'
import archonData from '../data/archon.json'
import { getWeaponRarityBonus } from '../lib/rarity'

function calcUpgradeCost(key, level) {
  const cfg = upgradesConfig[key]
  return Math.floor(cfg.baseCost * Math.pow(cfg.costMultiplier, level))
}

function calcStat(key, upgradeLevel, raceId) {
  const cfg = upgradesConfig[key]
  const race = races[raceId]
  const base = cfg.baseValue + cfg.perLevel * upgradeLevel
  if (!race) return base
  const multiplier = key === 'hp'
    ? race.bonuses.hpMultiplier
    : key === 'atk'
    ? race.bonuses.atkMultiplier
    : race.bonuses.defMultiplier
  return Math.floor(base * multiplier)
}

function calcExpToNext(level) {
  return Math.floor(100 * Math.pow(1.35, level - 1))
}

function getSector(level) {
  return Math.min(Math.ceil(level / 10), enemies.sectors.length)
}

function randomMob(sectorIdx) {
  const sector = enemies.sectors[sectorIdx]
  const mobs = sector.mobs
  return mobs[Math.floor(Math.random() * mobs.length)]
}

function spawnEnemy(sectorIdx, playerLevel, forceRaid = false) {
  const sector = enemies.sectors[sectorIdx]
  
  if (forceRaid || Math.random() < 0.01) {
    return { mob: sector.pitBoss, isBoss: true, isPitBoss: true, isCulprit: false, hp: sector.pitBoss.hp }
  }
  
  if (playerLevel % 10 === 0) {
    return { mob: sector.boss, isBoss: true, isPitBoss: false, isCulprit: false, hp: sector.boss.hp }
  }

  const baseMob = randomMob(sectorIdx)
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
function computeRewards(player, mode, minutes) {
  const race = races[player.race]
  if (!race) return { kills: 0, exp: 0, anium: 0 }
  const elapsedSec = Math.max(0, Math.floor(minutes * 60))
  if (mode === 'gather') {
    return {
      kills: 0,
      exp: Math.floor(elapsedSec * 0.18 * race.bonuses.expMultiplier),
      anium: Math.floor(elapsedSec * 0.72 * race.bonuses.gatherMultiplier),
    }
  }
  const sectorIdx = getSector(player.level) - 1
  const mobs = enemies.sectors[sectorIdx].mobs
  const avg = (f) => mobs.reduce((a, m) => a + f(m), 0) / mobs.length
  let avgHp, avgDef, avgExp, avgAni
  if (player.level % 10 === 0) {
    const boss = enemies.sectors[sectorIdx].boss
    avgHp = boss.hp; avgDef = boss.def; avgExp = boss.expReward; avgAni = boss.aniumReward
  } else {
    avgHp = avg((m) => m.hp) * 1.2
    avgDef = avg((m) => m.def)
    avgExp = avg((m) => m.expReward) * 1.2
    avgAni = avg((m) => m.aniumReward) * 1.2
  }
  const atk = calcStat('atk', player.upgrades.atk, player.race)
  const dps = Math.max(1, atk - avgDef + 3.5) * 1.096 // ~rata2 crit/variance
  const secPerKill = Math.max(1, avgHp / dps)
  const kills = Math.floor(elapsedSec / secPerKill)
  return {
    kills,
    exp: Math.floor(kills * avgExp * race.bonuses.expMultiplier * 1.3),
    anium: Math.floor(kills * avgAni * 1.3),
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
  equipment: { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null },
  sector: 1,
  highestSector: 1,
  streak: 0,
  lastSessionDate: null,
  inventory: [],
  totalSessions: 0,
  totalMinutes: 0,
  savedAt: 0,
}

const initialTimer = {
  selectedMinutes: 25,
  secondsLeft: 25 * 60,
  state: 'idle',   // idle | running | completed
  mode: 'fight',   // fight | gather
  startedAt: 0,    // epoch ms — sumber kebenaran countdown (sync antar device)
  endsAt: 0,       // epoch ms
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

      // ── Race Selection ───────────────────────────────────
      openRaceSelect: () => set({ showRaceSelect: true }),
      selectRace: (raceId) => {
        set((s) => ({
          showRaceSelect: false,
          player: {
            ...s.player,
            race: raceId,
            job: null,
            upgrades: { atk: 0, def: 0, hp: 0 },
            equipment: { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null },
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

      startTimer: () => {
        const { player, timer } = get()
        if (!player.race) { set({ showRaceSelect: true }); return }
        if (timer.state !== 'idle') return
        const now = Date.now()
        const sectorIdx = getSector(player.level) - 1
        const sector = enemies.sectors[sectorIdx]
        const { mob, isBoss, isPitBoss, hp } = spawnEnemy(sectorIdx, player.level)
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
        const r = computeRewards(player, timer.mode, (total - remaining) / 60)

        // Apply death penalties
        const deaths = battle.deaths || 0
        const deathPenaltyExp = deaths * 15
        const deathPenaltyAnium = deaths * 30
        const deathPenaltyKills = deaths * 1

        const finalKills = Math.max(0, r.kills - deathPenaltyKills)
        const finalExp = Math.max(0, r.exp - deathPenaltyExp)
        const finalAnium = Math.max(0, r.anium - deathPenaltyAnium)

        set((s) => ({
          timer: { ...s.timer, secondsLeft: remaining },
          battle: { 
            ...s.battle, 
            kills: finalKills, 
            sessionExp: finalExp, 
            sessionAnium: finalAnium 
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

        // 2. Passive FP regeneration (+10 FP per tick, capped at 200)
        const playerMaxFp = battle.playerMaxFp || 200
        let nextPlayerFp = Math.min(playerMaxFp, (battle.playerFp ?? playerMaxFp) + 10)

        // 3. Player attacks enemy turn
        const playerAtk = get().getStats().atk
        const mob = battle.currentMob
        const isCrit = Math.random() < (player.race === 'coralis' ? 0.15 : 0.12)
        const variance = 0.8 + Math.random() * 0.4
        const rawDmg = Math.max(1, playerAtk - mob.def + Math.floor(Math.random() * 8))
        const dmgToEnemy = Math.floor(rawDmg * variance * (isCrit ? 1.8 : 1))
        let newEnemyHp = battle.enemyHp - dmgToEnemy
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
          
          // Enemy crit chance scales by mob grade (Sector/Boss/Culprit)
          const enemyCritChance = battle.isPitBoss ? 0.22 : battle.isBoss ? 0.18 : battle.isCulprit ? 0.14 : 0.08
          const isEnemyCrit = Math.random() < enemyCritChance
          const critMultiplier = isEnemyCrit ? 1.6 : 1.0

          // Scale damage, ensure at least 5% of enemy ATK penetrates player defense as chip damage
          const baseDmg = Math.max(1 + Math.floor(enemyAtk * 0.05), enemyAtk - Math.floor(playerDef * 0.15) + Math.floor(Math.random() * 3))
          const dmgToPlayer = Math.floor(baseDmg * critMultiplier)
          
          nextPlayerHp = Math.max(0, battle.playerHp - dmgToPlayer)
          if (newLog.length > 7) newLog = newLog.slice(-7)
          if (isEnemyCrit) {
            newLog.push(`💥 CRIT! ${mob.emoji} ${mob.name} melancarkan serangan kritis! -${dmgToPlayer} Shield HP`)
          } else {
            newLog.push(`💥 ${mob.emoji} ${mob.name} menyerang Pilot! -${dmgToPlayer} Shield HP`)
          }

          // --- DUAL AUTO-HEAL SYSTEM ---
          const playerMaxHp = battle.playerMaxHp || get().getStats().hp
          // Trigger heal only when health is critical (below 35%)
          if (nextPlayerHp > 0 && nextPlayerHp < playerMaxHp * 0.35) {
            const hasSkill = ['acolyte', 'eidolon_caller', 'high_summoner', 'guardian', 'lumina_paladin', 'engineer', 'mechanist', 'war_engineer'].includes(player.job)
            
            if (hasSkill) {
              if (nextPlayerFp >= 50) {
                // Cast healing skill
                nextPlayerFp -= 50
                const healAmount = Math.floor(playerMaxHp * 0.35)
                nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + healAmount)
                
                const skillName = ['engineer', 'mechanist', 'war_engineer'].includes(player.job) ? 'Repair Matrix' : 'Spiritual Heal'
                if (newLog.length > 7) newLog = newLog.slice(-7)
                newLog.push(`✨ [Skill] Pilot menggunakan ${skillName}! (+${healAmount} HP, -50 FP)`)
              } else {
                // FP depleted -> fallback to auto-potion
                const potionIdx = player.inventory.findIndex(item => item.id === 'pot_hp')
                if (potionIdx !== -1) {
                  const potion = player.inventory[potionIdx]
                  const healAmount = 1000
                  nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + healAmount)
                  
                  const newInventory = player.inventory.filter((_, idx) => idx !== potionIdx)
                  if (newLog.length > 7) newLog = newLog.slice(-7)
                  newLog.push(`🧪 [Auto-Potion] Menggunakan ${potion.name}! (+${healAmount} Shield HP)`)
                  
                  set({
                    player: {
                      ...player,
                      inventory: newInventory,
                      savedAt: Date.now()
                    }
                  })
                } else {
                  if (newLog.length > 7) newLog = newLog.slice(-7)
                  newLog.push(`⚠️ FP tidak cukup & HP Potion habis!`)
                }
              }
            } else {
              // Direct auto-potion for non-healing jobs
              const potionIdx = player.inventory.findIndex(item => item.id === 'pot_hp')
              if (potionIdx !== -1) {
                const potion = player.inventory[potionIdx]
                const healAmount = 1000
                nextPlayerHp = Math.min(playerMaxHp, nextPlayerHp + healAmount)
                
                const newInventory = player.inventory.filter((_, idx) => idx !== potionIdx)
                if (newLog.length > 7) newLog = newLog.slice(-7)
                newLog.push(`🧪 [Auto-Potion] Menggunakan ${potion.name}! (+${healAmount} Shield HP)`)
                
                set({
                  player: {
                    ...player,
                    inventory: newInventory,
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
            const sectorIdx = getSector(player.level) - 1
            const next = spawnEnemy(sectorIdx, player.level)
            nextMob = next.mob; nextIsBoss = next.isBoss; nextMaxHp = next.hp; newEnemyHp = next.hp
            if (next.isPitBoss) newLog.push(`☢️ RAID INCOMING: ${next.mob.emoji} ${next.mob.name}!`)
            else if (next.isBoss) newLog.push(`⚠️ STAGE BOSS: ${next.mob.emoji} ${next.mob.name}!`)
          } else if (isCrit) {
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

        const r = computeRewards(player, timer.mode, timer.selectedMinutes)
        const today = new Date().toDateString()
        const isNewDay = player.lastSessionDate !== today
        const newStreak = isNewDay ? player.streak + 1 : player.streak

        // Apply death penalties
        const deaths = battle.deaths || 0
        const deathPenaltyExp = deaths * 15
        const deathPenaltyAnium = deaths * 30
        const deathPenaltyKills = deaths * 1

        const finalKills = Math.max(0, r.kills - deathPenaltyKills)
        const finalExp = Math.max(0, r.exp - deathPenaltyExp)
        const finalAnium = Math.max(0, r.anium - deathPenaltyAnium)

        let newExp = player.exp + finalExp
        let newLevel = player.level
        let expToNext = calcExpToNext(newLevel)
        let levelUps = 0
        while (newExp >= expToNext && newLevel < 60) {
          newExp -= expToNext; newLevel += 1; levelUps += 1; expToNext = calcExpToNext(newLevel)
        }
        const newSector = getSector(newLevel)

        // Item drop deterministik berdasar sistem Rarity
        const newInventory = [...player.inventory]
        let dropLog = ''
        
        // Cek apa bos mati (finalKills > 0)
        const killedPitBoss = timer.mode === 'fight' && battle.isPitBoss && finalKills > 0
        const killedStageBoss = timer.mode === 'fight' && battle.isBoss && !battle.isPitBoss && finalKills > 0
        
        // Jumlah drop item: 1 item per session, tapi kalau gathering bisa 2 material
        const numDrops = timer.mode === 'gather' ? 2 : 1
        
        for (let i=0; i<numDrops; i++) {
            const seed = timer.startedAt + i
            const tier = getDropTier(seed, timer.mode, killedPitBoss, killedStageBoss)
            
            if (tier) {
                let pool = []
                if (tier === 'material') {
                    pool = itemsData.items.filter(it => it.type === 'material' || it.type === 'consumable')
                } else {
                    pool = itemsData.items.filter(it => 
                      (it.type === 'weapon' || it.type === 'armor' || it.type === 'shield' || it.type === 'helmet' || it.type === 'mantle' || it.type === 'gloves' || it.type === 'boots') &&
                      it.rarity === tier &&
                      (it.race === 'All' || it.race === player.race) &&
                      it.level <= player.level + 10 &&
                      (it.type !== 'weapon' || !it.job || it.job === player.job)
                    )
                }
                
                if (pool.length > 0) {
                    const drop = pool[Math.floor(seededFrac(seed * 1.5) * pool.length)]
                    if (drop) {
                        newInventory.push({ ...drop, uid: Date.now() + i })
                        dropLog += ` \n🎁 Got: ${drop.emoji} ${drop.name}`
                    }
                }
            }
        }

        const finalLog = []
        if (levelUps > 0) finalLog.push(`🆙 LEVEL UP! LV.${newLevel} — Sector ${newSector}!`)
        finalLog.push(`✅ Done! ${finalKills} kills | +${finalAnium}⬡ | +${finalExp}EXP${deaths > 0 ? ` (Died ${deaths} times)` : ''}${dropLog}`)

        set((s) => ({
          timer: { ...s.timer, state: 'completed', secondsLeft: 0 },
          player: {
            ...s.player,
            exp: newExp,
            level: newLevel,
            sector: newSector,
            highestSector: Math.max(s.player.highestSector, newSector),
            resources: { ...s.player.resources, anium: s.player.resources.anium + finalAnium },
            streak: newStreak,
            lastSessionDate: today,
            totalSessions: s.player.totalSessions + 1,
            totalMinutes: s.player.totalMinutes + timer.selectedMinutes,
            inventory: newInventory,
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
        const currentLevel = player.upgrades[key]
        const cost = calcUpgradeCost(key, currentLevel)
        if (player.resources.anium < cost) return
        set((s) => ({
          player: {
            ...s.player,
            resources: { ...s.player.resources, anium: s.player.resources.anium - cost },
            upgrades: { ...s.player.upgrades, [key]: currentLevel + 1 },
            savedAt: Date.now(),
          },
        }))
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
          const next = { player: { ...initialPlayer, ...playerPart } }
          
          // Force reset if the loaded race is obsolete
          const raceMap = { 
            'accretians': 'acreton', 'accretia': 'acreton', 'acreton': 'acreton',
            'bellians': 'belterra', 'bellato': 'belterra', 'belterra': 'belterra',
            'corvus': 'coralis', 'cora': 'coralis', 'coralis': 'coralis'
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
            next.player.equipment = { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null }
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
        
        const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null }
        
        // Job bonus
        let jobBonus = { atk: 0, def: 0, hp: 0 }
        if (player.job && jobs[player.race]) {
           for (const tier of Object.values(jobs[player.race])) {
             const j = tier.find(x => x.id === player.job)
             if (j) { jobBonus = j.bonus; break; }
           }
        }

        const eqSlots = ['weapon', 'armor', 'shield', 'helmet', 'mantle', 'gloves', 'boots']
        let flatAtk = jobBonus.atk || 0
        let flatDef = jobBonus.def || 0
        let flatHp = jobBonus.hp || 0
        
        let percentAtk = 0
        let percentDef = 0
        let percentHp = 0

        eqSlots.forEach(slot => {
          const item = eq[slot]
          if (item && item.bonus) {
            let itemAtk = item.bonus.atk || 0
            
            // Apply refinement/rarity bonus if it's the weapon
            if (slot === 'weapon' && item.rarityGrade) {
              const rBonus = getWeaponRarityBonus(item.rarityGrade)
              itemAtk = Math.floor(itemAtk * (1 + rBonus / 100))
            }

            flatAtk += itemAtk
            flatDef += item.bonus.def || 0
            flatHp += item.bonus.hp || 0
            
            // Percent upgrades
            if (item.bonus.atkPercent) percentAtk += item.bonus.atkPercent
            if (item.bonus.defPercent) percentDef += item.bonus.defPercent
            if (item.bonus.hpPercent) percentHp += item.bonus.hpPercent
          }
        })

        let baseAtk = calcStat('atk', player.upgrades.atk, player.race) + flatAtk
        let baseDef = calcStat('def', player.upgrades.def, player.race) + flatDef
        let baseHp = calcStat('hp', player.upgrades.hp, player.race) + flatHp

        // Set bonus verification
        const isBelterraSet = 
          eq.helmet?.id === 'archon_belterra_helmet' &&
          eq.mantle?.id === 'archon_belterra_mantle' &&
          eq.armor?.id === 'archon_belterra_armor' &&
          eq.gloves?.id === 'archon_belterra_gloves' &&
          eq.boots?.id === 'archon_belterra_boots' &&
          eq.weapon?.id === 'archon_belterra_weapon';
          
        const isCoralisSet = 
          eq.helmet?.id === 'archon_coralis_helmet' &&
          eq.mantle?.id === 'archon_coralis_mantle' &&
          eq.armor?.id === 'archon_coralis_armor' &&
          eq.gloves?.id === 'archon_coralis_gloves' &&
          eq.boots?.id === 'archon_coralis_boots' &&
          eq.weapon?.id === 'archon_coralis_weapon';

        const isAcretonSet = 
          eq.helmet?.id === 'archon_acreton_helmet' &&
          eq.mantle?.id === 'archon_acreton_mantle' &&
          eq.armor?.id === 'archon_acreton_armor' &&
          eq.gloves?.id === 'archon_acreton_gloves' &&
          eq.boots?.id === 'archon_acreton_boots' &&
          eq.weapon?.id === 'archon_acreton_weapon';

        if (isBelterraSet && player.race === 'belterra') {
          percentHp += 30
          percentDef += 20
        } else if (isCoralisSet && player.race === 'coralis') {
          percentAtk += 30 // Magic Power mapped to ATK
          percentDef += 20 // Mana Regen mapped to DEF
        } else if (isAcretonSet && player.race === 'acreton') {
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

        let activeTitle = ''
        if (isBelterraSet && player.race === 'belterra') {
          activeTitle = 'Solar Sovereign'
        } else if (isCoralisSet && player.race === 'coralis') {
          activeTitle = 'Astral Emperor'
        } else if (isAcretonSet && player.race === 'acreton') {
          activeTitle = 'Iron Overlord'
        }

        return {
          atk: Math.floor(atk),
          def: Math.floor(def),
          hp: Math.floor(hp),
          title: activeTitle
        }
      },
      equipItem: (uid) => {
        const { player } = get()
        const item = player.inventory.find((i) => i.uid === uid)
        if (!item) return

        if (player.level < (item.level || 0)) {
          alert(`Required level: ${item.level}`)
          return
        }

        if (item.race && item.race !== 'All' && item.race !== player.race) {
          alert(`This item is restricted to the ${item.race.toUpperCase()} race.`)
          return
        }

        if (item.job && item.job !== player.job) {
          alert(`This item is restricted to the ${item.job.toUpperCase()} job.`)
          return
        }

        const slot = (item.type === 'weapon' || item.type === 'armor' || item.type === 'shield' || item.type === 'helmet' || item.type === 'mantle' || item.type === 'gloves' || item.type === 'boots') ? item.type : null
        if (!slot) return

        const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null }
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
        const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null }
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
      useItem: (uid) => {
        const { player, battle, timer } = get()
        const item = player.inventory.find((i) => i.uid === uid)
        if (!item || item.type !== 'consumable') return
        
        const newInventory = player.inventory.filter((i) => i.uid !== uid)

        if (item.id === 'raid_ticket') {
          if (timer.state !== 'running' || timer.mode !== 'fight') {
            alert('You must be in a fighting session to summon a Pit Boss!')
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
            alert(`Used ${item.name}! (Healing not fully implemented in combat loop yet)`)
            set({
                player: { ...player, inventory: newInventory, savedAt: Date.now() }
            })
            return
        }
      },
      getUpgradeCost: (key) => calcUpgradeCost(key, get().player.upgrades[key]),
      loadPlayer: (savedPlayer) => set({ player: { ...initialPlayer, ...savedPlayer } }),
      getExpToNext: () => calcExpToNext(get().player.level),
      defectRace: () => {
        const { player } = get()
        if (player.level < 40 || player.resources.anium < 50000) return
        
        // Copot kabeh equipment
        const eq = player.equipment || { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null }
        let newInv = [...player.inventory]
        if (eq.weapon) newInv.push(eq.weapon)
        if (eq.armor) newInv.push(eq.armor)
        if (eq.shield) newInv.push(eq.shield)
        if (eq.helmet) newInv.push(eq.helmet)
        if (eq.mantle) newInv.push(eq.mantle)
        if (eq.gloves) newInv.push(eq.gloves)
        if (eq.boots) newInv.push(eq.boots)

        set({
          showRaceSelect: true,
          player: {
            ...player,
            race: null,
            job: null,
            inventory: newInv,
            equipment: { weapon: null, armor: null, shield: null, helmet: null, mantle: null, gloves: null, boots: null },
            upgrades: { atk: 0, def: 0, hp: 0 },
            resources: { ...player.resources, anium: player.resources.anium - 50000 },
            savedAt: Date.now()
          }
        })
      },

      // ── Weapon Refining & Combining ───────────────────────
      refineWeapon: () => {
        const { player } = get()
        const weapon = player.equipment?.weapon
        if (!weapon) {
          alert('Anda tidak memiliki senjata yang dilengkapi.')
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
          alert('Senjata Anda sudah mencapai tingkat maksimal (Mythic).')
          return
        }

        const talicCount = player.inventory.filter(it => it.id === 'talic_ignorance').length
        if (talicCount < cost.talics) {
          alert(`Anda membutuhkan ${cost.talics} Ignorance Talic. (Dimiliki: ${talicCount})`)
          return
        }
        if (player.resources.anium < cost.anium) {
          alert(`Anda membutuhkan ${cost.anium} Anium. (Dimiliki: ${player.resources.anium})`)
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

      combineWeapon: (sacrificeUid) => {
        const { player } = get()
        const weapon = player.equipment?.weapon
        if (!weapon) {
          alert('Anda tidak memiliki senjata yang dilengkapi.')
          return
        }
        const isEpicOrHigher = (item) => {
          if (!item) return false
          const r = (item.rarityGrade || item.rarity || '').toLowerCase()
          return ['epic', 'legendary', 'mythic', 'ssr', 'ur'].includes(r)
        }

        if (!isEpicOrHigher(weapon)) {
          alert('Senjata yang dilengkapi harus memiliki tingkat Epic atau lebih tinggi.')
          return
        }
        if (weapon.specialProperty === 'vampire') {
          alert('Senjata ini sudah memiliki properti Vampire.')
          return
        }

        const sacrifice = player.inventory.find(it => it.uid === sacrificeUid)
        if (!sacrifice) {
          alert('Senjata tumbal tidak ditemukan di inventori.')
          return
        }
        if (sacrifice.type !== 'weapon') {
          alert('Item tumbal harus berupa senjata.')
          return
        }
        if (!isEpicOrHigher(sacrifice)) {
          alert('Senjata tumbal harus memiliki tingkat Epic atau lebih tinggi.')
          return
        }

        const talicCount = player.inventory.filter(it => it.id === 'talic_favor').length
        const reqTalics = 5
        const reqAnium = 30000

        if (talicCount < reqTalics) {
          alert(`Anda membutuhkan ${reqTalics} Favor Talic. (Dimiliki: ${talicCount})`)
          return
        }
        if (player.resources.anium < reqAnium) {
          alert(`Anda membutuhkan ${reqAnium} Anium. (Dimiliki: ${player.resources.anium})`)
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

      // ── Archon Forging ───────────────────────────────────
      craftArchonItem: (itemId) => {
        const { player } = get()
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
        const recipe = ARCHON_RECIPES[itemId]
        if (!recipe) {
          alert('Resep tidak valid.')
          return
        }

        const itemTemplate = itemsData.items.find(it => it.id === itemId)
        if (!itemTemplate) {
          alert('Item tidak ditemukan di database.')
          return
        }
        if (itemTemplate.race !== player.race) {
          alert(`Item ini hanya dapat dibuat oleh ras ${itemTemplate.race.toUpperCase()}.`)
          return
        }

        if (player.resources.anium < recipe.anium) {
          alert(`Anda membutuhkan ${recipe.anium} Anium. (Dimiliki: ${player.resources.anium})`)
          return
        }

        const inventoryCounts = {}
        player.inventory.forEach(it => {
          inventoryCounts[it.id] = (inventoryCounts[it.id] || 0) + 1
        })

        for (const [matId, reqAmount] of Object.entries(recipe.materials)) {
          const owned = inventoryCounts[matId] || 0
          if (owned < reqAmount) {
            const matTemplate = itemsData.items.find(it => it.id === matId)
            const matName = matTemplate ? matTemplate.name : matId
            alert(`Anda membutuhkan ${reqAmount}x ${matName}. (Dimiliki: ${owned})`)
            return
          }
        }

        const consumedCounts = {}
        const newInventory = player.inventory.filter(it => {
          const req = recipe.materials[it.id] || 0
          if (req > 0) {
            const consumed = consumedCounts[it.id] || 0
            if (consumed < req) {
              consumedCounts[it.id] = consumed + 1
              return false // consume it
            }
          }
          return true
        })

        const craftedItem = {
          ...itemTemplate,
          uid: Date.now()
        }
        newInventory.push(craftedItem)

        set({
          player: {
            ...player,
            resources: {
              ...player.resources,
              anium: player.resources.anium - recipe.anium
            },
            inventory: newInventory,
            savedAt: Date.now()
          }
        })
      },

    }),
    { name: 'focus-rpg-save' }
  )
)
