import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, onAuthStateChanged, signOut, db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch role from Firestore users collection
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          const role = userDoc.exists() ? userDoc.data().role : 'collector'
          setUser(firebaseUser)
          setUserRole(role)

          // Tell Electron main process to open main window with role
          if (window.electronAPI) {
            window.electronAPI.loginSuccess(role)
          }
        } catch (err) {
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
