import React from 'react'
import { getFactionTheme } from '../styles/factionThemes'

export default function TurnOrderHeader({ units = [], turnOrder = [], currentTurnIndex = 0, faction = 'arctron' }) {
  const theme = getFactionTheme(faction)

  // Map turn order IDs to unit objects
  const orderedList = (turnOrder && turnOrder.length > 0 ? turnOrder : units.map(u => u.id))
    .map(id => units.find(u => u.id === id))
    .filter(Boolean)

  return (
    <div 
      style={{
        width: '100%',
        padding: '6px 12px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        position: 'relative',
        zIndex: 20,
        borderBottom: `1px solid ${theme.border}`,
        background: 'rgba(5, 10, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        userSelect: 'none',
        boxSizing: 'border-box'
      }}
    >
      {/* Label Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <div 
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: `1px solid ${theme.primary}`,
            color: theme.primary,
            background: 'rgba(0,0,0,0.6)',
            boxShadow: `0 0 8px ${theme.primary}40`,
          }}
        >
          <span 
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: theme.primary,
              display: 'inline-block'
            }} 
          />
          <span>TIMELINE</span>
        </div>
      </div>

      {/* Queue Bar (Horizontal Scroll) */}
      <div 
        className="no-scrollbar"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          padding: '2px 4px',
          maxWidth: '85%',
          flex: 1
        }}
      >
        {orderedList.map((unit, idx) => {
          const isCurrent = idx === 0
          const isAlly = unit.side === 'ally' || unit.isAlly !== false
          const hpPercent = Math.max(0, Math.min(100, ((unit.hp || 0) / (unit.maxHp || 1)) * 100))

          return (
            <div key={`${unit.id}-${idx}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {idx > 0 && <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>›</span>}

              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '6px',
                  border: `1px solid ${
                    isCurrent
                      ? (isAlly ? theme.primary : '#ef4444')
                      : (isAlly ? `${theme.primary}40` : 'rgba(239, 68, 68, 0.3)')
                  }`,
                  padding: '3px 8px',
                  background: isCurrent 
                    ? (isAlly ? `${theme.primary}25` : 'rgba(239, 68, 68, 0.25)')
                    : 'rgba(15, 23, 42, 0.6)',
                  boxShadow: isCurrent ? `0 0 10px ${isAlly ? theme.primary : '#ef4444'}50` : 'none',
                  transform: isCurrent ? 'scale(1.05)' : 'none',
                  transition: 'all 0.2s ease-out'
                }}
              >
                {/* Avatar / Icon */}
                <div 
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    border: `1px solid ${isAlly ? theme.primary : '#ef4444'}`,
                    background: 'rgba(0,0,0,0.6)',
                    color: isAlly ? theme.textPrimary : '#fca5a5',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}
                >
                  {unit.avatar ? (
                    <img src={unit.avatar} alt={unit.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    unit.name?.charAt(0) || 'U'
                  )}
                </div>

                {/* Name & SPD */}
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span 
                    style={{
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      color: isCurrent ? '#ffffff' : '#cbd5e1',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '65px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {unit.name ? unit.name.split(' ')[0] : 'UNIT'}
                  </span>
                  <span style={{ fontSize: '7px', fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1 }}>
                    SPD {unit.speed || unit.spd || 100}
                  </span>
                </div>

                {/* Mini Bottom HP Bar */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: '#020617', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${hpPercent}%`,
                      backgroundColor: isAlly ? theme.primary : '#ef4444',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>

                {/* Current Unit Badge */}
                {isCurrent && (
                  <span 
                    style={{
                      position: 'absolute',
                      top: '-7px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '7px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      padding: '0 4px',
                      borderRadius: '3px',
                      border: '1px solid #ffffff',
                      letterSpacing: '1px',
                      color: '#020617',
                      backgroundColor: isAlly ? theme.primary : '#ef4444',
                      boxShadow: `0 0 6px ${isAlly ? theme.primary : '#ef4444'}`
                    }}
                  >
                    TURN
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
