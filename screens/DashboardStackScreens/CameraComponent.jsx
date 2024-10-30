import { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, StatusBar, StyleSheet, Animated, Image, TouchableOpacity, Platform, Pressable, TextInput, Modal, ScrollView, Button } from 'react-native'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCloudArrowUp, faEnvelope, faFolder, faTrash, faRepeat, faVideoCamera, faCamera, faSquare, faXmark, faFile, faArrowLeft, faFloppyDisk, faStopwatch, faPlus, faCheck, faBox } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { faCircle as solidCircle } from '@fortawesome/free-solid-svg-icons'

//import expo Camera api
import { Camera } from 'expo-camera'
import { CameraView, useCameraPermissions } from 'expo-camera';

//import Video and Audio components from expo-av
import { Video, Audio } from 'expo-av'

//import expo shareAsync and MediaLibrary
import { shareAsync } from 'expo-sharing'
import * as MediaLibrary from 'expo-media-library'

//import format from date-fns for file timestamps
import { format } from 'date-fns'

//import addFile, updateUser, userListener from firestore/storage, firbaseAuth object from firebaseConfig/ref uploadBytesResumable from firebase storage
import { addfile, updateUser, userListener } from '../../firebase/firestore'
import { firebaseAuth, storage } from '../../firebaseConfig'
import {ref, uploadBytesResumable} from 'firebase/storage'

//import PinchGestureHandler for zoom controls
import { PinchGestureHandler } from 'react-native-gesture-handler'

//import useToast for notifications
import { useToast } from 'react-native-toast-notifications'

//import ImageManipulator object from expo
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { QueContext } from '../../context/QueContext';


export default function CameraComponent() {
try {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [hasCameraPermission, setHasCameraPermission] = useState()
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState()
    const [hasAudioRecordingPermission, setHasAudioRecordingPermission] = useState()
    const [photo, setPhoto] = useState()
    const [session, setSession] = useState(true)
    const [userInst, setUserInst] = useState()
    const [loading, setLoading] = useState(true)
    const [type, setType] = useState('back')
    const [video, setVideo] = useState(false)
    const [recording, setRecording] = useState(false)
    const [videoObj, setVideoObj] = useState()
    const [zoom, setZoom] = useState(0)
    const [preAdd, setPreAdd] = useState(false)
    const [addFolderForm, setAddFolderForm] = useState(false)
    const [focusedFolder, setFocusedFolder] = useState()
    const [subFolders, setSubFolders] = useState()
    const [folders, setFolders] = useState({})
    const [newFolderName, setNewFolderName] = useState('')
    const [nameGiven, setNameGiven] = useState(false)
    const [mediaName, setMediaName] = useState('')
    const [destination, setDestination] = useState({id: null, fileName: null, nestedUnder: null})
    const cameraRef = useRef()

        const currentUser = firebaseAuth.currentUser.uid

        const {setQue} = useContext(QueContext)

        const toast = useToast()

        //initialize animation ref
        let fadeAnim = useRef(new Animated.Value(100)).current

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

        //get camera permissions
        useEffect(() => {
            (async () => {
                const cameraPermission = await Camera.requestCameraPermissionsAsync()
                const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync()
                const {status} = await Audio.requestPermissionsAsync() 
                setHasCameraPermission(cameraPermission.status === "granted")
                setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted")
                setHasAudioRecordingPermission(status === "granted")
            })()
        }, [])

        useEffect(() => {
            //Will change fadeAnim value to 0 in 3 seconds
            Animated.timing(fadeAnim, {
                toValue: 100,
                duration: 0,
                useNativeDriver: true
            }).start()
        }, [photo])

        //set folders
        useEffect(() => {
            if(userInst)
            setFolders(userInst.files)
          }, [userInst, addFolderForm])

        
        useEffect(() => {
        const exists = Object.values(folders).some((value) => {
            return value.nestedUnder === focusedFolder
        })
        setSubFolders(exists)
    }, [focusedFolder, addFolderForm])

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
      

        //render content based on permissions
        if (hasCameraPermission === undefined || hasMediaLibraryPermission === undefined || hasAudioRecordingPermission === undefined) {
            return <Text>Requesting permissions...</Text>
        } else if (!hasCameraPermission) {
            return <Text>Permission for camera not granted. Please change this in settings.</Text>
        }

        //take photo using takePictureAsync method
        const takePic = async () => {
            try {
                const options = {
                    quality: 1,
                    base64: true,
                    exif: false
                }
    
                const newPhoto = await cameraRef.current.takePictureAsync(options)
                setPhoto(newPhoto)
            } catch (err) {
                alert(err)
            }
        }

        //take a video using takeAsyncVideo method
        const takeVideo = async () => {
            const codecs = CameraView.getAvailableVideoCodecsAsync()
            console.log(codecs)
            try {
                setRecording(true)
                let options 
                
                if (Platform.OS === 'ios') {
                    options = {
                        mute: false,
                        codec: codecs.H264
                    }
                } else {
                    options = {
                        mute: false,
                    }
                }

                const recordedVideo = await cameraRef.current.recordAsync(options)
                setVideoObj(recordedVideo)
            } catch (error) { 
                alert('error within recording function: ', error) 
                console.log(error)
            }
        }

        //stop recording video
        const stopVideo = () => {
            cameraRef.current.stopRecording()
            setRecording(false)
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

        const saveToElephant = async (videoMode) => {

            try {
                 //save video
                if (videoMode) {
                    
                    setVideoObj(undefined)

                    //create new formatted date for file
                    const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss")

                    try {  

                        //create blob using the photo from state and save it to elephant staging
                        const blob = await new Promise(async (resolve, reject) => {
                            const xhr = new XMLHttpRequest()
                            xhr.onload = () => {
                            resolve(xhr.response) 
                            }
                            xhr.onerror = (e) => {
                                reject(new TypeError('Network request failed'))
                            }
                            xhr.responseType = 'blob'
                            xhr.open('GET', videoObj.uri, true)
                            xhr.send(null)
                        })

                        const filename = mediaName !== '' ? `${mediaName}.${Platform.OS === 'ios' ? 'mov' : 'mp4'}` : `${formattedDate}.${Platform.OS === 'ios' ? 'mov' : 'mp4'}`
                        const fileUri = `${currentUser}/${mediaName !== '' ? mediaName : formattedDate}`
                        const fileRef = ref(storage, `${currentUser}/${formattedDate}`)
                        const result = await uploadBytesResumable(fileRef, blob)

                        let finalDestination 
                        if (destination.id !== null) finalDestination = destination.id
                        else if (focusedFolder) finalDestination = focusedFolder 
                        else finalDestination = false

                        const reference = await addfile({
                                name: filename,
                                fileType: `${Platform.OS === 'ios' ? 'mov' : 'mp4'}`,
                                size: result.metadata.size,
                                uri: fileUri,
                                user: currentUser,
                                version: 0,
                                timeStamp: formattedDate
                            }, finalDestination)
                        const updatedUser = {...userInst, fileRefs: [...userInst.fileRefs, reference], spaceUsed: userInst.spaceUsed + result.metadata.size}
                        updateUser(updatedUser)
                        toast.show('Upload successful', {
                            type: 'success'
                        })

                        saveVideo()

                    } catch (err) {
                        alert(err)
                    }
                } else {
                    setPhoto(undefined)
                    const randomString = generateRandomString(10);

                    //create new formatted date for file
                    const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss") + randomString

                    try {  

                        //generate a resized version of the image for thumbnails
                        const manipResult = await manipulateAsync(
                            photo.uri,
                            [{ resize: {height: photo.height * .1, width: photo.width * .1} }],
                            { compress: 1, format: SaveFormat.PNG }
                          );

                        //upload thumbnail version
                        const thumbNailBlob = await new Promise(async (resolve, reject) => {
                            const xhr = new XMLHttpRequest()
                            xhr.onload = () => {
                                resolve(xhr.response)
                            }
                            xhr.onerror = (e) => {
                                reject(new TypeError('Network request failed'))
                            }
                            xhr.responseType = 'blob'
                            xhr.open('GET', manipResult.uri, true)
                            xhr.send(null)
                        })
                        const thumbnailFilename = mediaName !== '' ? `${mediaName}&thumbnail.jpg` : `${formattedDate}&thumbnail.jpg`
                        const thumbnailFileUri = `${currentUser}/${mediaName !== '' ? `thumbnail&${mediaName}` : `thumbnail&${formattedDate}`}`
                        const thumbnailFileRef = ref(storage, `${currentUser}/thumbnail&${formattedDate}`)
                        const thumbnailResult = await uploadBytesResumable(thumbnailFileRef, thumbNailBlob) 

                        //upload regular version
                        //create blob using the photo from state and save it to elephant staging
                        const blob = await new Promise(async (resolve, reject) => {
                            const xhr = new XMLHttpRequest()
                            xhr.onload = () => {
                            resolve(xhr.response) 
                            }
                            xhr.onerror = (e) => {
                                reject(new TypeError('Network request failed'))
                            }
                            xhr.responseType = 'blob'
                            xhr.open('GET', photo.uri, true)
                            xhr.send(null)
                        })

                        const filename = mediaName !== '' ? `${mediaName}.jpg` : `${formattedDate}.jpg`
                        const fileUri = `${currentUser}/${mediaName !== '' ? mediaName : formattedDate}`
                        const fileRef = ref(storage, `${currentUser}/${formattedDate}`)
                        const result = await uploadBytesResumable(fileRef, blob)

                        let finalDestination 
                        if (destination.id !== null) finalDestination = destination.id
                        else if (focusedFolder) finalDestination = focusedFolder 
                        else finalDestination = false

                        const reference = await addfile({
                                name: filename,
                                fileType: 'jpg',
                                size: result.metadata.size,
                                uri: fileUri,
                                thumbnailUri: thumbnailFileUri,
                                user: currentUser,
                                version: 0,
                                timeStamp: `${formattedDate}`
                            }, finalDestination)

                        if (!session) {
                            const updatedUser = {...userInst, fileRefs: [...userInst.fileRefs, reference], spaceUsed: userInst.spaceUsed + result.metadata.size}
                            updateUser(updatedUser)
                        } else {
                            setQue(prev => [...prev, reference])
                        }
                        toast.show('Upload successful', {
                            type: 'success'
                        })

                        savePhoto()

                    } catch (err) {
                        alert(err)
                    }
                }
                setMediaName('')
                setDestination({id: null, fileName: null, nestedUnder: null})
                setFocusedFolder(null)
                setPreAdd(false)
                setNameGiven(false)

            } catch (error) {
                alert('Error within media upload function: ', error)
            }
        }

        //allow photo to be shared using shareAsync method
        const sharePic = () => {
            shareAsync(photo.uri).then(() => {
                setPhoto(undefined)
            })
        }

        //allow photo to be shared using shareAsync method
        const shareVideo = () => {
            shareAsync(videoObj.uri).then(() => {
                setVideoObj(undefined)
            })
        }

        //save photo to the phone's local storage using saveToLibraryAsync method
        const savePhoto = () => {
            MediaLibrary.saveToLibraryAsync(photo.uri).then((() => {
                console.log('success')
            }))
        }

        //save photo to the phone's local storage using saveToLibraryAsync method
        const saveVideo = () => {
            MediaLibrary.saveToLibraryAsync(videoObj.uri).then((() => {
                console.log('success')
            }))
        }

        //if session mode is turned on after picture is taken, immediately save the photo to elephant storage
        if (photo) {
            if (session === true) {
                saveToElephant(false)
            }
            
        }

        //if session mode is turned on after video is taken, immediately save the photo to elephant storage
        if (videoObj) {
            if (session === true) {
                saveToElephant(true)
            }
        }

        const fadeOut = () => {
            //Will change fadeAnim value to 0 in 3 seconds
            Animated.timing(fadeAnim, {
                delay: 100,
                toValue: 0,
                duration: 2500,
                useNativeDriver: true
            }).start()
        }

        //toggle between front and back camera
        const toggleType = () => {
            if (!recording) setFacing(prev => prev === 'back' ? 'front' : 'back')
        }

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  //if velocity of pinch event is positive increase zoom, if it is negative decrease zoom
  const onPinchEvent = (event) => {
        if (event.nativeEvent.velocity > 0) {
            setZoom(prev => {
                if (facing === 'back') {
                    let newZoom = prev += .01
                    if (newZoom > 1) newZoom = 1
                    return newZoom
                } else {
                    let newZoom = prev += .01
                    if (newZoom > 1) newZoom = 1
                    return newZoom
                }
            })
        } else setZoom(prev => {
            if (facing === 'back') {
                let newZoom = prev -= .01
                if (newZoom < 0) newZoom = 0
                return newZoom
            } else {
                let newZoom = prev -= .001
                if (newZoom < 0) newZoom = 0
                return newZoom
            }
        })
    }

  return (
    preAdd ?
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
                        setMediaName('')
                    }
                    }}>
                        <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                    </Pressable>
                </View>
                
                { 

                !nameGiven ?
                <>
                    <Text style={{color: 'white', fontSize: 35, fontWeight: '700', marginTop: '35%', textAlign: 'center'}}>{photo ? 'Name Photo' : 'Name Video: '}</Text>
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%'}}>
                        <View style={styles.iconHolder}>
                            <FontAwesomeIcon icon={faFile} size={22} color='#9F37B0'/>
                        </View>
                        <TextInput value={mediaName} style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '70%'}} onChangeText={(e) => setMediaName(e)} autoFocus/>
                    </View>
                    <View style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5%'}}>
                        <TouchableOpacity style={mediaName === '' ? styles.yellowButtonXSDim : styles.yellowButtonXS}
                            disabled={mediaName === '' ? true : false}
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
                    <View style={{width: '100%', height: '100', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{color: 'white', fontSize: 35, fontWeight: '700', marginTop: '40%', textAlign: 'center'}}>Add A New Folder:</Text>
                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%', width: '100%'}}>
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
                    </View>

                :

                    <View style={{width: '100%', height: '95%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '10%'}}>Save Files To...</Text>

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

                        <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-around',}}>
                                 <TouchableOpacity onPress={() => saveFiles()} style={ destination.id !== null || focusedFolder ? styles.yellowButtonSM : styles.yellowButtonSMDim}
                                    disabled={destination.id !== null || focusedFolder ? false : true}
                                >   
                                    <View style={styles.iconHolderSmall}>
                                        <FontAwesomeIcon icon={faCheck} color='#9F37B0'/>
                                    </View>
                                    <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '8%', paddingTop: '1%'}}>Confirm Move</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => {
                                    saveToElephant(videoObj ? true : false)
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

            </View>
        </Modal>
    : photo ? 
        <View style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end'
        }}>
            <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64}}/>
            <View style={{position: 'absolute', top: '8%', right: '2.5%'}} >
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '2%'}}>
                    <Animated.View style={{display: 'flex', flexDirection: 'coloumn', alignItems: 'flex-end', marginRight: 10, paddingTop: 20, opacity: fadeAnim}} onLayout={() => fadeOut()}>
                        <View style={{backgroundColor: '#DDCADB',  marginBottom: 25, paddingTop: 2, paddingBottom: 2, borderRadius: 17, width: '50%', marginTop: '2%'}}>
                            <Text style={{fontSize: 18, textAlign: 'center', color: '#593060', fontWeight: '600'}}>Share</Text>
                        </View>
                        {/* <View style={{backgroundColor: 'rgba(0, 0, 0, .5)',  marginBottom: 25, paddingTop: 2, paddingBottom: 2, borderRadius: 17}}>
                        {hasMediaLibraryPermission ? <Text style={{fontSize: 18, paddingLeft: 10, paddingRight: 10, color: 'white'}}>Save To Photos</Text> : undefined}
                        </View> */}
                        <View style={{backgroundColor: '#DDCADB',  marginBottom: 25, paddingTop: 2, paddingBottom: 2, borderRadius: 17, paddingLeft: '4%', paddingRight: '4%', marginTop: '8%'}}>
                            <Text style={{fontSize: 18, textAlign: 'center', color: '#593060', fontWeight: '600'}}>Save To Elephant</Text>
                        </View>
                        <View style={{backgroundColor: '#DDCADB',  marginBottom: 25, paddingTop: 2, paddingBottom: 2, borderRadius: 17, width: '50%', marginTop: '5%'}}>
                            <Text style={{fontSize: 18, textAlign: 'center', color: '#593060', fontWeight: '600'}}>Delete</Text>
                        </View>
                        
                    </Animated.View>
                    <View style={{display: 'flex', flexDirection: 'coloumn', backgroundColor: 'rgba(0, 0, 0, .5)', paddingTop: 15, paddingBottom: 15, paddingLeft: 10, paddingRight: 10, borderRadius: 25}}>
                        <TouchableOpacity style={{marginBottom: 20}} onPress={sharePic}>
                            <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faEnvelope} size={22} color='#9F37B0'/>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{marginBottom: 20}} onPress={() => setPreAdd(true)}>
                            <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faCloudArrowUp} size={22} color='#9F37B0'/>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={() => setPhoto(undefined)}>
                            <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faTrash} size={22} color='red'/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
: videoObj ? 
    <>
        <View style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
        }}>
            <Video style={{flex: 1, alignSelf: 'stretch', height: '100%'}} source={{uri: videoObj.uri}} useNativeControls resizeMode='contain' isLooping onError={(error) => alert(error)}/>
            <View style={{position: 'absolute', top: '8%', right: '2.5%'}} >
                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '2%'}}>
                    <Animated.View style={{display: 'flex', flexDirection: 'coloumn', alignItems: 'flex-end', marginRight: 10, paddingTop: 20, opacity: fadeAnim}} onLayout={() => fadeOut()}>
                        <View style={{backgroundColor: '#DDCADB',  marginBottom: 25, paddingTop: 2, paddingBottom: 2, borderRadius: 17, width: '50%', marginTop: '2%'}}>
                            <Text style={{fontSize: 18, textAlign: 'center', color: '#593060', fontWeight: '600'}}>Share</Text>
                        </View>
                        {/* <View style={{backgroundColor: 'rgba(0, 0, 0, .5)',  marginBottom: 25, paddingTop: 2, paddingBottom: 2, borderRadius: 17}}>
                        {hasMediaLibraryPermission ? <Text style={{fontSize: 18, paddingLeft: 10, paddingRight: 10, color: 'white'}}>Save To Photos</Text> : undefined}
                        </View> */}
                        <View style={{backgroundColor: '#DDCADB',  marginBottom: 25, paddingTop: 2, paddingBottom: 2, borderRadius: 17, paddingLeft: '4%', paddingRight: '4%', marginTop: '8%'}}>
                            <Text style={{fontSize: 18, textAlign: 'center', color: '#593060', fontWeight: '600'}}>Save To Elephant</Text>
                        </View>
                        <View style={{backgroundColor: '#DDCADB',  marginBottom: 25, paddingTop: 2, paddingBottom: 2, borderRadius: 17, width: '50%', marginTop: '5%'}}>
                            <Text style={{fontSize: 18, textAlign: 'center', color: '#593060', fontWeight: '600'}}>Delete</Text>
                        </View>
                        
                    </Animated.View>
                    <View style={{display: 'flex', flexDirection: 'coloumn', backgroundColor: 'rgba(0, 0, 0, .5)', paddingTop: 15, paddingBottom: 15, paddingLeft: 10, paddingRight: 10, borderRadius: 25}}>
                        <TouchableOpacity style={{marginBottom: 15}} onPress={shareVideo}>
                            <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faEnvelope} size={22} color='#9F37B0'/>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{marginBottom: 20}} onPress={() => setPreAdd(true)}>
                            <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faCloudArrowUp} size={22} color='#9F37B0'/>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={() => setVideoObj(undefined)}>
                            <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faTrash} size={22} color='red'/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    </>
    :
    <View style={styles.container}>
        <PinchGestureHandler onGestureEvent={onPinchEvent}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef} mode={video ? 'video' : 'picture'} zoom={zoom}>
                <View style={{
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                    height: '12.5%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    paddingRight: '5%',
                }}>
                    <TouchableOpacity onPress={() => setSession(prev => !prev)} style={session ? {backgroundColor: 'white', width: '14%', height: '55%', borderRadius: 100, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'} : { width: '14%', height: '55%', borderRadius: 100, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, .5)'}}>
                        <FontAwesomeIcon icon={faCloudArrowUp} color={session ? 'black' : 'white'} size={30} />
                    </TouchableOpacity>
                </View>
                <View style={{
                        position: 'absolute',
                        top: 75,
                        width: '100%',
                        height: '12.5%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        paddingRight: '5%',
                    }}>
                        <TouchableOpacity onPress={toggleType} style={{ width: '14%', height: '55%', borderRadius: 100, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, .5)'}}>
                            <FontAwesomeIcon icon={faRepeat} color={'white'} size={30} />
                        </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => setVideo(prev => !prev)} style={video ? {/* backgroundColor: 'white' */backgroundColor: 'rgba(0, 0, 0, .5)', width: '14%', height: '55%', borderRadius: 100, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: '10%', marginTop: '5%'} : { width: '14%', height: '55%', borderRadius: 100, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, .5)', marginRight: '10%', marginTop: '5%'}}>
                            <FontAwesomeIcon icon={video ? faCamera : faVideoCamera} color={/* video ? 'black' :  */'white'} size={30} />
                    </TouchableOpacity>
                    {!video ? 
                        <TouchableOpacity onPress={takePic} style={{marginRight: '17%'}}> 
                            <FontAwesomeIcon icon={faCircle} size={90} color='white'/>
                        </TouchableOpacity>
                    :   
                        <>
                            {recording ? 
                                <TouchableOpacity onPress={stopVideo} style={{marginRight: '17%', backgroundColor: 'transparent', borderWidth: 8, borderColor: 'white', borderRadius: 1000, width: '24%', height: 90, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}> 
                                    <FontAwesomeIcon icon={faSquare} size={55} color='red'/>
                                </TouchableOpacity>
                                :
                                <TouchableOpacity onPress={takeVideo} style={{marginRight: '17%', backgroundColor: 'transparent', borderWidth: 8, borderColor: 'white', borderRadius: 1000, width: '24%', height: 90, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}> 
                                    <FontAwesomeIcon icon={solidCircle} size={55} color='red'/>
                                </TouchableOpacity>
                            }
                        </>
                    }
                </View>
                <StatusBar style="auto" /> 
            </CameraView>
        </PinchGestureHandler>
    </View>
  );
    } catch (err) {
        alert(err)
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  containerCenter: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end'
    },
    innerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '50%',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: '5%',
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center'
    },
    preview: {
        alignSelf: 'stretch',
        flex: 1
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
  
});