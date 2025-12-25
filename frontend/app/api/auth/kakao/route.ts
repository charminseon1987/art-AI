import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin/login?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/admin/login?error=카카오 인증 코드가 없습니다.", request.url)
      );
    }

    // Supabase 카카오 OAuth 로그인 처리
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);

    if (authError || !data.session) {
      console.error("카카오 로그인 오류:", authError);
      return NextResponse.redirect(
        new URL(
          `/admin/login?error=${encodeURIComponent(authError?.message || "카카오 로그인에 실패했습니다.")}`,
          request.url
        )
      );
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("프로필 조회 오류:", profileError);
    }

    // 카카오 사용자 ID 추출 (user_metadata 또는 app_metadata에서)
    const kakaoId = 
      data.user.user_metadata?.provider_id || 
      data.user.app_metadata?.provider_id ||
      data.user.user_metadata?.kakao_account?.id ||
      null;

    // 카카오 사용자 ID가 있으면 user_usage_limits에 저장
    if (kakaoId) {
      try {
        // 기존 레코드 확인
        const { data: existingLimit } = await supabase
          .from("user_usage_limits")
          .select("*")
          .eq("user_id", data.user.id)
          .single();

        if (!existingLimit) {
          // 새 레코드 생성
          await supabase.from("user_usage_limits").insert({
            user_id: data.user.id,
            kakao_id: kakaoId.toString(),
            image_analysis_count: 0,
            fingerprint_analysis_count: 0,
          });
        } else if (!existingLimit.kakao_id) {
          // 기존 레코드에 kakao_id 업데이트
          await supabase
            .from("user_usage_limits")
            .update({ kakao_id: kakaoId.toString() })
            .eq("user_id", data.user.id);
        }
      } catch (error) {
        console.error("카카오 ID 저장 오류:", error);
        // 오류가 발생해도 로그인은 계속 진행
      }
    }

    // 세션 저장 후 리다이렉트
    const redirectUrl = new URL("/admin/login", request.url);
    redirectUrl.searchParams.set("session", JSON.stringify(data.session));
    redirectUrl.searchParams.set(
      "user",
      JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || "user",
        name: profile?.name || "",
        kakaoId: kakaoId,
      })
    );

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("카카오 로그인 오류:", error);
    return NextResponse.redirect(
      new URL(
        `/admin/login?error=${encodeURIComponent(error.message || "카카오 로그인 중 오류가 발생했습니다.")}`,
        request.url
      )
    );
  }
}

