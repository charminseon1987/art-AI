import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function middleware(request: NextRequest) {
  // 관리자 페이지 접근 제어
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // 로그인 페이지는 통과
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next();
    }

    // 환경 변수가 설정되지 않은 경우 개발 모드에서는 통과
    if (!supabaseUrl || !supabaseAnonKey) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Supabase 환경 변수가 설정되지 않았습니다. 개발 모드에서는 접근을 허용합니다.",
        );
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Authorization 헤더나 쿠키에서 토큰 가져오기
    const authHeader = request.headers.get("authorization");
    const accessToken =
      authHeader?.replace("Bearer ", "") ||
      request.cookies.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      // 토큰으로 사용자 정보 가져오기
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(accessToken);

      if (userError || !user) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      // 사용자 프로필에서 역할 확인
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role || "user";

      // 관리자 또는 슈퍼바이저만 접근 가능
      if (userRole !== "admin" && userRole !== "supervisor") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Middleware 인증 오류:", error);
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
