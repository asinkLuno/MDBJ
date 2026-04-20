import type { PageConfig, SpreadPhotoLayout } from "../lib/types";
import { COLOR_BLUE, createPageAnnotation } from "../lib/typography";

const pile: SpreadPhotoLayout[] = [
  { file: 'resources/虾片/ming.png', x:  137, y:  839, w: 120, rot: 230, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/stone.png', x:  321, y:  839, w: 120, rot: 119, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/masa.png', x:  561, y:  839, w: 120, rot:  63, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/monster.png', x:  441, y:  839, w: 120, rot:  69, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/stone.png', x:  229, y:  761, w: 120, rot:  15, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/masa.png', x:  500, y:  735, w: 120, rot: 313, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ashin.png', x:  380, y:  735, w: 120, rot: 156, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ashin.png', x:  118, y:  715, w: 120, rot: 289, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ashin.png', x:  225, y:  642, w: 120, rot:  43, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/masa.png', x:  561, y:  631, w: 120, rot: 178, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ming.png', x:  441, y:  631, w: 120, rot: 238, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/masa.png', x:  118, y:  586, w: 120, rot: 217, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/masa.png', x:  330, y:  584, w: 120, rot: 219, showFrame: true, framePadX: 0, framePadY: 0, sublabel: 'Masa\nBass\n19770425', frameCornersOnly: true, frameSameDir: true },
  { file: 'resources/虾片/stone.png', x:  225, y:  522, w: 120, rot:  16, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ming.png', x:  561, y:  511, w: 120, rot:  88, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ming.png', x:  441, y:  511, w: 120, rot: 198, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/monster.png', x:  118, y:  466, w: 120, rot: 150, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/monster.png', x:  330, y:  464, w: 120, rot: 193, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/stone.png', x:  225, y:  402, w: 120, rot:  94, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/ming.png', x:  511, y:  402, w: 120, rot: 352, showFrame: true, framePadX: 0, framePadY: 0, sublabel: 'Ming\nDrum\n19730728', frameCornersOnly: true, frameSameDir: true },
  { file: 'resources/虾片/monster.png', x:  398, y:  363, w: 120, rot: 244, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/stone.png', x:  119, y:  346, w: 120, rot:  46, showFrame: true, framePadX: 0, framePadY: 0, sublabel: 'Stone\nGuitar\n19751211', frameCornersOnly: true, frameSameDir: true },
  { file: 'resources/虾片/ashin.png', x:  294, y:  304, w: 120, rot: 181, showFrame: false, framePadX: 0, framePadY: 0, sublabel: '' },
  { file: 'resources/虾片/monster.png', x:  187, y:  248, w: 120, rot:  32, showFrame: true, framePadX: 0, framePadY: 0, sublabel: 'Monster\nGuitar\n19761128', frameCornersOnly: true, frameSameDir: true },
  { file: 'resources/虾片/ashin.png', x:  118, y:  150, w: 120, rot: 323, showFrame: true, framePadX: 0, framePadY: 0, sublabel: 'Ashin\nVocal\n19751206', frameCornersOnly: true, frameSameDir: true },
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
          x: 82,
          y: 310,
          fontSize: 32,
          fontFamily: "ChenYuluoyan",
          color: COLOR_BLUE,
          wrapWidth: 550,
          lineHeight: 34,
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
