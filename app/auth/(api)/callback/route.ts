import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      await supabase.auth.exchangeCodeForSession(code);
      return NextResponse.json({ 
        success: true, 
        message: "Authentication successful" 
      });
    } catch (error) {
      console.error("API認証エラー:", error);
    }
  }
  
  return NextResponse.json(
    { success: false, message: "Authentication failed" },
    { status: 400 }
  );
}