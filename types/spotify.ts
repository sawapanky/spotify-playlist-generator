export interface SpotifyTrack {
  id: string
  name: string
  uri: string
  artists: Array<{
    id: string
    name: string
  }>
  album: {
    name: string
    images: Array<{
      url: string
      height: number
      width: number
    }>
  }
  external_urls: {
    spotify: string
  }
}

export interface SpotifyAudioFeatures {
  id: string
  danceability: number
  energy: number
  key: number
  loudness: number
  mode: number
  speechiness: number
  acousticness: number
  instrumentalness: number
  liveness: number
  valence: number
  tempo: number
  duration_ms: number
  time_signature: number
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  external_urls: {
    spotify: string
  }
}

export interface SpotifyArtist {
  id: string
  name: string
}

export interface SpotifyTopTracksResponse {
  tracks: SpotifyTrack[]
}

export interface SpotifyAudioFeaturesResponse {
  audio_features: SpotifyAudioFeatures[]
}

export interface SpotifyRecommendationsResponse {
  tracks: SpotifyTrack[]
}

export interface SpotifySearchResponse {
  artists: {
    items: SpotifyArtist[]
  }
}

export class SpotifyError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string
  ) {
    super(message)
    this.name = "SpotifyError"
  }
}