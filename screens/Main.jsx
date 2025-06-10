import React, {useContext, useEffect, useState, useRef} from 'react';

//import drawer navigator from @react-navigation/drawer
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native"; //import NavigationContainer (is a required as a dependency of the drawerNavigator)

//instantiate drawer navigator in Drawer variable
const Drawer = createDrawerNavigator()

//Screen Component imports
import Home from './Home';
import Dashboard from './Dashboard';
import Contact from './Contact';
import About from './About';
import Auth from './Auth';
import Settings from './Settings';
import ThankYou from './ThankYou';

//import firebase auth object/AuthContext/onAuthStateChanged function
import { AuthContext } from '../firebase/auth';
import { QueContext } from '../context/QueContext';
import { onAuthStateChanged } from 'firebase/auth';

//media library imports
import * as MediaLibrary from 'expo-media-library'

//import format from date-fns for file timestamps
import { format } from 'date-fns'

//import addFile, updateUser, userListener from firestore/storage, firbaseAuth object from firebaseConfig/ref uploadBytesResumable from firebase storage
import { addfile, addFileToUser, updateUser, userListener } from '../firebase/firestore';
import { firebaseAuth, storage } from '../firebaseConfig';
import {ref, uploadBytesResumable} from 'firebase/storage'

//import ImageManipulator object from expo
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

//import useToast for notifications
import { useToast } from 'react-native-toast-notifications'

//import AsyncStorage object
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UploadQueueEmitter } from '../hooks/QueueEventEmitter';


const Main = () => {

  //instantiate auth object
  const auth = firebaseAuth

  const toast = useToast()

  //consume AuthContext
  const {authUser, setAuthUser} = useContext(AuthContext)
  const {que, setQue} = useContext(QueContext)

  //initialize state to hole user inst
  const [userInst, setUserInst] = useState()
  const [currentUser, setCurrentUser] = useState()
  const [screen, setScreen] = useState('')

  const uploadingFiles = new Set()

  const navigationRef = useRef(null);

  //get the current user 
  /* const currentUser = firebaseAuth.currentUser.uid */

  useEffect(() => {
    if (firebaseAuth.currentUser) setCurrentUser(firebaseAuth.currentUser.uid)
  }, [firebaseAuth.currentUser])

  useEffect(() => {
    if (currentUser) {
      try {
          const getCurrentUser = async () => {
          const unsubscribe = await userListener(setUserInst, false, currentUser)
      
          return () => unsubscribe()
          }
          getCurrentUser()
      } catch (err) {console.log(err)}
    } else console.log('no user yet')
      
  }, [currentUser])

  useEffect(() => {
    if (userInst) {
      console.log("userInst:", userInst)
      console.log("userInst.uid:", userInst.uid)
      console.log("keys:", Object.keys(userInst))
      console.log('currentUser: ', currentUser)
    }
  }, [userInst])

  //generate a random 10 character alpha numeric string
  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  const removeFromQueue = async (file) => {
    try {
      const queue = JSON.parse(await AsyncStorage.getItem('uploadQueue')) || [];
      const updatedQueue = queue.filter((exstFile) => exstFile.uri !== file.uri);
      await AsyncStorage.setItem('uploadQueue', JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  }

  const uploadFile = async (file, userId) => {

    console.log('currentUser within uploadFile: ', currentUser)
    console.log('userInst.uid from within uploadFile: ', userInst?.uid)
    console.log('userId argument: ', userId)

    //generate a new randomString
    const randomString = generateRandomString(10);

    //create new formatted date for file
    const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss") + randomString

    const fileUriArray = file.uri.split('.')
    const fileType = fileUriArray[fileUriArray.length - 1]
    

    let manipResult = null
    if (fileType === 'jpg' || fileType === 'JPG' || fileType === 'jpeg' || fileType === 'JPEG' || fileType === 'png' || fileType === 'PNG') {
      manipResult = await manipulateAsync(
        file.uri,
        [{ resize: {height: file.metadata.height * .1, width: file.metadata.width * .1} }],
        { compress: 1, format: SaveFormat.PNG }
      )
    }

    if (manipResult) {
      try {
        //upload thumbnail version
        const thumbNailBlob = await new Promise(async (resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.onload = () => {
              resolve(xhr.response)
          }
          xhr.onerror = (e) => {
              reject(new TypeError('Network request failed'))
          }
          xhr.responseType = 'blob'
          xhr.open('GET', manipResult.uri, true)
          xhr.send(null)
        })
        
        const thumbnailFileRef = ref(storage, `${userId}/thumbnail&${formattedDate}`)
        const thumbnailFileUri = `${userId}/thumbnail&${file.filename}`
        const thumbNailResult = await uploadBytesResumable(thumbnailFileRef, thumbNailBlob)

        //create a blob for the file
        const blob = await new Promise(async (resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.onload = () => {
          resolve(xhr.response) 
          }
          xhr.onerror = (e) => {
              reject(new TypeError('Network request failed'))
          }
          xhr.responseType = 'blob'
          xhr.open('GET', file.uri, true)
          xhr.send(null)
        })
        const fileUri = `${userId}/${file.fileName}`
        const fileRef = ref(storage, `${userId}/${formattedDate}`)
        const result = await uploadBytesResumable(fileRef, blob)

        const uploadSize = result.metadata.size + thumbNailResult.metadata.size

        const reference = await addfile({
          name: file.filename,
          fileType: fileType,
          size: uploadSize,
          uri: fileUri,
          thumbnailUri: thumbnailFileUri,
          user: userId,
          version: 0,
          timeStamp: `${formattedDate}`
        }, file.finalDestination)

        await addFileToUser(userId, reference, uploadSize)

        toast.show('Upload successful', {
          type: 'success'
        })
      } catch (error) {
        console.log('error from manipResult: ', error)
      }
    }

    else if (fileType === 'txt') {
      //upload noteBody as blob
      const textFile = new Blob([`${file.noteBody}`], {
        type: "text/plain;charset=utf-8",
      });
      const fileUri = `${userId}/${file.filename}`
      const fileRef = ref(storage, `${userId}/${formattedDate}`)
      const result = await uploadBytesResumable(fileRef, textFile)

      const uploadSize = result.metadata.size

      const reference = await addfile({
        name: file.filename,
        fileType: 'txt',
        size: uploadSize,
        uri: fileUri,
        user: userId,
        version: 0,
        timeStamp: `${formattedDate}`
      }, file.finalDestination)

      await addFileToUser(userId, reference, uploadSize)

      toast.show('Upload successful', {
        type: 'success'
      })
    }

    else if (fileType === 'doc' || fileType === 'docx') {
      try {
        const blob = await new Promise(async (resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.onload = () => {
          resolve(xhr.response) 
          }
          xhr.onerror = (e) => {
              reject(new TypeError('Network request failed'))
          }
          xhr.responseType = 'blob'
          xhr.open('GET', file.uri, true)
          xhr.send(null)
        })
        const fileUri = `${formattedDate}^&${userId}`
        const fileRef = ref(storage, `${formattedDate}^&${userId}`)
        const result = await uploadBytesResumable(fileRef, blob)
        const uploadSize = result.metadata.size
  
        const reference = await addfile({
          name: file.filename,
          fileType: fileType,
          size: uploadSize,
          uri: fileUri,
          user: userId,
          version: 0,
          timeStamp: `${formattedDate}`
        }, file.finalDestination)

        await addFileToUser(userId, reference, uploadSize)
  
        toast.show('Upload successful', {
          type: 'success'
        })
      } catch (error) {
        alert('error within docx upload: ', error)
      }
    } else {
      try {
        const blob = await new Promise(async (resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.onload = () => {
          resolve(xhr.response) 
          }
          xhr.onerror = (e) => {
              reject(new TypeError('Network request failed'))
          }
          xhr.responseType = 'blob'
          xhr.open('GET', file.uri, true)
          xhr.send(null)
        })
        const fileUri = `${userId}/${file.filename}`
        const fileRef = ref(storage, `${userId}/${formattedDate}`)
        const result = await uploadBytesResumable(fileRef, blob)
        const uploadSize = result.metadata.size
        
        const reference = await addfile({
          name: file.filename,
          fileType: fileType,
          size: uploadSize,
          uri: fileUri,
          user: userId,
          version: 0,
          timeStamp: `${formattedDate}`
        }, file.finalDestination)

        await addFileToUser(userId, reference, uploadSize)

        toast.show('Upload successful', {
          type: 'success'
        })
      } catch (err) {
        alert(err)
      }
    }

    await removeFromQueue(file)

  }

  const uploadFileWithLock = async (file, uid) => {
    if (uploadingFiles.has(file.uri)) {
      return
    } else {
      uploadingFiles.add(file.uri)

      try {
        await uploadFile(file, uid)
      } catch (error) {
        alert('uploadFileWithLock error: ' + error.message)
      } finally {
        uploadingFiles.delete(file.uri)
      }
    }
  }

  const processUploadQueue = async (uid) => {
    try {
      let queue = JSON.parse(await AsyncStorage.getItem('uploadQueue')) || []
      console.log('upload queue: ', queue)

      if (queue.length === 0) {
        return
      }

      for (const file of queue) {
        await uploadFileWithLock(file, uid)
      }
  
    } catch (error) {
      alert('Error processing upload queue: ' + error.message)
    }
  }

  const hasResumedRef = useRef(false)

  useEffect(() => {

    if (userInst && !hasResumedRef.current) {

      hasResumedRef.current = true

      //run any of the uploads in the queue when the app restarts
      const resumeUploadsOnRestart = async () => {
        processUploadQueue(userInst.uid)
      }
      resumeUploadsOnRestart()

    }
  }, [userInst])

  //listen for queue update signals and run process uploadQueue
  useEffect(() => {
    if (!currentUser) return;

    const uploadListener = () => {
      processUploadQueue(currentUser)
    }

    UploadQueueEmitter.on('uploadQueueUpdated', uploadListener)

    return () => {
      UploadQueueEmitter.off('uploadQueueUpdated', uploadListener)
    }
  }, [currentUser])

  //when the auth state changes, pass the user object from firbaseAuth object into AuthContext
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
        setAuthUser(user)
    })
    
  }, [])
  
  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {setScreen(navigationRef.current.getCurrentRoute().name)}}
    >
        <Drawer.Navigator initialRouteName='Home'>
            <Drawer.Screen name='Home' component={Home} options={authUser && {drawerItemStyle: {display: 'none'}, title: ''}} />
            <Drawer.Screen name="Sign In/Sign Up" component={Auth} options={authUser && {drawerItemStyle: {display: 'none'}, title: ''}}/>
            <Drawer.Screen name='About' component={About} />
            <Drawer.Screen name='Contact' component={Contact} />
            <Drawer.Screen name="Dashboard" component={Dashboard} options={!authUser && {drawerItemStyle: {display: 'none'}, title: ''}} />
            <Drawer.Screen name="Settings" component={Settings} options={!authUser && {drawerItemStyle: {display: 'none'}, title: ''}} />
            <Drawer.Screen name="Registration Complete" component={ThankYou} options={{drawerItemStyle: {height: 0}, title: ''}}/>
        </Drawer.Navigator>
    </NavigationContainer>
  )
}

export default Main