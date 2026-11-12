import React, { useState } from 'react'
import { ScrollView, View, Text, StyleSheet, Linking } from 'react-native'
import { List } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native'
import { useToast } from 'react-native-toast-notifications'
import { faArrowUpRightFromSquare, faPaperPlane } from '@fortawesome/free-solid-svg-icons'

import ContentShell from '../components/ui/ContentShell'
import YellowButton from '../components/ui/YellowButton'
import CancelSubscriptionConfirm from '../components/account/CancelSubscriptionConfirm'
import { firebaseAuth } from '../firebaseConfig'
import { cancelSubscriptionAndDeleteAccount } from '../firebase/account'
import { useUserDoc } from '../hooks/useUserDoc'
import { useResponsiveLayout, tabletStyle } from '../hooks/useResponsiveLayout'
import { Brand } from '../constants/layout'

const WEB_MANAGE_ACCOUNT_URL = 'https://www.myelephantapp.com/manage-account'
const WEB_CONTACT_URL = 'https://www.myelephantapp.com/contact'

const PLAN_PRICES = {
  monthly: '$4.00/month',
  annual: '$40/1 Year',
}

const formatPlan = (planId) => {
  const price = PLAN_PRICES[planId]
  if (!price) return 'Unknown'
  return `${planId.charAt(0).toUpperCase()}${planId.slice(1)} (${price})`
}

const ManageAccount = () => {
  const navigation = useNavigation()
  const toast = useToast()
  const userDoc = useUserDoc()
  const { isTablet } = useResponsiveLayout()

  const [expanded, setExpanded] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const toggle = (panel) => setExpanded(expanded === panel ? null : panel)

  const cancelSubscription = async () => {
    setDeleting(true)
    try {
      await cancelSubscriptionAndDeleteAccount()
    } catch (err) {
      console.warn('Cancel subscription failed:', err?.message || err)
      setDeleting(false)
      toast.show('Failed to delete account', { type: 'danger' })
      return
    }

    try {
      await firebaseAuth.signOut()
    } catch (err) {
      console.warn('Sign out after account deletion failed:', err?.message || err)
    }
    setDeleting(false)
    setConfirmOpen(false)
    navigation.navigate('Home')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={tabletStyle(isTablet, styles.content, tabletStyles.content)}>
      {confirmOpen && (
        <CancelSubscriptionConfirm
          loading={deleting}
          onConfirm={cancelSubscription}
          onClose={() => setConfirmOpen(false)}
        />
      )}
      <ContentShell variant="content">
        <Text style={styles.title}>Manage your account</Text>

        <List.Accordion
          title="Change your subscription type"
          expanded={expanded === 'change'}
          onPress={() => toggle('change')}
          titleStyle={styles.accordionTitle}
          titleNumberOfLines={2}
          style={styles.accordion}
        >
          <View style={styles.details}>
            <Text style={styles.paragraph}>
              Current Subscription: <Text style={styles.plan}>{formatPlan(userDoc?.paymentPlan)}</Text>
            </Text>
            <Text style={styles.paragraph}>
              Subscription changes are made on the My Elephant App website.
            </Text>
            <YellowButton
              size="md"
              icon={faArrowUpRightFromSquare}
              label="Change on website"
              onPress={() => Linking.openURL(WEB_MANAGE_ACCOUNT_URL)}
            />
          </View>
        </List.Accordion>

        <List.Accordion
          title="Cancel your subscription"
          expanded={expanded === 'cancel'}
          onPress={() => toggle('cancel')}
          titleStyle={[styles.accordionTitle, styles.dangerText]}
          titleNumberOfLines={2}
          style={styles.accordion}
        >
          <View style={styles.details}>
            <Text style={styles.subheading}>We’re sorry to see you go!</Text>
            <Text style={styles.paragraph}>
              Cancelling your subscription is an <Text style={styles.dangerText}>irreversible</Text> action. If you
              haven’t done so already, we recommend that you save all files stored on My Elephant App to your
              phone or computer. After you cancel your subscription, all of your data will be removed from My
              Elephant App within a week.
            </Text>

            <Text style={styles.subheading}>Before you leave...</Text>
            <Text style={styles.paragraph}>
              If there is any feedback you would like to provide us with, or if you would like to tell us your reason
              for cancelling your subscription, hit the button below and fill out the contact form. We’re always
              looking to improve My Elephant App, and your feedback is crucial to us as we work to continue building
              the platform.
            </Text>
            <YellowButton
              size="md"
              icon={faPaperPlane}
              label="Contact us"
              onPress={() => Linking.openURL(WEB_CONTACT_URL)}
            />
            <YellowButton
              size="md"
              variant="danger"
              label="Cancel Subscription"
              onPress={() => setConfirmOpen(true)}
              style={styles.cancelButton}
            />
          </View>
        </List.Accordion>
      </ContentShell>
    </ScrollView>
  )
}

export default ManageAccount

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingBottom: 80,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 24,
  },
  accordion: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: Brand.purple,
    overflow: 'hidden',
  },
  accordionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  details: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  subheading: {
    color: '#808080',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: Brand.purple,
    marginBottom: 16,
  },
  plan: {
    fontWeight: '700',
  },
  dangerText: {
    color: Brand.danger,
  },
  cancelButton: {
    marginTop: 32,
  },
})

const tabletStyles = StyleSheet.create({
  content: {
    paddingHorizontal: 32,
    paddingBottom: 96,
  },
})
