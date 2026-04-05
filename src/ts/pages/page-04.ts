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
const LYRIC_FONT = 15;
const LYRIC_LH = 13.5; // negative leading for overlap
const TITLE_FONT = 16;
const TITLE_LH = 15;
const TITLE_GAP = 0;
const REL_GAP = 0;

const HIGHLIGHTS: CharHighlight[] = [
  { char: "你", color: "#4455ee" },
  { char: "我", color: "#4455ee" },
  { char: "我們", color: "#4455ee" },
  { char: "我们", color: "#4455ee" },
  { char: "你們", color: "#4455ee" },
  { char: "你们", color: "#4455ee" },
];

// ── 3-column layout ──────────────
const COLS = 3;
const COL_X: number[] = [15, 235, 455];
const COL_W: number[] = [210, 210, 210];

const colLayout: ColumnLayout = {
  count: COLS,
  xStarts: COL_X,
  colWidth: COL_W,
};

// ── build ALL sections ────────────────────────────────────────────────────
const allSections: Section[] = [];

for (const song of data.songs) {
  let combinedText = "";
  let combinedArrows: RelationArrow[] = [];
  let currentTokenOffset = 0;

  for (const lineData of song.lines) {
    const tokenWords = lineData.tokens.map((t) => t.word);

    // Add 4 spaces if not first line
    if (combinedText.length > 0) {
      combinedText += "    ";
      // We don't have a way to offset arrows in the renderer easily if we merge,
      // but the renderer uses token lists which are local to the 'RelationArrow'.
      // If the renderer expects ONE RelationArrow per Section, we should keep them as separate sections
      // but remove the visual gaps to make them look merged.
    }

    // Actually, if we want them to look like one block, we can keep them as separate Section objects
    // but set their gap to 0 and ensure they don't have trailing newlines.

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

    allSections.push({
      text: lineData.line + "    ", // 4 spaces as separator
      options: {
        fontSize: LYRIC_FONT,
        color: COLOR_BLACK,
        lineHeight: LYRIC_LH,
        letterSpacing: -1.0,
        gap: 0,
        fontFamily: "zpix",
        relationArrows: arrows,
        dotHighlights:
          lineData.line.includes("我") || lineData.line.includes("你")
            ? HIGHLIGHTS
            : [],
      },
    });
  }

  // Add an empty line between songs
  allSections.push({
    text: " ",
    options: {
      fontSize: LYRIC_FONT,
      lineHeight: LYRIC_LH * 0.8,
      gap: 0,
      fontFamily: "zpix",
    },
  });
}

// ── simulate column fill to find the right/left split point ──────────────
// Approximate canvas: bgRight ≈ bgLeft ≈ 2672 × 4224 → ss ≈ 3.93
const SS = Math.min(2672 / REF_W, 4224 / REF_H);
const maxY = 4224 - 30 * SS;
const startY = 30 * SS;

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
