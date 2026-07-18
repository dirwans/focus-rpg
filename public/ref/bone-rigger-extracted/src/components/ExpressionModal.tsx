import React from 'react';
import { X, Upload, MessageSquare, Code, Image as ImageIcon, Sparkles, AlertCircle, Play, BookOpen, Flame, Smile, Heart } from 'lucide-react';
import { ComicShout } from '../types';

interface ExpressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpression: (shout: ComicShout) => void;
}

const PRESET_EMOJIS = [
  { char: '😡', label: 'Angry / Marah' },
  { char: '😍', label: 'Love / Tresno' },
  { char: '😱', label: 'Shock / Kaget' },
  { char: '😅', label: 'Sweat / Ngelu' },
  { char: '💖', label: 'Heart Sparkle' },
  { char: '⚡', label: 'Lightning Strike' }
];

const CODE_TEMPLATES = {
  heart: {
    name: '❤️ Heart Shower (Udan Tresno)',
    js: `// Draws floating pink hearts above the character's head
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
}`,
    python: `# Pygame / PIL drawing code equivalent
import math
import time

count = 8
for i in range(count):
    seed = i * 45.3 + (time.time() * 2)
    dx = math.sin(seed) * 35 * zoom
    dy = -((time.time() * 25 + i * 20) % 80) * zoom
    size = (8 + math.sin(seed * 2) * 4) * zoom
    # Draw heart shape relative to bubble center (dx, dy)
    draw_heart(screen, x + dx, y + dy, size, color=(236, 72, 153))`
  },
  anger: {
    name: '💢 Anger Sparks (Percikan Amarah)',
    js: `// Draws cartoonish red anger cross lines (veins)
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
ctx.restore();`,
    python: `# pygame anger symbol render
import math
import time

r = 16 * zoom
offset = math.sin(time.time() * 10) * 3 * zoom

for i in range(4):
    angle = (i * math.pi) / 2 + math.sin(time.time() * 5) * 0.15
    # Render spiky cross lines or curved arcs
    draw_arc(screen, x + 8*zoom, y - 10*zoom, r, angle, color=(239, 68, 68), width=4)`
  },
  halo: {
    name: '💫 Aura Sakti (Magic Halo)',
    js: `// Draws a rotating magic circle / halo above head
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

ctx.restore();`,
    python: `# pygame magic halo template
import math
import time

angle = (time.time() * 1.25) % (math.pi * 2)
r = 28 * zoom

# Draw outer circle halo
draw_circle(screen, x, y - 15*zoom, r, color=(16, 185, 129), width=3)

# Draw inner pentagram lines
points = []
for i in range(5):
    a = angle + (i * math.pi * 2) / 5
    points.append((x + math.cos(a)*r, y - 15*zoom + math.sin(a)*r))
# Connect points
draw_polygon(screen, points, color=(52, 211, 153), width=1)`
  }
};

export interface PredefinedLibraryItem {
  id: string;
  name: string;
  emoji: string;
  category: 'Happy' | 'Angry' | 'Surprised' | 'Sad' | 'Action';
  description: string;
  mode: 'png' | 'bubble' | 'code';
  scale: number;
  offsetY: number;
  emojiChar?: string;
  bubbleText?: string;
  bubbleStyle?: 'starburst' | 'cloud' | 'shock';
  bubbleColor?: string;
  bubbleBorderColor?: string;
  bubbleTextColor?: string;
  codeTemplate?: 'heart' | 'anger' | 'halo';
  customCode?: string;
  customPythonCode?: string;
}

export const PREDEFINED_LIBRARY: PredefinedLibraryItem[] = [
  {
    id: 'anger_sparks',
    name: 'Sparks of Anger (Nesu Red)',
    emoji: '😡',
    category: 'Angry',
    description: 'Urat kemarahan kartun warna merah menyala bergetar di atas kepala.',
    mode: 'code',
    codeTemplate: 'anger',
    scale: 1.2,
    offsetY: -15
  },
  {
    id: 'wadidaw_burst',
    name: 'Wadidaw Shock (Kaget Jedar)',
    emoji: '😱',
    category: 'Surprised',
    description: 'Balon kejutan warna ungu/cyan tajam untuk efek shock dramatis.',
    mode: 'bubble',
    bubbleText: 'WADIDAW!! 😱',
    bubbleStyle: 'shock',
    bubbleColor: '#A855F7',
    bubbleBorderColor: '#000000',
    bubbleTextColor: '#06B6D4',
    scale: 1.3,
    offsetY: -20
  },
  {
    id: 'happy_alhamdulillah',
    name: 'Happy Blessing (Alhamdulillah)',
    emoji: '😊',
    category: 'Happy',
    description: 'Balon gelembung komik warna hijau zamrud hangat dengan emoji tawa.',
    mode: 'bubble',
    bubbleText: 'ALHAMDULILLAH! 🎉',
    bubbleStyle: 'cloud',
    bubbleColor: '#10B981',
    bubbleBorderColor: '#000000',
    bubbleTextColor: '#FFFFFF',
    scale: 1.15,
    offsetY: -10
  },
  {
    id: 'love_shower',
    name: 'Udan Tresno (Heart Rain)',
    emoji: '😍',
    category: 'Happy',
    description: 'Animasi partikel kustom berupa hujan hati pink romantis berguguran.',
    mode: 'code',
    codeTemplate: 'heart',
    scale: 1.2,
    offsetY: -10
  },
  {
    id: 'crying_stream',
    name: 'Crying Rivers (Mewek Sedih)',
    emoji: '😭',
    category: 'Sad',
    description: 'Stiker emoji menangis tersedu-sedu dengan aliran air mata deras.',
    mode: 'png',
    emojiChar: '😭',
    scale: 1.25,
    offsetY: -15
  },
  {
    id: 'sweating_flustered',
    name: 'Sweat Drop (Ngelu Puyeng)',
    emoji: '😅',
    category: 'Sad',
    description: 'Stiker emoji cemas bercucuran keringat dingin untuk ekspresi gugup.',
    mode: 'png',
    emojiChar: '😅',
    scale: 1.2,
    offsetY: -10
  },
  {
    id: 'magic_halo',
    name: 'Aura Sakti (Divine Halo)',
    emoji: '💫',
    category: 'Action',
    description: 'Lingkaran halo / tameng gaib hijau mistis berputar dengan dekorasi bintang.',
    mode: 'code',
    codeTemplate: 'halo',
    scale: 1.0,
    offsetY: -15
  },
  {
    id: 'jedar_strike',
    name: 'Jedar Attack (Teriak Serang)',
    emoji: '🔥',
    category: 'Action',
    description: 'Balon komik ledakan kuning-oranye runcing bernuansa aksi laga.',
    mode: 'bubble',
    bubbleText: 'HIAAAAAT! ⚡',
    bubbleStyle: 'starburst',
    bubbleColor: '#FBBF24',
    bubbleBorderColor: '#000000',
    bubbleTextColor: '#FFFFFF',
    scale: 1.25,
    offsetY: -15
  }
];

export default function ExpressionModal({ isOpen, onClose, onSaveExpression }: ExpressionModalProps) {
  const [activeMode, setActiveMode] = React.useState<'library' | 'png' | 'bubble' | 'code'>('library');
  const [selectedLibraryId, setSelectedLibraryId] = React.useState<string>('anger_sparks');
  const [libraryFilter, setLibraryFilter] = React.useState<string>('All');
  
  const [imagePreview, setImagePreview] = React.useState<string>('');
  const [scale, setScale] = React.useState<number>(1.0);
  const [offsetY, setOffsetY] = React.useState<number>(0);
  
  // Bubble states
  const [bubbleText, setBubbleText] = React.useState<string>('MANTAP MBAH! 🔥');
  const [bubbleStyle, setBubbleStyle] = React.useState<'starburst' | 'cloud' | 'shock'>('starburst');
  const [bubbleColor, setBubbleColor] = React.useState<string>('#FBBF24'); // Yellow
  const [bubbleBorderColor, setBubbleBorderColor] = React.useState<string>('#000000');
  const [bubbleTextColor, setBubbleTextColor] = React.useState<string>('#FFFFFF');

  // Code states
  const [selectedTemplate, setSelectedTemplate] = React.useState<keyof typeof CODE_TEMPLATES>('heart');
  const [jsCode, setJsCode] = React.useState<string>(CODE_TEMPLATES.heart.js);
  const [pythonCode, setPythonCode] = React.useState<string>(CODE_TEMPLATES.heart.python);
  const [codeLanguage, setCodeLanguage] = React.useState<'js' | 'python'>('js');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSelectLibraryItem = (item: PredefinedLibraryItem) => {
    setSelectedLibraryId(item.id);
    setScale(item.scale);
    setOffsetY(item.offsetY);
    
    if (item.mode === 'png' && item.emojiChar) {
      handleSelectEmojiPreset(item.emojiChar);
    } else if (item.mode === 'bubble') {
      setBubbleText(item.bubbleText || '');
      setBubbleStyle(item.bubbleStyle || 'starburst');
      setBubbleColor(item.bubbleColor || '#FBBF24');
      setBubbleBorderColor(item.bubbleBorderColor || '#000000');
      setBubbleTextColor(item.bubbleTextColor || '#FFFFFF');
    } else if (item.mode === 'code' && item.codeTemplate) {
      setSelectedTemplate(item.codeTemplate);
      const t = CODE_TEMPLATES[item.codeTemplate];
      if (t) {
        setJsCode(t.js);
        setPythonCode(t.python);
      }
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      const defaultItem = PREDEFINED_LIBRARY.find(item => item.id === 'anger_sparks');
      if (defaultItem) {
        handleSelectLibraryItem(defaultItem);
      }
    }
  }, [isOpen]);

  React.useEffect(() => {
    // Synchronize selected template
    const template = CODE_TEMPLATES[selectedTemplate];
    if (template) {
      setJsCode(template.js);
      setPythonCode(template.python);
    }
  }, [selectedTemplate]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectEmojiPreset = (emoji: string) => {
    // Generate an image URL dynamically from an emoji drawn on canvas!
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
      setImagePreview(canvas.toDataURL('image/png'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeMode === 'library') {
      const item = PREDEFINED_LIBRARY.find(i => i.id === selectedLibraryId);
      if (!item) return;

      if (item.mode === 'png') {
        let currentImg = imagePreview;
        if (!currentImg && item.emojiChar) {
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
            ctx.fillText(item.emojiChar, 64, 64);
            currentImg = canvas.toDataURL('image/png');
          }
        }
        onSaveExpression({
          text: item.emojiChar || 'Custom PNG',
          style: 'custom_image',
          timestamp: Date.now(),
          customImageUrl: currentImg,
          scale,
          offsetY
        });
      } else if (item.mode === 'bubble') {
        onSaveExpression({
          text: bubbleText,
          style: bubbleStyle,
          timestamp: Date.now(),
          color: bubbleColor,
          borderColor: bubbleBorderColor,
          textColor: bubbleTextColor,
          scale,
          offsetY
        });
      } else {
        // code mode
        onSaveExpression({
          text: CODE_TEMPLATES[selectedTemplate]?.name || item.name,
          style: 'custom_code',
          timestamp: Date.now(),
          customCode: jsCode,
          customPythonCode: pythonCode,
          scale,
          offsetY
        });
      }
    } else if (activeMode === 'png') {
      if (!imagePreview) {
        alert('Pilih atau upload gambar terlebih dahulu Mbah!');
        return;
      }
      onSaveExpression({
        text: 'Custom PNG',
        style: 'custom_image',
        timestamp: Date.now(),
        customImageUrl: imagePreview,
        scale,
        offsetY
      });
    } else if (activeMode === 'bubble') {
      if (!bubbleText.trim()) {
        alert('Tulis omongan karakter dulu Mbah!');
        return;
      }
      onSaveExpression({
        text: bubbleText,
        style: bubbleStyle,
        timestamp: Date.now(),
        color: bubbleColor,
        borderColor: bubbleBorderColor,
        textColor: bubbleTextColor,
        scale,
        offsetY
      });
    } else {
      // code mode
      onSaveExpression({
        text: CODE_TEMPLATES[selectedTemplate].name,
        style: 'custom_code',
        timestamp: Date.now(),
        customCode: jsCode,
        customPythonCode: pythonCode,
        scale,
        offsetY
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative bg-[#0E0E11] border border-white/10 rounded-xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-200"
        id="expression_creator_modal_container"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-[#0B0B0D]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            <div>
              <h3 className="font-bold text-white text-base">Studio Pembuat Ekspresi (Expression Creator)</h3>
              <p className="text-[10px] text-slate-400">Rancang stiker PNG, balon dialog kustom, atau efek partikel berbasis skrip kode Mbah!</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            id="close_expression_modal_btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-[#070709] border-b border-white/5 p-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveMode('library'); }}
            className={`flex-1 min-w-[120px] py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'library' 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="expr_tab_library"
          >
            <BookOpen className="h-4 w-4 text-amber-500" />
            <span>1. Pustaka Preset</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('png'); }}
            className={`flex-1 min-w-[120px] py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'png' 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="expr_tab_png"
          >
            <ImageIcon className="h-4 w-4" />
            <span>2. Kustom PNG</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveMode('bubble'); }}
            className={`flex-1 min-w-[120px] py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'bubble' 
                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="expr_tab_bubble"
          >
            <MessageSquare className="h-4 w-4" />
            <span>3. Balon Komik</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveMode('code'); }}
            className={`flex-1 min-w-[120px] py-2.5 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === 'code' 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="expr_tab_code"
          >
            <Code className="h-4 w-4" />
            <span>4. Skrip JS / PY</span>
          </button>
        </div>

        {/* Main Content Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 0: PREDEFINED EXPRESSION LIBRARY */}
          {activeMode === 'library' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Side: Preset List and Filter */}
              <div className="md:col-span-7 space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Pilih Ekspresi Dari Pustaka:
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {PREDEFINED_LIBRARY.length} Preset Tersedia
                  </span>
                </div>

                {/* Filter buttons */}
                <div className="flex flex-wrap gap-1 bg-[#070709] p-1 rounded-lg border border-white/5">
                  {['All', 'Happy', 'Angry', 'Surprised', 'Sad', 'Action'].map((filter) => {
                    const label = 
                      filter === 'All' ? 'Semua' : 
                      filter === 'Happy' ? '😊 Happy' : 
                      filter === 'Angry' ? '😡 Angry' : 
                      filter === 'Surprised' ? '😱 Kaget' : 
                      filter === 'Sad' ? '😭 Sedih' : '🔥 Aksi';
                    
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setLibraryFilter(filter)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          libraryFilter === filter
                            ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Grid list of predefined expressions */}
                <div className="grid grid-cols-1 gap-2 max-h-[360px] overflow-y-auto pr-1">
                  {PREDEFINED_LIBRARY.filter(item => libraryFilter === 'All' || item.category === libraryFilter).map((item) => {
                    const isSelected = selectedLibraryId === item.id;
                    const modeBadgeColor = 
                      item.mode === 'png' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                      item.mode === 'bubble' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                      'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
                    
                    const modeLabel = 
                      item.mode === 'png' ? 'Stiker' : 
                      item.mode === 'bubble' ? 'Balon' : 'Partikel';

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectLibraryItem(item)}
                        className={`flex gap-3.5 p-3 rounded-xl border transition-all cursor-pointer text-left select-none relative group ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-950/10'
                            : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/10'
                        }`}
                      >
                        {/* Big Emoji representation */}
                        <div className="h-11 w-11 shrink-0 rounded-lg bg-black/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform duration-200">
                          {item.emoji}
                        </div>

                        {/* Content text */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white text-xs truncate group-hover:text-amber-400 transition-colors">
                              {item.name}
                            </span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-bold shrink-0 tracking-wide border ${modeBadgeColor}`}>
                              {modeLabel}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Detailed Preview Panel */}
              <div className="md:col-span-5 bg-[#070709] border border-white/5 rounded-xl p-4 flex flex-col justify-between space-y-4">
                {(() => {
                  const item = PREDEFINED_LIBRARY.find(i => i.id === selectedLibraryId);
                  if (!item) {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-600 py-10">
                        <Smile className="h-8 w-8 mb-2 opacity-30 animate-pulse" />
                        <span className="text-xs">Pilih salah satu ekspresi untuk melihat preview Mbah</span>
                      </div>
                    );
                  }

                  const categoryColors = 
                    item.category === 'Happy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    item.category === 'Angry' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    item.category === 'Surprised' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                    item.category === 'Sad' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    'bg-amber-500/10 text-amber-400 border-amber-500/20';

                  return (
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      {/* Top banner / detail info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${categoryColors}`}>
                            {item.category}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">ID: {item.id}</span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                            <span className="text-xl">{item.emoji}</span>
                            <span>{item.name}</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Interactive live rendering simulator */}
                        <div className="h-32 rounded-lg bg-[#040406] border border-white/5 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:10px_10px]">
                          {/* Anchor avatar head representer */}
                          <div className="absolute bottom-2 h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 shadow">
                            Mbah
                          </div>

                          {/* Render the actual live preset simulation */}
                          <div 
                            className="absolute transition-all duration-300 flex flex-col items-center justify-center"
                            style={{ 
                              transform: `scale(${scale})`,
                              top: `calc(50% + ${offsetY / 4}px - 15px)` 
                            }}
                          >
                            {item.mode === 'png' && (
                              <div className="text-4xl filter drop-shadow-md animate-bounce">
                                {item.emojiChar}
                              </div>
                            )}

                            {item.mode === 'bubble' && (
                              <div 
                                className={`px-3 py-1.5 rounded-md font-extrabold text-[10px] text-center max-w-[120px] shadow-lg border relative select-none animate-pulse`}
                                style={{
                                  backgroundColor: bubbleColor,
                                  borderColor: bubbleBorderColor,
                                  color: bubbleTextColor,
                                  borderRadius: item.bubbleStyle === 'cloud' ? '12px' : item.bubbleStyle === 'starburst' ? '2px' : '6px'
                                }}
                              >
                                {bubbleText}
                                {/* Small indicator pointer for comic bubble */}
                                <div 
                                  className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px]"
                                  style={{ borderTopColor: bubbleColor }}
                                />
                              </div>
                            )}

                            {item.mode === 'code' && (
                              <div className="flex flex-col items-center justify-center gap-1">
                                {item.codeTemplate === 'heart' && (
                                  <div className="flex gap-1 animate-bounce text-pink-500 text-lg">
                                    ❤️ ❤️ ❤️
                                  </div>
                                )}
                                {item.codeTemplate === 'anger' && (
                                  <div className="text-red-500 font-extrabold text-xl animate-pulse tracking-wide select-none">
                                    💢 💢
                                  </div>
                                )}
                                {item.codeTemplate === 'halo' && (
                                  <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-dashed animate-spin flex items-center justify-center">
                                    <div className="h-4 w-4 rounded-full bg-emerald-400/20" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Info & tab-switch helper */}
                      <div className="space-y-2.5 pt-2 border-t border-white/5">
                        <div className="bg-amber-950/10 border border-amber-500/10 rounded-lg p-2.5 text-[9px] text-slate-400 leading-normal space-y-1">
                          <p className="text-amber-400 font-bold flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <span>Tips Kustomisasi Mbah:</span>
                          </p>
                          <p>
                            Gaya preset iki iso dimodifikasi! Ganti slider <strong>Skala / Posisi</strong> ing ngisor, utawa klik tab <strong>Kustom PNG / Balon / Skrip</strong> ing dhuwur kanggo ngganti teks, werna utawa kode program!
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 1: PNG / Custom Image */}
          {activeMode === 'png' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Pilih Preset Cepat Emojimu:</label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_EMOJIS.map((preset) => (
                    <button
                      key={preset.char}
                      type="button"
                      onClick={() => handleSelectEmojiPreset(preset.char)}
                      className="p-3 bg-white/5 border border-white/10 hover:border-amber-500 rounded-lg text-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all cursor-pointer hover:scale-105 active:scale-95"
                      title={preset.label}
                    >
                      <span>{preset.char}</span>
                      <span className="text-[7px] text-slate-500 uppercase font-mono tracking-tighter truncate w-full text-center">
                        {preset.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-center justify-center bg-[#070709] border border-white/5 p-4 rounded-xl">
                {/* PNG Upload */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Atau Upload PNG Transparan Sendiri:</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-5 border border-dashed border-white/15 hover:border-amber-500/50 rounded-xl bg-[#0A0A0C] hover:bg-white/5 transition-all cursor-pointer w-44 h-28"
                  >
                    <Upload className="h-6 w-6 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-300">Pilih File PNG</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png"
                    className="hidden"
                  />
                </div>

                <div className="h-24 w-px bg-white/5 hidden md:block" />

                {/* Live Preview Inside Modal */}
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <span className="text-xs text-slate-500 font-bold uppercase">Preview Stiker:</span>
                  <div className="h-28 w-28 rounded-xl border border-white/10 bg-[#0C0C0E] flex items-center justify-center overflow-hidden bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:12px_12px] p-2 relative">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-full max-w-full object-contain transition-transform duration-200"
                        style={{ transform: `scale(${scale})` }}
                      />
                    ) : (
                      <div className="text-center text-slate-600 text-[10px]">
                        <ImageIcon className="h-6 w-6 mx-auto mb-1 opacity-50" />
                        <span>Belum Ada Gambar</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Styled Comic Bubble */}
          {activeMode === 'bubble' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Isi Obrolan Karakter:</label>
                <input
                  type="text"
                  value={bubbleText}
                  onChange={(e) => setBubbleText(e.target.value)}
                  placeholder="Ketik dialog ekspresi..."
                  className="w-full bg-[#070709] border border-white/10 hover:border-red-500/30 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-lg px-3 py-2 text-sm text-white outline-none font-bold placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Style Choice */}
                <div className="space-y-2 bg-[#070709] border border-white/5 p-3 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gaya Balon:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['starburst', 'cloud', 'shock'] as const).map((style) => {
                      const label = style === 'starburst' ? '🔥 JEDAR' : style === 'cloud' ? '☁️ NGOMONG' : '⚡ KAGET';
                      return (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setBubbleStyle(style)}
                          className={`py-1.5 rounded text-[10px] font-bold border transition-all cursor-pointer text-center ${
                            bubbleStyle === style
                              ? 'bg-red-500/15 border-red-500 text-red-400'
                              : 'bg-white/5 border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="space-y-2 bg-[#070709] border border-white/5 p-3 rounded-lg text-xs space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Warna Balon Komik:</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="color" 
                        value={bubbleColor} 
                        onChange={(e) => setBubbleColor(e.target.value)}
                        className="w-6 h-6 border border-white/10 rounded cursor-pointer bg-transparent"
                      />
                      <span>Isi</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input 
                        type="color" 
                        value={bubbleBorderColor} 
                        onChange={(e) => setBubbleBorderColor(e.target.value)}
                        className="w-6 h-6 border border-white/10 rounded cursor-pointer bg-transparent"
                      />
                      <span>Garis</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input 
                        type="color" 
                        value={bubbleTextColor} 
                        onChange={(e) => setBubbleTextColor(e.target.value)}
                        className="w-6 h-6 border border-white/10 rounded cursor-pointer bg-transparent"
                      />
                      <span>Teks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Code Driven Scripts */}
          {activeMode === 'code' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Template Preset Dropdown */}
                <div className="flex-1 w-full space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">1. Pilih Template Efek Kode:</span>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value as any)}
                    className="w-full bg-[#070709] border border-white/10 rounded px-3 py-1.5 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-500 cursor-pointer"
                    id="code_template_select"
                  >
                    <option value="heart">❤️ Heart Shower (Udan Tresno)</option>
                    <option value="anger">💢 Anger Sparks (Percikan Amarah)</option>
                    <option value="halo">💫 Magic Halo Aura (Aura Sakti)</option>
                  </select>
                </div>

                {/* Language Switch */}
                <div className="space-y-1 shrink-0 w-full md:w-auto">
                  <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block">2. Tampilkan Kode:</span>
                  <div className="flex bg-[#070709] border border-white/10 p-0.5 rounded gap-0.5">
                    <button
                      type="button"
                      onClick={() => setCodeLanguage('js')}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        codeLanguage === 'js' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Javascript (Dijalankan Live)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeLanguage('python')}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        codeLanguage === 'python' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Python Template (Skeletal)
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Editor Container */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-mono">
                  <span>✏️ SILAKAN EDIT KODE MBAH DIBAWAH:</span>
                  <span>{codeLanguage === 'js' ? 'Bakal langsung di-render nang canvas!' : 'Di-render via mock compiler'}</span>
                </div>
                <textarea
                  value={codeLanguage === 'js' ? jsCode : pythonCode}
                  onChange={(e) => {
                    if (codeLanguage === 'js') setJsCode(e.target.value);
                    else setPythonCode(e.target.value);
                  }}
                  rows={8}
                  className="w-full bg-[#050507] border border-white/10 rounded-lg p-3 text-xs font-mono text-cyan-300 placeholder-slate-600 outline-none focus:border-cyan-500 ring-1 ring-white/5"
                  id="expr_code_editor"
                />
              </div>

              {/* Information alert box */}
              <div className="flex gap-2.5 bg-cyan-950/20 border border-cyan-500/15 p-2.5 rounded-lg text-[10px] text-cyan-400 leading-normal">
                <AlertCircle className="h-4 w-4 shrink-0 text-cyan-400" />
                <p>
                  <strong>Tip Keren Mbah:</strong> Skrip JavaScript nggo nggambar live nganggo <code>CanvasRenderingContext2D (ctx)</code>. Mbah iso nggarap rumus sinus, translasi, rotasi, lan nggambar partikel kustom sing kabeh mlaku super lancar!
                </p>
              </div>
            </div>
          )}

          {/* ALWAYS VISIBLE: Position and Scale Adjustment Layer */}
          <div className="border-t border-white/10 pt-4 mt-2 space-y-3 bg-[#0A0A0C]/50 p-3 rounded-xl border border-white/5">
            <h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">🛠️ Pengaturan Ukuran & Letak Ekspresi</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Scale Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Skala Ukuran (Scale):</span>
                  <span className="text-amber-500 font-bold">{scale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-amber-500"
                  id="expr_scale_slider"
                />
              </div>

              {/* Offset Y Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Posisi Tinggi (Vertical Offset):</span>
                  <span className="text-amber-500 font-bold">{offsetY} px</span>
                </div>
                <input
                  type="range"
                  min="-150"
                  max="100"
                  step="5"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-amber-500"
                  id="expr_offset_y_slider"
                />
              </div>

            </div>
          </div>

        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-white/10 bg-[#0B0B0D]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 bg-transparent rounded-lg hover:bg-white/5 transition-all cursor-pointer"
            id="expr_cancel_btn"
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-950/30 cursor-pointer active:scale-95 transition-all"
            id="expr_save_btn"
          >
            <Play className="h-3.5 w-3.5" />
            <span>Simpan & Terapkan! 🚀</span>
          </button>
        </div>

      </div>
    </div>
  );
}
