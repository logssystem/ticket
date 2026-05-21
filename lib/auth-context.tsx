'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { useRouter } from 'next/navigation'

export type UserRole = 'admin' | 'agente' | 'cliente'

export interface UserProfile {
  uid: string
  email: string
  nome: string
  role: UserRole
  equipe?: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const docRef = doc(db, 'usuarios', firebaseUser.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const docRef = doc(db, 'usuarios', result.user.uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const userProfile = docSnap.data() as UserProfile
      setProfile(userProfile)
      // Redireciona conforme o perfil
      if (userProfile.role === 'cliente') {
        router.push('/meus-tickets')
      } else {
        router.push('/')
      }
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setProfile(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
