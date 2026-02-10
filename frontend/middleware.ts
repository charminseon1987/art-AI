import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 관리자 페이지 접근 제어 (locale 없이 /admin 사용)
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Supabase 환경 변수가 설정되지 않았습니다. 개발 모드에서는 접근을 허용합니다.",
        );
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const authHeader = request.headers.get("authorization");
    const accessToken =
      authHeader?.replace("Bearer ", "") ||
      request.cookies.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(accessToken);

      if (userError || !user) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const userRole = profile?.role || "user";
      if (userRole !== "admin" && userRole !== "supervisor") {
        return NextResponse.redirect(new URL("/ko", request.url));
      }
    } catch (error) {
      console.error("Middleware 인증 오류:", error);
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
