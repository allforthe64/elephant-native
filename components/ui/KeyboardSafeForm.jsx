import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'

/**
 * Keeps modal add/rename forms (input + Save) above the soft keyboard.
 * Wrap the form block only — not the entire destination picker.
 *
 * Lift is held briefly after hide so tapping Save is not lost when the
 * keyboard dismisses and the form would otherwise jump.
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
