import { useWindowDimensions } from 'react-native'
import {
  BREAKPOINTS,
  CONTENT_WIDTH,
  FORM_WIDTH,
  MODAL_WIDTH,
} from '../constants/layout'

/**
 * Reactive layout flags for tablet / Chromebook support.
 * Below the tablet breakpoint, helpers return phone-safe values so existing
 * StyleSheets and percentage layouts stay unchanged.
 */
export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions()
  const isTablet = width >= BREAKPOINTS.tablet
  const isLargeTablet = width >= BREAKPOINTS.largeTablet
  const isPhone = !isTablet
  const isLandscape = width > height

  const contentMaxWidth = isLargeTablet
    ? CONTENT_WIDTH.largeTablet
    : isTablet
      ? CONTENT_WIDTH.tablet
      : undefined

  const formMaxWidth = isLargeTablet
    ? FORM_WIDTH.largeTablet
    : isTablet
      ? FORM_WIDTH.tablet
      : undefined

  const modalMaxWidth = isLargeTablet
    ? MODAL_WIDTH.largeTablet
    : isTablet
      ? MODAL_WIDTH.tablet
      : undefined

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
    isPhone,
    isTablet,
    isLargeTablet,
    isLandscape,
    contentMaxWidth,
    formMaxWidth,
    modalMaxWidth,
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
