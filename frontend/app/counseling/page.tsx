"use client";

import { useState } from "react";
import { Upload, MessageSquare, FileText, ArrowRight, AlertCircle } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import ChatInterface from "@/components/ChatInterface";
import ReportDisplay from "@/components/ReportDisplay";
import { generateChatReport } from "@/lib/api";
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
            AI는 그림을 정리하고<br />
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
                <span><strong>정답은 없습니다.</strong> 아이의 말 그대로를 적어주세요.</span>
              </p>
            </div>

            <ChatInterface
              reportData={reportData}
              onComplete={async (responses) => {
                setChatResponses(responses);
                setGeneratingReport(true);
                
                try {
                  // Chat 기반 리포트 생성
                  const result = await generateChatReport(reportData.report.id, responses);
                  // 사용자용 간단 리포트 표시
                  setSimpleReport(result.simple_report || result.report_content);
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <h2 className="text-2xl font-bold text-gray-800">AI 그림 관찰 리포트 생성</h2>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-6">
              📄 그림 관찰 기반 상담 참고 리포트
            </h3>

            {simpleReport ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="prose max-w-none">
                  <div 
                    className="markdown-content text-gray-800"
                    dangerouslySetInnerHTML={{ 
                      __html: simpleReport
                        .replace(/\n\n/g, '</p><p class="mb-4">')
                        .replace(/\n/g, '<br />')
                        .replace(/##\s+(.+?)(?=\n|$)/g, '<h2 class="text-xl font-bold mt-6 mb-4 text-gray-900 border-b pb-2">$1</h2>')
                        .replace(/###\s+(.+?)(?=\n|$)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-800">$1</h3>')
                        .replace(/#\s+(.+?)(?=\n|$)/g, '<h1 class="text-2xl font-bold mb-6 text-gray-900">$1</h1>')
                        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                        .replace(/^(.+)$/gm, '<p class="mb-2">$1</p>')
                    }} 
                  />
                </div>
              </div>
            ) : (
              <ReportDisplay reportData={reportData} />
            )}

            <div className="mt-8">
              <button
                onClick={() => setStep(4)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                다음 단계로
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: 상담 연결 CTA */}
        {step === 4 && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                4
              </div>
              <h2 className="text-2xl font-bold text-gray-800">상담 연결</h2>
            </div>

            <div className="bg-green-50 p-8 rounded-lg text-center mb-6">
              <p className="text-lg text-gray-800 mb-4">
                이 리포트는<br />
                아이를 더 잘 이해하기 위한 대화의 참고 자료입니다.
              </p>
              <a
                href="/consultation"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                선생님 상담으로 연결하기
              </a>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-gray-800">
                  <p className="font-bold mb-1">⚠ 중요 안내</p>
                  <p>
                    본 그림 상담 리포트는 심리 진단이나 치료를 목적으로 하지 않으며,
                    미술 수업과 상담을 돕기 위한 참고 자료입니다.
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

