import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "예약 ID가 필요합니다." },
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
    }

    const response = await fetch(
      `${pythonBackendUrl}/api/reservations/${id}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "예약 조회 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("예약 조회 오류:", error);
    return NextResponse.json(
      { error: error.message || "예약 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "예약 ID가 필요합니다." },
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
    }

    const response = await fetch(
      `${pythonBackendUrl}/api/reservations/${id}/confirm-deposit`,
      {
        method: "PATCH",
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || "입금 확인 실패" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("입금 확인 오류:", error);
    return NextResponse.json(
      { error: error.message || "입금 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
