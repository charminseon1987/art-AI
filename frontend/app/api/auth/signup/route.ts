import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 기본 역할은 user, admin/supervisor는 수동으로 설정
    const userRole = role || "user";

    // Supabase에 사용자 등록
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || "",
          role: userRole,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "사용자 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    // 사용자 프로필 생성 (profiles 테이블)
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: email,
      name: name || "",
      role: userRole,
    });

    if (profileError) {
      console.error("프로필 생성 오류:", profileError);
      // 프로필 생성 실패해도 계정은 생성됨
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: userRole,
      },
      message: "회원가입이 완료되었습니다.",
    });
  } catch (error: any) {
    console.error("회원가입 오류:", error);
    return NextResponse.json(
      { error: error.message || "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
