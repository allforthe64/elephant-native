import { useCallback, useRef } from 'react'
import { BackHandler } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

/**
 * Run `onBack` for the Android back button while this screen is focused,
 * instead of leaving the screen. Use for in-screen navigation such as folders.
 */
export function useHardwareBack(onBack, enabled = true) {
  const handlerRef = useRef(onBack)
  handlerRef.current = onBack

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return undefined
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handlerRef.current()
        return true
      })
      return () => subscription.remove()
    }, [enabled])
  )
}
