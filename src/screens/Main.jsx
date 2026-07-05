import { useEffect, useState, useRef } from 'react'
import { useGameStore, getPlayerClassGroup } from '../store/gameStore'
import { useAuthStore } from '../store/authStore'
import races from '../data/races.json'
import enemies from '../data/enemies.json'
import jobs from '../data/jobs.json'
import { PilotSprite, EnemySprite } from '../components/PilotSprites'
import TransparentSprite from '../components/TransparentSprite'
import { t } from '../lib/translate'
import SettingsModal from '../components/SettingsModal'
import NpcModal from '../components/NpcModal'
import LibraryModal from '../components/LibraryModal'
import SocialModal from '../components/SocialModal'
import GuildPanel from '../components/GuildPanel'
import MailboxModal from '../components/MailboxModal'

function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

// Bellterra class lane mapping (matches NpcModal)
const BIONEX_SPRITES = {
  guardian:     '/ref/Bellterra/Class-sprites-cleaned/Bellterra-warrior-cleaned.png',
  marksman:     '/ref/Bellterra/Class-sprites-cleaned/Bellterra-ranger-cleaned.png',
  psion:        '/ref/Bellterra/Class-sprites-cleaned/Bellterra-Spiritualist-cleaned.png',
  engineer:     '/ref/Bellterra/Class-sprites-cleaned/Bellterra-specialist-cleaned.png',
}

function getBionexJobSprite(jobId) {
  // Return null to use Bionex-specific gender-differentiated sprites from PilotSprite
  return null;
}

// Full Screen Interactive World Map Modal (Portrait-optimized with clean dynamic HTML/CSS overlay)
function WorldMapModal({ onClose }) {
  const player = useGameStore((s) => s.player)
  const setSelectedMapIdx = useGameStore((s) => s.setSelectedMapIdx)
  
  // Default selected node index
  const defaultIdx = (player.selectedMapIdx !== undefined && player.selectedMapIdx !== null)
    ? player.selectedMapIdx
    : Math.min(player.sector - 1, enemies.sectors.length - 1)
  
  const [selectedNode, setSelectedNode] = useState(defaultIdx)

  const activeColor = { arctron: '#ff5222', bionex: '#00e5ff', celestra: '#a855f7' }[player.race] || '#00e5ff'

  const mapCoordinates = [
    { name: 'Lumora Fields', left: '30%', top: '20%', minLevel: 1 },
    { name: 'Sylvaris Wilds', left: '70%', top: '35%', minLevel: 13 },
    { name: 'Ferrum Expanse', left: '25%', top: '50%', minLevel: 26 },
    { name: 'Pyraxis Crater', left: '75%', top: '65%', minLevel: 39 },
    { name: 'Trinity Nexus', left: '50%', top: '80%', minLevel: 53 }
  ]

  const selectedSector = enemies.sectors[selectedNode]
  const isLocked = player.level < mapCoordinates[selectedNode].minLevel
  const isActive = player.selectedMapIdx === selectedNode || (player.selectedMapIdx === null && selectedNode === defaultIdx)

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000, background: 'rgba(2, 4, 10, 0.95)',
      display: 'flex', flexDirection: 'column',
      backdropFilter: 'blur(10px)', fontFamily: 'var(--font-body)'
    }}>
      
      {/* Sleek Tactical Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', background: 'rgba(5, 10, 25, 0.9)',
        borderBottom: '2.5px solid rgba(0, 229, 255, 0.35)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>🗺️</span>
          <span style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 900,
            letterSpacing: 2, color: '#00e5ff', textShadow: '0 0 10px rgba(0, 229, 255, 0.4)'
          }}>
            TACTICAL MAP SCREEN
          </span>
        </div>
        <button 
          onClick={onClose}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255, 60, 60, 0.12)', border: '1.5px solid rgba(255, 60, 60, 0.4)',
            color: '#ff4444', fontFamily: 'monospace', fontSize: 16, fontWeight: 900,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 8px rgba(255,60,60,0.1)'
          }}
        >
          ✕
        </button>
      </div>

      {/* Main Map Viewport */}
      <div style={{
        position: 'relative', flex: 1, overflow: 'hidden', background: '#020205'
      }}>
        {/* Background Image Map - Portrait clean version */}
        <img 
          src="/assets/world_map_portrait_clean.png" 
          alt="World Map Portrait Grid" 
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: 0.72, pointerEvents: 'none'
          }}
        />

        {/* Dynamic Holographic Connection Lines Path */}
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', zIndex: 12
          }}
        >
          <path 
            d="M 30 20 L 70 35 L 25 50 L 75 65 L 50 80" 
            stroke="rgba(0, 229, 255, 0.45)" 
            strokeWidth="0.8" 
            fill="none" 
            strokeDasharray="2 1.5" 
            style={{ filter: 'drop-shadow(0 0 3px rgba(0,229,255,0.4))' }}
          />
        </svg>

        {/* Interactive Hotspot Map Nodes */}
        {mapCoordinates.map((coord, idx) => {
          const mapLocked = player.level < coord.minLevel
          const mapActive = player.selectedMapIdx === idx || (player.selectedMapIdx === null && idx === defaultIdx)
          const isSelected = selectedNode === idx
          
          let glowColor = '#5e6875' // locked
          if (!mapLocked) {
            glowColor = mapActive ? activeColor : '#00e5ff'
          }

          return (
            <button
              key={idx}
              onClick={() => setSelectedNode(idx)}
              style={{
                position: 'absolute',
                left: coord.left,
                top: coord.top,
                transform: 'translate(-50%, -50%)',
                width: isSelected ? '44px' : '34px',
                height: isSelected ? '44px' : '34px',
                borderRadius: '50%',
                background: mapLocked ? 'rgba(30,30,40,0.85)' : (isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(0, 229, 255, 0.15)'),
                border: isSelected ? `2.5px solid ${glowColor}` : `1.8px solid ${glowColor}`,
                boxShadow: isSelected 
                  ? `0 0 25px ${glowColor}, inset 0 0 10px ${glowColor}` 
                  : (mapActive ? `0 0 15px ${glowColor}` : 'none'),
                cursor: 'pointer',
                zIndex: isSelected ? 50 : 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease-out'
              }}
            >
              {mapLocked ? (
                <span style={{ fontSize: 12 }}>🔒</span>
              ) : (
                <div style={{
                  width: isSelected ? '12px' : '8px',
                  height: isSelected ? '12px' : '8px',
                  borderRadius: '50%',
                  background: isSelected ? '#fff' : glowColor,
                  boxShadow: isSelected ? '0 0 10px #fff' : 'none',
                  animation: mapActive ? 'spritePulse 1.2s infinite ease-in-out' : 'none'
                }} />
              )}
            </button>
          )
        })}

        {/* Small floating HUD labels next to nodes */}
        {mapCoordinates.map((coord, idx) => {
          const mapLocked = player.level < coord.minLevel
          const isSelected = selectedNode === idx
          return (
            <div
              key={`lbl-${idx}`}
              onClick={() => setSelectedNode(idx)}
              style={{
                position: 'absolute',
                left: `calc(${coord.left} + ${coord.left.startsWith('7') ? '-65px' : '26px'})`,
                top: `calc(${coord.top} - 10px)`,
                background: isSelected ? 'rgba(3, 8, 20, 0.92)' : 'rgba(3, 8, 20, 0.72)',
                border: isSelected ? `1.5px solid ${activeColor}` : '1px solid rgba(255,255,255,0.15)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: isSelected ? 'bold' : 'normal',
                color: mapLocked ? '#7a8593' : '#fff',
                textShadow: isSelected ? `0 0 5px ${activeColor}` : 'none',
                cursor: 'pointer',
                zIndex: 30,
                pointerEvents: 'auto',
                boxShadow: isSelected ? `0 0 8px ${activeColor}40` : 'none'
              }}
            >
              M{idx + 1}: {coord.name.split(' ')[0]}
            </div>
          )
        })}
      </div>

      {/* Holographic Tactical Info Panel Overlay - Portrait Dynamic Grid Terminal */}
      <div style={{
        background: 'rgba(3, 8, 20, 0.96)',
        borderTop: `3px solid ${isLocked ? '#8a94a3' : activeColor}`,
        boxShadow: `0 -10px 30px rgba(0,0,0,0.85), 0 0 20px ${isLocked ? 'rgba(0,0,0,0)' : activeColor}18`,
        padding: '18px 20px 24px', zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 14,
        flexShrink: 0
      }}>
        {/* Row 1: Title and Lock status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: 15, fontWeight: 900,
              color: isLocked ? '#8a94a3' : '#fff', letterSpacing: 1, textTransform: 'uppercase'
            }}>
              MAP {selectedNode + 1} — {selectedSector.name}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#7ab0d0', marginTop: 2 }}>
              Level Bracket: Lv. {selectedSector.minLevel} - {selectedSector.maxLevel}
            </div>
          </div>
          
          <span style={{
            fontSize: 11, background: isLocked ? 'rgba(255,255,255,0.06)' : (isActive ? `${activeColor}20` : 'rgba(0, 229, 255, 0.12)'),
            color: isLocked ? '#8a94a3' : (isActive ? activeColor : '#00e5ff'),
            border: `1.5px solid ${isLocked ? '#8a94a3' : (isActive ? activeColor : '#00e5ff')}`,
            borderRadius: '6px', padding: '3px 10px', fontWeight: 900, fontFamily: 'monospace'
          }}>
            {isLocked ? '🔒 LOCKED' : (isActive ? 'ACTIVE' : 'SELECTABLE')}
          </span>
        </div>

        {/* Row 2: Level Requirements */}
        {isLocked && (
          <div style={{
            background: 'rgba(255, 60, 60, 0.1)', border: '1px solid rgba(255, 60, 60, 0.3)',
            borderRadius: '8px', padding: '8px 12px', color: '#ff6666', fontSize: 12,
            fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span>⚠️</span>
            <span>Pilot Level is too low! Requires Level {mapCoordinates[selectedNode].minLevel} (Current: Level {player.level}).</span>
          </div>
        )}

        {/* Row 3: Monsters list (Dynamic layout) */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 'bold', color: '#5f8da3',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
            fontFamily: "'Orbitron', sans-serif"
          }}>
            Zone Inhabitants
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {selectedSector.mobs.map((m, idx) => (
              <span key={idx} style={{
                fontSize: 13, background: 'rgba(255,255,255,0.03)',
                padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)',
                color: isLocked ? '#7a8593' : '#dde2ea', display: 'inline-flex', alignItems: 'center', gap: 6,
                fontFamily: 'monospace'
              }}>
                <span>{m.emoji}</span>
                <span>{m.name}</span>
              </span>
            ))}
            <span style={{
              fontSize: 13, background: 'rgba(255, 100, 0, 0.05)',
              padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255, 100, 0, 0.25)',
              color: isLocked ? '#7a8593' : '#ff985a', display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'monospace', fontWeight: 'bold'
            }}>
              <span>💀</span>
              <span>{selectedSector.boss.name} (Boss)</span>
            </span>
          </div>
        </div>

        {/* Row 4: Select / Deploy Button */}
        <button
          disabled={isLocked}
          onClick={() => {
            setSelectedMapIdx(selectedNode)
            onClose()
          }}
          style={{
            marginTop: 4,
            padding: '14px',
            width: '100%',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 2.5,
            borderRadius: '10px',
            cursor: isLocked ? 'not-allowed' : 'pointer',
            border: 'none',
            background: isLocked 
              ? 'rgba(40, 40, 50, 0.5)' 
              : (isActive ? 'rgba(255,255,255,0.05)' : `linear-gradient(90deg, ${activeColor}, color-mix(in srgb, ${activeColor} 65%, white))`),
            border: isActive ? `1.5px dashed ${activeColor}` : 'none',
            color: isLocked ? '#7a8593' : (isActive ? activeColor : '#fff'),
            boxShadow: isLocked ? 'none' : `0 4px 20px ${activeColor}44`,
            transition: 'all 0.25s',
            textAlign: 'center'
          }}
        >
          {isLocked ? '🔒 TRANSMISSION LOCKED' : (isActive ? 'CURRENT LEVELING ZONE' : '⚡ DEPLOY PILOT UNIT HERE')}
        </button>
      </div>

    </div>
  )
}


export default function Main() {
  const player   = useGameStore((s) => s.player)
  const timer    = useGameStore((s) => s.timer)
  const battle   = useGameStore((s) => s.battle)
  const getStats = useGameStore((s) => s.getStats)
  const getExpToNext = useGameStore((s) => s.getExpToNext)
  const startTimer   = useGameStore((s) => s.startTimer)
  const stopTimer    = useGameStore((s) => s.stopTimer)
  const resetTimer   = useGameStore((s) => s.resetTimer)
  const setTimerMinutes = useGameStore((s) => s.setTimerMinutes)
  const setMode      = useGameStore((s) => s.setMode)
  const setSelectedZone = useGameStore((s) => s.setSelectedZone)
  const openRaceSelect = useGameStore((s) => s.openRaceSelect)

  const { user, signOut } = useAuthStore()
  const username = user?.username || '—'

  const [showSettings, setShowSettings] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showSocialModal, setShowSocialModal] = useState(false)
  const [showNpcModal, setShowNpcModal] = useState(false)
  const [showMailbox, setShowMailbox] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [npcInitialView, setNpcInitialView] = useState('lobby')

  // Register global back-button bridge for Capacitor hardware back key
  useEffect(() => {
    if (showNpcModal) {
      window.__closeNpcModal = () => setShowNpcModal(false)
    } else {
      window.__closeNpcModal = null
    }
    return () => { window.__closeNpcModal = null }
  }, [showNpcModal])

  const stats   = getStats()
  const expMax  = getExpToNext()
  const expPct  = Math.floor((player.exp / expMax) * 100)
  const race    = player.race ? races[player.race] : null
  const isDungeon = timer.selectedZone && timer.selectedZone.startsWith('dungeon_')
  let enemy
  if (isDungeon) {
    const dungeonIdx = parseInt(timer.selectedZone.split('_')[1]) - 1
    enemy = enemies.dungeons[dungeonIdx]
  } else {
    const sectorIdx = (player.selectedMapIdx !== undefined && player.selectedMapIdx !== null)
      ? player.selectedMapIdx
      : (Math.min(player.sector, enemies.sectors.length) - 1)
    enemy = enemies.sectors[sectorIdx]
  }
  const isRunning = timer.state === 'running'
  const isDone    = timer.state === 'completed'

  const getJobInfo = (raceId, jobId) => {
    if (!raceId || !jobId || !jobs[raceId]) return { tier: 0, job: null, classIndex: -1 }
    const rJobs = jobs[raceId]
    const tiers = ['tier1', 'tier2', 'tier3', 'tier4']
    for (const t of tiers) {
      if (!rJobs[t]) continue
      const idx = rJobs[t].findIndex(j => j.id === jobId)
      if (idx !== -1) return { tier: parseInt(t.replace('tier', '')), job: rJobs[t][idx], classIndex: idx }
    }
    return { tier: 0, job: null, classIndex: -1 }
  }

  // Focus-session label per faction (Arctron fights, Bionex gathers, Celestra channels)
const FOCUS_MODE_LABEL = { arctron: 'FIGHT', bionex: 'GATHER', celestra: 'CHANNEL' }

// CLASS names by faction (mapped by job index position in tier arrays)
  const CLASS_NAMES = {
    celestra: ['Warrior', 'Ranger', 'Summoner', 'Mage'],
    arctron:  ['Warrior', 'Ranger', 'Specialist'],
    bionex:   ['Warrior', 'Ranger', 'Specialist', 'Mage']
  }

  const { tier, job: jobInfo, classIndex } = getJobInfo(player.race, player.job)
  const baseClass = (classIndex >= 0 && player.race && CLASS_NAMES[player.race])
    ? CLASS_NAMES[player.race][classIndex]?.toUpperCase() || 'NOVICE'
    : 'NOVICE'

  const eligibleForPromo = player.race && (
    (tier === 0 && player.level >= 1) ||
    (tier === 1 && player.level >= 30) ||
    (tier === 2 && player.level >= 50)
  )

  // Visual Effects State
  const [particles, setParticles] = useState([])
  const [isCritHit, setIsCritHit] = useState(false)
  const [isEnemyHit, setIsEnemyHit] = useState(false)
  const [playerAnim, setPlayerAnim] = useState('')
  const [enemyAnim, setEnemyAnim] = useState('')
  const lastHpRef = useRef(battle.enemyHp)
  const lastPlayerHpRef = useRef(battle.playerHp)

  // Trigger floating damage popup
  const spawnDamage = (amount, isCrit) => {
    const id = Math.random().toString()
    const newP = {
      id,
      text: isCrit ? `💥-${amount}` : `-${amount}`,
      x: 55 + Math.random() * 15,
      y: 35 + Math.random() * 15,
      isCrit,
      isPlayerDmg: false
    }
    setParticles((prev) => [...prev, newP])
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id))
    }, 800)
  }

  // Monitor damage events
  useEffect(() => {
    if (!isRunning || !battle.currentMob) return

    const currentHp = battle.enemyHp
    const prevHp = lastHpRef.current

    if (currentHp < prevHp) {
      const diff = prevHp - currentHp
      const group = getPlayerClassGroup(player.job, player.race)
      let activeAtk = stats.atk
      if (group === 'warrior') activeAtk = stats.meleeAtk
      else if (group === 'ranger') activeAtk = stats.rangedAtk
      else if (group === 'mage') activeAtk = stats.forceAtk
      else activeAtk = Math.max(stats.meleeAtk, stats.rangedAtk)

      const isCrit = diff > (activeAtk * 1.3)
      spawnDamage(diff, isCrit)

      setIsEnemyHit(true)
      const hitTimer = setTimeout(() => setIsEnemyHit(false), 200)

      // Attack and hit animations
      setPlayerAnim('anim-attack-lunge')
      const animPlayerTimer = setTimeout(() => setPlayerAnim(''), 300)
      
      setEnemyAnim('anim-hit-shake')
      const animEnemyTimer = setTimeout(() => setEnemyAnim(''), 250)

      if (isCrit) {
        setIsCritHit(true)
        const shakeTimer = setTimeout(() => setIsCritHit(false), 300)
        return () => {
          clearTimeout(hitTimer)
          clearTimeout(animPlayerTimer)
          clearTimeout(animEnemyTimer)
          clearTimeout(shakeTimer)
        }
      }
      return () => {
        clearTimeout(hitTimer)
        clearTimeout(animPlayerTimer)
        clearTimeout(animEnemyTimer)
      }
    }

    lastHpRef.current = currentHp
  }, [battle.enemyHp, isRunning, battle.currentMob])

  // Monitor player damage events
  useEffect(() => {
    if (!isRunning || battle.playerHp === undefined) return

    const currentHp = battle.playerHp
    const prevHp = lastPlayerHpRef.current

    if (currentHp > 0 && currentHp < prevHp) {
      const diff = prevHp - currentHp
      const id = Math.random().toString()
      const newP = {
        id,
        text: `💥-${diff}`,
        x: 18 + Math.random() * 12,
        y: 35 + Math.random() * 15,
        isPlayerDmg: true
      }
      setParticles((prev) => [...prev, newP])
      const particleTimer = setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id))
      }, 800)

      // Enemy attacks, player gets hit animations
      setEnemyAnim('anim-attack-lunge-reverse')
      const animEnemyTimer = setTimeout(() => setEnemyAnim(''), 300)
      
      setPlayerAnim('anim-hit-shake')
      const animPlayerTimer = setTimeout(() => setPlayerAnim(''), 250)

      return () => {
        clearTimeout(particleTimer)
        clearTimeout(animEnemyTimer)
        clearTimeout(animPlayerTimer)
      }
    }

    lastPlayerHpRef.current = currentHp
  }, [battle.playerHp, isRunning])

  // Confirm Abandon Session
  const handleAbandon = () => {
    if (window.confirm(t('confirm_abandon'))) {
      stopTimer()
    }
  }


  // Radial Progress Calculations
  const radius = 60
  const strokeWidth = 6
  const circ = 2 * Math.PI * radius
  const timerPercent = isRunning
    ? (timer.secondsLeft / (timer.selectedMinutes * 60)) * 100
    : isDone ? 0 : 100
  const strokeDashoffset = circ - (timerPercent / 100) * circ

  // Spacious Focus Screen Layout
  if (isRunning) {
    const timerPercentActive = (timer.secondsLeft / (timer.selectedMinutes * 60)) * 100
    const strokeDashoffsetActive = circ - (timerPercentActive / 100) * circ

    return (
      <div className="no-scrollbar" style={styles.screen}>
        {/* Top corner discreet abandon button and Stage header */}
        <div style={styles.activeHeader}>
          <div style={styles.activeStageBadge}>📍 {enemy.name}</div>
          <div style={styles.activeSectorLabel}>
            {isDungeon ? `DUNGEON ${timer.selectedZone.split('_')[1]}` : `MAP ${player.sector}`}
          </div>
          <button onClick={handleAbandon} style={styles.smallAbandonBtn}>
            {t('abandon_btn')}
          </button>
        </div>

        {/* 1. Sleek Compact Text Timer (Top portion) */}
        <div style={styles.timerDisplayActiveCompact}>
          <span style={styles.activeTimerDigits}>{fmt(timer.secondsLeft)}</span>
          <div style={{ ...styles.activeGatherBadge, color: '#ffaa00', borderColor: 'rgba(255, 170, 0, 0.5)', boxShadow: '0 0 8px rgba(255, 170, 0, 0.3)' }}>{t('focus_active')}</div>
        </div>


        {/* 2. Battle logs (Middle portion - framed with solid dark background) */}
        {battle.log.length > 0 && (
          <div style={styles.battleLogActive}>
            {battle.log.slice(-3).map((l, i, arr) => (
              <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: l.includes('BOSS') || l.includes('CRIT') || l.includes('Vampire') ? '#ffdd44' : l.includes('✅') || l.includes('🆙') ? '#00ff88' : '#c0dff0', opacity: 0.7 + (i / arr.length) * 0.3, fontWeight: 700 }}>{l}</div>
            ))}
          </div>
        )}

        {/* 3. Health & Mana bars (Fight mode details) */}
        {timer.mode === 'fight' && battle.currentMob && (
          <div style={styles.activeHealthBarWrapper}>
            {/* Enemy HP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#ffaa00', fontWeight: 800, textShadow: '0 0 4px #000' }}>
              <span>{battle.currentMob.emoji} {battle.currentMob.name}</span>
              <span>{Math.max(0, battle.enemyHp)} / {battle.enemyMaxHp} HP</span>
            </div>
            <div style={{ width: '90%', height: 6, background: '#0a1020', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255, 170, 0, 0.5)', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${Math.max(0, (battle.enemyHp / battle.enemyMaxHp) * 100)}%`, background: battle.isBoss ? 'linear-gradient(90deg, #ff1133, #ff4466)' : 'linear-gradient(90deg, #ff5500, #ffcc00)', borderRadius: 3, transition: 'width 0.2s' }} />
            </div>

            {/* Player HP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00e5ff', fontWeight: 800, textShadow: '0 0 4px #000' }}>
              <span>{t('pilot_shield')}</span>
              <span>{(battle.playerHp !== undefined && !isNaN(battle.playerHp)) ? battle.playerHp : stats.hp} / {battle.playerMaxHp || stats.hp} HP</span>
            </div>
            <div style={{ width: '90%', height: 6, background: '#0a1020', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(0, 229, 255, 0.5)', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${Math.max(0, (((battle.playerHp !== undefined && !isNaN(battle.playerHp)) ? battle.playerHp : stats.hp) / (battle.playerMaxHp || stats.hp || 1)) * 100)}%`, background: 'linear-gradient(90deg, #0050cc, #00e5ff)', borderRadius: 3, transition: 'width 0.2s' }} />
            </div>

            {/* Player FP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', fontFamily: 'var(--font-mono)', fontSize: 13, color: '#da70d6', fontWeight: 800, textShadow: '0 0 4px #000' }}>
              <span>{t('force_point')}</span>
              <span>{(battle.playerFp !== undefined && !isNaN(battle.playerFp)) ? battle.playerFp : 200} / {battle.playerMaxFp || 200} FP</span>
            </div>

            <div style={{ width: '90%', height: 6, background: '#0a1020', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(218, 112, 214, 0.5)' }}>
              <div style={{ height: '100%', width: `${Math.max(0, (((battle.playerFp !== undefined && !isNaN(battle.playerFp)) ? battle.playerFp : 200) / (battle.playerMaxFp || 200 || 1)) * 100)}%`, background: 'linear-gradient(90deg, #7b1fa2, #da70d6)', borderRadius: 3, transition: 'width 0.2s' }} />
            </div>
          </div>
        )}

        {/* 4. Battle Arena (Bottom portion - Unboxed sprites standing directly on grid floor!) */}
        <div className={isCritHit ? 'screen-shake' : ''} style={styles.arenaActiveUnboxed}>
          <div style={styles.arenaVisualContainerActive}>
            <div style={styles.arenaGridOverlay} />

            {/* Player sprite (Full body) */}
            <div style={styles.playerSprite} className={playerAnim}>
              <div style={{
                animation: 'spritePulse 1.2s infinite ease-in-out',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                width: 160,
                height: player.race === 'arctron' ? 190 : 160,
                position: 'relative',
                flexShrink: 0
              }}>
              {(() => {
                const bionexSprite = player.race === 'bionex' ? getBionexJobSprite(player.job) : null
                if (bionexSprite) {
                  return (
                    <img
                      src={bionexSprite}
                      alt={player.job}
                      style={{
                        height: 160,
                        width: 160,
                        objectFit: 'contain',
                        objectPosition: 'center bottom',
                        display: 'block',
                        filter: 'brightness(1.15) contrast(1.05)',
                      }}
                    />
                  )
                }
                return <PilotSprite race={player.race} job={player.job} gender={player.gender} size={player.race === 'arctron' ? 190 : 160} isBattle={true} />
              })()}
              </div>
              <div style={styles.spriteLabel}>{t('pilot_label')}</div>
            </div>

            <div style={{ fontSize: 24, color: 'var(--neon-glow)', fontFamily: 'var(--font-title)', fontWeight: 900, textShadow: '0 0 8px var(--neon-glow)', zIndex: 1, paddingBottom: 40 }}>VS</div>

            {/* Enemy sprite (Enlarged and border-cropped) */}
            {battle.currentMob ? (
              <div className={`${isEnemyHit ? 'hit-flash' : ''} ${enemyAnim}`} style={styles.enemySprite}>
                <div style={{ animation: 'spritePulse 1.5s infinite ease-in-out', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 160, height: 160, flexShrink: 0 }}>
                  {battle.currentMob.image ? (
                    <TransparentSprite 
                      src={battle.currentMob.image} 
                      alt={battle.currentMob.name} 
                      size={160} 
                      glowColor="var(--neon-glow)" 
                    />
                  ) : (
                    <EnemySprite isBoss={battle.isBoss} isPitBoss={battle.isPitBoss} size={160} />
                  )}
                </div>
                <div style={styles.spriteLabel}>{battle.currentMob.name?.toUpperCase()}</div>
              </div>
            ) : (
              <div style={styles.enemySprite}>
                <div style={{ fontSize: 64, opacity: 0.3 }}>💤</div>
                <div style={styles.spriteLabel}>{t('debris_label')}</div>
              </div>
            )}


            {/* Floating damage popups */}
            {particles.map((p) => (
              <div
                key={p.id}
                className="damage-particle"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y - 12}%`,
                  color: p.isPlayerDmg ? '#ff4444' : '#fff',
                  textShadow: p.isPlayerDmg 
                    ? '0 0 8px #ff0033, 0 0 15px #ff0000' 
                    : p.isCrit 
                    ? '0 0 10px #ff3131, 0 0 20px #ff0000' 
                    : '0 0 8px var(--neon-glow)'
                }}
              >
                {p.text}
              </div>
            ))}
          </div>
        </div>

        {/* 5. Session summary (Bottom-most bar) */}
        <div style={styles.sessionSummaryActive}>
          <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: 13, fontWeight: 700, textShadow: '0 0 4px #000' }}>
            ⚔️ {t('kills_label', { kills: battle.kills })} &nbsp;|&nbsp; <span style={{ color: '#f5a623' }}>+{battle.sessionAnium}⬡</span> &nbsp;|&nbsp; <span style={{ color: '#00e5ff' }}>+{battle.sessionExp} Menit</span>
          </span>
        </div>
      </div>

    )
  }

  // Normal / Lobby Layout
  const ringRadius = 26
  const ringStrokeWidth = 4
  const ringCirc = 2 * Math.PI * ringRadius
  const focusModeLabel = FOCUS_MODE_LABEL[player.race] || 'FOCUS'

  return (
    <div className="no-scrollbar" style={styles.screen}>
      {/* Top HUD bar */}
      <div style={styles.hudBar}>
        <span className="hud-pill">⬡ {player.resources.anium.toLocaleString()}</span>
        <span className="hud-pill secondary">◈ {player.resources.credits.toLocaleString()}</span>
        <span style={styles.iconRow}>
          {player.race && (
            <button onClick={() => setShowMailbox(true)} className="icon-btn-circle" title="Mailbox">
              ✉️
              {player.mailbox && player.mailbox.length > 0 && (
                <div style={styles.mailDot} />
              )}
            </button>
          )}
          <button onClick={() => setShowSocialModal(true)} className="icon-btn-circle" title="Social / Friends">👥</button>
          <button onClick={() => setShowLibrary(true)} className="icon-btn-circle" title="Database & Guides">📖</button>
          <button onClick={() => setShowSettings(true)} className="icon-btn-circle" title="Settings">⚙️</button>
          <button onClick={signOut} className="icon-btn-circle" title="Logout">⏏</button>
        </span>
      </div>

      {/* Location pill + streak */}
      <div style={styles.locationRow}>
        <div 
          className="location-pill"
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onClick={() => setShowMapModal(true)}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Click to select Leveling Map"
        >
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none" style={{ flexShrink: 0 }}>
            <polygon points="5.5,0 11,3 11,8.5 5.5,13 0,8.5 0,3" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <circle cx="5.5" cy="6" r="1.8" fill="currentColor" />
            <line x1="5.5" y1="0" x2="5.5" y2="2.2" stroke="currentColor" strokeWidth="1" />
            <line x1="5.5" y1="9.8" x2="5.5" y2="13" stroke="currentColor" strokeWidth="1" />
          </svg>
          <span>{t('location_lbl')}:</span>
          <span style={{ color: 'var(--neon-glow)', textShadow: '0 0 6px var(--neon-glow)' }}>{enemy.name.toUpperCase()} 🗺️</span>
        </div>
        <div className="location-pill" style={{ color: '#ff5f7a' }} title={t('streak_lbl')}>🔥{player.streak}</div>
      </div>

      {/* Simplified Player Status HUD */}
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.statusStrip}>
        <div style={styles.avatarRing}>
          <PilotSprite race={player.race} job={player.job} gender={player.gender} size={36} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 'bold', color: '#e0f4ff', letterSpacing: 0.5 }}>{player.name.toUpperCase()}</span>
            {stats.title && (
              <span style={{ fontSize: 9, background: 'rgba(0, 229, 255, 0.1)', color: 'var(--neon-glow)', border: '1px solid var(--neon-glow)', borderRadius: 4, padding: '1px 4px', fontFamily: 'var(--font-title)', fontWeight: 800 }}>
                {stats.title.toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ec8e3', marginTop: 2, fontWeight: 700 }}>
            {jobInfo ? jobInfo.name.toUpperCase() : 'NOVICE'} · LV.{player.level}
          </div>
        </div>
        {eligibleForPromo && (
          <button
            className={`profile-promo-btn btn-${player.race}`}
            style={{
              padding: '6px 10px',
              fontSize: 13,
              fontFamily: 'var(--font-title)',
              fontWeight: 800,
              borderRadius: 6,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 0 8px var(--neon-glow)'
            }}
            onClick={() => {
              setNpcInitialView('specialist')
              setShowNpcModal(true)
            }}
          >
            🚀 PROMO
          </button>
        )}
      </div>

      {/* EXP bar */}
      <div style={styles.expSection}>
        <div style={styles.expLabelRow}>
          <span>LV.{player.level}</span>
          <span>{100 - expPct}% TO NEXT</span>
        </div>
        <div style={styles.expBg}><div style={{ ...styles.expFill, width: expPct + '%' }} /></div>
        <div style={styles.expText}>{player.exp} / {expMax} Menit</div>
      </div>

      {/* Guild Panel */}
      <GuildPanel />

      {/* Combat stats */}
      {(() => {
        const group = getPlayerClassGroup(player.job, player.race)
        let activeAtk = stats.atk
        let atkLabel = 'FIREPOWER'
        if (group === 'warrior') {
          activeAtk = stats.meleeAtk
          atkLabel = 'MELEE ATK'
        } else if (group === 'ranger') {
          activeAtk = stats.rangedAtk
          atkLabel = 'RANGED ATK'
        } else if (group === 'mage') {
          activeAtk = stats.forceAtk
          atkLabel = 'FORCE ATK'
        } else {
          activeAtk = Math.max(stats.meleeAtk, stats.rangedAtk)
          atkLabel = 'ACTIVE ATK'
        }

        return (
          <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.combatStats}>
            <div style={styles.cstat}><div style={styles.cstatLabel}>{atkLabel}</div><div style={{ ...styles.cstatVal, color: 'var(--neon-glow)' }}>{activeAtk}</div></div>
            <div style={styles.statDivider} />
            <div style={styles.cstat}><div style={styles.cstatLabel}>{t('armor')}</div><div style={{ ...styles.cstatVal, color: '#eef3fb' }}>{stats.def}</div></div>
            <div style={styles.statDivider} />
            <div style={styles.cstat}><div style={styles.cstatLabel}>{t('shield_hp')}</div><div style={{ ...styles.cstatVal, color: '#ff5f7a' }}>{stats.hp.toLocaleString()}</div></div>
          </div>
        )
      })()}

      {/* Focus timer + Target zone card */}
      <div className={`glass-panel cyber-panel ${player.race ? 'panel-' + player.race : ''}`} style={styles.focusCard}>
        <div style={styles.focusTopRow}>
          <div style={styles.ringWrap}>
            <svg width={64} height={64} viewBox="0 0 64 64">
              <circle cx={32} cy={32} r={ringRadius} stroke="rgba(255,255,255,0.12)" strokeWidth={ringStrokeWidth} fill="none" />
              <circle
                cx={32} cy={32} r={ringRadius}
                stroke="var(--neon-secondary-1)"
                strokeWidth={ringStrokeWidth}
                fill="none"
                strokeDasharray={ringCirc}
                strokeDashoffset={0}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
                style={{ filter: 'drop-shadow(0 0 4px var(--neon-secondary-2))' }}
              />
            </svg>
            <div style={styles.ringText}>{fmt(timer.selectedMinutes * 60)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.focusLabel}>FOCUS SESSION · {focusModeLabel}</div>
            <div style={styles.pillRow}>
              {[10, 25, 60].map((m) => (
                <button
                  key={m}
                  className={`focus-pill${timer.selectedMinutes === m ? ' selected' : ''}`}
                  onClick={() => setTimerMinutes(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!isRunning && !isDone && player.race && (
          <>
            <div style={styles.divider} />
            <div style={styles.focusLabel}>TARGET ZONE</div>
            <div style={styles.pillRow}>
              <button
                className={`focus-pill${(!timer.selectedZone || timer.selectedZone === 'world') ? ' selected' : ''}`}
                onClick={() => {
                  setSelectedZone('world')
                  setShowMapModal(true)
                }}
              >
                WORLD
              </button>
              <button
                className={`focus-pill${timer.selectedZone === 'dungeon_1' ? ' selected' : (player.level < 30 ? ' locked' : '')}`}
                disabled={player.level < 30}
                onClick={() => setSelectedZone('dungeon_1')}
              >
                ECHO L30
              </button>
              <button
                className={`focus-pill${timer.selectedZone === 'dungeon_2' ? ' selected' : (player.level < 50 ? ' locked' : '')}`}
                disabled={player.level < 50}
                onClick={() => setSelectedZone('dungeon_2')}
              >
                FORGE L50
              </button>
              <button
                className={`focus-pill${timer.selectedZone === 'dungeon_3' ? ' selected' : (player.level < 65 ? ' locked' : '')}`}
                disabled={player.level < 65}
                onClick={() => setSelectedZone('dungeon_3')}
              >
                CORE L65
              </button>
            </div>
          </>
        )}
      </div>

      {/* Deploy row */}
      <div style={styles.deployRow}>
        {!isRunning && player.race && (
          <button className="npc-circle-btn" onClick={() => setShowNpcModal(true)} title={t('visit_npc')}>🏪</button>
        )}
        {!isRunning && !isDone && (
          <button className="deploy-btn" onClick={player.race ? startTimer : openRaceSelect}>
            {player.race ? t('deploy_unit') : t('select_race')}
          </button>
        )}
        {isDone && (
          <button className="deploy-btn" style={{ background: 'linear-gradient(90deg,#006000,#00c840)', color: '#fff' }} onClick={resetTimer}>
            {t('new_session')}
          </button>
        )}
      </div>

      {/* Modals */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showLibrary && <LibraryModal onClose={() => setShowLibrary(false)} />}
      {showSocialModal && <SocialModal onClose={() => setShowSocialModal(false)} />}
      {showNpcModal && <NpcModal onClose={() => setShowNpcModal(false)} initialView={npcInitialView} />}
      {showMailbox && <MailboxModal onClose={() => setShowMailbox(false)} />}
      {showMapModal && <WorldMapModal onClose={() => setShowMapModal(false)} />}

    </div>
  )
}

const styles = {
  screen: { display: 'flex', flexDirection: 'column', flex: 1, gap: 0, fontFamily: 'var(--font-body)', zIndex: 1 },
  hudBar: { display: 'flex', gap: 8, padding: '15px 16px 10px', alignItems: 'center', flexShrink: 0 },
  iconRow: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 },
  mailDot: { position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: '#ff3333', boxShadow: '0 0 6px #ff3333' },
  locationRow: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, margin: '0 16px 12px' },
  statusStrip: { margin: '0 16px 12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
  avatarRing: { width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--neon-glow)', background: 'radial-gradient(circle, rgba(255,255,255,0.08), rgba(0,0,0,0.4))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  expSection: { padding: '0 16px 12px', flexShrink: 0 },
  expLabelRow: { display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-title)', fontSize: 13, color: '#7ab0d0', letterSpacing: 1, marginBottom: 5, fontWeight: 800 },
  expBg: { height: 8, background: 'color-mix(in srgb, var(--neon-glow) 14%, transparent)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0, 229, 255, 0.25)' },
  expFill: { height: '100%', background: 'linear-gradient(90deg, color-mix(in srgb, var(--neon-glow) 60%, black), var(--neon-glow))', borderRadius: 4, transition: 'width 0.5s', boxShadow: '0 0 8px var(--neon-glow)' },
  expText: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ab0d0', marginTop: 4, textAlign: 'right', fontWeight: 800 },
  statDivider: { width: 1, background: '#0d2a50' },
  focusCard: { margin: '0 16px 10px', padding: 12, flexShrink: 0 },
  focusTopRow: { display: 'flex', gap: 12, alignItems: 'center' },
  ringWrap: { position: 'relative', width: 64, height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: '#fff' },
  focusLabel: { fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, letterSpacing: 1.5, color: '#7ab0d0', marginBottom: 8 },
  pillRow: { display: 'flex', gap: 6 },
  divider: { height: 1, background: 'color-mix(in srgb, var(--neon-glow) 16%, transparent)', margin: '10px 0' },
  deployRow: { margin: '0 16px 12px', display: 'flex', gap: 8, flexShrink: 0 },
  arena: { margin: '0 16px 12px', padding: '22px 12px 12px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', flexShrink: 0 },
  arenaActive: { margin: '16px', padding: '44px 16px 20px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', flex: 1, justifyContent: 'center' },
  arenaBadge: { position: 'absolute', top: 12, left: 12, background: 'rgba(26, 8, 0, 0.8)', border: '1px solid #ff6400', borderRadius: 6, padding: '3px 8px', fontFamily: 'var(--font-title)', fontSize: 13, color: '#ff8c40', fontWeight: 800, boxShadow: '0 0 10px rgba(255, 100, 0, 0.3)', zIndex: 2 },
  arenaRight: { position: 'absolute', top: 12, right: 12, fontFamily: 'var(--font-title)', fontSize: 13, color: '#00e5ff', textAlign: 'right', fontWeight: 800, textShadow: '0 0 6px rgba(0, 229, 255, 0.3)', zIndex: 2 },
  arenaVisualContainer: { width: '100%', margin: '6px 0 0 0', padding: '16px 16px 0 16px', position: 'relative', minHeight: 130, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', background: 'transparent', border: 'none' },
  arenaVisualContainerActive: { width: '100%', margin: '16px 0 10px 0', padding: '32px 16px 0 16px', position: 'relative', minHeight: 240, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', overflow: 'visible', background: 'transparent', border: 'none' },
  arenaGridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', backgroundImage: 'linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.1) 1px, transparent 1px)', backgroundSize: '12px 12px', transform: 'perspective(40px) rotateX(60deg)', transformOrigin: 'bottom center', opacity: 0.8, pointerEvents: 'none' },
  playerSprite: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, paddingBottom: 6 },
  enemySprite: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, paddingBottom: 6 },
  spriteLabel: { fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 0.5, color: '#7ab0d0', textTransform: 'uppercase', fontWeight: 800, background: 'rgba(3, 8, 20, 0.65)', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(0, 229, 255, 0.15)' },
  timerDisplay: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 2, marginTop: 12 },
  timerDisplayActiveCompact: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 2, margin: '12px 0 6px 0', justifyContent: 'center', flexShrink: 0 },
  activeTimerDigits: { fontSize: 44, fontFamily: 'monospace', fontWeight: 900, color: '#fff', textShadow: '0 0 10px var(--neon-glow), 0 0 20px var(--neon-glow)' },
  battleLog: { marginTop: 10, width: '100%', display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(0,0,0,0.35)', padding: 8, borderRadius: 8, border: '1px solid rgba(0, 229, 255, 0.1)' },
  battleLogActive: { width: '90%', display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(3, 8, 20, 0.9)', padding: 12, borderRadius: 10, border: '1.5px solid var(--neon-glow)', margin: '12px auto', boxShadow: '0 0 10px rgba(0,0,0,0.5)', flexShrink: 0 },
  combatStats: { margin: '0 16px 6px', padding: 8, display: 'flex', justifyContent: 'space-around', flexShrink: 0 },
  cstat: { textAlign: 'center' },
  cstatLabel: { fontFamily: 'var(--font-title)', fontSize: 13, letterSpacing: 1, color: '#7ab0d0', marginBottom: 2, fontWeight: 800 },
  cstatVal: { fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 900, textShadow: '0 0 6px rgba(0, 229, 255, 0.2)' },
  sessionSummary: { textAlign: 'center', padding: '0 16px 10px' },
  sessionSummaryActive: { textAlign: 'center', padding: '12px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(3, 8, 20, 0.95)', border: '1.5px solid rgba(0, 229, 255, 0.25)', boxShadow: '0 0 10px rgba(0,0,0,0.5)', margin: '12px 16px 16px 16px', borderRadius: 8, flexShrink: 0 },
  // Abandon
  topAbandonBar: { display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 0 16px', zIndex: 10 },
  smallAbandonBtn: { background: 'rgba(255, 49, 49, 0.1)', border: '1px solid rgba(255, 49, 49, 0.4)', borderRadius: 6, color: '#ff4444', fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, padding: '6px 12px', cursor: 'pointer', letterSpacing: 1, transition: 'all 0.2s', boxShadow: '0 0 8px rgba(255, 49, 49, 0.1)' },
  arenaActiveUnboxed: { margin: '0', padding: '24px 16px 0 16px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'visible', flex: 1, justifyContent: 'flex-end', width: '100%', flexShrink: 0 },
  // New Contrast Framed Active Styles
  activeHeader: { display: 'flex', justifyContent: 'space-between', padding: '10px 16px', alignItems: 'center', width: '100%', zIndex: 10, background: 'rgba(3, 8, 20, 0.9)', borderBottom: '2.5px solid rgba(0, 229, 255, 0.35)', boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)', flexShrink: 0 },
  activeStageBadge: { background: 'rgba(3, 8, 20, 0.95)', border: '1.5px solid var(--neon-glow)', borderRadius: '8px', padding: '6px 12px', fontFamily: 'var(--font-title)', fontSize: 13, color: '#fff', fontWeight: 800, boxShadow: '0 0 8px var(--neon-glow)', textShadow: '0 0 4px #000' },
  activeSectorLabel: { fontFamily: 'var(--font-title)', fontSize: 13, color: 'var(--neon-glow)', fontWeight: 800, textShadow: '0 0 8px var(--neon-glow)', background: 'rgba(3, 8, 20, 0.95)', border: '1.5px solid var(--neon-glow)', borderRadius: '8px', padding: '6px 12px', boxShadow: '0 0 8px var(--neon-glow)' },
  activeGatherBadge: { fontFamily: 'var(--font-mono)', fontSize: 13, color: '#00e5ff', marginTop: 6, fontWeight: 800, zIndex: 2, letterSpacing: 1, background: 'rgba(3, 8, 20, 0.95)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(0, 229, 255, 0.4)', boxShadow: '0 0 8px rgba(0, 229, 255, 0.2)', textShadow: '0 0 4px #000' },
  activeHealthBarWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '90%', marginTop: 8, zIndex: 2, background: 'rgba(3, 8, 20, 0.95)', padding: '10px 16px', borderRadius: '10px', border: '1.5px solid rgba(0, 229, 255, 0.35)', boxShadow: '0 0 10px rgba(0,0,0,0.5)', margin: '12px auto', flexShrink: 0 }
}
