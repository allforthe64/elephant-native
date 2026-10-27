import { useCallback, useEffect, useRef, useState } from 'react'
import { ref as storageRef, uploadBytes, deleteObject } from 'firebase/storage'
import { format } from 'date-fns'
import { storage } from '../firebaseConfig'
import { getFile } from '../firebase/firestore'
import { setFileUri } from '../firebase/fileSystem'
import { createTextBlob, TEXT_UPLOAD_METADATA } from '../utils/textBlob'

const BUCKET = 'gs://elephantapp-21e34.appspot.com'

/**
 * Text and save action for a note file (a txt file that isn't a saved link).
 * Saving uploads the new text as a new storage object, repoints the file doc
 * and the user's fileRef at it, then deletes the old object.
 */
export function useNote({ file, fileObj, fileURL, userInst }) {
  const isNote = fileObj?.documentType === 'txt' && !fileObj?.linksTo
  const [text, setText] = useState('')
  const [status, setStatus] = useState('loading')
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!isNote || !fileURL || loadedRef.current) return
    let cancelled = false
    setStatus('loading')
    fetch(fileURL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((loaded) => {
        if (cancelled) return
        loadedRef.current = true
        setText(loaded)
        setStatus('ready')
      })
      .catch((err) => {
        console.warn('Failed to load note', err)
        if (!cancelled) setStatus('error')
      })
    return () => { cancelled = true }
  }, [isNote, fileURL])

  const save = useCallback(async () => {
    const fileDoc = await getFile(file.fileId)
    const path = `${userInst.uid}/${format(new Date(), 'yyyy-MM-dd:hh:mm:ss')}`
    const uri = `${BUCKET}/${path}`

    const { blob, cleanup } = await createTextBlob(text)
    try {
      await uploadBytes(storageRef(storage, path), blob, TEXT_UPLOAD_METADATA)
    } finally {
      cleanup()
    }

    await setFileUri(userInst, file.fileId, uri)

    // Only delete the old text once nothing points at it.
    deleteObject(storageRef(storage, fileDoc.uri)).catch((err) => console.log('old note delete failed: ', err))
  }, [file, userInst, text])

  return { isNote, text, setText, status, save }
}
