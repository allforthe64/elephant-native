import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
import YellowButton from '../../ui/YellowButton'
import { useResponsiveLayout } from '../../../hooks/useResponsiveLayout'

const DeleteFileConfirm = ({ fileName, onConfirm, onCancel }) => {
  const { isTablet, modalMaxWidth } = useResponsiveLayout()

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
      <View style={[styles.sheet, isTablet && { maxWidth: modalMaxWidth, alignSelf: 'center' }]}>
        <View style={styles.closeRow}>
          <TouchableOpacity onPress={onCancel}>
            <FontAwesomeIcon icon={faXmark} color="#593060" size={30} />
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <Text style={styles.heading}>
            Are you sure you want to <Text style={{ color: '#871313' }}>delete</Text> the file:
          </Text>
          <Text style={styles.fileName}>{fileName}?</Text>
          <View style={styles.actions}>
            <YellowButton size="sm" variant="danger" icon={faTrash} label="Delete" onPress={onConfirm} />
            <YellowButton size="sm" icon={faXmark} label="Cancel" onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  sheet: {
    paddingTop: '10%',
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
  },
  closeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: '5%',
    paddingTop: '10%',
    width: '100%',
  },
  body: {
    width: '100%',
    flexDirection: 'column',
    paddingTop: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    color: '#593060',
    textAlign: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    fontWeight: '600',
    marginBottom: '6%',
  },
  fileName: {
    fontSize: 18,
    color: '#593060',
    textAlign: 'center',
    paddingLeft: 30,
    paddingRight: 30,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: '10%',
  },
})

export default DeleteFileConfirm
