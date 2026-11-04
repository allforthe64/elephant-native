import { firebaseAuth } from '../firebaseConfig'

const REFRESH_URL = 'https://www.myelephantapp.com/api/refresh-storage-usage'

let inFlight = null
let runAgain = false

async function requestRefresh() {
  const user = firebaseAuth.currentUser
  if (!user) return
  const res = await fetch(REFRESH_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await user.getIdToken()}` },
  })
  if (!res.ok) throw new Error(`status ${res.status}`)
}

/**
 * Ask the server to re-measure the signed-in user's spaceUsed from Storage.
 * spaceUsed is a billing field the client may not write, so call this after
 * anything that adds or removes stored files. Calls made while a refresh is
 * running are folded into one more refresh. Failures are logged, not thrown:
 * they shouldn't fail the upload or delete that triggered them.
 */
export function refreshStorageUsage() {
  if (inFlight) {
    runAgain = true
    return inFlight
  }
  inFlight = (async () => {
    try {
      do {
        runAgain = false
        await requestRefresh()
      } while (runAgain)
    } catch (err) {
      console.warn('Failed to refresh storage usage:', err?.message || err)
    } finally {
      inFlight = null
    }
  })()
  return inFlight
}
