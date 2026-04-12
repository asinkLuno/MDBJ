import { mkdirSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import * as path from "path";
import { createCanvas, type Canvas } from "@napi-rs/canvas";
import sharp from "sharp";

import { loadSharedAssets } from "./lib/assets";
import { renderPage } from "./lib/renderer";
import { getScaling } from "./lib/context";
import { COLOR_BLACK, COLOR_BLUE, COLOR_GREEN, COLOR_BG_BLUE_TRANS } from "./lib/typography";
const OUTPUT_DIR_NORMAL = "resources/field_notes/output";
const OUTPUT_DIR_RISO = "resources/field_notes/output_riso";

const PRE_BUILD_SCRIPTS = [
  "src/ts/pages/calculate_page2_pile.py",
  "src/ts/pages/calculate_3paths_extreme_stagger.py",
];

const RISO_LAYERS = [
  { id: "black", colors: [COLOR_BLACK, "#272727", "#333333"] },
  { id: "blue", colors: [COLOR_BLUE, "#4455ee"] },
  { id: "green", colors: [COLOR_GREEN] },
  { id: "light_blue", colors: [COLOR_BG_BLUE_TRANS] },
];

/**
 * Post-process the final canvas with an ink-bleed effect.
 */
async function applyInkBleedFilter(canvas: Canvas, radius = 3): Promise<Canvas> {
  if (radius <= 0) return canvas;
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;

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
      data[di] = Math.min(data[di], r / cnt);
      data[di + 1] = Math.min(data[di + 1], g / cnt);
      data[di + 2] = Math.min(data[di + 2], b / cnt);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

async function exportRisoBackground(assets: any) {
  console.log("Exporting stitched background for Riso...");
  const W = assets.bgLeft.width + assets.bgRight.width;
  const H = assets.bgLeft.height;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(assets.bgLeft, 0, 0);
  ctx.drawImage(assets.bgRight, assets.bgLeft.width, 0);

  const stitchedBuffer = canvas.toBuffer("image/png");
  const risoPath = path.join(OUTPUT_DIR_RISO, "stitched_background_riso.png");

  const alphaBuffer = await sharp(stitchedBuffer).grayscale().normalize().negate().toBuffer();

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .joinChannel(alphaBuffer)
    .png()
    .toFile(risoPath);

  console.log(`Saved: ${risoPath}`);
}

async function runBuild() {
  console.log("Running pre-build physical simulations...");
  for (const script of PRE_BUILD_SCRIPTS) {
    console.log(`  -> Executing ${script}`);
    try {
      execSync(`python3 ${script}`, { stdio: "inherit" });
    } catch {
      console.warn(`Warning: Failed to run ${script}. Using existing data.`);
    }
  }

  // Dynamically import pages to get the updated data written by Python scripts
  const isRiso = process.argv.includes("--riso");
  const { pages } = await import("./pages/index.js");
  const filter = process.argv.find((arg) => arg.startsWith("page-"));
  const targets = filter ? pages.filter((p: any) => p.id === filter) : pages;

  if (filter && targets.length === 0) {
    console.error(`No page found with id "${filter}".`);
    process.exit(1);
  }

  mkdirSync(isRiso ? OUTPUT_DIR_RISO : OUTPUT_DIR_NORMAL, { recursive: true });

  console.log("Loading assets...");
  const assets = await loadSharedAssets();

  if (isRiso) {
    await exportRisoBackground(assets);
  }

  for (const page of targets) {
    console.log(`Building ${page.id} (${isRiso ? "Riso" : "Normal"})...`);

    if (isRiso) {
      for (const layerDef of RISO_LAYERS) {
        const canvas = await renderPage(page, {
          ctx: null as any,
          assets,
          scaling: getScaling(assets.bgLeft.width, assets.bgLeft.height),
          toTrad: page.toTraditional ?? true,
          colorFilter: (c) => layerDef.colors.includes(c),
        });

        const imageData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
        const hasContent = imageData.data.some((v, i) => i % 4 === 3 && v > 0);
        if (!hasContent) {
          console.log(`  -> Skipped layer: ${layerDef.id} (empty)`);
          continue;
        }

        const buffer = canvas.toBuffer("image/png");
        const outPath = path.join(OUTPUT_DIR_RISO, `${page.id}_${layerDef.id}_master.png`);
        await sharp(buffer)
          .ensureAlpha()
          .linear([0, 0, 0, 1], [0, 0, 0, 0]) // Black on transparent
          .toFile(outPath);
        console.log(`  -> Saved layer: ${layerDef.id}`);
      }

      // Export color photos layer if the page has spread photos
      const hasSpreadPhotos = (page.spread?.photos?.length ?? 0) > 0;
      const hasHalfPhotos =
        (page.left?.photos?.length ?? 0) + (page.right?.photos?.length ?? 0) > 0;
      if (hasSpreadPhotos || hasHalfPhotos) {
        const photoCanvas = await renderPage(page, {
          ctx: null as any,
          assets,
          scaling: getScaling(assets.bgLeft.width, assets.bgLeft.height),
          toTrad: page.toTraditional ?? true,
          photosOnly: true,
        });
        const photoPath = path.join(OUTPUT_DIR_RISO, `${page.id}_photos_color.png`);
        writeFileSync(photoPath, photoCanvas.toBuffer("image/png"));
        console.log(`  -> Saved color photos: photos_color`);
      }
    } else {
      const canvas = await renderPage(page, {
        ctx: null as any,
        assets,
        scaling: getScaling(assets.bgLeft.width, assets.bgLeft.height),
        toTrad: page.toTraditional ?? true,
      });

      const filtered = await applyInkBleedFilter(canvas, page.inkBleedRadius ?? 0);
      const outPath = path.join(OUTPUT_DIR_NORMAL, `${page.id}.png`);
      writeFileSync(outPath, filtered.toBuffer("image/png"));
      console.log(`  -> Saved: ${outPath}`);
    }
  }
}

runBuild().catch(console.error);
