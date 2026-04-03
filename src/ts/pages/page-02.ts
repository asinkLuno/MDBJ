import type { PageConfig } from '../lib/types';

const page: PageConfig = {
  id: 'page-02',
  toTraditional: true,
  leftPhotos: [
    {
      file: 'resources/虾片/ashin.png',
      x: 30,
      y: 60,
      w: 160,
      rot: 2,
      tapes: [{ idx: 1, offsetX: 0.05 }],
    },
    {
      file: 'resources/虾片/masa.png',
      x: 30,
      y: 250,
      w: 160,
      rot: -3,
      tapes: [{ idx: 5, offsetX: -0.05 }],
    },
    {
      file: 'resources/虾片/ming.png',
      x: 30,
      y: 440,
      w: 160,
      rot: 4,
      tapes: [{ idx: 2, offsetX: 0.02 }],
    },
    {
      file: 'resources/虾片/monster.png',
      x: 30,
      y: 630,
      w: 160,
      rot: -2,
      tapes: [{ idx: 7, offsetX: -0.03 }],
    },
    {
      file: 'resources/虾片/stone.png',
      x: 30,
      y: 820,
      w: 160,
      rot: 3,
      tapes: [{ idx: 4, offsetX: 0.04 }],
    },
  ],
  rightPhotos: [
    {
      file: 'resources/虾片/mayday_3d.jpg',
      x: 100,
      y: 180,
      w: 520,
      rot: 0,
      tapes: [],
    },
  ],
  annotations: [
    // Estimated face locations in mayday_3d.jpg (relative to its own placement)
    // right page w: 680, h: 1036. photo: x: 100, y: 180, w: 520, h: 650
    { x: 510, y: 252, w: 70, h: 80, label: 'ashin', connectToLeftIdx: 0 }, // Ashin
    { x: 420, y: 252, w: 70, h: 80, label: 'ming', connectToLeftIdx: 2 }, // Ming
    { x: 340, y: 260, w: 70, h: 80, label: 'monster', connectToLeftIdx: 3 }, // Monster
    { x: 240, y: 260, w: 70, h: 80, label: 'masa', connectToLeftIdx: 1 }, // Masa
    { x: 120, y: 260, w: 70, h: 80, label: 'stone', connectToLeftIdx: 4 }, // Stone
  ],
  rightSections: [
    {
      text: '数字结构化扫描：五人组生命特征比对。',
      options: {
        fontSize: 24,
        color: '#00ff00',
        x: 60,
        y: 880,
        lineHeight: 34,
        letterSpacing: -1,
      },
    },
  ],
};

export default page;
