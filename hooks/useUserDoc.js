import { useEffect, useState } from 'react'
import { firebaseAuth } from '../firebaseConfig'
import { userListener } from '../firebase/firestore'

/** Live Firestore user document for the signed-in user. */
export function useUserDoc() {
  const [userDoc, setUserDoc] = useState()

  useEffect(() => {
    const uid = firebaseAuth.currentUser?.uid
    if (!uid) return

    let cancelled = false
    let unsubscribe = null

    userListener(setUserDoc, false, uid)
      .then((unsub) => {
        if (cancelled) unsub()
        else unsubscribe = unsub
      })
      .catch((err) => console.warn('useUserDoc listener failed:', err))

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  return userDoc
}
