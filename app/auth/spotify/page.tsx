import { redirect } from "next/navigation"

export default function SpotifyAuthPage() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
  const scope = "user-read-email user-read-private playlist-read-private playlist-modify-public playlist-modify-private"

  if (!clientId || !redirectUri) {
    throw new Error("Missing required environment variables")
  }

  const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
  }).toString()}`

  redirect(authUrl)
} 