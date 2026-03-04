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

    const response = await fetch(`${pythonBackendUrl}/api/class-works`, {
      method: "GET",
      headers,
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

export async function POST(request: NextRequest) {
  try {
    const pythonBackendUrl =
      process.env.PYTHON_BACKEND_URL || "http://localhost:8000";
    const formData = await request.formData();

    console.log("FormData 전송:", {
      thumbnail: formData.get("thumbnail") ? "있음" : "없음",
      age_range: formData.get("age_range"),
      title: formData.get("title"),
      images_count: formData.getAll("images").length,
    });

    // Authorization 헤더 전달
    const authorization = request.headers.get("authorization");
    const headers: Record<string, string> = {};
    if (authorization) {
      headers["Authorization"] = authorization;
    }

    const response = await fetch(`${pythonBackendUrl}/api/class-works`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("백엔드 오류 응답:", errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || "백엔드 API 호출 실패" };
      }
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
