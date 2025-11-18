import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Keyboard, Pressable } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';

//firestore function imports
import { userListener, updateUser, deleteFileObj, updateFileObj } from '../../firebase/firestore';

//file system component imports
import Folder from '../../components/fileSystem/Folder';
import FocusedFolder from '../../components/fileSystem/FocusedFolder';
import Staging from '../../components/fileSystem/Staging';

//import firebaseAuth object
import { firebaseAuth } from '../../firebaseConfig';

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBox, faFile, faFloppyDisk, faFolder, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

//safe area context import
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//toast notification import
import { useToast } from 'react-native-toast-notifications';

export default function Files({navigation: { navigate }, route}) {

  try {

  //initialize state 
  const [currentUser, setCurrentUser] = useState()
  const [staging, setStaging] = useState([])
  const [stagingMode, setStagingMode] = useState(route.params.staging)
  const [loading, setLoading] = useState(true)
  const [focusedFolder, setFocusedFolder] = useState()
  const [add, setAdd] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [keyBoardClosed, setKeyboardClosed] = useState(true)
  const [alphaSortedFiles, setAlphaSortedFiles] = useState([])

  const inputRef = useRef()

  //consume toast context for notifications
  const toast = useToast()


  //get the auth user context object
  const auth = firebaseAuth

  //get the current user 
  useEffect(() => {
    setLoading(true) //prevent component to attempting to render files/folders before they exist
    if (auth) {
      try {
        const getCurrentUser = async () => {
          console.log('running from files comp')
          const unsubscribe = await userListener(setCurrentUser, setStaging, auth.currentUser.uid)
          return () => unsubscribe()
        }
        getCurrentUser()
      } catch (err) {console.log(err)}
    } else console.log('no user yet')
    
  }, [])

  //once a current user has been pushed into state, allow component to render files/folders
  useEffect(() => {
    if (currentUser) {
      setLoading(false)

      if (Array.isArray(userInst?.files)) {
        //alphabetically sort the currentUser folders
        const sortedFiles = currentUser.files.sort((a, b) => {
            const aFirst = (a.fileName?.[0] ?? "").toLowerCase();
            const bFirst = (b.fileName?.[0] ?? "").toLowerCase();

            const isALetter = /^[a-z]/.test(aFirst);
            const isBLetter = /^[a-z]/.test(bFirst);

            // Prioritize numbers first
            if (!isALetter && isBLetter) return -1;
            if (isALetter && !isBLetter) return 1;

            // If both start with numbers, compare numerically
            if (!isALetter && !isBLetter) {
                const numA = parseInt(aFirst, 10);
                const numB = parseInt(bFirst, 10);
                return numA - numB;
            }

            // If both start with letters, compare alphabetically
            return a.fileName.localeCompare(b.fileName, undefined, { numeric: true });
        })

        setAlphaSortedFiles(sortedFiles)
      } else {
        alert('userInst.files is not an array')
      }
    }
  }, [currentUser])  

  //get the files and folders nested under a particular folder
  const getTargetFolder = (input) => {
    const targetFiles = currentUser.fileRefs.filter(file => {if (file.flag === input.id) return file})
    const targetFolders = currentUser.files.filter(file => {if (file.nestedUnder === input.id) return file})
    setFocusedFolder({folder: input, files: targetFiles, folders: targetFolders})
  }

  //function to handle editing the user
  const editUser = async (mode, input, index) => {
    if (mode === 'file') {
      if (index === 'delete' || index === 'rename' || index === 'move') {
        //update the user with the new file refs array sent through the input param
        let updatedUser = {...currentUser, fileRefs: input.newFiles}
        if (index === 'rename') {
          await updateFileObj(input.targetFile)
        }
        if (index === 'delete') {
          updatedUser = {...updatedUser, spaceUsed: currentUser.spaceUsed - input.targetFile.size}
          await deleteFileObj(input.targetFile.fileId)
        }
        await updateUser(updatedUser)
        if (index === 'delete') {
          toast.show(`Deleted File`, {
            type: 'success'
          })
        }
      }
    }
    else if (mode === 'folder') {
      //remove the file ref from the existing file refs and return the array
      //set the updatedUsers's fileref field to the newRefs array
      //update the user using the updatedUser object
      //reset the delete array
      if (index === 'delete') {
        let newSpaceUsed = currentUser.spaceUsed
        input.refsToDelete.forEach(async (ref) => {
          newSpaceUsed -= ref.size
          await deleteFileObj(ref.fileId)
        })
        const updatedUser = {...currentUser, files: input.newFolders, fileRefs: input.refsToKeep, spaceUsed: newSpaceUsed} 
        await updateUser(updatedUser)
        toast.show(`Deleted ${input.target}`, {
          type: 'success'
        })
      } else if (index === 'rename' || index === 'move') {
          //get index of the target folder to be renamed
          //edit the entry of the current files based on the index and preserve the order of the array
          //update the user
          if (index === 'move') {
            const fileIndex = currentUser.files.map(file => file.id).indexOf(input.newFolder.id)
            let newFiles = [...currentUser.files]
            newFiles[fileIndex] = input.newFolder
            const updatedUser = {...currentUser, files: newFiles}
            toast.show(`Moved folder to ${input.target}`, {
              type: 'success'
            })
            await updateUser(updatedUser)
          } else {
            console.log(input)
            const fileIndex = currentUser.files.map(file => file.id).indexOf(input.id)
            let newFiles = [...currentUser.files]
            newFiles[fileIndex] = input
            const updatedUser = {...currentUser, files: newFiles}
            await updateUser(updatedUser)
          }

      } else if (index === 'add') {
        //add the new file to the user
        const newFiles = [...currentUser.files, input]
        const updatedUser = {...currentUser, files: newFiles}
        await updateUser(updatedUser)
      }
    }
  }

  //filter for all files that don't match the incoming file id
  const deleteFile = (target) => {
    let targetFile
    const newFiles = currentUser.fileRefs.filter(file => {if (file.fileId.toString() !== target.toString()) { return file } else targetFile = file})
    editUser('file', {newFiles: newFiles, targetFile: targetFile}, 'delete')
  }

  //filter for all of the files that don't match the inoming file id, return the new file if the id is a match
  //input will contain fileRef object with the new filename
  const renameFile = (input) => {
    const newFiles = currentUser.fileRefs.map(file => {
      if (file.fileId === input.newFileRef.fileId) {return input.newFileRef} else return file
    })
    editUser('file', {newFiles: newFiles, targetFile: input.newFileInst}, 'rename')
  }
  
  //filter for all of the files that don't match the inoming file id, return the new file if the id is a match
  //input will contain fileRef object with new flag
  const moveFile = (input) => {
    console.log(input)
    const newFiles = currentUser.fileRefs.map(file => {
      if (file.fileId === input.fileId) {return input} else return file
    })
    editUser('file', {newFiles: newFiles, target: input.target}, 'move')
  }

  //delete folder by filtering for folders that don't match the target
  //filter for all fileRefs that don't have a flag matching the target
  //delete the physical files
  const deleteFolder = (target) => {

    let searchFor = [target.id.toString()]

    currentUser.files.forEach(folder => {
      if (searchFor.includes(folder.nestedUnder.toString())) {
        searchFor.push(folder.id.toString())
      }
    })

    const refsToKeep = currentUser.fileRefs.filter(ref => {
      if (!searchFor.includes(ref.flag.toString())) return ref
    })
    const newFolders = currentUser.files.filter(file => {if (!searchFor.includes(file.id.toString())) return file})
    const refsToDelete = currentUser.fileRefs.filter(ref => {
      if (searchFor.includes(ref.flag.toString())) return ref
    })

    editUser('folder', {refsToKeep: refsToKeep, newFolders: newFolders, target: target.folderName, refsToDelete: refsToDelete}, 'delete')
  }

  //call the edit user function with a new folder object containing the new folder name
  const renameFolder = (target) => {
    editUser('folder', target, 'rename')
  }

  //call the edit user function with a new folder object containing the new folder nestedUnder property
  const moveFolder = (input) => {
    console.log(input)
    editUser('folder', input, 'move')
  }

  //add a folder
  const addFolder = (folderName, targetNest) => {
    //if the incoming targetNest is empty string, create the new folder under the home directory
    if (folderName.length > 0) {
      try {
        const folderId = Math.floor(Math.random() * 9e11) + 1e11
        if (targetNest === '') {
          const newFile = {
            id: folderId,
            fileName: folderName,
            nestedUnder: ''
          }
          editUser('folder', newFile, 'add')
          setNewFolderName('')
          setAdd(false)
          setFocusedFolder({folder: newFile, files: [], folders: []})
          
        } else {           //if the incoming targetNest has a value, create the new folder with the nestedUnder property set to targetNest
          const newFile = {
            id: folderId,
            fileName: folderName,
            nestedUnder: Number(targetNest)
          }
    
          editUser('folder', newFile, 'add')
          setNewFolderName('')
          setAdd(false)
          setFocusedFolder({folder: newFile, files: [], folders: []})
        }
      } catch (err) {
        alert(err)
      }
    } else {
      alert('Please enter a folder name')
    }
  }

  const insets = useSafeAreaInsets()

  const scrollRef = useRef()
  const formRef = useRef()

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
      <View style={styles.container}>
        {!loading && currentUser ? 
          focusedFolder ? 
            <FocusedFolder folder={focusedFolder} renameFolder={renameFolder} moveFolder={moveFolder} addFolder={addFolder} deleteFolder={deleteFolder} folders={currentUser.files} clear={setFocusedFolder} getTargetFolder={getTargetFolder} deleteFile={deleteFile} renameFile={renameFile} moveFile={moveFile} files={currentUser.fileRefs} updateUser={updateUser}/> 
          : stagingMode ? 
            <Staging reset={setStagingMode} staging={staging} userFiles={currentUser.fileRefs} folders={currentUser.files} deleteFile={deleteFile} renameFile={renameFile} moveFile={moveFile}/> 
          :
          <ScrollView ref={scrollRef} style={
              add && !keyBoardClosed ? {
              width: '100%', /*Expand height to allow the text input to scroll into view*/
              height: '190%',
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              position: 'absolute'
            } : {
            width: '100%', /* Default styling */
            height: '100%',
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            position: 'absolute'
          }}
            scrollEnabled={add  ? true : false}
          >
                  <View>
                    <View style={styles.header}>
                      <TouchableOpacity style={styles.nonFolderButton65} onPress={() => setStagingMode(true)}>
                        <View style={styles.iconHolder}>
                          <FontAwesomeIcon icon={faBox} color='#9F37B0' size={22}/>
                        </View>
                        <Text style={styles.subheading}>To be filed</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={add ? {height: 300} : {height: 330, marginBottom: '6%'}}>
                      <ScrollView>
                        {alphaSortedFiles.map((file, i) => {
                          if (file.nestedUnder === '') {
                            return <Folder key={i + file.fileName} files={currentUser.files} renameFolder={renameFolder} pressable={true} moveFolderFunc={moveFolder} folders={currentUser.files} folder={file} getTargetFolder={getTargetFolder} deleteFolder={deleteFolder} updateUser={updateUser}/>
                          }
                        })}
                      </ScrollView>
                    </View>
                    {add ? 
                      <Modal animationType='slide' presentationStyle='pageSheet' onShow={() => setTimeout(()=>{
                          inputRef.current.focus()
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
                            <View ref={formRef} style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginBottom: '6%'}}  
                            >
                              <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                              </View>
                              <TextInput value={newFolderName} style={{color: 'white', fontSize: 22, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '70%', marginLeft: '5%'}} onChangeText={(e) => setNewFolderName(e)} onFocus={() => setKeyboardClosed(false)} onBlur={() => {if (newFolderName === '') setAdd(false)}} ref={inputRef}/>
                            </View>
                            <TouchableOpacity style={styles.nonFolderButtonSM}
                              onPress={() => addFolder(newFolderName, '')}
                            >
                                <View style={styles.iconHolderSM}>
                                  <FontAwesomeIcon icon={faFloppyDisk} size={18} color='#9F37B0'/>
                                </View>
                                <Text style={{fontSize: 22, color: '#9F37B0', fontWeight: '600', paddingTop: '1%', marginLeft: '15%'}}>Save</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </Modal>
                    : 
                    <View style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                      <View style={{display: 'flex', flexDirection: 'row', marginBottom: 10}}>                  
                          <TouchableOpacity style={styles.nonFolderButton80}
                            onPress={() => {
                              setAdd(true)
                              setKeyboardClosed(false)
                            }}
                          >
                              <View style={styles.iconHolderSM}>
                                <FontAwesomeIcon icon={faPlus} size={18} color='#9F37B0'/>
                              </View>
                              <Text style={styles.subheadingMLLarge}>Add New Folder</Text>
                          </TouchableOpacity>
                      </View>
                        <TouchableOpacity onPress={() => navigate('Upload Files')} style={styles.nonFolderButton80}>
                            <View style={styles.iconHolderSM}>
                              <FontAwesomeIcon icon={faFile} size={18} color='#9F37B0'/>
                            </View>
                            <Text style={styles.subheadingMLLarge}>Get Document</Text>
                        </TouchableOpacity>
                      
                    </View>
                    }
                  </View>
          </ScrollView>
                    
        : <>
            <Text style={{color: 'white'}}>Loading...</Text>
          </>
        }
      <StatusBar style="auto" />
    </View>
    
  );
  } catch (err) {
    alert(err)
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigHeader: {
    color: 'white',
    fontSize: 40,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: '2.5%'
  },
  subheading: {
    color: '#9F37B0',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 22,
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: '10%'
  },
  subheadingMLLarge: {
    color: '#9F37B0',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: '15%'
  },
  header: {
    display: 'flex', 
    flexDirection: 'row',
    justifyContent: 'flex-end', 
    width: '90%', 
    marginLeft: 'auto', 
    marginRight: 'auto',
    marginBottom: '10%',
  },
  wrapperContainer: {
    flex: 1,
    alignItems: 'center'
  },
  buttonWrapper: {
    paddingTop: '5%',
    width: '50%'
  },
  input: {
    borderWidth: 1,
    borderColor: '#777',
    padding: 8,
    margin: 10,
    width: '50%'
  },
  nonFolderButtonSM: {
    display: 'flex', 
    flexDirection: 'row', 
    backgroundColor: '#FFE562', 
    paddingLeft: '2%', 
    paddingTop: '2%', 
    paddingBottom: '2%', 
    borderRadius: 100, 
    width: '45%'
  },
  nonFolderButton65: {
    display: 'flex', 
    flexDirection: 'row', 
    backgroundColor: '#FFE562', 
    paddingLeft: '2%', 
    paddingTop: '2%', 
    paddingBottom: '2%', 
    borderRadius: 100, 
    width: '65%'
  },
  nonFolderButton80: {
    display: 'flex', 
    flexDirection: 'row', 
    backgroundColor: '#FFE562', 
    paddingLeft: '2%', 
    paddingTop: '2%', 
    paddingBottom: '2%', 
    borderRadius: 100, 
    width: '80%'
  },
  iconHolder: {
    backgroundColor: 'white', 
    height: 44, 
    width: 44, 
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
    marginBottom: '10%'
  }
});