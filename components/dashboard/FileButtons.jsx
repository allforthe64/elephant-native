import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faFolder, faFile, faBox } from '@fortawesome/free-solid-svg-icons'
import AppPressable from '../ui/AppPressable'
import { TestIds } from '../../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'

const FileButtons = ({ navigate }) => {
  const { isTablet } = useResponsiveLayout()

  const row = (testID, label, onPress, icon, phoneMargin) => (
    <View style={styles.wrapperContainer}>
      <AppPressable
        testID={testID}
        accessibilityLabel={label}
        onPress={onPress}
        style={tabletStyle(isTablet, styles.buttonWrapper1, tabletStyles.buttonWrapper1)}
      >
        <View style={tabletStyle(isTablet, styles.iconContainer, tabletStyles.iconContainer)}>
          <FontAwesomeIcon icon={icon} size={isTablet ? 26 : 22} style={{ color: '#9F37B0' }} />
        </View>
        <Text
          style={tabletStyle(
            isTablet,
            { fontSize: 24, color: '#9F37B0', fontWeight: '500', paddingTop: 6, marginLeft: phoneMargin },
            tabletStyles.rowLabel
          )}
        >
          {label}
        </Text>
      </AppPressable>
    </View>
  )

  return (
    <View style={tabletStyle(isTablet, styles.root, tabletStyles.root)}>
      <Text style={tabletStyle(isTablet, styles.quickFilesHeading, tabletStyles.quickFilesHeading)}>Files</Text>
      {row(TestIds.dashboard.myFiles, 'My Files', () => navigate('Files', { staging: false }), faFolder, '20%')}
      {row(TestIds.dashboard.uploadDoc, 'Upload Doc', () => navigate('Upload Files'), faFile, '17%')}
      {row(TestIds.dashboard.toBeFiled, 'To Be Filed', () => navigate('Files', { staging: true }), faBox, '22%')}
    </View>
  )
}

export default FileButtons

const styles = StyleSheet.create({
  root: {
    display: 'flex',
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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    backgroundColor: 'white',
    width: '13.5%',
    height: 45,
    borderRadius: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrapper1: {
    width: '90%',
    display: 'flex',
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#FFE562',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 6,
    marginTop: '2%',
    marginLeft: '2%',
    alignItems: 'center',
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
  buttonWrapper1: {
    width: '100%',
    marginLeft: 0,
    marginTop: 10,
    paddingVertical: 10,
    paddingLeft: 10,
  },
  iconContainer: {
    width: 52,
    height: 52,
  },
  rowLabel: {
    fontSize: 24,
    color: '#9F37B0',
    fontWeight: '500',
    paddingTop: 0,
    marginLeft: 20,
    flex: 1,
  },
})
