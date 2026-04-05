import { createCanvas } from "@napi-rs/canvas";
import type { Section, PhotoLayout, ColumnLayout } from "./types";
import type { SharedAssets } from "./assets";
import { getScaling, drawPhoto, drawHighlightedLine } from "./render-utils";
import { toTraditional, wrapTextLine } from "./text-utils";
import { FONT_SECTION_DEFAULT, COLOR_DEFAULT } from "./typography";

export async function renderRight(
  sections: Section[],
  assets: SharedAssets,
  toTrad = true,
  photos?: PhotoLayout[],
  columns?: ColumnLayout,
) {
  const { bgRight, fontName } = assets;
  const canvas = createCanvas(bgRight.width, bgRight.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bgRight, 0, 0);

  const { sx, sy, ss } = getScaling(bgRight.width, bgRight.height);

  if (photos) {
    for (const photoConfig of photos) {
      await drawPhoto(ctx as any, photoConfig, assets, ss, sx, sy);
    }
  }

  const maxContentY = canvas.height - 60 * sy;

  if (columns) {
    // ── Multi-column mode ─────────────────────────────────────────────────
    const { count, xStarts, colWidth } = columns;
    const colNextY = Array.from({ length: count }, () => 100 * sy);
    let col = 0;

    for (const section of sections) {
      const opts = section.options ?? {};
      const fontSize = (opts.fontSize ?? FONT_SECTION_DEFAULT) * ss;
      const color = opts.color ?? COLOR_DEFAULT;
      const lineHeight =
        (opts.lineHeight ?? (opts.fontSize ?? FONT_SECTION_DEFAULT) * 1.4) * ss;
      const bold = opts.bold ?? false;
      const wrapWidth = colWidth[col] * ss;
      const curFont = opts.fontFamily ?? fontName;

      ctx.font = `${bold ? "bold " : ""}${fontSize}px ${curFont}`;
      ctx.letterSpacing = `${(opts.letterSpacing ?? 0) * ss}px`;
      ctx.fillStyle = color;

      const gap = (opts.gap ?? 0) * ss;

      // Advance column if current one is full
      while (
        col < count - 1 &&
        colNextY[col] + gap + lineHeight > maxContentY
      ) {
        col++;
        ctx.font = `${bold ? "bold " : ""}${fontSize}px ${curFont}`;
        ctx.letterSpacing = `${(opts.letterSpacing ?? 0) * ss}px`;
      }

      const currentXPos = xStarts[col] * sx;
      let currentY = colNextY[col] + gap;

      const rawLines = section.text.split("\n");
      for (const rawLine of rawLines) {
        const converted = toTrad ? await toTraditional(rawLine) : rawLine;
        const drawLines = wrapTextLine(ctx, converted, wrapWidth);
        for (const line of drawLines) {
          if (
            opts.highlights?.length ||
            opts.relationArrows?.length ||
            opts.dotHighlights?.length
          ) {
            drawHighlightedLine(
              ctx as any,
              line,
              currentXPos,
              currentY,
              fontSize,
              opts.highlights ?? [],
              ss,
              opts.relationArrows,
              opts.dotHighlights,
            );
          } else {
            ctx.fillText(line, currentXPos, currentY);
          }
          currentY += lineHeight;
        }
      }
      colNextY[col] = currentY;
    }
  } else {
    // ── Single-column mode ──────────────────────────────────────────────
    let nextY = 100 * sy;

    for (const section of sections) {
      const opts = section.options ?? {};
      const fontSize = (opts.fontSize ?? FONT_SECTION_DEFAULT) * ss;
      const color = opts.color ?? COLOR_DEFAULT;
      const lineHeight =
        (opts.lineHeight ?? (opts.fontSize ?? FONT_SECTION_DEFAULT) * 1.4) * ss;
      const bold = opts.bold ?? false;
      const wrapWidth = opts.wrapWidth ? opts.wrapWidth * ss : null;
      const curFont = opts.fontFamily ?? fontName;

      ctx.font = `${bold ? "bold " : ""}${fontSize}px ${curFont}`;
      ctx.letterSpacing = `${(opts.letterSpacing ?? 0) * ss}px`;
      ctx.fillStyle = color;

      const rawLines = section.text.split("\n");
      let currentY = opts.y ? opts.y * sy : nextY + (opts.gap ?? 0) * ss;
      const xPos = (opts.x ?? 50) * sx;

      for (const rawLine of rawLines) {
        const converted = toTrad ? await toTraditional(rawLine) : rawLine;
        const drawLines = wrapWidth
          ? wrapTextLine(ctx, converted, wrapWidth)
          : [converted];
        for (const line of drawLines) {
          if (bold) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillText(line, xPos - 0.5, currentY);
            ctx.fillText(line, xPos + 0.5, currentY);
            ctx.restore();
          }
          if (
            opts.highlights?.length ||
            opts.relationArrows?.length ||
            opts.dotHighlights?.length
          ) {
            drawHighlightedLine(
              ctx as any,
              line,
              xPos,
              currentY,
              fontSize,
              opts.highlights ?? [],
              ss,
              opts.relationArrows,
              opts.dotHighlights,
            );
          } else {
            ctx.fillText(line, xPos, currentY);
          }
          currentY += lineHeight;
        }
      }
      nextY = currentY;
    }
  }

  return canvas;
}
