import { StyleSheet, Text, View } from 'react-native'
import React, {useMemo, useState} from 'react'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

//file system component imports
import FocusedFileComp from './FocusedFileComp'
import File from './File'

//safe area context imports
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { tabletStyle, useResponsiveLayout } from '../../hooks/useResponsiveLayout'
import { sortByName } from '../../utils/sortByName'

const Staging = ({staging, reset, deleteFile, renameFile, moveFile}) => {
    const { isTablet, contentFill } = useResponsiveLayout()
    const insets = useSafeAreaInsets()

    const [focusedFileId, setFocusedFileId] = useState(null)
    const sortedFiles = useMemo(() => sortByName(staging), [staging])
    const focusedFile = focusedFileId ? sortedFiles.find(f => f.fileId === focusedFileId) : undefined

    const focusFile = (file) => setFocusedFileId(file ? file.fileId : null)

  return (
    <>
        {focusedFile ?
                <FocusedFileComp file={focusedFile} focus={focusFile} deleteFile={deleteFile} renameFileFunction={renameFile} handleFileMove={moveFile}/> 
        :
        <View style={tabletStyle(isTablet, {
                flex: 1,
                width: '100%',
                alignSelf: 'stretch',
                backgroundColor: '#FFFCF6',
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingHorizontal: 16,
            }, contentFill)}>
            <View style={styles.title}>
                <Text style={styles.header}>Files to be filed</Text>
                <TouchableOpacity style={styles.closeButton} onPressOut={() => reset(false)}>
                    <FontAwesomeIcon icon={faXmark} size={35} color='#593060' />
                </TouchableOpacity>
            </View>
            <View style={{height: '80%', paddingBottom: '5%'}}>
                {sortedFiles.length > 0 ? 
                    <ScrollView>
                        {sortedFiles.map((file) => <File key={file.fileId} file={file} focus={focusFile}/>)}
                    </ScrollView> 
                    : <Text style={{color: '#593060', marginLeft: 'auto', marginRight: 'auto', marginTop: 'auto', marginBottom: 'auto'}}>No Files to be filed!</Text>
                }
            </View>
        </View>}
    </>
  )
}

export default Staging

const styles = StyleSheet.create({
    title: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
        paddingTop: 8,
    },
    header: {
        color: '#593060',
        fontSize: 28,
        fontWeight: '600',
        flex: 1,
        paddingRight: 12,
    },
    closeButton: {
        padding: 4,
    },
})
