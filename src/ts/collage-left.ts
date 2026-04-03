import sharp from 'sharp';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';

interface Rect { x: number; y: number; w: number; h: number; }

async function extractTapes(tapePath: string): Promise<Buffer[]> {
  const { data, info } = await sharp(tapePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const threshold = 40;

  const isContent = (r: number, c: number) => {
    const i = (r * width + c) * channels;
    return data[i] > threshold || data[i + 1] > threshold || data[i + 2] > threshold;
  };

  // Find row spans with content
  const rowHas: boolean[] = Array.from({ length: height }, (_, r) => {
    for (let c = 0; c < width; c++) if (isContent(r, c)) return true;
    return false;
  });

  const rowGroups: [number, number][] = [];
  let start = -1;
  for (let r = 0; r <= height; r++) {
    if (r < height && rowHas[r] && start < 0) start = r;
    else if ((r >= height || !rowHas[r]) && start >= 0) {
      rowGroups.push([start, r - 1]);
      start = -1;
    }
  }

  // Within each row group, find column spans → individual tape rects
  const rects: Rect[] = [];
  for (const [r0, r1] of rowGroups) {
    const colHas = new Array<boolean>(width).fill(false);
    for (let r = r0; r <= r1; r++)
      for (let c = 0; c < width; c++)
        if (isContent(r, c)) colHas[c] = true;

    let cs = -1;
    for (let c = 0; c <= width; c++) {
      if (c < width && colHas[c] && cs < 0) cs = c;
      else if ((c >= width || !colHas[c]) && cs >= 0) {
        if (c - cs > 30) rects.push({ x: cs, y: r0, w: c - cs, h: r1 - r0 + 1 });
        cs = -1;
      }
    }
  }

  // Extract each rect and make black bg transparent
  const tapes: Buffer[] = [];
  for (const rect of rects) {
    const { data: td, info: ti } = await sharp(tapePath)
      .extract({ left: rect.x, top: rect.y, width: rect.w, height: rect.h })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < td.length; i += 4) {
      if (td[i] < threshold && td[i + 1] < threshold && td[i + 2] < threshold)
        td[i + 3] = 0;
    }

    tapes.push(
      await sharp(Buffer.from(td), {
        raw: { width: rect.w, height: rect.h, channels: 4 },
      }).png().toBuffer()
    );
  }

  return tapes;
}

interface PhotoLayout {
  file: string;
  x: number;  // left edge
  y: number;  // top edge
  w: number;  // display width
  rot: number; // degrees
}

async function main() {
  const bgPath = 'field_notes/a_final.png';
  const bgMeta = await sharp(bgPath).metadata();
  const W = bgMeta.width!;
  const H = bgMeta.height!;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(await loadImage(bgPath), 0, 0);

  console.log('Extracting tape pieces...');
  const tapeBuffers = await extractTapes('虾片/realistic-tape-collection.png');
  console.log(`Found ${tapeBuffers.length} tape pieces`);
  const tapes = await Promise.all(tapeBuffers.map(b => loadImage(b)));

  // Layout: natural scattered placement across the page
  // Left page usable area: roughly y 80–960, x 20–660
  const layout: PhotoLayout[] = [
    { file: '虾片/mayday.jpg',  x: 35,  y: 90,  w: 165, rot: -4 },
    { file: '虾片/plane.jpg',   x: 290, y: 75,  w: 310, rot:  7 },
    { file: '虾片/ashin.jpg',   x: 25,  y: 320, w: 160, rot:  2 },
    { file: '虾片/masa.jpg',    x: 240, y: 305, w: 158, rot: -5 },
    { file: '虾片/ming.jpg',    x: 462, y: 330, w: 155, rot:  3 },
    { file: '虾片/monster.jpg', x: 55,  y: 545, w: 158, rot: -3 },
    { file: '虾片/stone.jpg',   x: 375, y: 530, w: 162, rot:  5 },
  ];

  for (let i = 0; i < layout.length; i++) {
    const { file, x, y, w, rot } = layout[i];
    const photo = await loadImage(file);
    const h = Math.round(w * photo.height / photo.width);

    const cx = x + w / 2;
    const cy = y + h / 2;
    const angle = (rot * Math.PI) / 180;

    // Draw photo
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.drawImage(photo, -w / 2, -h / 2, w, h);

    // Draw tape across top edge
    const tape = tapes[i % tapes.length];
    const tw = Math.round(w * 0.55);
    const th = Math.round(tw * tape.height / tape.width);
    ctx.globalAlpha = 0.88;
    // Slightly offset left/right per photo for variety
    const tapeOffsetX = (i % 2 === 0 ? -0.05 : 0.05) * w;
    ctx.drawImage(tape, tapeOffsetX - tw / 2, -h / 2 - th * 0.45, tw, th);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  const out = 'field_notes/left_collage.png';
  writeFileSync(out, canvas.toBuffer('image/png'));
  console.log(`Saved to ${out}`);
}

main().catch(console.error);
