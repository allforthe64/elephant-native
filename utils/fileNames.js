export function getFileExtension(name) {
  const parts = (name || '').split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

export function getFileBasename(name) {
  const parts = (name || '').split('.')
  if (parts.length <= 1) return name || ''
  return parts.slice(0, -1).join('.')
}

/** "photo" + "jpg" + 2 -> "photo (2).jpg". Version 0 has no suffix. */
export function formatDisplayName(basename, ext, version = 0) {
  const versioned = version > 0 ? `${basename} (${version})` : basename
  return ext ? `${versioned}.${ext}` : versioned
}

/** The name shown to users: the stored fileName plus its " (N)" version suffix. */
export function displayFileName(file) {
  return formatDisplayName(getFileBasename(file.fileName), getFileExtension(file.fileName), file.version || 0)
}

/** Strip the extension and any trailing " (N)" so rename input is a clean basename. */
export function normalizeRenameInput(input, ext) {
  let name = (input || '').trim()
  if (!name) return ''
  if (ext && name.toLowerCase().endsWith(`.${ext}`.toLowerCase())) {
    name = name.slice(0, -(ext.length + 1))
  }
  return name.replace(/\s\(\d+\)$/, '').trim()
}

/**
 * Resolve rename input to the stored `{ fileName, version }`, or null if blank.
 * The version only counts OTHER files with the same basename, so keeping a
 * file's current name doesn't add " (1)".
 */
export function resolveRename(file, input, fileRefs = []) {
  const ext = getFileExtension(file.fileName)
  const basename = normalizeRenameInput(input, ext)
  if (!basename) return null

  const target = basename.toLowerCase()
  const version = fileRefs.filter((ref) =>
    ref.fileId !== file.fileId && getFileBasename(ref.fileName).toLowerCase() === target
  ).length

  return { fileName: ext ? `${basename}.${ext}` : basename, version }
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png']
const WORD_EXTS = ['doc', 'docx', 'docm', 'dot', 'dotx', 'dotm']
const VIDEO_EXTS = ['mp4', 'mov']

/** Preview type for a file name: 'image' | 'pdf' | 'word' | 'video' | 'other'. */
export function getFileKind(fileName) {
  const ext = getFileExtension(fileName).toLowerCase()
  if (IMAGE_EXTS.includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (WORD_EXTS.includes(ext)) return 'word'
  if (VIDEO_EXTS.includes(ext)) return 'video'
  return 'other'
}
