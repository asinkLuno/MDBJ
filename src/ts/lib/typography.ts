/**
 * Centralised typography constants.
 * All font sizes and colors in the project should reference these values.
 */

/** Ink black — warm dark ink, used for handwritten/archival text */
export const COLOR_BLACK = "#2c1810";

/** Default text color across all pages (blue screen/print style) */
export const COLOR_DEFAULT = "#4455ee";

/** Accent red color for contrast and specific UI elements */
export const COLOR_RED_ACCENT = "#ee4455";

/** Transparent background block colors (based on default blue and accent red) */
export const COLOR_BG_BLUE_TRANS = "rgba(68, 85, 238, 0.12)";
export const COLOR_BG_RED_TRANS = "rgba(238, 68, 85, 0.12)";

/** Solid trend text colors (no transparency) */
export const COLOR_TREND_BLUE = "#4455ee";
export const COLOR_TREND_RED = "#ee4455";

/** Tape labels (band member names on stickers) */
export const FONT_TAPE_LABEL = 32;

/** Annotation labels (names below targeting frames) */
export const FONT_ANNOTATION = 32;

/** Fallback when no fontSize is specified in a section */
export const FONT_SECTION_DEFAULT = 26;

/** Fallback when no fontSize is specified for left texts */
export const FONT_LEFT_TEXT_DEFAULT = 22;
