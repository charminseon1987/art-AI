import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { reportId, responses } = await request.json();

    if (!reportId || !responses) {
      return NextResponse.json(
        { error: "reportId와 responses가 필요합니다." },
        { status: 400 }
      );
    }

    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

    const response = await fetch(`${pythonBackendUrl}/api/reports/${reportId}/counseling`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(responses),
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

