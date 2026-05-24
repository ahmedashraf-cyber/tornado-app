// Run this ONCE to create the Super Admin account
// Command: node scripts/create-super-admin.mjs

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD0CDRRUII_4NNXpFzmaQwnvSgCWzkcZJk",
  authDomain: "tornado-app-a8bb9.firebaseapp.com",
  projectId: "tornado-app-a8bb9",
  storageBucket: "tornado-app-a8bb9.firebasestorage.app",
  messagingSenderId: "1035711714347",
  appId: "1:1035711714347:web:cf852a046174689eed066e",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

async function createSuperAdmin() {
  const email = 'omar@tornado-app.com'
  const password = 'Tornado@2025!'

  try {
    console.log('Creating Super Admin account...')
    const cred = await createUserWithEmailAndPassword(auth, email, password)

    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email,
      name: 'Omar',
      role: 'super_admin',
      createdAt: new Date().toISOString(),
    })

    console.log('\n✅ Super Admin created successfully!')
    console.log('─────────────────────────────────')
    console.log('Email:   ', email)
    console.log('Password:', password)
    console.log('UID:     ', cred.user.uid)
    console.log('─────────────────────────────────')
    console.log('\nYou can now log in to Tornado with these credentials.')
    console.log('Delete this script after running it.')
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('⚠️  Super Admin already exists — no action needed.')
    } else {
      console.error('❌ Error:', err.message)
    }
  }
  process.exit(0)
}

createSuperAdmin()
