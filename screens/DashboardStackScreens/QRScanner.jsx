import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const QRScanner = () => {
  return (
    <View style={styles.container}>
      <Text>QRScanner</Text>
    </View>
  )
}

export default QRScanner

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})