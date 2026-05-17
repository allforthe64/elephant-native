import React, { useState } from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { List } from 'react-native-paper'

const FAQs = () => {
  const [expanded, setExpanded] = useState(null)

  //handler to control the expanded state of accordion
  const handlePress = (panel) => {
    setExpanded(expanded === panel ? null : panel)
  }

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
            It started with a can of paint...
          </Text>

          <Text style={styles.paragraph}>
            But I did not. So began the journey...
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
            The information you collect or move into your Elephant App...
          </Text>
        </View>
      </List.Accordion>
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
  }
})