import type { Annotation } from "./types";

/** Centralised typography constants.
 * All font sizes and colors in the project should reference these values.
 */

/** Ink black — warm dark ink, used for handwritten/archival text */
export const COLOR_BLACK = "#272727";

/** Default text color across all pages (blue screen/print style) */
export const COLOR_BLUE = "#4455ee";

/** Green — background grid accent color */
export const COLOR_GREEN = "#91cbae";

/** Transparent background block colors (based on default blue and accent red) */
export const COLOR_BG_BLUE_TRANS = "rgba(68, 85, 238, 0.12)";

/** Tape labels (band member names on stickers) */
export const FONT_TAPE_LABEL = 32;

/** Annotation labels (names below targeting frames) */
export const FONT_ANNOTATION = 32;

/** Fallback when no fontSize is specified in a section */
export const FONT_SECTION_DEFAULT = 26;

/** Fallback when no fontSize is specified for left texts */
export const FONT_LEFT_TEXT_DEFAULT = 22;

/**
 * Standard page number annotation (fixed style/position at bottom-middle of left page)
 */
export function createPageAnnotation(pageNo: string): Annotation {
  return {
    x: 340, // Left-page middle
    y: 900, // Near bottom (fits B6 REF_H=958)
    w: 0,
    h: 0,
    label: pageNo,
    noFrame: true,
    fontFamily: "ChenYuluoyan",
    fontSize: 36,
    color: COLOR_BLUE,
  };
}
