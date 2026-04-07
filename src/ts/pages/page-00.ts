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
  halftones: [
    {
      text: "FIELD NOTEBOOK",
      fontSize: 120,
      fontFamily: "3270NerdFont-Regular",
      blur: 4,
      x: 1020, // Center of the right page
      y: 420,
      w: 580,
      color: COLOR_BLUE,
      spacing: 2,
      maxDotSize: 1,
    },
    {
      file: "resources/虾片/guided_mayday_logo.png",
      x: 1020,
      y: 650,
      w: 400,
      color: COLOR_BLUE,
      spacing: 8,
      maxDotSize: 5,
    },
  ],
};

export default page;
