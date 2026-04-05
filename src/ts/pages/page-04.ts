import { readFileSync, readdirSync } from "fs";
import * as path from "path";
import type { PageConfig, Section, CharHighlight } from "../lib/types";
import { COLOR_BLACK } from "../lib/typography";

const LYRICS_DIR = "resources/lyrics";

const HIGHLIGHTS: CharHighlight[] = [
  { char: "你", color: "#4455ee" },
  { char: "我", color: "#cc2200" },
];

const TEXT_OPTIONS = {
  fontSize: 12,
  color: COLOR_BLACK,
  lineHeight: 11,
  letterSpacing: -1,
  wrapWidth: 620,
  highlights: HIGHLIGHTS,
};

const albums = readdirSync(LYRICS_DIR)
  .filter((d) => /^\d+$/.test(d))
  .sort();

// Collect all matching lines across all albums, deduplicated (first occurrence wins)
const seen = new Set<string>();
const albumLines: string[][] = albums.map((album) =>
  readdirSync(path.join(LYRICS_DIR, album))
    .filter((f) => f.endsWith(".txt"))
    .sort()
    .flatMap((f) =>
      readFileSync(path.join(LYRICS_DIR, album, f), "utf-8")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => {
          if ((!l.includes("你") && !l.includes("我")) || seen.has(l))
            return false;
          seen.add(l);
          return true;
        }),
    ),
);

const leftText = albumLines
  .slice(0, 5)
  .map((lines) => lines.join(" "))
  .filter(Boolean)
  .join("  ");

const rightSections: Section[] = albumLines
  .slice(5)
  .map((lines, i) => ({
    text: lines.join(" "),
    options: { ...TEXT_OPTIONS, x: 30, gap: i === 0 ? 0 : 15 },
  }))
  .filter((s) => s.text.length > 0);

const page: PageConfig = {
  id: "page-04",
  toTraditional: true,
  leftPhotos: [],
  leftTexts: [
    {
      text: leftText,
      x: 30,
      y: 30,
      ...TEXT_OPTIONS,
    },
  ],
  rightSections,
};

export default page;
