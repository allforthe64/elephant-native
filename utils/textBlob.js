import * as FileSystem from 'expo-file-system'

/**
 * Build an uploadable Blob from a string by round-tripping it through a temp file.
 *
 * `new Blob([string])` in React Native computes the byte size in JS, and on iOS that
 * size can exceed the bytes native actually stored. Firebase then slices past the end
 * of the data and the app aborts (NSConcreteMutableData subdataWithRange). Reading the
 * blob back from a file lets native report the real size.
 *
 * Call `cleanup()` once the upload finishes.
 */
export async function createTextBlob(text) {
  const uri = `${FileSystem.cacheDirectory}text-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`
  await FileSystem.writeAsStringAsync(uri, `${text ?? ''}`, {
    encoding: FileSystem.EncodingType.UTF8,
  })

  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = () => resolve(xhr.response)
    xhr.onerror = () => reject(new TypeError('Could not read text file'))
    xhr.responseType = 'blob'
    xhr.open('GET', uri, true)
    xhr.send(null)
  })

  const cleanup = () => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {})
  return { blob, cleanup }
}

export const TEXT_UPLOAD_METADATA = { contentType: 'text/plain; charset=utf-8' }
