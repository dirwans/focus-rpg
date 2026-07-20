import React from 'react'
import { getFactionTheme } from '../styles/factionThemes'

export default function DeployPanel({
  roster = [],
  deployedUnits = [],
  onDeployUnit = () => {},
  onRemoveUnit = () => {},
  onClose = () => {},
  faction = 'arctron'
}) {
  const theme = getFactionTheme(faction)

  return (
    <div 
      style={{
        width: '100%',
        padding: '12px',
        borderRadius: '8px',
        border: `1px solid ${theme.border}`,
        background: 'rgba(2, 6, 23, 0.95)',
        backdropFilter: 'blur(10px)',
        fontFamily: 'var(--font-mono)',
        userSelect: 'none',
        boxShadow: `0 0 20px ${theme.primary}20`,
        boxSizing: 'border-box',
        marginTop: '6px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.primary}40`, paddingBottom: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: theme.textPrimary }}>
            ♟️ MANUAL UNIT FORMATION DEPLOYMENT
          </span>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            ({deployedUnits.length}/4 Units Deployed)
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, background: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', cursor: 'pointer' }}
        >
          ✕ CLOSE
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12px' }}>
        {/* Available Roster */}
        <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px' }}>
            AVAILABLE SQUAD ROSTER
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {roster.map((unit) => {
              const isDeployed = deployedUnits.some(d => d.id === unit.id)

              return (
                <div
                  key={unit.id}
                  onClick={() => !isDeployed && onDeployUnit(unit)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: `1px solid ${isDeployed ? '#1e293b' : '#334155'}`,
                    background: isDeployed ? 'rgba(15, 23, 42, 0.4)' : '#0f172a',
                    opacity: isDeployed ? 0.4 : 1,
                    cursor: isDeployed ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc' }}>{unit.name}</span>
                    <span style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase' }}>{unit.job || unit.role || 'Combatant'}</span>
                  </div>
                  <span style={{ fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '3px', textAlign: 'center', background: isDeployed ? '#1e293b' : 'rgba(6, 78, 59, 0.8)', color: isDeployed ? '#64748b' : '#6ee7b7', border: `1px solid ${isDeployed ? 'transparent' : 'rgba(16, 185, 129, 0.4)'}` }}>
                    {isDeployed ? 'DEPLOYED' : '+ DEPLOY'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Formation Positions */}
        <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px' }}>
            ACTIVE FORMATION GRID (FRONT / BACK ROW)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {deployedUnits.map((unit) => (
              <div
                key={unit.id}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.primary}40`,
                  background: 'rgba(15, 23, 42, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '3px', background: '#020617', border: '1px solid #1e293b', color: '#cbd5e1' }}>
                    Row {unit.row || 1} • Col {(unit.col || 0) + 1}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#f1f5f9' }}>{unit.name}</span>
                </div>
                <button
                  onClick={() => onRemoveUnit(unit.id)}
                  style={{ fontSize: '8px', fontWeight: 800, color: '#f43f5e', background: 'rgba(136, 19, 55, 0.6)', border: '1px solid rgba(244, 63, 94, 0.4)', padding: '2px 6px', borderRadius: '3px', cursor: 'pointer' }}
                >
                  REMOVE
                </button>
              </div>
            ))}
            {deployedUnits.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '10px', color: '#64748b', fontStyle: 'italic', border: '1px dashed #1e293b', borderRadius: '6px' }}>
                No units deployed yet. Tap a unit on the left to deploy onto the 2.5D arena.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
