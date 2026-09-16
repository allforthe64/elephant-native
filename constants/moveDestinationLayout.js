/** Shared layout for Move To / Save To destination folder pickers. */

/** Fraction of window height used by the scrollable folder list. */
export const MOVE_DESTINATION_LIST_HEIGHT_RATIO = 0.52

export function getMoveDestinationListHeight(windowHeight) {
  return Math.max(220, Math.round(windowHeight * MOVE_DESTINATION_LIST_HEIGHT_RATIO))
}
