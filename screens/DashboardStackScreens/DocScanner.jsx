import React, { useState, useEffect, useRef } from 'react'
import { Image, Platform, PermissionsAndroid, Dimensions, View, StyleSheet, Text } from 'react-native'

//import DocumentScanner component from react-native-document-scanner-plugin
import DocumentScanner from 'react-native-document-scanner-plugin'

//import Carousel component from react-native-reanimated-carousel
import Carousel from 'react-native-reanimated-carousel';

//import useToast for notifications
import { useToast } from 'react-native-toast-notifications'

//import createPdf to convert images to pdf
import { createPdf } from 'react-native-images-to-pdf';

//import RNBlobUtil 
import RNBlobUtil from 'react-native-blob-util';

//import format from date-fns for file timestamp
import { format } from 'date-fns';

//fontAwesome imports
import { faPlus, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';

import ContentShell from '../../components/ui/ContentShell'
import YellowButton from '../../components/ui/YellowButton'
import SaveDestinationModal from '../../components/fileSystem/SaveDestinationModal'
import { ensureAndroidPermission } from '../../utils/permissions'
import { enqueueUploads, randomQueueId } from '../../utils/uploadQueue'
import { compressScanPages } from '../../utils/compressScanPages'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import { useSaveDestination } from '../../hooks/useSaveDestination'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const DocScanner = () => {
  const { isTablet, select } = useResponsiveLayout()
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, 16) + 48
  const save = useSaveDestination()

  const [scannedImageArray, setScannedImageArray] = useState([]);

  const toast = useToast()

  const width = Dimensions.get('window').width

  const scanDocument = async () => {

    // prompt user to accept camera permission request if they haven't already
    if (Platform.OS === 'android' && !(await ensureAndroidPermission(PermissionsAndroid.PERMISSIONS.CAMERA))) {
      toast.show('Camera permission is required to scan documents', {
        type: 'danger'
      })
      return
    }

    try {
      // Cancelling the scanner resolves without any images.
      const { scannedImages } = await DocumentScanner.scanDocument()
      if (scannedImages?.length > 0) {
        setScannedImageArray(prev => [...prev, ...scannedImages])
      }
    } catch (error) {
      toast.show(`Scanner failed: ${error?.message || error}`, { type: 'danger' })
    }
  }

  useEffect(() => {
    // call scanDocument on load
    scanDocument()
  }, []);

  //generate a pdf using the scanned images
  const creatingRef = useRef(false)

  const generatePDF = async (toStaging = false) => {
    if (creatingRef.current) return
    creatingRef.current = true
    toast.show('Preparing PDF...')
    const { pages, cleanup } = await compressScanPages(scannedImageArray)
    try {
      const path = await createPdf({
        pages: pages.map(imagePath => ({imagePath})),
        // Unique per scan: the upload queue may still be reading an earlier PDF.
        outputPath: `file://${RNBlobUtil.fs.dirs.DocumentDir}/scan-${Date.now()}.pdf`
      })
      await uploadPDF(path, toStaging)
    } catch (error) {
      alert(`Failed to create PDF: ${error}`)
    } finally {
      cleanup()
      creatingRef.current = false
    }
  }

  const uploadPDF = async (path, toStaging = false) => {
    try {
      const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss") + randomQueueId(10)
      const docName = save.name.trim()
      const filename = docName !== '' ? `${docName}.pdf` : `${formattedDate}.pdf`

      await enqueueUploads([{
        // iOS returns a file:// URL, Android a bare path.
        uri: path.startsWith('file://') ? path : `file://${path}`,
        filename,
        fileType: 'pdf',
        finalDestination: save.resolveDestination(toStaging),
      }])

      setScannedImageArray([])
      setProgress(0)
      save.reset()
    } catch (error) {
      alert('docScanner error: ' + error.message)
    }
  }

  //carousel
  const [progress, setProgress] = useState(0);
  const carouselRef = useRef()

  const onPressPagination = (targetIndex) => {
    carouselRef.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      index: targetIndex,
      animated: true,
    });
  };

  return (
    <>
      {save.preAdd ? 

        <SaveDestinationModal
          save={save}
          title="Save PDF To..."
          nameHeading="Name PDF:"
          onSaveStaging={() => generatePDF(true)}
          onConfirm={() => generatePDF()}
        />
      :
      
      scannedImageArray ? 
        <ContentShell variant="content" fill>
          {scannedImageArray.length > 1
            ?    
            <View style={{backgroundColor: '#FFFCF6',
              height: '100%', width: '100%'}}>
                <View style={{width: '100%', height: '60%'}}>
                  <Carousel
                      ref={carouselRef}
                      loop={false}
                      width={select(width, Math.min(width, 720), Math.min(width, 840))}
                      style={{height: '90%', paddingRight: '5%'}}
                      onSnapToItem={setProgress}
                      mode='parallax'
                      modeConfig={{
                        parallaxScrollingScale: 0.9,
                        parallaxScrollingOffset: 50,
                        parallaxAdjacentItemScale: 0.8,
                    }}
                      /* onProgressChange={(val) => {
                        if (val > 0) {
                          if (progress + 1 > scannedImageArray.length) setProgress(0)
                          else setProgress(prev => prev + 1) 
                        } else {
                          if (progress - 1 < 0) setProgress(scannedImageArray.length - 1) 
                          else setProgress(prev => prev - 1) 
                        }
                      }} */
                      data={scannedImageArray}
                      scrollAnimationDuration={300}
                      renderItem={({ index }) => {
                        return (
                          <View
                              style={{
                                  flex: 1,
                                  justifyContent: 'center',
                                  width: '100%',
                                  height: '100%',
                                  borderWidth: 2,
                                  borderColor: '#593060',
                                  borderRadius: 20,
                                  paddingTop: 4,
                                  paddingRight: 4,
                                  paddingBottom: 4,
                                  paddingLeft: 4
                              }}
                          >
                              <Image 
                                style={{ width: '100%', height: '100%', objectFit: 'contain'}}
                                source={{uri: scannedImageArray[index]}}
                              />
                          </View>
                      )}}
                      />
                    <Text style={styles.pageCounter}>
                      Page {Math.min(progress, scannedImageArray.length - 1) + 1} of {scannedImageArray.length}
                    </Text>
                    {/* <View style={{width: '100%', paddingLeft: '5%', paddingRight: '5%', display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap'}}>
                      {scannedImageArray.map((index, counter) => {
                        return (
                          <TouchableOpacity  style={{marginLeft: '5%', width: 22, height: 22, borderRadius: 100, backgroundColor: '#FFFCF6', borderWidth: 2, borderColor: '#9F37B0', marginBottom: '5%'}} onPress={() => {
                            setProgress(counter)
                            onPressPagination(counter)
                          }}>
                          </TouchableOpacity>
                        )
                      })}
                    </View> */}
                </View>
                <View style={{height: '20%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: bottomPad, justifyContent: 'flex-end'}}>
                  <View style={{width: '80%', marginBottom: '4%', borderWidth: 2, borderColor: '#593060', borderRadius: 100}}></View>
                  <View style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: 8,
                    gap: 12,
                    }}>
                          <YellowButton
                            size="md"
                            label="Scan More Documents"
                            onPress={() => scanDocument()}
                            style={isTablet ? tabletStyles.actionButton : undefined}
                            icon={faPlus}
                          />
                          <YellowButton
                            size="md"
                            label="Convert To PDF/Upload"
                            onPress={save.open}
                            style={isTablet ? tabletStyles.actionButton : undefined}
                            icon={faCloudArrowUp}
                          />
                  </View>
                </View>
            </View>
              
            :
              <View style={{backgroundColor: '#FFFCF6',
                height: '100%', width: '100%'}}>
                <View style={{height: '75%', marginBottom: '10%'}} width={width}>
                  <Image 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    source={{uri: scannedImageArray[0]}}
                  />
                </View>  
                <View style={{height: '25%', paddingBottom: bottomPad, justifyContent: 'flex-end'}}>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: 8,
                    gap: 12,
                  }}>
                    <YellowButton
                      size="md"
                      label="Scan More Documents"
                      onPress={() => scanDocument()}
                      style={isTablet ? tabletStyles.actionButton : undefined}
                      icon={faPlus}
                    />
                    <YellowButton
                      size="md"
                      label="Convert To PDF/Upload"
                      onPress={save.open}
                      style={isTablet ? tabletStyles.actionButton : undefined}
                      icon={faCloudArrowUp}
                    />
                  </View>
                </View>  
              </View>      
          }  

        </ContentShell>
      :
        <></>
      }
    </>
  )
}

export default DocScanner

const styles = StyleSheet.create({ 
  pageCounter: {
    color: '#593060',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
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