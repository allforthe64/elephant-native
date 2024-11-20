import { View, Text, Modal, TouchableOpacity, Pressable, TextInput, ScrollView, Keyboard, Image, Linking, StyleSheet, Animated} from 'react-native'
import React, {useEffect, useState, useRef} from 'react'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark, faFile, faFolder, faArrowUpRightFromSquare, faImage, faPlay, faPause, faArrowLeft, faShare, faFont, faPencil, faTrash, faFloppyDisk, faPlus, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons'

//firestore and cloud storage imports
import { getFileDownloadURL } from '../../firebase/cloudStorage'
import { firebaseAuth, storage } from '../../firebaseConfig'
import { userListener, updateFileObj, updateUser, getFile } from '../../firebase/firestore'
import { uploadBytes, ref as refFunction, deleteObject } from 'firebase/storage'

//expo shareAsync, MediaLibrary, and FileSystem imports 
import { shareAsync } from 'expo-sharing'
import * as MediaLibrary from 'expo-media-library'
import * as FileSystem from 'expo-file-system'

//expo-av Audio, Video element imports for displaying images and photos
import { Audio, Video } from 'expo-av'

//useToast import for displaying notifications
import { useToast } from 'react-native-toast-notifications'

//date-fns format function import for formatting dates for timestamps
import { format } from 'date-fns'
import { PinchGestureHandler } from 'react-native-gesture-handler'


const FocusedFileComp = ({file, focus, deleteFile, renameFileFunction, handleFileMove}) => {

    //initialize state
    const [userInst, setUserInst] = useState()
    const [preDelete, setPreDelete] = useState(false)
    const [add, setAdd] = useState(false)
    const [newFileName, setNewFileName] = useState(file ? file.fileName.split('.')[0] + (file.version > 0 ? ` (${file.version}).${file.fileName.split('.')[1]}` : '.' + file.fileName.split('.')[1]) : '') 
    const [moveFile, setMoveFile] = useState(false)
    const [destination, setDestination] = useState({id: null, fileName: null, nestedUnder: null})
    const [expanded, setExpanded] = useState(false)
    const [sound, setSound] = useState()
    const [playing, setPlaying] = useState(false)
    const [playbackPosition, setPlaybackPosition] = useState(0)
    const [folders, setFolders] = useState({})

    const [fileURL, setFileURL] = useState()
    const [fileObj, setFileObj] = useState()
    const [mediaPermissions, setMediaPermissions] = useState()
    const [navigateURL, setNavigateURL] = useState()
    const [focusedFolder, setFocusedFolder] = useState()
    const [subFolders, setSubFolders] = useState()
    const [addFolderForm, setAddFolderForm] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [editNote, setEditNote] = useState(false)
    const [noteText, setNoteText] = useState('')
    const [editingMode, setEditingMode] = useState(false)
    const scale = useRef(new Animated.Value(1)).current

    //consume toast context for notifications
    const toast = useToast()

    const ref = useRef()

    const auth = firebaseAuth

    //get the current user 
    useEffect(() => {
        if (auth) {
            try {
                const getCurrentUser = async () => {
                    console.log('running from FocusedFileComp')
                    const unsubscribe = await userListener(setUserInst, false, auth.currentUser.uid)
                
                    return () => unsubscribe()
                }
                getCurrentUser()
            } catch (err) {alert(err)}
        } else console.log('no user yet')
        
    }, [addFolderForm])

    //set the userFolders
    useEffect(() => {
        if (userInst) {
            setFolders(userInst.files)
        }
    }, [userInst, addFolderForm])

    //get the downloadable url from firebase storage from the file doc and save it in state
    useEffect(() => {
        const getFileDoc = async () => {
            const fileInst = await getFile(file.fileId)
            const url = await getFileDownloadURL(fileInst.uri)
            setFileURL(url)
            setFileObj(fileInst)
            setNavigateURL(fileInst.linksTo)
        }
        getFileDoc()

        const getPermissions = async () => {
            //get shareAsync permissions
            const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync()
            setMediaPermissions(mediaLibraryPermission.status === "granted")
        }
        getPermissions()
    }, [])

    //unload the sound
    useEffect(() => {
        return sound
          ? () => {
              sound.unloadAsync();
            }
          : undefined;
    }, [sound]);

    useEffect(() => {
        const exists = Object.values(folders).some((value) => {
            return value.nestedUnder === focusedFolder
        })
        setSubFolders(exists)
    }, [focusedFolder, addFolderForm])

    useEffect(() => {
        if (fileURL && fileObj && fileObj.documentType === 'txt') {
            fetch(fileURL).then(result => result.text())
            .then(text => {
                setNoteText(text)
            })
        }
    }, [fileURL, fileObj])

    useEffect(() => {
        if (editingMode === false) Keyboard.dismiss()
        else {
            if (ref.current) ref.current.focus()
        } 
    }, [editingMode])


    //rename a file by overwriting the fileName property
    const renameFile = () => {
        let version = 0
        userInst.fileRefs.forEach(fileRef => {
            if (fileRef.fileName.split('.')[0].toLowerCase() === newFileName.toLowerCase()) version ++})

        if (newFileName !== file.fileName.split('.')[0] && newFileName.length > 0) {
            const newFile = {
                ...file,
                fileName: newFileName + '.' + file.fileName.split('.')[1],
                version: version
            }
            const newFileObj = {
                ...fileObj,
                fileName: newFileName + '.' + file.fileName.split('.')[1],
                fileId: file.fileId,
                version: version
            }
            renameFileFunction({newFileRef: newFile, newFileInst: newFileObj})
            setNewFileName(version > 0 ? newFileName + ` (${version})` + '.' + file.fileName.split('.')[1] : newFileName + '.' + file.fileName.split('.')[1])
        }
    }

    const renameAndMove = () => {
        let version = 0
        userInst.fileRefs.forEach(fileRef => {
        if (fileRef.fileName.split('.')[0].toLowerCase() === newFileName.toLowerCase()) version ++})
        try {
            if (destination.id !== null) {

                //create a new file instance with the modified name and flag
                console.log('In the destination !== null check')
                const newFile = {
                    ...file,
                    flag: destination.id,
                    fileName: newFileName + '.' + file.fileName.split('.')[1],
                    version: version
                }
                const newFileObj = {
                    ...fileObj,
                    fileName: newFileName + '.' + file.fileName.split('.')[1],
                    fileId: file.fileId,
                    version: version
                }
                renameFileFunction({newFileRef: newFile, newFileInst: newFileObj})
                setNewFileName(version > 0 ? newFileName + ` (${version})` + '.' + file.fileName.split('.')[1] : newFileName + '.' + file.fileName.split('.')[1])

                focus(false)
                setDestination({id: null, fileName: null, nestedUnder: null})
                setMoveFile(false)
                /* handleFileMove(newFile) */
                toast.show(`Moved file to ${destination.fileName} and renamed it`, {
                    type: 'success'
                })
            } else if (destination.id === null && focusedFolder !== null && focusedFolder !== undefined) {

                //create a new file instance with the modified name and flag
                console.log('in the destination does equal null check')
                const folderInst = folders.filter(folder => folder.id === focusedFolder)
                const newFile = {
                    ...file,
                    flag: folderInst[0].id,
                    fileName: newFileName + '.' + file.fileName.split('.')[1],
                    version: version
                }
                const newFileObj = {
                    ...fileObj,
                    fileName: newFileName + '.' + file.fileName.split('.')[1],
                    fileId: file.fileId,
                    version: version
                }
                renameFileFunction({newFileRef: newFile, newFileInst: newFileObj})
                setNewFileName(version > 0 ? newFileName + ` (${version})` + '.' + file.fileName.split('.')[1] : newFileName + '.' + file.fileName.split('.')[1])
                focus(false)
                setDestination({id: null, fileName: null, nestedUnder: null})
                setMoveFile(false)
                /* handleFileMove(newFile) */
                toast.show(`Moved file to ${folderInst[0].fileName} and renamed it`, {
                    type: 'success'
                })
            }
        } catch (err) {
            alert(err)
        }
    }

    //move a file by changing its flag property
    const handleMove = () => {
        if (destination.id !== null) {
            console.log('In the destination !== null check')
            const newFile = {
                ...file,
                flag: destination.id,
                fileName: newFileName ? newFileName : file.fileName
            }
            focus(false)
            setDestination({id: null, fileName: null, nestedUnder: null})
            setMoveFile(false)
            handleFileMove(newFile)
            toast.show(`Moved file to ${destination.fileName}`, {
                type: 'success'
            })
        } else if (destination.id === null && focusedFolder !== null && focusedFolder !== undefined) {
            console.log('in the destination does equal null check')
            const folderInst = folders.filter(folder => folder.id === focusedFolder)
            const newFile = {
                ...file,
                flag: folderInst[0].id,
                fileName: newFileName ? newFileName + '.' + file.fileName.split('.')[1] : file.fileName
            }
            focus(false)
            setDestination({id: null, fileName: null, nestedUnder: null})
            setMoveFile(false)
            handleFileMove(newFile)
            toast.show(`Moved file to ${folderInst[0].fileName}`, {
                type: 'success'
            })
        }
    }

    //call download async method on url passed from firebase storage bucket
    const downloadFileFunction = async () => {
        const fileName = file.fileName
        const result = await FileSystem.downloadAsync(fileURL, FileSystem.documentDirectory + fileName)
        save(result.uri)
    }
    
    //save the file by opening up the share menu
    const save = (uri) => {
        shareAsync(uri)
    }  

    //load in the sound, set callback function interval to 10 mills, and check the finished status
    //play sound and set playing status to true
    async function playSound() {
        setPlaying(true)
        const { sound, status } = await Audio.Sound.createAsync({uri: fileURL}, 10, (status) => {if(status.didJustFinish) {
            //reset the playback position, set playing to false
            setPlaybackPosition(0) 
            setPlaying(false)}}
        );
        //play the sound from the playback position
        setSound(sound);
        await sound.playFromPositionAsync(playbackPosition, [0, 0]);
    }

    //get status of the sound, check if it's loaded
    //if the sound is playing, pause the sound
    //set the playbackPosition to result.positionMillis, set playing to false
    const pauseSound = async () => {
        setPlaying(false)
        try {
            const result = await sound.getStatusAsync();
            if (result.isLoaded) {
            if (result.isPlaying === true) {
                sound.pauseAsync();
                if (playbackPosition === result.playableDurationMillis) setPlaybackPosition(0)
                else setPlaybackPosition(result.positionMillis)
            }
            }
        } catch (error) {}
    };
    
    const updateNote = async () => {
        
        //get file doc and setup a formatted date
        const fileDoc = await getFile(file.fileId)
        const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss")

        //delete out the old note
        const deleteRef = refFunction(storage, fileObj.uri)
        deleteObject(deleteRef)

        //create a new note and upload it
        const textFile = new Blob([`${noteText}`], {
            type: "text/plain;charset=utf-8",
            });
            const fileUri = `${userInst.uid}/${formattedDate}`
        const fileRef = refFunction(storage, fileUri)
        uploadBytes(fileRef, textFile) 

        //create a new file object
        const newFileObj = {
            ...fileDoc,
            fileId: file.fileId,
            uri: 'gs://elephantapp-21e34.appspot.com' + '/' + userInst.uid + '/' + formattedDate
        }

        //update the file object
        await updateFileObj(newFileObj)

        //create a new fileRef
        const newFileRef = {
            ...file,
            uri: 'gs://elephantapp-21e34.appspot.com' + '/' + userInst.uid + '/' + formattedDate
        }


        //append newFileRef to the user's fileRef array
        //update the user
        const newFileRefs = userInst.fileRefs.map(fileRef => fileRef.fileId === newFileRef.fileId ? newFileRef : fileRef)
        await updateUser({...userInst, fileRefs: newFileRefs})

        setEditNote(false)
    }

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
            setNewFolderName('')
        }
        } else {
        alert('Please enter a folder name')
        }
    }

    const handlePinch = Animated.event([ { nativeEvent: {scale} } ], {useNativeDriver: false})

    return (
        <>
            {fileObj ? 

                <Modal animationType='slide' presentationStyle='pageSheet'>
                    <>
                        
                    {preDelete ? 
                            (   
                                <Modal animationType='slide' presentationStyle='pageSheet'>
                                    <View style={{ paddingTop: '10%', backgroundColor: '#593060', height: '100%', width: '100%'}}>
                                        {/* if the user hits the delete button on a file, open a modal that confirms they want to delete the file*/}
                                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%',     width: '100%'}}>
                                            <TouchableOpacity onPress={() => setPreDelete(false)}>
                                                <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '10%', justifyContent: 'center', alignItems: 'center'}}>
                                        <Text style={{fontSize: 32, color: 'white', textAlign: 'center', paddingLeft: 8, paddingRight: 8, fontWeight: '600', marginBottom: '6%'}}>Are you sure you want to <Text style={{color: 'red'}}>delete</Text> the file:</Text>
                                        <Text style={{fontSize: 18, color: 'white', textAlign: 'center', paddingLeft: 30, paddingRight: 30, fontWeight: '600'}}>{file.fileName}?</Text>
                                        <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', paddingTop: '10%'}}>
                                            {/* button with onPress function to delete the file */}
                                            <TouchableOpacity onPress={() => {
                                                setPreDelete(false)
                                                focus(false)
                                                deleteFile(file.fileId)
                                            }} style={styles.deleteButtonSM}>
                                                <View style={styles.iconHolderSmall}>
                                                    <FontAwesomeIcon icon={faTrash} size={18} color='red' />
                                                </View>
                                                <Text style={{fontSize: 18, color: 'red', fontWeight: '600', marginLeft: '18%'}}>Delete</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => setPreDelete(false)} style={styles.yellowButtonSM}>
                                                <View style={styles.iconHolderSmall}>
                                                    <FontAwesomeIcon icon={faXmark} color='#9F37B0' size={18} />
                                                </View>
                                                <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '18%'}}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>


                                        </View>
                                    </View>
                                </Modal>
                            )
                        :
                        moveFile ? 
                        (
                            <Modal animationType='slide' presentationStyle='pageSheet' >
                                <View style={{height: '100%', width: '100%', backgroundColor: '#593060'}}>
                                    {/* if the moveFile state is true, display the modal with the file movement code*/}
                                    {/* xMark icon for closing out the moveFile modal */}
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%', width: '100%'}}>
                                        <TouchableOpacity onPress={() => {
                                                if (addFolderForm) setAddFolderForm(false)
                                                else {
                                                    setFocusedFolder(null)
                                                    setMoveFile(false)
                                                }
                                            }
                                            }>
                                            <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    {addFolderForm ? 
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
                                                onPress={async () => {
                                                    addFolder(newFolderName, focusedFolder ? focusedFolder : '')
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
                                            <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '10%'}}>Move To...</Text>

                                            <View style={focusedFolder && !subFolders ? {width: '100%', height: '55%', marginBottom: '10%', display: 'flex', justifyContent: 'center'} : {width: '100%', height: '55%', marginBottom: '10%'}}>
                                                    {focusedFolder ? 
                                                        <View style={{paddingLeft: '2%'}}>
                                                            <TouchableOpacity style={styles.yellowButtonXS} onPress={() => {
                                                                try {
                                                                    const folderInst = folders.filter(folder => folder.id === focusedFolder) 
                                                                    const parentFolderInst = folders.filter(folder => folder.id === folderInst[0].nestedUnder)
                                                                    console.log(parentFolderInst)
                                                                    if (parentFolderInst.length > 0) {
                                                                        setDestination({id: parentFolderInst[0].id, fileName: parentFolderInst[0].fileName, nestedUnder: parentFolderInst[0].nestedUnder})
                                                                        setFocusedFolder(folderInst[0].nestedUnder)
                                                                    } else {
                                                                        setDestination({id: null, fileName: null, nestedUnder: null})
                                                                        setFocusedFolder(null)
                                                                    }
                                                                } catch (error) {
                                                                    console.log('this is an error within focusedFile: ', error)
                                                                }
                                                            }}>
                                                                <View style={styles.iconHolderSmall}>
                                                                    <FontAwesomeIcon icon={faArrowLeft} size={18} color='#9F37B0' /> 
                                                                </View>
                                                                <Text style={{fontSize: 20, color: '#9F37B0', fontWeight: '600', marginLeft: '10%'}}>Back</Text>
                                                            </TouchableOpacity>
                                                        </View>
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
                                                                        if (f.id !== file.flag && f.nestedUnder === '') {
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
                                            
                                            {add ?
                                                <>
                                                    <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
                                                        <TouchableOpacity onPress={() => setAddFolderForm(true)} style={styles.yellowButtonSM}>
                                                            <View style={styles.iconHolderSmall}>
                                                                <FontAwesomeIcon icon={faPlus} color='#9F37B0'/>
                                                            </View>
                                                            <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '10%', paddingTop: '1%'}}>Add Folder</Text>
                                                        </TouchableOpacity>    
                                                        <TouchableOpacity onPress={() => {
                                                            renameAndMove()
                                                        }} 
                                                        disabled={destination ? false : true}
                                                        style={destination.id !== null ? styles.yellowButtonSM : styles.yellowButtonSMDim
                                                        }>
                                                            <View style={styles.iconHolderSmall}>
                                                                <FontAwesomeIcon icon={faArrowRight} color='#9F37B0' size={18} />
                                                            </View>
                                                            <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '10%', paddingTop: '1%'}}>Name + Move</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <Text style={{color: '#FFE562', fontSize: 22, marginBottom: 10, marginTop: 10}}>Or</Text>
                                                    <View style={{width: 'full', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                                                        <TouchableOpacity style={styles.yellowButtonMed}
                                                        onPress={() => {
                                                                renameFile()
                                                                setAdd(false)
                                                                setMoveFile(false)
                                                        }}
                                                        >   
                                                            <View style={styles.iconHolderSmall}>
                                                                <FontAwesomeIcon icon={faPencil} color='#9F37B0' size={18} />
                                                            </View>
                                                            <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '8%', paddingTop: '.5%'}}>Name without moving</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </>
                                            :
                                                <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-around'}}>
                                                    
                                                    <TouchableOpacity onPress={() => setAddFolderForm(true)} style={styles.yellowButtonSM}>
                                                        <View style={styles.iconHolderSmall}>
                                                            <FontAwesomeIcon icon={faPlus} color='#9F37B0'/>
                                                        </View>
                                                        <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '10%'}}>Add Folder</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={handleMove} style={styles.yellowButtonSM}>
                                                        <View style={styles.iconHolderSmall}>
                                                            <FontAwesomeIcon icon={faArrowRight} color='#9F37B0'/>
                                                        </View>
                                                        <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '5%'}}>Confirm Move</Text>
                                                    </TouchableOpacity>  
                                                </View>
                                            }


                                        </View>
                                        
                                    }

                                </View>
                            </Modal>
                        )
                        : editNote ?
                            (
                                <Modal animationType='slide' presentationStyle='pageSheet' >
                                    <View style={{height: '100%', width: '100%', backgroundColor: '#593060'}}>
                                        {/* if the moveFile state is true, display the modal with the file movement code*/}
                                        {/* xMark icon for closing out the moveFile modal */}
                                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%', width: '100%'}}>
                                            <Pressable onPress={() => {
                                                    setEditNote(false)
                                                }
                                                }>
                                                <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                                            </Pressable>
                                        </View>
                                        <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '10%'}}>Edit Note:</Text>
                                        <View style={{width: '100%', height: '100%', paddingLeft: '5%', paddingRight: '5%'}}>
                                        <TextInput 
                                            multiline={true}
                                            value={noteText}
                                            style={{
                                                width: '100%',
                                                height: '50%',
                                                backgroundColor: 'white',
                                                fontSize: 20,
                                                textAlignVertical: 'top',
                                                padding: '3%'
                                            }}
                                            onChangeText={(text) => setNoteText(text)}
                                            autoFocus={true}
                                            onFocus={() => setEditingMode(true)}
                                            ref={ref}
                                            />
                                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'}}>
                                                <TouchableOpacity style={styles.yellowButton}
                                                onPress={() => {
                                                    if (editingMode) setEditingMode(false)
                                                    else {
                                                        updateNote()
                                                        toast.show('Note successfully edited', {
                                                            type: 'success'
                                                        })
                                                    }
                                                }}
                                                >
                                                    <View style={styles.iconHolderSmall}>
                                                        <FontAwesomeIcon icon={faCheck} size={18} color='#9F37B0' />
                                                    </View>
                                                    <Text style={editingMode ? {fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '15%', paddingTop: '.5%'} : {fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '25%', paddingTop: '.5%'}}>{editingMode ? 'Finished Editing' : 'Save Note'}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            )
                        :
                            <View style={{ paddingTop: '10%', backgroundColor: '#593060', height: '100%', width: '100%'}}>
                                    
                                    {/*x button container */}
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%'}}>
                                        <Pressable onPress={() => focus(null)}>
                                            <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                                        </Pressable>
                                    </View>
                                    <View>

                                        {/* handle file rename*/}
                                        {add ?  
                                                <View style={{paddingTop: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
                                                    <Text style={{color: 'white', fontSize: 35, fontWeight: '700'}}>Rename File:</Text>
                                                    <View style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center',  marginTop: '10%'}}>
                                                        <View style={styles.iconHolder}>
                                                            <FontAwesomeIcon icon={faFile} size={22} color='#9F37B0'/>
                                                        </View>
                                                        <TextInput style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '70%', marginLeft: '5%'}} onChangeText={(e) => setNewFileName(e)} autoFocus/>
                                                    </View>
                                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: '10%', width: '100%'}}>
                                                        <TouchableOpacity style={styles.yellowButtonSM}
                                                        onPress={() => {
                                                            console.log(newFileName)
                                                            if (newFileName !== file.fileName && newFileName !== '') {
                                                                setMoveFile(true)

                                                            } else setAdd(false)
                                                        }}>
                                                            <View style={styles.iconHolderSmall}>
                                                                <FontAwesomeIcon icon={faFloppyDisk} color='#9F37B0' size={18} />
                                                            </View>
                                                            <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '20%'}}>Save</Text>
                                                        </TouchableOpacity>                                              
                                                        <TouchableOpacity style={styles.yellowButtonSM}
                                                        onPress={() => setAdd(false)}
                                                        >
                                                            <View style={styles.iconHolderSmall}>
                                                                <FontAwesomeIcon icon={faXmark} color='#9F37B0' size={18}/>
                                                            </View>
                                                            <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '20%'}}>Cancel</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>            
                                                : expanded ? 
                                                <Modal animationType='slide' presentationStyle='pageSheet'>
                                                    {/* code to render expanded images */}
                                                    <View style={{ paddingTop: '10%', backgroundColor: '#593060', height: '100%', width: '100%'}}>
                                                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '5%', width: '100%'}}>
                                                            <Pressable onPress={() => setExpanded(false)}>
                                                                <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                                                            </Pressable>
                                                        </View>
                                                        <View style={{height: '60%', marginTop: '20%'}}>
                                                            <PinchGestureHandler onGestureEvent={handlePinch}>
                                                                <Animated.Image source={{uri: `${fileURL}`}} style={{width: '100%', height: '100%', objectFit: 'contain', transform: [{ scale }]}}/>
                                                            </PinchGestureHandler>
                                                        </View>
                                                    </View>
                                                </Modal>

                                                :
                                                    <>
                                                        <Text style={{fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: '5%', paddingLeft: '5%'}} numberOfLines={3}>{newFileName}</Text>

                                                        {((file.fileName.split('.')[1] === 'jpg' || file.fileName.split('.')[1] === 'png' || file.fileName.split('.')[1] === 'JPG' || file.fileName.split('.')[1] === 'PNG' || file.fileName.split('.')[1] === 'jpeg' || file.fileName.split('.')[1] === 'JPEG')) ? 
                                                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '10%', marginBottom: '10%'}}>
                                                                {fileURL ? 
                                                                    <Pressable width={300} height={150} onPress={() => setExpanded(true)}>
                                                                        <Image source={{uri: `${fileURL}`}} style={{width: '100%', height: '100%', objectFit: 'contain'}}/>
                                                                    </Pressable>
                                                                : 
                                                                    <View style={{height: 150}}>
                                                                        <FontAwesomeIcon icon={faImage} color='white' size={125}/>
                                                                        <Text style={{color: 'white', textAlign: 'center', marginTop: 15, fontSize: 10}}>Fetching Image...</Text>
                                                                    </View>
                                                                }
                                                            </View>
                                                        :(file.fileName.split('.')[1] === 'mp4' || file.fileName.split('.')[1] === 'mov') ? 
                                                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '10%', marginBottom: '10%', height: 200, width: 340, width: '100%', backgroundColor: 'black'}}>
                                                                {fileURL ? 
                                                                    <Video style={{flex: 1, alignSelf: 'stretch', height: '100%'}} source={{uri: `${fileURL}`}} useNativeControls resizeMode ='contain' isLooping onError={(error) => alert(error)}/>
                                                                : 
                                                                    <View style={{height: 150}}>
                                                                        <FontAwesomeIcon icon={faImage} color='white' size={125}/>
                                                                            <Text style={{color: 'white', textAlign: 'center', marginTop: 15, fontSize: 10}}>Fetching Video...</Text>
                                                                    </View>
                                                                }
                                                            </View>
                                                        : <></>
                                                        }
                                                        <View style={{width: '100%', marginTop: '5%'}}>
                                                            
                                                            <View style={styles.renameMoveButtonContainer}>
                                                                <TouchableOpacity style={styles.moveRenameButtons} onPress={() => setAdd(true)}>
                                                                    <View style={styles.iconHolderSmall}>
                                                                        <FontAwesomeIcon icon={faFont} color='black' size={20}/>
                                                                    </View>
                                                                    <Text style={{fontSize: 18, color: 'black', fontWeight: '600', marginLeft: 14, paddingTop: '.5%'}}>Rename file</Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity style={styles.moveRenameButtons} onPress={() => setMoveFile(true)}>
                                                                    <View style={styles.iconHolderSmall}>
                                                                        <FontAwesomeIcon icon={faFolder} color='black' size={20}/>
                                                                    </View>
                                                                    <Text style={{fontSize: 18, color: 'black', fontWeight: '600', marginLeft: 14, paddingTop: '.5%'}}>Move file...</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                            
                                                        </View>
                                                        <View style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10%'}}>
                                                            {/* button that links to a non jpg or png file */}
                                                            {(file.fileName.split('.')[1] !== 'jpg' && file.fileName.split('.')[1] !== 'png' && file.fileName.split('.')[1] !== 'PNG' && file.fileName.split('.')[1] !== 'JPG' && file.fileName.split('.')[1] !== 'jpeg' && file.fileName.split('.')[1] !== 'JPEG') ? 
                                                                <>  
                                                                    {file.fileName.includes('URL for:') ?    
                                                                        <TouchableOpacity style={styles.yellowButton}
                                                                        disabled={fileURL ? false : true}
                                                                        onPress={() => Linking.openURL(navigateURL)}
                                                                        >
                                                                            <View style={styles.iconHolder}>
                                                                                {fileURL ? <FontAwesomeIcon icon={faArrowUpRightFromSquare} size={22} style={{marginTop: '2%'}} color='#9F37B0'/> : <></>}
                                                                            </View>
                                                                            <Text style={{fontSize: 22, color: '#9F37B0', fontWeight: '600'}}>Go To URL</Text>
                                                                        </TouchableOpacity>
                                                                    : fileObj.documentType === 'm4a' || fileObj.documentType === 'mp3' ? 
                                                                        <TouchableOpacity style={styles.yellowButton}
                                                                        disabled={fileURL ? false : true}
                                                                        onPress={() => {
                                                                            if (!playing) playSound()
                                                                            else pauseSound()
                                                                        }}
                                                                        >
                                                                            <View style={styles.iconHolder}>
                                                                                {fileURL ? <FontAwesomeIcon icon={playing ? faPause : faPlay} size={22} color='#9F37B0' style={{marginTop: '2%'}}/> : <></>}
                                                                            </View>
                                                                            <Text style={{fontSize: 22, color: '#9F37B0', fontWeight: '600', paddingLeft: '18%', paddingTop: '2%'}}>{fileURL && !playing ? 'Play Sound' : fileURL && playing ? 'Pause Sound' : 'Fetching File...'}</Text>
                                                                        </TouchableOpacity>
                                                                    : fileObj.documentType === 'txt' ?    
                                                                        <TouchableOpacity style={styles.yellowButton}
                                                                        disabled={fileURL ? false : true}
                                                                        onPress={() => setEditNote(true)}
                                                                        >   
                                                                            <View style={styles.iconHolder}>
                                                                                <FontAwesomeIcon icon={faPencil} color='#9F37B0' size={22}/>
                                                                            </View>
                                                                            <Text style={{fontSize: 22, color: '#9F37B0', fontWeight: '600', marginLeft: '22%', paddingTop: '1.5%'}}>Edit Note</Text>
                                                                        </TouchableOpacity>
                                                                        :
                                                                        <></>}
                                                                        <TouchableOpacity style={styles.yellowButton}
                                                                        disabled={fileURL ? false : true}
                                                                        onPress={() => Linking.openURL(fileURL)}
                                                                        >   
                                                                            <View style={styles.iconHolder}>
                                                                                {fileURL ? <FontAwesomeIcon icon={faArrowUpRightFromSquare} size={22} color='#9F37B0'/> : <></>}
                                                                            </View>
                                                                            <Text style={{fontSize: 22, color: '#9F37B0', fontWeight: '600', paddingTop: '2%', marginLeft: 16}}>{fileURL ? 'View File In Browser' : 'Fetching File...'}</Text>
                                                                        </TouchableOpacity>
                                                                    
                                                                </>

                                                            : 
                                                                <></>
                                                            }                       
                                                            <TouchableOpacity style={styles.yellowButton}
                                                            onPress={downloadFileFunction}
                                                            >   
                                                                <View style={styles.iconHolder}>
                                                                    <FontAwesomeIcon icon={faShare} color='#9F37B0' size={22}/>
                                                                </View>
                                                                <Text style={{fontSize: 22, color: '#9F37B0', fontWeight: '600', marginLeft: 16, paddingTop: '1.5%'}}>Download or share file</Text>
                                                            </TouchableOpacity>
                                                        
                                                            <TouchableOpacity style={styles.deleteButton} onPress={() =>
                                                                setPreDelete(true)}>
                                                                <View style={styles.iconHolder}>
                                                                    <FontAwesomeIcon icon={faTrash} color='red' size={22}/>
                                                                </View>
                                                                <Text style={{fontSize: 22, color: 'red', fontWeight: '600', paddingLeft: '22%', paddingTop: '2%'}}>Delete File</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </>
                                                }
                                    </View>
                            </View>
                        }
                    </>
                </Modal>
                
            : <></>}
                    
        </>
    )

   
}

const styles = StyleSheet.create({
    renameMoveButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
    },
    moveRenameButtons: {
        backgroundColor: '#DDCADB', 
        paddingLeft: 4,
        paddingTop: 4,
        paddingBottom: 4, 
        paddingRight: 20, 
        borderRadius: 100,
        display: 'flex',
        flexDirection: 'row'
    },
    yellowButton: {
        backgroundColor: '#FFE562',
        paddingLeft: 6,
        paddingTop: 6,
        paddingBottom: 6,
        paddingRight: 20,
        borderRadius: 100,
        display: 'flex',
        flexDirection: 'row',
        width: '80%',
        marginTop: '2%'
    },
    yellowButtonMed: {
        backgroundColor: '#FFE562',
        paddingLeft: 6,
        paddingTop: 6,
        paddingBottom: 6,
        paddingRight: 20,
        borderRadius: 100,
        display: 'flex',
        flexDirection: 'row',
        width: '70%',
    },
    yellowButtonSM: {
        backgroundColor: '#FFE562',
        paddingLeft: 6,
        paddingTop: 6,
        paddingBottom: 6,
        paddingRight: 20,
        borderRadius: 100,
        display: 'flex',
        flexDirection: 'row',
        width: '45%',
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
        marginLeft: '5%'
    },
    yellowButtonSMDim: {
        backgroundColor: '#FFE562',
        paddingLeft: 6,
        paddingTop: 6,
        paddingBottom: 6,
        paddingRight: 20,
        borderRadius: 100,
        display: 'flex',
        flexDirection: 'row',
        width: '45%',
        opacity: .5
    },
    deleteButton: {
        backgroundColor: '#BCBCBC',
        paddingLeft: 6,
        paddingTop: 6,
        paddingBottom: 6,
        paddingRight: 20,
        borderRadius: 100,
        display: 'flex',
        flexDirection: 'row',
        width: '80%',
        marginTop: '2%'
    },
    deleteButtonSM: {
        backgroundColor: '#BCBCBC',
        paddingLeft: 6,
        paddingTop: 6,
        paddingBottom: 6,
        paddingRight: 20,
        borderRadius: 100,
        width: '45%',
        display: 'flex',
        flexDirection: 'row',
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

export default FocusedFileComp