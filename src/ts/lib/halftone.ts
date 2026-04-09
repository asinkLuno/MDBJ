import { createCanvas, loadImage } from "@napi-rs/canvas";
import type { RenderContext } from "./context";
import { COLOR_BLUE } from "./typography";
import { applyGaussianBlur } from "./effects";

export async function drawHalftone(
  rc: RenderContext,
  config: {
    file?: string;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    bold?: boolean;
    scaleY?: number;
    color?: string;
    spacing?: number;
    minDotSize?: number;
    maxDotSize?: number;
    opacity?: number;
    blur?: number;
    w: number;
  },
  centerX: number,
  centerY: number,
) {
  const { ctx, assets, scaling } = rc;
  const { ss } = scaling;
  const {
    file,
    text,
    fontSize: fs_ref,
    fontFamily: ff_ref,
    bold,
    scaleY,
    color = COLOR_BLUE,
    spacing = 8,
    minDotSize = 0,
    maxDotSize = 4,
    opacity = 1.0,
    blur,
    w: w_ref,
  } = config;

  let img: any;
  if (text) {
    const fontSize = (fs_ref ?? 120) * ss;
    const fontName = ff_ref ?? assets.fontName;
    const isBold = bold ?? true;
    const sy_val = scaleY ?? 1;
    const font = `${isBold ? "bold " : ""}${fontSize}px "${fontName}"`;
    const off = createCanvas(1, 1);
    const octx = off.getContext("2d");
    octx.font = font;
    const metrics = octx.measureText(text);
    const pad = Math.ceil(fontSize * 0.2);
    const tw = Math.ceil(metrics.width) + pad * 2;
    const th = Math.ceil(fontSize * 1.4 * sy_val) + pad * 2;

    const textCanvas = createCanvas(tw, th);
    const tctx = textCanvas.getContext("2d");
    tctx.font = font;
    tctx.fillStyle = "black";
    tctx.textBaseline = "middle";
    if (scaleY) {
      tctx.scale(1, scaleY);
    }
    const drawY = th / 2 / sy_val;
    tctx.fillText(text, pad, drawY);
    if (isBold) {
      tctx.strokeStyle = "black";
      tctx.lineWidth = fontSize * 0.05;
      tctx.strokeText(text, pad, drawY);
    }
    img = textCanvas;
  } else if (file) {
    img = await loadImage(file);
  } else {
    return;
  }

  const scaledW = Math.round(w_ref * ss);
  const scaledH = Math.round((scaledW * img.height) / img.width);

  let off = createCanvas(scaledW, scaledH);
  const octx = off.getContext("2d");
  octx.drawImage(img as any, 0, 0, scaledW, scaledH);

  if (blur) {
    off = applyGaussianBlur(off, blur * ss);
  }

  const pixels = off.getContext("2d").getImageData(0, 0, scaledW, scaledH).data;

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

export async function drawBackgroundGrid(ctx: any, w: number, h: number, ss: number, config?: any) {
  const color = config?.color ?? "rgb(145, 203, 174)";
  const step = Math.round((config?.step ?? 250) * ss);
  const lineWidth = Math.round((config?.lineWidth ?? 15) * ss);
  const blur = (config?.blur ?? 20) * ss;
  const opacity = config?.opacity ?? 1.0;
  const margin = Math.round((config?.margin ?? 0) * ss);

  const innerW = Math.floor(w - margin * 2);
  const innerH = Math.floor(h - margin * 2);

  if (innerW <= 0 || innerH <= 0) return;

  const bleed = Math.round(blur * 3);
  const offW = innerW + bleed * 2;
  const offH = innerH + bleed * 2;

  let off = createCanvas(offW, offH);
  const octx = off.getContext("2d");

  octx.strokeStyle = config?.halftone ? "black" : color;
  octx.lineWidth = lineWidth;

  for (let x = 0; x <= innerW; x += step) {
    const tx = x + bleed;
    octx.beginPath();
    octx.moveTo(tx, 0);
    octx.lineTo(tx, offH);
    octx.stroke();
  }

  for (let y = 0; y <= innerH; y += step) {
    const ty = y + bleed;
    octx.beginPath();
    octx.moveTo(0, ty);
    octx.lineTo(offW, ty);
    octx.stroke();
  }

  if (blur > 0) {
    off = applyGaussianBlur(off, blur);
  }

  ctx.save();
  ctx.globalAlpha = opacity;

  if (config?.halftone) {
    const pixels = off.getContext("2d").getImageData(0, 0, offW, offH).data;
    const spacing = Math.max(1, Math.round((config.halftone.spacing ?? 10) * ss));
    const minR = (config.halftone.minDotSize ?? 0) * ss;
    const maxR = (config.halftone.maxDotSize ?? 4) * ss;

    ctx.fillStyle = color;
    for (let ly = 0; ly < innerH; ly += spacing) {
      for (let lx = 0; lx < innerW; lx += spacing) {
        const sampleX = Math.floor(lx + bleed);
        const sampleY = Math.floor(ly + bleed);
        const idx = (sampleY * offW + sampleX) * 4;

        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const a = pixels[idx + 3];

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const alpha = a / 255;
        const density = (1 - luminance) * alpha;

        const radius = minR + (maxR - minR) * density;
        if (radius > 0.1) {
          ctx.beginPath();
          ctx.arc(margin + lx, margin + ly, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  } else {
    ctx.drawImage(off, bleed, bleed, innerW, innerH, margin, margin, innerW, innerH);
  }
  ctx.restore();
}
