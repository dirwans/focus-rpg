import React from 'react'
import { getFactionTheme } from '../styles/factionThemes'
import { PilotSprite, EnemySprite } from './PilotSprites'
import TransparentSprite from './TransparentSprite'

export default function BattleArena2D({
  allies = [],
  enemies = [],
  selectedUnitId = null,
  selectedTargetId = null,
  activeUnitId = null,
  floatingTexts = [],
  onSelectUnit = () => {},
  onSelectSlot = () => {},
  faction = 'arctron',
  isDeployMode = false
}) {
  const theme = getFactionTheme(faction)

  // Map 2.5D coordinates for 2-row x 4-col grid layout
  const getSlotCoords = (side, row, col) => {
    // row 1: Front, row 2: Back (col 0..3 from top to bottom)
    const isAlly = side === 'ally'
    const rowOffset = row === 1 ? 0 : 1
    const colIndex = col % 4

    let x = 0
    let y = 0

    if (isAlly) {
      // Left side: Row 1 is closer to center, Row 2 is further left
      x = 18 + (row === 1 ? 12 : 0) + colIndex * 1.5
      y = 16 + colIndex * 18 - (row === 1 ? 0 : 3)
    } else {
      // Right side: Row 1 is closer to center, Row 2 is further right
      x = 82 - (row === 1 ? 12 : 0) - colIndex * 1.5
      y = 16 + colIndex * 18 - (row === 1 ? 0 : 3)
    }

    return { left: `${x}%`, top: `${y}%` }
  }

  // Render all grid slots (for deploy mode selection or vacant slot indicators)
  const renderGridSlots = (side) => {
    const slots = []
    const isAlly = side === 'ally'

    for (let r = 1; r <= 2; r++) {
      for (let c = 0; c < 4; c++) {
        const coords = getSlotCoords(side, r, c)
        const unitInSlot = (isAlly ? allies : enemies).find(u => u.row === r && u.col === c)

        slots.push(
          <div
            key={`slot-${side}-${r}-${c}`}
            onClick={() => onSelectSlot(side, r, c)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
              isDeployMode ? 'hover:scale-125 hover:border-emerald-400' : ''
            }`}
            style={{
              left: coords.left,
              top: coords.top,
              width: '45px',
              height: '24px',
              border: `1.5px dashed ${unitInSlot ? 'transparent' : isDeployMode ? '#10b981' : `${theme.primary}30`}`,
              background: isDeployMode && !unitInSlot ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
              transform: 'translate(-50%, -50%) rotateX(55deg)',
              zIndex: 5
            }}
          >
            {isDeployMode && !unitInSlot && (
              <span className="text-[8px] font-mono font-bold text-emerald-400 opacity-70">
                R{r}C{c+1}
              </span>
            )}
          </div>
        )
      }
    }
    return slots
  }

  return (
    <div className="flex-1 w-full relative bg-slate-950 overflow-hidden min-h-[260px] sm:min-h-[360px] flex items-center justify-center select-none">
      {/* Corner HUD Bracket Graphics */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 pointer-events-none z-10" style={{ borderColor: `${theme.primary}60` }} />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 pointer-events-none z-10" style={{ borderColor: `${theme.primary}60` }} />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 pointer-events-none z-10" style={{ borderColor: `${theme.primary}60` }} />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 pointer-events-none z-10" style={{ borderColor: `${theme.primary}60` }} />

      {/* Cybernetic Sector Tag */}
      <div className="absolute top-2 left-8 text-[8px] font-mono tracking-widest uppercase pointer-events-none opacity-40 z-10" style={{ color: theme.primary }}>
        SECTOR::{faction.toUpperCase()} // 2.5D_ARENA_ACTIVE
      </div>

      {/* Deploy Mode Active Overlay Banner */}
      {isDeployMode && (
        <div className="absolute top-3 inset-x-0 mx-auto w-fit bg-emerald-950/80 border border-emerald-400/60 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20 animate-pulse flex items-center gap-1.5">
          <span>♟️ MANUAL DEPLOY MODE: Tap empty slot to assign unit position</span>
        </div>
      )}

      {/* 2.5D Perspective Grid SVG Background */}
      <div className="absolute inset-0 pointer-events-none opacity-50 z-0">
        <svg viewBox="0 0 1000 600" className="w-full h-full">
          <defs>
            <linearGradient id={`grid-fade-${faction}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.gridLine} stopOpacity="0.05" />
              <stop offset="50%" stopColor={theme.gridLine} stopOpacity="0.4" />
              <stop offset="100%" stopColor={theme.gridLine} stopOpacity="0.05" />
            </linearGradient>
            <radialGradient id={`arena-glow-${faction}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.primary} stopOpacity="0.2" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width="1000" height="600" fill={`url(#arena-glow-${faction})`} />

          {/* Radar Rings */}
          <circle cx="500" cy="300" r="230" fill="none" stroke={theme.gridLine} strokeWidth="1" strokeOpacity="0.12" />
          <circle cx="500" cy="300" r="150" fill="none" stroke={theme.gridLine} strokeWidth="1" strokeOpacity="0.18" strokeDasharray="5,15" className="animate-[spin_60s_linear_infinite]" />
          
          {/* Isometric Perspective Plane Lines */}
          <polygon points="100,60 900,60 1000,540 0,540" fill="none" stroke={`url(#grid-fade-${faction})`} strokeWidth="1.5" />

          {/* Perspective Rays */}
          {Array.from({ length: 9 }).map((_, idx) => {
            const ratio = idx / 8
            return (
              <line key={`grid-ray-${idx}`} x1={100 + ratio * 800} y1="60" x2={ratio * 1000} y2="540" stroke={theme.gridLine} strokeWidth="0.75" strokeOpacity="0.35" />
            )
          })}

          {/* Horizontal Grid Dividers */}
          {Array.from({ length: 7 }).map((_, idx) => {
            const ratio = idx / 6
            const y = 60 + ratio * 480
            return (
              <line key={`grid-h-${idx}`} x1={100 - ratio * 100} y1={y} x2={900 + ratio * 100} y2={y} stroke={theme.gridLine} strokeWidth="0.75" strokeOpacity="0.3" />
            )
          })}

          {/* Center Laser Divider */}
          <line x1="500" y1="50" x2="500" y2="550" stroke={theme.primary} strokeWidth="2" strokeDasharray="6,6" strokeOpacity="0.6" className="animate-pulse" />
        </svg>
      </div>

      {/* Grid Slot Markers */}
      {renderGridSlots('ally')}
      {renderGridSlots('enemy')}

      {/* ALL UNITS RENDERING (Allies & Enemies) */}
      {[...allies, ...enemies].map((unit) => {
        const isAlly = unit.side === 'ally' || unit.isAlly !== false
        const isSelected = unit.id === selectedUnitId
        const isTargeted = unit.id === selectedTargetId
        const isActive = unit.id === activeUnitId
        const isDead = (unit.hp || 0) <= 0

        const coords = getSlotCoords(isAlly ? 'ally' : 'enemy', unit.row || 1, unit.col || 0)

        return (
          <div
            key={unit.id}
            onClick={() => onSelectUnit(unit)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
              isDead ? 'grayscale opacity-40 pointer-events-none' : 'hover:scale-110'
            }`}
            style={{
              left: coords.left,
              top: coords.top,
              zIndex: 10 + (unit.col || 0) * 2 + (unit.row || 1),
            }}
          >
            {/* Ground Shadow & Aura Ring */}
            <div 
              className={`w-14 h-6 rounded-full -mb-3 transition-all ${
                isActive ? 'animate-pulse scale-125' : ''
              }`}
              style={{
                background: isActive 
                  ? (isAlly ? `${theme.primary}80` : 'rgba(239, 68, 68, 0.8)')
                  : isSelected 
                  ? `${theme.primary}40`
                  : isTargeted
                  ? 'rgba(239, 68, 68, 0.5)'
                  : 'rgba(0, 0, 0, 0.5)',
                boxShadow: isActive ? `0 0 15px ${isAlly ? theme.primary : '#ef4444'}` : 'none',
                transform: 'scaleY(0.4)',
              }}
            />

            {/* Target Reticle Indicator */}
            {isTargeted && (
              <div className="absolute -top-3 w-5 h-5 border-2 border-rose-500 rounded-full animate-ping pointer-events-none" />
            )}

            {/* Active Turn Crown Arrow */}
            {isActive && (
              <div 
                className="absolute -top-5 text-[8px] font-mono font-black uppercase px-1 rounded border animate-bounce z-20 text-slate-950"
                style={{
                  backgroundColor: isAlly ? theme.primary : '#ef4444',
                  borderColor: '#ffffff',
                }}
              >
                TURN
              </div>
            )}

            {/* Unit Sprite Container */}
            <div 
              className={`relative flex items-end justify-center transition-all ${
                unit.isHit ? 'animate-[bounce_0.2s_ease-in-out]' : ''
              }`}
              style={{ width: '100px', height: '110px' }}
            >
              {isAlly ? (
                <PilotSprite 
                  race={unit.race || faction} 
                  job={unit.job || 'warrior'} 
                  gender={unit.gender || 'm'} 
                  size={100} 
                  isBattle={true} 
                />
              ) : unit.image ? (
                <TransparentSprite
                  src={unit.image}
                  alt={unit.name || 'Mob'}
                  size={100}
                  height={110}
                  glowColor={theme.primary}
                />
              ) : (
                <EnemySprite isBoss={unit.isBoss} size={100} />
              )}
            </div>

            {/* Name Tag Only (NO Floating HP Bar above head as requested) */}
            <div 
              className="mt-0.5 px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase tracking-wider truncate max-w-[90px] border bg-slate-950/80 text-center"
              style={{
                borderColor: isAlly ? `${theme.primary}50` : 'rgba(239, 68, 68, 0.5)',
                color: isAlly ? theme.textPrimary : '#fca5a5'
              }}
            >
              {unit.name || 'UNIT'}
            </div>
          </div>
        )
      })}

      {/* Floating Damage Text Popups */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className="absolute font-mono font-black text-xs pointer-events-none animate-[ping_0.8s_ease-out_forwards] z-30"
          style={{
            left: ft.x,
            top: ft.y,
            color: ft.color || (ft.type === 'heal' ? '#10b981' : '#ef4444'),
            textShadow: '0 0 6px #000, 0 0 12px currentColor',
          }}
        >
          {ft.text}
        </div>
      ))}
    </div>
  )
}
