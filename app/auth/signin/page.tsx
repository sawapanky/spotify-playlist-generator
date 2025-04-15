import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"

export default async function SignIn() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <a
            href="/api/auth/signin/spotify"
            className="group relative flex w-full justify-center rounded-md bg-[#1DB954] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1ed760] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1DB954]"
          >
            Sign in with Spotify
          </a>
        </div>
      </div>
    </div>
  )
} 