import type { PageConfig, SpreadPhotoLayout } from '../lib/types';

const PLANE = 'resources/虾片/plane.png';

// Shape: Extreme Staggered Triple-Path Converging Fan (8-10-6 split).
// Large perpendicular offsets (~90px) for a wide fleet distribution.
// All planes are w: 165. Calculated via Python.

const planes: SpreadPhotoLayout[] = [
 { file: PLANE, label: '台中', x:   58, y:  632, w: 185, rot: 182 },
  { file: PLANE, label: '高雄', x:  149, y:  470, w: 185, rot: 175 },
  { file: PLANE, label: '香港', x:  272, y:  617, w: 185, rot: 170 },
  { file: PLANE, label: '北京', x:  345, y:  443, w: 185, rot: 165 },
  { file: PLANE, label: '深圳', x:  483, y:  550, w: 185, rot: 162 },
  { file: PLANE, label: '太原', x:  541, y:  389, w: 185, rot: 159 },
  { file: PLANE, label: '武漢', x:  692, y:  464, w: 185, rot: 156 },
  { file: PLANE, label: '成都', x:  753, y:  308, w: 185, rot: 155 },
  { file: PLANE, label: '上海', x:  903, y:  364, w: 185, rot: 153 },
  { file: PLANE, label: '桃園', x:  963, y:  209, w: 185, rot: 153 },
  { file: PLANE, label: '新加坡', x:  124, y:  950, w: 185, rot: 177 },
  { file: PLANE, label: '雪梨', x:  199, y:  826, w: 185, rot: 169 },
  { file: PLANE, label: '拉斯維加斯', x:  342, y:  950, w: 185, rot: 162 },
  { file: PLANE, label: '天津', x:  379, y:  773, w: 185, rot: 156 },
  { file: PLANE, label: '香港', x:  548, y:  859, w: 185, rot: 151 },
  { file: PLANE, label: '杭州', x:  574, y:  683, w: 185, rot: 147 },
  { file: PLANE, label: '哈爾濱', x:  742, y:  729, w: 185, rot: 143 },
  { file: PLANE, label: '臺北', x:  757, y:  553, w: 185, rot: 141 },
  { file: PLANE, label: '北京', x:  929, y:  569, w: 185, rot: 138 },
  { file: PLANE, label: '上海', x:  940, y:  404, w: 185, rot: 136 },
  { file: PLANE, label: '貴陽', x: 1098, y:  394, w: 185, rot: 134 },
  { file: PLANE, label: '長沙', x: 1099, y:  244, w: 185, rot: 133 },
  { file: PLANE, label: '鄭州', x: 1243, y:  227, w: 185, rot: 131 },
  { file: PLANE, label: '廈門', x: 1244, y:   90, w: 185, rot: 130 },
  { file: PLANE, label: '上海', x:  667, y:  950, w: 185, rot: 151 },
  { file: PLANE, label: '廣州', x:  758, y:  839, w: 185, rot: 142 },
  { file: PLANE, label: '台中', x:  905, y:  920, w: 185, rot: 136 },
  { file: PLANE, label: '馬來西亞', x:  863, y:  758, w: 185, rot: 132 },
  { file: PLANE, label: '香港', x: 1022, y:  776, w: 185, rot: 128 },
  { file: PLANE, label: '北京', x:  984, y:  611, w: 185, rot: 124 },
  { file: PLANE, label: '臺北', x: 1156, y:  529, w: 185, rot: 121 },
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
