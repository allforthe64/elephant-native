import AsyncStorage from '@react-native-async-storage/async-storage'
import { UploadQueueEmitter } from '../hooks/QueueEventEmitter'
import { firebaseAuth } from '../firebaseConfig'

const QUEUE_KEY = 'uploadQueue'

// Every read-modify-write goes through this chain so an enqueue and a removal
// running at the same time can't overwrite each other's changes.
let queueLock = Promise.resolve()

function withQueueLock(fn) {
  const run = queueLock.then(fn, fn)
  queueLock = run.catch(() => {})
  return run
}

async function readRaw() {
  try {
    const parsed = JSON.parse(await AsyncStorage.getItem(QUEUE_KEY))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function mutateQueue(mutator) {
  return withQueueLock(async () => {
    const next = mutator(await readRaw())
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(next))
    return next
  })
}

/** Stable key for a queue item. Items queued before ids existed fall back to their uri. */
export const queueItemKey = (item) => item.id || item.uri

export function readUploadQueue() {
  return withQueueLock(readRaw)
}

/** Append items to the persisted upload queue and wake the upload worker. */
export async function enqueueUploads(items) {
  const uid = firebaseAuth.currentUser?.uid
  const stamped = items.map((item) => ({
    ...item,
    id: randomQueueId(16),
    uid,
    attempts: 0,
    queuedAt: Date.now(),
  }))
  const next = await mutateQueue((queue) => [...queue, ...stamped])
  UploadQueueEmitter.emit('uploadQueueUpdated', next)
}

export function removeQueueItem(key) {
  return mutateQueue((queue) => queue.filter((item) => queueItemKey(item) !== key))
}

export function updateQueueItem(key, changes) {
  return mutateQueue((queue) =>
    queue.map((item) => (queueItemKey(item) === key ? { ...item, ...changes } : item))
  )
}

export function randomQueueId(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}
