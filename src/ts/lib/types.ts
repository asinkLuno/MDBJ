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
  idx: number; // tape index
  offsetX?: number; // horizontal offset as fraction of photo width (default 0)
  label?: string; // text to draw on the tape
  side?: "top" | "bottom"; // which edge to attach tape (default 'top')
  tapeWidth?: number; // tape width as fraction of photo width (default 0.6)
}

export interface PhotoLayout {
  file: string;
  x: number;
  y: number;
  w: number;
  rot: number;
  tapes: TapeConfig[];
}

export interface Annotation {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color?: string;
  connectToLeftIdx?: number; // index of photo in leftPhotos
  page?: "left" | "right";
  lineToX?: number; // spread canvas X to draw a connecting line to
  lineToY?: number;
  crosshair?: boolean; // draw center crosshair, default false
}

export interface LeftText {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  letterSpacing?: number;
}

export interface TrajectoryPath {
  points: Array<{ x: number; y: number }>; // polyline control points on spread canvas
  color?: string;
  dash?: number[]; // e.g. [5, 4]
  lineWidth?: number;
  arrowEnd?: boolean;
}

export interface TrackingLabel {
  x: number; // top-left of box on spread canvas
  y: number;
  label: string;
  sublabel?: string;
  data?: string[]; // additional data lines
  color?: string; // accent color, default '#88ccff'
  lineToX?: number; // draw a connecting line to this point
  lineToY?: number;
}

export interface SpreadPhotoLayout {
  file: string;
  x: number; // center X on combined spread canvas
  y: number; // center Y on combined spread canvas
  w: number; // display width
  rot: number; // rotation in degrees
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowColor?: string;
  tapes?: TapeConfig[];
  label?: string; // text drawn centered on the plane
  labelColor?: string;
  scaleY?: number; // vertical squish for 3D-tilt illusion (e.g. 0.3 = edge-on)
  blur?: number; // motion/depth-of-field blur in pixels
}

export interface PageConfig {
  id: string;
  leftPhotos: PhotoLayout[];
  leftTexts?: LeftText[];
  rightSections: Section[];
  rightPhotos?: PhotoLayout[];
  annotations?: Annotation[];
  spreadPhotos?: SpreadPhotoLayout[];
  trajectories?: TrajectoryPath[];
  trackingLabels?: TrackingLabel[];
  toTraditional?: boolean;
}
