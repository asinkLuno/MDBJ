import { createCanvas } from "@napi-rs/canvas";
import type { CanvasRenderingContext2D, Image, Canvas } from "@napi-rs/canvas";
import type { TapeConfig } from "./types";
import { FONT_TAPE_LABEL, COLOR_DEFAULT } from "./typography";

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
 */
export function drawTargetingFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  const cLen = Math.round(Math.min(w, h) * 0.22);
  const tick = Math.round(Math.min(w, h) * 0.08);
  const cx = x + w / 2,
    cy = y + h / 2;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.setLineDash([]);

  // Full rectangle (semi-transparent)
  ctx.lineWidth = 1.4;
  ctx.globalAlpha = 0.65;
  ctx.strokeRect(x, y, w, h);
  ctx.globalAlpha = 1;

  // Corner brackets (bold)
  ctx.lineWidth = 2.4;
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

  // Mid-side tick marks
  ctx.lineWidth = 1.0;
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
export function drawTapes(
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
      ctx.fillStyle = COLOR_DEFAULT;
      ctx.font = `${FONT_TAPE_LABEL}px "${fontName}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tc.label, tx + tw / 2, ty + th / 2);
      ctx.restore();
    }
  }
}
