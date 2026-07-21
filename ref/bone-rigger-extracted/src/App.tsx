import React from 'react';
import { 
  GitCommit, 
  HelpCircle, 
  Play, 
  Settings, 
  Upload, 
  Download, 
  RotateCcw, 
  Info, 
  Save, 
  Sparkles, 
  Volume2, 
  Activity, 
  Film,
  Cpu,
  Github,
  Undo,
  Redo
} from 'lucide-react';

import { Bone, BoneTransform, Keyframe, Animation, AppMode, Vector2D, SpriteMesh, ComicShout } from './types';
import { solveFK, generateMesh, calculateMeshWeights, lerp, drawWarpedTriangle, getEaseT } from './utils/math';
import { PRESETS } from './utils/presets';

import CanvasStage from './components/CanvasStage';
import SidebarRigging from './components/SidebarRigging';
import SidebarSprites from './components/SidebarSprites';
import Timeline from './components/Timeline';
import HelpModal from './components/HelpModal';
import ExpressionModal from './components/ExpressionModal';

export default function App() {
  const [isExpressionOpen, setIsExpressionOpen] = React.useState<boolean>(false);
  // Preset or uploaded sprite state
  const [imgUrl, setImgUrl] = React.useState<string | null>(PRESETS[0].imageUrl);
  const [imgName, setImgName] = React.useState<string>(PRESETS[0].name);
  const [imgSize, setImgSize] = React.useState<Vector2D>({ x: 200, y: 200 });
  const [currentPresetId, setCurrentPresetId] = React.useState<string | null>(PRESETS[0].id);

  // Skeletal Bones Rigging State
  const [bones, setBones] = React.useState<Bone[]>(PRESETS[0].defaultBones);
  const [selectedBoneId, setSelectedBoneId] = React.useState<string | null>(null);

  // Animations & Timelines State
  const [animations, setAnimations] = React.useState<Animation[]>(PRESETS[0].defaultAnimations);
  const [activeAnimId, setActiveAnimId] = React.useState<string>(PRESETS[0].defaultAnimations[0].id);
  const [currentFrame, setCurrentFrame] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [fps, setFps] = React.useState<number>(30);
  const [loop, setLoop] = React.useState<boolean>(true);
  const [autoKeyframe, setAutoKeyframe] = React.useState<boolean>(true);

  // Studio Mode: RIG (design skeleton) or ANIMATE (pose & keyframe)
  const [mode, setMode] = React.useState<AppMode>('RIG');

  // Deformer Mesh Resolution Settings
  const [meshCols, setMeshCols] = React.useState<number>(10);
  const [meshRows, setMeshRows] = React.useState<number>(10);
  const [falloff, setFalloff] = React.useState<number>(2.0);
  const [maxInfluences, setMaxInfluences] = React.useState<number>(3);

  // Overlays & HUD Display Settings
  const [showMesh, setShowMesh] = React.useState<boolean>(true);
  const [showBones, setShowBones] = React.useState<boolean>(true);
  const [showSprite, setShowSprite] = React.useState<boolean>(true);
  const [showOnionSkin, setShowOnionSkin] = React.useState<boolean>(true);
  const [boneOpacity, setBoneOpacity] = React.useState<number>(0.75);
  const [meshOpacity, setMeshOpacity] = React.useState<number>(0.3);

  // Modals / Overlays
  const [isHelpOpen, setIsHelpOpen] = React.useState<boolean>(false);
  const [isBaking, setIsBaking] = React.useState<boolean>(false);
  const [bakeStatus, setBakeStatus] = React.useState<string>('');

  // Battle Shout Balloon state (Kindergarten Combat special FX!)
  const [battleShout, setBattleShout] = React.useState<ComicShout | null>(null);

  // --- LOCALSTORAGE PERSISTENCE ENGINE ---
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [saveIndicatorText, setSaveIndicatorText] = React.useState<string>('');

  const latestStateRef = React.useRef({
    imgUrl,
    imgName,
    imgSize,
    currentPresetId,
    bones,
    animations,
    activeAnimId,
    meshCols,
    meshRows,
    falloff,
    maxInfluences
  });

  React.useEffect(() => {
    latestStateRef.current = {
      imgUrl,
      imgName,
      imgSize,
      currentPresetId,
      bones,
      animations,
      activeAnimId,
      meshCols,
      meshRows,
      falloff,
      maxInfluences
    };
  }, [
    imgUrl,
    imgName,
    imgSize,
    currentPresetId,
    bones,
    animations,
    activeAnimId,
    meshCols,
    meshRows,
    falloff,
    maxInfluences
  ]);

  const saveToLocalStorage = React.useCallback(() => {
    try {
      localStorage.setItem('25d_animator_project_state', JSON.stringify(latestStateRef.current));
      const now = new Date();
      setLastSaved(now);
      setSaveIndicatorText(`Autosaved at ${now.toLocaleTimeString()}`);
      // Fade out indicator after 4 seconds
      setTimeout(() => {
        setSaveIndicatorText('');
      }, 4000);
    } catch (e) {
      console.error('Autosave failed:', e);
    }
  }, []);

  // Periodic autosave every 30 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage();
    }, 30000);

    return () => clearInterval(interval);
  }, [saveToLocalStorage]);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('25d_animator_project_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.imgUrl !== undefined) setImgUrl(parsed.imgUrl);
        if (parsed.imgName !== undefined) setImgName(parsed.imgName);
        if (parsed.imgSize !== undefined) setImgSize(parsed.imgSize);
        if (parsed.currentPresetId !== undefined) setCurrentPresetId(parsed.currentPresetId);
        if (parsed.bones !== undefined) setBones(parsed.bones);
        if (parsed.animations !== undefined) {
          setAnimations(parsed.animations);
          if (parsed.activeAnimId !== undefined) {
            const animExists = parsed.animations.some((a: any) => a.id === parsed.activeAnimId);
            if (animExists) {
              setActiveAnimId(parsed.activeAnimId);
            } else if (parsed.animations.length > 0) {
              setActiveAnimId(parsed.animations[0].id);
            }
          }
        }
        if (parsed.meshCols !== undefined) setMeshCols(parsed.meshCols);
        if (parsed.meshRows !== undefined) setMeshRows(parsed.meshRows);
        if (parsed.falloff !== undefined) setFalloff(parsed.falloff);
        if (parsed.maxInfluences !== undefined) setMaxInfluences(parsed.maxInfluences);
        setLastSaved(new Date());
      }
    } catch (e) {
      console.error('Failed to load project state from localStorage', e);
    }
  }, []);
  // ----------------------------------------

  // --- STATE HISTORY UNDO/REDO TRACKING LAYER ---
  const [past, setPast] = React.useState<{ bones: Bone[]; animations: Animation[] }[]>([]);
  const [future, setFuture] = React.useState<{ bones: Bone[]; animations: Animation[] }[]>([]);
  const dragStartStateRef = React.useRef<{ bones: Bone[]; animations: Animation[] } | null>(null);

  const isStateDifferent = (
    s1: { bones: Bone[]; animations: Animation[] },
    s2: { bones: Bone[]; animations: Animation[] }
  ) => {
    return JSON.stringify(s1.bones) !== JSON.stringify(s2.bones) || 
           JSON.stringify(s1.animations) !== JSON.stringify(s2.animations);
  };

  const pushDiscreteHistory = React.useCallback(() => {
    setPast((prev) => [...prev, { bones, animations }]);
    setFuture([]);
  }, [bones, animations]);

  const handleDragStart = React.useCallback(() => {
    dragStartStateRef.current = { bones, animations };
  }, [bones, animations]);

  const handleDragEnd = React.useCallback(() => {
    if (!dragStartStateRef.current) return;
    const currentState = { bones, animations };
    if (isStateDifferent(dragStartStateRef.current, currentState)) {
      setPast((prev) => [...prev, dragStartStateRef.current!]);
      setFuture([]);
    }
    dragStartStateRef.current = null;
  }, [bones, animations]);

  const handleUndo = React.useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setPast(newPast);
    setFuture((prev) => [{ bones, animations }, ...prev]);
    
    setBones(previous.bones);
    setAnimations(previous.animations);
    setSelectedBoneId(null);
  }, [past, bones, animations]);

  const handleRedo = React.useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    setFuture(newFuture);
    setPast((prev) => [...prev, { bones, animations }]);

    setBones(next.bones);
    setAnimations(next.animations);
    setSelectedBoneId(null);
  }, [future, bones, animations]);

  const resetHistory = React.useCallback(() => {
    setPast([]);
    setFuture([]);
    dragStartStateRef.current = null;
  }, []);

  // Keyboard Shortcuts Handler (Ctrl+Z / Ctrl+Y or Cmd+Z / Cmd+Y for Mac)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === 'INPUT' || 
        target?.tagName === 'SELECT' || 
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && !e.shiftKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          handleUndo();
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUndo, handleRedo]);
  // ----------------------------------------------

  const activeAnim = React.useMemo(() => {
    return animations.find((a) => a.id === activeAnimId) || animations[0];
  }, [animations, activeAnimId]);

  // 1. REACTIVE MESH SYSTEM
  // Re-triangulate and calculate skin weights on the fly
  const mesh = React.useMemo<SpriteMesh>(() => {
    const baseMesh = generateMesh(imgSize.x, imgSize.y, meshCols, meshRows);
    return calculateMeshWeights(baseMesh, bones, falloff, maxInfluences);
  }, [imgSize, meshCols, meshRows, bones, falloff, maxInfluences]);

  // 2. TIMELINE PLAYHEAD ANIMATION TICK LOOP
  React.useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 1000 / fps;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1;
        if (next > activeAnim.duration) {
          if (loop) {
            return 0;
          } else {
            setIsPlaying(false);
            return activeAnim.duration;
          }
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, fps, activeAnim.duration, loop]);

  // Stop playback when switching modes or clips
  React.useEffect(() => {
    setIsPlaying(false);
    setCurrentFrame(0);
  }, [mode, activeAnimId]);

  // 3. KEYFRAME TWEEN INTERPOLATOR (SKELETAL FK SAMPLER)
  // Computes relative bone rotations and offsets for the active frame
  const interpolatedTransforms = React.useMemo<Record<string, BoneTransform>>(() => {
    const transforms: Record<string, BoneTransform> = {};
    
    // Default rest pose if RIG mode or no keyframes
    bones.forEach((bone) => {
      transforms[bone.id] = { rotation: 0, translation: { x: 0, y: 0 } };
    });

    if (mode === 'RIG' || !activeAnim || activeAnim.keyframes.length === 0) {
      return transforms;
    }

    const keyframes = [...activeAnim.keyframes].sort((a, b) => a.frame - b.frame);

    // Find flanking keyframes
    let k1 = keyframes[0];
    let k2 = keyframes[keyframes.length - 1];

    if (currentFrame <= k1.frame) {
      // Before first keyframe
      return k1.boneTransforms;
    }
    if (currentFrame >= k2.frame) {
      // After last keyframe
      if (loop && keyframes.length > 1) {
        // Wrap around loop interpolation
        k1 = keyframes[keyframes.length - 1];
        k2 = {
          frame: activeAnim.duration, // project k2 at duration limit
          boneTransforms: keyframes[0].boneTransforms
        };
      } else {
        return k2.boneTransforms;
      }
    }

    // Find exactly which two frames we are between
    for (let i = 0; i < keyframes.length; i++) {
      if (keyframes[i].frame <= currentFrame) {
        k1 = keyframes[i];
      }
      if (keyframes[i].frame >= currentFrame) {
        k2 = keyframes[i];
        break;
      }
    }

    if (k1.frame === k2.frame) {
      return k1.boneTransforms;
    }

    // Linear parameter t (0.0 to 1.0)
    const t = (currentFrame - k1.frame) / (k2.frame - k1.frame);

    // Interpolate transforms for all bones
    bones.forEach((bone) => {
      const t1 = k1.boneTransforms[bone.id] || { rotation: 0, translation: { x: 0, y: 0 } };
      const t2 = k2.boneTransforms[bone.id] || { rotation: 0, translation: { x: 0, y: 0 } };

      const boneEase = t1.easing || 'linear';
      const easedT = getEaseT(t, boneEase);

      // Shortest-path rotation angle linear interpolation (LERP)
      let r1 = t1.rotation;
      let r2 = t2.rotation;
      let diff = r2 - r1;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      const rotation = r1 + diff * easedT;

      const translation = {
        x: lerp(t1.translation.x, t2.translation.x, easedT),
        y: lerp(t1.translation.y, t2.translation.y, easedT)
      };

      transforms[bone.id] = { rotation, translation, easing: t1.easing };
    });

    return transforms;
  }, [bones, activeAnim, currentFrame, mode, loop]);

  // Solve Forward Kinematics (FK) for active poses
  const solvedBones = React.useMemo(() => {
    return solveFK(bones, interpolatedTransforms);
  }, [bones, interpolatedTransforms]);

  // Find previous and next keyframes for Ghost Onion Skin
  const { prevKeyframe, nextKeyframe } = React.useMemo(() => {
    if (mode !== 'ANIMATE' || !activeAnim || activeAnim.keyframes.length <= 1) {
      return { prevKeyframe: null, nextKeyframe: null };
    }

    const sortedKfs = [...activeAnim.keyframes].sort((a, b) => a.frame - b.frame);
    
    let prev: Keyframe | null = null;
    let next: Keyframe | null = null;

    for (let i = 0; i < sortedKfs.length; i++) {
      const kf = sortedKfs[i];
      if (kf.frame < currentFrame) {
        prev = kf;
      }
      if (kf.frame > currentFrame && !next) {
        next = kf;
      }
    }

    // Wrap around loop handling
    if (loop) {
      if (!prev && sortedKfs.length > 0) {
        prev = sortedKfs[sortedKfs.length - 1];
      }
      if (!next && sortedKfs.length > 0) {
        next = sortedKfs[0];
      }
    }

    return { prevKeyframe: prev, nextKeyframe: next };
  }, [activeAnim, currentFrame, mode, loop]);

  // 4. ACTION: Select built-in preset character
  const handleSelectPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    resetHistory();

    setImgUrl(preset.imageUrl);
    setImgName(preset.name);
    setCurrentPresetId(preset.id);
    setSelectedBoneId(null);
    setBones(preset.defaultBones);
    setAnimations(preset.defaultAnimations);
    setActiveAnimId(preset.defaultAnimations[0].id);
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  // ACTION: Upload transparent PNG sprite
  const handleUploadCustomSprite = (name: string, dataUrl: string, width: number, height: number) => {
    resetHistory();

    setImgUrl(dataUrl);
    setImgName(name.replace('.png', ''));
    setImgSize({ x: width, y: height });
    setCurrentPresetId(null);
    setSelectedBoneId(null);
    
    // Clear rig or start fresh
    setBones([]);
    
    // Add default idle clip
    const defaultAnim: Animation = {
      id: 'idle',
      name: 'Idle Loop',
      duration: 40,
      keyframes: [
        { frame: 0, boneTransforms: {} },
        { frame: 40, boneTransforms: {} }
      ]
    };
    setAnimations([defaultAnim]);
    setActiveAnimId('idle');
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  // ACTION: Add bone to current rig
  const handleAddBone = () => {
    pushDiscreteHistory();
    const newId = `bone_${Date.now()}`;
    const nameIndex = bones.length + 1;
    
    // Start joint of new bone snaps to end of selected bone, or center stage
    let start: Vector2D = { x: imgSize.x / 2, y: imgSize.y * 0.7 };
    let parentId: string | null = null;

    if (selectedBoneId) {
      const parentSolved = solvedBones[selectedBoneId];
      if (parentSolved) {
        start = parentSolved.end;
        parentId = selectedBoneId;
      }
    }

    const newBone: Bone = {
      id: newId,
      name: `Bone ${nameIndex}`,
      parentId,
      restStart: start,
      restEnd: { x: start.x, y: start.y - 40 }, // default length 40 pointing up
      length: 40,
      restAngle: -Math.PI / 2,
      color: '#3B82F6',
    };

    const updatedBones = [...bones, newBone];
    setBones(updatedBones);
    setSelectedBoneId(newId);

    // Seed default transform values in keyframes
    setAnimations(prevAnims => {
      return prevAnims.map(anim => {
        return {
          ...anim,
          keyframes: anim.keyframes.map(kf => {
            return {
              ...kf,
              boneTransforms: {
                ...kf.boneTransforms,
                [newId]: { rotation: 0, translation: { x: 0, y: 0 } }
              }
            };
          })
        };
      });
    });
  };

  // ACTION: Delete bone from rig
  const handleDeleteBone = (boneId: string) => {
    pushDiscreteHistory();
    // 1. Recursively find children and unparent them or delete them
    // For simplicity, we assign children of deleted bone to have parent = null (become root)
    const updatedBones = bones
      .filter((b) => b.id !== boneId)
      .map((b) => {
        if (b.parentId === boneId) {
          return { ...b, parentId: null };
        }
        return b;
      });

    setBones(updatedBones);
    if (selectedBoneId === boneId) {
      setSelectedBoneId(null);
    }

    // 2. Remove bone entries from keyframes
    setAnimations(prevAnims => {
      return prevAnims.map(anim => {
        return {
          ...anim,
          keyframes: anim.keyframes.map(kf => {
            const copy = { ...kf.boneTransforms };
            delete copy[boneId];
            return {
              ...kf,
              boneTransforms: copy
            };
          })
        };
      });
    });
  };

  // ACTION: Update bone rest configurations (In Rig Mode)
  const handleUpdateBoneRest = (boneId: string, restStart: Vector2D, restEnd: Vector2D) => {
    // Determine translation shift delta (used to cascade root bone translates down to children rest joints)
    const targetBone = bones.find(b => b.id === boneId);
    if (!targetBone) return;

    const dx = restStart.x - targetBone.restStart.x;
    const dy = restStart.y - targetBone.restStart.y;

    const len = Math.max(5, Math.sqrt((restEnd.x - restStart.x)**2 + (restEnd.y - restStart.y)**2));
    const angle = Math.atan2(restEnd.y - restStart.y, restEnd.x - restStart.x);

    const updatedBones = bones.map((bone) => {
      if (bone.id === boneId) {
        return {
          ...bone,
          restStart,
          restEnd,
          length: len,
          restAngle: angle
        };
      }
      
      // Cascade bone shift to direct children (Rig Adjustments)
      if (bone.parentId === boneId) {
        // Since parent's end node shifted, this child's start snaps to it.
        // To prevent skeleton from warping, we translate child's end point by the same amount.
        const childDx = restEnd.x - bone.restStart.x;
        const childDy = restEnd.y - bone.restStart.y;
        return {
          ...bone,
          restStart: { ...restEnd },
          restEnd: {
            x: bone.restEnd.x + childDx,
            y: bone.restEnd.y + childDy
          }
        };
      }

      return bone;
    });

    setBones(updatedBones);
  };

  // ACTION: Update simple parameters on a bone (e.g. name, parent, color)
  const handleUpdateBone = (boneId: string, updates: Partial<Bone>) => {
    pushDiscreteHistory();
    const updated = bones.map((b) => {
      if (b.id === boneId) {
        return { ...b, ...updates };
      }
      return b;
    });
    setBones(updated);
  };

  // ACTION: Rotate bone and insert keyframe (In Animate Mode)
  const handleRotateBone = (boneId: string, rotation: number) => {
    if (mode !== 'ANIMATE') return;

    setAnimations(prevAnims => {
      return prevAnims.map(anim => {
        if (anim.id !== activeAnimId) return anim;

        // Find or create keyframe at currentFrame
        const existingKfIndex = anim.keyframes.findIndex(k => k.frame === currentFrame);
        
        let updatedKeyframes = [...anim.keyframes];

        if (existingKfIndex >= 0) {
          // Keyframe exists, update rotation of this bone
          const kf = { ...updatedKeyframes[existingKfIndex] };
          kf.boneTransforms = {
            ...kf.boneTransforms,
            [boneId]: {
              ...kf.boneTransforms[boneId] || { rotation: 0, translation: { x: 0, y: 0 } },
              rotation
            }
          };
          updatedKeyframes[existingKfIndex] = kf;
        } else if (autoKeyframe) {
          // Create new keyframe capturing all other bones active interpolated poses
          const boneTransforms: Record<string, BoneTransform> = {};
          bones.forEach(b => {
            boneTransforms[b.id] = {
              rotation: b.id === boneId ? rotation : (interpolatedTransforms[b.id]?.rotation || 0),
              translation: interpolatedTransforms[b.id]?.translation || { x: 0, y: 0 }
            };
          });

          updatedKeyframes.push({
            frame: currentFrame,
            boneTransforms
          });
        }

        return {
          ...anim,
          keyframes: updatedKeyframes.sort((a,b) => a.frame - b.frame)
        };
      });
    });
  };

  // ACTION: Translate root bone and insert keyframe (In Animate Mode)
  const handleTranslateBone = (boneId: string, translation: Vector2D) => {
    if (mode !== 'ANIMATE') return;

    setAnimations(prevAnims => {
      return prevAnims.map(anim => {
        if (anim.id !== activeAnimId) return anim;

        const existingKfIndex = anim.keyframes.findIndex(k => k.frame === currentFrame);
        let updatedKeyframes = [...anim.keyframes];

        if (existingKfIndex >= 0) {
          const kf = { ...updatedKeyframes[existingKfIndex] };
          kf.boneTransforms = {
            ...kf.boneTransforms,
            [boneId]: {
              ...kf.boneTransforms[boneId] || { rotation: 0, translation: { x: 0, y: 0 } },
              translation
            }
          };
          updatedKeyframes[existingKfIndex] = kf;
        } else if (autoKeyframe) {
          const boneTransforms: Record<string, BoneTransform> = {};
          bones.forEach(b => {
            boneTransforms[b.id] = {
              rotation: interpolatedTransforms[b.id]?.rotation || 0,
              translation: b.id === boneId ? translation : (interpolatedTransforms[b.id]?.translation || { x: 0, y: 0 })
            };
          });

          updatedKeyframes.push({
            frame: currentFrame,
            boneTransforms
          });
        }

        return {
          ...anim,
          keyframes: updatedKeyframes.sort((a,b) => a.frame - b.frame)
        };
      });
    });
  };

  const handleApplyPose = (poseTransforms: Record<string, BoneTransform>) => {
    pushDiscreteHistory();
    if (mode !== 'ANIMATE') {
      setMode('ANIMATE');
    }

    setAnimations(prevAnims => {
      return prevAnims.map(anim => {
        if (anim.id !== activeAnimId) return anim;

        const existingKfIndex = anim.keyframes.findIndex(k => k.frame === currentFrame);
        let updatedKeyframes = [...anim.keyframes];

        if (existingKfIndex >= 0) {
          const kf = { ...updatedKeyframes[existingKfIndex] };
          kf.boneTransforms = {
            ...kf.boneTransforms,
            ...poseTransforms
          };
          updatedKeyframes[existingKfIndex] = kf;
        } else {
          const boneTransforms: Record<string, BoneTransform> = {};
          bones.forEach(b => {
            boneTransforms[b.id] = {
              rotation: poseTransforms[b.id] !== undefined ? poseTransforms[b.id].rotation : (interpolatedTransforms[b.id]?.rotation || 0),
              translation: poseTransforms[b.id] !== undefined ? poseTransforms[b.id].translation : (interpolatedTransforms[b.id]?.translation || { x: 0, y: 0 })
            };
          });
          updatedKeyframes.push({
            frame: currentFrame,
            boneTransforms
          });
        }

        return {
          ...anim,
          keyframes: updatedKeyframes.sort((a,b) => a.frame - b.frame)
        };
      });
    });
  };

  // TIMELINE ACTIONS
  const handleAddKeyframe = (frameNum: number) => {
    pushDiscreteHistory();
    setAnimations(prevAnims => {
      return prevAnims.map(anim => {
        if (anim.id !== activeAnimId) return anim;

        const exists = anim.keyframes.some(k => k.frame === frameNum);
        if (exists) return anim;

        // Snap all current poses into keyframe values
        const boneTransforms: Record<string, BoneTransform> = {};
        bones.forEach(b => {
          boneTransforms[b.id] = {
            rotation: interpolatedTransforms[b.id]?.rotation || 0,
            translation: interpolatedTransforms[b.id]?.translation || { x: 0, y: 0 }
          };
        });

        const newKf: Keyframe = {
          frame: frameNum,
          boneTransforms
        };

        return {
          ...anim,
          keyframes: [...anim.keyframes, newKf].sort((a,b) => a.frame - b.frame)
        };
      });
    });
  };

  const handleRemoveKeyframe = (frameNum: number) => {
    pushDiscreteHistory();
    setAnimations(prevAnims => {
      return prevAnims.map(anim => {
        if (anim.id !== activeAnimId) return anim;
        return {
          ...anim,
          keyframes: anim.keyframes.filter(k => k.frame !== frameNum)
        };
      });
    });
  };

  const handleClearAllKeyframes = (animId: string) => {
    pushDiscreteHistory();
    setAnimations(prevAnims => {
      return prevAnims.map(anim => {
        if (anim.id !== animId) return anim;
        // Create simple 2-keyframe flat poses
        return {
          ...anim,
          keyframes: [
            { frame: 0, boneTransforms: {} },
            { frame: anim.duration, boneTransforms: {} }
          ]
        };
      });
    });
    setCurrentFrame(0);
  };

  const handleUpdateBoneEasing = (frameNum: number, boneId: string, easing: 'linear' | 'ease-in' | 'ease-out' | 'elastic') => {
    pushDiscreteHistory();
    setAnimations(prevAnims => {
      return prevAnims.map(anim => {
        if (anim.id !== activeAnimId) return anim;
        return {
          ...anim,
          keyframes: anim.keyframes.map(kf => {
            if (kf.frame !== frameNum) return kf;
            const currentTransform = kf.boneTransforms[boneId] || { rotation: 0, translation: { x: 0, y: 0 } };
            return {
              ...kf,
              boneTransforms: {
                ...kf.boneTransforms,
                [boneId]: {
                  ...currentTransform,
                  easing
                }
              }
            };
          })
        };
      });
    });
  };

  const handleAddAnimation = (name: string, duration: number) => {
    pushDiscreteHistory();
    const id = `anim_${Date.now()}`;
    const newAnim: Animation = {
      id,
      name,
      duration,
      keyframes: [
        { frame: 0, boneTransforms: {} },
        { frame: duration, boneTransforms: {} }
      ]
    };
    setAnimations([...animations, newAnim]);
    setActiveAnimId(id);
  };

  const handleDeleteAnimation = (id: string) => {
    if (animations.length <= 1) return;
    pushDiscreteHistory();
    const filtered = animations.filter(a => a.id !== id);
    setAnimations(filtered);
    setActiveAnimId(filtered[0].id);
  };

  const handleUpdateAnimationDuration = (id: string, duration: number) => {
    pushDiscreteHistory();
    setAnimations(prevAnims => {
      return prevAnims.map(anim => {
        if (anim.id !== id) return anim;
        return { ...anim, duration };
      });
    });
  };

  const handleApplyAiGeneratedRig = (
    name: string,
    newBones: Bone[],
    newAnimations: Animation[],
    newImgUrl?: string | null,
    newImgSize?: Vector2D
  ) => {
    pushDiscreteHistory();
    setImgName(name);
    if (newImgUrl !== undefined) {
      setImgUrl(newImgUrl);
    }
    if (newImgSize !== undefined) {
      setImgSize(newImgSize);
    }
    setBones(newBones);
    setAnimations(newAnimations);
    if (newAnimations.length > 0) {
      setActiveAnimId(newAnimations[0].id);
    }
    setCurrentFrame(0);
    setSelectedBoneId(null);
    setCurrentPresetId(null);
  };

  // PROJECT FILE IO EXPORT/IMPORT
  const handleExportJson = () => {
    const projectData = {
      name: imgName,
      bones,
      animations,
      imgSize,
      imageDataUrl: imgUrl,
      mesh: {
        cols: meshCols,
        rows: meshRows,
        vertices: mesh.vertices,
        triangles: mesh.triangles
      }
    };

    const str = JSON.stringify(projectData, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${imgName.toLowerCase().replace(/\s+/g, '_')}_2.5d_rig.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetHistory();

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.bones || !data.animations) {
          alert('Invalid Rig File format.');
          return;
        }

        setImgName(data.name || 'Imported Rig');
        setImgUrl(data.imageDataUrl || null);
        setImgSize(data.imgSize || { x: 200, y: 200 });
        setBones(data.bones);
        setAnimations(data.animations);
        setActiveAnimId(data.animations[0].id);
        
        if (data.mesh) {
          setMeshCols(data.mesh.cols || 10);
          setMeshRows(data.mesh.rows || 10);
        }

        setCurrentPresetId(null);
        setSelectedBoneId(null);
        setCurrentFrame(0);
        setIsPlaying(false);
      } catch (err) {
        alert('Failed to parse rig JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // SPRITE SHEET PNG BAKER (Hobbyist Special!)
  // Bakes the entire active animation into a seamless horizontal frame strip PNG
  const handleBakeSpriteSheet = async () => {
    if (!imgUrl) return;
    setIsBaking(true);
    setBakeStatus('Preparing frame canvas...');

    // Load original image to compile
    const img = new Image();
    img.src = imgUrl;
    await new Promise((resolve) => { img.onload = resolve; });

    const frameCount = activeAnim.duration + 1;
    const fWidth = imgSize.x;
    const fHeight = imgSize.y;

    const canvas = document.createElement('canvas');
    canvas.width = fWidth * frameCount;
    canvas.height = fHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsBaking(false);
      return;
    }

    // Temporary loop to deform and render each individual frame
    for (let f = 0; f < frameCount; f++) {
      setBakeStatus(`Rendering frame ${f} of ${frameCount - 1}...`);
      
      // Calculate interpolated transforms for this frameset
      const transforms: Record<string, BoneTransform> = {};
      bones.forEach((bone) => {
        transforms[bone.id] = { rotation: 0, translation: { x: 0, y: 0 } };
      });

      const sortedKfs = [...activeAnim.keyframes].sort((a,b) => a.frame - b.frame);
      let k1 = sortedKfs[0];
      let k2 = sortedKfs[sortedKfs.length - 1];

      if (sortedKfs.length > 0) {
        if (f <= k1.frame) {
          bones.forEach(b => { transforms[b.id] = k1.boneTransforms[b.id] || transforms[b.id]; });
        } else if (f >= k2.frame) {
          bones.forEach(b => { transforms[b.id] = k2.boneTransforms[b.id] || transforms[b.id]; });
        } else {
          for (let i = 0; i < sortedKfs.length; i++) {
            if (sortedKfs[i].frame <= f) k1 = sortedKfs[i];
            if (sortedKfs[i].frame >= f) { k2 = sortedKfs[i]; break; }
          }
          const t = (f - k1.frame) / (k2.frame - k1.frame);
          bones.forEach((bone) => {
            const t1 = k1.boneTransforms[bone.id] || { rotation: 0, translation: { x: 0, y: 0 } };
            const t2 = k2.boneTransforms[bone.id] || { rotation: 0, translation: { x: 0, y: 0 } };
            
            let r1 = t1.rotation;
            let r2 = t2.rotation;
            let diff = r2 - r1;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            
            transforms[bone.id] = {
              rotation: r1 + diff * t,
              translation: {
                x: lerp(t1.translation.x, t2.translation.x, t),
                y: lerp(t1.translation.y, t2.translation.y, t)
              }
            };
          });
        }
      }

      // Solve FK and deform mesh
      const frameSolvedBones = solveFK(bones, transforms);
      
      const baseMesh = generateMesh(imgSize.x, imgSize.y, meshCols, meshRows);
      const frameMesh = calculateMeshWeights(baseMesh, bones, falloff, maxInfluences);

      // Deform
      const animPositions = frameMesh.vertices.map((v) => {
        const weights = v.weights;
        const activeBoneIds = Object.keys(weights);
        if (activeBoneIds.length === 0 || bones.length === 0) {
          return { x: v.x, y: v.y };
        }
        let finalX = 0, finalY = 0;
        activeBoneIds.forEach(boneId => {
          const weight = weights[boneId];
          const bone = bones.find(b => b.id === boneId);
          const solved = frameSolvedBones[boneId];
          if (!bone || !solved) {
            finalX += v.x * weight; finalY += v.y * weight;
            return;
          }
          const rx = v.x - bone.restStart.x;
          const ry = v.y - bone.restStart.y;
          const dTheta = solved.globalAngle - bone.restAngle;
          const cos = Math.cos(dTheta), sin = Math.sin(dTheta);
          
          finalX += (solved.start.x + (rx * cos - ry * sin)) * weight;
          finalY += (solved.start.y + (rx * sin + ry * cos)) * weight;
        });
        return { x: finalX, y: finalY };
      });

      // Render each warped triangle to horizontal position
      const dxOffset = f * fWidth;
      
      ctx.save();
      ctx.translate(dxOffset, 0);

      frameMesh.triangles.forEach((t) => {
        const v1 = frameMesh.vertices[t.v1];
        const v2 = frameMesh.vertices[t.v2];
        const v3 = frameMesh.vertices[t.v3];

        const d1 = animPositions[t.v1];
        const d2 = animPositions[t.v2];
        const d3 = animPositions[t.v3];

        drawWarpedTriangle(
          ctx,
          img,
          v1.u * fWidth, v1.v * fHeight,
          v2.u * fWidth, v2.v * fHeight,
          v3.u * fWidth, v3.v * fHeight,
          d1.x, d1.y,
          d2.x, d2.y,
          d3.x, d3.y
        );
      });

      ctx.restore();
    }

    setBakeStatus('Encoding transparent PNG sheet...');
    const dataUrl = canvas.toDataURL('image/png');
    
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${imgName.toLowerCase().replace(/\s+/g, '_')}_${activeAnim.name.toLowerCase().replace(/\s+/g, '_')}_spritesheet.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setBakeStatus('Baked successfully!');
    setTimeout(() => {
      setIsBaking(false);
      setBakeStatus('');
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0B] text-slate-300 font-sans select-none overflow-hidden" id="app_root_viewport">
      
      {/* HUD Header */}
      <header className="flex items-center justify-between border-b border-white/10 bg-[#0E0E10] px-6 py-3 shrink-0 shadow-lg">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-serif italic text-white tracking-widest" id="app_brand_logo">OSTEO.</h1>
          <div className="hidden sm:block">
            <h2 className="text-xs font-medium tracking-tight text-slate-200 flex items-center gap-1.5">
              <span>2.5D Sprite Bone Rigger &amp; Animator</span>
              <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[8px] font-semibold text-amber-500">STUDIO</span>
            </h2>
            <p className="text-[10px] text-slate-500">
              Rig transparent PNGs with 2.5D skeletal mesh warp skinning
            </p>
          </div>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-2.5">
          {/* Sprite Sheet Baker */}
          {bones.length > 0 && (
            <button
              onClick={handleBakeSpriteSheet}
              disabled={isBaking}
              className="flex items-center gap-1.5 rounded bg-[#1A1A1E] hover:bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white px-3.5 py-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              id="header_bake_sheet_btn"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Bake Sprite Sheet</span>
            </button>
          )}

          {/* Import JSON file */}
          <button
            onClick={() => document.getElementById('json_import_file_input')?.click()}
            className="flex items-center gap-1.5 rounded bg-transparent hover:bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-bold text-slate-300 px-3.5 py-1.5 transition-all active:scale-95 cursor-pointer"
            id="header_import_btn"
          >
            <Upload className="h-3.5 w-3.5 text-slate-400" />
            <span>Import JSON</span>
          </button>
          <input
            type="file"
            id="json_import_file_input"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />

          {/* Export JSON file */}
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 rounded bg-amber-600 hover:bg-amber-500 text-[10px] uppercase tracking-widest font-bold text-white px-4 py-1.5 transition-all active:scale-95 shadow-lg shadow-amber-950/20 cursor-pointer"
            id="header_export_btn"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>

          {/* LocalStorage Autosave Status & Manual Trigger */}
          <div className="flex items-center gap-2">
            {saveIndicatorText && (
              <span className="text-[10px] text-slate-500 font-mono hidden md:inline animate-pulse">
                {saveIndicatorText}
              </span>
            )}
            <button
              onClick={saveToLocalStorage}
              className="flex items-center gap-1.5 rounded bg-transparent hover:bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-bold text-slate-300 px-3 py-1.5 transition-all active:scale-95 cursor-pointer"
              title="Save project state to local storage"
              id="header_manual_save_btn"
            >
              <Save className="h-3.5 w-3.5 text-slate-400" />
              <span>Save</span>
            </button>
          </div>

          {/* Undo / Redo controls */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded p-1">
            <button
              onClick={handleUndo}
              disabled={past.length === 0}
              className="rounded p-1 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center"
              title="Undo (Ctrl+Z)"
              id="global_undo_btn"
            >
              <Undo className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              className="rounded p-1 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer flex items-center justify-center"
              title="Redo (Ctrl+Y)"
              id="global_redo_btn"
            >
              <Redo className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-white/10 mx-1" />

          {/* Guide Manual button */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="rounded p-1.5 border border-white/10 hover:bg-white/5 hover:text-white text-slate-400 transition-all cursor-pointer"
            id="header_help_trigger_btn"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Studio Workbench Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Left Panel: Sprites & Preset templates */}
        <SidebarSprites
          currentPresetId={currentPresetId}
          onSelectPreset={handleSelectPreset}
          onUploadCustomSprite={handleUploadCustomSprite}
          meshCols={meshCols}
          setMeshCols={setMeshCols}
          meshRows={meshRows}
          setMeshRows={setMeshRows}
          falloff={falloff}
          setFalloff={setFalloff}
          maxInfluences={maxInfluences}
          setMaxInfluences={setMaxInfluences}
          showMesh={showMesh}
          setShowMesh={setShowMesh}
          showBones={showBones}
          setShowBones={setShowBones}
          showSprite={showSprite}
          setShowSprite={setShowSprite}
          boneOpacity={boneOpacity}
          setBoneOpacity={setBoneOpacity}
          meshOpacity={meshOpacity}
          setMeshOpacity={setMeshOpacity}
          onApplyAiGeneratedRig={handleApplyAiGeneratedRig}
          battleShout={battleShout}
          onTriggerShout={(shout) => setBattleShout(shout)}
          onOpenExpressionModal={() => setIsExpressionOpen(true)}
        />

        {/* Center: Interactive Canvas Studio */}
        <CanvasStage
          imgUrl={imgUrl}
          bones={bones}
          solvedBones={solvedBones}
          mode={mode}
          selectedBoneId={selectedBoneId}
          setSelectedBoneId={setSelectedBoneId}
          onUpdateBoneRest={handleUpdateBoneRest}
          onRotateBone={handleRotateBone}
          onTranslateBone={handleTranslateBone}
          mesh={mesh}
          showMesh={showMesh}
          showBones={showBones}
          showSprite={showSprite}
          boneOpacity={boneOpacity}
          meshOpacity={meshOpacity}
          onOpenHelp={() => setIsHelpOpen(true)}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          activeAnimId={activeAnimId}
          currentFrame={currentFrame}
          battleShout={battleShout}
          showOnionSkin={showOnionSkin}
          prevKeyframe={prevKeyframe}
          nextKeyframe={nextKeyframe}
        />

        {/* Right Panel: Bone Tree Hierarchy and Node Specifications */}
        <SidebarRigging
          mode={mode}
          setMode={setMode}
          bones={bones}
          selectedBoneId={selectedBoneId}
          setSelectedBoneId={setSelectedBoneId}
          onAddBone={handleAddBone}
          onDeleteBone={handleDeleteBone}
          onUpdateBone={handleUpdateBone}
          interpolatedTransforms={interpolatedTransforms}
          onApplyPose={handleApplyPose}
        />

      </div>

      {/* Bottom Panel: Interactive Keyframe Animation Timeline */}
      <Timeline
        animations={animations}
        activeAnimId={activeAnimId}
        setActiveAnimId={setActiveAnimId}
        currentFrame={currentFrame}
        setCurrentFrame={setCurrentFrame}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        fps={fps}
        setFps={setFps}
        loop={loop}
        setLoop={setLoop}
        bones={bones}
        selectedBoneId={selectedBoneId}
        onAddKeyframe={handleAddKeyframe}
        onRemoveKeyframe={handleRemoveKeyframe}
        onAddAnimation={handleAddAnimation}
        onDeleteAnimation={handleDeleteAnimation}
        onUpdateAnimationDuration={handleUpdateAnimationDuration}
        onClearAllKeyframes={handleClearAllKeyframes}
        autoKeyframe={autoKeyframe}
        setAutoKeyframe={setAutoKeyframe}
        showOnionSkin={showOnionSkin}
        setShowOnionSkin={setShowOnionSkin}
        onUpdateBoneEasing={handleUpdateBoneEasing}
      />

      {/* Manual Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Expression Creation Modal (New) */}
      {isExpressionOpen && (
        <ExpressionModal
          isOpen={isExpressionOpen}
          onClose={() => setIsExpressionOpen(false)}
          onSaveExpression={(shout) => setBattleShout(shout)}
        />
      )}

      {/* Loading Sprite Sheet Baking Modal */}
      {isBaking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-center max-w-sm w-full mx-4 space-y-4">
            <div className="flex justify-center">
              <Sparkles className="h-10 w-10 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Baking 2.5D Sprite Sheet</h3>
              <p className="text-xs text-slate-400 mt-1">{bakeStatus}</p>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-1.5 rounded-full animate-progress" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
