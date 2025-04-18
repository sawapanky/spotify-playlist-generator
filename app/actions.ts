'use server'

// Spotify APIのベースURL
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

// アクセストークンを取得する関数
async function getSpotifyToken() {
  const client_id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const client_secret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
  
  if (!client_id || !client_secret) {
    console.error("Spotify認証情報が見つかりません");
    throw new Error("Spotify認証情報が見つかりません");
  }
  
  try {
    console.log("トークン取得開始...");
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
      console.error("トークン取得失敗:", data);
      throw new Error(data.error_description || "Spotifyトークンの取得に失敗しました");
    }
    
    console.log("トークン取得成功");
    return data.access_token;
  } catch (error) {
    console.error("トークン取得エラー:", error);
    throw new Error("Spotifyトークンの取得に失敗しました");
  }
}

// アーティスト検索
// app/actions.ts の searchArtist関数を修正
export async function searchArtist(query: string) {
    console.log("検索クエリ:", query);
    
    try {
      // Spotifyアクセストークン取得
      const accessToken = await getSpotifyToken();
      
      // アーティスト検索
      const searchResponse = await fetch(
        `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=artist&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          next: { revalidate: 3600 }, // 1時間キャッシュ
        }
      );
      
      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        console.error("アーティスト検索エラー:", errorData);
        throw new Error("アーティストの検索に失敗しました");
      }
      
      const searchData = await searchResponse.json();
      
      // 検索結果がない場合
      if (searchData.artists.items.length === 0) {
        throw new Error("アーティストが見つかりませんでした");
      }
      
      const artist = searchData.artists.items[0];
      console.log("アーティスト情報:", artist.name, artist.id);
      
      // 人気曲を取得
      const tracksResponse = await fetch(
        `${SPOTIFY_API_BASE}/artists/${artist.id}/top-tracks?market=JP`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          next: { revalidate: 3600 }, // 1時間キャッシュ
        }
      );
      
      if (!tracksResponse.ok) {
        const errorData = await tracksResponse.json();
        console.error("トラック取得エラー:", errorData);
        throw new Error("人気曲の取得に失敗しました");
      }
      
      const tracksData = await tracksResponse.json();
      
      // 結果を整形して返す
      return {
        artist: {
          id: artist.id,
          name: artist.name,
          image: artist.images.length > 0 ? artist.images[0].url : null,
          genres: artist.genres || [],
          popularity: artist.popularity,
          externalUrl: artist.external_urls.spotify,
        },
        tracks: tracksData.tracks.map((track: any) => ({
          id: track.id,
          name: track.name,
          album: track.album.name,
          albumImage: track.album.images.length > 0 ? track.album.images[0].url : null,
          releaseDate: track.album.release_date,
          previewUrl: track.preview_url,
          externalUrl: track.external_urls.spotify,
          popularity: track.popularity,
          artists: track.artists.map((a: any) => a.name).join(", "),
        })),
      };
    } catch (error: any) {
      console.error("API呼び出しエラー:", error);
      throw new Error(error.message || "検索中にエラーが発生しました");
    }
  }