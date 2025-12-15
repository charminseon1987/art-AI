import { NextRequest, NextResponse } from "next/server";

const pythonBackendUrl =
  process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch(`${pythonBackendUrl}/api/contact`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "문의 접수 실패" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("문의 API 오류:", error);
    return NextResponse.json(
      { error: error.message || "문의 접수 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
