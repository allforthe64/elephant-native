import React from 'react'
import { View, StyleSheet } from 'react-native'
import { faPlus, faBox, faCheck } from '@fortawesome/free-solid-svg-icons'
import YellowButton from '../ui/YellowButton'
import StickyFooter from '../ui/StickyFooter'

/**
 * Sticky footer for Save To destination pickers:
 * Add New Folder + Save To Staging side by side, Confirm Move below.
 */
const SaveDestinationActions = ({
  onAddFolder,
  onSaveStaging,
  onConfirmMove,
  confirmDisabled = false,
}) => {
  return (
    <StickyFooter style={styles.footer}>
      <View style={styles.row}>
        <YellowButton size="sm" icon={faPlus} label="Add Folder" onPress={onAddFolder} />
        <YellowButton size="sm" icon={faBox} label="To Staging" onPress={onSaveStaging} />
      </View>
      <YellowButton
        size="md"
        icon={faCheck}
        label="Confirm Move"
        onPress={onConfirmMove}
        dimmed={confirmDisabled}
      />
    </StickyFooter>
  )
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
})

export default SaveDestinationActions
