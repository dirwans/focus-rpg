import { Vector2D, Bone, BoneTransform, MeshVertex, MeshTriangle, SpriteMesh } from '../types';

// Simple vector algebra helpers
export function dist(v1: Vector2D, v2: Vector2D): number {
  return Math.sqrt((v1.x - v2.x) ** 2 + (v1.y - v2.y) ** 2);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVector(v1: Vector2D, v2: Vector2D, t: number): Vector2D {
  return {
    x: lerp(v1.x, v2.x, t),
    y: lerp(v1.y, v2.y, t),
  };
}

export function getEaseT(t: number, easing: 'linear' | 'ease-in' | 'ease-out' | 'elastic' = 'linear'): number {
  switch (easing) {
    case 'ease-in':
      return t * t * t; // Cubic Ease In
    case 'ease-out':
      return 1 - Math.pow(1 - t, 3); // Cubic Ease Out
    case 'elastic':
      if (t === 0 || t === 1) return t;
      const p = 0.3;
      return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    case 'linear':
    default:
      return t;
  }
}

// Calculate the relative angle in radians from v1 to v2
export function angleBetween(v1: Vector2D, v2: Vector2D): number {
  return Math.atan2(v2.y - v1.y, v2.x - v1.x);
}

// Distance from point P to line segment AB
export function distToSegment(p: Vector2D, a: Vector2D, b: Vector2D): number {
  const l2 = dist(a, b) ** 2;
  if (l2 === 0) return dist(p, a);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj: Vector2D = {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y)
  };
  return dist(p, proj);
}

// Solve Forward Kinematics (FK) for all bones given their current transforms
// Returns an object mapping boneId to their animated start, end positions and global angles
export interface SolvedBone {
  id: string;
  start: Vector2D;
  end: Vector2D;
  globalAngle: number;
}

export function solveFK(
  bones: Bone[],
  transforms: Record<string, BoneTransform>
): Record<string, SolvedBone> {
  const solved: Record<string, SolvedBone> = {};
  
  // Create lookup dictionary
  const boneMap = new Map<string, Bone>();
  bones.forEach(b => boneMap.set(b.id, b));

  // Depth-first solver or simple recursive solver to handle parents first
  function solveBone(boneId: string): SolvedBone {
    if (solved[boneId]) return solved[boneId];

    const bone = boneMap.get(boneId)!;
    const transform = transforms[boneId] || { rotation: 0, translation: { x: 0, y: 0 } };

    let start: Vector2D;
    let parentGlobalAngle = 0;

    if (bone.parentId) {
      const parentSolved = solveBone(bone.parentId);
      start = parentSolved.end;
      parentGlobalAngle = parentSolved.globalAngle;
    } else {
      // Root bone starts at its rest position plus any translation offset
      start = {
        x: bone.restStart.x + transform.translation.x,
        y: bone.restStart.y + transform.translation.y
      };
    }

    // Relative rest angle to parent
    let localRestAngle = bone.restAngle;
    if (bone.parentId) {
      const parent = boneMap.get(bone.parentId)!;
      localRestAngle = bone.restAngle - parent.restAngle;
    }

    const globalAngle = parentGlobalAngle + localRestAngle + transform.rotation;
    
    const end: Vector2D = {
      x: start.x + bone.length * Math.cos(globalAngle),
      y: start.y + bone.length * Math.sin(globalAngle)
    };

    const solvedBone: SolvedBone = {
      id: boneId,
      start,
      end,
      globalAngle
    };

    solved[boneId] = solvedBone;
    return solvedBone;
  }

  // Solve all bones
  bones.forEach(bone => {
    solveBone(bone.id);
  });

  return solved;
}

// Generate a mesh grid over the image dimensions
export function generateMesh(
  width: number,
  height: number,
  cols: number = 12,
  rows: number = 12
): SpriteMesh {
  const vertices: MeshVertex[] = [];
  const triangles: MeshTriangle[] = [];

  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      const v = r / rows;
      const x = u * width;
      const y = v * height;
      const index = r * (cols + 1) + c;

      vertices.push({
        index,
        u,
        v,
        x,
        y,
        weights: {}
      });
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i0 = r * (cols + 1) + c;
      const i1 = i0 + 1;
      const i2 = (r + 1) * (cols + 1) + c;
      const i3 = i2 + 1;

      // Triangle 1: i0, i1, i2
      triangles.push({ v1: i0, v2: i1, v3: i2 });
      // Triangle 2: i1, i3, i2
      triangles.push({ v1: i1, v2: i3, v3: i2 });
    }
  }

  return { vertices, triangles };
}

// Calculate bone weights for all mesh vertices based on distance to bones in rest pose
export function calculateMeshWeights(
  mesh: SpriteMesh,
  bones: Bone[],
  falloffExponent: number = 2.0,
  maxInfluences: number = 3
): SpriteMesh {
  if (bones.length === 0) {
    // If no bones, map everything to static
    return {
      ...mesh,
      vertices: mesh.vertices.map(v => ({ ...v, weights: {} }))
    };
  }

  const updatedVertices = mesh.vertices.map(v => {
    const rawInfluences: { id: string; weight: number }[] = [];

    bones.forEach(bone => {
      const d = distToSegment(v, bone.restStart, bone.restEnd);
      // Inverse distance weighting
      // Adding small epsilon (e.g., 8 pixels) to prevent division by zero or infinite spikes
      const weight = 1 / ((d + 12) ** falloffExponent);
      rawInfluences.push({ id: bone.id, weight });
    });

    // Sort by weight descending
    rawInfluences.sort((a, b) => b.weight - a.weight);

    // Keep top maxInfluences
    const selected = rawInfluences.slice(0, maxInfluences);

    // Normalize weights so they sum to 1
    const totalWeight = selected.reduce((sum, inf) => sum + inf.weight, 0);
    const weights: Record<string, number> = {};
    
    if (totalWeight > 0) {
      selected.forEach(inf => {
        weights[inf.id] = inf.weight / totalWeight;
      });
    } else {
      // Fallback: assign to the closest bone
      weights[rawInfluences[0].id] = 1.0;
    }

    return {
      ...v,
      weights
    };
  });

  return {
    ...mesh,
    vertices: updatedVertices
  };
}

// Deform mesh vertices using Linear Blend Skinning (LBS)
export function deformMesh(
  mesh: SpriteMesh,
  bones: Bone[],
  solvedBones: Record<string, SolvedBone>
): Vector2D[] {
  const deformedPositions: Vector2D[] = new Array(mesh.vertices.length);

  mesh.vertices.forEach((v, index) => {
    const weights = v.weights;
    const activeBoneIds = Object.keys(weights);

    if (activeBoneIds.length === 0 || bones.length === 0) {
      // No bones influencing, remains at base position
      deformedPositions[index] = { x: v.x, y: v.y };
      return;
    }

    let finalX = 0;
    let finalY = 0;

    activeBoneIds.forEach(boneId => {
      const weight = weights[boneId];
      const bone = bones.find(b => b.id === boneId);
      const solved = solvedBones[boneId];

      if (!bone || !solved) {
        // Fallback
        finalX += v.x * weight;
        finalY += v.y * weight;
        return;
      }

      // Step 1: Translate point to bone's rest start position
      const localX = v.x - bone.restStart.x;
      const localY = v.y - bone.restStart.y;

      // Step 2: Rotate by the change in global angle
      const dTheta = solved.globalAngle - bone.restAngle;
      const cosVal = Math.cos(dTheta);
      const sinVal = Math.sin(dTheta);

      const rotX = localX * cosVal - localY * sinVal;
      const rotY = localX * sinVal + localY * cosVal;

      // Step 3: Translate to animated start position
      const animX = solved.start.x + rotX;
      const animY = solved.start.y + rotY;

      // Step 4: Add weighted contribution
      finalX += animX * weight;
      finalY += animY * weight;
    });

    deformedPositions[index] = { x: finalX, y: finalY };
  });

  return deformedPositions;
}

// Compute standard affine transform matrix mapping triangle A to triangle B
// Used for clipping and drawing individual image triangles
export function drawWarpedTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  // Source triangle coordinates
  sx0: number, sy0: number,
  sx1: number, sy1: number,
  sx2: number, sy2: number,
  // Destination triangle coordinates
  dx0: number, dy0: number,
  dx1: number, dy1: number,
  dx2: number, dy2: number,
  tintColor?: string
) {
  // Save current state
  ctx.save();

  // Create path for clipping to the destination triangle
  ctx.beginPath();
  ctx.moveTo(dx0, dy0);
  ctx.lineTo(dx1, dy1);
  ctx.lineTo(dx2, dy2);
  ctx.closePath();
  ctx.clip();

  // Solve the affine transform matrix:
  // | dx0 dx1 dx2 |   | m00 m10 tx |   | sx0 sx1 sx2 |
  // | dy0 dy1 dy2 | = | m01 m11 ty | * | sy0 sy1 sy2 |
  // |  1   1   1  |   |  0   0   1 |   |  1   1   1  |
  
  const denom = sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0;
  if (Math.abs(denom) < 0.0001) {
    ctx.restore();
    return;
  }

  // Calculate transformation matrix coefficients
  const m00 = -(sy0 * (dx2 - dx1) - sy1 * dx2 + sy2 * dx1 + (sy1 - sy2) * dx0) / denom;
  const m01 = -(sy0 * (dy2 - dy1) - sy1 * dy2 + sy2 * dy1 + (sy1 - sy2) * dy0) / denom;
  const m10 = (sx0 * (dx2 - dx1) - sx1 * dx2 + sx2 * dx1 + (sx1 - sx2) * dx0) / denom;
  const m11 = (sx0 * (dy2 - dy1) - sx1 * dy2 + sx2 * dy1 + (sx1 - sx2) * dy0) / denom;
  const tx  = (sx0 * (sy2 * dx1 - sy1 * dx2) + sy0 * (sx1 * dx2 - sx2 * dx1) + (sx2 * sy1 - sx1 * sy2) * dx0) / denom;
  const ty  = (sx0 * (sy2 * dy1 - sy1 * dy2) + sy0 * (sx1 * dy2 - sx2 * dy1) + (sx2 * sy1 - sx1 * sy2) * dy0) / denom;

  // Apply transformation matrix
  ctx.transform(m00, m01, m10, m11, tx, ty);

  // Draw the image
  ctx.drawImage(img, 0, 0);

  // Apply tint color over the drawn image pixels if provided
  if (tintColor) {
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = tintColor;
    ctx.fillRect(0, 0, img.width, img.height);
  }

  // Restore state
  ctx.restore();
}
