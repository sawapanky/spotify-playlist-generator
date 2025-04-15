import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6">
          <div className="flex items-center gap-2 font-bold">
            <Music className="h-6 w-6" />
            <span>Spotify Playlist Generator</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Create Your Perfect Spotify Playlist
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Tell us your favorite artists, current mood, and preferred genres, and we'll generate the perfect
                  playlist for you.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/signup">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Spotify Playlist Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
