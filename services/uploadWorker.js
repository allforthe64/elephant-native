import * as FileSystem from 'expo-file-system'
import * as Sentry from '@sentry/react-native'
import { format } from 'date-fns'
import { ref, uploadBytesResumable } from 'firebase/storage'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'

import { storage, firebaseAuth } from '../firebaseConfig'
import { addfile, addFileToUser } from '../firebase/firestore'
import { createTextBlob, TEXT_UPLOAD_METADATA } from '../utils/textBlob'
import {
  readUploadQueue,
  removeQueueItem,
  updateQueueItem,
  queueItemKey,
  randomQueueId,
} from '../utils/uploadQueue'

const MAX_ATTEMPTS = 3
const THUMBNAIL_WIDTH = 400
const IMAGE_TYPES = ['jpg', 'jpeg', 'png']
const OFFICE_TYPES = ['doc', 'docx']

const TRANSIENT_CODES = new Set([
  'storage/retry-limit-exceeded',
  'storage/unknown',
  'storage/canceled',
  'storage/unauthenticated',
  'storage/server-file-wrong-size',
  'unavailable',
  'deadline-exceeded',
  'aborted',
  'resource-exhausted',
  'internal',
])

class FileMissingError extends Error {}

const isTransient = (err) =>
  TRANSIENT_CODES.has(String(err?.code || '').replace(/^firestore\//, '')) ||
  /network|timed? ?out|offline/i.test(String(err?.message || err))

const typeOf = (item) => String(item.fileType || '').toLowerCase()

async function readFileBlob(uri) {
  try {
    const response = await fetch(uri)
    return await response.blob()
  } catch {
    // fetch rejects some file:// URIs on older Android builds
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onload = () => resolve(xhr.response)
      xhr.onerror = () => reject(new TypeError('Network request failed'))
      xhr.responseType = 'blob'
      xhr.open('GET', uri, true)
      xhr.send(null)
    })
  }
}

async function uploadBlob(path, blob, metadata) {
  try {
    const result = await uploadBytesResumable(ref(storage, path), blob, metadata)
    return result.metadata.size
  } finally {
    blob?.close?.()
  }
}

async function uploadFileAt(path, uri) {
  return uploadBlob(path, await readFileBlob(uri))
}

async function ensureLocalFile(uri) {
  const info = await FileSystem.getInfoAsync(uri).catch(() => null)
  if (info && !info.exists) throw new FileMissingError('The file was removed from the device before it uploaded.')
}

// Storage paths must match what addfile() records in the files collection.
const uploaders = {
  async image(item, uid, stamp) {
    await ensureLocalFile(item.uri)
    const size = await uploadFileAt(`${uid}/${stamp}`, item.uri)

    let thumbnailUri = item.uri
    try {
      const resize = item.metadata?.width
        ? { width: Math.min(THUMBNAIL_WIDTH, Math.round(item.metadata.width * 0.1) || THUMBNAIL_WIDTH) }
        : { width: THUMBNAIL_WIDTH }
      thumbnailUri = (await manipulateAsync(item.uri, [{ resize }], { compress: 0.9, format: SaveFormat.JPEG })).uri
    } catch (err) {
      // Fall back to the full image so the file still gets a working thumbnail.
      console.warn('thumbnail generation failed, using original:', err?.message || err)
    }
    const thumbSize = await uploadFileAt(`${uid}/thumbnail&${stamp}`, thumbnailUri)
    if (thumbnailUri !== item.uri) deleteLocalFile(thumbnailUri)

    return { size: size + thumbSize }
  },

  async text(item, uid, stamp) {
    const { blob, cleanup } = await createTextBlob(item.noteBody)
    try {
      const size = await uploadBlob(`${uid}/${stamp}`, blob, TEXT_UPLOAD_METADATA)
      return { size, fields: item.linksTo ? { linksTo: item.linksTo } : {} }
    } finally {
      cleanup()
    }
  },

  async office(item, uid, stamp) {
    await ensureLocalFile(item.uri)
    return { size: await uploadFileAt(`${stamp}^&${uid}`, item.uri) }
  },

  async binary(item, uid, stamp) {
    await ensureLocalFile(item.uri)
    return { size: await uploadFileAt(`${uid}/${stamp}`, item.uri) }
  },
}

function uploaderFor(item) {
  const type = typeOf(item)
  if (IMAGE_TYPES.includes(type)) return uploaders.image
  if (type === 'txt') return uploaders.text
  if (OFFICE_TYPES.includes(type)) return uploaders.office
  return uploaders.binary
}

/**
 * Upload one queue item. Progress is saved on the item after each step, so a
 * retry after a partial failure doesn't create a second file record.
 */
async function uploadItem(item, uid) {
  const key = queueItemKey(item)
  let { reference, uploadSize } = item

  if (!reference) {
    const stamp = format(new Date(), 'yyyy-MM-dd:hh:mm:ss') + randomQueueId(10)
    const { size, fields = {} } = await uploaderFor(item)(item, uid, stamp)

    reference = await addfile({
      name: item.filename,
      fileType: item.fileType,
      size,
      user: uid,
      version: 0,
      timeStamp: stamp,
      ...fields,
    }, item.finalDestination)
    if (!reference) throw new Error('addfile returned no reference')

    uploadSize = size
    await updateQueueItem(key, { reference, uploadSize })
  }

  await addFileToUser(uid, reference, uploadSize)
}

const isAppOwnedFile = (uri) =>
  typeof uri === 'string' &&
  [FileSystem.documentDirectory, FileSystem.cacheDirectory].some((dir) => dir && uri.startsWith(dir))

function deleteLocalFile(uri) {
  if (!isAppOwnedFile(uri)) return
  FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {})
}

let running = false
let runAgain = false

/**
 * Upload everything queued for the signed-in user, one item at a time.
 * Calls made while a pass is running schedule one more pass instead of overlapping.
 *
 * Transient failures (offline, timeouts) stop the pass and leave items queued.
 * Other failures retry up to MAX_ATTEMPTS, then the item is dropped and reported.
 */
export async function processUploadQueue({ onUploaded, onFailed } = {}) {
  if (running) {
    runAgain = true
    return
  }
  running = true

  try {
    do {
      runAgain = false
      const uid = firebaseAuth.currentUser?.uid
      if (!uid) return

      const queue = await readUploadQueue()
      for (const item of queue) {
        if (item.uid && item.uid !== uid) continue
        const key = queueItemKey(item)

        try {
          await uploadItem(item, uid)
          await removeQueueItem(key)
          if (typeOf(item) !== 'txt') deleteLocalFile(item.uri)
          onUploaded?.(item)
        } catch (err) {
          if (isTransient(err)) {
            console.log('upload paused, will retry later:', err?.message || err)
            break
          }

          const attempts = (item.attempts || 0) + 1
          const giveUp = err instanceof FileMissingError || attempts >= MAX_ATTEMPTS
          console.warn(`upload failed (attempt ${attempts}) for ${item.filename}:`, err?.message || err)

          if (giveUp) {
            await removeQueueItem(key)
            Sentry.captureException(err, { extra: { fileType: item.fileType, attempts } })
            onFailed?.(item, err)
          } else {
            await updateQueueItem(key, { attempts, lastError: String(err?.message || err) })
          }
        }
      }
    } while (runAgain)
  } finally {
    running = false
  }
}
