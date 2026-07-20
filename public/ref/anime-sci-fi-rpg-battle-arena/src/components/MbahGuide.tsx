import React, { useState } from 'react';
import { Bot, X, Sparkles, BookOpen, Volume2, ShieldAlert, Cpu } from 'lucide-react';
import { sounds } from './SoundSystem';

interface Tip {
  title: string;
  javanese: string;
  translation: string;
  icon: React.ReactNode;
}

export default function MbahGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTip, setActiveTip] = useState(0);

  const tips: Tip[] = [
    {
      title: "Mekanisme Giliran (Turn System)",
      javanese: "Sabar mbah, gilirane diatur karo kacepetan (Speed) neng panel timeline dhuwur. Sopo sing luwih banter, iso nyerang disik!",
      translation: "Kecepatan (Speed) menentukan urutan aksi di timeline atas. Karakter berkecepatan tinggi mendapat giliran menyerang lebih cepat!",
      icon: <Cpu className="w-5 h-5 text-cyan-400" />
    },
    {
      title: "Race Elf (Aliansi Utama)",
      javanese: "Elf niku duwe Speed dhuwur karo kritis masif! Sabetan pedang neon Aurelia karo Sylas dienggo nggo nge-burst robot musuh.",
      translation: "Bangsa Elf memiliki Kecepatan tinggi dan kritikal masif. Gunakan Aurelia (Healer) dan Sylas (DPS) untuk melumpuhkan musuh dengan cepat.",
      icon: <Sparkles className="w-5 h-5 text-emerald-400" />
    },
    {
      title: "Race Human (Aliansi Utama)",
      javanese: "Menungso niku bakoh banget mbah! Tameng (Shield) gravitasi Commander Marcus iso nahan gempuran meriam robot.",
      translation: "Bangsa Manusia memiliki pertahanan Shield yang kokoh. Tameng gravitasi Cmdr. Marcus sangat efektif untuk menahan serangan musuh.",
      icon: <BookOpen className="w-5 h-5 text-sky-400" />
    },
    {
      title: "Sinergi Robot (Musuh)",
      javanese: "Waspodo mbah! Robot Nexus Overlord niku iso ngetokke laser kiamat (Ultimate AoE) nek barisane ra cepet-cepet dipatheni!",
      translation: "Waspada! Robot Nexus Overlord memiliki laser kiamat yang menyerang semua sekutu secara masif jika energinya penuh.",
      icon: <ShieldAlert className="w-5 h-5 text-rose-500" />
    }
  ];

  const handleOpen = () => {
    sounds.playBleep();
    setIsOpen(true);
  };

  const handleClose = () => {
    sounds.playBleep();
    setIsOpen(false);
  };

  const handleNext = () => {
    sounds.playBleep();
    setActiveTip((prev) => (prev + 1) % tips.length);
  };

  return (
    <>
      {/* Floating Hologram Trigger Button */}
      <button
        id="mbah-guide-trigger"
        onClick={handleOpen}
        className="fixed bottom-4 right-4 bg-slate-900/90 border border-cyan-500/50 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 rounded-full p-3 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 z-40 group"
        title="Bantuan Mbah AI"
      >
        <div className="relative">
          <Bot className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-32 transition-all duration-300 font-mono text-xs font-semibold uppercase tracking-wider ml-0 group-hover:ml-2">
          Mbah AI
        </span>
      </button>

      {/* Holographic Guide Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-xl max-w-lg w-full overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.25)] relative">
            
            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] pointer-events-none z-10" />

            {/* Header */}
            <div className="bg-cyan-950/40 border-b border-cyan-500/30 px-5 py-4 flex items-center justify-between relative z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-950/60 border border-cyan-400/50 rounded-lg flex items-center justify-center relative shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                  <Bot className="w-6 h-6 text-cyan-400 animate-bounce" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-cyan-300 uppercase tracking-wider">
                    Mbah AI Holo-Advisor
                  </h3>
                  <p className="text-[10px] text-cyan-400/60 font-mono uppercase tracking-widest">
                    SYSTEM: ACTIVE / JAVANESE LOADED
                  </p>
                </div>
              </div>
              <button
                id="close-mbah-guide"
                onClick={handleClose}
                className="text-cyan-400/60 hover:text-cyan-300 cursor-pointer p-1 rounded-md hover:bg-cyan-950/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 relative z-20 space-y-5">
              {/* Animated Speech Bubble */}
              <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-4 relative shadow-inner">
                <div className="absolute -top-2 left-6 w-4 h-4 bg-slate-900 border-t border-l border-cyan-500/20 rotate-45" />
                
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider mb-2">
                  <Volume2 className="w-4 h-4 animate-pulse text-cyan-400" />
                  <span>Petuah Mbah AI:</span>
                </div>
                
                <p className="text-cyan-100 font-medium text-sm leading-relaxed italic">
                  "{tips[activeTip].javanese}"
                </p>

                <div className="mt-3 pt-3 border-t border-cyan-500/10">
                  <p className="text-slate-400 text-xs leading-relaxed">
                    <strong className="text-cyan-400/80 uppercase font-mono text-[10px] tracking-wider block mb-1">
                      Terjemahan Indonesia:
                    </strong>
                    {tips[activeTip].translation}
                  </p>
                </div>
              </div>

              {/* Tips Carousel Selector */}
              <div className="grid grid-cols-4 gap-2">
                {tips.map((tip, idx) => (
                  <button
                    key={idx}
                    id={`tip-select-${idx}`}
                    onClick={() => {
                      sounds.playBleep();
                      setActiveTip(idx);
                    }}
                    className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                      activeTip === idx
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {tip.icon}
                    <span className="text-[9px] font-mono uppercase font-bold truncate max-w-full">
                      Tip {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-950/60 border-t border-slate-800/80 px-6 py-4 flex items-center justify-between relative z-20">
              <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" />
                <span>8 VS 8 BATTLE SCENE</span>
              </div>
              <button
                id="next-tip-btn"
                onClick={handleNext}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold px-4 py-2 rounded shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer flex items-center gap-1.5 uppercase"
              >
                <span>Siaap Mbah!</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
