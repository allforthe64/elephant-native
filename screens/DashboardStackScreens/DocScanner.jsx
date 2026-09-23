import React, { useState, useEffect, useRef } from 'react'
import { Image, Platform, PermissionsAndroid, Dimensions, View, TouchableOpacity, Text, Pressable, TextInput, Modal, ScrollView, StyleSheet } from 'react-native'

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
import { userListener, addfile, updateUser, addFolderToUser } from '../../firebase/firestore';

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFolder, faXmark, faFile, faArrowLeft, faFloppyDisk, faStopwatch, faPlus, faCheck, faBox, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';


//import stuff for QueueUpload
import { UploadQueueEmitter } from '../../hooks/QueueEventEmitter'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ContentShell from '../../components/ui/ContentShell'
import KeyboardSafeForm from '../../components/ui/KeyboardSafeForm'
import { useAutoFocusOn } from '../../hooks/useAutoFocusOn'
import YellowActionButton from '../../components/ui/YellowActionButton'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getMoveDestinationListHeight } from '../../constants/moveDestinationLayout'
import SaveDestinationActions from '../../components/fileSystem/SaveDestinationActions'
import MoveFolderDestinationRow from '../../components/fileSystem/MoveFolderDestinationRow'

const DocScanner = () => {

  try {
  const { isTablet, select, height: windowHeight } = useResponsiveLayout()
  const moveFolderListHeight = getMoveDestinationListHeight(windowHeight)
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, 16) + 48

  
  const [scannedImageArray, setScannedImageArray] = useState([]);
  const [userInst, setUserInst] = useState()
  const [addFolderForm, setAddFolderForm] = useState(false)
  const addFolderInputRef = useAutoFocusOn(addFolderForm)
  const [focusedFolder, setFocusedFolder] = useState()
  const [subFolders, setSubFolders] = useState()
  const [folders, setFolders] = useState([])
  const [newFolderName, setNewFolderName] = useState('')
  const [nameGiven, setNameGiven] = useState(false)
  const [docName, setDocName] = useState('')
  const [preAdd, setPreAdd] = useState(false)
  const [destination, setDestination] = useState({id: null, fileName: null, nestedUnder: null})
  const [PDFPath, setPDFPath] = useState()
  const [focusedFolderInst, setFocusedFolderInst] = useState()

  //initialize ref for name
  const nameRef = useRef()

  const currentUser = firebaseAuth.currentUser.uid

  const closeSaveDialog = () => {
    setPreAdd(false)
    setNameGiven(false)
    setDocName('')
    setFocusedFolder(null)
    setDestination({id: null, fileName: null, nestedUnder: null})
    setAddFolderForm(false)
    setNewFolderName('')
  }

  const toast = useToast()

  const width = Dimensions.get('window').width
  
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
    if(userInst) {
      if (Array.isArray(userInst?.files)) {
          const sortedFiles = [...(userInst.files || [])].sort((a, b) => {
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
        setFolders([])
        console.warn('userInst.files is not an array', userInst?.files)
      }
    }
  }, [userInst])

  useEffect(() => {
    if (Array.isArray(folders) && focusedFolder) {
      setFocusedFolderInst(folders.filter(folder => folder.id === focusedFolder)[0])
    }
  }, [focusedFolder, folders])

  //add a folder
  const addFolder = async (folderName, targetNest) => {
    try {
      const { newFile, newFiles } = await addFolderToUser(userInst, folderName, targetNest)
      setNewFolderName('')
      setAddFolderForm(false)
      setFolders(newFiles)
      setFocusedFolder(newFile.id)
    } catch (err) {
      alert(err?.message || String(err))
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
  const generatePDF = async (toStaging = false) => {

    return createPdf({
      pages: scannedImageArray.map(imagePath => ({imagePath})),
      outputPath: `file://${RNBlobUtil.fs.dirs.DocumentDir}/file.pdf`
    })
    .then(path => {
      uploadPDF(path, toStaging)
    })
    .catch(error => {
      alert(`Failed to create PDF: ${error}`)
    });
  }

  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  const uploadPDF = async (path, toStaging = false) => {
    try {
      const modifiedPath = `file://${path}`


      //create new formatted date for file
      const randomString = generateRandomString(10);
      const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss") + randomString

      let finalDestination
      if (toStaging) finalDestination = false
      else if (destination.id !== null) finalDestination = destination.id
      else if (focusedFolder) finalDestination = focusedFolder 
      else finalDestination = false

      //generate a fileName and finalDestination
      const filename = docName !== '' ? `${docName}.pdf` : `${formattedDate}.pdf`

      //add an image into the file queue
      let queue = JSON.parse(await AsyncStorage.getItem('uploadQueue')) || []
      queue.push({uri: modifiedPath, filename: filename, fileType: 'pdf', finalDestination: finalDestination})
      await AsyncStorage.setItem('uploadQueue', JSON.stringify(queue))
      
      //confirm the flush by immediately reading it back
      const confirmedQueue = JSON.parse(await AsyncStorage.getItem('uploadQueue'))

      UploadQueueEmitter.emit('uploadQueueUpdated', confirmedQueue)

      setScannedImageArray([])
      closeSaveDialog()
    } catch (error) {
      alert('docScanner error: ' + error.message)
    }



    //create blob and upload it into firebase storage
    try {
        /*const blob = await new Promise((resolve, reject) => {
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
      }) */
      
    } catch ({name, message}) {
      alert(message)
      throw new Error(message)
    }

  }

  useEffect(() => {
    const exists = Array.isArray(folders) && folders.some((value) => {
        return value.nestedUnder === focusedFolder
    })
    setSubFolders(exists)
  }, [focusedFolder, folders])

  useEffect(() => {
    console.log('ScannedImageArray: ', scannedImageArray)
  }, scannedImageArray)

  //carousel
  const [progress, setProgress] = useState(0);
  const carouselRef = useRef()

  const onPressPagination = (targetIndex) => {
    carouselRef.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      index: targetIndex,
      animated: true,
    });
  };

  return (
    <>
      {preAdd ? 

        <Modal animationType='slide' presentationStyle='pageSheet' onShow={() => setTimeout(()=>{
          nameRef.current.focus()
      }, 200)} onRequestClose={closeSaveDialog} onDismiss={closeSaveDialog}>
          <View style={{height: '100%', width: '100%', backgroundColor: '#fff'}}>
              {/* if the moveFile state is true, display the modal with the file movement code*/}
              {/* xMark icon for closing out the moveFile modal */}
              <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%', width: '100%'}}>
                  <Pressable onPress={() => {
                    if (addFolderForm) setAddFolderForm(false) 
                    else closeSaveDialog()
                    }}>
                      <FontAwesomeIcon icon={faXmark} color={'#593060'} size={30}/>
                  </Pressable>
              </View>
              
              <ContentShell variant="modal" fill>
              { 

              !nameGiven ?
              <KeyboardSafeForm>
              <>
                  <Text style={[{color: '#593060', fontSize: 35, fontWeight: '700', marginTop: '35%', textAlign: 'center'}, select(undefined, tabletStyles.modalHeading)]}>Name PDF:</Text>
                  <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%'}}>
                      <View style={styles.iconHolder}>
                        <FontAwesomeIcon icon={faFile} size={22} color='#9F37B0'/>
                      </View>
                      <TextInput value={docName} placeholder='Enter name' placeholderTextColor={'#593060'} style={{color: '#593060', fontSize: 20, fontWeight: 'bold', borderBottomColor: '#593060', borderBottomWidth: 2, width: '70%'}} onChangeText={(e) => setDocName(e)} ref={nameRef}/>
                  </View>
                  <View style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5%'}}>
                    <TouchableOpacity style={docName === '' ? styles.yellowButtonXSDim : styles.yellowButtonXS}
                      disabled={docName === '' ? true : false}
                      onPress={() => {
                          setNameGiven(true)
                      }}
                      >
                        <View style={styles.iconHolderSmall}>
                            <FontAwesomeIcon icon={faFloppyDisk} size={18} color='#9F37B0'/>
                        </View>
                        <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '15%', paddingTop: '1%'}}>Save</Text>
                    </TouchableOpacity>
                    <Text style={{color: '#593060', fontSize: 20, marginTop: '2%', textAlign: 'center'}}>Or</Text>
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
              </KeyboardSafeForm>
              : addFolderForm ? 
                  <KeyboardSafeForm>
                  <>
                      <Text style={[{color: '#593060', fontSize: 35, fontWeight: '700', marginTop: '40%', textAlign: 'center'}, select(undefined, tabletStyles.modalHeading)]}>Add A New Folder:</Text>
                      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%'}}>
                          <View style={styles.iconHolder}> 
                              <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                          </View>
                          <TextInput value={newFolderName} placeholder='Enter new name' placeholderTextColor={'#593060'} style={{color: '#593060', fontSize: 20, fontWeight: 'bold', borderBottomColor: '#593060', borderBottomWidth: 2, width: '70%'}} onChangeText={(e) => setNewFolderName(e)} autoFocus showSoftInputOnFocus ref={addFolderInputRef} onLayout={() => addFolderInputRef.current?.focus?.()}/>
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
                  </>
                  </KeyboardSafeForm>

              :

                  <View style={{width: '100%', flex: 1, alignItems: 'center', backgroundColor: '#fff'}}>
                      <Text style={{fontSize: 40, color: '#593060', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: 8}}>Save PDF To...</Text>
                      {focusedFolderInst &&
                        <Text style={{fontSize: 20, color: '#593060', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: 8}}>Viewing: {focusedFolderInst.fileName}</Text>
                      }
                      {focusedFolder ? 
                          <TouchableOpacity style={[styles.yellowButtonBack, {alignSelf: 'flex-start', marginBottom: 8}]} onPress={() => {
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
                      :
                          null
                      }
                      <View style={{height: moveFolderListHeight, width: '100%', marginBottom: 8, backgroundColor: '#fff'}}>
                              <ScrollView style={{flex: 1, width: '100%'}} contentContainerStyle={focusedFolder && !subFolders ? {flexGrow: 1, justifyContent: 'center'} : {paddingBottom: 16}}>
                              {/* map over each of the folders from the filesystem and display them as a pressable element // call movefile function when one of them is pressed */}
                              {focusedFolder && !subFolders ? 
                                  <Text style={[{fontSize: 30, color: '#593060', fontWeight: 'bold', marginTop: '30%', textAlign: 'center'}, select(undefined, tabletStyles.modalHeading)]}>No Subfolders...</Text>
                              
                              :   
                                  <>
                                      {(Array.isArray(folders) ? folders : []).map((f, index) => {
                                          if (focusedFolder) {
                                              if (f.nestedUnder === focusedFolder) {
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
                      
                      <SaveDestinationActions
                        onAddFolder={() => setAddFolderForm(true)}
                        onSaveStaging={() => generatePDF(true)}
                        onConfirmMove={() => generatePDF()}
                        confirmDisabled={!(destination.id !== null || focusedFolder)}
                        paddingBottom={Math.max(insets.bottom, 12)}
                      />



                  </View>
                  
              }
              </ContentShell>

          </View>
        </Modal>
      :
      
      scannedImageArray ? 
        <ContentShell variant="content" fill>
          {scannedImageArray.length > 1
            ?    
            <View style={{backgroundColor: '#FFFCF6',
              height: '100%', width: '100%'}}>
                <View style={{width: '100%', height: '60%'}}>
                  <Carousel
                      ref={carouselRef}
                      loop
                      width={select(width, Math.min(width, 720), Math.min(width, 840))}
                      style={{height: '90%', paddingRight: '5%'}}
                      autoPlay
                      autoPlayInterval={2000}
                      mode='parallax'
                      modeConfig={{
                        parallaxScrollingScale: 0.9,
                        parallaxScrollingOffset: 50,
                        parallaxAdjacentItemScale: 0.8,
                    }}
                      /* onProgressChange={(val) => {
                        if (val > 0) {
                          if (progress + 1 > scannedImageArray.length) setProgress(0)
                          else setProgress(prev => prev + 1) 
                        } else {
                          if (progress - 1 < 0) setProgress(scannedImageArray.length - 1) 
                          else setProgress(prev => prev - 1) 
                        }
                      }} */
                      data={scannedImageArray}
                      scrollAnimationDuration={1000}
                      renderItem={({ index }) => {
                        return (
                          <View
                              style={{
                                  flex: 1,
                                  justifyContent: 'center',
                                  width: '100%',
                                  height: '100%',
                                  borderWidth: 2,
                                  borderColor: '#593060',
                                  borderRadius: 20,
                                  paddingTop: 4,
                                  paddingRight: 4,
                                  paddingBottom: 4,
                                  paddingLeft: 4
                              }}
                          >
                              <Image 
                                style={{ width: '100%', height: '100%', objectFit: 'contain'}}
                                source={{uri: scannedImageArray[index]}}
                              />
                          </View>
                      )}}
                      />
                    {/* <View style={{width: '100%', paddingLeft: '5%', paddingRight: '5%', display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap'}}>
                      {scannedImageArray.map((index, counter) => {
                        return (
                          <TouchableOpacity  style={{marginLeft: '5%', width: 22, height: 22, borderRadius: 100, backgroundColor: '#FFFCF6', borderWidth: 2, borderColor: '#9F37B0', marginBottom: '5%'}} onPress={() => {
                            setProgress(counter)
                            onPressPagination(counter)
                          }}>
                          </TouchableOpacity>
                        )
                      })}
                    </View> */}
                </View>
                <View style={{height: '20%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: bottomPad, justifyContent: 'flex-end'}}>
                  <View style={{width: '80%', marginBottom: '4%', borderWidth: 2, borderColor: '#593060', borderRadius: 100}}></View>
                  <View style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: 8,
                    gap: 12,
                    }}>
                          <YellowActionButton
                            label="Scan More Documents"
                            onPress={() => scanDocument()}
                            style={tabletStyle(isTablet, { width: '70%', marginBottom: 0 }, tabletStyles.actionButton)}
                            icon={<FontAwesomeIcon icon={faPlus} color='#9F37B0' size={18}/>}
                          />
                          <YellowActionButton
                            label="Convert To PDF/Upload"
                            onPress={() => setPreAdd(true)}
                            style={tabletStyle(isTablet, { width: '70%', marginBottom: 0 }, tabletStyles.actionButton)}
                            icon={<FontAwesomeIcon icon={faCloudArrowUp} color='#9F37B0' size={18} />}
                          />
                  </View>
                </View>
            </View>
              
            :
              <View style={{backgroundColor: '#FFFCF6',
                height: '100%', width: '100%'}}>
                <View style={{height: '75%', marginBottom: '10%'}} width={width}>
                  <Image 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    source={{uri: scannedImageArray[0]}}
                  />
                </View>  
                <View style={{height: '25%', paddingBottom: bottomPad, justifyContent: 'flex-end'}}>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: 8,
                    gap: 12,
                  }}>
                    <YellowActionButton
                      label="Scan More Documents"
                      onPress={() => scanDocument()}
                      style={tabletStyle(isTablet, { width: '70%' }, tabletStyles.actionButton)}
                      icon={<FontAwesomeIcon icon={faPlus} color='#9F37B0' size={18}/>}
                    />
                    <YellowActionButton
                      label="Convert To PDF/Upload"
                      onPress={() => setPreAdd(true)}
                      style={tabletStyle(isTablet, { width: '70%' }, tabletStyles.actionButton)}
                      icon={<FontAwesomeIcon icon={faCloudArrowUp} color='#9F37B0' size={18} />}
                    />
                  </View>
                </View>  
              </View>      
          }  

        </ContentShell>
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

const styles = StyleSheet.create({ 
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
  yellowButton: {
    backgroundColor: '#FFE562',
    paddingLeft: 8,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    width: '70%',
  },
  addFolderButton: {
    width: '50%',
    borderRadius: 12,
    backgroundColor: '#FFE562',
    paddingTop: '2%',
    paddingBottom: '2%',
    paddingLeft: '2%',
    marginBottom: 8,
    marginLeft: '2%',
    display: 'flex',
    flexDirection: 'row'
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
  modalHeading: {
    marginTop: 48,
  },
  actionButton: {
    maxWidth: '100%',
  },
})