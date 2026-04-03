import type { PageConfig, SpreadPhotoLayout } from '../lib/types';

const PLANE = 'resources/虾片/plane.png';

// Shape: A curved "Converging Triangle" with an extreme bottom-heavy bias.
// Base (Bottom-Left): 15 planes, forming a massive, sparse scatter.
// Mid (Arc): 7 planes, forming a long, narrowing corridor.
// Tip (Top-Right): Only 2 planes, as lonely leaders.
// Constraints: x[80, 1340], y[70, 940].

const planes: SpreadPhotoLayout[] = [
  // ── Giant Base (15 planes) ───────────────────────────────────────────────
  { file: PLANE, label: '台中',       x: 100, y: 920, w: 185, rot: 220 },
  { file: PLANE, label: '高雄',       x:  90, y: 780, w: 185, rot: 205 },
  { file: PLANE, label: '香港',       x: 220, y: 940, w: 185, rot: 215 },
  { file: PLANE, label: '北京',       x: 380, y: 910, w: 185, rot: 210 },
  { file: PLANE, label: '深圳',       x: 550, y: 930, w: 185, rot: 205 },
  { file: PLANE, label: '太原',       x: 800, y: 910, w: 185, rot: 150 },
  { file: PLANE, label: '武汉',       x: 150, y: 650, w: 185, rot: 190 },
  { file: PLANE, label: '成都',       x: 320, y: 750, w: 185, rot: 195 },
  { file: PLANE, label: '上海',       x: 480, y: 800, w: 185, rot: 190 },
  { file: PLANE, label: '桃园',       x: 620, y: 850, w: 185, rot: 195 },
  { file: PLANE, label: '新加坡',     x: 250, y: 550, w: 185, rot: 185 },
  { file: PLANE, label: '悉尼',       x: 420, y: 620, w: 185, rot: 180 },
  { file: PLANE, label: '拉斯維加斯', x: 580, y: 680, w: 185, rot: 185 },
  { file: PLANE, label: '天津',       x: 750, y: 750, w: 185, rot: 190 },
  { file: PLANE, label: '杭州',       x: 100, y: 450, w: 185, rot: 200 },

  // ── Long Mid Corridor (7 planes) ─────────────────────────────────────────
  { file: PLANE, label: '哈尔滨',     x: 820, y: 620, w: 185, rot: 180 },
  { file: PLANE, label: '台北',       x: 950, y: 680, w: 185, rot: 185 },
  { file: PLANE, label: '北京',       x: 880, y: 480, w: 185, rot: 170 },
  { file: PLANE, label: '贵阳',       x: 1050,y: 540, w: 185, rot: 175 },
  { file: PLANE, label: '長沙',       x: 950, y: 350, w: 185, rot: 160 },
  { file: PLANE, label: '鄭州',       x: 1100,y: 400, w: 185, rot: 165 },
  { file: PLANE, label: '廈門',       x: 1180,y: 280, w: 185, rot: 150 },

  // ── Sharp Sparse Tip (2 planes) ──────────────────────────────────────────
  { file: PLANE, label: '廣州',       x: 640, y: 520, w: 185, rot: 170 }, //
  { file: PLANE, label: '馬來西亞',   x: 1240,y:  100, w: 185, rot: 140 }, //
];

planes.forEach(p => { p.labelColor = '#0d2b4a'; });

const page: PageConfig = {
  id: 'page-03',
  toTraditional: false,
  leftPhotos: [],
  rightSections: [],
  spreadPhotos: planes,
};

export default page;
