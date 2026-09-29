import React from 'react'
import { View, StyleSheet } from 'react-native'
import { faPlus, faBox, faCheck } from '@fortawesome/free-solid-svg-icons'
import YellowButton from '../ui/YellowButton'

/**
 * Stacked equal-width actions for Save To destination pickers:
 * Add New Folder, Save To Staging, Confirm Move.
 */
const SaveDestinationActions = ({
  onAddFolder,
  onSaveStaging,
  onConfirmMove,
  confirmDisabled = false,
  paddingBottom = 12,
}) => {
  return (
    <View style={[styles.footer, { paddingBottom }]}>
      <YellowButton size="md" icon={faPlus} label="Add New Folder" onPress={onAddFolder} />
      <YellowButton size="md" icon={faBox} label="Save To Staging" onPress={onSaveStaging} />
      <YellowButton
        size="md"
        icon={faCheck}
        label="Confirm Move"
        onPress={onConfirmMove}
        dimmed={confirmDisabled}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
    backgroundColor: '#fff',
    gap: 10,
  },
})

export default SaveDestinationActions
