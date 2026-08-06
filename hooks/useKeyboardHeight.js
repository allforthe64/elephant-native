import { useEffect, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

/**
 * Tracks soft-keyboard height so modal forms can lift Save / action buttons.
 * Works inside RN Modals where windowSoftInputMode alone is unreliable.
 */
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const onShow = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates?.height || 0)
    })
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0)
    })

    return () => {
      onShow.remove()
      onHide.remove()
    }
  }, [])

  return keyboardHeight
}
