import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const Files = () => {
  return (
    <View style={styles.container}>
      <Text>Files</Text>
    </View>
  )
}

export default Files

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})