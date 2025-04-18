import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { supabase } from "@/lib/supabase"

export function useAuth() {
  const { data: session, status } = useSession()
  const [supabaseSession, setSupabaseSession] = useState<any>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      if (session?.accessToken) {
        const { data: { session: supabaseSession }, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting Supabase session:", error)
          return
        }
        setSupabaseSession(supabaseSession)
      }
    }

    initializeAuth()
  }, [session])

  return {
    session,
    supabaseSession,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
} 