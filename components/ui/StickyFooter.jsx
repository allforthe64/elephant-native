import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * Action bar pinned to the bottom of a screen or sheet.
 * Render it as the last child of a flex: 1 column, after a flex: 1 sibling,
 * so it never scrolls and always clears the home indicator / nav bar.
 */
const StickyFooter = ({ children, style, minBottomPadding = 12 }) => {
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.footer,
        { paddingBottom: Math.max(insets.bottom, minBottomPadding) },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#FFFCF6',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#DDCADB',
    zIndex: 20,
    elevation: 8,
  },
})

export default StickyFooter
