import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, KeyboardAvoidingView, Modal, Pressable, ScrollView } from 'react-native'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheck, faPencil, faXmark, faFolder, faArrowLeft, faFile } from '@fortawesome/free-solid-svg-icons'
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

const Notepad = () => {

    const [open, setOpen] = useState(true)
    const [body, setBody] = useState('')
    const ref = useRef(null)
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

    const toast = useToast()

    //get the auth user context object
    const auth = firebaseAuth

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
      if(currentUser)
      setFolders(currentUser.files)
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
  
        const newFiles = [...currentUser.files, newFile]
        const updatedUser = {...currentUser, files: newFiles}
        await updateUser(updatedUser)
        setNewFolderName('')
        setFolders(newFiles)
        
      } else {           //if the incoming targetNest has a value, create the new folder with the nestedUnder property set to targetNest
        const newFile = {
          id: Math.random().toString(20).toString().split('.')[1] + Math.random().toString(20).toString().split('.')[1],
          fileName: folderName,
          nestedUnder: targetNest
        }

        const newFiles = [...currentUser.files, newFile]
        const updatedUser = {...currentUser, files: newFiles}
  
        updateUser(updatedUser)
        setAddFolderForm(false)
        setFolders(newFiles)
      }
    } else {
      alert('Please enter a folder name')
    }
  }

    const addToStorage = async () => {

      //generate formatted date, fileName, and upload size
      const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss")
      const fileName = noteName !== '' ? `${noteName}.txt` : `Note from: ${formattedDate}.txt`
      let uploadSize = 0

      //increase version number if other files exist with the same name
      let versionNo = 0
      currentUser.fileRefs.forEach(fileRef => {
        if (fileRef.fileName === fileName && fileRef.fileName.split('.')[1] === fileName.split('.')[1]) {
          versionNo ++
      }
      })

      //create textFile and upload to firebase storage/increase the upload size variable by the size of the textFile
      try {
        const textFile = new Blob([`${body}`], {
          type: "text/plain;charset=utf-8",
       });
        const fileUri = `${currentUser.uid}/${noteName !== '' ? noteName : formattedDate}`
        const fileRef = refFunction(storage, `${currentUser.uid}/${formattedDate}`)
        uploadBytesResumable(fileRef, textFile)

        uploadSize += textFile.size

       let finalDestintation 
       if (destination.id !== null) finalDestintation = destination.id
       else if (focusedFolder) finalDestintation = focusedFolder 
       else finalDestintation = false

        //create a reference
        const reference = await addfile({
          name: fileName,
          fileType: 'txt',
          size: textFile.size,
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

      setBody(null)
      setDestination({id: null, fileName: null, nestedUnder: null})
      setFocusedFolder(null)
      setPreAdd(false)
      setNameGiven(false)
      } catch (err) {
        console.log(err)
      }
    }

    useEffect(() => {
      if (open === false) Keyboard.dismiss() 
      else ref.current.focus() 
    },[open])

    const insets = useSafeAreaInsets() 

    useEffect(() => {
      const exists = Object.values(folders).some((value) => {
          return value.nestedUnder === focusedFolder
      })
      setSubFolders(exists)
  }, [focusedFolder, addFolderForm])

  return (
    <>
      {preAdd ? 

        <Modal animationType='slide' presentationStyle='pageSheet'>
          <View style={{height: '100%', width: '100%', backgroundColor: 'rgb(23 23 23)'}}>
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
              
              { 

              !nameGiven ?
              <>
                  <Text style={{color: 'white', fontSize: 35, fontWeight: '700', marginTop: '35%', textAlign: 'center'}}>Name Note:</Text>
                  <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%'}}>
                      <FontAwesomeIcon icon={faFile} size={30} color='white'/>
                      <TextInput value={noteName} style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '40%'}} onChangeText={(e) => setNoteName(e)} autoFocus/>
                      <View style={noteName === '' ? {

                            width: '25%',
                            borderColor: '#777',
                            borderRadius: 25,
                            backgroundColor: 'white',
                            borderWidth: 1,
                            paddingTop: '2%',
                            paddingBottom: '2%',
                            marginLeft: '2%',
                            opacity: .5                        

                      } : {width: '25%',
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
                              disabled={noteName === '' ? true : false}
                              onPress={() => {
                                  setNameGiven(true)
                              }}
                              >
                                  <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Save</Text>
                              </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={{color: 'white', fontSize: 20, marginTop: '7%', textAlign: 'center'}}>Or</Text>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: '7%'}}>
                      <View style={{width: '35%',
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
                              setNameGiven(true)
                          }}
                          >
                              <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Use Timestamp</Text>
                          </TouchableOpacity>
                      </View>
                    </View>
              </>
              : addFolderForm ? 
                  <>
                      <Text style={{color: 'white', fontSize: 35, fontWeight: '700', marginTop: '40%', textAlign: 'center'}}>Add A New Folder:</Text>
                      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%'}}>
                          <FontAwesomeIcon icon={faFolder} size={30} color='white'/>
                          <TextInput value={newFolderName} style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '40%'}} onChangeText={(e) => setNewFolderName(e)} autoFocus onBlur={() => {if (newFolderName === '') setAddFolderForm(false)}}/>
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
                                      addFolder(newFolderName, focusedFolder ? focusedFolder : '')
                                      setNewFolderName('')
                                      setAddFolderForm(false)
                                  }}
                                  >
                                      <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Save</Text>
                                  </TouchableOpacity>
                          </View>
                      </View>
                  </>

              :

                  <View style={{width: '100%', height: '95%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '10%'}}>Save Note To...</Text>

                      <View style={focusedFolder && !subFolders ? {width: '100%', height: '50%', marginBottom: '10%', display: 'flex', justifyContent: 'center'} : {width: '100%', height: '50%', marginBottom: '10%'}}>
                              {focusedFolder ? 
                                  <>
                                      <TouchableOpacity style={{display: 'flex', flexDirection: 'row', marginLeft: '5%', marginTop: '5%'}} onPress={() => {
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
                                          <FontAwesomeIcon icon={faArrowLeft} size={40} color='white' /> 
                                          <Text style={{color: 'white', fontSize: 30, marginLeft: '3%'}}>Back</Text>
                                      </TouchableOpacity>
                                  </>
                              :
                                  <></>
                              }
                              <ScrollView style={focusedFolder ? {paddingTop: '5%', marginTop: '2%'} : {}}>
                              {/* map over each of the folders from the filesystem and display them as a pressable element // call movefile function when one of them is pressed */}
                              {focusedFolder && !subFolders ? 
                                  <Text style={{fontSize: 30, color: 'white', fontWeight: 'bold', marginTop: '30%', textAlign: 'center'}}>No Subfolders...</Text>
                              
                              :   
                                  <>
                                      {folders.map((f, index) => {
                                          if (focusedFolder) {
                                              if (f.nestedUnder === focusedFolder) {
                                                      return (
                                                          <Pressable key={index} style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'}} onPress={() => {
                                                                  if (destination.id === null || f.id !== destination.id) {
                                                                      setDestination({id: f.id, fileName: f.fileName, nestedUnder: f.nestedUnder})
                                                                  } else {
                                                                      setFocusedFolder(f.id)
                                                                      setDestination({id: null, fileName: null, nestedUnder: null})
                                                                  }
                                                              }
                                                              }>
                                                              <View style={f.id === destination.id ? {borderBottomWidth: 2, width: '85%', backgroundColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'} : {borderBottomWidth: 2, width: '85%', borderBottomColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'}}>
                                                              <FontAwesomeIcon icon={faFolder} size={30} color={f.id === destination.id ? 'black' : 'white'}/>
                                                              <Text style={f.id === destination.id ? {color: 'black', fontSize: 30, marginLeft: '5%'} : {color: 'white', fontSize: 30, marginLeft: '5%'}}>{f.fileName}</Text>
                                                              </View>
                                                          </Pressable>
                                                      )
                                                  
                                              }
                                          } else {
                                              if (f.nestedUnder === '') {
                                                  return (
                                                      <Pressable key={index} style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'}} onPress={() => {
                                                              if (destination.id === null || f.id !== destination.id) {
                                                                  setDestination({id: f.id, fileName: f.fileName, nestedUnder: f.nestedUnder})
                                                              } else {
                                                                  setFocusedFolder(f.id)
                                                                  setDestination({id: null, fileName: null, nestedUnder: null})
                                                              }
                                                          }
                                                          }>
                                                          <View style={f.id === destination.id ? {borderBottomWidth: 2, width: '85%', backgroundColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'} : {borderBottomWidth: 2, width: '85%', borderBottomColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'}}>
                                                          <FontAwesomeIcon icon={faFolder} size={30} color={f.id === destination.id ? 'black' : 'white'}/>
                                                          <Text style={f.id === destination.id ? {color: 'black', fontSize: 30, marginLeft: '5%'} : {color: 'white', fontSize: 30, marginLeft: '5%'}}>{f.fileName}</Text>
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
                      
                          <View style={{width: '50%',
                              borderColor: '#777',
                              borderRadius: 25,
                              backgroundColor: 'white',
                              borderWidth: 1,
                              paddingTop: '2%',
                              paddingBottom: '2%',
                              marginBottom: '10%',
                              marginLeft: '2%'}}>
                              <TouchableOpacity onPress={() => setAddFolderForm(true)} style={{
                              display: 'flex', 
                              flexDirection: 'row', 
                              width: '100%', 
                              justifyContent: 'center',
                              }}>
                                  <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Add New Folder</Text>
                              </TouchableOpacity>
                          </View>

                      <View style={{display: 'flex', flexDirection: 'row'}}>
                          <View style={ destination.id !== null || focusedFolder ? {width: '40%',
                              borderColor: '#777',
                              borderRadius: 25,
                              backgroundColor: 'white',
                              borderWidth: 1,
                              paddingTop: '2%',
                              paddingBottom: '2%',
                              marginBottom: '5%',
                              marginLeft: '2%',
                              height: '45%'
                              }
                              :
                              {width: '40%',
                              borderColor: '#777',
                              borderRadius: 25,
                              backgroundColor: 'white',
                              borderWidth: 1,
                              paddingTop: '2%',
                              paddingBottom: '2%',
                              marginBottom: '5%',
                              marginLeft: '2%',
                              height: '45%',
                              opacity: .5
                              }
                              }>
                              <TouchableOpacity onPress={() => addToStorage()} style={{
                              display: 'flex', 
                              flexDirection: 'row', 
                              width: '100%', 
                              justifyContent: 'center',
                              }}
                                disabled={destination.id !== null || focusedFolder ? false : true}
                              >
                                  <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Confirm Move</Text>
                              </TouchableOpacity>
                          </View>

                          <View style={{width: '40%',
                              borderColor: '#777',
                              borderRadius: 25,
                              backgroundColor: 'white',
                              borderWidth: 1,
                              paddingTop: '2%',
                              paddingBottom: '2%',
                              marginBottom: '10%',
                              marginLeft: '2%'}}>
                              <TouchableOpacity onPress={() => addToStorage()} style={{
                              display: 'flex', 
                              flexDirection: 'row', 
                              width: '100%', 
                              justifyContent: 'center',
                              }}>
                                  <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Save To Staging</Text>
                              </TouchableOpacity>
                          </View>
                      </View>



                  </View>
                  
              }

          </View>
        </Modal>

        
      : <>
        <KeyboardAvoidingView behavior="padding">
            <TextInput onChangeText={(e) => setBody(e)}
                        value={body}
                        placeholder={'Add a note...'}
                        style={open ? {
                            backgroundColor: 'white',
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: insets.top,
                            paddingBottom: insets.bottom,
                            fontSize: 18,
                            textAlignVertical: 'top',
                            width: '100%',
                            height: '100%',
                            color: 'black'
                        } : {
                          backgroundColor: 'white',
                          paddingLeft: 10,
                          paddingRight: 10,
                          paddingTop: insets.top,
                          paddingBottom: insets.bottom,
                          fontSize: 18,
                          textAlignVertical: 'top',
                          width: '100%',
                          height: '100%',
                          color: 'black'
                      }}
                        editable={open ? true : false}
                        multiline
                        numberOfLines={2}
                        placeholderTextColor='grey'
                        ref={ref}
                        autoFocus
                        />
          <View style={open ? styles.wrapperContainer : styles.wrapperContainerFull}>
            {!open && 
                <View style={styles.buttonWrapperText}>
                  <TouchableOpacity onPress={() => setPreAdd(true)}>
                    <Text style={styles.input}>Add To Storage</Text>
                  </TouchableOpacity>
                </View>
              }
              <View style={open ? styles.buttonWrapper : styles.buttonWrapperFull}>
                  <TouchableOpacity onPress={() => {open === false ? startEdit() : saveNote()}}>
                    {open ? (
                        <FontAwesomeIcon icon={faCheck} size={40} color='white'/>
                      )
                      : (
                        <FontAwesomeIcon icon={faPencil} size={40} color='white'/>
                      )
                    }
                  </TouchableOpacity>
              </View>
          </View>
        </KeyboardAvoidingView>
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
      top: '58%',
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
    buttonWrapper: {
      width: '16%',
      borderColor: '#777',
      borderRadius: 100,
      backgroundColor: 'black',
      borderWidth: 1,
      paddingLeft: '2%',
      paddingTop: '2%',
      paddingBottom: '2%'
    },
    buttonWrapperFull: {
      width: '18%',
      borderColor: '#777',
      borderRadius: 100,
      backgroundColor: 'black',
      borderWidth: 1,
      paddingLeft: '3.5%',
      paddingTop: '3%',
      paddingBottom: '3%'
    },
    buttonWrapperText: {
      width: '45%',
      height: '65%',
      borderColor: '#777',
      borderRadius: 100,
      backgroundColor: 'black',
      borderWidth: 1,
      paddingTop: '2%',
      marginRight: '5%'
    },
    input: {
      textAlign: 'center',
      fontSize: 18,
      width: '100%',
      color: 'white'
    },
})

export default Notepad