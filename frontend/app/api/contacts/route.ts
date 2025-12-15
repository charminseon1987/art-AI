import { NextRequest, NextResponse } from "next/server";

const pythonBackendUrl =
  process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization");

    const response = await fetch(`${pythonBackendUrl}/api/contacts`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "문의 목록 조회 실패" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("문의 목록 API 오류:", error);
    return NextResponse.json(
      { error: error.message || "문의 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
