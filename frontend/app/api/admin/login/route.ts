export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";

// 관리자 비밀번호 (환경 변수에서 가져오거나 기본값 사용)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"; // 기본 비밀번호, 실제 운영 시 환경 변수로 변경 필요

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    if (password === ADMIN_PASSWORD) {
      // 간단한 토큰 생성 (실제 운영 시 JWT 등 사용 권장)
      const token = `admin_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      return NextResponse.json({
        success: true,
        token,
        message: "로그인 성공",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("로그인 오류:", error);
    return NextResponse.json(
      { success: false, error: "로그인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
