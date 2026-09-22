import { StyleSheet, Text, View, Keyboard, Modal, Pressable, TextInput } from 'react-native'
import React, {useEffect, useState} from 'react'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'

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
import { tabletStyle, useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import KeyboardSafeForm from '../ui/KeyboardSafeForm'
import { useAutoFocusOn } from '../../hooks/useAutoFocusOn'

const FocusedFolder = ({folder, folders, clear, getTargetFolder, addFolder, renameFolder, moveFolder, deleteFolder, deleteFile, renameFile, moveFile, files, updateUser}) => {
    const { isTablet, contentFill, modalMaxWidth } = useResponsiveLayout()

    const [nestedFolder, setNestedFolder] = useState()
    const [loading, setLoading] = useState(true)
    const [add, setAdd] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [focusedFile, setFocusedFile] = useState()
    const [keybaordClosed, setKeyboardClosed] = useState(true)
    const [nestedFiles, setNestedFiles] = useState([])
    const [alphaSortedFolders, setAlphaSortedFolders] = useState([])

    //initialize ref for addFolder form
    const folderRef = useAutoFocusOn(add, 350)
    
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
        const sortedFolders = [...(Array.isArray(folder.folders) ? folder.folders : [])].sort((a, b) => {
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
        const sortedFiles = [...(Array.isArray(folder.files) ? folder.files : [])].sort((a, b) => {
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
    <View style={[
      styles.root,
      {
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 16) + 24,
      },
      isTablet && styles.rootTablet,
    ]}>
        {loading ? <></> 
        : focusedFile ?
            <FocusedFileComp file={focusedFile} focus={setFocusedFile} deleteFile={deleteFile} renameFileFunction={renameFile} folders={folders} handleFileMove={moveFile} /> 
        :      
                <View style={[styles.body, isTablet && contentFill]}>

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
                    <ScrollView
                      style={styles.listScroll}
                      contentContainerStyle={styles.listContent}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                            {alphaSortedFolders.map((f, i) => {return <Folder key={f + i} focusedFolder={folder} getTargetFolder={getTargetFolder} folders={folders} renameFolder={renameFolder} moveFolderFunc={moveFolder} folder={f} deleteFolder={deleteFolder} updateUser={updateUser}/>})}
                            {nestedFiles.map((file, i) => {return <File key={file + i} focus={setFocusedFile} file={file} />})}
                    </ScrollView> 
                    {add ? 
                        <Modal presentationStyle='pageSheet' animationType='slide' onShow={() => setTimeout(()=>{
                            folderRef.current?.focus?.()
                        }, 350)}>
                            <View style={tabletStyle(isTablet, {height: '100%', width: '100%', backgroundColor: '#fff'}, {maxWidth: modalMaxWidth, alignSelf: 'center'})}>
                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%',width: '100%'}}>
                                    <Pressable onPress={() => {
                                        setAdd(false)
                                        setNewFolderName('')
                                    }}>
                                    <FontAwesomeIcon icon={faXmark} color={'#593060'} size={30}/>
                                    </Pressable>
                                </View>
                                <KeyboardSafeForm>
                                <View style={styles.addFolderContainer}>
                                    <Text style={styles.addFolderHeading}>Add new folder:</Text>
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginBottom: '6%'}}  
                                    >
                                        <View style={styles.iconHolder}>
                                        <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                                        </View>
                                        <TextInput placeholder='Enter new name' placeholderTextColor={'#593060'} value={newFolderName} style={{color: '#593060', fontSize: 22, fontWeight: 'bold', borderBottomColor: '#593060', borderBottomWidth: 2, width: '70%', marginLeft: '5%'}} onChangeText={(e) => setNewFolderName(e)} onFocus={() => setKeyboardClosed(false)} ref={folderRef} autoFocus showSoftInputOnFocus onLayout={() => setTimeout(() => folderRef.current?.focus?.(), 50)}/>
                                    </View>
                                    <Pressable style={styles.nonFolderButtonSM}
                                        onPress={async () => {
                                            const ok = await addFolder(newFolderName, folder.folder.id)
                                            if (ok) {
                                                setNewFolderName('')
                                                setAdd(false)
                                            }
                                        }}
                                    >
                                        <View style={styles.iconHolderSM}>
                                            <FontAwesomeIcon icon={faFloppyDisk} size={18} color='#9F37B0'/>
                                        </View>
                                        <Text style={{fontSize: 22, color: '#9F37B0', fontWeight: '600', paddingTop: '1%', marginLeft: '15%'}}>Save</Text>
                                    </Pressable>
                                </View>
                                </KeyboardSafeForm>
                            </View>
                        </Modal>
                    : 
                        <View style={styles.addButtonRow}>
                            <TouchableOpacity style={tabletStyle(isTablet, styles.nonFolderButton65, {width: '100%', maxWidth: '100%', alignSelf: 'stretch'})}
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
    root: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
    },
    rootTablet: {
        height: '100%',
    },
    body: {
        flex: 1,
        width: '100%',
    },
    listScroll: {
        flex: 1,
        width: '100%',
        minHeight: 0,
    },
    listContent: {
        paddingBottom: 16,
        flexGrow: 1,
    },
    addButtonRow: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 8,
    },
    title: {
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
        minHeight: 48,
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
        textAlign: 'center',
        width: '100%',
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
        borderRadius: 12, 
        width: '90%',
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
        borderRadius: 12, 
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
        color: '#593060',
        marginBottom: '10%',
    }
})