import React from 'react'
import { Text, View, StyleSheet, Platform } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import AppPressable from './AppPressable'
import { Brand } from '../../constants/layout'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'

/**
 * Standard app button. Sizes:
 *  - xs: compact, content-width (Back buttons)
 *  - sm: half-width, meant to sit two-per-row
 *  - md: single primary action in a form/modal
 *  - lg: prominent full-width action (dashboard, home)
 *
 * The icon holder stays pinned left; the label is always centered in the
 * full button width (padding mirrors the icon on both sides).
 */

const SIZE_ORDER = ['xs', 'sm', 'md', 'lg']

const PHONE_TOKENS = {
  xs: { minHeight: 40, icon: 26, glyph: 14, font: 15, pad: 6 },
  sm: { minHeight: 44, icon: 28, glyph: 16, font: 16, pad: 8 },
  md: { minHeight: 50, icon: 32, glyph: 17, font: 18, pad: 8 },
  lg: { minHeight: 58, icon: 42, glyph: 22, font: 20, pad: 8 },
}

const TABLET_TOKENS = {
  xs: { minHeight: 44, icon: 30, glyph: 16, font: 17, pad: 7 },
  sm: { minHeight: 52, icon: 34, glyph: 18, font: 18, pad: 9 },
  md: { minHeight: 58, icon: 38, glyph: 20, font: 20, pad: 10 },
  lg: { minHeight: 66, icon: 50, glyph: 26, font: 22, pad: 10 },
}

const WIDTHS = {
  xs: { phone: { alignSelf: 'flex-start', minWidth: 120 }, tablet: { alignSelf: 'flex-start', minWidth: 150 } },
  sm: { phone: { width: '45%', maxWidth: 240 }, tablet: { width: '45%', maxWidth: 300 } },
  md: { phone: { width: '75%', maxWidth: 360 }, tablet: { width: '60%', maxWidth: 440 } },
  lg: { phone: { width: '85%', maxWidth: 480 }, tablet: { width: '85%', maxWidth: 600 } },
}

const NARROW_PHONE_WIDTH = 360

function resolveTokens(size, { isTablet, width }) {
  if (isTablet) return TABLET_TOKENS[size]
  if (width < NARROW_PHONE_WIDTH) {
    const smaller = SIZE_ORDER[Math.max(0, SIZE_ORDER.indexOf(size) - 1)]
    return PHONE_TOKENS[smaller]
  }
  return PHONE_TOKENS[size]
}

function resolveWidth(size, { isTablet, width }) {
  if (isTablet) return WIDTHS[size].tablet
  if (size === 'md' && width < NARROW_PHONE_WIDTH) return WIDTHS.lg.phone
  return WIDTHS[size].phone
}

const YellowButton = ({
  label,
  onPress,
  icon,
  iconColor,
  size = 'md',
  variant = 'yellow',
  disabled = false,
  dimmed = false,
  elevated = false,
  style,
  labelStyle,
  testID,
  accessibilityLabel,
}) => {
  const layout = useResponsiveLayout()
  const safeSize = SIZE_ORDER.includes(size) ? size : 'md'
  const t = resolveTokens(safeSize, layout)
  const isDanger = variant === 'danger'
  const glyphColor = iconColor || (isDanger ? Brand.danger : Brand.purpleBright)
  const sidePad = icon ? t.icon + t.pad * 2 : t.pad * 2

  const iconContent = !icon
    ? null
    : React.isValidElement(icon)
      ? icon
      : <FontAwesomeIcon icon={icon} size={t.glyph} color={glyphColor} />

  return (
    <AppPressable
      testID={testID}
      accessibilityLabel={accessibilityLabel || label}
      onPress={onPress}
      disabled={disabled || dimmed}
      activeOpacity={0.82}
      style={[
        styles.button,
        { minHeight: t.minHeight, paddingHorizontal: sidePad },
        isDanger && styles.danger,
        resolveWidth(safeSize, layout),
        elevated && styles.elevated,
        (dimmed || disabled) && styles.dimmed,
        style,
      ]}
    >
      {iconContent ? (
        <View style={[styles.iconSlot, { left: t.pad }]} pointerEvents="none">
          <View style={[styles.iconHolder, { width: t.icon, height: t.icon }]}>
            {iconContent}
          </View>
        </View>
      ) : null}
      <Text
        style={[
          styles.label,
          { fontSize: t.font, lineHeight: Math.round(t.font * 1.25) },
          isDanger && styles.labelDanger,
          labelStyle,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {label}
      </Text>
    </AppPressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Brand.yellow,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  danger: {
    backgroundColor: Brand.danger,
  },
  elevated: Platform.select({
    ios: {
      shadowColor: Brand.purple,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 6,
    },
    android: { elevation: 5 },
    default: {},
  }),
  dimmed: {
    opacity: 0.5,
  },
  iconSlot: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  iconHolder: {
    backgroundColor: '#fff',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    color: Brand.purpleBright,
    fontWeight: '600',
  },
  labelDanger: {
    color: '#fff',
  },
})

export default YellowButton
