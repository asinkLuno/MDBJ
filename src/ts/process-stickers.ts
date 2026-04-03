import sharp from 'sharp';
import { readdirSync } from 'fs';
import * as path from 'path';

const DIR = 'resources/虾片';

// Trim white border then save as PNG
async function trimBorder(file: string) {
  const out = file.replace(/\.(jpg|jpeg)$/i, '.png');
  await sharp(file)
    .trim({ background: '#ffffff', threshold: 20 })
    .png()
    .toFile(out);
  if (out !== file) {
    const { execSync } = await import('child_process');
    execSync(`rm "${file}"`);
  }
  console.log(`Trimmed: ${path.basename(out)}`);
}

// Remove white background via edge flood-fill, then trim
async function removeWhiteBg(file: string) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const px = (x: number, y: number) => (y * width + x) * 4;
  const isWhite = (i: number) =>
    data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235;

  // Flood-fill from all 4 edges
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const pi = idx * 4;
    if (!isWhite(pi)) return;
    visited[idx] = 1;
    queue.push(x, y);
  };

  for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }

  while (queue.length) {
    const y = queue.pop()!;
    const x = queue.pop()!;
    data[px(x, y) + 3] = 0;
    enqueue(x + 1, y); enqueue(x - 1, y);
    enqueue(x, y + 1); enqueue(x, y - 1);
  }

  const out = file.replace(/\.(jpg|jpeg)$/i, '.png');
  await sharp(Buffer.from(data), { raw: { width, height, channels: 4 } })
    .png()
    .toFile(out + '.tmp.png');

  // Trim transparent border
  await sharp(out + '.tmp.png')
    .trim({ threshold: 0 })
    .png()
    .toFile(out);

  const { execSync } = await import('child_process');
  execSync(`rm "${out}.tmp.png"`);
  if (out !== file) execSync(`rm "${file}"`);

  console.log(`Removed bg + trimmed: ${path.basename(out)}`);
}

async function main() {
  const files = readdirSync(DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .map(f => path.join(DIR, f));

  for (const file of files) {
    await removeWhiteBg(file);
  }
}

main().catch(console.error);
