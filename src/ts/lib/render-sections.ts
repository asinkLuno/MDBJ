import type { CanvasRenderingContext2D } from "@napi-rs/canvas";
import type { Section, ColumnLayout } from "./types";
import { drawHighlightedLine } from "./render-utils";
import { toTraditional, wrapTextLine } from "./text-utils";
import { FONT_SECTION_DEFAULT, COLOR_DEFAULT } from "./typography";

/**
 * Flow-render sections into a multi-column layout on an existing canvas context.
 *
 * Coordinates are in REF-unit space: xStarts / colWidth are multiplied by sx,
 * vertical positions by sy, font sizes / line heights by ss (= min(sx, sy)).
 *
 * This is the single implementation used by renderLeft, renderRight, and the
 * full-spread renderer in build.ts.
 */
export async function renderColumnSections(
  ctx: CanvasRenderingContext2D,
  sections: Section[],
  columns: ColumnLayout,
  sx: number,
  sy: number,
  ss: number,
  fontName: string,
  toTrad: boolean,
): Promise<void> {
  const { count, xStarts, colWidth, maxHeight, startY: startYRef } = columns;
  const colNextY = Array.from({ length: count }, () => (startYRef ?? 40) * sy);
  const maxContentY = maxHeight != null ? maxHeight * sy : Infinity;
  let col = 0;

  for (const section of sections) {
    const opts = section.options ?? {};
    const fontSize = (opts.fontSize ?? FONT_SECTION_DEFAULT) * ss;
    const color = opts.color ?? COLOR_DEFAULT;
    const lineHeight =
      (opts.lineHeight ?? (opts.fontSize ?? FONT_SECTION_DEFAULT) * 1.4) * ss;
    const bold = opts.bold ?? false;
    const curFont = opts.fontFamily ?? fontName;

    ctx.font = `${bold ? "bold " : ""}${fontSize}px "${curFont}"`;
    (ctx as any).letterSpacing = `${(opts.letterSpacing ?? 0) * ss}px`;
    ctx.fillStyle = color;

    const gap = (opts.gap ?? 0) * ss;

    // Advance to next column if current is full
    while (col < count - 1 && colNextY[col] + gap + lineHeight > maxContentY) {
      col++;
      ctx.font = `${bold ? "bold " : ""}${fontSize}px "${curFont}"`;
      (ctx as any).letterSpacing = `${(opts.letterSpacing ?? 0) * ss}px`;
    }

    const currentXPos = xStarts[col] * sx;
    let currentY = colNextY[col] + gap;
    const wrapWidth = colWidth[col] * ss;

    const rawLines = section.text.split("\n");
    for (const rawLine of rawLines) {
      const converted = toTrad ? await toTraditional(rawLine) : rawLine;
      const drawLines = wrapTextLine(ctx as any, converted, wrapWidth);
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
}
