import { PageConfig } from "../lib/types";
import { COLOR_BLUE } from "../lib/typography";

const y_offset = 100;
const bg_color = "#fff";
const text_color = COLOR_BLUE;

const page: PageConfig = {
  id: "page-00",
  toTraditional: true,
  inkBleedRadius: 0,
  left: { bgColor: bg_color },
  right: { bgColor: bg_color },
  backgroundGrid: {
    color: "rgb(145, 203, 174)",
    step: 17,
    lineWidth: 3,
    blur: 20,
    opacity: 0.8,
    page: "both",
    margin: 40,
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
        x: 1005,
        y: 200 - y_offset,
        w: 660,
        color: text_color,
        spacing: 4,
        maxDotSize: 2,
        bold: true,
        scaleY: 4,
      },
      {
        file: "resources/虾片/mayday_logo.png",
        x: 680,
        y: 765 - y_offset,
        w: 1000,
        blur: 50,
        color: text_color,
        spacing: 4,
        maxDotSize: 2,
      },
    ],
  },
};

export default page;
