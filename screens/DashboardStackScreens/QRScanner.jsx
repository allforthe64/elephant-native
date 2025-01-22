import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, Pressable, TextInput, Button } from 'react-native'
import React, { useState, useEffect } from 'react'

import { CameraView, useCameraPermissions } from 'expo-camera' 

import UrlEditor from '../../components/QRScanner/UrlEditor'

import { ScrollView } from 'react-native-gesture-handler'

import { addfile, updateUser, userListener } from '../../firebase/firestore'

import { firebaseAuth } from '../../firebaseConfig'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { storage } from '../../firebaseConfig'

import {ref, uploadBytesResumable} from 'firebase/storage'

import {format} from 'date-fns'

import { useToast } from 'react-native-toast-notifications'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark, faFolder, faArrowLeft, faCloudArrowUp, faQrcode, faPlus, faCheck, faBox, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

const Scanner = () => {

  try {
    const [scanData, setScanData] = useState()
    const [urls, setUrls] = useState([])
    const [userInst, setUserInst] = useState()
    const [preAdd, setPreAdd] = useState(false)
    const [addFolderForm, setAddFolderForm] = useState(false)
    const [focusedFolder, setFocusedFolder] = useState()
    const [subFolders, setSubFolders] = useState()
    const [folders, setFolders] = useState([])
    const [newFolderName, setNewFolderName] = useState('')
    const [destination, setDestination] = useState({id: null, fileName: null, nestedUnder: null})
    const [hasPermission, setHasPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false);
    const [focusedFolderInst, setFocusedFolderInst] = useState()

    const toast = useToast()

    const currentUser = firebaseAuth.currentUser.uid

    //get the current user 
    useEffect(() => {
        if (currentUser) {
            const getCurrentUser = async () => {
            const unsubscribe = await userListener(setUserInst, false, currentUser)
        
            return () => unsubscribe()
            }
            getCurrentUser()
        } else console.log('no user yet')
        
    }, [currentUser])

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
        if (focusedFolder && folders) {
            setFocusedFolderInst(folders.filter(folder => folder.id === focusedFolder)[0])
        }
    }, [focusedFolder, folders])

    /* useEffect(() => {
        (async() => {
            const {status} = await BarCodeScanner.requestPermissionsAsync()
            setHasPermissions(status === "granted")
        })()
    }, []) */


    if (hasPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }

    const handleBarCodeScanned = ({data}) => {
        
        let arr = [...urls]
        setScanData(data)
        arr.push({data: data, title: ''})
        console.log('edited arr: ', arr)
        setUrls(arr)
    }

    const mapUrls = () => {
        return urls.map((url, index) => {
            return <UrlEditor url={url} editUrls={setUrls} key={index} index={index} deleteFunc={deleteUrl}/>
        })
    }

    const deleteUrl = (target) => {
        const arr = urls.filter(url => url != target)
        setUrls(arr)
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

    
    const submit = async () => {
        setPreAdd(false)
        try {

        

        let uploadSize = 0
        
        const references = await Promise.all(urls.map(async (el) => {

            //generate filename
            const fileName = el.title ? `URL for: ${el.title}.txt` : `URL for: ${el.data}.txt`

            //if files exist with this filename increase version number
            let versionNo = 0
                userInst.fileRefs.forEach(fileRef => {
                if (fileRef.fileName === fileName) {
                    versionNo ++
                }
            })

            //generate formatted date
            const formattedDate = format(new Date(), `yyyy-MM-dd:hh:mm:ss::${Date.now()}`)

            //upload file
            const textFile = new Blob([`${el.data}`], {
            type: "text/plain;charset=utf-8",
                });
            const fileUri = `${currentUser}/${formattedDate}`
            const fileRef = ref(storage, fileUri)

            const result = await uploadBytesResumable(fileRef, textFile)

            let finalDestination 
            if (destination.id !== null) finalDestination = destination.id
            else if (focusedFolder) finalDestination = focusedFolder 
            else finalDestination = false

            const reference = await addfile({
                name: fileName,
                linksTo: el.data,
                fileType: 'txt',
                size: result.metadata.size,
                user: currentUser, timeStamp: formattedDate, version: versionNo
            }, finalDestination)

            //increase the size of the upload
            uploadSize += result.metadata.size

            return reference   
        }))

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

        setUrls([])
        setDestination({id: null, fileName: null, nestedUnder: null})
        setFocusedFolder(null)

        } catch (err) {
            alert(err)
        }
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
                            <Text style={{fontSize: 40, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '5%'}}>Save URLs To...</Text>
                            {focusedFolderInst &&
                                <Text style={{fontSize: 20, color: 'white', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: '5%'}}>Viewing: {focusedFolderInst.fileName}</Text>
                            }
                            <View style={focusedFolder && !subFolders ? {width: '100%', height: '55%', marginBottom: '10%', display: 'flex', justifyContent: 'center'} : {width: '100%', height: '55%', marginBottom: '10%'}}>
                                    {focusedFolder ? 
                                        <>
                                            <TouchableOpacity style={styles.yellowButtonBack} onPress={() => {
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
                                                                    if (destination.id === null || f.id.toString() !== destination.id.toString()) {
                                                                        setDestination({id: f.id, fileName: f.fileName, nestedUnder: f.nestedUnder})
                                                                    } else {
                                                                        setFocusedFolder(f.id)
                                                                        setDestination({id: null, fileName: null, nestedUnder: null})
                                                                    }
                                                                }
                                                                }>
                                                                    <View style={f.id.toString() === destination.id.toString() ? styles.folderWhite : styles.folder}>
                                                                    <View style={f.id.toString() === destination.id.toString() ? styles.iconHolderBlack : styles.iconHolder}>
                                                                        <FontAwesomeIcon icon={faFolder} size={28} color={f.id.toString() === destination.id.toString() ? 'white' : '#9F37B0'}/>
                                                                    </View>
                                                                    <Text style={f.id.toString() === destination.id.toString() ? {color: 'black', fontSize: 28, width: '80%', paddingTop: '1%'} : {color: '#9F37B0', fontSize: 28, width: '80%', textAlign: 'left', paddingTop: '1%'}}>{f.fileName}</Text>
                                                                    </View>
                                                                </Pressable>
                                                            )
                                                        
                                                    }
                                                } else {
                                                    if (f.nestedUnder === '') {
                                                        return (
                                                            <Pressable key={index} style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: '1%'}} onPress={() => {
                                                                if (destination.id === null || f.id.toString() !== destination.id.toString()) {
                                                                    setDestination({id: f.id, fileName: f.fileName, nestedUnder: f.nestedUnder})
                                                                } else {
                                                                    setFocusedFolder(f.id)
                                                                    setDestination({id: null, fileName: null, nestedUnder: null})
                                                                }
                                                            }
                                                            }>
                                                                <View style={f.id.toString() === destination.id.toString() ? styles.folderWhite : styles.folder}>
                                                                <View style={f.id.toString() === destination.id.toString() ? styles.iconHolderBlack : styles.iconHolder}>
                                                                    <FontAwesomeIcon icon={faFolder} size={28} color={f.id.toString() === destination.id.toString() ? 'white' : '#9F37B0'}/>
                                                                </View>
                                                                <Text style={f.id.toString() === destination.id.toString() ? {color: 'black', fontSize: 28, width: '80%', paddingTop: '1%'} : {color: '#9F37B0', fontSize: 28, width: '80%', textAlign: 'left', paddingTop: '1%'}}>{f.fileName}</Text>
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

                            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '100%'}}>
                                <TouchableOpacity onPress={() => submit()} style={ destination.id !== null || focusedFolder ? styles.yellowButtonSM : styles.yellowButtonSMDim}
                                    disabled={destination.id !== null || focusedFolder ? false : true}
                                >
                                    <View style={styles.iconHolderSmall}>
                                        <FontAwesomeIcon icon={faCheck} color='#9F37B0'/>
                                    </View>
                                    <Text style={{fontSize: 18, color: '#9F37B0', fontWeight: '600', marginLeft: '8%', paddingTop: '1%'}}>Confirm Move</Text>
                                </TouchableOpacity>

                               
                                <TouchableOpacity onPress={() => submit()} style={styles.yellowButtonSM}>
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
        <>
          {scanData ?
            <>
              <View style={{
                  backgroundColor: '#FFFCF6',
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
              }}>
                {scanData ? 
                    <View style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            position: 'absolute',
                            paddingTop: insets.top,
                            paddingBottom: insets.bottom
                        }}>
                        <Text style={styles.bigHeader}>Currently Captured QR URLS:</Text>
                        <View style={styles.scrollCon}>
                            <ScrollView contentContainerStyle={styles.scroll}>
                                {mapUrls()}
                            </ScrollView>
                        </View> 
                        <View style={styles.wrapperContainer}>
                            <TouchableOpacity onPress={() => setScanData(undefined)} style={styles.buttonWrapper}>
                                <View style={styles.iconHolderSmall}>
                                    <FontAwesomeIcon icon={faQrcode} color='#9F37B0' />
                                </View>
                                <Text style={{fontSize: 18, width: '100%', fontWeight: '600', color: '#9F37B0', paddingTop: '1%', marginLeft: '5%'}}>Scan Another Code</Text>
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
                :
                  <></>
                }
              </View>
            </>
          :
            <View style={styles.container}>
              <CameraView
                style={{flex: 1}}
                facing='back'
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "pdf417"],
                }}
                
              />
            </View>
          }
        </>
        }
    </>
)

} catch (error) {
    alert(error)
}
}

export default Scanner

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
        marginBottom: '8%'
      },
    scrollCon: {
        height: '60%',
        width: '95%',
        borderBottomWidth: 1,
        borderColor: 'black',
        marginBottom: '10%'
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
        marginBottom: '8%'
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