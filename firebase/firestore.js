import {
    getDoc,
    addDoc,
    updateDoc,
    doc,
    collection,
    onSnapshot,
    arrayUnion,
    increment
} from 'firebase/firestore'
import { db } from '../firebaseConfig'

const BUCKET_URL = 'gs://elephantapp-21e34.appspot.com'

// User documents are created by the web app at sign-up; this app only reads and edits them.
// File and folder edits live in ./fileSystem.js.

export function createFolderId() {
    return Math.floor(Math.random() * 9e11) + 1e11
}

//get a user document using a uid, setup snapshot listener to monitor changes
export async function userListener(setCurrentUser, setStaging, user) {
    const unsub = onSnapshot(
        doc(db, 'users', user),
        (snap) => {
            try {
                if (!snap.exists()) return
                const data = snap.data()
                //filter file references from the current user that are in staging
                const stagingRefs = (data.fileRefs || []).filter(el => el.flag === 'Staging')
                if (setStaging) setStaging(stagingRefs)
                setCurrentUser({...data, uid: user})
            } catch (err) {console.log(err)}
        },
        (error) => {
            console.warn('userListener error:', error?.code || error?.message || error)
        }
    )

    return unsub
}

/** Strip a trailing " (N)" so collision checks use the clean folder basename. */
export function getFolderBasename(name) {
    return String(name ?? '').trim().replace(/\s\(\d+\)$/, '')
}

/**
 * Resolve a unique folder name within the same parent.
 * Appends " (N)" only when another sibling already uses that basename.
 */
export function resolveUniqueFolderName(desiredName, folders, { parentId = '', excludeId = null } = {}) {
    const base = getFolderBasename(desiredName)
    if (!base) return ''

    const parentKey = parentId === '' || parentId == null ? '' : String(parentId)
    let conflicts = 0
    ;(Array.isArray(folders) ? folders : []).forEach((f) => {
        if (excludeId != null && String(f.id) === String(excludeId)) return
        const fParent = f.nestedUnder === '' || f.nestedUnder == null ? '' : String(f.nestedUnder)
        if (fParent !== parentKey) return
        if (getFolderBasename(f.fileName).toLowerCase() === base.toLowerCase()) {
            conflicts += 1
        }
    })

    return conflicts > 0 ? `${base} (${conflicts})` : base
}

//function to specifically add new files to user, using the atomic atomic updates
export async function addFileToUser(userId, reference, fileSize) {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
        fileRefs: arrayUnion(reference),
        spaceUsed: increment(fileSize)
    })
}


//manipulate file data:

//create a new fileData obj, upload the document into cloud storage
export async function addfile(file, destination) {
    try {
        // Use the real extension (last segment) so names like "URL for https://a.b/c.txt" still work
        const nameExt = (String(file.name || '').split('.').pop() || '').toLowerCase()
        const isOfficeDoc = nameExt === 'doc' || nameExt === 'docx' || file.fileType === 'doc' || file.fileType === 'docx'
        const storageUri = isOfficeDoc
            ? BUCKET_URL + '/' + file.timeStamp + '^&' + file.user
            : BUCKET_URL + '/' + file.user + '/' + file.timeStamp

        let fileRef
        if (file.linksTo) {
            fileRef = await addDoc(collection(db, 'files'), {
                fileName: file.name,
                documentType: file.fileType,
                linksTo: file.linksTo,
                size: file.size,
                uri: storageUri,
                version: file.version
            })
        } else {
            if (file.fileType !== 'jpg' && file.fileType !== 'jpeg' && file.fileType !== 'png' && file.fileType !== "JPG" && file.fileType !== 'JPEG' && file.fileType !== 'PNG') {
                fileRef = await addDoc(collection(db, 'files'), {
                    fileName: file.name,
                    documentType: file.fileType,
                    size: file.size,
                    uri: storageUri,
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
        throw error
    }
}

//find a fileData obj using a file id and return the file data
export const getFile = async (fileId) => {
    const docSnap = await getDoc(doc(db, 'files', fileId))
    return {...docSnap.data()}
}
