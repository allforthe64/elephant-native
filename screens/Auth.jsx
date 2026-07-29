import { StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native'
import React, {useState, useEffect} from 'react'
import { firebaseAuth } from '../firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useToast } from 'react-native-toast-notifications'
import AppPressable from '../components/ui/AppPressable'
import AppTextInput from '../components/ui/AppTextInput'
import { TestIds } from '../constants/testIds'

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

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }} enabled={true} behavior={Platform.OS === 'ios' ? 'padding' : undefined} >

                {!signUpMode ?
                    <>
                        <View style={styles.innerContainer}>
                            <Text style={styles.bigHeader}>Sign in</Text>
                            <View style={styles.formCon}>
                                <Text style={styles.subheading}>Enter Email:</Text>
                                <AppTextInput
                                  testID={TestIds.auth.email}
                                  accessibilityLabel="Email"
                                  style={(validEmail || userEmail === '') ? styles.input : styles.inputInvalid}
                                  placeholder='Enter Email'
                                  autoCapitalize='none'
                                  placeholderTextColor={'#593060'}
                                  value={userEmail}
                                  onChangeText={setUserEmail}
                                  keyboardType="email-address"
                                  autoCorrect={false}
                                />
                                <Text style={(validEmail || userEmail === '') ? {display: 'none'} : styles.invalid}>Please Enter A Valid Email</Text>
                                <Text style={styles.subheading}>Enter Password:</Text>
                                <AppTextInput
                                  testID={TestIds.auth.password}
                                  accessibilityLabel="Password"
                                  secureTextEntry
                                  style={styles.input}
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
                                  style={userEmail === '' || !validEmail || password === '' ? {...styles.buttonDisabled, marginTop: 15 } : {...styles.button, marginTop: 15}}
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
                            <Text style={styles.bigHeader}>Get started:</Text>
                            <Text style={styles.subheading}>Enter your email to get a registration link:</Text>
                            <View style={styles.registerFormCon}>
                                <Text style={styles.subheading}>Enter Email:</Text>
                                <AppTextInput
                                  testID={TestIds.auth.email}
                                  accessibilityLabel="Email"
                                  style={(validEmail || userEmail === '') ? styles.input : styles.inputInvalid}
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
                                  style={userEmail === '' || !validEmail ? styles.buttonDisabled : styles.button}
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
    buttonContainer: {
        alignItems: 'center',
        marginTop: 24,
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
    inputText: {
        textAlign: 'center',
        fontSize: 15,
        color: 'white',
        textDecorationColor: 'white',
        textDecorationLine: 'underline'
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
