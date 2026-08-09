import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, {useEffect, useState} from 'react'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFile, faFileAudio, faFileLines, faFilePdf, faImage, faVideo } from '@fortawesome/free-solid-svg-icons';

import { getFileDownloadURL } from '../../firebase/cloudStorage';
import { getFile } from '../../firebase/firestore';
import { tabletStyle, useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import {
  fileSystemRowStyles,
  FILE_SYSTEM_ROW_ACTIVE_OPACITY,
} from './fileSystemRowStyles';
import { Brand } from '../../constants/layout';
import { Image } from 'expo-image';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const File = ({file, focus}) => {
  const { isTablet, contentMaxWidth } = useResponsiveLayout()

  const [fileName, setFileName] = useState(file.fileName.split('.')[0] + (file.version > 0 ? ` (${file.version}).${file.fileName.split('.')[1]}` : '.' + file.fileName.split('.')[1]))
  const [thumbnailURL, setThumbnailURL] = useState()
  const [fileType, setFileType] = useState('')

  useEffect(() => {
    setFileName(file.fileName.split('.')[0] + (file.version > 0 ? ` (${file.version}).${file.fileName.split('.')[1]}` : '.' + file.fileName.split('.')[1]))

    const nextType = file.fileName.split('.')[1]
    setFileType(nextType)

    const getImageURL = async (target) => {
      const fileObj = await getFile(target.fileId)
      if (fileObj.thumbnailUri) {
        const url = await getFileDownloadURL(fileObj.thumbnailUri)
        setThumbnailURL(url)
      } else {
        setThumbnailURL(false)
      }
    }

    if ((nextType === 'jpg' || nextType === 'png' || nextType === 'jpeg' || nextType === 'JPG' || nextType === 'JPEG' || nextType === 'PNG') && file) {
      getImageURL(file)
    } else {
      setThumbnailURL(false)
    }
  }, [file])

  const iconForType = () => {
    if (fileType === 'pdf') return faFilePdf
    if (fileType === 'mp3' || fileType === 'mp4a' || fileType === 'm4a') return faFileAudio
    if (fileType === 'txt') return faFileLines
    if (fileType === 'mov' || fileType === 'mp4') return faVideo
    if (fileType === 'jpg' || fileType === 'png' || fileType === 'jpeg' || fileType === 'JPG' || fileType === 'PNG' || fileType === 'JPEG') {
      return faImage
    }
    return faFile
  }

  return (
    <TouchableOpacity
      activeOpacity={FILE_SYSTEM_ROW_ACTIVE_OPACITY}
      style={tabletStyle(
        isTablet,
        [fileSystemRowStyles.row, fileSystemRowStyles.rowFile],
        {
          width: '100%',
          maxWidth: contentMaxWidth,
          alignSelf: 'center',
        }
      )}
      onPress={() => focus(file)}
    >
      <View style={fileSystemRowStyles.main}>
        {thumbnailURL ? (
          <View style={fileSystemRowStyles.thumb}>
            <Image
              style={fileSystemRowStyles.thumbImage}
              source={thumbnailURL}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
          </View>
        ) : (
          <View style={[fileSystemRowStyles.iconHolder, fileSystemRowStyles.iconHolderFile]}>
            <FontAwesomeIcon icon={iconForType()} color={Brand.purple} size={20} />
          </View>
        )}
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[fileSystemRowStyles.label, fileSystemRowStyles.labelFile]}
        >
          {fileName}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default File
