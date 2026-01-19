import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const reservation_date = formData.get("reservation_date") as string;
    const reservation_time = formData.get("reservation_time") as string;
    const child_name = formData.get("child_name") as string;
    const child_age = formData.get("child_age") as string;
    const parent_phone = formData.get("parent_phone") as string;
    const notes = formData.get("notes") as string | null;

    if (!reservation_date || !reservation_time || !child_name || !child_age || !parent_phone) {
      return NextResponse.json(
        { error: "필수 정보를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const pythonBackendUrl =
      process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

    // 클라이언트에서 전달받은 Authorization 헤더를 그대로 전달 (없어도 예약 가능)
    const authorization = request.headers.get("authorization");
    const headers: HeadersInit = {};
    if (authorization) {
      headers["Authorization"] = authorization;
    }

    // 백엔드로 FormData 전달
    const backendFormData = new FormData();
    backendFormData.append("reservation_date", reservation_date);
    backendFormData.append("reservation_time", reservation_time);
    backendFormData.append("child_name", child_name);
    backendFormData.append("child_age", child_age);
    backendFormData.append("parent_phone", parent_phone);
    if (notes) {
      backendFormData.append("notes", notes);
    }

    const response = await fetch(`${pythonBackendUrl}/api/reservations`, {
      method: "POST",
      headers,
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "예약 생성 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("예약 생성 오류:", error);
    return NextResponse.json(
      { error: error.message || "예약 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const pythonBackendUrl =
      process.env.PYTHON_BACKEND_URL || "http://localhost:8000";

    // 클라이언트에서 전달받은 Authorization 헤더를 그대로 전달
    const authorization = request.headers.get("authorization");
    const headers: HeadersInit = {};
    if (authorization) {
      headers["Authorization"] = authorization;
    }

    const response = await fetch(`${pythonBackendUrl}/api/reservations`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "예약 목록 조회 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("예약 목록 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "예약 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
