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
      className="w-full px-3 py-1.5 flex items-center justify-between gap-2 relative z-20 border-b backdrop-blur-md select-none"
      style={{
        background: 'rgba(5, 10, 18, 0.75)',
        borderColor: theme.border,
      }}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0)_50%,_rgba(0,0,0,0.4)_50%)] bg-[size:100%_4px]" />

      {/* Label Badge */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div 
          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border"
          style={{
            borderColor: theme.primary,
            color: theme.primary,
            background: 'rgba(0,0,0,0.5)',
            boxShadow: `0 0 8px ${theme.primary}40`,
          }}
        >
          <span 
            className="w-2 h-2 rounded-full animate-ping" 
            style={{ backgroundColor: theme.primary }} 
          />
          <span>TIMELINE</span>
        </div>
      </div>

      {/* Queue Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1 max-w-[85%]">
        {orderedList.map((unit, idx) => {
          const isCurrent = idx === 0
          const isAlly = unit.side === 'ally' || unit.isAlly !== false
          const hpPercent = Math.max(0, Math.min(100, ((unit.hp || 0) / (unit.maxHp || 1)) * 100))

          return (
            <div key={`${unit.id}-${idx}`} className="flex items-center gap-1 flex-shrink-0">
              {idx > 0 && <span className="text-[10px] font-mono text-slate-600">›</span>}

              <div
                className={`relative flex items-center gap-1.5 rounded border px-2 py-1 transition-all ${
                  isCurrent
                    ? 'scale-105 shadow-md'
                    : 'opacity-75 hover:opacity-100'
                }`}
                style={{
                  background: isCurrent 
                    ? (isAlly ? `${theme.primary}25` : 'rgba(239, 68, 68, 0.25)')
                    : 'rgba(15, 23, 42, 0.6)',
                  borderColor: isCurrent
                    ? (isAlly ? theme.primary : '#ef4444')
                    : (isAlly ? `${theme.primary}40` : 'rgba(239, 68, 68, 0.3)'),
                  boxShadow: isCurrent ? `0 0 10px ${isAlly ? theme.primary : '#ef4444'}50` : 'none',
                }}
              >
                {/* Avatar / Icon */}
                <div 
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold border flex-shrink-0 overflow-hidden"
                  style={{
                    borderColor: isAlly ? theme.primary : '#ef4444',
                    background: 'rgba(0,0,0,0.6)',
                    color: isAlly ? theme.textPrimary : '#fca5a5'
                  }}
                >
                  {unit.avatar ? (
                    <img src={unit.avatar} alt={unit.name} className="w-full h-full object-cover" />
                  ) : (
                    unit.name?.charAt(0) || 'U'
                  )}
                </div>

                {/* Name & SPD */}
                <div className="flex flex-col min-w-0">
                  <span 
                    className="text-[9px] font-mono font-bold truncate max-w-[65px] uppercase tracking-wide"
                    style={{ color: isCurrent ? '#ffffff' : '#cbd5e1' }}
                  >
                    {unit.name ? unit.name.split(' ')[0] : 'UNIT'}
                  </span>
                  <span className="text-[7px] font-mono text-slate-400 uppercase tracking-widest leading-none">
                    SPD {unit.speed || unit.spd || 100}
                  </span>
                </div>

                {/* Mini Bottom HP Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-950 rounded-b overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${hpPercent}%`,
                      backgroundColor: isAlly ? theme.primary : '#ef4444'
                    }}
                  />
                </div>

                {/* Current Unit Badge */}
                {isCurrent && (
                  <span 
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] font-mono font-black uppercase px-1 rounded border tracking-widest text-slate-950"
                    style={{
                      backgroundColor: isAlly ? theme.primary : '#ef4444',
                      borderColor: '#ffffff',
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
