"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useParams } from "next/navigation";
import {
  Upload,
  MessageSquare,
  FileText,
  ArrowRight,
  AlertCircle,
  Download,
  Sparkles,
  Heart,
  MessageCircle,
  MailOpen,
  PhoneCall,
  Loader2,
  Calendar,
  Clock,
  User,
  Phone,
  Share,
  Copy,
  Check,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import ImageUpload from "@/components/ImageUpload";
import ChatInterface from "@/components/ChatInterface";
import ReportDisplay from "@/components/ReportDisplay";
import { generateChatReport, downloadReportPDF, createReservation, type CreateReservationRequest, getReport } from "@/lib/api";

export default function CounselingPage() {
  const t = useTranslations("counseling");
  const params = useParams();
  const locale = (params?.locale as string) || 'ko';
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [reportData, setReportData] = useState<any>(null);
  const [chatResponses, setChatResponses] = useState<any[]>([]);
  const [simpleReport, setSimpleReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  
  // 예약 관련 상태
  const [reservationDate, setReservationDate] = useState<string>("");
  const [reservationTime, setReservationTime] = useState<string>("");
  const [childName, setChildName] = useState<string>("");
  const [childAge, setChildAge] = useState<string>("");
  const [parentPhone, setParentPhone] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [creatingReservation, setCreatingReservation] = useState(false);
  const [reservationResult, setReservationResult] = useState<any>(null);
  
  // 공유하기 관련 상태
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // 공유 URL 생성
  const getShareUrl = () => {
    if (!reportData?.report?.id) return "";
    return `${window.location.origin}/counseling?reportId=${reportData.report.id}`;
  };

  const shareTitle = t("shareReportTitle");
  const shareDescription = t("shareReportDescription");

  // URL 클립보드 복사
  const copyToClipboard = async () => {
    const url = getShareUrl();
    if (!url) {
      alert(t("cannotGenerateUrl"));
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // 클립보드 API가 지원되지 않는 경우 대체 방법
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert(t("copyFailed"));
      }
      document.body.removeChild(textArea);
    }
  };

  // 카카오톡 공유
  const shareToKakao = () => {
    const url = getShareUrl();
    if (!url) return;
    
    // 카카오톡 링크 공유 (간단한 방법)
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(url)}`;
    window.open(kakaoUrl, "_blank", "width=600,height=600");
  };

  // 페이스북 공유
  const shareToFacebook = () => {
    const url = getShareUrl();
    if (!url) return;
    
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
  };

  // 트위터 공유
  const shareToTwitter = () => {
    const url = getShareUrl();
    if (!url) return;
    
    const text = encodeURIComponent(`${shareTitle} - ${shareDescription}`);
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  // 링크드인 공유
  const shareToLinkedIn = () => {
    const url = getShareUrl();
    if (!url) return;
    
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, "_blank", "width=600,height=400");
  };

  // URL에서 reportId를 읽어서 리포트 로드
  useEffect(() => {
    const reportId = searchParams.get("reportId");
    if (reportId && !reportData) {
      setLoadingReport(true);
      getReport(reportId)
        .then((data) => {
          if (data.success && data.report) {
            setReportData({ report: data.report });
            setStep(3); // 리포트 표시 단계로 이동
          } else {
            alert(t("reportNotFound"));
          }
        })
        .catch((error) => {
          console.error("리포트 로드 오류:", error);
          alert(`${t("reportLoadError")} ${error.message}`);
        })
        .finally(() => {
          setLoadingReport(false);
        });
    }
  }, [searchParams, reportData]);

  // 리포트 로딩 중 표시
  if (loadingReport) {
    return (
      <div className="min-h-screen py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">{t("loadingReport")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* 헤드라인 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            아이 그림, 바로 해석하지 않습니다
          </h1>
          <p className="text-lg text-gray-600">
            AI는 그림을 정리하고
            <br />
            선생님은 대화로 연결합니다
          </p>
        </div>

        {/* STEP 1: 그림 업로드 */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h2 className="text-2xl font-bold text-gray-800">그림 업로드</h2>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <div className="flex items-start gap-2 text-gray-700">
                <span className="text-green-600">✔</span>
                <span>잘 그린 그림일 필요 없습니다</span>
              </div>
              <div className="flex items-start gap-2 text-gray-700 mt-2">
                <span className="text-green-600">✔</span>
                <span>집에서 편하게 그린 그림이면 충분합니다</span>
              </div>
            </div>

            <ImageUpload
              onUploadComplete={(data) => {
                setReportData(data);
                setStep(2);
              }}
            />
          </div>
        )}

        {/* STEP 2: Chat */}
        {step === 2 && reportData && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                2
              </div>
              <h2 className="text-2xl font-bold text-gray-800">간단 질문</h2>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-gray-800 flex items-start gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-600 mt-0.5" />
                <span>
                  <strong>정답은 없습니다.</strong> 아이의 말 그대로를
                  적어주세요.
                </span>
              </p>
            </div>

            <ChatInterface
              reportData={reportData}
              onComplete={async (responses, userInfo) => {
                setChatResponses(responses);
                setGeneratingReport(true);

                try {
                  // Chat 기반 리포트 생성 (나이, 성별 정보 포함)
                  const result = await generateChatReport(
                    reportData.report.id,
                    responses,
                    userInfo
                  );
                  // 사용자용 간단 리포트 표시
                  setSimpleReport(
                    result.simple_report || result.report_content
                  );

                  // 전체 리포트 데이터 다시 가져오기 (이미지 및 각 에이전트 결과 포함)
                  const { getReport } = await import("@/lib/api");
                  const fullReportData = await getReport(reportData.report.id);
                  if (fullReportData.success) {
                    setReportData({ report: fullReportData.report });
                  }

                  setStep(3);
                } catch (error: any) {
                  console.error("Report generation error:", error);
                  alert(error.message || "리포트 생성 중 오류가 발생했습니다.");
                } finally {
                  setGeneratingReport(false);
                }
              }}
            />

            {generatingReport && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">리포트를 생성하고 있습니다...</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: 리포트 표시 */}
        {step === 3 && reportData && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                ✨
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  AI 그림 관찰 리포트 생성 완료
                </h2>
                <p className="text-gray-600 mt-1">
                  그림과 이야기를 분석한 결과입니다
                </p>
              </div>
            </div>

            {/* 업로드된 그림 표시 */}
            {reportData.report?.image_metadata &&
              (reportData.report.image_metadata.image_url ||
                reportData.report.image_metadata.base64) && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">🖼️</span> 업로드된 그림
                  </h3>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 flex justify-center">
                    <img
                      src={
                        reportData.report.image_metadata.image_url
                          ? reportData.report.image_metadata.image_url
                          : reportData.report.image_metadata.base64
                          ? `data:image/jpeg;base64,${reportData.report.image_metadata.base64}`
                          : ""
                      }
                      alt="업로드된 그림"
                      className="max-w-full h-auto rounded-lg shadow-md object-contain"
                      style={{ maxHeight: "500px", maxWidth: "100%" }}
                      onError={(e) => {
                        console.error("이미지 로드 실패:", e);
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

            {/* 각 에이전트 결과 상세 표시 */}
            {reportData.report && (
              <div className="mb-6 space-y-6">
                {/* 1. 이미지 관찰 전문가 결과 */}
                {reportData.report.observation && (
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">🎨</span> 1. 이미지 관찰 전문가
                      결과
                    </h3>
                    <div className="space-y-4">
                      {reportData.report.observation.colors &&
                        reportData.report.observation.colors.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              색상 분석:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {reportData.report.observation.colors.map(
                                (color: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                  >
                                    {color}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      {reportData.report.observation.shapes &&
                        reportData.report.observation.shapes.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              형태 분석:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {reportData.report.observation.shapes.map(
                                (shape: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                  >
                                    {shape}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      {reportData.report.observation.composition && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            구성:
                          </p>
                          <p className="text-gray-800">
                            {reportData.report.observation.composition}
                          </p>
                        </div>
                      )}
                      {reportData.report.observation.details &&
                        reportData.report.observation.details.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              세부사항:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-gray-800">
                              {reportData.report.observation.details.map(
                                (detail: string, idx: number) => (
                                  <li key={idx}>{detail}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      {reportData.report.observation.overall_impression && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            전체 인상:
                          </p>
                          <p className="text-gray-800">
                            {reportData.report.observation.overall_impression}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. 감정언어 분석 전문가 결과 */}
                {reportData.report.emotional_language && (
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-pink-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">💭</span> 2. 감정언어 분석
                      전문가 결과
                    </h3>
                    <div className="space-y-4">
                      {reportData.report.emotional_language.dominant_emotions &&
                        reportData.report.emotional_language.dominant_emotions
                          .length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              주요 감정:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {reportData.report.emotional_language.dominant_emotions.map(
                                (emotion: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
                                  >
                                    {emotion}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      {reportData.report.emotional_language.emotional_tone && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            감정적 톤:
                          </p>
                          <p className="text-gray-800">
                            {
                              reportData.report.emotional_language
                                .emotional_tone
                            }
                          </p>
                        </div>
                      )}
                      {reportData.report.emotional_language.symbolic_elements &&
                        reportData.report.emotional_language.symbolic_elements
                          .length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              상징적 요소:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {reportData.report.emotional_language.symbolic_elements.map(
                                (element: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                                  >
                                    {element}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      {reportData.report.emotional_language.intensity_level && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            강도 수준:
                          </p>
                          <p className="text-gray-800">
                            {
                              reportData.report.emotional_language
                                .intensity_level
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. 종합 결론 보고서 (터미널 출력 형식) */}
                {reportData.report.professional_report && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">📊</span> 3. 종합 결론 보고서
                    </h3>
                    <div
                      className="markdown-content text-gray-800"
                      dangerouslySetInnerHTML={{
                        __html: (() => {
                          const reportContent =
                            reportData.report.professional_report || "";
                          if (!reportContent) return "";

                          // HTML 이스케이프 처리
                          let html = reportContent
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;");

                          // ==== 섹션 구분자 처리 (먼저 처리)
                          html = html.replace(
                            /====\s*종합결론 전문가 종합 평가\s*====/g,
                            '<div class="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-md mb-6 border-l-4 border-purple-500"><h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><span class="text-2xl">👨‍⚕️</span> 종합결론 전문가 종합 평가</h2><div class="space-y-4 prose prose-lg max-w-none">'
                          );

                          // 대괄호로 감싼 섹션 제목 제거 (가독성 개선)
                          // [섹션 제목] 형식을 제거하고 내용만 남김 (여러 줄에 걸쳐 있을 수 있음)
                          html = html.replace(/\[\s*[^\]]+\s*\]\s*\n*/g, "");

                          // 줄바꿈 정리 (연속된 빈 줄을 하나로)
                          html = html.replace(/\n{3,}/g, "\n\n");

                          // 문단 형식으로 변환 (빈 줄로 구분된 텍스트를 <p> 태그로)
                          // 먼저 섹션 헤더 이후의 내용을 추출
                          const sectionMatch = html.match(
                            /종합결론 전문가 종합 평가<\/h2><div class="space-y-4 prose prose-lg max-w-none">([\s\S]*?)(?=<\/div><\/div>|$)/
                          );
                          if (sectionMatch) {
                            let content = sectionMatch[1];

                            // 대괄호 제목 제거
                            content = content.replace(
                              /\[\s*[^\]]+\s*\]\s*\n*/g,
                              ""
                            );

                            // 빈 줄로 구분된 문단을 <p> 태그로 변환
                            const paragraphs = content
                              .split(/\n\s*\n/)
                              .map((p: string) => p.trim())
                              .filter(
                                (p: string) =>
                                  p.length > 0 && !p.match(/^\[.*\]$/)
                              );

                            const formattedParagraphs = paragraphs
                              .map(
                                (p: string) =>
                                  `<p class="mb-4 text-gray-800 leading-relaxed text-base">${p}</p>`
                              )
                              .join("");

                            html = html.replace(
                              /(종합결론 전문가 종합 평가<\/h2><div class="space-y-4 prose prose-lg max-w-none">)([\s\S]*?)(?=<\/div><\/div>|$)/,
                              `$1${formattedParagraphs}`
                            );
                          }

                          // 필드별 포맷팅 (더 포괄적인 패턴 사용 - 여러 줄까지 포함)
                          //   html = html.replace(
                          //     /-\s*composition:\s*([\s\S]*?)(?=\n\s*-\s*(?:details|overall_impression|dominant_emotions|emotional_tone|symbolic_elements|intensity_level)|====|$)/g,
                          //     '<div class="mb-4 p-3 bg-blue-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>📐</span> 구성</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          //   );

                          // details: 여러 줄 처리 (다음 필드나 섹션까지)
                          //   html = html.replace(
                          //     /-\s*details:\s*([\s\S]*?)(?=\n\s*-\s*(?:overall_impression|composition|dominant_emotions|emotional_tone|symbolic_elements|intensity_level)|====|$)/g,
                          //     (match: string, content: string) => {
                          //       const lines = content
                          //         .split("\n")
                          //         .filter((line: string) => line.trim())
                          //         .map((line: string) => {
                          //           const trimmed = line
                          //             .replace(/^\s*-\s*/, "")
                          //             .trim();
                          //           return trimmed;
                          //         })
                          //         .filter((line: string) => line.length > 0);

                          //       const listItems = lines
                          //         .map(
                          //           (item: string) =>
                          //             `<li class="mb-2 text-gray-700 pl-2">${item}</li>`
                          //         )
                          //         .join("");

                          //       return `<div class="mb-4 p-3 bg-blue-50 rounded-lg"><p class="text-sm text-gray-600 mb-2 font-semibold flex items-center gap-1"><span>🔍</span> 세부사항</p><ul class="list-disc list-inside space-y-1">${listItems}</ul></div>`;
                          //     }
                          //   );

                          //   html = html.replace(
                          //     /-\s*overall_impression:\s*([\s\S]*?)(?=\n\s*-\s*(?:composition|details|dominant_emotions|emotional_tone|symbolic_elements|intensity_level)|====|$)/g,
                          //     '<div class="mb-4 p-3 bg-blue-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>🌟</span> 전체 인상</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          //   );
                          //   html = html.replace(
                          //     /-\s*dominant_emotions:\s*([\s\S]*?)(?=\n\s*-\s*(?:composition|details|overall_impression|emotional_tone|symbolic_elements|intensity_level)|====|$)/g,
                          //     '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>😊</span> 주요 감정</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          // //   );
                          //   html = html.replace(
                          //     /-\s*emotional_tone:\s*([\s\S]*?)(?=\n\s*-\s*(?:composition|details|overall_impression|dominant_emotions|symbolic_elements|intensity_level)|====|$)/g,
                          //     '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>🎭</span> 감정적 톤</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          // //   );
                          //   html = html.replace(
                          //     /-\s*symbolic_elements:\s*([\s\S]*?)(?=\n\s*-\s*(?:composition|details|overall_impression|dominant_emotions|emotional_tone|intensity_level)|====|$)/g,
                          //     '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>🔮</span> 상징적 요소</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          // //   );
                          //   html = html.replace(
                          //     /-\s*intensity_level:\s*([\s\S]*?)(?=\n\s*-\s*(?:composition|details|overall_impression|dominant_emotions|emotional_tone|symbolic_elements)|====|$)/g,
                          //     '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>📊</span> 강도 수준</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          //   );

                          // 종합결론 섹션의 일반 텍스트 처리 (필드가 아닌 텍스트 - 여러 줄)
                          // 섹션 헤더 이후의 내용을 처리
                          //   html = html.replace(
                          //     /(종합결론 전문가 종합 평가 \(20년 경력\)<\/h2><div class="space-y-3">)([\s\S]*?)(?=<\/div><\/div>|$)/g,
                          //     (
                          //       match: string,
                          //       header: string,
                          //       content: string
                          //     ) => {
                          //       // 이미 포맷팅된 div 태그들을 제거하고 원본 텍스트만 추출
                          //       const originalText = content
                          //         .replace(/<div[^>]*>[\s\S]*?<\/div>/g, "") // 포맷팅된 div 제거
                          //         .replace(/<[^>]+>/g, "") // 나머지 HTML 태그 제거
                          //         .replace(/&lt;/g, "<")
                          //         .replace(/&gt;/g, ">")
                          //         .replace(/&amp;/g, "&");

                          //       // 줄 단위로 분리하여 처리
                          //       const lines = originalText
                          //         .split("\n")
                          //         .filter((line: string) => line.trim());
                          //       let formattedContent = "";
                          //       let currentParagraph = "";

                          //       for (const line of lines) {
                          //         const trimmed = line.trim();
                          //         if (!trimmed) continue;

                          //         // 필드로 시작하는 줄은 이미 포맷팅됨 (건너뛰기)
                          //         if (
                          //           trimmed.match(
                          //             /^-\s*(?:composition|details|overall_impression|dominant_emotions|emotional_tone|symbolic_elements|intensity_level):/
                          //           )
                          //         ) {
                          //           continue;
                          //         }

                          //         // 일반 텍스트 누적
                          //         if (currentParagraph) {
                          //           currentParagraph += " " + trimmed;
                          //         } else {
                          //           currentParagraph = trimmed;
                          //         }
                          //       }

                          //       // 마지막 문단 처리
                          //       if (currentParagraph) {
                          //         formattedContent = `<p class="mb-3 text-gray-800 leading-relaxed whitespace-pre-line">${currentParagraph}</p>`;
                          //       }

                          //       return header + content + formattedContent;
                          //     }
                          //   );

                          //   // 나머지 줄들도 처리 (섹션 내 일반 텍스트 - 필드가 아닌 것들)
                          //   html = html.replace(
                          //     /^(?!-|\s*====|<div|<h|<p)([^\n]+(?:\n(?!-|\s*====|<div|<h|<p)[^\n]+)*)/gm,
                          //     '<p class="mb-3 text-gray-800 leading-relaxed whitespace-pre-line">$1</p>'
                          //   );

                          // 줄바꿈 처리 (이미 포맷팅된 부분은 제외)
                          html = html.replace(/(?<!>)\n(?!<)/g, "<br />");

                          // 마지막 닫기 태그 추가
                          if (
                            html.split("</div>").length <
                            html.split("<div").length
                          ) {
                            html += "</div></div>";
                          }

                          return html;
                        })(),
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={async () => {
                    try {
                      await downloadReportPDF(reportData.report.id);
                    } catch (error: any) {
                      alert(
                        error.message || "PDF 다운로드 중 오류가 발생했습니다."
                      );
                    }
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Download className="w-5 h-5" />
                  📄 PDF 다운로드
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Share className="w-5 h-5" />
                  공유하기
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  다음 단계로
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 공유하기 모달 */}
            {showShareModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    공유하기
                  </h3>
                  
                  <div className="space-y-3">
                    {/* URL 복사 */}
                    <button
                      onClick={copyToClipboard}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3 border-2 border-gray-300 hover:border-gray-400"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span>복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span>링크 복사</span>
                        </>
                      )}
                    </button>

                    {/* 카카오톡 공유 */}
                    <button
                      onClick={shareToKakao}
                      className="w-full bg-yellow-300 hover:bg-yellow-400 text-gray-800 px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3"
                    >
                      <span className="text-xl">💬</span>
                      <span>카카오톡 공유</span>
                    </button>

                    {/* 페이스북 공유 */}
                    <button
                      onClick={shareToFacebook}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3"
                    >
                      <span className="text-xl">📘</span>
                      <span>페이스북 공유</span>
                    </button>

                    {/* 트위터 공유 */}
                    <button
                      onClick={shareToTwitter}
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3"
                    >
                      <span className="text-xl">🐦</span>
                      <span>트위터 공유</span>
                    </button>

                    {/* 링크드인 공유 */}
                    <button
                      onClick={shareToLinkedIn}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3"
                    >
                      <span className="text-xl">💼</span>
                      <span>링크드인 공유</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: 상담 예약 */}
        {step === 4 && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                4
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-500" />
                  대화 예약하기
                </h2>
                <p className="text-gray-600 mt-1">
                  날짜와 시간을 선택하고 예약 정보를 입력해주세요
                </p>
              </div>
            </div>

            {/* 예약금 안내 */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">💰</span> 예약금 안내
              </h3>
              <div className="space-y-2 text-gray-700 text-sm">
                <p className="flex items-start gap-2">
                  <span className="font-semibold">• 예약금:</span>
                  <span>10,000원 (입금 확인 후 예약 확정)</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-semibold">• 입금 기한:</span>
                  <span>예약 접수 후 5시간 이내</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-semibold">• 입금 확인:</span>
                  <span>관리자가 입금을 확인하면 예약이 확정됩니다</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-semibold">• 입금 계좌:</span>
                  <span>예약 완료 후 다음 페이지에서 확인 가능합니다</span>
                </p>
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-yellow-800 text-xs">
                    ⚠️ 입금 기한 내에 입금이 확인되지 않으면 예약이 취소될 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* 날짜 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  예약 날짜
                </label>
                <input
                  type="date"
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  required
                />
              </div>

              {/* 시간 선택 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  예약 시간
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setReservationTime(time)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        reservationTime === time
                          ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* 예약 정보 입력 */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    아이 이름
                  </label>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                    placeholder="아이 이름을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    아이 연령
                  </label>
                  <input
                    type="text"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                    placeholder="예: 7세"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  부모 전화번호
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  placeholder="010-1234-5678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  메모 (선택사항)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  rows={4}
                  placeholder="특별히 전달하고 싶은 내용이 있으시면 입력해주세요"
                />
              </div>

              {/* 예약 버튼 */}
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    if (!reservationDate || !reservationTime || !childName || !childAge || !parentPhone) {
                      alert("필수 정보를 모두 입력해주세요.");
                      return;
                    }

                    setCreatingReservation(true);
                    try {
                      const reservationData: CreateReservationRequest = {
                        reservation_date: reservationDate,
                        reservation_time: reservationTime + ":00",
                        child_name: childName,
                        child_age: childAge,
                        parent_phone: parentPhone,
                        notes: notes || undefined,
                      };

                      const result = await createReservation(reservationData);
                      setReservationResult(result);
                      setStep(5);
                    } catch (error: any) {
                      alert(error.message || "예약 생성 중 오류가 발생했습니다.");
                    } finally {
                      setCreatingReservation(false);
                    }
                  }}
                  disabled={creatingReservation}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {creatingReservation ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      예약 생성 중...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      예약하기
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: 예약금 입금 안내 */}
        {step === 5 && reservationResult && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                ✓
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  예약이 접수되었습니다
                </h2>
                <p className="text-gray-600 mt-1">
                  예약금 입금 안내를 확인해주세요
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">예약 정보</h3>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">예약 번호:</span> {reservationResult.reservation.id.substring(0, 8)}</p>
                <p><span className="font-semibold">예약 날짜:</span> {new Date(reservationResult.reservation.reservation_date).toLocaleDateString("ko-KR")}</p>
                <p><span className="font-semibold">예약 시간:</span> {reservationResult.reservation.reservation_time.substring(0, 5)}</p>
                <p><span className="font-semibold">아이 이름:</span> {reservationResult.reservation.child_name}</p>
                <p><span className="font-semibold">상태:</span> 입금 대기 중</p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">💰</span> 예약금 입금 안내
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">입금 계좌</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {reservationResult.deposit_info.bank_name}
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {reservationResult.deposit_info.account_number}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">입금 금액</p>
                  <p className="text-3xl font-bold text-green-600">
                    {reservationResult.deposit_info.amount.toLocaleString()}원
                  </p>
                </div>
                <div className="bg-white p-5 rounded-lg border-2 border-red-200">
                  <p className="text-sm text-gray-600 mb-2 font-semibold">입금 기한</p>
                  <p className="text-xl font-bold text-red-600">
                    {new Date(reservationResult.deposit_info.deadline).toLocaleString("ko-KR")}까지
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    (예약 접수 후 5시간 이내)
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 font-semibold mb-2">
                  ⚠️ 중요 안내
                </p>
                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                  <li>입금 기한 내에 입금이 확인되지 않으면 예약이 취소될 수 있습니다.</li>
                  <li>입금 시 예약 번호를 메모란에 기재해주시면 확인이 더 빠릅니다.</li>
                  <li>입금 확인은 관리자가 수동으로 진행하며, 확인까지 시간이 걸릴 수 있습니다.</li>
                  <li>입금 확인 완료 후 예약이 확정되면 상태가 변경됩니다.</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 border-l-4 border-gray-400 p-6 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-800">
                  <p className="font-bold mb-2 text-base flex items-center gap-2">
                    <span>ℹ️</span> 안내사항
                  </p>
                  <p className="leading-relaxed">
                    입금 확인은 관리자가 수동으로 진행합니다. 입금 완료 후 예약이 확정됩니다.
                    입금 확인까지 시간이 걸릴 수 있으니 양해 부탁드립니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  // 상태 초기화
                  setReservationDate("");
                  setReservationTime("");
                  setChildName("");
                  setChildAge("");
                  setParentPhone("");
                  setNotes("");
                  setReservationResult(null);
                  setStep(4);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold transition-all"
              >
                다시 예약하기
              </button>
              <button
                onClick={() => {
                  // 홈으로 이동 또는 리포트 보기
                  window.location.href = "/";
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                홈으로 가기
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 (기존): 상담 연결 CTA - 이제 사용하지 않음 */}
        {false && step === 4 && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                💬
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500" />
                  대화·수업 안내
                </h2>
                <p className="text-gray-600 mt-1">
                  선생님과 함께 더 깊이 알아보세요
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 rounded-xl border-2 border-blue-200 text-center mb-8 shadow-inner">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-xl text-gray-800 mb-2 font-semibold">
                  이 리포트는
                </p>
                <p className="text-lg text-gray-700">
                  아이를 더 잘 이해하기 위한
                  <br />
                  대화의 참고 자료입니다
                </p>
              </div>

              {/* 문의하기 - 상단 배치 */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-8 rounded-2xl shadow-lg border border-amber-100 text-center hover:shadow-xl transition-all duration-300">
                  <MailOpen className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    이메일 문의
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    문의 사항은 이메일로 보내주세요.
                  </p>
                  <a
                    href="mailto:lovetree914@naver.com?subject=미술 수업 문의&body=안녕하세요. 문의드립니다."
                    className="group inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-800 px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 transform"
                  >
                    <MailOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>이메일 보내기</span>
                  </a>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg border border-green-100 text-center hover:shadow-xl transition-all duration-300">
                  <PhoneCall className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    전화 문의
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    전화 문의는 오전 10시부터 오후 5시까지 가능합니다.
                  </p>
                  <a
                    href="tel:010-4159-1102"
                    className="group inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 transform"
                  >
                    <PhoneCall className="w-5 h-5 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
                    <span>전화 걸기</span>
                  </a>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="/consultation"
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center gap-1"
                >
                  상세 수업 안내 보기
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-800">
                  <p className="font-bold mb-2 text-base flex items-center gap-2">
                    <span>⚠️</span> 중요 안내
                  </p>
                  <p className="leading-relaxed">
                    본 그림 분석 리포트는 심리 진단이나 치료를 목적으로 하지
                    않으며, 미술 수업과 대화를 돕기 위한 참고 자료입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
