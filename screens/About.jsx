import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Accordion from '../components/aboutPage/Accordion';
import AppPressable from '../components/ui/AppPressable'
import ContentShell from '../components/ui/ContentShell'
import { TestIds } from '../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../hooks/useResponsiveLayout'

export default function About({navigation: { navigate }}) {
  const { isTablet } = useResponsiveLayout()

  return (
    <ScrollView style={{ backgroundColor: 'rgb(23 23 23)' }}>
      <ContentShell variant="content">
        <View style={tabletStyle(isTablet, styles.container, tabletStyles.container)}>
        <Text style={tabletStyle(isTablet, styles.bigHeader, tabletStyles.bigHeader)}>Learn more about MyElephantApp:</Text>
        <View style={{paddingLeft: '4%', paddingRight: '4%', marginBottom: 50}}>
          <Accordion />
        </View>
        <View style={styles.wrapperContainer}>
            <Text style={styles.buttonHeading}>Ready To Get Started?</Text>
            <AppPressable
              testID={TestIds.home.signIn}
              accessibilityLabel="Sign In or Sign Up"
              style={tabletStyle(isTablet, styles.button, tabletStyles.button)}
              onPress={() => navigate('Sign In/Sign Up')}
            >
                <Text style={styles.buttonText}>Sign In/Sign Up</Text>
            </AppPressable>
          </View>
        </View>
      </ContentShell>
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
  wrapperContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%'
  },
  button: {
    width: '60%',
    borderColor: '#777',
    borderRadius: 12,
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
});

const tabletStyles = StyleSheet.create({
  container: {
    paddingTop: 40,
    paddingBottom: 64,
    paddingHorizontal: 16,
  },
  bigHeader: {
    fontSize: 44,
    marginBottom: 32,
  },
  button: {
    width: '100%',
    maxWidth: '100%',
    paddingVertical: 14,
  },
})
