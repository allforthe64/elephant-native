/**
 * Layout breakpoints and content widths for phone / tablet / Chromebook.
 * Device class is based on the shortest window side so phones stay phones
 * in landscape and tablets stay tablets in portrait.
 *
 * CONTENT_WIDTH / FORM_WIDTH / MODAL_WIDTH are ceilings only. Actual used
 * width is min(window - gutters, ceiling) so content fills the screen on
 * every size instead of sitting in a phone-sized column.
 */
export const BREAKPOINTS = {
  /** ~7" tablets and up (shortest side) */
  tablet: 600,
  /** ~10" tablets and Chromebooks (shortest side) */
  largeTablet: 900,
}

export const CONTENT_WIDTH = {
  tablet: 1400,
  largeTablet: 1400,
}

export const FORM_WIDTH = {
  tablet: 560,
  largeTablet: 640,
}

export const MODAL_WIDTH = {
  tablet: 1400,
  largeTablet: 1400,
}

export const Brand = {
  purple: '#593060',
  purpleBright: '#9F37B0',
  yellow: '#FFE562',
  lavender: '#DDCADB',
  cream: '#FFFCF6',
  gray: '#BCBCBC',
  border: '#777',
}
