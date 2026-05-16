import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking
} from 'react-native'

import Icon from 'react-native-vector-icons/FontAwesome6'
import { useNavigation } from '@react-navigation/native'

const PrivacyMain = () => {

  //instantiate router object
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
        Privacy Policy
      </Text>

      <Text style={styles.lastUpdated}>
        Last Updated: April 16, 2026
      </Text>

      <Text style={styles.grayParagraph}>
        This Privacy Policy explains how 1000347016 Ontario Inc. (<Text style={styles.bold}>“MyElephantApp,”</Text> <Text style={styles.bold}>“we,”</Text> or <Text style={styles.bold}>“us”</Text>) collects and uses
        personal information through our services, application and website, however accessed. <Text style={styles.bold}>“Personal information”</Text>
        means information about an identifiable individual (sometimes called <Text style={styles.bold}>“your information”</Text>). By using our
        services, application or website, or otherwise providing your personal information to us, you agree to our
        handling of personal information as set out in this Privacy Policy.
      </Text>

      <Text style={styles.grayParagraph}>
        This Privacy Policy applies globally, but we have included additional information below for residents of the
        European Economic Area, the United Kingdom, Switzerland, and California.
      </Text>

      <Text style={styles.grayParagraph}>
        This Privacy Policy does not apply to de-identified, anonymous, or business contact information. Note that when
        you provide us with your personal information on a platform not owned by us, your information may be governed
        by the privacy policy and practices of that platform.
      </Text>

      {/* 1. Consent */}
      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          1. Consent
        </Text>

        <View style={styles.sectionContent}>

          <View style={styles.subSection}>

            <Text style={styles.subHeading}>
              <Text style={styles.bold}>1.1</Text> Obtaining Your Consent
            </Text>

            <Text style={styles.paragraphIndented}>
              We only collect information by lawful means. As part of using our services or
              interacting with us, we may collect and process some details about you. When we do so, we will collect, use, or
              share your personal information with your consent for the purposes identified or as otherwise permitted or
              required by law. In compliance with our privacy obligations, we may obtain your permission through this Privacy
              Policy or through other means (such as express verbal or written consent). However, in some situations, the law
              allows us to collect, use, or disclose personal information without your consent.
            </Text>

          </View>

          <View style={styles.subSection}>

            <Text style={styles.subHeading}>
              <Text style={styles.bold}>1.2</Text> Withdrawing Your Consent
            </Text>

            <Text style={styles.paragraphIndented}>
              Withdrawing Your Consent. You can withdraw your consent to the collection, use, or disclosure of your
              information at any time. However, in some cases withdrawing consent will mean that we can no longer provide
              you with certain services or perform certain tasks where the information is required to do so. You may withdraw
              your consent by [contacting us] and, subject to any legal constraints, we will comply with your request.
            </Text>

          </View>

        </View>

      </View>

      {/* 2. Information Collection */}
      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          2. What Information Do We Collect and Why
        </Text>

        <View style={styles.sectionContent}>

          <View style={styles.subSection}>

            <Text style={styles.subHeading}>
              <Text style={styles.bold}>2.1</Text> When You Provide Information To Us
            </Text>

            <Text style={styles.paragraphIndented}>
              We collect the personal information you provide us, such as when
              you: (a) create an account; (b) use our services; (c) download our application; (d) visit our website; (e) sign up
              for special offers or complete a survey; or (f) communicate with us, including by phone, email, video call,
              messaging, or social media. This information usually includes contact information like your name, address,
              email, and phone number. It may also include account and demographic information, employment information,
              and any other information you choose to provide. We use this information to:
            </Text>

            <View style={styles.listContainer}>

              <Text style={styles.listItem}>• Provide our products and services;</Text>
              <Text style={styles.listItem}>• Process payments;</Text>
              <Text style={styles.listItem}>• Operate our business and improve our products and services;</Text>
              <Text style={styles.listItem}>• Identify and authenticate you;</Text>

              <Text style={styles.listItem}>
                • Communicate with you about our products or services and provide you with information about them that
                may be of interest to you;
              </Text>

              <Text style={styles.listItem}>
                • Prevent, detect, or investigate security concerns and illegal activity including fraud; and
              </Text>

              <Text style={styles.listItem}>
                • Comply with applicable laws, regulations, or industry requirements.
              </Text>

            </View>

          </View>

          <View style={styles.subSection}>

            <Text style={styles.subHeading}>
              <Text style={styles.bold}>2.2</Text> When You Visit Our Website.
            </Text>

            <Text style={styles.paragraphIndented}>
              We may use a number of cookies and analytics tools that collect personal
              information when you visit the website or consent to receive our marketing emails. When you visit the website,
              this includes information about how you use the website, information about your device and browser, your IP
              address, and the web pages you visited before and after visiting the website. We use this information to:
            </Text>

            <View style={styles.listContainer}>

              <Text style={styles.listItem}>
                • Communicate with you about our products or services and provide you with information about them that
                may be of interest to you;
              </Text>

              <Text style={styles.listItem}>
                • Analyze and improve the functionality of our website and marketing efforts;
              </Text>

              <Text style={styles.listItem}>
                • Improve our products, services, and business; and
              </Text>

              <Text style={styles.listItem}>
                • Protect the rights, property, and safety of MyElephantApp, our employees, or other stakeholders.
              </Text>

              <Text style={styles.listItem}>
                • For further information on these tools, how they collect your information, and your control over them,
                see Section 4 below.
              </Text>

            </View>

          </View>

        </View>

      </View>

      {/* 4. Cookies */}
      <View style={styles.section}>

        <Text style={styles.sectionTitle}>
          4. COOKIES; WEB ANALYTICS
        </Text>

        <View style={styles.sectionContent}>

          <Text style={styles.subHeading}>
            4.1 We may share your information to deliver our products or services or to enhance your customer
            experience. More specifically, we share your information with third parties in the following circumstances:
          </Text>

          <View style={styles.listContainer}>

            <Text style={styles.listItem}>
              • We may use “cookies” and similar technologies such as web beacons, clear gifs, and embedded scripts
              on this website.
            </Text>

            <Text style={styles.listItem}>
              • Many web browsers provide the capability to configure your cookie settings including disabling or
              deleting them.
            </Text>

            <Text style={styles.listItem}>
              • For more information on cookies and how to manage them, check the support pages for your browser or
            </Text>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://allaboutcookies.org/')}
              activeOpacity={0.7}
            >
              <Text style={styles.link}>
                AllAboutCookies.org
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </View>

      {/* Continue remaining sections exactly the same structure */}

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

export default PrivacyMain

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

  grayParagraph: {
    color: '#6B7280',
    marginBottom: 32,
    fontSize: 14,
    lineHeight: 24
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

  subSection: {
    marginBottom: 16
  },

  subHeading: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8
  },

  paragraphIndented: {
    fontSize: 14,
    lineHeight: 24,
    color: '#1F2937',
    paddingLeft: 24
  },

  paragraph: {
    fontSize: 14,
    lineHeight: 24,
    color: '#1F2937',
    marginBottom: 16
  },

  bold: {
    fontWeight: '700'
  },

  listContainer: {
    paddingLeft: 48,
    marginTop: 8
  },

  listItem: {
    fontSize: 14,
    lineHeight: 24,
    color: '#1F2937',
    marginBottom: 4
  },

  link: {
    fontSize: 14,
    lineHeight: 24,
    textDecorationLine: 'underline',
    color: '#1F2937'
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