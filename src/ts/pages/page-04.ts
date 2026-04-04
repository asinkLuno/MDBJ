import type { PageConfig, SpreadPhotoLayout } from "../lib/types";

const HAND = "resources/虾片/hand_transparent.png";

// Shape: 「手借住虾片」— faces fly in from the right and pile up against the hand.
// Split into facesBehind (drawn under the hand) and facesInFront (drawn on top).
// Calculated via Python pymunk simulation.

const facesBehind: SpreadPhotoLayout[] = [
  { file: "resources/虾片/stone.png", x: 149, y: 421, w: 134, rot: 38 },
  { file: "resources/虾片/masa.png", x: 356, y: 318, w: 131, rot: 269 },
  { file: "resources/虾片/ming.png", x: 149, y: 666, w: 137, rot: 294 },
  { file: "resources/虾片/monster.png", x: 246, y: 485, w: 144, rot: 238 },
  { file: "resources/虾片/masa.png", x: 445, y: 856, w: 127, rot: 179 },
  { file: "resources/虾片/ming.png", x: 262, y: 251, w: 124, rot: 43 },
  { file: "resources/虾片/ming.png", x: 149, y: 280, w: 123, rot: 92 },
  { file: "resources/虾片/stone.png", x: 149, y: 550, w: 139, rot: 0 },
];

const facesInFront: SpreadPhotoLayout[] = [
  { file: "resources/虾片/ashin.png", x: 366, y: 85, w: 109, rot: 93 },
  { file: "resources/虾片/mayday.png", x: 781, y: 956, w: 100, rot: 7 },
  { file: "resources/虾片/masa.png", x: 580, y: 525, w: 131, rot: 13 },
  { file: "resources/虾片/ming.png", x: 778, y: 272, w: 104, rot: 319 },
  { file: "resources/虾片/monster.png", x: 876, y: 744, w: 102, rot: 11 },
  { file: "resources/虾片/ashin.png", x: 830, y: 851, w: 102, rot: 314 },
  { file: "resources/虾片/mayday.png", x: 761, y: 754, w: 112, rot: 350 },
  { file: "resources/虾片/stone.png", x: 636, y: 193, w: 109, rot: 134 },
  { file: "resources/虾片/ashin.png", x: 992, y: 744, w: 100, rot: 118 },
  { file: "resources/虾片/mayday.png", x: 746, y: 155, w: 100, rot: 254 },
  { file: "resources/虾片/ming.png", x: 715, y: 860, w: 111, rot: 3 },
  { file: "resources/虾片/monster.png", x: 791, y: 387, w: 108, rot: 336 },
  { file: "resources/虾片/stone.png", x: 149, y: 956, w: 117, rot: 182 },
  { file: "resources/虾片/ashin.png", x: 671, y: 680, w: 121, rot: 7 },
  { file: "resources/虾片/mayday.png", x: 504, y: 956, w: 117, rot: 98 },
  { file: "resources/虾片/masa.png", x: 516, y: 747, w: 131, rot: 329 },
  { file: "resources/虾片/monster.png", x: 658, y: 79, w: 100, rot: 144 },
  { file: "resources/虾片/stone.png", x: 857, y: 187, w: 100, rot: 87 },
  { file: "resources/虾片/ashin.png", x: 908, y: 515, w: 101, rot: 354 },
  { file: "resources/虾片/mayday.png", x: 262, y: 135, w: 114, rot: 38 },
  { file: "resources/虾片/masa.png", x: 149, y: 164, w: 114, rot: 61 },
  { file: "resources/虾片/monster.png", x: 792, y: 512, w: 111, rot: 22 },
  { file: "resources/虾片/stone.png", x: 689, y: 566, w: 121, rot: 303 },
  { file: "resources/虾片/ashin.png", x: 946, y: 851, w: 100, rot: 13 },
  { file: "resources/虾片/mayday.png", x: 680, y: 335, w: 115, rot: 33 },
  { file: "resources/虾片/masa.png", x: 562, y: 640, w: 132, rot: 5 },
  { file: "resources/虾片/ming.png", x: 573, y: 291, w: 120, rot: 321 },
  { file: "resources/虾片/monster.png", x: 1001, y: 583, w: 100, rot: 313 },
  { file: "resources/虾片/ashin.png", x: 779, y: 639, w: 112, rot: 28 },
  { file: "resources/虾片/mayday.png", x: 625, y: 787, w: 121, rot: 314 },
  { file: "resources/虾片/masa.png", x: 694, y: 450, w: 119, rot: 56 },
  { file: "resources/虾片/ming.png", x: 895, y: 630, w: 102, rot: 133 },
  { file: "resources/虾片/monster.png", x: 897, y: 956, w: 100, rot: 23 },
  { file: "resources/虾片/stone.png", x: 587, y: 406, w: 126, rot: 314 },
];

const page: PageConfig = {
  id: "page-04",
  toTraditional: false,
  leftPhotos: [],
  rightSections: [],
  spreadPhotos: [
    // Layer order: faces behind → hand → faces in front
    ...facesBehind,
    {
      file: HAND,
      x: 290,
      y: 590,
      w: 420,
      rot: -6,
      shadowBlur: 14,
      shadowOffsetX: 5,
      shadowOffsetY: 8,
    },
    ...facesInFront,
  ],
};

export default page;
