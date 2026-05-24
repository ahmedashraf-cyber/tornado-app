import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, onAuthStateChanged, signOut, db } from '../firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

const SUPER_ADMIN_UID = 'HKy9hWjFOsXVv3x3FPTgpAyJmPz2'

// Firestore fetch with a hard timeout so login never hangs forever
function getDocWithTimeout(ref, ms = 5000) {
  return Promise.race([
    getDoc(ref),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('firestore_timeout')), ms)
    ),
  ])
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Determine role — super admin is hardcoded, others need Firestore
        let role = 'collector'

        // Super admin shortcut — no Firestore needed
        if (firebaseUser.uid === SUPER_ADMIN_UID) {
          role = 'super_admin'
          setUser(firebaseUser)
          setUserRole(role)
          setLoading(false)

          // Fire-and-forget: ensure doc exists in Firestore (non-blocking)
          const userRef = doc(db, 'users', firebaseUser.uid)
          setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.email.split('@')[0],
            role: 'super_admin',
            createdAt: new Date().toISOString(),
          }, { merge: true }).catch(() => {}) // silent fail — doesn't affect login

          if (window.electronAPI) {
            window.electronAPI.loginSuccess(role)
          }
          return
        }

        // Non-super-admin: try Firestore with 5s timeout
        try {
          const userRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDocWithTimeout(userRef, 5000)

          if (userDoc.exists()) {
            role = userDoc.data().role || 'collector'
          } else {
            // First login — create doc
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.email.split('@')[0],
              role: 'collector',
              createdAt: new Date().toISOString(),
            })
          }
        } catch (err) {
          // Timeout or Firestore error — default to collector, don't block login
          console.warn('Firestore user fetch failed or timed out, defaulting to collector:', err.message)
          role = 'collector'
        }

        setUser(firebaseUser)
        setUserRole(role)
        setLoading(false)

        if (window.electronAPI) {
          window.electronAPI.loginSuccess(role)
        }
      } else {
        setUser(null)
        setUserRole(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await signOut(auth)
    if (window.electronAPI) {
      window.electronAPI.logout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, userRole, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
