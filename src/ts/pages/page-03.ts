import type { PageConfig, SpreadPhotoLayout } from "../lib/types";
import { COLOR_BLACK, COLOR_BLUE, createPageAnnotation } from "../lib/typography";

const PLANE = "resources/虾片/plane.png";

const planes: SpreadPhotoLayout[] = [
  { file: PLANE, label: '台中', sublabel: '231231  240101\n240102  240105\n240106  240107', x:   20, y:  812, w: 160, rot: 191 },
  { file: PLANE, label: '高雄', sublabel: '240323  240324\n240329  240330\n240331', x:   20, y:  436, w: 160, rot: 188 },
  { file: PLANE, label: '香港', sublabel: '240430  240503\n240504  240505\n240507  240508\n240509', x:   20, y:  645, w: 160, rot: 195 },
  { file: PLANE, label: '北京', sublabel: '240518  240519\n240521  240522\n240524  240525\n240526  240530\n240531  240601', x:   66, y:  529, w: 160, rot: 183 },
  { file: PLANE, label: '深圳', sublabel: '240701  240702\n240703  240705\n240706  240707', x:   20, y:  950, w: 160, rot: 188 },
  { file: PLANE, label: '太原', sublabel: '240731  240802\n240803  240804', x:   48, y:  804, w: 160, rot: 191 },
  { file: PLANE, label: '武漢', sublabel: '240906  240907\n240908  240910\n240911', x:   20, y:  943, w: 160, rot: 188 },
  { file: PLANE, label: '成都', sublabel: '240927  240928\n240930  241004', x:  203, y:  503, w: 160, rot: 186 },
  { file: PLANE, label: '上海', sublabel: '241210  241212\n241213  241215\n241216  241217\n241219  241220\n241222  241223\n241224', x:  124, y:  657, w: 160, rot: 185 },
  { file: PLANE, label: '桃園', sublabel: '241228  241229\n241231  250101\n250104  250105', x:  261, y:  631, w: 160, rot: 181 },
  { file: PLANE, label: '新加坡', sublabel: '250111  250112', x:  186, y:  782, w: 160, rot: 174 },
  { file: PLANE, label: '悉尼', sublabel: '250222', x:  154, y:  920, w: 160, rot: 178 },
  { file: PLANE, label: 'Las Vegas', sublabel: '250329', x:  360, y:  532, w: 160, rot: 169 },
  { file: PLANE, label: '天津', sublabel: '250418  250419\n250420', x:  323, y:  756, w: 160, rot: 168 },
  { file: PLANE, label: '香港', sublabel: '250509  250510\n250511  250513', x:  291, y:  894, w: 160, rot: 172 },
  { file: PLANE, label: '杭州', sublabel: '250523  250524\n250525  250527\n250528', x:  427, y:  861, w: 160, rot: 162 },
  { file: PLANE, label: '哈爾濱', sublabel: '250613  250614\n250615', x:  495, y:  569, w: 160, rot: 160 },
  { file: PLANE, label: '臺北', sublabel: '250627  250628\n250629  250704\n250705  250706\n250711  250712', x:  459, y:  724, w: 160, rot: 168 },
  { file: PLANE, label: '北京', sublabel: '250725  250726  250727\n250801  250802  250803\n250806  250808  250809\n250810  250815  250816\n250817', x:  561, y:  821, w: 160, rot: 155 },
  { file: PLANE, label: '上海', sublabel: '250902  250903\n250904  250910', x:  632, y:  539, w: 160, rot: 149 },
  { file: PLANE, label: '貴陽', sublabel: '250912  250913\n250914', x:  691, y:  769, w: 160, rot: 141 },
  { file: PLANE, label: '長沙', sublabel: '250919  250920\n250921', x:  589, y:  673, w: 160, rot: 151 },
  { file: PLANE, label: '鄭州', sublabel: '251017  251018\n251019', x:  768, y:  570, w: 160, rot: 146 },
  { file: PLANE, label: '廈門', sublabel: '251024  251025\n251026', x:  861, y:  466, w: 160, rot: 133 },
  { file: PLANE, label: '上海', sublabel: '251108  251109\n251110  251114\n251115  251116', x:  814, y:  702, w: 160, rot: 137 },
  { file: PLANE, label: '廣州', sublabel: '251205  251206\n251207  251212\n251214  251215', x:  907, y:  598, w: 160, rot: 122 },
  { file: PLANE, label: '台中', sublabel: '251227  251228\n251231  260101\n260103  260104', x:  975, y:  385, w: 160, rot: 127 },
  { file: PLANE, label: '吉隆坡', sublabel: '260131', x: 1144, y:  214, w: 160, rot: 109 },
  { file: PLANE, label: '香港', sublabel: '260324  260325\n260327  260328\n260329', x: 1021, y:  517, w: 160, rot: 118 },
  { file: PLANE, label: '北京', sublabel: '260430  260501\n260502  260503\n260508  260509\n260510  260511\n260515  260516\n260517  260518', x: 1111, y:  350, w: 160, rot: 123 },
  { file: PLANE, label: '臺北', sublabel: 'I wonder if this is the end,\nor the start of something new.', x: 1210, y:   72, w: 160, rot: 114 },
];

planes.forEach((p) => {
  p.labelColor = COLOR_BLACK;
  p.showFrame = true;
  p.labelOffsetX = -7;
  p.labelLetterSpacing = -4;
});

const trajectories: NonNullable<PageConfig["spread"]>["trajectories"] = [
  {
    points: planes.map((p) => ({ x: p.x, y: p.y })),
    dash: [0, 8],
    lineWidth: 2,
    lineCap: "round",
    color: COLOR_BLUE,
  },
];

const page: PageConfig = {
  id: "page-03",
  toTraditional: false,
  inkBleedRadius: 1,
  spread: {
    photos: planes,
    trajectories,
  },
  annotations: [createPageAnnotation("3")],
};

export default page;
