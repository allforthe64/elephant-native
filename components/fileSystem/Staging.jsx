import { StyleSheet, Text, View } from 'react-native'
import React, {useEffect, useState} from 'react'
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

const Staging = ({staging, reset, folders, deleteFile, renameFile, moveFile, userFiles}) => {
    const { isTablet, contentMaxWidth } = useResponsiveLayout()

    const [focusedFile, setFocusedFile] = useState()
    const [alphaSortedFiles, setAlphaSortedFiles] = useState([])

    const insets = useSafeAreaInsets()

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

    useEffect(() => {
        if (focusedFile) {
            const newFile = userFiles.filter(fileRef => fileRef.fileId === focusedFile.fileId)
            setFocusedFile(newFile[0])
        }

    }, [userFiles])

    //alpha sort the subfolders
    useEffect(() => {
        try {
            if (staging) {
                if (Array.isArray(staging)) {
                    const sortedFiles = staging.sort((a, b) => {
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

                    setAlphaSortedFiles(sortedFiles)
                } else {
                    alert('staging is not an array')
                }
            }
        } catch (err) {
            alert(err)
        }
    }, [staging])

  return (
    <>
        {focusedFile ?
                <FocusedFileComp file={focusedFile} focus={setFocusedFile} deleteFile={deleteFile} renameFileFunction={renameFile} folders={folders} handleFileMove={moveFile}/> 
        :
        <View style={tabletStyle(isTablet, {
                flex: 1,
                width: '100%',
                alignSelf: 'stretch',
                backgroundColor: '#FFFCF6',
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingHorizontal: 16,
            }, {
                width: '100%',
                maxWidth: contentMaxWidth,
                alignSelf: 'center',
            })}>
            <View style={styles.title}>
                <Text style={styles.header}>Files to be filed</Text>
                <TouchableOpacity style={styles.closeButton} onPressOut={() => reset(false)}>
                    <FontAwesomeIcon icon={faXmark} size={35} color='#593060' />
                </TouchableOpacity>
            </View>
            <View style={{height: '80%', paddingBottom: '5%'}}>
                {alphaSortedFiles.length > 0 ? 
                    <ScrollView>
                        {alphaSortedFiles.map((file, i) => {
                            return <File key={file + i}  file={file} focus={setFocusedFile}/>
                        })}        
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