import React, { useEffect, useState } from 'react'
import { StyleSheet, Platform, ScrollView } from 'react-native'
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'

/**
 * Keeps modal add/rename forms (input + Save) above the soft keyboard.
 * Wrap the form block only — not the entire destination picker.
 *
 * ScrollView + keyboardShouldPersistTaps lets Save receive the tap while
 * the keyboard is open (a View swallows that first tap to dismiss).
 * Lift is held briefly after hide so the button does not jump mid-press.
 */
const KeyboardSafeForm = ({ children, style }) => {
  const rawHeight = useKeyboardHeight()
  const [liftHeight, setLiftHeight] = useState(0)

  useEffect(() => {
    if (rawHeight > 0) {
      setLiftHeight(rawHeight)
      return
    }
    const timeout = setTimeout(() => setLiftHeight(0), 200)
    return () => clearTimeout(timeout)
  }, [rawHeight])

  const lift = liftHeight > 0
    ? Math.min(
        liftHeight * (Platform.OS === 'ios' ? 0.55 : 0.5),
        Platform.OS === 'ios' ? 280 : 260,
      )
    : 0

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      keyboardDismissMode="none"
      scrollEnabled={false}
      bounces={false}
      contentContainerStyle={[
        styles.root,
        lift > 0 && { transform: [{ translateY: -lift }], paddingBottom: 16 },
        style,
      ]}
    >
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignItems: 'center',
  },
})

export default KeyboardSafeForm
