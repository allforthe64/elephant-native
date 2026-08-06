import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faFolder, faFile, faBox } from '@fortawesome/free-solid-svg-icons'
import YellowActionButton from '../ui/YellowActionButton'
import { TestIds } from '../../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'

const FileButtons = ({ navigate }) => {
  const { isTablet } = useResponsiveLayout()

  const row = (testID, label, onPress, icon) => (
    <View style={styles.wrapperContainer}>
      <YellowActionButton
        testID={testID}
        accessibilityLabel={label}
        label={label}
        onPress={onPress}
        elevated
        style={tabletStyle(isTablet, styles.button, tabletStyles.button)}
        iconSize={isTablet ? 52 : 44}
        icon={<FontAwesomeIcon icon={icon} size={isTablet ? 26 : 22} style={{ color: '#9F37B0' }} />}
      />
    </View>
  )

  return (
    <View style={tabletStyle(isTablet, styles.root, tabletStyles.root)}>
      <Text style={tabletStyle(isTablet, styles.quickFilesHeading, tabletStyles.quickFilesHeading)}>Files</Text>
      {row(TestIds.dashboard.myFiles, 'My Files', () => navigate('Files', { staging: false }), faFolder)}
      {row(TestIds.dashboard.uploadDoc, 'Upload Doc', () => navigate('Upload Files'), faFile)}
      {row(TestIds.dashboard.toBeFiled, 'To Be Filed', () => navigate('Files', { staging: true }), faBox)}
    </View>
  )
}

export default FileButtons

const styles = StyleSheet.create({
  root: {
    flexDirection: 'column',
    width: '100%',
  },
  quickFilesHeading: {
    fontSize: 20,
    color: '#9F37B0',
    fontWeight: '500',
    marginLeft: '6%',
  },
  wrapperContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  button: {
    width: '90%',
    marginTop: 0,
  },
})

const tabletStyles = StyleSheet.create({
  root: {
    paddingHorizontal: 8,
  },
  quickFilesHeading: {
    marginLeft: 8,
    marginBottom: 8,
    fontSize: 22,
  },
  button: {
    width: '100%',
  },
})
