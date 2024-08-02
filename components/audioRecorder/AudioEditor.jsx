import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, {useEffect, useState} from 'react'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'

const AudioEditor = ({recordingLine, index, deleteFunc, editRecordings, recordings}) => {
    const [recordingTitle, setRecordingTitle] = useState(recordingLine.name)

    useEffect(() => {
        editRecordings(prev => {
            let arr = [...prev]
            let targetRec = arr[index]
            targetRec.name = recordingTitle
            arr[index] = targetRec
            return arr
        })
    }, [recordingTitle])

  return (
    <View key={index} style={styles.bigCon}>
        <View style={styles.container}>
            <Text style={styles.fill}>{recordingTitle} - {recordingLine.duration}</Text>
            <View style={styles.wrapperContainer}>
                    <TouchableOpacity onPress={() => {recordingLine.sound.replayAsync()}}>
                    <FontAwesomeIcon icon={faPlay} style={{color: 'white', marginTop: '2%'}} size={20}/>
                    </TouchableOpacity>
            </View>
        </View>
        <View style={styles.container}>
            <TextInput value={recordingTitle} onChangeText={(e) => setRecordingTitle(e)} placeholder='Add title for recording' placeholderTextColor={'rgb(0, 0, 0)'} style={styles.input} />
            <TouchableOpacity title='Delete' onPress={() => deleteFunc(recordings, recordingLine)}>
                <Text style={styles.pressable}>Delete</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

export default AudioEditor

const styles = StyleSheet.create({
    bigCon: {
        marginBottom: '5%',
        width: '90%',
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        paddingRight: '5%'
    },
    input: {
        backgroundColor: 'white',
        paddingLeft: '2%',
        fontSize: 15,
        borderWidth: 1,
        width: '60%',
        marginBottom: '5%'
    },
    url: {
        fontSize: 15,
        fontWeight: '600',
        width: '100%',
        color: 'white',
        overflow: 'hidden',
        marginBottom: '5%'
    },
    pressable: {
        color: 'red',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: '25%'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    fill: {
        margin: 16,
        color: 'white'
    },
    wrapperContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '10%',
        marginTop: '4.5%'
    },
    buttonWrapper: {
    width: '100%',
    borderColor: '#777',
    borderRadius: 25,
    backgroundColor: 'white',
    borderWidth: 1,
    paddingTop: '2%',
    paddingBottom: '2%',
    },
    input: {
        backgroundColor: 'white',
        paddingLeft: '2%',
        paddingBottom: '1%',
        fontSize: 15,
        borderWidth: 1,
        width: '60%',
        marginBottom: '5%',
        marginLeft: '5%'
    },
})