import type { PageConfig, SpreadPhotoLayout } from '../lib/types';

const PLANE = 'resources/虾片/plane.png';

// Shape: Extreme Staggered Triple-Path Converging Fan (8-10-6 split).
// Large perpendicular offsets (~90px) for a wide fleet distribution.
// All planes are w: 165. Calculated via Python.

const planes: SpreadPhotoLayout[] = [
  { file: PLANE, label: '台中', x:   71, y:  544, w: 165, rot: 171 },
  { file: PLANE, label: '高雄', x:  172, y:  410, w: 165, rot: 167 },
  { file: PLANE, label: '香港', x:  331, y:  490, w: 165, rot: 165 },
  { file: PLANE, label: '北京', x:  438, y:  349, w: 165, rot: 163 },
  { file: PLANE, label: '深圳', x:  595, y:  399, w: 165, rot: 162 },
  { file: PLANE, label: '太原', x:  700, y:  273, w: 165, rot: 161 },
  { file: PLANE, label: '武漢', x:  860, y:  302, w: 165, rot: 160 },
  { file: PLANE, label: '成都', x:  972, y:  184, w: 165, rot: 159 },
  { file: PLANE, label: '上海', x:  127, y:  950, w: 165, rot: 167 },
  { file: PLANE, label: '桃園', x:  244, y:  808, w: 165, rot: 160 },
  { file: PLANE, label: '新加坡', x:  427, y:  856, w: 165, rot: 154 },
  { file: PLANE, label: '雪梨', x:  517, y:  687, w: 165, rot: 150 },
  { file: PLANE, label: '拉斯維加斯', x:  712, y:  684, w: 165, rot: 146 },
  { file: PLANE, label: '天津', x:  787, y:  513, w: 165, rot: 142 },
  { file: PLANE, label: '杭州', x:  975, y:  480, w: 165, rot: 139 },
  { file: PLANE, label: '哈爾濱', x: 1046, y:  316, w: 165, rot: 136 },
  { file: PLANE, label: '台北', x: 1204, y:  259, w: 165, rot: 134 },
  { file: PLANE, label: '北京', x: 1257, y:  101, w: 165, rot: 131 },
  { file: PLANE, label: '貴陽', x:  703, y:  950, w: 165, rot: 160 },
  { file: PLANE, label: '長沙', x:  732, y:  845, w: 165, rot: 146 },
  { file: PLANE, label: '鄭州', x:  879, y:  856, w: 165, rot: 137 },
  { file: PLANE, label: '廈門', x:  890, y:  700, w: 165, rot: 131 },
  { file: PLANE, label: '廣州', x: 1046, y:  650, w: 165, rot: 126 },
  { file: PLANE, label: '馬來西亞', x: 1059, y:  480, w: 165, rot: 122 },
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
