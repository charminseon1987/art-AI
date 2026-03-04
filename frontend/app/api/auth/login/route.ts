export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // Supabase 로그인
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return NextResponse.json(
        { error: authError.message || "로그인에 실패했습니다." },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "사용자 정보를 가져올 수 없습니다." },
        { status: 500 }
      );
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.error("프로필 조회 오류:", profileError);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profile?.role || "user",
        name: profile?.name || "",
      },
      session: authData.session,
      message: "로그인 성공",
    });
  } catch (error: any) {
    console.error("로그인 오류:", error);
    return NextResponse.json(
      { error: error.message || "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
