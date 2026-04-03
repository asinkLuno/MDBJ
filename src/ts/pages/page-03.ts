import type { PageConfig, SpreadPhotoLayout } from '../lib/types';

const PLANE = 'resources/虾片/plane.png';

// Arc: bottom-left → upper-right, belly curves downward
// Dense fan spread at start (bottom-left), converging toward top-right

const planes: SpreadPhotoLayout[] = [
  // ── Bottom-left fan (dense, scattered, high volume) ────────────────────────
  { file: PLANE, label: '台中',       x:  80, y: 920, w: 185, rot: 200, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '高雄',       x: 140, y: 840, w: 185, rot: 195, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '香港',       x:  70, y: 760, w: 185, rot: 190, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '北京',       x: 210, y: 940, w: 185, rot: 198, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '深圳',       x: 260, y: 820, w: 185, rot: 192, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '太原',       x: 180, y: 700, w: 185, rot: 188, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '武汉',       x: 340, y: 900, w: 185, rot: 194, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '成都',       x: 380, y: 780, w: 185, rot: 186, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '上海',       x: 320, y: 660, w: 185, rot: 182, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },

  // ── Mid arc (starting to narrow and follow the curve) ─────────────────────
  { file: PLANE, label: '桃园',       x: 480, y: 820, w: 185, rot: 185, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '新加坡',     x: 520, y: 700, w: 185, rot: 178, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '悉尼',       x: 460, y: 580, w: 185, rot: 175, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '拉斯維加斯', x: 620, y: 740, w: 185, rot: 172, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '天津',       x: 650, y: 600, w: 185, rot: 168, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '杭州',       x: 580, y: 480, w: 185, rot: 165, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },

  // ── Right page (converging, sparse, aiming for top-right) ─────────────────
  { file: PLANE, label: '哈尔滨',     x: 780, y: 620, w: 185, rot: 160, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '台北',       x: 820, y: 480, w: 185, rot: 155, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '北京',       x: 750, y: 340, w: 185, rot: 152, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '贵阳',       x: 940, y: 500, w: 185, rot: 148, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '長沙',       x: 980, y: 350, w: 185, rot: 142, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '鄭州',       x:1080, y: 400, w: 185, rot: 138, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '廈門',       x:1120, y: 250, w: 185, rot: 132, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '廣州',       x:1200, y: 180, w: 185, rot: 125, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
  { file: PLANE, label: '馬來西亞',   x:1250, y: 100, w: 185, rot: 120, shadowBlur:16, shadowOffsetX:10, shadowOffsetY:14, shadowColor:'rgba(0,0,0,0.26)' },
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
