import { Character, Skill } from '../types';
import { Shield, Sparkles, Zap, Flame, Target, Award, Cpu, Swords, ZapOff } from 'lucide-react';
import { sounds } from './SoundSystem';

interface HUDPanelProps {
  selectedChar: Character | null;
  selectedTarget: Character | null;
  onExecuteSkill: (skill: Skill) => void;
  isAllyTurn: boolean;
  isAutoBattle: boolean;
  onToggleAutoBattle: () => void;
  onResetBattle: () => void;
  allEnemiesDead: boolean;
  allAlliesDead: boolean;
}

export default function HUDPanel({
  selectedChar,
  selectedTarget,
  onExecuteSkill,
  isAllyTurn,
  isAutoBattle,
  onToggleAutoBattle,
  onResetBattle,
  allEnemiesDead,
  allAlliesDead
}: HUDPanelProps) {

  const handleSkillClick = (skill: Skill) => {
    if (!isAllyTurn || isAutoBattle || !selectedChar || charIsOnCooldown(skill)) return;
    if (skill.type === 'ultimate' && selectedChar.energy < 100) {
      sounds.playBleep();
      return;
    }
    sounds.playBleep();
    onExecuteSkill(skill);
  };

  const charIsOnCooldown = (skill: Skill) => {
    return skill.currentCooldown > 0;
  };

  const getSkillIcon = (type: Skill['type']) => {
    switch (type) {
      case 'regular':
        return <Swords className="w-5 h-5 text-sky-400 group-hover:rotate-12 transition-transform" />;
      case 'skill':
        return <Sparkles className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />;
      case 'ultimate':
        return <Flame className="w-5 h-5 text-amber-400 animate-pulse" />;
    }
  };

  return (
    <div className="w-full glass-panel p-3 grid grid-cols-1 md:grid-cols-12 gap-3 relative z-30 overflow-hidden select-none">
      {/* Visual cybernetic aesthetic: corner bracket graphics */}
      <div className="absolute top-0 left-0 w-4 h-1 bg-cyan-400" />
      <div className="absolute top-0 left-0 w-1 h-4 bg-cyan-400" />
      <div className="absolute top-0 right-0 w-4 h-1 bg-cyan-400" />
      <div className="absolute top-0 right-0 w-1 h-4 bg-cyan-400" />

      {/* LEFT COMPARTMENT: Active character stats HUD (4 cols) */}
      <div className="md:col-span-5 bg-slate-900/50 border border-cyan-500/10 rounded-lg p-2.5 flex gap-3 relative">
        {selectedChar ? (
          <>
            {/* Class specific animated hologram thumbnail representation */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-950 rounded-lg border-2 border-cyan-500/40 relative overflow-hidden flex flex-col items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.25)] group">
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/50 to-transparent pointer-events-none" />
              {/* Scanline overlay inside */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.15)_50%)] bg-[size:100%_3px] pointer-events-none" />
              
              <div className={`text-center font-mono font-black text-xs p-1 rounded z-10 w-full select-none capitalize ${
                selectedChar.race === 'elf' ? 'text-emerald-400' : 'text-sky-400'
              }`}>
                {selectedChar.race}
              </div>
              <div className="text-slate-500 text-[10px] font-mono font-bold uppercase z-10">
                {selectedChar.role}
              </div>

              {/* Glowing vector indicator */}
              <div className="absolute bottom-1 w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping opacity-40" />
              <div className="absolute bottom-1 w-2 h-2 rounded-full bg-cyan-400" />
            </div>

            {/* Info details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-slate-100 uppercase tracking-wide truncate">
                  {selectedChar.name}
                </span>
                <span className="bg-cyan-950/80 text-[8px] font-mono font-bold text-cyan-400 border border-cyan-500/30 px-1.5 rounded tracking-widest uppercase">
                  ACTIVE
                </span>
              </div>

              <div className="mt-1.5 space-y-1">
                {/* HP */}
                <div className="space-y-0.5">
                  <div className="flex justify-between font-mono text-[9px] text-slate-400">
                    <span className="uppercase tracking-wider font-semibold">HP (Health)</span>
                    <span className="font-bold text-cyan-300">{selectedChar.hp} / {selectedChar.maxHp}</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-sm border border-slate-800/80 overflow-hidden relative">
                    <div
                      className="hp-bar-fill h-full transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, (selectedChar.hp / selectedChar.maxHp) * 100))}%` }}
                    />
                    {/* Shield overlay indicator on top */}
                    {selectedChar.shield > 0 && (
                      <div
                        className="absolute top-0 bottom-0 right-0 bg-sky-400/75 animate-pulse shadow-[0_0_5px_rgba(56,189,248,0.5)] transition-all duration-300"
                        style={{
                          left: `${Math.max(0, Math.min(100, (selectedChar.hp / selectedChar.maxHp) * 100))}%`,
                          width: `${Math.max(0, Math.min(100, (selectedChar.shield / selectedChar.maxHp) * 100))}%`
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Ultimate Charge gauge */}
                <div className="space-y-0.5">
                  <div className="flex justify-between font-mono text-[9px] text-slate-400">
                    <span className="uppercase tracking-wider font-semibold flex items-center gap-0.5">
                      <Zap className={`w-3 h-3 ${selectedChar.energy >= 100 ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
                      ENERGY (ULTI READY)
                    </span>
                    <span className={`font-bold ${selectedChar.energy >= 100 ? 'text-amber-400 font-extrabold animate-pulse' : 'text-slate-300'}`}>
                      {selectedChar.energy}%
                    </span>
                  </div>
                  <div className={`h-2 bg-slate-950 rounded-sm border overflow-hidden transition-all ${
                    selectedChar.energy >= 100 ? 'border-amber-500/60 shadow-[0_0_6px_rgba(245,158,11,0.25)]' : 'border-slate-800/80'
                  }`}>
                    <div
                      className={`h-full transition-all duration-300 ${
                        selectedChar.energy >= 100
                          ? 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-300 animate-pulse'
                          : 'mp-bar-fill'
                      }`}
                      style={{ width: `${selectedChar.energy}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-center text-slate-500 font-mono text-[11px] uppercase tracking-widest animate-pulse italic">
            [ SELECT ALLIED UNIT FOR HUD ]
          </div>
        )}
      </div>

      {/* MIDDLE COMPARTMENT: Tactical Command Deck (5 cols) */}
      <div className="md:col-span-5 bg-slate-900/50 border border-cyan-500/10 rounded-lg p-2 flex flex-col justify-between relative">
        <div className="flex justify-between items-center px-1 mb-1.5 flex-shrink-0">
          <div className="flex items-center gap-1 text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tactical Command Matrix</span>
          </div>

          {/* Current Target indicator */}
          {selectedTarget ? (
            <div className="bg-rose-950/40 border border-rose-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono text-[8px] text-rose-300 uppercase tracking-widest">
              <span className="w-1 h-1 bg-rose-500 rounded-full animate-ping" />
              <span>Target: {selectedTarget.name.split(' ')[0]}</span>
            </div>
          ) : (
            <div className="bg-slate-950/40 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-[8px] text-slate-500 uppercase tracking-widest">
              [ NO TARGET ]
            </div>
          )}
        </div>

        {selectedChar && isAllyTurn && !isAutoBattle ? (
          <div className="grid grid-cols-3 gap-2 flex-1">
            {selectedChar.skills.map((skill) => {
              const isOnCd = charIsOnCooldown(skill);
              const isUltReady = skill.type !== 'ultimate' || selectedChar.energy >= 100;
              const disabled = isOnCd || !isUltReady;

              return (
                <button
                  key={skill.id}
                  id={`skill-btn-${skill.id}`}
                  onClick={() => handleSkillClick(skill)}
                  disabled={disabled}
                  className={`relative flex flex-col justify-between items-center text-center p-1.5 rounded-lg border transition-all cursor-pointer select-none group h-full ${
                    disabled
                      ? 'bg-slate-950/60 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
                      : skill.type === 'ultimate'
                      ? 'bg-gradient-to-b from-amber-950/50 to-amber-900/10 border-amber-500 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'bg-slate-950/80 border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  }`}
                >
                  {/* Skill icon */}
                  <div className="p-1 rounded-full bg-slate-900 border border-slate-800 group-hover:border-cyan-400/40 transition-colors">
                    {getSkillIcon(skill.type)}
                  </div>

                  {/* Skill label */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wide group-hover:text-cyan-200 transition-colors">
                      {skill.name}
                    </span>
                    <span className="text-[7px] font-mono text-slate-500 leading-none capitalize mt-0.5">
                      {skill.type}
                    </span>
                  </div>

                  {/* Ultimate glowing banner or Cooldown cover overlay */}
                  {isOnCd && (
                    <div className="absolute inset-0 bg-slate-950/85 rounded-lg flex flex-col items-center justify-center font-mono text-[10px] text-rose-500 font-bold uppercase tracking-widest z-10">
                      <ZapOff className="w-3.5 h-3.5 mb-0.5 text-rose-500/80" />
                      <span>CD {skill.currentCooldown} T</span>
                    </div>
                  )}

                  {skill.type === 'ultimate' && !disabled && (
                    <span className="absolute -top-1 right-1 text-[7px] font-mono font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-1 rounded animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                      READY
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-3 bg-slate-950/30 rounded border border-slate-800/50">
            {isAutoBattle ? (
              <div className="flex flex-col items-center gap-1 font-mono text-xs text-amber-500 animate-pulse uppercase tracking-widest">
                <Cpu className="w-5 h-5 animate-spin text-amber-500" />
                <span>Auto Combat Engine Active</span>
              </div>
            ) : !selectedChar ? (
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                Select an allied sprite to direct targets
              </span>
            ) : (
              <span className="font-mono text-[10px] text-rose-500 uppercase tracking-widest animate-pulse">
                [ ENEMY TARGET INITIATIVE - WAITING ]
              </span>
            )}
          </div>
        )}
      </div>

      {/* RIGHT COMPARTMENT: Meta Controls / Modifiers (2 cols) */}
      <div className="md:col-span-2 bg-slate-900/50 border border-cyan-500/10 rounded-lg p-2 flex flex-row md:flex-col justify-between gap-2">
        {/* Toggle Auto Combat button */}
        <button
          id="toggle-auto-combat"
          onClick={() => {
            sounds.playBleep();
            onToggleAutoBattle();
          }}
          className={`flex-1 md:flex-initial py-2 px-3 rounded font-mono text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            isAutoBattle
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-extrabold animate-pulse'
              : 'bg-slate-950/80 text-cyan-400 border-cyan-500/30 hover:border-cyan-400'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>{isAutoBattle ? 'AUTO ON' : 'AUTO OFF'}</span>
        </button>

        {/* Reset / restart battle simulation button */}
        <button
          id="reset-battle-simulation"
          onClick={() => {
            sounds.playBleep();
            onResetBattle();
          }}
          className="flex-1 md:flex-initial py-2 px-3 bg-slate-950/80 border border-rose-500/40 hover:border-rose-400 text-rose-400 hover:text-rose-300 rounded font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>RESTART</span>
        </button>
      </div>
    </div>
  );
}
