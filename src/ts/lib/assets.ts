import sharp from 'sharp';
import { loadImage, GlobalFonts } from '@napi-rs/canvas';
import type { Image } from '@napi-rs/canvas';
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
