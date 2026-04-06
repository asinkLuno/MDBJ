import { createCanvas } from "@napi-rs/canvas";
import type { PhotoLayout, LeftText, Section, ColumnLayout } from "./types";
import type { SharedAssets } from "./assets";
import { getScaling, drawPhoto, drawHighlightedLine } from "./render-utils";
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
) {
  const { bgLeft, fontName } = assets;
  const canvas = createCanvas(bgLeft.width, bgLeft.height);
  const ctx = canvas.getContext("2d");

  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.drawImage(bgLeft, 0, 0);
  }

  const { sx, sy, ss } = getScaling(bgLeft.width, bgLeft.height);

  // ── Legacy leftTexts (fixed-position) ────────────────────────────────────
  if (leftTexts) {
    for (const lt of leftTexts) {
      const fontSize = (lt.fontSize || FONT_LEFT_TEXT_DEFAULT) * ss;
      const lineHeight =
        (lt.lineHeight || (lt.fontSize || FONT_LEFT_TEXT_DEFAULT) * 1.4) * ss;
      const wrapWidth = lt.wrapWidth ? lt.wrapWidth * ss : null;
      const curFont = lt.fontFamily ?? fontName;
      ctx.font = `${lt.bold ? "bold " : ""}${fontSize}px "${curFont}"`;
      ctx.letterSpacing = `${(lt.letterSpacing || 0) * ss}px`;
      ctx.fillStyle = lt.color || COLOR_BLUE;

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
            );
          } else {
            ctx.fillText(line, xPos, currentY);
          }
          currentY += lineHeight;
        }
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
    );
  }

  for (const photoConfig of photos) {
    await drawPhoto(ctx as any, photoConfig, assets, ss, sx, sy);
  }

  return canvas;
}
