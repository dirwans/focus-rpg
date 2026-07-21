import React from 'react';
import { X, Copy, Check, HelpCircle, BookOpen, Cpu, Gamepad2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const integrationSnippet = `// 2.5D Skeletal Sprite Player - copy/paste into your web game!
class SpritePlayer {
  constructor(rigJson) {
    this.rig = rigJson;
    this.currentAnim = Object.keys(rigJson.animations)[0];
    this.frame = 0;
    this.isPlaying = true;
    this.isLooping = true;
    
    // Load image
    this.img = new Image();
    this.img.src = rigJson.imageDataUrl;
    this.imgLoaded = false;
    this.img.onload = () => { this.imgLoaded = true; };
    
    // Pre-calculate mesh rest grids
    this.initMesh();
  }

  initMesh() {
    // Reconstruct mesh vertices and weights
    this.vertices = this.rig.mesh.vertices;
    this.triangles = this.rig.mesh.triangles;
  }

  update() {
    if (!this.isPlaying) return;
    this.frame += 0.5; // adjust speed here
    const animation = this.rig.animations[this.currentAnim];
    if (this.frame >= animation.duration) {
      if (this.isLooping) {
        this.frame = 0;
      } else {
        this.frame = animation.duration;
        this.isPlaying = false;
      }
    }
  }

  // Linear interpolation helpers
  lerp(a, b, t) { return a + (b - a) * t; }
  
  getInterpolatedTransform(boneId, frameNum) {
    const animation = this.rig.animations[this.currentAnim];
    const keyframes = animation.keyframes.slice().sort((a,b) => a.frame - b.frame);
    
    if (keyframes.length === 0) return { rotation: 0, translation: { x:0, y:0 } };
    
    // Find flanking keyframes
    let k1 = keyframes[0];
    let k2 = keyframes[keyframes.length - 1];
    
    for (let i = 0; i < keyframes.length; i++) {
      if (keyframes[i].frame <= frameNum) k1 = keyframes[i];
      if (keyframes[i].frame >= frameNum) {
        k2 = keyframes[i];
        break;
      }
    }
    
    if (k1.frame === k2.frame) {
      return k1.boneTransforms[boneId] || { rotation: 0, translation: { x:0, y:0 } };
    }
    
    const t = (frameNum - k1.frame) / (k2.frame - k1.frame);
    const t1 = k1.boneTransforms[boneId] || { rotation: 0, translation: { x:0, y:0 } };
    const t2 = k2.boneTransforms[boneId] || { rotation: 0, translation: { x:0, y:0 } };
    
    // Interpolate rotation smoothly
    let rot1 = t1.rotation;
    let rot2 = t2.rotation;
    // Normalize angle difference
    let diff = rot2 - rot1;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    const rotation = rot1 + diff * t;
    
    const translation = {
      x: this.lerp(t1.translation.x, t2.translation.x, t),
      y: this.lerp(t1.translation.y, t2.translation.y, t)
    };
    
    return { rotation, translation };
  }

  solveFK() {
    const solved = {};
    const bones = this.rig.bones;
    const boneMap = {};
    bones.forEach(b => { boneMap[b.id] = b; });

    const solveBone = (boneId) => {
      if (solved[boneId]) return solved[boneId];
      const bone = boneMap[boneId];
      const transform = this.getInterpolatedTransform(boneId, this.frame);
      
      let start, parentGlobalAngle = 0;
      if (bone.parentId) {
        const parentSolved = solveBone(bone.parentId);
        start = parentSolved.end;
        parentGlobalAngle = parentSolved.globalAngle;
      } else {
        start = {
          x: bone.restStart.x + transform.translation.x,
          y: bone.restStart.y + transform.translation.y
        };
      }

      let localRestAngle = bone.restAngle;
      if (bone.parentId) {
        const parent = boneMap[bone.parentId];
        localRestAngle = bone.restAngle - parent.restAngle;
      }

      const globalAngle = parentGlobalAngle + localRestAngle + transform.rotation;
      const end = {
        x: start.x + bone.length * Math.cos(globalAngle),
        y: start.y + bone.length * Math.sin(globalAngle)
      };

      solved[boneId] = { start, end, globalAngle };
      return solved[boneId];
    };

    bones.forEach(b => solveBone(b.id));
    return solved;
  }

  draw(ctx, x, y, scale = 1) {
    if (!this.imgLoaded) return;
    
    const solved = this.solveFK();
    
    // Deform all vertices
    const animatedVerts = this.vertices.map(v => {
      const activeBones = Object.keys(v.weights);
      if (activeBones.length === 0 || this.rig.bones.length === 0) {
        return { x: v.x, y: v.y };
      }
      
      let fx = 0, fy = 0;
      activeBones.forEach(boneId => {
        const w = v.weights[boneId];
        const bone = this.rig.bones.find(b => b.id === boneId);
        const slv = solved[boneId];
        if (!bone || !slv) {
          fx += v.x * w; fy += v.y * w;
          return;
        }
        
        const rx = v.x - bone.restStart.x;
        const ry = v.y - bone.restStart.y;
        const dTheta = slv.globalAngle - bone.restAngle;
        const cos = Math.cos(dTheta), sin = Math.sin(dTheta);
        
        const rotX = rx * cos - ry * sin;
        const rotY = rx * sin + ry * cos;
        
        fx += (slv.start.x + rotX) * w;
        fy += (slv.start.y + rotY) * w;
      });
      return { x: fx, y: fy };
    });
    
    // Draw triangles using Canvas 2D Affine transforms
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    this.triangles.forEach(t => {
      const v1 = this.vertices[t.v1];
      const v2 = this.vertices[t.v2];
      const v3 = this.vertices[t.v3];
      
      const d1 = animatedVerts[t.v1];
      const d2 = animatedVerts[t.v2];
      const d3 = animatedVerts[t.v3];
      
      // Perform 2D Affine Warp for this triangle
      this.drawWarpedTriangle(
        ctx, this.img,
        v1.x, v1.y, v2.x, v2.y, v3.x, v3.y,
        d1.x, d1.y, d2.x, d2.y, d3.x, d3.y
      );
    });
    ctx.restore();
  }

  drawWarpedTriangle(ctx, img, sx0, sy0, sx1, sy1, sx2, sy2, dx0, dy0, dx1, dy1, dx2, dy2) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(dx0, dy0);
    ctx.lineTo(dx1, dy1);
    ctx.lineTo(dx2, dy2);
    ctx.closePath();
    ctx.clip();
    
    const denom = sx0*(sy2-sy1) - sx1*sy2 + sx2*sy1 + (sx1-sx2)*sy0;
    if (Math.abs(denom) < 0.0001) { ctx.restore(); return; }
    
    const m00 = -(sy0*(dx2-dx1) - sy1*dx2 + sy2*dx1 + (sy1-sy2)*dx0) / denom;
    const m01 = -(sy0*(dy2-dy1) - sy1*dy2 + sy2*dy1 + (sy1-sy2)*dy0) / denom;
    const m10 = (sx0*(dx2-dx1) - sx1*dx2 + sx2*dx1 + (sx1-sx2)*dx0) / denom;
    const m11 = (sx0*(dy2-dy1) - sy1*dy2 + sy2*dy1 + (sy1-sy2)*dy0) / denom;
    const tx  = (sx0*(sy2*dx1 - sy1*dx2) + sy0*(sx1*dx2 - sx2*dx1) + (sx2*sy1 - sx1*sy2)*dx0) / denom;
    const ty  = (sx0*(sy2*dy1 - sy1*dy2) + sy0*(sx1*dy2 - sx2*dy1) + (sx2*sy1 - sx1*sy2)*dy0) / denom;
    
    ctx.transform(m00, m01, m10, m11, tx, ty);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(integrationSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded bg-[#0E0E10] border border-white/10 shadow-2xl text-slate-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#0A0A0B]">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white">Rigging &amp; Animation Manual</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            id="close_help_btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Quick Concepts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded border border-white/10 bg-[#0A0A0B]/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-blue-400">What is Rigging (Bones)?</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rigging is like placing a digital skeleton inside a drawing. By adding <strong>bones</strong> and joint nodes, you control sections of your sprite. Rotations cascade down: moving a shoulder bone naturally pivots the forearm and hand with it.
              </p>
            </div>
            
            <div className="rounded border border-white/10 bg-[#0A0A0B]/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="font-semibold text-emerald-400">2.5D Skinning (Warp)</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instead of rigid, chopped-up puppet pieces, this app uses <strong>Linear Blend Skinning (LBS)</strong>. It generates a triangle mesh over your sprite. Every pixel's movement is dynamically weighted by its distance to your bones, allowing organic squashing and stretching!
              </p>
            </div>

            <div className="rounded border border-white/10 bg-[#0A0A0B]/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Gamepad2 className="h-5 w-5 text-pink-400" />
                <h3 className="font-semibold text-pink-400">Keyframe Timelines</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                You don't need to draw every single frame! Simply select a frame (e.g. Frame 10), rotate a bone, and add a <strong>Keyframe</strong>. The app automatically interpolates (tweens) the smooth positions between your keyframes.
              </p>
            </div>
          </div>

          {/* Workflow Guide */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-widest font-bold text-amber-500 border-b border-white/10 pb-2">How to Use the App</h3>
            <ol className="list-decimal list-inside space-y-3 text-sm text-slate-400">
              <li>
                <span className="font-medium text-slate-200">Load or Upload</span>: Choose a preset character (like the <span className="text-emerald-400">Wobbly Slime</span>) or upload your own transparent PNG sprite.
              </li>
              <li>
                <span className="font-medium text-slate-200">Rig the Skeleton (RIG Mode)</span>:
                <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-slate-500">
                  <li>Click <strong className="text-slate-300">Add Bone</strong> to begin.</li>
                  <li>Click on the canvas to place joints. Connect them by choosing a <strong className="text-slate-300">Parent</strong> bone.</li>
                  <li>Drag joint handles in the canvas to resize and reposition bones.</li>
                </ul>
              </li>
              <li>
                <span className="font-medium text-slate-200">Create Animations (ANIMATE Mode)</span>:
                <ul className="list-disc list-inside ml-5 mt-1 space-y-1 text-slate-500">
                  <li>Switch to <strong className="text-slate-300">Animate Mode</strong> at the top left.</li>
                  <li>Select a frame on the bottom timeline (e.g., Frame 15).</li>
                  <li>Rotate the bones directly on the canvas by dragging their joint tips!</li>
                  <li>Press <strong className="text-slate-300">Keyframe Bone</strong> (or toggle auto-keyframe) to lock in that pose.</li>
                  <li>Hit <strong className="text-slate-300">Play</strong> to watch your organic 2.5D animation come to life!</li>
                </ul>
              </li>
              <li>
                <span className="font-medium text-slate-200">Export for Games</span>: Click <strong className="text-slate-300">Export JSON</strong>. You can load this file into your games using the engine snippet below!
              </li>
            </ol>
          </div>

          {/* Web Game Integration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm uppercase tracking-widest font-bold text-amber-500">HTML5 Canvas Game Integration</h3>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 rounded bg-transparent hover:bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all cursor-pointer"
                id="copy_code_btn"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Paste this lightweight, self-contained JavaScript class into your HTML5 Canvas code. It implements 100% matching Forward Kinematics and Linear Blend Skinning to play your exported JSON animations natively at high performance!
            </p>
            <div className="relative">
              <pre className="max-h-72 overflow-y-auto rounded bg-[#050506] p-4 font-mono text-[11px] leading-relaxed text-slate-400 border border-white/10 scrollbar-thin scrollbar-thumb-white/10">
                {integrationSnippet}
              </pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-white/10 px-6 py-4 bg-[#0A0A0B]">
          <button
            onClick={onClose}
            className="rounded bg-amber-600 hover:bg-amber-500 px-5 py-2 text-xs uppercase tracking-widest font-bold text-white transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-950/20"
            id="close_help_bottom_btn"
          >
            Got it, Let's Rig!
          </button>
        </div>

      </div>
    </div>
  );
}
