"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // 認証コールバック処理
    const handleCallback = async () => {
      try {
        // クエリパラメータから認証コードを取得
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        
        if (code) {
          // 認証処理が成功したらダッシュボードにリダイレクト
          router.push("/dashboard");
        } else {
          throw new Error("認証コードがありません");
        }
      } catch (error) {
        console.error("認証エラー:", error);
        router.push("/login?error=authentication_failed");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">認証中...</h1>
        <p>しばらくお待ちください...</p>
      </div>
    </div>
  );
}
