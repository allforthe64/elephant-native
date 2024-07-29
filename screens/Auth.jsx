import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import React, {useState, useEffect} from 'react'
import { firebaseAuth } from '../firebaseConfig'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { getUser } from '../firebase/firestore'

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

const Login = ({navigation: {navigate}}) => {
    const [userEmail, setUserEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConf, setPasswordConf] = useState('')
    const [loading, setLoading] = useState(false)
    const [validEmail, setValidEmail] = useState(false)
    const [signUpMode, setSignUpMode] = useState(false)
    const auth = firebaseAuth

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

    const signUp = async () =>{
        if (password !== passwordConf || !validEmail || userEmail === '') {
            alert('Sign up error! Make sure you entered your details correctly!')
        }
        try {
            const response = await createUserWithEmailAndPassword(auth, userEmail, password)
            console.log(response)
            const userData = await getUser(response._tokenResponse)
            alert('Check your emails!')
        } catch (err) {
            console.log(err)
            alert('Sign Up Failed: ', err.message)
            return
        } finally {
            setLoading(false)
            setUserEmail('')
            setPassword('')
            setSignUpMode(false)
            navigate('Registration Complete')
        }
    }


  return (
    <KeyboardAvoidingView style={{width: '100%', height: '100%', backgroundColor: 'black', position: 'relative'}} enabled={true} behavior='padding'>
                <View style={styles.innerContainer}>
                    <Text style={styles.bigHeader}>{signUpMode ? 'Register account' : 'Sign in'}</Text>
                    <View style={styles.formCon}>
                        <Text style={styles.subheading}>Enter Email:</Text>
                        <TextInput style={(validEmail || userEmail === '') ? styles.input : styles.inputInvalid} placeholder='Enter Email' autoCapitalize='none' placeholderTextColor={'rgb(0, 0, 0)'} value={userEmail} onChangeText={(e) => setUserEmail(e)}/>
                        <Text style={(validEmail || userEmail === '') ? {display: 'none'} : styles.invalid}>Please Enter A Valid Email</Text>
                        <Text style={styles.subheading}>Enter Password:</Text>
                        <TextInput secureTextEntry={true} style={styles.input} placeholder='Enter Password' placeholderTextColor={'rgb(0, 0, 0)'} value={password} onChangeText={(e) => setPassword(e)}/>
                        {signUpMode && 
                            <>
                                <Text style={styles.subheading}>Confirm Password:</Text>
                                <TextInput secureTextEntry={true} style={styles.input} placeholder='Confirm Password' placeholderTextColor={'rgb(0, 0, 0)'} value={passwordConf} onChangeText={(e) => setPasswordConf(e)}/>
                                <Text style={((password.length > 0 && passwordConf.length > 0) && (password === passwordConf)) ? {display: 'none'} : styles.invalid}>Passwords Do Not Match</Text>
                            </>
                        }
                    </View>
                </View>
                <View style={styles.wrapperContainer}>
                        <View style={userEmail === '' || !validEmail || password !== passwordConf ? styles.buttonWrapperDisabled : styles.buttonWrapper}>
                            {signUpMode ? 
                                <TouchableOpacity onPress={() => signUp()} disabled={!validEmail || userEmail === '' || password !== passwordConf ? true : false}>
                                    <Text style={styles.inputButton}>Register</Text>
                                </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={() => login()}>
                                <Text style={styles.inputButton}>Sign In</Text>
                            </TouchableOpacity>
                            }
                        </View>
                        <Text style={{color: 'white', width: '80%', textAlign: 'center'}}>
                            {signUpMode ? "Already have an account?" : "Don't have an Account?"}
                            <TouchableOpacity onPress={() => {
                                    setUserEmail('')
                                    setPassword('')
                                    setSignUpMode(prev => !prev)
                                }}>
                                <Text style={styles.inputText}> Click here </Text>
                            </TouchableOpacity>
                            {signUpMode ? "to login." : "to Register for a new one."}
                        </Text>
                    </View>
    </KeyboardAvoidingView>
  )
}

export default Login

const styles = StyleSheet.create({
    bigHeader: {
        color: 'white',
        fontSize: 40,
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: '5%',
    },

    subheading: {
        color: 'white',
        fontSize: 22,
        textAlign: 'left',
        width: '80%',
        fontWeight: '500',
        marginBottom: '4%'
    },
    innerContainer: {
        width: '100%',
        display: 'flex',
        height: '100%',
        justifyContent: 'center'
    },
    formCon: {
        width: '100%',
        height: '60%',
        marginBottom: '10%',
        display: 'flex',
        alignItems: 'center',
    },
    wrapperContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        marginBottom: '8%',
        position: 'absolute',
        bottom: '5%'
    },
    buttonWrapper: {
        width: '60%',
        borderColor: '#777',
        borderRadius: 25,
        backgroundColor: 'white',
        borderWidth: 1,
        paddingTop: '2%',
        paddingBottom: '2%',
        marginBottom: '5%'
    },
    buttonWrapperDisabled: {
        width: '60%',
        borderColor: '#777',
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, .5)',
        borderWidth: 1,
        paddingTop: '2%',
        paddingBottom: '2%',
        marginBottom: '5%'
    },
    buttonWrapperSm: {
        width: '40%',
        borderColor: '#777',
        borderRadius: 25,
        backgroundColor: 'white',
        borderWidth: 1,
        paddingTop: '2%',
        paddingBottom: '2%',
    },
    input: {
        backgroundColor: 'white',
        width: '80%',
        fontSize: 15,
        paddingLeft: '2%',
        paddingTop: '1%',
        paddingBottom: '1%',
        marginBottom: '7%'
    },
    inputInvalid: {
        backgroundColor: 'white',
        width: '80%',
        fontSize: 18,
        paddingLeft: '2%',
        paddingTop: '2%',
        paddingBottom: '2%',
        marginBottom: '4%'
    },
    inputButton: {
        textAlign: 'center',
        fontSize: 15,
        width: '100%',
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
    }
}) 