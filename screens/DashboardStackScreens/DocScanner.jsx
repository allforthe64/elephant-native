import React, { useState, useEffect } from 'react'
import { Image, Platform, PermissionsAndroid, Dimensions, View, TouchableOpacity, Text, Pressable, TextInput, Modal, ScrollView } from 'react-native'

//import DocumentScanner component from react-native-document-scanner-plugin
import DocumentScanner from 'react-native-document-scanner-plugin'

//import Carousel component from react-native-reanimated-carousel
import Carousel from 'react-native-reanimated-carousel';

//import useToast for notifications
import { useToast } from 'react-native-toast-notifications'

//import createPdf to convert images to pdf
import { createPdf } from 'react-native-images-to-pdf';

//import RNBlobUtil 
import RNBlobUtil from 'react-native-blob-util';

//import format from date-fns for file timestamp
import { format } from 'date-fns';

//import storage and firebaseAuth objects from firebaseConfig
import { storage, firebaseAuth } from '../../firebaseConfig';

//firebase storage imports for file uploading
import {ref, uploadBytesResumable} from 'firebase/storage'

//import userListener, addfile, and update user functions from firestore
import { userListener, addfile, updateUser } from '../../firebase/firestore';

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark, faArrowLeft, faFolder, faFile } from '@fortawesome/free-solid-svg-icons';

const DocScanner = () => {

  try {

  
  const [scannedImageArray, setScannedImageArray] = useState([]);
  const [userInst, setUserInst] = useState()
  const [addFolderForm, setAddFolderForm] = useState(false)
  const [focusedFolder, setFocusedFolder] = useState()
  const [subFolders, setSubFolders] = useState()
  const [folders, setFolders] = useState({})
  const [newFolderName, setNewFolderName] = useState('')
  const [nameGiven, setNameGiven] = useState(false)
  const [docName, setDocName] = useState('')
  const [preAdd, setPreAdd] = useState(false)
  const [destination, setDestination] = useState({id: null, fileName: null, nestedUnder: null})

  const currentUser = firebaseAuth.currentUser.uid

  const toast = useToast()

  const width = Dimensions.get('window').width
  

  //get the current user 
  useEffect(() => {
    if (firebaseAuth) {
    try {
        const getCurrentUser = async () => {
        const unsubscribe = await userListener(setUserInst, false, currentUser)
    
        return () => unsubscribe()
        }
        getCurrentUser()
    } catch (err) {console.log(err)}
    } else console.log('no user yet')
    
  }, [firebaseAuth])

  useEffect(() => {
    if(userInst)
    setFolders(userInst.files)
  }, [userInst, addFolderForm])

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
        setFolders(newFiles)
        
      } else {           //if the incoming targetNest has a value, create the new folder with the nestedUnder property set to targetNest
        const newFile = {
          id: Math.random().toString(20).toString().split('.')[1] + Math.random().toString(20).toString().split('.')[1],
          fileName: folderName,
          nestedUnder: targetNest
        }

        const newFiles = [...userInst.files, newFile]
        const updatedUser = {...userInst, files: newFiles}
  
        updateUser(updatedUser)
        setAddFolderForm(false)
        setFolders(newFiles)
      }
    } else {
      alert('Please enter a folder name')
    }
  }

  const scanDocument = async () => {

    // prompt user to accept camera permission request if they haven't already
    if (Platform.OS === 'android' && await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    ) !== PermissionsAndroid.RESULTS.GRANTED) {
      toast.show('File upload successful', {
        type: 'error'
      }) 
      return
    }

    // start the document scanner
    const { scannedImages } = await DocumentScanner.scanDocument()
  
    // get back an array with scanned image file paths
    if (scannedImages.length > 0) {
      // set the img src, so we can view the first scanned image
      if (scannedImageArray.length >= 1) {
        setScannedImageArray(prev => [...prev, ...scannedImages])
      } else {
        setScannedImageArray(scannedImages)
      }
    }
  }

  useEffect(() => {
    // call scanDocument on load
    scanDocument()
  }, []);

  //generate a pdf using the scanned images
  const generatePDF = async () => {

    const formattedDate = format(new Date(), `yyyy-MM-dd:hh:mm:ss::${Date.now()}`)

    return createPdf({
      pages: scannedImageArray.map(imagePath => ({imagePath})),
      outputPath: `file://${RNBlobUtil.fs.dirs.DocumentDir}/file.pdf`
    })
    .then(path => uploadPDF(path))
    .catch(error => {
      console.log(`Failed to create PDF: ${error}`)
      alert(error)
    });
  }

  const uploadPDF = async (path) => {
    try {
      console.log('This is the path within the upload function: ', path)

      const modifiedPath = `file://${path}`

    //generate formatted date for file name
    const formattedDate = format(new Date(), `yyyy-MM-dd:hh:mm:ss::${Date.now()}`)

    //create blob and upload it into firebase storage
      const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.onload = () => {
              resolve(xhr.response) 
          }
          xhr.onerror = (e) => {
              reject(e)
              reject(new TypeError('Network request failed'))
          }
          xhr.responseType = 'blob'
          xhr.open('GET', modifiedPath, true)
          xhr.send(null)
      })
      
      const filename = `${currentUser}/${formattedDate}`
      const fileRef = ref(storage, filename)
      const result = await uploadBytesResumable(fileRef, blob)

      console.log('this is the result object: ', result)

      let finalDestintation 
       if (destination.id !== null) finalDestintation = destination.id
       else if (focusedFolder) finalDestintation = focusedFolder 
       else finalDestintation = false
      
      //generate references
      const reference = await addfile({
        name: `${docName !== '' ? docName : formattedDate}.pdf`,
        fileType: 'pdf',
        size: result.metadata.size,
        uri: path,
        user: currentUser,
        version: 0,
        timeStamp: formattedDate
      }, finalDestintation)
      
      const updatedUser = {...userInst, fileRefs: [...userInst.fileRefs, reference], spaceUsed: userInst.spaceUsed + result.metadata.size}
      updateUser(updatedUser)
      toast.show('Upload successful', {
          type: 'success'
      })
      setScannedImageArray([])
      setDestination({id: null, fileName: null, nestedUnder: null})
      setFocusedFolder(null)
      setPreAdd(false)
      setNameGiven(false)
    } catch (error) {
      console.log('error within pdf upload function: ', error)
      alert('Error within pdf upload function: ', error)
    }

  }

  useEffect(() => {
    const exists = Object.values(folders).some((value) => {
        return value.nestedUnder === focusedFolder
    })
    setSubFolders(exists)
  }, [focusedFolder, addFolderForm])

  useEffect(() => {
    console.log('ScannedImageArray: ', scannedImageArray)
  }, scannedImageArray)

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
                      setDocName('')
                    }
                    }}>
                      <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                  </Pressable>
              </View>
              
              { 

              !nameGiven ?
              <>
                  <Text style={{color: 'white', fontSize: 35, fontWeight: '700', marginTop: '35%', textAlign: 'center'}}>Name PDF:</Text>
                  <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%'}}>
                      <FontAwesomeIcon icon={faFile} size={30} color='white'/>
                      <TextInput value={docName} style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '40%'}} onChangeText={(e) => setDocName(e)} autoFocus/>
                      <View style={docName === '' ? {

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
                              disabled={docName === '' ? true : false}
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
                      <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '10%'}}>Save PDF To...</Text>

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
                              <TouchableOpacity onPress={() => generatePDF()} style={{
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
                              <TouchableOpacity onPress={() => generatePDF()} style={{
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
      :
      
      scannedImageArray ? 
        <View>
          {scannedImageArray.length > 1
            ?    
            <>
                <Carousel
                    loop
                    width={width}
                    style={{height: '75%', paddingRight: '5%'}}
                    data={scannedImageArray}
                    scrollAnimationDuration={1000}
                    onSnapToItem={(index) => console.log('current index:', index)}
                    renderItem={({ index }) => (
                        <View
                            style={{
                                flex: 1,
                                borderWidth: 1,
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%'
                            }}
                        >
                            <Image 
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              source={{uri: scannedImageArray[index]}}
                            />
                        </View>
                    )}
                    />
                <View style={{height: '25%'}}>
                  <View style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: '8%'
                    }}>
                      <View style={{
                        width: '60%',
                        borderColor: '#777',
                        borderRadius: 25,
                        backgroundColor: 'white',
                        borderWidth: 1,
                        paddingTop: '2%',
                        paddingBottom: '2%',
                      }}>
                          <TouchableOpacity onPress={() => scanDocument()}>
                          <Text style={{
                            textAlign: 'center',
                            fontSize: 15,
                            width: '100%',
                          }}>Scan More Documents</Text>
                          </TouchableOpacity>
                      </View>
                  </View>

                  <View style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: '8%'
                    }}>
                      <View style={{
                        width: '70%',
                        borderColor: '#777',
                        borderRadius: 25,
                        backgroundColor: 'white',
                        borderWidth: 1,
                        paddingTop: '2%',
                        paddingBottom: '2%',
                      }}>
                        <TouchableOpacity onPress={() => setPreAdd(true)}>
                        <Text style={{
                          textAlign: 'center',
                          fontSize: 15,
                          width: '100%',
                        }}>Save Images As PDF</Text>
                        </TouchableOpacity>
                    </View>
                  </View>
                </View>
            </>
              
            :
            <>
              <View style={{height: '65%', marginBottom: '10%'}} width={width}>
                <Image 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  source={{uri: scannedImageArray[0]}}
                />
              </View>  
              <View style={{height: '25%'}}>
              <View style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                marginBottom: '8%'
                }}>
                  <View style={{
                    width: '60%',
                    borderColor: '#777',
                    borderRadius: 25,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    paddingTop: '2%',
                    paddingBottom: '2%',
                  }}>
                      <TouchableOpacity onPress={() => scanDocument()}>
                      <Text style={{
                        textAlign: 'center',
                        fontSize: 15,
                        width: '100%',
                      }}>Scan More Documents</Text>
                      </TouchableOpacity>
                  </View>
              </View>
  
              <View style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                marginBottom: '8%'
                }}>
                  <View style={{
                    width: '60%',
                    borderColor: '#777',
                    borderRadius: 25,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    paddingTop: '2%',
                    paddingBottom: '2%',
                  }}>
                    <TouchableOpacity onPress={() => generatePDF()}>
                    <Text style={{
                      textAlign: 'center',
                      fontSize: 15,
                      width: '100%',
                    }}>Convert To PDF</Text>
                    </TouchableOpacity>
                </View>
              </View>
            </View>  
            </>      
          }  

        </View>
      :
        <></>
      }
    </>
  )
  } catch (error) {
    alert(error)
  }
}

export default DocScanner