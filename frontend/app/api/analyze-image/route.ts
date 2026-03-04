export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth";

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
    // FormData를 전송할 때는 Content-Type을 설정하지 않음 (브라우저가 자동으로 boundary 설정)

    // Python 백엔드 API 호출
    const pythonBackendUrl =
      process.env.PYTHON_BACKEND_URL || 
      process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 
      "http://localhost:8000";

    console.log(`[analyze-image] 백엔드 URL: ${pythonBackendUrl}`);
    console.log(`[analyze-image] 파일명: ${file.name}, 크기: ${file.size} bytes`);
    console.log(`[analyze-image] 감정: ${emotion || "없음"}`);
    console.log(`[analyze-image] 토큰 존재: ${token ? "예" : "아니오"}`);
    
    // 백엔드 URL이 localhost인 경우 서버 실행 여부 확인 안내
    if (pythonBackendUrl.includes("localhost") || pythonBackendUrl.includes("127.0.0.1")) {
      console.log(`[analyze-image] 로컬 백엔드 사용 중: ${pythonBackendUrl}`);
      console.log(`[analyze-image] 백엔드 서버가 실행 중인지 확인하세요: python api_server.py 또는 uvicorn api_server:app --reload`);
    }

    const backendFormData = new FormData();
    backendFormData.append("file", file);
    if (emotion) {
      backendFormData.append("emotion", emotion);
    }

    let response: Response;
    try {
      response = await fetch(`${pythonBackendUrl}/api/analyze-image`, {
        method: "POST",
        headers,
        body: backendFormData,
      });
    } catch (fetchError: any) {
      console.error("[analyze-image] 백엔드 연결 실패:", {
        error: fetchError,
        message: fetchError?.message,
        code: fetchError?.code,
        stack: fetchError?.stack,
        url: `${pythonBackendUrl}/api/analyze-image`,
      });
      
      // 연결 실패 원인에 따른 상세 메시지
      let errorMessage = `백엔드 서버에 연결할 수 없습니다: ${fetchError?.message || "연결 실패"}`;
      
      if (pythonBackendUrl.includes("localhost") || pythonBackendUrl.includes("127.0.0.1")) {
        errorMessage += "\n\n로컬 백엔드 서버가 실행 중인지 확인하세요:\n- 터미널에서 'python api_server.py' 또는 'uvicorn api_server:app --reload' 실행";
      } else {
        errorMessage += `\n\n백엔드 URL: ${pythonBackendUrl}`;
        errorMessage += "\n환경 변수 PYTHON_BACKEND_URL 또는 NEXT_PUBLIC_PYTHON_BACKEND_URL을 확인하세요.";
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage
        },
        { status: 500 }
      );
    }

    console.log(`[analyze-image] 백엔드 응답 상태: ${response.status} ${response.statusText}`);

    // 응답 데이터 파싱
    let responseData: any;
    try {
      const responseText = await response.text();
      console.log(`[analyze-image] 백엔드 응답 텍스트 (처음 500자):`, responseText.substring(0, 500));
      
      if (!responseText) {
        throw new Error("백엔드 응답이 비어있습니다");
      }
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error(`[analyze-image] JSON 파싱 실패. 전체 응답:`, responseText);
        throw new Error(`백엔드 응답 파싱 실패: ${response.status} ${response.statusText}. 응답: ${responseText.substring(0, 200)}`);
      }
    } catch (parseError: any) {
      console.error(`[analyze-image] 응답 파싱 오류:`, parseError);
      return NextResponse.json(
        { 
          success: false,
          error: parseError.message || "백엔드 응답을 파싱할 수 없습니다." 
        },
        { status: 500 }
      );
    }

    // 백엔드가 200 OK로 에러를 반환하는 경우도 처리
    if (!response.ok || (responseData.success === false)) {
      const errorMessage = responseData.error || responseData.message || `백엔드 API 호출 실패 (${response.status})`;
      const errorType = responseData.error_type || "UnknownError";
      console.error(`[analyze-image] 백엔드 에러:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        errorType: errorType,
        responseData,
      });
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage,
          error_type: errorType,
          // 개발 환경에서만 상세 정보 포함
          ...(process.env.NODE_ENV === "development" && responseData.traceback ? {
            traceback: responseData.traceback
          } : {})
        },
        { status: response.ok ? 200 : response.status }
      );
    }

    console.log(`[analyze-image] 분석 성공: report_id=${responseData.report_id}`);
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("[analyze-image] 예상치 못한 에러:", {
      error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      { 
        success: false,
        error: error?.message || "서버 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
}
