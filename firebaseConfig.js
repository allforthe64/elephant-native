import { initializeApp } from 'firebase/app'
import { initializeAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import firebase from 'firebase/compat/app'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


//configure firebase
const firebaseConfig = {
  apiKey: "AIzaSyC8DpSdkz3VSvDh6xUbyA83xtFoUaa6HUQ",
  authDomain: "elephantapp-21e34.firebaseapp.com",
  projectId: "elephantapp-21e34",
  storageBucket: "elephantapp-21e34.appspot.com",
  messagingSenderId: "572276226266",
  appId: "1:572276226266:web:e32e1b8d79b50c3cbd8de3",
  measurementId: "G-V18K1CK9N5"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app)
export const storage = getStorage(app)

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export { firebase }