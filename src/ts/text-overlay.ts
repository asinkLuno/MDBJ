import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync, readFileSync } from 'fs';
import * as path from 'path';
import OpenCC from 'opencc';

interface TextOptions {
  fontSize?: number;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  x?: number;
  y?: number;
  gap?: number;  // extra spacing before this section when y is auto-calculated
  bold?: boolean;
}

interface Section {
  text: string;
  options?: TextOptions;
}

interface Config {
  background: string;
  backgroundRight?: string;
  font: string;
  sections: Section[];
  output: string;
  toTraditional?: boolean;
  bold?: boolean;
  backgroundOpacity?: number;
}

const converter = new OpenCC('s2t.json');

async function toTrad(s: string): Promise<string> {
  return converter.convertPromise(s);
}

function loadConfig(): Config {
  try {
    const configPath = process.argv[2] || 'text-overlay.json';
    const configData = readFileSync(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch {
    return {
      background: 'resources/field_notes/left_collage.png',
      backgroundRight: 'resources/field_notes/b_final.png',
      font: 'resources/ChenYuluoyan-2.0-Thin.ttf',
      toTraditional: true,
      sections: [
        {
          text: '十八时三十分，\n有一段震耳欲聋的航空器引擎\n随着机械涡轮的轰鸣骤然切断，人声、吉他、鼓精准切入。',
          options: { fontSize: 32, color: '#1a1a1a', x: 70, y: 190, lineHeight: 38, letterSpacing: -4 }
        },
        {
          text: '[异常]：频谱仪底部呈现出大面积真空态——\n完全未捕捉到贝斯波形。经研究员反复拍打并重启设备，\n确认仪器运作正常。',
          options: { fontSize: 32, color: '#8b0000', x: 70, gap: 32, lineHeight: 38, letterSpacing: -4 }
        }
      ],
      output: 'resources/field_notes/test_handwriting_ts.png'
    };
  }
}

async function renderRight(config: Config, fontName: string): Promise<ReturnType<typeof createCanvas>> {
  const bg = await loadImage(config.backgroundRight!);
  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext('2d');

  // Step 1: draw right background
  ctx.drawImage(bg, 0, 0);

  // Step 2: overlay text
  let nextY = 100;
  for (const section of config.sections) {
    const opts = section.options || {};
    const fontSize = opts.fontSize || 26;
    const color = opts.color || '#1a1a1a';
    const lineHeight = opts.lineHeight || fontSize * 1.4;
    const bold = opts.bold ?? config.bold ?? false;

    ctx.font = `${fontSize}px ${fontName}`;
    ctx.letterSpacing = `${opts.letterSpacing ?? 0}px`;
    ctx.fillStyle = color;

    const lines = section.text.split('\n');
    let currentY = opts.y ?? (nextY + (opts.gap ?? 0));

    for (const line of lines) {
      const text = config.toTraditional !== false ? await toTrad(line) : line;
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

async function main() {
  const config = loadConfig();

  const fontName = path.basename(config.font).replace('.ttf', '').replace('-2.0-Thin', '');
  GlobalFonts.registerFromPath(config.font, fontName);

  // Step 1: left page — background only
  const bgLeft = await loadImage(config.background);
  const leftCanvas = createCanvas(bgLeft.width, bgLeft.height);
  const leftCtx = leftCanvas.getContext('2d');
  leftCtx.drawImage(bgLeft, 0, 0);

  // Step 2: right page — background + text
  const rightCanvas = config.backgroundRight
    ? await renderRight(config, fontName)
    : null;

  // Step 3: stitch left + right
  const W = rightCanvas ? bgLeft.width + rightCanvas.width : bgLeft.width;
  const H = rightCanvas ? Math.max(bgLeft.height, rightCanvas.height) : bgLeft.height;

  const finalCanvas = createCanvas(W, H);
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.drawImage(leftCanvas, 0, 0);
  if (rightCanvas) {
    finalCtx.drawImage(rightCanvas, bgLeft.width, 0);
  }

  const buffer = finalCanvas.toBuffer('image/png');
  writeFileSync(config.output, buffer);
  console.log(`Saved to ${config.output}`);
}

main().catch(console.error);
