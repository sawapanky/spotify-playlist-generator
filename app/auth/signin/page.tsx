"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    // ログインページに自動リダイレクト
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2000);
    
    return () => clearTimeout(timer); // クリーンアップ
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">ログイン</h1>
        <p className="text-gray-600 mb-6">ログインページにリダイレクト中...</p>
        <Button onClick={() => router.push('/login')}>
          今すぐログインページへ
        </Button>
      </div>
    </div>
  );
}
