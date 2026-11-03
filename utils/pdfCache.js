import * as FileSystem from 'expo-file-system'

const downloads = new Map()

const hash = (str) => {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

/**
 * Download a PDF to the cache, reusing the file on later opens. Viewers asking
 * for the same URL at the same time share one download (the inline preview and
 * the full-screen view open together).
 *
 * Returns `{ promise, unsubscribe }`; `promise` resolves to the local uri and
 * `onProgress` receives 0–1 while downloading.
 */
export function downloadPdf(url, onProgress) {
  const uri = `${FileSystem.cacheDirectory}pdf-${hash(url)}.pdf`
  let entry = downloads.get(uri)

  if (!entry) {
    const listeners = new Set()
    const promise = (async () => {
      const info = await FileSystem.getInfoAsync(uri)
      if (info.exists && info.size > 0) return uri

      const partial = `${uri}.part`
      try {
        const task = FileSystem.createDownloadResumable(url, partial, {}, ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          if (totalBytesExpectedToWrite > 0) {
            listeners.forEach((listener) => listener(totalBytesWritten / totalBytesExpectedToWrite))
          }
        })
        const result = await task.downloadAsync()
        if (!result || result.status >= 400) throw new Error(`Download failed (${result?.status ?? 'no response'})`)
        await FileSystem.moveAsync({ from: partial, to: uri })
        return uri
      } catch (err) {
        FileSystem.deleteAsync(partial, { idempotent: true }).catch(() => {})
        throw err
      }
    })().finally(() => downloads.delete(uri))

    entry = { promise, listeners }
    downloads.set(uri, entry)
  }

  if (onProgress) entry.listeners.add(onProgress)
  return {
    promise: entry.promise,
    unsubscribe: () => { if (onProgress) entry.listeners.delete(onProgress) },
  }
}

/** Remove a cached PDF so the next open downloads it again. */
export function forgetPdf(url) {
  const uri = `${FileSystem.cacheDirectory}pdf-${hash(url)}.pdf`
  return FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {})
}
