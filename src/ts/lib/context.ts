import type { CanvasRenderingContext2D } from "@napi-rs/canvas";
import type { SharedAssets } from "./assets";

/** Reference dimensions from original field notes (per page) */
export const REF_W = 680;
export const REF_H = 1036;

export interface Scaling {
  sx: number;
  sy: number;
  ss: number;
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  assets: SharedAssets;
  scaling: Scaling;
  toTrad: boolean;
  colorFilter?: (color: string) => boolean;
}

/**
 * Calculate scaling factors based on canvas dimensions
 */
export function getScaling(canvasW: number, canvasH: number): Scaling {
  const sx = canvasW / REF_W;
  const sy = canvasH / REF_H;
  return { sx, sy, ss: Math.min(sx, sy) };
}

/**
 * Create a helper to scale X across the spread.
 * If x <= REF_W, it uses left page scaling.
 * If x > REF_W, it uses right page scaling.
 */
export function createSpreadXScaler(leftW: number, sxLeft: number, sxRight: number) {
  return (x: number) => {
    if (x <= REF_W) {
      return x * sxLeft;
    } else {
      return leftW + (x - REF_W) * sxRight;
    }
  };
}
