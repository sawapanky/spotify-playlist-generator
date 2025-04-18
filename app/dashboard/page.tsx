"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogOut, Music, Search, ExternalLink, Play } from "lucide-react"
import { searchArtist } from "@/app/actions"

type Track = {
  id: string
  name: string
  album: string
  albumImage: string
  releaseDate: string
  previewUrl: string | null
  externalUrl: string
  popularity: number
  artists: string
}

type Artist = {
  id: string
  name: string
  image: string
  genres: string[]
  popularity: number
  externalUrl: string
}

const imageLoader = ({ src }: { src: string }) => {
  return src;
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)

  const router = useRouter()
  const supabase = createClientComponentClient()

  // サインアウト処理
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (err) {
      console.error("サインアウトエラー:", err)
    }
  }

  // アーティスト検索処理 - Server Actionsを使用
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      setError("アーティスト名を入力してください")
      return
    }
    
    setLoading(true)
    setError(null)
    setArtist(null)
    setTracks([])
    
    try {
      console.log("検索開始:", searchQuery)
      const result = await searchArtist(searchQuery.trim())
      console.log("検索結果:", result)
      
      setArtist(result.artist)
      setTracks(result.tracks)
    } catch (err: any) {
      console.error("検索エラー:", err)
      setError(err.message || "検索中にエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  // 音楽プレビュー再生処理
  const playPreview = (trackId: string, previewUrl: string | null) => {
    if (!previewUrl) {
      return
    }
    
    if (audioRef) {
      audioRef.pause()
    }
    
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null)
      return
    }
    
    const audio = new Audio(previewUrl)
    audio.play()
    audio.onended = () => setCurrentlyPlaying(null)
    setAudioRef(audio)
    setCurrentlyPlaying(trackId)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background border-b">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 font-bold">
            <Music className="h-6 w-6" />
            <span>アーティスト検索</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-6 px-4 sm:px-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>アーティスト検索</CardTitle>
            <CardDescription>
              アーティスト名を入力して、人気曲を検索できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="アーティスト名を入力"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    検索中...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    検索
                  </>
                )}
              </Button>
            </form>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        {artist && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>アーティスト情報</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {artist.image && (
                  <div className="w-40 h-40 relative rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      loader={imageLoader}
                      src={artist.image}
                      alt={artist.name}
                      width={160}
                      height={160}
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{artist.name}</h2>
                  {artist.genres?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">ジャンル:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {artist.genres.map((genre) => (
                          <span
                            key={genre}
                            className="text-xs bg-secondary px-2 py-1 rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4">
                    <a
                      href={artist.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary flex items-center gap-1 hover:underline"
                    >
                      <span>Spotifyで表示</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {tracks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>人気曲</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    {track.albumImage && (
                      <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                        <Image
                          loader={imageLoader}
                          src={track.albumImage}
                          alt={track.album}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{track.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.album}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {track.previewUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => playPreview(track.id, track.previewUrl)}
                        >
                          <Play
                            className={`h-5 w-5 ${
                              currentlyPlaying === track.id ? "text-primary" : ""
                            }`}
                          />
                        </Button>
                      )}
                      <a
                        href={track.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
