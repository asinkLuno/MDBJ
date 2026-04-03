export interface TextOptions {
  fontSize?: number;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  x?: number;
  y?: number;
  gap?: number;
  bold?: boolean;
}

export interface Section {
  text: string;
  options?: TextOptions;
}

export interface PhotoLayout {
  file: string;
  x: number;
  y: number;
  w: number;
  rot: number;
  tape: number;
  tapeOffsetX?: number;
}

export interface PageConfig {
  id: string;
  leftPhotos: PhotoLayout[];
  rightSections: Section[];
  toTraditional?: boolean;
}
