import { useState, useRef, useEffect, useMemo } from 'react';
import { View, StatusBar, StyleSheet, Image, Platform } from 'react-native'
import { CameraView } from 'expo-camera';
import { Video } from 'expo-av'
import { shareAsync } from 'expo-sharing'
import * as MediaLibrary from 'expo-media-library'
import { format } from 'date-fns'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

import SaveDestinationModal from '../../components/fileSystem/SaveDestinationModal'
import CameraPermissionPrompt from '../../components/camera/CameraPermissionPrompt'
import CameraControls from '../../components/camera/CameraControls'
import CaptureReview from '../../components/camera/CaptureReview'
import { enqueueUploads, randomQueueId } from '../../utils/uploadQueue'
import { useSaveDestination } from '../../hooks/useSaveDestination'
import { useCameraSetup } from '../../hooks/useCameraSetup'

const clampZoom = (z) => Math.min(1, Math.max(0, z))

// expo-camera maps `zoom` differently per platform: iOS uses maxZoom^zoom, Android
// uses zoom * maxZoom (floored at 1x). Converting the pinch scale through the same
// curve makes the image grow with the fingers on both.
const IOS_ZOOM_RANGE = 30
const ANDROID_ONE_X = 0.1

function zoomForPinch(startZoom, scale) {
    if (!(scale > 0)) return startZoom
    if (Platform.OS === 'ios') {
        return clampZoom(startZoom + Math.log(scale) / Math.log(IOS_ZOOM_RANGE))
    }
    const next = Math.max(startZoom, ANDROID_ONE_X) * scale
    return next <= ANDROID_ONE_X ? 0 : clampZoom(next)
}

//save a capture to the phone's photo library
const saveToDeviceLibrary = (uri) =>
    MediaLibrary.saveToLibraryAsync(uri).catch((err) => {
        console.warn('Save to photo library failed:', err)
    })

export default function CameraComponent() {
    const save = useSaveDestination()
    const { permission, grantPermission } = useCameraSetup()
    const [facing, setFacing] = useState('back');
    const [photo, setPhoto] = useState()
    const [videoObj, setVideoObj] = useState()
    // Session mode saves every capture straight to staging without the review screen.
    const [session, setSession] = useState(true)
    const [videoMode, setVideoMode] = useState(false)
    const [recording, setRecording] = useState(false)
    const [zoom, setZoom] = useState(0)
    const cameraRef = useRef()

    const takePic = async () => {
        try {
            const newPhoto = await cameraRef.current.takePictureAsync({ quality: 1, exif: false })
            setPhoto(newPhoto)
        } catch (err) {
            alert(err?.message || String(err))
        }
    }

    const takeVideo = async () => {
        try {
            setRecording(true)
            const recordedVideo = await cameraRef.current.recordAsync({ mute: false })
            setVideoObj(recordedVideo)
        } catch (err) {
            console.log(err)
            alert(`Recording failed: ${err?.message || String(err)}`)
        } finally {
            setRecording(false)
        }
    }

    const stopVideo = () => {
        cameraRef.current.stopRecording()
        setRecording(false)
    }

    const saveToElephant = async (isVideo, toStaging = false) => {
        const finalDestination = save.resolveDestination(toStaging)
        const mediaName = save.name.trim()

        try {
            if (isVideo) {
                const capturedVideo = videoObj
                setVideoObj(undefined)

                const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss")
                const ext = Platform.OS === 'ios' ? 'mov' : 'mp4'
                const filename = mediaName !== '' ? `${mediaName}.${ext}` : `${formattedDate}.${ext}`

                // The uploader deletes the file afterwards, so copy it to the library first.
                await saveToDeviceLibrary(capturedVideo.uri)
                await enqueueUploads([{uri: capturedVideo.uri, filename, fileType: ext, finalDestination}])
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

    useEffect(() => {
        if (!session) return
        if (photo) saveToElephant(false)
        else if (videoObj) saveToElephant(true)
    }, [photo, videoObj])

    const shareCapture = (capture, clear) => {
        shareAsync(capture.uri).then(() => clear(undefined))
    }

    const toggleFacing = () => {
        if (!recording) setFacing(prev => prev === 'back' ? 'front' : 'back')
    }

    // Zoom follows the fingers: each update scales from the zoom the pinch started at.
    const zoomRef = useRef(0)
    const pinchStartZoom = useRef(0)
    zoomRef.current = zoom

    const pinch = useMemo(() => Gesture.Pinch()
        .runOnJS(true)
        .onStart(() => { pinchStartZoom.current = zoomRef.current })
        .onUpdate((e) => setZoom(zoomForPinch(pinchStartZoom.current, e.scale))), [])

    useEffect(() => { setZoom(0) }, [facing])

    if (!permission || !permission.granted) {
        return <CameraPermissionPrompt loading={!permission} onGrant={grantPermission} />
    }

    if (save.preAdd) {
        return (
            <SaveDestinationModal
                save={save}
                title="Save Files To..."
                nameHeading={videoObj ? 'Name Video:' : 'Name Photo:'}
                onSaveStaging={() => saveToElephant(!!videoObj, true)}
                onConfirm={() => saveToElephant(!!videoObj)}
            />
        )
    }

    if (photo) {
        return (
            <CaptureReview onShare={() => shareCapture(photo, setPhoto)} onSave={save.open} onDelete={() => setPhoto(undefined)}>
                <Image style={styles.preview} source={{ uri: photo.uri }}/>
            </CaptureReview>
        )
    }

    if (videoObj) {
        return (
            <CaptureReview onShare={() => shareCapture(videoObj, setVideoObj)} onSave={save.open} onDelete={() => setVideoObj(undefined)}>
                <Video style={styles.preview} source={{uri: videoObj.uri}} useNativeControls resizeMode='contain' isLooping onError={(error) => alert(error)}/>
            </CaptureReview>
        )
    }

    return (
        <View style={styles.cameraContainer}>
            <GestureDetector gesture={pinch}>
                <View style={styles.camera} collapsable={false}>
                    <CameraView style={styles.camera} facing={facing} ref={cameraRef} mode={videoMode ? 'video' : 'picture'} zoom={zoom}>
                        <CameraControls
                            session={session}
                            onToggleSession={() => setSession(prev => !prev)}
                            onFlip={toggleFacing}
                            videoMode={videoMode}
                            onToggleMode={() => setVideoMode(prev => !prev)}
                            recording={recording}
                            onTakePhoto={takePic}
                            onStartVideo={takeVideo}
                            onStopVideo={stopVideo}
                        />
                        <StatusBar style="auto" />
                    </CameraView>
                </View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    cameraContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
        width: '100%',
    },
    preview: {
        flex: 1,
        alignSelf: 'stretch',
        height: '100%',
    },
})
