import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const ThankYou = () => {
  return (
    <View style={styles.container}>
      <Text>Thank you!</Text>
    </View>
  )
}

export default ThankYou

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'Black'
    }
})