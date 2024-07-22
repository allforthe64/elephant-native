import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity} from 'react-native';
import Accordion from '../components/aboutPage/Accordion';

export default function About({navigation: { navigate }}) {

  return (
    <ScrollView>
      <View style={styles.container}>
      <Text style={styles.bigHeader}>Learn more about MyElephantApp:</Text>
      <View style={{paddingLeft: '4%', paddingRight: '4%', marginBottom: 50}}>
        <Accordion />
      </View>
      <View style={styles.wrapperContainer}>
          <Text style={styles.buttonHeading}>Ready To Get Started?</Text>    
          <TouchableOpacity style={styles.button} onPress={() => navigate('Sign In/Sign Up')}>
              <Text style={styles.buttonText}>Sign In/Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bigHeader: {
    color: 'white',
    fontSize: 40,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: '12%'
  },
  subheading: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18
  },
  wrapperContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%'
  },
  button: {
    width: '60%',
    borderColor: '#777',
    borderRadius: 25,
    backgroundColor: 'white',
    borderWidth: 1,
    paddingTop: '2%',
    paddingBottom: '2%',
    marginTop: '5%',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 14,
    width: '100%',
  },
  bgImg: {
    objectFit: 'scale-down',
    opacity: .25,
  },

  container: {
    backgroundColor: 'rgb(23 23 23)',
    paddingBottom: 50,
    paddingTop: 50,
    height: '100%'
  },
  buttonHeading: {
    fontSize: 30,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: '4%'
  },
  buttonHeading1: {
    fontSize: 30,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: '10%'
  }
});