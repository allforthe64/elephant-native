import React, { useState, useEffect } from 'react'
import { Text, View , TouchableOpacity, ScrollView, StyleSheet, Image, TextInput, Modal, Pressable} from 'react-native'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faMicrophone, faSquare, faXmark, faFolder, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

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
                return value.nestedUnder.toString() === focusedFolder.toString()
            })
            setSubFolders(exists)
        }, [focusedFolder, addFolderForm])

        useEffect(() => {
            if (folders && focusedFolder) {
                setFocusedFolderInst(folders.filter(folder => folder.id.toString() === focusedFolder.toString())[0])
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
            const folderId = Math.random().toString(20).toString().split('.')[1] + Math.random().toString(20).toString().split('.')[1]
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
        let uploadSize = 0

        const references = await Promise.all(recordings.map(async (el) => {

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
            const fileInst = userInst.files.filter(file => file.id.toString() === focusedFolder.toString())
            toast.show(`File upload to ${fileInst[0].fileName} successful`, {
                type: 'success'
                })
        } else {
            toast.show(`File upload to staging successful`, {
                type: 'success'
                })
        }

        const empty = []
        setRecordings(empty)
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
                <View style={{height: '100%', width: '100%', backgroundColor: 'rgb(23 23 23)'}}>
                    {/* if the moveFile state is true, display the modal with the file movement code*/}
                    {/* xMark icon for closing out the moveFile modal */}
                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%', width: '100%'}}>
                        <Pressable onPress={() => {
                            if (addFolderForm) setAddFolderForm(false) 
                            else {
                            setPreAdd(false)
                            setFocusedFolder(null)
                            }
                            }}>
                            <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                        </Pressable>
                    </View>
                    
                    { 
                    addFolderForm ? 
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
                            <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '5%'}}>Save Recordings To...</Text>
                            {focusedFolderInst &&
                                <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '5%'}}>Viewing: {focusedFolderInst.fileName}</Text>
                            }
                            <View style={focusedFolder && !subFolders ? {width: '100%', height: '55%', marginBottom: '10%', display: 'flex', justifyContent: 'center'} : {width: '100%', height: '55%', marginBottom: '10%'}}>
                                    {focusedFolder ? 
                                        <>
                                            <TouchableOpacity style={{display: 'flex', flexDirection: 'row', marginLeft: '5%', marginTop: '5%'}} onPress={() => {
                                                const folderInst = folders.filter(folder => folder.id.toString() === focusedFolder.toString()) 
                                                
                                                const parentFolderInst = folders.filter(folder => folder.id.toString() === folderInst[0].nestedUnder.toString())
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
                                                                        if (destination.id === null || f.id.toString() !== destination.id.toString()) {
                                                                            setDestination({id: f.id, fileName: f.fileName, nestedUnder: f.nestedUnder})
                                                                        } else {
                                                                            setFocusedFolder(f.id)
                                                                            setDestination({id: null, fileName: null, nestedUnder: null})
                                                                        }
                                                                    }
                                                                    }>
                                                                    <View style={f.id.toString() === destination.id.toString() ? {borderBottomWidth: 2, width: '85%', backgroundColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'} : {borderBottomWidth: 2, width: '85%', borderBottomColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'}}>
                                                                    <FontAwesomeIcon icon={faFolder} size={30} color={f.id.toString() === destination.id.toString() ? 'black' : 'white'}/>
                                                                    <Text style={f.id.toString() === destination.id.toString() ? {color: 'black', fontSize: 30, marginLeft: '5%'} : {color: 'white', fontSize: 30, marginLeft: '5%'}}>{f.fileName}</Text>
                                                                    </View>
                                                                </Pressable>
                                                            )
                                                        
                                                    }
                                                } else {
                                                    if (f.nestedUnder === '') {
                                                        return (
                                                            <Pressable key={index} style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'}} onPress={() => {
                                                                    if (destination.id === null || f.id.toString() !== destination.id.toString()) {
                                                                        setDestination({id: f.id, fileName: f.fileName, nestedUnder: f.nestedUnder})
                                                                    } else {
                                                                        setFocusedFolder(f.id)
                                                                        setDestination({id: null, fileName: null, nestedUnder: null})
                                                                    }
                                                                }
                                                                }>
                                                                <View style={f.id.toString() === destination.id.toString() ? {borderBottomWidth: 2, width: '85%', backgroundColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'} : {borderBottomWidth: 2, width: '85%', borderBottomColor: 'white', display: 'flex', flexDirection: 'row', paddingLeft: '2.5%', paddingTop: '2%'}}>
                                                                <FontAwesomeIcon icon={faFolder} size={30} color={f.id.toString() === destination.id.toString() ? 'black' : 'white'}/>
                                                                <Text style={f.id.toString() === destination.id.toString() ? {color: 'black', fontSize: 30, marginLeft: '5%'} : {color: 'white', fontSize: 30, marginLeft: '5%'}}>{f.fileName}</Text>
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
                                    <TouchableOpacity onPress={() => saveFiles()} style={{
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
                                    <TouchableOpacity onPress={() => saveFiles()} style={{
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
            <View style={{
                backgroundColor: 'rgb(23,23,23)',
                height: '100%'}}>
                <Image style={styles.bgImg } source={require('../../assets/elephant_bg.jpg')} />
                <View style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'absolute',
                    paddingBottom: '10%',
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom}}>
                    <Text style={styles.bigHeader}>Audio Recordings:</Text>

                    {loading ? 
                        <View style={styles.noRecCon}>
                            <Text style={styles.bigHeader}>Uploading Recordings...</Text>
                        </View>
                    :
                        <>
                            {recordings.length === 0 ? 
                                <View style={styles.noRecCon}>
                                    <Text style={styles.bigHeader}>No Recordings Yet</Text>
                                </View>
                            :
                                <View style={styles.scrollCon}>
                                    <ScrollView>
                                        {getRecordingLines()}
                                    </ScrollView>
                                </View>
                            }
                        </>
                    }
                    <View style={styles.wrapperContainer}>
                        <View style={recording ? styles.buttonWrapperIcon : styles.buttonWrapperRed}>
                            <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
                            {recording ? <FontAwesomeIcon icon={faSquare} size={46} style={{color: 'red', marginLeft: '13%'}}/> : <FontAwesomeIcon icon={faMicrophone} size={50} style={{marginLeft: '12%'}}/>}
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.wrapperContainer}>
                        <View style={recordings.length > 0 ? styles.buttonWrapper : {
                            width: '60%',
                            borderColor: '#777',
                            borderRadius: 25,
                            backgroundColor: 'white',
                            borderWidth: 1,
                            paddingTop: '2%',
                            paddingBottom: '2%',
                            opacity: .5
                        }}>
                            <TouchableOpacity onPress={() => {
                                if (recordings.length > 0) {
                                    setPreAdd(true)
                                }
                               
                            }}>
                            <Text style={styles.input}>Save All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
    bigHeader: {
        color: 'white',
        fontSize: 25,
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: '5%'
      },
    scrollCon: {
        height: '60%',
        width: '95%',
        borderBottomWidth: 1,
        borderColor: 'white',
        marginBottom: '5%',
    },
    noRecCon: {
        height: '60%',
        width: '95%',
        borderBottomWidth: 1,
        borderColor: 'white',
        marginBottom: '5%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bgImg: {
        objectFit: 'scale-down',
        opacity: .15,
        transform: [{scaleX: -1}]
    },
    wrapperContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginBottom: '8%'
    },
    buttonWrapper: {
        width: '60%',
        borderColor: '#777',
        borderRadius: 25,
        backgroundColor: 'white',
        borderWidth: 1,
        paddingTop: '2%',
        paddingBottom: '2%',
    },
    buttonWrapperIcon: {
        width: '18%',
        borderRadius: 25,
        borderColor: 'white',
        borderWidth: 3,
        paddingTop: '2%',
        paddingBottom: '2%',
        borderRadius: 1000,
    },
    buttonWrapperRed: {
        width: '18%',
        borderRadius: 1000,
        backgroundColor: 'red',
        borderWidth: 1,
        paddingTop: '2%',
        paddingBottom: '2%',
    },
    input: {
    textAlign: 'center',
    fontSize: 15,
    width: '100%',
    },
    successContainer: {
        position: 'absolute',
        top: 0,
        backgroundColor: 'white',
        width: '100%',
        height: '5%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    innerSuccessContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '50%',
    },
})

export default AudioRecorder