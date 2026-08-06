import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, Modal, Pressable, ScrollView, Platform } from 'react-native'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck, faPencil, faXmark, faFolder, faArrowLeft, faFile, faCloudArrowUp, faFloppyDisk, faStopwatch, faPlus, faBox } from '@fortawesome/free-solid-svg-icons'
import { ref as refFunction, uploadBytesResumable} from 'firebase/storage'

//import addfile, userListener, updateUser from firestore/import firebaseAuth, storage objects from firebase config
import { addfile, userListener, updateUser } from '../../firebase/firestore'
import { firebaseAuth, storage } from '../../firebaseConfig';

//import format from date-fns for file timestamps
import { format } from 'date-fns'

//import safe area context
import { useSafeAreaInsets } from 'react-native-safe-area-context'

//import useToast for notifications
import { useToast } from 'react-native-toast-notifications'

//import upload queue emitter obj
import { UploadQueueEmitter } from '../../hooks/QueueEventEmitter'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AppPressable from '../../components/ui/AppPressable'
import AppTextInput from '../../components/ui/AppTextInput'
import ContentShell from '../../components/ui/ContentShell'
import KeyboardSafeForm from '../../components/ui/KeyboardSafeForm'
import { TestIds } from '../../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'

const Notepad = () => {
    const { isTablet, select } = useResponsiveLayout()

    const [open, setOpen] = useState(true)
    const [body, setBody] = useState('')
    const [keyboardHeight, setKeyboardHeight] = useState(0)
    const [preAdd, setPreAdd] = useState(false)
    const [destination, setDestination] = useState({id: null, fileName: null, nestedUnder: null})
    const [currentUser, setCurrentUser] = useState()
    const [loading, setLoading] = useState(false)
    const [addFolderForm, setAddFolderForm] = useState(false)
    const [focusedFolder, setFocusedFolder] = useState()
    const [subFolders, setSubFolders] = useState()
    const [folders, setFolders] = useState({})
    const [newFolderName, setNewFolderName] = useState('')
    const [nameGiven, setNameGiven] = useState(false)
    const [noteName, setNoteName] = useState('')
    const [focusedFolderInst, setFocusedFolderInst] = useState()

    //initialize name ref
    const nameRef = useRef()
    const ref = useRef(null)

    const toast = useToast()

    //get the auth user context object
    const auth = firebaseAuth

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

    //get the current user 
    useEffect(() => {
      setLoading(true) //prevent component to attempting to render files/folders before they exist
      const getCurrentUser = async () => {
        const unsubscribe = await userListener(setCurrentUser, false, auth.currentUser.uid)

        return () => unsubscribe()
      }
      getCurrentUser()
    }, [auth])

    //once a current user has been pushed into state, allow component to render files/folders
    useEffect(() => {
      if (currentUser) {
        setLoading(false)
      }
    }, [currentUser])  

    useEffect(() => {
      if(currentUser) {

        if (Array.isArray(currentUser?.files)) {
          const sortedFiles = currentUser.files.sort((a, b) => {
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

          setFolders(sortedFiles)
        } else {
          alert('currentUser.files is not an array')
        }
      }
    }, [currentUser, addFolderForm])


    saveNote = () => {
      setOpen(false)
    
    }

    const startEdit = () => {
      setOpen(true)
    }

    useEffect(() => {
      console.log(destination.id)
      console.log(focusedFolder)
    }, [destination, focusedFolder])

    useEffect(() => {
      if (folders && focusedFolder) {
        setFocusedFolderInst(folders.filter(folder => folder.id === focusedFolder)[0])
      }
    }, [focusedFolder, folders])

    //add a folder
  const addFolder = async (folderName, targetNest) => {
    //if the incoming targetNest is empty string, create the new folder under the home directory
    if (folderName.length > 0) {
      const folderId = Math.floor(Math.random() * 9e11) + 1e11
      if (targetNest === '') {
        const newFile = {
          id: folderId,
          fileName: folderName,
          nestedUnder: ''
        }
  
        const newFiles = [...currentUser.files, newFile]
        const updatedUser = {...currentUser, files: newFiles}
        await updateUser(updatedUser)
        setNewFolderName('')
        setFolders(newFiles)
        setFocusedFolder(folderId)
        
      } else {           //if the incoming targetNest has a value, create the new folder with the nestedUnder property set to targetNest
        const newFile = {
          id: folderId,
          fileName: folderName,
          nestedUnder: targetNest
        }

        const newFiles = [...currentUser.files, newFile]
        const updatedUser = {...currentUser, files: newFiles}
  
        updateUser(updatedUser)
        setAddFolderForm(false)
        setFolders(newFiles)
        setFocusedFolder(folderId)
      }
    } else {
      alert('Please enter a folder name')
    }
  }

    const addToStorage = async () => {

      try {
        //generate formatted date, fileName, and upload size
        const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss")
        const filename = noteName !== '' ? `${noteName}.txt` : `Note from: ${formattedDate}.txt`

        let finalDestination 
        if (destination.id !== null) finalDestination = destination.id
        else if (focusedFolder) finalDestination = focusedFolder 
        else finalDestination = false

        //add an image into the file queue
        let queue = JSON.parse(await AsyncStorage.getItem('uploadQueue')) || []

        const randomString = [...Array(10)].map(() => (Math.random().toString(36)[Math.random() < 0.5 ? 'toUpperCase' : 'toLowerCase']()) ).join('')
        queue.push({uri: `${randomString} - note.txt`, filename: filename, fileType: 'txt', finalDestination: finalDestination, noteBody: body})
        await AsyncStorage.setItem('uploadQueue', JSON.stringify(queue))

        //confirm the flush by immediately reading it back
        const confirmedQueue = JSON.parse(await AsyncStorage.getItem('uploadQueue'))

        UploadQueueEmitter.emit('uploadQueueUpdated', confirmedQueue)
      } catch (err) {
        alert(err)
      }

      //increase version number if other files exist with the same name
      /* let versionNo = 0
      currentUser.fileRefs.forEach(fileRef => {
        if (fileRef.fileName === fileName && fileRef.fileName.split('.')[1] === fileName.split('.')[1]) {
          versionNo ++
      }
      }) */

      //create textFile and upload to firebase storage/increase the upload size variable by the size of the textFile
      /* try {
        const textFile = new Blob([`${body}`], {
          type: "text/plain;charset=utf-8",
        });
        const fileUri = `${currentUser.uid}/${noteName !== '' ? noteName : formattedDate}`
        const fileRef = refFunction(storage, `${currentUser.uid}/${formattedDate}`)
        const result = await uploadBytesResumable(fileRef, textFile)

        uploadSize += result.metadata.size

       

        //create a reference
        const reference = await addfile({
          name: fileName,
          fileType: 'txt',
          size: result.metadata.size,
          uri: `${fileUri}`,
          user: currentUser.uid,
          timeStamp: formattedDate,
          version: versionNo
      }, finalDestintation)

      //calculate a new value for spaceUsed and update the fileRefs using update user
      const newSpaceUsed = currentUser.spaceUsed + uploadSize
      const newUser = {...currentUser, spaceUsed: newSpaceUsed, fileRefs: [...currentUser.fileRefs, reference]}
      await updateUser(newUser)
      if (destination.id !== null) {
        toast.show(`File upload to ${destination.fileName} successful`, {
          type: 'success'
         })
      } else if (focusedFolder) {
        const fileInst = currentUser.files.filter(file => file.id === focusedFolder)
        toast.show(`File upload to ${fileInst[0].fileName} successful`, {
          type: 'success'
         })
      } else {
        toast.show(`File upload to staging successful`, {
          type: 'success'
         })
      }
 */
      setBody(null)
      setDestination({id: null, fileName: null, nestedUnder: null})
      setFocusedFolder(null)
      setPreAdd(false)
      setNameGiven(false)
     /*  } catch (err) {
        console.log(err)
      } */
    }

    useEffect(() => {
      if (open === false) Keyboard.dismiss() 
      else ref.current.focus() 
    },[open])

    useEffect(() => {
      const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
      const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
      const onShow = Keyboard.addListener(showEvent, (e) => {
        setKeyboardHeight(e.endCoordinates?.height || 0)
      })
      const onHide = Keyboard.addListener(hideEvent, () => {
        setKeyboardHeight(0)
      })
      return () => {
        onShow.remove()
        onHide.remove()
      }
    }, [])

    const insets = useSafeAreaInsets() 

    useEffect(() => {
      const exists = Object.values(folders).some((value) => {
          return value.nestedUnder === focusedFolder
      })
      setSubFolders(exists)
  }, [focusedFolder, addFolderForm])

  console.log('folders: ', folders)
  console.log('plain ref: ', ref)

  return (
    <>
      {preAdd ? 

        <Modal animationType='slide' presentationStyle='pageSheet' onShow={() => setTimeout(()=>{
          nameRef.current.focus()
        }, 200)}>
          <View style={{height: '100%', width: '100%', backgroundColor: '#593060'}}>
              {/* if the moveFile state is true, display the modal with the file movement code*/}
              {/* xMark icon for closing out the moveFile modal */}
              <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%', width: '100%'}}>
                  <Pressable onPress={() => {
                    if (addFolderForm) setAddFolderForm(false) 
                    else {
                      setPreAdd(false)
                      setFocusedFolder(null)
                      setNameGiven(false)
                      setNoteName('')
                    }
                    }}>
                      <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                  </Pressable>
              </View>
              
              <ContentShell variant="modal" fill>
              { 

              !nameGiven ?
              <>
                  <Text style={[{color: 'white', fontSize: 35, fontWeight: '700', marginTop: '35%', textAlign: 'center'}, select(undefined, tabletStyles.modalHeading)]}>Name Note:</Text>
                  <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%'}}>
                      <View style={styles.iconHolder}>
                        <FontAwesomeIcon icon={faFile} size={22} color='#9F37B0'/>
                      </View>
                      <TextInput value={noteName} placeholder='Enter name' placeholderTextColor={'white'} style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '70%'}} onChangeText={(e) => setNoteName(e)} ref={nameRef}/>
                    </View>
                    <View style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5%'}}>
                        <TouchableOpacity style={noteName === '' ? styles.yellowButtonXSDim : styles.yellowButtonXS}
                        disabled={noteName === '' ? true : false}
                        onPress={() => {
                            setNameGiven(true)
                        }}
                        >
                          <View style={styles.iconHolderSmall}>
                              <FontAwesomeIcon icon={faFloppyDisk} size={18} color='#9F37B0'/>
                          </View>
                          <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '15%', paddingTop: '1%'}}>Save</Text>
                        </TouchableOpacity>
                        <Text style={{color: 'white', fontSize: 20, marginTop: '2%', textAlign: 'center'}}>Or</Text>
                        <TouchableOpacity style={{width: '50%',
                        borderRadius: 12,
                        backgroundColor: 'white',
                        paddingTop: '2%',
                        paddingBottom: '2%',
                        paddingLeft: '2%',
                        marginLeft: '2%',
                        marginTop: '2%',
                        display: 'flex',
                        flexDirection: 'row',
                        backgroundColor: '#FFE562'
                        }}
                        onPress={() => {
                            setNameGiven(true)
                        }}
                        >   
                            <View style={styles.iconHolderSmall}>
                                <FontAwesomeIcon icon={faStopwatch} size={18} color='#9F37B0'/>
                            </View>
                            <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '7%', paddingTop: '1%'}}>Use Timestamp</Text>
                        </TouchableOpacity>
                    </View>
              </>
              : addFolderForm ? 
                  <KeyboardSafeForm>
                  <>
                      <Text style={[{color: 'white', fontSize: 35, fontWeight: '700', marginTop: '40%', textAlign: 'center'}, select(undefined, tabletStyles.modalHeading)]}>Add A New Folder:</Text>
                      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%'}}>
                      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%', width: '100%'}}>
                            <View style={styles.iconHolder}> 
                                <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                            </View>
                            <TextInput value={newFolderName} placeholder='Enter new name' placeholderTextColor={'white'} style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '70%'}} onChangeText={(e) => setNewFolderName(e)} autoFocus onBlur={() => {if (newFolderName === '') setAddFolderForm(false)}}/>
                        </View>
                          
                      </View>
                      <View style={{width: '100%', paddingTop: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                          <TouchableOpacity style={styles.yellowButtonSM}
                          onPress={() => {
                              addFolder(newFolderName, focusedFolder ? focusedFolder : '')
                              setNewFolderName('')
                              setAddFolderForm(false)
                          }}
                          >
                              <View style={styles.iconHolderSmall}>
                                  <FontAwesomeIcon icon={faFloppyDisk} size={18} color='#9F37B0' />
                              </View>
                              <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '22%'}}>Save</Text>
                          </TouchableOpacity>
                      </View>
                  </>
                  </KeyboardSafeForm>

              :

                  <View style={{width: '100%', height: '95%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '5%'}}>Save Note To...</Text>
                      {focusedFolderInst &&
                        <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '5%'}}>Viewing: {focusedFolderInst.fileName}</Text>
                      }

                      <View style={focusedFolder && !subFolders ? {width: '100%', height: '55%', marginBottom: '10%', display: 'flex', justifyContent: 'center'} : {width: '100%', height: '55%', marginBottom: '10%'}}>
                              {focusedFolder ? 
                                  <>
                                      <TouchableOpacity style={styles.yellowButtonBack} onPress={() => {
                                            const folderInst = folders.filter(folder => folder.id === focusedFolder) 
                                            
                                            const parentFolderInst = folders.filter(folder => folder.id === folderInst[0].nestedUnder)
                                            console.log(parentFolderInst)
                                            if (parentFolderInst.length > 0) {
                                                console.log("we're within the first if check")
                                                setDestination({id: parentFolderInst[0].id, fileName: parentFolderInst[0].fileName, nestedUnder: parentFolderInst[0].nestedUnder})
                                                setFocusedFolder(folderInst[0].nestedUnder)
                                            } else {
                                                console.log("we're within the else check")
                                                setDestination({id: null, fileName: null, nestedUnder: null})
                                                setFocusedFolder(null)
                                            }
                                        }}>
                                            <View style={styles.iconHolderSmall}>
                                                    <FontAwesomeIcon icon={faArrowLeft} size={18} color='#9F37B0' /> 
                                                </View>
                                            <Text style={{color: '#9F37B0', fontSize: 20, marginLeft: '10%', fontWeight: '600'}}>Back</Text>
                                        </TouchableOpacity>
                                  </>
                              :
                                  <></>
                              }
                              <ScrollView style={focusedFolder ? {paddingTop: '5%', marginTop: '2%'} : {}}>
                              {/* map over each of the folders from the filesystem and display them as a pressable element // call movefile function when one of them is pressed */}
                              {focusedFolder && !subFolders ? 
                                  <Text style={[{fontSize: 30, color: 'white', fontWeight: 'bold', marginTop: '30%', textAlign: 'center'}, select(undefined, tabletStyles.emptyHeading)]}>No Subfolders...</Text>
                              
                              :   
                                  <>
                                      {folders.map((f, index) => {
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
                                                              <View style={f.id === destination.id ? styles.folderWhite : styles.folder}>
                                                              <View style={f.id === destination.id ? styles.iconHolderBlack : styles.iconHolder}>
                                                                  <FontAwesomeIcon icon={faFolder} size={28} color={f.id === destination.id ? 'white' : '#9F37B0'}/>
                                                              </View>
                                                              <Text style={f.id === destination.id ? {color: 'black', fontSize: 28, width: '80%', paddingTop: '1%'} : {color: '#9F37B0', fontSize: 28, width: '80%', textAlign: 'left', paddingTop: '1%'}}>{f.fileName}</Text>
                                                              </View>
                                                          </Pressable>
                                                      )
                                                  
                                              }
                                          } else {
                                              if (f.nestedUnder === '') {
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
                                                            <View style={f.id === destination.id ? styles.folderWhite : styles.folder}>
                                                            <View style={f.id === destination.id ? styles.iconHolderBlack : styles.iconHolder}>
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
                              {/* 
                              
                                  IF EVENTUALLY THE USER WILL BE ABLE TO MOVE A FILE TO THE HOMEPAGE, THIS IS WHERE THAT COULD WOULD BE

                              <Pressable style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'}} onPress={() => setDestination('home')}>
                                      <View style={destination === 'home' ? {borderBottomWidth: 2, width: '85%', backgroundColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'} : {borderBottomWidth: 2, width: '85%', borderBottomColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'}}>
                                      <FontAwesomeIcon icon={faFolder} size={30} color={destination === 'home' ? 'black' : 'white'}/>
                                      <Text style={destination === 'home' ? {color: 'black', fontSize: 30, marginLeft: '5%'} : {color: 'white', fontSize: 30, marginLeft: '5%'}}>Home</Text>
                                      </View>
                                  </Pressable> */}
                              </ScrollView>
                      </View>
                      <TouchableOpacity onPress={() => setAddFolderForm(true)} style={styles.addFolderButton}>
                          <View style={styles.iconHolderSmall}>
                              <FontAwesomeIcon icon={faPlus} color='#9F37B0'/>
                          </View>
                          <Text style={{fontSize: 18, marginLeft: '5%', paddingTop: '1%', color: '#9F37B0', fontWeight: '600'}}>Add New Folder</Text>
                      </TouchableOpacity>

                      <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-around',}}>
                              <TouchableOpacity onPress={() => addToStorage()} style={ destination.id !== null || focusedFolder ? styles.yellowButtonSM : styles.yellowButtonSMDim}
                                disabled={destination.id !== null || focusedFolder ? false : true}
                            >   
                                <View style={styles.iconHolderSmall}>
                                    <FontAwesomeIcon icon={faCheck} color='#9F37B0'/>
                                </View>
                                <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '8%', paddingTop: '1%'}}>Confirm Move</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {
                                addToStorage()
                                setPreAdd(false)
                            }} style={styles.yellowButtonSM}>
                                <View style={styles.iconHolderSmall}>
                                    <FontAwesomeIcon icon={faBox} color='#9F37B0'/>
                                </View>
                                <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '3%', paddingTop: '1%'}}>Save To Staging</Text>
                            </TouchableOpacity>
                    </View>
                  </View>
                  
              }
              </ContentShell>

          </View>
        </Modal>

        
      : <>
        <ContentShell variant="content" fill>
        <View style={styles.editorRoot}>
            <AppTextInput
                        testID={TestIds.notes.body}
                        accessibilityLabel="Note body"
                        onChangeText={(e) => setBody(e)}
                        value={body}
                        placeholder={'Add a note...'}
                        style={{
                            flex: 1,
                            backgroundColor: 'white',
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: Math.max(insets.top, 12),
                            // Leave room for the floating edit toolbar
                            paddingBottom: 88 + Math.max(insets.bottom, 12),
                            fontSize: 18,
                            textAlignVertical: 'top',
                            width: '100%',
                            color: 'black'
                        }}
                        editable={!!open}
                        multiline
                        numberOfLines={2}
                        placeholderTextColor='grey'
                        ref={ref}
                        autoFocus
                        />
          <View
            style={[
              styles.toolbar,
              {
                paddingBottom: Math.max(insets.bottom, 12),
                // iOS: lift by keyboard height. Android: window resizes (see app.json).
                bottom: Platform.OS === 'ios' ? keyboardHeight : 0,
              },
            ]}
          >
            {!open && 
                <AppPressable
                  testID={TestIds.notes.addToStorage}
                  accessibilityLabel="Add To Storage"
                  onPress={() => setPreAdd(true)}
                  style={tabletStyle(isTablet, styles.buttonWrapperText, tabletStyles.actionButton)}
                >
                  <View style={styles.iconHolderSmall}>
                    <FontAwesomeIcon icon={faCloudArrowUp} color='#9F37B0'/>
                  </View>
                  <Text style={styles.addToStorageLabel} numberOfLines={1}>Add To Storage</Text>
                </AppPressable>
              }
                  <AppPressable
                    testID={TestIds.notes.saveEdit}
                    accessibilityLabel={open ? 'Save note' : 'Edit note'}
                    onPress={() => {open === false ? startEdit() : saveNote()}}
                    style={styles.buttonWrapper}
                  >
                    {open ? (
                        <FontAwesomeIcon icon={faCheck} color='#9F37B0' size={20}/>
                      )
                      : (
                        <FontAwesomeIcon icon={faPencil} size={20} color='#9F37B0'/>
                      )
                    }
                    <Text style={styles.saveEditLabel} numberOfLines={1}>
                      {open ? 'Save note' : 'Edit note'}
                    </Text>
                  </AppPressable>
          </View>
        </View>
        </ContentShell>
        </>
      } 
    </>
  )
}

const styles = StyleSheet.create({
    /* noteBody: {
        backgroundColor: 'white',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        fontSize: 18,
        textAlignVertical: 'top',
        width: '100%',
        height: '75%'
    },
    noteBodyFull: {
      backgroundColor: 'white',
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      fontSize: 18,
      textAlignVertical: 'top',
      width: '100%',
      height: '100%'
  }, */
    wrapperContainer: {
      width: '100%',
      position: 'absolute',
      top: '85%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingRight: '5%',
    },

    wrapperContainerFull: {
      width: '100%',
      position: 'absolute',
      top: '85%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingRight: '5%',
    },
    editorRoot: {
      flex: 1,
      width: '100%',
      backgroundColor: 'white',
    },
    toolbar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingTop: 10,
      backgroundColor: '#FFFCF6',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: '#DDCADB',
      gap: 10,
      zIndex: 20,
      elevation: 8,
    },
    addToStorageLabel: {
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
      fontSize: 16,
      color: '#9F37B0',
      fontWeight: '600',
      marginLeft: 10,
    },
    buttonWrapper: {
      minWidth: 48,
      height: 48,
      flexShrink: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: '#FFE562',
      paddingHorizontal: 12,
      gap: 8,
    },
    saveEditLabel: {
      color: '#9F37B0',
      fontSize: 15,
      fontWeight: '700',
    },
    buttonWrapperText: {
      flex: 1,
      maxWidth: 240,
      borderRadius: 12,
      backgroundColor: '#FFE562',
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      paddingVertical: 8,
      paddingLeft: 8,
      paddingRight: 12,
    },
    iconHolder: {
      backgroundColor: 'white', 
      width: 44, 
      height: 44, 
      display: 'flex', 
      flexDirection: 'row', 
      justifyContent: 'center', 
      alignItems: 'center', 
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
    yellowButtonXS: {
      backgroundColor: '#FFE562',
      paddingLeft: 6,
      paddingTop: 6,
      paddingBottom: 6,
      paddingRight: 20,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'row',
      width: '30%',
    },
    yellowButtonXSDim: {
      backgroundColor: '#FFE562',
      paddingLeft: 6,
      paddingTop: 6,
      paddingBottom: 6,
      paddingRight: 20,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'row',
      width: '30%',
      opacity: .5
    },
    yellowButtonSM: {
      backgroundColor: '#FFE562',
      paddingLeft: '2%',
      paddingTop: '2%',
      paddingBottom: '2%',
      paddingRight: 20,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'row',
      width: '47%',
    },
    yellowButtonSMDim: {
      backgroundColor: '#FFE562',
      paddingLeft: '2%',
      paddingTop: '2%',
      paddingBottom: '2%',
      paddingRight: 20,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'row',
      width: '47%',
      opacity: .5
    },
    yellowButtonBack: {
      backgroundColor: '#FFE562',
      paddingLeft: 6,
      paddingTop: 6,
      paddingBottom: 6,
      paddingRight: 20,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'row',
      width: '30%',
      marginLeft: '5%'
    },
    addFolderButton: {
      width: '50%',
      borderRadius: 12,
      backgroundColor: '#FFE562',
      paddingTop: '2%',
      paddingBottom: '2%',
      paddingLeft: '2%',
      marginBottom: '5%',
      marginLeft: '2%',
      display: 'flex',
      flexDirection: 'row'
    },
    folder: {
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
  folderWhite: {
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
})

const tabletStyles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  modalHeading: {
    marginTop: 48,
  },
  emptyHeading: {
    marginTop: 48,
  },
  actionButton: {
    width: '100%',
    maxWidth: 360,
  },
})

export default Notepad