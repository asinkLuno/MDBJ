import { PageConfig } from "../lib/types";
import { COLOR_BLUE } from "../lib/typography";

const page: PageConfig = {
  id: "page-00",
  toTraditional: true,
  inkBleedRadius: 0,
  leftBgColor: "#fff",
  rightBgColor: "#fff",
  leftPhotos: [],
  rightSections: [],
  halftone: {
    file: "resources/虾片/guided_mayday_logo.png",
    x: 1020, // Center of the right page (680 + 340)
    y: 611, // Bottom-aligned: 1036 - (680 * 320/256 / 2)
    w: 680,
    color: COLOR_BLUE,
    spacing: 8,
    maxDotSize: 5,
  },
};

export default page;
