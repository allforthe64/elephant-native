import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Text, View , ScrollView, StyleSheet, Alert, Platform} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

//fontAwesome imports
import { faMicrophone, faSquare, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'

//AudioEditor component import
import AudioEditor from '../../components/audioRecorder/AudioEditor'

//import expo-av Audio component
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'

//import safeAreInsets context
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContentShell from '../../components/ui/ContentShell'
import YellowButton from '../../components/ui/YellowButton'
import SaveDestinationModal from '../../components/fileSystem/SaveDestinationModal'
import { TestIds } from '../../constants/testIds'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'
import { useSaveDestination } from '../../hooks/useSaveDestination'
import { ensurePermission } from '../../utils/permissions'
import { enqueueUploads } from '../../utils/uploadQueue'

const AudioRecorder = () => {

    try {
        const { isTablet } = useResponsiveLayout()
        const insets = useSafeAreaInsets()
        const keyboardHeight = useKeyboardHeight()
        const save = useSaveDestination()
        const [recording, setRecording] = useState()
        const [recordings, setRecordings] = useState([])
        const recordingsRef = useRef([])
        const recordingRef = useRef(null)
        const playbackRef = useRef(null)
        const recorderBusyRef = useRef(false)
        const [loading, setLoading] = useState(false)

        useEffect(() => {
            recordingsRef.current = recordings
        }, [recordings])

    const recordingAudioMode = {
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
    }

    const playbackAudioMode = {
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
    }

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    const unloadPlayback = async () => {
        const sound = playbackRef.current
        playbackRef.current = null
        if (!sound) return
        try {
            await sound.stopAsync()
        } catch (_) { /* already stopped */ }
        try {
            await sound.unloadAsync()
        } catch (_) { /* already unloaded */ }
        await Promise.all((recordingsRef.current || []).map(async (clip) => {
            try {
                await clip.sound?.unloadAsync?.()
            } catch (_) { /* already unloaded */ }
        }))
    }

    const releaseRecording = async (rec) => {
        if (!rec) return
        try {
            await rec.stopAndUnloadAsync()
        } catch (_) {
            try {
                await rec._cleanupForUnloadedRecorder?.({
                    canRecord: false,
                    durationMillis: 0,
                    isRecording: false,
                    isDoneRecording: true,
                })
            } catch (_) { /* already released */ }
        }
    }

    const resetNativeRecorder = async () => {
        await unloadPlayback()
        if (recordingRef.current) {
            await releaseRecording(recordingRef.current)
            recordingRef.current = null
        }

        // Android MediaRecorder stays prepared after the first clip unless the
        // AV module is fully cycled. iOS needs the recording-mode toggle.
        if (Platform.OS === 'android') {
            try {
                await Audio.setIsEnabledAsync(false)
            } catch (_) { /* ignore */ }
            await wait(150)
            try {
                await Audio.setIsEnabledAsync(true)
            } catch (_) { /* ignore */ }
        } else {
            try {
                await Audio.setAudioModeAsync(playbackAudioMode)
            } catch (_) { /* ignore */ }
        }

        await Audio.setAudioModeAsync(recordingAudioMode)
        await wait(Platform.OS === 'android' ? 200 : 50)
    }

    // Camera/video can leave the shared AVAudioSession in a non-recording state.
    // Reclaim it whenever this screen is focused so mic recording works afterward.
    useFocusEffect(
        useCallback(() => {
            let cancelled = false
            ;(async () => {
                try {
                    await Audio.setAudioModeAsync(recordingAudioMode)
                } catch (err) {
                    if (!cancelled) console.warn('Audio mode prepare failed:', err)
                }
            })()
            return () => {
                cancelled = true
                unloadPlayback()
            }
        }, [])
    )

    const startRecording = async () => {
        if (recorderBusyRef.current || recordingRef.current) return
        recorderBusyRef.current = true

        try {
            const permission = await ensurePermission(Audio.getPermissionsAsync, Audio.requestPermissionsAsync)
            const granted = permission?.granted === true || permission?.status === 'granted'

            if (!granted) {
               Alert.alert('Please grant permission to Elephant App to access microphone')
               return
            }

            await resetNativeRecorder()

            const {recording: nextRecording} = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            )

            recordingRef.current = nextRecording
            setRecording(nextRecording)
        } catch (err) {
            console.error('Failed to start recording', err)
            try {
                await resetNativeRecorder()
                const {recording: nextRecording} = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                )
                recordingRef.current = nextRecording
                setRecording(nextRecording)
            } catch (retryErr) {
                console.error('Recording retry failed', retryErr)
                recordingRef.current = null
                setRecording(undefined)
                Alert.alert(
                    'Recording failed',
                    retryErr?.message || 'Could not start the microphone. Close the camera screen and try again.'
                )
            }
        } finally {
            recorderBusyRef.current = false
        }
    }

    const stopRecording = async () => {
        const rec = recordingRef.current || recording
        if (!rec || recorderBusyRef.current) return
        recorderBusyRef.current = true

        let durationMillis = 0
        try {
            const status = await rec.getStatusAsync()
            durationMillis = status?.durationMillis || 0
        } catch (_) { /* duration falls back to 0 */ }

        try {
            await rec.stopAndUnloadAsync()
        } catch (_) {
            try {
                await rec._cleanupForUnloadedRecorder?.({
                    canRecord: false,
                    durationMillis,
                    isRecording: false,
                    isDoneRecording: true,
                })
            } catch (_) { /* already released */ }
        }

        const uri = rec.getURI?.()
        recordingRef.current = null

        if (!uri) {
            setRecording(undefined)
            recorderBusyRef.current = false
            Alert.alert('Recording failed', 'No audio file was produced.')
            return
        }

        // Cache URIs can disappear before the upload queue runs; persist a stable copy
        const ext = ((uri.split('.').pop() || 'm4a').split('?')[0] || 'm4a').toLowerCase()
        const docsDir = FileSystem.documentDirectory || FileSystem.cacheDirectory
        if (!docsDir) {
            setRecording(undefined)
            recorderBusyRef.current = false
            Alert.alert('Recording failed', 'Could not access local storage for the recording.')
            return
        }
        const stableUri = `${docsDir}recording-${Date.now()}.${ext}`
        try {
            await FileSystem.copyAsync({ from: uri, to: stableUri })
        } catch (copyErr) {
            console.error('Failed to persist recording', copyErr)
            setRecording(undefined)
            recorderBusyRef.current = false
            Alert.alert('Recording failed', 'Could not save the recording file.')
            return
        }

        setRecordings((prev) => [...prev, {
            duration: getDurartionFormatted(durationMillis),
            file: stableUri,
            fileType: ext,
            name: `Recording ${prev.length + 1}`
        }])
        setRecording(undefined)
        recorderBusyRef.current = false
    }

    const playClip = async (uri) => {
        if (!uri || recorderBusyRef.current || recordingRef.current) return
        try {
            await unloadPlayback()
            await Audio.setAudioModeAsync(playbackAudioMode)
            const { sound } = await Audio.Sound.createAsync({ uri })
            playbackRef.current = sound
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status?.didJustFinish) {
                    unloadPlayback()
                }
            })
            await sound.replayAsync()
        } catch (err) {
            Alert.alert('Playback failed', err?.message || String(err))
        }
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
            <AudioEditor editRecordings={setRecordings} recordingLine={recordingLine} index={index} key={recordingLine.file} recordings={recordings} deleteFunc={filterRecordings} onPlay={playClip} />
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

    const saveFiles = async (toStaging = false) => {
        if (recordings.length === 0) {
            Alert.alert('No recordings', 'Record audio before saving to staging.')
            return
        }

        setLoading(true)
        const finalDestination = save.resolveDestination(toStaging)

        try {
            await enqueueUploads(recordings.map(rec => {
                const ext = rec.fileType || 'm4a'
                return {uri: rec.file, filename: `${rec.name}.${ext}`, fileType: ext, finalDestination}
            }))
        } catch (err) {
            Alert.alert('Save failed', err?.message || String(err))
            setLoading(false)
            return
        }

        setRecordings([])
        setLoading(false)
        save.reset()
    }

  return (
    <>
        {save.preAdd ? 
            <SaveDestinationModal
                save={save}
                title="Save Files To..."
                onSaveStaging={() => saveFiles(true)}
                onConfirm={() => saveFiles()}
            />
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
                <View style={[styles.wrapperContainer, styles.bottomButtonWrap]}>
                    <YellowButton
                      testID={TestIds.audio.recordToggle}
                      accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}
                      size="md"
                      label={recording ? 'Stop Recording' : 'Start Recording'}
                      onPress={recording ? stopRecording : startRecording}
                      style={isTablet ? tabletStyles.actionButton : undefined}
                      icon={recording ? faSquare : faMicrophone}
                    />
                </View>
                <View style={[styles.wrapperContainer, styles.bottomButtonWrap]}>
                    <YellowButton
                      testID={TestIds.audio.saveAll}
                      accessibilityLabel="Save All"
                      size="md"
                      label="Save All"
                      onPress={save.open}
                      dimmed={recordings.length === 0}
                      disabled={recordings.length === 0}
                      style={isTablet ? tabletStyles.actionButton : undefined}
                      icon={faCloudArrowUp}
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
})

const tabletStyles = StyleSheet.create({
    actionButton: {
        maxWidth: '100%',
    },
})

export default AudioRecorder