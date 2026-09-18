import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faPlus, faBox, faCheck } from '@fortawesome/free-solid-svg-icons'
import { Brand } from '../../constants/layout'

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
      <TouchableOpacity onPress={onAddFolder} style={styles.button} activeOpacity={0.82}>
        <View style={styles.iconHolder}>
          <FontAwesomeIcon icon={faPlus} color={Brand.purpleBright} size={16} />
        </View>
        <Text style={styles.label}>Add New Folder</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSaveStaging} style={styles.button} activeOpacity={0.82}>
        <View style={styles.iconHolder}>
          <FontAwesomeIcon icon={faBox} color={Brand.purpleBright} size={16} />
        </View>
        <Text style={styles.label}>Save To Staging</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onConfirmMove}
        disabled={confirmDisabled}
        style={[styles.button, confirmDisabled && styles.buttonDim]}
        activeOpacity={0.82}
      >
        <View style={styles.iconHolder}>
          <FontAwesomeIcon icon={faCheck} color={Brand.purpleBright} size={16} />
        </View>
        <Text style={styles.label}>Confirm Move</Text>
      </TouchableOpacity>
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
  button: {
    width: '85%',
    maxWidth: 360,
    backgroundColor: Brand.yellow,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  buttonDim: {
    opacity: 0.5,
  },
  iconHolder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  label: {
    color: Brand.purpleBright,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
})

export default SaveDestinationActions
