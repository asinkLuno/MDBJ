import type { PageConfig, TrajectoryPath, Annotation } from "../lib/types";
import { COLOR_BLACK, COLOR_DEFAULT } from "../lib/typography";

const COLOR_RED_VINTAGE = "#8B2020"; // deep warm crimson — antique/archival feel

const SONGS_5525 = [
  "OAOA",
  "孫悟空",
  "入陣曲",
  "乾杯",
  "瘋狂世界",
  "有些事現在不做一輩子都不會做了",
  "約翰藍儂",
  "志明與春嬌",
  "終結孤單",
  "憨人",
  "人生海海",
  "相信",
  "九號球",
  "恆星的恆心",
  "時光機",
  "讓我照顧你",
  "回來吧",
  "天使",
  "一千個世紀",
  "我心中尚未崩壞的地方",
  "我不願讓你一個人",
  "諾亞方舟",
  "成名在望",
  "DNA",
  "派對動物",
  "離開地球表面",
  "戀愛ING",
  "任性",
  "突然好想你",
  "轉眼",
  "任意門",
];

const SONGS_5526 = [
  "OAOA",
  "孫悟空",
  "盛夏光年",
  "乾杯",
  "終結孤單",
  "有些事現在不做一輩子都不會做了",
  "約翰藍儂",
  "成名在望",
  "如果我們不曾相遇",
  "第二人生",
  "星空",
  "我心中尚未崩壞的地方",
  "最重要的小事",
  "超人",
  "九號球",
  "恆星的恆心",
  "時光機",
  "相信",
  "人生海海",
  "愛情萬歲",
  "瘋狂世界",
  "軋車",
  "派對動物",
  "離開地球表面",
  "戀戀ING",
  "任性",
  "突然好想你",
  "轉眼",
  "任意門",
];

const SONG_RELEASE_DATES: Record<string, string> = {
  OAOA: "2011-12-16",
  孫悟空: "2004-11-05",
  入陣曲: "2013-12-30",
  乾杯: "2011-12-16",
  瘋狂世界: "1999-07-07",
  有些事現在不做一輩子都不會做了: "2011-12-16",
  約翰藍儂: "2004-11-05",
  志明與春嬌: "1999-07-07",
  終結孤單: "2000-07-07",
  憨人: "2000-07-07",
  人生海海: "2001-07-06",
  相信: "2001-07-06",
  九號球: "2003-11-11",
  恆星的恆心: "2003-11-11",
  時光機: "2003-11-11",
  讓我照顧你: "2004-11-05",
  回來吧: "2004-11-05",
  天使: "2006-12-29",
  一千個世紀: "2006-12-29",
  我心中尚未崩壞的地方: "2008-10-23",
  我不願讓你一個人: "2011-12-16",
  諾亞方舟: "2011-12-16",
  成名在望: "2016-07-21",
  DNA: "2009-06-17",
  派對動物: "2016-07-21",
  離開地球表面: "2007-07-20",
  戀愛ING: "2005-08-26",
  戀戀ING: "2005-08-26",
  任性: "2022-11-01",
  突然好想你: "2008-10-23",
  轉眼: "2016-07-21",
  任意門: "2016-07-21",
  盛夏光年: "2006-10-13",
  如果我們不曾相遇: "2016-07-21",
  第二人生: "2011-12-16",
  星空: "2011-12-16",
  最重要的小事: "2006-12-29",
  超人: "2004-11-05",
  愛情萬歲: "2000-07-07",
  軋車: "1999-07-07",
};

function getYearValue(song: string): number {
  const dateStr = SONG_RELEASE_DATES[song];
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  return date.getFullYear() + date.getMonth() / 12 + date.getDate() / 365;
}

// 逆时针旋转90度后的坐标系 (CCW 90 deg from previous layout)
// Time (Y) moves LEFT along the short edge
// 5525 (X) moves UP along the long edge
// 5526 (Z) moves DOWN-RIGHT for depth
//
// Left page bounds: x ∈ [0, 680], y ∈ [0, 1036] (ref px), margin ~30px
// Chart footprint:
//   width  = TIME_SCALE*24 + Z_SCALE*sin36°*30 = 15*24 + 14*0.588*30 ≈ 607
//   height = X_SCALE*32   + Z_SCALE*cos36°*30 = 18*32 + 14*0.809*30 ≈ 916
// Origin: left ≥ 60, right ≤ 667, top ≥ 64, bottom ≤ 980
const ORIGIN_X = 420;
const ORIGIN_Y = 560;
const TIME_SCALE = 15; // px per year (Time goes left)
const X_SCALE = 16; // px per song (5525 goes up)
const Z_SCALE = 16; // px per song (5526 goes down-right)
const ANGLE = Math.PI / 6; // 30° — steeper depth, more vertical spread per step

// Non-linear time mapping: 2016+ is compressed to 1/4 scale
// (only 任性 in 2022 and a few 2016 songs live there)
const YEAR_BREAK = 2016;
const YEAR_COMPRESS = 0.25;

function yearToVisual(year: number): number {
  if (year <= YEAR_BREAK) return year - 1999;
  return YEAR_BREAK - 1999 + (year - YEAR_BREAK) * YEAR_COMPRESS;
}

function project(x: number, y: number, z: number) {
  const yearOffset = yearToVisual(y);
  return {
    // Time goes left (-), Z goes right (+)
    x: ORIGIN_X - yearOffset * TIME_SCALE + z * Z_SCALE * Math.sin(ANGLE),
    // 5525 goes up (-), Z goes down (+)
    y: ORIGIN_Y - x * X_SCALE + z * Z_SCALE * Math.cos(ANGLE),
  };
}

const trajectories: TrajectoryPath[] = [];
const annotations: Annotation[] = [];

// Grid lines
for (let y = 2000; y <= 2023; y += 1) {
  const isMajor = y % 5 === 0;
  trajectories.push({
    points: [project(0, y, 0), project(32, y, 0)],
    color: "rgba(200, 200, 200, 0.2)",
    lineWidth: isMajor ? 1.0 : 0.5,
    dash: isMajor ? [] : [2, 2],
  });
  trajectories.push({
    points: [project(0, y, 0), project(0, y, 30)],
    color: "rgba(200, 200, 200, 0.2)",
    lineWidth: isMajor ? 1.0 : 0.5,
    dash: isMajor ? [] : [2, 2],
  });
}

// Axes
trajectories.push({
  points: [project(0, 1999, 0), project(0, 2023, 0)],
  color: COLOR_BLACK,
  lineWidth: 1.5,
  dash: [],
});
trajectories.push({
  points: [project(0, 1999, 0), project(32, 1999, 0)],
  color: COLOR_BLACK,
  lineWidth: 1.5,
  dash: [],
});
trajectories.push({
  points: [project(0, 1999, 0), project(0, 1999, 30)],
  color: COLOR_BLACK,
  lineWidth: 1.5,
  dash: [],
});

// 5525 line
const points5525 = SONGS_5525.map((song, i) =>
  project(i + 1, getYearValue(song), 0),
);

// 5526 line
const points5526 = SONGS_5526.map((song, i) =>
  project(0, getYearValue(song), i + 1),
);

trajectories.push({
  points: points5525,
  color: COLOR_DEFAULT,
  lineWidth: 2.5,
});

trajectories.push({
  points: points5526,
  color: COLOR_RED_VINTAGE,
  lineWidth: 2.5,
});

// Song labels for 5525 — directly right of each point, no stagger
const LABEL_W = 65; // "YYYY-MM-DD" at 10px ≈ 60px
const songAnnotations5525 = SONGS_5525.map((song, idx) => {
  const date = SONG_RELEASE_DATES[song] ?? "";
  const p = project(idx + 1, getYearValue(song), 0);
  return {
    x: p.x + 4,
    y: p.y - LABEL_W / 2,
    w: LABEL_W,
    h: 10,
    label: date,
    color: COLOR_BLACK,
    noFrame: true,
    angle: -90,
    fontSize: 10,
    fontFamily: "3270NerdFont-Regular",
  };
});

// Song labels for 5526 — directly left of each point, no stagger
const songAnnotations5526 = SONGS_5526.map((song, idx) => {
  const date = SONG_RELEASE_DATES[song] ?? "";
  const p = project(0, getYearValue(song), idx + 1);
  return {
    x: p.x - 14,
    y: p.y - LABEL_W / 2,
    w: LABEL_W,
    h: 10,
    label: date,
    color: COLOR_RED_VINTAGE,
    noFrame: true,
    angle: -90,
    fontSize: 10,
    fontFamily: "3270NerdFont-Regular",
  };
});

// Legend — placed bottom-left of chart area
const legendX = project(0, 2023, 0).x - 5; // near time-axis left end
const legendY = ORIGIN_Y + 30;
const legendAnnotations = [
  {
    x: legendX - 40,
    y: legendY,
    w: 65,
    h: 10,
    label: "5525 (55場25日)",
    color: COLOR_DEFAULT,
    noFrame: true,
    angle: -90,
    fontSize: 10,
    fontFamily: "3270NerdFont-Regular",
  },
  {
    x: legendX - 40,
    y: legendY + 20,
    w: 65,
    h: 10,
    label: "5526 (55場26日)",
    color: COLOR_RED_VINTAGE,
    noFrame: true,
    angle: -90,
    fontSize: 10,
    fontFamily: "3270NerdFont-Regular",
  },
];

// Legend line swatches
trajectories.push({
  points: [
    { x: legendX - 2, y: legendY + 22 },
    { x: legendX - 2, y: legendY + 48 },
  ],
  color: COLOR_DEFAULT,
  lineWidth: 2.5,
  dash: [],
});
trajectories.push({
  points: [
    { x: legendX - 2, y: legendY + 62 },
    { x: legendX - 2, y: legendY + 88 },
  ],
  color: COLOR_RED_VINTAGE,
  lineWidth: 2.5,
  dash: [],
});

const page: PageConfig = {
  id: "page-05",
  toTraditional: false,
  leftPhotos: [],
  dotMatrix: {
    points: [
      ...points5525.map((p) => ({
        x: p.x,
        y: p.y,
        color: COLOR_DEFAULT,
        size: 3,
      })),
      ...points5526.map((p) => ({
        x: p.x,
        y: p.y,
        color: COLOR_RED_VINTAGE,
        size: 3,
      })),
    ],
  },
  rightSections: [
    {
      text: "5525 vs 5526: Release Chronology",
      options: {
        fontSize: 24,
        color: "#333333",
        x: 50,
        y: 840, // Moved to bottom-left empty space
        bold: true,
        fontFamily: "3270NerdFont-Regular",
        angle: -90,
      },
    },
    {
      text: "Y: Time (1999 - 2023)\nX: 5525 Songs (Red)\nZ: 5526 Songs (Blue)",
      options: {
        fontSize: 14,
        color: "#666666",
        x: 90, // Shifted to make room
        y: 880,
        lineHeight: 20,
        fontFamily: "3270NerdFont-Regular",
        angle: -90,
      },
    },
  ],
  trajectories,
  annotations: [
    // Axis + year labels: rotated -90°
    ...[
      ...annotations,
      {
        x: project(0, 2023, 0).x + 5,
        y: project(0, 2023, 0).y - 11,
        w: 40,
        h: 10,
        label: "TIME",
        color: COLOR_BLACK,
        fontSize: 10,
        fontFamily: "3270NerdFont-Regular",
      },
    ].map((a) => ({ ...a, noFrame: true, angle: -90 })),
    // Song labels: small font, staggered, angle=-90
    ...songAnnotations5525,
    ...songAnnotations5526,
    ...legendAnnotations,
  ],
};

export default page;
