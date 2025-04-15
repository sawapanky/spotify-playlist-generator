"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogOut, Music } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const moods = ["Happy", "Energetic", "Calm", "Sad", "Focused", "Relaxed", "Romantic", "Angry", "Nostalgic", "Party"]

const genres = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Country",
  "Electronic",
  "Jazz",
  "Classical",
  "Metal",
  "Folk",
  "Indie",
  "Latin",
  "Reggae",
  "Blues",
  "K-pop",
]

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [artists, setArtists] = useState("")
  const [mood, setMood] = useState("")
  const [genre, setGenre] = useState("")
  const [playlist, setPlaylist] = useState<any>(null)

  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push("/login")
      }
      setLoading(false)
    }
    getUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)
    setSuccess(null)
    setPlaylist(null)

    try {
      // In a real application, you would call the Spotify API here
      // For this example, we'll simulate a response
      setTimeout(() => {
        setPlaylist({
          name: `${mood} ${genre} Mix for You`,
          description: `Based on ${artists.split(",")[0]} and your preferences`,
          tracks: [
            { name: "Track 1", artist: "Artist 1", album: "Album 1" },
            { name: "Track 2", artist: "Artist 2", album: "Album 2" },
            { name: "Track 3", artist: "Artist 3", album: "Album 3" },
            { name: "Track 4", artist: "Artist 4", album: "Album 4" },
            { name: "Track 5", artist: "Artist 5", album: "Album 5" },
          ],
          url: "https://open.spotify.com/playlist/example",
        })
        setSuccess("Playlist generated successfully!")
        setFormLoading(false)
      }, 2000)
    } catch (err) {
      console.error("Error generating playlist:", err)
      setError("An error occurred while generating your playlist. Please try again.")
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 font-bold">
            <Music className="h-6 w-6" />
            <span>Spotify Playlist Generator</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Create Your Playlist</h1>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Preferences</CardTitle>
              <CardDescription>Tell us what you like and we'll create the perfect playlist for you</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="artists">Favorite Artists</Label>
                  <Textarea
                    id="artists"
                    placeholder="Enter artists separated by commas (e.g., Taylor Swift, The Weeknd, BTS)"
                    value={artists}
                    onChange={(e) => setArtists(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mood">Current Mood</Label>
                  <Select value={mood} onValueChange={setMood} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Preferred Genre</Label>
                  <Select value={genre} onValueChange={setGenre} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Playlist"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {playlist && (
            <Card>
              <CardHeader>
                <CardTitle>{playlist.name}</CardTitle>
                <CardDescription>{playlist.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <div className="p-4">
                      <h3 className="font-medium">Tracks</h3>
                    </div>
                    <div className="divide-y">
                      {playlist.tracks.map((track: any, index: number) => (
                        <div key={index} className="flex items-center p-4">
                          <div>
                            <div className="font-medium">{track.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {track.artist} • {track.album}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <a href={playlist.url} target="_blank" rel="noopener noreferrer">
                    Open in Spotify
                  </a>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
