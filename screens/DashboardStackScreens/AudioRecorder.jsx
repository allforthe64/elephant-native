import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const AudioRecorder = () => {
  return (
    <View style={styles.container}>
      <Text>AudioRecorder</Text>
    </View>
  )
}

export default AudioRecorder

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})