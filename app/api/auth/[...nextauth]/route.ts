import NextAuth from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import { SupabaseAdapter } from "@auth/supabase-adapter"

const handler = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user-read-email user-read-private playlist-read-private playlist-modify-public playlist-modify-private",
        },
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }),
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})

export { handler as GET, handler as POST } 