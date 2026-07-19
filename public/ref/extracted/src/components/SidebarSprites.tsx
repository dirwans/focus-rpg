import React from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Grid as GridIcon, 
  Sparkles, 
  Cpu, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Plus,
  Play,
  RotateCcw,
  MessageSquare,
  Flame,
  Scissors
} from 'lucide-react';
import { PRESETS } from '../utils/presets';
import { SpriteSlice, SpritesheetAnimation, SlicerMode } from '../types';

interface SidebarSpritesProps {
  currentPresetId: string | null;
  onSelectPreset: (presetId: string) => void;
  onUploadCustomSprite: (name: string, dataUrl: string, width: number, height: number, cols?: number) => void;
  slicerMode: SlicerMode;
  setSlicerMode: (mode: SlicerMode) => void;
  gridCols: number;
  setGridCols: (cols: number) => void;
  gridRows: number;
  setGridRows: (rows: number) => void;
  onAutoSliceGrid: () => void;
  onResetWorkspace: () => void;
  onApplyAiGeneratedConfig: (name: string, slices: SpriteSlice[], animations: SpritesheetAnimation[]) => void;
}

export default function SidebarSprites({
  currentPresetId,
  onSelectPreset,
  onUploadCustomSprite,
  slicerMode,
  setSlicerMode,
  gridCols,
  setGridCols,
  gridRows,
  setGridRows,
  onAutoSliceGrid,
  onResetWorkspace,
  onApplyAiGeneratedConfig
}: SidebarSpritesProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = React.useState<'presets' | 'ai' | 'grid'>('presets');
  const [promptInput, setPromptInput] = React.useState<string>('');
  const [chatMessages, setChatMessages] = React.useState<Array<{ sender: 'ai' | 'user'; text: string; data?: any }>>([
    {
      sender: 'ai',
      text: 'Halo Mbah! Saya Asisten AI Spritesheet Mbah. 🤖✨\n\nMbah merasa pusing mainan tulang yang ribet? Tenang, sekarang kita pakai sistem Spritesheet yang legendaris dan super gampang!\n\nMbah bisa pilih contoh spritesheet siap pakai di tab "Contoh Spritesheet", atau ketik perintah di bawah untuk minta bantuan saya membuat sekuens gerakan!'
    }
  ]);
  const [isAiLoading, setIsAiLoading] = React.useState<boolean>(false);
  const [lastGeneratedConfig, setLastGeneratedConfig] = React.useState<any | null>(null);

  const [isDragging, setIsDragging] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    processFiles(e.target.files);
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    // Sort files alphabetically so frame_001, frame_002, frame_003 are processed in order
    fileArray.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    if (fileArray.length === 1) {
      const file = fileArray[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          onUploadCustomSprite(file.name, dataUrl, img.naturalWidth, img.naturalHeight);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    } else {
      // Multiple images! Stitch them side-by-side into a single horizontal spritesheet
      const promises = fileArray.map(file => {
        return new Promise<{ img: HTMLImageElement; name: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const img = new Image();
            img.onload = () => resolve({ img, name: file.name });
            img.onerror = () => reject(new Error(`Gagal memuat gambar ${file.name}`));
            img.src = dataUrl;
          };
          reader.onerror = () => reject(new Error(`Gagal membaca berkas ${file.name}`));
          reader.readAsDataURL(file);
        });
      });

      Promise.all(promises)
        .then(results => {
          const maxW = Math.max(...results.map(r => r.img.naturalWidth));
          const maxH = Math.max(...results.map(r => r.img.naturalHeight));
          const count = results.length;

          const canvas = document.createElement('canvas');
          canvas.width = maxW * count;
          canvas.height = maxH;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          results.forEach((res, index) => {
            const img = res.img;
            // Center the individual frame inside the maxW x maxH box
            const dx = index * maxW + (maxW - img.naturalWidth) / 2;
            const dy = (maxH - img.naturalHeight) / 2;
            ctx.drawImage(img, dx, dy);
          });

          const combinedDataUrl = canvas.toDataURL('image/png');
          
          onUploadCustomSprite(
            `Gabungan ${count} Frame (${fileArray[0].name.substring(0, 15)}...)`,
            combinedDataUrl,
            canvas.width,
            canvas.height,
            count
          );
        })
        .catch(err => {
          console.error(err);
          alert("Gagal memproses beberapa berkas: " + err.message);
        });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleAiGenerate = async (customPrompt?: string) => {
    const activePrompt = customPrompt || promptInput;
    if (!activePrompt.trim()) return;

    // Add user message to history
    setChatMessages((prev) => [...prev, { sender: 'user', text: activePrompt }]);
    if (!customPrompt) setPromptInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/generate-rig', { // Uses the same generator endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: activePrompt })
      });

      if (!res.ok) throw new Error('API server failed');
      const data = await res.json();

      setLastGeneratedConfig(data);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.message || `Selesai Mbah! Saya sudah memformulasikan susunan ${data.slices?.length || 4} frame potongan spritesheet lengkap dengan sekuens animasi (${data.animations?.[0]?.name || 'Idle'} & ${data.animations?.[1]?.name || 'Aksi'}).\n\nSilakan klik tombol hijau di bawah untuk menerapkan setelan ini ke canvas!`,
          data
        }
      ]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Waduh Mbah, sambungan ke AI sedang sibuk. Silakan coba lagi sebentar atau pakai contoh instan yang ada di sebelah kiri ya!'
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyConfigToWorkspace = (configData: any) => {
    if (!configData || !configData.slices) return;
    onApplyAiGeneratedConfig(configData.name, configData.slices, configData.animations || []);
  };

  return (
    <div className="w-full lg:w-[340px] flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg" id="sidebar_sprites_panel">
      {/* Sidebar Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/50 p-1 gap-1">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
            activeTab === 'presets' 
              ? 'bg-slate-800 text-emerald-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Contoh Spritesheet</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
            activeTab === 'ai' 
              ? 'bg-slate-800 text-emerald-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Tanya AI Mbah</span>
        </button>
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
            activeTab === 'grid' 
              ? 'bg-slate-800 text-emerald-400' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GridIcon className="h-3.5 w-3.5" />
          <span>Setelan Grid</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: PRESETS */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Karakter Siap Pakai
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Pilih salah satu karakter legendaris di bawah ini untuk langsung mencoba animasi spritesheet instan, Mbah:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {PRESETS.map((preset) => {
                const isSelected = preset.id === currentPresetId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    {/* Tiny Sprite Sheet Preview Strip */}
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800/80 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                      <img 
                        src={preset.imageUrl} 
                        alt={preset.name} 
                        className="max-w-none h-8 w-auto object-contain" 
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5 className={`text-xs font-bold truncate ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {preset.name}
                      </h5>
                      <span className="text-[9px] text-slate-500 block mt-0.5 font-mono uppercase tracking-wider">
                        Slicing: {preset.defaultCols} Kolom &times; {preset.defaultRows} Baris
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-800/60 my-4 pt-4" />

            {/* Custom PNG Upload section */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Pakai Spritesheet Sendiri
              </h4>
              <p className="text-[10px] text-slate-500">
                Punya gambar spritesheet sendiri? Upload di bawah dan tentukan baris/kolomnya:
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="spritesheet_uploader_input"
                multiple
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex flex-col items-center justify-center gap-2.5 py-6 px-4 border rounded-xl transition-all cursor-pointer text-center ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400 scale-[1.02]'
                    : 'border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950/50 hover:bg-emerald-500/5 text-slate-300 hover:text-emerald-400'
                }`}
                id="custom_upload_trigger_btn"
              >
                <Upload className={`h-6 w-6 transition-transform ${isDragging ? 'animate-bounce text-emerald-400' : 'text-slate-400'}`} />
                <div className="space-y-1">
                  <p className="text-xs font-bold">
                    {isDragging ? 'Cemplungno kene Mbah!' : 'Upload / Seret PNG kene Mbah'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isDragging ? 'Lepaskan mouse untuk upload' : 'Klik atau seret file gambar ke sini'}
                  </p>
                </div>
              </div>

              <p className="text-[9px] text-slate-500 text-center italic">
                Sangat disarankan memakai format PNG transparan Mbah
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: AI ASSISTANT CHAT */}
        {activeTab === 'ai' && (
          <div className="flex flex-col h-[400px]" id="sidebar_ai_chat_pane">
            {/* Message Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 max-w-[88%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' ? 'bg-indigo-600' : 'bg-emerald-500/10 border border-emerald-500/30'
                  }`}>
                    {msg.sender === 'user' ? (
                      <User className="h-3 w-3 text-white" />
                    ) : (
                      <Bot className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className={`p-2.5 rounded-xl leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-950/80 text-slate-300 border border-slate-800/60 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>

                    {/* Apply suggestion action button */}
                    {msg.data && (
                      <button
                        onClick={() => applyConfigToWorkspace(msg.data)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer shadow-lg"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Pasang Setelan AI Ini Mbah</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Loader2 className="h-3 w-3 text-emerald-400 animate-spin" />
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800/60 text-slate-400 p-2.5 rounded-xl text-[10px] italic">
                    Sedang memformulasikan koordinat... Sabar ya Mbah...
                  </div>
                </div>
              )}
            </div>

            {/* Input field */}
            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-1.5">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                placeholder="Minta bantuan Mbah AI..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={() => handleAiGenerate()}
                disabled={isAiLoading || !promptInput.trim()}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg transition-all cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: GRID CONFIGURATION */}
        {activeTab === 'grid' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Konfigurasi Kolom & Baris
              </h4>
              <p className="text-[10px] text-slate-500">
                Tentukan pembagian grid agar spritesheet dipotong secara rata & presisi, Mbah:
              </p>
            </div>

            {/* Grid Slicing Input Controls */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">
                  Jumlah Kolom (X)
                </label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={gridCols}
                  onChange={(e) => setGridCols(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">
                  Jumlah Baris (Y)
                </label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={gridRows}
                  onChange={(e) => setGridRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Slicer Mode Display Banner */}
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-lg text-[10px] text-slate-400 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <GridIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Rekomendasi Setelan</span>
              </div>
              <div>
                Rata-rata preset gambar kita menggunakan pembagian <b>4 Kolom &times; 1 Baris</b>, Mbah.
              </div>
            </div>

            {/* Quick Slicing triggers */}
            <button
              onClick={onAutoSliceGrid}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.01] active:scale-[0.99] rounded-lg text-white font-bold text-xs transition-all cursor-pointer shadow-md"
            >
              <GridIcon className="h-4 w-4" />
              <span>Potong Otomatis Sesuai Grid</span>
            </button>

            <div className="border-t border-slate-800/60 my-4 pt-4" />

            {/* Clear workspace actions */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                Pengaturan Bahaya
              </h4>
              <button
                onClick={onResetWorkspace}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-red-500/20 hover:border-red-500/40 rounded bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 transition-all cursor-pointer text-[11px] font-bold"
                id="custom_clear_trigger_btn"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Hapus / Kosongkan Canvas</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
