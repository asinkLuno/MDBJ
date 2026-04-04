import type { PageConfig, SpreadPhotoLayout } from "../lib/types";
import { COLOR_BLACK } from "../lib/typography";

const PLANE = "resources/虾片/plane.png";

// Shape: Extreme Staggered Triple-Path Converging Fan (8-10-6 split).
// Large perpendicular offsets (~90px) for a wide fleet distribution.
// All planes are w: 165. Calculated via Python.

const planes: SpreadPhotoLayout[] = [
  { file: PLANE, label: "台中", x: 50, y: 418, w: 200, rot: 171 },
  { file: PLANE, label: "高雄", x: 152, y: 442, w: 200, rot: 170 },
  { file: PLANE, label: "香港", x: 303, y: 493, w: 200, rot: 169 },
  { file: PLANE, label: "北京", x: 455, y: 440, w: 200, rot: 167 },
  { file: PLANE, label: "深圳", x: 569, y: 305, w: 200, rot: 165 },
  { file: PLANE, label: "太原", x: 728, y: 315, w: 200, rot: 162 },
  { file: PLANE, label: "武漢", x: 885, y: 282, w: 200, rot: 159 },
  { file: PLANE, label: "成都", x: 1031, y: 218, w: 200, rot: 158 },
  { file: PLANE, label: "上海", x: 64, y: 646, w: 200, rot: 181 },
  { file: PLANE, label: "桃園", x: 133, y: 790, w: 200, rot: 177 },
  { file: PLANE, label: "新加坡", x: 259, y: 647, w: 200, rot: 169 },
  { file: PLANE, label: "雪梨", x: 385, y: 749, w: 200, rot: 164 },
  { file: PLANE, label: "拉斯維加斯", x: 439, y: 599, w: 200, rot: 160 },
  { file: PLANE, label: "天津", x: 599, y: 614, w: 200, rot: 155 },
  { file: PLANE, label: "香港", x: 649, y: 462, w: 200, rot: 152 },
  { file: PLANE, label: "杭州", x: 808, y: 453, w: 200, rot: 148 },
  { file: PLANE, label: "哈爾濱", x: 965, y: 421, w: 200, rot: 144 },
  { file: PLANE, label: "臺北", x: 1217, y: 254, w: 200, rot: 142 },
  { file: PLANE, label: "北京", x: 171, y: 940, w: 200, rot: 173 },
  { file: PLANE, label: "上海", x: 360, y: 938, w: 200, rot: 158 },
  { file: PLANE, label: "貴陽", x: 545, y: 765, w: 200, rot: 148 },
  { file: PLANE, label: "長沙", x: 721, y: 718, w: 200, rot: 143 },
  { file: PLANE, label: "鄭州", x: 839, y: 610, w: 200, rot: 139 },
  { file: PLANE, label: "廈門", x: 1120, y: 381, w: 200, rot: 134 },
  { file: PLANE, label: "上海", x: 1290, y: 112, w: 200, rot: 129 },
  { file: PLANE, label: "廣州", x: 621, y: 940, w: 200, rot: 160 },
  { file: PLANE, label: "台中", x: 676, y: 872, w: 200, rot: 152 },
  { file: PLANE, label: "馬來西亞", x: 832, y: 833, w: 200, rot: 137 },
  { file: PLANE, label: "香港", x: 957, y: 734, w: 200, rot: 131 },
  { file: PLANE, label: "北京", x: 996, y: 578, w: 200, rot: 126 },
  { file: PLANE, label: "臺北", x: 1151, y: 539, w: 200, rot: 122 },
];

planes.forEach((p) => {
  p.labelColor = COLOR_BLACK;
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
