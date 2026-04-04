import type { PageConfig, SpreadPhotoLayout } from "../lib/types";
import { COLOR_BLACK } from "../lib/typography";

const PLANE = "resources/虾片/plane.png";

// Shape: Extreme Staggered Triple-Path Converging Fan (8-10-6 split).
// Large perpendicular offsets (~90px) for a wide fleet distribution.
// All planes are w: 165. Calculated via Python.

const planes: SpreadPhotoLayout[] = [
  { file: PLANE, label: '台中', sublabel: '231231  240101\n240102  240105\n240106  240107', x:   80, y:  412, w: 200, rot: 168 },
  { file: PLANE, label: '高雄', sublabel: '240323  240324\n240329  240330\n240331', x:  189, y:  394, w: 200, rot: 168 },
  { file: PLANE, label: '香港', sublabel: '240430  240503\n240504  240505\n240507  240508\n240509', x:  336, y:  488, w: 200, rot: 167 },
  { file: PLANE, label: '北京', sublabel: '240518  240519\n240521  240522\n240524  240525\n240526  240530\n240531  240601', x:  479, y:  387, w: 200, rot: 165 },
  { file: PLANE, label: '深圳', sublabel: '240701  240702\n240703  240705\n240706  240707', x:  553, y:  228, w: 200, rot: 163 },
  { file: PLANE, label: '太原', sublabel: '240731  240802\n240803  240804', x:  721, y:  277, w: 200, rot: 160 },
  { file: PLANE, label: '武漢', sublabel: '240906  240907\n240908  240910\n240911', x:  893, y:  246, w: 200, rot: 157 },
  { file: PLANE, label: '成都', sublabel: '240927  240928\n240930  241004', x: 1032, y:  124, w: 200, rot: 155 },
  { file: PLANE, label: '上海', sublabel: '241210  241212\n241213  241215\n241216  241217\n241219  241220\n241222  241223\n241224', x:  115, y:  624, w: 200, rot: 181 },
  { file: PLANE, label: '桃園', sublabel: '241228  241229\n241231  250101\n250104  250105', x:  210, y:  814, w: 200, rot: 176 },
  { file: PLANE, label: '新加坡', sublabel: '250111  250112', x:  287, y:  656, w: 200, rot: 167 },
  { file: PLANE, label: '悉尼', sublabel: '250222', x:  407, y:  783, w: 200, rot: 161 },
  { file: PLANE, label: 'Las Vegas', sublabel: '250329', x:  460, y:  615, w: 200, rot: 157 },
  { file: PLANE, label: '天津', sublabel: '250418  250419\n250420', x:  634, y:  622, w: 200, rot: 152 },
  { file: PLANE, label: '香港', sublabel: '250509  250510\n250511  250513', x:  643, y:  447, w: 200, rot: 149 },
  { file: PLANE, label: '杭州', sublabel: '250523  250524\n250525  250527\n250528', x:  816, y:  423, w: 200, rot: 145 },
  { file: PLANE, label: '哈爾濱', sublabel: '250613  250614\n250615', x:  989, y:  451, w: 200, rot: 140 },
  { file: PLANE, label: '臺北', sublabel: '250627  250628\n250629  250704\n250705  250706\n250711  250712', x: 1220, y:  303, w: 200, rot: 137 },
  { file: PLANE, label: '北京', sublabel: '250725  250726\n250727  250801\n250802  250803\n250806  250808\n250809  250810\n250815  250816\n250817', x:  181, y:  920, w: 200, rot: 173 },
  { file: PLANE, label: '上海', sublabel: '250902  250903\n250904  250910', x:  370, y:  920, w: 200, rot: 157 },
  { file: PLANE, label: '貴陽', sublabel: '250912  250913\n250914', x:  582, y:  789, w: 200, rot: 147 },
  { file: PLANE, label: '長沙', sublabel: '250919  250920\n250921', x:  755, y:  748, w: 200, rot: 142 },
  { file: PLANE, label: '鄭州', sublabel: '251017  251018\n251019', x:  845, y:  598, w: 200, rot: 137 },
  { file: PLANE, label: '廈門', sublabel: '251024  251025\n251026', x: 1068, y:  295, w: 200, rot: 129 },
  { file: PLANE, label: '上海', sublabel: '251108  251109\n251110  251114\n251115  251116', x: 1210, y:  131, w: 200, rot: 123 },
  { file: PLANE, label: '廣州', sublabel: '251205  251206\n251207  251212\n251214  251215', x:  572, y:  920, w: 200, rot: 161 },
  { file: PLANE, label: '台中', sublabel: '251227  251228\n251231  260101\n260103  260104', x:  704, y:  916, w: 200, rot: 152 },
  { file: PLANE, label: '吉隆坡', sublabel: '260131', x:  878, y:  892, w: 200, rot: 136 },
  { file: PLANE, label: '香港', sublabel: '260324  260325\n260327  260328\n260329', x:  954, y:  735, w: 200, rot: 129 },
  { file: PLANE, label: '北京', sublabel: '260430  260501\n260502  260503\n260508  260509\n260510  260511\n260515  260516\n260517  260518', x: 1072, y:  606, w: 200, rot: 122 },
  { file: PLANE, label: '臺北', sublabel: 'coming soon...', x: 1177, y:  465, w: 200, rot: 118 },
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
