import { PageConfig } from "../lib/types";
import { COLOR_BLUE, COLOR_GREEN } from "../lib/typography";

const bg_color = "#fff";
const text_color = COLOR_BLUE;

const page: PageConfig = {
  id: "page-00",
  toTraditional: true,
  inkBleedRadius: 0,
  left: { bgColor: bg_color },
  right: { bgColor: bg_color },
  backgroundGrid: {
    color: COLOR_GREEN,
    step: 28,
    lineWidth: 10,
    blur: 10,
    opacity: 1,
    page: "both",
    marginX: 0.05,
    marginTop: 0.05,
    marginBottom: 0,
    halftone: {
      spacing: 4,
      maxDotSize: 2,
    },
  },
  spread: {
    halftones: [
      {
        text: "FIELD NOTES",
        fontSize: 120,
        fontFamily: "3270NerdFont-Regular",
        blur: 7,
        x: 1020,
        y: 100,
        w: 660,
        color: text_color,
        spacing: 4,
        maxDotSize: 2,
        bold: true,
        scaleY: 4,
      },
      // {
      //   file: "resources/虾片/mayday_logo_bold.png",
      //   x: 668,
      //   y: 690,
      //   w: 1000,
      //   blur: 40,
      //   color: text_color,
      //   spacing: 4,
      //   maxDotSize: 2,
      // },
    ],
  },
};

export default page;
