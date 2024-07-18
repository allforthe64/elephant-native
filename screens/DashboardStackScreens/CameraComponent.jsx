import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const CameraComponent = () => {
  return (
    <View style={styles.container}>
      <Text>CameraComponent</Text>
    </View>
  )
}

export default CameraComponent

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})