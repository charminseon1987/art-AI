"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Eye, Search, Filter, Image as ImageIcon } from "lucide-react";
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
      (report.user_emotion && report.user_emotion.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">관리자 페이지</h1>
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
                  <div className="text-center py-8 text-gray-500">로딩 중...</div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">리포트가 없습니다.</div>
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
                            {new Date(report.created_at).toLocaleDateString("ko-KR")}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(report.created_at).toLocaleTimeString("ko-KR")}
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
                  <h2 className="text-2xl font-bold text-gray-800">전문 리포트</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const blob = new Blob(
                          [selectedReport.professional_report || selectedReport.chat_based_report || ""],
                          { type: "text/markdown" }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `전문리포트_${selectedReport.id.substring(0, 8)}.md`;
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
                        {new Date(selectedReport.created_at).toLocaleString("ko-KR")}
                      </span>
                    </div>
                    {selectedReport.user_emotion && (
                      <div>
                        <span className="text-gray-600">선택 감정:</span>
                        <span className="ml-2 text-gray-800">{selectedReport.user_emotion}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 전문 리포트 내용 */}
                <div className="prose max-w-none">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div
                      className="markdown-content text-gray-800 whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: (selectedReport.professional_report ||
                          selectedReport.chat_based_report ||
                          "전문 리포트가 생성되지 않았습니다.")
                          .replace(/\n/g, "<br />")
                          .replace(/##\s+(.+)/g, '<h2 class="text-xl font-bold mt-6 mb-4 text-gray-900">$1</h2>')
                          .replace(/#\s+(.+)/g, '<h1 class="text-2xl font-bold mb-6 text-gray-900">$1</h1>')
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                          .replace(/\*(.+?)\*/g, "<em>$1</em>"),
                      }}
                    />
                  </div>
                </div>

                {/* Chat 응답 (있는 경우) */}
                {selectedReport.chat_responses && selectedReport.chat_responses.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Chat 응답 기록</h3>
                    <div className="space-y-3">
                      {selectedReport.chat_responses.map((response: any, idx: number) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Q{idx + 1}: {response.question}
                          </p>
                          <p className="text-sm text-gray-800">A: {response.answer}</p>
                        </div>
                      ))}
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
