"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function AuthCallback() {
  const router = useRouter()
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [session, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">認証中...</h1>
        <p className="text-muted-foreground">しばらくお待ちください</p>
      </div>
    </div>
  )
} 