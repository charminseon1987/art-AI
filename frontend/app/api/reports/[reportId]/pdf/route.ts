import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;

    if (!reportId) {
      return NextResponse.json(
        { error: "reportId가 필요합니다." },
        { status: 400 }
      );
    }

    const pythonBackendUrl =
      process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

    // 클라이언트에서 전달받은 Authorization 헤더를 그대로 전달
    const authorization = request.headers.get("authorization");
    const headers: HeadersInit = {};
    if (authorization) {
      headers["Authorization"] = authorization;
    } else {
      console.warn(`[PDF 다운로드] 인증 토큰이 없습니다. reportId: ${reportId}`);
    }

    console.log(`[PDF 다운로드] 요청 시작: reportId=${reportId}, 토큰 존재=${!!authorization}`);

    const response = await fetch(
      `${pythonBackendUrl}/api/reports/${reportId}/pdf`,
      {
        method: "GET",
        headers,
      }
    );

    console.log(`[PDF 다운로드] 백엔드 응답: status=${response.status}, ok=${response.ok}, statusText=${response.statusText}`);

    if (!response.ok) {
      // 응답 본문 읽기 시도
      let errorMessage = `PDF 다운로드 실패 (${response.status})`;
      try {
        const responseText = await response.text();
        console.log(`[PDF 다운로드] 백엔드 에러 응답: ${responseText.substring(0, 500)}`);
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // JSON이 아닌 경우 텍스트 그대로 사용
          if (responseText) {
            errorMessage = responseText;
          }
        }
      } catch (e) {
        console.error(`[PDF 다운로드] 에러 응답 읽기 실패:`, e);
      }
      
      console.error(`[PDF 다운로드] 최종 에러 메시지: ${errorMessage}`);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // PDF 바이너리 데이터를 그대로 전달
    const blob = await response.blob();
    
    // 백엔드에서 전달받은 Content-Disposition 헤더 사용 (이미 인코딩되어 있음)
    const contentDisposition = response.headers.get("Content-Disposition");
    
    // 파일명 인코딩 (한글 파일명 지원)
    const filenameKr = `그림상담보고서_${reportId.substring(0, 8)}.pdf`;
    const filenameEn = `art_counseling_report_${reportId.substring(0, 8)}.pdf`;
    
    // RFC 5987 형식으로 한글 파일명 인코딩
    const filenameEncoded = encodeURIComponent(filenameKr);
    const contentDispositionHeader = contentDisposition || 
      `attachment; filename="${filenameEn}"; filename*=UTF-8''${filenameEncoded}`;
    
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDispositionHeader,
      },
    });
  } catch (error: any) {
    console.error("PDF 다운로드 오류:", error);
    return NextResponse.json(
      { error: error.message || "PDF 다운로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
