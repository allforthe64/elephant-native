import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const TOSMain = () => {
  const navigation = useNavigation()

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Top Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <FontAwesomeIcon icon={faArrowLeft} style={styles.icon} />
        <Text style={styles.backButtonText}>Back to home page</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.subTitle}>Last Updated: April 15, 2024</Text>

      {/* INTRO */}
      <View style={styles.section}>
        <Text style={styles.text}>
          These Terms of Service (these <Text style={styles.bold}>“Terms”</Text>) describe your rights and responsibilities as a customer of our Services
          (as defined in Section 2.1). These Terms are between you and 1000347016 Ontario Inc. (<Text style={styles.bold}>“MyElephantApp”</Text>,
          <Text style={styles.bold}>“we”</Text>, or <Text style={styles.bold}>“us”</Text>). <Text style={styles.bold}>“You”</Text> means the entity you represent in accepting these Terms or, if that does not apply, you
          individually. If you are accepting on behalf of your employer or another entity, you represent and warrant that: (a)
          you have the full legal authority to bind your employer or such entity to these Terms; (b) you have read and
          understood these Terms; and (c) you agree to these Terms on behalf of the party that you represent. If you don’t
          have the legal authority to bind your employer or the applicable entity, please do not click the “I agree” (or similar
          button or checkbox) that is presented to you.
        </Text>

        <Text style={styles.text}>
          PLEASE NOTE THAT IF YOU SIGN UP FOR A SERVICE USING AN EMAIL ADDRESS FROM YOUR
          EMPLOYER OR ANOTHER ENTITY, THEN (I) YOU WILL BE DEEMED TO REPRESENT SUCH PARTY; (II)
          YOUR CLICK TO ACCEPT WILL BIND YOUR EMPLOYER OR THAT ENTITY TO THESE TERMS; AND (III)
          THE WORD “YOU” IN THESE TERMS WILL REFER TO YOUR EMPLOYER OR THAT ENTITY.
        </Text>
      </View>

      {/* 1 */}
      <View style={styles.section}>
        <Text style={styles.h2}>1. Legal Agreement</Text>

        <View style={styles.subSection}>
          <Text style={styles.text}>
            <Text style={styles.bold}>1.1 Acceptance of Our Terms:</Text> These Terms are effective as of the date you first click “I agree” (or a similar
            button or checkbox) or use or access the Services, whichever is earlier. These Terms do not have to be
            signed in order to be binding. You indicate your assent to these Terms by clicking “I agree” (or a similar
            button or checkbox) at the time you register for a Service. For greater certainty, these Terms include any
            hyperlinks hereto and any other document executed by the parties that incorporate these Terms by
            reference. <Text style={styles.bold}>If you do not agree with, or cannot comply with, these Terms, then you may not use
            the Services.</Text>
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>1.2 Personal Information:</Text> You acknowledge and agree that by providing us with your personal information,
            using our Services, or otherwise interacting with us, you consent to the collection, use, and disclosure of
            such information in accordance with our Privacy Policy, and for the purposes identified to you at the time
            you provide the personal information. To view our Privacy Policy, please view the below document.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>1.3 Changes to the Services or these Terms:</Text> We reserve the right to update, change, or replace any part of
            the Services or these Terms by posting updates and/or changes to the website. It is your responsibility
            to check our website periodically for changes. Your continued use of or access to the Services following
            the posting of any change(s) constitutes acceptance of those changes.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>1.4 International Use:</Text> Accessing the Services in certain countries may not be lawful, and we make no
            representation that the Services are appropriate or available for use in locations outside Canada. If you
            choose to access the Services from outside Canada, you do so at your own risk and initiative and are
            responsible for compliance with any applicable local laws.
          </Text>
        </View>
      </View>

      {/* 2 */}
      <View style={styles.section}>
        <Text style={styles.h2}>2. Services</Text>

        <View style={styles.subSection}>
          <Text style={styles.text}>
            <Text style={styles.bold}>2.1 Description Of Services:</Text> We provide a user-friendly cloud storage, software as a service platform (the
            <Text style={styles.bold}>“Platform”</Text>). These Terms govern your use of our Platform services, including as such services are
            made available on our website and including all associated features, functionalities, websites, mobile
            sites, user interfaces, and any content and software applications associated with our services
            (collectively, the <Text style={styles.bold}>“Services”</Text>).
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>2.2 Limited License Grant:</Text> Subject to your continued compliance with these Terms and the restrictions set
            out in Section 2.4 below, we grant you a non-exclusive, non-transferable, non-assignable, royalty-free,
            revocable license to use the Services for your personal purposes.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>2.3 Representations and Warranties:</Text> As a condition of your use of the Services, you represent and warrant
            that: (a) you have reached the age of majority in your province or territory of residence; (b) you possess
            the legal authority to create a binding legal obligation; (c) you will use the Services in accordance with
            these Terms; (d) all information supplied by you via the Services is true, accurate, current, and
            complete; (e) you have not previously been suspended or removed from our Services; (f) your use of
            the Services will not infringe or misappropriate the confidentiality or intellectual property rights of any
            third party; and (g) your registration and use of the Services comply with all applicable laws and
            regulations.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>2.4 Prohibited Activities</Text> You are prohibited from using the Services: (a) for any unlawful purpose; (b) to
            solicit others to perform or participate in any unlawful acts; (c) to violate any international, federal,
            provincial, or state regulations, rules, laws, or local ordinances; (d) to infringe upon or violate our
            intellectual property rights or the intellectual property rights of others; (e) to harass, abuse, insult, harm,
            defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion,
            ethnicity, race, age, national origin, disability, or other enumerated grounds of discrimination; (f) to
            submit false or misleading information; (g) to upload or transmit viruses or any other type of malicious
            code that will or may be used in any way that will affect the functionality or operation of the Services or
            any related website, other websites, or the Internet; (h) to collect or track the personal information of
            others; (i) to spam, phish, pharm, pretext, spider, crawl, or scrape; (j) for any obscene or immoral
            purpose; (k) to reproduce, duplicate, copy, sell, resell, or exploit the Services, access to the Services, or
            any portion of the Services without our express written permission; (l) to transmit any advertising or
            promotional materials; or (m) to interfere with or circumvent the security features of the Services, or any
            related website, other websites, or the Internet.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>2.5 Free and Beta Services</Text> You may receive access to certain Services or product features on a free, fully
            discounted, or trial basis or as an alpha, beta, or early access offering (<Text style={styles.bold}>“Free and Beta Services”</Text>). Use
            of Free and Beta Services is limited to the period specified by us. We may terminate your use of Free
            and Beta Services at our discretion at any time, without liability to you. We may modify Free and Beta
            Services at any time for any reason. Free and Beta Services may be inoperable, incomplete, or include
            features that we may never release, and their features and performance information are our confidential
            information. NOTWITHSTANDING ANYTHING ELSE IN THESE TERMS, WE PROVIDE NO
            WARRANTY, INDEMNITY, SERVICE LEVEL AGREEMENT, OR SUPPORT FOR FREE AND BETA
            SERVICES AND WE WILL HAVE NO LIABILITY TO YOU OR ANY THIRD PARTY FOR YOUR USE OF
            FREE AND BETA SERVICES.
          </Text>
        </View>
      </View>

      {/* ===================== 3 ===================== */}
      <View style={styles.section}>
        <Text style={styles.h2}>3. Your Account</Text>

        <View style={styles.subSection}>
          <Text style={styles.text}>
            <Text style={styles.bold}>3.1 Account Information:</Text> To access certain Services, you may be required to create an account
            (<Text style={styles.bold}>“Account”</Text>). You are responsible for ensuring the accuracy of the information included in your Account,
            including updating your information as necessary. By registering for an Account, you are representing
            and warranting that: (a) you own or have sufficient authorization to use the computer, mobile device,
            technology, or other device you use to access the Service; and (b) you will access and use the Services
            solely in accordance with, and for the purposes consistent with, these Terms. Only one person may use
            an Account; two or more people may not share an Account.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>3.2 Account Security:</Text> All activity conducted in connection with your Account will be your responsibility, as
            you are deemed to be in sole possession and control of the confidential password necessary to access
            your Account. Your password protects your Account, and you are solely responsible for keeping your
            password confidential and secure. You understand that you are responsible for all use (including any
            unauthorized use) of your username and password. If your username or password is lost or stolen, or if
            you believe there has been unauthorized access to your Account by a third party, you must notify us
            immediately and change your password as soon as possible.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>3.3 Suspension or Termination of your Account:</Text> Without limiting any other remedies, we may suspend or
            terminate your Account or your access to the Services (or any portion thereof), at any time, with or
            without notice to you, if we suspect that you are not compliant with these Terms. In the event of
            termination, you will have no further access to your Account or anything within the Services associated
            with it, and we are under no obligation to compensate you for any such losses or results. If we terminate
            your Account, you may not create a new Account or access the Services except with our express
            permission.
          </Text>
        </View>
      </View>

      {/* ===================== 4 ===================== */}
      <View style={styles.section}>
        <Text style={styles.h2}>4. Payment</Text>

        <View style={styles.subSection}>
          <Text style={styles.text}>
            <Text style={styles.bold}>4.1 Subscriptions:</Text> You may purchase access to the Services on a monthly basis (<Text style={styles.bold}>“Subscription Period”</Text>),
            by paying a subscription fee described to you when you create an Account (<Text style={styles.bold}>“Subscription”</Text>).
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>4.2 Renewal and Cancellation:</Text> Your Subscription will automatically renew at the end of the applicable
            Subscription Period. You may cancel your Subscription at any time by contacting us. The cancellation
            will take effect the day after the last day of the current Subscription Period. We do not provide refunds or
            credits for the cancellation of a Subscription before the expiration of a Subscription Period.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>4.3 Changes to Fees:</Text> We may change the pricing of the Subscriptions from time to time. We will
            communicate any price changes to you in advance and, if applicable, how to accept those changes.
            Subject to applicable law, you are deemed to accept the new price by continuing to use the Services
            after the price change takes effect. If you do not agree with a price change, you have the right to reject
            the change by notifying us prior to the price change going into effect.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>4.4 Third Party Payment Provider:</Text> Payment for Services may be made through our payment gateway
            provider. You may be required to submit your payment details to the relevant third party payment
            gateway provider, and you may also be required to accept additional terms and conditions in relation to
            the use of such services. We cannot accept, and hereby exclude to the fullest extent permitted by
            applicable law, any liability arising out of or in connection with your use of such third party payment
            provider.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>4.5 Currency and Taxes:</Text> All fees with respect to the Services are quoted in Canadian dollars. You are
            responsible for paying all applicable taxes with respect to the Services.
          </Text>
        </View>
      </View>

      {/* ===================== 5 ===================== */}
      <View style={styles.section}>
        <Text style={styles.h2}>5. Your Data</Text>

        <View style={styles.subSection}>
          <Text style={styles.text}>
            <Text style={styles.bold}>5.1 Your Data:</Text> As part of the Services, we allow you to submit, store, and access data, including but not
            limited to pictures, documents, memos, recordings and other information (collectively, <Text style={styles.bold}>“Your Data”</Text>).
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>5.2 Use of Your Data:</Text> We will have no right to sublicense or resell Your Data, except however, you agree
            that we may collect, analyze, and use data derived from Your Data and/or information collected from or
            about an individual but which does not identify the individual personally for purposes of operating,
            analyzing, improving, or marketing the Services. If we share or publicly disclose information (e.g., in
            marketing materials or in application development) that is derived from Your Data, such data will be
            aggregated or anonymized such that a specific individual is no longer identifiable. You further agree that
            we will have the right to use, store, transmit, distribute, modify, copy, display, sublicense, and create
            derivative works of the anonymized and aggregated data.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>5.3 Your Responsibilities for Your Data:</Text> In connection with Your Data, you hereby represent, warrant, and
            agree that: (a) you have obtained Your Data lawfully, and Your Data does not and will not violate any
            applicable laws or any person or entity’s proprietary or intellectual property rights; (b) Your Data is free
            of all viruses, Trojan horses, and other elements that could interrupt or harm the systems or software
            used by us or our service providers to provide the Service; (c) Your Data has and will be collected by
            you in accordance with a privacy policy that permits us to share, collect, use, and disclose Your Data as
            contemplated under these Terms, and if required by applicable law, pursuant to consents obtained by
            you to do each of the foregoing; (d) you are solely responsible for ensuring compliance with all privacy
            laws in all jurisdictions that may apply to Your Data provided hereunder; (e) we may exercise the rights
            in Your Data granted hereunder without liability or cost to any third party; and (f) Your Data complies
            with these Terms. For purposes of clarity, we take no responsibility and assume no liability for Your
            Data, and you will be solely responsible for Your Data and the consequences of sharing it under these Terms
          </Text>
        </View>
      </View>

      {/* ===================== 6 ===================== */}
      <View style={styles.section}>
        <Text style={styles.h2}>6. Our Proprietary Rights</Text>

        <View style={styles.subSection}>
          <Text style={styles.text}>
            <Text style={styles.bold}>6.1 Our Intellectual Property:</Text> We and our licensors have and retain all rights, titles, and interests, including
            all intellectual property rights, in and to our Services and related to our Platform, technology, and
            dashboards, including any modifications or improvements thereto, made by you or us. Your use of the
            Services will not create or grant you any rights in or to the Services.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>6.2 Brand Features:</Text> Except for third party marks, as between you and us, all names, trademarks, service
            marks, certification marks, symbols, icons, slogans, or logos appearing on the Services are proprietary
            to us or our affiliates, licensors, or suppliers (<Text style={styles.bold}>“Brand Features”</Text>). Use or misuse of the Brand Features is
            expressly prohibited. Unless otherwise expressly authorized by us in writing, you may not copy or use
            any Brand Features.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>6.3 Feedback:</Text> From time to time, you may choose to submit, or we may request that you submit on a
            voluntary basis, comments, questions, ideas, suggestions, or other feedback relating to the Services to
            us (<Text style={styles.bold}>“Feedback”</Text>). We may in connection with any of our products or services freely use, copy, disclose,
            license, distribute, and exploit any Feedback in any manner without any obligation, royalty, or restriction
            based on intellectual property rights or otherwise. No Feedback will be considered your confidential
            information, and nothing in these Terms limits our right to independently use, develop, evaluate, or
            market products or services, whether incorporating Feedback or otherwise.
          </Text>
        </View>
      </View>

      {/* ===================== 7 ===================== */}
      <View style={styles.section}>
        <Text style={styles.h2}>7. Termination</Text>

        <View style={styles.subSection}>
          <Text style={styles.text}>
            <Text style={styles.bold}>7.1 Suspension or Termination by Us:</Text> Without limiting any other remedies, we may suspend or terminate
            your Account or your access to the Services (or any portion thereof), at any time, with or without notice
            to you, if we suspect that you are not compliant with these Terms. In the event of termination, you will
            have no further access to your Account or anything within the Services associated with it, and we are
            under no obligation to compensate you for any such losses or results. If we terminate your Account, you
            may not create a new Account or access the Services except with our express permission.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>7.2 Termination by You:</Text> You may cancel and terminate your Subscription at any time by contacting us. If at
            the date of termination of your Account, there are any outstanding payments owing by you to us, you will
            receive one
          </Text>
        </View>
      </View>

      {/* ===================== 8 ===================== */}
      <View style={styles.section}>
        <Text style={styles.h2}>8. Accuracy Completeness, And Timeliness Of Information</Text>

        <View style={styles.subSection}>
          <Text style={styles.text}>
            <Text style={styles.bold}>8.1 Accuracy of Information:</Text> All website and application content, materials, and information are provided on
            an “as is” basis. We are not responsible if information made available through the Services is not
            accurate, complete, or current. The information on our website and application is provided for general
            information only and should not be relied upon or used as the sole basis for making decisions without
            consulting primary, more accurate, more complete, or more timely sources of information. Any reliance
            on the material on this website or application is at your own risk.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>8.2 Modification of Information:</Text> We reserve the right to modify or remove any website or application content,
            materials, or information at any time. We cannot and do not review all communications made available
            on or through the Services, but, although not obligated to, may review, verify, make changes to, or
            remove any content, materials, or information, including information submitted in connection with the
            Services or other features at any time, with or without notice to you, in our sole discretion.
          </Text>
        </View>
      </View>

      {/* ===================== 9 ===================== */}
      <View style={styles.section}>
        <Text style={styles.h2}>9. Remedies and Limitations</Text>

        <View style={styles.subSection}>
          <Text style={styles.text}>
            <Text style={styles.bold}>9.1 Accuracy of Information:</Text> The Services are integrated with, or may otherwise interact with, certain
            third-party applications, websites, devices, tools, and services to make the Services available to you
            (<Text style={styles.bold}>“Third Party Applications”</Text>). These Third Party Applications may have their own terms and conditions
            of use and privacy policies, and your use of these Third Party Applications will be governed by and
            subject to such terms and conditions and privacy policies. You understand and agree that we do not
            endorse and are not responsible or liable for the behavior, features, or content of any Third Party
            Applications or for any transaction you may enter into with the provider of any such Third Party
            Applications. We do not warrant the compatibility or continuing compatibility of the Third Party
            Applications with the Services.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>9.2 No Warranties:</Text> YOU UNDERSTAND AND AGREE THAT THE SERVICES AND ANY OTHER
            INFORMATION OR MATERIALS ON, IN, OR MADE AVAILABLE THROUGH THE SERVICES ARE
            PROVIDED “AS IS” AND “AS AVAILABLE,” WITHOUT EXPRESS OR IMPLIED WARRANTIES OF ANY KIND. TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW, WE AND OUR
            SUPPLIERS AND LICENSORS MAKE NO REPRESENTATIONS AND DISCLAIM ANY WARRANTIES
            OR CONDITIONS OF SATISFACTORY QUALITY, MERCHANTABILITY, FITNESS FOR A
            PARTICULAR PURPOSE, TITLE, OR NON-INFRINGEMENT. WE AND OUR SUPPLIERS AND
            LICENSORS DO NOT WARRANT THAT THE SERVICES: (A) WILL MEET YOUR REQUIREMENTS
            OR BE SUITABLE FOR ANY PARTICULAR PURPOSE; (B) WILL BE RELIABLE, ACCURATE,
            AUTHENTIC, CURRENT, OR COMPLETE; (C) WILL OPERATE AND BE AVAILABLE WITHOUT
            INTERRUPTIONS; OR (D) WILL BE FREE OF MALWARE OR OTHER HARMFUL COMPONENTS.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>9.3 Your Indemnification Obligations:</Text> You agree to indemnify, defend, and hold harmless us and our
            directors, employees, officers, advisors, contractors, and agents (“Indemnitees”) from and against any
            and all losses, damages, liabilities, deficiencies, claims, actions, judgments, settlements, interest,
            awards, penalties, fines, costs, or expenses of whatever kind, including reasonable legal fees, incurred
            by any of the Indemnitees, arising out of: (a) your breach of these Terms or the policies they incorporate
            by reference; (b) your violation of any applicable laws or the rights of a third party; (c) Your Data or any
            other user content that you upload, contribute, or otherwise submit on or through the Service; (d) any
            activity that you engage on or through the Services.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>9.4 No Indirect Damages:</Text> To the maximum extent permitted by law, in no event will we or our directors,
            officers, employees, affiliates, agents, contractors, suppliers, service providers, or licensors be liable for:
            (a) any indirect, consequential, incidental, exemplary, punitive, or special damages; or (b) for any
            damages, whether direct, indirect, consequential, incidental, exemplary, punitive, or special,
            characterized as lost revenue, lost savings or revenue, or lost profits, whether based on contract, tort
            (including negligence), or other legal or equitable basis, including without limitation damages for harm to
            business, loss of information or data, loss of goodwill, or other economic loss.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>9.5 Our Limitation of Liability:</Text> OUR MAXIMUM AGGREGATE LIABILITY UNDER THESE TERMS IN
            CONTRACT OR TORT (INCLUDING NEGLIGENCE), AS A RESULT OF A BREACH OF WARRANTY,
            STRICT LIABILITY, INDEMNITY, OR UNDER ANY OTHER THEORY OF LIABILITY WHATSOEVER,
            WILL BE LIMITED TO DIRECT DAMAGES IN AN AMOUNT EQUAL TO THE LESSER OF: (A) THE
            AMOUNT PAID BY YOU, IF APPLICABLE, FOR THE SERVICES IN THE MONTH IMMEDIATELY
            PRECEDING THE DATE OF THE ACT, OMISSION, OR CIRCUMSTANCE GIVING RISE TO THE
            LIABILITY HEREUNDER; AND (B) CAD $100.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>9.6 Remedies Available to Us:</Text> You acknowledge and agree that the use of the Services in violation of these
            Terms could cause irreparable harm to us and that in the event of such unauthorized use, we are
            entitled to an injunction in addition to any other remedies available at law or in equity.
          </Text>
        </View>
      </View>

      {/* ===================== 10 ===================== */}
      <View style={styles.section}>
        <Text style={styles.h2}>10. General</Text>

        <View style={styles.subSection}>
          <Text style={styles.text}>
            <Text style={styles.bold}>10.1 Communications:</Text> We may be required by law or at your request to send you communications about the
            Services. You agree that we may send these communications to you via email or by posting them on
            our website.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>10.2 Arbitration:</Text> Any and all disputes arising out of your use of the Services will be referred to and finally
            settled by private and confidential binding arbitration before a single arbitrator held in Toronto, Ontario in
            English and governed by Ontario law pursuant to the Arbitration Act, 1991 (Ontario), as amended,
            replaced, or re-enacted from time to time. The arbitrator will be a person who is legally trained and who
            has experience in the information technology field in Canada and is independent of either party.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>10.3 Governing Law:</Text> These Terms will be governed by and construed in accordance with the laws of the
            Province of Ontario and the federal laws of Canada applicable therein. You consent and attorn to the
            exclusive jurisdiction of the courts located in the City of Toronto in the Province of Ontario.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>10.4 Waiver of Class Action:</Text> By using the Services, you agree to resolve any claim or dispute arising
            between you and us on an individual basis, rather than addressing such claim or dispute as part of a
            group or class. You hereby waive any right you may have to commence or participate in any class
            action lawsuit commenced against us related to any claim, dispute, or controversy arising from your use of the Services. Where applicable, you hereby agree to opt-out of any class proceeding against us
            otherwise commenced. The foregoing waiver will not apply to claims or disputes arising under consumer
            protection legislation or any other claim or dispute where a waiver of class action lawsuits is
            unenforceable at law.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>10.5 Severability:</Text> In the event that any provision of these Terms is determined to be unlawful, void, or
            unenforceable, such provision will nonetheless be enforceable to the fullest extent permitted by
            applicable law, and the unenforceable portion will be deemed to be severed from these Terms, all
            without affecting the validity and enforceability of any other remaining provisions.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>10.6 Waiver:</Text> Our failure to exercise or enforce any right or provision of these Terms will not constitute a
            waiver of such right or provision.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>10.6 Waiver:</Text> Our failure to exercise or enforce any right or provision of these Terms will not constitute a
            waiver of such right or provision.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>10.7 Entire Agreement:</Text> These Terms as modified from time to time, and any policies or operating rules
            posted by us on this website, constitute the entire agreement and understanding between you and us
            and governs your use of the Services, superseding any prior or contemporaneous agreements,
            communications, and proposals, whether oral or written, between you and us (including, but not limited
            to, any prior versions of these Terms).
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>10.8 Contact Information:</Text> Questions about these Terms should be sent to us at <Text style={styles.bold}>connect@myelephantapp.com</Text>
          </Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomButtonWrap}>
        <TouchableOpacity style={styles.backButtonLarge} onPress={() => navigation.navigate('Home')}>
          <FontAwesomeIcon icon={faArrowLeft} style={styles.icon} />
          <Text style={styles.backButtonTextLarge}>Back to home page</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  )
}

export default TOSMain


const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingHorizontal: '10%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#44154B',
    padding: 12,
    borderRadius: 8,
  },
  backButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#44154B',
    padding: 16,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    marginLeft: 8,
  },
  backButtonTextLarge: {
    color: 'white',
    marginLeft: 8,
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subTitle: {
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  subSection: {
    paddingLeft: 16,
    gap: 12,
  },
  text: {
    lineHeight: 20,
    color: '#333',
  },
  bold: {
    fontWeight: '700',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  bottomButtonWrap: {
    alignItems: 'center',
    marginTop: 40,
  },
})