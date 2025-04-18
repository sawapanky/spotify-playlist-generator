'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, signInWithEmail, signUpWithEmail } from '@/lib/supabase'
import type { Session, User } from '@/types/auth'

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // セッションの監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session) {
          const { data: { user } } = await supabase.auth.getUser()
          setUser(user)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    // 初期セッションの取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        supabase.auth.getUser().then(({ data: { user } }) => {
          setUser(user)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // サインイン
  const signIn = async (email: string, password: string) => {
    setError(null)
    try {
      await signInWithEmail(email, password)
    } catch (error: any) {
      setError(error.message || 'ログインに失敗しました')
      throw error
    }
  }

  // サインアップ
  const signUp = async (email: string, password: string) => {
    setError(null)
    try {
      await signUpWithEmail(email, password)
    } catch (error: any) {
      setError(error.message || 'アカウント作成に失敗しました')
      throw error
    }
  }

  // サインアウト
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'ログアウトに失敗しました')
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 