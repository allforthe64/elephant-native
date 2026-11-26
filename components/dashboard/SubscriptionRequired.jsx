import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import ContentShell from '../ui/ContentShell'
import AppPressable from '../ui/AppPressable'
import { firebaseAuth } from '../../firebaseConfig'
import { Brand } from '../../constants/layout'

/**
 * Shown when the signed-in user has no active subscription (hasPaid !== true).
 * No external payment CTA — Play policy discourages steering to web checkout.
 */
const SubscriptionRequired = ({ loading = false }) => {
  const navigation = useNavigation()

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Brand.purple} size="large" />
        <Text style={styles.loadingText}>Loading your account...</Text>
      </View>
    )
  }

  const signOut = async () => {
    try {
      await firebaseAuth.signOut()
    } catch (err) {
      console.warn('Sign out failed:', err?.message || err)
    }
    navigation.navigate('Home')
  }

  return (
    <View style={styles.center}>
      <ContentShell variant="form">
        <Text style={styles.title}>Subscription required</Text>
        <Text style={styles.body}>
          An active My Elephant subscription is required to use this app. If you already have a
          subscription, sign out and sign back in after it is active on your account.
        </Text>
        <AppPressable onPress={signOut} style={styles.signOut} accessibilityLabel="Sign Out">
          <Text style={styles.signOutText}>Sign Out</Text>
        </AppPressable>
      </ContentShell>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: Brand.cream,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    color: Brand.purple,
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Brand.purple,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: Brand.purple,
    textAlign: 'center',
    marginBottom: 28,
  },
  signOut: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  signOutText: {
    color: Brand.danger,
    fontSize: 18,
    fontWeight: '600',
  },
})

export default SubscriptionRequired
