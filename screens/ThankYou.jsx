import { Text, StyleSheet } from 'react-native'
import React from 'react'
import ContentShell from '../components/ui/ContentShell'

const ThankYou = () => {
  return (
    <ContentShell variant="content" fill style={styles.container} innerStyle={styles.centeredContent}>
      <Text>Thank you!</Text>
    </ContentShell>
  )
}

export default ThankYou

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'Black'
    },
    centeredContent: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})