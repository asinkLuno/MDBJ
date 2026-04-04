import sharp from 'sharp';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import type { Image, Canvas } from '@napi-rs/canvas';
import { readdirSync } from 'fs';
import * as path from 'path';

export interface SharedAssets {
  bgLeft: Image;
  bgRight: Image;
  tapes: Image[];
  texture: Image;
  fontName: string;
}

const FONT_PATH  = 'resources/ChenYuluoyan-2.0-Thin.ttf';
const BG_LEFT    = 'resources/field_notes/a_final.png';
const BG_RIGHT   = 'resources/field_notes/b_final.png';
const TAPE_DIR   = 'resources/tapes/individual';
const TEXTURE_PATH = 'resources/虾片/paper-texture.png';

async function prepareTexture(): Promise<Buffer> {
  return sharp(TEXTURE_PATH)
    .grayscale()
    .normalize()
    .linear(0.6, 80)
    .png()
    .toBuffer();
}

/**
 * Apply paper texture onto an image canvas.
 * The texture is clipped to existing pixels (source-atop), so transparent
 * backgrounds are unaffected. Returns the composited canvas.
 *
 * @param source  Canvas or Image to apply texture to
 * @param texture Paper texture Image from SharedAssets
 * @param alpha   Texture opacity, default 0.18
 */
export function applyPaperTexture(
  source: Canvas | Image,
  texture: Image,
  alpha = 0.18,
  targetW?: number,
  targetH?: number,
): Canvas {
  const w = targetW ?? (source as any).width as number;
  const h = targetH ?? (source as any).height as number;
  const off = createCanvas(w, h);
  const ctx = off.getContext('2d') as any;
  ctx.drawImage(source, 0, 0, w, h);
  // Cover: scale texture so it fills the whole canvas (no uncovered edges)
  const natAspect = texture.width / texture.height;
  let texW: number, texH: number;
  if (w / h > natAspect) {
    texW = w; texH = w / natAspect;
  } else {
    texH = h; texW = h * natAspect;
  }
  ctx.globalCompositeOperation = 'source-atop';
  ctx.globalAlpha = alpha;
  ctx.drawImage(texture, (w - texW) / 2, (h - texH) / 2, texW, texH);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  return off;
}

export async function loadSharedAssets(): Promise<SharedAssets> {
  const fontName = path.basename(FONT_PATH).replace('.ttf', '').replace('-2.0-Thin', '');
  GlobalFonts.registerFromPath(FONT_PATH, fontName);

  const [bgLeft, bgRight, textureBuf] = await Promise.all([
    loadImage(BG_LEFT),
    loadImage(BG_RIGHT),
    prepareTexture(),
  ]);
  const texture = await loadImage(textureBuf);

  const tapes = await Promise.all(
    readdirSync(TAPE_DIR)
      .filter(f => f.endsWith('.png'))
      .sort()
      .map(f => loadImage(path.join(TAPE_DIR, f)))
  );

  return { bgLeft, bgRight, tapes, texture, fontName };
}
