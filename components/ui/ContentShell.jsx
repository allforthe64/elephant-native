import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'

/**
 * Fills available width on every screen.
 * On phones: no extra padding or max-width.
 * On tablets: horizontal gutter + optional ultra-wide ceiling, centered.
 *
 * @param {'content' | 'form' | 'modal'} [variant='content']
 * @param {boolean} [fill=false] - stretch to fill parent height (flex: 1)
 */
const ContentShell = ({
  children,
  style,
  innerStyle,
  variant = 'content',
  fill = false,
}) => {
  const { isPhone, gutter, contentMaxWidth, formMaxWidth, modalMaxWidth } =
    useResponsiveLayout()

  const maxWidth =
    variant === 'form'
      ? formMaxWidth
      : variant === 'modal'
        ? modalMaxWidth
        : contentMaxWidth

  if (isPhone) {
    return (
      <View style={[styles.fullWidth, fill && styles.fill, style, innerStyle]}>
        {children}
      </View>
    )
  }

  return (
    <View
      style={[
        styles.outer,
        styles.fullWidth,
        fill && styles.fill,
        gutter > 0 && { paddingHorizontal: gutter },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          fill && styles.fill,
          maxWidth != null && { maxWidth },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  outer: {
    alignItems: 'center',
  },
  // Fill the padded parent. Do not use alignSelf:'stretch' together with
  // maxWidth — that left-aligns the column and wastes the right side.
  inner: {
    width: '100%',
    alignSelf: 'center',
  },
  fill: {
    flex: 1,
  },
})

export default ContentShell
