import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI

  if (!code || !redirectUri) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signin?error=No code provided`
    )
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Spotifyのアクセストークンを取得
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error_description || "Failed to get access token")
    }

    // 現在のユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not found")
    }

    // SpotifyのトークンをSupabaseに保存
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        spotify_access_token: data.access_token,
        spotify_refresh_token: data.refresh_token,
        spotify_token_expires_at: new Date(
          Date.now() + data.expires_in * 1000
        ).toISOString(),
      })

    if (error) {
      throw error
    }

    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/signin?error=Authentication failed`
    )
  }
}

// シンプルな応答を返す関数
export async function GET_simple(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    
    if (!query) {
      return NextResponse.json(
        { error: "Artist name is required" },
        { status: 400 }
      );
    }
    
    // テスト用の応答を返す
    return NextResponse.json({
      artist: {
        id: "test-id",
        name: query,
        image: "https://via.placeholder.com/300",
        genres: ["test genre"],
        popularity: 80,
        externalUrl: "https://open.spotify.com",
      },
      tracks: [
        {
          id: "track-1",
          name: "Test Track 1",
          album: "Test Album",
          albumImage: "https://via.placeholder.com/300",
          releaseDate: "2023",
          previewUrl: null,
          externalUrl: "https://open.spotify.com",
          popularity: 75,
          artists: "Test Artist",
        }
      ],
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

// Spotify APIのベースURL
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

// アクセストークンを取得する関数
async function getSpotifyToken() {
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
  
  if (!client_id || !client_secret) {
    throw new Error("Spotify credentials not found");
  }
  
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error_description || "Failed to get Spotify token");
  }
  
  return data.access_token;
}

// アーティスト検索関数
async function searchArtist(token: string, query: string) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=artist&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to search artist");
  }
  
  if (data.artists.items.length === 0) {
    throw new Error("No artists found");
  }
  
  return data.artists.items[0];
}

// アーティストのトップトラックを取得する関数
async function getArtistTopTracks(token: string, artistId: string) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/artists/${artistId}/top-tracks?market=JP`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to get top tracks");
  }
  
  return data.tracks;
}

export async function GET_spotify_search(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  
  if (!query) {
    return NextResponse.json(
      { error: "Artist name is required" },
      { status: 400 }
    );
  }
  
  try {
    // 1. トークン取得
    const token = await getSpotifyToken();
    
    // 2. アーティスト検索
    const artist = await searchArtist(token, query);
    
    // 3. トップトラック取得
    const tracks = await getArtistTopTracks(token, artist.id);
    
    // 4. データを整形
    const formattedTracks = tracks.map((track: any) => ({
      id: track.id,
      name: track.name,
      album: track.album.name,
      albumImage: track.album.images[0]?.url,
      releaseDate: track.album.release_date,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      popularity: track.popularity,
      artists: track.artists.map((artist: any) => artist.name).join(", "),
    }));
    
    return NextResponse.json({
      artist: {
        id: artist.id,
        name: artist.name,
        image: artist.images[0]?.url,
        genres: artist.genres,
        popularity: artist.popularity,
        externalUrl: artist.external_urls.spotify,
      },
      tracks: formattedTracks,
    });
  } catch (error: any) {
    console.error("Spotify API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch data from Spotify" },
      { status: 500 }
    );
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// メールアドレスとパスワードでサインイン
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

// メールアドレスとパスワードでサインアップ
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  })
  if (error) throw error
  return data
}

export const getSupabaseSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseKey)
} 