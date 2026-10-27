import { useCallback, useEffect, useMemo, useState } from 'react'
import { addFolder as addFolderToUser } from '../firebase/fileSystem'
import { sortByName } from '../utils/sortByName'
import { useAutoFocusOn } from './useAutoFocusOn'
import { useUserDoc } from './useUserDoc'

const NO_DESTINATION = { id: null, fileName: null, nestedUnder: null }

const toDestination = (folder) => ({
  id: folder.id,
  fileName: folder.fileName,
  nestedUnder: folder.nestedUnder,
})

/**
 * State and actions for the "Save To..." / "Move To..." folder picker.
 * Pair with <SaveDestinationModal save={...} /> or <DestinationPicker save={...} />.
 *
 * `isHidden(folder)` removes folders from the picker (and with them, everything
 * nested inside, since the user can't open them).
 */
export function useSaveDestination({ isHidden } = {}) {
  const userInst = useUserDoc()

  const [folders, setFolders] = useState([])
  const [preAdd, setPreAdd] = useState(false)
  const [name, setName] = useState('')
  const [nameGiven, setNameGiven] = useState(false)
  const [addFolderForm, setAddFolderForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [focusedFolder, setFocusedFolder] = useState(null)
  const [destination, setDestination] = useState(NO_DESTINATION)
  const addFolderInputRef = useAutoFocusOn(addFolderForm)

  useEffect(() => {
    if (!userInst) return
    if (!Array.isArray(userInst.files)) {
      console.warn('user files is not an array', userInst.files)
    }
    setFolders(sortByName(userInst.files))
  }, [userInst])

  const focusedFolderInst = useMemo(
    () => (focusedFolder ? folders.find((f) => f.id === focusedFolder) : undefined),
    [folders, focusedFolder]
  )

  const visibleFolders = folders.filter((f) =>
    (focusedFolder ? f.nestedUnder === focusedFolder : f.nestedUnder === '') && !isHidden?.(f)
  )

  /** The folder a confirm would use: the selected row, else the folder being viewed. */
  const targetFolder = destination.id !== null
    ? folders.find((f) => f.id === destination.id) || destination
    : focusedFolderInst || null

  const reset = useCallback(() => {
    setPreAdd(false)
    setName('')
    setNameGiven(false)
    setAddFolderForm(false)
    setNewFolderName('')
    setFocusedFolder(null)
    setDestination(NO_DESTINATION)
  }, [])

  const open = useCallback(() => setPreAdd(true), [])

  const close = useCallback(() => {
    if (addFolderForm) setAddFolderForm(false)
    else reset()
  }, [addFolderForm, reset])

  // First tap selects a folder as the destination; a second tap opens it.
  const selectFolder = useCallback((folder) => {
    if (destination.id === null || folder.id !== destination.id) {
      setDestination(toDestination(folder))
    } else {
      setFocusedFolder(folder.id)
      setDestination(NO_DESTINATION)
    }
  }, [destination.id])

  const goBack = useCallback(() => {
    const current = folders.find((f) => f.id === focusedFolder)
    const parent = current ? folders.find((f) => f.id === current.nestedUnder) : undefined
    if (parent) {
      setDestination(toDestination(parent))
      setFocusedFolder(parent.id)
    } else {
      setDestination(NO_DESTINATION)
      setFocusedFolder(null)
    }
  }, [folders, focusedFolder])

  const addFolder = useCallback(async () => {
    try {
      const { newFile, newFiles } = await addFolderToUser(userInst, newFolderName, focusedFolder || '')
      setNewFolderName('')
      setAddFolderForm(false)
      setFolders(sortByName(newFiles))
      setFocusedFolder(newFile.id)
    } catch (err) {
      alert(err?.message || String(err))
    }
  }, [userInst, newFolderName, focusedFolder])

  /** Folder id to upload into, or false for staging. */
  const resolveDestination = useCallback((toStaging = false) => {
    if (toStaging) return false
    if (destination.id !== null) return destination.id
    if (focusedFolder) return focusedFolder
    return false
  }, [destination.id, focusedFolder])

  return {
    userInst,
    folders,
    visibleFolders,
    preAdd,
    open,
    close,
    reset,
    name,
    setName,
    nameGiven,
    setNameGiven,
    addFolderForm,
    setAddFolderForm,
    newFolderName,
    setNewFolderName,
    addFolderInputRef,
    addFolder,
    focusedFolder,
    focusedFolderInst,
    hasSubFolders: visibleFolders.length > 0,
    destination,
    selectFolder,
    goBack,
    resolveDestination,
    targetFolder,
    canConfirm: !!targetFolder,
  }
}
