import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'

/**
 * Centers and caps content width on tablets / Chromebooks.
 * On phones, renders children full-width with no layout changes.
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
  const { isPhone, contentMaxWidth, formMaxWidth, modalMaxWidth } =
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
    <View style={[styles.outer, styles.fullWidth, fill && styles.fill, style]}>
      <View
        style={[
          styles.inner,
          styles.fullWidth,
          fill && styles.fill,
          { maxWidth },
          innerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  // Critical: parents often use alignItems:'center'; without this, flex children
  // shrink-wrap and percentage widths / margins explode off to the right.
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  outer: {
    alignItems: 'center',
  },
  inner: {},
  fill: {
    flex: 1,
  },
})

export default ContentShell
