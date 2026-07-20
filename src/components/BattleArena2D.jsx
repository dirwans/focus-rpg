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
    // row 1: Front (closer to center line), row 2: Back (further outwards)
    const isAlly = side === 'ally'
    const colIndex = col % 4

    let x = 0
    let y = 0

    if (isAlly) {
      // Allies on Left side: Row 1 Front = 36% (center), Row 2 Back = 18% (left)
      x = (row === 1 ? 36 : 18) + colIndex * 2
      y = 22 + colIndex * 18
    } else {
      // Enemies on Right side: Row 1 Front = 64% (center), Row 2 Back = 82% (right)
      x = (row === 1 ? 64 : 82) - colIndex * 2
      y = 22 + colIndex * 18
    }

    return { left: `${x}%`, top: `${y}%` }
  }

  // Render 2.5D Grid Slot Plinths/Rings
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
            style={{
              position: 'absolute',
              left: coords.left,
              top: coords.top,
              transform: 'translate(-50%, 40px)',
              width: '65px',
              height: '30px',
              borderRadius: '50%',
              border: `1.5px ${unitInSlot ? 'solid' : 'dashed'} ${
                isAlly ? theme.primary : '#f43f5e'
              }`,
              background: isDeployMode && !unitInSlot
                ? 'rgba(16, 185, 129, 0.25)'
                : unitInSlot
                ? `${isAlly ? theme.primary : '#f43f5e'}20`
                : 'rgba(15, 23, 42, 0.4)',
              boxShadow: isDeployMode ? '0 0 10px rgba(16,185,129,0.5)' : `0 0 8px ${isAlly ? theme.primary : '#f43f5e'}30`,
              cursor: 'pointer',
              zIndex: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease-out'
            }}
          >
            <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: isAlly ? theme.textPrimary : '#fca5a5', opacity: 0.85 }}>
              {isAlly ? 'ALLY' : 'ENEMY'} R{r}C{c+1}
            </span>
          </div>
        )
      }
    }
    return slots
  }

  return (
    <div 
      style={{
        width: '100%',
        position: 'relative',
        background: '#030712',
        overflow: 'hidden',
        minHeight: '320px',
        height: '380px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        boxSizing: 'border-box'
      }}
    >
      {/* HUD Corner Bracket Accents */}
      <div style={{ position: 'absolute', top: '8px', left: '8px', width: '16px', height: '16px', borderTop: `2px solid ${theme.primary}`, borderLeft: `2px solid ${theme.primary}`, pointerEvents: 'none', zIndex: 10 }} />
      <div style={{ position: 'absolute', top: '8px', right: '8px', width: '16px', height: '16px', borderTop: `2px solid ${theme.primary}`, borderRight: `2px solid ${theme.primary}`, pointerEvents: 'none', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: '8px', left: '8px', width: '16px', height: '16px', borderBottom: `2px solid ${theme.primary}`, borderLeft: `2px solid ${theme.primary}`, pointerEvents: 'none', zIndex: 10 }} />
      <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '16px', height: '16px', borderBottom: `2px solid ${theme.primary}`, borderRight: `2px solid ${theme.primary}`, pointerEvents: 'none', zIndex: 10 }} />

      {/* Cybernetic Sector Tag */}
      <div style={{ position: 'absolute', top: '10px', left: '32px', fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '1.5px', textTransform: 'uppercase', color: theme.primary, opacity: 0.7, zIndex: 10 }}>
        SECTOR::{faction.toUpperCase()} // 2.5D_ARENA_ACTIVE
      </div>

      {/* Deploy Mode Active Overlay Banner */}
      {isDeployMode && (
        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(6, 78, 59, 0.9)', border: '1px solid #34d399', padding: '4px 14px', borderRadius: '20px', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#a7f3d0', boxShadow: '0 0 15px rgba(16,185,129,0.5)', zIndex: 20 }}>
          ♟️ MANUAL DEPLOY MODE: Tap empty slot to assign unit position
        </div>
      )}

      {/* 2.5D Perspective Grid SVG Floor Background */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.8, zIndex: 0 }}>
        <svg viewBox="0 0 1000 600" style={{ width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id={`grid-fade-${faction}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.primary} stopOpacity="0.1" />
              <stop offset="50%" stopColor={theme.primary} stopOpacity="0.6" />
              <stop offset="100%" stopColor={theme.primary} stopOpacity="0.1" />
            </linearGradient>
            <radialGradient id={`arena-glow-${faction}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.primary} stopOpacity="0.3" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width="1000" height="600" fill={`url(#arena-glow-${faction})`} />

          {/* Tactical Radar Rings */}
          <circle cx="500" cy="300" r="240" fill="none" stroke={theme.primary} strokeWidth="1" strokeOpacity="0.25" />
          <circle cx="500" cy="300" r="160" fill="none" stroke={theme.primary} strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="6,12" />
          <circle cx="500" cy="300" r="80" fill="none" stroke="#f43f5e" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="4,8" />

          {/* Isometric Perspective Grid Plane */}
          <polygon points="80,50 920,50 1000,550 0,550" fill="none" stroke={`url(#grid-fade-${faction})`} strokeWidth="2" />

          {/* Perspective Rays */}
          {Array.from({ length: 9 }).map((_, idx) => {
            const ratio = idx / 8
            return (
              <line key={`grid-ray-${idx}`} x1={80 + ratio * 840} y1="50" x2={ratio * 1000} y2="550" stroke={theme.primary} strokeWidth="1" strokeOpacity="0.35" />
            )
          })}

          {/* Horizontal Grid Lines */}
          {Array.from({ length: 7 }).map((_, idx) => {
            const ratio = idx / 6
            const y = 50 + ratio * 500
            return (
              <line key={`grid-h-${idx}`} x1={80 - ratio * 80} y1={y} x2={920 + ratio * 80} y2={y} stroke={theme.primary} strokeWidth="1" strokeOpacity="0.35" />
            )
          })}

          {/* Center Laser Divider */}
          <line x1="500" y1="40" x2="500" y2="560" stroke={theme.primary} strokeWidth="3" strokeDasharray="8,8" strokeOpacity="0.85" />

          {/* Sector Labels */}
          <text x="80" y="80" fill={theme.primary} opacity="0.6" fontSize="12" fontFamily="monospace" fontWeight="bold">SYS::ALLY_SECTOR_WEST</text>
          <text x="760" y="80" fill="#f43f5e" opacity="0.6" fontSize="12" fontFamily="monospace" fontWeight="bold">SYS::ENEMY_SECTOR_EAST</text>
        </svg>
      </div>

      {/* Grid Slot Base Plinths */}
      {renderGridSlots('ally')}
      {renderGridSlots('enemy')}

      {/* ALL UNITS RENDERING (Allies on LEFT, Enemies on RIGHT) */}
      {[...allies, ...enemies].map((unit) => {
        const isAlly = unit.side === 'ally' || unit.isAlly === true
        const isSelected = unit.id === selectedUnitId

        const isTargeted = unit.id === selectedTargetId
        const isActive = unit.id === activeUnitId
        const isDead = (unit.hp || 0) <= 0

        const coords = getSlotCoords(isAlly ? 'ally' : 'enemy', unit.row || 1, unit.col || 0)

        return (
          <div
            key={unit.id}
            onClick={() => onSelectUnit(unit)}
            style={{
              position: 'absolute',
              left: coords.left,
              top: coords.top,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: 10 + (unit.col || 0) * 2 + (unit.row || 1),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isDead ? 0.4 : 1,
              filter: isDead ? 'grayscale(100%)' : 'none',
              transition: 'all 0.3s ease-out'
            }}
          >
            {/* Target Reticle Crosshair */}
            {isTargeted && !isDead && (
              <div 
                style={{
                  position: 'absolute',
                  top: '-15px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '2px solid #f43f5e',
                  boxShadow: '0 0 10px #f43f5e',
                  pointerEvents: 'none',
                  zIndex: 30
                }}
              />
            )}

            {/* Active Turn Arrow Badge */}
            {isActive && !isDead && (
              <div 
                style={{
                  position: 'absolute',
                  top: '-20px',
                  fontSize: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  border: '1px solid #ffffff',
                  color: '#020617',
                  backgroundColor: isAlly ? theme.primary : '#ef4444',
                  boxShadow: `0 0 8px ${isAlly ? theme.primary : '#ef4444'}`,
                  zIndex: 30
                }}
              >
                TURN
              </div>
            )}

            {/* Sprite Container - ANIMATED BATTLE SPRITE Facing each other (Adep-adepan)! */}
            <div 
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                width: '120px',
                height: '130px',
                // ADEP-ADEPAN: Animated Arctron Warrior natively faces RIGHT towards enemy
                transform: 'none',
                transition: 'transform 0.3s ease'
              }}
            >

              {isAlly ? (
                <PilotSprite 
                  race={unit.race || faction} 
                  job={unit.job || 'warrior'} 
                  gender={unit.gender || 'male'} 
                  size={120} 
                  isBattle={true} 
                />
              ) : unit.image ? (






                <TransparentSprite
                  src={unit.image}
                  alt={unit.name || 'Mob'}
                  size={120}
                  height={130}
                  glowColor={theme.primary}
                />
              ) : (
                <EnemySprite isBoss={unit.isBoss} size={120} />
              )}
            </div>

            {/* Unit Name Tag (Flipped back so text is normal readable!) */}
            <div 
              style={{
                marginTop: '2px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                border: `1px solid ${isAlly ? `${theme.primary}60` : 'rgba(244, 63, 94, 0.6)'}`,
                background: 'rgba(2, 6, 23, 0.9)',
                color: isAlly ? theme.textPrimary : '#fca5a5',
                textAlign: 'center'
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
          style={{
            position: 'absolute',
            left: ft.x,
            top: ft.y,
            fontFamily: 'var(--font-mono)',
            fontWeight: 900,
            fontSize: '14px',
            pointerEvents: 'none',
            color: ft.color || (ft.type === 'heal' ? '#10b981' : '#ef4444'),
            textShadow: '0 0 6px #000, 0 0 12px currentColor',
            zIndex: 40
          }}
        >
          {ft.text}
        </div>
      ))}
    </div>
  )
}
