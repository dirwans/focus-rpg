import React from 'react';
import { Play, Pause, Square, Key, Plus, Trash2, Repeat, Zap, Layers, RefreshCw, Ghost } from 'lucide-react';
import { Animation, Bone, Keyframe } from '../types';

interface TimelineProps {
  animations: Animation[];
  activeAnimId: string;
  setActiveAnimId: (id: string) => void;
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  fps: number;
  setFps: (fps: number) => void;
  loop: boolean;
  setLoop: (loop: boolean) => void;
  
  bones: Bone[];
  selectedBoneId: string | null;
  
  onAddKeyframe: (frame: number) => void;
  onRemoveKeyframe: (frame: number) => void;
  onAddAnimation: (name: string, duration: number) => void;
  onDeleteAnimation: (id: string) => void;
  onUpdateAnimationDuration: (id: string, duration: number) => void;
  onClearAllKeyframes: (id: string) => void;

  autoKeyframe: boolean;
  setAutoKeyframe: (val: boolean) => void;

  showOnionSkin?: boolean;
  setShowOnionSkin?: (val: boolean) => void;
  onUpdateBoneEasing?: (frame: number, boneId: string, easing: 'linear' | 'ease-in' | 'ease-out' | 'elastic') => void;
}

export default function Timeline({
  animations,
  activeAnimId,
  setActiveAnimId,
  currentFrame,
  setCurrentFrame,
  isPlaying,
  setIsPlaying,
  fps,
  setFps,
  loop,
  setLoop,
  bones,
  selectedBoneId,
  onAddKeyframe,
  onRemoveKeyframe,
  onAddAnimation,
  onDeleteAnimation,
  onUpdateAnimationDuration,
  onClearAllKeyframes,
  autoKeyframe,
  setAutoKeyframe,
  showOnionSkin = false,
  setShowOnionSkin,
  onUpdateBoneEasing
}: TimelineProps) {
  const activeAnim = animations.find((a) => a.id === activeAnimId) || animations[0];
  const duration = activeAnim ? activeAnim.duration : 40;

  const currentKeyframe = activeAnim ? activeAnim.keyframes.find(k => k.frame === currentFrame) : null;
  const selectedBoneTransform = currentKeyframe && selectedBoneId ? currentKeyframe.boneTransforms[selectedBoneId] : null;
  const currentEasing = (selectedBoneTransform && selectedBoneTransform.easing) || 'linear';

  const [newAnimName, setNewAnimName] = React.useState('');
  const [showAddAnim, setShowAddAnim] = React.useState(false);

  // Check if a frame has any keyframe
  const hasKeyframe = (frameNum: number): boolean => {
    if (!activeAnim) return false;
    return activeAnim.keyframes.some((kf) => kf.frame === frameNum);
  };

  // Check if a frame has a keyframe specifically for the selected bone
  const hasSelectedBoneKeyframe = (frameNum: number): boolean => {
    if (!activeAnim || !selectedBoneId) return false;
    const kf = activeAnim.keyframes.find((k) => k.frame === frameNum);
    return !!(kf && kf.boneTransforms[selectedBoneId]);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const padding = 12; // horizontal padding in the timeline
    const usableWidth = rect.width - padding * 2;
    if (usableWidth <= 0) return;

    let percentage = (clickX - padding) / usableWidth;
    percentage = Math.max(0, Math.min(1, percentage));

    const targetFrame = Math.round(percentage * duration);
    setCurrentFrame(targetFrame);
  };

  const handleAddAnimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnimName.trim()) return;
    onAddAnimation(newAnimName.trim(), 40);
    setNewAnimName('');
    setShowAddAnim(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };

  return (
    <div className="bg-[#0E0E10] border-t border-white/10 p-4 text-slate-300 flex flex-col gap-4 select-none">
      
      {/* Playback Controls & Anim Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Left: Animation Dropdown & Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-amber-500" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Clip:</span>
          </div>
          
          <select
            value={activeAnimId}
            onChange={(e) => {
              setActiveAnimId(e.target.value);
              setCurrentFrame(0);
            }}
            className="rounded bg-[#0A0A0B] border border-white/10 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/85 cursor-pointer"
            id="anim_selector"
          >
            {animations.map((anim) => (
              <option key={anim.id} value={anim.id}>
                {anim.name} ({anim.duration}f)
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddAnim(!showAddAnim)}
            className="rounded bg-transparent hover:bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-slate-300 font-medium transition-all cursor-pointer"
            id="timeline_new_anim_btn"
          >
            + New Clip
          </button>

          {animations.length > 1 && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete the clip "${activeAnim.name}"?`)) {
                  onDeleteAnimation(activeAnimId);
                }
              }}
              className="rounded bg-transparent hover:bg-red-950 hover:text-red-300 hover:border-red-900 border border-white/10 px-2.5 py-1.5 text-xs text-slate-400 transition-all cursor-pointer"
              title="Delete Active Clip"
              id="timeline_delete_anim_btn"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Center: Play, Pause, Scrub buttons */}
        <div className="flex items-center gap-2 bg-[#0A0A0B] border border-white/10 p-1 rounded">
          <button
            onClick={togglePlayback}
            className={`p-2 rounded transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 text-white font-bold'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
            id="play_pause_btn"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
          </button>

          <button
            onClick={stopPlayback}
            className="p-2 rounded text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            title="Stop & Reset"
            id="stop_btn"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Loop Option */}
          <button
            onClick={() => setLoop(!loop)}
            className={`p-2 rounded transition-all cursor-pointer ${
              loop ? 'text-amber-500 font-bold bg-white/5 border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
            title="Loop Playback"
            id="loop_toggle_btn"
          >
            <Repeat className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Ghost Onion Skin Option */}
          <button
            onClick={() => setShowOnionSkin && setShowOnionSkin(!showOnionSkin)}
            className={`p-2 rounded transition-all cursor-pointer flex items-center justify-center ${
              showOnionSkin ? 'text-amber-500 font-bold bg-white/5 border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
            title="Ghost Onion Skin (Shows previous & next keyframe ghost frames)"
            id="onion_skin_toggle_btn"
          >
            <Ghost className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* FPS Speed Slider */}
          <div className="flex items-center gap-2 px-2 text-xs text-slate-400">
            <span>{fps} FPS</span>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              className="w-16 h-1 bg-white/10 rounded appearance-none cursor-pointer accent-amber-500"
              title="Frames Per Second"
              id="fps_slider"
            />
          </div>
        </div>

        {/* Right: Keyframing / Baking Utilities */}
        <div className="flex items-center gap-3">
          {/* Auto Keyframe Toggle */}
          <button
            onClick={() => setAutoKeyframe(!autoKeyframe)}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
              autoKeyframe
                ? 'bg-white/10 border-amber-500 text-amber-500 font-bold'
                : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            title="Automatically insert keyframe when rotating bones"
            id="auto_keyframe_toggle"
          >
            <Zap className={`h-3.5 w-3.5 ${autoKeyframe ? 'fill-current text-amber-500 animate-pulse' : ''}`} />
            <span>Auto-Key</span>
          </button>

          {/* Add Keyframe manually */}
          <button
            onClick={() => onAddKeyframe(currentFrame)}
            className="flex items-center gap-1.5 rounded bg-amber-600 hover:bg-amber-500 px-3.5 py-1.5 text-[10px] uppercase tracking-widest font-bold text-white transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-950/20"
            title="Lock current pose at this frame"
            id="manual_keyframe_btn"
          >
            <Key className="h-3.5 w-3.5 fill-current" />
            <span>Keyframe Pose</span>
          </button>

          {hasKeyframe(currentFrame) && (
            <button
              onClick={() => onRemoveKeyframe(currentFrame)}
              className="flex items-center gap-1.5 rounded bg-[#1A1A1E] hover:bg-white/5 hover:text-red-300 hover:border-red-900/40 border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-widest text-slate-300 transition-all cursor-pointer"
              title="Delete pose keyframe at current frame"
              id="delete_keyframe_btn"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Key</span>
            </button>
          )}

          {/* Interpolation/Easing Dropdown */}
          {currentKeyframe && selectedBoneId && (
            <div className="flex items-center gap-1.5 bg-[#0A0A0B] border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Easing:</span>
              <select
                value={currentEasing}
                onChange={(e) => {
                  if (onUpdateBoneEasing) {
                    onUpdateBoneEasing(currentFrame, selectedBoneId, e.target.value as any);
                  }
                }}
                className="bg-transparent border-none text-slate-200 outline-none cursor-pointer focus:ring-0 text-xs font-semibold py-0"
                id="bone_easing_dropdown"
              >
                <option value="linear" className="bg-[#0E0E10]">Linear (Biasa)</option>
                <option value="ease-in" className="bg-[#0E0E10]">Ease In (Mulus Cepet)</option>
                <option value="ease-out" className="bg-[#0E0E10]">Ease Out (Mulus Alon)</option>
                <option value="elastic" className="bg-[#0E0E10]">Elastic (Mantul)</option>
              </select>
            </div>
          )}
        </div>

      </div>

      {/* Add Animation Popover Form */}
      {showAddAnim && (
        <form
          onSubmit={handleAddAnimSubmit}
          className="bg-[#0E0E10] border border-white/10 p-3 rounded flex items-center gap-2 max-w-md animate-in fade-in zoom-in-95 duration-100"
        >
          <input
            type="text"
            placeholder="Animation Name (e.g. Walk)"
            value={newAnimName}
            onChange={(e) => setNewAnimName(e.target.value)}
            className="flex-1 rounded bg-[#0A0A0B] border border-white/10 px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            id="new_anim_name_input"
            autoFocus
          />
          <button
            type="submit"
            className="rounded bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white px-3 py-1 transition-all cursor-pointer"
            id="submit_new_anim_btn"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setShowAddAnim(false)}
            className="rounded bg-transparent hover:bg-white/5 border border-white/10 text-xs font-semibold px-2 py-1 text-slate-300 transition-all cursor-pointer"
            id="cancel_new_anim_btn"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Horizontal Timeline Track */}
      <div className="flex flex-col gap-1.5 mt-1">
        
        {/* Frame Label Header */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono px-3">
          <span>FRAME {currentFrame} / {duration}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              <span>Full pose keyframe</span>
            </div>
            {selectedBoneId && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                <span>Selected bone key</span>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Track Area */}
        <div
          onClick={handleTimelineClick}
          className="relative bg-[#050506] border border-white/10 h-16 rounded cursor-pointer flex flex-col justify-between overflow-hidden group hover:border-white/20 transition-all"
        >
          {/* Verticals grid line for each frame */}
          <div className="absolute inset-0 flex justify-between px-3 pointer-events-none opacity-20">
            {Array.from({ length: duration + 1 }).map((_, f) => {
              const isMajor = f % 5 === 0;
              return (
                <div
                  key={f}
                  className={`h-full border-l ${
                    isMajor ? 'border-slate-400 h-full' : 'border-slate-600 h-1/2'
                  }`}
                  style={{ width: '1px' }}
                />
              );
            })}
          </div>

          {/* Numbers Track */}
          <div className="relative flex justify-between px-3 text-[10px] font-mono text-slate-400 pt-1 pointer-events-none">
            {Array.from({ length: duration + 1 }).map((_, f) => {
              const showText = f % 5 === 0 || f === duration;
              return (
                <div key={f} className="text-center w-0 flex justify-center items-center">
                  {showText && <span className="-translate-x-1/2 text-slate-500">{f}</span>}
                </div>
              );
            })}
          </div>

          {/* Full Pose Keyframe Markers row */}
          <div className="relative flex justify-between px-3 h-3 items-center pointer-events-none">
            {Array.from({ length: duration + 1 }).map((_, f) => {
              const active = hasKeyframe(f);
              return (
                <div key={f} className="w-0 flex justify-center items-center">
                  {active && (
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full border border-[#0A0A0B] -translate-x-1/2 shadow shadow-black" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Bone Keyframe Markers row */}
          <div className="relative flex justify-between px-3 h-3 items-center pb-1.5 pointer-events-none">
            {Array.from({ length: duration + 1 }).map((_, f) => {
              const activeSelected = hasSelectedBoneKeyframe(f);
              return (
                <div key={f} className="w-0 flex justify-center items-center">
                  {activeSelected && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full border border-[#0A0A0B] -translate-x-1/2 shadow shadow-black" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Draggable Red Playhead line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10 transition-all duration-75"
            style={{
              left: `calc(12px + ${((currentFrame / duration) * 100).toFixed(4)}% - ${((currentFrame / duration) * 24).toFixed(4)}px)`
            }}
          >
            <div className="absolute top-0 -left-1.5 w-3 h-2 bg-red-500 rounded-b shadow shadow-black" />
          </div>

        </div>

        {/* Clip settings */}
        <div className="flex items-center gap-4 text-xs text-slate-500 px-1 pt-1 justify-between">
          <div className="flex items-center gap-2">
            <span>Clip Duration:</span>
            <input
              type="number"
              min="5"
              max="200"
              value={duration}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= 5 && val <= 200) {
                  onUpdateAnimationDuration(activeAnimId, val);
                }
              }}
              className="w-16 rounded bg-[#0A0A0B] border border-white/10 px-2 py-0.5 text-xs text-slate-300 text-center focus:outline-none focus:border-amber-500 font-semibold"
              id="clip_duration_input"
            />
            <span>frames</span>
          </div>
          <button
            onClick={() => {
              if (confirm('Clear ALL keyframes in this clip? This cannot be undone.')) {
                onClearAllKeyframes(activeAnimId);
              }
            }}
            className="text-[10px] text-slate-500 hover:text-red-400 hover:underline cursor-pointer"
            id="clear_all_keyframes_btn"
          >
            Reset Clip Keyframes
          </button>
        </div>

      </div>

    </div>
  );
}
