import type { PageConfig, SpreadPhotoLayout } from "../lib/types";
import { COLOR_BLACK } from "../lib/typography";

const PLANE = "resources/虾片/plane.png";

// Shape: Extreme Staggered Triple-Path Converging Fan (8-10-6 split).
// Large perpendicular offsets (~90px) for a wide fleet distribution.
// All planes are w: 165. Calculated via Python.

const planes: SpreadPhotoLayout[] = [
  { file: PLANE, label: "台中", x: 50, y: 418, w: 200, rot: 171 },
  { file: PLANE, label: "高雄", x: 152, y: 443, w: 200, rot: 170 },
  { file: PLANE, label: "香港", x: 303, y: 493, w: 200, rot: 169 },
  { file: PLANE, label: "北京", x: 455, y: 440, w: 200, rot: 167 },
  { file: PLANE, label: "深圳", x: 577, y: 305, w: 200, rot: 165 },
  { file: PLANE, label: "太原", x: 736, y: 317, w: 200, rot: 163 },
  { file: PLANE, label: "武漢", x: 892, y: 282, w: 200, rot: 160 },
  { file: PLANE, label: "成都", x: 1040, y: 222, w: 200, rot: 158 },
  { file: PLANE, label: "上海", x: 64, y: 646, w: 200, rot: 181 },
  { file: PLANE, label: "桃園", x: 133, y: 790, w: 200, rot: 177 },
  { file: PLANE, label: "新加坡", x: 260, y: 647, w: 200, rot: 169 },
  { file: PLANE, label: "雪梨", x: 386, y: 749, w: 200, rot: 164 },
  { file: PLANE, label: "拉斯維加斯", x: 442, y: 599, w: 200, rot: 160 },
  { file: PLANE, label: "天津", x: 602, y: 612, w: 200, rot: 156 },
  { file: PLANE, label: "香港", x: 667, y: 466, w: 200, rot: 152 },
  { file: PLANE, label: "杭州", x: 826, y: 450, w: 200, rot: 149 },
  { file: PLANE, label: "哈爾濱", x: 982, y: 415, w: 200, rot: 145 },
  { file: PLANE, label: "臺北", x: 1209, y: 244, w: 200, rot: 143 },
  { file: PLANE, label: "北京", x: 171, y: 940, w: 200, rot: 173 },
  { file: PLANE, label: "上海", x: 361, y: 938, w: 200, rot: 158 },
  { file: PLANE, label: "貴陽", x: 547, y: 763, w: 200, rot: 149 },
  { file: PLANE, label: "長沙", x: 723, y: 716, w: 200, rot: 144 },
  { file: PLANE, label: "鄭州", x: 842, y: 609, w: 200, rot: 140 },
  { file: PLANE, label: "廈門", x: 1140, y: 388, w: 200, rot: 135 },
  { file: PLANE, label: "上海", x: 1317, y: 126, w: 200, rot: 131 },
  { file: PLANE, label: "廣州", x: 622, y: 940, w: 200, rot: 160 },
  { file: PLANE, label: "台中", x: 679, y: 870, w: 200, rot: 152 },
  { file: PLANE, label: "馬來西亞", x: 835, y: 831, w: 200, rot: 138 },
  { file: PLANE, label: "香港", x: 959, y: 730, w: 200, rot: 132 },
  { file: PLANE, label: "北京", x: 998, y: 575, w: 200, rot: 127 },
  { file: PLANE, label: "臺北", x: 1156, y: 547, w: 200, rot: 124 },
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
