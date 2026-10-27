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
  const save = useSaveDestination({ isHidden: (f) => f.id === folder.id })

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
          dimmed={!save.canConfirm}
          onPress={() => { if (save.targetFolder) onMove(save.targetFolder) }}
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
