import { useEffect, useRef } from 'react'
import { Alert, AppState } from 'react-native'
import { onAuthStateChanged } from 'firebase/auth'
import { useToast } from 'react-native-toast-notifications'

import { firebaseAuth } from '../firebaseConfig'
import { UploadQueueEmitter } from './QueueEventEmitter'
import { processUploadQueue } from '../services/uploadWorker'

/**
 * Run the upload worker for the app's lifetime: on sign-in, whenever something
 * is queued, and when the app returns to the foreground (retries after offline).
 */
export function useUploadQueueWorker() {
  const toast = useToast()
  const callbacksRef = useRef(null)

  callbacksRef.current = {
    onUploaded: () => toast.show('Upload successful', { type: 'success' }),
    onFailed: (item, err) => {
      Alert.alert(
        'Upload failed',
        `"${item.filename}" couldn't be uploaded.\n\n${err?.message || 'Something went wrong'}`
      )
    },
  }

  useEffect(() => {
    const run = () => {
      processUploadQueue(callbacksRef.current).catch((err) => {
        console.warn('upload queue error:', err?.message || err)
      })
    }

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) run()
    })
    UploadQueueEmitter.on('uploadQueueUpdated', run)
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') run()
    })

    return () => {
      unsubscribeAuth()
      UploadQueueEmitter.off('uploadQueueUpdated', run)
      appStateSub.remove()
    }
  }, [])
}
