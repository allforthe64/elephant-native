import {
    setDoc,
    getDoc,
    addDoc,
    updateDoc,
    doc,
    collection,
    onSnapshot,
    deleteDoc
} from 'firebase/firestore'
import { db } from '../firebaseConfig'

import { getStorage, ref, getDownloadURL } from 'firebase/storage'

const storage = getStorage()

const BUCKET_URL = 'gs://elephantapp-21e34.appspot.com'


//pull a user from the firestore data base by using a localId/uid token
export async function getUser(user) {
    
    const docSnap = await getDoc(doc(db, 'users', user.localId))

    if (!docSnap.exists()) {
        const newUser = addUser(user)
        return newUser
    } else {
        return {...docSnap.data(), uid: user.localId}
    }
}