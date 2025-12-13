"use client";

import { useState } from "react";
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
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import ChatInterface from "@/components/ChatInterface";
import ReportDisplay from "@/components/ReportDisplay";
import { generateChatReport, downloadReportPDF } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function CounselingPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [reportData, setReportData] = useState<any>(null);
  const [chatResponses, setChatResponses] = useState<any[]>([]);
  const [simpleReport, setSimpleReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

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
            선생님은 상담으로 연결합니다
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

                {/* 3. 상담 질문 생성 전문가 결과 */}
                {reportData.report.reflection_questions && (
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">❓</span> 3. 상담 질문 생성
                      전문가 결과
                    </h3>
                    <div className="space-y-4">
                      {reportData.report.reflection_questions.questions &&
                        reportData.report.reflection_questions.questions
                          .length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              생성된 질문:
                            </p>
                            <ol className="list-decimal list-inside space-y-2 text-gray-800">
                              {reportData.report.reflection_questions.questions.map(
                                (question: string, idx: number) => (
                                  <li key={idx} className="pl-2">
                                    {question}
                                  </li>
                                )
                              )}
                            </ol>
                          </div>
                        )}
                      {reportData.report.reflection_questions.categories &&
                        reportData.report.reflection_questions.categories
                          .length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              질문 카테고리:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {reportData.report.reflection_questions.categories.map(
                                (category: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                                  >
                                    {category}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      {reportData.report.reflection_questions.purpose && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            질문의 목적:
                          </p>
                          <p className="text-gray-800">
                            {reportData.report.reflection_questions.purpose}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. 20년 경력 상담전문가 종합 결론 */}
                {reportData.report.professional_conclusion && (
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">👨‍⚕️</span> 4. 미술심리 전문가
                      종합 분석 (20년 경력)
                    </h3>
                    <div className="space-y-4">
                      {reportData.report.professional_conclusion
                        .executive_summary &&
                        reportData.report.professional_conclusion
                          .executive_summary !==
                          "결론 파싱 중 오류가 발생했습니다." && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              요약 및 핵심 인사이트:
                            </p>
                            <p className="text-gray-800 whitespace-pre-line">
                              {
                                reportData.report.professional_conclusion
                                  .executive_summary
                              }
                            </p>
                          </div>
                        )}
                      {reportData.report.professional_conclusion.key_findings &&
                        reportData.report.professional_conclusion.key_findings
                          .length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              주요 발견 사항:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-gray-800">
                              {reportData.report.professional_conclusion.key_findings.map(
                                (finding: string, idx: number) => (
                                  <li key={idx}>{finding}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      {reportData.report.professional_conclusion
                        .counseling_direction && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-2">
                            상담 방향성 제시:
                          </p>
                          <p className="text-gray-800 whitespace-pre-line">
                            {
                              reportData.report.professional_conclusion
                                .counseling_direction
                            }
                          </p>
                        </div>
                      )}
                      {reportData.report.professional_conclusion.focus_areas &&
                        reportData.report.professional_conclusion.focus_areas
                          .length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              집중 탐색 영역:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {reportData.report.professional_conclusion.focus_areas.map(
                                (area: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                                  >
                                    {area}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      {reportData.report.professional_conclusion
                        .professional_assessment &&
                        !reportData.report.professional_conclusion.professional_assessment.includes(
                          "결론 파싱 중 오류가 발생했습니다"
                        ) && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              전문가 종합 평가:
                            </p>
                            <p className="text-gray-800 whitespace-pre-line">
                              {
                                reportData.report.professional_conclusion
                                  .professional_assessment
                              }
                            </p>
                          </div>
                        )}
                      {reportData.report.professional_conclusion
                        .recommendations &&
                        reportData.report.professional_conclusion
                          .recommendations.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              권장 사항:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-gray-800">
                              {reportData.report.professional_conclusion.recommendations.map(
                                (rec: string, idx: number) => (
                                  <li key={idx}>{rec}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* 5. 종합 결론 보고서 (터미널 출력 형식) */}
                {reportData.report.professional_report && (
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">📊</span> 5. 종합 결론 보고서
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
                            /====\s*이미지 분석\s*====/g,
                            '<div class="bg-white p-6 rounded-xl shadow-md mb-6 border-l-4 border-blue-500"><h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><span class="text-2xl">🎨</span> 이미지 분석</h2><div class="space-y-3">'
                          );
                          html = html.replace(
                            /====\s*감정 언어 분석\s*====/g,
                            '</div></div><div class="bg-white p-6 rounded-xl shadow-md mb-6 border-l-4 border-pink-500"><h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><span class="text-2xl">💭</span> 감정 언어 분석</h2><div class="space-y-3">'
                          );
                          html = html.replace(
                            /====\s*종합결론 전문가 종합 평가\s*====/g,
                            '</div></div><div class="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-md mb-6 border-l-4 border-purple-500"><h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><span class="text-2xl">👨‍⚕️</span> 종합결론 전문가 종합 평가 (20년 경력)</h2><div class="space-y-3">'
                          );

                          // 필드별 포맷팅 (더 포괄적인 패턴 사용 - 여러 줄까지 포함)
                          html = html.replace(
                            /-\s*composition:\s*([\s\S]*?)(?=\n\s*-\s*(?:details|overall_impression|dominant_emotions|emotional_tone|symbolic_elements|intensity_level)|====|$)/g,
                            '<div class="mb-4 p-3 bg-blue-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>📐</span> 구성</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          );

                          // details: 여러 줄 처리 (다음 필드나 섹션까지)
                          html = html.replace(
                            /-\s*details:\s*([\s\S]*?)(?=\n\s*-\s*(?:overall_impression|composition|dominant_emotions|emotional_tone|symbolic_elements|intensity_level)|====|$)/g,
                            (match: string, content: string) => {
                              const lines = content
                                .split("\n")
                                .filter((line: string) => line.trim())
                                .map((line: string) => {
                                  const trimmed = line
                                    .replace(/^\s*-\s*/, "")
                                    .trim();
                                  return trimmed;
                                })
                                .filter((line: string) => line.length > 0);

                              const listItems = lines
                                .map(
                                  (item: string) =>
                                    `<li class="mb-2 text-gray-700 pl-2">${item}</li>`
                                )
                                .join("");

                              return `<div class="mb-4 p-3 bg-blue-50 rounded-lg"><p class="text-sm text-gray-600 mb-2 font-semibold flex items-center gap-1"><span>🔍</span> 세부사항</p><ul class="list-disc list-inside space-y-1">${listItems}</ul></div>`;
                            }
                          );

                          html = html.replace(
                            /-\s*overall_impression:\s*([\s\S]*?)(?=\n\s*-\s*(?:composition|details|dominant_emotions|emotional_tone|symbolic_elements|intensity_level)|====|$)/g,
                            '<div class="mb-4 p-3 bg-blue-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>🌟</span> 전체 인상</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          );
                          html = html.replace(
                            /-\s*dominant_emotions:\s*([\s\S]*?)(?=\n\s*-\s*(?:composition|details|overall_impression|emotional_tone|symbolic_elements|intensity_level)|====|$)/g,
                            '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>😊</span> 주요 감정</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          );
                          html = html.replace(
                            /-\s*emotional_tone:\s*([\s\S]*?)(?=\n\s*-\s*(?:composition|details|overall_impression|dominant_emotions|symbolic_elements|intensity_level)|====|$)/g,
                            '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>🎭</span> 감정적 톤</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          );
                          html = html.replace(
                            /-\s*symbolic_elements:\s*([\s\S]*?)(?=\n\s*-\s*(?:composition|details|overall_impression|dominant_emotions|emotional_tone|intensity_level)|====|$)/g,
                            '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>🔮</span> 상징적 요소</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          );
                          html = html.replace(
                            /-\s*intensity_level:\s*([\s\S]*?)(?=\n\s*-\s*(?:composition|details|overall_impression|dominant_emotions|emotional_tone|symbolic_elements)|====|$)/g,
                            '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>📊</span> 강도 수준</p><p class="text-gray-800 font-medium whitespace-pre-line">$1</p></div>'
                          );

                          // 종합결론 섹션의 일반 텍스트 처리 (필드가 아닌 텍스트 - 여러 줄)
                          // 섹션 헤더 이후의 내용을 처리
                          html = html.replace(
                            /(종합결론 전문가 종합 평가 \(20년 경력\)<\/h2><div class="space-y-3">)([\s\S]*?)(?=<\/div><\/div>|$)/g,
                            (
                              match: string,
                              header: string,
                              content: string
                            ) => {
                              // 이미 포맷팅된 div 태그들을 제거하고 원본 텍스트만 추출
                              const originalText = content
                                .replace(/<div[^>]*>[\s\S]*?<\/div>/g, "") // 포맷팅된 div 제거
                                .replace(/<[^>]+>/g, "") // 나머지 HTML 태그 제거
                                .replace(/&lt;/g, "<")
                                .replace(/&gt;/g, ">")
                                .replace(/&amp;/g, "&");

                              // 줄 단위로 분리하여 처리
                              const lines = originalText
                                .split("\n")
                                .filter((line: string) => line.trim());
                              let formattedContent = "";
                              let currentParagraph = "";

                              for (const line of lines) {
                                const trimmed = line.trim();
                                if (!trimmed) continue;

                                // 필드로 시작하는 줄은 이미 포맷팅됨 (건너뛰기)
                                if (
                                  trimmed.match(
                                    /^-\s*(?:composition|details|overall_impression|dominant_emotions|emotional_tone|symbolic_elements|intensity_level):/
                                  )
                                ) {
                                  continue;
                                }

                                // 일반 텍스트 누적
                                if (currentParagraph) {
                                  currentParagraph += " " + trimmed;
                                } else {
                                  currentParagraph = trimmed;
                                }
                              }

                              // 마지막 문단 처리
                              if (currentParagraph) {
                                formattedContent = `<p class="mb-3 text-gray-800 leading-relaxed whitespace-pre-line">${currentParagraph}</p>`;
                              }

                              return header + content + formattedContent;
                            }
                          );

                          // 나머지 줄들도 처리 (섹션 내 일반 텍스트 - 필드가 아닌 것들)
                          html = html.replace(
                            /^(?!-|\s*====|<div|<h|<p)([^\n]+(?:\n(?!-|\s*====|<div|<h|<p)[^\n]+)*)/gm,
                            '<p class="mb-3 text-gray-800 leading-relaxed whitespace-pre-line">$1</p>'
                          );

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
                  onClick={() => setStep(4)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  다음 단계로
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: 상담 연결 CTA */}
        {step === 4 && (
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                💬
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-red-500" />
                  상담·수업 안내
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

              <div className="grid md:grid-cols-2 gap-4 mt-8">
                <a
                  href="https://pf.kakao.com/_your_kakao_id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-8 py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <MessageCircle className="w-6 h-6" />
                  카카오톡으로 문의하기
                </a>
                <a
                  href="https://booking.naver.com/your_booking_id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <MessageCircle className="w-6 h-6" />
                  네이버 예약하기
                </a>
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
                    본 그림 상담 리포트는 심리 진단이나 치료를 목적으로 하지
                    않으며, 미술 수업과 상담을 돕기 위한 참고 자료입니다.
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
