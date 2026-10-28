import { getToken } from 'firebase/app-check'
import { appCheck, firebaseAuth, storage } from '../firebaseConfig'

/**
 * Upload a string to Firebase Storage through the REST API.
 *
 * The SDK's uploadBytes can't be used for text on iOS: small uploads are sent as
 * `new Blob([header, data, footer])`, and when React Native's native blob store
 * doesn't have the data part yet the joined blob comes out shorter than JS
 * thinks. Sending it crashes the app (NSConcreteMutableData subdataWithRange).
 * A plain string body never touches the blob store.
 *
 * Resolves to the stored size in bytes.
 */
export async function uploadText(path, text) {
  const user = firebaseAuth.currentUser
  if (!user) {
    throw Object.assign(new Error('Not signed in'), { code: 'storage/unauthenticated' })
  }

  const headers = {
    Authorization: `Firebase ${await user.getIdToken()}`,
    'Content-Type': 'text/plain; charset=utf-8',
  }
  if (appCheck) {
    headers['X-Firebase-AppCheck'] = (await getToken(appCheck)).token
  }

  const bucket = storage.app.options.storageBucket
  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(path)}`
  const res = await fetch(url, { method: 'POST', headers, body: `${text ?? ''}` })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    const retryable = res.status >= 500 || res.status === 429
    throw Object.assign(new Error(`Text upload failed (${res.status}) ${detail}`.trim()), {
      code: retryable ? 'storage/unknown' : `storage/http-${res.status}`,
    })
  }

  const metadata = await res.json()
  return Number(metadata.size) || 0
}
