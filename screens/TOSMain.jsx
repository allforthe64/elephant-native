import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native'

import Icon from 'react-native-vector-icons/FontAwesome6'
import { useNavigation } from '@react-navigation/native'

const TOSMain = () => {

  const navigation = useNavigation()

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
    >

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <Icon
          name="arrow-left"
          size={16}
          color="#FFFFFF"
          style={{ marginRight: 8 }}
        />

        <Text style={styles.backButtonText}>
          Back to home page
        </Text>
      </TouchableOpacity>

      <Text style={styles.mainTitle}>
        Terms of Service
      </Text>

      <Text style={styles.lastUpdated}>
        Last Updated: April 15, 2024
      </Text>

      {/* Intro */}
      <View style={styles.section}>

        <Text style={styles.paragraph}>
          These Terms of Service (these <Text style={styles.bold}>“Terms”</Text>) describe your rights and responsibilities as a customer of our Services
          (as defined in Section 2.1). These Terms are between you and 1000347016 Ontario Inc. (<Text style={styles.bold}>“MyElephantApp”</Text>,
          <Text style={styles.bold}>“we”</Text>, or <Text style={styles.bold}>“us”</Text>). <Text style={styles.bold}>“You”</Text> means the entity you represent in accepting these Terms or, if that does not apply, you
          individually. If you are accepting on behalf of your employer or another entity, you represent and warrant that: (a)
          you have the full legal authority to bind your employer or such entity to these Terms; (b) you have read and
          understood these Terms; and (c) you agree to these Terms on behalf of the party that you represent. If you don’t
          have the legal authority to bind your employer or the applicable entity, please do not click the “I agree” (or similar
          button or checkbox) that is presented to you.
        </Text>

        <Text style={styles.paragraph}>
          PLEASE NOTE THAT IF YOU SIGN UP FOR A SERVICE USING AN EMAIL ADDRESS FROM YOUR
          EMPLOYER OR ANOTHER ENTITY, THEN (I) YOU WILL BE DEEMED TO REPRESENT SUCH PARTY; (II)
          YOUR CLICK TO ACCEPT WILL BIND YOUR EMPLOYER OR THAT ENTITY TO THESE TERMS; AND (III)
          THE WORD “YOU” IN THESE TERMS WILL REFER TO YOUR EMPLOYER OR THAT ENTITY.
        </Text>

      </View>

      {/* 1 */}
      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          1. Legal Agreement
        </Text>

        <View style={styles.sectionContent}>

          <Text style={styles.paragraphIndented}>
            <Text style={styles.bold}>1.1 Acceptance of Our Terms:</Text> These Terms are effective as of the date you first click “I agree” (or a similar
            button or checkbox) or use or access the Services, whichever is earlier. These Terms do not have to be
            signed in order to be binding. You indicate your assent to these Terms by clicking “I agree” (or a similar
            button or checkbox) at the time you register for a Service. For greater certainty, these Terms include any
            hyperlinks hereto and any other document executed by the parties that incorporate these Terms by
            reference. <Text style={styles.bold}>If you do not agree with, or cannot comply with, these Terms, then you may not use
            the Services.</Text>
          </Text>

          <Text style={styles.paragraphIndented}>
            <Text style={styles.bold}>1.2 Personal Information:</Text> You acknowledge and agree that by providing us with your personal information,
            using our Services, or otherwise interacting with us, you consent to the collection, use, and disclosure of
            such information in accordance with our Privacy Policy, and for the purposes identified to you at the time
            you provide the personal information. To view our Privacy Policy, please view the below document.
          </Text>

          <Text style={styles.paragraphIndented}>
            <Text style={styles.bold}>1.3 Changes to the Services or these Terms:</Text> We reserve the right to update, change, or replace any part of
            the Services or these Terms by posting updates and/or changes to the website. It is your responsibility
            to check our website periodically for changes. Your continued use of or access to the Services following
            the posting of any change(s) constitutes acceptance of those changes.
          </Text>

          <Text style={styles.paragraphIndented}>
            <Text style={styles.bold}>1.4 International Use:</Text> Accessing the Services in certain countries may not be lawful, and we make no
            representation that the Services are appropriate or available for use in locations outside Canada. If you
            choose to access the Services from outside Canada, you do so at your own risk and initiative and are
            responsible for compliance with any applicable local laws.
          </Text>

        </View>
      </View>

      {/* Continue converting remaining sections exactly the same way */}

      <View style={styles.bottomButtonContainer}>

        <TouchableOpacity
          style={[styles.backButton, styles.bottomButton]}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Icon
            name="arrow-left"
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />

          <Text style={styles.bottomButtonText}>
            Back to home page
          </Text>

        </TouchableOpacity>

      </View>

    </ScrollView>
  )
}

export default TOSMain

const styles = StyleSheet.create({

  container: {
    width: '100%',
    paddingHorizontal: '10%',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF'
  },

  backButton: {
    backgroundColor: '#44154B',
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 64
  },

  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500'
  },

  mainTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8
  },

  lastUpdated: {
    color: '#6B7280',
    marginBottom: 32,
    fontSize: 14
  },

  section: {
    marginBottom: 40
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16
  },

  sectionContent: {
    paddingLeft: 24
  },

  paragraph: {
    fontSize: 14,
    lineHeight: 24,
    color: '#1F2937',
    marginBottom: 16
  },

  paragraphIndented: {
    fontSize: 14,
    lineHeight: 24,
    color: '#1F2937',
    marginBottom: 16,
    paddingLeft: 24
  },

  bold: {
    fontWeight: '700'
  },

  bottomButtonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 64
  },

  bottomButton: {
    marginBottom: 64
  },

  bottomButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '500'
  }
})