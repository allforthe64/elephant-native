import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const Notepad = () => {
  return (
    <View style={styles.container}>
      <Text>Notepad</Text>
    </View>
  )
}

export default Notepad

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})