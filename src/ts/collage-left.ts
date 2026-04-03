import sharp from 'sharp';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync, readdirSync } from 'fs';
import * as path from 'path';

interface PhotoLayout {
  file: string;
  x: number;
  y: number;
  w: number;
  rot: number;
  tape: number;
  tapeOffsetX?: number;
}

async function prepareTexture(texturePath: string): Promise<Buffer> {
  return sharp(texturePath)
    .grayscale()
    .normalize()
    .linear(0.6, 80)
    .png()
    .toBuffer();
}


async function main() {
  const bgPath = 'resources/field_notes/a_final.png';
  const bg = await loadImage(bgPath);
  const W = bg.width;
  const H = bg.height;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bg, 0, 0);

  const tapeDir = 'resources/tapes/individual';
  const tapeFiles = readdirSync(tapeDir)
    .filter(f => f.endsWith('.png'))
    .sort()
    .map(f => path.join(tapeDir, f));
  const tapes = await Promise.all(tapeFiles.map(f => loadImage(f)));

  const textureBuf = await prepareTexture('resources/虾片/paper-texture.png');
  const texture = await loadImage(textureBuf);

  const layout: PhotoLayout[] = [
    { file: 'resources/虾片/ashin.png',   x: 25,  y: 320, w: 160, rot:  2, tape: 1,  tapeOffsetX:  0.03 },
    { file: 'resources/虾片/masa.png',    x: 240, y: 305, w: 158, rot: -5, tape: 5,  tapeOffsetX: -0.04 },
    { file: 'resources/虾片/ming.png',    x: 462, y: 330, w: 155, rot:  3, tape: 2,  tapeOffsetX:  0.02 },
    { file: 'resources/虾片/monster.png', x: 55,  y: 545, w: 158, rot: -3, tape: 7,  tapeOffsetX: -0.03 },
    { file: 'resources/虾片/stone.png',   x: 375, y: 530, w: 162, rot:  5, tape: 4,  tapeOffsetX:  0.05 },
  ];

  for (const { file, x, y, w, rot, tape: tapeIdx, tapeOffsetX = 0 } of layout) {
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

  const out = 'resources/field_notes/left_collage.png';
  writeFileSync(out, canvas.toBuffer('image/png'));
  console.log(`Saved to ${out}`);
}

main().catch(console.error);
