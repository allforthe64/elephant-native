import { useEffect, useRef } from 'react'
import { Keyboard } from 'react-native'

/**
 * Focus a TextInput when `shouldFocus` becomes true.
 * autoFocus alone often no-ops inside an already-open pageSheet modal
 * (add-folder forms swap in after the save/move dialog is showing).
 * Retries after layout and keyboard show so the caret actually lands.
 */
export function useAutoFocusOn(shouldFocus, delayMs = 250) {
  const ref = useRef(null)
  const shouldFocusRef = useRef(shouldFocus)
  shouldFocusRef.current = shouldFocus

  const focusInput = () => {
    if (!shouldFocusRef.current) return
    ref.current?.focus?.()
  }

  useEffect(() => {
    if (!shouldFocus) return

    const ids = [50, delayMs, delayMs + 250].map((d) => setTimeout(focusInput, d))
    const onShow = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(focusInput, 40)
    })

    return () => {
      ids.forEach(clearTimeout)
      onShow.remove()
    }
  }, [shouldFocus, delayMs])

  return ref
}
