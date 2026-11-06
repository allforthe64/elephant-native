import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { faArrowRight, faPencil, faPlus } from '@fortawesome/free-solid-svg-icons'
import YellowButton from '../../ui/YellowButton'
import StickyFooter from '../../ui/StickyFooter'
import DestinationPicker from '../DestinationPicker'
import { useSaveDestination } from '../../../hooks/useSaveDestination'

/**
 * "Move To..." picker for a single file. With `renaming`, the footer also
 * offers renaming without moving.
 */
const MoveFileSheet = ({ file, renaming, onMove, onRenameAndMove, onRenameOnly, onClose }) => {
  // Open in the file's current folder so its subfolders are one tap away.
  const currentFolder = file.flag && file.flag !== 'Staging' ? file.flag : null
  const save = useSaveDestination({ startIn: currentFolder })
  const target = save.targetFolder
  const canMove = !!target && String(target.id) !== String(file.flag)

  const closePicker = () => {
    if (save.addFolderForm) save.setAddFolderForm(false)
    else onClose()
  }

  const confirm = (handler) => () => {
    if (canMove) handler(target)
  }

  const footer = (
    <StickyFooter>
      {renaming ? (
        <>
          <View style={styles.row}>
            <YellowButton size="sm" icon={faPlus} label="Add Folder" onPress={() => save.setAddFolderForm(true)} />
            <YellowButton size="sm" icon={faArrowRight} label="Name + Move" dimmed={!canMove} onPress={confirm(onRenameAndMove)} />
          </View>
          <Text style={styles.orText}>Or</Text>
          <View style={styles.centered}>
            <YellowButton size="md" icon={faPencil} label="Name without moving" onPress={onRenameOnly} />
          </View>
        </>
      ) : (
        <View style={styles.row}>
          <YellowButton size="sm" icon={faPlus} label="Add Folder" onPress={() => save.setAddFolderForm(true)} />
          <YellowButton size="sm" icon={faArrowRight} label="Confirm Move" dimmed={!canMove} onPress={confirm(onMove)} />
        </View>
      )}
    </StickyFooter>
  )

  return <DestinationPicker save={save} title="Move To..." footer={footer} onClose={closePicker} />
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  centered: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  orText: {
    color: '#593060',
    fontSize: 22,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
})

export default MoveFileSheet
