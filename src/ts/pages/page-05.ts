import type { PageConfig, TrajectoryPath, Annotation } from "../lib/types";

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
const ORIGIN_X = 1120;
const ORIGIN_Y = 740;
const TIME_SCALE = 18; // px per year (Time goes left)
const X_SCALE = 22; // px per song (5525 goes up)
const Z_SCALE = 12; // px per song (5526 goes down-right)
const ANGLE = Math.PI / 5; // 36 degrees for depth

function project(x: number, y: number, z: number) {
  const yearOffset = y - 1999;
  return {
    // Time goes left (-), Z goes right (+)
    x: ORIGIN_X - yearOffset * TIME_SCALE + z * Z_SCALE * Math.sin(ANGLE),
    // 5525 goes up (-), Z goes down (+)
    y: ORIGIN_Y - x * X_SCALE + z * Z_SCALE * Math.cos(ANGLE),
  };
}

const trajectories: TrajectoryPath[] = [];
const annotations: Annotation[] = [];

// Grid lines & Year labels
for (let y = 2000; y <= 2023; y += 1) {
  const isMajor = y % 5 === 0;

  // Vertical grid line (parallel to 5525 plane)
  trajectories.push({
    points: [project(0, y, 0), project(32, y, 0)],
    color: "rgba(200, 200, 200, 0.2)",
    lineWidth: isMajor ? 1.0 : 0.5,
    dash: isMajor ? [] : [2, 2],
  });
  // Depth grid line (parallel to 5526 plane)
  trajectories.push({
    points: [project(0, y, 0), project(0, y, 30)],
    color: "rgba(200, 200, 200, 0.2)",
    lineWidth: isMajor ? 1.0 : 0.5,
    dash: isMajor ? [] : [2, 2],
  });

  // Year label along the Time axis for major years
  if (isMajor) {
    const p = project(0, y, 0);
    annotations.push({
      x: p.x - 15,
      y: p.y + 10,
      w: 35,
      h: 15,
      label: y.toString(),
      color: "rgba(100, 100, 100, 0.8)",
    });
  }
}

// Axes
trajectories.push({
  // Time Axis (Horizontal, Left)
  points: [project(0, 1999, 0), project(0, 2023, 0)],
  color: "#888888",
  lineWidth: 1.5,
});
trajectories.push({
  // 5525 Axis (Vertical, Up)
  points: [project(0, 1999, 0), project(32, 1999, 0)],
  color: "#888888",
  lineWidth: 1.5,
});
trajectories.push({
  // 5526 Axis (Depth, Down-Right)
  points: [project(0, 1999, 0), project(0, 1999, 30)],
  color: "#888888",
  lineWidth: 1.5,
});

// 5525 line
const points5525 = SONGS_5525.map((song, i) =>
  project(i + 1, getYearValue(song), 0),
);
trajectories.push({
  points: points5525,
  color: "#cc2200",
  lineWidth: 2.5,
});

// 5526 line
const points5526 = SONGS_5526.map((song, i) =>
  project(0, getYearValue(song), i + 1),
);
trajectories.push({
  points: points5526,
  color: "#4455ee",
  lineWidth: 2.5,
});

// Song labels for 5525 (X-axis line, pointing up)
const s5525_labels = [
  { idx: 4, label: "瘋狂世界" },
  { idx: 0, label: "OAOA" },
  { idx: 19, label: "我心中尚未崩壞的地方" },
  { idx: 27, label: "任性" },
];
s5525_labels.forEach(({ idx, label }) => {
  const song = SONGS_5525[idx];
  const p = project(idx + 1, getYearValue(song), 0);
  annotations.push({
    x: p.x + 10,
    y: p.y - 8,
    w: 120, // wider for full song name
    h: 16,
    label: label,
    color: "#cc2200",
  });
});

// Song labels for 5526 (Z-axis line, pointing down-right)
const s5526_labels = [
  { idx: 20, label: "瘋狂世界" },
  { idx: 0, label: "OAOA" },
  { idx: 3, label: "乾杯" },
  { idx: 28, label: "任意門" },
];
s5526_labels.forEach(({ idx, label }) => {
  const song = SONGS_5526[idx];
  const p = project(0, getYearValue(song), idx + 1);
  annotations.push({
    x: p.x + 8,
    y: p.y + 5,
    w: 60,
    h: 16,
    label: label,
    color: "#4455ee",
  });
});

const page: PageConfig = {
  id: "page-05",
  toTraditional: false,
  leftPhotos: [],
  dotMatrix: {
    points: [
      ...points5525.map((p) => ({ x: p.x, y: p.y, color: "#cc2200", size: 3 })),
      ...points5526.map((p) => ({ x: p.x, y: p.y, color: "#4455ee", size: 3 })),
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
    ...annotations,
    {
      // 5525 Axis Label
      x: project(32, 1999, 0).x - 22,
      y: project(32, 1999, 0).y - 25,
      w: 45,
      h: 22,
      label: "5525-X",
      color: "#cc2200",
    },
    {
      // 5526 Axis Label
      x: project(0, 1999, 30).x + 10,
      y: project(0, 1999, 30).y,
      w: 45,
      h: 22,
      label: "5526-Z",
      color: "#4455ee",
    },
    {
      // Time Axis Label
      x: project(0, 2023, 0).x - 55,
      y: project(0, 2023, 0).y - 11,
      w: 45,
      h: 22,
      label: "TIME-Y",
      color: "#888888",
    },
  ].map((a) => ({ ...a, noFrame: true, angle: -90 })),
};

export default page;
