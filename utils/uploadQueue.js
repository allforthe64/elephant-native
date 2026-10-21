import AsyncStorage from '@react-native-async-storage/async-storage'
import { UploadQueueEmitter } from '../hooks/QueueEventEmitter'

const QUEUE_KEY = 'uploadQueue'

export async function readUploadQueue() {
  return JSON.parse(await AsyncStorage.getItem(QUEUE_KEY)) || []
}

/** Append items to the persisted upload queue and notify the uploader in Main. */
export async function enqueueUploads(items) {
  const queue = await readUploadQueue()
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([...queue, ...items]))

  // Read back so listeners only ever see what actually reached storage.
  const confirmedQueue = await readUploadQueue()
  UploadQueueEmitter.emit('uploadQueueUpdated', confirmedQueue)
}

export function randomQueueId(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}
