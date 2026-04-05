import { readFileSync } from "fs";
import type {
  PageConfig,
  Section,
  RelationArrow,
  CharHighlight,
  ColumnLayout,
} from "../lib/types";
import { COLOR_BLACK } from "../lib/typography";
import { REF_W, REF_H } from "../lib/render-utils";

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
const LYRIC_FONT = 7;
const LYRIC_LH = 8;
const TITLE_FONT = 7;
const TITLE_LH = 9;
const TITLE_GAP = 5;
const REL_GAP = 4; // extra space above relation lines for the arc

const HIGHLIGHTS: CharHighlight[] = [
  { char: "你", color: "#4455ee" },
  { char: "我", color: "#cc2200" },
];

// ── 4-column layout — 2px gap between cols, 8px left margin ──────────────
const COLS = 4;
const COL_X: number[] = [8, 175, 342, 509];
const COL_W: number[] = [165, 165, 165, 165];

const colLayout: ColumnLayout = {
  count: COLS,
  xStarts: COL_X,
  colWidth: COL_W,
};

// ── build ALL sections ────────────────────────────────────────────────────
const allSections: Section[] = [];

for (const song of data.songs) {
  allSections.push({
    text: `— ${song.title}`,
    options: {
      fontSize: TITLE_FONT,
      color: "#888888",
      lineHeight: TITLE_LH,
      gap: TITLE_GAP,
    },
  });

  for (const lineData of song.lines) {
    const tokenWords = lineData.tokens.map((t) => t.word);
    const hasRelation = lineData.relations.length > 0;
    const hasPronouns =
      lineData.line.includes("我") || lineData.line.includes("你");

    if (hasRelation) {
      const seen = new Set<string>();
      const arrows: RelationArrow[] = [];
      for (const rel of lineData.relations) {
        const key = `${rel.subject.index}-${rel.predicate.index}-${rel.object.index}`;
        if (!seen.has(key)) {
          seen.add(key);
          arrows.push({
            tokens: tokenWords,
            subjectIdx: rel.subject.index,
            predicateIdx: rel.predicate.index,
            objectIdx: rel.object.index,
            direction: rel.direction as RelationArrow["direction"],
          });
        }
      }
      allSections.push({
        text: lineData.line,
        options: {
          fontSize: LYRIC_FONT,
          color: COLOR_BLACK,
          lineHeight: LYRIC_LH,
          letterSpacing: -0.5,
          gap: REL_GAP,
          relationArrows: arrows,
        },
      });
    } else {
      allSections.push({
        text: lineData.line,
        options: {
          fontSize: LYRIC_FONT,
          color: COLOR_BLACK,
          lineHeight: LYRIC_LH,
          letterSpacing: -0.5,
          gap: 0,
          ...(hasPronouns ? { highlights: HIGHLIGHTS } : {}),
        },
      });
    }
  }
}

// ── simulate column fill to find the right/left split point ──────────────
// Approximate canvas: bgRight ≈ bgLeft ≈ 2672 × 4224 → ss ≈ 3.93
const SS = Math.min(2672 / REF_W, 4224 / REF_H);
const maxY = 4224 - 60 * SS;
const startY = 100 * SS;

let col = 0;
let y = startY;
let splitIdx = allSections.length; // default: all on right

for (let i = 0; i < allSections.length; i++) {
  const opts = allSections[i].options ?? {};
  const lh = (opts.lineHeight ?? LYRIC_LH) * SS;
  const gap = (opts.gap ?? 0) * SS;

  if (y + gap + lh > maxY) {
    col++;
    y = startY;
    if (col >= COLS) {
      splitIdx = i;
      break;
    }
  }
  y += gap + lh;
}

const rightSections = allSections.slice(0, splitIdx);
const leftSections = allSections.slice(splitIdx);

const page: PageConfig = {
  id: "page-04",
  toTraditional: false,
  leftPhotos: [],
  leftTexts: [],
  leftSections,
  leftColumns: colLayout,
  rightSections,
  rightColumns: colLayout,
};

export default page;
