import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// コールバックハンドラー - APIルートとして実装
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  // デバッグ情報をログに出力
  console.log("Auth callback called with URL:", request.url);
  console.log("Code parameter:", code);
  
  // ローカルでリダイレクト（デプロイIDを参照しない）
  const baseUrl = requestUrl.origin;
  
  if (!code) {
    console.error("No code provided in callback");
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
  }
  
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // codeを使ってセッションを確立
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`);
    }
    
    // セッションを確認
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No session after code exchange");
      return NextResponse.redirect(`${baseUrl}/login?error=no_session`);
    }
    
    console.log("Authentication successful, redirecting to dashboard");
    // 相対パスでリダイレクト
    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=unexpected_error`);
  }
}
