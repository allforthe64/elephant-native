import React, { useEffect, useState } from 'react'
import { View, Text, Modal, Pressable, ScrollView, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useToast } from 'react-native-toast-notifications'

import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import { useAutoFocusOn } from '../../hooks/useAutoFocusOn'
import { useUserDoc } from '../../hooks/useUserDoc'
import { useFocusedFile } from '../../hooks/useFocusedFile'
import { useNote } from '../../hooks/useNote'
import { displayFileName, getFileKind, resolveRename } from '../../utils/fileNames'

import FilePreview, { ExpandedPreview } from './focusedFile/FilePreview'
import FileActions from './focusedFile/FileActions'
import RenameFileForm from './focusedFile/RenameFileForm'
import MoveFileSheet from './focusedFile/MoveFileSheet'
import NoteEditor from './focusedFile/NoteEditor'
import DeleteFileConfirm from './focusedFile/DeleteFileConfirm'

/**
 * Full-screen view of one file: preview, rename, move, note editing, share and delete.
 * `view` is one of: details, rename, move, renameAndMove, note, delete.
 */
const FocusedFileComp = ({ file, focus, deleteFile, renameFileFunction, handleFileMove }) => {
  const { isTablet, modalMaxWidth } = useResponsiveLayout()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const userInst = useUserDoc()
  const { fileObj, fileURL, error, convertedPDFURL, conversionFailed, reload } = useFocusedFile(file)
  const note = useNote({ file, fileObj, fileURL, userInst })

  const [view, setView] = useState('details')
  const [expanded, setExpanded] = useState(null)
  const [renameText, setRenameText] = useState('')
  const renameInputRef = useAutoFocusOn(view === 'rename')

  const kind = getFileKind(file.fileName)

  useEffect(() => {
    if (!error) return
    alert("Couldn't open this file. Please try again.")
    focus(null)
  }, [error])

  // Notes open straight into the editor.
  useEffect(() => {
    if (note.isNote) setView('note')
  }, [note.isNote])

  /** Rename the file, optionally moving it into `flag` in the same write. */
  const applyRename = (flag) => {
    const resolved = resolveRename(file, renameText, userInst?.fileRefs)
    if (!resolved) {
      alert('Please enter a file name')
      return false
    }
    const unchanged = resolved.fileName === file.fileName && resolved.version === (file.version || 0)
    if (unchanged && flag === undefined) return true

    renameFileFunction(file.fileId, { ...resolved, flag })
    return true
  }

  const closeRename = () => {
    setRenameText('')
    setView('details')
  }

  const renameOnly = () => {
    if (applyRename()) closeRename()
  }

  const startRenameAndMove = () => {
    if (renameText.trim()) setView('renameAndMove')
    else alert('Please enter a file name')
  }

  const renameAndMove = (folder) => {
    if (!applyRename(folder.id)) return
    focus(null)
    toast.show(`Moved file to ${folder.fileName} and renamed it`, { type: 'success' })
  }

  const move = (folder) => {
    focus(null)
    handleFileMove(file.fileId, folder.id)
    toast.show(`Moved file to ${folder.fileName}`, { type: 'success' })
  }

  const saveNote = async () => {
    try {
      await note.save()
      reload()
      setView('details')
      toast.show('Note successfully edited', { type: 'success' })
    } catch (err) {
      alert(err?.message || String(err))
    }
  }

  const handleClose = () => {
    if (view === 'rename') closeRename()
    else focus(null)
  }

  if (!fileObj) return null

  const renderDetails = () => (
    <View style={[styles.panel, { paddingTop: Math.max(insets.top, 24) }, isTablet && { maxWidth: modalMaxWidth, alignSelf: 'center' }]}>
      <View style={styles.closeRow}>
        <Pressable onPress={handleClose} hitSlop={10}>
          <FontAwesomeIcon icon={faXmark} color="#593060" size={30} />
        </Pressable>
      </View>
      <View style={{ flex: 1, width: '100%' }}>
        {view === 'rename' ? (
          <RenameFileForm
            value={renameText}
            onChangeText={setRenameText}
            inputRef={renameInputRef}
            onRename={renameOnly}
            onRenameAndMove={startRenameAndMove}
          />
        ) : (
          <ScrollView
            style={{ flex: 1, width: '100%' }}
            contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 40, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.fileName} numberOfLines={3}>{displayFileName(file)}</Text>
            <FilePreview
              kind={kind}
              fileURL={fileURL}
              convertedPDFURL={convertedPDFURL}
              conversionFailed={conversionFailed}
              onExpand={setExpanded}
            />
            <FileActions
              file={file}
              fileObj={fileObj}
              fileURL={fileURL}
              kind={kind}
              isNote={note.isNote}
              onRename={() => setView('rename')}
              onMove={() => setView('move')}
              onEditNote={() => setView('note')}
              onDelete={() => setView('delete')}
            />
          </ScrollView>
        )}
      </View>
      {expanded ? (
        <ExpandedPreview
          kind={expanded}
          fileURL={fileURL}
          convertedPDFURL={convertedPDFURL}
          onClose={() => setExpanded(null)}
        />
      ) : null}
    </View>
  )

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      {view === 'delete' ? (
        <DeleteFileConfirm
          fileName={file.fileName}
          onCancel={() => setView('details')}
          onConfirm={() => {
            setView('details')
            focus(null)
            deleteFile(file.fileId)
          }}
        />
      ) : view === 'move' || view === 'renameAndMove' ? (
        <MoveFileSheet
          file={file}
          renaming={view === 'renameAndMove'}
          onMove={move}
          onRenameAndMove={renameAndMove}
          onRenameOnly={renameOnly}
          onClose={() => setView(view === 'renameAndMove' ? 'rename' : 'details')}
        />
      ) : view === 'note' ? (
        <NoteEditor note={note} onSave={saveNote} onClose={() => setView('details')} />
      ) : (
        renderDetails()
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
  },
  closeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: '5%',
  },
  fileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#593060',
    marginTop: '5%',
    paddingLeft: '5%',
    paddingRight: '5%',
  },
})

export default FocusedFileComp
