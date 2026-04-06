import type { PageConfig } from "../lib/types";
import { COLOR_BLUE, COLOR_BLACK } from "../lib/typography";
import { REF_W, REF_H } from "../lib/render-utils";

const page: PageConfig = {
  id: "page-00",
  leftBgColor: COLOR_BLUE,
  rightBgColor: COLOR_BLUE,
  toTraditional: false,
  inkBleedRadius: 5,
  leftPhotos: [],
  rightSections: [
    {
      text: "野外记录簿",
      options: {
        x: REF_W / 2,
        y: REF_H / 2,
        fontSize: 80,
        fontFamily: "ChenYuluoyan",
        color: COLOR_BLACK,
        bold: true,
        textAlign: "center",
      },
    },
  ],
};

export default page;
