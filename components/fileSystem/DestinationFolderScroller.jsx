import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'

/**
 * Folder list for Save To / Move To pickers.
 * height: 0 + flex: 1 keeps the list inside the remaining sheet space so
 * the sticky footer stays on screen even before a destination is selected.
 */
const DestinationFolderScroller = ({ children, centerEmpty = false }) => {
  return (
    <View style={styles.wrap}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={centerEmpty ? styles.emptyContent : styles.content}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        {children}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 0,
    height: 0,
    width: '100%',
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  content: {
    paddingTop: 4,
    paddingBottom: 16,
    flexGrow: 0,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 16,
  },
})

export default DestinationFolderScroller
