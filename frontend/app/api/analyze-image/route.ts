import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const emotion = formData.get("emotion") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "파일이 없습니다." },
        { status: 400 }
      );
    }

    // Python 백엔드 API 호출
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";
    
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    if (emotion) {
      backendFormData.append("emotion", emotion);
    }

    const response = await fetch(`${pythonBackendUrl}/api/analyze-image`, {
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
