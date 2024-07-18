import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const DashMain = () => {
  return (
    <View style={styles.container}>
      <Text>Dashboard</Text>
    </View>
  )
}

export default DashMain

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})