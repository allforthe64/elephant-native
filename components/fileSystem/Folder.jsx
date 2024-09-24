import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable, TextInput } from 'react-native';
import React, {useState, useEffect} from 'react'
import { ScrollView } from 'react-native-gesture-handler';

//font awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowRight, faEllipsisVertical, faFloppyDisk, faFolder, faPencil, faTrash, faXmark, faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';

import { firebaseAuth } from '../../firebaseConfig';
import { userListener } from '../../firebase/firestore';

const Folder = ({folder, getTargetFolder, deleteFolder, renameFolder, moveFolderFunc, folders, updateUser}) => {

  const [visible, setVisible] = useState(false)
  const [preDelete, setPreDelete] = useState(false)
  const [editName, setEditName] = useState(false)
  const [moveFolder, setMoveFolder] = useState(false)
  const [newName, setNewName] = useState(folder.fileName)
  const [destination, setDestination] = useState({id: null, folderName: null})
  const [validFolders, setValidFolders] = useState()
  const [focusedFolder, setFocusedFolder] = useState()
  const [subFolders, setSubFolders] = useState()
  const [addFolderForm, setAddFolderForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [userInst, setUserInst] = useState()

  const auth = firebaseAuth


  useEffect(() => {
    if (folder.nestedUnder === '') {
      setValidFolders(folders.filter(f => {
        if (f.nestedUnder === '' && f.fileName !== folder.fileName) return f
      }))
    }
    else setValidFolders(folders)
  }, [folders, addFolderForm])

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
    
  }, [addFolderForm])

  useEffect(() => {
    const exists = Object.values(folders).some((value) => {
        return value.nestedUnder === focusedFolder
    })
    setSubFolders(exists)
}, [focusedFolder, addFolderForm])


  //call the delete folder function from the main component and hide both modals
  const deleteFolderFunction = () => {
    deleteFolder({id: folder.id, folderName: folder.fileName})
    setPreDelete(false)
    setVisible(false)
  }

  //pass an object containing data from the current file obj + the new filename to the main component 
  const handleNameChange = () => {
    const newFolder = {
      ...folder,
      fileName: newName
    }
    renameFolder(newFolder)
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
    //if the incoming targetNest is empty string, create the new folder under the home directory
    if (folderName.length > 0) {
    if (targetNest === '') {
        const newFile = {
        id: Math.random().toString(20).toString().split('.')[1] + Math.random().toString(20).toString().split('.')[1],
        fileName: folderName,
        nestedUnder: ''
        }

        const newFiles = [...userInst.files, newFile]
        const updatedUser = {...userInst, files: newFiles}
        await updateUser(updatedUser)
        setNewFolderName('')
        setAddFolderForm(false)
    } else {           //if the incoming targetNest has a value, create the new folder with the nestedUnder property set to targetNest
        const newFile = {
        id: Math.random().toString(20).toString().split('.')[1] + Math.random().toString(20).toString().split('.')[1],
        fileName: folderName,
        nestedUnder: targetNest
        }

        const newFiles = [...userInst.files, newFile]
        const updatedUser = {...userInst, files: newFiles}

        await updateUser(updatedUser)
        setNewFolderName('')
        setAddFolderForm(false)
    }
    } else {
    alert('Please enter a folder name')
    }
  }



  return (
    <View style={{position: 'relative'}}>
      {visible ?
          <Modal animationType='slide' presentationStyle='pageSheet'>
              {preDelete ? 
                /*Code for deleting a folder */
                <Modal animationType='slide' presentationStyle='pageSheet'>
                    <View style={{height: '100%', width: '100%', backgroundColor: '#593060'}}>
                    
                      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%', width: '100%'}}>
                        <Pressable onPress={() => setPreDelete(false)}>
                          <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                        </Pressable>
                      </View>
                    <View style={{width: '100%', height: '95%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 22, color: 'white', textAlign: 'center'}}>Are you sure you want to delete {folder.fileName} and all of its contents?</Text>

                      <View style={{width: '50%',
                            borderRadius: 25,
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
                          borderRadius: 25,
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
                  <View style={{ paddingTop: '10%', backgroundColor: '#593060', height: '100%'}}>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%'}}>
                      <Pressable onPress={() => {
                          setEditName(false)
                          setVisible(false)
                        }}>
                        <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                      </Pressable>
                    </View>
                    {editName ? /*Code for renaming a folder */ 
                    <View style={{paddingTop: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                        <Text style={{color: 'white', fontSize: 35, fontWeight: '700'}}>Rename folder:</Text>
                        <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center',  marginTop: '10%'}}>
                          <View style={styles.iconHolder}>
                              <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                          </View>
                          <TextInput value={newName} style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '70%', marginLeft: '5%'}} onChangeText={(e) => setNewName(e)} autoFocus/>
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
                    /*Code for moving a folder */
                    : moveFolder ? 
                      <Modal animationType='slide' presentationStyle='pageSheet' >
                          <View style={{height: '100%', width: '100%', backgroundColor: '#593060'}}>
                          
                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%', width: '100%'}}>
                              <Pressable onPress={() => {
                                setMoveFolder(false)
                                setNewFolderName('')
                                setAddFolderForm(false)
                              }}>
                                <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                              </Pressable>
                            </View>
                          <View style={{width: '100%', height: '95%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            {!addFolderForm &&
                              <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '10%'}}>Move To...</Text>
                            }
                            {addFolderForm ? 
                              <View style={{width: '100%', height: '100%', display: 'flex', flexDirection:'column', alignItems: 'center'}}>
                                  <Text style={{color: 'white', fontSize: 35, fontWeight: '700', marginTop: '40%', textAlign: 'center'}}>Add A New Folder:</Text>
                                  <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%', width: '100%'}}>
                                      <View style={styles.iconHolder}> 
                                          <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                                      </View>
                                      <TextInput value={newFolderName} style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '75%'}} onChangeText={(e) => setNewFolderName(e)} autoFocus onBlur={() => {if (newFolderName === '') setAddFolderForm(false)}}/>
                                  </View>
                                  <View style={{width: '100%', paddingTop: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                                      <TouchableOpacity style={styles.yellowButtonSM}
                                      onPress={async () => {
                                          addFolder(newFolderName, focusedFolder ? focusedFolder : '')
                                      }}
                                      >   
                                          <View style={styles.iconHolderSmall}>
                                              <FontAwesomeIcon icon={faFloppyDisk} size={18} color='#9F37B0' />
                                          </View>
                                          <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '22%'}}>Save</Text>
                                      </TouchableOpacity>
                                  </View>
                              </View>

                            :
      
                              <View style={{width: '100%', height: '65%', marginBottom: '6%'}}>
                                      {focusedFolder ? 
                                        <View style={{paddingLeft: '2%'}}>
                                            <TouchableOpacity style={styles.yellowButtonSM} onPress={() => {
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
                                        </View>
                                    :
                                        <></>
                                    }
                                    <ScrollView style={focusedFolder ? {paddingTop: '5%', marginTop: '2%'} : {}}>
                                      {focusedFolder && !subFolders ? 
                                          <Text style={{fontSize: 30, color: 'white', fontWeight: 'bold', marginTop: '30%', textAlign: 'center'}}>No Subfolders...</Text>
                                      :
                                        <>
                                          {validFolders.map((f, index) => {
                                              if (focusedFolder) {
                                                  if (f.nestedUnder === focusedFolder) {
                                                          return (
                                                              <Pressable key={index} style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '1%'}} onPress={() => {
                                                                      if (destination.id === null || f.id !== destination.id) {
                                                                          setDestination({id: f.id, fileName: f.fileName, nestedUnder: f.nestedUnder})
                                                                      } else {
                                                                          setFocusedFolder(f.id)
                                                                          setDestination({id: null, fileName: null, nestedUnder: null})
                                                                      }
                                                                  }
                                                                  }>
                                                                  <View style={f.id === destination.id ? styles.moveFolderWhite : styles.moveFolder}>
                                                                  <View style={f.id === destination.id ? styles.iconHolderBlack : styles.iconHolderWhite}>
                                                                      <FontAwesomeIcon icon={faFolder} size={28} color={f.id === destination.id ? 'white' : '#9F37B0'}/>
                                                                  </View>
                                                                  <Text style={f.id === destination.id ? {color: 'black', fontSize: 28, width: '80%', paddingTop: '1%'} : {color: '#9F37B0', fontSize: 28, width: '80%', textAlign: 'left', paddingTop: '1%'}}>{f.fileName}</Text>
                                                                  </View>
                                                              </Pressable>
                                                          )
                                                      
                                                  }
                                              } else {
                                                  if (f.id !== folder.nestedUnder && f.nestedUnder === '') {
                                                      return (
                                                          <Pressable key={index} style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '1%'}} onPress={() => {
                                                                  if (destination.id === null || f.id !== destination.id) {
                                                                      setDestination({id: f.id, fileName: f.fileName, nestedUnder: f.nestedUnder})
                                                                  } else {
                                                                      setFocusedFolder(f.id)
                                                                      setDestination({id: null, fileName: null, nestedUnder: null})
                                                                  }
                                                              }
                                                              }>
                                                              <View style={f.id === destination.id ? styles.moveFolderWhite : styles.moveFolder}>
                                                              <View style={f.id === destination.id ? styles.iconHolderBlack : styles.iconHolderWhite}>
                                                                  <FontAwesomeIcon icon={faFolder} size={28} color={f.id === destination.id ? 'white' : '#9F37B0'}/>
                                                              </View>
                                                              <Text style={f.id === destination.id ? {color: 'black', fontSize: 28, width: '80%', paddingTop: '1%'} : {color: '#9F37B0', fontSize: 28, width: '80%', textAlign: 'left', paddingTop: '1%'}}>{f.fileName}</Text>
                                                              </View>
                                                          </Pressable>
                                                          )
                                                      }
                                                  }
                                              }
                                          )}   
                                        </>
                                      }
                                    </ScrollView>
                              </View>
                            }
                            {!addFolderForm &&
                              <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-around'}}>                    
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
                            }
                          </View>
                        </View>
                      </Modal>
                    :
                      <View style={{paddingLeft: '5%'}}>
                        <Text style={{fontSize: 40, fontWeight: 'bold', color: 'white', marginTop: '5%'}}>{folder.fileName}</Text>
                        <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', paddingTop: '10%'}}>
                          <TouchableOpacity style={styles.yellowButtonSM} onPress={() => setEditName(true)}>
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
                      </View>
                    }
                  </View>
                }
          </Modal>
      : <></>}
      <View style={visible ? styles.folderVisibleMenu : styles.folder}>
        <TouchableOpacity onPress={() => getTargetFolder(folder)} style={{width: '85%'}}>
            <View style={styles.folderTitle}>
                <View style={styles.iconHolder}>
                  <FontAwesomeIcon icon={faFolder} color={'#593060'} size={22} />
                </View>
                <Text style={styles.folderName}>{folder.fileName}</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setVisible(prev => !prev)} style={visible ? {backgroundColor: 'rgba(38, 38, 38, .75)', width: '15%', display: 'flex', justifyContent: 'center', paddingBottom: '1%', flexDirection: 'row'} : {width: '15%', display: 'flex', justifyContent: 'center', flexDirection: 'row', paddingBottom: '2%'}}>
          <FontAwesomeIcon icon={faEllipsisVertical} size={26} color={'white'} style={styles.folderArrow}/>
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
      borderRadius: 100,
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
      borderRadius: 100,
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
    borderRadius: 100,
    display: 'flex',
    flexDirection: 'row',
    width: '70%',
  },
})