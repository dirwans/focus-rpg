import { Character } from '../types';
import { Sparkles, User, Bot, ChevronsRight } from 'lucide-react';

interface TurnOrderProps {
  characters: Character[];
  turnOrder: string[];
  currentTurnIndex: number;
}

export default function TurnOrder({ characters, turnOrder, currentTurnIndex }: TurnOrderProps) {
  // Get characters in chronological order starting from current
  const orderedList = turnOrder.map((id) => characters.find((c) => c.id === id)).filter(Boolean) as Character[];

  const getRaceIcon = (race: Character['race'], className: string) => {
    switch (race) {
      case 'elf':
        return <Sparkles className={`${className} text-emerald-400`} />;
      case 'human':
        return <User className={`${className} text-sky-400`} />;
      case 'robot':
        return <Bot className={`${className} text-rose-500 animate-pulse`} />;
    }
  };

  return (
    <div className="w-full bg-slate-900/30 border-b border-cyan-900/50 backdrop-blur-md px-4 py-2 flex items-center justify-between gap-3 relative z-30">
      {/* Visual Scanline decorative */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px]" />
      
      {/* Round & Queue Info */}
      <div className="flex items-center gap-2">
        <div className="bg-cyan-950/50 border border-cyan-400/50 px-2.5 py-1 rounded font-mono text-[11px] font-bold text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.25)] flex items-center gap-1.5 uppercase tracking-wider">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
          <span>Timeline</span>
        </div>
      </div>

      {/* Queue */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-2 max-w-[80%]">
        {orderedList.map((char, idx) => {
          const isCurrent = idx === 0;
          const isAlly = char.side === 'ally';
          
          return (
            <div key={`${char.id}-${idx}`} className="flex items-center gap-1 flex-shrink-0">
              {idx > 0 && <ChevronsRight className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />}
              
              <div
                id={`timeline-char-${char.id}`}
                className={`relative flex items-center gap-1.5 rounded-lg border px-2 py-1 transition-all ${
                  isCurrent
                    ? isAlly
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)] scale-105'
                      : 'bg-rose-950/60 border-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.3)] scale-105'
                    : isAlly
                    ? 'bg-slate-900/60 border-cyan-900/50 hover:border-cyan-700 opacity-80'
                    : 'bg-slate-900/60 border-rose-950/50 hover:border-rose-800 opacity-80'
                }`}
              >
                {/* Race icon indicator */}
                <div className="flex-shrink-0 p-0.5 rounded bg-slate-950/80 border border-slate-800">
                  {getRaceIcon(char.race, "w-3 h-3")}
                </div>

                {/* Name */}
                <div className="flex flex-col">
                  <span className={`text-[9px] font-bold font-mono truncate max-w-[70px] uppercase tracking-wide ${
                    isCurrent 
                      ? isAlly ? 'text-cyan-200' : 'text-rose-200'
                      : 'text-slate-300'
                  }`}>
                    {char.name.split(' ')[0]}
                  </span>
                  <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                    SPD {char.speed}
                  </span>
                </div>

                {/* HP percentage bar mini indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-950 rounded-b-lg overflow-hidden">
                  <div
                    className={`h-full ${isAlly ? 'bg-cyan-400' : 'bg-rose-500'}`}
                    style={{ width: `${Math.max(0, Math.min(100, (char.hp / char.maxHp) * 100))}%` }}
                  />
                </div>

                {/* Current Active Crown/Arrow */}
                {isCurrent && (
                  <span className={`absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] font-mono font-black uppercase px-1 rounded border tracking-widest ${
                    isAlly 
                      ? 'bg-cyan-400 border-cyan-300 text-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                      : 'bg-rose-500 border-rose-400 text-slate-950 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                  }`}>
                    NEXT
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Speed Multiplier / Autoplay Info (Decorative Right panel) */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest">
          Engine Hz
        </span>
        <div className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
          60 FPS
        </div>
      </div>
    </div>
  );
}
