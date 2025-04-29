import { initializeApp } from 'firebase/app'
import { initializeAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import firebase from 'firebase/compat/app'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'

//appcheck imports
import { initializeAppCheck, CustomProvider, getToken } from 'firebase/app-check';

//configure firebase
const firebaseConfig = {
  apiKey: "AIzaSyC8DpSdkz3VSvDh6xUbyA83xtFoUaa6HUQ",
  authDomain: "elephantapp-21e34.firebaseapp.com",
  projectId: "elephantapp-21e34",
  storageBucket: "elephantapp-21e34.appspot.com",
  messagingSenderId: "572276226266",
  appId: Platform.OS = 'android' ? "1:572276226266:android:5660015065e0d5b4bd8de3" : "1:572276226266:ios:c8422618b2f9d710bd8de3",
  measurementId: "G-V18K1CK9N5"
};

//dev config
/* const firebaseConfig = {
  apiKey: "AIzaSyC4vDa5yD6s0iV360IQLNtqC3MNqCK7cc8",
  authDomain: "elephant-dev-mode.firebaseapp.com",
  projectId: "elephant-dev-mode",
  storageBucket: "elephant-dev-mode.firebasestorage.app",
  messagingSenderId: "746078858340",
  appId: Platform.OS = 'android' ? "1:746078858340:android:8c34f4724261e909f28371" : "1:746078858340:ios:ed7059d8c7b51b02f28371",
  measurementId: "G-V18K1CK9N5"
};
   */
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Generate your custom token
const generateCustomToken = async () => {
  const response = await fetch('https://www.myelephantapp.com/api/db-link', {
    method: 'POST',
    body: JSON.stringify({ appId: Platform.OS = 'android' ? '1:572276226266:android:5660015065e0d5b4bd8de3' : '1:572276226266:ios:c8422618b2f9d710bd8de3' }),
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (data.appCheckToken) {
    console.log('appcheck token recieved')
    return data.appCheckToken.token;
  } else {
    console.log('no appcheck token recieved')
    throw new Error("Token not received from backend");
  }
};

// Initialize App Check with the custom provider
const appCheck = initializeAppCheck(app, {
  provider: new CustomProvider({
    getToken: async () => {
      const token = await generateCustomToken();
      return {
        token,
        expireTimeMillis: Date.now() + 60 * 60 * 1000, // 1 hour expiration
      };
    },
  }),
  isTokenAutoRefreshEnabled: true, // Enable auto-refresh of tokens
});


export const db = getFirestore(app)
export const storage = getStorage(app)

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export { firebase }