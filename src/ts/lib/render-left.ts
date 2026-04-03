import { createCanvas, loadImage } from '@napi-rs/canvas';
import type { PhotoLayout, LeftText } from './types';
import type { SharedAssets } from './assets';

export async function renderLeft(
  photos: PhotoLayout[],
  leftTexts: LeftText[] | undefined,
  assets: SharedAssets
) {
  const { bgLeft, tapes, texture, fontName } = assets;
  const canvas = createCanvas(bgLeft.width, bgLeft.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bgLeft, 0, 0);

  // Render left texts
  if (leftTexts) {
    for (const lt of leftTexts) {
      ctx.font = `${lt.fontSize || 22}px ${fontName}`;
      ctx.letterSpacing = `${lt.letterSpacing || 0}px`;
      ctx.fillStyle = lt.color || '#1a1a1a';
      ctx.fillText(lt.text, lt.x, lt.y);
    }
  }

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
      const tx = tox * w - tw / 2;
      const ty = -h / 2 - th * 0.4;

      ctx.globalAlpha = 0.9;
      ctx.drawImage(t, tx, ty, tw, th);
      ctx.globalAlpha = 1;

      if (tc.label) {
        ctx.save();
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `32px "${fontName}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Draw centered on tape, slightly offset
        ctx.fillText(tc.label, tx + tw / 2, ty + th / 2);
        ctx.restore();
      }
    }

    ctx.restore();
  }

  return canvas;
}
