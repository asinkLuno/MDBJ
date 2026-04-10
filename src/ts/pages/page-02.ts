import type { PageConfig, TrajectoryPath, Annotation } from "../lib/types";
import {
  COLOR_BLACK,
  COLOR_BLUE,
  COLOR_BG_BLUE_TRANS,
  createPageAnnotation,
} from "../lib/typography";

import songData from "../../../resources/song_data.json";
const SONG_RELEASE_DATES = songData.SONG_RELEASE_DATES as Record<string, string>;

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
  "戀愛ING",
  "任性",
  "突然好想你",
  "轉眼",
  "任意門",
];

function getYearValue(song: string): number {
  const dateStr = SONG_RELEASE_DATES[song];
  if (!dateStr) return 0;
  const date = new Date(dateStr);
  return date.getFullYear() + date.getMonth() / 12 + date.getDate() / 365;
}

const ORIGIN_X = 442;
const ORIGIN_Y = 575;
const TIME_SCALE = 16;
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
    dash: [],
  };
}

const trajectories: TrajectoryPath[] = [];

// ================= 背景色块区域 =================
for (let x = 8; x <= 22.5; x += 0.5) {
  trajectories.push({
    points: [project(x, 1999, 0), project(x, 2025, 0)],
    color: COLOR_BG_BLUE_TRANS,
    lineWidth: 9.5,
    dash: [],
  });
}

for (let z = 8; z <= 22; z += 0.5) {
  trajectories.push({
    points: [project(0, 1999, z), project(0, 2025, z)],
    color: COLOR_BG_BLUE_TRANS,
    lineWidth: 8.5,
    dash: [],
  });
}
// =================================================

// Grid lines
for (let y = 2000; y <= 2024; y += 1) {
  const isMajor = y % 5 === 0;
  trajectories.push({
    points: [project(0, y, 0), project(32, y, 0)],
    color: COLOR_BG_BLUE_TRANS,
    lineWidth: isMajor ? 1.0 : 0.75,
    dash: isMajor ? [] : [1, 3],
  });
  trajectories.push({
    points: [project(0, y, 0), project(0, y, 28)],
    color: COLOR_BG_BLUE_TRANS,
    lineWidth: isMajor ? 1.0 : 0.75,
    dash: isMajor ? [] : [1, 3],
  });
}

const pOrigin = project(0, 1999, 0);
const pTimeEnd = project(0, 2025, 0);
const pXEnd = project(32, 1999, 0);
const pZEnd = project(0, 1999, 28);

// Axes
trajectories.push({
  points: [pOrigin, pTimeEnd],
  color: COLOR_BLACK,
  lineWidth: 1.5,
  dash: [],
});
trajectories.push(createArrow(pOrigin, pTimeEnd, COLOR_BLACK));

trajectories.push({
  points: [pOrigin, pXEnd],
  color: COLOR_BLACK,
  lineWidth: 1.5,
  dash: [],
});
trajectories.push(createArrow(pOrigin, pXEnd, COLOR_BLACK));

trajectories.push({
  points: [pOrigin, pZEnd],
  color: COLOR_BLACK,
  lineWidth: 1.5,
  dash: [],
});
trajectories.push(createArrow(pOrigin, pZEnd, COLOR_BLACK));

// ================= 数据线 =================
const points5525 = SONGS_5525.map((song, i) => project(i + 1, getYearValue(song), 0));
const points5526 = SONGS_5526.map((song, i) => project(0, getYearValue(song), i + 1));

trajectories.push({
  points: points5525,
  color: COLOR_BLUE,
  lineWidth: 1.0,
  dash: [6, 2, 1, 2],
});
trajectories.push({
  points: points5526,
  color: COLOR_BLUE,
  lineWidth: 1.0,
  dash: [6, 2, 1, 2],
});

// ================= 标签 & 图例 =================

let lastDate5525: string | null = null;
const songAnnotations5525: Annotation[] = [];
SONGS_5525.forEach((song, idx) => {
  const currentDate = SONG_RELEASE_DATES[song] ?? "";
  if (currentDate !== lastDate5525) {
    const p = project(idx + 1, getYearValue(song), 0);
    songAnnotations5525.push({
      x: p.x + 8,
      y: p.y - 25,
      w: 55,
      h: 10,
      label: currentDate,
      color: COLOR_BLUE,
      noFrame: true,
      angle: -90,
      fontSize: 9,
      fontFamily: "3270NerdFont-Regular",
      bold: true,
    });
    lastDate5525 = currentDate;
  }
});

let lastDate5526: string | null = null;
const songAnnotations5526: Annotation[] = [];
SONGS_5526.forEach((song, idx) => {
  const currentDate = SONG_RELEASE_DATES[song] ?? "";
  if (currentDate !== lastDate5526) {
    const p = project(0, getYearValue(song), idx + 1);
    songAnnotations5526.push({
      x: p.x - 16,
      y: p.y - 25,
      w: 55,
      h: 10,
      label: currentDate,
      color: COLOR_BLUE,
      noFrame: true,
      angle: -120,
      fontSize: 9,
      fontFamily: "3270NerdFont-Regular",
      bold: true,
    });
    lastDate5526 = currentDate;
  }
});

const axisAnnotations: Annotation[] = [
  {
    x: pTimeEnd.x - 30,
    y: pTimeEnd.y - 50,
    w: 60,
    h: 10,
    label: "TIME [YR]",
    color: COLOR_BLACK,
    noFrame: true,
    bold: true,
    angle: -90,
    fontSize: 14,
    fontFamily: "3270NerdFont-Regular",
  },
  {
    x: pXEnd.x - 30,
    y: pXEnd.y - 5,
    w: 80,
    h: 10,
    label: "AXIS: 5525",
    color: COLOR_BLACK,
    noFrame: true,
    bold: true,
    angle: -90,
    fontSize: 14,
    fontFamily: "3270NerdFont-Regular",
  },
  {
    x: pZEnd.x - 30,
    y: pZEnd.y - 30,
    w: 80,
    h: 10,
    label: "AXIS: 5526",
    color: COLOR_BLACK,
    noFrame: true,
    bold: true,
    angle: -120,
    fontSize: 14,
    fontFamily: "3270NerdFont-Regular",
  },
];

const LEGEND_Y = ORIGIN_Y + 390;

const inChartTitleAndLegend: Annotation[] = [
  {
    x: ORIGIN_X - 590,
    y: LEGEND_Y - 170,
    w: 400,
    h: 20,
    label: "FIG.1 - SONGSET (5525 v.s. 5526)",
    color: COLOR_BLACK,
    fontSize: 18,
    bold: true,
    fontFamily: "3270NerdFont-Regular",
    angle: -90,
    noFrame: true,
  },
];

const pBlueTextCenter = project(18, 2010, 0);
const pRedTextCenter = project(0, 2010, 18);

const trendTextAnnotations: Annotation[] = [
  {
    x: pBlueTextCenter.x - 275,
    y: pBlueTextCenter.y,
    w: 160,
    h: 12,
    label: "TREND: ASCENDING [+]",
    color: COLOR_BLUE,
    noFrame: true,
    bold: true,
    angle: -90,
    fontSize: 14,
    fontFamily: "3270NerdFont-Regular",
  },
  {
    x: pRedTextCenter.x - 275,
    y: pRedTextCenter.y - 30,
    w: 160,
    h: 12,
    label: "TREND: DESCENDING [-]",
    color: COLOR_BLUE,
    noFrame: true,
    bold: true,
    angle: -120,
    fontSize: 14,
    fontFamily: "3270NerdFont-Regular",
  },
];

const page: PageConfig = {
  id: "page-02",
  toTraditional: true,
  inkBleedRadius: 1,
  right: {
    sections: [
      {
        text: "图表以Y轴指示发行年份\nX轴与Z轴分别对应歌单5525和5526的曲目序号\n\n发行年份随曲目序号的分布特征显示\n两份歌单的演变趋势具有显著差异\n\n在蓝色背景标注的观测窗口内\n5525呈显著增长趋势\n而5526呈递减趋势\n\n该分布特征提示\n5525的选曲逻辑倾向于时序递进\n而5526则倾向于时序回溯",
        options: {
          x: 42,
          y: 334 + 38 * 2,
          fontSize: 34,
          fontFamily: "ChenYuluoyan",
          color: COLOR_BLUE,
          wrapWidth: 600,
          lineHeight: 36,
        },
      },
    ],
  },
  spread: {
    dotMatrix: {
      points: [
        ...points5525.map((p) => ({
          x: p.x,
          y: p.y,
          color: COLOR_BLUE,
          size: 4,
        })),
        ...points5526.map((p) => ({
          x: p.x,
          y: p.y,
          color: COLOR_BLUE,
          size: 4,
        })),
      ],
    },
    trajectories,
  },
  annotations: [
    ...songAnnotations5525,
    ...songAnnotations5526,
    ...axisAnnotations,
    ...inChartTitleAndLegend,
    ...trendTextAnnotations,
    createPageAnnotation("2"),
  ],
};

export default page;
