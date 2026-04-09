import { createCanvas, loadImage } from "@napi-rs/canvas";
import type { CanvasRenderingContext2D, Image, Canvas } from "@napi-rs/canvas";
import type {
  TapeConfig,
  CharHighlight,
  PhotoLayout,
  RelationArrow,
  SpreadPhotoLayout,
  TrajectoryPath,
  Annotation,
} from "./types";
import type { SharedAssets } from "./assets";
import { FONT_TAPE_LABEL, COLOR_BLUE, FONT_ANNOTATION } from "./typography";

/**
 * Reference dimensions from original field notes (per page)
 */
export const REF_W = 680;
export const REF_H = 1036;

/**
 * Calculate scaling factors based on canvas dimensions
 */
export function getScaling(canvasW: number, canvasH: number) {
  const sx = canvasW / REF_W;
  const sy = canvasH / REF_H;
  return { sx, sy, ss: Math.min(sx, sy) };
}

/**
 * Draw a photo with paper texture and optional tapes
 */
export async function drawPhoto(
  ctx: CanvasRenderingContext2D,
  photoConfig: PhotoLayout,
  assets: SharedAssets,
  ss: number,
  sx: number,
  sy: number,
) {
  const {
    file,
    x,
    y,
    w,
    rot,
    tapes: photoTapes = [],
    opacity = 1.0,
    tint,
  } = photoConfig;
  let photo: Image | Canvas = await loadImage(file);
  if (tint) {
    const off = createCanvas(photo.width, photo.height);
    const octx = off.getContext("2d");
    octx.drawImage(photo, 0, 0);
    octx.globalCompositeOperation = "source-in";
    octx.fillStyle = tint;
    octx.fillRect(0, 0, photo.width, photo.height);
    photo = off;
  }
  const scaledW = w * ss;
  const h = Math.round((scaledW * photo.height) / photo.width);
  const angle = (rot * Math.PI) / 180;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x * sx + scaledW / 2, y * sy + h / 2);
  ctx.rotate(angle);

  ctx.drawImage(
    applyPaperTexture(photo, assets.texture, 0.18, scaledW, h),
    -scaledW / 2,
    -h / 2,
  );

  drawTapes(ctx, assets.tapes, photoTapes, scaledW, h, assets.fontName);

  ctx.restore();
}

export async function drawSpreadPhoto(
  ctx: CanvasRenderingContext2D,
  sp: SpreadPhotoLayout,
  assets: SharedAssets,
  ss: number,
  scaleX: (x: number) => number,
  sy: number,
  sx_left: number,
  sx_right: number,
) {
  const photo = await loadImage(sp.file);
  const scaledW = sp.w * ss;
  const h = Math.round((scaledW * photo.height) / photo.width);
  const angle = (sp.rot * Math.PI) / 180;

  ctx.save();
  if (sp.opacity !== undefined) ctx.globalAlpha = sp.opacity;
  if (sp.blur) (ctx as any).filter = `blur(${sp.blur * ss}px)`;

  ctx.translate(scaleX(sp.x), sp.y * sy);
  ctx.rotate(angle);
  if (sp.scaleY !== undefined) ctx.scale(1, sp.scaleY);

  // Composite plane + texture on an offscreen canvas first
  const off = applyPaperTexture(photo, assets.texture, 0.18, scaledW, h);

  (ctx as any).shadowBlur = (sp.shadowBlur ?? 8) * ss;
  (ctx as any).shadowOffsetX =
    (sp.shadowOffsetX ?? 2) * (sp.x <= REF_W ? sx_left : sx_right);
  (ctx as any).shadowOffsetY = (sp.shadowOffsetY ?? 4) * sy;
  (ctx as any).shadowColor = sp.shadowColor ?? "rgba(0,0,0,0.22)";

  ctx.drawImage(off, -scaledW / 2, -h / 2);
  ctx.restore();
}

export async function drawSpreadPhotoLabel(
  ctx: CanvasRenderingContext2D,
  sp: SpreadPhotoLayout,
  assets: SharedAssets,
  ss: number,
  scaleX: (x: number) => number,
  sy: number,
  colorOverride?: string,
) {
  if (!sp.label) return;
  const scaledW = sp.w * ss;
  const angle = (sp.rot * Math.PI) / 180;

  ctx.save();
  ctx.translate(scaleX(sp.x), sp.y * sy);
  ctx.rotate(angle);
  if (sp.scaleY !== undefined) ctx.scale(1, sp.scaleY);

  const fontSize = Math.max(11, Math.round(scaledW * 0.11));
  ctx.font = `bold ${fontSize}px "${assets.fontName}"`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = colorOverride ?? sp.labelColor ?? COLOR_BLUE;
  (ctx as any).letterSpacing = `${(sp.labelLetterSpacing ?? 0) * ss}px`;
  ctx.fillText(
    sp.label,
    (sp.labelOffsetX ?? 0) * ss,
    (sp.labelOffsetY ?? 0) * ss,
  );
  ctx.restore();
}

export async function drawSpreadPhotoFrame(
  ctx: CanvasRenderingContext2D,
  sp: SpreadPhotoLayout,
  assets: SharedAssets,
  ss: number,
  scaleX: (x: number) => number,
  sy: number,
  curSx: number,
  colorOverride?: string,
) {
  if (!sp.showFrame) return;
  const photo = await loadImage(sp.file);
  const scaledW = sp.w * ss;
  const h = Math.round((scaledW * photo.height) / photo.width);
  const angle = (sp.rot * Math.PI) / 180;
  const frameColor = colorOverride ?? sp.frameColor ?? COLOR_BLUE;
  const padX = (sp.framePadX ?? -12) * curSx,
    padY = (sp.framePadY ?? -28) * sy;
  const fw = scaledW + padX * 2,
    fh = h + padY * 2;

  ctx.save();
  ctx.translate(scaleX(sp.x), sp.y * sy);
  ctx.rotate(sp.frameSameDir ? angle : angle + Math.PI);
  drawTargetingFrame(
    ctx,
    -fw / 2,
    -fh / 2,
    fw,
    fh,
    frameColor,
    ss,
    sp.frameCornersOnly ?? false,
  );
  ctx.restore();
}

export async function drawSpreadPhotoSublabel(
  ctx: CanvasRenderingContext2D,
  sp: SpreadPhotoLayout,
  assets: SharedAssets,
  ss: number,
  scaleX: (x: number) => number,
  sy: number,
  curSx: number,
  colorOverride?: string,
) {
  if (!sp.sublabel) return;
  const photo = await loadImage(sp.file);
  const scaledW = sp.w * ss;
  const h = Math.round((scaledW * photo.height) / photo.width);
  const angle = (sp.rot * Math.PI) / 180;
  const frameColor = sp.frameColor ?? COLOR_BLUE;
  const padX = (sp.framePadX ?? -12) * curSx,
    padY = (sp.framePadY ?? -28) * sy;
  const fw = scaledW + padX * 2,
    fh = h + padY * 2;

  ctx.save();
  ctx.translate(scaleX(sp.x), sp.y * sy);
  ctx.rotate(sp.frameSameDir ? angle : angle + Math.PI);

  const subFontSize = Math.max(9, Math.round(scaledW * 0.075));
  ctx.font = `bold ${subFontSize}px "${assets.labelFontName}"`;
  (ctx as any).letterSpacing = `${-0.5 * ss}px`;
  ctx.fillStyle = colorOverride ?? frameColor;
  ctx.globalAlpha = 0.85;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const lines = sp.sublabel.split("\n");
  const lineH = subFontSize * 1.3;
  const startY = fh / 2 + 4 * ss;
  const startX = -fw / 2 + (sp.labelOffsetX ?? 0) * ss;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], startX, startY + i * lineH);
  }
  ctx.restore();
}

export function drawTrajectory(
  ctx: CanvasRenderingContext2D,
  traj: TrajectoryPath,
  ss: number,
  scaleX: (x: number) => number,
  sy: number,
  colorOverride?: string,
) {
  if (traj.points.length < 2) return;
  const color = colorOverride ?? traj.color ?? "rgba(80,160,220,0.7)";
  ctx.save();
  ctx.globalAlpha = traj.opacity ?? 1.0;
  ctx.strokeStyle = color;
  ctx.lineWidth = (traj.lineWidth ?? 1.2) * ss;
  ctx.lineCap = traj.lineCap ?? "butt";
  ctx.setLineDash((traj.dash ?? [5, 4]).map((d) => d * ss));
  ctx.beginPath();
  ctx.moveTo(scaleX(traj.points[0].x), traj.points[0].y * sy);
  for (let i = 1; i < traj.points.length; i++) {
    ctx.lineTo(scaleX(traj.points[i].x), traj.points[i].y * sy);
  }
  ctx.stroke();

  if (traj.arrowEnd) {
    const last = traj.points[traj.points.length - 1];
    const prev = traj.points[traj.points.length - 2];
    const dx = scaleX(last.x) - scaleX(prev.x);
    const dy = (last.y - prev.y) * sy;
    const ang = Math.atan2(dy, dx);
    const alen = 10 * ss;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(scaleX(last.x), last.y * sy);
    ctx.lineTo(
      scaleX(last.x) - alen * Math.cos(ang - 0.4),
      last.y * sy - alen * Math.sin(ang - 0.4),
    );
    ctx.moveTo(scaleX(last.x), last.y * sy);
    ctx.lineTo(
      scaleX(last.x) - alen * Math.cos(ang + 0.4),
      last.y * sy - alen * Math.sin(ang + 0.4),
    );
    ctx.stroke();
  }
  ctx.restore();
}

export function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  ann: Annotation,
  assets: SharedAssets,
  ss: number,
  scaleX: (x: number) => number,
  sy: number,
  colorOverride?: string,
) {
  const ax = scaleX(ann.x);
  const ay = ann.y * sy;
  const color = colorOverride ?? ann.color ?? COLOR_BLUE;
  const scaledW = ann.w * ss;
  const scaledH = ann.h * ss;
  const cx = ax + scaledW / 2,
    cy = ay + scaledH / 2;

  if (!ann.noFrame) {
    drawTargetingFrame(ctx, ax, ay, scaledW, scaledH, color, ss);
  }

  // Center crosshair (opt-in)
  if (ann.crosshair) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.0 * ss;
    ctx.setLineDash([]);
    const cSize = 6 * ss;
    ctx.beginPath();
    ctx.moveTo(cx - cSize, cy);
    ctx.lineTo(cx + cSize, cy);
    ctx.moveTo(cx, cy - cSize);
    ctx.lineTo(cx, cy + cSize);
    ctx.stroke();
    ctx.restore();
  }

  // Label below box
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  const isChinese = /[\u4e00-\u9fa5]/.test(ann.label);
  const fontName =
    ann.fontFamily ??
    (isChinese ? assets.chineseLabelFontName : assets.labelFontName);
  const annFontSize = ann.fontSize ?? FONT_ANNOTATION * 0.75;
  ctx.font = `${ann.bold ? "bold " : ""}${annFontSize * ss}px "${fontName}"`;
  (ctx as any).letterSpacing = `${-1 * ss}px`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const labelX = cx;
  const labelY = ay + scaledH + 5 * sy;

  if (ann.angle !== undefined) {
    ctx.translate(labelX, labelY);
    ctx.rotate((ann.angle * Math.PI) / 180);
    ctx.fillText(ann.label, 0, 0);
  } else {
    ctx.fillText(ann.label, labelX, labelY);
  }

  (ctx as any).letterSpacing = "0px";
  ctx.restore();
}

/**
 * Apply paper texture onto an image or canvas.
 * Texture is clipped to existing pixels (source-atop), so transparent
 * backgrounds are unaffected. Returns the composited canvas.
 *
 * @param source   Image or Canvas to apply texture to
 * @param texture  Paper texture Image from SharedAssets
 * @param alpha    Texture opacity, default 0.18
 * @param targetW  Render width (defaults to source.width)
 * @param targetH  Render height (defaults to source.height)
 */
export function applyPaperTexture(
  source: Canvas | Image,
  texture: Image,
  alpha = 0.18,
  targetW?: number,
  targetH?: number,
): Canvas {
  const w = targetW ?? ((source as any).width as number);
  const h = targetH ?? ((source as any).height as number);
  const off = createCanvas(w, h);
  const ctx = off.getContext("2d") as any;
  ctx.drawImage(source, 0, 0, w, h);
  // Cover: scale texture to fill entire canvas (no uncovered edges)
  const natAspect = texture.width / texture.height;
  let texW: number, texH: number;
  if (w / h > natAspect) {
    texW = w;
    texH = w / natAspect;
  } else {
    texH = h;
    texW = h * natAspect;
  }
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = alpha;
  ctx.drawImage(texture, (w - texW) / 2, (h - texH) / 2, texW, texH);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
  return off;
}

/**
 * Draw a HUD-style targeting frame: full rectangle + bold corner brackets + mid-side ticks.
 * Coordinates are in the current canvas transform space (works in both rotated local space
 * and absolute canvas space).
 *
 * @param ctx    Canvas 2D context
 * @param x      Left edge of frame
 * @param y      Top edge of frame
 * @param w      Frame width
 * @param h      Frame height
 * @param color  Stroke color
 * @param ss     Scale factor (default 1.0)
 */
export function drawTargetingFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  ss = 1.0,
  cornersOnly = false,
  lw?: number, // override line width (in screen px, already scaled)
): void {
  const cLen = Math.round(Math.min(w, h) * 0.22);
  const tick = Math.round(Math.min(w, h) * 0.08);
  const cx = x + w / 2,
    cy = y + h / 2;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.setLineDash([]);

  if (!cornersOnly) {
    // Full rectangle (semi-transparent)
    ctx.lineWidth = lw ? lw * 0.6 : 1.4 * ss;
    ctx.globalAlpha = 0.65;
    ctx.strokeRect(x, y, w, h);
    ctx.globalAlpha = 1;
  }

  // Corner brackets
  ctx.lineWidth = lw ?? 2.4 * ss;
  [
    [
      [x, y + cLen],
      [x, y],
      [x + cLen, y],
    ],
    [
      [x + w - cLen, y],
      [x + w, y],
      [x + w, y + cLen],
    ],
    [
      [x, y + h - cLen],
      [x, y + h],
      [x + cLen, y + h],
    ],
    [
      [x + w - cLen, y + h],
      [x + w, y + h],
      [x + w, y + h - cLen],
    ],
  ].forEach(([start, corner, end]) => {
    ctx.beginPath();
    ctx.moveTo(start[0], start[1]);
    ctx.lineTo(corner[0], corner[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.stroke();
  });

  if (cornersOnly) {
    ctx.restore();
    return;
  }

  // Mid-side tick marks
  ctx.lineWidth = 1.0 * ss;
  [
    [
      [x - tick, cy],
      [x + tick, cy],
    ],
    [
      [x + w - tick, cy],
      [x + w + tick, cy],
    ],
    [
      [cx, y - tick],
      [cx, y + tick],
    ],
    [
      [cx, y + h - tick],
      [cx, y + h + tick],
    ],
  ].forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Map each HanLP token to its {x, w} position in the rendered text by
 * scanning left-to-right and skipping gaps (spaces, punctuation not in tokens).
 */
function computeTokenXPositions(
  ctx: CanvasRenderingContext2D,
  text: string,
  tokens: string[],
  startX: number,
): Array<{ x: number; w: number }> {
  const positions: Array<{ x: number; w: number }> = [];
  let charIdx = 0;
  let curX = startX;

  for (const token of tokens) {
    // Advance past characters that don't start this token
    while (charIdx < text.length && !text.startsWith(token, charIdx)) {
      curX += ctx.measureText(text[charIdx]).width;
      charIdx++;
    }
    const w = charIdx < text.length ? ctx.measureText(token).width : 0;
    positions.push({ x: curX, w });
    curX += w;
    charIdx += token.length;
  }

  return positions;
}

/**
 * Draw a curved arc with arrowhead from (x1, y) to (x2, y), arcing upward.
 * cpDrop controls how far above y the bezier control point sits.
 */
function drawArcArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  y: number,
  cpDrop: number,
  color: string,
  ss: number,
): void {
  const mx = (x1 + x2) / 2;
  const cpY = y - cpDrop;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.0 * ss;
  ctx.setLineDash([2.5 * ss, 2 * ss]);
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.quadraticCurveTo(mx, cpY, x2, y);
  ctx.stroke();

  // Arrowhead: tangent at t=1 of quadratic bezier = 2*(end - cp)
  ctx.setLineDash([]);
  ctx.lineWidth = 1.2 * ss;
  const tdx = x2 - mx;
  const tdy = y - cpY;
  const angle = Math.atan2(tdy, tdx);
  const ah = 4.5 * ss;
  ctx.beginPath();
  ctx.moveTo(x2, y);
  ctx.lineTo(x2 - ah * Math.cos(angle - 0.45), y - ah * Math.sin(angle - 0.45));
  ctx.moveTo(x2, y);
  ctx.lineTo(x2 - ah * Math.cos(angle + 0.45), y - ah * Math.sin(angle + 0.45));
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw text and overlay targeting-frame highlights on specified characters.
 * Renders the full string first, then measures per-character widths to place frames.
 * If relationArrows are provided they take priority: subject/predicate/object tokens
 * get individual frames and a curved arc arrow is drawn above the line.
 */
export function drawHighlightedLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  baselineY: number,
  fontSize: number,
  highlights: CharHighlight[],
  ss: number,
  relationArrows?: RelationArrow[],
  dotHighlights?: CharHighlight[],
  colorFilter?: (color: string) => boolean,
  baseColor: string = COLOR_BLUE,
): void {
  if (!colorFilter || colorFilter(baseColor)) {
    ctx.fillText(text, x, baselineY);
  }

  const frameH = fontSize * 1.0;
  const frameTop = baselineY - fontSize * 0.85;
  const frameLW = fontSize * 0.1;

  if (dotHighlights?.length) {
    const dotRadius = fontSize * 0.38;
    const dotY = baselineY - fontSize * 0.35;
    for (const hl of dotHighlights) {
      if (colorFilter && !colorFilter(hl.color)) continue;
      let startPos = 0;
      while (true) {
        const idx = text.indexOf(hl.char, startPos);
        if (idx === -1) break;
        const before = text.substring(0, idx);
        let charX = x + ctx.measureText(before).width;

        if (
          hl.char.length > 1 &&
          (hl.char.startsWith("我") || hl.char.startsWith("你"))
        ) {
          // Center on first character
          charX += ctx.measureText(hl.char[0]).width / 2;
        } else {
          // Center on whole highlight
          charX += ctx.measureText(hl.char).width / 2;
        }

        ctx.save();
        ctx.fillStyle = hl.color;
        ctx.beginPath();
        ctx.arc(charX, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        startPos = idx + 1;
      }
    }
  }

  if (relationArrows?.length) {
    for (const rel of relationArrows) {
      const dotColor = COLOR_BLUE;
      if (colorFilter && !colorFilter(dotColor)) continue;

      const pos = computeTokenXPositions(ctx, text, rel.tokens, x);
      const subj = pos[rel.subjectIdx];
      const obj = pos[rel.objectIdx];
      if (!subj || !obj || subj.w === 0 || obj.w === 0) continue;

      const subjToken = rel.tokens[rel.subjectIdx];
      const objToken = rel.tokens[rel.objectIdx];

      const dotRadius = fontSize * 0.38;
      const dotY = baselineY - fontSize * 0.35;

      const getCenterX = (p: { x: number; w: number }, token: string) => {
        if (
          token.length > 1 &&
          (token.startsWith("我") || token.startsWith("你"))
        ) {
          return p.x + ctx.measureText(token[0]).width / 2;
        }
        return p.x + p.w / 2;
      };

      const subjX = getCenterX(subj, subjToken);
      const objX = getCenterX(obj, objToken);

      [subjX, objX].forEach((cx) => {
        ctx.save();
        ctx.fillStyle = dotColor;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(cx, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      const arrowY = frameTop - 3 * ss;
      const span = Math.abs(objX - subjX);
      const cpDrop = Math.max(8 * ss, span * 0.28);
      drawArcArrow(ctx, subjX, objX, arrowY, cpDrop, dotColor, ss);
    }
    return;
  }

  // Fallback: plain character-level highlights
  const hlMap = new Map(highlights.map((h) => [h.char, h.color]));
  let curX = x;
  for (const char of text) {
    const cw = ctx.measureText(char).width;
    if (hlMap.has(char)) {
      const hlColor = hlMap.get(char)!;
      if (!colorFilter || colorFilter(hlColor)) {
        drawTargetingFrame(
          ctx,
          curX,
          frameTop,
          cw,
          frameH,
          hlColor,
          ss,
          true,
          frameLW,
        );
      }
    }
    curX += cw;
  }
}

/**
 * Draw tape stickers onto a photo.
 * Must be called inside a translated+rotated ctx (origin = photo center).
 *
 * @param ctx        Canvas context, already translated to photo center
 * @param tapes      Tape images from SharedAssets
 * @param configs    Tape configs from the photo layout
 * @param w          Photo display width
 * @param h          Photo display height
 * @param fontName   Font for tape labels
 */
function drawTapes(
  ctx: CanvasRenderingContext2D,
  tapes: Image[],
  configs: TapeConfig[],
  w: number,
  h: number,
  fontName: string,
): void {
  for (const tc of configs) {
    const t = tapes[tc.idx % tapes.length];
    const tw = Math.round(w * (tc.tapeWidth ?? 0.6));
    const th = Math.round((tw * t.height) / t.width);
    const tox = tc.offsetX ?? 0;
    const tx = tox * w - tw / 2;
    const ty = tc.side === "bottom" ? h / 2 - th * 0.6 : -h / 2 - th * 0.4;

    ctx.globalAlpha = 0.9;
    ctx.drawImage(t, tx, ty, tw, th);
    ctx.globalAlpha = 1;

    if (tc.label) {
      ctx.save();
      ctx.fillStyle = COLOR_BLUE;
      ctx.font = `${FONT_TAPE_LABEL}px "${fontName}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tc.label, tx + tw / 2, ty + th / 2);
      ctx.restore();
    }
  }
}

/**
 * Draw a halftone dot pattern based on an image's luminance/alpha.
 *
 * @param ctx       Canvas context
 * @param source    Image file path, Image object, or Canvas object
 * @param centerX   Center X coordinate in canvas pixels
 * @param centerY   Center Y coordinate in canvas pixels
 * @param w_ref     Target width in REF units
 * @param color     Dot color (default COLOR_BLUE)
 * @param spacing   Dot spacing in pixels (default 10)
 * @param minDotSize Minimum dot radius for background (default 0)
 * @param maxDotSize Maximum dot radius for foreground (default 0.9 * spacing / 2)
 * @param opacity   Overall opacity (default 1.0)
 * @param ss        Min scale factor
 * @param blur      Optional blur radius in pixels
 */
export async function drawHalftone(
  ctx: CanvasRenderingContext2D,
  source: string | Image | Canvas,
  centerX: number,
  centerY: number,
  w_ref: number,
  color: string = COLOR_BLUE,
  spacing: number = 8,
  minDotSize: number = 0,
  maxDotSize: number = 4,
  opacity: number = 1.0,
  ss: number,
  blur?: number,
) {
  let img: Image | Canvas;
  if (typeof source === "string") {
    img = await loadImage(source);
  } else {
    img = source;
  }

  const scaledW = Math.round(w_ref * ss);
  const scaledH = Math.round((scaledW * img.height) / img.width);

  // Draw image to offscreen canvas to sample pixels
  const off = createCanvas(scaledW, scaledH);
  const octx = off.getContext("2d");
  if (blur) {
    (octx as any).filter = `blur(${blur * ss}px)`;
  }
  octx.drawImage(img as any, 0, 0, scaledW, scaledH);
  const pixels = octx.getImageData(0, 0, scaledW, scaledH).data;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;

  const px = centerX - scaledW / 2;
  const py = centerY - scaledH / 2;
  const step = Math.round(spacing * ss);

  const minR = minDotSize * ss;
  const maxR = maxDotSize * ss;

  for (let ly = 0; ly < scaledH; ly += step) {
    for (let lx = 0; lx < scaledW; lx += step) {
      const idx = (ly * scaledW + lx) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];
      const a = pixels[idx + 3];

      // Luminance: 0 to 1, where 1 is white (no ink) and 0 is black (max ink)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const alpha = a / 255;
      const density = (1 - luminance) * alpha;

      const radius = minR + (maxR - minR) * density;
      if (radius > 0.1) {
        ctx.beginPath();
        ctx.arc(px + lx, py + ly, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
