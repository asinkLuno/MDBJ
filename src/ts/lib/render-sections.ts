import type { Section, ColumnLayout } from "./types";
import { drawHighlightedLine } from "./render-utils";
import { toTraditional, wrapTextLine } from "./text-utils";
import { FONT_SECTION_DEFAULT, COLOR_BLUE } from "./typography";
import type { RenderContext } from "./context";

/**
 * Flow-render sections into a multi-column layout on an existing canvas context.
 */
export async function renderColumnSections(
  rc: RenderContext,
  sections: Section[],
  columns: ColumnLayout,
): Promise<void> {
  const { ctx, assets, scaling, toTrad, colorFilter } = rc;
  const { sx, sy, ss } = scaling;
  const { fontName } = assets;

  const { count, xStarts, colWidth, maxHeight, startY: startYRef } = columns;
  const colNextY = Array.from({ length: count }, () => (startYRef ?? 40) * sy);
  const maxContentY = maxHeight != null ? maxHeight * sy : Infinity;
  let col = 0;

  for (const section of sections) {
    const opts = section.options ?? {};
    const fontSize = (opts.fontSize ?? FONT_SECTION_DEFAULT) * ss;
    const color = opts.color ?? COLOR_BLUE;
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

    const currentXPos = (xStarts[col] + (opts.x ?? 0)) * sx;
    let currentY = colNextY[col] + gap + (opts.y ?? 0) * sy;
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
            rc,
            line,
            currentXPos,
            currentY,
            fontSize,
            opts.highlights ?? [],
            opts.relationArrows,
            opts.dotHighlights,
            color,
          );
        } else {
          if (!colorFilter || colorFilter(color)) {
            ctx.fillText(line, currentXPos, currentY);
          }
        }
        currentY += lineHeight;
      }
    }
    colNextY[col] = currentY - (opts.y ?? 0) * sy;
  }
}
