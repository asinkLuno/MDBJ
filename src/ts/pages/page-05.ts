import type { PageConfig, TrajectoryPath, Annotation } from "../lib/types";
import { COLOR_BLACK, COLOR_DEFAULT } from "../lib/typography";

const COLOR_RED_ACCENT = "#ee4455";

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

const ORIGIN_X = 420;
const ORIGIN_Y = 560;
const TIME_SCALE = 15;
const X_SCALE = 16;
const Z_SCALE = 16;
const ANGLE = Math.PI / 6;

function yearToVisual(year: number): number {
  return year - 1999;
}

function project(x: number, y: number, z: number) {
  const yearOffset = yearToVisual(y);
  return {
    x: ORIGIN_X - yearOffset * TIME_SCALE + z * Z_SCALE * Math.sin(ANGLE),
    y: ORIGIN_Y - x * X_SCALE + z * Z_SCALE * Math.cos(ANGLE),
  };
}

function createArrow(
  pStart: { x: number; y: number },
  pEnd: { x: number; y: number },
  color: string,
): TrajectoryPath {
  const dx = pEnd.x - pStart.x;
  const dy = pEnd.y - pStart.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const arrowLen = 8;
  const arrowW = 4;
  return {
    points: [
      {
        x: pEnd.x - arrowLen * ux + arrowW * uy,
        y: pEnd.y - arrowLen * uy - arrowW * ux,
      },
      pEnd,
      {
        x: pEnd.x - arrowLen * ux - arrowW * uy,
        y: pEnd.y - arrowLen * uy + arrowW * ux,
      },
    ],
    color,
    lineWidth: 1.5,
  };
}

const trajectories: TrajectoryPath[] = [];
const annotations: Annotation[] = [];

// ================= 背景色块区域 (最先绘制，确保垫在网格和图表最底部) =================
// 5525 第 8-23 个点对应索引 7-22，即 x 轴的 8 到 23。
// 向外延伸 0.5 的余量包裹，即 7.5 到 23.5。通过横向线段堆叠出完整的矩形高亮区域。
for (let x = 7.5; x <= 23.5; x += 0.5) {
  trajectories.push({
    points: [project(x, 1999, 0), project(x, 2024.5, 0)],
    color: "rgba(68, 85, 238, 0.12)", // 蓝色半透明
    lineWidth: 9.5, // 0.5 步长对应的宽度覆盖
    dash: [],
  });
}

// 5526 第 8-22 个点对应索引 7-21，即 z 轴的 8 到 22。包裹区间 7.5 到 22.5。
// 这里同样通过堆叠横线，完美贴合透视角度，生成倾斜的平行四边形背景。
for (let z = 7.5; z <= 22.5; z += 0.5) {
  trajectories.push({
    points: [project(0, 1999, z), project(0, 2024.5, z)],
    color: "rgba(238, 68, 85, 0.12)", // 红色半透明
    lineWidth: 8.5,
    dash: [],
  });
}
// =======================================================================

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

const pOrigin = project(0, 1999, 0);
const pTimeEnd = project(0, 2024.5, 0);
const pXEnd = project(34, 1999, 0);
const pZEnd = project(0, 1999, 32);

// Axes
trajectories.push({
  points: [pOrigin, pTimeEnd],
  color: COLOR_BLACK,
  lineWidth: 1.5,
});
trajectories.push(createArrow(pOrigin, pTimeEnd, COLOR_BLACK));
trajectories.push({
  points: [pOrigin, pXEnd],
  color: COLOR_BLACK,
  lineWidth: 1.5,
});
trajectories.push(createArrow(pOrigin, pXEnd, COLOR_BLACK));
trajectories.push({
  points: [pOrigin, pZEnd],
  color: COLOR_BLACK,
  lineWidth: 1.5,
});
trajectories.push(createArrow(pOrigin, pZEnd, COLOR_BLACK));

// Data lines
const points5525 = SONGS_5525.map((song, i) =>
  project(i + 1, getYearValue(song), 0),
);
const points5526 = SONGS_5526.map((song, i) =>
  project(0, getYearValue(song), i + 1),
);

trajectories.push({ points: points5525, color: COLOR_DEFAULT, lineWidth: 2.5 });
trajectories.push({
  points: points5526,
  color: COLOR_RED_ACCENT,
  lineWidth: 2.5,
});

// ================= 标签 & 图例 =================
const LABEL_W = 65;

const songAnnotations5525 = SONGS_5525.map((song, idx) => {
  const p = project(idx + 1, getYearValue(song), 0);
  return {
    x: p.x + 4,
    y: p.y - LABEL_W / 2,
    w: LABEL_W,
    h: 10,
    label: SONG_RELEASE_DATES[song] ?? "",
    color: COLOR_DEFAULT,
    noFrame: true,
    angle: -90,
    fontSize: 10,
    fontFamily: "3270NerdFont-Regular",
  };
});

const songAnnotations5526 = SONGS_5526.map((song, idx) => {
  const p = project(0, getYearValue(song), idx + 1);
  return {
    x: p.x - 14,
    y: p.y - LABEL_W / 2,
    w: LABEL_W,
    h: 10,
    label: SONG_RELEASE_DATES[song] ?? "",
    color: COLOR_RED_ACCENT,
    noFrame: true,
    angle: -90,
    fontSize: 10,
    fontFamily: "3270NerdFont-Regular",
  };
});

const axisAnnotations: Annotation[] = [
  {
    x: pTimeEnd.x - 15,
    y: pTimeEnd.y - 12,
    w: 40,
    h: 10,
    label: "TIME",
    color: COLOR_BLACK,
    noFrame: true,
    angle: -90,
    fontSize: 10,
    fontFamily: "3270NerdFont-Regular",
  },
  {
    x: pXEnd.x + 8,
    y: pXEnd.y - 35,
    w: 80,
    h: 10,
    label: "5525 (55場25日)",
    color: COLOR_DEFAULT,
    noFrame: true,
    angle: -90,
    fontSize: 10,
    fontFamily: "3270NerdFont-Regular",
  },
  {
    x: pZEnd.x - 12,
    y: pZEnd.y + 45,
    w: 80,
    h: 10,
    label: "5526 (55場26日)",
    color: COLOR_RED_ACCENT,
    noFrame: true,
    angle: -90,
    fontSize: 10,
    fontFamily: "3270NerdFont-Regular",
  },
];

const inChartTitleAndLegend: Annotation[] = [
  {
    x: 60,
    y: 950,
    w: 400,
    h: 30,
    label: "5525 vs 5526: Release Chronology",
    color: "#333333",
    fontSize: 24,
    bold: true,
    fontFamily: "3270NerdFont-Regular",
    angle: -90,
    noFrame: true,
  },
  {
    x: 100,
    y: 950,
    w: 300,
    h: 20,
    label: "Y: Time (Linear 1999-2023)",
    color: "#666666",
    fontSize: 16,
    bold: true,
    fontFamily: "3270NerdFont-Regular",
    angle: -90,
    noFrame: true,
  },
  {
    x: 125,
    y: 950,
    w: 300,
    h: 20,
    label: "X: 5525 Songs (8th-23rd Highlight)",
    color: COLOR_DEFAULT,
    fontSize: 16,
    bold: true,
    fontFamily: "3270NerdFont-Regular",
    angle: -90,
    noFrame: true,
  },
  {
    x: 150,
    y: 950,
    w: 300,
    h: 20,
    label: "Z: 5526 Songs (8th-22nd Highlight)",
    color: COLOR_RED_ACCENT,
    fontSize: 16,
    bold: true,
    fontFamily: "3270NerdFont-Regular",
    angle: -90,
    noFrame: true,
  },
];

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
        color: COLOR_RED_ACCENT,
        size: 3,
      })),
    ],
  },
  rightSections: [],
  trajectories,
  annotations: [
    ...annotations.map((a) => ({ ...a, noFrame: true, angle: -90 })),
    ...songAnnotations5525,
    ...songAnnotations5526,
    ...axisAnnotations,
    ...inChartTitleAndLegend,
  ],
};

export default page;
