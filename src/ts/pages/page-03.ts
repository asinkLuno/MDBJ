import type { PageConfig, SpreadPhotoLayout } from '../lib/types';

const PLANE = 'resources/虾片/plane.png';

// Shape: Extreme Staggered Triple-Path Converging Fan (8-10-6 split).
// Large perpendicular offsets (~90px) for a wide fleet distribution.
// All planes are w: 165. Calculated via Python.

const planes: SpreadPhotoLayout[] = [
  { file: PLANE, label: '台中', x:   182, y:  670, w: 185, rot: 183 },
  { file: PLANE, label: '高雄', x:  180, y:  429, w: 185, rot: 177 },
  { file: PLANE, label: '香港', x:  327, y:  564, w: 185, rot: 171 },
  { file: PLANE, label: '北京', x:  437, y:  400, w: 185, rot: 167 },
  { file: PLANE, label: '深圳', x:  599, y:  488, w: 185, rot: 163 },
  { file: PLANE, label: '太原', x:  694, y:  334, w: 185, rot: 159 },
  { file: PLANE, label: '武漢', x:  868, y:  382, w: 185, rot: 156 },
  { file: PLANE, label: '成都', x:  924, y:  230, w: 185, rot: 154 },
  { file: PLANE, label: '上海', x:  180, y:  950, w: 185, rot: 167 },
  { file: PLANE, label: '桃園', x:  238, y:  791, w: 185, rot: 160 },
  { file: PLANE, label: '新加坡', x:  434, y:  872, w: 185, rot: 154 },
  { file: PLANE, label: '雪梨', x:  509, y:  673, w: 185, rot: 150 },
  { file: PLANE, label: '拉斯維加斯', x:  721, y:  697, w: 185, rot: 146 },
  { file: PLANE, label: '天津', x:  779, y:  502, w: 185, rot: 142 },
  { file: PLANE, label: '杭州', x:  984, y:  490, w: 185, rot: 139 },
  { file: PLANE, label: '哈爾濱', x: 1037, y:  307, w: 185, rot: 136 },
  { file: PLANE, label: '台北', x: 1212, y:  267, w: 185, rot: 134 },
  { file: PLANE, label: '北京', x: 1249, y:   94, w: 185, rot: 131 },
  { file: PLANE, label: '貴陽', x:  630, y:  950, w: 185, rot: 162 },
  { file: PLANE, label: '長沙', x:  727, y:  834, w: 185, rot: 150 },
  { file: PLANE, label: '鄭州', x:  887, y:  890, w: 185, rot: 141 },
  { file: PLANE, label: '廈門', x:  881, y:  717, w: 185, rot: 134 },
  { file: PLANE, label: '廣州', x: 1057, y:  699, w: 185, rot: 128 },
  { file: PLANE, label: '馬來西亞', x: 1148, y:  517, w: 185, rot: 122 },
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
