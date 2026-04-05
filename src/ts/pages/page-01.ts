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
  "戀愛ING",
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
const annotations: Annotation[] = [];

// ================= 背景色块区域 =================
for (let x = 8; x <= 22.5; x += 0.5) {
  trajectories.push({
    points: [project(x, 1999, 0), project(x, 2024.5, 0)],
    color: "rgba(68, 85, 238, 0.12)",
    lineWidth: 9.5,
    dash: [],
  });
}

for (let z = 8; z <= 22; z += 0.5) {
  trajectories.push({
    points: [project(0, 1999, z), project(0, 2024.5, z)],
    color: "rgba(238, 68, 85, 0.12)",
    lineWidth: 8.5,
    dash: [],
  });
}
// =================================================

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
const points5525 = SONGS_5525.map((song, i) =>
  project(i + 1, getYearValue(song), 0),
);
const points5526 = SONGS_5526.map((song, i) =>
  project(0, getYearValue(song), i + 1),
);

trajectories.push({
  points: points5525,
  color: COLOR_DEFAULT,
  lineWidth: 1.0,
  dash: [3, 3],
});
trajectories.push({
  points: points5526,
  color: COLOR_RED_ACCENT,
  lineWidth: 1.0,
  dash: [3, 3],
});

// ================= 标签 & 图例 (仅排版优化) =================

// 修改：過濾掉連續相同的日期，只標記第一個
let lastDate5525: string | null = null;
const songAnnotations5525: Annotation[] = [];
SONGS_5525.forEach((song, idx) => {
  const currentDate = SONG_RELEASE_DATES[song] ?? "";
  if (currentDate !== lastDate5525) {
    const p = project(idx + 1, getYearValue(song), 0);
    songAnnotations5525.push({
      x: p.x + 8, // 向外推，避免与散点重叠
      y: p.y - 25, // 微调居中
      w: 55,
      h: 10,
      label: currentDate,
      color: COLOR_DEFAULT,
      noFrame: true,
      angle: -90,
      fontSize: 9, // 缩小字号，增强精密感
      fontFamily: "3270NerdFont-Regular",
    });
    lastDate5525 = currentDate; // 更新上一個日期
  }
});

// 修改：過濾掉連續相同的日期，只標記第一個
let lastDate5526: string | null = null;
const songAnnotations5526: Annotation[] = [];
SONGS_5526.forEach((song, idx) => {
  const currentDate = SONG_RELEASE_DATES[song] ?? "";
  if (currentDate !== lastDate5526) {
    const p = project(0, getYearValue(song), idx + 1);
    songAnnotations5526.push({
      x: p.x - 16, // 向外推
      y: p.y - 25,
      w: 55,
      h: 10,
      label: currentDate,
      color: COLOR_RED_ACCENT,
      noFrame: true,
      angle: -120, // 跟随 z 轴方向（atan2(cos(π/6), sin(π/6)) = 60°）
      fontSize: 9, // 缩小字号
      fontFamily: "3270NerdFont-Regular",
    });
    lastDate5526 = currentDate; // 更新上一個日期
  }
});

const axisAnnotations: Annotation[] = [
  {
    x: pTimeEnd.x - 30,
    y: pTimeEnd.y - 50,
    w: 60,
    h: 10,
    label: "TIME [YR]", // 增加工程感代号
    color: COLOR_BLACK,
    noFrame: true,
    bold: true,
    angle: -90,
    fontSize: 14, // 缩小字号
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
    angle: -120, // 跟随 z 轴方向（atan2(cos(π/6), sin(π/6)) = 60°）
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
    label: "FIG.1 - RELEASE CHRONOLOGY (5525 v 5526)", // 全大写前缀编号
    color: "#333333",
    fontSize: 18, // 收敛标题大小，作为图框标注
    bold: true,
    fontFamily: "3270NerdFont-Regular",
    angle: -90,
    noFrame: true,
  },
];

// ================= 在背景图上增加趋势说明文字 =================
// 取得蓝色块大致中上方的坐标，悬浮文本
const pBlueTextCenter = project(18, 2010, 0);
// 取得红色块大致中上方的坐标，悬浮文本
const pRedTextCenter = project(0, 2010, 18);

const trendTextAnnotations: Annotation[] = [
  {
    x: pBlueTextCenter.x - 275, // 微调偏移量放置在色块旁
    y: pBlueTextCenter.y,
    w: 160,
    h: 12,
    label: "TREND: ASCENDING [+]",
    color: "rgba(68, 85, 238, 0.75)",
    noFrame: true,
    bold: true,
    angle: -90,
    fontSize: 14, // 说明文字字号介于数据点和坐标轴之间
    fontFamily: "3270NerdFont-Regular",
  },
  {
    x: pRedTextCenter.x - 300,
    y: pRedTextCenter.y - 20,
    w: 160,
    h: 12,
    label: "TREND: DESCENDING [-]",
    color: "rgba(238, 68, 85, 0.75)",
    noFrame: true,
    bold: true,
    angle: -120, // 跟随 z 轴方向（atan2(cos(π/6), sin(π/6)) = 60°）
    fontSize: 14,
    fontFamily: "3270NerdFont-Regular",
  },
];

// ================= 生成 PageConfig =================
const page: PageConfig = {
  id: "page-01",
  toTraditional: true,
  leftPhotos: [],
  dotMatrix: {
    points: [
      // 保持原始精确点位，不生成随机墨迹
      ...points5525.map((p) => ({
        x: p.x,
        y: p.y,
        color: COLOR_DEFAULT,
        size: 4,
      })),
      ...points5526.map((p) => ({
        x: p.x,
        y: p.y,
        color: COLOR_RED_ACCENT,
        size: 4,
      })),
    ],
  },
  rightSections: [
    {
      text: "歌曲发行年份的分布图谱显示\n5525 与 5526 在演变趋势上存在显著差异\n5525 在蓝色背景标注的观测区间内呈现增长趋势\n而 5526 呈现明显递减趋势\n这是否说明 5525 是顺时间而行而 5526 是逆时间而行？？？",
      options: {
        x: 42,
        y: 764 - 39,
        fontSize: 36,
        fontFamily: "ChenYuluoyan",
        color: COLOR_DEFAULT,
        wrapWidth: 600,
        lineHeight: 39,
      },
    },
  ],
  trajectories,
  annotations: [
    ...annotations.map((a) => ({ ...a, noFrame: true, angle: -90 })),
    ...songAnnotations5525,
    ...songAnnotations5526,
    ...axisAnnotations,
    ...inChartTitleAndLegend,
    ...trendTextAnnotations, // 加入图上的趋势说明文字
  ],
};

export default page;
