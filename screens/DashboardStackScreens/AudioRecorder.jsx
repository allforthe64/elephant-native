import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Text, View , TouchableOpacity, ScrollView, StyleSheet, Image, TextInput, Modal, Pressable, Alert, Platform} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faMicrophone, faSquare, faXmark, faFolder, faArrowLeft, faCloudArrowUp, faPlus, faCheck, faBox, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

//AudioEditor component import
import AudioEditor from '../../components/audioRecorder/AudioEditor'

//import expo-av Audio component
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'

//import updateUser, addfile, userListener from firestore file/firebaseAuth and storage objects from firebase config/ref, uploadBytesResumable from firebase storage
import { updateUser, addfile, userListener, addFolderToUser } from '../../firebase/firestore'
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
import AppPressable from '../../components/ui/AppPressable'
import ContentShell from '../../components/ui/ContentShell'
import KeyboardSafeForm from '../../components/ui/KeyboardSafeForm'
import YellowActionButton from '../../components/ui/YellowActionButton'
import { TestIds } from '../../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'
import { useAutoFocusOn } from '../../hooks/useAutoFocusOn'
import { getMoveDestinationListHeight } from '../../constants/moveDestinationLayout'
import SaveDestinationActions from '../../components/fileSystem/SaveDestinationActions'
import MoveFolderDestinationRow from '../../components/fileSystem/MoveFolderDestinationRow'

const AudioRecorder = () => {

    try {
        const { isTablet, select, height: windowHeight } = useResponsiveLayout()
        const moveFolderListHeight = getMoveDestinationListHeight(windowHeight)
        const insets = useSafeAreaInsets()
        const keyboardHeight = useKeyboardHeight()
        const [recording, setRecording] = useState()
        const [recordings, setRecordings] = useState([])
        const [userInst, setUserInst] = useState()
        const [loading, setLoading] = useState(false)
        const [preAdd, setPreAdd] = useState(false)
        const [addFolderForm, setAddFolderForm] = useState(false)
        const addFolderInputRef = useAutoFocusOn(addFolderForm)
        const [focusedFolder, setFocusedFolder] = useState()
        const [subFolders, setSubFolders] = useState()
        const [folders, setFolders] = useState([])
        const [newFolderName, setNewFolderName] = useState('')
        const [destination, setDestination] = useState({id: null, fileName: null, nestedUnder: null})
        const [focusedFolderInst, setFocusedFolderInst] = useState()

        const currentUser = firebaseAuth.currentUser.uid
        const toast = useToast()

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
            const exists = Array.isArray(folders) && folders.some((value) => {
                return value.nestedUnder === focusedFolder
            })
            setSubFolders(exists)
        }, [focusedFolder, folders])

        useEffect(() => {
            if (Array.isArray(folders) && focusedFolder) {
                setFocusedFolderInst(folders.filter(folder => folder.id === focusedFolder)[0])
            }
        }, [focusedFolder, folders])

    // Camera/video can leave the shared AVAudioSession in a non-recording state.
    // Reclaim it whenever this screen is focused so mic recording works afterward.
    useFocusEffect(
        useCallback(() => {
            let cancelled = false
            ;(async () => {
                try {
                    await Audio.setAudioModeAsync({
                        allowsRecordingIOS: true,
                        playsInSilentModeIOS: true,
                        staysActiveInBackground: false,
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: false,
                    })
                } catch (err) {
                    if (!cancelled) console.warn('Audio mode prepare failed:', err)
                }
            })()
            return () => {
                cancelled = true
            }
        }, [])
    )

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync()
            const granted = permission?.granted === true || permission?.status === 'granted'

            if (!granted) {
               Alert.alert('Please grant permission to Elephant App to access microphone')
               return
            }

            // Force reconfigure after camera/video may have taken over the session
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            })

            const {recording} = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            )

            setRecording(recording)
        } catch (err) {
            console.error('Failed to start recording', err)
            // One retry after resetting audio mode — common after leaving CameraView video mode
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                })
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                })
                const {recording} = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                )
                setRecording(recording)
            } catch (retryErr) {
                console.error('Recording retry failed', retryErr)
                Alert.alert(
                    'Recording failed',
                    retryErr?.message || 'Could not start the microphone. Close the camera screen and try again.'
                )
            }
        }
    }

    const stopRecording = async () => {
        if (!recording) return

        setRecording(undefined)
        await recording.stopAndUnloadAsync()
        // Required by expo-av so the recorded file can be read/uploaded after stop
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        })

        const uri = recording.getURI()
        if (!uri) {
            Alert.alert('Recording failed', 'No audio file was produced.')
            return
        }

        // Cache URIs can disappear before the upload queue runs; persist a stable copy
        const ext = ((uri.split('.').pop() || 'm4a').split('?')[0] || 'm4a').toLowerCase()
        const docsDir = FileSystem.documentDirectory || FileSystem.cacheDirectory
        if (!docsDir) {
            Alert.alert('Recording failed', 'Could not access local storage for the recording.')
            return
        }
        const stableUri = `${docsDir}recording-${Date.now()}.${ext}`
        try {
            await FileSystem.copyAsync({ from: uri, to: stableUri })
        } catch (copyErr) {
            console.error('Failed to persist recording', copyErr)
            Alert.alert('Recording failed', 'Could not save the recording file.')
            return
        }

        const { sound, status } = await Audio.Sound.createAsync({ uri: stableUri })

        const updatedRecordings = [...recordings]
        updatedRecordings.push({
            sound: sound,
            duration: getDurartionFormatted(status.durationMillis),
            file: stableUri,
            fileType: ext,
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

    const saveFiles = async (toStaging = false) => {

        setLoading(true)

        try {
        const recordingsToSave = [...recordings]
        if (recordingsToSave.length === 0) {
            setLoading(false)
            Alert.alert('No recordings', 'Record audio before saving to staging.')
            return
        }

        const filesToAddToQueue = recordingsToSave.map(rec => {

            let finalDestination
            if (toStaging) finalDestination = false
            else if (destination.id !== null) finalDestination = destination.id
            else if (focusedFolder) finalDestination = focusedFolder 
            else finalDestination = false

            const ext = rec.fileType || 'm4a'
            return {uri: rec.file, filename: `${rec.name}.${ext}`, fileType: ext, finalDestination: finalDestination}
        })

        let queue = JSON.parse(await AsyncStorage.getItem('uploadQueue')) || []
        const newQueue = [...queue, ...filesToAddToQueue]
        await AsyncStorage.setItem('uploadQueue', JSON.stringify(newQueue))

        //confirm the flush by immediately reading it back
        const confirmedQueue = JSON.parse(await AsyncStorage.getItem('uploadQueue'))

        UploadQueueEmitter.emit('uploadQueueUpdated', confirmedQueue)
        } catch (err) {
            Alert.alert('Save failed', err?.message || String(err))
            setLoading(false)
            return
        }


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

  return (
    <>
        {preAdd ? 
            <Modal animationType='slide' presentationStyle='pageSheet'>
                <View style={{height: '100%', width: '100%', backgroundColor: '#fff'}}>
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
                            <FontAwesomeIcon icon={faXmark} color={'#593060'} size={30}/>
                        </Pressable>
                    </View>
                    
                    <ContentShell variant="modal" fill>
                    { 
    
                    addFolderForm ? 
                        <KeyboardSafeForm>
                        <View style={{width: '100%', height: '100', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={[{color: '#593060', fontSize: 35, fontWeight: '700', marginTop: '40%', textAlign: 'center'}, select(undefined, tabletStyles.modalHeading)]}>Add A New Folder:</Text>
                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: '10%', width: '100%'}}>
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
                        </View>
                        </KeyboardSafeForm>
    
                    :
    
                        <View style={{width: '100%', flex: 1, alignItems: 'center', backgroundColor: '#fff'}}>
                            <Text style={{fontSize: 40, color: '#593060', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: 8}}>Save Files To...</Text>
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
                                onSaveStaging={() => saveFiles(true)}
                                onConfirmMove={() => saveFiles()}
                                confirmDisabled={!(destination.id !== null || focusedFolder)}
                                paddingBottom={Math.max(insets.bottom, 12)}
                            />
    
    
    
                        </View>
                        
                    }
                    </ContentShell>
    
                </View>
            </Modal>
        :
            <ContentShell variant="content" fill>
            <View style={{
                width: '100%',
                flex: 1,
                alignItems: 'center',
                paddingTop: 8,
                paddingBottom: Math.max(insets.bottom, 16) + 48 + (Platform.OS === 'ios' ? keyboardHeight : 0),
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
                            <ScrollView keyboardShouldPersistTaps="handled">
                                {getRecordingLines()}
                            </ScrollView>
                        }
                    </View>
                }
                <View style={styles.wrapperContainer}>
                        <AppPressable
                          testID={TestIds.audio.recordToggle}
                          accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}
                          onPress={recording ? stopRecording : startRecording}
                          style={{backgroundColor: 'transparent', borderWidth: 8, borderColor: 'white', borderRadius: 1000, width: '20%', height: 70, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}
                        >
                            {recording ? <FontAwesomeIcon icon={faSquare} size={30} color='red'/> : <FontAwesomeIcon icon={faMicrophone} size={30} color='red'/>}
                        </AppPressable>
                </View>
                <View style={[styles.wrapperContainer, styles.bottomButtonWrap]}>
                    <YellowActionButton
                      testID={TestIds.audio.saveAll}
                      accessibilityLabel="Save All"
                      label="Save All"
                      onPress={() => setPreAdd(true)}
                      style={tabletStyle(isTablet, { width: '60%' }, tabletStyles.actionButton)}
                      icon={<FontAwesomeIcon icon={faCloudArrowUp} color='#9F37B0' size={16} />}
                      iconSize={28}
                    />
                </View>
            </View>
            </ContentShell>
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
        flex: 1,
        width: '95%',
        borderBottomWidth: 1,
        borderColor: 'black',
        marginBottom: 16,
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
    bottomButtonWrap: {
        marginBottom: 8,
    },
    buttonWrapper: {
    width: '60%',
    borderRadius: 12,
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
        marginBottom: 8,
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
    
})

const tabletStyles = StyleSheet.create({
    modalHeading: {
        marginTop: 48,
    },
    actionButton: {
        maxWidth: '100%',
    },
})

export default AudioRecorder