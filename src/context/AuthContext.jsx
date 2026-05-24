import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, onAuthStateChanged, signOut, db } from '../firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

const SUPER_ADMIN_UID = 'HKy9hWjFOsXVv3x3FPTgpAyJmPz2'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid)
          const userDoc = await getDoc(userRef)

          let role = 'collector'

          if (userDoc.exists()) {
            role = userDoc.data().role
          } else {
            // First login — auto-create the Firestore user document
            // Super Admin UID is hardcoded for bootstrap security
            if (firebaseUser.uid === SUPER_ADMIN_UID) {
              role = 'super_admin'
            }
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.email.split('@')[0],
              role,
              createdAt: new Date().toISOString(),
            })
          }

          setUser(firebaseUser)
          setUserRole(role)

          if (window.electronAPI) {
            window.electronAPI.loginSuccess(role)
          }
        } catch (err) {
          console.error('Auth error:', err)
          setUser(firebaseUser)
          setUserRole('collector')
        }
      } else {
        setUser(null)
        setUserRole(null)
      }
      setLoading(false)
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
