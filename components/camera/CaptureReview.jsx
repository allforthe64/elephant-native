import React, { useRef } from 'react'
import { View, Text, Animated, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCloudArrowUp, faEnvelope, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ContentShell from '../ui/ContentShell'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'

const Label = ({ text, style }) => (
  <View style={[styles.label, style]}>
    <Text style={styles.labelText}>{text}</Text>
  </View>
)

const ActionButton = ({ icon, color, onPress, style }) => (
  <TouchableOpacity style={style} onPress={onPress}>
    <View style={styles.iconHolder}>
      <FontAwesomeIcon icon={icon} size={22} color={color} />
    </View>
  </TouchableOpacity>
)

/**
 * Full-screen review of a captured photo or video (passed as children) with
 * Share / Save To Elephant / Delete buttons. The button labels fade out shortly
 * after the review opens.
 */
const CaptureReview = ({ children, onShare, onSave, onDelete }) => {
  const { select } = useResponsiveLayout()
  const insets = useSafeAreaInsets()
  const labelOpacity = useRef(new Animated.Value(1)).current

  const fadeLabels = () => {
    Animated.timing(labelOpacity, {
      delay: 100,
      toValue: 0,
      duration: 2500,
      useNativeDriver: true,
    }).start()
  }

  return (
    <View style={styles.container}>
      {children}
      <ContentShell variant="modal" style={[styles.actions, select(undefined, { top: insets.top + 24, right: 24 })]}>
        <View style={styles.actionsRow}>
          <Animated.View style={[styles.labels, { opacity: labelOpacity }]} onLayout={fadeLabels}>
            <Label text="Share" style={{ width: '50%', marginTop: '2%' }} />
            <Label text="Save To Elephant" style={{ paddingLeft: '4%', paddingRight: '4%', marginTop: '8%' }} />
            <Label text="Delete" style={{ width: '50%', marginTop: '5%' }} />
          </Animated.View>
          <View style={styles.buttons}>
            <ActionButton icon={faEnvelope} color="#9F37B0" onPress={onShare} style={{ marginBottom: 20 }} />
            <ActionButton icon={faCloudArrowUp} color="#9F37B0" onPress={onSave} style={{ marginBottom: 20 }} />
            <ActionButton icon={faTrash} color="#871313" onPress={onDelete} />
          </View>
        </View>
      </ContentShell>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  actions: {
    position: 'absolute',
    top: '8%',
    right: '2.5%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: '2%',
  },
  labels: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginRight: 10,
    paddingTop: 20,
  },
  label: {
    backgroundColor: '#DDCADB',
    marginBottom: 25,
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 17,
  },
  labelText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#593060',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, .5)',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 25,
  },
  iconHolder: {
    backgroundColor: 'white',
    width: 44,
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
})

export default CaptureReview
