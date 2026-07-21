export interface Vector2D {
  x: number;
  y: number;
}

export interface SpriteSlice {
  id: string;
  name: string;
  x: number;      // Pixel coordinate X on the sheet
  y: number;      // Pixel coordinate Y on the sheet
  width: number;  // Width of the sliced frame
  height: number; // Height of the sliced frame
  flipH?: boolean; // Symmetrical flip horizontal
  flipV?: boolean; // Symmetrical flip vertical
}

export interface SpritesheetAnimation {
  id: string;
  name: string;
  frames: string[]; // List of SpriteSlice IDs in sequence
  fps: number;      // Animation speed for this sequence
  loop: boolean;    // Whether this sequence loops
}

export interface SpritesheetPreset {
  id: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  defaultCols: number;
  defaultRows: number;
  defaultSlices: SpriteSlice[];
  defaultAnimations: SpritesheetAnimation[];
}

export interface ComicShout {
  text: string;
  style: 'starburst' | 'cloud' | 'shock' | 'retro_badge';
  timestamp: number;
  color?: string;
  borderColor?: string;
  textColor?: string;
  scale?: number;
}

export type SlicerMode = 'GRID' | 'MANUAL';
