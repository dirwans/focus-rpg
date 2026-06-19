import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import races from '../data/races.json'
import enemies from '../data/enemies.json'
import upgradesConfig from '../data/upgrades.json'
import itemsData from '../data/items.json'

function calcUpgradeCost(key, level) {
  const cfg = upgradesConfig[key]
  return Math.floor(cfg.baseCost * Math.pow(cfg.costMultiplier, level))
}

function calcStat(key, upgradeLevel, raceId) {
  const cfg = upgradesConfig[key]
  const race = races[raceId]
  const base = cfg.baseValue + cfg.perLevel * upgradeLevel
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
  return Math.min(Math.ceil(level / 2), enemies.sectors.length)
}

function randomMob(sectorIdx) {
  const sector = enemies.sectors[sectorIdx]
  const mobs = sector.mobs
  return mobs[Math.floor(Math.random() * mobs.length)]
}

function spawnEnemy(sectorIdx, forceBoss = false) {
  const sector = enemies.sectors[sectorIdx]
  const isBoss = forceBoss || Math.random() < 0.08
  const mob = isBoss ? sector.boss : randomMob(sectorIdx)
  return { mob, isBoss, hp: mob.hp }
}

const initialPlayer = {
  name: 'PILOT #1',
  race: null,
  level: 1,
  exp: 0,
  resources: { anium: 200, credits: 10, potions: 5 },
  upgrades: { atk: 0, def: 0, hp: 0 },
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
}

const initialBattle = {
  log: [],
  enemyHp: 0,
  enemyMaxHp: 0,
  currentMob: null,
  isBoss: false,
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
      screen: 'main',
      showRaceSelect: false,

      // ── Navigation ──────────────────────────────────────
      setScreen: (screen) => set({ screen }),

      // ── Race Selection ───────────────────────────────────
      openRaceSelect: () => set({ showRaceSelect: true }),
      selectRace: (raceId) => {
        set((s) => ({
          showRaceSelect: false,
          player: {
            ...s.player,
            race: raceId,
            upgrades: { atk: 0, def: 0, hp: 0 },
            level: 1,
            exp: 0,
            resources: { anium: 200, credits: 10, potions: 5 },
            sector: 1,
            highestSector: 1,
            inventory: [],
          },
        }))
      },

      // ── Timer ────────────────────────────────────────────
      setTimerMinutes: (min) => {
        const { timer } = get()
        if (timer.state !== 'idle') return
        set({ timer: { ...timer, selectedMinutes: min, secondsLeft: min * 60 } })
      },
      setMode: (mode) => {
        const { timer } = get()
        if (timer.state !== 'idle') return
        set({ timer: { ...timer, mode } })
      },

      startTimer: () => {
        const { player, timer } = get()
        if (!player.race) { set({ showRaceSelect: true }); return }
        if (timer.state !== 'idle') return
        const sectorIdx = getSector(player.level) - 1
        const sector = enemies.sectors[sectorIdx]
        const { mob, isBoss, hp } = spawnEnemy(sectorIdx)
        set({
          timer: { ...timer, state: 'running', secondsLeft: timer.selectedMinutes * 60 },
          battle: {
            ...initialBattle,
            log: [isBoss
              ? `⚠️ BOSS DETECTED: ${mob.emoji} ${mob.name}!`
              : `⚔️ Entering ${sector.name}...`],
            enemyHp: hp,
            enemyMaxHp: hp,
            currentMob: mob,
            isBoss,
          },
        })
      },

      stopTimer: () => {
        const { timer, player } = get()
        if (timer.state !== 'running') return
        const elapsed = timer.selectedMinutes * 60 - timer.secondsLeft
        const elapsedMin = Math.floor(elapsed / 60)
        set((s) => ({
          timer: { ...s.timer, state: 'idle', secondsLeft: s.timer.selectedMinutes * 60 },
          player: { ...s.player, totalMinutes: s.player.totalMinutes + elapsedMin },
          battle: { ...initialBattle },
        }))
      },

      tick: () => {
        const { timer } = get()
        if (timer.state !== 'running') return
        const newSecondsLeft = timer.secondsLeft - 1
        if (newSecondsLeft <= 0) {
          get().completeSession()
          return
        }
        if (timer.mode === 'fight') get()._combatTick()
        else get()._gatherTick()
        set((s) => ({ timer: { ...s.timer, secondsLeft: newSecondsLeft } }))
      },

      _combatTick: () => {
        const { player, battle } = get()
        if (!battle.currentMob) return

        const race = races[player.race]
        const playerAtk = calcStat('atk', player.upgrades.atk, player.race)
        const mob = battle.currentMob

        // Crit: 12% base, Human bonus +3%
        const critChance = player.race === 'human' ? 0.15 : 0.12
        const isCrit = Math.random() < critChance
        const variance = 0.8 + Math.random() * 0.4
        const rawDmg = Math.max(1, playerAtk - mob.def + Math.floor(Math.random() * 8))
        const dmgToEnemy = Math.floor(rawDmg * variance * (isCrit ? 1.8 : 1))

        let newEnemyHp = battle.enemyHp - dmgToEnemy
        let newKills = battle.kills
        let newStreak = battle.killStreak
        let newExp = battle.sessionExp
        let newAnium = battle.sessionAnium
        let newLog = [...battle.log]
        let nextMob = mob
        let nextIsBoss = battle.isBoss
        let nextMaxHp = battle.enemyMaxHp

        if (newEnemyHp <= 0) {
          newKills += 1
          newStreak += 1

          // Streak bonus: +10% per kill streak, max 2x
          const streakMult = Math.min(1 + newStreak * 0.1, 2.0)
          const expGain = Math.floor(mob.expReward * race.bonuses.expMultiplier * streakMult * (battle.isBoss ? 3 : 1))
          const aniumGain = Math.floor(mob.aniumReward * (0.8 + Math.random() * 0.4) * streakMult * (battle.isBoss ? 3 : 1))
          newExp += expGain
          newAnium += aniumGain

          if (newLog.length > 7) newLog = newLog.slice(-7)

          if (battle.isBoss) {
            newLog.push(`🏆 BOSS SLAIN! ${mob.emoji} +${expGain}EXP +${aniumGain}⬡`)
          } else if (isCrit) {
            newLog.push(`💥 CRIT! ${mob.emoji} ${mob.name} [x${newStreak > 1 ? newStreak + ' STREAK' : ''}] +${expGain}EXP`)
          } else {
            newLog.push(`⚔️ Killed ${mob.emoji} ${newStreak > 2 ? `[${newStreak}x🔥]` : ''} +${expGain}EXP +${aniumGain}⬡`)
          }

          // Spawn next enemy
          const sectorIdx = getSector(player.level) - 1
          const next = spawnEnemy(sectorIdx)
          nextMob = next.mob
          nextIsBoss = next.isBoss
          nextMaxHp = next.hp
          newEnemyHp = next.hp

          if (next.isBoss) newLog.push(`⚠️ BOSS INCOMING: ${next.mob.emoji} ${next.mob.name}!`)
        } else if (isCrit) {
          if (newLog.length > 7) newLog = newLog.slice(-7)
          newLog.push(`✨ CRIT! -${dmgToEnemy} to ${mob.emoji}`)
        }

        set({
          battle: {
            ...battle,
            enemyHp: newEnemyHp,
            enemyMaxHp: nextMaxHp,
            currentMob: nextMob,
            isBoss: nextIsBoss,
            kills: newKills,
            killStreak: newStreak,
            sessionExp: newExp,
            sessionAnium: newAnium,
            log: newLog,
          }
        })
      },

      _gatherTick: () => {
        const { player, battle } = get()
        const race = races[player.race]
        if (Math.random() > 0.82) {
          const base = Math.floor(2 + Math.random() * 5)
          const aniumGain = Math.floor(base * race.bonuses.gatherMultiplier)
          const expGain = Math.floor(1 * race.bonuses.expMultiplier)
          let newLog = [...battle.log]
          if (newLog.length > 7) newLog = newLog.slice(-7)
          newLog.push(`⛏️ Gathered +${aniumGain}⬡ +${expGain}EXP`)
          set({ battle: { ...battle, sessionAnium: battle.sessionAnium + aniumGain, sessionExp: battle.sessionExp + expGain, log: newLog } })
        }
      },

      completeSession: () => {
        const { player, timer, battle } = get()
        const today = new Date().toDateString()
        const isNewDay = player.lastSessionDate !== today
        const newStreak = isNewDay ? player.streak + 1 : player.streak

        let newExp = player.exp + battle.sessionExp
        let newLevel = player.level
        let expToNext = calcExpToNext(newLevel)
        let levelUps = 0

        while (newExp >= expToNext) {
          newExp -= expToNext
          newLevel += 1
          levelUps += 1
          expToNext = calcExpToNext(newLevel)
        }

        const newSector = getSector(newLevel)

        // Item drop: boss = 60%, fight = 25%, gather = 10%
        const dropRate = battle.isBoss ? 0.6 : timer.mode === 'fight' ? 0.25 : 0.1
        const newInventory = [...player.inventory]
        if (Math.random() < dropRate) {
          const drops = itemsData.items.filter(i => i.type !== 'consumable')
          const drop = drops[Math.floor(Math.random() * drops.length)]
          newInventory.push({ ...drop, uid: Date.now() })
        }

        const finalLog = [...battle.log]
        if (levelUps > 0) finalLog.push(`🆙 LEVEL UP! LV.${newLevel} — Sector ${newSector} unlocked!`)
        finalLog.push(`✅ Done! ${battle.kills} kills | +${battle.sessionAnium}⬡ | +${battle.sessionExp}EXP`)

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
              anium: s.player.resources.anium + battle.sessionAnium,
            },
            streak: newStreak,
            lastSessionDate: today,
            totalSessions: s.player.totalSessions + 1,
            totalMinutes: s.player.totalMinutes + timer.selectedMinutes,
            inventory: newInventory,
            savedAt: Date.now(),
          },
          battle: { ...battle, levelUps, log: finalLog },
        }))
      },

      resetTimer: () => {
        const { timer } = get()
        set({ timer: { ...timer, state: 'idle', secondsLeft: timer.selectedMinutes * 60 }, battle: initialBattle })
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

      // ── Helpers ──────────────────────────────────────────
      getStats: () => {
        const { player } = get()
        if (!player.race) return { atk: 0, def: 0, hp: 0 }
        return {
          atk: calcStat('atk', player.upgrades.atk, player.race),
          def: calcStat('def', player.upgrades.def, player.race),
          hp:  calcStat('hp',  player.upgrades.hp,  player.race),
        }
      },
      getUpgradeCost: (key) => calcUpgradeCost(key, get().player.upgrades[key]),
      loadPlayer: (savedPlayer) => set({ player: { ...initialPlayer, ...savedPlayer } }),
      getExpToNext: () => calcExpToNext(get().player.level),
    }),
    { name: 'focus-rpg-save' }
  )
)
