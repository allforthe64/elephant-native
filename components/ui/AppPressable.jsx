import React from 'react'
import { TouchableOpacity } from 'react-native'

/**
 * Shared pressable that always exposes testID + accessibility for Robo/Test Lab.
 * Use this instead of raw TouchableOpacity/Pressable for interactive controls.
 */
const AppPressable = ({
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  disabled = false,
  children,
  onPress,
  style,
  activeOpacity = 0.7,
  ...rest
}) => {
  if (!testID && !accessibilityLabel) {
    if (__DEV__) {
      console.warn(
        'AppPressable: provide testID and/or accessibilityLabel so Robo can identify this control.'
      )
    }
  }

  return (
    <TouchableOpacity
      testID={testID}
      accessibilityLabel={accessibilityLabel || testID}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      accessible
      disabled={disabled}
      onPress={onPress}
      style={style}
      activeOpacity={activeOpacity}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  )
}

export default AppPressable
