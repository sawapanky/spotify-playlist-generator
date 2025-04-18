"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function LoginPage() {
  const router = useRouter()
  const { signIn, signUp, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // メールアドレス+パスワードでサインアップ
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    
    try {
      await signUp(email, password)
      setMessage('確認メールを送信しました。メールを確認してください。')
    } catch (err) {
      setError(authError || 'サインアップ中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // メールアドレス+パスワードでログイン
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    
    try {
      // 直接Supabaseクライアントを使用
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw error
      }
      
      console.log("ログイン成功、ダッシュボードへリダイレクト")
      router.push('/dashboard')
    } catch (err: any) {
      console.error("ログインエラー:", err)
      setError(err.message || 'ログイン中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Spotify Playlist Generator
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            アカウントにログインして始めましょう
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form className="space-y-6">
          <div>
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              onClick={handleLogin}
              className="flex-1"
              disabled={loading}
            >
              ログイン
            </Button>
            
            <Button
              type="button"
              onClick={handleSignUp}
              className="flex-1"
              disabled={loading}
            >
              アカウント作成
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
