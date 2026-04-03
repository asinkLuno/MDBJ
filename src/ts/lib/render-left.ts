import { createCanvas, loadImage } from '@napi-rs/canvas';
import type { PhotoLayout } from './types';
import type { SharedAssets } from './assets';

export async function renderLeft(
  photos: PhotoLayout[],
  assets: SharedAssets
) {
  const { bgLeft, tapes, texture } = assets;
  const canvas = createCanvas(bgLeft.width, bgLeft.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bgLeft, 0, 0);

  for (const { file, x, y, w, rot, tape: tapeIdx, tapeOffsetX = 0 } of photos) {
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
    ctx.globalAlpha = 0.35;
    ctx.drawImage(texture, -w / 2, -h / 2, w, h);
    (ctx as any).globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.restore();

    // Tape
    const t = tapes[tapeIdx % tapes.length];
    const tw = Math.round(w * 0.6);
    const th = Math.round(tw * t.height / t.width);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(t, tapeOffsetX * w - tw / 2, -h / 2 - th * 0.4, tw, th);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  return canvas;
}
