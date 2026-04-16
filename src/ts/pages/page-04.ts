import { readFileSync } from "fs";
import type { PageConfig, Section, RelationArrow, CharHighlight, ColumnLayout } from "../lib/types";
import { COLOR_BLACK, COLOR_BLUE, createPageAnnotation } from "../lib/typography";
import { REF_W } from "../lib/context";

const RELATIONS_FILE = "resources/lyrics/pronoun_relations.json";

interface TokenEntry {
  word: string;
  roles: string[];
}
interface RelEntry {
  subject: { word: string; index: number };
  predicate: { word: string; index: number };
  object: { word: string; index: number };
  direction: string;
}
interface LineData {
  line: string;
  tokens: TokenEntry[];
  relations: RelEntry[];
}
interface RelationsData {
  songs: Array<{ title: string; lines: LineData[] }>;
}

const data: RelationsData = JSON.parse(readFileSync(RELATIONS_FILE, "utf-8"));

const LYRIC_FONT = 14;
const LYRIC_LH = 13.5;

const HIGHLIGHTS: CharHighlight[] = [
  { char: "你", color: COLOR_BLUE },
  { char: "我", color: COLOR_BLUE },
];

const COL_MARGIN = 13;
const COL_W = 310;
const COL_GAP = 360 - COL_MARGIN;

const spreadColumns: ColumnLayout = {
  count: 4,
  xStarts: [COL_MARGIN, COL_MARGIN + COL_GAP, REF_W + COL_MARGIN, REF_W + COL_MARGIN + COL_GAP],
  colWidth: [COL_W, COL_W, COL_W, COL_W],
  maxHeight: 930,
  startY: 55,
};

const spreadSections: Section[] = [];

for (const song of data.songs) {
  for (const lineData of song.lines) {
    if (lineData.relations.length === 0) continue;

    const tokenWords = lineData.tokens.map((t) => t.word);

    const arrows: RelationArrow[] = [];
    for (const rel of lineData.relations) {
      arrows.push({
        tokens: tokenWords,
        subjectIdx: rel.subject.index,
        predicateIdx: rel.predicate.index,
        objectIdx: rel.object.index,
        direction: rel.direction as RelationArrow["direction"],
      });
    }

    const jitterX = (Math.random() - 0.5) * 3.0;
    const jitterY = (Math.random() - 0.5) * 2.0;

    spreadSections.push({
      text: lineData.line + "    ",
      options: {
        fontSize: LYRIC_FONT,
        color: COLOR_BLACK,
        lineHeight: LYRIC_LH,
        letterSpacing: -1.0,
        x: jitterX,
        y: jitterY,
        gap: 0,
        fontFamily: "ChenYuluoyan",
        bold: true,
        relationArrows: arrows,
        dotHighlights:
          lineData.line.includes("我") || lineData.line.includes("你") ? HIGHLIGHTS : [],
      },
    });
  }
}

const page: PageConfig = {
  id: "page-04",
  toTraditional: false,
  inkBleedRadius: 0,
  spread: {
    sections: spreadSections,
    columns: spreadColumns,
  },
  annotations: [createPageAnnotation("4")],
};

export default page;
