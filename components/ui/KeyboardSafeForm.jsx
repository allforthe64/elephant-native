import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Platform, ScrollView, View, useWindowDimensions } from 'react-native'
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'

const KEYBOARD_GAP = 16

/**
 * Keeps modal add/rename forms (input + Save) above the soft keyboard.
 * Wrap the form block only — not the entire destination picker.
 *
 * ScrollView + keyboardShouldPersistTaps lets Save receive the tap while
 * the keyboard is open (a View swallows that first tap to dismiss).
 * Lift is held briefly after hide so the button does not jump mid-press.
 *
 * On iOS the lift is only as much as the form actually overlaps the keyboard,
 * so headings above the input are not pushed off-screen.
 */
const KeyboardSafeForm = ({ children, style }) => {
  const rawHeight = useKeyboardHeight()
  const [liftHeight, setLiftHeight] = useState(0)
  const { height: windowHeight } = useWindowDimensions()
  const contentRef = useRef(null)
  const liftRef = useRef(0)
  const [contentBottom, setContentBottom] = useState(null)

  useEffect(() => {
    if (rawHeight > 0) {
      setLiftHeight(rawHeight)
      return
    }
    const timeout = setTimeout(() => setLiftHeight(0), 200)
    return () => clearTimeout(timeout)
  }, [rawHeight])

  const measure = () => {
    contentRef.current?.measureInWindow((x, y, width, height) => {
      if (height > 0) setContentBottom(y + height + liftRef.current)
    })
  }

  useEffect(() => {
    if (rawHeight > 0) measure()
  }, [rawHeight])

  const maxLift = liftHeight > 0
    ? Math.min(
        liftHeight * (Platform.OS === 'ios' ? 0.55 : 0.5),
        Platform.OS === 'ios' ? 280 : 260,
      )
    : 0

  const overlap = Platform.OS === 'ios' && contentBottom != null
    ? contentBottom + KEYBOARD_GAP - (windowHeight - liftHeight)
    : maxLift
  const lift = liftHeight > 0 ? Math.max(0, Math.min(maxLift, overlap)) : 0
  liftRef.current = lift

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
      <View ref={contentRef} onLayout={measure} collapsable={false} style={styles.content}>
        {children}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
})

export default KeyboardSafeForm
