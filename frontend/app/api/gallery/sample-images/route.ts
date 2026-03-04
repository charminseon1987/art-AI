export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const pythonBackendUrl =
      process.env.PYTHON_BACKEND_URL ||
      process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL ||
      "http://localhost:8000";

    console.log(`[sample-images] 백엔드 URL: ${pythonBackendUrl}`);
    console.log(
      `[sample-images] 요청 URL: ${pythonBackendUrl}/api/gallery/sample-images`,
    );

    // 타임아웃 설정 (5초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(
        `${pythonBackendUrl}/api/gallery/sample-images`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);
      console.log(
        `[sample-images] 응답 상태: ${response.status} ${response.statusText}`,
      );

      if (!response.ok) {
        let errorData: any = {};
        try {
          const text = await response.text();
          console.warn(`[sample-images] 백엔드 에러 응답 (정상 처리): ${text}`);
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (e) {
          console.warn(`[sample-images] JSON 파싱 실패: ${e}`);
        }
        // 에러 상황에서도 200을 반환하여 axios가 에러로 처리하지 않도록 함
        // 프론트엔드에서 fallback 처리
        return NextResponse.json(
          {
            success: false,
            images: [],
            error:
              errorData.error || `백엔드 API 호출 실패 (${response.status})`,
          },
          { status: 200 }, // 항상 200 반환하여 axios 에러 방지
        );
      }

      const data = await response.json();
      console.log(`[sample-images] 성공: ${data.images?.length || 0}개 이미지`);

      // 백엔드에서 성공적으로 데이터를 받은 경우
      if (data.success && data.images && data.images.length > 0) {
        return NextResponse.json(data);
      }

      // 데이터가 없으면 success: false로 반환 (프론트엔드에서 fallback 사용)
      return NextResponse.json(
        {
          success: false,
          images: [],
          error: "백엔드에서 이미지를 반환하지 않았습니다.",
        },
        { status: 200 }, // 200 반환하여 axios 에러 방지
      );
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      // 네트워크 에러나 타임아웃인 경우
      if (fetchError.name === "AbortError") {
        console.warn("[sample-images] 요청 타임아웃 (정상 처리)");
        return NextResponse.json(
          {
            success: false,
            images: [],
            error: "백엔드 서버 연결 시간 초과",
          },
          { status: 200 }, // 200 반환하여 axios 에러 방지
        );
      }

      // 기타 에러도 200으로 반환
      console.warn(
        "[sample-images] fetch 에러 (정상 처리):",
        fetchError.message,
      );
      return NextResponse.json(
        {
          success: false,
          images: [],
          error: fetchError.message || "백엔드 API 호출 실패",
        },
        { status: 200 }, // 200 반환하여 axios 에러 방지
      );
    }
  } catch (error: any) {
    console.warn("[sample-images] API 오류 (정상 처리):", {
      message: error.message,
    });

    // 에러를 반환하되, 프론트엔드에서 fallback을 사용할 수 있도록
    // success: false로 반환하고 항상 200 반환 (프론트엔드에서 catch하여 fallback 사용)
    return NextResponse.json(
      {
        success: false,
        images: [],
        error: error.message || "샘플 이미지를 불러올 수 없습니다.",
      },
      { status: 200 }, // 항상 200 반환하여 axios 에러 방지
    );
  }
}
