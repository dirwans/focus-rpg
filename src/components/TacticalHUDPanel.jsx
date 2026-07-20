import React from 'react'
import { getFactionTheme } from '../styles/factionThemes'

export default function TacticalHUDPanel({
  selectedUnit = null,
  selectedTarget = null,
  isAllyTurn = true,
  isAutoBattle = false,
  onExecuteSkill = () => {},
  onToggleAuto = () => {},
  onOpenDeploy = () => {},
  onResetBattle = () => {},
  faction = 'arctron',
  isDeployMode = false
}) {
  const theme = getFactionTheme(faction)

  const handleSkillClick = (skill) => {
    if (!isAllyTurn || isAutoBattle || !selectedUnit) return
    if (skill.type === 'ultimate' && (selectedUnit.energy || 0) < 100) return
    if (skill.cooldown > 0) return
    onExecuteSkill(skill)
  }

  const defaultSkills = selectedUnit?.skills || [
    { id: 'atk', name: 'Standard Strike', type: 'regular', energyGain: 20, cooldown: 0 },
    { id: 'skl', name: 'Tactical Burst', type: 'skill', energyGain: 30, cooldown: selectedUnit?.skillCd || 0 },
    { id: 'ult', name: 'Overload Core', type: 'ultimate', energyCost: 100, cooldown: 0 },
  ]

  const hp = selectedUnit?.hp ?? 100
  const maxHp = selectedUnit?.maxHp ?? 100
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100))
  const shield = selectedUnit?.shield ?? 0
  const shieldPercent = Math.max(0, Math.min(100, (shield / maxHp) * 100))
  const energy = selectedUnit?.energy ?? 0

  return (
    <div
      style={{
        width: '100%',
        padding: '8px 12px',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '8px',
        position: 'relative',
        zIndex: 30,
        userSelect: 'none',
        borderTop: `1px solid ${theme.border}`,
        background: theme.panelBg,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        boxSizing: 'border-box'
      }}
    >
      {/* LEFT PANEL: Active Unit Stats (Flexible width ~35%) */}
      <div 
        style={{
          flex: '1 1 240px',
          minWidth: '220px',
          background: 'rgba(2, 6, 23, 0.8)',
          border: `1px solid ${theme.primary}30`,
          borderRadius: '8px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          position: 'relative',
          alignItems: 'center'
        }}
      >
        {selectedUnit ? (
          <>
            {/* Unit Portrait */}
            <div 
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '8px',
                border: `2px solid ${theme.primary}`,
                boxShadow: `0 0 10px ${theme.primary}40`,
                background: 'rgba(0,0,0,0.8)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {selectedUnit.avatar ? (
                <img src={selectedUnit.avatar} alt={selectedUnit.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '11px', color: theme.textPrimary }}>
                  {selectedUnit.race || faction}
                </div>
              )}
            </div>

            {/* HP & Energy Details */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedUnit.name || 'UNIT'}
                </span>
                <span 
                  style={{
                    fontSize: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    border: `1px solid ${theme.primary}50`,
                    color: theme.primary,
                    background: `${theme.primary}15`,
                    padding: '1px 4px',
                    borderRadius: '3px',
                    letterSpacing: '1px'
                  }}
                >
                  ACTIVE
                </span>
              </div>

              {/* HP Bar */}
              <div style={{ marginBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '9px', marginBottom: '2px' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>HP</span>
                  <span style={{ fontWeight: 700, color: theme.textPrimary }}>
                    {hp} / {maxHp} {shield > 0 && <span style={{ color: '#38bdf8' }}>(+{shield})</span>}
                  </span>
                </div>
                <div style={{ height: '7px', background: '#020617', borderRadius: '3px', border: '1px solid #1e293b', overflow: 'hidden', position: 'relative' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${hpPercent}%`,
                      background: theme.hpBar,
                      transition: 'width 0.3s ease'
                    }}
                  />
                  {shield > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${hpPercent}%`,
                        width: `${shieldPercent}%`,
                        background: 'rgba(56, 189, 248, 0.8)'
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Energy Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '9px', marginBottom: '2px' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>ENERGY</span>
                  <span style={{ fontWeight: 800, color: energy >= 100 ? '#f59e0b' : '#cbd5e1' }}>
                    {energy}%
                  </span>
                </div>
                <div style={{ height: '6px', background: '#020617', borderRadius: '3px', border: '1px solid #1e293b', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${energy}%`,
                      background: energy >= 100 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : theme.energyBar,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ width: '100%', textAlign: 'center', color: '#64748b', fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontStyle: 'italic' }}>
            [ SELECT UNIT FOR HUD STATS ]
          </div>
        )}
      </div>

      {/* MIDDLE PANEL: Tactical Command Deck */}
      <div 
        style={{
          flex: '2 1 280px',
          minWidth: '240px',
          background: 'rgba(2, 6, 23, 0.8)',
          border: `1px solid ${theme.primary}30`,
          borderRadius: '8px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: theme.primary }}>
            ⚡ TACTICAL COMMAND MATRIX
          </div>

          {selectedTarget ? (
            <div style={{ background: 'rgba(136, 19, 55, 0.6)', border: '1px solid rgba(244, 63, 94, 0.5)', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '8px', color: '#fda4af', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <span style={{ width: '5px', height: '5px', background: '#f43f5e', borderRadius: '50%' }} />
              <span>Target: {selectedTarget.name?.split(' ')[0] || 'MOB'}</span>
            </div>
          ) : (
            <div style={{ background: '#020617', border: '1px solid #1e293b', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '8px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
              [ AUTO TARGETING ]
            </div>
          )}
        </div>

        {selectedUnit && isAllyTurn && !isAutoBattle ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', width: '100%', flex: 1 }}>
            {defaultSkills.map((skill) => {
              const isOnCd = (skill.cooldown || 0) > 0
              const isUlt = skill.type === 'ultimate'
              const isUltReady = !isUlt || energy >= 100
              const disabled = isOnCd || !isUltReady

              return (
                <button
                  key={skill.id}
                  onClick={() => handleSkillClick(skill)}
                  disabled={disabled}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px 4px',
                    borderRadius: '6px',
                    border: `1px solid ${disabled ? '#1e293b' : isUlt ? '#f59e0b' : theme.border}`,
                    background: disabled
                      ? 'rgba(2, 6, 23, 0.4)'
                      : isUlt
                      ? 'linear-gradient(180deg, rgba(120, 53, 15, 0.6), rgba(69, 26, 3, 0.3))'
                      : 'rgba(15, 23, 42, 0.8)',
                    color: disabled ? '#475569' : isUlt ? '#fef08a' : '#f8fafc',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    transition: 'all 0.2s ease-out'
                  }}
                >
                  <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
                    {skill.name}
                  </span>
                  <span style={{ fontSize: '7px', fontFamily: 'var(--font-mono)', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>
                    {isUlt ? 'ULTIMATE' : skill.type === 'skill' ? 'SPECIAL' : 'ATTACK'}
                  </span>

                  {isOnCd && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2, 6, 23, 0.9)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#f43f5e', fontWeight: 800 }}>
                      CD {skill.cooldown}T
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '6px', background: 'rgba(2, 6, 23, 0.4)', borderRadius: '4px', border: '1px solid rgba(30, 41, 59, 0.5)' }}>
            {isAutoBattle ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                ⚡ AUTO COMBAT ACTIVE ⚡
              </span>
            ) : (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                [ WAITING FOR TURN ]
              </span>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Controls (Auto, Deploy, Restart) */}
      <div 
        style={{
          flex: '1 1 180px',
          minWidth: '160px',
          background: 'rgba(2, 6, 23, 0.8)',
          border: `1px solid ${theme.primary}30`,
          borderRadius: '8px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          justifyContent: 'space-between'
        }}
      >
        {/* Toggle Auto Combat */}
        <button
          onClick={onToggleAuto}
          style={{
            padding: '6px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            border: `1px solid ${isAutoBattle ? '#f59e0b' : '#334155'}`,
            background: isAutoBattle ? '#f59e0b' : '#0f172a',
            color: isAutoBattle ? '#020617' : '#e2e8f0',
            transition: 'all 0.2s ease'
          }}
        >
          {isAutoBattle ? '🤖 AUTO ON' : '🎮 AUTO OFF'}
        </button>

        {/* Manual Deploy Mode Toggle */}
        <button
          onClick={onOpenDeploy}
          style={{
            padding: '6px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            border: `1px solid ${isDeployMode ? '#10b981' : 'rgba(16, 185, 129, 0.4)'}`,
            background: isDeployMode ? '#10b981' : '#0f172a',
            color: isDeployMode ? '#020617' : '#34d399',
            transition: 'all 0.2s ease'
          }}
        >
          {isDeployMode ? '✅ LOCK FORMATION' : '♟️ MANUAL DEPLOY'}
        </button>

        {/* Restart Battle */}
        <button
          onClick={onResetBattle}
          style={{
            padding: '6px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            cursor: 'pointer',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            background: '#0f172a',
            color: '#fb7185',
            transition: 'all 0.2s ease'
          }}
        >
          🔄 RESTART
        </button>
      </div>
    </div>
  )
}
