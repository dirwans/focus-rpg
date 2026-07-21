import React from 'react';
import { 
  Film,
  Sparkles,
  Info,
  RotateCcw,
  Undo,
  Redo,
  Cpu,
  Github,
  Play,
  Pause,
  Sliders,
  Tv
} from 'lucide-react';

import { SpriteSlice, SpritesheetAnimation, SlicerMode } from './types';
import { PRESETS } from './utils/presets';

import CanvasStage from './components/CanvasStage';
import SidebarSprites from './components/SidebarSprites';
import Timeline from './components/Timeline';

export default function App() {
  // 1. Current Loaded Image State
  const [imgUrl, setImgUrl] = React.useState<string | null>(PRESETS[0].imageUrl);
  const [imgName, setImgName] = React.useState<string>(PRESETS[0].name);
  const [currentPresetId, setCurrentPresetId] = React.useState<string | null>(PRESETS[0].id);
  const [imageDimensions, setImageDimensions] = React.useState<{ w: number, h: number }>({ w: 400, h: 100 });

  // 2. Slicing Slices & Selected ID States
  const [slices, setSlices] = React.useState<SpriteSlice[]>(PRESETS[0].defaultSlices);
  const [selectedSliceId, setSelectedSliceId] = React.useState<string | null>('slime_0');

  // 3. Animation Sequences States
  const [animations, setAnimations] = React.useState<SpritesheetAnimation[]>(PRESETS[0].defaultAnimations);
  const [activeAnimId, setActiveAnimId] = React.useState<string>(PRESETS[0].defaultAnimations[0].id);
  const [currentFrameIndex, setCurrentFrameIndex] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(true);

  // 4. Slicing Configs Grid States
  const [slicerMode, setSlicerMode] = React.useState<SlicerMode>('GRID');
  const [gridCols, setGridCols] = React.useState<number>(4);
  const [gridRows, setGridRows] = React.useState<number>(1);

  const activeAnim = React.useMemo(() => {
    return animations.find(a => a.id === activeAnimId) || animations[0];
  }, [animations, activeAnimId]);

  // Reactive Animation Playback Tick Engine
  React.useEffect(() => {
    if (!isPlaying || !activeAnim || activeAnim.frames.length === 0) {
      return;
    }

    const intervalTime = 1000 / activeAnim.fps;
    const interval = setInterval(() => {
      setCurrentFrameIndex((prevIdx) => {
        if (prevIdx >= activeAnim.frames.length - 1) {
          return 0; // Loop around
        }
        return prevIdx + 1;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, activeAnim, activeAnimId]);

  // Load Preset character template
  const handleSelectPreset = (presetId: string) => {
    const found = PRESETS.find(p => p.id === presetId);
    if (!found) return;

    setImgUrl(found.imageUrl);
    setImgName(found.name);
    setCurrentPresetId(found.id);
    setImageDimensions({ w: found.width, h: found.height });
    
    setSlices(found.defaultSlices);
    setAnimations(found.defaultAnimations);
    setActiveAnimId(found.defaultAnimations[0].id);
    setSelectedSliceId(found.defaultSlices[0]?.id || null);
    setCurrentFrameIndex(0);
    setIsPlaying(true);
  };

  // Upload custom spritesheet png
  const handleUploadCustomSprite = (name: string, dataUrl: string, width: number, height: number, cols: number = 4) => {
    setImgUrl(dataUrl);
    setImgName(name);
    setCurrentPresetId(null);
    setImageDimensions({ w: width, h: height });

    // Instantly apply a default cols x 1 grid auto-slice to offer a friendly starting point
    const cellW = width / cols;
    const cellH = height / 1;
    const defaultSlices: SpriteSlice[] = [];
    
    for (let i = 0; i < cols; i++) {
      defaultSlices.push({
        id: `slice_custom_${i}_${Date.now()}`,
        name: `Frame ${i+1}`,
        x: Math.round(i * cellW),
        y: 0,
        width: Math.round(cellW),
        height: Math.round(cellH)
      });
    }

    setSlices(defaultSlices);
    setSelectedSliceId(defaultSlices[0]?.id || null);

    // Create default loop animation using all cells
    const defaultAnims: SpritesheetAnimation[] = [
      {
        id: 'idle',
        name: 'Gerakan Standar (Idle)',
        frames: defaultSlices.map(s => s.id),
        fps: 6,
        loop: true
      }
    ];

    setAnimations(defaultAnims);
    setActiveAnimId('idle');
    setCurrentFrameIndex(0);
    setIsPlaying(true);

    setGridCols(cols);
    setGridRows(1);
  };

  // Automatically slice image based on rows & columns settings
  const handleAutoSliceGrid = () => {
    if (!imgUrl) return;

    const cellW = imageDimensions.w / gridCols;
    const cellH = imageDimensions.h / gridRows;
    const autoSlices: SpriteSlice[] = [];

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const id = `slice_${r}_${c}_${Date.now()}`;
        autoSlices.push({
          id,
          name: `Grid ${c + 1}x${r + 1}`,
          x: Math.round(c * cellW),
          y: Math.round(r * cellH),
          width: Math.round(cellW),
          height: Math.round(cellH)
        });
      }
    }

    setSlices(autoSlices);
    setSelectedSliceId(autoSlices[0]?.id || null);

    // Update active animation frames to use all of these new grid slices
    const updatedAnims = animations.map((anim, idx) => {
      if (idx === 0) {
        return { ...anim, frames: autoSlices.map(s => s.id) };
      }
      return anim;
    });

    setAnimations(updatedAnims);
    setCurrentFrameIndex(0);
  };

  // Handle single slice coordinates additions
  const handleAddSlice = (slice: SpriteSlice) => {
    setSlices((prev) => [...prev, slice]);
  };

  // Handle single slice update
  const handleUpdateSlice = (id: string, updates: Partial<SpriteSlice>) => {
    setSlices((prev) => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Delete slice and clean up sequence frame items
  const handleDeleteSlice = (id: string) => {
    setSlices((prev) => prev.filter(s => s.id !== id));
    if (selectedSliceId === id) setSelectedSliceId(null);

    // Safeguard sequence list: remove references to this deleted slice!
    setAnimations((prevAnims) => prevAnims.map(anim => ({
      ...anim,
      frames: anim.frames.filter(fId => fId !== id)
    })));
    setCurrentFrameIndex(0);
  };

  // Create new animation sequence group
  const handleAddAnimation = (name: string, fps: number) => {
    const id = `anim_${Date.now()}`;
    const newAnim: SpritesheetAnimation = {
      id,
      name,
      frames: [],
      fps,
      loop: true
    };
    setAnimations((prev) => [...prev, newAnim]);
    setActiveAnimId(id);
    setCurrentFrameIndex(0);
  };

  // Delete animation sequence group
  const handleDeleteAnimation = (id: string) => {
    if (animations.length <= 1) return;
    const remaining = animations.filter(a => a.id !== id);
    setAnimations(remaining);
    setActiveAnimId(remaining[0].id);
    setCurrentFrameIndex(0);
  };

  // Append a slice to the active animation filmstrip
  const handleAddFrameToAnim = (sliceId: string) => {
    setAnimations((prevAnims) => prevAnims.map(anim => {
      if (anim.id === activeAnimId) {
        return {
          ...anim,
          frames: [...anim.frames, sliceId]
        };
      }
      return anim;
    }));
  };

  // Remove a frame at index from active filmstrip sequence
  const handleRemoveFrameFromAnim = (index: number) => {
    setAnimations((prevAnims) => prevAnims.map(anim => {
      if (anim.id === activeAnimId) {
        const updatedFrames = [...anim.frames];
        updatedFrames.splice(index, 1);
        return {
          ...anim,
          frames: updatedFrames
        };
      }
      return anim;
    }));
    setCurrentFrameIndex(0);
  };

  // Move frame item index left/right in sequence
  const handleMoveFrame = (index: number, direction: 'left' | 'right') => {
    setAnimations((prevAnims) => prevAnims.map(anim => {
      if (anim.id === activeAnimId) {
        const nextFrames = [...anim.frames];
        if (direction === 'left' && index > 0) {
          [nextFrames[index], nextFrames[index - 1]] = [nextFrames[index - 1], nextFrames[index]];
        } else if (direction === 'right' && index < nextFrames.length - 1) {
          [nextFrames[index], nextFrames[index + 1]] = [nextFrames[index + 1], nextFrames[index]];
        }
        return {
          ...anim,
          frames: nextFrames
        };
      }
      return anim;
    }));
    // Snap selected frame index to the moved position
    if (direction === 'left' && index > 0) {
      setCurrentFrameIndex(index - 1);
    } else if (direction === 'right' && index < activeAnim.frames.length - 1) {
      setCurrentFrameIndex(index + 1);
    }
  };

  // Clear workspace completely
  const handleResetWorkspace = () => {
    setImgUrl(null);
    setImgName('Canvas Bersih');
    setCurrentPresetId(null);
    setSlices([]);
    setSelectedSliceId(null);
    
    const blankAnims: SpritesheetAnimation[] = [
      {
        id: 'idle',
        name: 'Idle Loop',
        frames: [],
        fps: 6,
        loop: true
      }
    ];
    setAnimations(blankAnims);
    setActiveAnimId('idle');
    setCurrentFrameIndex(0);
    setIsPlaying(false);
  };

  // Apply AI Generated sliced configurations
  const handleApplyAiGeneratedConfig = (name: string, aiSlices: SpriteSlice[], aiAnimations: SpritesheetAnimation[]) => {
    // Keep active loaded spritesheet image, but merge new AI-proposed slices & cycles!
    setImgName(name);
    setSlices(aiSlices);
    setSelectedSliceId(aiSlices[0]?.id || null);
    
    if (aiAnimations && aiAnimations.length > 0) {
      setAnimations(aiAnimations);
      setActiveAnimId(aiAnimations[0].id);
    }
    setCurrentFrameIndex(0);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app_root_layout">
      {/* Visual Header Banner */}
      <header className="border-b border-slate-800 bg-slate-900/40 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Film className="h-5.5 w-5.5 text-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-100">
              Mbah Spritesheet Animator Pro
            </h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              Sistem Potongan Frame & Sekuens Animasi Klasik 2D
            </p>
          </div>
        </div>

        {/* Live Stat HUD */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Tv className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-500">Karakter:</span>
            <span className="font-bold text-slate-200 truncate max-w-[120px]">{imgName}</span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Potongan:</span>
            <span className="font-mono font-bold text-yellow-400">{slices.length}</span>
          </div>
        </div>
      </header>

      {/* Main App Workspace */}
      <main className="flex-1 p-4 lg:p-6 flex flex-col lg:flex-row gap-5 overflow-hidden">
        {/* Left Control Column */}
        <SidebarSprites
          currentPresetId={currentPresetId}
          onSelectPreset={handleSelectPreset}
          onUploadCustomSprite={handleUploadCustomSprite}
          slicerMode={slicerMode}
          setSlicerMode={setSlicerMode}
          gridCols={gridCols}
          setGridCols={setGridCols}
          gridRows={gridRows}
          setGridRows={setGridRows}
          onAutoSliceGrid={handleAutoSliceGrid}
          onResetWorkspace={handleResetWorkspace}
          onApplyAiGeneratedConfig={handleApplyAiGeneratedConfig}
        />

        {/* Center/Right Layout Board & Timeline */}
        <div className="flex-1 flex flex-col gap-5 overflow-hidden">
          {/* Slicing & TV Screen Stage */}
          <CanvasStage
            imgUrl={imgUrl}
            slices={slices}
            selectedSliceId={selectedSliceId}
            onSelectSlice={setSelectedSliceId}
            onAddSlice={handleAddSlice}
            onUpdateSlice={handleUpdateSlice}
            onDeleteSlice={handleDeleteSlice}
            activeAnim={activeAnim}
            currentFrameIndex={currentFrameIndex}
            isPlaying={isPlaying}
            slicerMode={slicerMode}
            setSlicerMode={setSlicerMode}
            gridCols={gridCols}
            gridRows={gridRows}
            onAddFrameToAnim={handleAddFrameToAnim}
            onUploadCustomSprite={handleUploadCustomSprite}
          />

          {/* Interactive Timeline Player */}
          <Timeline
            animations={animations}
            activeAnimId={activeAnimId}
            setActiveAnimId={setActiveAnimId}
            currentFrameIndex={currentFrameIndex}
            setCurrentFrameIndex={setCurrentFrameIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            onAddAnimation={handleAddAnimation}
            onDeleteAnimation={handleDeleteAnimation}
            onRemoveFrameFromAnim={handleRemoveFrameFromAnim}
            onMoveFrame={handleMoveFrame}
            slices={slices}
            imgUrl={imgUrl}
            imageDimensions={imageDimensions}
          />
        </div>
      </main>
    </div>
  );
}
