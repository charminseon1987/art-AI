export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const pythonBackendUrl =
      process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

    // Authorization 헤더 전달
    const authorization = request.headers.get("authorization");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authorization) {
      headers["Authorization"] = authorization;
    }

    const response = await fetch(`${pythonBackendUrl}/api/reports`, {
      method: "GET",
      headers,
      // 타임아웃 설정
      signal: AbortSignal.timeout(15000), // 15초 타임아웃
    });

    if (!response.ok) {
      let errorMessage = "백엔드 API 호출 실패";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // JSON 파싱 실패 시 상태 코드 기반 메시지
        errorMessage = `서버 오류 (${response.status}): ${response.statusText}`;
      }
      console.warn("백엔드 API 오류 (정상 처리):", errorMessage);

      // 에러 상황에서도 200을 반환하여 axios가 에러로 처리하지 않도록 함
      // 본문에 success: false를 포함하여 클라이언트가 에러임을 알 수 있음
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          reports: [], // 빈 배열 반환하여 앱 크래시 방지
        },
        { status: 200 }, // 항상 200 반환하여 axios 에러 방지
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("리포트 목록 조회 오류:", error);

    // 네트워크 에러나 타임아웃 등
    if (error.name === "AbortError" || error.message?.includes("timeout")) {
      return NextResponse.json(
        {
          success: false,
          error: "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
          reports: [],
        },
        { status: 200 }, // 200 반환하여 axios 에러 방지
      );
    }

    // 기타 에러 - 항상 200 반환하여 axios가 에러로 처리하지 않도록 함
    return NextResponse.json(
      {
        success: false,
        error: error.message || "서버 오류가 발생했습니다.",
        reports: [], // 빈 배열 반환하여 앱 크래시 방지
      },
      { status: 200 }, // 항상 200 반환하여 axios 에러 방지
    );
  }
}
