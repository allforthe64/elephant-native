import { StyleSheet, Text, View, Keyboard, Modal, Pressable } from 'react-native'
import React, {useEffect, useState, useRef} from 'react'
import { ScrollView, TouchableOpacity, TextInput } from 'react-native-gesture-handler'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowLeft, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faFolder, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

//file system component imports
import Folder from './Folder'
import File from './File'
import FocusedFileComp from './FocusedFileComp'

//safe area context imports
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const FocusedFolder = ({folder, folders, clear, getTargetFolder, addFolder, renameFolder, moveFolder, deleteFolder, deleteFile, renameFile, moveFile, files, updateUser}) => {

    const [nestedFolder, setNestedFolder] = useState()
    const [loading, setLoading] = useState(true)
    const [add, setAdd] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [focusedFile, setFocusedFile] = useState()
    const [keybaordClosed, setKeyboardClosed] = useState(true)
    const [nestedFiles, setNestedFiles] = useState([])
    const [alphaSortedFolders, setAlphaSortedFolders] = useState([])

    //initialize ref for addFolder form
    const folderRef = useRef()
    
    //alpha sort helper functions
    const getSortableValue = (val) => {
        if (typeof val !== "string") return { original: "", isNumber: false };

        const trimmed = val.trim();
        const firstChar = trimmed.charAt(0);

        const isNumber = /^[0-9]/.test(firstChar);

        return {
        original: trimmed,
        isNumber,
        firstChar
        };
    };

    const safeLocaleCompare = (a, b) => {
        try {
        return a.localeCompare(b, undefined, { numeric: true });
        } catch {
        return a.localeCompare(b);
        }
    }

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
            if(f.id.toString() === folder.folder.nestedUnder.toString()) return f})
            return targetFolder
        }   
        const targetFolder = getNestedFolder()
        setLoading(false)
        setNestedFolder(targetFolder)
        
        //sorting the subfolders
        const sortedFolders = folder.folders.sort((a, b) => {
            const aVal = getSortableValue(a.fileName);
            const bVal = getSortableValue(b.fileName);

            // Numbers first (descending)
            if (aVal.isNumber && bVal.isNumber) {
            const numA = parseFloat(aVal.original) || 0;
            const numB = parseFloat(bVal.original) || 0;
            return numA - numB; // ascending
            }

            if (aVal.isNumber && !bVal.isNumber) return -1; // number before non-number
            if (!aVal.isNumber && bVal.isNumber) return 1;  // non-number after number

            // Both non-numbers → alphabetical (UTF-8 safe)
            return safeLocaleCompare(aVal.firstChar, bVal.firstChar);
        })
        setAlphaSortedFolders(sortedFolders)

        //if a file is currently being focused on, refresh the file instance being passed to the focus file component
        if (focusedFile) {
            const newFile = folder.files.filter(file => {
                if (focusedFile.fileId === file.fileId) return file
                else return false
            })
            setFocusedFile(newFile[0])
        }

        //alpha sorting the files
        const sortedFiles = folder.files.sort((a, b) => {
            const aVal = getSortableValue(a.fileName);
            const bVal = getSortableValue(b.fileName);

            // Numbers first (descending)
            if (aVal.isNumber && bVal.isNumber) {
            const numA = parseFloat(aVal.original) || 0;
            const numB = parseFloat(bVal.original) || 0;
            return numA - numB; // ascending
            }

            if (aVal.isNumber && !bVal.isNumber) return -1; // number before non-number
            if (!aVal.isNumber && bVal.isNumber) return 1;  // non-number after number

            // Both non-numbers → alphabetical (UTF-8 safe)
            return safeLocaleCompare(aVal.firstChar, bVal.firstChar);
        })

        setNestedFiles(sortedFiles)

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
            backgroundColor: '#FFFCF6',
            paddingTop: insets.top,
            paddingBottom: insets.bottom
        } :
        {
            height: '100%',
            width: '100%',
            paddingTop: '5%',
            paddingBottom: '5%',
            position: 'absolute', 
            backgroundColor: '#FFFCF6',
            paddingTop: insets.top,
            paddingBottom: insets.bottom
        }}>
        {loading ? <></> 
        : focusedFile ?
            <FocusedFileComp file={focusedFile} focus={setFocusedFile} deleteFile={deleteFile} renameFileFunction={renameFile} folders={folders} handleFileMove={moveFile} addFolder={addFolder}/> 
        :      
                <View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.backButtonContainer} onPress={folder.folder.nestedUnder === '' ? () => clear(null) : () => navigateUp()}>
                            <FontAwesomeIcon icon={faArrowLeft} color='#593060' size={30} />
                            <Text style={styles.smallHeader}>Back To {nestedFolder.length > 0 ? nestedFolder[0].fileName : 'Home'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPressOut={() => clear(null)}>
                            <FontAwesomeIcon icon={faXmark} size={30} color='#593060' />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.title}>
                        <Text style={styles.header}>{folder.folder.fileName}</Text>
                    </View>
                    <View style={add ? {height: 250} : {height: 365, marginBottom: '10%'}}>
                        <ScrollView style={{height: '100%'}}>
                            {alphaSortedFolders.map((f, i) => {return <Folder key={f + i} focusedFolder={folder} getTargetFolder={getTargetFolder} folders={folders} renameFolder={renameFolder} moveFolderFunc={moveFolder} folder={f} deleteFolder={deleteFolder} updateUser={updateUser}/>})}
                            {nestedFiles.map((file, i) => {return <File key={file + i} focus={setFocusedFile} file={file} />})}
                        </ScrollView> 
                    </View>
                    {add ? 
                        <Modal presentationStyle='pageSheet' animationType='slide' onShow={() => setTimeout(()=>{
                            folderRef.current.focus()
                        }, 200)}>
                            <View style={{height: '100%', width: '100%', backgroundColor: '#593060'}}>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%',width: '100%'}}>
                                    <Pressable onPress={() => {
                                        setAdd(false)
                                        setNewFolderName('')
                                    }}>
                                    <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                                    </Pressable>
                                </View>
                                <View style={styles.addFolderContainer}>
                                    <Text style={styles.addFolderHeading}>Add new folder:</Text>
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginBottom: '6%'}}  
                                    >
                                        <View style={styles.iconHolder}>
                                        <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                                        </View>
                                        <TextInput value={newFolderName} style={{color: 'white', fontSize: 22, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '70%', marginLeft: '5%'}} onChangeText={(e) => setNewFolderName(e)} onFocus={() => setKeyboardClosed(false)} ref={folderRef} onBlur={() => {if (newFolderName === '') setAdd(false)}}/>
                                    </View>
                                    <Pressable style={styles.nonFolderButtonSM}
                                        onPress={() => {
                                            addFolder(newFolderName, folder.folder.id)
                                            setAdd(false)
                                        }}
                                    >
                                        <View style={styles.iconHolderSM}>
                                            <FontAwesomeIcon icon={faFloppyDisk} size={18} color='#9F37B0'/>
                                        </View>
                                        <Text style={{fontSize: 22, color: '#9F37B0', fontWeight: '600', paddingTop: '1%', marginLeft: '15%'}}>Save</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </Modal>
                    : 
                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                            <TouchableOpacity style={styles.nonFolderButton65}
                                onPress={() => {
                                    setAdd(true)
                                    setKeyboardClosed(false)
                                }}
                            >    
                                <View style={styles.iconHolder}>
                                    <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                                </View>
                                <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '10%', paddingTop: '1.25%'}}>Add New Folder</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
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
        marginBottom: '6%'
    },
    backButtonContainer: {
        display: 'flex', 
        flexDirection: 'row', 
        width: '78%', 
    },
    header: {
        color: '#593060',
        fontSize: 30,
        fontWeight: '600',
        position: 'absolute',
        textAlign: 'center',
        width: '100%',
        paddingTop: '2.5%',
        paddingRight: '5%'
    },
    smallHeader: {
        color: '#593060',
        fontSize: 22,
        fontWeight: '500',
        width: '100%',
        paddingLeft: '2.5%',
    },
    nonFolderButton65: {
        display: 'flex', 
        flexDirection: 'row', 
        backgroundColor: '#FFE562', 
        paddingLeft: '2%', 
        paddingTop: '2%', 
        paddingBottom: '2%', 
        borderRadius: 100, 
        width: '110%'
      },
      iconHolder: {
        backgroundColor: 'white', 
        height: 36, 
        width: 36, 
        borderRadius: 100, 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center'
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
      nonFolderButtonSM: {
        display: 'flex', 
        flexDirection: 'row', 
        backgroundColor: '#FFE562', 
        paddingLeft: '2%', 
        paddingTop: '2%', 
        paddingBottom: '2%', 
        borderRadius: 100, 
        width: 180,
      },
    addFolderContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addFolderHeading: {
        fontWeight: '600',
        fontSize: 40,
        color: 'white',
        marginBottom: '10%',
    }
})