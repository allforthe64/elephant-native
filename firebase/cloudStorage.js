import { deleteObject, ref } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { getDownloadURL } from "firebase/storage";

//delete existing file in storage
export const deleteFile = (path) => {
    //delete the file 
    deleteObject(ref(storage, path))
}

//return a downloadURL for a file resource
export const getFileDownloadURL = async (docURL) => {
    const fileURL = await getDownloadURL(ref(storage, docURL)).then(url => {return url})
    return fileURL
}