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
  wrapWidth?: number; // auto-wrap text within this pixel width
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
}

export interface LeftText {
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  letterSpacing?: number;
  lineHeight?: number;
  fontFamily?: string;
  wrapWidth?: number;
  highlights?: CharHighlight[];
}

export interface TrajectoryPath {
  points: Array<{ x: number; y: number }>; // polyline control points on spread canvas
  color?: string;
  dash?: number[]; // e.g. [5, 4]
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  arrowEnd?: boolean;
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
  showFrame?: boolean; // draw HUD targeting frame around the photo
  frameColor?: string; // frame accent color, defaults to COLOR_DEFAULT
  framePadX?: number; // horizontal inset in unscaled px (default -12; use 0 for tight fit)
  framePadY?: number; // vertical inset in unscaled px (default -28; use 0 for tight fit)
  frameCornersOnly?: boolean; // skip full rect + mid ticks, draw only corner brackets
  frameSameDir?: boolean; // rotate frame with the photo (default: frame is flipped 180°)
}

export interface ColumnLayout {
  count: number;
  xStarts: number[]; // reference-px x start for each column
  colWidth: number[]; // reference-px wrap width for each column
}

export interface PageConfig {
  id: string;
  leftPhotos: PhotoLayout[];
  leftTexts?: LeftText[];
  leftSections?: Section[]; // column-rendered sections on the left page
  leftColumns?: ColumnLayout;
  rightSections: Section[];
  rightColumns?: ColumnLayout;
  rightPhotos?: PhotoLayout[];
  annotations?: Annotation[];
  spreadPhotos?: SpreadPhotoLayout[];
  trajectories?: TrajectoryPath[];
  dotMatrix?: {
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
  };
  toTraditional?: boolean;
}
