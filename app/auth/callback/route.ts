import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// コールバックハンドラー - APIルートとして実装
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  // リダイレクト先URL
  let redirectUrl = "/dashboard";
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      // コードをセッションと交換
      await supabase.auth.exchangeCodeForSession(code);
      
      // セッションを取得してユーザーを確認
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // セッションがない場合はエラーページにリダイレクト
        redirectUrl = "/login?error=no_session";
      }
    } catch (error) {
      console.error("認証エラー:", error);
      // エラーの場合はログインページにリダイレクト
      redirectUrl = "/login?error=auth_failed";
    }
  } else {
    // コードがない場合もエラーとして扱う
    redirectUrl = "/login?error=no_code";
  }
  
  // 適切なページにリダイレクト
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
