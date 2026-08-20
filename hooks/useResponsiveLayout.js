import { useWindowDimensions } from 'react-native'
import {
  BREAKPOINTS,
  CONTENT_WIDTH,
  FORM_WIDTH,
  MODAL_WIDTH,
} from '../constants/layout'

function clampToWindow(cap, width, gutter) {
  if (cap == null) return undefined
  return Math.min(cap, Math.max(0, width - gutter * 2))
}

/**
 * Reactive layout flags for tablet / Chromebook support.
 * Below the tablet breakpoint, helpers return phone-safe values so existing
 * StyleSheets and percentage layouts stay unchanged.
 */
export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions()
  const shortest = Math.min(width, height)
  const isTablet = shortest >= BREAKPOINTS.tablet
  const isLargeTablet = shortest >= BREAKPOINTS.largeTablet
  const isPhone = !isTablet
  const isLandscape = width > height
  const gutter = isPhone ? 0 : isLandscape ? 32 : 16

  const contentMaxWidth = isPhone
    ? undefined
    : clampToWindow(
        isLargeTablet ? CONTENT_WIDTH.largeTablet : CONTENT_WIDTH.tablet,
        width,
        gutter
      )

  const formMaxWidth = isPhone
    ? undefined
    : clampToWindow(
        isLargeTablet ? FORM_WIDTH.largeTablet : FORM_WIDTH.tablet,
        width,
        gutter
      )

  const modalMaxWidth = isPhone
    ? undefined
    : clampToWindow(
        isLargeTablet ? MODAL_WIDTH.largeTablet : MODAL_WIDTH.tablet,
        width,
        gutter
      )

  /**
   * Fill the content column. Use on rows/lists instead of a second maxWidth
   * cap, which left-aligns and leaves empty gutters.
   */
  const contentFill = {
    width: '100%',
    alignSelf: 'stretch',
  }

  /**
   * Pick a value by form factor. Phone value is always used below tablet.
   */
  const select = (phone, tablet, largeTablet) => {
    if (isLargeTablet && largeTablet !== undefined) return largeTablet
    if (isTablet && tablet !== undefined) return tablet
    return phone
  }

  return {
    width,
    height,
    gutter,
    isPhone,
    isTablet,
    isLargeTablet,
    isLandscape,
    contentMaxWidth,
    formMaxWidth,
    modalMaxWidth,
    contentFill,
    select,
  }
}

/**
 * Merge phone styles with optional tablet overrides without affecting phones.
 * Usage: style={tabletStyle(isTablet, styles.row, tabletStyles.row)}
 */
export function tabletStyle(isTablet, phoneStyle, tabletOverride) {
  if (!isTablet || !tabletOverride) return phoneStyle
  return [phoneStyle, tabletOverride]
}
