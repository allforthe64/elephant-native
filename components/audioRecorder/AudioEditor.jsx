import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native'
import React, {useEffect, useState} from 'react'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faPlay, faTrash } from '@fortawesome/free-solid-svg-icons'

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
    /* <View key={index} style={styles.bigCon}>
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
    </View> */
    <View key={index} style={styles.fileRow}>
        <TouchableOpacity onPress={() => {recordingLine.sound.replayAsync()}}>
            <FontAwesomeIcon icon={faPlay} style={{color: 'white', marginTop: '2%'}} size={18}/>
        </TouchableOpacity>
        <TextInput style={styles.input} value={recordingTitle} numberOfLines={1} placeholder='Enter Recording Name...' onChangeText={e => setRecordingTitle(e)}/>
        <Text style={styles.fill}>{recordingLine.duration}</Text>
        <TouchableOpacity title='Delete' onPress={() => deleteFunc(recordings, recordingLine)}>
            <View style={styles.iconHolderSM}>
                <FontAwesomeIcon icon={faTrash} size={18} color='red'/>
            </View>
        </TouchableOpacity>
    </View>
  )
}

export default AudioEditor

const styles = StyleSheet.create({
    fileRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingBottom: '2%',
        paddingTop: '2%',
        paddingLeft: '2%',
        paddingRight: '2%',
        marginBottom: '4%',
        backgroundColor: '#DDCADB',
        borderRadius: 100
    },
    file: {
        color: 'white',
        width: '65%',
        fontSize: 15,
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'white',
        color: 'black',
        width: '65%',
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: '3%',
        paddingRight: '3%',
        borderRadius: 100
    },
    iconHolderSM: {
        backgroundColor: 'white', 
        height: 36, 
        width: 36, 
        borderRadius: 100, 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
})