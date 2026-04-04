import { createCanvas, loadImage } from "@napi-rs/canvas";
import type { PhotoLayout, LeftText } from "./types";
import { applyPaperTexture } from "./assets";
import type { SharedAssets } from "./assets";
import { drawTapes } from "./render-utils";

export async function renderLeft(
  photos: PhotoLayout[],
  leftTexts: LeftText[] | undefined,
  assets: SharedAssets,
) {
  const { bgLeft, tapes, texture, fontName } = assets;
  const canvas = createCanvas(bgLeft.width, bgLeft.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bgLeft, 0, 0);

  // Render left texts
  if (leftTexts) {
    for (const lt of leftTexts) {
      ctx.font = `${lt.fontSize || 22}px ${fontName}`;
      ctx.letterSpacing = `${lt.letterSpacing || 0}px`;
      ctx.fillStyle = lt.color || "#1a1a1a";
      ctx.fillText(lt.text, lt.x, lt.y);
    }
  }

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

  return canvas;
}
