export interface TextOptions {
  fontSize?: number;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  x?: number;
  y?: number;
  gap?: number;
  bold?: boolean;
  wrapWidth?: number; // auto-wrap text within this pixel width
}

export interface Section {
  text: string;
  options?: TextOptions;
}

export interface TapeConfig {
  idx: number;       // tape index
  offsetX?: number;  // horizontal offset as fraction of photo width (default 0)
}

export interface PhotoLayout {
  file: string;
  x: number;
  y: number;
  w: number;
  rot: number;
  tapes: TapeConfig[];
}

export interface LeftText {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  letterSpacing?: number;
}

export interface PageConfig {
  id: string;
  leftPhotos: PhotoLayout[];
  leftTexts?: LeftText[];
  rightSections: Section[];
  toTraditional?: boolean;
}
