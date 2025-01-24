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

//cloud storage function imports
import { deleteFile } from './cloudStorage'



//fetch/manipulate user data:

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

export async function addUser(user) {
    const userRef = setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.email,
        files: [{id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'My House', nestedUnder: ''}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Financial', nestedUnder: ''}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Personal/Medical', nestedUnder: ''}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Pictures/Videos', nestedUnder: ''}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Work', nestedUnder: ''}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Hobbies', nestedUnder: ''}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Basement/Mech', nestedUnder: 1}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Garage', nestedUnder: 1}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Kitchen', nestedUnder: 1}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Main Floor', nestedUnder: 1}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Second Floor', nestedUnder: 1}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Structure', nestedUnder: 1}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Mortgage', nestedUnder: 2}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Insurance', nestedUnder: 2}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Tax Info', nestedUnder: 2}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Banking', nestedUnder: 2}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Friends', nestedUnder: 4}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Family', nestedUnder: 4}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Pets', nestedUnder: 4}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Vacations', nestedUnder: 4}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Events', nestedUnder: 4}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Receipts', nestedUnder: 15}, {id: Math.floor(Math.random() * 9e11) + 1e11, fileName: 'Returns', nestedUnder: 15}],
        fileRefs: [],
        sharedWith: {},
        passcodeAuthenticated: false,
        spaceUsed: 0
    })
}

//get a user document using a uid, setup snapshot listener to monitor changes
export async function userListener(setCurrentUser, setStaging, user) {
    const unsub = onSnapshot(doc(db, 'users', user), (doc) => {
        try {
            //filter file references from the current user that are in staging
            const stagingRefs = doc.data().fileRefs.filter(el => el.flag === 'Staging')
            if (setStaging) setStaging(stagingRefs)
            setCurrentUser({...doc.data(), uid: user})
        } catch (err) {console.log(err)}
    })

    return unsub
}

//find a user by uid, replace current user data with new user data object (coming in as input for function)
export async function updateUser(updatedUser) {
    const userRef = doc(db, 'users', updatedUser.uid)
    await updateDoc(userRef, {...updatedUser})
}


//manipulate file data:

//create a new fileData obj, upload the document into cloud storage
export async function addfile(file, destination) {
    try {
        let fileRef
        if (file.linksTo) {
            fileRef = await addDoc(collection(db, 'files'), {
                fileName: file.name,
                documentType: file.fileType,
                linksTo: file.linksTo,
                size: file.size,
                uri: file.name.split('.')[1] === 'doc' || file.name.split('.')[1] === 'docx' ? BUCKET_URL + '/' + file.timeStamp + '^&' + file.user
                : BUCKET_URL + '/' + file.user + '/' + file.timeStamp,
                version: file.version
            })
        } else {
            if (file.fileType !== 'jpg' && file.fileType !== 'jpeg' && file.fileType !== 'png' && file.fileType !== "JPG" && file.fileType !== 'JPEG' && file.fileType !== 'PNG') {
                fileRef = await addDoc(collection(db, 'files'), {
                    fileName: file.name,
                    documentType: file.fileType,
                    size: file.size,
                    uri: file.name.split('.')[1] === 'doc' || file.name.split('.')[1] === 'docx' ? BUCKET_URL + '/' + file.timeStamp + '^&' + file.user
                    : BUCKET_URL + '/' + file.user + '/' + file.timeStamp,
                    version: file.version
                })
            } else {
                fileRef = await addDoc(collection(db, 'files'), {
                    fileName: file.name,
                    documentType: file.fileType,
                    size: file.size,
                    uri: BUCKET_URL + '/' + file.user + '/' + file.timeStamp,
                    thumbnailUri:  BUCKET_URL + '/' + file.user + '/' + `thumbnail&${file.timeStamp}`,
                    version: file.version
                })
            }
        }

        const reference = {
            fileId: fileRef.id,
            fileName: file.name,
            flag: destination ? destination : 'Staging',
            version: file.version,
            size: file.size
        }
        return reference
    } catch (error) {
        console.log('error within storage: ', error)
    }
}

//find a fileData obj using a file id and return the file data
export const getFile = async (fileId) => {
    const docSnap = await getDoc(doc(db, 'files', fileId))
    return {...docSnap.data()}
}

//find a fileData obj using a file id and replace the existing data with the data from the incoming fileData obj
export const updateFileObj = async (input) => {
    console.log(input)
    const fileRef = doc(db, 'files', input.fileId)
    console.log(fileRef)
    await updateDoc(fileRef, {...input})
}

//find a fileData obj using a file id and delete it/call deleteFile method to remove the physical file using the uri contained within the fileData obj
export const deleteFileObj = async (id) => {
    const file = await getDoc(doc(db, 'files', id))
    deleteFile(file.data().uri)
    if (file.data().thumbnailUri) {
        deleteFile(file.data().thumbnailUri)
    }
    await deleteDoc(doc(db, 'files', id))
}