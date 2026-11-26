import { useEffect, useState } from 'react'
import { firebaseAuth } from '../firebaseConfig'
import { userListener } from '../firebase/firestore'

/**
 * Live Firestore user document for the signed-in user.
 * `loading` is true until the first snapshot (or auth is missing).
 * `userDoc` is null when there is no users/{uid} document.
 */
export function useUserDoc() {
  const [userDoc, setUserDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = firebaseAuth.currentUser?.uid
    if (!uid) {
      setUserDoc(null)
      setLoading(false)
      return
    }

    let cancelled = false
    let unsubscribe = null
    setLoading(true)

    const onUser = (doc) => {
      if (cancelled) return
      setUserDoc(doc)
      setLoading(false)
    }

    userListener(onUser, false, uid)
      .then((unsub) => {
        if (cancelled) unsub()
        else unsubscribe = unsub
      })
      .catch((err) => {
        console.warn('useUserDoc listener failed:', err)
        if (!cancelled) {
          setUserDoc(null)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  return { userDoc, loading }
}
