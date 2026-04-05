import { createCanvas } from "@napi-rs/canvas";
import type { PhotoLayout, LeftText } from "./types";
import type { SharedAssets } from "./assets";
import { getScaling, drawPhoto, drawHighlightedLine } from "./render-utils";
import { toTraditional, wrapTextLine } from "./text-utils";
import { FONT_LEFT_TEXT_DEFAULT, COLOR_DEFAULT } from "./typography";

export async function renderLeft(
  photos: PhotoLayout[],
  leftTexts: LeftText[] | undefined,
  assets: SharedAssets,
  toTrad = true,
) {
  const { bgLeft, fontName } = assets;
  const canvas = createCanvas(bgLeft.width, bgLeft.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bgLeft, 0, 0);

  const { sx, sy, ss } = getScaling(bgLeft.width, bgLeft.height);

  // Render left texts
  if (leftTexts) {
    for (const lt of leftTexts) {
      const fontSize = (lt.fontSize || FONT_LEFT_TEXT_DEFAULT) * ss;
      const lineHeight =
        (lt.lineHeight || (lt.fontSize || FONT_LEFT_TEXT_DEFAULT) * 1.4) * ss;
      const wrapWidth = lt.wrapWidth ? lt.wrapWidth * ss : null;
      ctx.font = `${fontSize}px ${fontName}`;
      ctx.letterSpacing = `${(lt.letterSpacing || 0) * ss}px`;
      ctx.fillStyle = lt.color || COLOR_DEFAULT;

      const rawLines = lt.text.split("\n");
      let currentY = lt.y * sy;
      for (const rawLine of rawLines) {
        const converted = toTrad ? await toTraditional(rawLine) : rawLine;
        const drawLines = wrapWidth
          ? wrapTextLine(ctx, converted, wrapWidth)
          : [converted];
        for (const line of drawLines) {
          if (lt.highlights?.length) {
            drawHighlightedLine(
              ctx as any,
              line,
              lt.x * sx,
              currentY,
              fontSize,
              lt.highlights,
              ss,
            );
          } else {
            ctx.fillText(line, lt.x * sx, currentY);
          }
          currentY += lineHeight;
        }
      }
    }
  }

  for (const photoConfig of photos) {
    await drawPhoto(ctx as any, photoConfig, assets, ss, sx, sy);
  }

  return canvas;
}
