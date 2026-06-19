import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import races from '../data/races.json'
import enemies from '../data/enemies.json'
import upgradesConfig from '../data/upgrades.json'
import itemsData from '../data/items.json'

const TIMER_OPTIONS = [10, 25, 60]

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
  return Math.min(level, enemies.sectors.length)
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
  kills: 0,
  sessionExp: 0,
  sessionAnium: 0,
}

export const useGameStore = create(
  persist(
    (set, get) => ({
      player: initialPlayer,
      timer: initialTimer,
      battle: initialBattle,
      screen: 'main',   // main | unit | ranks | forge | cargo
      showRaceSelect: false,

      // ── Navigation ──────────────────────────────────────
      setScreen: (screen) => set({ screen }),

      // ── Race Selection ───────────────────────────────────
      openRaceSelect: () => set({ showRaceSelect: true }),
      selectRace: (raceId) => {
        const race = races[raceId]
        set((s) => ({
          showRaceSelect: false,
          player: {
            ...s.player,
            race: raceId,
            name: s.player.name,
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
        const enemy = enemies.sectors[getSector(player.level) - 1]
        set({
          timer: { ...timer, state: 'running', secondsLeft: timer.selectedMinutes * 60 },
          battle: {
            log: [`⚔️ Entering ${enemy.name}...`],
            enemyHp: enemy.hp,
            enemyMaxHp: enemy.hp,
            kills: 0,
            sessionExp: 0,
            sessionAnium: 0,
          },
        })
      },

      stopTimer: () => {
        const { timer, battle, player } = get()
        if (timer.state !== 'running') return
        const elapsed = timer.selectedMinutes * 60 - timer.secondsLeft
        const elapsedMin = Math.floor(elapsed / 60)
        set((s) => ({
          timer: { ...s.timer, state: 'idle', secondsLeft: s.timer.selectedMinutes * 60 },
          player: {
            ...s.player,
            totalMinutes: s.player.totalMinutes + elapsedMin,
          },
          battle: { ...initialBattle },
        }))
      },

      // called every second by useTimer hook
      tick: () => {
        const { timer, battle, player } = get()
        if (timer.state !== 'running') return

        const newSecondsLeft = timer.secondsLeft - 1

        if (newSecondsLeft <= 0) {
          get().completeSession()
          return
        }

        if (timer.mode === 'fight') {
          get()._combatTick()
        } else {
          get()._gatherTick()
        }

        set((s) => ({ timer: { ...s.timer, secondsLeft: newSecondsLeft } }))
      },

      _combatTick: () => {
        const { player, battle } = get()
        const race = races[player.race]
        const playerAtk = calcStat('atk', player.upgrades.atk, player.race)
        const playerDef = calcStat('def', player.upgrades.def, player.race)
        const sectorIdx = getSector(player.level) - 1
        const enemy = enemies.sectors[sectorIdx]

        const dmgToEnemy = Math.max(1, playerAtk - enemy.def + Math.floor(Math.random() * 5))
        const dmgToPlayer = 0  // idle — player doesn't die, just tracks kills

        let newEnemyHp = battle.enemyHp - dmgToEnemy
        let newKills = battle.kills
        let newExp = battle.sessionExp
        let newAnium = battle.sessionAnium
        let newLog = [...battle.log]

        if (newEnemyHp <= 0) {
          newKills += 1
          const expGain = Math.floor(enemy.expReward * race.bonuses.expMultiplier)
          const aniumGain = Math.floor(enemy.aniumReward * (0.8 + Math.random() * 0.4))
          newExp += expGain
          newAnium += aniumGain
          newEnemyHp = enemy.hp
          if (newLog.length > 6) newLog = newLog.slice(-6)
          newLog.push(`💥 Killed ${enemy.emoji} +${expGain}EXP +${aniumGain}⬡`)
        }

        set({ battle: { ...battle, enemyHp: newEnemyHp, kills: newKills, sessionExp: newExp, sessionAnium: newAnium, log: newLog } })
      },

      _gatherTick: () => {
        const { player, battle } = get()
        const race = races[player.race]
        if (Math.random() > 0.85) {
          const base = Math.floor(2 + Math.random() * 4)
          const aniumGain = Math.floor(base * race.bonuses.gatherMultiplier)
          const expGain = Math.floor(1 * race.bonuses.expMultiplier)
          let newLog = [...battle.log]
          if (newLog.length > 6) newLog = newLog.slice(-6)
          newLog.push(`⛏️ Gathered +${aniumGain}⬡`)
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

        while (newExp >= expToNext) {
          newExp -= expToNext
          newLevel += 1
          expToNext = calcExpToNext(newLevel)
        }

        const newSector = getSector(newLevel)

        // random item drop
        const newInventory = [...player.inventory]
        if (timer.mode === 'fight' && Math.random() < 0.3) {
          const drops = itemsData.items.filter(i => i.type !== 'consumable')
          const drop = drops[Math.floor(Math.random() * drops.length)]
          newInventory.push({ ...drop, uid: Date.now() })
        }

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
          },
          battle: { ...battle, log: [...battle.log, `✅ Session complete! +${battle.sessionAnium}⬡ +${battle.sessionExp}EXP`] },
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
          },
        }))
      },

      // ── Helpers (exposed for UI) ─────────────────────────
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
