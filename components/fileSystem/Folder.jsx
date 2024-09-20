import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable, TextInput } from 'react-native';
import React, {useState, useEffect} from 'react'
import { ScrollView } from 'react-native-gesture-handler';

//font awesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowRight, faEllipsisVertical, faFloppyDisk, faFolder, faPencil, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';

const Folder = ({folder, getTargetFolder, deleteFolder, renameFolder, moveFolderFunc, folders}) => {

  const [visible, setVisible] = useState(false)
  const [preDelete, setPreDelete] = useState(false)
  const [editName, setEditName] = useState(false)
  const [moveFolder, setMoveFolder] = useState(false)
  const [newName, setNewName] = useState(folder.fileName)
  const [destination, setDestination] = useState({id: null, folderName: null})
  const [validFolders, setValidFolders] = useState()


  useEffect(() => {
    if (folder.nestedUnder === '') setValidFolders(folders.filter(f => {if (f.nestedUnder === '') return f}))
    else setValidFolders(folders)
  }, [folders])

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
    if (destination === 'home') {
      const newFolder = {
        ...folder,
        nestedUnder: ''
      }
      setMoveFolder(false)
      setVisible(false)
      moveFolderFunc({newFolder: newFolder, target: 'Home'})
      setDestination({id: null, folderName: null})
    } else {
      const newFolder = {
        ...folder,
        nestedUnder: destination.id
      }
      setMoveFolder(false)
      setVisible(false)
      moveFolderFunc({newFolder: newFolder, target: destination.folderName})
      setDestination({id: null, folderName: null})
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
                          <View style={{height: '100%', width: '100%', backgroundColor: 'rgb(23 23 23)'}}>
                          
                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%', width: '100%'}}>
                              <Pressable onPress={() => setMoveFolder(false)}>
                                <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                              </Pressable>
                            </View>
                          <View style={{width: '100%', height: '95%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '10%'}}>Move To...</Text>
      
                            <View style={{width: '100%', height: '65%'}}>
                                  <ScrollView>
                                    {folders.map(f => {
                                      if (f.id !== folder.id) return (
                                        <Pressable style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'}} onPress={() => setDestination({id: f.id, folderName: f.fileName})}>
                                          <View style={f.id === destination.id ? {borderBottomWidth: 2, width: '85%', backgroundColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'} : {borderBottomWidth: 2, width: '85%', borderBottomColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'}}>
                                            <FontAwesomeIcon icon={faFolder} size={30} color={f.id === destination.id ? 'black' : 'white'}/>
                                            <Text style={f.id === destination.id ? {color: 'black', fontSize: 30, marginLeft: '5%'} : {color: 'white', fontSize: 30, marginLeft: '5%'}}>{f.fileName}</Text>
                                          </View>
                                        </Pressable>)
                                    })}
                                    <Pressable style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'}} onPress={() => setDestination({id: 'home', folderName: null})}>
                                          <View style={destination.id === 'home' ? {borderBottomWidth: 2, width: '85%', backgroundColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'} : {borderBottomWidth: 2, width: '85%', borderBottomColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'}}>
                                            <FontAwesomeIcon icon={faFolder} size={30} color={destination.id === 'home' ? 'black' : 'white'}/>
                                            <Text style={destination.id === 'home' ? {color: 'black', fontSize: 30, marginLeft: '5%'} : {color: 'white', fontSize: 30, marginLeft: '5%'}}>Home</Text>
                                          </View>
                                        </Pressable>
                                  </ScrollView>
                            </View>
      
                            <View style={{width: '50%',
                                borderColor: '#777',
                                borderRadius: 25,
                                backgroundColor: 'white',
                                borderWidth: 1,
                                paddingTop: '2%',
                                paddingBottom: '2%',
                                marginBottom: '10%',
                                marginLeft: '2%'}}>
                              <TouchableOpacity onPress={handleMove} style={{
                                display: 'flex', 
                                flexDirection: 'row', 
                                width: '100%', 
                                justifyContent: 'center',
                              }}>
                                  <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Confirm Move</Text>
                              </TouchableOpacity>
                            </View>
      
      
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
})