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

const Staging = ({staging, reset, folders, deleteFile, renameFile, moveFile, userFiles}) => {

    const [focusedFile, setFocusedFile] = useState()
    const [alphaSortedFiles, setAlphaSortedFiles] = useState([])

    const insets = useSafeAreaInsets()

    useEffect(() => {
        if (focusedFile) {
            const newFile = userFiles.filter(fileRef => fileRef.fileId === focusedFile.fileId)
            setFocusedFile(newFile[0])
        }

    }, [userFiles])

    //alpha sort the subfolders
    useEffect(() => {
        if (staging) {
            if (Array.isArray(staging)) {
                const sortedFiles = staging.sort((a, b) => {
                    const aFirst = (a.fileName?.[0] ?? "").toLowerCase();
                    const bFirst = (b.fileName?.[0] ?? "").toLowerCase();

                    const isALetter = /^[a-z]/.test(aFirst);
                    const isBLetter = /^[a-z]/.test(bFirst);

                    // Prioritize numbers first
                    if (!isALetter && isBLetter) return -1;
                    if (isALetter && !isBLetter) return 1;

                    // If both start with numbers, compare numerically
                    if (!isALetter && !isBLetter) {
                        const numA = parseInt(aFirst, 10);
                        const numB = parseInt(bFirst, 10);
                        return numA - numB;
                    }

                    // If both start with letters, compare alphabetically
                    return a.fileName.localeCompare(b.fileName, undefined, { numeric: true });
                })

                setAlphaSortedFiles(sortedFiles)
            } else {
                alert('staging is not an array')
            }
        }
    }, [staging])

  return (
    <>
        {focusedFile ?
                <FocusedFileComp file={focusedFile} focus={setFocusedFile} deleteFile={deleteFile} renameFileFunction={renameFile} folders={folders} handleFileMove={moveFile}/> 
        :
        <View style={{
                height: '100%',
                paddingTop: '5%',
                paddingBottom: '5%',
                position: 'absolute',
                top: 0,
                backgroundColor: '#FFFCF6',
                paddingTop: insets.top,
                paddingBottom: insets.bottom
            }}>
            <View style={styles.title}>
                <Text style={styles.header}>Files to be filed</Text>
                <TouchableOpacity style={{marginLeft: '10%', paddingTop: '5%'}} onPressOut={() => reset(false)}>
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
        display: 'flex', 
        flexDirection: 'row',
        marginBottom: '15%'
    },
    header: {
        color: '#593060',
        fontSize: 30,
        marginLeft: '25%',
        width: '60%',
        fontWeight: '600'
    }
})