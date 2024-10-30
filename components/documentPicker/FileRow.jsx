import { StyleSheet, TextInput, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

const FileRow = ({file, files, index, deleteFunc, setFiles}) => {

    const [fileTitle, setFileTitle] = useState(file.name.split('.')[0])
    const [fileExtension, setFileExtension] = useState(file.name.split('.')[1])

    useEffect(() => {

        //create new file instance
        const newFile = {
            ...file,
            name: fileTitle + '.' + fileExtension
        }

        //create new instance of files
        let newFiles = [
            ...files
        ]
        newFiles[index] = newFile

        //set files
        setFiles(newFiles)

    }, [fileTitle])

  return (
    <View key={index} style={styles.fileRow}>
        <TextInput style={styles.input} value={fileTitle} numberOfLines={1} placeholder='Enter File Name...' onChangeText={e => setFileTitle(e)}/>
        <TouchableOpacity title='Delete' onPress={() => deleteFunc(files, file)}>
            <View style={styles.iconHolderSM}>
                <FontAwesomeIcon icon={faTrash} size={18} color='red'/>
            </View>
        </TouchableOpacity>
    </View>
  )
}

export default FileRow

const styles = StyleSheet.create({
    fileRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        width: '85%',
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