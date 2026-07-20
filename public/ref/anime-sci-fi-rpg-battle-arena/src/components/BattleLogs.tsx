import { useEffect, useRef } from 'react';
import { BattleLog } from '../types';
import { Terminal, Trash2 } from 'lucide-react';
import { sounds } from './SoundSystem';

interface BattleLogsProps {
  logs: BattleLog[];
  onClearLogs: () => void;
}

export default function BattleLogs({ logs, onClearLogs }: BattleLogsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogStyle = (type: BattleLog['type']) => {
    switch (type) {
      case 'damage':
        return 'text-rose-400 font-mono border-l-2 border-rose-500/50 pl-2 py-0.5 my-0.5 bg-rose-950/10';
      case 'heal':
        return 'text-emerald-400 font-mono border-l-2 border-emerald-500/50 pl-2 py-0.5 my-0.5 bg-emerald-950/10';
      case 'shield':
        return 'text-sky-400 font-mono border-l-2 border-sky-500/50 pl-2 py-0.5 my-0.5 bg-sky-950/10';
      case 'buff':
        return 'text-yellow-400 font-mono border-l-2 border-yellow-500/50 pl-2 py-0.5 my-0.5 bg-yellow-950/10';
      case 'debuff':
        return 'text-purple-400 font-mono border-l-2 border-purple-500/50 pl-2 py-0.5 my-0.5 bg-purple-950/10';
      case 'death':
        return 'text-red-500 font-bold font-mono border-l-2 border-red-600 pl-2 py-1 my-1 bg-red-950/20';
      case 'ultimate':
        return 'text-cyan-400 font-bold uppercase tracking-wide font-mono border-l-2 border-cyan-400 pl-2 py-1 my-1 bg-cyan-950/30 animate-pulse';
      case 'system':
      default:
        return 'text-slate-400 font-mono border-l-2 border-slate-700 pl-2 py-0.5 my-0.5';
    }
  };

  const handleClear = () => {
    sounds.playBleep();
    onClearLogs();
  };

  return (
    <div className="glass-panel rounded-xl p-3 flex flex-col h-full relative overflow-hidden">
      {/* Hologram horizontal line scan */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-cyan-500/30 animate-pulse" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Combat Feed Log</span>
        </div>
        <button
          id="clear-logs-btn"
          onClick={handleClear}
          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
          title="Clear Feed Log"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Logs Feed Container */}
      <div
        id="logs-container"
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-1.5 text-[10px] sm:text-[11px] pr-1.5 font-mono leading-relaxed select-all no-scrollbar"
        style={{ maxHeight: 'calc(100% - 28px)' }}
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
            <span className="text-[10px] uppercase font-mono tracking-widest animate-pulse">
              [ TRANSCEIVER SILENT ]
            </span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`${getLogStyle(log.type)} transition-all duration-300`}>
              <span className="text-slate-600 mr-1.5 font-mono select-none">
                {`[${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]`}
              </span>
              <span>{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
