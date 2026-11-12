import { firebaseAuth } from '../firebaseConfig'

const CANCEL_URL = 'https://www.myelephantapp.com/api/cancel-subscription'

/**
 * Cancel the signed-in user's subscription and delete their account, files and
 * auth user on the server. Throws if the server didn't confirm the deletion.
 */
export async function cancelSubscriptionAndDeleteAccount() {
  const user = firebaseAuth.currentUser
  if (!user) throw new Error('You need to be signed in')

  const res = await fetch(CANCEL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await user.getIdToken()}`,
    },
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok || !payload.success) {
    throw new Error(payload.error || `status ${res.status}`)
  }
}
