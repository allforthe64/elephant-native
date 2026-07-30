import { StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native'
import React, {useState, useEffect} from 'react'
import { firebaseAuth } from '../firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useToast } from 'react-native-toast-notifications'
import AppPressable from '../components/ui/AppPressable'
import AppTextInput from '../components/ui/AppTextInput'
import ContentShell from '../components/ui/ContentShell'
import { TestIds } from '../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../hooks/useResponsiveLayout'

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

const testEmail = process.env.EXPO_PUBLIC_TEST_EMAIL || ''
const testPassword = process.env.EXPO_PUBLIC_TEST_PASSWORD || ''

const Login = ({navigation: {navigate}}) => {
    const [userEmail, setUserEmail] = useState(testEmail)
    const [password, setPassword] = useState(testPassword)
    const [loading, setLoading] = useState(false)
    const [validEmail, setValidEmail] = useState(false)
    const [signUpMode, setSignUpMode] = useState(false)
    const auth = firebaseAuth
    const { isTablet } = useResponsiveLayout()

    const toast = useToast()

    useEffect(() => {
        const emailResult = EMAIL_REGEX.test(userEmail)
        setValidEmail(emailResult)
    }, [userEmail])

    const login = async () => {
        setLoading(true)
        try {
            await signInWithEmailAndPassword(auth, userEmail, password)
            navigate('Dashboard')
        } catch (err) {
            console.log(err)
            alert('Sign In failed: ', err)
        } finally {
            setLoading(false)
            setUserEmail('')
            setPassword('')
        }
    }

    const sendRegistrationLink = async () => {
        await fetch('https://myelephantapp.com/api/send-registration-email', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                to_email: userEmail
            })
        })

        toast.show(`Registration link sent. Check your email!`, {
            type: 'success'
        })
        setUserEmail('')
        setSignUpMode(false)
    }

    const switchMode = () => {
        setUserEmail('')
        setPassword('')
        setSignUpMode(prev => !prev)
    }

    const inputStyle = tabletStyle(
      isTablet,
      (validEmail || userEmail === '') ? styles.input : styles.inputInvalid,
      tabletStyles.input
    )
    const buttonStyle = (disabled) => tabletStyle(
      isTablet,
      disabled ? styles.buttonDisabled : styles.button,
      tabletStyles.button
    )

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }} enabled={true} behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
      <ContentShell variant="form" fill style={{ justifyContent: 'center' }}>
                {!signUpMode ?
                    <>
                        <View style={styles.innerContainer}>
                            <Text style={tabletStyle(isTablet, styles.bigHeader, tabletStyles.bigHeader)}>Sign in</Text>
                            <View style={styles.formCon}>
                                <Text style={tabletStyle(isTablet, styles.subheading, tabletStyles.subheading)}>Enter Email:</Text>
                                <AppTextInput
                                  testID={TestIds.auth.email}
                                  accessibilityLabel="Email"
                                  style={inputStyle}
                                  placeholder='Enter Email'
                                  autoCapitalize='none'
                                  placeholderTextColor={'#593060'}
                                  value={userEmail}
                                  onChangeText={setUserEmail}
                                  keyboardType="email-address"
                                  autoCorrect={false}
                                />
                                <Text style={(validEmail || userEmail === '') ? {display: 'none'} : tabletStyle(isTablet, styles.invalid, tabletStyles.subheading)}>Please Enter A Valid Email</Text>
                                <Text style={tabletStyle(isTablet, styles.subheading, tabletStyles.subheading)}>Enter Password:</Text>
                                <AppTextInput
                                  testID={TestIds.auth.password}
                                  accessibilityLabel="Password"
                                  secureTextEntry
                                  style={tabletStyle(isTablet, styles.input, tabletStyles.input)}
                                  placeholder='Enter Password'
                                  placeholderTextColor={'#593060'}
                                  value={password}
                                  onChangeText={setPassword}
                                />
                                <AppPressable
                                  testID={TestIds.auth.signIn}
                                  accessibilityLabel="Sign In"
                                  disabled={loading || userEmail === '' || !validEmail || password === ''}
                                  onPress={login}
                                  style={[buttonStyle(userEmail === '' || !validEmail || password === ''), { marginTop: 15 }]}
                                >
                                    <Text style={styles.inputButton}>Sign In</Text>
                                </AppPressable>
                                <View style={styles.switchAuthContainer}>
                                    <Text style={styles.switchAuthText}>
                                        Already have an account?
                                    </Text>
                                    <AppPressable
                                      testID={TestIds.auth.switchMode}
                                      accessibilityLabel="Switch to registration"
                                      onPress={switchMode}
                                    >
                                        <Text style={styles.switchAuthLink}>Click here</Text>
                                    </AppPressable>
                                    <Text style={styles.switchAuthText}>
                                        to login.
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </>
                :
                    <>
                        <View style={styles.innerContainer}>
                            <Text style={tabletStyle(isTablet, styles.bigHeader, tabletStyles.bigHeader)}>Get started:</Text>
                            <Text style={tabletStyle(isTablet, styles.subheading, tabletStyles.subheading)}>Enter your email to get a registration link:</Text>
                            <View style={styles.registerFormCon}>
                                <Text style={tabletStyle(isTablet, styles.subheading, tabletStyles.subheading)}>Enter Email:</Text>
                                <AppTextInput
                                  testID={TestIds.auth.email}
                                  accessibilityLabel="Email"
                                  style={inputStyle}
                                  placeholder='Enter Email'
                                  autoCapitalize='none'
                                  placeholderTextColor={'#593060'}
                                  value={userEmail}
                                  onChangeText={setUserEmail}
                                  keyboardType="email-address"
                                  autoCorrect={false}
                                />
                                <AppPressable
                                  testID={TestIds.auth.sendLink}
                                  accessibilityLabel="Send registration link"
                                  disabled={userEmail === '' || !validEmail}
                                  onPress={sendRegistrationLink}
                                  style={buttonStyle(userEmail === '' || !validEmail)}
                                >
                                    <Text style={styles.inputButton}>Send link</Text>
                                </AppPressable>
                            </View>
                            <View style={styles.switchAuthContainer}>
                                <Text style={styles.switchAuthText}>
                                    Already have an account?
                                </Text>
                                <AppPressable
                                  testID={TestIds.auth.switchMode}
                                  accessibilityLabel="Switch to sign in"
                                  onPress={switchMode}
                                >
                                    <Text style={styles.switchAuthLink}>Click here</Text>
                                </AppPressable>
                                <Text style={styles.switchAuthText}>
                                    to login.
                                </Text>
                            </View>
                        </View>
                    </>
                }
      </ContentShell>
    </KeyboardAvoidingView>
  )
}

export default Login

const styles = StyleSheet.create({
    bigHeader: {
        color: '#593060',
        fontSize: 40,
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: '5%',
    },
    subheading: {
        color: '#593060',
        fontSize: 22,
        textAlign: 'left',
        width: '80%',
        fontWeight: '500',
        marginBottom: '4%'
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 16,
    },
    formCon: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 24,
    },
    registerFormCon: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 24,
    },
    button: {
        width: '60%',
        borderRadius: 10,
        backgroundColor: '#593060',
        paddingTop: '2%',
        paddingBottom: '2%',
        marginBottom: '5%'
    },
    buttonDisabled: {
        width: '60%',
        borderRadius: 10,
        backgroundColor: 'rgba(89, 48, 96, .75)',
        paddingTop: '2%',
        paddingBottom: '2%',
        marginBottom: '5%'
    },
    input: {
        backgroundColor: 'white',
        width: '80%',
        fontSize: 15,
        paddingLeft: '2%',
        paddingTop: '1%',
        paddingBottom: '1%',
        marginBottom: '7%',
        borderBottomWidth: 2,
        borderColor: '#593060'
    },
    inputInvalid: {
        backgroundColor: 'white',
        width: '80%',
        fontSize: 18,
        paddingLeft: '2%',
        paddingTop: '2%',
        paddingBottom: '2%',
        marginBottom: '4%',
        borderBottomWidth: 2,
        borderColor: '#593060'
    },
    inputButton: {
        textAlign: 'center',
        fontSize: 20,
        width: '100%',
        color: 'white'
    },
    invalid: {
        display: 'flex',
        color: 'red',
        textAlign:'left',
        width: '80%',
        marginBottom: '10%'
    },
    switchAuthContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    switchAuthText: {
        color: '#593060',
        fontSize: 18,
    },
    switchAuthLink: {
        color: '#593060',
        fontSize: 18,
        fontWeight: '600',
        textDecorationLine: 'underline',
        marginHorizontal: 4,
    },
})

const tabletStyles = StyleSheet.create({
  bigHeader: {
    marginBottom: 24,
  },
  subheading: {
    width: '100%',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    fontSize: 18,
    paddingVertical: 10,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    marginBottom: 16,
  },
})
