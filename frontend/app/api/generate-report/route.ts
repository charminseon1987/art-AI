import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const reportId = formData.get("report_id") as string;
    const chatResponses = formData.get("chat_responses") as string;

    if (!reportId || !chatResponses) {
      return NextResponse.json(
        { error: "report_id와 chat_responses가 필요합니다." },
        { status: 400 }
      );
    }

    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

    const backendFormData = new FormData();
    backendFormData.append("report_id", reportId);
    backendFormData.append("chat_responses", chatResponses);

    const response = await fetch(`${pythonBackendUrl}/api/generate-report`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "백엔드 API 호출 실패");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

