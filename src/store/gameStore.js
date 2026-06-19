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

// Frac 0..1 deterministik dari seed integer (buat item drop yg sama di semua device)
function seededFrac(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
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
  const avgHp = avg((m) => m.hp)
  const avgDef = avg((m) => m.def)
  const avgExp = avg((m) => m.expReward)
  const avgAni = avg((m) => m.aniumReward)
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
  level: 1,
  exp: 0,
  resources: { anium: 200, credits: 10, potions: 5 },
  upgrades: { atk: 0, def: 0, hp: 0 },
  equipment: { weapon: null, armor: null, shield: null },
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
            equipment: { weapon: null, armor: null, shield: null },
            savedAt: Date.now(),
          },
        }))
      },

      // ── Timer ────────────────────────────────────────────
      setTimerMinutes: (min) => {
        const { timer } = get()
        if (timer.state !== 'idle') return
        set({ timer: { ...timer, selectedMinutes: min, secondsLeft: min * 60 }, player: { ...get().player, savedAt: Date.now() } })
      },
      setMode: (mode) => {
        const { timer } = get()
        if (timer.state !== 'idle') return
        set({ timer: { ...timer, mode }, player: { ...get().player, savedAt: Date.now() } })
      },

      startTimer: () => {
        const { player, timer } = get()
        if (!player.race) { set({ showRaceSelect: true }); return }
        if (timer.state !== 'idle') return
        const now = Date.now()
        const sectorIdx = getSector(player.level) - 1
        const sector = enemies.sectors[sectorIdx]
        const { mob, isBoss, hp } = spawnEnemy(sectorIdx)
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
            log: [isBoss ? `⚠️ BOSS: ${mob.emoji} ${mob.name}!` : `⚔️ Entering ${sector.name}...`],
            enemyHp: hp,
            enemyMaxHp: hp,
            currentMob: mob,
            isBoss,
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
        const { timer, player } = get()
        if (timer.state !== 'running') return
        const remaining = Math.max(0, Math.ceil((timer.endsAt - Date.now()) / 1000))
        if (remaining <= 0) { get().completeSession(); return }
        // visual combat (cosmetic, lokal)
        if (timer.mode === 'fight') get()._combatTick()
        else get()._gatherTick()
        // reward DETERMINISTIK (sama di semua device) — override angka cosmetic
        const total = timer.selectedMinutes * 60
        const r = computeRewards(player, timer.mode, (total - remaining) / 60)
        set((s) => ({
          timer: { ...s.timer, secondsLeft: remaining },
          battle: { ...s.battle, kills: r.kills, sessionExp: r.exp, sessionAnium: r.anium },
        }))
      },

      _combatTick: () => {
        const { player, battle } = get()
        if (!battle.currentMob) {
          // device yg nerima session via sync belum punya mob → spawn cosmetic
          const sectorIdx = getSector(player.level) - 1
          const { mob, isBoss, hp } = spawnEnemy(sectorIdx)
          set({ battle: { ...battle, currentMob: mob, isBoss, enemyHp: hp, enemyMaxHp: hp } })
          return
        }
        const playerAtk = calcStat('atk', player.upgrades.atk, player.race)
        const mob = battle.currentMob
        const isCrit = Math.random() < (player.race === 'cora' ? 0.15 : 0.12)
        const variance = 0.8 + Math.random() * 0.4
        const rawDmg = Math.max(1, playerAtk - mob.def + Math.floor(Math.random() * 8))
        const dmgToEnemy = Math.floor(rawDmg * variance * (isCrit ? 1.8 : 1))
        let newEnemyHp = battle.enemyHp - dmgToEnemy
        let newLog = [...battle.log]
        let nextMob = mob, nextIsBoss = battle.isBoss, nextMaxHp = battle.enemyMaxHp

        if (newEnemyHp <= 0) {
          if (newLog.length > 7) newLog = newLog.slice(-7)
          newLog.push(battle.isBoss ? `🏆 BOSS SLAIN! ${mob.emoji}` : `⚔️ Killed ${mob.emoji} ${mob.name}`)
          const sectorIdx = getSector(player.level) - 1
          const next = spawnEnemy(sectorIdx)
          nextMob = next.mob; nextIsBoss = next.isBoss; nextMaxHp = next.hp; newEnemyHp = next.hp
          if (next.isBoss) newLog.push(`⚠️ BOSS INCOMING: ${next.mob.emoji} ${next.mob.name}!`)
        } else if (isCrit) {
          if (newLog.length > 7) newLog = newLog.slice(-7)
          newLog.push(`💥 CRIT! -${dmgToEnemy} ${mob.emoji}`)
        }
        set({ battle: { ...battle, enemyHp: newEnemyHp, enemyMaxHp: nextMaxHp, currentMob: nextMob, isBoss: nextIsBoss, log: newLog } })
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
        const { player, timer } = get()
        if (timer.state !== 'running') return // hindari double-complete (sudah completed via sync)

        const r = computeRewards(player, timer.mode, timer.selectedMinutes)
        const today = new Date().toDateString()
        const isNewDay = player.lastSessionDate !== today
        const newStreak = isNewDay ? player.streak + 1 : player.streak

        let newExp = player.exp + r.exp
        let newLevel = player.level
        let expToNext = calcExpToNext(newLevel)
        let levelUps = 0
        while (newExp >= expToNext) {
          newExp -= expToNext; newLevel += 1; levelUps += 1; expToNext = calcExpToNext(newLevel)
        }
        const newSector = getSector(newLevel)

        // Item drop deterministik (seed dari startedAt → sama di semua device)
        const dropRate = timer.mode === 'fight' ? 0.25 : 0.1
        const newInventory = [...player.inventory]
        if (seededFrac(timer.startedAt) < dropRate) {
          const drops = itemsData.items.filter((i) => i.type !== 'consumable')
          const drop = drops[Math.floor(seededFrac(timer.startedAt + 1) * drops.length)]
          if (drop) newInventory.push({ ...drop, uid: timer.startedAt })
        }

        const finalLog = []
        if (levelUps > 0) finalLog.push(`🆙 LEVEL UP! LV.${newLevel} — Sector ${newSector}!`)
        finalLog.push(`✅ Done! ${r.kills} kills | +${r.anium}⬡ | +${r.exp}EXP`)

        set((s) => ({
          timer: { ...s.timer, state: 'completed', secondsLeft: 0 },
          player: {
            ...s.player,
            exp: newExp,
            level: newLevel,
            sector: newSector,
            highestSector: Math.max(s.player.highestSector, newSector),
            resources: { ...s.player.resources, anium: s.player.resources.anium + r.anium },
            streak: newStreak,
            lastSessionDate: today,
            totalSessions: s.player.totalSessions + 1,
            totalMinutes: s.player.totalMinutes + timer.selectedMinutes,
            inventory: newInventory,
            savedAt: Date.now(),
          },
          battle: { ...s.battle, kills: r.kills, sessionExp: r.exp, sessionAnium: r.anium, levelUps, log: finalLog },
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
          if (next.player.race && !races[next.player.race]) {
            next.player.race = null
            next.player.upgrades = { atk: 0, def: 0, hp: 0 }
            next.player.equipment = { weapon: null, armor: null, shield: null }
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
        const { player } = get()
        if (!player.race) return { atk: 0, def: 0, hp: 0 }
        const eq = player.equipment || { weapon: null, armor: null, shield: null }
        return {
          atk: calcStat('atk', player.upgrades.atk, player.race) + (eq.weapon?.bonus?.atk || 0),
          def: calcStat('def', player.upgrades.def, player.race) + (eq.armor?.bonus?.def || 0) + (eq.shield?.bonus?.def || 0),
          hp:  calcStat('hp',  player.upgrades.hp,  player.race) + (eq.weapon?.bonus?.hp || 0) + (eq.armor?.bonus?.hp || 0) + (eq.shield?.bonus?.hp || 0),
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

        const slot = item.type === 'weapon' ? 'weapon' : item.type === 'armor' ? 'armor' : item.type === 'shield' ? 'shield' : null
        if (!slot) return

        const eq = player.equipment || { weapon: null, armor: null, shield: null }
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
        const eq = player.equipment || { weapon: null, armor: null, shield: null }
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
      getUpgradeCost: (key) => calcUpgradeCost(key, get().player.upgrades[key]),
      loadPlayer: (savedPlayer) => set({ player: { ...initialPlayer, ...savedPlayer } }),
      getExpToNext: () => calcExpToNext(get().player.level),
    }),
    { name: 'focus-rpg-save' }
  )
)
