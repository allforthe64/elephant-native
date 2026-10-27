import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCloudArrowUp, faRepeat, faVideoCamera, faCamera, faSquare } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { faCircle as solidCircle } from '@fortawesome/free-solid-svg-icons'
import AppPressable from '../ui/AppPressable'
import { TestIds } from '../../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'

/**
 * Overlay controls on the live camera: auto-save ("session") toggle, flip,
 * photo/video mode toggle, and the shutter / record button.
 */
const CameraControls = ({
  session,
  onToggleSession,
  onFlip,
  videoMode,
  onToggleMode,
  recording,
  onTakePhoto,
  onStartVideo,
  onStopVideo,
}) => {
  const { isTablet } = useResponsiveLayout()

  return (
    <>
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onToggleSession}
          style={[styles.roundButton, { backgroundColor: session ? 'white' : 'rgba(0, 0, 0, .5)' }]}
        >
          <FontAwesomeIcon icon={faCloudArrowUp} color={session ? 'black' : 'white'} size={30} />
        </TouchableOpacity>
      </View>
      <View style={[styles.topRow, { top: 75 }]}>
        <AppPressable testID={TestIds.camera.flip} accessibilityLabel="Flip camera" onPress={onFlip} style={styles.roundButton}>
          <FontAwesomeIcon icon={faRepeat} color="white" size={30} />
        </AppPressable>
      </View>
      <View style={tabletStyle(isTablet, styles.bottomRow, tabletStyles.bottomRow)}>
        <AppPressable
          testID={TestIds.camera.modeToggle}
          accessibilityLabel={videoMode ? 'Switch to photo mode' : 'Switch to video mode'}
          onPress={onToggleMode}
          style={[styles.roundButton, { marginRight: '10%', marginTop: '5%' }]}
        >
          <FontAwesomeIcon icon={videoMode ? faCamera : faVideoCamera} color="white" size={30} />
        </AppPressable>
        {!videoMode ? (
          <AppPressable testID={TestIds.camera.shutter} accessibilityLabel="Take photo" onPress={onTakePhoto} style={{ marginRight: '17%' }}>
            <FontAwesomeIcon icon={faCircle} size={90} color="white" />
          </AppPressable>
        ) : recording ? (
          <AppPressable testID={TestIds.camera.shutter} accessibilityLabel="Stop video" onPress={onStopVideo} style={styles.recordButton}>
            <FontAwesomeIcon icon={faSquare} size={55} color="#871313" />
          </AppPressable>
        ) : (
          <AppPressable testID={TestIds.camera.shutter} accessibilityLabel="Start video" onPress={onStartVideo} style={styles.recordButton}>
            <FontAwesomeIcon icon={solidCircle} size={55} color="#871313" />
          </AppPressable>
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  topRow: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '12.5%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: '5%',
  },
  roundButton: {
    width: '14%',
    height: '55%',
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, .5)',
  },
  bottomRow: {
    position: 'absolute',
    bottom: '5%',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  recordButton: {
    marginRight: '17%',
    backgroundColor: 'transparent',
    borderWidth: 8,
    borderColor: 'white',
    borderRadius: 1000,
    width: '24%',
    height: 90,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

const tabletStyles = StyleSheet.create({
  bottomRow: {
    bottom: 32,
  },
})

export default CameraControls
