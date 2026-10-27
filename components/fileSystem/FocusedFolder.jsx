import { StyleSheet, Text, View, Modal, Pressable, TextInput } from 'react-native'
import React, {useMemo, useState} from 'react'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowLeft, faXmark, faFolder, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

//file system component imports
import Folder from './Folder'
import File from './File'
import FocusedFileComp from './FocusedFileComp'

//safe area context imports
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { tabletStyle, useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import KeyboardSafeForm from '../ui/KeyboardSafeForm'
import YellowButton from '../ui/YellowButton'
import { useAutoFocusOn } from '../../hooks/useAutoFocusOn'
import { sortByName } from '../../utils/sortByName'

const FocusedFolder = ({folder, folders, files, clear, getTargetFolder, addFolder, renameFolder, moveFolder, deleteFolder, deleteFile, renameFile, moveFile}) => {
    const { isTablet, contentFill, modalMaxWidth } = useResponsiveLayout()
    const insets = useSafeAreaInsets()

    const [add, setAdd] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [focusedFileId, setFocusedFileId] = useState(null)
    const folderRef = useAutoFocusOn(add, 350)

    // Read the folder and its contents from the live lists so renames and moves show up immediately.
    const current = folders.find(f => f.id === folder.folder.id) || folder.folder
    const parent = current.nestedUnder === '' ? undefined : folders.find(f => String(f.id) === String(current.nestedUnder))
    const subFolders = useMemo(() => sortByName(folders.filter(f => f.nestedUnder === current.id)), [folders, current.id])
    const folderFiles = useMemo(() => sortByName(files.filter(f => f.flag === current.id)), [files, current.id])
    const focusedFile = focusedFileId ? folderFiles.find(f => f.fileId === focusedFileId) : undefined

    const focusFile = (file) => setFocusedFileId(file ? file.fileId : null)

    //navigate up a level in the folder tree
    const navigateUp = () => {
        if (parent) getTargetFolder(parent)
        else clear(null)
    }

  return (
    <View style={[
      styles.root,
      {
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 16) + 24,
      },
      isTablet && styles.rootTablet,
    ]}>
        {focusedFile ?
            <FocusedFileComp file={focusedFile} focus={focusFile} deleteFile={deleteFile} renameFileFunction={renameFile} handleFileMove={moveFile} /> 
        :      
                <View style={[styles.body, isTablet && contentFill]}>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.backButtonContainer} onPress={navigateUp}>
                            <FontAwesomeIcon icon={faArrowLeft} color='#593060' size={30} />
                            <Text style={styles.smallHeader}>Back To {parent ? parent.fileName : 'Home'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPressOut={() => clear(null)}>
                            <FontAwesomeIcon icon={faXmark} size={30} color='#593060' />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.title}>
                        <Text style={styles.header}>{current.fileName}</Text>
                    </View>
                    <ScrollView
                      style={styles.listScroll}
                      contentContainerStyle={styles.listContent}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                            {subFolders.map((f) => <Folder key={f.id} folder={f} folders={folders} getTargetFolder={getTargetFolder} renameFolder={renameFolder} moveFolder={moveFolder} deleteFolder={deleteFolder}/>)}
                            {folderFiles.map((file) => <File key={file.fileId} focus={focusFile} file={file} />)}
                    </ScrollView> 
                    {add ? 
                        <Modal presentationStyle='pageSheet' animationType='slide' onRequestClose={() => setAdd(false)} onShow={() => setTimeout(()=>{
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
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginBottom: '6%'}}>
                                        <View style={styles.iconHolder}>
                                        <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                                        </View>
                                        <TextInput placeholder='Enter new name' placeholderTextColor={'#593060'} value={newFolderName} style={{color: '#593060', fontSize: 22, fontWeight: 'bold', borderBottomColor: '#593060', borderBottomWidth: 2, width: '70%', marginLeft: '5%'}} onChangeText={(e) => setNewFolderName(e)} ref={folderRef} autoFocus showSoftInputOnFocus onLayout={() => setTimeout(() => folderRef.current?.focus?.(), 50)}/>
                                    </View>
                                    <YellowButton
                                        size="md"
                                        icon={faFloppyDisk}
                                        label="Save"
                                        onPress={async () => {
                                            const ok = await addFolder(newFolderName, current.id)
                                            if (ok) {
                                                setNewFolderName('')
                                                setAdd(false)
                                            }
                                        }}
                                    />
                                </View>
                                </KeyboardSafeForm>
                            </View>
                        </Modal>
                    : 
                        <View style={styles.addButtonRow}>
                            <YellowButton
                                size="lg"
                                icon={faFolder}
                                label="Add New Folder"
                                style={isTablet ? {width: '100%', maxWidth: '100%', alignSelf: 'stretch'} : undefined}
                                onPress={() => setAdd(true)}
                            />
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
