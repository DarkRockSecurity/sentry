/**
 * Typography scale + spacing tokens.
 *
 * Sentry's inline-styles inherited a noisy mix of font-sizes (everything from
 * 9px to 18px). This module is the single source of truth so a future
 * "everything one notch up" decision is a 5-second change.
 *
 * Don't introduce new ad-hoc font sizes — pick from `font` or argue for adding
 * a new tier here.
 */

export const font = {
  /** Page-level h1: SectionHeader main title */
  h1: 20,
  /** Card title (Section block) */
  h2: 14,
  /** Sub-section title inside a card */
  h3: 13,
  /** Body text */
  body: 12,
  /** Secondary body / supporting copy */
  bodySm: 11,
  /** Captions, table headers (uppercase labels) */
  caption: 10,
  /** Micro-labels (badges, status indicators) */
  micro: 9,
} as const;

export const weight = {
  regular: 400,
  medium: 600,
  semibold: 700,
  bold: 800,
} as const;

export const space = {
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 6,
  lg: 8,
  pill: 999,
} as const;

/** Standardized letter-spacing for uppercased labels (caption / micro). */
export const tracking = {
  caps: "0.08em",
  capsWide: "0.14em",
} as const;
