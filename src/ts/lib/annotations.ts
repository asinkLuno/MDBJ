import type { CanvasRenderingContext2D } from "@napi-rs/canvas";
import type { CharHighlight, RelationArrow, TrajectoryPath, Annotation } from "./types";
import { COLOR_BLUE, FONT_ANNOTATION } from "./typography";
import type { RenderContext } from "./context";
import { drawTargetingFrame } from "./photo-renderer";

function computeTokenXPositions(
  ctx: CanvasRenderingContext2D,
  text: string,
  tokens: string[],
  startX: number,
): Array<{ x: number; w: number }> {
  const positions: Array<{ x: number; w: number }> = [];
  let charIdx = 0;
  let curX = startX;

  for (const token of tokens) {
    while (charIdx < text.length && !text.startsWith(token, charIdx)) {
      curX += ctx.measureText(text[charIdx]).width;
      charIdx++;
    }
    const w = charIdx < text.length ? ctx.measureText(token).width : 0;
    positions.push({ x: curX, w });
    curX += w;
    charIdx += token.length;
  }

  return positions;
}

function drawArcArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  y: number,
  cpDrop: number,
  color: string,
  ss: number,
): void {
  const mx = (x1 + x2) / 2;
  const cpY = y - cpDrop;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.0 * ss;
  ctx.setLineDash([2.5 * ss, 2 * ss]);
  ctx.beginPath();
  ctx.moveTo(x1, y);
  ctx.quadraticCurveTo(mx, cpY, x2, y);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.lineWidth = 1.2 * ss;
  const tdx = x2 - mx;
  const tdy = y - cpY;
  const angle = Math.atan2(tdy, tdx);
  const ah = 4.5 * ss;
  ctx.beginPath();
  ctx.moveTo(x2, y);
  ctx.lineTo(x2 - ah * Math.cos(angle - 0.45), y - ah * Math.sin(angle - 0.45));
  ctx.moveTo(x2, y);
  ctx.lineTo(x2 - ah * Math.cos(angle + 0.45), y - ah * Math.sin(angle + 0.45));
  ctx.stroke();
  ctx.restore();
}

export function drawHighlightedLine(
  rc: RenderContext,
  text: string,
  x: number,
  baselineY: number,
  fontSize: number,
  highlights: CharHighlight[],
  relationArrows?: RelationArrow[],
  dotHighlights?: CharHighlight[],
  baseColor: string = COLOR_BLUE,
): void {
  const { ctx, scaling, colorFilter } = rc;
  const { ss } = scaling;

  if (!colorFilter || colorFilter(baseColor)) {
    ctx.fillText(text, x, baselineY);
  }

  const frameH = fontSize * 1.0;
  const frameTop = baselineY - fontSize * 0.85;
  const frameLW = fontSize * 0.1;

  if (dotHighlights?.length) {
    const dotRadius = fontSize * 0.38;
    const dotY = baselineY - fontSize * 0.35;
    for (const hl of dotHighlights) {
      if (colorFilter && !colorFilter(hl.color)) continue;
      let startPos = 0;
      while (true) {
        const idx = text.indexOf(hl.char, startPos);
        if (idx === -1) break;
        const before = text.substring(0, idx);
        let charX = x + ctx.measureText(before).width;

        if (hl.char.length > 1 && (hl.char.startsWith("我") || hl.char.startsWith("你"))) {
          charX += ctx.measureText(hl.char[0]).width / 2;
        } else {
          charX += ctx.measureText(hl.char).width / 2;
        }

        ctx.save();
        ctx.fillStyle = hl.color;
        ctx.beginPath();
        ctx.arc(charX, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        startPos = idx + 1;
      }
    }
  }

  if (relationArrows?.length) {
    for (const rel of relationArrows) {
      const dotColor = COLOR_BLUE;
      if (colorFilter && !colorFilter(dotColor)) continue;

      const pos = computeTokenXPositions(ctx, text, rel.tokens, x);
      const subj = pos[rel.subjectIdx];
      const obj = pos[rel.objectIdx];
      if (!subj || !obj || subj.w === 0 || obj.w === 0) continue;

      const subjToken = rel.tokens[rel.subjectIdx];
      const objToken = rel.tokens[rel.objectIdx];

      const dotRadius = fontSize * 0.38;
      const dotY = baselineY - fontSize * 0.35;

      const getCenterX = (p: { x: number; w: number }, token: string) => {
        if (token.length > 1 && (token.startsWith("我") || token.startsWith("你"))) {
          return p.x + ctx.measureText(token[0]).width / 2;
        }
        return p.x + p.w / 2;
      };

      const subjX = getCenterX(subj, subjToken);
      const objX = getCenterX(obj, objToken);

      [subjX, objX].forEach((cx) => {
        ctx.save();
        ctx.fillStyle = dotColor;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(cx, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      const arrowY = frameTop - 3 * ss;
      const span = Math.abs(objX - subjX);
      const cpDrop = Math.max(8 * ss, span * 0.28);
      drawArcArrow(ctx, subjX, objX, arrowY, cpDrop, dotColor, ss);
    }
    return;
  }

  const hlMap = new Map(highlights.map((h) => [h.char, h.color]));
  let curX = x;
  for (const char of text) {
    const cw = ctx.measureText(char).width;
    if (hlMap.has(char)) {
      const hlColor = hlMap.get(char)!;
      if (!colorFilter || colorFilter(hlColor)) {
        drawTargetingFrame(ctx, curX, frameTop, cw, frameH, hlColor, ss, true, frameLW);
      }
    }
    curX += cw;
  }
}

export function drawTrajectory(
  rc: RenderContext,
  traj: TrajectoryPath,
  scaleX: (x: number) => number,
  colorOverride?: string,
) {
  if (traj.points.length < 2) return;
  const { ctx, scaling } = rc;
  const { sy, ss } = scaling;
  const color = colorOverride ?? traj.color ?? "rgba(80,160,220,0.7)";
  ctx.save();
  ctx.globalAlpha = traj.opacity ?? 1.0;
  ctx.strokeStyle = color;
  ctx.lineWidth = (traj.lineWidth ?? 1.2) * ss;
  ctx.lineCap = traj.lineCap ?? "butt";
  ctx.setLineDash((traj.dash ?? [5, 4]).map((d) => d * ss));
  ctx.beginPath();
  ctx.moveTo(scaleX(traj.points[0].x), traj.points[0].y * sy);
  for (let i = 1; i < traj.points.length; i++) {
    ctx.lineTo(scaleX(traj.points[i].x), traj.points[i].y * sy);
  }
  ctx.stroke();

  if (traj.arrowEnd) {
    const last = traj.points[traj.points.length - 1];
    const prev = traj.points[traj.points.length - 2];
    const dx = scaleX(last.x) - scaleX(prev.x);
    const dy = (last.y - prev.y) * sy;
    const ang = Math.atan2(dy, dx);
    const alen = 10 * ss;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(scaleX(last.x), last.y * sy);
    ctx.lineTo(
      scaleX(last.x) - alen * Math.cos(ang - 0.4),
      last.y * sy - alen * Math.sin(ang - 0.4),
    );
    ctx.moveTo(scaleX(last.x), last.y * sy);
    ctx.lineTo(
      scaleX(last.x) - alen * Math.cos(ang + 0.4),
      last.y * sy - alen * Math.sin(ang + 0.4),
    );
    ctx.stroke();
  }
  ctx.restore();
}

export function drawAnnotation(
  rc: RenderContext,
  ann: Annotation,
  scaleX: (x: number) => number,
  colorOverride?: string,
) {
  const { ctx, assets, scaling } = rc;
  const { sy, ss } = scaling;
  const ax = scaleX(ann.x);
  const ay = ann.y * sy;
  const color = colorOverride ?? ann.color ?? COLOR_BLUE;
  const scaledW = ann.w * ss;
  const scaledH = ann.h * ss;
  const cx = ax + scaledW / 2,
    cy = ay + scaledH / 2;

  if (!ann.noFrame) {
    drawTargetingFrame(ctx, ax, ay, scaledW, scaledH, color, ss);
  }

  if (ann.crosshair) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.0 * ss;
    ctx.setLineDash([]);
    const cSize = 6 * ss;
    ctx.beginPath();
    ctx.moveTo(cx - cSize, cy);
    ctx.lineTo(cx + cSize, cy);
    ctx.moveTo(cx, cy - cSize);
    ctx.lineTo(cx, cy + cSize);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  const isChinese = /[\u4e00-\u9fa5]/.test(ann.label);
  const fontName =
    ann.fontFamily ?? (isChinese ? assets.chineseLabelFontName : assets.labelFontName);
  const annFontSize = ann.fontSize ?? FONT_ANNOTATION * 0.75;
  ctx.font = `${ann.bold ? "bold " : ""}${annFontSize * ss}px "${fontName}"`;
  (ctx as any).letterSpacing = `${-1 * ss}px`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const labelX = cx;
  const labelY = ay + scaledH + 5 * sy;

  if (ann.angle !== undefined) {
    ctx.translate(labelX, labelY);
    ctx.rotate((ann.angle * Math.PI) / 180);
    ctx.fillText(ann.label, 0, 0);
  } else {
    ctx.fillText(ann.label, labelX, labelY);
  }

  (ctx as any).letterSpacing = "0px";
  ctx.restore();
}
