import { useEffect } from 'react'
import { Linking } from 'react-native'
import { useCameraPermissions } from 'expo-camera'
import { Audio } from 'expo-av'
import * as MediaLibrary from 'expo-media-library'
import { ensurePermission } from '../utils/permissions'

/**
 * Camera permission plus the secondary permissions the camera screen needs.
 * Media library and microphone are requested in the background once the camera
 * is granted, so they never block the live preview. On unmount the shared audio
 * session is released so AudioRecorder can reclaim the mic.
 */
export function useCameraSetup() {
  const [permission, requestPermission] = useCameraPermissions()

  useEffect(() => {
    if (!permission?.granted) return
    ;(async () => {
      try {
        await ensurePermission(
          () => MediaLibrary.getPermissionsAsync(true),
          () => MediaLibrary.requestPermissionsAsync(true)
        )
        await ensurePermission(Audio.getPermissionsAsync, Audio.requestPermissionsAsync)
      } catch (err) {
        console.warn('Secondary camera permissions error:', err)
      }
    })()
  }, [permission?.granted])

  useEffect(() => () => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    }).catch(() => {})
  }, [])

  const grantPermission = async () => {
    try {
      const result = await requestPermission()
      if (result?.granted) return
      if (result && result.canAskAgain === false) await Linking.openSettings()
    } catch (err) {
      console.warn('Camera permission request failed:', err)
      alert(err?.message || String(err))
    }
  }

  return { permission, grantPermission }
}
