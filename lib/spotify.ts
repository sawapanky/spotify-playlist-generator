import { SpotifyError, withRetry } from "@/lib/errors"
import type {
  SpotifyTrack,
  SpotifyAudioFeatures,
  SpotifyPlaylist,
  SpotifyArtist,
  SpotifyTopTracksResponse,
  SpotifyAudioFeaturesResponse,
  SpotifyRecommendationsResponse,
  SpotifySearchResponse,
} from "@/types/spotify"
import { supabase, createServerSupabaseClient } from "./supabase"


const SPOTIFY_API_BASE = "https://api.spotify.com/v1"

// 認証なしの公開API
export async function searchArtists(query: string) {
  const response = await fetch(
    `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=artist&limit=5`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.artists.items
}

export async function getArtist(id: string) {
  const response = await fetch(`${SPOTIFY_API_BASE}/artists/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`)
  }

  return response.json()
}

export async function getArtistTopTracks(idOrConfig: string | { id: string, accessToken: string }) {
  const id = typeof idOrConfig === 'string' ? idOrConfig : idOrConfig.id
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (typeof idOrConfig !== 'string' && idOrConfig.accessToken) {
    headers.Authorization = `Bearer ${idOrConfig.accessToken}`
  }

  const response = await fetch(
    `${SPOTIFY_API_BASE}/artists/${id}/top-tracks?market=JP`,
    { headers }
  )

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.tracks
}

// 認証が必要なAPI
export async function getSpotifyAccessToken() {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      throw new SpotifyError("セッションが見つかりません", 401)
    }

    return session.provider_token
  } catch (error) {
    if (error instanceof SpotifyError) {
      throw error
    }
    throw new SpotifyError("アクセストークンの取得に失敗しました", 500)
  }
}

export async function createSpotifyPlaylist(
  accessToken: string,
  userId: string,
  name: string,
  description: string
): Promise<SpotifyPlaylist> {
  return withRetry(async () => {
    const response = await fetch(
      `${SPOTIFY_API_BASE}/users/${userId}/playlists`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          public: false,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new SpotifyError(
        errorData.error?.message || "プレイリストの作成に失敗しました",
        response.status,
        errorData.error?.code
      )
    }

    return response.json()
  })
}

export async function getRecommendations(
  accessToken: string,
  seedArtists: string[],
  seedGenres: string[],
  targetMood: string
): Promise<SpotifyRecommendationsResponse> {
  return withRetry(async () => {
    const moodParams = getMoodParameters(targetMood)
    const queryParams = new URLSearchParams({
      seed_artists: seedArtists.join(","),
      seed_genres: seedGenres.join(","),
      ...moodParams,
      limit: "50",
    })

    const response = await fetch(
      `${SPOTIFY_API_BASE}/recommendations?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new SpotifyError(
        errorData.error?.message || "おすすめトラックの取得に失敗しました",
        response.status,
        errorData.error?.code
      )
    }

    return response.json()
  })
}

export async function addTracksToPlaylist(
  accessToken: string,
  playlistId: string,
  trackUris: string[]
): Promise<void> {
  const MAX_TRACKS_PER_REQUEST = 100
  const chunks = []
  for (let i = 0; i < trackUris.length; i += MAX_TRACKS_PER_REQUEST) {
    chunks.push(trackUris.slice(i, i + MAX_TRACKS_PER_REQUEST))
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      return withRetry(async () => {
        const response = await fetch(
          `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uris: chunk,
            }),
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new SpotifyError(
            errorData.error?.message || "プレイリストへのトラック追加に失敗しました",
            response.status,
            errorData.error?.code
          )
        }
      })
    })
  )
}

function getMoodParameters(mood: string) {
  const moodParameters: Record<string, any> = {
    Happy: {
      target_valence: 0.8,
      target_energy: 0.7,
      target_danceability: 0.7,
    },
    Energetic: {
      target_energy: 0.9,
      target_danceability: 0.8,
      target_valence: 0.7,
    },
    Calm: {
      target_energy: 0.3,
      target_valence: 0.6,
      target_tempo: 100,
    },
    Sad: {
      target_valence: 0.2,
      target_energy: 0.3,
      target_tempo: 80,
    },
    Focused: {
      target_energy: 0.5,
      target_valence: 0.5,
      target_tempo: 120,
    },
    Relaxed: {
      target_energy: 0.3,
      target_valence: 0.6,
      target_tempo: 90,
    },
    Romantic: {
      target_valence: 0.7,
      target_energy: 0.4,
      target_tempo: 100,
    },
    Angry: {
      target_energy: 0.9,
      target_valence: 0.2,
      target_tempo: 140,
    },
    Nostalgic: {
      target_valence: 0.6,
      target_energy: 0.5,
      target_tempo: 110,
    },
    Party: {
      target_energy: 0.9,
      target_danceability: 0.9,
      target_valence: 0.8,
    },
  }

  return moodParameters[mood] || moodParameters.Happy
}

export async function getTrackAudioFeatures(
  accessToken: string,
  trackIds: string[]
): Promise<SpotifyAudioFeaturesResponse> {
  // 一度に取得できるトラック数の制限に対応
  const MAX_TRACKS_PER_REQUEST = 100
  const chunks = []
  for (let i = 0; i < trackIds.length; i += MAX_TRACKS_PER_REQUEST) {
    chunks.push(trackIds.slice(i, i + MAX_TRACKS_PER_REQUEST))
  }

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      return withRetry(async () => {
        const response = await fetch(
          `${SPOTIFY_API_BASE}/audio-features?ids=${chunk.join(",")}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new SpotifyError(
            errorData.error?.message || "トラックのオーディオ特徴の取得に失敗しました",
            response.status,
            errorData.error?.code
          )
        }

        return response.json()
      })
    })
  )

  return {
    audio_features: results.flatMap((result) => result.audio_features),
  }
}

export async function generatePlaylist(
  accessToken: string,
  userId: string,
  artistNames: string[],
  genre: string,
  mood: string
): Promise<{
  playlist: SpotifyPlaylist
  tracks: Array<{
    name: string
    artist: string
    album: string
    url: string
  }>
}> {
  // アーティスト名からアーティストIDを取得
  const artistIds = await Promise.all(
    artistNames.map(async (name) => {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(
          name
        )}&type=artist&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      const data: SpotifySearchResponse = await response.json()
      return data.artists.items[0]?.id
    })
  )

  // 有効なアーティストIDのみをフィルタリング
  const validArtistIds = artistIds.filter((id) => id)
  if (validArtistIds.length === 0) {
    throw new Error("有効なアーティストが見つかりませんでした。アーティスト名を確認してください。")
  }

  // 各アーティストのトップトラックを取得
  const topTracksPromises = validArtistIds.map((id) =>
    getArtistTopTracks({ id, accessToken })
  )
  const topTracksResults = await Promise.all(topTracksPromises)
  const allTopTracks = topTracksResults.flatMap((result) => result)

  // トップトラックのオーディオ特徴を取得
  const trackIds = allTopTracks.map((track) => track.id)
  const audioFeatures = await getTrackAudioFeatures(accessToken, trackIds)

  // 気分に基づいてパラメータを設定
  const moodParams = getMoodParameters(mood)

  // おすすめトラックを取得
  const recommendations = await getRecommendations(
    accessToken,
    validArtistIds,
    [genre.toLowerCase()],
    mood
  )

  // トップトラックとおすすめトラックを組み合わせる
  const combinedTracks = [...allTopTracks, ...recommendations.tracks]

  // 重複を除去
  const uniqueTracks = Array.from(
    new Map(combinedTracks.map((track) => [track.id, track])).values()
  )

  // プレイリストを作成
  const playlistName = `${mood} ${genre} Mix`
  const playlistDescription = `A ${mood.toLowerCase()} ${genre.toLowerCase()} playlist generated based on your preferences and favorite artists`
  const playlistData = await createSpotifyPlaylist(
    accessToken,
    userId,
    playlistName,
    playlistDescription
  )

  // プレイリストにトラックを追加
  const trackUris = uniqueTracks.map((track) => track.uri)
  await addTracksToPlaylist(accessToken, playlistData.id, trackUris)

  return {
    playlist: playlistData,
    tracks: uniqueTracks.map((track) => ({
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      url: track.external_urls.spotify,
    })),
  }
} 