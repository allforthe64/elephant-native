import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faFolder, faFile, faBox } from '@fortawesome/free-solid-svg-icons'
import AppPressable from '../ui/AppPressable'
import { TestIds } from '../../constants/testIds'

const FileButtons = ({navigate}) => {
  return (
    <View style={{display: 'flex', flexDirection: 'column', width:'100%'}}>
        <Text style={styles.quickFilesHeading}>Files</Text>
        <View style={styles.wrapperContainer}>
            <AppPressable
              testID={TestIds.dashboard.myFiles}
              accessibilityLabel="My Files"
              onPress={() => navigate('Files', {staging: false})}
              style={styles.buttonWrapper1}
            >
                <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faFolder} size={22} style={{color: '#9F37B0'}}/>
                </View>
                <Text style={{fontSize: 24, color: '#9F37B0', fontWeight: '500', paddingTop: 6, marginLeft: '20%'}}>My Files</Text>
            </AppPressable>
        </View>
        <View style={styles.wrapperContainer}>
            <AppPressable
              testID={TestIds.dashboard.uploadDoc}
              accessibilityLabel="Upload Doc"
              onPress={() => navigate('Upload Files')}
              style={styles.buttonWrapper1}
            >
                <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faFile} size={22} style={{color: '#9F37B0'}}/>
                </View>
                <Text style={{fontSize: 24, color: '#9F37B0', fontWeight: '500', paddingTop: 6, marginLeft: '17%'}}>Upload Doc</Text>
            </AppPressable>
        </View>
        <View style={styles.wrapperContainer}>
            <AppPressable
              testID={TestIds.dashboard.toBeFiled}
              accessibilityLabel="To Be Filed"
              onPress={() => navigate('Files', {staging: true})}
              style={styles.buttonWrapper1}
            >
                <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faBox} size={22} style={{color: '#9F37B0'}}/>
                </View>
                <Text style={{fontSize: 24, color: '#9F37B0', fontWeight: '500', paddingTop: 6, marginLeft: '22%'}}>To Be Filed</Text>
            </AppPressable>
        </View>
    </View>
  )
}

export default FileButtons

const styles = StyleSheet.create({
    quickFilesHeading: {
        fontSize: 20,
        color: '#9F37B0',
        fontWeight: '500',
        marginLeft: '6%'
    },
    buttonContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, .6)',
        position: 'absolute',
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
        alignItems: 'center'
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
        marginLeft: '2%'
      },
    file: {
        display: 'flex', 
        flexDirection: 'row', 
        width: '100%', 
        justifyContent: 'center'
    },
    input: {
        textAlign: 'left',
        fontSize: 24,
        color: '#9F37B0',
        fontWeight: '500'
      }
})
