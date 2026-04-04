import { createCanvas, loadImage } from "@napi-rs/canvas";
import type { PhotoLayout, LeftText } from "./types";
import type { SharedAssets } from "./assets";
import { applyPaperTexture, drawTapes } from "./render-utils";
import { FONT_LEFT_TEXT_DEFAULT, COLOR_DEFAULT } from "./typography";

export async function renderLeft(
  photos: PhotoLayout[],
  leftTexts: LeftText[] | undefined,
  assets: SharedAssets,
) {
  const { bgLeft, tapes, texture, fontName } = assets;
  const canvas = createCanvas(bgLeft.width, bgLeft.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bgLeft, 0, 0);

  // Reference dimensions from original field notes
  const REF_W = 680;
  const REF_H = 1036;
  const sx = bgLeft.width / REF_W;
  const sy = bgLeft.height / REF_H;
  const ss = Math.min(sx, sy); // scale for font/width

  // Render left texts
  if (leftTexts) {
    for (const lt of leftTexts) {
      const fontSize = (lt.fontSize || FONT_LEFT_TEXT_DEFAULT) * ss;
      ctx.font = `${fontSize}px ${fontName}`;
      ctx.letterSpacing = `${(lt.letterSpacing || 0) * ss}px`;
      ctx.fillStyle = lt.color || COLOR_DEFAULT;
      ctx.fillText(lt.text, lt.x * sx, lt.y * sy);
    }
  }

  for (const photoConfig of photos) {
    const { file, x, y, w, rot, tapes: photoTapes = [] } = photoConfig;
    const photo = await loadImage(file);
    const scaledW = w * ss;
    const h = Math.round((scaledW * photo.height) / photo.width);
    const cx = (x + w / 2) * sx;
    const cy = (y + h / (2 * ss)) * sy; // adjust center y for scaling
    // Actually, it's easier to scale x and y directly as the top-left corner
    // and then use the scaled width.
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

  return canvas;
}
