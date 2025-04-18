export class SpotifyError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message)
    this.name = "SpotifyError"
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof SpotifyError) {
    switch (error.statusCode) {
      case 401:
        return "Spotifyの認証に失敗しました。再度ログインしてください。"
      case 403:
        return "Spotifyのアクセス権限がありません。"
      case 429:
        return "リクエスト制限に達しました。しばらく待ってから再度お試しください。"
      default:
        return `Spotify APIエラー: ${error.message}`
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "予期せぬエラーが発生しました。"
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError
} 