import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { loadSharedAssets } from './lib/assets';
import { renderLeft } from './lib/render-left';
import { renderRight } from './lib/render-right';
import { pages } from './pages';
import type { PageConfig } from './lib/types';
import type { SharedAssets } from './lib/assets';

const OUTPUT_DIR = 'resources/field_notes/output';

async function buildPage(config: PageConfig, assets: SharedAssets) {
  const [leftCanvas, rightCanvas] = await Promise.all([
    renderLeft(config.leftPhotos, config.leftTexts, assets),
    renderRight(config.rightSections, assets, config.toTraditional ?? true, config.rightPhotos),
  ]);

  const W = leftCanvas.width + rightCanvas.width;
  const H = Math.max(leftCanvas.height, rightCanvas.height);
  const final = createCanvas(W, H);
  const ctx = final.getContext('2d');
  ctx.drawImage(leftCanvas, 0, 0);
  ctx.drawImage(rightCanvas, leftCanvas.width, 0);

  // Draw Annotations and Connections
  if (config.annotations) {
    for (const ann of config.annotations) {
      const ax = leftCanvas.width + ann.x;
      const ay = ann.y;

      // Draw bounding box (digital style - Red)
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2; // Slightly thicker
      ctx.strokeRect(ax, ay, ann.w, ann.h);

      // Label background (Red)
      ctx.fillStyle = '#ff0000';
      const labelText = ann.label.toUpperCase();

      // Use system Heiti for "HUMAN" label
      ctx.font = `bold 12px "Heiti SC"`;
      const labelW = ctx.measureText(labelText).width + 8;
      ctx.fillRect(ax, ay + ann.h, labelW, 16);

      // Label text (White for better contrast on red)
      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, ax + 4, ay + ann.h + 12);

      // Draw connection line (Thicker Red)
      if (ann.connectToLeftIdx !== undefined) {
        const photo = config.leftPhotos[ann.connectToLeftIdx];
        if (photo) {
          const px = photo.x + photo.w; // right edge of sticker
          const py = photo.y + 40; // near the top/middle of sticker

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(ax, ay + ann.h / 2);
          ctx.setLineDash([8, 6]); // Larger dash for thicker line
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2; // Thicker line
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
  }

  const out = `${OUTPUT_DIR}/${config.id}.png`;
  writeFileSync(out, final.toBuffer('image/png'));
  console.log(`Saved: ${out}`);
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Loading shared assets...');
  const assets = await loadSharedAssets();
  console.log(`Building ${pages.length} page(s)...`);

  for (const page of pages) {
    await buildPage(page, assets);
  }
}

main().catch(console.error);
