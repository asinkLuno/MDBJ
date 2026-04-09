import { createCanvas } from "@napi-rs/canvas";
import type {
  PhotoLayout,
  LeftText,
  Section,
  ColumnLayout,
  HalftoneConfig,
} from "./types";
import type { SharedAssets } from "./assets";
import {
  getScaling,
  drawPhoto,
  drawHighlightedLine,
  drawHalftone,
  drawBackgroundGrid,
} from "./render-utils";
import { renderColumnSections } from "./render-sections";
import { toTraditional, wrapTextLine } from "./text-utils";
import { FONT_LEFT_TEXT_DEFAULT, COLOR_BLUE } from "./typography";

export async function renderLeft(
  photos: PhotoLayout[],
  leftTexts: LeftText[] | undefined,
  assets: SharedAssets,
  toTrad = true,
  sections?: Section[],
  columns?: ColumnLayout,
  bgColor?: string,
  halftones?: HalftoneConfig[],
  backgroundGrid?: any, // Removed local drawing
  colorFilter?: (color: string) => boolean,
) {
  const { bgLeft, fontName } = assets;
  const canvas = createCanvas(bgLeft.width, bgLeft.height);
  const ctx = canvas.getContext("2d");

  if (bgColor === "transparent") {
    // Skip background drawing
  } else if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (!colorFilter) {
    ctx.drawImage(bgLeft, 0, 0);
  }

  const { sx, sy, ss } = getScaling(bgLeft.width, bgLeft.height);

  // ── Legacy leftTexts (fixed-position) ────────────────────────────────────
  if (leftTexts) {
    for (const lt of leftTexts) {
      const itemColor = lt.color || COLOR_BLUE;
      if (colorFilter && !colorFilter(itemColor)) continue;

      const fontSize = (lt.fontSize || FONT_LEFT_TEXT_DEFAULT) * ss;
      const lineHeight =
        (lt.lineHeight || (lt.fontSize || FONT_LEFT_TEXT_DEFAULT) * 1.4) * ss;
      const wrapWidth = lt.wrapWidth ? lt.wrapWidth * ss : null;
      const curFont = lt.fontFamily ?? fontName;
      ctx.font = `${lt.bold ? "bold " : ""}${fontSize}px "${curFont}"`;
      ctx.letterSpacing = `${(lt.letterSpacing || 0) * ss}px`;
      ctx.fillStyle = itemColor;

      if (lt.blur) {
        (ctx as any).filter = `blur(${lt.blur * ss}px)`;
      }

      const rawLines = lt.text.split("\n");
      let currentY = lt.y * sy;
      for (const rawLine of rawLines) {
        const converted = toTrad ? await toTraditional(rawLine) : rawLine;
        const drawLines = wrapWidth
          ? wrapTextLine(ctx, converted, wrapWidth)
          : [converted];
        for (const line of drawLines) {
          let xPos = lt.x * sx;
          if (lt.textAlign === "center") {
            xPos -= ctx.measureText(line).width / 2;
          } else if (lt.textAlign === "right") {
            xPos -= ctx.measureText(line).width;
          }

          if (lt.highlights?.length) {
            drawHighlightedLine(
              ctx as any,
              line,
              xPos,
              currentY,
              fontSize,
              lt.highlights,
              ss,
              undefined,
              undefined,
              colorFilter,
              itemColor,
            );
          } else {
            if (!colorFilter || colorFilter(itemColor)) {
              ctx.fillText(line, xPos, currentY);
            }
          }
          currentY += lineHeight;
        }
      }

      if (lt.blur) {
        (ctx as any).filter = "none";
      }
    }
  }

  // ── Column-rendered sections ─────────────────────────────────────────────
  if (sections?.length && columns) {
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
  }

  for (const photoConfig of photos) {
    if (colorFilter) continue;
    await drawPhoto(ctx as any, photoConfig, assets, ss, sx, sy);
  }

  if (halftones) {
    for (const ht of halftones) {
      const itemColor = ht.color || COLOR_BLUE;
      if (colorFilter && !colorFilter(itemColor)) continue;
      let source: string | any = ht.file;

      if (ht.text) {
        const fontSize = (ht.fontSize ?? 120) * ss;
        const curFontFamily = ht.fontFamily ?? fontName;
        const isBold = ht.bold ?? true;
        const sy = ht.scaleY ?? 1;
        const font = `${isBold ? "bold " : ""}${fontSize}px "${curFontFamily}"`;
        const off = createCanvas(1, 1);
        const octx = off.getContext("2d");
        octx.font = font;
        const metrics = octx.measureText(ht.text);
        const w = Math.ceil(metrics.width);
        const h = Math.ceil(fontSize * 1.4 * sy);

        const textCanvas = createCanvas(w, h);
        const tctx = textCanvas.getContext("2d");
        tctx.font = font;
        tctx.fillStyle = "black";
        tctx.textBaseline = "middle";
        if (ht.scaleY) {
          tctx.scale(1, ht.scaleY);
        }
        const drawY = h / 2 / sy;
        tctx.fillText(ht.text, 0, drawY);
        if (isBold) {
          tctx.strokeStyle = "black";
          tctx.lineWidth = fontSize * 0.05;
          tctx.strokeText(ht.text, 0, drawY);
        }
        source = textCanvas;
      }
      await drawHalftone(
        ctx as any,
        source,
        ht.x * sx,
        ht.y * sy,
        ht.w,
        ht.color,
        ht.spacing,
        ht.minDotSize,
        ht.maxDotSize,
        ht.opacity,
        ss,
        ht.blur,
      );
    }
  }

  return canvas;
}
