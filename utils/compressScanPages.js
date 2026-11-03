import { Image } from 'react-native'
import * as FileSystem from 'expo-file-system'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'

// About 200 dpi for a letter-size page: sharp enough to read and print, a
// fraction of the size of a full-resolution camera frame.
const MAX_PAGE_WIDTH = 1700
const JPEG_QUALITY = 0.7

const getWidth = (uri) =>
  new Promise((resolve) => Image.getSize(uri, (width) => resolve(width), () => resolve(0)))

/**
 * Re-encode scanned pages as moderately sized JPEGs before they go into a PDF.
 * Pages are processed one at a time to keep memory down on long scans.
 *
 * Returns `{ pages, cleanup }`; a page that fails to shrink is used as-is.
 */
export async function compressScanPages(imagePaths) {
  const pages = []
  const created = []

  for (const path of imagePaths) {
    try {
      const width = await getWidth(path)
      const actions = width > MAX_PAGE_WIDTH ? [{ resize: { width: MAX_PAGE_WIDTH } }] : []
      const { uri } = await manipulateAsync(path, actions, { compress: JPEG_QUALITY, format: SaveFormat.JPEG })
      pages.push(uri)
      created.push(uri)
    } catch (err) {
      console.warn('scan page compression failed, using original:', err?.message || err)
      pages.push(path)
    }
  }

  const cleanup = () => {
    created.forEach((uri) => FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {}))
  }
  return { pages, cleanup }
}
