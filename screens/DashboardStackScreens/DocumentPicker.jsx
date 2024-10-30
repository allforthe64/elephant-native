import React, {useState, useEffect} from 'react'
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, TextInput, Image} from 'react-native'

//FileRow component import
import FileRow from '../../components/documentPicker/FileRow'

import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'


import { addfile, updateUser, userListener } from '../../firebase/firestore'
import { firebaseAuth, storage } from '../../firebaseConfig'
import {ref, uploadBytesResumable} from 'firebase/storage'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faFolder, faXmark, faArrowLeft, faFile, faImage, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'

//safe area context import
import { useSafeAreaInsets } from 'react-native-safe-area-context'

//useToast import
import { useToast } from 'react-native-toast-notifications'

//date format import
import { format } from 'date-fns'

//import ImageManipulator object from expo
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const DocumentPickerComp = () => {

    const [files, setFiles] = useState([])
    const [userInst, setUserInst] = useState()
    const [loading, setLoading] = useState(false)
    const [preAdd, setPreAdd] = useState(false)
    const [addFolderForm, setAddFolderForm] = useState(false)
    const [focusedFolder, setFocusedFolder] = useState()
    const [subFolders, setSubFolders] = useState()
    const [folders, setFolders] = useState([])
    const [newFolderName, setNewFolderName] = useState('')
    const [destination, setDestination] = useState({id: null, fileName: null, nestedUnder: null})

    const currentUser = firebaseAuth.currentUser.uid
    const auth = firebaseAuth
    const toast = useToast()

    //get the current user 
    useEffect(() => {
        if (auth) {
        try {
            const getCurrentUser = async () => {
            const unsubscribe = await userListener(setUserInst, false, currentUser)
        
            return () => unsubscribe()
            }
            getCurrentUser()
        } catch (err) {console.log(err)}
        } else console.log('no user yet')
        
    }, [auth])

    //set folders 
    useEffect(() => {
        if(userInst)
        setFolders(userInst.files)
    }, [userInst, addFolderForm])

    //determine if a folder has any subfolders
    useEffect(() => {
        const exists = Object.values(folders).some((value) => {
            return value.nestedUnder === focusedFolder
        })
        setSubFolders(exists)
    }, [focusedFolder, addFolderForm])

    const selectFile = async () => {
        let updatedFiles = [...files]
        try {
            const files = await DocumentPicker.getDocumentAsync({copyToCacheDirectory: false, multiple: true})

            //map over incoming files and push them all into the file arr
            files.assets.map(file => /* console.log(file) */updatedFiles.push({name: file.name, uri: file.uri, size: file.size, fileType: file.name.split('.')[1]}))
            setFiles(updatedFiles)
        } catch (err) {
            console.log(err)
        }
        
    }

    const selectImage = async () => {
        let updatedFiles = [...files]
        // No permissions request is necessary for launching the image library
        let img = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          aspect: [4, 3],
          quality: 1,
        });
        

        const fileName = img.assets[0].uri.substring(img.assets[0].uri.lastIndexOf('/') + 1, img.assets[0].uri.length)

        updatedFiles.push({name: fileName, uri: img.assets[0].uri, fileType: fileName.split('.')[1]})
        setFiles(updatedFiles)

    };

    const renderFiles = () => {
        return files.map((file, index) => {
            return (
                <FileRow file={file} files={files} index={index} key={index} deleteFunc={filterFiles} setFiles={setFiles}/>
            )
        })
    }

    const filterFiles = (input, target) => {

        const arr = []
    
        input.map(el => {
            if (JSON.stringify(el) !== JSON.stringify(target)) arr.push(el)
        })
    
        setFiles(arr)
    }
    
    const saveFiles = async () => {
        
        setLoading(true)
        setPreAdd(false)
        setFiles([])
        let uploadSize = 0

        const references =  await Promise.all(files.map(async (el) => {

            //check for files with the same name and increase the version number
            let versionNo = 0
            userInst.fileRefs.forEach(fileRef => {
                if (fileRef.fileName === el.name && fileRef.fileName.split('.')[1] === el.name.split('.')[1]) {
                    versionNo ++
                }
            })

            //generate formatted date for file name
            const formattedDate = format(new Date(), `yyyy-MM-dd:hh:mm:ss::${Date.now()}`) + `${Math.random().toString(36).slice(2)}`

            let thumbnailFilename
            let thumbnailFileUri
            let thumbnailFileRef
            let thumbnailResult

            if (el.fileType === 'jpg' || el.fileType === 'jpeg' || el.fileType === 'png' || el.fileType === 'JPG' || el.fileType === 'JPEG' || el.fileType === 'PNG') {
                //generate a resized version of the image for thumbnails
                const manipResult = await manipulateAsync(
                    el.uri,
                    [{ resize: {height: 300} }],
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
                thumbnailFilename = `${formattedDate}&thumbnail.jpg`
                thumbnailFileUri = `${currentUser}/${`thumbnail&${formattedDate}`}`
                thumbnailFileRef = ref(storage, `${currentUser}/thumbnail&${formattedDate}`)
                thumbnailResult = await uploadBytesResumable(thumbnailFileRef, thumbNailBlob) 
            }

            //create blob and upload it into firebase storage
            try {
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
                    xhr.open('GET', el.uri, true)
                    xhr.send(null)
                })
                
                let filename
                if (el.name.split('.')[1] === 'doc' || el.name.split('.')[1] === 'docx') {
                    filename = `${formattedDate}^&${currentUser}`
                } else {
                    filename = `${currentUser}/${formattedDate}`
                }
                const fileRef = ref(storage, filename)
                const result = await uploadBytesResumable(fileRef, blob)

                let finalDestination 
                if (destination.id !== null) finalDestination = destination.id
                else if (focusedFolder) finalDestination = focusedFolder 
                else finalDestination = false

                //increase the upload size
                uploadSize += result.metadata.size

                let reference
                if (el.fileType === 'jpg' || el.fileType === 'jpeg' || el.fileType === 'png' || el.fileType === 'JPG' || el.fileType === 'JPEG' || el.fileType === 'PNG') {
                    reference = await addfile({
                        name: el.name,
                        fileType: el.fileType,
                        size: result.metadata.size,
                        user: currentUser,
                        version: 0,
                        timeStamp: `${formattedDate}`
                    }, finalDestination)
                } else {
                    //generate references
                    reference = await addfile({
                        ...el, 
                        name: el.name, 
                        user: currentUser, 
                        size: result.metadata.size, 
                        timeStamp: formattedDate, 
                        version: versionNo}, finalDestination)
                }
                
                return reference

            } catch (err) {
                console.log(err)
            }

        }))

        try {

            //increase the ammount of storage space being used and add the new references into the user's fileRefs
            const newSpaceUsed = userInst.spaceUsed + uploadSize
            const newUser = {...userInst, spaceUsed: newSpaceUsed, fileRefs: [...userInst.fileRefs, ...references]}
            await updateUser(newUser)

            //reset the form
            setLoading(false)
            setDestination({id: null, fileName: null, nestedUnder: null})
            setFocusedFolder(null)
            toast.show('File upload successful', {
                type: 'success'
            }) 
        } catch (error) {console.log(error)}
          
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
        }
        } else {
        alert('Please enter a folder name')
        }
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
                            <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '10%'}}>Save Files To...</Text>

                            <View style={focusedFolder && !subFolders ? {width: '100%', height: '55%', marginBottom: '10%', display: 'flex', justifyContent: 'center'} : {width: '100%', height: '55%', marginBottom: '10%'}}>
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
            <View style={styles.container}>
                <View style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'absolute',
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom
                }}>
                    <Text style={styles.bigHeader}>Files to upload:</Text>
                        {loading ? 
                            <View style={styles.noFileCon}>
                                <Text style={styles.bigHeader}>Uploading Files...</Text>
                            </View>
                        :   
                            <>
                                {files.length === 0 ? 
                                    <View style={styles.noFileCon}>
                                        <Text style={styles.noFiles}>No Files Selected</Text>
                                    </View>
                                :
                                    <View style={styles.scrollCon}>
                                        <ScrollView>
                                            {renderFiles()}
                                        </ScrollView>
                                    </View>
                                }
                            </>
                        }
                    <View style={styles.buttonCon}>

                        <TouchableOpacity style={styles.buttonWrapperSm} onPress={() => selectFile()}>
                            <View style={styles.iconHolderSM}>
                              <FontAwesomeIcon icon={faFile} size={18} color='#9F37B0'/>
                            </View>
                            <Text style={styles.subheadingMLLarge}>Select File</Text>
                        </TouchableOpacity>

                        
                        
                        <TouchableOpacity style={styles.buttonWrapperSm} onPress={() => selectImage()}>
                            <View style={styles.iconHolderSM}>
                              <FontAwesomeIcon icon={faImage} size={18} color='#9F37B0'/>
                            </View>
                            <Text style={styles.subheadingMLLarge}>Select Photo</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.wrapperContainer}>
                        <TouchableOpacity style={files.length === 0 ? 
                                {
                                    width: '60%',
                                    borderRadius: 25,
                                    backgroundColor: '#FFE562',
                                    paddingLeft: '2%', 
                                    paddingTop: '2%', 
                                    paddingBottom: '2%', 
                                    opacity: .5,
                                    display: 'flex',
                                    flexDirection: 'row'
                                }
                            :                            

                                {
                                    width: '60%',
                                    borderRadius: 25,
                                    backgroundColor: '#FFE562',
                                    paddingLeft: '2%', 
                                    paddingTop: '2%', 
                                    paddingBottom: '2%', 
                                    display: 'flex',
                                    flexDirection: 'row'
                                }
                            } onPress={() => setPreAdd(true)} disabled={files.length === 0 ? true : false}>
                            <View style={styles.iconHolderSM}>
                              <FontAwesomeIcon icon={faCloudArrowUp} size={18} color='#9F37B0'/>
                            </View>
                            <Text style={styles.subheadingMLXLarge}>Upload Files</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        }
    </>
  )
}

export default DocumentPickerComp

const styles = StyleSheet.create({
    bigHeader: {
        color: '#593060',
        fontSize: 25,
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: '8%',
        marginTop: '2%',

      },
    noFiles: {
        color: '#593060', 
        marginLeft: 'auto', 
        marginRight: 'auto', 
        marginTop: 'auto', 
        marginBottom: 'auto'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFCF6',
        height: '100%'
    },
    buttonCon: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: '3%',
        width: '100%'
    },
    wrapperContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    buttonWrapperSm: {
        backgroundColor: '#FFE562',
        paddingLeft: '2%', 
        paddingTop: '2%', 
        paddingBottom: '2%', 
        borderRadius: 100, 
        width: '45%',
        display: 'flex',
        flexDirection: 'row'
    },
    iconHolderSM: {
        backgroundColor: 'white', 
        height: 36, 
        width: 36, 
        borderRadius: 100, 
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    subheadingMLLarge: {
        color: '#9F37B0',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 18,
        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft: '5%'
    },
    subheadingMLXLarge: {
        color: '#9F37B0',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 18,
        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft: '12%'
    },
    scrollCon: {
        height: '60%',
        width: '95%',
        borderBottomWidth: 1,
        borderColor: 'black',
        marginBottom: '5%'
    },
    noFileCon: {
        height: '60%',
        width: '95%',
        borderBottomWidth: 1,
        borderColor: 'black',
        marginBottom: '5%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
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