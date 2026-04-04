import { createCanvas, loadImage } from "@napi-rs/canvas";
import OpenCC from "opencc";
import type { Section, PhotoLayout } from "./types";
import { applyPaperTexture } from "./assets";
import type { SharedAssets } from "./assets";
import { drawTapes } from "./render-utils";

const converter = new OpenCC("s2t.json");

async function toTrad(s: string): Promise<string> {
  return converter.convertPromise(s);
}

export async function renderRight(
  sections: Section[],
  assets: SharedAssets,
  toTraditional = true,
  photos?: PhotoLayout[],
) {
  const { bgRight, fontName, texture, tapes } = assets;
  const canvas = createCanvas(bgRight.width, bgRight.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bgRight, 0, 0);

  // Draw photos if any
  if (photos) {
    for (const photoConfig of photos) {
      const { file, x, y, w, rot, tapes: photoTapes = [] } = photoConfig;
      const photo = await loadImage(file);
      const h = Math.round((w * photo.height) / photo.width);
      const cx = x + w / 2;
      const cy = y + h / 2;
      const angle = (rot * Math.PI) / 180;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.drawImage(
        applyPaperTexture(photo, texture, 0.18, w, h),
        -w / 2,
        -h / 2,
      );

      drawTapes(ctx, tapes, photoTapes, w, h, fontName);

      ctx.restore();
    }
  }

  let nextY = 100;

  for (const section of sections) {
    const opts = section.options || {};
    const fontSize = opts.fontSize || 26;
    const color = opts.color || "#1a1a1a";
    const lineHeight = opts.lineHeight || fontSize * 1.4;
    const bold = opts.bold ?? false;

    ctx.font = `${fontSize}px ${fontName}`;
    ctx.letterSpacing = `${opts.letterSpacing ?? 0}px`;
    ctx.fillStyle = color;

    const lines = section.text.split("\n");
    let currentY = opts.y ?? nextY + (opts.gap ?? 0);

    for (const line of lines) {
      const text = toTraditional ? await toTrad(line) : line;
      if (bold) {
        ctx.globalAlpha = 0.4;
        ctx.fillText(text, (opts.x || 50) - 0.5, currentY);
        ctx.fillText(text, (opts.x || 50) + 0.5, currentY);
        ctx.globalAlpha = 1;
      }
      ctx.fillText(text, opts.x || 50, currentY);
      currentY += lineHeight;
    }
    nextY = currentY;
  }

  return canvas;
}
