import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import YellowButton from './YellowButton'

/** Shown by the root error boundary instead of a blank screen when rendering fails. */
const CrashFallback = ({ resetError }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Something went wrong</Text>
    <Text style={styles.body}>The problem has been reported. Your saved files are safe.</Text>
    <YellowButton size="md" label="Try Again" onPress={resetError} />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#FFFCF6',
  },
  title: {
    color: '#593060',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: '#593060',
    fontSize: 16,
    textAlign: 'center',
  },
})

export default CrashFallback
