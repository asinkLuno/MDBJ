import { createCanvas, loadImage } from "@napi-rs/canvas";
import type { Image, Canvas } from "@napi-rs/canvas";
import type { TapeConfig, PhotoLayout, SpreadPhotoLayout } from "./types";
import { FONT_TAPE_LABEL, COLOR_BLUE } from "./typography";
import type { RenderContext } from "./context";
import { applyGaussianBlur, applyPaperTexture } from "./effects";

function spreadPhotoScaledDims(
  photo: { width: number; height: number },
  sp: SpreadPhotoLayout,
  ss: number,
) {
  const scaledW = sp.w * ss;
  return { scaledW, scaledH: Math.round((scaledW * photo.height) / photo.width) };
}

function drawTapes(rc: RenderContext, configs: TapeConfig[], w: number, h: number): void {
  const { ctx, assets } = rc as any;
  const { tapes, fontName } = assets;
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
 * Draw a photo with paper texture and optional tapes
 */
export async function drawPhoto(rc: RenderContext, photoConfig: PhotoLayout) {
  const { ctx, assets, scaling } = rc as any;
  const { sx, sy, ss } = scaling;
  const { file, x, y, w, rot, tapes: photoTapes = [], opacity = 1.0, tint } = photoConfig;
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

  ctx.drawImage(applyPaperTexture(photo, assets.texture, 0.18, scaledW, h), -scaledW / 2, -h / 2);

  drawTapes(rc, photoTapes, scaledW, h);

  ctx.restore();
}

export async function drawSpreadPhoto(
  rc: RenderContext,
  sp: SpreadPhotoLayout,
  scaleX: (x: number) => number,
) {
  const { ctx, assets, scaling } = rc as any;
  const { sy, ss } = scaling;
  const photo = await loadImage(sp.file);
  const { scaledW, scaledH } = spreadPhotoScaledDims(photo, sp, ss);
  const angle = (sp.rot * Math.PI) / 180;

  ctx.save();
  if (sp.opacity !== undefined) ctx.globalAlpha = sp.opacity;

  ctx.translate(scaleX(sp.x), sp.y * sy);
  ctx.rotate(angle);
  if (sp.scaleY !== undefined) ctx.scale(1, sp.scaleY);

  let off = applyPaperTexture(photo, assets.texture, 0.18, scaledW, scaledH);

  if (sp.blur) {
    off = applyGaussianBlur(off, sp.blur * ss);
  }

  (ctx as any).shadowBlur = (sp.shadowBlur ?? 8) * ss;
  (ctx as any).shadowOffsetX = (sp.shadowOffsetX ?? 2) * ss;
  (ctx as any).shadowOffsetY = (sp.shadowOffsetY ?? 4) * sy;
  (ctx as any).shadowColor = sp.shadowColor ?? "rgba(0,0,0,0.22)";

  ctx.drawImage(off, -scaledW / 2, -scaledH / 2);
  ctx.restore();
}

export async function drawSpreadPhotoLabel(
  rc: RenderContext,
  sp: SpreadPhotoLayout,
  scaleX: (x: number) => number,
  colorOverride?: string,
) {
  if (!sp.label) return;
  const { ctx, assets, scaling } = rc;
  const { sy, ss } = scaling;
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
  ctx.fillText(sp.label, (sp.labelOffsetX ?? 0) * ss, (sp.labelOffsetY ?? 0) * ss);
  ctx.restore();
}

export async function drawSpreadPhotoFrame(
  rc: RenderContext,
  sp: SpreadPhotoLayout,
  scaleX: (x: number) => number,
  curSx: number,
  colorOverride?: string,
) {
  if (!sp.showFrame) return;
  const { ctx, scaling } = rc;
  const { sy, ss } = scaling;
  const photo = await loadImage(sp.file);
  const { scaledW, scaledH } = spreadPhotoScaledDims(photo, sp, ss);
  const angle = (sp.rot * Math.PI) / 180;
  const frameColor = colorOverride ?? sp.frameColor ?? COLOR_BLUE;
  const padX = (sp.framePadX ?? -12) * curSx,
    padY = (sp.framePadY ?? -28) * sy;
  const fw = scaledW + padX * 2,
    fh = scaledH + padY * 2;

  ctx.save();
  ctx.translate(scaleX(sp.x), sp.y * sy);
  ctx.rotate(sp.frameSameDir ? angle : angle + Math.PI);
  drawTargetingFrame(ctx, -fw / 2, -fh / 2, fw, fh, frameColor, ss, sp.frameCornersOnly ?? false);
  ctx.restore();
}

export async function drawSpreadPhotoSublabel(
  rc: RenderContext,
  sp: SpreadPhotoLayout,
  scaleX: (x: number) => number,
  curSx: number,
  colorOverride?: string,
) {
  if (!sp.sublabel) return;
  const { ctx, assets, scaling } = rc;
  const { sy, ss } = scaling;
  const photo = await loadImage(sp.file);
  const { scaledW, scaledH } = spreadPhotoScaledDims(photo, sp, ss);
  const angle = (sp.rot * Math.PI) / 180;
  const frameColor = sp.frameColor ?? COLOR_BLUE;
  const padX = (sp.framePadX ?? -12) * curSx,
    padY = (sp.framePadY ?? -28) * sy;
  const fw = scaledW + padX * 2,
    fh = scaledH + padY * 2;

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

export function drawTargetingFrame(
  ctx: any,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  ss = 1.0,
  cornersOnly = false,
  lw?: number,
): void {
  const cLen = Math.round(Math.min(w, h) * 0.22);
  const tick = Math.round(Math.min(w, h) * 0.08);
  const cx = x + w / 2,
    cy = y + h / 2;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.setLineDash([]);

  if (!cornersOnly) {
    ctx.lineWidth = lw ? lw * 0.6 : 1.4 * ss;
    ctx.globalAlpha = 0.65;
    ctx.strokeRect(x, y, w, h);
    ctx.globalAlpha = 1;
  }

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
