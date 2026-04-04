import { createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync } from "fs";
import { loadSharedAssets } from "./lib/assets";
import { FONT_ANNOTATION, COLOR_DEFAULT } from "./lib/typography";
import { applyPaperTexture, drawTargetingFrame } from "./lib/render-utils";
import { renderLeft } from "./lib/render-left";
import { renderRight } from "./lib/render-right";
import { pages } from "./pages";
import type { PageConfig, Annotation, SpreadPhotoLayout } from "./lib/types";
import type { SharedAssets } from "./lib/assets";

const OUTPUT_DIR = "resources/field_notes/output";

async function buildPage(config: PageConfig, assets: SharedAssets) {
  const [leftCanvas, rightCanvas] = await Promise.all([
    renderLeft(config.leftPhotos, config.leftTexts, assets),
    renderRight(
      config.rightSections,
      assets,
      config.toTraditional ?? true,
      config.rightPhotos,
    ),
  ]);

  const W = leftCanvas.width + rightCanvas.width;
  const H = Math.max(leftCanvas.height, rightCanvas.height);
  const final = createCanvas(W, H);
  const ctx = final.getContext("2d");
  ctx.drawImage(leftCanvas, 0, 0);
  ctx.drawImage(rightCanvas, leftCanvas.width, 0);

  // Draw spread photos (span both pages)
  if (config.spreadPhotos) {
    for (const sp of config.spreadPhotos) {
      const photo = await loadImage(sp.file);
      const h = Math.round((sp.w * photo.height) / photo.width);
      const angle = (sp.rot * Math.PI) / 180;

      ctx.save();
      if (sp.blur) {
        (ctx as any).filter = `blur(${sp.blur}px)`;
      }
      ctx.translate(sp.x, sp.y);
      ctx.rotate(angle);
      if (sp.scaleY !== undefined) {
        ctx.scale(1, sp.scaleY);
      }

      // Composite plane + texture on an offscreen canvas first,
      // so the texture is clipped to the plane shape and doesn't bleed onto the page.
      const off = applyPaperTexture(photo, assets.texture, 0.18, sp.w, h);

      // Draw composited plane to main canvas with shadow
      (ctx as any).shadowBlur = sp.shadowBlur ?? 8;
      (ctx as any).shadowOffsetX = sp.shadowOffsetX ?? 2;
      (ctx as any).shadowOffsetY = sp.shadowOffsetY ?? 4;
      (ctx as any).shadowColor = sp.shadowColor ?? "rgba(0,0,0,0.22)";
      ctx.drawImage(off, -sp.w / 2, -h / 2);
      (ctx as any).shadowBlur = 0;
      (ctx as any).shadowOffsetX = 0;
      (ctx as any).shadowOffsetY = 0;

      if (sp.blur) {
        (ctx as any).filter = "none";
      }

      if (sp.label) {
        const fontSize = Math.max(11, Math.round(sp.w * 0.11));
        ctx.font = `bold ${fontSize}px "${assets.fontName}"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = sp.labelColor ?? COLOR_DEFAULT;
        ctx.fillText(sp.label, 0, 0);
      }

      if (sp.showFrame) {
        const frameColor = sp.frameColor ?? COLOR_DEFAULT;
        const padX = -12,
          padY = -28;
        const fw = sp.w + padX * 2,
          fh = h + padY * 2;
        drawTargetingFrame(ctx, -fw / 2, -fh / 2, fw, fh, frameColor);
      }

      if (sp.tapes) {
        for (const tc of sp.tapes) {
          const t = assets.tapes[tc.idx % assets.tapes.length];
          const tw = Math.round(sp.w * (tc.tapeWidth ?? 0.25));
          const th = Math.round((tw * t.height) / t.width);
          const tox = tc.offsetX ?? 0;
          const tx = tox * sp.w - tw / 2;
          const ty =
            tc.side === "bottom" ? h / 2 - th * 0.6 : -h / 2 - th * 0.4;
          ctx.globalAlpha = 0.9;
          ctx.drawImage(t, tx, ty, tw, th);
          ctx.globalAlpha = 1;
        }
      }

      ctx.restore();
    }
  }

  // Draw trajectory paths
  if (config.trajectories) {
    for (const traj of config.trajectories) {
      if (traj.points.length < 2) continue;
      const color = traj.color ?? "rgba(80,160,220,0.7)";
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = traj.lineWidth ?? 1.2;
      ctx.setLineDash(traj.dash ?? [5, 4]);
      ctx.beginPath();
      ctx.moveTo(traj.points[0].x, traj.points[0].y);
      for (let i = 1; i < traj.points.length; i++) {
        ctx.lineTo(traj.points[i].x, traj.points[i].y);
      }
      ctx.stroke();

      if (traj.arrowEnd) {
        const last = traj.points[traj.points.length - 1];
        const prev = traj.points[traj.points.length - 2];
        const dx = last.x - prev.x;
        const dy = last.y - prev.y;
        const ang = Math.atan2(dy, dx);
        const alen = 10;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(
          last.x - alen * Math.cos(ang - 0.4),
          last.y - alen * Math.sin(ang - 0.4),
        );
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(
          last.x - alen * Math.cos(ang + 0.4),
          last.y - alen * Math.sin(ang + 0.4),
        );
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Draw Annotations
  if (config.annotations) {
    for (const ann of config.annotations) {
      const pageOffset = (ann as any).page === "left" ? 0 : leftCanvas.width;
      const ax = pageOffset + ann.x;
      const ay = ann.y;
      const color = ann.color ?? COLOR_DEFAULT;
      const cx = ax + ann.w / 2,
        cy = ay + ann.h / 2;

      drawTargetingFrame(ctx, ax, ay, ann.w, ann.h, color);

      // Center crosshair (opt-in)
      if (ann.crosshair) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.0;
        ctx.setLineDash([]);
        const cSize = 6;
        ctx.beginPath();
        ctx.moveTo(cx - cSize, cy);
        ctx.lineTo(cx + cSize, cy);
        ctx.moveTo(cx, cy - cSize);
        ctx.lineTo(cx, cy + cSize);
        ctx.stroke();
        ctx.restore();
      }

      // Label below box
      ctx.save();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.font = `${FONT_ANNOTATION}px "${assets.fontName}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(ann.label, cx, ay + ann.h + 5);
      ctx.restore();
    }
  }

  const out = `${OUTPUT_DIR}/${config.id}.png`;
  writeFileSync(out, final.toBuffer("image/png"));
  console.log(`Saved: ${out}`);
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("Loading shared assets...");
  const assets = await loadSharedAssets();
  console.log(`Building ${pages.length} page(s)...`);

  for (const page of pages) {
    await buildPage(page, assets);
  }
}

main().catch(console.error);
