import { createCanvas } from "@napi-rs/canvas";
import type { PhotoLayout, LeftText, Section, ColumnLayout } from "./types";
import type { SharedAssets } from "./assets";
import { getScaling, drawPhoto, drawHighlightedLine } from "./render-utils";
import { toTraditional, wrapTextLine } from "./text-utils";
import {
  FONT_LEFT_TEXT_DEFAULT,
  FONT_SECTION_DEFAULT,
  COLOR_DEFAULT,
} from "./typography";

export async function renderLeft(
  photos: PhotoLayout[],
  leftTexts: LeftText[] | undefined,
  assets: SharedAssets,
  toTrad = true,
  sections?: Section[],
  columns?: ColumnLayout,
) {
  const { bgLeft, fontName } = assets;
  const canvas = createCanvas(bgLeft.width, bgLeft.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bgLeft, 0, 0);

  const { sx, sy, ss } = getScaling(bgLeft.width, bgLeft.height);

  // ── Legacy leftTexts (fixed-position) ────────────────────────────────────
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

  // ── Column-rendered sections (mirrors render-right multi-column logic) ──
  if (sections?.length && columns) {
    const { count, xStarts, colWidth } = columns;
    const colNextY = Array.from({ length: count }, () => 100 * sy);
    const maxContentY = canvas.height - 60 * sy;
    let col = 0;

    for (const section of sections) {
      const opts = section.options ?? {};
      const fontSize = (opts.fontSize ?? FONT_SECTION_DEFAULT) * ss;
      const color = opts.color ?? COLOR_DEFAULT;
      const lineHeight =
        (opts.lineHeight ?? (opts.fontSize ?? FONT_SECTION_DEFAULT) * 1.4) * ss;
      const bold = opts.bold ?? false;
      const wrapWidth = colWidth[col] * ss;

      ctx.font = `${bold ? "bold " : ""}${fontSize}px ${fontName}`;
      ctx.letterSpacing = `${(opts.letterSpacing ?? 0) * ss}px`;
      ctx.fillStyle = color;

      const gap = (opts.gap ?? 0) * ss;

      while (
        col < count - 1 &&
        colNextY[col] + gap + lineHeight > maxContentY
      ) {
        col++;
        ctx.font = `${bold ? "bold " : ""}${fontSize}px ${fontName}`;
        ctx.letterSpacing = `${(opts.letterSpacing ?? 0) * ss}px`;
      }

      const currentXPos = xStarts[col] * sx;
      let currentY = colNextY[col] + gap;

      const rawLines = section.text.split("\n");
      for (const rawLine of rawLines) {
        const converted = toTrad ? await toTraditional(rawLine) : rawLine;
        const drawLines = wrapTextLine(ctx, converted, wrapWidth);
        for (const line of drawLines) {
          if (opts.highlights?.length || opts.relationArrows?.length) {
            drawHighlightedLine(
              ctx as any,
              line,
              currentXPos,
              currentY,
              fontSize,
              opts.highlights ?? [],
              ss,
              opts.relationArrows,
            );
          } else {
            ctx.fillText(line, currentXPos, currentY);
          }
          currentY += lineHeight;
        }
      }
      colNextY[col] = currentY;
    }
  }

  for (const photoConfig of photos) {
    await drawPhoto(ctx as any, photoConfig, assets, ss, sx, sy);
  }

  return canvas;
}
