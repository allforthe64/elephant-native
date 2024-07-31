import { StyleSheet, TextInput, Text, View, Button, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'

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
        <TextInput style={{
            backgroundColor: 'white',
            color: 'black',
            width: '70%',
            paddingTop: 2,
            paddingBottom: 2,
            paddingLeft: 2
        }} value={fileTitle} numberOfLines={1} placeholder='Enter File Name...' onChangeText={e => setFileTitle(e)}/>
        <TouchableOpacity title='Delete' onPress={() => deleteFunc(files, file)}>
            <Text style={styles.pressable}>Delete</Text>
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
        paddingLeft: '5%',
        paddingRight: '5%',
        marginBottom: '7%'
    },
    file: {
        color: 'white',
        width: '65%',
        fontSize: 15,
        fontWeight: '600',
    },
    pressable: {
        color: 'red',
        fontSize: 15,
        fontWeight: '500'
    }
})