import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'

/**
 * Keeps modal add/rename forms (input + Save) above the soft keyboard.
 * Wrap the form block only — not the entire destination picker.
 */
const KeyboardSafeForm = ({ children, style }) => {
  const keyboardHeight = useKeyboardHeight()
  const lift = keyboardHeight > 0
    ? Math.min(
        keyboardHeight * (Platform.OS === 'ios' ? 0.55 : 0.5),
        Platform.OS === 'ios' ? 280 : 260,
      )
    : 0

  return (
    <View
      style={[
        styles.root,
        lift > 0 && { transform: [{ translateY: -lift }], paddingBottom: 16 },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignItems: 'center',
  },
})

export default KeyboardSafeForm
