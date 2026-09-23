import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, Pressable, TextInput, Button, Linking, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'

import { CameraView, useCameraPermissions } from 'expo-camera' 

import UrlEditor from '../../components/QRScanner/UrlEditor'

import { ScrollView } from 'react-native-gesture-handler'

import { addfile, updateUser, userListener, addFolderToUser } from '../../firebase/firestore'

import { firebaseAuth } from '../../firebaseConfig'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { storage } from '../../firebaseConfig'

import {ref, uploadBytesResumable} from 'firebase/storage'

import {format} from 'date-fns'

import { useToast } from 'react-native-toast-notifications'

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark, faFolder, faArrowLeft, faCloudArrowUp, faQrcode, faPlus, faCheck, faBox, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'

//import stuff for QueueUpload
import { UploadQueueEmitter } from '../../hooks/QueueEventEmitter'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ContentShell from '../../components/ui/ContentShell'
import KeyboardSafeForm from '../../components/ui/KeyboardSafeForm'
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'
import { useAutoFocusOn } from '../../hooks/useAutoFocusOn'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'
import { getMoveDestinationListHeight } from '../../constants/moveDestinationLayout'
import SaveDestinationActions from '../../components/fileSystem/SaveDestinationActions'
import MoveFolderDestinationRow from '../../components/fileSystem/MoveFolderDestinationRow'

const Scanner = () => {

  try {
    const { isTablet, select, height: windowHeight } = useResponsiveLayout()
    const moveFolderListHeight = getMoveDestinationListHeight(windowHeight)
    const insets = useSafeAreaInsets()
    const keyboardHeight = useKeyboardHeight()
    const [scanData, setScanData] = useState()
    const [urls, setUrls] = useState([])
    const [userInst, setUserInst] = useState()
    const [preAdd, setPreAdd] = useState(false)
    const [addFolderForm, setAddFolderForm] = useState(false)
    const addFolderInputRef = useAutoFocusOn(addFolderForm)
    const [focusedFolder, setFocusedFolder] = useState()
    const [subFolders, setSubFolders] = useState()
    const [folders, setFolders] = useState([])
    const [newFolderName, setNewFolderName] = useState('')
    const [destination, setDestination] = useState({id: null, fileName: null, nestedUnder: null})
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false);
    const [focusedFolderInst, setFocusedFolderInst] = useState()

    const toast = useToast()

    const currentUser = firebaseAuth.currentUser.uid

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
        if (currentUser) {
            const getCurrentUser = async () => {
            const unsubscribe = await userListener(setUserInst, false, currentUser)
        
            return () => unsubscribe()
            }
            getCurrentUser()
        } else console.log('no user yet')
        
    }, [currentUser])

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

    /* useEffect(() => {
        (async() => {
            const {status} = await BarCodeScanner.requestPermissionsAsync()
            setHasPermissions(status === "granted")
        })()
    }, []) */

    const handleGrantCameraPermission = async () => {
        try {
            const result = await requestPermission()
            if (result?.granted) return
            if (result && result.canAskAgain === false) {
                await Linking.openSettings()
            }
        } catch (err) {
            console.warn('Camera permission request failed:', err)
            alert(err?.message || String(err))
        }
    }

    if (!permission) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (!permission.granted) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FFFCF6' }}>
          <Text style={{ color: '#593060', fontSize: 18, textAlign: 'center', marginBottom: 16 }}>
            We need your permission to use the camera for QR scanning
          </Text>
          <TouchableOpacity onPress={handleGrantCameraPermission} style={{ backgroundColor: '#FFE562', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 }}>
            <Text style={{ color: '#9F37B0', fontSize: 18, fontWeight: '600' }}>Grant permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const handleBarCodeScanned = ({data}) => {
        if (scanned) return
        setScanned(true)
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

    
    const submit = async (toStaging = false) => {
        const urlsToSave = [...urls]
        if (urlsToSave.length === 0) {
            alert('No QR codes to save')
            return
        }

        setPreAdd(false)
        try {

        const filesToAddToQueue = urlsToSave.map(url => {

            // Keep filename free of URL dots so extension parsing stays ".txt"
            const label = (url.title && String(url.title).trim())
                ? String(url.title).trim().replace(/[^\w\s-]/g, '').slice(0, 40)
                : 'QR Code'
            const filename = `URL for ${label || 'QR Code'}.txt`

            let finalDestination
            if (toStaging) finalDestination = false
            else if (destination.id !== null) finalDestination = destination.id
            else if (focusedFolder) finalDestination = focusedFolder 
            else finalDestination = false

            const randomString = [...Array(10)].map(() => (Math.random().toString(36)[Math.random() < 0.5 ? 'toUpperCase' : 'toLowerCase']()) ).join('')

            return {uri: `${randomString} - qrcode.txt`, filename: filename, fileType: 'txt', finalDestination: finalDestination, noteBody: String(url.data ?? ''), linksTo: String(url.data ?? '')}

        })

        

        //add an image into the file queue
        const queue = JSON.parse(await AsyncStorage.getItem('uploadQueue')) || []
        const newQueue = [...queue, ...filesToAddToQueue]

        await AsyncStorage.setItem('uploadQueue', JSON.stringify(newQueue))

        //confirm the flush by immediately reading it back
        const confirmedQueue = JSON.parse(await AsyncStorage.getItem('uploadQueue'))

        UploadQueueEmitter.emit('uploadQueueUpdated', confirmedQueue)

        /* let uploadSize = 0
        
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
            const fileInst = userInst.files.filter(file => file.id === focusedFolder)
            toast.show(`File upload to ${fileInst[0].fileName} successful`, {
                type: 'success'
                })
        } else {
            toast.show(`File upload to staging successful`, {
                type: 'success'
                })
        } */

        setUrls([])
        setScanData(undefined)
        setScanned(false)
        setDestination({id: null, fileName: null, nestedUnder: null})
        setFocusedFolder(null)

        } catch (err) {
            alert('Save failed: ' + (err?.message || String(err)))
        }
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
                            <Text style={{fontSize: 40, color: '#593060', fontWeight: 'bold', textAlign: 'left', width: '100%', paddingLeft: '5%', marginBottom: 8}}>Save URLs To...</Text>
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
                                onSaveStaging={() => submit(true)}
                                onConfirmMove={() => submit()}
                                confirmDisabled={!(destination.id !== null || focusedFolder)}
                                paddingBottom={Math.max(insets.bottom, 12)}
                            />



                        </View>
                        
                    }
                    </ContentShell>

                </View>
            </Modal>
        :
        <>
          {scanData ?
            <>
              <ContentShell variant="content" fill>
              <View style={{
                  backgroundColor: '#FFFCF6',
                  flex: 1,
                  alignItems: 'center',
              }}>
                {scanData ? 
                    <View style={{
                            width: '100%',
                            flex: 1,
                            alignItems: 'center',
                            paddingTop: insets.top,
                            paddingBottom: Math.max(insets.bottom, 12) + (Platform.OS === 'ios' ? keyboardHeight : 0),
                        }}>
                        <Text style={styles.bigHeader}>Currently Captured QR URLS:</Text>
                        <View style={styles.scrollCon}>
                            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                                {mapUrls()}
                            </ScrollView>
                        </View> 
                        <View style={[styles.wrapperContainer, keyboardHeight > 0 && styles.wrapperContainerKeyboard]}>
                            <TouchableOpacity onPress={() => {
                                setScanData(undefined)
                                setScanned(false)
                            }} style={tabletStyle(isTablet, styles.buttonWrapper, tabletStyles.actionButton)}>
                                <View style={styles.iconHolderSmall}>
                                    <FontAwesomeIcon icon={faQrcode} color='#9F37B0' />
                                </View>
                                <Text style={{fontSize: 18, width: '100%', fontWeight: '600', color: '#9F37B0', paddingTop: '1%', marginLeft: '5%'}}>Scan Another Code</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.wrapperContainer, keyboardHeight > 0 && styles.wrapperContainerKeyboard]}>
                            <TouchableOpacity onPress={() => setPreAdd(true)} style={tabletStyle(isTablet, styles.buttonWrapper, tabletStyles.actionButton)}>
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
              </ContentShell>
            </>
          :
            <View style={styles.container}>
              <CameraView
                style={{flex: 1}}
                facing='back'
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
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
        marginBottom: 16
      },
    scrollCon: {
        flex: 1,
        width: '95%',
        borderBottomWidth: 1,
        borderColor: 'black',
        marginBottom: 16
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
        marginBottom: 12
    },
    wrapperContainerKeyboard: {
        marginBottom: 8
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