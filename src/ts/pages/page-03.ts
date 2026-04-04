import type { PageConfig, SpreadPhotoLayout } from '../lib/types';

const PLANE = 'resources/虾片/plane.png';

// Shape: Extreme Staggered Triple-Path Converging Fan (8-10-6 split).
// Large perpendicular offsets (~90px) for a wide fleet distribution.
// All planes are w: 165. Calculated via Python.

const planes: SpreadPhotoLayout[] = [
  { file: PLANE, label: '台中', x:   50, y:  418, w: 200, rot: 171 },
  { file: PLANE, label: '高雄', x:  152, y:  442, w: 200, rot: 170 },
  { file: PLANE, label: '香港', x:  303, y:  493, w: 200, rot: 169 },
  { file: PLANE, label: '北京', x:  455, y:  440, w: 200, rot: 167 },
  { file: PLANE, label: '深圳', x:  569, y:  305, w: 200, rot: 165 },
  { file: PLANE, label: '太原', x:  728, y:  315, w: 200, rot: 162 },
  { file: PLANE, label: '武漢', x:  885, y:  282, w: 200, rot: 159 },
  { file: PLANE, label: '成都', x: 1031, y:  218, w: 200, rot: 158 },
  { file: PLANE, label: '上海', x:   64, y:  646, w: 200, rot: 181 },
  { file: PLANE, label: '桃園', x:  133, y:  790, w: 200, rot: 177 },
  { file: PLANE, label: '新加坡', x:  259, y:  647, w: 200, rot: 169 },
  { file: PLANE, label: '雪梨', x:  385, y:  749, w: 200, rot: 164 },
  { file: PLANE, label: '拉斯維加斯', x:  439, y:  599, w: 200, rot: 160 },
  { file: PLANE, label: '天津', x:  599, y:  614, w: 200, rot: 155 },
  { file: PLANE, label: '香港', x:  649, y:  462, w: 200, rot: 152 },
  { file: PLANE, label: '杭州', x:  808, y:  453, w: 200, rot: 148 },
  { file: PLANE, label: '哈爾濱', x:  965, y:  421, w: 200, rot: 144 },
  { file: PLANE, label: '臺北', x: 1217, y:  254, w: 200, rot: 142 },
  { file: PLANE, label: '北京', x:  171, y:  940, w: 200, rot: 173 },
  { file: PLANE, label: '上海', x:  360, y:  938, w: 200, rot: 158 },
  { file: PLANE, label: '貴陽', x:  545, y:  765, w: 200, rot: 148 },
  { file: PLANE, label: '長沙', x:  721, y:  718, w: 200, rot: 143 },
  { file: PLANE, label: '鄭州', x:  839, y:  610, w: 200, rot: 139 },
  { file: PLANE, label: '廈門', x: 1120, y:  381, w: 200, rot: 134 },
  { file: PLANE, label: '上海', x: 1290, y:  112, w: 200, rot: 129 },
  { file: PLANE, label: '廣州', x:  621, y:  940, w: 200, rot: 160 },
  { file: PLANE, label: '台中', x:  676, y:  872, w: 200, rot: 152 },
  { file: PLANE, label: '馬來西亞', x:  832, y:  833, w: 200, rot: 137 },
  { file: PLANE, label: '香港', x:  957, y:  734, w: 200, rot: 131 },
  { file: PLANE, label: '北京', x:  996, y:  578, w: 200, rot: 126 },
  { file: PLANE, label: '臺北', x: 1151, y:  539, w: 200, rot: 122 },
];

planes.forEach(p => { p.labelColor = '#0d2b4a'; });

const trajectories: PageConfig['trajectories'] = [
  {
    points: [
    { x: 0, y: 700 },    { x: 20, y: 702 },    { x: 41, y: 703 },    { x: 62, y: 704 },    { x: 83, y: 705 },    { x: 104, y: 705 },    { x: 126, y: 704 },    { x: 148, y: 703 },    { x: 170, y: 701 },    { x: 192, y: 699 },    { x: 214, y: 696 },    { x: 237, y: 693 },    { x: 259, y: 689 },    { x: 282, y: 685 },    { x: 305, y: 680 },    { x: 328, y: 675 },    { x: 351, y: 669 },    { x: 374, y: 663 },    { x: 398, y: 656 },    { x: 421, y: 649 },    { x: 444, y: 641 },    { x: 468, y: 633 },    { x: 491, y: 625 },    { x: 515, y: 616 },    { x: 539, y: 607 },    { x: 562, y: 597 },    { x: 586, y: 587 },    { x: 609, y: 577 },    { x: 633, y: 566 },    { x: 656, y: 555 },    { x: 680, y: 544 },    { x: 703, y: 532 },    { x: 727, y: 520 },    { x: 750, y: 507 },    { x: 773, y: 495 },    { x: 797, y: 482 },    { x: 820, y: 468 },    { x: 843, y: 455 },    { x: 866, y: 441 },    { x: 888, y: 427 },    { x: 911, y: 412 },    { x: 933, y: 397 },    { x: 956, y: 382 },    { x: 978, y: 367 },    { x: 1000, y: 352 },    { x: 1021, y: 336 },    { x: 1043, y: 320 },    { x: 1064, y: 304 },    { x: 1085, y: 288 },    { x: 1106, y: 272 },    { x: 1127, y: 255 },    { x: 1147, y: 238 },    { x: 1167, y: 221 },    { x: 1187, y: 204 },    { x: 1206, y: 187 },    { x: 1226, y: 170 },    { x: 1245, y: 152 },    { x: 1263, y: 135 },    { x: 1282, y: 117 },    { x: 1300, y: 100 }
    ],
    color: 'rgba(13, 43, 74, 0.4)',
    lineWidth: 1.5,
    dash: [5, 5],
  },
];

const page: PageConfig = {
  id: 'page-03',
  toTraditional: false,
  leftPhotos: [],
  rightSections: [],
  spreadPhotos: planes,
  trajectories,
};

export default page;
