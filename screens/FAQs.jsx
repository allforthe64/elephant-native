import React, { useState } from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { List } from 'react-native-paper'

import { useNavigation } from '@react-navigation/native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

const FAQs = () => {
  const [expanded, setExpanded] = useState(null)

  //handler to control the expanded state of accordion
  const handlePress = (panel) => {
    setExpanded(expanded === panel ? null : panel)
  }

  const navigation = useNavigation()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Frequently Asked Questions</Text>

      <Text style={styles.subtitle}>
        Have a question that isn’t answered below? Contact us at{' '}
        <Text style={styles.email}>connect@myelephantapp.com</Text>
      </Text>

      <List.Accordion
        title="Why?"
        expanded={expanded === 'why'}
        onPress={() => handlePress('why')}
        titleStyle={styles.accordionTitle}
        style={styles.accordion}
      >
        <View style={styles.details}>
          <Text style={styles.paragraph}>
            It started with a can of paint. A newly renovated room with with finished walls. Soon to be damaged.
            Guess I need some more paint. Can is gone. Not sure the colour. Off to the paint store. Phone number,
            which room? Answers given, paint received. Fantastic, they had my info stored!
          </Text>

          <Text style={styles.paragraph}>
            But I did not. So began the journey to find an easy to use, comprehensive application to organize my
            personal information. This Unicorn apparently did not exist. A few tools that could do it but all slow and
            cumbersome.
          </Text>

          <Text style={styles.paragraph}>
            What to do? Build your own I guess…..and so it began.
          </Text>

          <Text style={styles.paragraph}>
            It has taken a minute but here you are. My Elephant App is a uniquely simple and affordable tool to
            finally help you get organized. I use it every day for the most part. We hope you find as useful as we do
            here at the development team. Enjoy!
          </Text>

          <Text style={styles.paragraph}>
            We are always open to suggestions on how to make it a better service so please share any thoughts you
            may have on your journey to organization.
          </Text>
        </View>
      </List.Accordion>

      <List.Accordion
        title="Where is my data stored?"
        expanded={expanded === 'storage'}
        onPress={() => handlePress('storage')}
        titleStyle={styles.accordionTitle}
        style={styles.accordion}
      >
        <View style={styles.details}>
          <Text style={styles.paragraph}>
            The information you collect or move into your Elephant App is organized in a database known as
            “Firebase” and currently stored at a Google data centre. The security of your information is paramount
            and Google provides the very best of safety for their centres and the data stored within. From Elephants
            stand point we have enacted a system to help protect information in transit using a token system to keep your data safe from malicious outside request.
            We also use a secruity rule system with our data base to prevent users and outside threats from accessing your data.
          </Text>
        </View>
      </List.Accordion>

      <List.Accordion
        title="How often is my data backed up?"
        expanded={expanded === 'backUp'}
        onPress={() => handlePress('backUp')}
        titleStyle={styles.accordionTitle}
        style={styles.accordion}
      >
        <View style={styles.details}>
          <Text style={styles.paragraph}>
            To be discussed / chosen by Will and Jeff
          </Text>
        </View>
      </List.Accordion>

      <List.Accordion
        title="How does it work?"
        expanded={expanded === 'howDoesItWork'}
        onPress={() => handlePress('howDoesItWork')}
        titleStyle={styles.accordionTitle}
        style={styles.accordion}
      >
        <View style={styles.details}>
          <Text style={styles.paragraph}>
            Your Elephant App consists of two main parts: The mobile application as well as the web application.
            Collecting information will mainly be done through the tools on your mobile application. A camera, a
            voice recorder, a note pad, a scanner as well as a QR code website URL capture (collect links and store
            for future access). You can name the data and store it, create new folders and sub folders, access all of
            your information, get new info from outside the app on your phone stored elsewhere and share with
            your personal network.
          </Text>

          <Text style={styles.paragraph}>
            All the information you collect is placed in your cloud account and is available in your “To Be
            Filed” folder. Your Elephant App can function solely as a mobile application. However, the desktop application significantly expands your ability to quickly sort and file your information. Upon opening the web application, the
            dashboard is presented with your storage folders on the left side and with the “To be Filed” data collection folder open
            on the right.
          </Text>

          <Text style={styles.paragraph}>
            Using a mouse to manoeuvre amongst the folders, renaming files or creating
            folders with a larger keyboard makes the data storage process signficantly faster and easier. In addition, you have the ability to move files in groups,
            drag and drop files into your folders, mass share files, and more, making the web app a powerful upgrade for efficiently storing and managing your data.
          </Text>

          <Text style={styles.paragraph}>
            Together, we hope you agree that this is the simplest way to store, sort, and share your information!
          </Text>
        </View>
      </List.Accordion>

      <List.Accordion
        title="Will my data be sold to third parties?"
        expanded={expanded === 'willMyDataBeSold'}
        onPress={() => handlePress('willMyDataBeSold')}
        titleStyle={styles.accordionTitle}
        style={styles.accordion}
      >
        <View style={styles.details}>
          <Text style={[styles.paragraph, styles.boldText]}>
            The answer is a resounding no!
          </Text>

          <Text style={styles.paragraph}>
            Your information will never be sold to or used by a third party. How you use it, the folders you create, your personal information, and anything else you can think of will never be sold to an outside entity. You pay a subscription for the
            use of the software and storage, and that is all we will ever ask of you.
          </Text>

          <Text style={styles.paragraph}>
            Your information will remain yours, and yours only, unlike with many other platforms.
          </Text>
        </View>
      </List.Accordion>

      <List.Accordion
        title="How much does it cost?"
        expanded={expanded === 'whatsItCost'}
        onPress={() => handlePress('whatsItCost')}
        titleStyle={styles.accordionTitle}
        style={styles.accordion}
      >
        <View style={styles.details}>
          <Text style={styles.paragraph}>
            We believe you will find the fee extremely reasonable considering how much value we believe MyElephantApp will bring to your everyday life. The cost is $4.00 per month CAD including all taxes. That is $3.54 per month plus tax. A very
            small fee for a truly useful tool to get all your information organized. We believe that after a short while of using MyElephantApp, the time and effort it will save you will make you feel like the app is virtually free.
          </Text>

          <Text style={styles.paragraph}>
            No more digging through your photo app, no more struggling to find tools on other applications, and no more fear about whether your personal data is being sold to outside companies. Just efficient, easy to use data storage.
          </Text>
        </View>
      </List.Accordion>
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

export default FAQs

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  content: {
    padding: 24,
    paddingBottom: 80
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 16
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24
  },

  email: {
    fontWeight: '700'
  },

  accordion: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden'
  },

  accordionTitle: {
    fontSize: 20,
    fontWeight: '700'
  },

  details: {
    paddingHorizontal: 16,
    paddingBottom: 20
  },

  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    marginBottom: 16
  },

  boldText: {
    fontWeight: '700'
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
})