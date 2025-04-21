import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-6">Spotify Playlist Generator</h1>
      <p className="text-lg mb-8 max-w-md">
        お気に入りの音楽を見つけてプレイリストを作成しましょう
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          ログイン
        </Link>
        <Link href="/signup" className="border border-gray-300 hover:border-gray-400 px-4 py-2 rounded">
          アカウント作成
        </Link>
      </div>
    </div>
  );
}
