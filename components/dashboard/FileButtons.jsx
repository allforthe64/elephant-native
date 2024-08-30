import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faFolder, faFile, faBox } from '@fortawesome/free-solid-svg-icons'

const FileButtons = ({navigate}) => {
  return (
    <View style={{display: 'flex', flexDirection: 'column', width:'100%'}}>
        <Text style={styles.quickFilesHeading}>Quick Files</Text>
        <View style={styles.wrapperContainer}>
            <TouchableOpacity onPress={() => navigate('Files', {staging: false})} style={styles.buttonWrapper1}>
                <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faFolder} size={22} style={{color: '#9F37B0'}}/>
                </View>
                <Text style={{fontSize: 24, color: '#9F37B0', fontWeight: '500', paddingTop: 6, marginLeft: '20%'}}>My Files</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.wrapperContainer}>
            <TouchableOpacity onPress={() => navigate('Upload Files')} style={styles.buttonWrapper1}>
                <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faFile} size={22} style={{color: '#9F37B0'}}/>
                </View>
                <Text style={{fontSize: 24, color: '#9F37B0', fontWeight: '500', paddingTop: 6, marginLeft: '17%'}}>Upload Doc</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.wrapperContainer}>
            <TouchableOpacity onPress={() => navigate('Files', {staging: true})} style={styles.buttonWrapper1}>
                <View style={styles.iconContainer}>
                    <FontAwesomeIcon icon={faBox} size={22} style={{color: '#9F37B0'}}/>
                </View>
                <Text style={{fontSize: 24, color: '#9F37B0', fontWeight: '500', paddingTop: 6, marginLeft: '22%'}}>Staging</Text>
            </TouchableOpacity>
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
        borderRadius: 25,
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