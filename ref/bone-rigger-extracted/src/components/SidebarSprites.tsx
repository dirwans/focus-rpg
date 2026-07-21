import React from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Grid, 
  Eye, 
  EyeOff, 
  Sliders, 
  Palette, 
  Sparkles, 
  Cpu, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Wand2, 
  Plus,
  Play,
  RotateCcw,
  MessageSquare,
  Volume2,
  Flame,
  Sword
} from 'lucide-react';
import { PRESETS } from '../utils/presets';
import { Bone, Animation, Vector2D, ComicShout } from '../types';

interface SidebarSpritesProps {
  currentPresetId: string | null;
  onSelectPreset: (presetId: string) => void;
  onUploadCustomSprite: (name: string, dataUrl: string, width: number, height: number) => void;
  
  // Mesh config
  meshCols: number;
  setMeshCols: (val: number) => void;
  meshRows: number;
  setMeshRows: (val: number) => void;
  falloff: number;
  setFalloff: (val: number) => void;
  maxInfluences: number;
  setMaxInfluences: (val: number) => void;

  // Visual toggles
  showMesh: boolean;
  setShowMesh: (val: boolean) => void;
  showBones: boolean;
  setShowBones: (val: boolean) => void;
  showSprite: boolean;
  setShowSprite: (val: boolean) => void;
  boneOpacity: number;
  setBoneOpacity: (val: number) => void;
  meshOpacity: number;
  setMeshOpacity: (val: number) => void;

  onApplyAiGeneratedRig?: (
    name: string,
    bones: Bone[],
    animations: Animation[],
    imageUrl?: string | null,
    imgSize?: Vector2D
  ) => void;
  battleShout?: ComicShout | null;
  onTriggerShout?: (shout: ComicShout) => void;
  onOpenExpressionModal?: () => void;
}

export default function SidebarSprites({
  currentPresetId,
  onSelectPreset,
  onUploadCustomSprite,
  meshCols,
  setMeshCols,
  meshRows,
  setMeshRows,
  falloff,
  setFalloff,
  maxInfluences,
  setMaxInfluences,
  showMesh,
  setShowMesh,
  showBones,
  setShowBones,
  showSprite,
  setShowSprite,
  boneOpacity,
  setBoneOpacity,
  meshOpacity,
  setMeshOpacity,
  onApplyAiGeneratedRig,
  battleShout = null,
  onTriggerShout,
  onOpenExpressionModal
}: SidebarSpritesProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = React.useState<'presets' | 'ai' | 'battle'>('presets');
  const [promptInput, setPromptInput] = React.useState<string>('');
  const [customShoutText, setCustomShoutText] = React.useState<string>('HIAAAAAAT!');
  const [customShoutStyle, setCustomShoutStyle] = React.useState<'starburst' | 'cloud' | 'shock'>('starburst');
  const [chatMessages, setChatMessages] = React.useState<Array<{ sender: 'ai' | 'user'; text: string; data?: any }>>([
    {
      sender: 'ai',
      text: 'Halo Mbah! Saya Asisten AI Osteo. 🤖\n\nSaya bisa bantu Mbah memasang garis tulang dan gerakan "Serang Biasa" serta "Jurus Ulti" secara otomatis!\n\nMbah tinggal klik tombol contoh cepat di bawah, atau ketik langsung ide karakter Mbah di kolom pesan.'
    }
  ]);
  const [isAiLoading, setIsAiLoading] = React.useState<boolean>(false);
  const [lastGeneratedRig, setLastGeneratedRig] = React.useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      
      // Load image to get width and height
      const img = new Image();
      img.onload = () => {
        onUploadCustomSprite(file.name, dataUrl, img.naturalWidth, img.naturalHeight);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleAiGenerate = async (customPrompt?: string) => {
    const activePrompt = customPrompt || promptInput;
    if (!activePrompt.trim()) return;

    // Add user message to history
    setChatMessages((prev) => [...prev, { sender: 'user', text: activePrompt }]);
    if (!customPrompt) setPromptInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/generate-rig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: activePrompt })
      });

      if (!res.ok) throw new Error('API server failed');
      const data = await res.json();

      setLastGeneratedRig(data);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Selesai Mbah! Karakter "${data.name}" sudah dipasangi susunan ${data.bones.length} tulang lengkap dengan 2 gerakan (Serang Biasa & Jurus Ulti).\n\nSilakan klik tombol hijau di bawah untuk memasang karakter ini ke layar tengah!`,
          data
        }
      ]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Maaf Mbah, sambungan ke AI sedang sibuk. Silakan coba lagi sebentar lagi atau pakai contoh instan yang ada di atas ya!'
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyRigToWorkspace = (rigData: any, isAiGenerated: boolean = false) => {
    if (!onApplyAiGeneratedRig) return;
    
    // If the user has uploaded a custom image (currentPresetId is null) and this is an AI-generated rig,
    // we MUST NOT override the image URL and size! We should keep the user's custom image.
    if (currentPresetId === null && isAiGenerated) {
      onApplyAiGeneratedRig(rigData.name, rigData.bones, rigData.animations, undefined, undefined);
      return;
    }
    
    // Determine image url & size
    let matchedPresetImg = PRESETS[0].imageUrl; // Default to Hero/Warrior preset img
    let matchedSize: { x: number; y: number } = { x: 200, y: 240 };
    
    if (rigData.name.toLowerCase().includes('slime')) {
      matchedPresetImg = PRESETS[1].imageUrl;
      matchedSize = { x: 192, y: 192 };
    } else if (rigData.name.toLowerCase().includes('jellyfish') || rigData.name.toLowerCase().includes('jelly')) {
      matchedPresetImg = PRESETS[1].imageUrl; // Slime looks great as jelly base
      matchedSize = { x: 192, y: 192 };
    } else if (rigData.name.toLowerCase().includes('knight') || rigData.name.toLowerCase().includes('robot')) {
      matchedPresetImg = PRESETS[2].imageUrl;
      matchedSize = { x: 250, y: 250 };
    } else if (rigData.name.toLowerCase().includes('arm') || rigData.name.toLowerCase().includes('mech')) {
      matchedPresetImg = PRESETS[3].imageUrl;
      matchedSize = { x: 280, y: 180 };
    } else if (rigData.name.toLowerCase().includes('tree') || rigData.name.toLowerCase().includes('plant')) {
      matchedPresetImg = PRESETS[4].imageUrl;
      matchedSize = { x: 180, y: 260 };
    }

    onApplyAiGeneratedRig(rigData.name, rigData.bones, rigData.animations, matchedPresetImg, matchedSize);
  };

  const loadPresetTemplate = (type: 'warrior' | 'jelly' | 'mech') => {
    if (type === 'warrior') {
      applyRigToWorkspace({
        name: PRESETS[0].name,
        bones: PRESETS[0].defaultBones,
        animations: PRESETS[0].defaultAnimations
      });
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sip Mbah! Karakter Pendekar Gagah lengkap dengan susunan tulang dan gerakan Serang Biasa & Jurus Ulti (Melesat ➔ Lompat ➔ Tebas) sudah siap di layar tengah!'
        }
      ]);
    } else if (type === 'jelly') {
      const jellyRig = {
        name: "Wobbly AI Jellyfish",
        bones: [
          { id: "jelly_root", name: "Jelly Cap", parentId: null, restStart: { x: 100, y: 90 }, restEnd: { x: 100, y: 130 }, length: 40, restAngle: Math.PI/2, color: "#22D3EE" },
          { id: "jelly_left", name: "L Tentacle", parentId: "jelly_root", restStart: { x: 80, y: 130 }, restEnd: { x: 65, y: 190 }, length: 61.8, restAngle: 1.81, color: "#818CF8" },
          { id: "jelly_mid", name: "M Tentacle", parentId: "jelly_root", restStart: { x: 100, y: 130 }, restEnd: { x: 100, y: 200 }, length: 70, restAngle: Math.PI/2, color: "#F472B6" },
          { id: "jelly_right", name: "R Tentacle", parentId: "jelly_root", restStart: { x: 120, y: 130 }, restEnd: { x: 135, y: 190 }, length: 61.8, restAngle: 1.32, color: "#34D399" }
        ],
        animations: [
          {
            id: "jelly_swim",
            name: "Swim Flutter (Attack Biasa)",
            duration: 30,
            keyframes: [
              { frame: 0, boneTransforms: { jelly_root: { rotation: 0, translation: { x: 0, y: 0 } }, jelly_left: { rotation: 0, translation: { x: 0, y: 0 } }, jelly_right: { rotation: 0, translation: { x: 0, y: 0 } } } },
              { frame: 15, boneTransforms: { jelly_root: { rotation: 0, translation: { x: 0, y: -20 } }, jelly_left: { rotation: 0.4, translation: { x: 0, y: 0 } }, jelly_right: { rotation: -0.4, translation: { x: 0, y: 0 } } } },
              { frame: 30, boneTransforms: { jelly_root: { rotation: 0, translation: { x: 0, y: 0 } }, jelly_left: { rotation: 0, translation: { x: 0, y: 0 } }, jelly_right: { rotation: 0, translation: { x: 0, y: 0 } } } }
            ]
          },
          {
            id: "jelly_blast",
            name: "Hyper Tentacle Slam (Attack Ulti)",
            duration: 50,
            keyframes: [
              { frame: 0, boneTransforms: { jelly_root: { rotation: 0, translation: { x: 0, y: 0 } }, jelly_left: { rotation: 0, translation: { x: 0, y: 0 } }, jelly_mid: { rotation: 0, translation: { x: 0, y: 0 } }, jelly_right: { rotation: 0, translation: { x: 0, y: 0 } } } },
              { frame: 15, boneTransforms: { jelly_root: { rotation: 0.2, translation: { x: -15, y: 25 } }, jelly_left: { rotation: -0.6, translation: { x: 0, y: 0 } }, jelly_mid: { rotation: -0.3, translation: { x: 0, y: 0 } }, jelly_right: { rotation: 0.6, translation: { x: 0, y: 0 } } } },
              { frame: 30, boneTransforms: { jelly_root: { rotation: -0.3, translation: { x: 45, y: -45 } }, jelly_left: { rotation: 0.8, translation: { x: 0, y: 0 } }, jelly_mid: { rotation: 0, translation: { x: 0, y: 0 } }, jelly_right: { rotation: -0.8, translation: { x: 0, y: 0 } } } },
              { frame: 50, boneTransforms: { jelly_root: { rotation: 0, translation: { x: 0, y: 0 } }, jelly_left: { rotation: 0, translation: { x: 0, y: 0 } }, jelly_mid: { rotation: 0, translation: { x: 0, y: 0 } }, jelly_right: { rotation: 0, translation: { x: 0, y: 0 } } } }
            ]
          }
        ]
      };
      applyRigToWorkspace(jellyRig);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Siap Mbah! Karakter Ubur-ubur Lentur lengkap dengan tulang tentakel yang bisa goyang dan 2 gerakan sudah siap dimainkan!'
        }
      ]);
    } else if (type === 'mech') {
      const mechRig = {
        name: "AI Combat Mech Suit",
        bones: [
          { id: "mech_root", name: "Cockpit Core", parentId: null, restStart: { x: 100, y: 150 }, restEnd: { x: 100, y: 100 }, length: 50, restAngle: -Math.PI/2, color: "#EF4444" },
          { id: "mech_cannon", name: "Shoulder Laser", parentId: "mech_root", restStart: { x: 100, y: 100 }, restEnd: { x: 140, y: 80 }, length: 44.7, restAngle: -0.46, color: "#F59E0B" },
          { id: "mech_l_leg", name: "L Piston Leg", parentId: "mech_root", restStart: { x: 80, y: 150 }, restEnd: { x: 70, y: 210 }, length: 60.8, restAngle: 1.73, color: "#94A3B8" },
          { id: "mech_r_leg", name: "R Piston Leg", parentId: "mech_root", restStart: { x: 120, y: 150 }, restEnd: { x: 130, y: 210 }, length: 60.8, restAngle: 1.41, color: "#94A3B8" }
        ],
        animations: [
          {
            id: "mech_piston",
            name: "Piston Walk (Attack Biasa)",
            duration: 40,
            keyframes: [
              { frame: 0, boneTransforms: { mech_l_leg: { rotation: 0, translation: { x: 0, y: 0 } }, mech_r_leg: { rotation: 0, translation: { x: 0, y: 0 } } } },
              { frame: 10, boneTransforms: { mech_l_leg: { rotation: 0.3, translation: { x: 0, y: -10 } }, mech_r_leg: { rotation: -0.2, translation: { x: 0, y: 5 } } } },
              { frame: 20, boneTransforms: { mech_l_leg: { rotation: 0, translation: { x: 0, y: 0 } }, mech_r_leg: { rotation: 0, translation: { x: 0, y: 0 } } } },
              { frame: 30, boneTransforms: { mech_l_leg: { rotation: -0.2, translation: { x: 0, y: 5 } }, mech_r_leg: { rotation: 0.3, translation: { x: 0, y: -10 } } } },
              { frame: 40, boneTransforms: { mech_l_leg: { rotation: 0, translation: { x: 0, y: 0 } }, mech_r_leg: { rotation: 0, translation: { x: 0, y: 0 } } } }
            ]
          },
          {
            id: "mech_cannon_blast",
            name: "Mega Shoulder Cannon (Attack Ulti)",
            duration: 60,
            keyframes: [
              { frame: 0, boneTransforms: { mech_root: { rotation: 0, translation: { x: 0, y: 0 } }, mech_cannon: { rotation: 0, translation: { x: 0, y: 0 } } } },
              { frame: 15, boneTransforms: { mech_root: { rotation: 0.1, translation: { x: -10, y: 5 } }, mech_cannon: { rotation: -0.3, translation: { x: 0, y: 0 } } } },
              { frame: 30, boneTransforms: { mech_root: { rotation: -0.15, translation: { x: 25, y: -5 } }, mech_cannon: { rotation: 0.5, translation: { x: 0, y: 0 } } } },
              { frame: 45, boneTransforms: { mech_root: { rotation: -0.05, translation: { x: 10, y: 0 } }, mech_cannon: { rotation: 0.2, translation: { x: 0, y: 0 } } } },
              { frame: 60, boneTransforms: { mech_root: { rotation: 0, translation: { x: 0, y: 0 } }, mech_cannon: { rotation: 0, translation: { x: 0, y: 0 } } } }
            ]
          }
        ]
      };
      applyRigToWorkspace(mechRig);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Siap Mbah! Karakter Robot Tempur lengkap dengan senjata laser bahu dan kaki besi piston hidrolik sudah siap!'
        }
      ]);
    }
  };

  const triggerEmojiExpression = (emoji: string) => {
    if (!onTriggerShout) return;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 128, 128);
      ctx.font = '72px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.fillText(emoji, 64, 64);
      onTriggerShout({
        text: emoji,
        style: 'custom_image',
        timestamp: Date.now(),
        customImageUrl: canvas.toDataURL('image/png'),
        scale: 1.1,
        offsetY: -10
      });
    }
  };

  const triggerScriptExpression = (templateId: 'heart' | 'anger' | 'halo') => {
    if (!onTriggerShout) return;
    
    let jsCode = '';
    let text = '';
    
    if (templateId === 'heart') {
      text = 'Heart Shower';
      jsCode = `// Draws floating pink hearts above the character's head
const count = 8;
ctx.fillStyle = '#EC4899'; // pink
for (let i = 0; i < count; i++) {
  const seed = i * 45.3 + (timestamp / 500);
  const dx = Math.sin(seed) * 35 * zoom;
  const dy = -((timestamp / 40 + i * 20) % 80) * zoom;
  const size = (8 + Math.sin(seed * 2) * 4) * zoom;
  
  ctx.save();
  ctx.translate(dx, dy);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size/2, -size/2, -size, 0, 0, size);
  ctx.bezierCurveTo(size, 0, size/2, -size/2, 0, 0);
  ctx.fill();
  ctx.restore();
}`;
    } else if (templateId === 'anger') {
      text = 'Anger Sparks';
      jsCode = `// Draws cartoonish red anger cross lines (veins)
ctx.strokeStyle = '#EF4444'; // Red
ctx.lineWidth = 4 * zoom;
ctx.lineCap = 'round';

const r = 16 * zoom;
const offset = Math.sin(timestamp / 100) * 3 * zoom;

// Draw 4 curved cross arcs in a classic comic layout
ctx.save();
ctx.translate(0, -10 * zoom);
for (let i = 0; i < 4; i++) {
  ctx.save();
  ctx.rotate((i * Math.PI) / 2 + Math.sin(timestamp / 200) * 0.15);
  ctx.beginPath();
  ctx.arc(8 * zoom, 8 * zoom, r, Math.PI, 1.5 * Math.PI);
  ctx.stroke();
  ctx.restore();
}
ctx.restore();`;
    } else if (templateId === 'halo') {
      text = 'Aura Sakti';
      jsCode = `// Draws a rotating magic circle / halo above head
const angle = (timestamp / 800) % (Math.PI * 2);
const r = 28 * zoom;

ctx.save();
ctx.translate(0, -15 * zoom);
ctx.rotate(angle);

// Draw outer halo ring
ctx.strokeStyle = '#10B981'; // emerald green
ctx.lineWidth = 3 * zoom;
ctx.beginPath();
ctx.arc(0, 0, r, 0, Math.PI * 2);
ctx.stroke();

// Draw interior decorative star lines
ctx.strokeStyle = '#34D399';
ctx.lineWidth = 1 * zoom;
ctx.beginPath();
for (let i = 0; i < 5; i++) {
  const a = (i * Math.PI * 2) / 5;
  ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
}
ctx.closePath();
ctx.stroke();

ctx.restore();`;
    }

    onTriggerShout({
      text,
      style: 'custom_code',
      timestamp: Date.now(),
      customCode: jsCode,
      scale: 1.0,
      offsetY: 0
    });
  };

  return (
    <div className="flex flex-col h-full text-slate-300 bg-[#0E0E10] border-r border-white/10 w-80 shrink-0 overflow-hidden" id="sidebar_container">
      
      {/* ALWAYS VISIBLE: Upload PNG Section */}
      <div className="p-3 bg-[#0B0B0D] border-b border-white/10 shrink-0 space-y-2">
        <div className="flex items-center gap-1.5 text-amber-500 font-bold">
          <Upload className="h-3.5 w-3.5" />
          <h3 className="text-[10px] uppercase tracking-wider">1. Upload Gambar PNG</h3>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-white/15 hover:border-amber-500/50 rounded bg-white/5 hover:bg-white/10 transition-all cursor-pointer text-slate-300 hover:text-slate-100"
          id="custom_upload_trigger_btn"
        >
          <Upload className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold">Pilih Gambar PNG Mbah</span>
        </button>
        <p className="text-[9px] text-slate-500 text-center">
          Format PNG transparan (tanpa background) paling bagus Mbah
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png"
          className="hidden"
          id="custom_sprite_file_input"
        />
      </div>

      {/* Dynamic Segmented Tab Switcher */}
      <div className="p-1.5 border-b border-white/10 bg-[#0C0C0E] flex gap-1 shrink-0">
        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
          id="tab_presets_btn"
        >
          <Palette className="h-3 w-3" />
          <span>Karakter</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
            activeTab === 'ai'
              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
          id="tab_ai_btn"
        >
          <Cpu className="h-3 w-3" />
          <span>Tanya AI</span>
        </button>
        <button
          onClick={() => setActiveTab('battle')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
            activeTab === 'battle'
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500'
              : 'text-slate-400 hover:text-slate-200 border border-transparent'
          }`}
          id="tab_battle_btn"
        >
          <Sparkles className="h-3 w-3" />
          <span>Ekspresi</span>
          <span className="absolute top-1 right-2 w-1 h-1 rounded-full bg-amber-400 animate-ping" />
        </button>
      </div>

      {activeTab === 'presets' ? (
        <div className="flex flex-col gap-5 p-4 overflow-y-auto flex-1">
          {/* SECTION: Presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-500 font-semibold border-b border-white/10 pb-1.5">
              <Palette className="h-4 w-4" />
              <h3 className="text-xs uppercase tracking-widest font-bold">2. Pilih Karakter Contoh</h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Pilih karakter contoh di bawah ini untuk langsung dicoba:
            </p>
            
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {PRESETS.map((preset) => {
                const isSelected = currentPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onSelectPreset(preset.id)}
                    className={`group flex flex-col items-center justify-between p-1.5 rounded border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-medium'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 text-slate-300'
                    }`}
                    id={`preset_btn_${preset.id}`}
                  >
                    <div className="h-14 w-14 bg-[#0A0A0B] border border-white/10 rounded flex items-center justify-center overflow-hidden p-1 group-hover:scale-105 transition-transform duration-200">
                      <img
                        src={preset.imageUrl}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] mt-1.5 block font-medium truncate w-full">
                      {preset.name.split(' ')[1] || preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION: Mesh Grid Deformation Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-500 font-semibold border-b border-white/10 pb-1.5">
              <Grid className="h-4 w-4" />
              <h3 className="text-xs uppercase tracking-widest font-bold">3. Jaring Elastis</h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Pengaturan kelenturan gerakan gambar Mbah:
            </p>

            <div className="space-y-3.5 pt-1 bg-white/5 border border-white/10 rounded p-3 text-xs">
              {/* Columns */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Lebar Kotak Jaring:</span>
                  <span className="text-slate-200 font-semibold">{meshCols}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="1"
                  value={meshCols}
                  onChange={(e) => setMeshCols(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-amber-500"
                  id="mesh_cols_slider"
                />
              </div>

              {/* Rows */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Tinggi Kotak Jaring:</span>
                  <span className="text-slate-200 font-semibold">{meshRows}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="1"
                  value={meshRows}
                  onChange={(e) => setMeshRows(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-amber-500"
                  id="mesh_rows_slider"
                />
              </div>

              {/* Distance Falloff */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Efek Tarikan Tulang:</span>
                  <span className="text-slate-200 font-semibold">{falloff.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.5"
                  value={falloff}
                  onChange={(e) => setFalloff(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-amber-500"
                  id="falloff_slider"
                />
              </div>

              {/* Influences */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Batas Hubungan Tulang:</span>
                  <span className="text-slate-200 font-semibold">{maxInfluences} tulang</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="1"
                  value={maxInfluences}
                  onChange={(e) => setMaxInfluences(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-amber-500"
                  id="max_influences_slider"
                />
              </div>
            </div>
          </div>

          {/* SECTION: Display & Overlay Toggles */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-500 font-semibold border-b border-white/10 pb-1.5">
              <Eye className="h-4 w-4" />
              <h3 className="text-xs uppercase tracking-widest font-bold">Garis Bantu Layar</h3>
            </div>

            <div className="space-y-2.5 text-xs bg-white/5 border border-white/10 rounded p-3">
              {/* Toggles */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-slate-300 group-hover:text-white transition-colors">Tampilkan Gambar</span>
                  <input
                    type="checkbox"
                    checked={showSprite}
                    onChange={(e) => setShowSprite(e.target.checked)}
                    className="rounded border-white/10 h-4 w-4 accent-amber-500 cursor-pointer bg-[#0A0A0B]"
                    id="toggle_sprite_checkbox"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-slate-300 group-hover:text-white transition-colors">Tampilkan Tulang</span>
                  <input
                    type="checkbox"
                    checked={showBones}
                    onChange={(e) => setShowBones(e.target.checked)}
                    className="rounded border-white/10 h-4 w-4 accent-amber-500 cursor-pointer bg-[#0A0A0B]"
                    id="toggle_bones_checkbox"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-slate-300 group-hover:text-white transition-colors">Tampilkan Jaring</span>
                  <input
                    type="checkbox"
                    checked={showMesh}
                    onChange={(e) => setShowMesh(e.target.checked)}
                    className="rounded border-white/10 h-4 w-4 accent-amber-500 cursor-pointer bg-[#0A0A0B]"
                    id="toggle_mesh_checkbox"
                  />
                </label>
              </div>

              {/* Bone Opacity */}
              {showBones && (
                <div className="space-y-1 pt-2 border-t border-[#0A0A0B]">
                  <div className="flex justify-between text-slate-400">
                    <span>Ketebalan Garis Tulang:</span>
                    <span className="text-slate-200 font-semibold">{Math.round(boneOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={boneOpacity}
                    onChange={(e) => setBoneOpacity(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-amber-500"
                    id="bone_opacity_slider"
                  />
                </div>
              )}

              {/* Mesh Opacity */}
              {showMesh && (
                <div className="space-y-1 pt-2 border-t border-[#0A0A0B]">
                  <div className="flex justify-between text-slate-400">
                    <span>Ketebalan Jaring:</span>
                    <span className="text-slate-200 font-semibold">{Math.round(meshOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={meshOpacity}
                    onChange={(e) => setMeshOpacity(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-amber-500"
                    id="mesh_opacity_slider"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'ai' ? (
        <div className="flex flex-col h-full overflow-hidden flex-1 bg-[#0A0A0C]">
          
          {/* Quick Action Preset Rigging Buttons */}
          <div className="p-3 bg-[#0E0E11] border-b border-white/5 flex flex-col gap-1.5 shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Pilih Contoh Tulang Cepat (1-Klik)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => loadPresetTemplate('warrior')}
                className="flex flex-col items-center justify-center p-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-center transition-all cursor-pointer text-amber-400"
                id="template_warrior_btn"
              >
                <Sparkles className="h-3.5 w-3.5 mb-1" />
                <span className="text-[8px] font-bold leading-tight">Gaya Pendekar</span>
              </button>
              <button
                onClick={() => loadPresetTemplate('jelly')}
                className="flex flex-col items-center justify-center p-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-center transition-all cursor-pointer text-cyan-400"
                id="template_jelly_btn"
              >
                <Wand2 className="h-3.5 w-3.5 mb-1" />
                <span className="text-[8px] font-bold leading-tight">Ubur-ubur</span>
              </button>
              <button
                onClick={() => loadPresetTemplate('mech')}
                className="flex flex-col items-center justify-center p-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 text-center transition-all cursor-pointer text-indigo-400"
                id="template_mech_btn"
              >
                <Cpu className="h-3.5 w-3.5 mb-1" />
                <span className="text-[8px] font-bold leading-tight">Robot Tempur</span>
              </button>
            </div>
          </div>

          {/* Dynamic Message Logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-white ${
                  msg.sender === 'user' ? 'bg-amber-500' : 'bg-cyan-500 shadow-md shadow-cyan-500/10'
                }`}>
                  {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                
                <div className="space-y-2 max-w-[80%]">
                  <div className={`p-2.5 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-amber-500/15 border border-amber-500/25 text-amber-200'
                      : 'bg-white/5 border border-white/10 text-slate-300'
                  }`}>
                    {msg.text}
                  </div>

                  {msg.data && (
                    <button
                      onClick={() => applyRigToWorkspace(msg.data, true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-cyan-500 text-slate-900 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Pasang Tulang ke Layar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isAiLoading && (
              <div className="flex gap-2.5">
                <div className="h-6 w-6 rounded-full bg-cyan-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                  <span>AI sedang merancang susunan tulang...</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Input Form */}
          <div className="p-3 bg-[#0E0E11] border-t border-white/10 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAiGenerate();
              }}
              className="relative flex items-center gap-2"
            >
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Buat naga terbang..."
                rows={1}
                className="w-full bg-[#070709] border border-white/10 hover:border-cyan-500/30 focus:border-cyan-500 rounded px-3 py-2 text-xs text-white placeholder-slate-500 outline-none resize-none focus:ring-1 focus:ring-cyan-500 min-h-[38px] max-h-[100px] scrollbar-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAiGenerate();
                  }
                }}
              />
              <button
                type="submit"
                disabled={!promptInput.trim() || isAiLoading}
                className="h-[38px] w-[38px] rounded bg-cyan-500 hover:bg-cyan-400 text-slate-900 flex items-center justify-center transition-all shrink-0 shadow-lg shadow-cyan-500/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95"
                id="send_prompt_btn"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="text-[9px] text-slate-500 mt-2 text-center">
              Asisten AI Osteo akan mengatur susunan sendi tulang, derajat awal, dan urutan gerakan serangnya.
            </p>
          </div>

        </div>
      ) : (
        /* EXPRESSION / EKSPRESI MODE tab content */
        <div className="flex flex-col gap-4.5 p-4 overflow-y-auto flex-1 bg-[#0A0A0C]">
          
          {/* SECTION: Expression description */}
          <div className="space-y-1 bg-amber-950/20 border border-amber-500/15 rounded p-3 text-xs">
            <div className="flex items-center gap-1.5 text-amber-500 font-bold">
              <Sparkles className="h-4 w-4" />
              <h4 className="uppercase tracking-wide text-[10px]">🎭 Studio Ekspresi Mbah</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
              Buat ekspresi karakter di atas kepala secara interaktif menggunakan gambar PNG, stiker emoji, tulisan dialog komik, atau animasi partikel berbasis skrip kode!
            </p>
          </div>

          {/* LAUNCH STUDIO BUTTON */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={onOpenExpressionModal}
              className="w-full py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/25 active:scale-95 transition-all cursor-pointer"
              id="open_expression_studio_btn"
            >
              <Sparkles className="h-4 w-4" />
              <span>Rancang Ekspresi Baru 🎨</span>
            </button>
            <p className="text-[8px] text-slate-500 text-center mt-1">
              Mbah iso upload PNG, kustom balon, utawa modifikasi skrip JS &amp; Python!
            </p>
          </div>

          <div className="h-px bg-white/5" />

          {/* GRID: Quick Preset Pads */}
          <div className="space-y-3.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              ⚡ Tombol Ekspresi Instan (Pads)
            </span>

            {/* A. Preset Emoji PNG Badges */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-500 font-medium block">1. Stiker Emoji (Rendered PNG):</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { char: '😡', name: 'Angry' },
                  { char: '😍', name: 'Tresno' },
                  { char: '😱', name: 'Kaget' },
                  { char: '😅', name: 'Ngelu' }
                ].map((item) => (
                  <button
                    key={item.char}
                    onClick={() => triggerEmojiExpression(item.char)}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-white/10 text-xl transition-all cursor-pointer active:scale-90"
                    title={item.name}
                  >
                    <span>{item.char}</span>
                    <span className="text-[7px] text-slate-500 mt-0.5">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* B. Classic Comic Balloons */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-500 font-medium block">2. Balon Komik Klasik:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: '🔥 JEDAR!', style: 'starburst' as const, bg: 'hover:bg-amber-500/10 border-amber-500/20 text-amber-400' },
                  { label: '⚡ KAGET!', style: 'shock' as const, bg: 'hover:bg-purple-500/10 border-purple-500/20 text-purple-400' },
                  { label: '☁️ HELO!', style: 'cloud' as const, bg: 'hover:bg-cyan-500/10 border-cyan-500/20 text-cyan-400' }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => onTriggerShout && onTriggerShout({
                      text: item.label,
                      style: item.style,
                      timestamp: Date.now()
                    })}
                    className={`py-2 px-1 rounded bg-white/5 border text-[9px] font-bold transition-all cursor-pointer text-center active:scale-90 ${item.bg}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* C. Dynamic Procedural Scripts (JS/Python) */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-500 font-medium block">3. Efek Partikel Kode (Skrip):</span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { label: '💖 Hujan Cinta (Heart Shower)', key: 'heart' as const, bg: 'hover:bg-pink-500/10 border-pink-500/20 text-pink-400' },
                  { label: '💢 Percikan Amarah (Anger Sparks)', key: 'anger' as const, bg: 'hover:bg-red-500/10 border-red-500/20 text-red-400' },
                  { label: '💫 Aura Sakti (Magic Halo Ring)', key: 'halo' as const, bg: 'hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-400' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => triggerScriptExpression(item.key)}
                    className={`flex items-center justify-between py-2 px-3 rounded bg-white/5 border text-[10px] font-bold transition-all cursor-pointer text-left active:scale-95 ${item.bg}`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[8px] opacity-60 font-mono">JS + PY</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-2 p-2 rounded bg-[#070709] border border-white/5 text-[9px] text-slate-500 leading-normal space-y-1 flex-1 flex flex-col justify-end">
            <p className="font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Saran Kreatif Mbah:</span>
            </p>
            <p>Klik tombol warna-warni ing dhuwur utawa nggawe ekspresimu dewe nggo nyoba animasi warp skinning luwih asyik lan urip cinematic!</p>
          </div>
        </div>
      )}

    </div>
  );
}
