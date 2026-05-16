import React from 'react'
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native'

import { useNavigation } from '@react-navigation/native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const PrivacyMain = () => {

  //instantiate router object
  const navigation = useNavigation()

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <FontAwesomeIcon icon={faArrowLeft} size={16} color="#FFFFFF" />
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

      <Text style={styles.paragraph}>
        This Privacy Policy explains how 1000347016 Ontario Inc. ({'\n'}
        <Text style={styles.bold}>“MyElephantApp,”</Text>{' '}
        <Text style={styles.bold}>“we,”</Text> or{' '}
        <Text style={styles.bold}>“us”</Text>) collects and uses
        personal information through our services, application and website, however accessed.{' '}
        <Text style={styles.bold}>“Personal information”</Text>
        {' '}means information about an identifiable individual (sometimes called{' '}
        <Text style={styles.bold}>“your information”</Text>). By using our
        services, application or website, or otherwise providing your personal information to us, you agree to our
        handling of personal information as set out in this Privacy Policy.
      </Text>

      <Text style={styles.paragraph}>
        This Privacy Policy applies globally, but we have included additional information below for residents of the
        European Economic Area, the United Kingdom, Switzerland, and California.
      </Text>

      <Text style={styles.paragraph}>
        This Privacy Policy does not apply to de-identified, anonymous, or business contact information. Note that when
        you provide us with your personal information on a platform not owned by us, your information may be governed
        by the privacy policy and practices of that platform.
      </Text>

      {/* 1. Consent */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          1. Consent
        </Text>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>
            <Text style={styles.bold}>1.1</Text> Obtaining Your Consent
          </Text>

          <Text style={styles.indentedParagraph}>
            We only collect information by lawful means. As part of using our services or
            interacting with us, we may collect and process some details about you. When we do so, we will collect, use, or
            share your personal information with your consent for the purposes identified or as otherwise permitted or
            required by law. In compliance with our privacy obligations, we may obtain your permission through this Privacy
            Policy or through other means (such as express verbal or written consent). However, in some situations, the law
            allows us to collect, use, or disclose personal information without your consent.
          </Text>
        </View>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>
            <Text style={styles.bold}>1.2</Text> Withdrawing Your Consent
          </Text>

          <Text style={styles.indentedParagraph}>
            Withdrawing Your Consent. You can withdraw your consent to the collection, use, or disclosure of your
            information at any time. However, in some cases withdrawing consent will mean that we can no longer provide
            you with certain services or perform certain tasks where the information is required to do so. You may withdraw
            your consent by [contacting us] and, subject to any legal constraints, we will comply with your request.
          </Text>
        </View>
      </View>

      {/* 2. Information Collection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          2. What Information Do We Collect and Why
        </Text>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>
            <Text style={styles.bold}>2.1</Text> When You Provide Information To Us
          </Text>

          <Text style={styles.indentedParagraph}>
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
          <Text style={styles.subSectionTitle}>
            <Text style={styles.bold}>2.2</Text> When You Visit Our Website.
          </Text>

          <Text style={styles.indentedParagraph}>
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

      {/* 3. Sharing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          3. When and Why We Share Personal Information
        </Text>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>
            <Text style={styles.bold}>3.1</Text> We may share your information to deliver our products or services or to enhance your customer
            experience. More specifically, we share your information with third parties in the following circumstances:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              • Other users of the services, such as a recruiter or referrer, as part of our delivery of the services;
            </Text>

            <Text style={styles.listItem}>
              • With third party service providers who perform functions on our behalf, such as payment processor,
              website hosting, cloud storage services, marketing, product and service delivery, or analytics services;
            </Text>

            <Text style={styles.listItem}>
              • With business partners where it is relevant to a potential or actual business transaction, such as the sale
              of part or all of MyElephantApp, a merger, acquisition, or corporate reorganization;
            </Text>

            <Text style={styles.listItem}>
              • To prevent, detect, or investigate security concerns or illegal activity including fraud;
            </Text>

            <Text style={styles.listItem}>
              • To comply with applicable laws, regulations, or industry requirements.
            </Text>
          </View>

          <Text style={styles.indentedParagraph}>
            We do <Text style={styles.bold}>not</Text> sell your personal information to third parties.
          </Text>
        </View>
      </View>

      {/* 4. Cookies */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          4. COOKIES; WEB ANALYTICS
        </Text>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>
            4.1 We may share your information to deliver our products or services or to enhance your customer
            experience. More specifically, we share your information with third parties in the following circumstances:
          </Text>

          <View style={styles.listContainer}>
            <Text style={styles.listItem}>
              • We may use “cookies” and similar technologies such as web beacons, clear gifs, and embedded scripts
              on this website. Cookies are essentially small packages of data stored on your internet browser that tell us
              about your browsing behaviour on this website and sometimes other sites. We use both session and persistent
              cookies. We also use both first and third-party cookies. We use that information to monitor the usage of our
              website and improve it, enable certain website functions, and perform analytics. We may also use this
              information to improve our marketing and deliver advertisements to you.
            </Text>

            <Text style={styles.listItem}>
              • Many web browsers provide the capability to configure your cookie settings including disabling or
              deleting them. Please note that if you choose to block all cookies, you may not be able to access or use all or
              parts of our website and/or parts of our website may not function properly. For more information on cookies and
              how to manage them, check the support pages for your browser or{' '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('https://allaboutcookies.org/')}
              >
                AllAboutCookies.org
              </Text>.
            </Text>
          </View>
        </View>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>
            <Text style={styles.bold}>4.2</Text> Web Analytics. We may use web analytics to collect information about the use of our website across
            devices and pages. These tools provide us with information on user behaviour on the website and allow us to
            advertise to users after they leave the website.
          </Text>
        </View>

        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>
            <Text style={styles.bold}>4.3</Text> Do-Not-Track Requests. Because of the rapidly changing state of technology, we cannot make any
            guarantees that our systems will be able to honour Do-Not-Track requests sent by your browser.
          </Text>
        </View>
      </View>

      {/* 5. Security */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          5. Security
        </Text>

        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>5.1</Text> We have implemented administrative, technical, and physical security measures to protect against the
          loss, misuse, and/or alteration of your information. We utilize industry standard storage and protection
          procedures in order to safeguard personal information on servers that are not accessible to the public. No data
          storage or transmission plan is without risk. We cannot guarantee the security of your personal information
          transmitted to our website or application. The safety and security of your information also depend on you. Where
          we have given you (or where you have chosen) a password for access to certain parts of our website or
          application, you are responsible for keeping this password confidential. We ask you not to share your password
        </Text>
      </View>

      {/* 6. International */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          6. International Transfer And Storage
        </Text>

        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>6.1</Text> Some of our service providers and business partners may be based outside of Canada. This means
          your information may be accessible to law enforcement authorities outside of your jurisdiction, in accordance
          with the laws of that jurisdiction.
        </Text>
      </View>

      {/* 7. Retention */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          7. Retention
        </Text>

        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>7.1</Text> We only keep your information as long as it is operationally or legally necessary. After that, we will either
          destroy or anonymize your information.
        </Text>
      </View>

      {/* 8. Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          8. Access and Control of Your Information
        </Text>

        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>8.1 Accessing Your Information:</Text> To request access to your personal information or to correct or delete your
          personal information, submit a written request by [contacting us]. Ensure that the request identifies yourself, the
          information you want to review, and how we can contact you. We may not be able to fulfill your entire request,
          depending on the circumstances, and there may be a charge for copies of your personal information.
        </Text>

        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>8.2 Correcting Your Information:</Text> We will make reasonable efforts to keep your information current and
          accurate. If a change or correction is required, let us know right away. We will make any appropriate updates
          needed. You can review your personal information by accessing your account, reviewing the correspondence
          we send to you, or requesting access to your personal information, as described above.
        </Text>
      </View>

      {/* 9. EU */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          9. Additional Information For European Residents
        </Text>

        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>9.1 Basis for Lawful Processing:</Text> European data protection laws require us to be specific about our reasons
          or grounds for using your personal information. We process the personal information of individuals located in the
          European Economic Area, Switzerland, and the UK on these grounds:
        </Text>

        <View style={styles.listContainer}>
          <Text style={styles.listItem}>
            • <Text style={styles.bold}>Consent:</Text> When you have provided your consent to our collection of your information.
          </Text>

          <Text style={styles.listItem}>
            • <Text style={styles.bold}>Service performance:</Text> When we need to perform the service you have requested or have agreed to
            through contract.
          </Text>

          <Text style={styles.listItem}>
            • <Text style={styles.bold}>Legitimate interests:</Text> When we have a legitimate business or commercial reason for using your
            information, and your interests and your fundamental rights do not override those interests.
          </Text>

          <Text style={styles.listItem}>
            • <Text style={styles.bold}>Legal obligation:</Text> When we need to comply with a legal or regulatory obligation.
          </Text>
        </View>

        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>9.2 Data Subject Rights:</Text> In addition to the abilities to access, correct, and delete personal information as
          described above, European residents may also be entitled, depending on the circumstances, to one or both of
          the following rights:
        </Text>

        <View style={styles.listContainer}>
          <Text style={styles.listItem}>
            • <Text style={styles.bold}>Restrict processing:</Text> The right to request that we limit or cease the processing of your information.
          </Text>

          <Text style={styles.listItem}>
            • <Text style={styles.bold}>Portability:</Text> The right to request that we transfer your information that we have collected to another
            organization or directly to you.
          </Text>
        </View>

        <Text style={styles.paragraph}>
          We may process your personal information on more than one ground depending on the reasons or
          grounds for using your personal information. Please [contact us] if you need details about the specific
          grounds we are relying on to process your personal information.
        </Text>
      </View>

      {/* 10. California */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          10. Additional Information For California Residents
        </Text>

        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>10.1 If you are a California Resident:</Text> you can make certain requests regarding your personal information. We
          will fulfill each of these requests to the extent required by law:
        </Text>

        <View style={styles.listContainer}>
          <Text style={styles.listItem}>
            • You can ask us what personal information we have about you, including a list of categories of your
            personal information that we have sold and a list of categories of your personal information that we have shared
            with another company for a business purpose.
          </Text>

          <Text style={styles.listItem}>
            • You can ask us to delete your personal information.
          </Text>

          <Text style={styles.listItem}>
            • You can ask that we stop selling your personal information (although as noted we do not currently sell
            personal information to third parties.)
          </Text>
        </View>

        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>10.2</Text> In the preceding twelve (12) months, we have not sold personal information. We do not disclose your
          personal information to third parties for their direct marketing purposes.
        </Text>
      </View>

      {/* 11. Third Party */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          11. Third-Party Links
        </Text>

        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>11.1</Text> We reserve the right to change or revise this Privacy Policy at any time to reflect changes in the law or
          our data collection and use practices. Changes to our Privacy Policy will apply to the information collected from
          the date we post our revised Privacy Policy, as well as to existing information we hold. The date the Privacy
          Policy was last revised is identified at the top of the page. Your continued use of this website after we make
          changes is deemed to be acceptance of those changes.
        </Text>
      </View>

      {/* 12. Contact */}
      <View style={styles.section}>
        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>12.1</Text> Please contact us if you:
        </Text>

        <View style={styles.listContainer}>
          <Text style={styles.listItem}>
            • Have any comments, questions, or complaints about this Privacy Policy or our handling of personal
            information;
          </Text>

          <Text style={styles.listItem}>
            • Would like to request access to your personal information; or
          </Text>

          <Text style={styles.listItem}>
            • Want to correct or delete your personal information.
          </Text>
        </View>

        <View style={styles.contactContainer}>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>12.2</Text> We can be contacted in writing at:
          </Text>

          <Text style={styles.contactText}>
            Jeffry Cassack
          </Text>

          <Text style={styles.contactText}>
            Telephone: <Text style={styles.bold}>+1 (437) 339-4005</Text>
          </Text>

          <Text style={styles.contactText}>
            Email: <Text style={styles.bold}>connect@myelephantapp.com</Text>
          </Text>
        </View>
      </View>

      {/* 13. Changes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          13. Changes to This Privacy Policy
        </Text>

        <Text style={styles.indentedParagraph}>
          <Text style={styles.bold}>13.1</Text> We reserve the right to change or revise this Privacy Policy at any time to reflect changes in the law or
          our data collection and use practices. Changes to our Privacy Policy will apply to the information collected from
          the date we post our revised Privacy Policy, as well as to existing information we hold. The date the Privacy
          Policy was last revised is identified at the top of the page. Your continued use of this website after we make
          changes is deemed to be acceptance of those changes.
        </Text>
      </View>

      <View style={styles.footerButtonContainer}>
        {/* Bottom Button */}
              <View style={styles.bottomButtonWrap}>
                <TouchableOpacity style={styles.backButtonLarge} onPress={() => navigation.navigate('Home')}>
                  <FontAwesomeIcon icon={faArrowLeft} style={styles.icon} color="#FFFFFF"/>
                  <Text style={styles.backButtonTextLarge}>Back to home page</Text>
                </TouchableOpacity>
              </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  contentContainer: {
    paddingHorizontal: '10%',
    paddingVertical: 48,
  },

  backButton: {
    backgroundColor: '#44154B',
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 64,
  },

  backButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },

  mainTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },

  lastUpdated: {
    color: '#6B7280',
    marginBottom: 32,
    fontSize: 14,
  },

  section: {
    marginBottom: 40,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },

  subSection: {
    marginBottom: 16,
  },

  subSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 24,
  },

  paragraph: {
    color: '#6B7280',
    marginBottom: 32,
    fontSize: 14,
    lineHeight: 24,
  },

  indentedParagraph: {
    paddingLeft: 24,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 12,
  },

  listContainer: {
    paddingLeft: 48,
    marginTop: 8,
    marginBottom: 8,
  },

  listItem: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: 4,
  },

  bold: {
    fontWeight: '700',
    color: '#000000',
  },

  link: {
    textDecorationLine: 'underline',
    color: '#6B7280',
  },

  contactContainer: {
    paddingLeft: 24,
    marginTop: 8,
  },

  contactText: {
    paddingLeft: 24,
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 24,
  },

  footerButtonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 64,
  },

  footerButton: {
    backgroundColor: '#44154B',
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 64,
  },

  footerButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    marginLeft: 10,
    fontWeight: '500',
  },
  backButtonTextLarge: {
    color: 'white',
    marginLeft: 8,
    fontSize: 18,
  },
  backButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#44154B',
    padding: 16,
    borderRadius: 8,
  },
})

export default PrivacyMain