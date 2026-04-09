import { createCanvas } from "@napi-rs/canvas";
import type { Canvas } from "@napi-rs/canvas";
import type { PageHalfConfig } from "./types";
import { renderColumnSections } from "./render-sections";
import { drawPhoto } from "./photo-renderer";
import { drawHalftone } from "./halftone";
import { drawHighlightedLine } from "./annotations";
import type { RenderContext } from "./context";
import { FONT_SECTION_DEFAULT, COLOR_BLUE } from "./typography";
import { toTraditional, wrapTextLine } from "./text-utils";

export async function renderPageHalf(
  config: PageHalfConfig | undefined,
  rc: RenderContext,
  side: "left" | "right",
  bgImage?: any,
): Promise<Canvas> {
  const { assets, scaling, colorFilter, toTrad } = rc;
  const { sx, sy, ss } = scaling;
  const { bgLeft, bgRight, fontName } = assets;
  const bg = side === "left" ? bgLeft : bgRight;

  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext("2d");

  if (!config) {
    if (!colorFilter) {
      ctx.drawImage(bg, 0, 0);
    }
    return canvas;
  }

  // Background drawing
  if (config.bgColor === "transparent") {
    // Skip
  } else if (config.bgColor) {
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (!colorFilter) {
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0);
    } else {
      ctx.drawImage(bg, 0, 0);
    }
  }

  // Pass a temporary RenderContext with the local ctx
  const localRC: RenderContext = { ...rc, ctx: ctx as any };

  // 1. Sections
  if (config.sections?.length) {
    if (config.columns) {
      const effectiveColumns = {
        ...config.columns,
        maxHeight: config.columns.maxHeight ?? canvas.height / sy - 35,
      };
      await renderColumnSections(localRC, config.sections, effectiveColumns);
    } else {
      // Free-positioning / Single-column mode fallback
      let nextY = 100 * sy;
      for (const section of config.sections) {
        const opts = section.options ?? {};
        const color = opts.color ?? COLOR_BLUE;
        const fontSize = (opts.fontSize ?? FONT_SECTION_DEFAULT) * ss;
        const lineHeight = (opts.lineHeight ?? (opts.fontSize ?? FONT_SECTION_DEFAULT) * 1.4) * ss;
        const bold = opts.bold ?? false;
        const wrapWidth = opts.wrapWidth ? opts.wrapWidth * ss : null;
        const curFont = opts.fontFamily ?? fontName;

        ctx.font = `${bold ? "bold " : ""}${fontSize}px "${curFont}"`;
        (ctx as any).letterSpacing = `${(opts.letterSpacing ?? 0) * ss}px`;
        ctx.fillStyle = color;

        if (opts.blur) {
          (ctx as any).filter = `blur(${opts.blur * ss}px)`;
        }

        const rawLines = section.text.split("\n");
        let currentY = opts.y ? opts.y * sy : nextY + (opts.gap ?? 0) * ss;

        for (const rawLine of rawLines) {
          const converted = toTrad ? await toTraditional(rawLine) : rawLine;
          const drawLines = wrapWidth
            ? wrapTextLine(ctx as any, converted, wrapWidth)
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
                localRC,
                line,
                xPos,
                currentY,
                fontSize,
                opts.highlights ?? [],
                opts.relationArrows,
                opts.dotHighlights,
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
  }

  // 2. Photos
  if (config.photos) {
    for (const photoConfig of config.photos) {
      if (colorFilter) continue;
      await drawPhoto(localRC, photoConfig);
    }
  }

  // 3. Halftones
  if (config.halftones) {
    for (const ht of config.halftones) {
      await drawHalftone(localRC, ht, ht.x * sx, ht.y * sy);
    }
  }

  return canvas;
}
