import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import YellowButton from '../ui/YellowButton'
import { Brand } from '../../constants/layout'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'

const CancelSubscriptionConfirm = ({ loading, onConfirm, onClose }) => {
  const { isTablet, modalMaxWidth } = useResponsiveLayout()
  const close = loading ? undefined : onClose

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <View style={[styles.sheet, isTablet && { maxWidth: modalMaxWidth, alignSelf: 'center' }]}>
        <View style={styles.closeRow}>
          <TouchableOpacity onPress={close} disabled={loading}>
            <FontAwesomeIcon icon={faXmark} color={Brand.purple} size={30} />
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <Text style={styles.heading}>
            <Text style={{ color: Brand.danger }}>Cancel</Text> Subscription
          </Text>
          <Text style={styles.message}>
            Once you have cancelled your subscription, you will be signed out and returned to the home page.
            Cancelling your subscription is final, and doing so will remove all of your information stored on
            My Elephant App. Proceed?
          </Text>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={Brand.purple} />
              <Text style={styles.loadingText}>Deleting your account...</Text>
            </View>
          ) : (
            <View style={styles.actions}>
              <YellowButton size="sm" variant="danger" icon={faCheck} label="Cancel" onPress={onConfirm} />
              <YellowButton size="sm" icon={faXmark} label="Close window" onPress={onClose} />
            </View>
          )}
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
    paddingTop: '10%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    color: '#808080',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
  },
  message: {
    fontSize: 17,
    lineHeight: 25,
    color: Brand.purple,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: '10%',
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: '10%',
  },
  loadingText: {
    color: Brand.purple,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
})

export default CancelSubscriptionConfirm
