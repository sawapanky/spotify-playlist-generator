import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Music } from "lucide-react"

export default function SignUpSuccess() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Link href="/" className="absolute left-4 top-4 flex items-center gap-2 font-bold md:left-8 md:top-8">
        <Music className="h-6 w-6" />
        <span>Spotify Playlist Generator</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-center">Sign Up Successful!</CardTitle>
          <CardDescription className="text-center">Please check your email to confirm your account.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>We've sent a confirmation link to your email address. Please click the link to activate your account.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button>Go to Login</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
