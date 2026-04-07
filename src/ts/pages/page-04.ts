import { readFileSync } from "fs";
import type {
  PageConfig,
  Section,
  RelationArrow,
  CharHighlight,
  ColumnLayout,
} from "../lib/types";
import {
  COLOR_BLACK,
  COLOR_BLUE,
  createPageAnnotation,
} from "../lib/typography";
import { REF_W } from "../lib/render-utils";

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

// ── typography ────────────────────────────────────────────────────────────
const LYRIC_FONT = 14;
const LYRIC_LH = 13.5; // negative leading for overlap

const HIGHLIGHTS: CharHighlight[] = [
  { char: "你", color: COLOR_BLUE },
  { char: "我", color: COLOR_BLUE },
];

// ── 4 columns across the full spread (2 per page) ────────────────────────
// xStarts are in spread-space REF coordinates (0–2×REF_W).
// Right-page columns start at REF_W + left-margin.
const COL_MARGIN = 50;
const COL_W = 300;
const COL_GAP = 360 - COL_MARGIN; // = 332: gap between col-0 and col-1 start

const spreadColumns: ColumnLayout = {
  count: 4,
  xStarts: [
    COL_MARGIN,
    COL_MARGIN + COL_GAP,
    REF_W + COL_MARGIN,
    REF_W + COL_MARGIN + COL_GAP,
  ],
  colWidth: [COL_W, COL_W, COL_W, COL_W],
  maxHeight: 980,
  // Extra top margin so relation arrows arcing above the first baseline aren't clipped.
  startY: 90,
};

// ── build ALL sections ────────────────────────────────────────────────────
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

    const jitterX = (Math.random() - 0.5) * 3.0; // range [-1.5, 1.5]
    const jitterY = (Math.random() - 0.5) * 2.0; // range [-1.0, 1.0]

    spreadSections.push({
      text: lineData.line + "    ", // 4 spaces as separator
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
          lineData.line.includes("我") || lineData.line.includes("你")
            ? HIGHLIGHTS
            : [],
      },
    });
  }
}

const page: PageConfig = {
  id: "page-04",
  toTraditional: false,
  inkBleedRadius: 0,
  leftPhotos: [],
  spreadSections,
  spreadColumns,
  annotations: [createPageAnnotation("4")],
};

export default page;
