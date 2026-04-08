import { createCanvas, loadImage } from "@napi-rs/canvas";
import { writeFileSync, mkdirSync } from "fs";
import { loadSharedAssets } from "./lib/assets";
import { ensureBlurredLogo } from "./lib/image-utils";
import { FONT_ANNOTATION, COLOR_BLUE } from "./lib/typography";
import {
  applyPaperTexture,
  drawTargetingFrame,
  drawHalftone,
  REF_W,
  REF_H,
} from "./lib/render-utils";
import { renderLeft } from "./lib/render-left";
import { renderRight } from "./lib/render-right";
import { renderColumnSections } from "./lib/render-sections";
import { pages } from "./pages";
import type { Canvas } from "@napi-rs/canvas";
import type { PageConfig, Annotation, SpreadPhotoLayout } from "./lib/types";
import type { SharedAssets } from "./lib/assets";

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
      config.leftBgColor,
      config.halftone, // Pass halftone config to renderLeft
    ),
    renderRight(
      config.rightSections ?? [],
      assets,
      config.toTraditional ?? true,
      config.rightPhotos,
      config.rightColumns,
      config.rightBgColor,
    ),
  ]);

  const W = leftCanvas.width + rightCanvas.width;
  const H = Math.max(leftCanvas.height, rightCanvas.height);
  const final = createCanvas(W, H);
  const ctx = final.getContext("2d");
  ctx.drawImage(leftCanvas, 0, 0);
  ctx.drawImage(rightCanvas, leftCanvas.width, 0);

  const sx_left = leftCanvas.width / REF_W;
  const sx_right = rightCanvas.width / REF_W;
  const sy = leftCanvas.height / REF_H;
  const ss = Math.min(sx_left, sy);

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
        const w = Math.ceil(metrics.width);
        const h = Math.ceil(fontSize * 1.4 * sy_val);

        const textCanvas = createCanvas(w, h);
        const tctx = textCanvas.getContext("2d");
        tctx.font = font;
        tctx.fillStyle = "black";
        tctx.textBaseline = "middle";
        if (ht.scaleY) {
          tctx.scale(1, ht.scaleY);
        }
        const drawY = h / 2 / sy_val;
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
      const photo = await loadImage(sp.file);
      const scaledW = sp.w * ss;
      const h = Math.round((scaledW * photo.height) / photo.width);
      const angle = (sp.rot * Math.PI) / 180;

      ctx.save();
      if (sp.opacity !== undefined) {
        ctx.globalAlpha = sp.opacity;
      }
      if (sp.blur) {
        (ctx as any).filter = `blur(${sp.blur * ss}px)`;
      }
      ctx.translate(scaleX(sp.x), sp.y * sy);
      ctx.rotate(angle);
      if (sp.scaleY !== undefined) {
        ctx.scale(1, sp.scaleY);
      }

      // Composite plane + texture on an offscreen canvas first,
      // so the texture is clipped to the plane shape and doesn't bleed onto the page.
      const off = applyPaperTexture(photo, assets.texture, 0.18, scaledW, h);

      // Draw composited plane to main canvas with shadow
      (ctx as any).shadowBlur = (sp.shadowBlur ?? 8) * ss;
      (ctx as any).shadowOffsetX =
        (sp.shadowOffsetX ?? 2) * (sp.x <= REF_W ? sx_left : sx_right);
      (ctx as any).shadowOffsetY = (sp.shadowOffsetY ?? 4) * sy;
      (ctx as any).shadowColor = sp.shadowColor ?? "rgba(0,0,0,0.22)";
      ctx.drawImage(off, -scaledW / 2, -h / 2);
      (ctx as any).shadowBlur = 0;
      (ctx as any).shadowOffsetX = 0;
      (ctx as any).shadowOffsetY = 0;

      if (sp.blur) {
        (ctx as any).filter = "none";
      }

      if (sp.label) {
        const fontSize = Math.max(11, Math.round(scaledW * 0.11));
        ctx.font = `bold ${fontSize}px "${assets.fontName}"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = sp.labelColor ?? COLOR_BLUE;
        (ctx as any).letterSpacing = `${(sp.labelLetterSpacing ?? 0) * ss}px`;
        ctx.fillText(
          sp.label,
          (sp.labelOffsetX ?? 0) * ss,
          (sp.labelOffsetY ?? 0) * ss,
        );
        (ctx as any).letterSpacing = "0px";
      }

      if (sp.tapes) {
        for (const tc of sp.tapes) {
          const t = assets.tapes[tc.idx % assets.tapes.length];
          const tw = Math.round(scaledW * (tc.tapeWidth ?? 0.25));
          const th = Math.round((tw * t.height) / t.width);
          const tox = tc.offsetX ?? 0;
          const tx = tox * scaledW - tw / 2;
          const ty =
            tc.side === "bottom" ? h / 2 - th * 0.6 : -h / 2 - th * 0.4;
          ctx.globalAlpha = 0.9;
          ctx.drawImage(t, tx, ty, tw, th);
          ctx.globalAlpha = 1;
        }
      }

      ctx.restore();
    }

    // Second pass: draw frames on top of all planes
    for (const sp of config.spreadPhotos) {
      if (!sp.showFrame) continue;
      const photo = await loadImage(sp.file);
      const scaledW = sp.w * ss;
      const h = Math.round((scaledW * photo.height) / photo.width);
      const angle = (sp.rot * Math.PI) / 180;
      const frameColor = sp.frameColor ?? COLOR_BLUE;
      const curSx = sp.x <= REF_W ? sx_left : sx_right;
      const padX = (sp.framePadX ?? -12) * curSx,
        padY = (sp.framePadY ?? -28) * sy;
      const fw = scaledW + padX * 2,
        fh = h + padY * 2;
      ctx.save();
      ctx.translate(scaleX(sp.x), sp.y * sy);
      ctx.rotate(sp.frameSameDir ? angle : angle + Math.PI);
      drawTargetingFrame(
        ctx,
        -fw / 2,
        -fh / 2,
        fw,
        fh,
        frameColor,
        ss,
        sp.frameCornersOnly ?? false,
      );

      if (sp.sublabel) {
        const subFontSize = Math.max(9, Math.round(scaledW * 0.075));
        ctx.font = `bold ${subFontSize}px "${assets.labelFontName}"`;
        (ctx as any).letterSpacing = `${-0.5 * ss}px`;
        ctx.fillStyle = frameColor;
        ctx.globalAlpha = 0.85;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        const lines = sp.sublabel.split("\n");
        const lineH = subFontSize * 1.3;
        const startY = fh / 2 + 4 * ss;
        const startX = -fw / 2;
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], startX, startY + i * lineH);
        }
        ctx.globalAlpha = 1;
        (ctx as any).letterSpacing = "0px";
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
      ctx.globalAlpha = traj.opacity ?? 1.0;
      ctx.strokeStyle = color;
      ctx.lineWidth = (traj.lineWidth ?? 1.2) * ss;
      ctx.lineCap = traj.lineCap ?? "butt";
      ctx.setLineDash((traj.dash ?? [5, 4]).map((d) => d * ss));
      ctx.beginPath();
      ctx.moveTo(scaleX(traj.points[0].x), traj.points[0].y * sy);
      for (let i = 1; i < traj.points.length; i++) {
        ctx.lineTo(scaleX(traj.points[i].x), traj.points[i].y * sy);
      }
      ctx.stroke();

      if (traj.arrowEnd) {
        const last = traj.points[traj.points.length - 1];
        const prev = traj.points[traj.points.length - 2];
        const dx = scaleX(last.x) - scaleX(prev.x);
        const dy = (last.y - prev.y) * sy;
        const ang = Math.atan2(dy, dx);
        const alen = 10 * ss;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(scaleX(last.x), last.y * sy);
        ctx.lineTo(
          scaleX(last.x) - alen * Math.cos(ang - 0.4),
          last.y * sy - alen * Math.sin(ang - 0.4),
        );
        ctx.moveTo(scaleX(last.x), last.y * sy);
        ctx.lineTo(
          scaleX(last.x) - alen * Math.cos(ang + 0.4),
          last.y * sy - alen * Math.sin(ang + 0.4),
        );
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Draw Annotations
  if (config.annotations) {
    for (const ann of config.annotations) {
      const ax = scaleX(ann.x);
      const ay = ann.y * sy;
      const color = ann.color ?? COLOR_BLUE;
      const scaledW = ann.w * ss;
      const scaledH = ann.h * ss;
      const cx = ax + scaledW / 2,
        cy = ay + scaledH / 2;

      if (!ann.noFrame) {
        drawTargetingFrame(ctx, ax, ay, scaledW, scaledH, color, ss);
      }

      // Center crosshair (opt-in)
      if (ann.crosshair) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.0 * ss;
        ctx.setLineDash([]);
        const cSize = 6 * ss;
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
      const isChinese = /[\u4e00-\u9fa5]/.test(ann.label);
      const fontName =
        ann.fontFamily ??
        (isChinese ? assets.chineseLabelFontName : assets.labelFontName);
      const annFontSize = ann.fontSize ?? FONT_ANNOTATION * 0.75;
      ctx.font = `${ann.bold ? "bold " : ""}${annFontSize * ss}px "${fontName}"`;
      (ctx as any).letterSpacing = `${-1 * ss}px`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const labelX = cx;
      const labelY = ay + scaledH + 5 * sy;

      if (ann.angle !== undefined) {
        ctx.translate(labelX, labelY);
        ctx.rotate((ann.angle * Math.PI) / 180);
        ctx.fillText(ann.label, 0, 0);
      } else {
        ctx.fillText(ann.label, labelX, labelY);
      }

      (ctx as any).letterSpacing = "0px";
      ctx.restore();
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
