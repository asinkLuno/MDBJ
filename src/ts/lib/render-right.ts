import { createCanvas } from "@napi-rs/canvas";
import type { Section, PhotoLayout, ColumnLayout } from "./types";
import type { SharedAssets } from "./assets";
import {
  getScaling,
  drawPhoto,
  drawHighlightedLine,
  drawBackgroundGrid,
} from "./render-utils";
import { renderColumnSections } from "./render-sections";
import { toTraditional, wrapTextLine } from "./text-utils";
import { FONT_SECTION_DEFAULT, COLOR_BLUE } from "./typography";

export async function renderRight(
  sections: Section[],
  assets: SharedAssets,
  toTrad = true,
  photos?: PhotoLayout[],
  columns?: ColumnLayout,
  bgColor?: string,
  backgroundGrid?: any, // Removed local drawing
  colorFilter?: (color: string) => boolean,
) {
  const { bgRight, fontName } = assets;
  const canvas = createCanvas(bgRight.width, bgRight.height);
  const ctx = canvas.getContext("2d");

  if (bgColor === "transparent") {
    // Skip background drawing
  } else if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (!colorFilter) {
    ctx.drawImage(bgRight, 0, 0);
  }

  const { sx, sy, ss } = getScaling(bgRight.width, bgRight.height);

  if (photos && !colorFilter) {
    for (const photoConfig of photos) {
      await drawPhoto(ctx as any, photoConfig, assets, ss, sx, sy);
    }
  }

  if (columns) {
    // ── Multi-column mode ─────────────────────────────────────────────────
    const effectiveColumns = {
      ...columns,
      maxHeight: columns.maxHeight ?? canvas.height / sy - 35,
    };
    await renderColumnSections(
      ctx as any,
      sections,
      effectiveColumns,
      sx,
      sy,
      ss,
      fontName,
      toTrad,
      colorFilter,
    );
  } else {
    // ── Single-column mode ──────────────────────────────────────────────
    let nextY = 100 * sy;

    for (const section of sections) {
      const opts = section.options ?? {};
      const color = opts.color ?? COLOR_BLUE;

      if (colorFilter && !colorFilter(color)) {
        // We still need to calculate nextY to keep layout consistent?
        // Actually, in single column mode, if we skip rendering, nextY might be wrong.
        // But for RISO layers, we probably WANT the same layout.
        // Let's just calculate layout but skip fillText.
      }

      const fontSize = (opts.fontSize ?? FONT_SECTION_DEFAULT) * ss;
      const lineHeight =
        (opts.lineHeight ?? (opts.fontSize ?? FONT_SECTION_DEFAULT) * 1.4) * ss;
      const bold = opts.bold ?? false;
      const wrapWidth = opts.wrapWidth ? opts.wrapWidth * ss : null;
      const curFont = opts.fontFamily ?? fontName;

      ctx.font = `${bold ? "bold " : ""}${fontSize}px ${curFont}`;
      ctx.letterSpacing = `${(opts.letterSpacing ?? 0) * ss}px`;
      ctx.fillStyle = color;

      if (opts.blur) {
        (ctx as any).filter = `blur(${opts.blur * ss}px)`;
      }

      const rawLines = section.text.split("\n");
      let currentY = opts.y ? opts.y * sy : nextY + (opts.gap ?? 0) * ss;

      for (const rawLine of rawLines) {
        const converted = toTrad ? await toTraditional(rawLine) : rawLine;
        const drawLines = wrapWidth
          ? wrapTextLine(ctx, converted, wrapWidth)
          : [converted];
        for (const line of drawLines) {
          let xPos = (opts.x ?? 50) * sx;
          if (opts.textAlign === "center") {
            xPos -= ctx.measureText(line).width / 2;
          } else if (opts.textAlign === "right") {
            xPos -= ctx.measureText(line).width;
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
              colorFilter,
              color,
            );
          } else {
            if (!colorFilter || colorFilter(color)) {
              if (bold) {
                ctx.save();
                ctx.globalAlpha = 0.4;
                ctx.fillText(line, xPos - 0.5, currentY);
                ctx.fillText(line, xPos + 0.5, currentY);
                ctx.restore();
              }
              ctx.fillText(line, xPos, currentY);
            }
          }
          currentY += lineHeight;
        }
      }

      if (opts.blur) {
        (ctx as any).filter = "none";
      }

      nextY = currentY;
    }
  }

  return canvas;
}
