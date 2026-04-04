import { createCanvas, loadImage } from "@napi-rs/canvas";
import OpenCC from "opencc";
import type { Section, PhotoLayout } from "./types";
import type { SharedAssets } from "./assets";
import { applyPaperTexture, drawTapes } from "./render-utils";
import { FONT_SECTION_DEFAULT, COLOR_DEFAULT } from "./typography";

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

  // Reference dimensions from original field notes
  const REF_W = 680;
  const REF_H = 1036;
  const sx = bgRight.width / REF_W;
  const sy = bgRight.height / REF_H;
  const ss = Math.min(sx, sy); // scale for font/width

  // Draw photos if any
  if (photos) {
    for (const photoConfig of photos) {
      const { file, x, y, w, rot, tapes: photoTapes = [] } = photoConfig;
      const photo = await loadImage(file);
      const scaledW = w * ss;
      const h = Math.round((scaledW * photo.height) / photo.width);

      const scaledX = x * sx;
      const scaledY = y * sy;

      const angle = (rot * Math.PI) / 180;

      ctx.save();
      ctx.translate(scaledX + scaledW / 2, scaledY + h / 2);
      ctx.rotate(angle);

      ctx.drawImage(
        applyPaperTexture(photo, texture, 0.18, scaledW, h),
        -scaledW / 2,
        -h / 2,
      );

      drawTapes(ctx, tapes, photoTapes, scaledW, h, fontName);

      ctx.restore();
    }
  }

  let nextY = 100 * sy;

  for (const section of sections) {
    const opts = section.options || {};
    const fontSize = (opts.fontSize || FONT_SECTION_DEFAULT) * ss;
    const color = opts.color || COLOR_DEFAULT;
    const lineHeight =
      (opts.lineHeight || (opts.fontSize || FONT_SECTION_DEFAULT) * 1.4) * ss;
    const bold = opts.bold ?? false;

    ctx.font = `${fontSize}px ${fontName}`;
    ctx.letterSpacing = `${(opts.letterSpacing ?? 0) * ss}px`;
    ctx.fillStyle = color;

    const lines = section.text.split("\n");
    let currentY = opts.y ? opts.y * sy : nextY + (opts.gap || 0) * ss;
    const xPos = (opts.x || 50) * sx;

    for (const line of lines) {
      const text = toTraditional ? await toTrad(line) : line;
      if (bold) {
        ctx.globalAlpha = 0.4;
        ctx.fillText(text, xPos - 0.5, currentY);
        ctx.fillText(text, xPos + 0.5, currentY);
        ctx.globalAlpha = 1;
      }
      ctx.fillText(text, xPos, currentY);
      currentY += lineHeight;
    }
    nextY = currentY;
  }

  return canvas;
}
