import React from 'react'
import { TextInput } from 'react-native'

/**
 * Shared TextInput that always exposes testID + accessibility for Robo/Test Lab.
 */
const AppTextInput = ({
  testID,
  accessibilityLabel,
  accessibilityHint,
  editable = true,
  style,
  ...rest
}) => {
  if (!testID && !accessibilityLabel) {
    if (__DEV__) {
      console.warn(
        'AppTextInput: provide testID and/or accessibilityLabel so Robo can identify this field.'
      )
    }
  }

  return (
    <TextInput
      testID={testID}
      accessibilityLabel={accessibilityLabel || testID}
      accessibilityHint={accessibilityHint}
      accessible
      editable={editable}
      style={style}
      {...rest}
    />
  )
}

export default AppTextInput
