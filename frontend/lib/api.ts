import axios from "axios";

// Next.js API Routes를 통해 호출 (CORS 문제 방지)
const API_BASE = ""; // 같은 도메인의 API Routes 사용

export interface AnalyzeImageResponse {
  success: boolean;
  report_id: string;
  report: {
    id: string;
    observation: any;
    emotional_language: any;
    reflection_questions: any;
    professional_conclusion: any;
    user_emotion: string | null;
    created_at: string;
  };
  chat_ready: boolean;
}

export async function analyzeImage(
  file: File,
  emotion?: string
): Promise<AnalyzeImageResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (emotion) {
    formData.append("emotion", emotion);
  }

  try {
    console.log("[analyzeImage] 분석 시작:", {
      fileName: file.name,
      fileSize: file.size,
      emotion: emotion || "없음",
    });

    const response = await axios.post<AnalyzeImageResponse>(
      `/api/analyze-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 2분 타임아웃 (이미지 분석은 시간이 걸릴 수 있음)
      }
    );

    console.log("[analyzeImage] 분석 완료:", {
      success: response.data.success,
      reportId: response.data.report_id,
    });

    // 응답에서 success가 false인 경우도 에러로 처리
    if (response.data.success === false) {
      const errorMessage = (response.data as any).error || "분석에 실패했습니다.";
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error: any) {
    // 에러 객체 전체를 로깅 (디버깅용)
    console.error("[analyzeImage] API Error (전체):", error);
    console.error("[analyzeImage] API Error (상세):", {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      response: error?.response?.data,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      request: error?.request,
      code: error?.code,
    });

    // axios 에러인 경우
    if (error.response) {
      // 서버가 응답을 반환했지만 에러 상태인 경우
      const errorData = error.response.data;
      let errorMessage = "";
      
      if (typeof errorData === 'object') {
        errorMessage = errorData?.error || errorData?.message || `서버 오류가 발생했습니다. (${error.response.status})`;
        // 백엔드에서 전달한 상세 에러 정보가 있으면 포함
        if (errorData?.error_type) {
          errorMessage += ` [${errorData.error_type}]`;
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else {
        errorMessage = `서버 오류가 발생했습니다. (${error.response.status})`;
      }
      
      // 500 에러인 경우 더 자세한 정보 제공
      if (error.response.status === 500) {
        console.error("[analyzeImage] 백엔드 500 에러 상세:", errorData);
        if (errorData?.traceback && process.env.NODE_ENV === 'development') {
          console.error("[analyzeImage] 백엔드 트레이스백:", errorData.traceback);
        }
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error("[analyzeImage] 백엔드 연결 실패 - 요청은 보냈지만 응답 없음");
      throw new Error(
        "서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요."
      );
    } else if (error.message) {
      // 기타 에러 (타임아웃 등)
      throw new Error(error.message);
    } else {
      // 알 수 없는 에러
      const errorString = String(error);
      throw new Error(errorString !== '[object Object]' ? errorString : "알 수 없는 오류가 발생했습니다.");
    }
  }
}

export async function generateChatReport(
  reportId: string,
  chatResponses: Array<{ question: string; answer: string }>,
  userInfo?: { age?: string; gender?: string }
): Promise<{
  success: boolean;
  simple_report: string;
  report_content: string;
  professional_report?: string;
}> {
  try {
    const formData = new FormData();
    formData.append("report_id", reportId);
    formData.append("chat_responses", JSON.stringify(chatResponses));
    if (userInfo?.age) {
      formData.append("age", userInfo.age);
    }
    if (userInfo?.gender) {
      formData.append("gender", userInfo.gender);
    }

    const response = await axios.post(`/api/generate-report`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.error || "리포트 생성 중 오류가 발생했습니다."
    );
  }
}

async function getAuthToken(): Promise<string | null> {
  // Supabase 세션에서 토큰 가져오기
  const { supabase } = await import("./supabase");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export async function getReports() {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`/api/reports`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.error || "리포트 목록을 가져올 수 없습니다."
    );
  }
}

export async function getReport(reportId: string) {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`/api/reports/${reportId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.error || "리포트를 가져올 수 없습니다."
    );
  }
}

export async function conductCounseling(reportId: string, responses: any[]) {
  try {
    const response = await axios.post(
      `/api/counseling`,
      { reportId, responses },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.error || "상담 세션을 시작할 수 없습니다."
    );
  }
}

export async function downloadReportPDF(reportId: string): Promise<void> {
  try {
    // Next.js API Route를 통해 호출 (인증 토큰은 선택적)
    const token = await getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    // PDF 다운로드는 Content-Type을 설정하지 않음

    console.log(`[downloadReportPDF] PDF 다운로드 시작: reportId=${reportId}, 토큰 존재=${!!token}`);

    const response = await fetch(`/api/reports/${reportId}/pdf`, {
      method: "GET",
      headers,
    });

    console.log(`[downloadReportPDF] 응답 상태: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // 에러 응답이 JSON일 수도 있고 텍스트일 수도 있음
      let errorMessage = `PDF 다운로드 실패 (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // JSON이 아닌 경우 텍스트로 읽기 시도
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // 읽기 실패 시 기본 메시지 사용
        }
      }
      console.error(`[downloadReportPDF] 에러: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `그림상담보고서_${reportId.substring(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  } catch (error: any) {
    console.error("PDF 다운로드 오류:", error);
    throw new Error(error.message || "PDF 다운로드 중 오류가 발생했습니다.");
  }
}

export async function downloadAdminReportPDF(reportId: string): Promise<void> {
  const pythonBackendUrl =
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000";
  const url = `${pythonBackendUrl}/api/reports/${reportId}/admin-pdf`;
  const token = await getAuthToken();

  try {
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      throw new Error("PDF 다운로드 실패");
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `전문리포트_${reportId.substring(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  } catch (error: any) {
    console.error("PDF 다운로드 오류:", error);
    throw new Error(error.message || "PDF 다운로드 중 오류가 발생했습니다.");
  }
}

export async function saveCounselorAnswers(
  reportId: string,
  answers: Record<number, string>
): Promise<void> {
  const pythonBackendUrl =
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000";
  const url = `${pythonBackendUrl}/api/reports/${reportId}/counselor-answers`;
  const token = await getAuthToken();

  try {
    const response = await axios.post(
      url,
      { answers },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || "답변 저장 실패");
    }
  } catch (error: any) {
    console.error("답변 저장 오류:", error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "답변 저장 중 오류가 발생했습니다."
    );
  }
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  child_age: string;
  message: string;
  created_at: string;
  status: string;
}

export async function submitContact(
  name: string,
  phone: string,
  childAge: string,
  message: string
): Promise<{ success: boolean; message: string; contact_id: string }> {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("child_age", childAge);
    formData.append("message", message);

    const response = await axios.post(`/api/contact`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("문의 API 오류:", error);
    throw new Error(
      error.response?.data?.error || "문의 접수 중 오류가 발생했습니다."
    );
  }
}

export async function getContacts(): Promise<{
  success: boolean;
  contacts: ContactInquiry[];
}> {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`/api/contacts`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("문의 목록 API 오류:", error);
    throw new Error(
      error.response?.data?.error || "문의 목록을 가져올 수 없습니다."
    );
  }
}

export async function updateContactStatus(
  contactId: string,
  status: string
): Promise<{ success: boolean; contact: ContactInquiry }> {
  const pythonBackendUrl =
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000";
  const url = `${pythonBackendUrl}/api/contacts/${contactId}/status`;
  const token = await getAuthToken();

  try {
    const formData = new FormData();
    formData.append("status", status);

    const response = await axios.patch(url, formData, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("문의 상태 업데이트 오류:", error);
    throw new Error(
      error.response?.data?.error ||
        error.message ||
        "문의 상태 업데이트 중 오류가 발생했습니다."
    );
  }
}

export interface Reservation {
  id: string;
  user_id: string;
  reservation_date: string;
  reservation_time: string;
  duration_minutes: number;
  status: string;
  deposit_amount: number;
  deposit_confirmation_deadline: string;
  balance_amount: number;
  child_name: string;
  child_age: string;
  parent_phone: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationRequest {
  reservation_date: string;
  reservation_time: string;
  child_name: string;
  child_age: string;
  parent_phone: string;
  notes?: string;
}

export async function createReservation(
  data: CreateReservationRequest
): Promise<{
  success: boolean;
  reservation: Reservation;
  deposit_info: {
    bank_name: string;
    account_number: string;
    amount: number;
    deadline: string;
  };
}> {
  try {
    const formData = new FormData();
    formData.append("reservation_date", data.reservation_date);
    formData.append("reservation_time", data.reservation_time);
    formData.append("child_name", data.child_name);
    formData.append("child_age", data.child_age);
    formData.append("parent_phone", data.parent_phone);
    if (data.notes) {
      formData.append("notes", data.notes);
    }

    // 인증 토큰 가져오기 (선택적 - 없어도 예약 가능)
    let token: string | null = null;
    try {
      token = await getAuthToken();
    } catch (error) {
      // 토큰이 없어도 예약 가능하도록 에러 무시
      console.log("인증 토큰이 없습니다. 익명 예약으로 진행합니다.");
    }

    const headers: Record<string, string> = {
      "Content-Type": "multipart/form-data",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.post(`/api/reservations`, formData, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error("예약 생성 오류:", error);
    const errorMessage = error.response?.data?.error || error.message || "예약 생성 중 오류가 발생했습니다.";
    throw new Error(errorMessage);
  }
}

export async function getReservations(): Promise<{
  success: boolean;
  reservations: Reservation[];
}> {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`/api/reservations`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("예약 목록 조회 오류:", error);
    throw new Error(
      error.response?.data?.error || "예약 목록을 가져올 수 없습니다."
    );
  }
}

export async function getReservation(
  reservationId: string
): Promise<{ success: boolean; reservation: Reservation }> {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`/api/reservations/${reservationId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error: any) {
    console.error("예약 조회 오류:", error);
    throw new Error(
      error.response?.data?.error || "예약을 가져올 수 없습니다."
    );
  }
}

export async function confirmDeposit(
  reservationId: string
): Promise<{ success: boolean; reservation: Reservation; message: string }> {
  try {
    const token = await getAuthToken();
    const response = await axios.patch(
      `/api/reservations/${reservationId}/confirm-deposit`,
      {},
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("입금 확인 오류:", error);
    throw new Error(
      error.response?.data?.error || "입금 확인 중 오류가 발생했습니다."
    );
  }
}

export async function getPageContent(
  path: string,
  language: string = "ko"
): Promise<{
  success: boolean;
  contents?: Record<string, string>;
}> {
  try {
    // CMS API 엔드포인트가 있다면 여기서 호출
    // 현재는 빈 객체를 반환하여 기본값 사용
    return {
      success: true,
      contents: {},
    };
  } catch (error: any) {
    console.error("CMS 콘텐츠 로드 오류:", error);
    return {
      success: false,
      contents: {},
    };
  }
}
