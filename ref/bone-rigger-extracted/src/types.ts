export interface Vector2D {
  x: number;
  y: number;
}

export interface Bone {
  id: string;
  name: string;
  parentId: string | null;
  // Position in the local coordinate space of the image (0 to imageWidth, 0 to imageHeight)
  restStart: Vector2D;
  restEnd: Vector2D;
  length: number;
  restAngle: number; // calculated base angle in radians
  color: string;     // color overlay for the bone in the UI
  minAngle?: number; // minimum rotation offset in radians relative to rest angle
  maxAngle?: number; // maximum rotation offset in radians relative to rest angle
}

export interface BoneTransform {
  rotation: number; // offset from restAngle in radians
  translation: Vector2D; // translation offset from rest position
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'elastic'; // interpolation easing mode
}

export interface Keyframe {
  frame: number;
  // Key: boneId, Value: transform at this keyframe
  boneTransforms: Record<string, BoneTransform>;
}

export interface Animation {
  id: string;
  name: string;
  duration: number; // total number of frames, e.g., 24, 30, 60
  keyframes: Keyframe[]; // sorted by frame number
}

export interface SpritePreset {
  id: string;
  name: string;
  imageUrl: string;
  defaultBones: Bone[];
  defaultAnimations: Animation[];
}

export interface MeshVertex {
  index: number;
  // Coordinates relative to the image (0 to 1, or 0 to image size)
  u: number; // texture coordinate x (0..1)
  v: number; // texture coordinate y (0..1)
  // Base coordinates in pixels
  x: number;
  y: number;
  // Weights for each bone: boneId -> weight
  weights: Record<string, number>;
}

export interface MeshTriangle {
  v1: number; // index of vertex 1
  v2: number; // index of vertex 2
  v3: number; // index of vertex 3
}

export interface SpriteMesh {
  vertices: MeshVertex[];
  triangles: MeshTriangle[];
}

export type AppMode = 'RIG' | 'ANIMATE';

export interface ComicShout {
  text: string;
  style: 'starburst' | 'cloud' | 'shock' | 'custom_image' | 'custom_code';
  timestamp: number;
  customImageUrl?: string; // Base64 png expression
  customCode?: string; // Compiled JS drawing code
  customPythonCode?: string; // Python script representation
  color?: string; // Bubble fill color
  borderColor?: string; // Bubble border color
  textColor?: string; // Text color
  scale?: number;
  offsetY?: number;
}

