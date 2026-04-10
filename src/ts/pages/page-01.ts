import type { PageConfig, SpreadPhotoLayout } from "../lib/types";
import { COLOR_BLUE, createPageAnnotation } from "../lib/typography";

const pile: SpreadPhotoLayout[] = [
  { file: 'resources/虾片/monster.png', x:  210, y:  900, w: 120, rot: 339, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/masa.png', x:  570, y:  900, w: 120, rot:  80, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/stone.png', x:  450, y:  900, w: 120, rot: 229, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ming.png', x:  330, y:  900, w: 120, rot:  55, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ashin.png', x:  109, y:  834, w: 120, rot: 156, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/masa.png', x:  270, y:  796, w: 120, rot: 315, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/stone.png', x:  570, y:  780, w: 120, rot:  85, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/masa.png', x:  453, y:  753, w: 120, rot: 295, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ashin.png', x:  169, y:  730, w: 120, rot: 157, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/masa.png', x:  344, y:  702, w: 120, rot: 351, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/stone.png', x:  561, y:  660, w: 120, rot: 174, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ming.png', x:  244, y:  636, w: 120, rot: 304, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ming.png', x:  444, y:  633, w: 120, rot: 200, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ashin.png', x:  109, y:  626, w: 120, rot: 258, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ming.png', x:  343, y:  569, w: 120, rot: 246, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/monster.png', x:  570, y:  540, w: 120, rot:  75, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/masa.png', x:  186, y:  531, w: 120, rot:  32, showFrame: true, framePadX: 0, framePadY: 0, sublabel: 'Masa\nBass\n19770425', frameCornersOnly: true, frameSameDir: true },
  { file: 'resources/虾片/stone.png', x:  453, y:  513, w: 120, rot: 198, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/stone.png', x:  307, y:  454, w: 120, rot:  48, showFrame: true, framePadX: 0, framePadY: 0, sublabel: 'Stone\nGuitar\n19751211', frameCornersOnly: true, frameSameDir: true },
  { file: 'resources/虾片/monster.png', x:  109, y:  439, w: 120, rot: 345, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/monster.png', x:  551, y:  422, w: 120, rot: 310, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/monster.png', x:  434, y:  395, w: 120, rot: 254, showFrame: true, framePadX: 0, framePadY: 0, sublabel: 'Monster\nGuitar\n19761128', frameCornersOnly: true, frameSameDir: true },
  { file: 'resources/虾片/ming.png', x:  214, y:  379, w: 120, rot: 258, showFrame: true, framePadX: 0, framePadY: 0, sublabel: 'Ming\nDrum\n19730728', frameCornersOnly: true, frameSameDir: true },
  { file: 'resources/虾片/ashin.png', x:  329, y:  336, w: 120, rot: 216, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ashin.png', x:  110, y:  319, w: 120, rot: 293, showFrame: true, framePadX: 0, framePadY: 0, sublabel: 'Ashin\nVocal\n19751206', frameCornersOnly: true, frameSameDir: true },
];

const page: PageConfig = {
  id: "page-01",
  toTraditional: true,
  inkBleedRadius: 1,
  right: {
    sections: [
      {
        text: "本次现场共采集纸质标本 5*5=25 件\n经交叉比对发现\n采集到的25件纸质标本在形态上可分为五类\n且每种形态分别对应特定的人物形象\n展现出明确的象征性功能\n\n经研究，该图案代表\nMONSTER\nSTONE\nMASA\nMING\nASHIN\n\n我？我不在上面ㄟ\n我在写野簿",
        options: {
          x: 42,
          y: 334 + 38 * 2,
          fontSize: 34,
          fontFamily: "ChenYuluoyan",
          color: COLOR_BLUE,
          wrapWidth: 600,
          lineHeight: 36,
        },
      },
    ],
  },
  spread: {
    photos: pile,
  },
  annotations: [createPageAnnotation("1")],
};

export default page;
