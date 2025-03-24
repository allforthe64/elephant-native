import React, { useState, useEffect, useRef } from 'react'
import { Text, View , TouchableOpacity, ScrollView, StyleSheet, Image, TextInput, Modal, Pressable} from 'react-native'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faMicrophone, faSquare, faXmark, faFolder, faArrowLeft, faCloudArrowUp, faPlus, faCheck, faBox, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

//AudioEditor component import
import AudioEditor from '../../components/audioRecorder/AudioEditor'

//import expo-av Audio component
import { Audio } from 'expo-av'

//import updateUser, addfile, userListener from firestore file/firebaseAuth and storage objects from firebase config/ref, uploadBytesResumable from firebase storage
import { updateUser, addfile, userListener } from '../../firebase/firestore'
import { firebaseAuth, storage } from '../../firebaseConfig'
import {ref, uploadBytesResumable} from 'firebase/storage'

//import safeAreInsets context
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//import format from date-fns for file timestamps
import { format } from 'date-fns'

//import useToast for notifications
import { useToast } from 'react-native-toast-notifications'

//import stuff for the UploadQueue
import { UploadQueueEmitter } from '../../hooks/QueueEventEmitter'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AudioRecorder = () => {

    try {
        const [recording, setRecording] = useState()
        const [recordings, setRecordings] = useState([])
        const [userInst, setUserInst] = useState()
        const [loading, setLoading] = useState(false)
        const [preAdd, setPreAdd] = useState(false)
        const [addFolderForm, setAddFolderForm] = useState(false)
        const [focusedFolder, setFocusedFolder] = useState()
        const [subFolders, setSubFolders] = useState()
        const [folders, setFolders] = useState([])
        const [newFolderName, setNewFolderName] = useState('')
        const [destination, setDestination] = useState({id: null, fileName: null, nestedUnder: null})
        const [focusedFolderInst, setFocusedFolderInst] = useState()

        const currentUser = firebaseAuth.currentUser.uid
        const toast = useToast()
        
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

        useEffect(() => {
            const exists = Object.values(folders).some((value) => {
                return value.nestedUnder === focusedFolder
            })
            setSubFolders(exists)
        }, [focusedFolder, addFolderForm])

        useEffect(() => {
            if (folders && focusedFolder) {
                setFocusedFolderInst(folders.filter(folder => folder.id === focusedFolder)[0])
            }
        }, [focusedFolder, folders])


    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync()

            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true
                })

                const {recording} = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                )
    
                setRecording(recording)
            } else {
               setMessage('Please grant permission to Elephant App to access microphone') 
            }

            
        } catch (err) {
            console.error('Failed to start recording', err)
        }
    }

    const stopRecording = async () => {
        setRecording(undefined)
        await recording.stopAndUnloadAsync()

        const updatedRecordings = [...recordings]
        const {sound, status} = await recording.createNewLoadedSoundAsync()
        
        updatedRecordings.push({
            sound: sound,
            duration: getDurartionFormatted(status.durationMillis),
            file: recording.getURI(),
            name: `Recording ${recordings.length + 1}`
        })

        setRecordings(updatedRecordings)
    }

    const getDurartionFormatted = (millis) => {
        const minutes = millis / 1000 / 60
        const minutesDisplay = Math.floor(minutes)
        const seconds = Math.round((minutes - minutesDisplay) * 60)
        const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
        return `${minutesDisplay}:${secondsDisplay}`
    }

    const getRecordingLines = () => {
        return recordings.map((recordingLine, index) => {
            return (
            <AudioEditor editRecordings={setRecordings} recordingLine={recordingLine} index={index} key={index} recordings={recordings} deleteFunc={filterRecordings} />
        ) 
            
        })
    }

    const filterRecordings = (input, target) => {

        const arr = []

        input.map(el => {
            if (JSON.stringify(el) !== JSON.stringify(target)) arr.push(el)
        })

        setRecordings(arr)
    }

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
        
                const newFiles = [...userInst.files, newFile]
                const updatedUser = {...userInst, files: newFiles}
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

                const newFiles = [...userInst.files, newFile]
                const updatedUser = {...userInst, files: newFiles}
        
                updateUser(updatedUser)
                setAddFolderForm(false)
                setFolders(newFiles)
                setFocusedFolder(folderId)
            }
        } else {
        alert('Please enter a folder name')
        }
    }

    const saveFiles = async () => {

        setLoading(true)

        const filesToAddToQueue = recordings.map(recording => {

            let finalDestination 
            if (destination.id !== null) finalDestination = destination.id
            else if (focusedFolder) finalDestination = focusedFolder 
            else finalDestination = false

            return {uri: recording.file, filename: `${recording.name}.mp3`, finalDestination: finalDestination}
        })

        let queue = JSON.parse(await AsyncStorage.getItem('uploadQueue')) || []
        const newQueue = [...queue, ...filesToAddToQueue]
        await AsyncStorage.setItem('uploadQueue', JSON.stringify(newQueue))

        UploadQueueEmitter.emit('uploadQueueUpdated', newQueue)


        /* const references = await Promise.all(recordings.map(async (el) => {

            try {

            

            //check if a file already exists with this file's name. If it does, increase version number
            let versionNo = 0
            userInst.fileRefs.forEach(fileRef => {
                if (fileRef.fileName === (el.name + '.' + el.file.split('.')[1]) && fileRef.fileName.split('.')[1] === 'mp3') {
                    versionNo ++
                }
            })

            //generate formatted date
            const formattedDate = format(new Date(), `yyyy-MM-dd:hh:mm:ss::${Date.now()}`)

            //upload the file
            const blob = await new Promise(async (resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.onload = () => {
                    resolve(xhr.response) 
                }
                xhr.onerror = (e) => {
                    reject(e)
                    reject(new TypeError('Network request failed'))
                }
                xhr.responseType = 'blob'
                xhr.open('GET', el.file, true)
                xhr.send(null)
            })

            const filename = `${currentUser}/${formattedDate}`
            const fileRef = ref(storage, filename)
            const result = await uploadBytesResumable(fileRef, blob)

            let finalDestination 
            if (destination.id !== null) finalDestination = destination.id
            else if (focusedFolder) finalDestination = focusedFolder 
            else finalDestination = false
    
            //create file reference
            const reference = await addfile({
                name: el.name + '.' + 'mp3',
                fileType: 'mp3',
                size: result.metadata.size,
                uri: el.file,
                user: currentUser, 
                timeStamp: formattedDate, 
                version: versionNo
            }, finalDestination)

            //increase upload size
            uploadSize += result.metadata.size

            return reference

        } catch (err) {
            alert(err)
        }

        }))

        //increase the ammount of space the user is consuming and add the references to the user's staging
        const newSpaceUsed = userInst.spaceUsed + uploadSize
        const newUser = {...userInst, spaceUsed: newSpaceUsed, fileRefs: [...userInst.fileRefs, ...references]}
        await updateUser(newUser)

        if (destination.id !== null) {
            toast.show(`File upload to ${destination.fileName} successful`, {
                type: 'success'
                })
        } else if (focusedFolder) {
            const fileInst = userInst.files.filter(file => file.id === focusedFolder)
            toast.show(`File upload to ${fileInst[0].fileName} successful`, {
                type: 'success'
                })
        } else {
            toast.show(`File upload to staging successful`, {
                type: 'success'
                })
        }

        const empty = [] */
        setRecordings([])
        setLoading(false)
        setDestination({id: null, fileName: null, nestedUnder: null})
        setFocusedFolder(null)
        setPreAdd(false)
          
    }

    const insets = useSafeAreaInsets()

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
                            setMediaName('')
                        }
                        }}>
                            <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                        </Pressable>
                    </View>
                    
                    { 
    
                    addFolderForm ? 
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
                            <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '5%'}}>Save Files To...</Text>
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
                                        saveFiles()
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
        :
            <View style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: insets.top,
                paddingBottom: insets.bottom
            }}>
                <Text style={styles.bigHeader}>Audio Recordings:</Text>

                {loading ? 
                    <View style={styles.scrollCon}>
                        <Text style={styles.smallHeader}>Uploading Recordings...</Text>
                    </View>
                :      
                    <View style={styles.scrollCon}>
                        {recordings.length === 0 ? 
                            <Text style={styles.smallHeader}>No Recordings Yet</Text>
                        :
                            <ScrollView>
                                {getRecordingLines()}
                            </ScrollView>
                        }
                    </View>
                }
                <View style={styles.wrapperContainer}>
                        <TouchableOpacity onPress={recording ? stopRecording : startRecording} style={{backgroundColor: 'transparent', borderWidth: 8, borderColor: 'white', borderRadius: 1000, width: '20%', height: 70, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                            {recording ? <FontAwesomeIcon icon={faSquare} size={30} color='red'/> : <FontAwesomeIcon icon={faMicrophone} size={30} color='red'/>}
                        </TouchableOpacity>
                </View>
                <View style={styles.wrapperContainer}>
                    <TouchableOpacity onPress={() => setPreAdd(true)} style={styles.buttonWrapper}>
                        <View style={styles.iconHolderSmall}>
                            <FontAwesomeIcon icon={faCloudArrowUp} color='#9F37B0' />
                        </View>
                        <Text style={{fontSize: 18, width: '100%', fontWeight: '600', color: '#9F37B0', paddingTop: '1%', marginLeft: '25%'}}>Save All</Text>
                    </TouchableOpacity>
                </View>
            </View>
        }    
    </>
  )

    } catch (err) {
        alert(err)
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
      },
    bigHeader: {
        color: '#593060',
        fontSize: 25,
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: '8%',
        marginTop: '5%'
        },
    smallHeader: {
        color: '#593060',
            fontSize: 16,
            textAlign: 'center',
            fontWeight: '700',
            marginBottom: '8%'
    },
    scrollCon: {
        height: '60%',
        width: '95%',
        borderBottomWidth: 1,
        borderColor: 'black',
        marginBottom: '5%',
        display: 'flex',
        justifyContent: 'center'
    },
    scroll: {
        paddingTop: '2%',
        display: 'flex',
        alignItems: 'center'
    },
    wrapperContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginBottom: '5%'
    },
    buttonWrapper: {
    width: '60%',
    borderRadius: 25,
    backgroundColor: '#FFE562',
    display: 'flex',
    flexDirection: 'row',
    paddingTop: '2%',
    paddingBottom: '2%',
    paddingLeft: '2%'
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
    
})

export default AudioRecorder