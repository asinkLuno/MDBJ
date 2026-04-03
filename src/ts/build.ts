import { createCanvas } from '@napi-rs/canvas';
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
    renderLeft(config.leftPhotos, assets),
    renderRight(config.rightSections, assets, config.toTraditional ?? true),
  ]);

  const W = leftCanvas.width + rightCanvas.width;
  const H = Math.max(leftCanvas.height, rightCanvas.height);
  const final = createCanvas(W, H);
  const ctx = final.getContext('2d');
  ctx.drawImage(leftCanvas, 0, 0);
  ctx.drawImage(rightCanvas, leftCanvas.width, 0);

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
