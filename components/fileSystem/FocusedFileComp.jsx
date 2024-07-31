import { View, Text, Modal, TouchableOpacity, Pressable, TextInput, ScrollView, Keyboard, Image, Linking} from 'react-native'
import React, {useEffect, useState, useRef} from 'react'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark, faFile, faFolder, faArrowUpRightFromSquare, faImage, faPlay, faPause, faArrowLeft } from '@fortawesome/free-solid-svg-icons'

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

    const ref = useRef()

    const auth = firebaseAuth

    //get the current user 
    useEffect(() => {
        if (auth) {
            try {
                const getCurrentUser = async () => {
                const unsubscribe = await userListener(setUserInst, false, auth.currentUser.uid)
            
                return () => unsubscribe()
                }
                getCurrentUser()
            } catch (err) {console.log(err)}
        } else console.log('no user yet')
        
    }, [auth, addFolderForm])

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
                    useToast.show(`Moved file to ${destination.fileName} and renamed it`, {
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
                    useToast.show(`Moved file to ${folderInst[0].fileName} and renamed it`, {
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
                useToast.show(`Moved file to ${destination.fileName}`, {
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
                useToast.show(`Moved file to ${folderInst[0].fileName}`, {
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

        console.log(useToast)

    return (
        <>
            {fileObj ? 

                <Modal animationType='slide' presentationStyle='pageSheet'>
                    <>
                        
                    {preDelete ? 
                            (   
                                <Modal animationType='slide' presentationStyle='pageSheet'>
                                    <View style={{ paddingTop: '10%', backgroundColor: 'rgb(23 23 23)', height: '100%', width: '100%'}}>
                                        {/* if the user hits the delete button on a file, open a modal that confirms they want to delete the file*/}
                                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%',     width: '100%'}}>
                                            <Pressable onPress={() => setPreDelete(false)}>
                                            <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                                            </Pressable>
                                        </View>
                                        <View style={{width: '100%', height: '95%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                        <Text style={{fontSize: 22, color: 'white', textAlign: 'center'}}>Are you sure you want to delete {file.fileName}?</Text>

                                        {/* button with onPress function to delete the file */}
                                        <View style={{width: '50%',
                                                borderRadius: 25,
                                                backgroundColor: 'red',
                                                paddingTop: '2%',
                                                paddingBottom: '2%',
                                                marginTop: '10%',
                                                marginLeft: '2%'}}>
                                            <TouchableOpacity onPress={() => {
                                                setPreDelete(false)
                                                focus(false)
                                                deleteFile(file.fileId)
                                            }} style={{
                                            display: 'flex', 
                                            flexDirection: 'row', 
                                            width: '100%', 
                                            justifyContent: 'center',
                                            }}>
                                                <Text style={{fontSize: 15, color: 'white', fontWeight: '600'}}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{width: '50%',
                                            borderColor: '#777',
                                            borderRadius: 25,
                                            backgroundColor: 'white',
                                            borderWidth: 1,
                                            paddingTop: '2%',
                                            paddingBottom: '2%',
                                            marginTop: '7%',
                                            marginBottom: '10%',
                                            marginLeft: '2%'}}>
                                            <TouchableOpacity onPress={() => setPreDelete(false)} style={{
                                            display: 'flex', 
                                            flexDirection: 'row', 
                                            width: '100%', 
                                            justifyContent: 'center',
                                            }}>
                                                <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Cancel</Text>
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
                                <View style={{height: '100%', width: '100%', backgroundColor: 'rgb(23 23 23)'}}>
                                    {/* if the moveFile state is true, display the modal with the file movement code*/}
                                    {/* xMark icon for closing out the moveFile modal */}
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '10%', width: '100%'}}>
                                        <Pressable onPress={() => {
                                                if (addFolderForm) setAddFolderForm(false)
                                                else {
                                                    setFocusedFolder(null)
                                                    setMoveFile(false)
                                                }
                                            }
                                            }>
                                            <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                                        </Pressable>
                                    </View>
                                    
                                    {addFolderForm ? 
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
                                                        onPress={async () => {
                                                            addFolder(newFolderName, focusedFolder ? focusedFolder : '')
                                                        }}
                                                        >
                                                            <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Save</Text>
                                                        </TouchableOpacity>
                                                </View>
                                            </View>
                                        </>

                                    :

                                        <View style={{width: '100%', height: '95%', flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                            <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '10%'}}>Move To...</Text>

                                            <View style={focusedFolder && !subFolders ? {width: '100%', height: '50%', marginBottom: '10%', display: 'flex', justifyContent: 'center'} : {width: '100%', height: '50%', marginBottom: '10%'}}>
                                                    {focusedFolder ? 
                                                        <>
                                                            <TouchableOpacity style={{display: 'flex', flexDirection: 'row', marginLeft: '5%', marginTop: '5%'}} onPress={() => {
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
                                                                        if (f.id !== file.flag && f.nestedUnder === '') {
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
                                            
                                            {add ?
                                                <>
                                                    <View style={{width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10}}>
                                                        <View style={{width: '40%',
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
                                                                <Text style={{fontSize: 10, color: 'black', fontWeight: '600'}}>Add New Folder</Text>
                                                            </TouchableOpacity>
                                                        </View>

                                                        <View style={destination.id !== null ? {width: '40%',
                                                            borderColor: '#777',
                                                            borderRadius: 25,
                                                            backgroundColor: 'white',
                                                            borderWidth: 1,
                                                            paddingTop: '2%',
                                                            paddingBottom: '2%',
                                                            marginBottom: '10%',
                                                            marginLeft: '2%'} :

                                                            {width: '40%',
                                                            borderColor: '#777',
                                                            borderRadius: 25,
                                                            backgroundColor: 'rgba(255, 255, 255, .5)',
                                                            borderWidth: 1,
                                                            paddingTop: '2%',
                                                            paddingBottom: '2%',
                                                            marginBottom: '10%',
                                                            marginLeft: '2%',
                                                            }
                                                            }>
                                                            <TouchableOpacity onPress={() => {
                                                                renameAndMove()
                                                            }} 
                                                            disabled={destination ? false : true}
                                                            style={{
                                                            display: 'flex', 
                                                            flexDirection: 'row', 
                                                            width: '100%', 
                                                            justifyContent: 'center',
                                                            }}>
                                                                <Text style={{fontSize: 10, color: 'black', fontWeight: '600'}}>Rename and Move</Text>
                                                            </TouchableOpacity>
                                                        </View> 
                                                    </View>
                                                    <Text style={{color: 'white', fontSize: 10, marginBottom: 10}}>Or</Text>
                                                    <View style={{width: 'full', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                                                        <View style={{width: '40%',
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
                                                                        renameFile()
                                                                        setAdd(false)
                                                                        setMoveFile(false)
                                                                }}
                                                                >
                                                                    <Text style={{fontSize: 10, color: 'black', fontWeight: '600'}}>Rename without moving</Text>
                                                                </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </>
                                            :
                                                <>
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

                                                    <View style={{width: '50%',
                                                        borderColor: '#777',
                                                        borderRadius: 25,
                                                        backgroundColor: 'white',
                                                        borderWidth: 1,
                                                        paddingTop: '2%',
                                                        paddingBottom: '2%',
                                                        marginBottom: '10%',
                                                        marginLeft: '2%'}}>
                                                        <TouchableOpacity onPress={handleMove} style={{
                                                        display: 'flex', 
                                                        flexDirection: 'row', 
                                                        width: '100%', 
                                                        justifyContent: 'center',
                                                        }}>
                                                            <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Confirm Move</Text>
                                                        </TouchableOpacity>
                                                    </View>   
                                                </>
                                            }


                                        </View>
                                        
                                    }

                                </View>
                            </Modal>
                        )
                        : editNote ?
                            (
                                <Modal animationType='slide' presentationStyle='pageSheet' >
                                    <View style={{height: '100%', width: '100%', backgroundColor: 'rgb(23 23 23)'}}>
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
                                                <View style={{width: '70%',
                                                        borderColor: '#777',
                                                        borderRadius: 25,
                                                        backgroundColor: 'white',
                                                        borderWidth: 1,
                                                        paddingTop: '2%',
                                                        paddingBottom: '2%',
                                                        marginLeft: '2%',
                                                        paddingLeft: '2%',
                                                        paddingRight: '3%'}}>
                                                        <TouchableOpacity style={{
                                                        display: 'flex', 
                                                        flexDirection: 'row', 
                                                        width: '100%', 
                                                        justifyContent: 'space-around',

                                                        }}
                                                        onPress={() => {
                                                            if (editingMode) setEditingMode(false)
                                                            else {
                                                                updateNote()
                                                                useToast.show('Note successfully edited', {
                                                                    type: 'success'
                                                                })
                                                            }
                                                        }}
                                                        >
                                                            <Text style={{fontSize: 20, color: 'black', fontWeight: '600'}}>{editingMode ? 'Finished Editing' : 'Save Note'}</Text>
                                                        </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </Modal>
                            )
                        :
                            <View style={{ paddingTop: '10%', backgroundColor: 'rgb(23 23 23)', height: '100%', width: '100%'}}>
                                    
                                    {/*x button container */}
                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%'}}>
                                    <Pressable onPress={() => focus(null)}>
                                        <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                                    </Pressable>
                                    </View>
                                    <View style={{paddingLeft: '5%'}}>

                                    {/* handle file rename*/}
                                    {add ?  
                                            <View style={{paddingTop: '25%'}}>
                                                <Text style={{color: 'white', fontSize: 35, fontWeight: '700'}}>Rename File:</Text>
                                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',  marginTop: '10%'}}>
                                                    <FontAwesomeIcon icon={faFile} size={30} color='white'/>
                                                    <TextInput style={{color: 'white', fontSize: 20, fontWeight: 'bold', borderBottomColor: 'white', borderBottomWidth: 2, width: '70%', marginRight: '15%'}} onChangeText={(e) => setNewFileName(e)} autoFocus/>
                                                </View>
                                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', paddingRight: '5%', marginTop: '10%'}}>
                                                    <View style={{width: '40%',
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
                                                                if (newFileName !== file.fileName.split('.')[0] && newFileName !== '') {
                                                                    setMoveFile(true)
                                                                    /* renameFile()
                                                                    setAdd(false) */
                                                                } else setAdd(false)
                                                            }}
                                                            >
                                                                <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Save</Text>
                                                            </TouchableOpacity>
                                                    </View>
                                                    <View style={{width: '40%',
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
                                                            onPress={() => setAdd(false)}
                                                            >
                                                                <Text style={{fontSize: 15, color: 'black', fontWeight: '600'}}>Cancel</Text>
                                                            </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>            
                                            : expanded ? 
                                            <Modal animationType='slide' presentationStyle='pageSheet'>
                                                {/* code to render expanded images */}
                                                <View style={{ paddingTop: '10%', backgroundColor: 'rgb(23 23 23)', height: '100%', width: '100%'}}>
                                                    <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', paddingRight: '5%', paddingTop: '5%', width: '100%'}}>
                                                        <Pressable onPress={() => setExpanded(false)}>
                                                            <FontAwesomeIcon icon={faXmark} color={'white'} size={30}/>
                                                        </Pressable>
                                                    </View>
                                                    <View style={{height: '60%', marginTop: '20%'}}>
                                                        <Image source={{uri: `${fileURL}`}} style={{width: '100%', height: '100%', objectFit: 'contain'}}/>
                                                    </View>
                                                </View>
                                            </Modal>

                                            :
                                                <>
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
                                                        <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '10%', marginBottom: '10%', height: 200, width: 340}}>
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
                                                    <View style={(file.fileName.split('.')[1] === 'mp4' || file.fileName.split('.')[1] === 'mov') ? {height: '37%', width: '90%'} : (file.fileName.includes('URL for') || file.fileName.split('.')[1] === 'm4a' || file.fileName.split('.')[1] === 'mp3') ? {height: '67%', width: '90%'} : (file.fileName.split('.')[1] !== 'jpg' && file.fileName.split('.')[1] !== 'png' && file.fileName.split('.')[1] !== 'PNG' && file.fileName.split('.')[1] !== 'JPG' && file.fileName.split('.')[1] !== 'jpeg' && file.fileName.split('.')[1] !== 'JPEG') ? {height: '72.5%', width: '90%', marginTop: '5%'} : {height: '40%', width: '90%'}}>
                                                        
                                                        <Text style={{fontSize: 22, fontWeight: 'bold', color: 'white', marginTop: '5%'}} numberOfLines={3}>{newFileName}</Text>

                                                        <TouchableOpacity style={{ marginTop: '10%'}} onPress={() => setAdd(true)}>
                                                            <Text style={{fontSize: 18, color: 'white'}}>Rename File</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={{ marginTop: '10%'}} onPress={() => setMoveFile(true)}>
                                                            <Text style={{fontSize: 18, color: 'white'}}>Move File To...</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity style={{ marginTop: '10%'}} onPress={() =>
                                                            setPreDelete(true)}>
                                                            <Text style={{fontSize: 18, color: 'red'}}>Delete File</Text>
                                                        </TouchableOpacity>
                                                    </View>

                                                    {/* button that links to a non jpg or png file */}
                                                    {(file.fileName.split('.')[1] !== 'jpg' && file.fileName.split('.')[1] !== 'png' && file.fileName.split('.')[1] !== 'PNG' && file.fileName.split('.')[1] !== 'JPG' && file.fileName.split('.')[1] !== 'jpeg' && file.fileName.split('.')[1] !== 'JPEG') ? 
                                                        <>  
                                                            {file.fileName.includes('URL for:') 
                                                                ? 
                                                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                                                                <View style={{width: '70%',
                                                                        borderColor: '#777',
                                                                        borderRadius: 25,
                                                                        backgroundColor: 'white',
                                                                        borderWidth: 1,
                                                                        paddingTop: '2%',
                                                                        paddingBottom: '2%',
                                                                        marginLeft: '2%',
                                                                        paddingLeft: '2%',
                                                                        paddingRight: '3%'}}>
                                                                        <TouchableOpacity style={{
                                                                        display: 'flex', 
                                                                        flexDirection: 'row', 
                                                                        width: '100%', 
                                                                        justifyContent: 'space-around',
                                                                        paddingLeft: '20%',
                                                                        paddingRight: '20%'
                                                                        }}
                                                                        disabled={fileURL ? false : true}
                                                                        onPress={() => Linking.openURL(navigateURL)}
                                                                        >
                                                                            <Text style={{fontSize: 20, color: 'black', fontWeight: '600'}}>Go To URL</Text>
                                                                            {fileURL ? <FontAwesomeIcon icon={faArrowUpRightFromSquare} size={20} style={{marginTop: '1%'}}/> : <></>}
                                                                        </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                            : fileObj.documentType === 'm4a' || fileObj.documentType === 'mp3' ? 
                                                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'}}>
                                                                    <View style={{width: '70%',
                                                                            borderColor: '#777',
                                                                            borderRadius: 25,
                                                                            backgroundColor: 'white',
                                                                            borderWidth: 1,
                                                                            paddingTop: '2%',
                                                                            paddingBottom: '2%',
                                                                            marginLeft: '2%',
                                                                            paddingLeft: '12%',
                                                                            paddingRight: '12%'}}>
                                                                            <TouchableOpacity style={{
                                                                            display: 'flex', 
                                                                            flexDirection: 'row', 
                                                                            width: '100%', 
                                                                            justifyContent: 'space-around',

                                                                            }}
                                                                            disabled={fileURL ? false : true}
                                                                            onPress={() => {
                                                                                if (!playing) playSound()
                                                                                else pauseSound()
                                                                            }}
                                                                            >
                                                                                <Text style={{fontSize: 20, color: 'black', fontWeight: '600'}}>{fileURL && !playing ? 'Play Sound' : fileURL && playing ? 'Pause Sound' : 'Fetching File...'}</Text>
                                                                                {fileURL ? <FontAwesomeIcon icon={playing ? faPause : faPlay} size={20} style={{marginTop: '1%'}}/> : <></>}
                                                                            </TouchableOpacity>
                                                                    </View>
                                                                </View>
                                                            : fileObj.documentType === 'txt' ?
                                                                <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'}}>
                                                                    <View style={{width: '70%',
                                                                            borderColor: '#777',
                                                                            borderRadius: 25,
                                                                            backgroundColor: 'white',
                                                                            borderWidth: 1,
                                                                            paddingTop: '2%',
                                                                            paddingBottom: '2%',
                                                                            marginLeft: '2%',
                                                                            paddingLeft: '12%',
                                                                            paddingRight: '12%'}}>
                                                                            <TouchableOpacity style={{
                                                                            display: 'flex', 
                                                                            flexDirection: 'row', 
                                                                            width: '100%', 
                                                                            justifyContent: 'space-around',

                                                                            }}
                                                                            disabled={fileURL ? false : true}
                                                                            onPress={() => setEditNote(true)}
                                                                            >
                                                                                <Text style={{fontSize: 20, color: 'black', fontWeight: '600'}}>Edit Note</Text>
                                                                            </TouchableOpacity>
                                                                    </View>
                                                                </View>
                                                                :
                                                                <></>}
                                                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'}}>
                                                                <View style={{width: '70%',
                                                                        borderColor: '#777',
                                                                        borderRadius: 25,
                                                                        backgroundColor: 'white',
                                                                        borderWidth: 1,
                                                                        paddingTop: '2%',
                                                                        paddingBottom: '2%',
                                                                        marginLeft: '2%',
                                                                        paddingLeft: '2%',
                                                                        paddingRight: '3%'}}>
                                                                        <TouchableOpacity style={{
                                                                        display: 'flex', 
                                                                        flexDirection: 'row', 
                                                                        width: '100%', 
                                                                        justifyContent: 'space-around',

                                                                        }}
                                                                        disabled={fileURL ? false : true}
                                                                        onPress={() => Linking.openURL(fileURL)}
                                                                        >
                                                                            <Text style={{fontSize: 20, color: 'black', fontWeight: '600'}}>{fileURL ? 'View File In Browser' : 'Fetching File...'}</Text>
                                                                            {fileURL ? <FontAwesomeIcon icon={faArrowUpRightFromSquare} size={20} style={{marginTop: '1%'}}/> : <></>}
                                                                        </TouchableOpacity>
                                                                </View>
                                                            </View>
                                                        </>
                                                    : <></>}


                                                    {/* button for downloading the file on the phones storage */}
                                                    <View style={(file.fileName.split('.')[1] !== 'jpg' && file.fileName.split('.')[1] !== 'png' && file.fileName.split('.')[1] !== 'jpg' && file.fileName.split('.')[1] !== 'png' && file.fileName.split('.')[1] !== 'PNG' && file.fileName.split('.')[1] !== 'JPG' && file.fileName.split('.')[1] !== 'jpeg' && file.fileName.split('.')[1] !== 'JPEG') ? {display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '5%'} : {display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '25%'}}>
                                                        <View style={{width: '70%',
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
                                                                onPress={downloadFileFunction}
                                                                >
                                                                    <Text style={{fontSize: 20, color: 'black', fontWeight: '600'}}>Download Or Share File</Text>
                                                                </TouchableOpacity>
                                                        </View>
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
export default FocusedFileComp