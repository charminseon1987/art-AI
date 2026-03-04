export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // 현재 사용자 확인
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // Supabase에서 사용 횟수 조회
    const { data, error } = await supabase
      .from("user_usage_limits")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116은 레코드가 없을 때 발생하는 에러 (정상)
      console.error("사용 횟수 조회 오류:", error);
      return NextResponse.json(
        { error: "사용 횟수를 조회할 수 없습니다." },
        { status: 500 }
      );
    }

    // 레코드가 없으면 기본값 반환
    const imageCount = data?.image_analysis_count || 0;
    const fingerprintCount = data?.fingerprint_analysis_count || 0;
    const maxImage = 2;
    const maxFingerprint = 2;

    return NextResponse.json({
      success: true,
      usage: {
        image_analysis_count: imageCount,
        fingerprint_analysis_count: fingerprintCount,
        image_analysis_remaining: Math.max(0, maxImage - imageCount),
        fingerprint_analysis_remaining: Math.max(
          0,
          maxFingerprint - fingerprintCount
        ),
        image_analysis_limit: maxImage,
        fingerprint_analysis_limit: maxFingerprint,
      },
    });
  } catch (error: any) {
    console.error("사용 횟수 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
