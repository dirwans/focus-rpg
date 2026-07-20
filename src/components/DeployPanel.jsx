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
      className="w-full p-3 rounded-lg border backdrop-blur-md bg-slate-950/90 font-mono select-none"
      style={{ borderColor: theme.border, boxShadow: `0 0 20px ${theme.primary}20` }}
    >
      <div className="flex items-center justify-between border-b pb-2 mb-3" style={{ borderColor: `${theme.primary}40` }}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
            ♟️ MANUAL UNIT FORMATION DEPLOYMENT
          </span>
          <span className="text-[10px] text-slate-400">
            ({deployedUnits.length}/4 Units Deployed)
          </span>
        </div>
        <button
          onClick={onClose}
          className="px-2 py-0.5 rounded text-xs font-bold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
        >
          ✕ CLOSE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Available Roster */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            AVAILABLE SQUAD ROSTER
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {roster.map((unit) => {
              const isDeployed = deployedUnits.some(d => d.id === unit.id)

              return (
                <div
                  key={unit.id}
                  onClick={() => !isDeployed && onDeployUnit(unit)}
                  className={`p-2 rounded border flex items-center justify-between transition-all cursor-pointer ${
                    isDeployed
                      ? 'bg-slate-900/40 border-slate-800 opacity-40 cursor-not-allowed'
                      : 'bg-slate-900 border-slate-700 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-100 truncate">{unit.name}</span>
                    <span className="text-[8px] text-slate-400 uppercase">{unit.job || unit.role || 'Combatant'}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isDeployed ? 'bg-slate-800 text-slate-500' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'}`}>
                    {isDeployed ? 'DEPLOYED' : '+ DEPLOY'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Formation Positions */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            ACTIVE FORMATION GRID (FRONT / BACK ROW)
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {deployedUnits.map((unit) => (
              <div
                key={unit.id}
                className="p-2 rounded border bg-slate-900/80 flex items-center justify-between"
                style={{ borderColor: `${theme.primary}40` }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    Row {unit.row || 1} • Col {(unit.col || 0) + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate">{unit.name}</span>
                </div>
                <button
                  onClick={() => onRemoveUnit(unit.id)}
                  className="text-[9px] font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 hover:border-rose-400 px-1.5 py-0.5 rounded"
                >
                  REMOVE
                </button>
              </div>
            ))}
            {deployedUnits.length === 0 && (
              <div className="p-4 text-center text-[10px] text-slate-500 italic border border-dashed border-slate-800 rounded">
                No units deployed yet. Tap a unit on the left to deploy onto the 2.5D arena.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
