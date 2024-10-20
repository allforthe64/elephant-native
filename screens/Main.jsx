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
import { addfile, updateUser, userListener } from '../firebase/firestore';
import { firebaseAuth, storage } from '../firebaseConfig';
import {ref, uploadBytesResumable} from 'firebase/storage'

//import ImageManipulator object from expo
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

//import useToast for notifications
import { useToast } from 'react-native-toast-notifications'

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

  const uploadImages = async () => {

      const references = await Promise.all(que.map(async (photo, i) => {
            //create new formatted date for file
            const formattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss") + `_${i}`
            /* const nonRandomFormattedDate = format(new Date(), "yyyy-MM-dd:hh:mm:ss") */

            //generate a resized version of the image for thumbnails
            const manipResult = await manipulateAsync(
                photo.uri,
                [{ resize: {height: photo.height * .1, width: photo.width * .1} }],
                { compress: 1, format: SaveFormat.PNG }
              );

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
            const thumbnailFilename = `${formattedDate}&thumbnail.jpg`
            const thumbnailFileUri = `thumbnail&${formattedDate}`
            const thumbnailFileRef = ref(storage, `${currentUser}/thumbnail&${formattedDate}`)
            const thumbnailResult = await uploadBytesResumable(thumbnailFileRef, thumbNailBlob) 

            //upload regular version
            //create blob using the photo from state and save it to elephant staging
            const blob = await new Promise(async (resolve, reject) => {
                const xhr = new XMLHttpRequest()
                xhr.onload = () => {
                resolve(xhr.response) 
                }
                xhr.onerror = (e) => {
                    reject(new TypeError('Network request failed'))
                }
                xhr.responseType = 'blob'
                xhr.open('GET', photo.uri, true)
                xhr.send(null)
            })

            const filename = `${formattedDate}.jpg`
            const fileUri = `${currentUser}/${formattedDate}`
            const fileRef = ref(storage, `${currentUser}/${formattedDate}`)
            const result = await uploadBytesResumable(fileRef, blob)

            let finalDestination = false

            MediaLibrary.saveToLibraryAsync(photo.uri).then((() => {
              console.log('success')
            }))

            const reference = await addfile({
                name: filename,
                fileType: 'jpg',
                size: result.metadata.size,
                uri: fileUri,
                thumbnailUri: thumbnailFileUri,
                user: currentUser,
                version: 0,
                timeStamp: `${formattedDate}`
            }, finalDestination)
            return reference
        }))

        console.log('references: ', references)

        
        const updatedUser = {...userInst, fileRefs: [...userInst.fileRefs, ...references]}
        updateUser(updatedUser)
        toast.show('Upload successful', {
            type: 'success'
        })
        setQue([])
  }

  //when the auth state changes, pass the user object from firbaseAuth object into AuthContext
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
        setAuthUser(user)
      })
    
  }, [])



  useEffect(() => {
    if (que.length > 0 && screen !== 'Camera') {
      uploadImages()
    }
  }, [que, screen])

  console.log(que)
  console.log(screen)
  
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