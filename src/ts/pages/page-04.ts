import { readFileSync, readdirSync } from "fs";
import * as path from "path";
import type { PageConfig, Section } from "../lib/types";
import { COLOR_BLACK } from "../lib/typography";

const LYRICS_DIR = "resources/lyrics";

function readAlbumText(albumDir: string): string {
  const files = readdirSync(albumDir)
    .filter((f) => f.endsWith(".txt"))
    .sort();
  return files
    .map((f) => readFileSync(path.join(albumDir, f), "utf-8").trim())
    .join(" ")
    .replace(/\n/g, " ")
    .replace(/  +/g, " ");
}

const albums = readdirSync(LYRICS_DIR)
  .filter((d) => /^\d+$/.test(d))
  .sort();

const rightSections: Section[] = [];
for (let i = 0; i < albums.length; i++) {
  rightSections.push({
    text: readAlbumText(path.join(LYRICS_DIR, albums[i])),
    options: {
      fontSize: 12,
      color: COLOR_BLACK,
      lineHeight: 11,
      letterSpacing: -1,
      wrapWidth: 680,
      x: 0,
      ...(i === 0 ? { y: 12 } : { gap: 15 }),
    },
  });
}

const page: PageConfig = {
  id: "page-04",
  toTraditional: false,
  leftPhotos: [],
  rightSections,
};

export default page;
