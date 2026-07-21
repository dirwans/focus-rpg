import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Move, HelpCircle, AlertCircle } from 'lucide-react';
import { Bone, AppMode, Vector2D, SpriteMesh, ComicShout, Keyframe, BoneTransform } from '../types';
import { solveFK, deformMesh, drawWarpedTriangle, dist } from '../utils/math';

interface CanvasStageProps {
  imgUrl: string | null;
  bones: Bone[];
  solvedBones: Record<string, any>;
  mode: AppMode;
  selectedBoneId: string | null;
  setSelectedBoneId: (id: string | null) => void;
  onUpdateBoneRest: (id: string, restStart: Vector2D, restEnd: Vector2D) => void;
  onRotateBone: (id: string, rotation: number) => void;
  onTranslateBone: (id: string, translation: Vector2D) => void;
  
  // Mesh configurations
  mesh: SpriteMesh;
  showMesh: boolean;
  showBones: boolean;
  showSprite: boolean;
  boneOpacity: number;
  meshOpacity: number;
  onOpenHelp: () => void;

  // History hooks
  onDragStart?: () => void;
  onDragEnd?: () => void;

  // AI/FX Extensions
  activeAnimId?: string;
  currentFrame?: number;
  battleShout?: ComicShout | null;

  // Onion skin extension
  showOnionSkin?: boolean;
  prevKeyframe?: Keyframe | null;
  nextKeyframe?: Keyframe | null;
}

export default function CanvasStage({
  imgUrl,
  bones,
  solvedBones,
  mode,
  selectedBoneId,
  setSelectedBoneId,
  onUpdateBoneRest,
  onRotateBone,
  onTranslateBone,
  mesh,
  showMesh,
  showBones,
  showSprite,
  boneOpacity,
  meshOpacity,
  onOpenHelp,
  onDragStart,
  onDragEnd,
  activeAnimId,
  currentFrame,
  battleShout = null,
  showOnionSkin = false,
  prevKeyframe = null,
  nextKeyframe = null
}: CanvasStageProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Loaded HTML Image element state
  const [imgElement, setImgElement] = React.useState<HTMLImageElement | null>(null);
  const [imgSize, setImgSize] = React.useState<Vector2D>({ x: 300, y: 300 });

  // Custom Expression Image Cache
  const exprImageCacheRef = React.useRef<Record<string, HTMLImageElement>>({});
  const [exprImageLoaded, setExprImageLoaded] = React.useState<number>(0);

  // Camera settings (zoom & pan)
  const [zoom, setZoom] = React.useState<number>(1.5);
  const [pan, setPan] = React.useState<Vector2D>({ x: 0, y: 0 });

  // Mouse interaction state
  const [isPanning, setIsPanning] = React.useState<boolean>(false);
  const [isSpacePressed, setIsSpacePressed] = React.useState<boolean>(false);
  const [dragState, setDragState] = React.useState<{
    type: 'JOINT_START' | 'JOINT_END' | 'PAN';
    boneId: string;
    startMouse: Vector2D; // canvas coordinates
    startPan: Vector2D;
    startRestStart?: Vector2D; // rest coordinates
    startRestEnd?: Vector2D;
    startTranslation?: Vector2D;
  } | null>(null);

  const [mousePos, setMousePos] = React.useState<Vector2D>({ x: 0, y: 0 });

  // Load image when url changes
  React.useEffect(() => {
    if (!imgUrl) {
      setImgElement(null);
      return;
    }
    const img = new Image();
    img.onload = () => {
      setImgElement(img);
      setImgSize({ x: img.naturalWidth, y: img.naturalHeight });
      // Reset camera to center
      setZoom(1.5);
      setPan({ x: 0, y: 0 });
    };
    img.src = imgUrl;
  }, [imgUrl]);

  // Handle Space key binding for Panning
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Center view on image
  const handleResetCamera = () => {
    setZoom(1.5);
    setPan({ x: 0, y: 0 });
  };

  // Convert canvas pixel mouse coordinate to sprite image local space coordinate
  const canvasToSpriteSpace = (cx: number, cy: number, canvasWidth: number, canvasHeight: number): Vector2D => {
    return {
      x: (cx - canvasWidth / 2 - pan.x) / zoom + imgSize.x / 2,
      y: (cy - canvasHeight / 2 - pan.y) / zoom + imgSize.y / 2,
    };
  };

  // Convert sprite space coordinate to canvas pixel coordinate
  const spriteToCanvasSpace = (sx: number, sy: number, canvasWidth: number, canvasHeight: number): Vector2D => {
    return {
      x: canvasWidth / 2 + pan.x + (sx - imgSize.x / 2) * zoom,
      y: canvasHeight / 2 + pan.y + (sy - imgSize.y / 2) * zoom,
    };
  };

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 1. Check if Space-drag or middle mouse click is for Panning
    if (isSpacePressed || e.button === 1 || e.button === 2) {
      setIsPanning(true);
      setDragState({
        type: 'PAN',
        boneId: '',
        startMouse: { x: e.clientX, y: e.clientY },
        startPan: { ...pan },
      });
      return;
    }

    // Convert mouse to sprite space
    const mouseSprite = canvasToSpriteSpace(cx, cy, canvasWidth, canvasHeight);

    // 2. If showing bones, look for clicked bone joint nodes
    if (showBones && bones.length > 0) {
      let closestJoint: { boneId: string; type: 'START' | 'END'; dist: number } | null = null;
      const hitRadiusCanvas = 15; // joint click buffer in canvas pixels

      bones.forEach((bone) => {
        const solved = solvedBones[bone.id];
        if (!solved) return;

        // Get joint positions on canvas
        const canvasStart = spriteToCanvasSpace(solved.start.x, solved.start.y, canvasWidth, canvasHeight);
        const canvasEnd = spriteToCanvasSpace(solved.end.x, solved.end.y, canvasWidth, canvasHeight);

        // Check start joint
        const dStart = dist({ x: cx, y: cy }, canvasStart);
        if (dStart < hitRadiusCanvas && (!closestJoint || dStart < closestJoint.dist)) {
          closestJoint = { boneId: bone.id, type: 'START', dist: dStart };
        }

        // Check end joint (tip)
        const dEnd = dist({ x: cx, y: cy }, canvasEnd);
        if (dEnd < hitRadiusCanvas && (!closestJoint || dEnd < closestJoint.dist)) {
          closestJoint = { boneId: bone.id, type: 'END', dist: dEnd };
        }
      });

      if (closestJoint) {
        const { boneId, type } = closestJoint;
        setSelectedBoneId(boneId);

        const bone = bones.find((b) => b.id === boneId)!;
        const solved = solvedBones[boneId]!;

        if (onDragStart) {
          onDragStart();
        }

        if (mode === 'RIG') {
          setDragState({
            type: type === 'START' ? 'JOINT_START' : 'JOINT_END',
            boneId,
            startMouse: { x: cx, y: cy },
            startPan: { ...pan },
            startRestStart: { ...bone.restStart },
            startRestEnd: { ...bone.restEnd },
          });
        } else {
          // ANIMATE MODE
          // Dragging joint end performs FK rotation
          // Dragging joint start of ROOT bone performs translation
          if (type === 'END') {
            setDragState({
              type: 'JOINT_END',
              boneId,
              startMouse: { x: cx, y: cy },
              startPan: { ...pan },
            });
          } else if (type === 'START' && !bone.parentId) {
            // Root translation drag
            const animTransform = solvedBones[boneId];
            setDragState({
              type: 'JOINT_START',
              boneId,
              startMouse: { x: cx, y: cy },
              startPan: { ...pan },
            });
          }
        }
        return;
      }
    }

    // 3. Clicked on the background -> Deselect bone and initiate pan
    setSelectedBoneId(null);
    setIsPanning(true);
    setDragState({
      type: 'PAN',
      boneId: '',
      startMouse: { x: e.clientX, y: e.clientY },
      startPan: { ...pan },
    });
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    setMousePos({ x: cx, y: cy });

    if (!dragState) return;

    if (dragState.type === 'PAN') {
      const dx = e.clientX - dragState.startMouse.x;
      const dy = e.clientY - dragState.startMouse.y;
      setPan({
        x: dragState.startPan.x + dx,
        y: dragState.startPan.y + dy,
      });
      return;
    }

    const mouseSprite = canvasToSpriteSpace(cx, cy, canvasWidth, canvasHeight);
    const boneId = dragState.boneId;
    const bone = bones.find((b) => b.id === boneId)!;
    const solved = solvedBones[boneId]!;

    if (mode === 'RIG') {
      const dx = mouseSprite.x - (dragState.startRestStart?.x || 0);
      const dy = mouseSprite.y - (dragState.startRestStart?.y || 0);

      if (dragState.type === 'JOINT_START') {
        // Dragging root joint (or detached joint): Translates the entire bone & structure
        if (!bone.parentId) {
          const restStartOffset = { x: mouseSprite.x, y: mouseSprite.y };
          // Keep end point relative
          const currentEndOffset = {
            x: (dragState.startRestEnd?.x || 0) + (mouseSprite.x - (dragState.startRestStart?.x || 0)),
            y: (dragState.startRestEnd?.y || 0) + (mouseSprite.y - (dragState.startRestStart?.y || 0))
          };
          onUpdateBoneRest(boneId, restStartOffset, currentEndOffset);
        }
      } else if (dragState.type === 'JOINT_END') {
        // Dragging tip joint: Adjusts bone length and direction rest angle
        let targetStart = bone.restStart;
        if (bone.parentId) {
          // snap to parent's end position
          const parentSolved = solvedBones[bone.parentId];
          if (parentSolved) {
            targetStart = parentSolved.end;
          }
        }
        onUpdateBoneRest(boneId, targetStart, mouseSprite);
      }
    } else {
      // ANIMATE MODE
      if (dragState.type === 'JOINT_END') {
        // Dragging the bone tip -> rotate bone relative to its parent
        const startPos = solved.start;
        const angle = Math.atan2(mouseSprite.y - startPos.y, mouseSprite.x - startPos.x);
        
        let parentGlobalAngle = 0;
        if (bone.parentId) {
          const parentSolved = solvedBones[bone.parentId];
          if (parentSolved) {
            parentGlobalAngle = parentSolved.globalAngle;
          }
        }

        // Relative rotation to its local rest angle
        let localRestAngle = bone.restAngle;
        if (bone.parentId) {
          const parent = bones.find((b) => b.id === bone.parentId)!;
          localRestAngle = bone.restAngle - parent.restAngle;
        }

        let newRotOffset = angle - parentGlobalAngle - localRestAngle;
        
        // Wrap newRotOffset to [-PI, PI] to prevent weird jumps
        newRotOffset = Math.atan2(Math.sin(newRotOffset), Math.cos(newRotOffset));

        // Apply rotation limits if defined
        if (bone.minAngle !== undefined) {
          newRotOffset = Math.max(bone.minAngle, newRotOffset);
        }
        if (bone.maxAngle !== undefined) {
          newRotOffset = Math.min(bone.maxAngle, newRotOffset);
        }

        onRotateBone(boneId, newRotOffset);
      } else if (dragState.type === 'JOINT_START' && !bone.parentId) {
        // Dragging the root start node -> translate the character
        const translationDelta = {
          x: mouseSprite.x - bone.restStart.x,
          y: mouseSprite.y - bone.restStart.y
        };
        onTranslateBone(boneId, translationDelta);
      }
    }
  };

  // Handle Mouse Up
  const handleMouseUp = () => {
    if (dragState && dragState.type !== 'PAN' && onDragEnd) {
      onDragEnd();
    }
    setDragState(null);
    setIsPanning(false);
  };

  // Zooming with wheel scroll
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => Math.max(0.4, Math.min(6.0, prev + zoomDelta)));
  };

  // High performance Canvas Redraw Trigger
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to container bounding box
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    const w = canvas.width;
    const h = canvas.height;

    // Clear background with rich dark editor grid theme
    ctx.fillStyle = '#050506'; // Sophisticated Dark canvas background
    ctx.fillRect(0, 0, w, h);

    // Render Grid lines
    drawEditorGrid(ctx, w, h, pan, zoom);

    // Save context for transform rendering
    ctx.save();

    // 0. GHOST ONION SKIN RENDERING
    if (mode === 'ANIMATE' && showOnionSkin && imgElement && imgElement.complete) {
      const skins = [
        { kf: prevKeyframe, color: '#EF4444', label: 'Prev KF', tint: '#EF4444' }, // Red for previous keyframe
        { kf: nextKeyframe, color: '#3B82F6', label: 'Next KF', tint: '#3B82F6' }  // Blue for next keyframe
      ];

      skins.forEach(({ kf, color, tint }) => {
        if (!kf) return;

        // Solve FK for this keyframe's transforms
        const kfTransforms: Record<string, BoneTransform> = {};
        bones.forEach((bone) => {
          kfTransforms[bone.id] = kf.boneTransforms[bone.id] || { rotation: 0, translation: { x: 0, y: 0 } };
        });
        const kfSolvedBones = solveFK(bones, kfTransforms);

        // Deform the mesh for this keyframe
        const kfAnimPositions = deformMesh(mesh, bones, kfSolvedBones);

        // A. Render faded sprite skin
        if (showSprite) {
          ctx.save();
          ctx.globalAlpha = 0.22; // nice ghost opacity with custom tint
          
          mesh.triangles.forEach((t) => {
            const v1 = mesh.vertices[t.v1];
            const v2 = mesh.vertices[t.v2];
            const v3 = mesh.vertices[t.v3];

            const d1 = spriteToCanvasSpace(kfAnimPositions[t.v1].x, kfAnimPositions[t.v1].y, w, h);
            const d2 = spriteToCanvasSpace(kfAnimPositions[t.v2].x, kfAnimPositions[t.v2].y, w, h);
            const d3 = spriteToCanvasSpace(kfAnimPositions[t.v3].x, kfAnimPositions[t.v3].y, w, h);

            drawWarpedTriangle(
              ctx,
              imgElement,
              v1.u * imgSize.x,
              v1.v * imgSize.y,
              v2.u * imgSize.x,
              v2.v * imgSize.y,
              v3.u * imgSize.x,
              v3.v * imgSize.y,
              d1.x,
              d1.y,
              d2.x,
              d2.y,
              d3.x,
              d3.y,
              tint
            );
          });
          ctx.restore();
        }

        // B. Render faded mesh wireframe skin
        if (showMesh) {
          ctx.save();
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.25;
          ctx.lineWidth = 1;

          mesh.triangles.forEach((t) => {
            const d1 = spriteToCanvasSpace(kfAnimPositions[t.v1].x, kfAnimPositions[t.v1].y, w, h);
            const d2 = spriteToCanvasSpace(kfAnimPositions[t.v2].x, kfAnimPositions[t.v2].y, w, h);
            const d3 = spriteToCanvasSpace(kfAnimPositions[t.v3].x, kfAnimPositions[t.v3].y, w, h);

            ctx.beginPath();
            ctx.moveTo(d1.x, d1.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.lineTo(d3.x, d3.y);
            ctx.closePath();
            ctx.stroke();
          });
          ctx.restore();
        }

        // C. Render faded skeleton bones skin
        if (showBones) {
          ctx.save();
          ctx.globalAlpha = 0.25;
          bones.forEach((bone) => {
            const solved = kfSolvedBones[bone.id];
            if (!solved) return;

            const canvasStart = spriteToCanvasSpace(solved.start.x, solved.start.y, w, h);
            const canvasEnd = spriteToCanvasSpace(solved.end.x, solved.end.y, w, h);

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(canvasStart.x, canvasStart.y);
            ctx.lineTo(canvasEnd.x, canvasEnd.y);
            ctx.stroke();

            // Arrow head
            const dX = canvasEnd.x - canvasStart.x;
            const dY = canvasEnd.y - canvasStart.y;
            const dLen = Math.sqrt(dX * dX + dY * dY);
            if (dLen > 15) {
              const arrowAngle = Math.atan2(dY, dX);
              const arrowSize = 6;
              ctx.fillStyle = color;
              ctx.beginPath();
              ctx.moveTo(canvasEnd.x, canvasEnd.y);
              ctx.lineTo(
                canvasEnd.x - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
                canvasEnd.y - arrowSize * Math.sin(arrowAngle - Math.PI / 6)
              );
              ctx.lineTo(
                canvasEnd.x - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
                canvasEnd.y - arrowSize * Math.sin(arrowAngle + Math.PI / 6)
              );
              ctx.closePath();
              ctx.fill();
            }

            // Joints
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(canvasStart.x, canvasStart.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(canvasEnd.x, canvasEnd.y, 3, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }
      });
    }

    // 1. RENDER CHARACTER SPRITE DEFORMED (LBS Skinning) OR STATIC
    if (imgElement && imgElement.complete) {
      if (showSprite) {
        if (bones.length > 0 && mode === 'ANIMATE') {
          // Deform the mesh using LBS
          const animPositions = deformMesh(mesh, bones, solvedBones);

          // Render each triangle warped in canvas space
          mesh.triangles.forEach((t) => {
            const v1 = mesh.vertices[t.v1];
            const v2 = mesh.vertices[t.v2];
            const v3 = mesh.vertices[t.v3];

            // Canvas coordinates of deformed vertices
            const d1 = spriteToCanvasSpace(animPositions[t.v1].x, animPositions[t.v1].y, w, h);
            const d2 = spriteToCanvasSpace(animPositions[t.v2].x, animPositions[t.v2].y, w, h);
            const d3 = spriteToCanvasSpace(animPositions[t.v3].x, animPositions[t.v3].y, w, h);

            // Warp and draw
            drawWarpedTriangle(
              ctx,
              imgElement,
              v1.u * imgSize.x,
              v1.v * imgSize.y,
              v2.u * imgSize.x,
              v2.v * imgSize.y,
              v3.u * imgSize.x,
              v3.v * imgSize.y,
              d1.x,
              d1.y,
              d2.x,
              d2.y,
              d3.x,
              d3.y
            );
          });
        } else {
          // RIG mode (Draw flat centered image)
          const imgPos = spriteToCanvasSpace(0, 0, w, h);
          ctx.drawImage(imgElement, imgPos.x, imgPos.y, imgSize.x * zoom, imgSize.y * zoom);
        }
      }
    } else {
      // Draw a neat bounding placeholder if no image loaded
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(w / 2 + pan.x - 150, h / 2 + pan.y - 150, 300, 300);
      ctx.fillStyle = '#0E0E10';
      ctx.fillRect(w / 2 + pan.x - 150, h / 2 + pan.y - 150, 300, 300);
      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Select preset or upload custom PNG', w / 2 + pan.x, h / 2 + pan.y);
    }

    // 2. RENDER MESH GRID WIREFRAME
    if (showMesh && imgElement) {
      ctx.strokeStyle = `rgba(245, 158, 11, ${meshOpacity})`; // semi-transparent amber
      ctx.lineWidth = 1;

      if (bones.length > 0 && mode === 'ANIMATE') {
        const animPositions = deformMesh(mesh, bones, solvedBones);
        mesh.triangles.forEach((t) => {
          const d1 = spriteToCanvasSpace(animPositions[t.v1].x, animPositions[t.v1].y, w, h);
          const d2 = spriteToCanvasSpace(animPositions[t.v2].x, animPositions[t.v2].y, w, h);
          const d3 = spriteToCanvasSpace(animPositions[t.v3].x, animPositions[t.v3].y, w, h);

          ctx.beginPath();
          ctx.moveTo(d1.x, d1.y);
          ctx.lineTo(d2.x, d2.y);
          ctx.lineTo(d3.x, d3.y);
          ctx.closePath();
          ctx.stroke();
        });
      } else {
        // Draw standard flat wireframe
        mesh.triangles.forEach((t) => {
          const v1 = mesh.vertices[t.v1];
          const v2 = mesh.vertices[t.v2];
          const v3 = mesh.vertices[t.v3];

          const d1 = spriteToCanvasSpace(v1.x, v1.y, w, h);
          const d2 = spriteToCanvasSpace(v2.x, v2.y, w, h);
          const d3 = spriteToCanvasSpace(v3.x, v3.y, w, h);

          ctx.beginPath();
          ctx.moveTo(d1.x, d1.y);
          ctx.lineTo(d2.x, d2.y);
          ctx.lineTo(d3.x, d3.y);
          ctx.closePath();
          ctx.stroke();
        });
      }
    }

    // 3. RENDER BONES OVERLAY SKELETON
    if (showBones && bones.length > 0) {
      bones.forEach((bone) => {
        const solved = solvedBones[bone.id];
        if (!solved) return;

        const isSelected = bone.id === selectedBoneId;
        const color = bone.color || '#3B82F6';

        // Coordinates in canvas pixels
        const canvasStart = spriteToCanvasSpace(solved.start.x, solved.start.y, w, h);
        const canvasEnd = spriteToCanvasSpace(solved.end.x, solved.end.y, w, h);

        // A. Draw bone connector line/arrow shaft
        ctx.strokeStyle = isSelected ? '#FFFFFF' : color;
        ctx.lineWidth = isSelected ? 5 : 3;
        ctx.globalAlpha = boneOpacity;
        
        // Draw elegant capsule line
        ctx.beginPath();
        ctx.moveTo(canvasStart.x, canvasStart.y);
        ctx.lineTo(canvasEnd.x, canvasEnd.y);
        ctx.stroke();

        // Arrow head pointing to tip (Joint B)
        const dX = canvasEnd.x - canvasStart.x;
        const dY = canvasEnd.y - canvasStart.y;
        const dLen = Math.sqrt(dX * dX + dY * dY);
        if (dLen > 15) {
          const arrowAngle = Math.atan2(dY, dX);
          const arrowSize = isSelected ? 12 : 9;
          
          ctx.fillStyle = isSelected ? '#FFFFFF' : color;
          ctx.beginPath();
          ctx.moveTo(canvasEnd.x, canvasEnd.y);
          ctx.lineTo(
            canvasEnd.x - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
            canvasEnd.y - arrowSize * Math.sin(arrowAngle - Math.PI / 6)
          );
          ctx.lineTo(
            canvasEnd.x - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
            canvasEnd.y - arrowSize * Math.sin(arrowAngle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fill();
        }

        // B. Draw Joints (circle knobs)
        ctx.globalAlpha = boneOpacity + 0.1;
        
        // Joint A (Start node)
        ctx.fillStyle = bone.parentId ? '#1e293b' : '#EA580C'; // orange root
        ctx.strokeStyle = isSelected ? '#FFFFFF' : color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(canvasStart.x, canvasStart.y, bone.parentId ? 6 : 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Joint B (End node - Tip)
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(canvasEnd.x, canvasEnd.y, isSelected ? 6 : 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glow circle around selected bone's joints
        if (isSelected) {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(canvasEnd.x, canvasEnd.y, 10, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw rotation limits visual indicator if selected and limits are defined
        if (isSelected && (bone.minAngle !== undefined || bone.maxAngle !== undefined)) {
          ctx.save();
          ctx.globalAlpha = 0.9;

          const startX = canvasStart.x;
          const startY = canvasStart.y;
          // Calculate an appropriate size for the indicator arc
          const arcRadius = Math.max(35, Math.min(bone.length * zoom * 0.45, 70));

          let parentGlobalAngle = 0;
          if (bone.parentId) {
            const parentSolved = solvedBones[bone.parentId];
            if (parentSolved) {
              parentGlobalAngle = parentSolved.globalAngle;
            }
          }

          let localRestAngle = bone.restAngle;
          if (bone.parentId) {
            const parent = bones.find((b) => b.id === bone.parentId);
            if (parent) {
              localRestAngle = bone.restAngle - parent.restAngle;
            }
          }

          const globalRestAngle = parentGlobalAngle + localRestAngle;
          const minLim = bone.minAngle ?? -Math.PI;
          const maxLim = bone.maxAngle ?? Math.PI;

          const startAngle = globalRestAngle + minLim;
          const endAngle = globalRestAngle + maxLim;

          // 1. Draw semi-transparent "safe" movement sector (movement range)
          ctx.fillStyle = 'rgba(245, 158, 11, 0.12)'; // amber tint
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.arc(startX, startY, arcRadius, startAngle, endAngle, false);
          ctx.closePath();
          ctx.fill();

          // 2. Draw outer boundary arc
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)'; // glowing amber
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(startX, startY, arcRadius, startAngle, endAngle, false);
          ctx.stroke();

          // 3. Draw limit tick lines at minLim and maxLim
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = 1;
          
          // Min limit line
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + Math.cos(startAngle) * arcRadius, startY + Math.sin(startAngle) * arcRadius);
          ctx.stroke();

          // Max limit line
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + Math.cos(endAngle) * arcRadius, startY + Math.sin(endAngle) * arcRadius);
          ctx.stroke();

          // 4. Draw labels "MIN" and "MAX" near the ticks
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const labelPadding = 12;
          const minDeg = Math.round((minLim * 180) / Math.PI);
          const maxDeg = Math.round((maxLim * 180) / Math.PI);

          ctx.fillText(`Min:${minDeg}°`, startX + Math.cos(startAngle) * (arcRadius + labelPadding), startY + Math.sin(startAngle) * (arcRadius + labelPadding));
          ctx.fillText(`Max:+${maxDeg}°`, startX + Math.cos(endAngle) * (arcRadius + labelPadding), startY + Math.sin(endAngle) * (arcRadius + labelPadding));

          // 5. Draw rest orientation line (center reference)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.setLineDash([3, 2]);
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + Math.cos(globalRestAngle) * arcRadius, startY + Math.sin(globalRestAngle) * arcRadius);
          ctx.stroke();
          ctx.setLineDash([]); // reset

          ctx.restore();
        }

        ctx.globalAlpha = 1.0;
      });
    }

    // 4. DRAW PROCEDURAL BLASTING & DASH EFFECTS (AI GENERATOR SPECIAL PARTICLES)
    if (mode === 'ANIMATE' && activeAnimId && currentFrame !== undefined) {
      const isUlti = activeAnimId.toLowerCase().includes('ulti');
      const isBiasa = activeAnimId.toLowerCase().includes('biasa') || activeAnimId.toLowerCase().includes('attack');

      // FX 1: DASH WIND TRAILS (Ulti Frames 8 to 22)
      if (isUlti && currentFrame >= 8 && currentFrame <= 22) {
        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)'; // Cyan glow
        ctx.lineWidth = 3;
        
        // Horizontal trails moving right to left
        const trailY1 = spriteToCanvasSpace(60, 120, w, h);
        const trailY2 = spriteToCanvasSpace(50, 150, w, h);
        const trailY3 = spriteToCanvasSpace(70, 170, w, h);
        const length = 60 * zoom;

        ctx.beginPath();
        ctx.moveTo(trailY1.x - length, trailY1.y);
        ctx.lineTo(trailY1.x, trailY1.y);
        ctx.moveTo(trailY2.x - length, trailY2.y);
        ctx.lineTo(trailY2.x, trailY2.y);
        ctx.moveTo(trailY3.x - length, trailY3.y);
        ctx.lineTo(trailY3.x, trailY3.y);
        ctx.stroke();
        ctx.restore();
      }

      // FX 2: JUMP DUST CLOUDS (Ulti Frames 24 to 34)
      if (isUlti && currentFrame >= 24 && currentFrame <= 34) {
        ctx.save();
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'; // Slate dust
        const jumpFactor = (currentFrame - 24) / 10;
        const dustCenter = spriteToCanvasSpace(100, 185, w, h);

        for (let i = 0; i < 5; i++) {
          const angle = (i / 4) * Math.PI;
          const r = 25 * jumpFactor * zoom;
          const dx = Math.cos(angle) * r;
          const dy = -Math.sin(angle) * r * 0.4;
          
          ctx.beginPath();
          ctx.arc(dustCenter.x + dx, dustCenter.y + dy, (12 - i * 1.5) * zoom * (1 - jumpFactor), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // FX 3: SLASH SWOOSH ARC (Biasa: 15-25, Ulti: 40-50)
      const isSlashFrame = (isBiasa && !isUlti && currentFrame >= 15 && currentFrame <= 25) || 
                           (isUlti && currentFrame >= 40 && currentFrame <= 50);
      if (isSlashFrame) {
        ctx.save();
        const progress = isUlti ? (currentFrame - 40) / 10 : (currentFrame - 15) / 10;
        
        // Solve the sword tip (hero_right_arm end node) position dynamically from solvedBones
        let tipPos = { x: 150, y: 140 }; // fallback
        const rightArmSolved = solvedBones['hero_right_arm'] || solvedBones['bone_right_arm'] || solvedBones['right_arm'];
        if (rightArmSolved) {
          tipPos = rightArmSolved.end;
        }

        const centerPos = spriteToCanvasSpace(tipPos.x, tipPos.y, w, h);
        const r = 45 * zoom;

        // Draw glowing golden trail
        const grad = ctx.createRadialGradient(centerPos.x, centerPos.y, r * 0.3, centerPos.x, centerPos.y, r * 1.1);
        grad.addColorStop(0, 'rgba(251, 191, 36, 0.95)'); // Amber
        grad.addColorStop(0.5, 'rgba(239, 68, 68, 0.75)'); // Red
        grad.addColorStop(1, 'rgba(124, 58, 237, 0)'); // Purple fade

        ctx.fillStyle = grad;
        ctx.beginPath();
        const startAng = -Math.PI / 3 - progress * Math.PI;
        const endAng = startAng + Math.PI * 0.8;
        ctx.arc(centerPos.x, centerPos.y, r, startAng, endAng, false);
        ctx.arc(centerPos.x, centerPos.y, r * 0.5, endAng, startAng, true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // FX 4: ULTIMATE IMPACT SHOCKWAVE & BLASTING FLAMES (Ulti Frames 45 to 58)
      if (isUlti && currentFrame >= 45 && currentFrame <= 58) {
        ctx.save();
        const progress = (currentFrame - 45) / 13;
        const blastCenter = spriteToCanvasSpace(160, 185, w, h); // Ground slam point is offset forward

        // A. Expanding ring
        ctx.strokeStyle = `rgba(249, 115, 22, ${1 - progress})`; // Orange fading out
        ctx.lineWidth = 6 * (1 - progress) * zoom;
        ctx.beginPath();
        ctx.arc(blastCenter.x, blastCenter.y, 65 * progress * zoom, 0, Math.PI * 2);
        ctx.stroke();

        // B. Inner golden blast star
        ctx.fillStyle = `rgba(253, 224, 71, ${0.8 * (1 - progress)})`; // Yellow
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const outerR = 40 * progress * zoom * (i % 2 === 0 ? 1 : 0.4);
          ctx.lineTo(blastCenter.x + Math.cos(angle) * outerR, blastCenter.y + Math.sin(angle) * outerR);
        }
        ctx.closePath();
        ctx.fill();

        // C. Flying sparkling shards
        ctx.fillStyle = '#EF4444';
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + progress * 2;
          const distDistance = 50 * progress * zoom;
          const shardSize = 5 * (1 - progress) * zoom;
          ctx.beginPath();
          ctx.arc(blastCenter.x + Math.cos(angle) * distDistance, blastCenter.y + Math.sin(angle) * distDistance, shardSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // 5. DRAW BATTLE COMIC SHOUT BUBBLES (AI & Interactive Kids Battle FX)
    let activeShoutText: string | null = null;
    let activeShoutStyle: 'starburst' | 'cloud' | 'shock' | 'custom_image' | 'custom_code' = 'starburst';
    let shoutOpacity = 1.0;
    let isShoutActive = false;
    let customImageUrl: string | undefined = undefined;
    let customCode: string | undefined = undefined;
    let customColor: string | undefined = undefined;
    let customBorderColor: string | undefined = undefined;
    let customTextColor: string | undefined = undefined;
    let customScale = 1.0;
    let customOffsetY = 0;

    // A. Check if there is an active interactive shout triggered by user
    if (battleShout) {
      const elapsed = Date.now() - battleShout.timestamp;
      const duration = (battleShout.style === 'custom_code' || battleShout.style === 'custom_image') ? 4000 : 1400;
      if (elapsed < duration) {
        activeShoutText = battleShout.text;
        activeShoutStyle = battleShout.style;
        isShoutActive = true;
        customImageUrl = battleShout.customImageUrl;
        customCode = battleShout.customCode;
        customColor = battleShout.color;
        customBorderColor = battleShout.borderColor;
        customTextColor = battleShout.textColor;
        customScale = battleShout.scale ?? 1.0;
        customOffsetY = battleShout.offsetY ?? 0;

        // Fade out at the end
        if (elapsed > duration - 400) {
          shoutOpacity = 1.0 - (elapsed - (duration - 400)) / 400;
        }
      }
    }

    // B. Check if we should automatically trigger a cinematic shout based on playing fighting animations
    if (!isShoutActive && mode === 'ANIMATE' && activeAnimId && currentFrame !== undefined) {
      const isUlti = activeAnimId.toLowerCase().includes('ulti');
      const isBiasa = activeAnimId.toLowerCase().includes('biasa') || activeAnimId.toLowerCase().includes('attack');
      
      if (isBiasa && !isUlti && currentFrame >= 15 && currentFrame <= 25) {
        activeShoutText = "CIAT!";
        activeShoutStyle = 'starburst';
        isShoutActive = true;
      } else if (isUlti && currentFrame >= 42 && currentFrame <= 52) {
        activeShoutText = "💥 DUAAAR!";
        activeShoutStyle = 'shock';
        isShoutActive = true;
      }
    }

    // Draw the bubble!
    if (isShoutActive) {
      ctx.save();
      ctx.globalAlpha = shoutOpacity;

      // Find head position dynamically
      let headPos = { x: 100, y: 70 }; // default center-top
      const headBone = bones.find(b => b.id.toLowerCase().includes('head') || b.name.toLowerCase().includes('head') || b.id.toLowerCase().includes('helmet'));
      if (headBone && solvedBones[headBone.id]) {
        headPos = solvedBones[headBone.id].end;
      } else if (bones.length > 0) {
        // Fallback: find highest solved point
        let minVal = 9999;
        bones.forEach(b => {
          const solved = solvedBones[b.id];
          if (solved) {
            if (solved.start.y < minVal) { minVal = solved.start.y; headPos = solved.start; }
            if (solved.end.y < minVal) { minVal = solved.end.y; headPos = solved.end; }
          }
        });
      }

      // Convert head position to canvas space
      // Draw it slightly above the head (e.g., -45px on y-axis) with custom horizontal offset and vertical offset
      const bubbleCenter = spriteToCanvasSpace(headPos.x, headPos.y - 45 + (customOffsetY / zoom), w, h);

      // Bounce scale animation
      const animFrame = currentFrame !== undefined ? currentFrame : (Date.now() / 50) % 30;
      const pulse = 1.0 + Math.sin(animFrame * 0.4) * 0.05;
      const finalScale = pulse * customScale;
      ctx.translate(bubbleCenter.x, bubbleCenter.y);
      ctx.scale(finalScale, finalScale);

      if (activeShoutStyle === 'custom_image' && customImageUrl) {
        // Draw custom transparent PNG expression from cache
        let cachedImg = exprImageCacheRef.current[customImageUrl];
        if (!cachedImg) {
          cachedImg = new Image();
          cachedImg.onload = () => {
            setExprImageLoaded(prev => prev + 1);
          };
          cachedImg.src = customImageUrl;
          exprImageCacheRef.current[customImageUrl] = cachedImg;
        }

        if (cachedImg.complete && cachedImg.naturalWidth > 0) {
          const iw = cachedImg.naturalWidth;
          const ih = cachedImg.naturalHeight;
          const drawW = 55 * zoom;
          const drawH = (drawW * ih) / iw;
          ctx.drawImage(cachedImg, -drawW / 2, -drawH / 2, drawW, drawH);
        }
      } else if (activeShoutStyle === 'custom_code' && customCode) {
        // Draw real-time programmatic visual effect (JS / simulated Python compiling)
        try {
          const progress = battleShout ? (Date.now() - battleShout.timestamp) / 4000 : 0;
          const fn = new Function('ctx', 'progress', 'zoom', 'timestamp', 'frame', customCode);
          fn(ctx, progress, zoom, Date.now(), currentFrame || 0);
        } catch (e: any) {
          ctx.fillStyle = '#EF4444';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`Error: ${e.message}`, 0, 0);
        }
      } else if (activeShoutStyle === 'starburst') {
        // 1. STARBURST (Action/Attack) - Jagged yellow/orange star
        const points = 14;
        const outerR = 50 * zoom;
        const innerR = 32 * zoom;
        
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        
        // Draw black thick comic border
        ctx.strokeStyle = customBorderColor || '#000000';
        ctx.lineWidth = 5;
        ctx.stroke();
        
        // Yellow fill
        ctx.fillStyle = customColor || '#FBBF24';
        ctx.fill();

        // Inner orange burst
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? outerR * 0.75 : innerR * 0.75;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = customBorderColor ? (customBorderColor + '88') : '#F97316'; // orange
        ctx.fill();

      } else if (activeShoutStyle === 'shock') {
        // 2. SHOCK (Impact/Power) - Jagged spiky blue/purple outline
        const points = 16;
        const outerR = 55 * zoom;
        const innerR = 30 * zoom;
        
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        
        ctx.strokeStyle = customBorderColor || '#000000';
        ctx.lineWidth = 5;
        ctx.stroke();
        
        ctx.fillStyle = customColor || '#A855F7'; // purple
        ctx.fill();

        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
          const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? outerR * 0.75 : innerR * 0.75;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = customTextColor || '#06B6D4'; // cyan
        ctx.fill();

      } else {
        // 3. CLOUD (Friendly/Speaking) - Fluffy white comic cloud with a pointing tail
        ctx.beginPath();
        // Pointing tail pointing to character's head
        ctx.moveTo(0, 0);
        ctx.lineTo(-10 * zoom, 25 * zoom);
        ctx.lineTo(15 * zoom, 15 * zoom);
        ctx.closePath();
        ctx.strokeStyle = customBorderColor || '#000000';
        ctx.lineWidth = 5;
        ctx.fillStyle = customColor || '#FFFFFF';
        ctx.stroke();
        ctx.fill();

        // Fluffy cloud body
        ctx.beginPath();
        const r = 24 * zoom;
        ctx.arc(-20 * zoom, 0, r * 0.8, 0, Math.PI * 2);
        ctx.arc(20 * zoom, 0, r * 0.8, 0, Math.PI * 2);
        ctx.arc(0, -15 * zoom, r * 0.9, 0, Math.PI * 2);
        ctx.arc(0, 10 * zoom, r * 0.7, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
      }

      // Draw text inside (only if not drawing custom image or script code)
      if (activeShoutStyle !== 'custom_image' && activeShoutStyle !== 'custom_code' && activeShoutText) {
        ctx.fillStyle = customTextColor || '#FFFFFF';
        ctx.font = `black ${Math.max(10, Math.floor(13 * zoom))}px "Impact", "Arial Black", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = customBorderColor || '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText(activeShoutText, 0, 0);
        ctx.fillText(activeShoutText, 0, 0);
      }

      ctx.restore();
    }

    ctx.restore();
  }, [
    imgElement,
    imgSize,
    bones,
    solvedBones,
    mode,
    selectedBoneId,
    mesh,
    showMesh,
    showBones,
    showSprite,
    boneOpacity,
    meshOpacity,
    zoom,
    pan,
    isSpacePressed,
    activeAnimId,
    currentFrame,
    battleShout,
    showOnionSkin,
    prevKeyframe,
    nextKeyframe,
    exprImageLoaded
  ]);

  // Secondary canvas drawing helper: Draws elegant editor grid lines
  const drawEditorGrid = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    pan: Vector2D,
    zoom: number
  ) => {
    const gridSize = 40 * zoom;
    const xOffset = (w / 2 + pan.x) % gridSize;
    const yOffset = (h / 2 + pan.y) % gridSize;

    ctx.strokeStyle = '#121214'; // very dark grid lines
    ctx.lineWidth = 0.5;

    // Draw vertical lines
    for (let x = xOffset; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = yOffset; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Center Coordinate Axis crosshairs
    ctx.strokeStyle = '#1c1c1f'; // matching axis line
    ctx.lineWidth = 1;
    
    // Vertical Axis
    ctx.beginPath();
    ctx.moveTo(w / 2 + pan.x, 0);
    ctx.lineTo(w / 2 + pan.x, h);
    ctx.stroke();

    // Horizontal Axis
    ctx.beginPath();
    ctx.moveTo(0, h / 2 + pan.y);
    ctx.lineTo(w, h / 2 + pan.y);
    ctx.stroke();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0B] relative" ref={containerRef}>
      
      {/* Top Banner Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0E0E10] text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Move className="h-3.5 w-3.5 text-amber-500" />
          <span>Stage Navigation:</span>
          <kbd className="bg-[#0A0A0B] border border-white/10 px-1.5 py-0.5 rounded text-slate-200 font-mono text-[10px]">Space + Drag</kbd>
          <span>to Pan,</span>
          <kbd className="bg-[#0A0A0B] border border-white/10 px-1.5 py-0.5 rounded text-slate-200 font-mono text-[10px]">Scroll</kbd>
          <span>to Zoom</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom Actions */}
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
            className="rounded p-1 text-slate-400 hover:text-white hover:bg-[#0A0A0B] border border-transparent hover:border-white/10 transition-all cursor-pointer"
            title="Zoom Out"
            id="zoom_out_btn"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="font-mono text-slate-300 w-12 text-center select-none font-semibold">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(6.0, z + 0.2))}
            className="rounded p-1 text-slate-400 hover:text-white hover:bg-[#0A0A0B] border border-transparent hover:border-white/10 transition-all cursor-pointer"
            title="Zoom In"
            id="zoom_in_btn"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetCamera}
            className="rounded px-2 py-1 text-slate-400 hover:text-white hover:bg-[#0A0A0B] border border-white/10 transition-all cursor-pointer flex items-center gap-1 font-semibold"
            title="Reset Pan & Zoom"
            id="reset_cam_btn"
          >
            <Maximize className="h-3.5 w-3.5" />
            <span>Reset View</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1" />

          <button
            onClick={onOpenHelp}
            className="rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-2.5 py-1 transition-all cursor-pointer flex items-center gap-1 font-semibold"
            id="canvas_help_btn"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Rigging Guide</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 relative overflow-hidden bg-[#050506]">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          className={`w-full h-full block ${isPanning || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
          id="rigging_canvas_stage"
        />

        {/* Floating Mode Tag */}
        <div className="absolute top-4 left-4 pointer-events-none select-none flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 ${
            mode === 'RIG'
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${mode === 'RIG' ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
            <span>{mode === 'RIG' ? 'Rig Mode' : 'Animate Mode'}</span>
          </div>

          {!imgElement && (
            <div className="px-3 py-1.5 rounded border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 text-xs font-semibold shadow-lg flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Please select a character preset on the left!</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
