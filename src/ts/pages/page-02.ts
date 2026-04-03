import type { PageConfig } from '../lib/types';

const page: PageConfig = {
  id: 'page-01',
  toTraditional: true,
  leftPhotos: [
    { file: 'resources/虾片/ashin.png',   x: 25,  y: 320, w: 160, rot:  2, tape: 1, tapeOffsetX:  0.03 },
    { file: 'resources/虾片/masa.png',    x: 240, y: 305, w: 158, rot: -5, tape: 5, tapeOffsetX: -0.04 },
    { file: 'resources/虾片/ming.png',    x: 462, y: 330, w: 155, rot:  3, tape: 2, tapeOffsetX:  0.02 },
    { file: 'resources/虾片/monster.png', x: 55,  y: 545, w: 158, rot: -3, tape: 7, tapeOffsetX: -0.03 },
    { file: 'resources/虾片/stone.png',   x: 375, y: 530, w: 162, rot:  5, tape: 4, tapeOffsetX:  0.05 },
  ],
  rightSections: [
    {
      text: '十八时三十分，\n有一段震耳欲聋的航空器引擎\n随着机械涡轮的轰鸣骤然切断，人声、吉他、鼓精准切入。',
      options: { fontSize: 32, color: '#1a1a1a', x: 70, y: 190, lineHeight: 38, letterSpacing: -4 },
    },
    {
      text: '[异常]：频谱仪底部呈现出大面积真空态——\n完全未捕捉到贝斯波形。经研究员反复拍打并重启设备，\n确认仪器运作正常。',
      options: { fontSize: 32, color: '#8b0000', x: 70, gap: 32, lineHeight: 38, letterSpacing: -4 },
    },
  ],
};

export default page;
