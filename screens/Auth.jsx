import { StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native'
import React, {useState, useEffect} from 'react'
import { firebaseAuth } from '../firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useToast } from 'react-native-toast-notifications'
import AppPressable from '../components/ui/AppPressable'
import AppTextInput from '../components/ui/AppTextInput'
import ContentShell from '../components/ui/ContentShell'
import { TestIds } from '../constants/testIds'
import { useResponsiveLayout, tabletStyle } from '../hooks/useResponsiveLayout'

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

/* const testEmail = process.env.EXPO_PUBLIC_TEST_EMAIL || ''
const testPassword = process.env.EXPO_PUBLIC_TEST_PASSWORD || '' */

const Login = ({navigation: {navigate}}) => {
    const [userEmail, setUserEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [validEmail, setValidEmail] = useState(false)
    const [signUpMode, setSignUpMode] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [resetSending, setResetSending] = useState(false)
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

    const resetPassword = async () => {
        if (!validEmail) {
            toast.show('Enter your email above, then tap "Forgot password?" again.', {
                type: 'warning'
            })
            return
        }
        setResetSending(true)
        try {
            const res = await fetch('https://www.myelephantapp.com/api/send-password-reset', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    email: userEmail.trim()
                })
            })
            if (res.status === 429) {
                toast.show('Too many attempts. Please wait a bit and try again.', { type: 'danger' })
                return
            }
            if (!res.ok) throw new Error(`Reset email request failed: ${res.status}`)
            // Same message whether or not the account exists, so emails can't be probed.
            toast.show('If an account exists for that email, a reset link is on its way.', {
                type: 'success'
            })
        } catch (err) {
            console.log(err)
            toast.show("Couldn't send the reset email. Please try again.", { type: 'danger' })
        } finally {
            setResetSending(false)
        }
    }

    const switchMode = () => {
        setUserEmail('')
        setPassword('')
        setShowPassword(false)
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
                                <View style={tabletStyle(isTablet, styles.passwordRow, tabletStyles.passwordRow)}>
                                    <AppTextInput
                                      testID={TestIds.auth.password}
                                      accessibilityLabel="Password"
                                      secureTextEntry={!showPassword}
                                      autoCapitalize='none'
                                      autoCorrect={false}
                                      style={[tabletStyle(isTablet, styles.input, tabletStyles.input), styles.passwordInput]}
                                      placeholder='Enter Password'
                                      placeholderTextColor={'#593060'}
                                      value={password}
                                      onChangeText={setPassword}
                                    />
                                    <AppPressable
                                      testID={TestIds.auth.togglePassword}
                                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                                      onPress={() => setShowPassword(prev => !prev)}
                                      hitSlop={10}
                                      style={styles.eyeButton}
                                    >
                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={22} color='#593060' />
                                    </AppPressable>
                                </View>
                                <AppPressable
                                  testID={TestIds.auth.resetPassword}
                                  accessibilityLabel="Forgot password"
                                  disabled={resetSending}
                                  onPress={resetPassword}
                                  style={tabletStyle(isTablet, styles.forgotRow, tabletStyles.forgotRow)}
                                >
                                    <Text style={styles.switchAuthLink}>{resetSending ? 'Sending...' : 'Forgot password?'}</Text>
                                </AppPressable>
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
                                        Don't have an account?
                                    </Text>
                                    <AppPressable
                                      testID={TestIds.auth.switchMode}
                                      accessibilityLabel="Switch to registration"
                                      onPress={switchMode}
                                    >
                                        <Text style={styles.switchAuthLink}>Click here</Text>
                                    </AppPressable>
                                    <Text style={styles.switchAuthText}>
                                        to register.
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
        borderColor: '#593060',
        color: '#593060'
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
        borderColor: '#593060',
        color: 'red'
    },
    passwordRow: {
        width: '80%',
        justifyContent: 'center',
        marginBottom: 8,
    },
    passwordInput: {
        width: '100%',
        marginBottom: 0,
        paddingRight: 44,
    },
    eyeButton: {
        position: 'absolute',
        right: 4,
        top: 0,
        bottom: 0,
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    forgotRow: {
        width: '80%',
        alignItems: 'flex-end',
        marginBottom: '4%',
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
  passwordRow: {
    width: '100%',
  },
  forgotRow: {
    width: '100%',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    marginBottom: 16,
  },
})
