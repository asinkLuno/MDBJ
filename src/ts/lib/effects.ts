import { createCanvas } from "@napi-rs/canvas";
import type { Canvas, Image } from "@napi-rs/canvas";

/**
 * A fast 1D box blur.
 */
function boxBlur1D(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  radius: number,
  horizontal: boolean,
) {
  const weight = 2 * radius + 1;
  for (let i = 0; i < (horizontal ? h : w); i++) {
    let r = 0,
      g = 0,
      b = 0,
      a = 0;
    for (let j = -radius; j <= radius; j++) {
      const pos = Math.min(Math.max(j, 0), (horizontal ? w : h) - 1);
      const idx = (horizontal ? i * w + pos : pos * w + i) * 4;
      r += src[idx];
      g += src[idx + 1];
      b += src[idx + 2];
      a += src[idx + 3];
    }
    for (let j = 0; j < (horizontal ? w : h); j++) {
      const idx = (horizontal ? i * w + j : j * w + i) * 4;
      dst[idx] = r / weight;
      dst[idx + 1] = g / weight;
      dst[idx + 2] = b / weight;
      dst[idx + 3] = a / weight;

      const prevPos = Math.min(Math.max(j - radius, 0), (horizontal ? w : h) - 1);
      const nextPos = Math.min(Math.max(j + radius + 1, 0), (horizontal ? w : h) - 1);
      const prevIdx = (horizontal ? i * w + prevPos : prevPos * w + i) * 4;
      const nextIdx = (horizontal ? i * w + nextPos : nextPos * w + i) * 4;

      r += src[nextIdx] - src[prevIdx];
      g += src[nextIdx + 1] - src[prevIdx + 1];
      b += src[nextIdx + 2] - src[prevIdx + 2];
      a += src[nextIdx + 3] - src[prevIdx + 3];
    }
  }
}

/**
 * Approximate Gaussian blur using 3 passes of box blur.
 */
export function applyGaussianBlur(canvas: Canvas, sigma: number) {
  if (sigma <= 0) return canvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const src = imageData.data;
  const dst = new Uint8ClampedArray(src.length);

  const r = Math.floor(Math.sqrt((12 * sigma * sigma) / 3 + 1));
  const radius = Math.max(1, Math.floor((r - 1) / 2));

  for (let pass = 0; pass < 3; pass++) {
    boxBlur1D(src, dst, w, h, radius, true);
    src.set(dst);
    boxBlur1D(src, dst, w, h, radius, false);
    src.set(dst);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

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
