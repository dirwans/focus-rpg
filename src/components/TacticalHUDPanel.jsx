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

  // Skill click handler with guards
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
      className="w-full p-2 sm:p-3 grid grid-cols-1 md:grid-cols-12 gap-2 relative z-30 select-none border-t backdrop-blur-md"
      style={{
        background: theme.panelBg,
        borderColor: theme.border,
        boxShadow: `0 -4px 20px rgba(0,0,0,0.5)`,
      }}
    >
      {/* Corner Bracket Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: theme.primary }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: theme.primary }} />

      {/* LEFT PANEL: Active Unit Stats (4 Cols) */}
      <div className="md:col-span-4 bg-slate-950/70 border rounded-lg p-2 flex gap-2.5 relative" style={{ borderColor: `${theme.primary}30` }}>
        {selectedUnit ? (
          <>
            {/* Unit Portrait */}
            <div 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 relative overflow-hidden flex flex-col items-center justify-center flex-shrink-0"
              style={{
                borderColor: theme.primary,
                boxShadow: `0 0 10px ${theme.primary}40`,
                background: 'rgba(0,0,0,0.8)'
              }}
            >
              {selectedUnit.avatar ? (
                <img src={selectedUnit.avatar} alt={selectedUnit.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center font-mono font-bold text-xs" style={{ color: theme.textPrimary }}>
                  {selectedUnit.race || faction}
                </div>
              )}
              <div 
                className="absolute bottom-1 w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: theme.primary }}
              />
            </div>

            {/* HP & Energy Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-mono text-xs font-bold text-slate-100 uppercase truncate">
                  {selectedUnit.name || 'UNIT'}
                </span>
                <span 
                  className="text-[8px] font-mono font-bold border px-1 rounded uppercase tracking-wider"
                  style={{
                    borderColor: `${theme.primary}50`,
                    color: theme.primary,
                    background: `${theme.primary}15`
                  }}
                >
                  ACTIVE
                </span>
              </div>

              {/* HP Bar */}
              <div className="space-y-0.5 mb-1.5">
                <div className="flex justify-between font-mono text-[9px]">
                  <span className="text-slate-400 font-semibold">HP</span>
                  <span className="font-bold" style={{ color: theme.textPrimary }}>
                    {hp} / {maxHp} {shield > 0 && <span className="text-sky-400">(+{shield})</span>}
                  </span>
                </div>
                <div className="h-2 bg-slate-900 rounded border border-slate-800 overflow-hidden relative">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${hpPercent}%`,
                      background: theme.hpBar
                    }}
                  />
                  {shield > 0 && (
                    <div
                      className="absolute top-0 bottom-0 bg-sky-400/80 animate-pulse"
                      style={{
                        left: `${hpPercent}%`,
                        width: `${shieldPercent}%`
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Energy Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between font-mono text-[9px]">
                  <span className="text-slate-400 font-semibold">ENERGY</span>
                  <span 
                    className={`font-bold ${energy >= 100 ? 'text-amber-400 animate-pulse font-extrabold' : 'text-slate-300'}`}
                  >
                    {energy}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded border border-slate-800 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${energy}%`,
                      background: energy >= 100 
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' 
                        : theme.energyBar
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-center text-slate-500 font-mono text-[10px] uppercase tracking-wider italic">
            [ SELECT UNIT FOR HUD STATS ]
          </div>
        )}
      </div>

      {/* MIDDLE PANEL: Tactical Command Matrix (5 Cols) */}
      <div className="md:col-span-5 bg-slate-950/70 border rounded-lg p-2 flex flex-col justify-between" style={{ borderColor: `${theme.primary}30` }}>
        <div className="flex justify-between items-center mb-1 flex-shrink-0">
          <div className="text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: theme.primary }}>
            <span>⚡ TACTICAL COMMAND MATRIX</span>
          </div>

          {/* Current Target */}
          {selectedTarget ? (
            <div className="bg-rose-950/60 border border-rose-500/50 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono text-[8px] text-rose-300 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              <span>Target: {selectedTarget.name?.split(' ')[0] || 'MOB'}</span>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-[8px] text-slate-500 uppercase tracking-widest">
              [ AUTO TARGETING ]
            </div>
          )}
        </div>

        {selectedUnit && isAllyTurn && !isAutoBattle ? (
          <div className="grid grid-cols-3 gap-1.5 flex-1 items-center">
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
                  className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all select-none h-full ${
                    disabled
                      ? 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                      : isUlt
                      ? 'bg-gradient-to-b from-amber-950/80 to-amber-900/30 border-amber-400 text-amber-200 hover:scale-105 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-slate-900/80 border-slate-700 hover:border-cyan-400 text-slate-200 hover:scale-105'
                  }`}
                  style={{
                    borderColor: !disabled && !isUlt ? theme.border : undefined
                  }}
                >
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wide truncate w-full text-center">
                    {skill.name}
                  </span>
                  <span className="text-[7px] font-mono text-slate-400 uppercase mt-0.5">
                    {isUlt ? 'ULTIMATE' : skill.type === 'skill' ? 'SPECIAL' : 'ATTACK'}
                  </span>

                  {/* Cooldown Overlay */}
                  {isOnCd && (
                    <div className="absolute inset-0 bg-slate-950/90 rounded-lg flex items-center justify-center font-mono text-[9px] text-rose-400 font-bold uppercase">
                      CD {skill.cooldown}T
                    </div>
                  )}

                  {isUlt && isUltReady && (
                    <span className="absolute -top-1 -right-1 text-[6px] font-mono font-black uppercase px-1 rounded bg-amber-400 text-slate-950 animate-pulse">
                      READY
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-2 bg-slate-900/40 rounded border border-slate-800/40">
            {isAutoBattle ? (
              <span className="font-mono text-[10px] text-amber-400 animate-pulse uppercase tracking-widest font-bold">
                ⚡ AUTO COMBAT ACTIVE ⚡
              </span>
            ) : (
              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">
                [ WAITING FOR TURN ]
              </span>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANEL: Controls (3 Cols) */}
      <div className="md:col-span-3 bg-slate-950/70 border rounded-lg p-2 flex flex-row md:flex-col justify-between gap-1.5" style={{ borderColor: `${theme.primary}30` }}>
        {/* Toggle Auto Combat */}
        <button
          onClick={onToggleAuto}
          className={`flex-1 md:flex-initial py-1.5 px-2 rounded font-mono text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1 ${
            isAutoBattle
              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] font-extrabold animate-pulse'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
          }`}
        >
          <span>{isAutoBattle ? '🤖 AUTO ON' : '🎮 AUTO OFF'}</span>
        </button>

        {/* Manual Deploy Mode Toggle */}
        <button
          onClick={onOpenDeploy}
          className={`flex-1 md:flex-initial py-1.5 px-2 rounded font-mono text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1 ${
            isDeployMode
              ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)] font-extrabold'
              : 'bg-slate-900 text-emerald-400 border-emerald-500/40 hover:border-emerald-400'
          }`}
        >
          <span>{isDeployMode ? '✅ LOCK FORMATION' : '♟️ MANUAL DEPLOY'}</span>
        </button>

        {/* Restart Battle */}
        <button
          onClick={onResetBattle}
          className="flex-1 md:flex-initial py-1.5 px-2 bg-slate-900 text-rose-400 border border-rose-500/40 hover:border-rose-400 rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
        >
          <span>🔄 RESTART</span>
        </button>
      </div>
    </div>
  )
}
