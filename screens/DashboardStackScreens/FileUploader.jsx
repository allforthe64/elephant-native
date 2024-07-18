import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const FileUploader = () => {
  return (
    <View style={styles.container}>
      <Text>FileUploader</Text>
    </View>
  )
}

export default FileUploader

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})