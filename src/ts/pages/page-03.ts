import type { PageConfig, SpreadPhotoLayout } from "../lib/types";
import { COLOR_BLACK } from "../lib/typography";

const PLANE = "resources/虾片/plane.png";

// Shape: Extreme Staggered Triple-Path Converging Fan (8-10-6 split).
// Large perpendicular offsets (~90px) for a wide fleet distribution.
// All planes are w: 165. Calculated via Python.

const planes: SpreadPhotoLayout[] = [
  { file: PLANE, label: "台中", x: 80, y: 412, w: 200, rot: 168 },
  { file: PLANE, label: "高雄", x: 189, y: 394, w: 200, rot: 168 },
  { file: PLANE, label: "香港", x: 336, y: 488, w: 200, rot: 167 },
  { file: PLANE, label: "北京", x: 479, y: 387, w: 200, rot: 165 },
  { file: PLANE, label: "深圳", x: 553, y: 228, w: 200, rot: 163 },
  { file: PLANE, label: "太原", x: 721, y: 277, w: 200, rot: 160 },
  { file: PLANE, label: "武漢", x: 893, y: 246, w: 200, rot: 157 },
  { file: PLANE, label: "成都", x: 1032, y: 124, w: 200, rot: 155 },
  { file: PLANE, label: "上海", x: 115, y: 624, w: 200, rot: 181 },
  { file: PLANE, label: "桃園", x: 210, y: 814, w: 200, rot: 176 },
  { file: PLANE, label: "新加坡", x: 287, y: 656, w: 200, rot: 167 },
  { file: PLANE, label: "雪梨", x: 407, y: 783, w: 200, rot: 161 },
  { file: PLANE, label: "拉斯維加斯", x: 460, y: 615, w: 200, rot: 157 },
  { file: PLANE, label: "天津", x: 634, y: 622, w: 200, rot: 152 },
  { file: PLANE, label: "香港", x: 643, y: 447, w: 200, rot: 149 },
  { file: PLANE, label: "杭州", x: 816, y: 423, w: 200, rot: 145 },
  { file: PLANE, label: "哈爾濱", x: 989, y: 451, w: 200, rot: 140 },
  { file: PLANE, label: "臺北", x: 1220, y: 303, w: 200, rot: 137 },
  { file: PLANE, label: "北京", x: 181, y: 920, w: 200, rot: 173 },
  { file: PLANE, label: "上海", x: 370, y: 920, w: 200, rot: 157 },
  { file: PLANE, label: "貴陽", x: 582, y: 789, w: 200, rot: 147 },
  { file: PLANE, label: "長沙", x: 755, y: 748, w: 200, rot: 142 },
  { file: PLANE, label: "鄭州", x: 845, y: 598, w: 200, rot: 137 },
  { file: PLANE, label: "廈門", x: 1068, y: 295, w: 200, rot: 129 },
  { file: PLANE, label: "上海", x: 1210, y: 131, w: 200, rot: 123 },
  { file: PLANE, label: "廣州", x: 572, y: 920, w: 200, rot: 161 },
  { file: PLANE, label: "台中", x: 704, y: 916, w: 200, rot: 152 },
  { file: PLANE, label: "馬來西亞", x: 878, y: 892, w: 200, rot: 136 },
  { file: PLANE, label: "香港", x: 954, y: 735, w: 200, rot: 129 },
  { file: PLANE, label: "北京", x: 1072, y: 606, w: 200, rot: 122 },
  { file: PLANE, label: "臺北", x: 1177, y: 465, w: 200, rot: 118 },
];

planes.forEach((p) => {
  p.labelColor = COLOR_BLACK;
  p.showFrame = true;
  p.labelOffsetX = -10;
  p.labelLetterSpacing = -2;
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
