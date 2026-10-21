import { StyleSheet, Text, View, Linking, Platform } from 'react-native'
import React, { useState } from 'react'

import { CameraView, useCameraPermissions } from 'expo-camera' 

import UrlEditor from '../../components/QRScanner/UrlEditor'

import { ScrollView } from 'react-native-gesture-handler'

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { faCloudArrowUp, faQrcode } from '@fortawesome/free-solid-svg-icons'

import ContentShell from '../../components/ui/ContentShell'
import YellowButton from '../../components/ui/YellowButton'
import SaveDestinationModal from '../../components/fileSystem/SaveDestinationModal'
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import { useSaveDestination } from '../../hooks/useSaveDestination'
import { enqueueUploads, randomQueueId } from '../../utils/uploadQueue'

const Scanner = () => {

  try {
    const { isTablet } = useResponsiveLayout()
    const insets = useSafeAreaInsets()
    const keyboardHeight = useKeyboardHeight()
    const save = useSaveDestination()
    const [scanData, setScanData] = useState()
    const [urls, setUrls] = useState([])
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false);

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
          <YellowButton size="md" label="Grant permission" onPress={handleGrantCameraPermission} />
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


    
    const submit = async (toStaging = false) => {
        const urlsToSave = [...urls]
        if (urlsToSave.length === 0) {
            alert('No QR codes to save')
            return
        }

        const finalDestination = save.resolveDestination(toStaging)
        save.reset()
        try {

        const filesToAddToQueue = urlsToSave.map(url => {

            // Keep filename free of URL dots so extension parsing stays ".txt"
            const label = (url.title && String(url.title).trim())
                ? String(url.title).trim().replace(/[^\w\s-]/g, '').slice(0, 40)
                : 'QR Code'
            const filename = `URL for ${label || 'QR Code'}.txt`

            return {uri: `${randomQueueId()} - qrcode.txt`, filename: filename, fileType: 'txt', finalDestination, noteBody: String(url.data ?? ''), linksTo: String(url.data ?? '')}

        })

        

        await enqueueUploads(filesToAddToQueue)

        setUrls([])
        setScanData(undefined)
        setScanned(false)

        } catch (err) {
            alert('Save failed: ' + (err?.message || String(err)))
        }
    }

return (
    <>
        {save.preAdd ? 
            <SaveDestinationModal
                save={save}
                title="Save URLs To..."
                onSaveStaging={() => submit(true)}
                onConfirm={() => submit()}
            />
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
                            <YellowButton
                              size="md"
                              icon={faQrcode}
                              label="Scan Another Code"
                              onPress={() => {
                                setScanData(undefined)
                                setScanned(false)
                              }}
                              style={isTablet ? tabletStyles.actionButton : undefined}
                            />
                        </View>
                        <View style={[styles.wrapperContainer, keyboardHeight > 0 && styles.wrapperContainerKeyboard]}>
                            <YellowButton
                              size="md"
                              icon={faCloudArrowUp}
                              label="Save All"
                              onPress={save.open}
                              style={isTablet ? tabletStyles.actionButton : undefined}
                            />
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