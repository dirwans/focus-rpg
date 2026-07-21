import React from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Film, 
  FolderPlus,
  Compass,
  Layers,
  Zap,
  Repeat
} from 'lucide-react';
import { SpritesheetAnimation, SpriteSlice } from '../types';

interface TimelineProps {
  animations: SpritesheetAnimation[];
  activeAnimId: string;
  setActiveAnimId: (id: string) => void;
  currentFrameIndex: number;
  setCurrentFrameIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onAddAnimation: (name: string, fps: number) => void;
  onDeleteAnimation: (id: string) => void;
  onRemoveFrameFromAnim: (index: number) => void;
  onMoveFrame: (index: number, direction: 'left' | 'right') => void;
  slices: SpriteSlice[];
  imgUrl: string | null;
  imageDimensions: { w: number; h: number };
}

export default function Timeline({
  animations,
  activeAnimId,
  setActiveAnimId,
  currentFrameIndex,
  setCurrentFrameIndex,
  isPlaying,
  setIsPlaying,
  onAddAnimation,
  onDeleteAnimation,
  onRemoveFrameFromAnim,
  onMoveFrame,
  slices,
  imgUrl,
  imageDimensions
}: TimelineProps) {
  const activeAnim = animations.find(a => a.id === activeAnimId) || animations[0];
  const [newAnimName, setNewAnimName] = React.useState('');
  const [newAnimFps, setNewAnimFps] = React.useState(6);
  const [showAddForm, setShowAddForm] = React.useState(false);

  const handleCreateAnim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnimName.trim()) return;
    onAddAnimation(newAnimName, newAnimFps);
    setNewAnimName('');
    setShowAddForm(false);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl select-none" id="retro_timeline_panel">
      {/* Timeline Header & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-850 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest">
              Garis Waktu (Timeline)
            </h3>
          </div>

          {/* Animation group selector */}
          <div className="flex items-center gap-2">
            <select
              value={activeAnimId}
              onChange={(e) => {
                setActiveAnimId(e.target.value);
                setCurrentFrameIndex(0);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-bold focus:outline-none focus:border-emerald-500/50"
            >
              {animations.map((anim) => (
                <option key={anim.id} value={anim.id}>
                  🎬 {anim.name} ({anim.frames.length} Frame)
                </option>
              ))}
            </select>

            {/* Quick delete button */}
            {animations.length > 1 && (
              <button
                onClick={() => onDeleteAnimation(activeAnimId)}
                className="p-1 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded transition-colors"
                title="Hapus Grup Animasi Ini"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Playback Controls & New Anim trigger */}
        <div className="flex items-center gap-2.5">
          {/* Play / Pause button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-all ${
              isPlaying 
                ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-[0_0_12px_rgba(234,179,8,0.2)]' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            }`}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlaying ? 'PAUSE' : 'MAINKAN'}</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
          >
            <FolderPlus className="h-3.5 w-3.5 text-indigo-400" />
            <span>+ Anim Baru</span>
          </button>
        </div>
      </div>

      {/* Add Anim form drop */}
      {showAddForm && (
        <form onSubmit={handleCreateAnim} className="flex flex-wrap items-end gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Nama Animasi</label>
            <input
              type="text"
              value={newAnimName}
              onChange={(e) => setNewAnimName(e.target.value)}
              placeholder="Contoh: Lompat Tinggi"
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-650 font-semibold focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase">Kecepatan (FPS)</label>
            <select
              value={newAnimFps}
              onChange={(e) => setNewAnimFps(parseInt(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-250 font-semibold focus:outline-none focus:border-emerald-500"
            >
              {[2, 4, 6, 8, 10, 12, 16].map((fpsVal) => (
                <option key={fpsVal} value={fpsVal}>{fpsVal} FPS</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs cursor-pointer transition-colors"
          >
            Buat
          </button>
        </form>
      )}

      {/* Filmstrip Tracks */}
      <div className="flex-1 overflow-x-auto py-2 flex items-center gap-3 bg-slate-950 rounded-xl p-3 border border-slate-850/60 min-h-[140px] relative scrollbar-thin">
        {activeAnim.frames.length > 0 ? (
          activeAnim.frames.map((sliceId, index) => {
            const isActive = index === currentFrameIndex;
            const slice = slices.find(s => s.id === sliceId);

            return (
              <div
                key={`${sliceId}-${index}`}
                onClick={() => setCurrentFrameIndex(index)}
                className={`flex-shrink-0 w-24 h-28 rounded-lg border transition-all cursor-pointer relative group flex flex-col justify-between overflow-hidden p-1.5 ${
                  isActive 
                    ? 'bg-indigo-950/40 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.25)] z-15' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Index badge */}
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] font-extrabold font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-950 text-slate-500'
                  }`}>
                    #{index + 1}
                  </span>

                  {/* Frame slice name */}
                  <span className="text-[8px] font-bold text-slate-400 truncate max-w-[50px]">
                    {slice?.name || 'Frame'}
                  </span>
                </div>

                {/* Filmstrip Frame Mini Canvas Image Preview */}
                <div className="w-full h-12 rounded bg-slate-950/80 border border-slate-850/60 flex items-center justify-center overflow-hidden my-1 relative">
                  {slice && imgUrl ? (
                    (() => {
                      const maxThumbSize = 36;
                      const scale = Math.min(maxThumbSize / slice.width, maxThumbSize / slice.height);
                      const dispW = slice.width * scale;
                      const dispH = slice.height * scale;
                      const bgSizeW = imageDimensions.w * scale;
                      const bgSizeH = imageDimensions.h * scale;
                      const bgPosX = -slice.x * scale;
                      const bgPosY = -slice.y * scale;

                      return (
                        <div
                          style={{
                            width: `${dispW}px`,
                            height: `${dispH}px`,
                            backgroundImage: `url("${imgUrl}")`,
                            backgroundSize: `${bgSizeW}px ${bgSizeH}px`,
                            backgroundPosition: `${bgPosX}px ${bgPosY}px`,
                            backgroundRepeat: 'no-repeat',
                            imageRendering: 'pixelated',
                            transform: `scale(${slice.flipH ? -1 : 1}, ${slice.flipV ? -1 : 1})`,
                          }}
                        />
                      );
                    })()
                  ) : (
                    <div className="text-[7px] text-slate-600">No Image</div>
                  )}
                </div>

                {/* Quick actions row inside film strip */}
                <div className="flex justify-between items-center pt-1 border-t border-slate-850/80">
                  <div className="flex items-center gap-0.5">
                    {/* Shift frame left */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveFrame(index, 'left');
                      }}
                      disabled={index === 0}
                      className="p-0.5 hover:bg-slate-850 disabled:opacity-20 text-slate-400 hover:text-slate-200 rounded"
                      title="Geser Kiri"
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </button>
                    {/* Shift frame right */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveFrame(index, 'right');
                      }}
                      disabled={index === activeAnim.frames.length - 1}
                      className="p-0.5 hover:bg-slate-850 disabled:opacity-20 text-slate-400 hover:text-slate-200 rounded"
                      title="Geser Kanan"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Delete from timeline */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFrameFromAnim(index);
                    }}
                    className="p-0.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded transition-colors"
                    title="Hapus dari sekuens"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
            <Film className="h-7 w-7 mb-1 text-slate-700 animate-pulse" />
            <p className="text-[10px] font-bold">Garis waktu kosong Mbah</p>
            <p className="text-[9px] text-slate-700">Pilih potongan di atas lalu tekan "Pasang ke Linimasa"</p>
          </div>
        )}
      </div>
    </div>
  );
}
