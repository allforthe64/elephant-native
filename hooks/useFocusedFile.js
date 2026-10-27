import { useCallback, useEffect, useState } from 'react'
import { getFile } from '../firebase/firestore'
import { getFileDownloadURL } from '../firebase/cloudStorage'
import { getFileKind } from '../utils/fileNames'

const CONVERT_DOCX_URL = 'https://myelephantapp.com/api/convert-docx-to-pdf'

/**
 * Loads a file's Firestore doc and download URL. Word documents are also
 * converted to a PDF URL for previewing. Call `reload()` after the stored file
 * changes (e.g. a note is re-uploaded).
 */
export function useFocusedFile(file) {
  const fileId = file?.fileId
  const [fileObj, setFileObj] = useState()
  const [fileURL, setFileURL] = useState()
  const [error, setError] = useState(null)
  const [convertedPDFURL, setConvertedPDFURL] = useState()
  const [conversionFailed, setConversionFailed] = useState(false)
  const [loadCount, setLoadCount] = useState(0)

  useEffect(() => {
    if (!fileId) return
    let cancelled = false
    ;(async () => {
      try {
        const fileInst = await getFile(fileId)
        const url = await getFileDownloadURL(fileInst.uri)
        if (cancelled) return
        setFileObj(fileInst)
        setFileURL(url)
      } catch (err) {
        console.warn('Failed to load file', err)
        if (!cancelled) setError(err)
      }
    })()
    return () => { cancelled = true }
  }, [fileId, loadCount])

  const isWordDoc = !!file && getFileKind(file.fileName) === 'word'

  useEffect(() => {
    if (!isWordDoc || !fileURL || convertedPDFURL) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(CONVERT_DOCX_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ docxUrl: fileURL, fileName: file.fileName }),
        })
        const data = await res.json()
        if (!res.ok || !data?.convertedPDFURL) throw new Error(data?.error || `HTTP ${res.status}`)
        if (!cancelled) setConvertedPDFURL(data.convertedPDFURL)
      } catch (err) {
        console.warn('Word document preview failed', err)
        if (!cancelled) setConversionFailed(true)
      }
    })()
    return () => { cancelled = true }
  }, [isWordDoc, fileURL])

  const reload = useCallback(() => setLoadCount((n) => n + 1), [])

  return { fileObj, fileURL, error, convertedPDFURL, conversionFailed, reload }
}
