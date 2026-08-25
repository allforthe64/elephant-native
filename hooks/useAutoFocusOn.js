import { useEffect, useRef } from 'react'

/**
 * Focus a TextInput when `shouldFocus` becomes true.
 * The delay lets pageSheet modals and KeyboardSafeForm finish laying out,
 * because autoFocus alone often no-ops in those cases.
 */
export function useAutoFocusOn(shouldFocus, delayMs = 250) {
  const ref = useRef(null)

  useEffect(() => {
    if (!shouldFocus) return
    const id = setTimeout(() => {
      ref.current?.focus?.()
    }, delayMs)
    return () => clearTimeout(id)
  }, [shouldFocus, delayMs])

  return ref
}
