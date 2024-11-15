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
import { userListener, addfile, updateUser } from '../../firebase/firestore';

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFolder, faXmark, faFile, faArrowLeft, faFloppyDisk, faStopwatch, faPlus, faCheck, faBox, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';

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
  const [PDFPath, setPDFPath] = useState()

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
    .then(path => {
      setPDFPath(path)
      setPreAdd(true)
    })
    .catch(error => {
      console.log(`Failed to create PDF: ${error}`)
      alert(error)
    });
  }

  const uploadPDF = async (path) => {
    setPreAdd(false)
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
    } catch (error) {
      console.log('error within pdf upload function: ', error)
      alert('Error within pdf upload function: ', error)
    }
      
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
      setNameGiven(false)

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

        <Modal animationType='slide' presentationStyle='pageSheet'>
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
                      <View style={styles.iconHolder}>
                        <FontAwesomeIcon icon={faFile} size={22} color='#9F37B0'/>
                      </View>
                      <TextInput value={docName} style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '70%'}} onChangeText={(e) => setDocName(e)} autoFocus/>
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
                    <Text style={{color: 'white', fontSize: 20, marginTop: '2%', textAlign: 'center'}}>Or</Text>
                    <TouchableOpacity style={{width: '50%',
                        borderRadius: 25,
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
                  <>
                      <Text style={{color: 'white', fontSize: 35, fontWeight: '700', marginTop: '40%', textAlign: 'center'}}>Add A New Folder:</Text>
                      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%'}}>
                          <View style={styles.iconHolder}> 
                              <FontAwesomeIcon icon={faFolder} size={22} color='#9F37B0'/>
                          </View>
                          <TextInput value={newFolderName} style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '70%'}} onChangeText={(e) => setNewFolderName(e)} autoFocus onBlur={() => {if (newFolderName === '') setAddFolderForm(false)}}/>
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

              :

                  <View style={{width: '100%', height: '95%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '10%'}}>Save PDF To...</Text>

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
                                  <Text style={{fontSize: 30, color: 'white', fontWeight: 'bold', marginTop: '30%', textAlign: 'center'}}>No Subfolders...</Text>
                              
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

                      <View style={{display: 'flex', flexDirection: 'row'}}>
                          
                          <TouchableOpacity onPress={() => uploadPDF(PDFPath)} style={ destination.id !== null || focusedFolder ? styles.yellowButtonSM : styles.yellowButtonSMDim}
                            disabled={destination.id !== null || focusedFolder ? false : true}
                          >
                            <View style={styles.iconHolderSmall}>
                                <FontAwesomeIcon icon={faCheck} color='#9F37B0'/>
                            </View>
                            <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '8%', paddingTop: '1%'}}>Confirm Move</Text>
                          </TouchableOpacity>

                      
                          <TouchableOpacity onPress={() => uploadPDF(PDFPath)} style={styles.yellowButtonSM}>
                            <View style={styles.iconHolderSmall}>
                                <FontAwesomeIcon icon={faBox} color='#9F37B0'/>
                            </View>
                            <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '3%', paddingTop: '1%'}}>Save To Staging</Text>
                          </TouchableOpacity>
                      </View>



                  </View>
                  
              }

          </View>
        </Modal>
      :
      
      scannedImageArray ? 
        <>
          {scannedImageArray.length > 1
            ?    
            <View style={{backgroundColor: '#FFFCF6',
              height: '100%', width: '100%'}}>
                <View style={{width: '100%', height: '60%'}}>
                  <Carousel
                      ref={carouselRef}
                      loop
                      width={width}
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
                                  height: '100%'
                              }}
                          >
                              <Image 
                                style={{ width: '100%', height: '100%', objectFit: 'contain'}}
                                source={{uri: scannedImageArray[index]}}
                              />
                          </View>
                      )}}
                      />
                    <View style={{width: '100%', paddingLeft: '5%', paddingRight: '5%', display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap'}}>
                      {scannedImageArray.map((index, counter) => {
                        return (
                          <TouchableOpacity  style={{marginLeft: '5%', width: 22, height: 22, borderRadius: 100, backgroundColor: '#FFFCF6', borderWidth: 2, borderColor: '#9F37B0', marginBottom: '5%'}} onPress={() => {
                            setProgress(counter)
                            onPressPagination(counter)
                          }}>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                </View>
                <View style={{height: '20%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  <View style={{width: '80%', marginBottom: '4%', borderWidth: 2, borderColor: '#593060', borderRadius: 100}}></View>
                  <View style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: '8%'
                    }}>
                          <TouchableOpacity onPress={() => scanDocument()} style={{
                          backgroundColor: '#FFE562',
                          paddingLeft: '2%',
                          paddingTop: '2%',
                          paddingBottom: '2%',
                          paddingRight: 20,
                          borderRadius: 100,
                          display: 'flex',
                          flexDirection: 'row',
                          width: '70%',
                          marginBottom: '4%'
                        }}>
                            <View style={styles.iconHolderSmall}>
                              <FontAwesomeIcon icon={faPlus} color='#9F37B0' size={22}/>
                            </View>
                            <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '15%', paddingTop: '1%'}}>Scan More Documents</Text>
                          </TouchableOpacity>
                      
                        <TouchableOpacity onPress={() => setPreAdd(true)} style={styles.yellowButton}>
                          <View style={styles.iconHolderSmall}>
                            <FontAwesomeIcon icon={faCloudArrowUp} color='#9F37B0' size={22} />
                          </View>
                          <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '15%', paddingTop: '1%'}}>Convert To PDF/Upload</Text>
                        </TouchableOpacity>
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
                <View style={{height: '25%'}}>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                  }}>
                    <TouchableOpacity onPress={() => scanDocument()} style={{backgroundColor: '#FFE562',
                          paddingLeft: '2%',
                          paddingTop: '2%',
                          paddingBottom: '2%',
                          paddingRight: 20,
                          borderRadius: 100,
                          display: 'flex',
                          flexDirection: 'row',
                          width: '70%',
                          marginBottom: '4%'
                        }}>
                      <View style={styles.iconHolderSmall}>
                        <FontAwesomeIcon icon={faPlus} color='#9F37B0' size={22}/>
                      </View>
                      <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '15%', paddingTop: '1%'}}>Scan More Documents</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => generatePDF()} style={styles.yellowButton}>
                      <View style={styles.iconHolderSmall}>
                          <FontAwesomeIcon icon={faCloudArrowUp} color='#9F37B0' size={22} />
                      </View>
                      <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '15%', paddingTop: '1%'}}>Convert To PDF/Upload</Text>
                    </TouchableOpacity>
                  </View>
                </View>  
              </View>      
          }  

        </>
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
    borderRadius: 100,
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
      borderRadius: 100,
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
    borderRadius: 100,
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
    borderRadius: 100,
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
    borderRadius: 100,
    display: 'flex',
    flexDirection: 'row',
    width: '30%',
    marginLeft: '5%'
  },
  yellowButton: {
    backgroundColor: '#FFE562',
    paddingLeft: '2%',
    paddingTop: '2%',
    paddingBottom: '2%',
    paddingRight: 20,
    borderRadius: 100,
    display: 'flex',
    flexDirection: 'row',
    width: '70%',
  },
  addFolderButton: {
    width: '50%',
    borderRadius: 25,
    backgroundColor: '#FFE562',
    paddingTop: '2%',
    paddingBottom: '2%',
    paddingLeft: '2%',
    marginBottom: '5%',
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