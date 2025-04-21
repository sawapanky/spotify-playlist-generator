"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

// searchParamsを受け取るコンポーネント
function SignInWithParams() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  useEffect(() => {
    // ログインページに自動リダイレクト
    const timer = setTimeout(() => {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [router, callbackUrl])

  return (
    <div className="text-center">
      <h1 className="mb-4 text-2xl font-bold">ログイン</h1>
      <p className="text-gray-600 mb-6">ログインページにリダイレクト中...</p>
      <Button onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)}>
        今すぐログインページへ
      </Button>
    </div>
  )
}

// メインページコンポーネント
export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <SignInWithParams />
      </Suspense>
    </div>
  )
}
