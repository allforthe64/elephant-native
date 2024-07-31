import { StyleSheet, Text, View, Keyboard } from 'react-native'
import React, {useEffect, useState} from 'react'
import { ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native-gesture-handler'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowLeft, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faFolder } from '@fortawesome/free-solid-svg-icons'

//file system component imports
import Folder from './Folder'
import File from './File'
import FocusedFileComp from './FocusedFileComp'

//safe area context imports
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const FocusedFolder = ({folder, folders, clear, getTargetFolder, addFolder, renameFolder, moveFolder, deleteFolder, deleteFile, renameFile, moveFile, files}) => {

    const [nestedFolder, setNestedFolder] = useState()
    const [loading, setLoading] = useState(true)
    const [add, setAdd] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [focusedFile, setFocusedFile] = useState()
    const [keybaordClosed, setKeyboardClosed] = useState(true)
    const [nestedFiles, setNestedFiles] = useState([])
    


    //refresh the folder when the files change
    useEffect(() => {
        getTargetFolder(folder.folder)
        if (focusedFile) {
            const newFile = files.filter(fileRef => fileRef.fileId === focusedFile.fileId)
            setFocusedFile(newFile[0])
        }
    }, [files, folders])

    //get the folder above this one so the user can navigate up a level
    useEffect(() => {
        const getNestedFolder = () => {
            const targetFolder = folders.filter(f => {
            if(f.id === folder.folder.nestedUnder) return f})
            return targetFolder
        }   
        const targetFolder = getNestedFolder()
        setLoading(false)
        setNestedFolder(targetFolder)

        //if a file is currently being focused on, refresh the file instance being passed to the focus file component
        if (focusedFile) {
            const newFile = folder.files.filter(file => {
                if (focusedFile.fileId === file.fileId) return file
                else return false
            })
            setFocusedFile(newFile[0])
        }

        setNestedFiles(folder.files)

    }, [folder])

    //navigate up a level in the folder tree
    const navigateUp = () => {
        const targetFolder = folders.filter(f => {
            if(f.id === folder.folder.nestedUnder) return f}
        ) 
        getTargetFolder(targetFolder[0])
    }

    const insets = useSafeAreaInsets()

    //Set an event listener to shrink down the scrollview once the keyboard has been closed
    useEffect(() => {
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardWillHide',
            () => {
                setKeyboardClosed(true); // or some other action
            }
        );

        return () => {
            keyboardDidHideListener.remove();
        };
    }, [])

  return (
    <View style={add && !keybaordClosed
        ? {
            height: '180%',
            width: '100%',
            paddingTop: '5%',
            paddingBottom: '5%',
            position: 'absolute', 
            backgroundColor: 'rgba(0, 0, 0, .8)',
            paddingTop: insets.top,
            paddingBottom: insets.bottom
        } :
        {
            height: '100%',
            width: '100%',
            paddingTop: '5%',
            paddingBottom: '5%',
            position: 'absolute', 
            backgroundColor: 'rgba(0, 0, 0, .8)',
            paddingTop: insets.top,
            paddingBottom: insets.bottom
        }}>
        {loading ? <></> 
        : focusedFile ?
            <FocusedFileComp file={focusedFile} focus={setFocusedFile} deleteFile={deleteFile} renameFileFunction={renameFile} folders={folders} handleFileMove={moveFile} addFolder={addFolder}/> 
        :      
                <ScrollView scrollEnabled={add ? true : false}>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.backButtonContainer} onPress={folder.folder.nestedUnder === '' ? () => clear(null) : () => navigateUp()}>
                                <FontAwesomeIcon icon={faArrowLeft} color='white' size={20} />
                                <Text style={styles.smallHeader}>Back To {nestedFolder.length > 0 ? nestedFolder[0].fileName : 'Home'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPressOut={() => clear(null)}>
                                <FontAwesomeIcon icon={faXmark} size={30} color='white' />
                            </TouchableOpacity>
                    </View>
                    
                    <View style={styles.title}>
                        <Text style={styles.header}>{folder.folder.fileName}</Text>
                    </View>
                    <View style={add ? {height: 250} : {height: 267, marginBottom: '5%'}}>
                        <ScrollView style={{height: '100%'}}>
                            {folder.folders.map((f, i) => {return <Folder key={f + i} getTargetFolder={getTargetFolder} folders={folders} renameFolder={renameFolder} moveFolderFunc={moveFolder} folder={f} deleteFolder={deleteFolder}/>})}
                            {nestedFiles.map((file, i) => {return <File key={file + i} focus={setFocusedFile} file={file} />})}
                        </ScrollView> 
                    </View>
                        {add ? 
                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                                    <FontAwesomeIcon icon={faFolder} size={30} color='white'/>
                                    <TextInput value={newFolderName} style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '40%'}} onChangeText={(e) => setNewFolderName(e)} autoFocus onFocus={() => setKeyboardClosed(false)} onBlur={() => {if (newFolderName === '') setAdd(false)}}/>
                                    <View style={{width: '25%',
                                            borderColor: '#777',
                                            borderRadius: 25,
                                            backgroundColor: 'white',
                                            borderWidth: 1,
                                            paddingTop: '2%',
                                            paddingBottom: '2%',
                                            marginLeft: '2%'}}>
                                            <TouchableOpacity style={{
                                            display: 'flex', 
                                            flexDirection: 'row', 
                                            width: '100%', 
                                            justifyContent: 'center',
                                            }}
                                            onPress={() => {
                                                addFolder(newFolderName, folder.folder.id)
                                                setNewFolderName('')
                                                setAdd(false)
                                            }}
                                            >
                                                <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Save</Text>
                                            </TouchableOpacity>
                                    </View>
                                </View>
                                : 
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                                <FontAwesomeIcon icon={faFolder} size={30} color='white'/>
                                <View style={{width: '50%',
                                            borderColor: '#777',
                                            borderRadius: 25,
                                            backgroundColor: 'white',
                                            borderWidth: 1,
                                            paddingTop: '2%',
                                            paddingBottom: '2%',
                                            marginBottom: '10%',
                                            marginLeft: '2%'}}>
                                        <TouchableOpacity style={{
                                            display: 'flex', 
                                            flexDirection: 'row', 
                                            width: '100%', 
                                            justifyContent: 'center',
                                        }}
                                            onPress={() => {
                                                setAdd(true)
                                                setKeyboardClosed(false)
                                            }}
                                        >
                                            <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Add New Folder</Text>
                                        </TouchableOpacity>
                                </View>
                            </View>
                        }
                </ScrollView>
        }
    </View>
  )
}

export default FocusedFolder

const styles = StyleSheet.create({
    title: {
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: '2.5%',
        paddingBottom: '2.5%',
        paddingRight: '5%',
        marginBottom: '15%'
    },
    buttonContainer: {
        width: '100%', 
        display: 'flex', 
        flexDirection: 'row', 
        paddingLeft: '4%', 
        marginBottom: '10%'
    },
    backButtonContainer: {
        display: 'flex', 
        flexDirection: 'row', 
        width: '78%', 
        paddingTop: '2%'
    },
    header: {
        color: 'white',
        fontSize: 30,
        fontWeight: '500',
        position: 'absolute',
        textAlign: 'center',
        width: '100%',
        paddingTop: '2.5%',
        paddingRight: '5%'
    },
    smallHeader: {
        color: 'white',
        fontSize: 18,
        fontWeight: '500',
        width: '100%',
        paddingLeft: '2.5%',
    }
})