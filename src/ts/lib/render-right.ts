import { createCanvas } from "@napi-rs/canvas";
import type { Section, PhotoLayout } from "./types";
import type { SharedAssets } from "./assets";
import { getScaling, drawPhoto, drawHighlightedLine } from "./render-utils";
import { toTraditional, wrapTextLine } from "./text-utils";
import { FONT_SECTION_DEFAULT, COLOR_DEFAULT } from "./typography";

export async function renderRight(
  sections: Section[],
  assets: SharedAssets,
  toTrad = true,
  photos?: PhotoLayout[],
) {
  const { bgRight, fontName } = assets;
  const canvas = createCanvas(bgRight.width, bgRight.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bgRight, 0, 0);

  const { sx, sy, ss } = getScaling(bgRight.width, bgRight.height);

  // Draw photos if any
  if (photos) {
    for (const photoConfig of photos) {
      await drawPhoto(ctx as any, photoConfig, assets, ss, sx, sy);
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
    const wrapWidth = opts.wrapWidth ? opts.wrapWidth * ss : null;

    ctx.font = `${fontSize}px ${fontName}`;
    ctx.letterSpacing = `${(opts.letterSpacing ?? 0) * ss}px`;
    ctx.fillStyle = color;

    const rawLines = section.text.split("\n");
    let currentY = opts.y ? opts.y * sy : nextY + (opts.gap || 0) * ss;
    const xPos = (opts.x || 50) * sx;

    for (const rawLine of rawLines) {
      const converted = toTrad ? await toTraditional(rawLine) : rawLine;
      const drawLines = wrapWidth
        ? wrapTextLine(ctx, converted, wrapWidth)
        : [converted];
      for (const line of drawLines) {
        if (bold) {
          ctx.globalAlpha = 0.4;
          ctx.fillText(line, xPos - 0.5, currentY);
          ctx.fillText(line, xPos + 0.5, currentY);
          ctx.globalAlpha = 1;
        }
        if (opts.highlights?.length) {
          drawHighlightedLine(
            ctx as any,
            line,
            xPos,
            currentY,
            fontSize,
            opts.highlights,
            ss,
          );
        } else {
          ctx.fillText(line, xPos, currentY);
        }
        currentY += lineHeight;
      }
    }
    nextY = currentY;
  }

  return canvas;
}
