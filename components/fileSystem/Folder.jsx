import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import React, {useState, useEffect} from 'react'

//font awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowRight, faEllipsisVertical, faFloppyDisk, faFolder, faPencil, faTrash, faXmark, faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';

import { firebaseAuth } from '../../firebaseConfig';
import { userListener, addFolderToUser, resolveUniqueFolderName } from '../../firebase/firestore';

import { useToast } from 'react-native-toast-notifications';
import { tabletStyle, useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import {
  fileSystemRowStyles,
  FILE_SYSTEM_ROW_ACTIVE_OPACITY,
} from './fileSystemRowStyles';
import KeyboardSafeForm from '../ui/KeyboardSafeForm';
import { useAutoFocusOn } from '../../hooks/useAutoFocusOn';
import MoveFolderDestinationRow from './MoveFolderDestinationRow';
import { getMoveDestinationListHeight } from '../../constants/moveDestinationLayout';

const Folder = ({folder, getTargetFolder, deleteFolder, renameFolder, moveFolderFunc, folders, updateUser}) => {
  const { isTablet, contentFill, modalMaxWidth, height: windowHeight } = useResponsiveLayout()
  const tabletModalPanel = isTablet
    ? { width: '100%', maxWidth: modalMaxWidth, alignSelf: 'center' }
    : null
  // Nested pageSheet modals break flex height; pin the list to a real pixel height
  // so action buttons stay on-screen and the folder list can scroll.
  const moveFolderListHeight = getMoveDestinationListHeight(windowHeight)

  const [visible, setVisible] = useState(false)
  const [preDelete, setPreDelete] = useState(false)
  const [editName, setEditName] = useState(false)
  const [moveFolder, setMoveFolder] = useState(false)
  const [newName, setNewName] = useState('')
  const [destination, setDestination] = useState({id: null, folderName: null})
  const [validFolders, setValidFolders] = useState()
  const [focusedFolder, setFocusedFolder] = useState()
  const [subFolders, setSubFolders] = useState()
  const [addFolderForm, setAddFolderForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [userInst, setUserInst] = useState()
  const [focusedFolderInst, setFocusedFolderInst] = useState()
  const renameInputRef = useAutoFocusOn(editName)
  const addFolderInputRef = useAutoFocusOn(addFolderForm)

  const auth = firebaseAuth

  //instantiate toast object
  const toast = useToast()

  //alpha sort functionality
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

  useEffect(() => {
    if (folder.nestedUnder === '' && folders) {
      const filteredFolders = folders.filter(f => {
        if (f.nestedUnder === '' && f.fileName !== folder.fileName) return f
      })

      const sortedFolders = filteredFolders.sort((a, b) => {
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
      setValidFolders(sortedFolders)
    }
    else {
      if (folders) {
        const sortedFolders = folders.sort((a, b) => {
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
        
        setValidFolders(sortedFolders)
      }
    }
  }, [folders])

  useEffect(() => {
    if (focusedFolder && folders) {
      
      setFocusedFolderInst(folders.filter(folder => folder.id === focusedFolder)[0])
    }
  }, [folders, focusedFolder])

  //get the current user 
  useEffect(() => {
    if (auth) {
        try {
            const getCurrentUser = async () => {
                console.log('running from FocusedFileComp')
                const unsubscribe = await userListener(setUserInst, false, auth.currentUser.uid)
            
                return () => unsubscribe()
            }
            getCurrentUser()
        } catch (err) {alert(err)}
    } else console.log('no user yet')
    
  }, [auth])

  useEffect(() => {
    const exists = Object.values(folders).some((value) => {
        return value.nestedUnder === focusedFolder
    })
    setSubFolders(exists)
}, [focusedFolder, folders])


  //call the delete folder function from the main component and hide both modals
  const deleteFolderFunction = () => {
    deleteFolder({id: folder.id, folderName: folder.fileName})
    setPreDelete(false)
    setVisible(false)
  }

  //pass an object containing data from the current file obj + the new filename to the main component 
  const handleNameChange = () => {
    if (newName === '') return

    // Only append " (N)" when another sibling folder already has this name
    const resolvedName = resolveUniqueFolderName(newName, folders, {
      parentId: folder.nestedUnder,
      excludeId: folder.id,
    })
    if (!resolvedName) return

    const newFolder = {
      ...folder,
      fileName: resolvedName
    }
    renameFolder(newFolder)
    setNewName('')
    setEditName(false)
  }

  //pass an object containing data from the current file obj + the new nestedUnder property to the main component 
  const handleMove = () => {
    if (destination.id !== null) {
      const newFolder = {
        ...folder,
        nestedUnder: destination.id
      }
      setMoveFolder(false)
      setVisible(false)
      moveFolderFunc({newFolder: newFolder, target: 'Home'})
      setDestination({id: null, folderName: null})
    } else if (destination.id === null && focusedFolder !== null && focusedFolder !== undefined) {
      const folderInst = folders.filter(folder => folder.id === focusedFolder)
      const newFolder = {
        ...folder,
        nestedUnder: folderInst[0].id
      }
      setMoveFolder(false)
      setVisible(false)
      moveFolderFunc({newFolder: newFolder, target: destination.folderName})
      setDestination({id: null, folderName: null})
    }
  }

  //add a folder
  const addFolder = async (folderName, targetNest) => {
    try {
      const { newFile } = await addFolderToUser(userInst, folderName, targetNest)
      setNewFolderName('')
      setAddFolderForm(false)
      setFocusedFolder(newFile.id)
    } catch (err) {
      alert(err?.message || String(err))
    }
  }



  return (
    <View style={{position: 'relative'}}>
      {visible ?
          <Modal animationType='slide' presentationStyle='pageSheet'>
              {preDelete ? 
                /*Code for deleting a folder */
                <Modal animationType='slide' presentationStyle='pageSheet'>
                    <View style={[{height: '100%', width: '100%', backgroundColor: '#593060'}, tabletModalPanel]}>
                    
                      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%', width: '100%'}}>
                        <Pressable onPress={() => setPreDelete(false)}>
                          <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                        </Pressable>
                      </View>
                    <View style={{width: '100%', height: '95%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 22, color: 'white', textAlign: 'center'}}>Are you sure you want to delete {folder.fileName} and all of its contents?</Text>

                      <View style={{width: '50%',
                            borderRadius: 12,
                            backgroundColor: 'red',
                            paddingTop: '2%',
                            paddingBottom: '2%',
                            marginTop: '10%',
                            marginLeft: '2%'}}>
                        <TouchableOpacity onPress={deleteFolderFunction} style={{
                          display: 'flex', 
                          flexDirection: 'row', 
                          width: '100%', 
                          justifyContent: 'center',
                        }}>
                            <Text style={{fontSize: 15, color: 'white', fontWeight: '600'}}>Delete</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={{width: '50%',
                          borderColor: '#777',
                          borderRadius: 12,
                          backgroundColor: 'white',
                          borderWidth: 1,
                          paddingTop: '2%',
                          paddingBottom: '2%',
                          marginTop: '7%',
                          marginBottom: '10%',
                          marginLeft: '2%'}}>
                        <TouchableOpacity onPress={() => setPreDelete(false)} style={{
                          display: 'flex', 
                          flexDirection: 'row', 
                          width: '100%', 
                          justifyContent: 'center',
                        }}>
                            <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Cancel</Text>
                        </TouchableOpacity>
                      </View>


                    </View>
                  </View>
                </Modal>
                : 
                  <View style={[{ flex: 1, paddingTop: '10%', backgroundColor: (moveFolder || editName) ? '#fff' : '#593060', height: '100%'}, tabletModalPanel]}>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%'}}>
                      <Pressable onPress={() => {
                          if (addFolderForm) {
                            setAddFolderForm(false)
                            setNewFolderName('')
                          } else if (moveFolder) {
                            setMoveFolder(false)
                            setFocusedFolder(null)
                            setNewFolderName('')
                            setAddFolderForm(false)
                          } else {
                            setEditName(false)
                            setVisible(false)
                            setNewName('')
                          }
                        }}>
                        <FontAwesomeIcon icon={faXmark} color={(moveFolder || editName) ? '#593060' : 'white'} size={30}/>
                      </Pressable>
                    </View>
                    {editName ? /*Code for renaming a folder */ 
                    <KeyboardSafeForm>
                    <View style={{paddingTop: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                        <Text style={{color: '#593060', fontSize: 35, fontWeight: '700'}}>Rename folder:</Text>
                        <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center',  marginTop: '10%'}}>
                          <View style={styles.iconHolder}>
                              <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                          </View>
                          <TextInput value={newName} style={{color: '#593060', fontSize: 20, fontWeight: 'bold', borderBottomColor: '#593060', borderBottomWidth: 2, width: '70%', marginLeft: '5%'}} placeholderTextColor={'#593060'} placeholder='Enter new name' onChangeText={(e) => setNewName(e)} autoFocus ref={renameInputRef}/>
                        </View>
                        <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: '4%'}}>
                            <TouchableOpacity onPress={handleNameChange} style={styles.yellowButtonSM}>
                                <View style={styles.iconHolderSmall}>
                                  <FontAwesomeIcon icon={faFloppyDisk} size={18} color='#9F37B0' />
                                </View>
                                <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', paddingTop: '1%', marginLeft: '24%'}}>Save</Text>
                            </TouchableOpacity>
                          <TouchableOpacity onPress={() => setEditName(false)} style={styles.yellowButtonSM}>
                              <View style={styles.iconHolderSmall}>
                                <FontAwesomeIcon icon={faXmark} size={18} color='#9F37B0' />
                              </View>
                              <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', paddingTop: '1%', marginLeft: '22%'}}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                    </View>
                    </KeyboardSafeForm>
                    /*Code for moving a folder — no nested Modal (breaks flex/scroll height) */
                    : moveFolder ? 
                          <View style={{width: '100%', flex: 1}}>
                            {addFolderForm ? 
                              <KeyboardSafeForm>
                              <View style={{width: '100%', display: 'flex', flexDirection:'column', alignItems: 'center'}}>
                                  <Text style={{color: '#593060', fontSize: 35, fontWeight: '700', marginTop: '40%', textAlign: 'center'}}>Add A New Folder:</Text>
                                  <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%', width: '100%'}}>
                                      <View style={styles.iconHolder}> 
                                          <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                                      </View>
                                      <TextInput value={newFolderName} style={{color: '#593060', fontSize: 20, fontWeight: 'bold', borderBottomColor: '#593060', borderBottomWidth: 2, width: '75%'}} placeholder={'Enter new name'} placeholderTextColor={'#593060'} onChangeText={(e) => setNewFolderName(e)} autoFocus showSoftInputOnFocus ref={addFolderInputRef} onLayout={() => addFolderInputRef.current?.focus?.()}/>
                                  </View>
                                  <View style={{width: '100%', paddingTop: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                                      <TouchableOpacity style={styles.yellowButtonSM}
                                      onPress={() => addFolder(newFolderName, focusedFolder ? focusedFolder : '')}
                                      >   
                                          <View style={styles.iconHolderSmall}>
                                              <FontAwesomeIcon icon={faFloppyDisk} size={18} color='#9F37B0' />
                                          </View>
                                          <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '22%'}}>Save</Text>
                                      </TouchableOpacity>
                                  </View>
                              </View>
                              </KeyboardSafeForm>

                            :
                              <View style={{width: '100%', flex: 1, backgroundColor: '#fff'}}>
                                <Text style={{fontSize: 40, color: '#593060', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: 8}}>Move To...</Text>
                                {focusedFolderInst &&
                                  <Text style={{fontSize: 20, color: '#593060', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: 8}}>Viewing: {focusedFolderInst.fileName}</Text>
                                }
                                      {focusedFolder ? 
                                            <TouchableOpacity style={[styles.yellowButtonSM, {alignSelf: 'flex-start', marginBottom: 8, marginLeft: '2%'}]} onPress={() => {
                                                try {
                                                    const folderInst = folders.filter(folder => folder.id === focusedFolder) 
                                                    const parentFolderInst = folders.filter(folder => folder.id === folderInst[0].nestedUnder)
                                                    console.log(parentFolderInst)
                                                    if (parentFolderInst.length > 0) {
                                                        setDestination({id: parentFolderInst[0].id, fileName: parentFolderInst[0].fileName, nestedUnder: parentFolderInst[0].nestedUnder})
                                                        setFocusedFolder(folderInst[0].nestedUnder)
                                                    } else {
                                                        setDestination({id: null, fileName: null, nestedUnder: null})
                                                        setFocusedFolder(null)
                                                    }
                                                } catch (error) {
                                                    console.log('this is an error within focusedFile: ', error)
                                                }
                                            }}>
                                                <View style={styles.iconHolderSmall}>
                                                    <FontAwesomeIcon icon={faArrowLeft} size={18} color='#9F37B0' /> 
                                                </View>
                                                <Text style={{fontSize: 20, color: '#9F37B0', fontWeight: '600', marginLeft: '10%'}}>Back</Text>
                                            </TouchableOpacity>
                                    :
                                        null
                                    }
                              <View style={{height: moveFolderListHeight, width: '100%', marginBottom: 8, backgroundColor: '#fff'}}>
                              <ScrollView
                                style={{width: '100%', flex: 1}}
                                contentContainerStyle={focusedFolder && !subFolders
                                  ? {flexGrow: 1, justifyContent: 'center', paddingBottom: 16}
                                  : {paddingBottom: 16, paddingTop: 4}}
                                showsVerticalScrollIndicator={true}
                                keyboardShouldPersistTaps="handled"
                              >
                                      {focusedFolder && !subFolders ? 
                                          <Text style={{fontSize: 30, color: '#593060', fontWeight: 'bold', textAlign: 'center'}}>No Subfolders...</Text>
                                      :
                                        <>
                                          {focusedFolder && folder.nestedUnder === '' ?
                                            <Text style={{fontSize: 14, color: '#593060', fontWeight: 'bold', marginTop: 24, textAlign: 'center', paddingHorizontal: '5%'}}>No subfolders to display (Cannot move a home folder to subfolder of a home folder to prevent infinite nesting)</Text>
                                          :
                                            <>
                                              {validFolders.map((f, index) => {
                                                  if (focusedFolder) {
                                                      if (f.nestedUnder === focusedFolder) {
                                                              return (
                                                                  <MoveFolderDestinationRow
                                                                    key={index}
                                                                    selected={f.id === destination.id}
                                                                    fileName={f.fileName}
                                                                    onPress={() => {
                                                                        if (destination.id === f.id) {
                                                                          toast.show("In order to prevent nesting a folder within itself, you are unable to view this folder's subfolders", {
                                                                            type: 'error'
                                                                          }) 
                                                                        } else {
                                                                          if (destination.id === null || f.id !== destination.id) {
                                                                              setDestination({id: f.id, fileName: f.fileName, nestedUnder: f.nestedUnder})
                                                                          } else {
                                                                              setFocusedFolder(f.id)
                                                                              setDestination({id: null, fileName: null, nestedUnder: null})
                                                                          }
                                                                        }
                                                                      }}
                                                                  />
                                                              )
                                                          
                                                      }
                                                  } else {
                                                      if (f.nestedUnder === '') {
                                                          return (
                                                              <MoveFolderDestinationRow
                                                                key={index}
                                                                selected={f.id === destination.id}
                                                                fileName={f.fileName}
                                                                onPress={() => {
                                                                      if (destination.id === null || f.id !== destination.id) {
                                                                          setDestination({id: f.id, fileName: f.fileName, nestedUnder: f.nestedUnder})
                                                                      } else {
                                                                          setFocusedFolder(f.id)
                                                                          setDestination({id: null, fileName: null, nestedUnder: null})
                                                                      }
                                                                  }}
                                                              />
                                                              )
                                                          }
                                                      }
                                                  }
                                              )}   
                                            </>
                                          }
                                        </>
                                      }
                              </ScrollView>
                              </View>
                              <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingTop: 8, paddingBottom: 24, backgroundColor: '#fff'}}>                    
                                <TouchableOpacity onPress={() => setAddFolderForm(true)} style={styles.yellowButtonSM}>
                                    <View style={styles.iconHolderSmall}>
                                        <FontAwesomeIcon icon={faPlus} color='#9F37B0'/>
                                    </View>
                                    <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '10%'}}>Add Folder</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleMove} style={styles.yellowButtonSM}>
                                    <View style={styles.iconHolderSmall}>
                                        <FontAwesomeIcon icon={faArrowRight} color='#9F37B0'/>
                                    </View>
                                    <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '5%'}}>Confirm Move</Text>
                                </TouchableOpacity>  
                            </View>
                              </View>
                            }
                          </View>
                    :
                      <ScrollView
                        style={{ flex: 1, width: '100%' }}
                        contentContainerStyle={{
                          paddingLeft: '5%',
                          paddingRight: '5%',
                          paddingBottom: 48,
                          flexGrow: 1,
                        }}
                        showsVerticalScrollIndicator={false}
                      >
                        <Text style={{fontSize: 40, fontWeight: 'bold', color: 'white', marginTop: '5%'}}>{folder.fileName}</Text>
                        <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', paddingTop: '10%'}}>
                          <TouchableOpacity style={styles.yellowButtonSM} onPress={() => {
                            setNewName('')
                            setEditName(true)
                          }}>
                            <View style={styles.iconHolderSmall}>
                              <FontAwesomeIcon icon={faPencil} color='#9F37B0' size={18} />
                            </View>
                            <Text style={{fontSize: 18, color: '#9F37B0', paddingTop: '1%', marginLeft: '16%', fontWeight: '600'}}>Rename</Text>
                          </TouchableOpacity>
                          {validFolders.length > 1 &&
                              <TouchableOpacity style={styles.yellowButtonSM} onPress={() => setMoveFolder(true)}>
                                <View style={styles.iconHolderSmall}>
                                  <FontAwesomeIcon icon={faArrowRight} size={18} color='#9F37B0' />
                                </View>
                                <Text style={{fontSize: 18, color: '#9F37B0', paddingTop: '1%', marginLeft: '8%', fontWeight: '600'}}>Move Folder</Text>
                              </TouchableOpacity>
                          }
                        </View>
                        <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingTop: '4%'}}>
                          <TouchableOpacity style={styles.deleteButton} onPress={() =>
                            setPreDelete(true)}>
                            <View style={styles.iconHolderSmall}>
                              <FontAwesomeIcon icon={faTrash} size={18} color='red' />
                            </View>
                            <Text style={{fontSize: 18, color: 'red', paddingTop: '1%', marginLeft: '12%', fontWeight: '600'}}>Delete Folder</Text>
                          </TouchableOpacity>
                        </View>
                      </ScrollView>
                    }
                  </View>
                }
          </Modal>
      : <></>}
      <View style={tabletStyle(isTablet, visible ? [fileSystemRowStyles.row, fileSystemRowStyles.rowMenuOpen] : [fileSystemRowStyles.row, fileSystemRowStyles.rowFolder], contentFill)}>
        <TouchableOpacity
          onPress={() => getTargetFolder(folder)}
          activeOpacity={FILE_SYSTEM_ROW_ACTIVE_OPACITY}
          style={fileSystemRowStyles.main}
        >
            <View style={[fileSystemRowStyles.iconHolder, fileSystemRowStyles.iconHolderFolder]}>
              <FontAwesomeIcon icon={faFolder} color={'#593060'} size={20} />
            </View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[fileSystemRowStyles.label, fileSystemRowStyles.labelFolder]}
            >
              {folder.fileName}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setVisible(prev => !prev)}
          activeOpacity={FILE_SYSTEM_ROW_ACTIVE_OPACITY}
          style={[fileSystemRowStyles.trailing, visible && fileSystemRowStyles.trailingActive]}
          accessibilityLabel="Folder options"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} size={22} color={'white'} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Folder

const styles = StyleSheet.create({

    //filing styles
    folder: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingRight: '2%',
        flexDirection: 'row',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#593060',
        width: '90%',
        paddingTop: '2%',
        paddingBottom: '2%',
        paddingLeft: '2%',
        marginBottom: '2%',
        borderRadius: 100
    },
    folderVisibleMenu: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingRight: '2%',
      flexDirection: 'row',
      marginLeft: 'auto',
      marginRight: 'auto',
      borderBottomWidth: 2,
      borderBottomColor: 'white',
      width: '90%',
      paddingBottom: '1.5%',
      paddingLeft: '4%',
      marginBottom: '8%'
  },
    folderTitle: {
      display: 'flex',
      flexDirection: 'row',
      width: '80%',
    },
    folderName: {
      color: 'white',
      textAlign: 'center',
      fontSize: 22,
      fontWeight: '500',
      paddingTop: '3%',
      marginLeft: '5%'
    },
    folderArrow: {
    marginTop: 'auto'
    },
    iconHolder: {
      backgroundColor: '#DDCADB',
      height: 44,
      width: 44,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100
    },
    iconHolderWhite: {
      backgroundColor: 'white',
      height: 44,
      width: 44,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100
    },
    yellowButtonSM: {
      backgroundColor: '#FFE562',
      paddingLeft: 6,
      paddingTop: 6,
      paddingBottom: 6,
      paddingRight: 20,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'row',
      width: '45%',
    },
    iconHolderSmall: {
      backgroundColor: 'white', 
      width: 28, 
      height: 28, 
      display: 'flex', 
      flexDirection: 'row', 
      justifyContent: 'center', 
      alignItems: 'center', 
      borderRadius: 100
    },
    deleteButton: {
      backgroundColor: '#BCBCBC',
      paddingLeft: 6,
      paddingTop: 6,
      paddingBottom: 6,
      paddingRight: 20,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'row',
      width: '50%',
      marginTop: '2%'
    },
    moveFolder: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingRight: '2%',
      flexDirection: 'row',
      marginLeft: 'auto',
      marginRight: 'auto',
      backgroundColor: '#BCBCBC',
      width: '90%',
      paddingTop: '2%',
      paddingBottom: '2%',
      paddingLeft: '2%',
      marginBottom: '2%',
      borderRadius: 100
  },
  moveFolderWhite: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingRight: '2%',
      flexDirection: 'row',
      marginLeft: 'auto',
      marginRight: 'auto',
      backgroundColor: 'white',
      width: '90%',
      paddingTop: '2%',
      paddingBottom: '2%',
      paddingLeft: '2%',
      marginBottom: '2%',
      borderRadius: 100
  },
  iconHolderBlack: {
    backgroundColor: 'black', 
    width: 44, 
    height: 44, 
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 100
  },
  yellowButtonMed: {
    backgroundColor: '#FFE562',
    paddingLeft: 6,
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 20,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'row',
    width: '70%',
  },
})