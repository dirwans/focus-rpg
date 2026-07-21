import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Scissors, 
  Grid, 
  Play, 
  Pause, 
  Maximize2, 
  Sparkles,
  Info,
  Trash2,
  ChevronRight,
  User,
  Film,
  Upload,
  Layers,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react';
import { SpriteSlice, SpritesheetAnimation, SlicerMode, Vector2D } from '../types';

interface CanvasStageProps {
  imgUrl: string | null;
  slices: SpriteSlice[];
  selectedSliceId: string | null;
  onSelectSlice: (id: string | null) => void;
  onAddSlice: (slice: SpriteSlice) => void;
  onUpdateSlice: (id: string, updates: Partial<SpriteSlice>) => void;
  onDeleteSlice: (id: string) => void;
  activeAnim: SpritesheetAnimation | null;
  currentFrameIndex: number;
  isPlaying: boolean;
  slicerMode: SlicerMode;
  setSlicerMode: (mode: SlicerMode) => void;
  gridCols: number;
  gridRows: number;
  onAddFrameToAnim: (sliceId: string) => void;
  onUploadCustomSprite?: (name: string, dataUrl: string, width: number, height: number, cols?: number) => void;
}

export default function CanvasStage({
  imgUrl,
  slices,
  selectedSliceId,
  onSelectSlice,
  onAddSlice,
  onUpdateSlice,
  onDeleteSlice,
  activeAnim,
  currentFrameIndex,
  isPlaying,
  slicerMode,
  setSlicerMode,
  gridCols,
  gridRows,
  onAddFrameToAnim,
  onUploadCustomSprite
}: CanvasStageProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // View state for spritesheet board
  const [zoom, setZoom] = React.useState<number>(1.8);
  const [isOnionSkinEnabled, setIsOnionSkinEnabled] = React.useState<boolean>(true); // default to true so users can see it immediately! Or false, but true is friendly. Let's default to false as usual, or true since they explicitly requested it and want to test it. True is great! Let's do false so they can toggle it, or true. Let's do false. Actually, true makes it instantly visible when they load! Let's do true.
  const [pan, setPan] = React.useState<Vector2D>({ x: 30, y: 50 });
  const [isPanning, setIsPanning] = React.useState<boolean>(false);
  const [panStart, setPanStart] = React.useState<Vector2D>({ x: 0, y: 0 });

  // Slicing state
  const [dragStart, setDragStart] = React.useState<Vector2D | null>(null);
  const [dragCurrent, setDragCurrent] = React.useState<Vector2D | null>(null);
  const [resizeSliceId, setResizeSliceId] = React.useState<string | null>(null);
  const [resizeStartSize, setResizeStartSize] = React.useState<{ x: number, y: number, w: number, h: number } | null>(null);

  // Natural image dimensions
  const [naturalSize, setNaturalSize] = React.useState<Vector2D>({ x: 400, y: 100 });

  const selectedSlice = slices.find(s => s.id === selectedSliceId);

  // Drag and drop custom file upload support on the canvas stage
  const [isStageDragging, setIsStageDragging] = React.useState(false);

  const handleStageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsStageDragging(true);
  };

  const handleStageDragLeave = () => {
    setIsStageDragging(false);
  };

  const handleStageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsStageDragging(false);
    
    if (!onUploadCustomSprite || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const fileArray = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type.startsWith('image/'));
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
      // Multiple images dropped! Stitch them horizontally.
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
            // Center inside cell box
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

  // Reset viewport when image changes
  React.useEffect(() => {
    setPan({ x: 40, y: 40 });
    setZoom(1.8);
  }, [imgUrl]);

  // Support Keyboard Delete/Backspace to delete selected slice
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedSliceId && (e.key === 'Delete' || e.key === 'Backspace')) {
        const activeEl = document.activeElement as any;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
          return;
        }
        onDeleteSlice(selectedSliceId);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSliceId, onDeleteSlice]);

  // Handle image load
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ x: img.naturalWidth || 400, y: img.naturalHeight || 100 });
  };

  // Convert client coordinates to image pixel space
  const getPixelCoords = (clientX: number, clientY: number, clamp = true): Vector2D | null => {
    if (!imgRef.current) return null;
    const rect = imgRef.current.getBoundingClientRect();
    
    // Position relative to image boundary on screen
    const rx = clientX - rect.left;
    const ry = clientY - rect.top;

    if (!clamp) {
      if (rx < 0 || rx > rect.width || ry < 0 || ry > rect.height) {
        return null;
      }
    }

    // Scale to natural image size
    const px = Math.round((rx / rect.width) * naturalSize.x);
    const py = Math.round((ry / rect.height) * naturalSize.y);

    // Clamp inside image bounds
    return {
      x: Math.max(0, Math.min(naturalSize.x, px)),
      y: Math.max(0, Math.min(naturalSize.y, py))
    };
  };

  // Handle board mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or space+click for pan
    if (e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
      return;
    }

    // Check if clicking outside the actual image bounds on the canvas stage background
    const pixInBounds = getPixelCoords(e.clientX, e.clientY, false);
    if (!pixInBounds) {
      onSelectSlice(null);
      return;
    }

    if (slicerMode === 'MANUAL') {
      // Check if clicking resize anchor of selected slice
      if (selectedSlice && imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        const ax = rect.left + (selectedSlice.x + selectedSlice.width) * (rect.width / naturalSize.x);
        const ay = rect.top + (selectedSlice.y + selectedSlice.height) * (rect.height / naturalSize.y);
        
        const dist = Math.hypot(e.clientX - ax, e.clientY - ay);
        if (dist < 14) {
          setResizeSliceId(selectedSlice.id);
          setResizeStartSize({ 
            x: selectedSlice.x, 
            y: selectedSlice.y, 
            w: selectedSlice.width, 
            h: selectedSlice.height 
          });
          setDragStart({ x: e.clientX, y: e.clientY });
          e.stopPropagation();
          return;
        }
      }

      // Check if clicking inside an existing slice
      const pix = getPixelCoords(e.clientX, e.clientY);
      if (pix) {
        const clickedSlice = [...slices].reverse().find(s => 
          pix.x >= s.x && pix.x <= s.x + s.width &&
          pix.y >= s.y && pix.y <= s.y + s.height
        );
        if (clickedSlice) {
          onSelectSlice(clickedSlice.id);
          return;
        }
      }

      // Else start drawing new slice
      const startPix = getPixelCoords(e.clientX, e.clientY);
      if (startPix) {
        setDragStart(startPix);
        setDragCurrent(startPix);
      }
    } else {
      // GRID MODE: clicking on a grid cell
      const pix = getPixelCoords(e.clientX, e.clientY);
      if (pix) {
        const cellW = naturalSize.x / gridCols;
        const cellH = naturalSize.y / gridRows;
        const col = Math.floor(pix.x / cellW);
        const row = Math.floor(pix.y / cellH);

        // Calculate cell bounding box
        const x = Math.round(col * cellW);
        const y = Math.round(row * cellH);
        const w = Math.round(cellW);
        const h = Math.round(cellH);

        // Find if this slice already exists
        const existing = slices.find(s => 
          Math.abs(s.x - x) < 3 && 
          Math.abs(s.y - y) < 3 && 
          Math.abs(s.width - w) < 3 && 
          Math.abs(s.height - h) < 3
        );

        if (existing) {
          onSelectSlice(existing.id);
        } else {
          // Create new slice for this cell
          const newId = `slice_${Date.now()}`;
          const newSlice: SpriteSlice = {
            id: newId,
            name: `Grid ${col + 1}x${row + 1}`,
            x,
            y,
            width: w,
            height: h
          };
          onAddSlice(newSlice);
          onSelectSlice(newId);
        }
      }
    }
  };

  // Handle board mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (resizeSliceId && dragStart && resizeStartSize && imgRef.current) {
      const rect = imgRef.current.getBoundingClientRect();
      const dxPix = Math.round(((e.clientX - dragStart.x) / rect.width) * naturalSize.x);
      const dyPix = Math.round(((e.clientY - dragStart.y) / rect.height) * naturalSize.y);

      onUpdateSlice(resizeSliceId, {
        width: Math.max(10, resizeStartSize.w + dxPix),
        height: Math.max(10, resizeStartSize.h + dyPix)
      });
      return;
    }

    if (dragStart && slicerMode === 'MANUAL') {
      const currentPix = getPixelCoords(e.clientX, e.clientY);
      if (currentPix) {
        setDragCurrent(currentPix);
      }
    }
  };

  // Handle board mouse up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (resizeSliceId) {
      setResizeSliceId(null);
      setResizeStartSize(null);
      setDragStart(null);
      return;
    }

    if (dragStart && dragCurrent && slicerMode === 'MANUAL') {
      const x = Math.min(dragStart.x, dragCurrent.x);
      const y = Math.min(dragStart.y, dragCurrent.y);
      const w = Math.abs(dragStart.x - dragCurrent.x);
      const h = Math.abs(dragStart.y - dragCurrent.y);

      // Only add slice if significant in size
      if (w > 8 && h > 8) {
        const newId = `slice_${Date.now()}`;
        const newSlice: SpriteSlice = {
          id: newId,
          name: `Potongan ${slices.length + 1}`,
          x,
          y,
          width: w,
          height: h
        };
        onAddSlice(newSlice);
        onSelectSlice(newId);
      }

      setDragStart(null);
      setDragCurrent(null);
    }
  };

  // Active slice frame rendering for live preview
  const activeFrameSliceId = activeAnim && activeAnim.frames.length > 0 
    ? activeAnim.frames[currentFrameIndex] 
    : selectedSliceId;

  const previewSlice = slices.find(s => s.id === activeFrameSliceId);

  // Determine Onion Skin slice (previous frame/slice)
  let onionSkinSliceId: string | null = null;
  if (activeAnim && activeAnim.frames.length > 0) {
    const len = activeAnim.frames.length;
    if (len > 1) {
      const prevIdx = (currentFrameIndex - 1 + len) % len;
      onionSkinSliceId = activeAnim.frames[prevIdx];
    }
  } else if (selectedSliceId) {
    const idx = slices.findIndex(s => s.id === selectedSliceId);
    if (idx > 0) {
      onionSkinSliceId = slices[idx - 1].id;
    }
  }

  const onionSkinSlice = onionSkinSliceId ? slices.find(s => s.id === onionSkinSliceId) : null;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 h-[560px]" id="spritesheet_stage_container">
      {/* 1. Slicing Workspace (Left 60%) */}
      <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-lg">
        {/* Workspace Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Scissors className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Ruang Slicing Spritesheet
            </h3>
          </div>

          {/* Slicer Mode Selection */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => {
                setSlicerMode('GRID');
                onSelectSlice(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-semibold ${
                slicerMode === 'GRID' 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Kotak Grid</span>
            </button>
            <button
              onClick={() => {
                setSlicerMode('MANUAL');
                onSelectSlice(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-semibold ${
                slicerMode === 'MANUAL' 
                  ? 'bg-emerald-500 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>Slicing Bebas</span>
            </button>
          </div>
        </div>

        {/* Board viewport */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDragOver={handleStageDragOver}
          onDragLeave={handleStageDragLeave}
          onDrop={handleStageDrop}
          className="flex-1 overflow-hidden relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] cursor-crosshair select-none"
        >
          {isStageDragging && (
            <div className="absolute inset-0 bg-emerald-950/80 border-2 border-emerald-400 border-dashed z-50 flex flex-col items-center justify-center p-6 text-center">
              <Upload className="h-12 w-12 text-emerald-400 animate-bounce mb-3" />
              <p className="text-sm font-extrabold text-emerald-300">Cemplungno kene Mbah! (Lepaskan PNG)</p>
              <p className="text-xs text-emerald-500 mt-1">Seret spritesheet kene kanggo upload langsung menyang canvas</p>
            </div>
          )}

          {imgUrl ? (
            <div 
              className="absolute origin-top-left transition-transform duration-75"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            >
              {/* Loaded spritesheet image */}
              <div className="relative border border-dashed border-slate-700 p-1 bg-slate-950/30">
                <img 
                  ref={imgRef}
                  src={imgUrl} 
                  alt="Spritesheet Source" 
                  onLoad={handleImageLoad}
                  className="max-w-none block object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  draggable={false}
                />

                {/* Slices boxes overlays */}
                {slices.map((slice) => {
                  const isSelected = slice.id === selectedSliceId;
                  const isActiveInAnim = activeAnim?.frames.includes(slice.id);
                  return (
                    <div
                      key={slice.id}
                      className={`absolute border transition-colors ${
                        isSelected 
                          ? 'border-yellow-400 border-2 bg-yellow-400/10 z-30' 
                          : isActiveInAnim 
                            ? 'border-emerald-500/80 bg-emerald-500/5 z-20 hover:border-emerald-400'
                            : 'border-slate-500/60 bg-slate-500/5 hover:border-emerald-500/60 z-10'
                      }`}
                      style={{
                        left: `${slice.x + 4}px`, // Offset for 4px image padding
                        top: `${slice.y + 4}px`,
                        width: `${slice.width}px`,
                        height: `${slice.height}px`
                      }}
                      title={`${slice.name} (${slice.width}x${slice.height})`}
                    >
                      {/* Name badge */}
                      <span className={`absolute -top-4.5 left-0 text-[8px] font-bold px-1 py-0.5 rounded leading-none flex items-center gap-1 ${
                        isSelected ? 'bg-yellow-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        <span>{slice.name}</span>
                        {slice.flipH && <span title="Flipped Horizontally" className="text-[7px]">↔️</span>}
                        {slice.flipV && <span title="Flipped Vertically" className="text-[7px]">↕️</span>}
                      </span>

                      {/* Onion Skin overlay inside the selected slice */}
                      {isSelected && isOnionSkinEnabled && onionSkinSlice && imgUrl && (
                        <div 
                          className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0"
                          style={{ opacity: 0.4 }}
                        >
                          {(() => {
                            const w = onionSkinSlice.width;
                            const h = onionSkinSlice.height;
                            return (
                              <div 
                                style={{
                                  width: `${w}px`,
                                  height: `${h}px`,
                                  backgroundImage: `url("${imgUrl}")`,
                                  backgroundPosition: `-${onionSkinSlice.x}px -${onionSkinSlice.y}px`,
                                  backgroundRepeat: 'no-repeat',
                                  imageRendering: 'pixelated',
                                  transform: 'scale(1)',
                                  filter: 'sepia(1) saturate(5) hue-rotate(120deg)', // Green silhouette for previous frame on canvas
                                }}
                              />
                            );
                          })()}
                        </div>
                      )}

                      {/* Resize drag handle at bottom-right corner */}
                      {isSelected && slicerMode === 'MANUAL' && (
                        <div 
                          className="absolute bottom-[-5px] right-[-5px] w-3.5 h-3.5 bg-yellow-400 border border-slate-900 rounded-sm cursor-se-resize flex items-center justify-center shadow-lg"
                          title="Tarik untuk ubah ukuran"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Grid line overlay (GRID MODE) */}
                {slicerMode === 'GRID' && (
                  <div className="absolute inset-1 pointer-events-none border border-emerald-500/20">
                    {/* Columns lines */}
                    {Array.from({ length: gridCols - 1 }).map((_, idx) => {
                      const pct = ((idx + 1) / gridCols) * 100;
                      return (
                        <div 
                          key={`col-${idx}`}
                          className="absolute top-0 bottom-0 border-l border-dashed border-emerald-500/35"
                          style={{ left: `${pct}%` }}
                        />
                      );
                    })}
                    {/* Rows lines */}
                    {Array.from({ length: gridRows - 1 }).map((_, idx) => {
                      const pct = ((idx + 1) / gridRows) * 100;
                      return (
                        <div 
                          key={`row-${idx}`}
                          className="absolute left-0 right-0 border-t border-dashed border-emerald-500/35"
                          style={{ top: `${pct}%` }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Dragging manual slice overlay */}
                {dragStart && dragCurrent && slicerMode === 'MANUAL' && (
                  <div 
                    className="absolute border border-dashed border-yellow-400 bg-yellow-400/20 z-40"
                    style={{
                      left: `${Math.min(dragStart.x, dragCurrent.x) + 4}px`,
                      top: `${Math.min(dragStart.y, dragCurrent.y) + 4}px`,
                      width: `${Math.abs(dragStart.x - dragCurrent.x)}px`,
                      height: `${Math.abs(dragStart.y - dragCurrent.y)}px`
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <Scissors className="h-10 w-10 mb-2 text-slate-600 animate-pulse" />
              <p className="text-xs font-semibold">Belum ada Spritesheet, Mbah</p>
              <p className="text-[10px] text-slate-600 mt-1">Silakan pilih preset di tab kiri atau upload PNG baru</p>
            </div>
          )}

          {/* View control HUD */}
          <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 rounded-lg p-1.5 flex items-center gap-1.5 shadow-xl">
            <button 
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.25))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Perkecil"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] text-slate-400 font-mono w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={() => setZoom(prev => Math.min(4, prev + 0.25))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Perbesar"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-1" />
            <button 
              onClick={() => setPan({ x: 40, y: 40 })}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Tengah-tengah"
            >
              <Move className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* User tips banner depending on mode */}
          <div className="absolute top-3 left-3 bg-slate-950/90 border border-slate-800/80 rounded-lg py-1 px-2.5 flex items-center gap-2 text-[10px] text-slate-400 shadow-md">
            <Info className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            {slicerMode === 'GRID' ? (
              <span><b>Grid Mode:</b> Klik kotak kotak di atas untuk membuat/pilih potongan frame, Mbah!</span>
            ) : (
              <span><b>Slicing Bebas:</b> Klik & seret mouse pada gambar untuk membuat potongan frame kustom!</span>
            )}
          </div>
        </div>

        {/* Selected slice info footer */}
        {selectedSlice && (
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <span className="font-bold text-yellow-400 font-mono text-[11px] bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                {selectedSlice.name}
              </span>
              <span className="text-slate-400 text-[10px]">
                Posisi: <b className="font-mono">{selectedSlice.x},{selectedSlice.y}</b>
              </span>
              <span className="text-slate-400 text-[10px]">
                Ukuran: <b className="font-mono">{selectedSlice.width}px &times; {selectedSlice.height}px</b>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Flip Horizontally */}
              <button
                onClick={() => onUpdateSlice(selectedSlice.id, { flipH: !selectedSlice.flipH })}
                className={`p-1.5 rounded transition-all flex items-center gap-1 text-[10px] font-bold border cursor-pointer ${
                  selectedSlice.flipH 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Balik Horisontal (Cermin Kiri-Kanan)"
                id="btn_flip_horizontal"
              >
                <FlipHorizontal className="h-3.5 w-3.5" />
                <span>Horisontal</span>
              </button>

              {/* Flip Vertically */}
              <button
                onClick={() => onUpdateSlice(selectedSlice.id, { flipV: !selectedSlice.flipV })}
                className={`p-1.5 rounded transition-all flex items-center gap-1 text-[10px] font-bold border cursor-pointer ${
                  selectedSlice.flipV 
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Balik Vertikal (Balik Atas-Bawah)"
                id="btn_flip_vertical"
              >
                <FlipVertical className="h-3.5 w-3.5" />
                <span>Vertikal</span>
              </button>

              <div className="w-px h-5 bg-slate-800 mx-1" />

              <button
                onClick={() => onAddFrameToAnim(selectedSlice.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] text-white rounded font-bold text-[10px] transition-all cursor-pointer"
                title="Masukkan frame terpilih ke timeline animasi"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <span>Pasang ke Linimasa</span>
              </button>
              <button
                onClick={() => onDeleteSlice(selectedSlice.id)}
                className="p-1 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded transition-colors"
                title="Hapus Potongan Ini"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. LIVE RETRO ARCADE PREVIEW (Right 40%) */}
      <div className="w-full lg:w-[320px] flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative shadow-lg">
        {/* TV Header with glowing On Air */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Live Animasi TV Mbah
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              {isPlaying ? 'ON AIR' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* The Retro Monitor Screen */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden group">
          {/* Scanning CRT Line effect overlays */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-10" />
          
          {/* Subtle vignette shadow */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] z-10" />

          {/* Active Sprite Display Frame */}
          {previewSlice && imgUrl ? (
            <div className="relative flex items-center justify-center p-4 bg-slate-900/40 rounded-lg border border-slate-800/40 w-48 h-48 shadow-2xl">
              {/* Onion Skin Overlay (Previous Frame) */}
              {isOnionSkinEnabled && onionSkinSlice && imgUrl && (
                (() => {
                  const maxDispSize = 160;
                  const scale = Math.min(maxDispSize / onionSkinSlice.width, maxDispSize / onionSkinSlice.height);
                  const dispW = onionSkinSlice.width * scale;
                  const dispH = onionSkinSlice.height * scale;
                  const bgSizeW = naturalSize.x * scale;
                  const bgSizeH = naturalSize.y * scale;
                  const bgPosX = -onionSkinSlice.x * scale;
                  const bgPosY = -onionSkinSlice.y * scale;

                  return (
                    <div 
                      className="absolute pointer-events-none mix-blend-screen"
                      style={{
                        width: `${dispW}px`,
                        height: `${dispH}px`,
                        backgroundImage: `url("${imgUrl}")`,
                        backgroundSize: `${bgSizeW}px ${bgSizeH}px`,
                        backgroundPosition: `${bgPosX}px ${bgPosY}px`,
                        backgroundRepeat: 'no-repeat',
                        imageRendering: 'pixelated',
                        opacity: 0.35,
                        filter: 'sepia(1) saturate(5) hue-rotate(320deg)', // Red/pink silhouette for previous frame on TV preview
                        transform: `scale(${onionSkinSlice.flipH ? -1 : 1}, ${onionSkinSlice.flipV ? -1 : 1})`,
                        zIndex: 5
                      }}
                    />
                  );
                })()
              )}

              {(() => {
                const maxDispSize = 160;
                const scale = Math.min(maxDispSize / previewSlice.width, maxDispSize / previewSlice.height);
                const dispW = previewSlice.width * scale;
                const dispH = previewSlice.height * scale;
                const bgSizeW = naturalSize.x * scale;
                const bgSizeH = naturalSize.y * scale;
                const bgPosX = -previewSlice.x * scale;
                const bgPosY = -previewSlice.y * scale;

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
                      transform: `scale(${previewSlice.flipH ? -1 : 1}, ${previewSlice.flipV ? -1 : 1})`,
                    }}
                  />
                );
              })()}

              {/* HUD showing details about sliced frame */}
              <div className="absolute bottom-2 left-2 text-[9px] font-mono text-slate-500 bg-slate-950/80 px-1.5 py-0.5 rounded">
                Frame: {activeFrameSliceId}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-slate-600 p-4">
              <Film className="h-10 w-10 mb-2 text-slate-800 animate-bounce" />
              <p className="text-[11px] font-bold text-slate-500">Linimasa Kosong Mbah</p>
              <p className="text-[9px] text-slate-700 max-w-[200px] mt-1">
                Silakan pilih salah satu potongan di kiri lalu klik <b>"Pasang ke Linimasa"</b> untuk memulai gerakannya!
              </p>
            </div>
          )}

          {/* Sequence info name */}
          {activeAnim && (
            <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800/80 rounded py-1 px-2 flex items-center gap-1.5 text-[10px] text-slate-300">
              <Film className="h-3 w-3 text-indigo-400" />
              <span><b>Grup:</b> {activeAnim.name}</span>
            </div>
          )}

          {/* Speed badge */}
          {activeAnim && (
            <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800/80 rounded py-1 px-2 text-[9px] text-slate-400 font-mono">
              FPS: {activeAnim.fps}hz
            </div>
          )}
        </div>

        {/* TV options bar (Onion Skin Toggle) */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400" id="tv_onion_skin_controls">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="font-bold text-slate-300 text-[11px]">Onion Skin (Bayangan)</span>
              <span className="text-[9px] text-slate-500">Bandingkan posisi frame sebelumnya</span>
            </div>
          </div>
          
          <button
            onClick={() => setIsOnionSkinEnabled(!isOnionSkinEnabled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isOnionSkinEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            title="Aktifkan bayangan frame sebelumnya (Onion Skin)"
            id="onion_skin_toggle_switch"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isOnionSkinEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* TV control block footer */}
        {activeAnim && activeAnim.frames.length > 0 && (
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-300">Frame Aktif:</span>
              <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-indigo-400 text-[11px] font-bold">
                {currentFrameIndex + 1} / {activeAnim.frames.length}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 italic">
              Looping Otomatis
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
