import type { PageConfig } from '../lib/types';

const page: PageConfig = {
  id: 'page-01',
  toTraditional: true,
  leftPhotos: [
    {
      file: 'resources/虾片/wuguanzhong_gjtyc.jpg',
      x: 120, // (680 - 440) / 2
      y: 300, // Slightly higher than middle
      w: 440,
      rot: -1.5,
      tape: 1,
      tapeOffsetX: 0,
    },
  ],
  leftTexts: [
    {
      text: "39° 59' 34.5660'' N, 116° 23' 47.2056'' E",
      x: 60, // Align with right side x
      y: 840,
      fontSize: 32,
      color: '#8b2500',
      letterSpacing: -1,
    },
  ],
  rightSections: [
    {
      text: '该探方区域位于前全新世古大型聚落遗址\n' +
            '（史料称之为“北京/Beijing”）的北中轴线\n' +
            '延长线上。根据残存的硅基数据碎片交叉\n' +
            '比对，该地点在公元2000年代属于一个被\n' +
            '称为“奥林匹克中心区”的大型公共建筑群。\n' +
            '发掘点主体是一座被古代文字描述为“国家\n' +
            '体育场”的超大型结构遗迹。调查区域现为\n' +
            '轻度起伏的杂草灌木覆盖带。核心发掘区地\n' +
            '表呈现出一个极其巨大的、近乎规则椭圆形\n' +
            '的异常隆起带，南北长轴约330标准米，\n' +
            '东西短轴约290标准米。',
      options: {
        fontSize: 32,
        color: '#2c1810',
        x: 60,
        y: 187,
        lineHeight: 38,
        letterSpacing: -2,
      },
    },
    {
      text: '\n' +
            '经初步地表清理与声波透视勘探，发现隆起\n' +
            '土层下方约12米深处，埋藏有极其庞大且错\n' +
            '综复杂的超巨型合金编织结构。大量高强度\n' +
            '金属骨架已发生深度氧化，在土壤中形成了\n' +
            '厚重的暗红色铁锈沉积层（暂编为L-3文\n' +
            '化层）。由于其外部钢铁网状结构在俯视状\n' +
            '态下形似某种史前巨禽的巢穴，工程队初步\n' +
            '推测，这可能是古人类用于举行数万人级别\n' +
            '的大型声光狂热祭祀（注：古语似称为\n' +
            '“Concert”）的核心神殿遗址。',
      options: {
        fontSize: 32,
        color: '#2c1810',
        x: 60,
        y: 605,
        lineHeight: 38,
        letterSpacing: -2,
      },
    },
  ],
};

export default page;
