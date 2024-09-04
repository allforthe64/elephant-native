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
              <Image source={{uri: thumbnailURL}} width={32} height={32}/>
            : 
              <>
                {fileType === 'pdf' ?
                  <FontAwesomeIcon icon={faFilePdf} color={'white'} size={32} />
                :
                  fileType === 'mp3' || fileType === 'mp4a' ?
                  <FontAwesomeIcon icon={faFileAudio} color={'white'} size={32} />
                :
                  fileType === 'txt' ?
                  <FontAwesomeIcon icon={faFileLines} color={'white'} size={32} />
                :
                  fileType === 'mov' || fileType === 'mp4' ?
                  <FontAwesomeIcon icon={faVideo} color={'white'} size={32} />
                :
                  <FontAwesomeIcon icon={faFile} color={'white'} size={32} />
                }
              </>
            }
            <Text numberOfLines={1} style={styles.fileName}>{fileName}</Text>
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
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    width: '90%',
    paddingBottom: '1.5%',
    marginBottom: '8%'
    },
    fileTitle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    },
    fileName: {
    color: 'white',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    paddingTop: '4%',
    width: '70%'
    }
})