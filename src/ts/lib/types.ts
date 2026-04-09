export interface CharHighlight {
  char: string;
  color: string;
}

/**
 * Specifies a subject→predicate→object relation to render as framed tokens
 * with a curved arrow connecting subject to object.
 */
export interface RelationArrow {
  tokens: string[]; // ordered HanLP token words (no spaces)
  subjectIdx: number; // 0-based index into tokens
  predicateIdx: number;
  objectIdx: number;
  direction: "我→谓→你" | "你→谓→我";
}

export interface TextOptions {
  fontSize?: number;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  x?: number;
  y?: number;
  gap?: number;
  bold?: boolean;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right";
  wrapWidth?: number; // auto-wrap text within this pixel width
  blur?: number; // blur radius in pixels
  highlights?: CharHighlight[]; // draw targeting frames around these characters
  dotHighlights?: CharHighlight[]; // draw dots over these characters
  relationArrows?: RelationArrow[]; // draw subject→predicate→object frames + arc arrow
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
  opacity?: number;
  tint?: string; // CSS color for tinting (e.g., 'white')
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
  noFrame?: boolean; // do not draw the targeting frame around the annotation
  angle?: number; // rotation angle in degrees
  fontSize?: number; // override annotation font size in px (default: FONT_ANNOTATION * 0.75)
  fontFamily?: string; // override font family (default: auto-select by Chinese detection)
  bold?: boolean;
}

export interface TrajectoryPath {
  points: Array<{ x: number; y: number }>; // polyline control points on spread canvas
  color?: string;
  dash?: number[]; // e.g. [5, 4]
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  arrowEnd?: boolean;
  opacity?: number;
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
  labelOffsetX?: number; // local-coordinate X offset for label (positive = toward nose/screen-left at rot~170°)
  labelOffsetY?: number; // local-coordinate Y offset for label
  labelLetterSpacing?: number; // letter spacing in px (unscaled), e.g. -2 to tighten
  sublabel?: string; // extra text rendered near the frame (e.g. dates), supports \n
  scaleY?: number; // vertical squish for 3D-tilt illusion (e.g. 0.3 = edge-on)
  blur?: number; // motion/depth-of-field blur in pixels
  opacity?: number; // photo opacity (0.0 to 1.0)
  showFrame?: boolean; // draw HUD targeting frame around the photo
  frameColor?: string; // frame accent color, defaults to COLOR_BLUE
  framePadX?: number; // horizontal inset in unscaled px (default -12; use 0 for tight fit)
  framePadY?: number; // vertical inset in unscaled px (default -28; use 0 for tight fit)
  frameCornersOnly?: boolean; // skip full rect + mid ticks, draw only corner brackets
  frameSameDir?: boolean; // rotate frame with the photo (default: frame is flipped 180°)
}

export interface ColumnLayout {
  count: number;
  xStarts: number[]; // reference-px x start for each column
  colWidth: number[]; // reference-px wrap width for each column
  maxHeight?: number; // optional maximum content height in reference px (REF_H units)
  startY?: number; // optional top margin in reference px (default 40)
}

export interface HalftoneConfig {
  file?: string;
  text?: string;
  blur?: number;
  fontFamily?: string;
  fontSize?: number;
  x: number;
  y: number;
  w: number;
  color?: string;
  spacing?: number;
  minDotSize?: number;
  maxDotSize?: number;
  opacity?: number;
  bold?: boolean;
  scaleY?: number;
}

export interface GridConfig {
  color?: string;
  step?: number;
  lineWidth?: number;
  blur?: number;
  opacity?: number;
  page?: "left" | "right" | "both";
  margin?: number; // Inset from the edges in REF units (can be fraction for percentage of REF_W/REF_H)
  marginX?: number; // Inset from left/right edges in REF units (can be fraction)
  marginY?: number; // Inset from top/bottom edges in REF units (can be fraction)
  halftone?: {
    spacing?: number;
    minDotSize?: number;
    maxDotSize?: number;
  };
}

export interface DotMatrixConfig {
  points?: { x: number; y: number; color?: string; size?: number }[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  spacing?: number;
  color?: string;
  waveAmplitude?: number;
  waveFrequency?: number;
  dotSize?: number;
  opacity?: number;
}

export interface PageHalfConfig {
  bgColor?: string;
  photos?: PhotoLayout[];
  sections?: Section[];
  columns?: ColumnLayout;
  halftones?: HalftoneConfig[];
}

export interface PageConfig {
  id: string;
  left?: PageHalfConfig;
  right?: PageHalfConfig;
  spread?: {
    sections?: Section[];
    columns?: ColumnLayout;
    photos?: SpreadPhotoLayout[];
    trajectories?: TrajectoryPath[];
    dotMatrix?: DotMatrixConfig;
    halftones?: HalftoneConfig[];
  };
  backgroundGrid?: GridConfig;
  toTraditional?: boolean;
  inkBleedRadius?: number;
  annotations?: Annotation[];
}
