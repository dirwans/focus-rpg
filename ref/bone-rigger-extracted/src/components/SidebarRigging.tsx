import React from 'react';
import { 
  Plus, 
  Trash2, 
  GitCommit, 
  Settings, 
  Layers, 
  ShieldCheck, 
  Bookmark, 
  Sparkles, 
  Save 
} from 'lucide-react';
import { Bone, AppMode, BoneTransform } from '../types';

interface SidebarRiggingProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  bones: Bone[];
  selectedBoneId: string | null;
  setSelectedBoneId: (id: string | null) => void;
  onAddBone: () => void;
  onDeleteBone: (id: string) => void;
  onUpdateBone: (id: string, updates: Partial<Bone>) => void;
  interpolatedTransforms?: Record<string, BoneTransform>;
  onApplyPose?: (poseTransforms: Record<string, BoneTransform>) => void;
}

const BONE_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#14B8A6'  // Teal
];

const PREDEFINED_POSES = [
  {
    id: 'running',
    name: 'Running',
    description: 'Dynamic sprinting stance with bent legs & swinging arms',
    icon: '🏃',
    transforms: {
      hip: { rotation: 0, translation: { x: 0, y: 12 } },
      torso: { rotation: 0.18, translation: { x: 0, y: 0 } },
      head: { rotation: -0.12, translation: { x: 0, y: 0 } },
      leftArm: { rotation: 0.8, translation: { x: 0, y: 0 } },
      rightArm: { rotation: -0.9, translation: { x: 0, y: 0 } },
      leftLeg: { rotation: -0.7, translation: { x: 0, y: 0 } },
      rightLeg: { rotation: 0.7, translation: { x: 0, y: 0 } }
    }
  },
  {
    id: 'idle',
    name: 'Idle Stance',
    description: 'Natural, relaxed rest stance with centered posture',
    icon: '🧍',
    transforms: {
      hip: { rotation: 0, translation: { x: 0, y: 0 } },
      torso: { rotation: 0, translation: { x: 0, y: 0 } },
      head: { rotation: 0, translation: { x: 0, y: 0 } },
      leftArm: { rotation: 0.15, translation: { x: 0, y: 0 } },
      rightArm: { rotation: -0.15, translation: { x: 0, y: 0 } },
      leftLeg: { rotation: 0.05, translation: { x: 0, y: 0 } },
      rightLeg: { rotation: -0.05, translation: { x: 0, y: 0 } }
    }
  },
  {
    id: 'punching',
    name: 'Punching',
    description: 'Powerful combat punch with core rotation & step forward',
    icon: '👊',
    transforms: {
      hip: { rotation: 0, translation: { x: 10, y: 6 } },
      torso: { rotation: -0.28, translation: { x: 0, y: 0 } },
      head: { rotation: 0.15, translation: { x: 0, y: 0 } },
      leftArm: { rotation: 1.1, translation: { x: 0, y: 0 } },
      rightArm: { rotation: -1.6, translation: { x: 0, y: 0 } },
      leftLeg: { rotation: 0.35, translation: { x: 0, y: 0 } },
      rightLeg: { rotation: -0.35, translation: { x: 0, y: 0 } }
    }
  },
  {
    id: 'jumping',
    name: 'Jumping / Flying',
    description: 'Dramatic mid-air stance with limbs extended outwards',
    icon: '🚀',
    transforms: {
      hip: { rotation: 0, translation: { x: 0, y: -25 } },
      torso: { rotation: -0.1, translation: { x: 0, y: 0 } },
      head: { rotation: 0.18, translation: { x: 0, y: 0 } },
      leftArm: { rotation: -1.3, translation: { x: 0, y: 0 } },
      rightArm: { rotation: -1.3, translation: { x: 0, y: 0 } },
      leftLeg: { rotation: 0.45, translation: { x: 0, y: 0 } },
      rightLeg: { rotation: 0.35, translation: { x: 0, y: 0 } }
    }
  },
  {
    id: 'defending',
    name: 'Defending',
    description: 'Crouched shield block with defensive arm guard',
    icon: '🛡️',
    transforms: {
      hip: { rotation: 0, translation: { x: -6, y: 14 } },
      torso: { rotation: 0.22, translation: { x: 0, y: 0 } },
      head: { rotation: -0.18, translation: { x: 0, y: 0 } },
      leftArm: { rotation: -0.8, translation: { x: 0, y: 0 } },
      rightArm: { rotation: 0.9, translation: { x: 0, y: 0 } },
      leftLeg: { rotation: 0.4, translation: { x: 0, y: 0 } },
      rightLeg: { rotation: 0.4, translation: { x: 0, y: 0 } }
    }
  },
  {
    id: 'victory',
    name: 'Victory / Salute',
    description: 'Proud triumphal pose with one arm raised high',
    icon: '🏆',
    transforms: {
      hip: { rotation: 0, translation: { x: 0, y: -4 } },
      torso: { rotation: -0.12, translation: { x: 0, y: 0 } },
      head: { rotation: -0.15, translation: { x: 0, y: 0 } },
      leftArm: { rotation: -1.9, translation: { x: 0, y: 0 } },
      rightArm: { rotation: 0.25, translation: { x: 0, y: 0 } },
      leftLeg: { rotation: -0.12, translation: { x: 0, y: 0 } },
      rightLeg: { rotation: 0.12, translation: { x: 0, y: 0 } }
    }
  }
];

export default function SidebarRigging({
  mode,
  setMode,
  bones,
  selectedBoneId,
  setSelectedBoneId,
  onAddBone,
  onDeleteBone,
  onUpdateBone,
  interpolatedTransforms,
  onApplyPose
}: SidebarRiggingProps) {
  const selectedBone = bones.find((b) => b.id === selectedBoneId);
  const [activeTab, setActiveTab] = React.useState<'hierarchy' | 'pose_library'>('hierarchy');
  const [newPoseName, setNewPoseName] = React.useState('');
  const [toastText, setToastText] = React.useState('');

  const [customPoses, setCustomPoses] = React.useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('25d_animator_custom_poses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('25d_animator_custom_poses', JSON.stringify(customPoses));
    } catch (e) {
      console.error(e);
    }
  }, [customPoses]);

  // Check if a potential parent would cause a loop
  const isValidParent = (boneId: string, candidateParentId: string): boolean => {
    if (boneId === candidateParentId) return false;
    
    let currId: string | null = candidateParentId;
    while (currId) {
      const parentBone = bones.find((b) => b.id === currId);
      if (!parentBone) break;
      if (parentBone.parentId === boneId) {
        return false; // loop detected!
      }
      currId = parentBone.parentId;
    }
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedBoneId) return;
    onUpdateBone(selectedBoneId, { name: e.target.value });
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!selectedBoneId) return;
    const parentId = e.target.value === 'none' ? null : e.target.value;
    
    // Safety check
    if (parentId && !isValidParent(selectedBoneId, parentId)) {
      alert('Cannot assign parent bone: would cause a circular dependency loop.');
      return;
    }

    onUpdateBone(selectedBoneId, { parentId });
  };

  // Bone role-matcher helper for cross-character mapping
  const getBoneRole = (boneName: string): string | null => {
    const name = boneName.toLowerCase();
    if (name.includes('head') || name.includes('helmet') || name.includes('crown') || name.includes('top')) {
      return 'head';
    } else if (name.includes('torso') || name.includes('core') || name.includes('chest') || name.includes('body') || name.includes('trunk')) {
      return 'torso';
    } else if (
      (name.includes('left') || name.startsWith('l ') || name.includes(' l ')) &&
      (name.includes('arm') || name.includes('hand') || name.includes('shoulder') || name.includes('fist') || name.includes('shield'))
    ) {
      return 'leftArm';
    } else if (
      (name.includes('right') || name.startsWith('r ') || name.includes(' r ')) &&
      (name.includes('arm') || name.includes('hand') || name.includes('shoulder') || name.includes('fist') || name.includes('sword'))
    ) {
      return 'rightArm';
    } else if (
      (name.includes('left') || name.startsWith('l ') || name.includes(' l ')) &&
      (name.includes('leg') || name.includes('foot') || name.includes('boot') || name.includes('calf') || name.includes('thigh'))
    ) {
      return 'leftLeg';
    } else if (
      (name.includes('right') || name.startsWith('r ') || name.includes(' r ')) &&
      (name.includes('leg') || name.includes('foot') || name.includes('boot') || name.includes('calf') || name.includes('thigh'))
    ) {
      return 'rightLeg';
    } else if (name.includes('base') || name.includes('root') || name.includes('pelvis') || name.includes('hip')) {
      return 'hip';
    }
    return null;
  };

  const handleLoadPredefinedPose = (pose: typeof PREDEFINED_POSES[0]) => {
    if (!onApplyPose) return;

    const mappedTransforms: Record<string, { rotation: number; translation: { x: number; y: number } }> = {};

    bones.forEach((bone) => {
      const role = getBoneRole(bone.name);
      if (role && pose.transforms[role as keyof typeof pose.transforms]) {
        const trans = pose.transforms[role as keyof typeof pose.transforms];
        mappedTransforms[bone.id] = {
          rotation: trans.rotation,
          translation: { ...trans.translation }
        };
      } else {
        mappedTransforms[bone.id] = { rotation: 0, translation: { x: 0, y: 0 } };
      }
    });

    onApplyPose(mappedTransforms);
    
    // Automatically swap modes for smooth UX
    if (mode !== 'ANIMATE') {
      setMode('ANIMATE');
    }

    setToastText(`Pose "${pose.name}" successfully loaded!`);
    setTimeout(() => setToastText(''), 3000);
  };

  const handleLoadCustomPose = (pose: any) => {
    if (!onApplyPose) return;

    const mappedTransforms: Record<string, { rotation: number; translation: { x: number; y: number } }> = {};

    // Match priority 1: Exact Bone IDs (e.g. same model)
    let hasExactMatches = false;
    bones.forEach((bone) => {
      if (pose.exactBoneTransforms && pose.exactBoneTransforms[bone.id]) {
        mappedTransforms[bone.id] = { ...pose.exactBoneTransforms[bone.id] };
        hasExactMatches = true;
      }
    });

    if (hasExactMatches) {
      onApplyPose(mappedTransforms);
      if (mode !== 'ANIMATE') setMode('ANIMATE');
      setToastText(`Pose "${pose.name}" loaded exactly!`);
      setTimeout(() => setToastText(''), 3000);
      return;
    }

    // Match priority 2: Name Role Matching (e.g. cross-character transfer)
    let hasRoleMatches = false;
    bones.forEach((bone) => {
      const role = getBoneRole(bone.name);
      if (role && pose.roleTransforms && pose.roleTransforms[role]) {
        mappedTransforms[bone.id] = { ...pose.roleTransforms[role] };
        hasRoleMatches = true;
      }
    });

    if (hasRoleMatches) {
      onApplyPose(mappedTransforms);
      if (mode !== 'ANIMATE') setMode('ANIMATE');
      setToastText(`Pose "${pose.name}" mapped by bone roles!`);
      setTimeout(() => setToastText(''), 3000);
      return;
    }

    // Match priority 3: Fallback Index Ordering
    bones.forEach((bone, index) => {
      if (pose.indexTransforms && pose.indexTransforms[index]) {
        mappedTransforms[bone.id] = { ...pose.indexTransforms[index] };
      } else {
        mappedTransforms[bone.id] = { rotation: 0, translation: { x: 0, y: 0 } };
      }
    });

    onApplyPose(mappedTransforms);
    if (mode !== 'ANIMATE') setMode('ANIMATE');
    setToastText(`Pose "${pose.name}" loaded by bone indices!`);
    setTimeout(() => setToastText(''), 3000);
  };

  const handleSaveCurrentPose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoseName.trim()) return;
    if (!interpolatedTransforms) {
      alert("Please ensure bones are rigged and loaded to save poses.");
      return;
    }

    const roleTransforms: Record<string, { rotation: number; translation: { x: number; y: number } }> = {};
    const exactBoneTransforms: Record<string, { rotation: number; translation: { x: number; y: number } }> = {};
    const indexTransforms: { rotation: number; translation: { x: number; y: number } }[] = [];

    bones.forEach((bone) => {
      const trans = interpolatedTransforms[bone.id] || { rotation: 0, translation: { x: 0, y: 0 } };
      exactBoneTransforms[bone.id] = {
        rotation: trans.rotation,
        translation: { ...trans.translation }
      };
      indexTransforms.push({
        rotation: trans.rotation,
        translation: { ...trans.translation }
      });

      const role = getBoneRole(bone.name);
      if (role) {
        roleTransforms[role] = {
          rotation: trans.rotation,
          translation: { ...trans.translation }
        };
      }
    });

    const newPose = {
      id: `custom_${Date.now()}`,
      name: newPoseName.trim(),
      exactBoneTransforms,
      roleTransforms,
      indexTransforms,
      timestamp: Date.now()
    };

    setCustomPoses([newPose, ...customPoses]);
    setNewPoseName('');
    setToastText(`Pose "${newPose.name}" saved!`);
    setTimeout(() => setToastText(''), 3000);
  };

  const handleDeleteCustomPose = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this custom stance?')) {
      setCustomPoses(customPoses.filter(p => p.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-5 h-full text-slate-300 p-4 bg-[#0E0E10] border-l border-white/10 w-80 shrink-0 overflow-y-auto relative scrollbar-thin scrollbar-thumb-white/10">
      
      {/* Toast Notification */}
      {toastText && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 border border-emerald-400 text-white font-semibold text-[10px] uppercase tracking-wider py-1 px-3 rounded shadow-md animate-fade-in-down flex items-center gap-1.5 whitespace-nowrap">
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span>{toastText}</span>
        </div>
      )}

      {/* SECTION: Mode Switcher */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-amber-500 font-semibold border-b border-white/10 pb-2">
          <Layers className="h-4 w-4" />
          <h3 className="text-xs uppercase tracking-widest font-bold">Studio Mode</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 bg-[#0A0A0B] p-1.5 rounded border border-white/10">
          <button
            onClick={() => setMode('RIG')}
            className={`py-2 px-3 text-xs font-semibold rounded transition-all cursor-pointer ${
              mode === 'RIG'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-550/10'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
            id="mode_rig_btn"
          >
            Rig Mode
          </button>
          <button
            onClick={() => setMode('ANIMATE')}
            className={`py-2 px-3 text-xs font-semibold rounded transition-all cursor-pointer ${
              mode === 'ANIMATE'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-550/10'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
            }`}
            id="mode_animate_btn"
          >
            Animate Mode
          </button>
        </div>
      </div>

      {/* Tab Switcher: Hierarchy vs Pose Library */}
      <div className="grid grid-cols-2 gap-1 bg-[#0A0A0B] p-1 rounded-lg border border-white/5 text-[11px]">
        <button
          onClick={() => setActiveTab('hierarchy')}
          className={`py-2 px-2 rounded font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'hierarchy'
              ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          id="hierarchy_tab_btn"
        >
          <GitCommit className="h-3.5 w-3.5" />
          <span>Bones & Rig</span>
        </button>
        <button
          onClick={() => setActiveTab('pose_library')}
          className={`py-2 px-2 rounded font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'pose_library'
              ? 'bg-amber-600/10 text-amber-400 border border-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          id="pose_library_tab_btn"
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>Pose Library</span>
        </button>
      </div>

      {/* TAB CONTENT: HIERARCHY */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-5 flex-1 flex flex-col min-h-0">
          
          {/* Mode Explanation Info */}
          <div className="p-2.5 rounded text-[11px] leading-relaxed border bg-white/5 text-slate-400 border-white/10">
            {mode === 'RIG' ? (
              <div>
                <strong className="text-slate-200">Rig Mode:</strong> Setup skeletal joints and connect hierarchies. Click <strong className="text-slate-200">Add Bone</strong> or drag nodes on the canvas stage.
              </div>
            ) : (
              <div>
                <strong className="text-slate-200">Animate Mode:</strong> Rotate or translate your bones on the timeline! Drag bone tips on the stage to build custom dynamic postures.
              </div>
            )}
          </div>

          {/* Bone Skeleton List */}
          <div className="space-y-3 flex-1 flex flex-col min-h-[150px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-amber-500 font-semibold">
                <GitCommit className="h-4 w-4" />
                <h3 className="text-xs uppercase tracking-widest font-bold">Bones ({bones.length})</h3>
              </div>
              {mode === 'RIG' && (
                <button
                  onClick={onAddBone}
                  className="flex items-center gap-1 rounded bg-amber-600 hover:bg-amber-500 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-950/20"
                  id="add_bone_btn"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>

            {bones.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded p-6 text-center text-slate-500">
                <GitCommit className="h-8 w-8 stroke-1 mb-2 text-slate-600" />
                <p className="text-xs">No bones added yet.</p>
                {mode === 'RIG' && (
                  <button
                    onClick={onAddBone}
                    className="mt-3 text-xs text-amber-400 hover:text-amber-300 font-medium underline"
                    id="add_first_bone_link"
                  >
                    Create first bone
                  </button>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto max-h-[220px] bg-white/5 border border-white/10 rounded p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
                {bones.map((bone) => {
                  const isSelected = bone.id === selectedBoneId;
                  const parent = bones.find((b) => b.id === bone.parentId);
                  return (
                    <div
                      key={bone.id}
                      onClick={() => setSelectedBoneId(bone.id)}
                      className={`w-full text-left p-2 rounded flex items-center justify-between transition-all group border cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 border-amber-500/50 text-white'
                          : 'border-transparent hover:bg-white/5 text-slate-300 hover:text-slate-100'
                      }`}
                      id={`bone_list_item_${bone.id}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedBoneId(bone.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: bone.color }}
                        />
                        <div className="truncate">
                          <div className="text-xs font-medium truncate">{bone.name}</div>
                          {parent && (
                            <div className="text-[9px] text-slate-500 truncate">
                              Child of {parent.name}
                            </div>
                          )}
                        </div>
                      </div>
                      {mode === 'RIG' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBone(bone.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-500 hover:bg-white/10 hover:text-red-400 transition-all cursor-pointer"
                          title="Delete Bone"
                          id={`delete_bone_btn_${bone.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Bone Properties */}
          {selectedBone && (
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 text-amber-500 font-semibold border-b border-white/10 pb-1.5">
                <Settings className="h-4 w-4" />
                <h3 className="text-xs uppercase tracking-widest font-bold">Bone Properties</h3>
              </div>

              <div className="space-y-3 bg-white/5 border border-white/10 rounded p-3 text-xs">
                {/* Bone Name */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Bone Name:</label>
                  <input
                    type="text"
                    disabled={mode !== 'RIG'}
                    value={selectedBone.name}
                    onChange={handleNameChange}
                    className="w-full rounded bg-[#0A0A0B] border border-white/10 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/80 disabled:opacity-60 disabled:cursor-not-allowed text-xs"
                    id="selected_bone_name_input"
                  />
                </div>

                {/* Bone Parent */}
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Parent Bone:</label>
                  <select
                    disabled={mode !== 'RIG'}
                    value={selectedBone.parentId || 'none'}
                    onChange={handleParentChange}
                    className="w-full rounded bg-[#0A0A0B] border border-white/10 px-2 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500/80 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-xs"
                    id="selected_bone_parent_select"
                  >
                    <option value="none">None (Root Bone)</option>
                    {bones
                      .filter((b) => b.id !== selectedBone.id)
                      .map((b) => {
                        const valid = isValidParent(selectedBone.id, b.id);
                        return (
                          <option key={b.id} value={b.id} disabled={!valid}>
                            {b.name} {!valid ? '(Looping)' : ''}
                          </option>
                        );
                      })}
                  </select>
                </div>

                {/* Bone Color */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-medium">Bone Color:</label>
                  <div className="flex gap-2 flex-wrap">
                    {BONE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => onUpdateBone(selectedBone.id, { color })}
                        className={`w-5 h-5 rounded-full border transition-transform cursor-pointer hover:scale-110 active:scale-95 ${
                          selectedBone.color === color
                            ? 'border-white ring-2 ring-amber-500/30'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        id={`bone_color_btn_${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Rotation Constraints */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-400 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-amber-500" />
                      <span>Rotation Limits:</span>
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedBone.minAngle !== undefined || selectedBone.maxAngle !== undefined}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onUpdateBone(selectedBone.id, {
                              minAngle: -Math.PI / 2,
                              maxAngle: Math.PI / 2
                            });
                          } else {
                            onUpdateBone(selectedBone.id, {
                              minAngle: undefined,
                              maxAngle: undefined
                            });
                          }
                        }}
                        className="rounded border-white/10 bg-[#0A0A0B] text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer h-3.5 w-3.5"
                        id="enable_rotation_limits_checkbox"
                      />
                      <span className="text-[10px] text-slate-400 ml-1.5">Enable</span>
                    </div>
                  </div>

                  {(selectedBone.minAngle !== undefined || selectedBone.maxAngle !== undefined) && (
                    <div className="space-y-2 bg-[#060608] border border-white/5 rounded p-2 mt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Min Offset Limit:</span>
                          <span className="font-mono text-amber-400 font-semibold">
                            {Math.round(((selectedBone.minAngle ?? -Math.PI / 2) * 180) / Math.PI)}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="0"
                          value={Math.round(((selectedBone.minAngle ?? -Math.PI / 2) * 180) / Math.PI)}
                          onChange={(e) => {
                            const deg = parseInt(e.target.value);
                            onUpdateBone(selectedBone.id, {
                              minAngle: (deg * Math.PI) / 180
                            });
                          }}
                          className="w-full accent-amber-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Max Offset Limit:</span>
                          <span className="font-mono text-amber-400 font-semibold">
                            {Math.round(((selectedBone.maxAngle ?? Math.PI / 2) * 180) / Math.PI)}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="180"
                          value={Math.round(((selectedBone.maxAngle ?? Math.PI / 2) * 180) / Math.PI)}
                          onChange={(e) => {
                            const deg = parseInt(e.target.value);
                            onUpdateBone(selectedBone.id, {
                              maxAngle: (deg * Math.PI) / 180
                            });
                          }}
                          className="w-full accent-amber-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dimensions metadata */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[9px] text-slate-500">
                  <div>
                    Length: <span className="text-slate-300 font-semibold">{Math.round(selectedBone.length)}px</span>
                  </div>
                  <div>
                    Angle: <span className="text-slate-300 font-semibold">{Math.round((selectedBone.restAngle * 180) / Math.PI)}°</span>
                  </div>
                  <div className="col-span-2">
                    Rest Start: <span className="text-slate-300 font-semibold">({Math.round(selectedBone.restStart.x)}, {Math.round(selectedBone.restStart.y)})</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: POSE LIBRARY */}
      {activeTab === 'pose_library' && (
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          
          {/* Studio mode contextual warning */}
          {mode === 'RIG' ? (
            <div className="p-2.5 rounded text-[11px] leading-relaxed border bg-amber-950/20 text-amber-400 border-amber-900/40">
              ⚠️ <strong>Poses need Animate Mode:</strong> Rig Mode holds the neutral rest-shape of your skeleton. Loading a stance will automatically swap you to Animate Mode to apply dynamic keyframes.
            </div>
          ) : (
            <div className="p-2.5 rounded text-[11px] leading-relaxed border bg-white/5 text-slate-400 border-white/10">
              <span className="text-emerald-400 font-semibold">Active:</span> Select a template stance to apply it to the <strong>current playhead frame</strong>. Poses will interpolate smoothly with adjacent keyframes.
            </div>
          )}

          {/* Quick Save Custom Pose Form */}
          <div className="space-y-2 border border-white/10 rounded-lg p-3 bg-white/5">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-300 flex items-center gap-1.5">
              <Save className="h-3.5 w-3.5 text-amber-500" />
              <span>Capture Current Stance</span>
            </h4>
            <form onSubmit={handleSaveCurrentPose} className="flex gap-2">
              <input
                type="text"
                placeholder="Stance name (e.g. Crouching)..."
                value={newPoseName}
                onChange={(e) => setNewPoseName(e.target.value)}
                className="flex-1 rounded bg-[#0A0A0B] border border-white/10 px-2 py-1.5 text-slate-200 placeholder:text-slate-600 text-xs focus:outline-none focus:border-amber-500"
                id="custom_pose_name_input"
              />
              <button
                type="submit"
                disabled={!newPoseName.trim() || bones.length === 0}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs rounded transition-all active:scale-95 cursor-pointer shrink-0"
                id="save_current_pose_btn"
              >
                Save
              </button>
            </form>
          </div>

          {/* PREDEFINED templates section */}
          <div className="space-y-2 flex-1 flex flex-col min-h-[200px]">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5 border-b border-white/10 pb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Standard Templates</span>
            </h4>
            
            <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[220px] scrollbar-thin scrollbar-thumb-white/10 pr-1">
              {PREDEFINED_POSES.map((pose) => (
                <div
                  key={pose.id}
                  onClick={() => handleLoadPredefinedPose(pose)}
                  className="p-2.5 rounded bg-white/5 border border-white/10 hover:border-amber-500/30 hover:bg-white/10 transition-all flex items-center justify-between group cursor-pointer"
                  role="button"
                  id={`predefined_pose_${pose.id}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-xl shrink-0">{pose.icon}</span>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200">{pose.name}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[180px]">{pose.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadPredefinedPose(pose);
                    }}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/20 text-[9px] uppercase tracking-wider font-bold rounded transition-all cursor-pointer"
                  >
                    Load
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CUSTOM saved section */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5 text-amber-500" />
              <span>My Saved Stances ({customPoses.length})</span>
            </h4>

            {customPoses.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-lg p-5 text-center text-slate-600 text-xs">
                No custom stances captured yet. Use the form above to save your custom skeleton keyframes as templates!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1">
                {customPoses.map((pose) => (
                  <div
                    key={pose.id}
                    onClick={() => handleLoadCustomPose(pose)}
                    className="p-2 rounded bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-white/10 transition-all flex items-center justify-between group cursor-pointer"
                    role="button"
                    id={`custom_pose_${pose.id}`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-semibold text-slate-200 truncate">{pose.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        {new Date(pose.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadCustomPose(pose);
                        }}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/20 text-[9px] uppercase tracking-wider font-bold rounded transition-all cursor-pointer"
                      >
                        Load
                      </button>
                      <button
                        onClick={(e) => handleDeleteCustomPose(pose.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all cursor-pointer rounded hover:bg-white/5"
                        title="Delete custom stance"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
