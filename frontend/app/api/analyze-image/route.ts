import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth";

// Vercel/Next.js 함수 타임아웃 설정 (초 단위)
// 기본값은 보통 10~15초이며, AI 분석은 시간이 걸리므로 늘려줌
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const emotion = formData.get("emotion") as string | null;

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // 인증 토큰 가져오기
    const token = await getSessionToken();
    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // 백엔드 API 호출
    const backendUrl = process.env.PYTHON_BACKEND_URL ||
      process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL ||
      "http://localhost:8000";

    console.log(`[API] 분석 요청 시작: ${backendUrl}/api/analyze-image`);

    // FormData 새로 생성 (필요한 필드만 포함)
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    if (emotion) {
      backendFormData.append("emotion", emotion);
    }

    const response = await fetch(`${backendUrl}/api/analyze-image`, {
      method: "POST",
      headers,
      body: backendFormData,
      // 백엔드 타임아웃 설정 (브라우저 -> Next.js 서버 -> Python 서버)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API] 백엔드 응답 오류: ${response.status}`, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(errorJson, { status: response.status });
      } catch (e) {
        return NextResponse.json(
          { error: `서버 오류 (${response.status}): ${errorText.substring(0, 100)}` },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API] 처리 중 오류 발생:", error);
    return NextResponse.json(
      { error: error.message || "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
