import { doc, getDoc, deleteDoc, updateDoc, writeBatch, arrayRemove, arrayUnion, increment } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebaseConfig'
import { createFolderId, resolveUniqueFolderName } from './firestore'

/*
 * File and folder edits for a user document.
 *
 * Each edit swaps only the array entries it touches (arrayRemove + arrayUnion in
 * one batch) instead of rewriting the whole user doc from a local copy, so a
 * concurrent write such as the upload worker's arrayUnion is never overwritten.
 * Batched writes also queue while offline, like the old updateDoc calls did.
 *
 * `user` is the latest user doc snapshot ({ uid, files, fileRefs, ... }); the
 * entry being replaced is looked up there so arrayRemove matches it exactly.
 */

const userRef = (uid) => doc(db, 'users', uid)
const sameId = (a, b) => String(a) === String(b)
const sizeOf = (fileRef) => Number(fileRef?.size) || 0

function findFileRef(user, fileId) {
  const fileRef = (user?.fileRefs || []).find((r) => sameId(r.fileId, fileId))
  if (!fileRef) throw new Error("That file couldn't be found. It may have been moved or deleted.")
  return fileRef
}

function findFolder(user, folderId) {
  const folder = (user?.files || []).find((f) => sameId(f.id, folderId))
  if (!folder) throw new Error("That folder couldn't be found. It may have been moved or deleted.")
  return folder
}

async function replaceEntry(uid, field, oldEntry, newEntry) {
  const batch = writeBatch(db)
  batch.update(userRef(uid), { [field]: arrayRemove(oldEntry) })
  batch.update(userRef(uid), { [field]: arrayUnion(newEntry) })
  await batch.commit()
}

/** Ids of `folderId` and every folder nested under it, at any depth. */
export function collectFolderTree(folders, folderId) {
  const ids = new Set([String(folderId)])
  let grew = true
  while (grew) {
    grew = false
    for (const f of folders || []) {
      if (!ids.has(String(f.id)) && ids.has(String(f.nestedUnder))) {
        ids.add(String(f.id))
        grew = true
      }
    }
  }
  return ids
}

/** Delete a file doc and its storage objects. Failures are logged, not thrown. */
async function deleteFileRecord(fileId) {
  try {
    const snap = await getDoc(doc(db, 'files', fileId))
    const data = snap.exists() ? snap.data() : null
    const uris = [data?.uri, data?.thumbnailUri].filter(Boolean)
    await Promise.all(uris.map((uri) =>
      deleteObject(ref(storage, uri)).catch((err) => console.warn('storage delete failed:', uri, err?.code || err))
    ))
    await deleteDoc(doc(db, 'files', fileId))
  } catch (err) {
    console.warn('file record cleanup failed:', fileId, err?.code || err)
  }
}

// Files

/** Rename a file (`{ fileName, version }`), optionally moving it into `flag` in the same write. */
export async function renameFile(user, fileId, { fileName, version, flag }) {
  const oldRef = findFileRef(user, fileId)
  const newRef = { ...oldRef, fileName, version, ...(flag !== undefined && { flag }) }
  await Promise.all([
    updateDoc(doc(db, 'files', fileId), { fileName, version }),
    replaceEntry(user.uid, 'fileRefs', oldRef, newRef),
  ])
}

/** Move a file into a folder id (or 'Staging'). */
export async function moveFile(user, fileId, flag) {
  const oldRef = findFileRef(user, fileId)
  await replaceEntry(user.uid, 'fileRefs', oldRef, { ...oldRef, flag })
}

/** Point a file at a new storage object (used when a note is re-saved). */
export async function setFileUri(user, fileId, uri) {
  const oldRef = findFileRef(user, fileId)
  await Promise.all([
    updateDoc(doc(db, 'files', fileId), { uri }),
    replaceEntry(user.uid, 'fileRefs', oldRef, { ...oldRef, uri }),
  ])
}

/** Remove a file from the user, then delete its record and storage objects. */
export async function deleteFile(user, fileId) {
  const fileRef = findFileRef(user, fileId)
  await updateDoc(userRef(user.uid), {
    fileRefs: arrayRemove(fileRef),
    spaceUsed: increment(-sizeOf(fileRef)),
  })
  await deleteFileRecord(fileRef.fileId)
}

// Folders

/** Add a folder under `parentId` ('' for top level). Resolves " (N)" name collisions. */
export async function addFolder(user, folderName, parentId = '') {
  const name = String(folderName ?? '').trim()
  if (!name) throw new Error('Please enter a folder name')
  if (!user?.uid) throw new Error('Still loading your folders. Tap Save again.')

  const existing = Array.isArray(user.files) ? user.files : []
  const nestedUnder = parentId == null ? '' : parentId
  const newFile = {
    id: createFolderId(),
    fileName: resolveUniqueFolderName(name, existing, { parentId: nestedUnder }),
    nestedUnder,
  }
  await updateDoc(userRef(user.uid), { files: arrayUnion(newFile) })
  return { newFile, newFiles: [...existing, newFile] }
}

export async function renameFolder(user, folderId, fileName) {
  const folder = findFolder(user, folderId)
  await replaceEntry(user.uid, 'files', folder, { ...folder, fileName })
}

/** Move a folder under another folder. Refuses to move a folder into itself or its own subfolders. */
export async function moveFolder(user, folderId, parentId) {
  const folder = findFolder(user, folderId)
  if (collectFolderTree(user.files, folderId).has(String(parentId))) {
    throw new Error("A folder can't be moved into itself or one of its subfolders.")
  }
  await replaceEntry(user.uid, 'files', folder, { ...folder, nestedUnder: parentId })
}

/** Delete a folder, its subfolders and every file in them. */
export async function deleteFolder(user, folderId) {
  const treeIds = collectFolderTree(user.files, folderId)
  const folders = (user.files || []).filter((f) => treeIds.has(String(f.id)))
  const fileRefs = (user.fileRefs || []).filter((r) => treeIds.has(String(r.flag)))

  const changes = { files: arrayRemove(...folders) }
  if (fileRefs.length > 0) {
    changes.fileRefs = arrayRemove(...fileRefs)
    changes.spaceUsed = increment(-fileRefs.reduce((sum, r) => sum + sizeOf(r), 0))
  }
  await updateDoc(userRef(user.uid), changes)

  await Promise.all(fileRefs.map((r) => deleteFileRecord(r.fileId)))
}
