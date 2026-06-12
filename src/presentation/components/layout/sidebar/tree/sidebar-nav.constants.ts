export const SUB_NAV_DURATION = 0.32
export const SUB_NAV_EASE = [0.25, 0.1, 0.25, 1] as const
export const SUB_NAV_STAGGER = 0.065

export const SUB_NAV_TREE = {
  /** Aligns with the horizontal center of the parent icon (p-3 + half of size-6). */
  TRUNK_X: 24,
  ROW_HEIGHT: 32,
  /** Visual gap between standalone connectors. */
  ITEM_GAP: 6,
  /** Short vertical segment above the rounded corner. */
  VERTICAL_LEN: 20,
  CURVE_RADIUS: 4,
  H_BRANCH: 10,
  NODE_RADIUS: 3,
  /** Space between node and submenu label. */
  LABEL_GAP: 10,
  DEPTH_INDENT: 16,
} as const
