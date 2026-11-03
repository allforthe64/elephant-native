import React from 'react'
import { View, StyleSheet } from 'react-native'
import { faArrowRight, faPlus } from '@fortawesome/free-solid-svg-icons'
import YellowButton from '../ui/YellowButton'
import StickyFooter from '../ui/StickyFooter'
import DestinationPicker from './DestinationPicker'
import { useSaveDestination } from '../../hooks/useSaveDestination'

/** "Move To..." picker for a folder. */
const MoveFolderSheet = ({ folder, onMove, onClose }) => {
  // Hiding the folder itself also hides everything inside it, so it can't be moved into its own subtree.
  // Start among the folder's siblings so moving it next door is one tap away.
  const save = useSaveDestination({ isHidden: (f) => f.id === folder.id, startIn: folder.nestedUnder || null })
  const target = save.targetFolder
  const canMove = !!target && String(target.id) !== String(folder.nestedUnder)

  const closePicker = () => {
    if (save.addFolderForm) save.setAddFolderForm(false)
    else onClose()
  }

  const footer = (
    <StickyFooter>
      <View style={styles.row}>
        <YellowButton size="sm" icon={faPlus} label="Add Folder" onPress={() => save.setAddFolderForm(true)} />
        <YellowButton
          size="sm"
          icon={faArrowRight}
          label="Confirm Move"
          dimmed={!canMove}
          onPress={() => { if (canMove) onMove(target) }}
        />
      </View>
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
})

export default MoveFolderSheet
