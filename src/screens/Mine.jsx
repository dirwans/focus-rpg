import { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import itemsData from '../data/items.json'
import enemiesData from '../data/enemies.json'

import spriteF1 from '../assets/1F-SentryDementor_rembg.png'
import spriteF2 from '../assets/2F-BorgDementor_rembg.png'
import spriteF3 from '../assets/3F-MutationDementor_rembg.png'
import spriteF4 from '../assets/4F-OrcDementor_rembg.png'
import spriteF5 from '../assets/5F-GhostDementor_rembg.png'
import spriteF6 from '../assets/6F-Kaelgorath_rembg.png'

import miningToolArctron  from '../assets/mining_tool_arctron_rembg.png'
import miningToolBionex   from '../assets/mining_tool_bionex_rembg.png'
import miningToolCelestra from '../assets/mining_tool_celestra_rembg.png'

const MINING_TOOLS = {
  arctron:  miningToolArctron,
  bionex:   miningToolBionex,
  celestra: miningToolCelestra,
}

import shardIgnis from '../assets/ignis_shard.png'
import shardVirel from '../assets/virel_shard.png'
import shardKryos from '../assets/kryos_shard.png'
import shardZephra from '../assets/zephra_shard.png'
import shardUmbrix from '../assets/umbrix_shard.png'

import oreIgnis from '../assets/ignis_ore.png'
import oreVirel from '../assets/virel_ore.png'
import oreKryos from '../assets/kryos_ore.png'
import oreZephra from '../assets/zephra_ore.png'
import oreUmbrix from '../assets/umbrix_ore.png'

const ORE_TYPES = [
  { key: 'ignis',  name: 'Ignis',  color: '#ff4444', emoji: '🟥', shardEmoji: '🔴', shardSprite: shardIgnis, oreSprite: oreIgnis },
  { key: 'virel',  name: 'Virel',  color: '#4488ff', emoji: '🟦', shardEmoji: '🔵', shardSprite: shardVirel, oreSprite: oreVirel },
  { key: 'kryos',  name: 'Kryos',  color: '#44ff88', emoji: '🟩', shardEmoji: '🟢', shardSprite: shardKryos, oreSprite: oreKryos },
  { key: 'zephra', name: 'Zephra', color: '#ffcc00', emoji: '🟨', shardEmoji: '🟡', shardSprite: shardZephra, oreSprite: oreZephra },
  { key: 'umbrix', name: 'Umbrix', color: '#888888', emoji: '⬛', shardEmoji: '⚫', shardSprite: shardUmbrix, oreSprite: oreUmbrix },
]

const MINE_FLOORS = [
  {
    floor: '1F',
    name: 'Sentry Dementor',
    duration: 10,
    durationLabel: '10 MENIT',
    yieldLabel: '1–3 Ore',
    baseRates: { common: 100, rare: 0, epic: 0 },
    sprite: spriteF1,
    boss: false,
  },
  {
    floor: '2F',
    name: 'Borg Dementor',
    duration: 30,
    durationLabel: '30 MENIT',
    yieldLabel: '3–5 Ore',
    baseRates: { common: 80, rare: 20, epic: 0 },
    sprite: spriteF2,
    boss: false,
  },
  {
    floor: '3F',
    name: 'Mutation Dementor',
    duration: 60,
    durationLabel: '1 JAM',
    yieldLabel: '5–8 Ore',
    baseRates: { common: 60, rare: 35, epic: 5 },
    sprite: spriteF3,
    boss: false,
  },
  {
    floor: '4F',
    name: 'Ork Dementor',
    duration: 120,
    durationLabel: '2 JAM',
    yieldLabel: '8–12 Ore',
    baseRates: { common: 45, rare: 45, epic: 10 },
    sprite: spriteF4,
    boss: false,
  },
  {
    floor: '5F',
    name: 'Ghost Dementor',
    duration: 240,
    durationLabel: '4 JAM',
    yieldLabel: '12–18 Ore',
    baseRates: { common: 30, rare: 50, epic: 20 },
    sprite: spriteF5,
    boss: false,
  },
  {
    floor: '6F',
    name: 'KAELGORATH',
    duration: 480,
    durationLabel: '8 JAM',
    yieldLabel: '20–30 Ore',
    baseRates: { common: 15, rare: 35, epic: 50 },
    sprite: spriteF6,
    boss: true,
  },
]

function computeRates(baseRates, rankBonus, rankNumber) {
  const epicBonus = rankNumber === 1 ? 1 : 0
  return {
    common: Math.max(0, baseRates.common - rankBonus),
    rare: Math.max(0, baseRates.rare + rankBonus - epicBonus),
    epic: baseRates.epic + epicBonus,
  }
}

export default function Mine() {
  const player        = useGameStore((s) => s.player)
  const winnerRace    = useGameStore((s) => s.winnerRace)
  const runnerUpRace  = useGameStore((s) => s.runnerUpRace)
  const lastPlaceRace = useGameStore((s) => s.lastPlaceRace)

  const startMining        = useGameStore((s) => s.startMining)
  const cancelMining       = useGameStore((s) => s.cancelMining)
  const claimMiningRewards = useGameStore((s) => s.claimMiningRewards)
  const processOreToShard  = useGameStore((s) => s.processOreToShard)

  const [activeTab,    setActiveTab]    = useState('mine')
  const [processGrade, setProcessGrade] = useState('common')

  const miningTimer = player?.miningTimer || { state: 'idle', startedAt: 0, endsAt: 0, duration: 0 }
  const [secondsLeft, setSecondsLeft] = useState(0)

  const [encounterState, setEncounterState] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(MINE_FLOORS[0])

  useEffect(() => {
    if (miningTimer.state === 'running') {
      const update = () => setSecondsLeft(Math.max(0, Math.floor((miningTimer.endsAt - Date.now()) / 1000)))
      update()
      const id = setInterval(update, 1000)
      return () => clearInterval(id)
    } else {
      setSecondsLeft(0)
    }
  }, [miningTimer.state, miningTimer.endsAt])

  const rankings     = [winnerRace, runnerUpRace, lastPlaceRace]
  const playerRankIdx = rankings.indexOf(player?.race)
  const rankNumber   = playerRankIdx !== -1 ? playerRankIdx + 1 : 3
  const rankBonus    = rankNumber === 1 ? 5 : rankNumber === 2 ? 3 : 0

  const getRaceName = (r) => r === 'arctron' ? '🤖 Arctron' : r === 'bionex' ? '⚙️ Bionex' : r === 'celestra' ? '🌿 Celestra' : '—'

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  }

  const countInventoryItem = (id) => player?.inventory?.filter(it => it.id === id).length ?? 0

  const activeMiningFloor = MINE_FLOORS.find(f => f.duration === miningTimer.duration)

  const handleStartMining = (floorData) => {
    const isBoss = floorData.floor === '6F'
    const encounterChance = isBoss ? 1.0 : 0.25
    if (Math.random() <= encounterChance) {
      const floorNum = parseInt(floorData.floor.replace('F', ''))
      const guardian = enemiesData.miningGuardians.find(g => g.floor === floorNum)
      if (guardian) {
        const stats = useGameStore.getState().getStats()
        
        // INSTANT CALCULATION
        const pDps = Math.max(1, stats.atk - guardian.def)
        const eDps = Math.max(1, guardian.atk - stats.def)
        
        const ttkPlayer = Math.ceil(guardian.hp / pDps)
        const ttkEnemy = Math.ceil(stats.hp / eDps)
        
        // Survive if player kills enemy first OR enemy takes longer than timer duration to kill player
        const isWin = ttkPlayer <= ttkEnemy || ttkEnemy > (floorData.duration * 60)
        
        const pRemHp = isWin ? Math.max(1, stats.hp - (eDps * ttkPlayer)) : 0
        const eRemHp = isWin ? 0 : Math.max(1, guardian.hp - (pDps * ttkEnemy))

        setEncounterState({
          active: true,
          floorData,
          guardian,
          stats,
          result: 'simulating',
          isWin,
          pRemHpPct: (pRemHp / stats.hp) * 100,
          eRemHpPct: (eRemHp / guardian.hp) * 100
        })
        
        // Trigger result after 2.5 seconds
        setTimeout(() => {
          setEncounterState(prev => prev ? {
            ...prev,
            result: prev.isWin ? 'win' : 'lose'
          } : null)
        }, 2500)
        
        return
      }
    }
    startMining(floorData.duration)
  }

  return (
    <div style={s.screen} className="no-scrollbar">

      {/* ── BATTLE OVERLAY ── */}
      {encounterState && encounterState.active && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel cyber-panel" style={{ width: '100%', maxWidth: 400, padding: 20, textAlign: 'center', border: `1px solid ${encounterState.result === 'win' ? '#00ff88' : encounterState.result === 'lose' ? '#ff3366' : '#ffaa00'}`, transition: 'border 0.3s' }}>
            <h2 style={{ color: '#ffaa00', textShadow: '0 0 10px #ffaa00', margin: '0 0 15px', fontFamily: "'Orbitron', sans-serif" }}>⚠️ GUARDIAN ENCOUNTER!</h2>
            <p style={{ color: '#c7ccd6', fontSize: 14, marginBottom: 20 }}>{encounterState.guardian.name} muncul menghadang proses penambangan di lantai {encounterState.floorData.floor}!</p>
            
            {/* Guardian Bar */}
            <div style={{ marginBottom: 15, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#ff3366', fontWeight: 'bold' }}>
                <span>{encounterState.guardian.name}</span>
                <span>{encounterState.result === 'simulating' ? '???' : (encounterState.eRemHpPct === 0 ? '0' : 'Alive')} HP</span>
              </div>
              <div style={{ width: '100%', height: 12, backgroundColor: '#331111', borderRadius: 6, overflow: 'hidden', marginTop: 4 }}>
                <div style={{ width: encounterState.result === 'simulating' ? '100%' : `${encounterState.eRemHpPct}%`, height: '100%', backgroundColor: '#ff3366', transition: 'width 2s ease-out' }} />
              </div>
            </div>

            <div style={{ fontSize: 24, margin: '10px 0' }}>⚡ VS ⚡</div>

            {/* Player Bar */}
            <div style={{ marginBottom: 25, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#00e5ff', fontWeight: 'bold' }}>
                <span>Pilot (ATK: {encounterState.stats.atk})</span>
                <span>{encounterState.result === 'simulating' ? '???' : (encounterState.pRemHpPct === 0 ? '0' : 'Alive')} HP</span>
              </div>
              <div style={{ width: '100%', height: 12, backgroundColor: '#0a1a2a', borderRadius: 6, overflow: 'hidden', marginTop: 4 }}>
                <div style={{ width: encounterState.result === 'simulating' ? '100%' : `${encounterState.pRemHpPct}%`, height: '100%', backgroundColor: '#00e5ff', transition: 'width 2s ease-out' }} />
              </div>
            </div>

            {/* Result Message */}
            {encounterState.result === 'simulating' && (
              <div style={{ color: '#ffaa00', fontSize: 14, animation: 'ledBlink 1s infinite' }}>Menghitung simulasi pertarungan...</div>
            )}
            {encounterState.result === 'win' && (
              <div style={{ color: '#00ff88', fontSize: 15, fontWeight: 'bold', textShadow: '0 0 8px #00ff88' }}>🏆 VICTORY! Guardian dikalahkan!</div>
            )}
            {encounterState.result === 'lose' && (
              <div style={{ color: '#ff3366', fontSize: 15, fontWeight: 'bold', textShadow: '0 0 8px #ff3366' }}>☠️ DEFEAT! Anda gagal bertahan hidup!</div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: 20 }}>
              {encounterState.result === 'win' && (
                <button 
                  style={{ ...s.mulaiBtn, width: '100%' }} 
                  onClick={() => {
                    setEncounterState(null)
                    startMining(encounterState.floorData.duration)
                  }}
                >
                  MULAI PENAMBANGAN
                </button>
              )}
              {encounterState.result === 'lose' && (
                <button 
                  style={{ ...s.mulaiBtn, width: '100%', backgroundColor: '#551111', color: '#ffaaaa', border: '1px solid #ff3366' }} 
                  onClick={() => setEncounterState(null)}
                >
                  KEMBALI
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={s.header}>
        <button onClick={() => useGameStore.getState().setScreen('main')} style={s.backBtn}>❮</button>
        <span style={s.headerTitle}>⛏ TRINITY MINE STATION</span>
        {MINING_TOOLS[player?.race] && (
          <img
            src={MINING_TOOLS[player.race]}
            alt="mining tool"
            style={{ width: 36, height: 36, objectFit: 'contain', marginLeft: 'auto', filter: 'drop-shadow(0 0 6px rgba(0,229,255,0.6))' }}
          />
        )}
      </div>

      {/* ── Main Tabs ── */}
      <div style={s.tabsRow}>
        <button style={activeTab === 'mine'    ? s.tabActive : s.tab} onClick={() => setActiveTab('mine')}>CORE MINE</button>
        <button style={activeTab === 'process' ? s.tabActive : s.tab} onClick={() => setActiveTab('process')}>ORE PROCESSING</button>
      </div>

      {/* ════════════════════════════════════════════════════════
          TAB 1 — CORE MINE
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'mine' && (
        <div style={s.col}>

          {/* Faction Rank Bonuses */}
          <div className="glass-panel cyber-panel" style={s.card}>
            <div style={s.cardHeader}>🏆 BONUS CORE WAR</div>
            <div style={s.rankList}>
              {[
                { label: '🥇 Peringkat 1', race: winnerRace,    rank: 1, bonus: '+5% Grade Drop Rate', bonusColor: '#00ff88' },
                { label: '🥈 Peringkat 2', race: runnerUpRace,  rank: 2, bonus: '+3% Grade Drop Rate', bonusColor: '#00e5ff' },
                { label: '🥉 Peringkat 3', race: lastPlaceRace, rank: 3, bonus: 'Tidak ada bonus',     bonusColor: '#666' },
              ].map(({ label, race, rank, bonus, bonusColor }) => (
                <div key={rank} style={{ ...s.rankRow, ...(rankNumber === rank ? s.rankRowActive : {}) }}>
                  <span style={s.rankText}>{label}: {getRaceName(race)}</span>
                  <span style={{ ...s.rankBonus, color: bonusColor }}>{bonus}</span>
                </div>
              ))}
            </div>
            <div style={s.badgeBanner}>
              Bangsa Anda:&nbsp;<strong style={{ color: '#00e5ff' }}>{getRaceName(player?.race)}</strong>
              &nbsp;(Peringkat {rankNumber} ➔&nbsp;
              <span style={{ color: '#00ff88' }}>+{rankBonus}% Grade Bonus</span>)
            </div>
          </div>

          {/* Mining Panel */}
          <div className="glass-panel cyber-panel" style={s.card}>
            <div style={s.cardHeader}>⛏ STATUS PENAMBANGAN</div>

            {/* IDLE — Tactical Map Floor Selector */}
            {miningTimer.state === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* ── TACTICAL MAP AREA ── */}
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: 250, 
                  background: 'radial-gradient(circle at 50% 50%, #150f2b 0%, #06040e 90%)', 
                  border: '2px solid #ffd700', 
                  borderRadius: 12, 
                  overflow: 'hidden',
                  boxShadow: '0 0 15px rgba(255, 215, 0, 0.15), inset 0 0 20px rgba(168, 85, 247, 0.2)'
                }}>
                  {/* Grid Lines */}
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.08) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    pointerEvents: 'none'
                  }} />

                  {/* Blueprint circular sonar effect */}
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: 200, height: 200,
                    transform: 'translate(-50%, -50%)',
                    border: '1px dashed rgba(168, 85, 247, 0.25)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: 100, height: 100,
                    transform: 'translate(-50%, -50%)',
                    border: '1px dashed rgba(168, 85, 247, 0.15)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }} />

                  {/* SVG Paths representing mining tunnels */}
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Path 1: 1F -> 2F -> 4F -> 6F */}
                    <path d="M 25 25 L 70 20 L 75 50 L 70 80" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.6" />
                    {/* Path 2: 1F -> 3F -> 5F -> 6F */}
                    <path d="M 25 25 L 35 55 L 25 80 L 70 80" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 2" fill="none" opacity="0.6" />
                    {/* Cross-tunnel: 2F -> 3F */}
                    <path d="M 70 20 L 35 55" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.4" />
                  </svg>

                  {/* MAP NODES */}
                  {[
                    { floor: '1F', left: '25%', top: '25%', xOffset: -12, yOffset: -12 },
                    { floor: '2F', left: '70%', top: '20%', xOffset: -12, yOffset: -12 },
                    { floor: '3F', left: '35%', top: '55%', xOffset: -12, yOffset: -12 },
                    { floor: '4F', left: '75%', top: '50%', xOffset: -12, yOffset: -12 },
                    { floor: '5F', left: '25%', top: '80%', xOffset: -12, yOffset: -12 },
                    { floor: '6F', left: '70%', top: '80%', xOffset: -15, yOffset: -15, isBoss: true }
                  ].map((node) => {
                    const isSelected = selectedFloor.floor === node.floor
                    const fData = MINE_FLOORS.find(f => f.floor === node.floor)
                    const size = node.isBoss ? 30 : 24
                    
                    return (
                      <div 
                        key={node.floor}
                        onClick={() => setSelectedFloor(fData)}
                        style={{
                          position: 'absolute',
                          left: node.left,
                          top: node.top,
                          transform: 'translate(-50%, -50%)',
                          width: size,
                          height: size,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: node.isBoss ? 11 : 12,
                          fontWeight: 'bold',
                          fontFamily: "'Orbitron', sans-serif",
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          
                          // Styling
                          background: isSelected 
                            ? 'radial-gradient(circle, #ffe066 0%, #ff8800 100%)' 
                            : '#0e0b1f',
                          border: isSelected 
                            ? '2px solid #ffffff' 
                            : node.isBoss 
                              ? '2px solid #ff4400' 
                              : '2px solid #a855f7',
                          color: isSelected 
                            ? '#000' 
                            : node.isBoss 
                              ? '#ff6600' 
                              : '#d9acff',
                          boxShadow: isSelected 
                            ? '0 0 15px #ffd700, 0 0 5px #ff8800' 
                            : 'none',
                          zIndex: isSelected ? 10 : 5
                        }}
                      >
                        {node.isBoss ? '💀' : node.floor}
                      </div>
                    )
                  })}
                  
                  {/* Map Label Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    left: 12,
                    color: '#ffd700',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 10,
                    fontWeight: 'bold',
                    letterSpacing: 2,
                    textShadow: '0 0 5px rgba(255, 215, 0, 0.5)'
                  }}>
                    MAP PROTOCOL SYSTEM: ACTIVE
                  </div>
                </div>

                {/* ── SELECTED FLOOR DETAIL PANEL ── */}
                {(() => {
                  const rates = computeRates(selectedFloor.baseRates, rankBonus, rankNumber)
                  const isBoss = selectedFloor.boss
                  
                  return (
                    <div className="glass-panel cyber-panel" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      padding: 16,
                      background: 'rgba(10, 6, 22, 0.85)',
                      border: '1px solid #ffd700',
                      borderRadius: 10,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.6)'
                    }}>
                      
                      {/* Panel Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 215, 0, 0.2)', paddingBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 10, color: '#a855f7', fontWeight: 'bold', letterSpacing: 1.5 }}>
                            DETEKSI SEKTOR PENAMBANGAN
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 'bold', color: isBoss ? '#ffaa00' : '#ffffff', fontFamily: "'Orbitron', sans-serif" }}>
                            {selectedFloor.floor} - {selectedFloor.name}
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: 11, 
                          color: '#ffd700', 
                          background: 'rgba(255, 215, 0, 0.1)', 
                          border: '1px solid #ffd700', 
                          padding: '2px 8px', 
                          borderRadius: 4, 
                          fontWeight: 'bold' 
                        }}>
                          ⏱ {selectedFloor.durationLabel}
                        </div>
                      </div>

                      {/* Content Row: Sprite + Stats */}
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        {/* Sprite Render */}
                        <div style={{ 
                          width: 80, 
                          height: 80, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                          border: '1px solid rgba(168, 85, 247, 0.25)',
                          borderRadius: 8,
                          padding: 4
                        }}>
                          <img 
                            src={selectedFloor.sprite} 
                            alt={selectedFloor.name} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))' }} 
                          />
                        </div>

                        {/* Floor Stats & Yield */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ fontSize: 13, color: '#c7ccd6' }}>
                            Potensi Hasil: <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{selectedFloor.yieldLabel}</span>
                          </div>
                          
                          {/* Rates Block */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                              <span style={{ color: '#8aaabb' }}>Common Ore:</span>
                              <span style={{ color: '#fff' }}>{rates.common}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                              <span style={{ color: '#44bbff' }}>Rare Ore:</span>
                              <span style={{ color: '#44bbff', fontWeight: rates.rare > 0 ? 'bold' : 'normal' }}>{rates.rare}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                              <span style={{ color: '#a855f7' }}>Epic Ore:</span>
                              <span style={{ color: '#a855f7', fontWeight: rates.epic > 0 ? 'bold' : 'normal' }}>{rates.epic}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Deployment Warning */}
                      <div style={{ 
                        fontSize: 11, 
                        color: isBoss ? '#ffaa00' : '#a855f7', 
                        background: isBoss ? 'rgba(255, 170, 0, 0.05)' : 'rgba(168, 85, 247, 0.05)',
                        border: isBoss ? '1px solid rgba(255, 170, 0, 0.2)' : '1px solid rgba(168, 85, 247, 0.2)',
                        padding: 8, 
                        borderRadius: 6,
                        lineHeight: 1.3,
                        textAlign: 'left'
                      }}>
                        ⚠️ <strong>Protokol Pertahanan:</strong> {isBoss ? 'Wajib bertarung melawan BOSS Kaelgorath (100% Encounter).' : 'Peluang disergap Guardian Dementor sebesar 25% saat mulai.'} Jika kalah simulasi tempur, penambangan akan gagal dideploy.
                      </div>

                      {/* MULAI BUTTON */}
                      <button
                        style={{
                          width: '100%',
                          padding: '10px 0',
                          background: 'linear-gradient(135deg, #ffe066 0%, #ff8800 100%)',
                          border: '1px solid #ffffff',
                          borderRadius: 6,
                          color: '#000000',
                          fontWeight: 'bold',
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: 14,
                          letterSpacing: 2,
                          cursor: 'pointer',
                          boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleStartMining(selectedFloor)}
                      >
                        MULAI DEPLOY MINER
                      </button>
                    </div>
                  )
                })()}

              </div>
            )}

            {/* RUNNING */}
            {miningTimer.state === 'running' && secondsLeft > 0 && (
              <div style={s.activeArea}>
                {/* Mining Tool Sprite (faction-specific) */}
                {MINING_TOOLS[player?.race] && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                    <img
                      src={MINING_TOOLS[player.race]}
                      alt={`${player.race} mining tool`}
                      style={{
                        width: 110,
                        height: 'auto',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 14px rgba(0,229,255,0.5))',
                        animation: 'ledBlink 3s ease-in-out infinite',
                      }}
                    />
                  </div>
                )}
                {activeMiningFloor && (
                  <div style={s.activeFloorWrap}>
                    <div style={s.activeFloorBadge}>{activeMiningFloor.floor}</div>
                    <img src={activeMiningFloor.sprite} alt="" style={s.activeSprite} draggable={false} />
                    <div style={s.activeFloorName}>{activeMiningFloor.name}</div>
                  </div>
                )}
                <div style={s.activeLbl}>SEDANG MENAMBANG...</div>
                <div style={s.timerDigits}>{formatTime(secondsLeft)}</div>
                <div style={s.progressBarBg}>
                  <div style={{
                    ...s.progressBarFill,
                    width: `${((miningTimer.duration * 60 - secondsLeft) / (miningTimer.duration * 60)) * 100}%`
                  }} />
                </div>
                <button style={s.cancelBtn} onClick={cancelMining}>BATALKAN PENAMBANGAN</button>
              </div>
            )}

            {/* COMPLETED */}
            {(miningTimer.state === 'completed' || (miningTimer.state === 'running' && secondsLeft <= 0)) && (
              <div style={s.activeArea}>
                <span style={{ fontSize: 72 }}>💎</span>
                <div style={s.completedLbl}>PENAMBANGAN SELESAI!</div>
                <button style={s.claimBtn} onClick={claimMiningRewards}>
                  KLAIM HASIL TAMBANG (ORE)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          TAB 2 — ORE PROCESSING
      ════════════════════════════════════════════════════════ */}
      {activeTab === 'process' && (
        <div style={s.col}>
          <div style={s.subTabs}>
            {['common', 'rare', 'epic'].map((g) => (
              <button key={g} style={processGrade === g ? s.subTabActive : s.subTab} onClick={() => setProcessGrade(g)}>
                {g.toUpperCase()} SHARD
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={s.processSummary}>
              <div style={s.processFormulaTitle}>🧪 FORMULA SHARD [{processGrade.toUpperCase()}]</div>
              <div style={s.processFormulaText}>
                Bahan: <strong>10x Ore [{processGrade.toUpperCase()}]</strong> + <strong>
                  {processGrade === 'common' ? '20.000' : processGrade === 'rare' ? '50.000' : '100.000'} CRD
                </strong> ➔ <strong>1x Shard [{processGrade.toUpperCase()}]</strong>
              </div>
            </div>

            {ORE_TYPES.map((ore) => {
              const oreId   = `ore_${ore.key}_${processGrade}`
              const shardId = `shard_${ore.key}_${processGrade}`
              const ownedOre   = countInventoryItem(oreId)
              const ownedShard = countInventoryItem(shardId)
              const isOreEnough     = ownedOre >= 10
              const costCRD         = processGrade === 'common' ? 20000 : processGrade === 'rare' ? 50000 : 100000
              const isCreditsEnough = (player?.resources?.credits || 0) >= costCRD
              return (
                <div key={ore.key} className="glass-panel cyber-panel" style={s.recipeCard}>
                  <div style={s.recipeProduct}>
                    <img src={ore.shardSprite} alt={ore.name} style={{ width: 42, height: 42, objectFit: 'contain', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.15))' }} />
                    <div>
                      <div style={{ ...s.recipeItemName, color: ore.color }}>{ore.name} Shard [{processGrade === 'common' ? 'C' : processGrade === 'rare' ? 'R' : 'E'}]</div>
                      <div style={s.recipeOwned}>Dimiliki: <span style={{ color: '#fff', fontWeight: 700 }}>{ownedShard}</span></div>
                    </div>
                  </div>
                  <div style={s.recipeIngredients}>
                    <div style={s.ingredientRow}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <img src={ore.oreSprite} alt={ore.name} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                        {ore.name} Ore
                      </span>
                      <span style={{ color: isOreEnough ? '#00ff88' : '#ff4444', fontWeight: 700 }}>{ownedOre} / 10</span>
                    </div>
                    <div style={s.ingredientRow}>
                      <span>💰 Credits</span>
                      <span style={{ color: isCreditsEnough ? '#00ff88' : '#ff4444', fontWeight: 700 }}>{costCRD.toLocaleString()} CRD</span>
                    </div>
                  </div>
                  <button
                    disabled={!isOreEnough || !isCreditsEnough}
                    style={{ ...s.processBtn, opacity: (isOreEnough && isCreditsEnough) ? 1 : 0.4, cursor: (isOreEnough && isCreditsEnough) ? 'pointer' : 'not-allowed' }}
                    onClick={() => processOreToShard(ore.key, processGrade)}
                  >
                    PROCESS
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Shared typography base ── */
const T = {
  fontFamily: 'var(--font-title)',
  fontWeight: 900,
  fontStyle: 'italic',
}

const s = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflowY: 'auto',
    fontFamily: 'var(--font-title)',
    paddingBottom: 85,
    background: 'linear-gradient(rgba(2,5,10,0.78) 0%, rgba(2,5,10,0.85) 100%), url("/assets/crag_mine_bg.png") center/cover no-repeat fixed',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,229,255,0.15)',
    background: 'rgba(4,10,24,0.88)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: '#00e5ff',
    fontSize: 20,
    cursor: 'pointer',
    padding: '0 8px 0 0',
  },
  headerTitle: {
    ...T,
    fontSize: 17,
    color: '#00e5ff',
    letterSpacing: 2,
    textShadow: '0 0 12px rgba(0,229,255,0.55)',
  },
  tabsRow: {
    display: 'flex',
    borderBottom: '2px solid rgba(0,229,255,0.12)',
  },
  tab: {
    ...T,
    flex: 1,
    padding: '13px 6px',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    color: '#5a90b0',
    fontSize: 14,
    letterSpacing: 1.5,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    ...T,
    flex: 1,
    padding: '13px 6px',
    background: 'rgba(0,229,255,0.06)',
    border: 'none',
    borderBottom: '3px solid #00e5ff',
    color: '#00e5ff',
    fontSize: 14,
    letterSpacing: 1.5,
    cursor: 'pointer',
    textShadow: '0 0 10px rgba(0,229,255,0.5)',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    padding: 14,
  },
  card: {
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  cardHeader: {
    ...T,
    fontSize: 15,
    color: '#ffcc00',
    letterSpacing: 1.5,
    borderBottom: '1px solid rgba(255,204,0,0.2)',
    paddingBottom: 7,
    marginBottom: 4,
    textShadow: '0 0 8px rgba(255,204,0,0.4)',
  },

  /* Rank rows */
  rankList: { display: 'flex', flexDirection: 'column', gap: 6 },
  rankRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 6,
  },
  rankRowActive: {
    background: 'rgba(0,229,255,0.07)',
    border: '1px solid rgba(0,229,255,0.3)',
    boxShadow: '0 0 8px rgba(0,229,255,0.1)',
  },
  rankText: {
    ...T,
    fontSize: 14,
    color: '#d8eaf6',
  },
  rankBonus: {
    ...T,
    fontSize: 14,
  },
  badgeBanner: {
    ...T,
    textAlign: 'center',
    fontSize: 14,
    color: '#c8e0f8',
    background: 'rgba(0,0,0,0.3)',
    padding: '7px 10px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.06)',
  },

  /* ── Floor grid ── */
  floorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 10,
  },
  floorCard: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
    padding: '10px 8px 10px',
    background: 'rgba(4,12,28,0.82)',
    border: '1px solid rgba(0,200,255,0.22)',
    borderRadius: 8,
    textAlign: 'center',
    overflow: 'hidden',
  },
  floorCardBoss: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
    padding: '10px 8px 10px',
    background: 'rgba(20,10,4,0.88)',
    border: '2px solid rgba(255,180,0,0.65)',
    borderRadius: 8,
    textAlign: 'center',
    overflow: 'hidden',
    boxShadow: '0 0 18px rgba(255,150,0,0.18), inset 0 0 24px rgba(255,100,0,0.06)',
  },
  floorBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    ...T,
    fontSize: 14,
    color: '#00e5ff',
    background: 'rgba(0,180,255,0.15)',
    border: '1px solid rgba(0,200,255,0.4)',
    borderRadius: 4,
    padding: '1px 5px',
    letterSpacing: 1,
  },
  floorBadgeBoss: {
    position: 'absolute',
    top: 6,
    left: 6,
    ...T,
    fontSize: 14,
    color: '#ffdd44',
    background: 'rgba(255,160,0,0.18)',
    border: '1px solid rgba(255,180,0,0.5)',
    borderRadius: 4,
    padding: '1px 5px',
    letterSpacing: 1,
  },
  bossBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    ...T,
    fontSize: 14,
    color: '#ff6600',
    background: 'rgba(255,80,0,0.18)',
    border: '1px solid rgba(255,100,0,0.5)',
    borderRadius: 4,
    padding: '1px 5px',
    letterSpacing: 1,
    textShadow: '0 0 6px rgba(255,80,0,0.6)',
  },
  spriteWrap: {
    width: '100%',
    height: 90,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  sprite: {
    maxWidth: '100%',
    maxHeight: 90,
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 10px rgba(140,0,200,0.4))',
  },
  floorName: {
    ...T,
    fontSize: 14,
    color: '#d0eeff',
    letterSpacing: 0.5,
    lineHeight: 1.2,
  },
  floorNameBoss: {
    ...T,
    fontSize: 14,
    color: '#ffdd66',
    letterSpacing: 1,
    textShadow: '0 0 8px rgba(255,200,0,0.5)',
    lineHeight: 1.2,
  },
  durationBadge: {
    ...T,
    fontSize: 14,
    color: '#00e5ff',
    background: 'rgba(0,180,255,0.08)',
    border: '1px solid rgba(0,200,255,0.2)',
    borderRadius: 4,
    padding: '2px 8px',
    letterSpacing: 0.5,
  },
  yieldLabel: {
    ...T,
    fontSize: 14,
    color: '#aac8e0',
  },
  yieldVal: {
    color: '#fff',
    fontWeight: 900,
  },
  ratesBlock: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '4px 0',
  },
  rateRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateLabel: {
    ...T,
    fontSize: 14,
    color: '#8aaabb',
  },
  rateCommon: {
    ...T,
    fontSize: 14,
    color: '#c8ddf0',
  },
  rateRare: {
    ...T,
    fontSize: 14,
    color: '#44bbff',
    textShadow: '0 0 6px rgba(68,187,255,0.6)',
  },
  rateEpic: {
    ...T,
    fontSize: 14,
    color: '#dd88ff',
    textShadow: '0 0 6px rgba(200,100,255,0.6)',
  },
  rateDim: {
    ...T,
    fontSize: 14,
    color: '#445566',
  },
  mulaiBtn: {
    width: '100%',
    marginTop: 4,
    padding: '9px 0',
    background: 'linear-gradient(135deg, rgba(255,204,0,0.18) 0%, rgba(255,120,0,0.22) 100%)',
    border: '1px solid rgba(255,204,0,0.6)',
    borderRadius: 6,
    color: '#ffe066',
    ...T,
    fontStyle: 'italic',
    fontSize: 14,
    letterSpacing: 2,
    cursor: 'pointer',
    boxShadow: '0 0 10px rgba(255,180,0,0.2)',
    textShadow: '0 0 8px rgba(255,220,0,0.6)',
    transition: 'all 0.2s',
  },

  /* Active mining area */
  activeArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 10px',
    textAlign: 'center',
    gap: 12,
  },
  activeFloorWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  activeFloorBadge: {
    ...T,
    fontSize: 14,
    color: '#00e5ff',
    border: '1px solid rgba(0,200,255,0.4)',
    borderRadius: 4,
    padding: '2px 8px',
    marginBottom: 2,
  },
  activeSprite: {
    width: 80,
    height: 80,
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 12px rgba(140,0,200,0.5))',
    animation: 'mineAnimation 2s infinite ease-in-out',
  },
  activeFloorName: {
    ...T,
    fontSize: 14,
    color: '#c0ddff',
  },
  activeLbl: {
    ...T,
    fontSize: 15,
    color: '#ffcc00',
    letterSpacing: 2,
    textShadow: '0 0 8px rgba(255,204,0,0.4)',
    animation: 'pulse 1.5s infinite ease-in-out',
  },
  timerDigits: {
    fontFamily: 'var(--font-mono)',
    fontSize: 34,
    color: '#fff',
    fontWeight: 800,
    letterSpacing: 2,
  },
  progressBarBg: {
    width: '80%',
    height: 8,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00e5ff 0%, #00ff88 100%)',
    borderRadius: 4,
    transition: 'width 1s linear',
  },
  cancelBtn: {
    ...T,
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid rgba(255,68,68,0.45)',
    borderRadius: 6,
    color: '#ff6666',
    fontSize: 14,
    letterSpacing: 1,
    cursor: 'pointer',
    marginTop: 6,
  },
  completedLbl: {
    ...T,
    fontSize: 18,
    color: '#00ff88',
    letterSpacing: 2,
    textShadow: '0 0 14px rgba(0,255,136,0.4)',
    animation: 'pulse 1.2s infinite ease-in-out',
  },
  claimBtn: {
    width: '80%',
    padding: '13px 0',
    background: 'linear-gradient(180deg, #00ff88 0%, #00aa50 100%)',
    border: 'none',
    borderRadius: 6,
    color: '#000',
    ...T,
    fontStyle: 'italic',
    fontSize: 15,
    letterSpacing: 1,
    cursor: 'pointer',
    boxShadow: '0 4px 18px rgba(0,255,136,0.4)',
    animation: 'pulse 1.5s infinite ease-in-out',
  },

  /* Ore Processing */
  subTabs: { display: 'flex', gap: 6, marginBottom: 4 },
  subTab: {
    ...T,
    flex: 1,
    padding: '9px 4px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 6,
    color: '#6a9ab0',
    fontSize: 14,
    letterSpacing: 0.5,
    cursor: 'pointer',
  },
  subTabActive: {
    ...T,
    flex: 1,
    padding: '9px 4px',
    background: 'rgba(0,229,255,0.09)',
    border: '1px solid rgba(0,229,255,0.4)',
    borderRadius: 6,
    color: '#00e5ff',
    fontSize: 14,
    letterSpacing: 0.5,
    cursor: 'pointer',
    textShadow: '0 0 6px rgba(0,229,255,0.4)',
  },
  processSummary: {
    padding: '10px 14px',
    background: 'rgba(0,229,255,0.04)',
    border: '1px solid rgba(0,229,255,0.15)',
    borderRadius: 8,
    marginBottom: 4,
  },
  processFormulaTitle: {
    ...T,
    fontSize: 14,
    color: '#00e5ff',
    marginBottom: 5,
    letterSpacing: 1,
  },
  processFormulaText: {
    ...T,
    fontSize: 14,
    color: '#88aadd',
    lineHeight: 1.5,
  },
  recipeCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    gap: 10,
  },
  recipeProduct: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: '1 0 35%',
  },
  recipeItemName: {
    ...T,
    fontSize: 14,
  },
  recipeOwned: {
    ...T,
    fontSize: 14,
    color: '#88aadd',
    marginTop: 2,
  },
  recipeIngredients: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: '1 0 38%',
    ...T,
    fontSize: 14,
    color: '#c8ddf0',
  },
  ingredientRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 4,
  },
  processBtn: {
    padding: '9px 12px',
    background: 'linear-gradient(180deg, #00e5ff 0%, #0088cc 100%)',
    border: 'none',
    borderRadius: 6,
    color: '#000',
    ...T,
    fontStyle: 'italic',
    fontSize: 14,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  },
}
