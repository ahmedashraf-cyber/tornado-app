import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD0CDRRUII_4NNXpFzmaQwnvSgCWzkcZJk",
  authDomain: "tornado-app-a8bb9.firebaseapp.com",
  projectId: "tornado-app-a8bb9",
  storageBucket: "tornado-app-a8bb9.firebasestorage.app",
  messagingSenderId: "1035711714347",
  appId: "1:1035711714347:web:cf852a046174689eed066e",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Keep users logged in permanently (until explicit sign out)
setPersistence(auth, browserLocalPersistence)

export {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
}
