import type { PageConfig, SpreadPhotoLayout } from "../lib/types";
import { COLOR_BLACK } from "../lib/typography";

const PLANE = "resources/虾片/plane.png";

// Shape: Extreme Staggered Triple-Path Converging Fan (8-10-6 split).
// Large perpendicular offsets (~90px) for a wide fleet distribution.
// All planes are w: 165. Calculated via Python.

const planes: SpreadPhotoLayout[] = [
  { file: PLANE, label: "台中", x: 50, y: 418, w: 200, rot: 171 },
  { file: PLANE, label: "高雄", x: 151, y: 442, w: 200, rot: 170 },
  { file: PLANE, label: "香港", x: 302, y: 493, w: 200, rot: 169 },
  { file: PLANE, label: "北京", x: 454, y: 439, w: 200, rot: 167 },
  { file: PLANE, label: "深圳", x: 550, y: 304, w: 200, rot: 164 },
  { file: PLANE, label: "太原", x: 710, y: 308, w: 200, rot: 161 },
  { file: PLANE, label: "武漢", x: 868, y: 284, w: 200, rot: 157 },
  { file: PLANE, label: "成都", x: 998, y: 181, w: 200, rot: 156 },
  { file: PLANE, label: "上海", x: 61, y: 640, w: 200, rot: 181 },
  { file: PLANE, label: "桃園", x: 132, y: 784, w: 200, rot: 177 },
  { file: PLANE, label: "新加坡", x: 257, y: 647, w: 200, rot: 169 },
  { file: PLANE, label: "雪梨", x: 382, y: 750, w: 200, rot: 163 },
  { file: PLANE, label: "拉斯維加斯", x: 429, y: 598, w: 200, rot: 159 },
  { file: PLANE, label: "天津", x: 589, y: 613, w: 200, rot: 154 },
  { file: PLANE, label: "香港", x: 616, y: 456, w: 200, rot: 151 },
  { file: PLANE, label: "杭州", x: 776, y: 454, w: 200, rot: 146 },
  { file: PLANE, label: "哈爾濱", x: 935, y: 438, w: 200, rot: 141 },
  { file: PLANE, label: "臺北", x: 1208, y: 289, w: 200, rot: 138 },
  { file: PLANE, label: "北京", x: 174, y: 920, w: 200, rot: 173 },
  { file: PLANE, label: "上海", x: 360, y: 920, w: 200, rot: 158 },
  { file: PLANE, label: "貴陽", x: 542, y: 767, w: 200, rot: 148 },
  { file: PLANE, label: "長沙", x: 716, y: 710, w: 200, rot: 142 },
  { file: PLANE, label: "鄭州", x: 835, y: 603, w: 200, rot: 137 },
  { file: PLANE, label: "廈門", x: 1054, y: 331, w: 200, rot: 130 },
  { file: PLANE, label: "上海", x: 1201, y: 129, w: 200, rot: 123 },
  { file: PLANE, label: "廣州", x: 613, y: 920, w: 200, rot: 162 },
  { file: PLANE, label: "台中", x: 671, y: 863, w: 200, rot: 153 },
  { file: PLANE, label: "馬來西亞", x: 826, y: 826, w: 200, rot: 137 },
  { file: PLANE, label: "香港", x: 954, y: 730, w: 200, rot: 130 },
  { file: PLANE, label: "北京", x: 1009, y: 580, w: 200, rot: 123 },
  { file: PLANE, label: "臺北", x: 1140, y: 489, w: 200, rot: 118 },
];

planes.forEach((p) => {
  p.labelColor = COLOR_BLACK;
  p.showFrame = true;
});

const trajectories: PageConfig["trajectories"] = [];

const page: PageConfig = {
  id: "page-03",
  toTraditional: false,
  leftPhotos: [],
  rightSections: [],
  spreadPhotos: planes,
  trajectories,
};

export default page;
