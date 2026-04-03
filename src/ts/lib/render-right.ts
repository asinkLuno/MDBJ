import { createCanvas, loadImage } from '@napi-rs/canvas';
import OpenCC from 'opencc';
import type { Section, PhotoLayout } from './types';
import type { SharedAssets } from './assets';

const converter = new OpenCC('s2t.json');

async function toTrad(s: string): Promise<string> {
  return converter.convertPromise(s);
}

export async function renderRight(
  sections: Section[],
  assets: SharedAssets,
  toTraditional = true,
  photos?: PhotoLayout[]
) {
  const { bgRight, fontName, texture, tapes } = assets;
  const canvas = createCanvas(bgRight.width, bgRight.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bgRight, 0, 0);

  // Draw photos if any
  if (photos) {
    for (const photoConfig of photos) {
      const { file, x, y, w, rot, tapes: photoTapes = [] } = photoConfig;
      const photo = await loadImage(file);
      const h = Math.round(w * photo.height / photo.width);
      const cx = x + w / 2;
      const cy = y + h / 2;
      const angle = (rot * Math.PI) / 180;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.drawImage(photo, -w / 2, -h / 2, w, h);

      // Wrinkle texture overlay
      ctx.save();
      ctx.beginPath();
      ctx.rect(-w / 2, -h / 2, w, h);
      ctx.clip();
      (ctx as any).globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.5;
      ctx.drawImage(texture, -w / 2, -h / 2, w, h);
      (ctx as any).globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.restore();

      // Tapes
      for (const tc of photoTapes) {
        const t = tapes[tc.idx % tapes.length];
        const tw = Math.round(w * 0.6);
        const th = Math.round(tw * t.height / t.width);
        const tox = tc.offsetX ?? 0;
        ctx.globalAlpha = 0.9;
        ctx.drawImage(t, tox * w - tw / 2, -h / 2 - th * 0.4, tw, th);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    }
  }

  let nextY = 100;

  for (const section of sections) {
    const opts = section.options || {};
    const fontSize = opts.fontSize || 26;
    const color = opts.color || '#1a1a1a';
    const lineHeight = opts.lineHeight || fontSize * 1.4;
    const bold = opts.bold ?? false;

    ctx.font = `${fontSize}px ${fontName}`;
    ctx.letterSpacing = `${opts.letterSpacing ?? 0}px`;
    ctx.fillStyle = color;

    const lines = section.text.split('\n');
    let currentY = opts.y ?? (nextY + (opts.gap ?? 0));

    for (const line of lines) {
      const text = toTraditional ? await toTrad(line) : line;
      if (bold) {
        ctx.globalAlpha = 0.4;
        ctx.fillText(text, (opts.x || 50) - 0.5, currentY);
        ctx.fillText(text, (opts.x || 50) + 0.5, currentY);
        ctx.globalAlpha = 1;
      }
      ctx.fillText(text, opts.x || 50, currentY);
      currentY += lineHeight;
    }
    nextY = currentY;
  }

  return canvas;
}
