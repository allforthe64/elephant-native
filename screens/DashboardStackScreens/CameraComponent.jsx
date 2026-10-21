import { useState, useRef, useEffect } from 'react';
import { View, Text, StatusBar, StyleSheet, Animated, Image, TouchableOpacity, Platform, Linking } from 'react-native'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCloudArrowUp, faEnvelope, faTrash, faRepeat, faVideoCamera, faCamera, faSquare } from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { faCircle as solidCircle } from '@fortawesome/free-solid-svg-icons'

//import expo Camera api
import { CameraView, useCameraPermissions } from 'expo-camera';

//import Video and Audio components from expo-av
import { Video, Audio } from 'expo-av'

//import expo shareAsync and MediaLibrary
import { shareAsync } from 'expo-sharing'
import * as MediaLibrary from 'expo-media-library'

//import format from date-fns for file timestamps
import { format } from 'date-fns'

//import PinchGestureHandler for zoom controls
import { PinchGestureHandler } from 'react-native-gesture-handler'

//import ImageManipulator object from expo
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import AppPressable from '../../components/ui/AppPressable'
import ContentShell from '../../components/ui/ContentShell'
import SaveDestinationModal from '../../components/fileSystem/SaveDestinationModal'
import { ensurePermission } from '../../utils/permissions'
import { enqueueUploads, randomQueueId } from '../../utils/uploadQueue'
import { TestIds } from '../../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../../hooks/useResponsiveLayout'
import { useSaveDestination } from '../../hooks/useSaveDestination'
import { useSafeAreaInsets } from 'react-native-safe-area-context'


export default function CameraComponent() {
try {
    const { isTablet, select } = useResponsiveLayout()
    const insets = useSafeAreaInsets()
    const save = useSaveDestination()
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState(false)
    const [photo, setPhoto] = useState()
    const [session, setSession] = useState(true)
    const [video, setVideo] = useState(false)
    const [recording, setRecording] = useState(false)
    const [videoObj, setVideoObj] = useState()
    const [zoom, setZoom] = useState(0)
    const cameraRef = useRef()

    //initialize animation ref
    let fadeAnim = useRef(new Animated.Value(100)).current

    // Request media library / mic after camera is granted (non-blocking for CameraView)
    useEffect(() => {
        if (!permission?.granted) return

        let cancelled = false
        ;(async () => {
            try {
                const mediaLibraryPermission = await ensurePermission(
                    () => MediaLibrary.getPermissionsAsync(true),
                    () => MediaLibrary.requestPermissionsAsync(true)
                )
                await ensurePermission(Audio.getPermissionsAsync, Audio.requestPermissionsAsync)
                if (cancelled) return
                setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted')
            } catch (err) {
                console.warn('Secondary camera permissions error:', err)
            }
        })()

        return () => {
            cancelled = true
        }
    }, [permission?.granted])

    // Release the shared audio session when leaving camera so AudioRecorder can reclaim the mic
    useEffect(() => {
        return () => {
            Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
            }).catch(() => {})
        }
    }, [])

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

    useEffect(() => {
        //Will change fadeAnim value to 0 in 3 seconds
        Animated.timing(fadeAnim, {
            toValue: 100,
            duration: 0,
            useNativeDriver: true
        }).start()
    }, [photo])

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

    const saveToElephant = async (videoMode, toStaging = false) => {
        const finalDestination = save.resolveDestination(toStaging)
        const mediaName = save.name.trim()

        try {
            if (videoMode) {
                const capturedVideo = videoObj
                setVideoObj(undefined)

                const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss")
                const ext = Platform.OS === 'ios' ? 'mov' : 'mp4'
                const filename = mediaName !== '' ? `${mediaName}.${ext}` : `${formattedDate}.${ext}`

                await enqueueUploads([{uri: capturedVideo.uri, filename, fileType: ext, finalDestination}])
                saveToDeviceLibrary(capturedVideo.uri)
            } else {
                const capturedPhoto = photo
                setPhoto(undefined)

                const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss") + randomQueueId(10)
                const jpgImage = await manipulateAsync(
                    capturedPhoto.uri,
                    [],
                    { compress: 0.9, format: SaveFormat.JPEG }
                )
                const filename = mediaName !== '' ? `${mediaName}.jpg` : `${formattedDate}.jpg`

                await enqueueUploads([{uri: jpgImage.uri, filename, fileType: 'jpg', finalDestination, metadata: {height: jpgImage.height, width: jpgImage.width}}])
                saveToDeviceLibrary(capturedPhoto.uri)
            }
        } catch (err) {
            alert(err?.message || String(err))
        } finally {
            save.reset()
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

    //save a capture to the phone's photo library
    const saveToDeviceLibrary = (uri) => {
        MediaLibrary.saveToLibraryAsync(uri).catch((err) => {
            console.warn('Save to photo library failed:', err)
        })
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
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <AppPressable
          testID={TestIds.camera.grantPermission}
          accessibilityLabel="Grant camera permission"
          onPress={handleGrantCameraPermission}
          style={styles.grantButton}
        >
          <Text style={styles.grantButtonText}>Grant permission</Text>
        </AppPressable>
      </View>
    );
  }

  // Don't block the live camera on media-library / mic prompts.
  // Those are requested in the background after camera is granted.

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
    save.preAdd ?
        <SaveDestinationModal
            save={save}
            title="Save Files To..."
            nameHeading={videoObj ? 'Name Video:' : 'Name Photo:'}
            onSaveStaging={() => saveToElephant(!!videoObj, true)}
            onConfirm={() => saveToElephant(!!videoObj)}
        />
    : photo ? 
        <View style={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end'
        }}>
            <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64}}/>
            <ContentShell variant="modal" style={[styles.reviewActions, select(undefined, {top: insets.top + 24, right: 24})]}>
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
                        <TouchableOpacity style={{marginBottom: 20}} onPress={save.open}>
                            <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faCloudArrowUp} size={22} color='#9F37B0'/>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={() => setPhoto(undefined)}>
                            <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faTrash} size={22} color='#871313'/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ContentShell>
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
            <ContentShell variant="modal" style={[styles.reviewActions, select(undefined, {top: insets.top + 24, right: 24})]}>
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
                        <TouchableOpacity style={{marginBottom: 20}} onPress={save.open}>
                            <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faCloudArrowUp} size={22} color='#9F37B0'/>
                            </View>
                        </TouchableOpacity> 
                        <TouchableOpacity onPress={() => setVideoObj(undefined)}>
                            <View style={styles.iconHolder}>
                                <FontAwesomeIcon icon={faTrash} size={22} color='#871313'/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ContentShell>
        </View>
    </>
    :
    <View style={styles.cameraContainer}>
        <PinchGestureHandler onGestureEvent={onPinchEvent}>
            <View style={styles.camera}>
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
                        <AppPressable
                          testID={TestIds.camera.flip}
                          accessibilityLabel="Flip camera"
                          onPress={toggleType}
                          style={{ width: '14%', height: '55%', borderRadius: 100, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, .5)'}}
                        >
                            <FontAwesomeIcon icon={faRepeat} color={'white'} size={30} />
                        </AppPressable>
                </View>
                <View style={tabletStyle(isTablet, styles.buttonContainer, tabletStyles.buttonContainer)}>
                    <AppPressable
                      testID={TestIds.camera.modeToggle}
                      accessibilityLabel={video ? 'Switch to photo mode' : 'Switch to video mode'}
                      onPress={() => setVideo(prev => !prev)}
                      style={video ? {/* backgroundColor: 'white' */backgroundColor: 'rgba(0, 0, 0, .5)', width: '14%', height: '55%', borderRadius: 100, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: '10%', marginTop: '5%'} : { width: '14%', height: '55%', borderRadius: 100, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, .5)', marginRight: '10%', marginTop: '5%'}}
                    >
                            <FontAwesomeIcon icon={video ? faCamera : faVideoCamera} color={/* video ? 'black' :  */'white'} size={30} />
                    </AppPressable>
                    {!video ? 
                        <AppPressable testID={TestIds.camera.shutter} accessibilityLabel="Take photo" onPress={takePic} style={{marginRight: '17%'}}> 
                            <FontAwesomeIcon icon={faCircle} size={90} color='white'/>
                        </AppPressable>
                    :   
                        <>
                            {recording ? 
                                <AppPressable testID={TestIds.camera.shutter} accessibilityLabel="Stop video" onPress={stopVideo} style={{marginRight: '17%', backgroundColor: 'transparent', borderWidth: 8, borderColor: 'white', borderRadius: 1000, width: '24%', height: 90, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}> 
                                    <FontAwesomeIcon icon={faSquare} size={55} color='#871313'/>
                                </AppPressable>
                                :
                                <AppPressable testID={TestIds.camera.shutter} accessibilityLabel="Start video" onPress={takeVideo} style={{marginRight: '17%', backgroundColor: 'transparent', borderWidth: 8, borderColor: 'white', borderRadius: 1000, width: '24%', height: 90, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}> 
                                    <FontAwesomeIcon icon={solidCircle} size={55} color='#871313'/>
                                </AppPressable>
                            }
                        </>
                    }
                </View>
                <StatusBar style="auto" /> 
            </CameraView>
            </View>
        </PinchGestureHandler>
    </View>
  );
    } catch (err) {
        alert(err)
    }
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFCF6',
    paddingHorizontal: 24,
  },
  cameraContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    color: '#593060',
    fontSize: 18,
    marginBottom: 20,
  },
  grantButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  grantButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
    width: '100%',
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
    reviewActions: {
        position: 'absolute',
        top: '8%',
        right: '2.5%'
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

const tabletStyles = StyleSheet.create({
    buttonContainer: {
        bottom: 32,
    },
});