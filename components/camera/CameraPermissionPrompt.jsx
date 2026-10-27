import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import AppPressable from '../ui/AppPressable'
import { TestIds } from '../../constants/testIds'

/** Shown while camera permission is loading (`loading`) or not yet granted. */
const CameraPermissionPrompt = ({ loading, onGrant }) => (
  <View style={styles.container}>
    {loading ? (
      <Text style={styles.message}>Loading camera permissions...</Text>
    ) : (
      <>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <AppPressable
          testID={TestIds.camera.grantPermission}
          accessibilityLabel="Grant camera permission"
          onPress={onGrant}
          style={styles.grantButton}
        >
          <Text style={styles.grantButtonText}>Grant permission</Text>
        </AppPressable>
      </>
    )}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFCF6',
    paddingHorizontal: 24,
  },
  message: {
    textAlign: 'center',
    color: '#593060',
    fontSize: 18,
    marginBottom: 20,
  },
  grantButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  grantButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default CameraPermissionPrompt
