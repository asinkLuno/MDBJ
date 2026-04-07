import type { PageConfig } from "../lib/types";
import { COLOR_BLUE, COLOR_BLACK } from "../lib/typography";
import { REF_W, REF_H } from "../lib/render-utils";

const page: PageConfig = {
  id: "page-00",
  leftBgColor: COLOR_BLUE,
  rightBgColor: COLOR_BLUE,
  toTraditional: false,
  inkBleedRadius: 10,
  leftPhotos: [],
  rightPhotos: [
    {
      file: "resources/虾片/mayday_logo.png",
      x: REF_W - 120,
      y: REF_H / 2 + 30,
      w: 70,
      rot: 0,
      tapes: [],
      tint: "white",
    },
  ],
  rightSections: [
    {
      text: "FIELD NOTEBOOK",
      options: {
        x: REF_W / 2 + 18,
        y: REF_H / 2 - 10,
        fontSize: 70,
        fontFamily: "3270NerdFont-Regular",
        color: "white",
        bold: true,
        textAlign: "center",
      },
    },
    {
      text: "only for",
      options: {
        x: REF_W / 2 + 30 + 70,
        y: REF_H / 2 + 130,
        fontSize: 40,
        fontFamily: "3270NerdFont-Regular",
        color: "white",
        bold: true,
        textAlign: "center",
      },
    },
  ],
};

export default page;
