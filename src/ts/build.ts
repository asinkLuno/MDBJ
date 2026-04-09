import { mkdirSync, writeFileSync } from "fs";
import {
  applyPaperTexture,
  drawTargetingFrame,
  drawHalftone,
  REF_W,
  REF_H,
  getScaling,
  drawSpreadPhoto,
  drawSpreadPhotoLabel,
  drawSpreadPhotoFrame,
  drawSpreadPhotoSublabel,
  drawTrajectory,
  drawAnnotation,
  drawBackgroundGrid,
} from "./lib/render-utils";
import { renderLeft } from "./lib/render-left";
import { renderRight } from "./lib/render-right";
import { renderColumnSections } from "./lib/render-sections";
import { ensureBlurredLogo } from "./lib/image-utils";
import { pages } from "./pages";
import { createCanvas, type Canvas } from "@napi-rs/canvas";
import type { PageConfig, Annotation, SpreadPhotoLayout } from "./lib/types";

import { loadSharedAssets, type SharedAssets } from "./lib/assets";

const OUTPUT_DIR = "resources/field_notes/output";

/**
 * Post-process the final canvas with an ink-bleed effect.
 * Blurs dark (ink) pixels outward to simulate bleeding into paper.
 */
async function applyInkBleedFilter(
  canvas: Canvas,
  radius = 3,
): Promise<Canvas> {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;

  // Separable box blur pass 1 (Horizontal)
  const temp = new Uint8ClampedArray(data);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let r = 0,
        g = 0,
        b = 0,
        cnt = 0;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < W) {
          const ni = (y * W + nx) * 4;
          r += data[ni];
          g += data[ni + 1];
          b += data[ni + 2];
          cnt++;
        }
      }
      const di = (y * W + x) * 4;
      temp[di] = r / cnt;
      temp[di + 1] = g / cnt;
      temp[di + 2] = b / cnt;
    }
  }

  // Separable box blur pass 2 (Vertical) + Darken Blend
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      let r = 0,
        g = 0,
        b = 0,
        cnt = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < H) {
          const ni = (ny * W + x) * 4;
          r += temp[ni];
          g += temp[ni + 1];
          b += temp[ni + 2];
          cnt++;
        }
      }
      const di = (y * W + x) * 4;
      // Darken blend: spreads dark ink into light paper
      data[di] = Math.min(data[di], r / cnt);
      data[di + 1] = Math.min(data[di + 1], g / cnt);
      data[di + 2] = Math.min(data[di + 2], b / cnt);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

async function buildPage(config: PageConfig, assets: SharedAssets) {
  const [leftCanvas, rightCanvas] = await Promise.all([
    renderLeft(
      config.leftPhotos,
      config.leftTexts,
      assets,
      config.toTraditional ?? true,
      config.leftSections,
      config.leftColumns,
      config.backgroundGrid ? "transparent" : config.leftBgColor,
      config.halftones,
      undefined,
    ),
    renderRight(
      config.rightSections ?? [],
      assets,
      config.toTraditional ?? true,
      config.rightPhotos,
      config.rightColumns,
      config.backgroundGrid ? "transparent" : config.rightBgColor,
      undefined,
    ),
  ]);

  const W = leftCanvas.width + rightCanvas.width;
  const H = Math.max(leftCanvas.height, rightCanvas.height);
  const final = createCanvas(W, H);
  const ctx = final.getContext("2d");

  const { sx: sx_left, sy } = getScaling(leftCanvas.width, leftCanvas.height);
  const sx_right = rightCanvas.width / REF_W;
  const ss = Math.min(sx_left, sy);

  // If a grid is used, draw a continuous background first
  if (config.backgroundGrid) {
    if (config.leftBgColor) {
      ctx.fillStyle = config.leftBgColor;
      ctx.fillRect(0, 0, leftCanvas.width, H);
    } else {
      ctx.drawImage(assets.bgLeft, 0, 0);
    }

    if (config.rightBgColor) {
      ctx.fillStyle = config.rightBgColor;
      ctx.fillRect(leftCanvas.width, 0, rightCanvas.width, H);
    } else {
      ctx.drawImage(assets.bgRight, leftCanvas.width, 0);
    }

    await drawBackgroundGrid(ctx as any, W, H, ss, config.backgroundGrid);
  }

  ctx.drawImage(leftCanvas, 0, 0);
  ctx.drawImage(rightCanvas, leftCanvas.width, 0);

  // ── Spread sections: flow text across both pages as one canvas ───────────
  if (config.spreadSections?.length && config.spreadColumns) {
    // The spread canvas is 2×REF_W wide; sx maps spread REF coords → pixels.
    const spreadSX = W / (2 * REF_W);
    const spreadSY = H / REF_H;
    const spreadSS = Math.min(spreadSX, spreadSY);
    await renderColumnSections(
      ctx as any,
      config.spreadSections,
      config.spreadColumns,
      spreadSX,
      spreadSY,
      spreadSS,
      assets.fontName,
      config.toTraditional ?? true,
    );
  }

  // Helper for split-scaling across different page widths
  const scaleX = (x: number) => {
    if (x <= REF_W) {
      return x * sx_left;
    } else {
      return leftCanvas.width + (x - REF_W) * sx_right;
    }
  };

  // Draw dot matrix wave or explicit points
  if (config.dotMatrix) {
    const dm = config.dotMatrix;
    const color = dm.color ?? COLOR_BLUE;
    const dotSize = (dm.dotSize ?? 2) * ss;

    ctx.save();
    ctx.globalAlpha = dm.opacity ?? 1.0;
    if (dm.points) {
      for (const p of dm.points) {
        ctx.fillStyle = p.color || color;
        const ps = (p.size || dm.dotSize || 2) * ss;
        ctx.beginPath();
        ctx.arc(scaleX(p.x), p.y * sy, ps, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (
      dm.x !== undefined &&
      dm.y !== undefined &&
      dm.w !== undefined &&
      dm.h !== undefined &&
      dm.spacing !== undefined
    ) {
      const amp = (dm.waveAmplitude ?? 20) * sy;
      const freq = dm.waveFrequency ?? 0.05;
      ctx.fillStyle = color;
      for (let lx = 0; lx < dm.w; lx += dm.spacing) {
        for (let ly = 0; ly < dm.h; ly += dm.spacing) {
          const x = dm.x + lx;
          const y = dm.y + ly;
          const dy = Math.sin(lx * freq + ly * freq * 0.5) * amp;
          ctx.beginPath();
          ctx.arc(scaleX(x), (y + dy) * sy, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  // Draw halftone image (spread or single-page)
  if (config.halftones) {
    for (const ht of config.halftones) {
      let source: string | Canvas = ht.file!;

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
        const pad = Math.ceil(fontSize * 0.2);
        const w = Math.ceil(metrics.width) + pad * 2;
        const h = Math.ceil(fontSize * 1.4 * sy_val) + pad * 2;

        const textCanvas = createCanvas(w, h);
        const tctx = textCanvas.getContext("2d");
        tctx.font = font;
        tctx.fillStyle = "black";
        tctx.textBaseline = "middle";
        if (ht.scaleY) {
          tctx.scale(1, ht.scaleY);
        }
        const drawY = h / 2 / sy_val;
        tctx.fillText(ht.text, pad, drawY);
        if (isBold) {
          tctx.strokeStyle = "black";
          tctx.lineWidth = fontSize * 0.05;
          tctx.strokeText(ht.text, pad, drawY);
        }
        source = textCanvas;
      }
      await drawHalftone(
        ctx as any,
        source,
        scaleX(ht.x),
        ht.y * sy,
        ht.w,
        ht.color ?? COLOR_BLUE,
        ht.spacing ?? 10,
        ht.minDotSize ?? 0,
        ht.maxDotSize ?? 4,
        ht.opacity ?? 1.0,
        ss,
        ht.blur,
      );
    }
  }

  // Draw spread photos (span both pages)
  if (config.spreadPhotos) {
    for (const sp of config.spreadPhotos) {
      await drawSpreadPhoto(
        ctx as any,
        sp,
        assets,
        ss,
        scaleX,
        sy,
        sx_left,
        sx_right,
      );
      await drawSpreadPhotoLabel(ctx as any, sp, assets, ss, scaleX, sy);
    }

    // Second pass: draw frames and sublabels on top of all planes
    for (const sp of config.spreadPhotos) {
      const curSx = sp.x <= REF_W ? sx_left : sx_right;
      await drawSpreadPhotoFrame(ctx as any, sp, assets, ss, scaleX, sy, curSx);
      await drawSpreadPhotoSublabel(
        ctx as any,
        sp,
        assets,
        ss,
        scaleX,
        sy,
        curSx,
      );
    }
  }

  // Draw trajectory paths
  if (config.trajectories) {
    for (const traj of config.trajectories) {
      drawTrajectory(ctx as any, traj, ss, scaleX, sy);
    }
  }

  // Draw Annotations
  if (config.annotations) {
    for (const ann of config.annotations) {
      drawAnnotation(ctx as any, ann, assets, ss, scaleX, sy);
    }
  }

  const filtered = await applyInkBleedFilter(final, config.inkBleedRadius ?? 1);
  const out = `${OUTPUT_DIR}/${config.id}.png`;
  writeFileSync(out, filtered.toBuffer("image/png"));
  console.log(`Saved: ${out}`);
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const filter = process.argv[2];
  const targets = filter ? pages.filter((p) => p.id === filter) : pages;

  if (filter && targets.length === 0) {
    console.error(
      `No page found with id "${filter}". Available: ${pages.map((p) => p.id).join(", ")}`,
    );
    process.exit(1);
  }

  // Ensure any necessary blurred assets are generated
  await ensureBlurredLogo();

  console.log("Loading shared assets...");
  const assets = await loadSharedAssets();
  console.log(`Building ${targets.length} page(s)...`);

  for (const page of targets) {
    await buildPage(page, assets);
  }
}

main().catch(console.error);
