import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, {useEffect, useState} from 'react'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFile, faFileAudio, faFileLines, faFilePdf, faVideo } from '@fortawesome/free-solid-svg-icons';

import { getFileDownloadURL } from '../../firebase/cloudStorage';
import { getFile } from '../../firebase/firestore';

const File = ({file, focus}) => {

  const [fileName, setFileName] = useState(file.fileName.split('.')[0] + (file.version > 0 ? ` (${file.version}).${file.fileName.split('.')[1]}` : '.' + file.fileName.split('.')[1]))
  const [thumbnailURL, setThumbnailURL] = useState()
  const [fileType, setFileType] = useState('')

  useEffect(() => {
    setFileName(file.fileName.split('.')[0] + (file.version > 0 ? ` (${file.version}).${file.fileName.split('.')[1]}` : '.' + file.fileName.split('.')[1]))

    const fileType = file.fileName.split('.')[1]
    setFileType(fileType)

    const getImageURL = async (file) => {

      //get the fileObj
      const fileObj = await getFile(file.fileId)
      
      //get the download url for the jpg and set it into state
      const url = await getFileDownloadURL(fileObj.uri)
      setThumbnailURL(url)
    }

    //if the fileType is a photo, generate the thumbnail url
    if ((fileType === 'jpg' || fileType === 'png' || fileType === 'jpeg') && file) {
      getImageURL(file)
    }
    else {
      setThumbnailURL(false)
    }

  }, [file])

  return (
    <TouchableOpacity style={styles.file} onPress={() => focus(file)}>
        <View style={styles.fileTitle}>
            {thumbnailURL ?
              <Image source={{uri: thumbnailURL}} width={44} height={44} style={{borderRadius: 100}}/>
            : 
              <>
                {fileType === 'pdf' ?
                  <View style={styles.iconHolder}>
                    <FontAwesomeIcon icon={faFilePdf} color={'#593060'} size={22} />
                  </View>
                :
                  fileType === 'mp3' || fileType === 'mp4a' ?
                  <View style={styles.iconHolder}>
                    <FontAwesomeIcon icon={faFileAudio} color={'#593060'} size={22} />
                  </View>
                :
                  fileType === 'txt' ?
                  <View style={styles.iconHolder}>
                    <FontAwesomeIcon icon={faFileLines} color={'#593060'} size={22} />
                  </View>
                :
                  fileType === 'mov' || fileType === 'mp4' ?
                  <View style={styles.iconHolder}>
                    <FontAwesomeIcon icon={faVideo} color={'#593060'} size={22} />
                  </View>
                :
                  <View style={styles.iconHolder}>
                    <FontAwesomeIcon icon={faFile} color={'#593060'} size={22} />
                  </View>
                }
              </>
            }
            <View style={styles.fileNameHolder}>
              <Text numberOfLines={1} style={styles.fileName}>{fileName}</Text>
            </View>
        </View>
    </TouchableOpacity>
  )
}

export default File

const styles = StyleSheet.create({

    //filing styles
    file: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingRight: '2%',
    flexDirection: 'row',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#DDCADB',
    width: '90%',
    paddingBottom: '2%',
    paddingTop: '2%',
    paddingLeft: '2%',
    marginBottom: '2%',
    borderRadius: 100
    },
    fileTitle: {
    display: 'flex',
    flexDirection: 'row',
    width: '80%',
    },
    fileNameHolder: {
      width: '80%',
      paddingTop: '2.5%'
    },  
    fileName: {
      color: '#593060',
      textAlign: 'center',
      fontSize: 22,
      fontWeight: '500',
      marginLeft: '5%'
    },
    iconHolder: {
      backgroundColor: 'white',
      height: 44,
      width: 44,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 100
    }
})