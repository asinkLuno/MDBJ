import { createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync } from "fs";
import rough from "roughjs";
import { loadSharedAssets } from "./lib/assets";
import { FONT_ANNOTATION, COLOR_DEFAULT } from "./lib/typography";
import { applyPaperTexture } from "./lib/render-utils";
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

  // Draw tracking labels (bounding boxes + data readouts)
  if (config.trackingLabels) {
    for (const tl of config.trackingLabels) {
      const accent = tl.color ?? "#88ccff";
      const allLines = [tl.label, ...(tl.data ?? [])];
      const fontSize = 11;
      const lineH = 14;
      const padX = 6;
      const padY = 4;
      const boxH = padY * 2 + allLines.length * lineH;
      const maxW =
        Math.max(...allLines.map((l) => l.length)) * fontSize * 0.55 + padX * 2;

      ctx.save();

      // Connector line to target
      if (tl.lineToX !== undefined && tl.lineToY !== undefined) {
        ctx.strokeStyle = accent;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]);
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(tl.x + maxW / 2, tl.y + boxH / 2);
        ctx.lineTo(tl.lineToX, tl.lineToY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      // Box background
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = "rgba(5,12,22,0.88)";
      ctx.fillRect(tl.x, tl.y, maxW, boxH);
      ctx.globalAlpha = 1;

      // Box border (accent color, thin)
      ctx.strokeStyle = accent;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(tl.x, tl.y, maxW, boxH);

      // Corner ticks
      const tick = 5;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.2;
      [
        [tl.x, tl.y],
        [tl.x + maxW, tl.y],
        [tl.x, tl.y + boxH],
        [tl.x + maxW, tl.y + boxH],
      ].forEach(([cx, cy], i) => {
        const sx = i % 2 === 0 ? 1 : -1;
        const sy = i < 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx - sx * tick, cy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy - sy * tick);
        ctx.stroke();
      });

      // Text
      ctx.font = `bold ${fontSize}px "Courier New", monospace`;
      ctx.fillStyle = accent;
      ctx.fillText(tl.label, tl.x + padX, tl.y + padY + fontSize);

      if (tl.sublabel) {
        ctx.font = `${fontSize}px "Courier New", monospace`;
        ctx.fillStyle = "rgba(180,210,240,0.9)";
        ctx.fillText(tl.sublabel, tl.x + padX, tl.y + padY + fontSize + lineH);
      }

      ctx.font = `${fontSize - 1}px "Courier New", monospace`;
      ctx.fillStyle = "rgba(160,200,230,0.85)";
      const dataStart = tl.sublabel ? 2 : 1;
      (tl.data ?? []).forEach((line, i) => {
        ctx.fillText(
          line,
          tl.x + padX,
          tl.y + padY + fontSize + (dataStart + i) * lineH,
        );
      });

      ctx.restore();
    }
  }

  // Draw Annotations — Rough.js hand-drawn box + highlighter strip + handwritten label
  if (config.annotations) {
    const rc = rough.canvas(final as any);
    for (const ann of config.annotations) {
      const pageOffset = (ann as any).page === "left" ? 0 : leftCanvas.width;
      const ax = pageOffset + ann.x;
      const ay = ann.y;
      const color = "#4455ee";

      // HUD-style targeting frame: corner brackets + center crosshair
      const cLen = Math.round(Math.min(ann.w, ann.h) * 0.22); // bracket arm length
      const lineOpts = { stroke: color, strokeWidth: 1.6, roughness: 0.8 };

      // Top-left
      rc.line(ax, ay + cLen, ax, ay, lineOpts);
      rc.line(ax, ay, ax + cLen, ay, lineOpts);
      // Top-right
      rc.line(ax + ann.w - cLen, ay, ax + ann.w, ay, lineOpts);
      rc.line(ax + ann.w, ay, ax + ann.w, ay + cLen, lineOpts);
      // Bottom-left
      rc.line(ax, ay + ann.h - cLen, ax, ay + ann.h, lineOpts);
      rc.line(ax, ay + ann.h, ax + cLen, ay + ann.h, lineOpts);
      // Bottom-right
      rc.line(ax + ann.w - cLen, ay + ann.h, ax + ann.w, ay + ann.h, lineOpts);
      rc.line(ax + ann.w, ay + ann.h - cLen, ax + ann.w, ay + ann.h, lineOpts);

      // Center crosshair (opt-in)
      if (ann.crosshair) {
        const cx = ax + ann.w / 2,
          cy = ay + ann.h / 2,
          cSize = 6;
        rc.line(cx - cSize, cy, cx + cSize, cy, lineOpts);
        rc.line(cx, cy - cSize, cx, cy + cSize, lineOpts);
      }

      // Handwritten label below box
      ctx.save();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ctx.font = `${FONT_ANNOTATION}px "${assets.fontName}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(ann.label, ax + ann.w / 2, ay + ann.h + 5);
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
