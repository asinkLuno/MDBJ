import { createCanvas } from '@napi-rs/canvas';
import OpenCC from 'opencc';
import type { Section } from './types';
import type { SharedAssets } from './assets';

const converter = new OpenCC('s2t.json');

async function toTrad(s: string): Promise<string> {
  return converter.convertPromise(s);
}

export async function renderRight(
  sections: Section[],
  assets: SharedAssets,
  toTraditional = true
) {
  const { bgRight, fontName } = assets;
  const canvas = createCanvas(bgRight.width, bgRight.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bgRight, 0, 0);

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
