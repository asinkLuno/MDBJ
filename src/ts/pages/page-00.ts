import { PageConfig } from "../lib/types";
import { COLOR_BLUE } from "../lib/typography";

const y_offset = 100;
const bg_color = "#fff";
const text_color = COLOR_BLUE;

const page: PageConfig = {
  id: "page-00",
  toTraditional: true,
  inkBleedRadius: 0,
  leftBgColor: bg_color,
  rightBgColor: bg_color,
  leftPhotos: [],
  rightSections: [],
  halftones: [
    {
      text: "FIELD NOTEBOOK",
      fontSize: 120,
      fontFamily: "3270NerdFont-Regular",
      blur: 8,
      x: 1030, // Center of the right page
      y: 420 - y_offset,
      w: 600,
      color: text_color,
      spacing: 2,
      maxDotSize: 1,
      bold: true,
      scaleY: 4,
    },

    {
      text: "for    use only",
      fontSize: 120,
      fontFamily: "3270NerdFont-Regular",
      blur: 8,
      x: 1030, // Center of the right page
      y: 595 - y_offset,
      w: 350,
      color: text_color,
      spacing: 2,
      maxDotSize: 1,
      scaleY: 2,
    },
    {
      file: "resources/虾片/guided_mayday_logo.png",
      x: 965,
      y: 585 - y_offset,
      w: 120,
      blur: 1,
      color: text_color,
      spacing: 2,
      maxDotSize: 1.7,
    },
  ],
};

export default page;
