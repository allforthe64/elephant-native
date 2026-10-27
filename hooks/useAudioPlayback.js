import { useCallback, useEffect, useRef, useState } from 'react'
import { Audio } from 'expo-av'

/** Play/pause a remote audio file, resuming from where it was paused. */
export function useAudioPlayback(url) {
  const soundRef = useRef(null)
  const positionRef = useRef(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => () => {
    soundRef.current?.unloadAsync().catch(() => {})
  }, [])

  const play = useCallback(async () => {
    if (!url) return
    setPlaying(true)
    try {
      await soundRef.current?.unloadAsync().catch(() => {})
      const { sound } = await Audio.Sound.createAsync({ uri: url }, {}, (status) => {
        if (status.didJustFinish) {
          positionRef.current = 0
          setPlaying(false)
        }
      })
      soundRef.current = sound
      await sound.playFromPositionAsync(positionRef.current)
    } catch (err) {
      console.warn('Audio playback failed', err)
      setPlaying(false)
    }
  }, [url])

  const pause = useCallback(async () => {
    setPlaying(false)
    try {
      const status = await soundRef.current?.getStatusAsync()
      if (status?.isLoaded && status.isPlaying) {
        await soundRef.current.pauseAsync()
        positionRef.current = status.positionMillis
      }
    } catch {}
  }, [])

  return { playing, play, pause }
}
