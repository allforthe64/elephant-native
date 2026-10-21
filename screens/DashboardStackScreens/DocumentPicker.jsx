import React, {useState, useEffect} from 'react'
import {View, Text, StyleSheet, ScrollView, Image, Platform} from 'react-native'

//FileRow component import
import FileRow from '../../components/documentPicker/FileRow'

import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'

//fontAwesome imports
import { faFile, faImage, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'

//safe area context import
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import ContentShell from '../../components/ui/ContentShell'
import YellowButton from '../../components/ui/YellowButton'
import SaveDestinationModal from '../../components/fileSystem/SaveDestinationModal'
import { useKeyboardHeight } from '../../hooks/useKeyboardHeight'
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import { useSaveDestination } from '../../hooks/useSaveDestination'
import { enqueueUploads } from '../../utils/uploadQueue'
import { sortByName } from '../../utils/sortByName'

const DocumentPickerComp = () => {
    const { isTablet } = useResponsiveLayout()
    const save = useSaveDestination()
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(false)

    // Keep `files` sorted in state: FileRow writes renames back by index.
    const addFiles = (newFiles) => setFiles(prev => sortByName([...prev, ...newFiles], 'name'))

    //helper for getting image sizes if an image is returned out of the document picker
    const getImageSize = (uri) =>
        new Promise((resolve, reject) => {
            Image.getSize(
            uri,
            (width, height) => resolve({ width, height }),
            (error) => reject(error)
        );
    })

    const selectFile = async () => {
        try {
            
            const result = await DocumentPicker.getDocumentAsync({ multiple: true, copyToCacheDirectory: true })

            if (result.canceled) return
 
            const updatedFiles = await Promise.all(result.assets.map(async file => {
                const extension = file.name?.split('.').pop()?.toLowerCase() ||
                file.mimeType?.split('/')[1]

                let width = null
                let height = null

                if (file.mimeType?.startsWith('image/')) {
                    try {
                        const size = await getImageSize(file.uri)
                        width = size.width
                        height = size.height
                    } catch (err) {
                        console.log("could read image size: ", err)
                    }
                }

                return {
                    name: file.name,
                    uri: file.uri,
                    size: file.size,
                    fileType: extension, // "png", "pdf", etc
                    mimeType: file.mimeType,
                    width: width,
                    height: height
                };
            }));

            addFiles(updatedFiles)
        } catch (err) {
            alert(err)
        }
    };

    const selectImage = async () => {
        try {
        // No permissions request is necessary for launching the image library
        const imgs = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          aspect: [4, 3],
          quality: 1,
          allowsMultipleSelection: true
        });
        if (!imgs.canceled) {
            addFiles(imgs.assets.map(img => {
                const fileName = img.uri.substring(img.uri.lastIndexOf('/') + 1, img.uri.length)
                return {name: fileName, uri: img.uri, fileType: fileName.split('.')[1], height: img.height, width: img.width}
            }))
        }
        
        } catch (err) {console.log(err)}

    };

    const renderFiles = () => {

        if (Array.isArray(files)) {
            return files.map((file, index) => {
                return (
                    <FileRow file={file} files={files} index={index} key={file.uri} deleteFunc={filterFiles} setFiles={setFiles}/>
                )
            })
        } else {
            alert('Files is not a function')
        }
    }

    const filterFiles = (input, target) => {

        const arr = []
    
        input.map(el => {
            if (JSON.stringify(el) !== JSON.stringify(target)) arr.push(el)
        })
    
        setFiles(arr)
    }
    
    const saveFiles = async (toStaging = false) => {
        const finalDestination = save.resolveDestination(toStaging)
        const filesToSave = files

        setLoading(true)
        setFiles([])
        save.reset()

        try {
            await enqueueUploads(filesToSave.map(file => {
                if (['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG'].includes(file.fileType)) {
                    return { uri: file.uri, filename: file.name, fileType: file.fileType, finalDestination, metadata: {width: file.width, height: file.height}}
                }
                return { uri: file.uri, filename: file.name, fileType: file.fileType, finalDestination }
            }))
        } catch (err) {
            setFiles(filesToSave)
            alert('Save failed: ' + (err?.message || String(err)))
        } finally {
            setLoading(false)
        }
    }

    const insets = useSafeAreaInsets()
    const keyboardHeight = useKeyboardHeight()

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
            <View style={styles.container}>
                <ContentShell variant="content" fill>
                <View style={{
                    width: '100%',
                    flex: 1,
                    alignItems: 'center',
                    paddingTop: 8,
                    paddingBottom: Math.max(insets.bottom, 16) + 48 + (Platform.OS === 'ios' ? keyboardHeight : 0),
                }}>
                    <Text style={styles.bigHeader}>Files to upload:</Text>
                        {loading ? 
                            <View style={styles.noFileCon}>
                                <Text style={styles.noFiles}>Uploading Files...</Text>
                            </View>
                        :   
                            <>
                                {files.length === 0 ? 
                                    <View style={styles.noFileCon}>
                                        <Text style={styles.noFiles}>No Files Selected</Text>
                                        <Text style={{
                                            color: '#593060', 
                                            marginLeft: 'auto', 
                                            marginRight: 'auto',
                                            marginTop: '5%',
                                            fontSize: 15
                                        }}>Note: press and hold a document to select multiple</Text>
                                        <Text style={{
                                            color: '#593060', 
                                            marginLeft: 'auto', 
                                            marginRight: 'auto',
                                            marginTop: '5%',
                                            fontSize: 15
                                        }}>Note: tap desired images to select mutliple</Text>
                                    </View>
                                :
                                    <View style={styles.scrollCon}>
                                        <ScrollView keyboardShouldPersistTaps="handled">
                                            {renderFiles()}
                                        </ScrollView>
                                    </View>
                                }
                            </>
                        }
                    <View style={styles.buttonCon}>
                        <YellowButton
                          size="sm"
                          label="Select File"
                          onPress={() => selectFile()}
                          style={isTablet ? tabletStyles.actionButton : undefined}
                          icon={faFile}
                        />
                        <YellowButton
                          size="sm"
                          label="Select Photo"
                          onPress={() => selectImage()}
                          style={isTablet ? tabletStyles.actionButton : undefined}
                          icon={faImage}
                        />
                    </View>
                    <View style={styles.wrapperContainer}>
                        <YellowButton
                          size="md"
                          label="Upload Files"
                          onPress={save.open}
                          dimmed={files.length === 0}
                          disabled={files.length === 0}
                          icon={faCloudArrowUp}
                        />
                    </View>
                </View>
                </ContentShell>
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
        fontSize: 20
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
        alignItems: 'center',
        marginBottom: '3%',
        width: '100%',
        paddingHorizontal: 8,
    },
    wrapperContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginBottom: 8,
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
        flex: 1,
        width: '95%',
        borderBottomWidth: 1,
        borderColor: 'black',
        marginBottom: 16
    },
    noFileCon: {
        flex: 1,
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
})

const tabletStyles = StyleSheet.create({
    actionButton: {
        maxWidth: '100%',
    },
})