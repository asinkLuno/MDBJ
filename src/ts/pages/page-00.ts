import { PageConfig } from "../lib/types";
import { COLOR_BLUE } from "../lib/typography";

const page: PageConfig = {
  id: "page-00",
  toTraditional: true,
  inkBleedRadius: 2,
  leftPhotos: [],
  rightSections: [],
  halftone: {
    file: "resources/虾片/guided_mayday_logo.png",
    x: 680, // Center of the spread (REF_W)
    y: 518, // Center of the spread (REF_H / 2)
    w: 600,
    color: COLOR_BLUE,
    spacing: 8,
    maxDotSize: 4,
  },
};

export default page;
