import { createCanvas } from "@napi-rs/canvas";
import type { Canvas } from "@napi-rs/canvas";
import type { PageConfig } from "./types";
import type { RenderContext } from "./context";
import { getScaling, REF_W, createSpreadXScaler } from "./context";
import { renderPageHalf } from "./render-page-half";
import { drawBackgroundGrid, drawHalftone } from "./halftone";
import {
  drawSpreadPhoto,
  drawSpreadPhotoLabel,
  drawSpreadPhotoFrame,
  drawSpreadPhotoSublabel,
} from "./photo-renderer";
import { drawTrajectory, drawAnnotation } from "./annotations";
import { renderColumnSections } from "./render-sections";
import { COLOR_BLUE } from "./typography";

export async function renderPage(config: PageConfig, rc: RenderContext): Promise<Canvas> {
  const { assets, colorFilter } = rc;

  // 1. Render halves
  // When backgroundGrid is set, render halves with transparent bg so the grid shows through
  const halfBgOverride = config.backgroundGrid ? { bgColor: "transparent" as const } : {};
  const leftCanvas = await renderPageHalf({ ...config.left, ...halfBgOverride }, rc, "left");
  const rightCanvas = await renderPageHalf({ ...config.right, ...halfBgOverride }, rc, "right");

  const W = leftCanvas.width + rightCanvas.width;
  const H = Math.max(leftCanvas.height, rightCanvas.height);
  const final = createCanvas(W, H);
  const ctx = final.getContext("2d");

  // Update scaling for the whole spread
  const scaling = getScaling(leftCanvas.width, H);
  const { sx: sx_left, sy, ss } = scaling;
  const sx_right = rightCanvas.width / REF_W;

  const rcFull: RenderContext = {
    ...rc,
    ctx: ctx as any,
    scaling: { ...scaling, sx: W / (2 * REF_W) },
  };

  const scaleX = createSpreadXScaler(leftCanvas.width, sx_left, sx_right);

  // 2. Background Grid
  if (config.backgroundGrid) {
    // Only draw background colors if not in Riso mode (colorFilter)
    if (!colorFilter) {
      if (config.left?.bgColor) {
        ctx.fillStyle = config.left.bgColor;
        ctx.fillRect(0, 0, leftCanvas.width, H);
      } else {
        ctx.drawImage(assets.bgLeft, 0, 0);
      }

      if (config.right?.bgColor) {
        ctx.fillStyle = config.right.bgColor;
        ctx.fillRect(leftCanvas.width, 0, rightCanvas.width, H);
      } else {
        ctx.drawImage(assets.bgRight, leftCanvas.width, 0);
      }
    }

    await drawBackgroundGrid(ctx as any, W, H, ss, config.backgroundGrid);
  }

  // Draw halves onto final
  ctx.drawImage(leftCanvas, 0, 0);
  ctx.drawImage(rightCanvas, leftCanvas.width, 0);

  // 3. Spread Sections
  if (config.spread?.sections?.length && config.spread.columns) {
    await renderColumnSections(rcFull, config.spread.sections, config.spread.columns);
  }

  // 4. Dot Matrix
  if (config.spread?.dotMatrix) {
    const dm = config.spread.dotMatrix;
    const color = dm.color ?? COLOR_BLUE;
    const dotSize = (dm.dotSize ?? 2) * ss;

    ctx.save();
    ctx.globalAlpha = dm.opacity ?? 1.0;
    if (dm.points) {
      for (const p of dm.points) {
        const itemColor = p.color || color;
        if (colorFilter && !colorFilter(itemColor)) continue;
        ctx.fillStyle = colorFilter ? "black" : itemColor;
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
      if (!colorFilter || colorFilter(color)) {
        ctx.fillStyle = colorFilter ? "black" : color;
        const amp = (dm.waveAmplitude ?? 20) * sy;
        const freq = dm.waveFrequency ?? 0.05;
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
    }
    ctx.restore();
  }

  // 5. Halftones
  if (config.spread?.halftones) {
    for (const ht of config.spread.halftones) {
      await drawHalftone(rcFull, ht, scaleX(ht.x), ht.y * sy);
    }
  }

  // 6. Spread Photos
  if (config.spread?.photos) {
    for (const sp of config.spread.photos) {
      if (!colorFilter) {
        await drawSpreadPhoto(rcFull, sp, scaleX);
      }
      await drawSpreadPhotoLabel(rcFull, sp, scaleX, colorFilter ? "black" : undefined);
    }

    for (const sp of config.spread.photos) {
      const curSx = sp.x <= REF_W ? sx_left : sx_right;
      await drawSpreadPhotoFrame(rcFull, sp, scaleX, curSx, colorFilter ? "black" : undefined);
      await drawSpreadPhotoSublabel(rcFull, sp, scaleX, curSx, colorFilter ? "black" : undefined);
    }
  }

  // 7. Trajectories
  if (config.spread?.trajectories) {
    for (const traj of config.spread.trajectories) {
      await drawTrajectory(rcFull, traj, scaleX, colorFilter ? "black" : undefined);
    }
  }

  // 8. Annotations
  if (config.annotations) {
    for (const ann of config.annotations) {
      await drawAnnotation(rcFull, ann, scaleX, colorFilter ? "black" : undefined);
    }
  }

  return final;
}
