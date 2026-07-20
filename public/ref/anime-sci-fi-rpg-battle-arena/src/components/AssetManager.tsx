import React, { useState, useEffect } from 'react';
import { Image, User, Shield, Sliders, Check, RefreshCw, X, HelpCircle, FileImage, Sparkles, Upload } from 'lucide-react';
import { sounds } from './SoundSystem';

export interface CustomAssetsConfig {
  backgroundUrl: string;
  characterAvatars: Record<string, string>;
}

interface AssetManagerProps {
  config: CustomAssetsConfig;
  onUpdateConfig: (newConfig: CustomAssetsConfig) => void;
}

const LOCAL_STORAGE_KEY = 'cyber_battle_custom_assets';

export const defaultAssetsConfig: CustomAssetsConfig = {
  backgroundUrl: '',
  characterAvatars: {
    // Allies
    ally_aurelia: '',
    ally_kaelen: '',
    ally_sylas: '',
    ally_elara: '',
    ally_marcus: '',
    ally_valkyrie: '',
    ally_zephyr: '',
    ally_nova: '',
    // Enemies
    enemy_titan: '',
    enemy_quantum: '',
    enemy_scythe: '',
    enemy_sniper: '',
    enemy_aegis: '',
    enemy_nanoswarm: '',
    enemy_sentinel: '',
    enemy_overlord: '',
  }
};

export default function AssetManager({ config, onUpdateConfig }: AssetManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bg' | 'allies' | 'enemies'>('bg');
  const [localConfig, setLocalConfig] = useState<CustomAssetsConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    sounds.playBleep();
    onUpdateConfig(localConfig);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localConfig));
    setIsOpen(false);
  };

  const handleReset = () => {
    sounds.playBleep();
    if (confirm('Balekake konfigurasi awal (reset)?')) {
      setLocalConfig(defaultAssetsConfig);
      onUpdateConfig(defaultAssetsConfig);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const updateAvatar = (id: string, url: string) => {
    setLocalConfig(prev => ({
      ...prev,
      characterAvatars: {
        ...prev.characterAvatars,
        [id]: url
      }
    }));
  };

  const updateBg = (url: string) => {
    setLocalConfig(prev => ({
      ...prev,
      backgroundUrl: url
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'bg' | string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Downscale for performance and local storage limits
        const maxDimension = target === 'bg' ? 1200 : 300;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          if (target === 'bg') {
            updateBg(compressedDataUrl);
          } else {
            updateAvatar(target, compressedDataUrl);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Pre-fill with cool internet art as an example
  const loadDemoAssets = () => {
    sounds.playBleep();
    const demoConfig: CustomAssetsConfig = {
      backgroundUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
      characterAvatars: {
        ally_aurelia: 'https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=150&auto=format&fit=crop&q=60', // Neon anime avatar
        ally_kaelen: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=60',
        ally_sylas: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&auto=format&fit=crop&q=60',
        ally_elara: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=60',
        ally_marcus: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=60',
        ally_valkyrie: '',
        ally_zephyr: '',
        ally_nova: '',
        enemy_titan: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=60', // Robot avatar
        enemy_quantum: '',
        enemy_scythe: '',
        enemy_sniper: '',
        enemy_aegis: '',
        enemy_nanoswarm: '',
        enemy_sentinel: '',
        enemy_overlord: '',
      }
    };
    setLocalConfig(demoConfig);
  };

  const characterNames: Record<string, string> = {
    ally_aurelia: 'Aurelia Stella (Healer)',
    ally_kaelen: 'Kaelen Cyberbow (DPS)',
    ally_sylas: 'Sylas Neon-Blade (DPS)',
    ally_elara: 'Elara Swiftstar (Control)',
    ally_marcus: 'Cmdr. Marcus (Tank)',
    ally_valkyrie: 'Valkyrie V-1 (DPS)',
    ally_zephyr: 'Zephyr Recon (Control)',
    ally_nova: 'Nova Shieldguard (Tank)',
    enemy_titan: 'Tan Siege Crawler ZX-07 (Tank)',
    enemy_quantum: 'Null-Quantum Orb (DPS)',
    enemy_scythe: 'Cyber-Scythe v3 (DPS)',
    enemy_sniper: 'Mecha-Sniper X (DPS)',
    enemy_aegis: 'Aegis Defender S5 (Tank)',
    enemy_nanoswarm: 'Nanoswarm Nest (Healer)',
    enemy_sentinel: 'R-90 Sentinel Dual (Control)',
    enemy_overlord: 'Nexus Overlord C9 (DPS)',
  };

  return (
    <>
      {/* Floating trigger button inside top dashboard / control bar area */}
      <button
        id="asset-manager-trigger"
        onClick={() => {
          sounds.playBleep();
          setIsOpen(true);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-purple-500/50 text-purple-400 hover:text-purple-300 hover:border-purple-400 text-xs font-mono uppercase tracking-wider cursor-pointer shadow-[0_0_10px_rgba(168,85,247,0.1)] transition-all"
        title="Custom Asset & Background Settings"
      >
        <Sliders className="w-3.5 h-3.5 animate-pulse" />
        <span>Custom Assets</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-[9999] p-2 sm:p-4 font-sans">
          <div className="bg-slate-900 border-2 border-purple-500/60 rounded-xl max-w-2xl w-full overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3)] relative flex flex-col max-h-[82vh] sm:max-h-[85vh]">
            
            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent z-10" />
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] z-10" />

            {/* Header */}
            <div className="bg-purple-950/40 border-b border-purple-500/30 px-3.5 py-2 flex items-center justify-between relative z-20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-950/60 border border-purple-400/50 rounded flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-mono text-xs font-bold text-purple-300 uppercase tracking-wider">
                    Custom Asset & Sprites Config
                  </h3>
                  <p className="text-[8px] text-purple-400/60 font-mono uppercase tracking-widest">
                    SYSTEM: ONLINE / PNG REPLACEMENT LOADED
                  </p>
                </div>
              </div>
              <button
                id="close-asset-manager"
                onClick={() => {
                  sounds.playBleep();
                  setLocalConfig(config); // Revert unsaved edits back to saved config
                  setIsOpen(false);
                }}
                className="text-purple-400/60 hover:text-purple-300 cursor-pointer p-1 rounded hover:bg-purple-950/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Info Notice (Indonesian & Javanese explaining the upload process) */}
            <div className="bg-purple-950/25 border-b border-purple-500/10 px-3.5 py-1.5 text-[10px] text-purple-200/95 font-mono relative z-20 space-y-1">
              <div className="flex items-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <p>
                    <strong className="text-purple-300">Unggah Gambar:</strong> Klik tombol <span className="text-purple-300 font-bold">"Pilih File"</span> nggo upload gambar langsung teko HP utawi Komputer (C:), utawi seret file <code className="bg-purple-950 px-1 py-0.5 rounded border border-purple-800 text-purple-300">.png</code> mlebet folder editor, utawi paste link URL internet langsung (https://...).
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 relative z-20">
              <button
                id="tab-select-bg"
                onClick={() => { sounds.playBleep(); setActiveTab('bg'); }}
                className={`flex-1 py-2 text-[11px] font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'bg'
                    ? 'border-purple-500 text-purple-300 bg-purple-950/10'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
                }`}
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>Battle Ground</span>
              </button>
              <button
                id="tab-select-allies"
                onClick={() => { sounds.playBleep(); setActiveTab('allies'); }}
                className={`flex-1 py-2 text-[11px] font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'allies'
                    ? 'border-purple-500 text-purple-300 bg-purple-950/10'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Aliansi Elves & Humans</span>
              </button>
              <button
                id="tab-select-enemies"
                onClick={() => { sounds.playBleep(); setActiveTab('enemies'); }}
                className={`flex-1 py-2 text-[11px] font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'enemies'
                    ? 'border-purple-500 text-purple-300 bg-purple-950/10'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Robot Enemies</span>
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 relative z-20 space-y-3">
              {activeTab === 'bg' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Arena Background Image Path / URL
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <input
                          id="input-bg-url"
                          type="text"
                          value={localConfig.backgroundUrl}
                          onChange={(e) => updateBg(e.target.value)}
                          placeholder="e.g. /background.png utawi link https://..."
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500/80 pl-8 pr-16"
                        />
                        <Image className="w-4 h-4 text-purple-500 absolute left-2.5 top-2.5" />
                        <span className="absolute right-2.5 top-2.5 font-mono text-[9px] text-slate-500">URL / Path</span>
                      </div>
                      
                      {/* Local File Picker */}
                      <div className="shrink-0">
                        <input
                          id="file-bg"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'bg')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playBleep();
                            document.getElementById('file-bg')?.click();
                          }}
                          className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-300 rounded font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all uppercase whitespace-nowrap h-full"
                          title="Unggah gambar saka HP/Komputer"
                        >
                          <Upload className="w-3.5 h-3.5 text-purple-400" />
                          <span>Pilih File</span>
                        </button>
                      </div>

                      {localConfig.backgroundUrl && (
                        <button
                          id="clear-bg-btn"
                          onClick={() => updateBg('')}
                          className="p-2 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950 rounded cursor-pointer transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Kosongno nggo nggunakake background sirkuit holo-grid bawaan bawaan (default).
                    </p>
                  </div>

                  {localConfig.backgroundUrl && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">Preview Background:</span>
                      <div className="h-44 rounded-lg overflow-hidden border border-purple-500/20 bg-slate-950 flex items-center justify-center relative">
                        <img
                          src={localConfig.backgroundUrl}
                          alt="Background Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/1000x600/0f172a/a855f7?text=Gambar+Ora+Ditemokake';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-2 left-3 font-mono text-[9px] uppercase tracking-wider text-purple-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-purple-500/30">
                          Holographic grid lines will superimpose nicely over this background
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

               {activeTab === 'allies' && (
                <div className="space-y-4 animate-fade-in divide-y divide-slate-800/60">
                  {Object.keys(localConfig.characterAvatars)
                    .filter((id) => id.startsWith('ally_'))
                    .map((id) => (
                      <div key={id} className="pt-3 first:pt-0 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="w-full sm:w-1/3 shrink-0">
                          <label className="block text-xs font-mono font-bold text-slate-300">
                            {characterNames[id]}
                          </label>
                          <span className="text-[9px] font-mono text-cyan-500 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/10 mt-1 inline-block">
                            ID: {id}
                          </span>
                        </div>
                        <div className="flex-1 w-full flex gap-2 items-center">
                          <div className="relative flex-1">
                            <input
                              id={`input-avatar-${id}`}
                              type="text"
                              value={localConfig.characterAvatars[id]}
                              onChange={(e) => updateAvatar(id, e.target.value)}
                              placeholder="e.g. /my_avatar.png utawi link URL"
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500/80 pr-16"
                            />
                            <span className="absolute right-2 top-2.5 font-mono text-[8px] text-slate-500">URL</span>
                          </div>

                          {/* File input for character */}
                          <div className="shrink-0">
                            <input
                              id={`file-avatar-${id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, id)}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playBleep();
                                document.getElementById(`file-avatar-${id}`)?.click();
                              }}
                              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-300 rounded font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-all uppercase whitespace-nowrap"
                              title="Pilih file gambar saka komputer"
                            >
                              <Upload className="w-3 h-3 text-purple-400" />
                              <span>Pilih File</span>
                            </button>
                          </div>

                          {localConfig.characterAvatars[id] && (
                            <div className="w-8 h-8 rounded border border-purple-500/30 bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center relative group">
                              <img
                                src={localConfig.characterAvatars[id]}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/150/0f172a/a855f7?text=❌';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => updateAvatar(id, '')}
                                className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 hover:text-rose-300 transition-opacity"
                                title="Hapus Gambar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {activeTab === 'enemies' && (
                <div className="space-y-4 animate-fade-in divide-y divide-slate-800/60">
                  {Object.keys(localConfig.characterAvatars)
                    .filter((id) => id.startsWith('enemy_'))
                    .map((id) => (
                      <div key={id} className="pt-3 first:pt-0 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="w-full sm:w-1/3 shrink-0">
                          <label className="block text-xs font-mono font-bold text-slate-300">
                            {characterNames[id]}
                          </label>
                          <span className="text-[9px] font-mono text-rose-500 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/10 mt-1 inline-block">
                            ID: {id}
                          </span>
                        </div>
                        <div className="flex-1 w-full flex gap-2 items-center">
                          <div className="relative flex-1">
                            <input
                              id={`input-avatar-${id}`}
                              type="text"
                              value={localConfig.characterAvatars[id]}
                              onChange={(e) => updateAvatar(id, e.target.value)}
                              placeholder="e.g. /my_enemy.png utawi link URL"
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-purple-200 focus:outline-none focus:border-purple-500/80 pr-16"
                            />
                            <span className="absolute right-2 top-2.5 font-mono text-[8px] text-slate-500">URL</span>
                          </div>

                          {/* File input for character */}
                          <div className="shrink-0">
                            <input
                              id={`file-avatar-${id}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, id)}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playBleep();
                                document.getElementById(`file-avatar-${id}`)?.click();
                              }}
                              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-300 rounded font-mono text-[10px] flex items-center gap-1 cursor-pointer transition-all uppercase whitespace-nowrap"
                              title="Pilih file gambar saka komputer"
                            >
                              <Upload className="w-3 h-3 text-purple-400" />
                              <span>Pilih File</span>
                            </button>
                          </div>

                          {localConfig.characterAvatars[id] && (
                            <div className="w-8 h-8 rounded border border-purple-500/30 bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center relative group">
                              <img
                                src={localConfig.characterAvatars[id]}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/150/0f172a/a855f7?text=❌';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => updateAvatar(id, '')}
                                className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 hover:text-rose-300 transition-opacity"
                                title="Hapus Gambar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="bg-slate-950/60 border-t border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between relative z-20">
              <div className="flex gap-2">
                <button
                  id="reset-assets-btn"
                  onClick={handleReset}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-slate-200 font-mono text-[10px] px-3 py-2 rounded border border-slate-800 uppercase cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Bawaan</span>
                </button>
                <button
                  id="load-demo-assets-btn"
                  onClick={loadDemoAssets}
                  className="bg-purple-950/40 hover:bg-purple-950/80 text-purple-300 hover:text-purple-200 font-mono text-[10px] px-3 py-2 rounded border border-purple-500/30 uppercase cursor-pointer flex items-center gap-1"
                  title="Masang gambar internet nggo demo cepet"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Isi Demo Online</span>
                </button>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  id="cancel-assets-btn"
                  onClick={() => {
                    sounds.playBleep();
                    setLocalConfig(config); // Revert unsaved edits back to saved config
                    setIsOpen(false);
                  }}
                  className="flex-1 sm:flex-none bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-4 py-2 rounded font-mono text-xs uppercase cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="save-assets-btn"
                  onClick={handleSave}
                  className="flex-1 sm:flex-none bg-purple-500 hover:bg-purple-400 text-slate-950 px-4 py-2 rounded font-mono text-xs font-bold uppercase cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Config</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
