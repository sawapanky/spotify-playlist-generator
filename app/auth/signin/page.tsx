"use client"

import { signInWithSpotify } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function SignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  useEffect(() => {
    const handleSignIn = async () => {
      try {
        await signInWithSpotify()
      } catch (error) {
        console.error("Sign in error:", error)
      }
    }
    handleSignIn()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">Spotifyでログイン</h1>
        <p className="text-gray-600">リダイレクト中...</p>
      </div>
    </div>
  )
} 