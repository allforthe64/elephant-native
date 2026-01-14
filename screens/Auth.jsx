import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import React, {useState, useEffect} from 'react'
import { firebaseAuth } from '../firebaseConfig'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { getUser } from '../firebase/firestore'

//useToast import for displaying notifications
import { useToast } from 'react-native-toast-notifications'

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

const Login = ({navigation: {navigate}}) => {
    const [userEmail, setUserEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConf, setPasswordConf] = useState('')
    const [loading, setLoading] = useState(false)
    const [validEmail, setValidEmail] = useState(false)
    const [signUpMode, setSignUpMode] = useState(false)
    const auth = firebaseAuth

    //consume toast context for notifications
    const toast = useToast()

    useEffect(() => {
        const emailResult = EMAIL_REGEX.test(userEmail)
        setValidEmail(emailResult)
    }, [userEmail])

    const login = async () => {
        let response
        setLoading(true)
        try {
            response = await signInWithEmailAndPassword(auth, userEmail, password)
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
        const response = await fetch('https://myelephantapp.com/api/send-registration-email', {
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


  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'white' }} enabled={true} behavior={Platform.OS === 'ios' ? 'padding' : undefined} >

                {!signUpMode ?
                    <>
                        <View style={styles.innerContainer}>
                            <Text style={styles.bigHeader}>{signUpMode ? 'Register account' : 'Sign in'}</Text>
                            <View style={styles.formCon}>
                                <Text style={styles.subheading}>Enter Email:</Text>
                                <TextInput style={(validEmail || userEmail === '') ? styles.input : styles.inputInvalid} placeholder='Enter Email' autoCapitalize='none' placeholderTextColor={'#593060'} value={userEmail} onChangeText={(e) => setUserEmail(e)}/>
                                <Text style={(validEmail || userEmail === '') ? {display: 'none'} : styles.invalid}>Please Enter A Valid Email</Text>
                                <Text style={styles.subheading}>Enter Password:</Text>
                                <TextInput secureTextEntry={true} style={styles.input} placeholder='Enter Password' placeholderTextColor={'#593060'} value={password} onChangeText={(e) => setPassword(e)}/>
                                    <TouchableOpacity onPress={() => login()} style={userEmail === '' || !validEmail || password === '' ? {...styles.buttonDisabled, marginTop: 15 } : {...styles.button, marginTop: 15}}>
                                    <Text style={styles.inputButton}>Sign In</Text>
                                </TouchableOpacity> 
                                <View style={styles.switchAuthContainer}>
                                    <Text style={styles.switchAuthText}>
                                        Already have an account?
                                    </Text>
                                    <TouchableOpacity onPress={() => {
                                        setUserEmail('')
                                        setPassword('')
                                        setSignUpMode(prev => !prev)
                                    }}>
                                        <Text style={styles.switchAuthLink}>Click here</Text>
                                    </TouchableOpacity>
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
                                <TextInput style={(validEmail || userEmail === '') ? styles.input : styles.inputInvalid} placeholder='Enter Email' autoCapitalize='none' placeholderTextColor={'#593060'} value={userEmail} onChangeText={(e) => setUserEmail(e)}/>
                                <TouchableOpacity onPress={() => sendRegistrationLink()} style={userEmail === '' || !validEmail ? styles.buttonDisabled : styles.button}>
                                    <Text style={styles.inputButton}>Send link</Text>
                                </TouchableOpacity>     
                            </View>
                            <View style={styles.switchAuthContainer}>
                                <Text style={styles.switchAuthText}>
                                    Already have an account?
                                </Text>
                                <TouchableOpacity onPress={() => {
                                    setUserEmail('')
                                    setPassword('')
                                    setSignUpMode(prev => !prev)
                                }}>
                                    <Text style={styles.switchAuthLink}>Click here</Text>
                                </TouchableOpacity>
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