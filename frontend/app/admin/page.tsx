"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Image as ImageIcon,
} from "lucide-react";
import { getReports, getReport } from "@/lib/api";
import Link from "next/link";

interface Report {
  id: string;
  created_at: string;
  user_emotion: string | null;
}

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (error: any) {
      console.error("리포트 로드 오류:", error);
      alert("리포트를 불러올 수 없습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReportDetail = async (reportId: string) => {
    try {
      setLoading(true);
      const data = await getReport(reportId);
      if (data.success) {
        setSelectedReport(data.report);
      }
    } catch (error: any) {
      console.error("리포트 상세 로드 오류:", error);
      alert("리포트를 불러올 수 없습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      report.id.toLowerCase().includes(searchLower) ||
      report.created_at.toLowerCase().includes(searchLower) ||
      (report.user_emotion &&
        report.user_emotion.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            관리자 페이지
          </h1>
          <p className="text-gray-600">전문 리포트 관리 및 보관</p>

          {/* 관리 메뉴 */}
          <div className="mt-4 flex gap-4">
            <Link
              href="/admin/class"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              수업 작품 등록
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 리포트 목록 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">리포트 목록</h2>
                <button
                  onClick={loadReports}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  새로고침
                </button>
              </div>

              {/* 검색 */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 리포트 리스트 */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    로딩 중...
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    리포트가 없습니다.
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => loadReportDetail(report.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {new Date(report.created_at).toLocaleDateString(
                              "ko-KR"
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(report.created_at).toLocaleTimeString(
                              "ko-KR"
                            )}
                          </p>
                          {report.user_emotion && (
                            <p className="text-xs text-blue-600 mt-1">
                              감정: {report.user_emotion}
                            </p>
                          )}
                        </div>
                        <Eye className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-400 mt-2 font-mono">
                        ID: {report.id.substring(0, 8)}...
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 리포트 상세 */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    전문 리포트
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const blob = new Blob(
                          [
                            selectedReport.professional_report ||
                              selectedReport.chat_based_report ||
                              "",
                          ],
                          { type: "text/markdown" }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `전문리포트_${selectedReport.id.substring(
                          0,
                          8
                        )}.md`;
                        a.click();
                      }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      다운로드
                    </button>
                  </div>
                </div>

                {/* 리포트 정보 */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">생성일:</span>
                      <span className="ml-2 text-gray-800">
                        {new Date(selectedReport.created_at).toLocaleString(
                          "ko-KR"
                        )}
                      </span>
                    </div>
                    {selectedReport.user_emotion && (
                      <div>
                        <span className="text-gray-600">선택 감정:</span>
                        <span className="ml-2 text-gray-800">
                          {selectedReport.user_emotion}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 업로드된 그림 표시 */}
                {(selectedReport.image_metadata?.image_url ||
                  selectedReport.image_metadata?.base64) && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-xl">🖼️</span> 업로드된 그림
                    </h3>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex justify-center">
                      <img
                        src={
                          selectedReport.image_metadata?.image_url
                            ? selectedReport.image_metadata.image_url
                            : selectedReport.image_metadata?.base64
                            ? `data:image/jpeg;base64,${selectedReport.image_metadata.base64}`
                            : ""
                        }
                        alt="업로드된 그림"
                        className="max-w-full h-auto rounded-lg shadow-md object-contain"
                        style={{ maxHeight: "600px", maxWidth: "100%" }}
                        onError={(e) => {
                          console.error("이미지 로드 실패:", e);
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    {selectedReport.image_metadata?.format && (
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        형식: {selectedReport.image_metadata.format} | 크기:{" "}
                        {selectedReport.image_metadata.width} x{" "}
                        {selectedReport.image_metadata.height}px
                      </div>
                    )}
                  </div>
                )}

                {/* 각 에이전트 결과 상세 표시 */}
                <div className="mb-6 space-y-6">
                  {/* 1. 이미지 관찰 전문가 결과 */}
                  {selectedReport.observation && (
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎨</span> 1. 이미지 관찰
                        전문가 결과
                      </h3>
                      <div className="space-y-4">
                        {selectedReport.observation.colors &&
                          selectedReport.observation.colors.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                색상 분석:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedReport.observation.colors.map(
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
                        {selectedReport.observation.shapes &&
                          selectedReport.observation.shapes.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                형태 분석:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedReport.observation.shapes.map(
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
                        {selectedReport.observation.composition && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              구성:
                            </p>
                            <p className="text-gray-800">
                              {selectedReport.observation.composition}
                            </p>
                          </div>
                        )}
                        {selectedReport.observation.details &&
                          selectedReport.observation.details.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                세부사항:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-gray-800">
                                {selectedReport.observation.details.map(
                                  (detail: string, idx: number) => (
                                    <li key={idx}>{detail}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        {selectedReport.observation.overall_impression && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              전체 인상:
                            </p>
                            <p className="text-gray-800">
                              {selectedReport.observation.overall_impression}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. 감정언어 분석 전문가 결과 */}
                  {selectedReport.emotional_language && (
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-pink-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">💭</span> 2. 감정언어 분석
                        전문가 결과
                      </h3>
                      <div className="space-y-4">
                        {selectedReport.emotional_language.dominant_emotions &&
                          selectedReport.emotional_language.dominant_emotions
                            .length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                주요 감정:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedReport.emotional_language.dominant_emotions.map(
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
                        {selectedReport.emotional_language.emotional_tone && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              감정적 톤:
                            </p>
                            <p className="text-gray-800">
                              {selectedReport.emotional_language.emotional_tone}
                            </p>
                          </div>
                        )}
                        {selectedReport.emotional_language.symbolic_elements &&
                          selectedReport.emotional_language.symbolic_elements
                            .length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                상징적 요소:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedReport.emotional_language.symbolic_elements.map(
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
                        {selectedReport.emotional_language.intensity_level && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              강도 수준:
                            </p>
                            <p className="text-gray-800">
                              {
                                selectedReport.emotional_language
                                  .intensity_level
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. 상담 질문 생성 전문가 결과 */}
                  {selectedReport.reflection_questions && (
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">❓</span> 3. 상담 질문 생성
                        전문가 결과
                      </h3>
                      <div className="space-y-4">
                        {selectedReport.reflection_questions.questions &&
                          selectedReport.reflection_questions.questions.length >
                            0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                생성된 질문:
                              </p>
                              <ol className="list-decimal list-inside space-y-2 text-gray-800">
                                {selectedReport.reflection_questions.questions.map(
                                  (question: string, idx: number) => (
                                    <li key={idx} className="pl-2">
                                      {question}
                                    </li>
                                  )
                                )}
                              </ol>
                            </div>
                          )}
                        {selectedReport.reflection_questions.categories &&
                          selectedReport.reflection_questions.categories
                            .length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                질문 카테고리:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedReport.reflection_questions.categories.map(
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
                        {selectedReport.reflection_questions.purpose && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              질문의 목적:
                            </p>
                            <p className="text-gray-800">
                              {selectedReport.reflection_questions.purpose}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. 상담전문가 결과 */}
                  {selectedReport.professional_conclusion && (
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-2xl">👨‍⚕️</span> 4. 미술심리 전문가
                        종합 분석
                      </h3>
                      <div className="space-y-4">
                        {selectedReport.professional_conclusion
                          .executive_summary &&
                          selectedReport.professional_conclusion
                            .executive_summary !==
                            "결론 파싱 중 오류가 발생했습니다." && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                요약 및 핵심 인사이트:
                              </p>
                              <p className="text-gray-800 whitespace-pre-line">
                                {
                                  selectedReport.professional_conclusion
                                    .executive_summary
                                }
                              </p>
                            </div>
                          )}
                        {selectedReport.professional_conclusion.key_findings &&
                          selectedReport.professional_conclusion.key_findings
                            .length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                주요 발견 사항:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-gray-800">
                                {selectedReport.professional_conclusion.key_findings.map(
                                  (finding: string, idx: number) => (
                                    <li key={idx}>{finding}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        {selectedReport.professional_conclusion
                          .counseling_direction && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 mb-2">
                              상담 방향성 제시:
                            </p>
                            <p className="text-gray-800 whitespace-pre-line">
                              {
                                selectedReport.professional_conclusion
                                  .counseling_direction
                              }
                            </p>
                          </div>
                        )}
                        {selectedReport.professional_conclusion.focus_areas &&
                          selectedReport.professional_conclusion.focus_areas
                            .length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                집중 탐색 영역:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {selectedReport.professional_conclusion.focus_areas.map(
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
                        {selectedReport.professional_conclusion
                          .professional_assessment &&
                          !selectedReport.professional_conclusion.professional_assessment.includes(
                            "결론 파싱 중 오류가 발생했습니다"
                          ) && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                전문가 종합 평가:
                              </p>
                              <p className="text-gray-800 whitespace-pre-line">
                                {
                                  selectedReport.professional_conclusion
                                    .professional_assessment
                                }
                              </p>
                            </div>
                          )}
                        {selectedReport.professional_conclusion
                          .recommendations &&
                          selectedReport.professional_conclusion.recommendations
                            .length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                권장 사항:
                              </p>
                              <ul className="list-disc list-inside space-y-1 text-gray-800">
                                {selectedReport.professional_conclusion.recommendations.map(
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
                </div>

                {/* 전문 리포트 내용 */}
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div
                      className="markdown-content text-gray-800 whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: (() => {
                          const reportContent =
                            selectedReport.professional_report ||
                            selectedReport.chat_based_report ||
                            selectedReport.image_metadata
                              ?.professional_report ||
                            "전문 리포트가 생성되지 않았습니다.";

                          if (typeof reportContent !== "string") {
                            return "전문 리포트가 생성되지 않았습니다.";
                          }

                          let html = reportContent;

                          // ==== 섹션 구분자 처리
                          html = html.replace(
                            /====\s*이미지 분석\s*====/g,
                            '<div class="bg-white p-6 rounded-xl shadow-md mb-6 border-l-4 border-blue-500"><h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><span class="text-2xl">🎨</span> 이미지 분석</h2>'
                          );
                          html = html.replace(
                            /====\s*감정 언어 분석\s*====/g,
                            '</div><div class="bg-white p-6 rounded-xl shadow-md mb-6 border-l-4 border-pink-500"><h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><span class="text-2xl">💭</span> 감정 언어 분석</h2>'
                          );
                          html = html.replace(
                            /====\s*종합결론 전문가 종합 평가\s*====/g,
                            '</div><div class="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-md mb-6 border-l-4 border-purple-500"><h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><span class="text-2xl">👨‍⚕️</span> 종합결론 전문가 종합 평가</h2>'
                          );

                          // 필드별 포맷팅
                          html = html.replace(
                            /composition:\s*([^\n]+)/g,
                            '<div class="mb-4 p-3 bg-blue-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>📐</span> 구성</p><p class="text-gray-800 font-medium">$1</p></div>'
                          );
                          html = html.replace(
                            /details:\s*([\s\S]*?)(?=\n\n|====|overall_impression:|$)/g,
                            (match, content) => {
                              const items = content
                                .split("\n")
                                .filter((line: string) => line.trim());
                              const listItems = items
                                .map((item: string) => {
                                  const trimmed = item
                                    .replace(/^-\s*/, "")
                                    .trim();
                                  return `<li class="mb-2 text-gray-700 pl-2">${trimmed}</li>`;
                                })
                                .join("");
                              return `<div class="mb-4 p-3 bg-blue-50 rounded-lg"><p class="text-sm text-gray-600 mb-2 font-semibold flex items-center gap-1"><span>🔍</span> 세부사항</p><ul class="list-disc list-inside space-y-1">${listItems}</ul></div>`;
                            }
                          );
                          html = html.replace(
                            /overall_impression:\s*([^\n]+)/g,
                            '<div class="mb-4 p-3 bg-blue-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>🌟</span> 전체 인상</p><p class="text-gray-800 font-medium">$1</p></div>'
                          );
                          html = html.replace(
                            /dominant_emotions:\s*([^\n]+)/g,
                            '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>😊</span> 주요 감정</p><p class="text-gray-800 font-medium">$1</p></div>'
                          );
                          html = html.replace(
                            /emotional_tone:\s*([^\n]+)/g,
                            '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>🎭</span> 감정적 톤</p><p class="text-gray-800 font-medium">$1</p></div>'
                          );
                          html = html.replace(
                            /symbolic_elements:\s*([^\n]+)/g,
                            '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>🔮</span> 상징적 요소</p><p class="text-gray-800 font-medium">$1</p></div>'
                          );
                          html = html.replace(
                            /intensity_level:\s*([^\n]+)/g,
                            '<div class="mb-4 p-3 bg-pink-50 rounded-lg"><p class="text-sm text-gray-600 mb-1 font-semibold flex items-center gap-1"><span>📊</span> 강도 수준</p><p class="text-gray-800 font-medium">$1</p></div>'
                          );

                          // 마크다운 기본 포맷팅
                          html = html.replace(
                            /##\s+(.+?)(?=\n|$)/g,
                            '<h2 class="text-xl font-bold mt-8 mb-4 text-gray-900 border-b-2 border-gray-300 pb-2 flex items-center gap-2"><span class="text-xl">📋</span> $1</h2>'
                          );
                          html = html.replace(
                            /###\s+(.+?)(?=\n|$)/g,
                            '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-800 flex items-center gap-2"><span class="text-lg">▸</span> $1</h3>'
                          );
                          html = html.replace(
                            /#\s+(.+?)(?=\n|$)/g,
                            '<h1 class="text-2xl font-bold mb-6 text-gray-900">$1</h1>'
                          );
                          html = html.replace(
                            /\*\*(.+?)\*\*/g,
                            '<strong class="font-semibold text-gray-900">$1</strong>'
                          );
                          html = html.replace(
                            /\*(.+?)\*/g,
                            '<em class="text-gray-700">$1</em>'
                          );
                          html = html.replace(
                            /^-\s+(.+?)(?=\n|$)/gm,
                            '<li class="ml-4 mb-2 text-gray-700">$1</li>'
                          );
                          html = html.replace(
                            /\n\n/g,
                            '</p><p class="mb-3 text-gray-800 leading-relaxed">'
                          );
                          html = html.replace(/\n/g, "<br />");
                          html = html.replace(
                            /^(.+)$/gm,
                            '<p class="mb-3 text-gray-800 leading-relaxed">$1</p>'
                          );

                          // 마지막 닫기 태그 추가
                          if (
                            !html.includes("</div>") ||
                            html.split("</div>").length <
                              html.split("<div").length
                          ) {
                            html += "</div>";
                          }

                          return html;
                        })(),
                      }}
                    />
                  </div>
                </div>

                {/* Chat 응답 (있는 경우) */}
                {selectedReport.chat_responses &&
                  selectedReport.chat_responses.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Chat 응답 기록
                      </h3>
                      <div className="space-y-3">
                        {selectedReport.chat_responses.map(
                          (response: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 bg-gray-50 rounded-lg"
                            >
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Q{idx + 1}: {response.question}
                              </p>
                              <p className="text-sm text-gray-800">
                                A: {response.answer}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">왼쪽에서 리포트를 선택하세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
