import type { PageConfig } from '../lib/types';

const page: PageConfig = {
  id: 'page-02',
  toTraditional: true,
  leftPhotos: [
    {
      file: 'resources/虾片/mayday_3d_dithered.png',
      x: 80,
      y: 180,
      w: 520,
      rot: 0,
      tapes: [
        { idx: 0, offsetX: -0.38, side: 'top',    tapeWidth: 0.22 }, // top-left
        { idx: 3, offsetX:  0.38, side: 'top',    tapeWidth: 0.22 }, // top-right
        { idx: 8, offsetX: -0.38, side: 'bottom', tapeWidth: 0.22 }, // bottom-left
        { idx: 2, offsetX:  0.38, side: 'bottom', tapeWidth: 0.22 }, // bottom-right
      ],
    },
  ],
  rightPhotos: [
    {
      file: 'resources/虾片/ashin.png',
      x: 30,
      y: 60,
      w: 160,
      rot: 2,
      tapes: [{ idx: 1, offsetX: 0.05, label: '阿信' }],
    },
    {
      file: 'resources/虾片/masa.png',
      x: 30,
      y: 250,
      w: 160,
      rot: -3,
      tapes: [{ idx: 5, offsetX: -0.05, label: '瑪莎' }],
    },
    {
      file: 'resources/虾片/ming.png',
      x: 30,
      y: 440,
      w: 160,
      rot: 4,
      tapes: [{ idx: 2, offsetX: 0.02, label: '品冠' }],
    },
    {
      file: 'resources/虾片/monster.png',
      x: 30,
      y: 630,
      w: 160,
      rot: -2,
      tapes: [{ idx: 7, offsetX: -0.03, label: '怪獸' }],
    },
    {
      file: 'resources/虾片/stone.png',
      x: 30,
      y: 820,
      w: 160,
      rot: 3,
      tapes: [{ idx: 4, offsetX: 0.04, label: '石頭' }],
    },
  ],
  annotations: [
    // Estimated face locations in mayday_3d_dithered.png (relative to its own placement on LEFT page)
    // left page w: 680, h: 1036. photo: x: 80, y: 180, w: 520, h: 650
    { x: 510 - 20, y: 252, w: 70, h: 80, label: 'ashin', color: '#00aaff', page: 'left' }, // Ashin
    { x: 420 - 20, y: 252, w: 70, h: 80, label: 'ming', color: '#ff8800', page: 'left' }, // Ming
    { x: 340 - 20, y: 260, w: 70, h: 80, label: 'monster', color: '#ff0000', page: 'left' }, // Monster
    { x: 240 - 20, y: 260, w: 70, h: 80, label: 'masa', color: '#ffff00', page: 'left' }, // Masa
    { x: 120 - 20, y: 260, w: 70, h: 80, label: 'stone', color: '#00ff00', page: 'left' }, // Stone
  ],
  rightSections: [],
};

export default page;
