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
    const response = await axios.post<AnalyzeImageResponse>(
      `/api/analyze-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("API Error:", error);
    if (error.response) {
      throw new Error(
        error.response.data?.error || "서버 오류가 발생했습니다."
      );
    } else if (error.request) {
      throw new Error(
        "서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요."
      );
    } else {
      throw new Error(error.message || "알 수 없는 오류가 발생했습니다.");
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

export async function getReports() {
  try {
    const token = sessionStorage.getItem("admin_token");
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
    const token = sessionStorage.getItem("admin_token");
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
  const pythonBackendUrl =
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:8000";
  const url = `${pythonBackendUrl}/api/reports/${reportId}/pdf`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("PDF 다운로드 실패");
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
  const token = sessionStorage.getItem("admin_token");

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
  const token = sessionStorage.getItem("admin_token");

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
    const token = sessionStorage.getItem("admin_token");
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
  const token = sessionStorage.getItem("admin_token");

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
