import { createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import * as path from "path";
import sharp from "sharp";
import { loadSharedAssets } from "./lib/assets";
import { pages } from "./pages";
import { renderLeft } from "./lib/render-left";
import { renderRight } from "./lib/render-right";
import { renderColumnSections } from "./lib/render-sections";
import { COLOR_BLUE, COLOR_BLACK, COLOR_BG_BLUE_TRANS } from "./lib/typography";
import {
  getScaling,
  REF_W,
  drawHalftone,
  drawSpreadPhotoLabel,
  drawSpreadPhotoFrame,
  drawSpreadPhotoSublabel,
  drawTrajectory,
  drawAnnotation,
} from "./lib/render-utils";
import type { PageConfig } from "./lib/types";

const OUTPUT_DIR = "resources/field_notes/output_riso";

const RISO_LAYERS = [
  { id: "black", colors: [COLOR_BLACK, "#272727", "#333333"] },
  { id: "blue", colors: [COLOR_BLUE, "#4455ee"] },
  { id: "light_blue", colors: [COLOR_BG_BLUE_TRANS] },
];

async function exportBackground() {
  console.log("Exporting stitched background...");
  const bgLeftPath = "resources/field_notes/a_final.png";
  const bgRightPath = "resources/field_notes/b_final.png";

  const [imgLeft, imgRight] = await Promise.all([
    loadImage(bgLeftPath),
    loadImage(bgRightPath),
  ]);

  const canvas = createCanvas(imgLeft.width + imgRight.width, imgLeft.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(imgLeft, 0, 0);
  ctx.drawImage(imgRight, imgLeft.width, 0);

  const stitchedBuffer = canvas.toBuffer("image/png");

  // Riso-ready version (Black on Transparent)
  const risoPath = path.join(OUTPUT_DIR, "stitched_background_riso.png");

  const alphaBuffer = await sharp(stitchedBuffer)
    .grayscale()
    .normalize()
    .negate()
    .toBuffer();

  await sharp({
    create: {
      width: imgLeft.width + imgRight.width,
      height: imgLeft.height,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .joinChannel(alphaBuffer)
    .png()
    .toFile(risoPath);

  console.log(`Saved Riso background master (transparent): ${risoPath}`);
}

async function renderPageLayer(
  config: PageConfig,
  assets: any,
  colorFilter?: (color: string) => boolean,
) {
  const [leftCanvas, rightCanvas] = await Promise.all([
    renderLeft(
      config.leftPhotos,
      config.leftTexts,
      assets,
      config.toTraditional ?? true,
      config.leftSections,
      config.leftColumns,
      "transparent",
      config.halftones,
      colorFilter,
    ),
    renderRight(
      config.rightSections ?? [],
      assets,
      config.toTraditional ?? true,
      config.rightPhotos,
      config.rightColumns,
      "transparent",
      colorFilter,
    ),
  ]);

  const W = leftCanvas.width + rightCanvas.width;
  const H = Math.max(leftCanvas.height, rightCanvas.height);
  const final = createCanvas(W, H);
  const ctx = final.getContext("2d");
  ctx.drawImage(leftCanvas, 0, 0);
  ctx.drawImage(rightCanvas, leftCanvas.width, 0);

  const { sx: sx_left, sy } = getScaling(leftCanvas.width, leftCanvas.height);
  const sx_right = rightCanvas.width / REF_W;
  const ss = Math.min(sx_left, sy);

  const scaleX = (x: number) => {
    if (x <= REF_W) return x * sx_left;
    return leftCanvas.width + (x - REF_W) * sx_right;
  };

  // Spread sections
  if (config.spreadSections?.length && config.spreadColumns) {
    const spreadSX = W / (2 * REF_W);
    const spreadSS = Math.min(spreadSX, sy);
    await renderColumnSections(
      ctx as any,
      config.spreadSections,
      config.spreadColumns,
      spreadSX,
      sy,
      spreadSS,
      assets.fontName,
      config.toTraditional ?? true,
      colorFilter,
    );
  }

  // Halftones (spread-level)
  if (config.halftones) {
    for (const ht of config.halftones) {
      const itemColor = ht.color || COLOR_BLUE;
      if (colorFilter && !colorFilter(itemColor)) continue;

      let source: string | any = ht.file;
      if (ht.text) {
        const fontSize = (ht.fontSize ?? 120) * ss;
        const fontName = ht.fontFamily ?? assets.fontName;
        const isBold = ht.bold ?? true;
        const sy_val = ht.scaleY ?? 1;
        const font = `${isBold ? "bold " : ""}${fontSize}px "${fontName}"`;
        const off = createCanvas(1, 1);
        const octx = off.getContext("2d");
        octx.font = font;
        const metrics = octx.measureText(ht.text);
        const tw = Math.ceil(metrics.width);
        const th = Math.ceil(fontSize * 1.4 * sy_val);
        const textCanvas = createCanvas(tw, th);
        const tctx = textCanvas.getContext("2d");
        tctx.font = font;
        tctx.fillStyle = "black";
        tctx.textBaseline = "middle";
        if (ht.scaleY) tctx.scale(1, ht.scaleY);
        tctx.fillText(ht.text, 0, th / 2 / sy_val);
        source = textCanvas;
      }
      await drawHalftone(
        ctx as any,
        source,
        scaleX(ht.x),
        ht.y * sy,
        ht.w,
        "black",
        ht.spacing ?? 10,
        ht.minDotSize ?? 0,
        ht.maxDotSize ?? 4,
        ht.opacity ?? 1.0,
        ss,
        ht.blur,
      );
    }
  }

  // Spread photos (stickers/photos - rendered only if no color filter is active)
  if (config.spreadPhotos && !colorFilter) {
    for (const sp of config.spreadPhotos) {
      const photo = await loadImage(sp.file);
      const scaledW = sp.w * ss;
      const h = Math.round((scaledW * photo.height) / photo.width);
      ctx.save();
      ctx.translate(scaleX(sp.x), sp.y * sy);
      ctx.rotate((sp.rot * Math.PI) / 180);
      ctx.drawImage(photo, -scaledW / 2, -h / 2, scaledW, h);
      ctx.restore();
    }
  }

  // Spread photo labels, frames, and sublabels
  if (config.spreadPhotos) {
    for (const sp of config.spreadPhotos) {
      const labelColor = sp.labelColor || COLOR_BLUE;
      const frameColor = sp.frameColor || COLOR_BLUE;
      const curSx = sp.x <= REF_W ? sx_left : sx_right;

      if (!colorFilter || colorFilter(labelColor)) {
        await drawSpreadPhotoLabel(
          ctx as any,
          sp,
          assets,
          ss,
          scaleX,
          sy,
          "black",
        );
      }

      if (sp.showFrame && (!colorFilter || colorFilter(frameColor))) {
        await drawSpreadPhotoFrame(
          ctx as any,
          sp,
          assets,
          ss,
          scaleX,
          sy,
          curSx,
          "black",
        );
      }

      if (sp.sublabel && (!colorFilter || colorFilter(frameColor))) {
        await drawSpreadPhotoSublabel(
          ctx as any,
          sp,
          assets,
          ss,
          scaleX,
          sy,
          curSx,
          "black",
        );
      }
    }
  }

  // Trajectories
  if (config.trajectories) {
    for (const traj of config.trajectories) {
      const itemColor = traj.color || COLOR_BLUE;
      if (colorFilter && !colorFilter(itemColor)) continue;
      drawTrajectory(ctx as any, traj, ss, scaleX, sy, "black");
    }
  }

  // Annotations
  if (config.annotations) {
    for (const ann of config.annotations) {
      const itemColor = ann.color || COLOR_BLUE;
      if (colorFilter && !colorFilter(itemColor)) continue;
      drawAnnotation(ctx as any, ann, assets, ss, scaleX, sy, "black");
    }
  }

  // Dot Matrix
  if (config.dotMatrix && config.dotMatrix.points) {
    for (const p of config.dotMatrix.points) {
      const itemColor = p.color || config.dotMatrix.color || COLOR_BLUE;
      if (colorFilter && !colorFilter(itemColor)) continue;

      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(
        scaleX(p.x),
        p.y * sy,
        (p.size || config.dotMatrix.dotSize || 2) * ss,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  return final;
}

async function exportPageLayers(assets: any) {
  for (const config of pages) {
    console.log(`Exporting layers for ${config.id}...`);

    // Generic layer export
    for (const layerDef of RISO_LAYERS) {
      const layerCanvas = await renderPageLayer(config, assets, (c) =>
        layerDef.colors.includes(c),
      );

      // Convert to black on transparent for RISO master
      const buffer = layerCanvas.toBuffer("image/png");
      const outPath = path.join(
        OUTPUT_DIR,
        `${config.id}_${layerDef.id}_master.png`,
      );
      await sharp(buffer)
        .ensureAlpha()
        .linear([0, 0, 0, 1], [0, 0, 0, 0])
        .toFile(outPath);

      console.log(`Saved: ${outPath}`);
    }

    // Special case for color stickers (e.g., page-01)
    if (config.spreadPhotos) {
      const { sx: sx_left, sy } = getScaling(REF_W, 1000); // Approximate scaling for stickers
      const ss = Math.min(sx_left, sy);
      const W = REF_W * 2 * sx_left;
      const H = 1000 * sy;
      const stickerFinal = createCanvas(W, H);
      const sctx = stickerFinal.getContext("2d");

      for (const sp of config.spreadPhotos) {
        const photo = await loadImage(sp.file);
        const scaledW = sp.w * ss;
        const h = Math.round((scaledW * photo.height) / photo.width);
        const ax = sp.x * sx_left; // Simplified spread X
        sctx.save();
        sctx.translate(ax, sp.y * sy);
        sctx.rotate((sp.rot * Math.PI) / 180);
        sctx.drawImage(photo, -scaledW / 2, -h / 2, scaledW, h);
        sctx.restore();
      }

      const stickerPath = path.join(
        OUTPUT_DIR,
        `${config.id}_stickers_color.png`,
      );
      writeFileSync(stickerPath, stickerFinal.toBuffer("image/png"));
      console.log(`Saved stickers: ${stickerPath}`);
    }
  }
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const assets = await loadSharedAssets();

  await exportBackground();
  await exportPageLayers(assets);
}

main().catch(console.error);
