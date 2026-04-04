import type { CanvasRenderingContext2D, Image } from "@napi-rs/canvas";
import type { TapeConfig } from "./types";

/**
 * Draw tape stickers onto a photo.
 * Must be called inside a translated+rotated ctx (origin = photo center).
 *
 * @param ctx        Canvas context, already translated to photo center
 * @param tapes      Tape images from SharedAssets
 * @param configs    Tape configs from the photo layout
 * @param w          Photo display width
 * @param h          Photo display height
 * @param fontName   Font for tape labels
 */
export function drawTapes(
  ctx: CanvasRenderingContext2D,
  tapes: Image[],
  configs: TapeConfig[],
  w: number,
  h: number,
  fontName: string,
): void {
  for (const tc of configs) {
    const t = tapes[tc.idx % tapes.length];
    const tw = Math.round(w * (tc.tapeWidth ?? 0.6));
    const th = Math.round((tw * t.height) / t.width);
    const tox = tc.offsetX ?? 0;
    const tx = tox * w - tw / 2;
    const ty = tc.side === "bottom" ? h / 2 - th * 0.6 : -h / 2 - th * 0.4;

    ctx.globalAlpha = 0.9;
    ctx.drawImage(t, tx, ty, tw, th);
    ctx.globalAlpha = 1;

    if (tc.label) {
      ctx.save();
      ctx.fillStyle = "#1a1a1a";
      ctx.font = `32px "${fontName}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tc.label, tx + tw / 2, ty + th / 2);
      ctx.restore();
    }
  }
}
