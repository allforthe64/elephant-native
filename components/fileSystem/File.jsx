import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, {useEffect, useState} from 'react'

//fontAwesome imports
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';

const File = ({file, focus}) => {

  const [fileName, setFileName] = useState(file.fileName.split('.')[0] + (file.version > 0 ? ` (${file.version}).${file.fileName.split('.')[1]}` : '.' + file.fileName.split('.')[1]))

  useEffect(() => {
    setFileName(file.fileName.split('.')[0] + (file.version > 0 ? ` (${file.version}).${file.fileName.split('.')[1]}` : '.' + file.fileName.split('.')[1]))
  }, [file])

  return (
    <TouchableOpacity style={styles.file} onPress={() => focus(file)}>
        <View style={styles.fileTitle}>
            <FontAwesomeIcon icon={faFile} color={'white'} size={32} />
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