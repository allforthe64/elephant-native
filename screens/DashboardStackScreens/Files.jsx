import { useState, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Modal, Pressable } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';

import * as fileSystem from '../../firebase/fileSystem';

//file system component imports
import Folder from '../../components/fileSystem/Folder';
import FocusedFolder from '../../components/fileSystem/FocusedFolder';
import Staging from '../../components/fileSystem/Staging';

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBox, faFile, faFloppyDisk, faFolder, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

//safe area context import
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//toast notification import
import { useToast } from 'react-native-toast-notifications';
import ContentShell from '../../components/ui/ContentShell';
import KeyboardSafeForm from '../../components/ui/KeyboardSafeForm';
import YellowButton from '../../components/ui/YellowButton';
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout';
import { useAutoFocusOn } from '../../hooks/useAutoFocusOn';
import { useUserDoc } from '../../hooks/useUserDoc';
import { sortByName } from '../../utils/sortByName';

export default function Files({navigation: { navigate }, route}) {
  const { isTablet } = useResponsiveLayout()
  const insets = useSafeAreaInsets()
  const toast = useToast()
  const currentUser = useUserDoc()

  const [stagingMode, setStagingMode] = useState(route.params.staging)
  const [focusedFolder, setFocusedFolder] = useState()
  const [add, setAdd] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const inputRef = useAutoFocusOn(add)

  const userFolders = Array.isArray(currentUser?.files) ? currentUser.files : []
  const userFileRefs = Array.isArray(currentUser?.fileRefs) ? currentUser.fileRefs : []
  const topLevelFolders = useMemo(() => sortByName(userFolders.filter(f => f.nestedUnder === '')), [currentUser])
  const staging = useMemo(() => userFileRefs.filter(ref => ref.flag === 'Staging'), [currentUser])

  //get the files and folders nested under a particular folder
  const getTargetFolder = (input) => {
    const targetFiles = userFileRefs.filter(file => file.flag === input.id)
    const targetFolders = userFolders.filter(file => file.nestedUnder === input.id)
    setFocusedFolder({folder: input, files: targetFiles, folders: targetFolders})
  }

  const run = async (action, successMessage) => {
    try {
      await action()
      if (successMessage) toast.show(successMessage, { type: 'success' })
    } catch (err) {
      alert(err?.message || String(err))
    }
  }

  const deleteFile = (fileId) => run(() => fileSystem.deleteFile(currentUser, fileId), 'Deleted File')
  const renameFile = (fileId, changes) => run(() => fileSystem.renameFile(currentUser, fileId, changes))
  const moveFile = (fileId, flag) => run(() => fileSystem.moveFile(currentUser, fileId, flag))
  const deleteFolder = (folder) => run(() => fileSystem.deleteFolder(currentUser, folder.id), `Deleted ${folder.fileName}`)
  const renameFolder = (folderId, fileName) => run(() => fileSystem.renameFolder(currentUser, folderId, fileName))
  const moveFolder = (folderId, target) =>
    run(() => fileSystem.moveFolder(currentUser, folderId, target.id), `Moved folder to ${target.fileName}`)

  const addFolder = async (folderName, parentId) => {
    try {
      const { newFile } = await fileSystem.addFolder(currentUser, folderName, parentId)
      setNewFolderName('')
      setAdd(false)
      setFocusedFolder({folder: newFile, files: [], folders: []})
      return true
    } catch (err) {
      alert(err?.message || String(err))
      return false
    }
  }

  const fileHandlers = { deleteFile, renameFile, moveFile }
  const folderHandlers = { renameFolder, moveFolder, deleteFolder }

  return ( 
      <View style={styles.container}>
        <ContentShell variant="content" fill>
        {currentUser ? 
          focusedFolder ? 
            <FocusedFolder folder={focusedFolder} {...folderHandlers} {...fileHandlers} addFolder={addFolder} folders={userFolders} clear={setFocusedFolder} getTargetFolder={getTargetFolder} files={userFileRefs}/> 
          : stagingMode ? 
            <Staging reset={setStagingMode} staging={staging} userFiles={userFileRefs} {...fileHandlers}/> 
          :
          <View style={[styles.homeBody, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
                    <View style={styles.header}>
                      <YellowButton size="md" icon={faBox} label="To be filed" onPress={() => setStagingMode(true)} />
                    </View>
                    <ScrollView
                      style={styles.listScroll}
                      contentContainerStyle={styles.listContent}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                        {topLevelFolders.map((folder) => (
                          <Folder key={folder.id} folder={folder} folders={userFolders} getTargetFolder={getTargetFolder} {...folderHandlers}/>
                        ))}
                    </ScrollView>
                    {add ? 
                      <Modal animationType='slide' presentationStyle='pageSheet' onRequestClose={() => setAdd(false)} onShow={() => setTimeout(()=>{
                          inputRef.current?.focus()
                        }, 200)}>
                        <View style={{height: '100%', width: '100%', backgroundColor: '#fff'}}>
                          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%',width: '100%'}}>
                              <Pressable onPress={() => {
                                setAdd(false)
                                setNewFolderName('')
                              }}>
                              <FontAwesomeIcon icon={faXmark} color={'#593060'} size={30}/>
                              </Pressable>
                          </View>
                          <ContentShell variant="modal" fill>
                          <KeyboardSafeForm>
                          <View style={styles.addFolderContainer}>
                            <Text style={tabletStyle(isTablet, styles.addFolderHeading, tabletStyles.modalHeading)}>Add new folder:</Text>
                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginBottom: '6%'}}>
                              <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                              </View>
                              <TextInput value={newFolderName} placeholder='Enter new name' placeholderTextColor={'#593060'} style={{color: '#593060', fontSize: 22, fontWeight: 'bold', borderBottomColor: '#593060', borderBottomWidth: 2, width: '70%', marginLeft: '5%'}} onChangeText={(e) => setNewFolderName(e)} ref={inputRef} autoFocus showSoftInputOnFocus onLayout={() => inputRef.current?.focus?.()}/>
                            </View>
                            <YellowButton
                              size="md"
                              icon={faFloppyDisk}
                              label="Save"
                              style={isTablet ? tabletStyles.actionButton : undefined}
                              onPress={() => addFolder(newFolderName, '')}
                            />
                          </View>
                          </KeyboardSafeForm>
                          </ContentShell>
                        </View>
                      </Modal>
                    : 
                    <View style={styles.homeActions}>
                          <YellowButton
                            size="md"
                            label="Add New Folder"
                            onPress={() => setAdd(true)}
                            style={isTablet ? tabletStyles.actionButton : undefined}
                            icon={faPlus}
                          />
                          <YellowButton
                            size="md"
                            label="Get Document"
                            onPress={() => navigate('Upload Files')}
                            style={isTablet ? tabletStyles.actionButton : undefined}
                            icon={faFile}
                          />
                    </View>
                    }
          </View>
                    
        : <>
            <Text style={{color: '#593060'}}>Loading...</Text>
          </>
        }
        </ContentShell>
      <StatusBar style="auto" />
    </View>
    
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  homeBody: {
    flex: 1,
    width: '100%',
    paddingTop: 8,
    paddingBottom: 8,
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
  homeActions: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    gap: 12,
    paddingHorizontal: 16,
  },
  header: {
    display: 'flex', 
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    width: '90%', 
    marginLeft: 'auto', 
    marginRight: 'auto',
    marginBottom: 16,
  },
  iconHolder: {
    backgroundColor: 'white', 
    height: 44, 
    width: 44, 
    borderRadius: 100, 
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    flexShrink: 0,
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
    marginBottom: '10%'
  }
});

const tabletStyles = StyleSheet.create({
  modalHeading: {
    marginBottom: 48,
  },
  actionButton: {
    maxWidth: '100%',
  },
});
