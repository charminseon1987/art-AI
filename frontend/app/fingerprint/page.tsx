"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Brain,
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  X,
  Send,
  MessageCircle,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { KAKAO_CHANNEL_URL } from "@/lib/constants";

interface FingerprintData {
  thumb_personality?: {
    title: string;
    description: string;
    patterns: Record<string, any>;
  };
  fingerprint_characteristics?: {
    title: string;
    description: string;
    detailed_features: Record<string, any>;
  };
  report_example?: {
    title: string;
    sections: Array<{ section_title: string; content: string }>;
  };
  blog_content?: {
    title: string;
    images: Array<{ src: string; alt: string }>;
    text_content: string[];
    sections: Array<{ title: string; content: string; image: string | null }>;
  };
}

export default function FingerprintPage() {
  const [fingerprintData, setFingerprintData] =
    useState<FingerprintData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [usageLimit, setUsageLimit] = useState<{
    fingerprint_analysis_remaining: number;
    fingerprint_analysis_limit: number;
  } | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    // 스크래핑 서비스를 통해 데이터 가져오기
    fetch("/api/fingerprint-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFingerprintData(data.data);
        }
      })
      .catch((err) => {
        console.error("데이터 로드 오류:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // 사용 횟수 조회
    const fetchUsageLimit = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const response = await fetch("/api/usage-limits");
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUsageLimit({
                fingerprint_analysis_remaining:
                  data.usage.fingerprint_analysis_remaining,
                fingerprint_analysis_limit:
                  data.usage.fingerprint_analysis_limit,
              });
            }
          }
        }
      } catch (error) {
        console.error("사용 횟수 조회 오류:", error);
      } finally {
        setLoadingUsage(false);
      }
    };

    fetchUsageLimit();

    // 카카오 인증 후 돌아왔을 때 대기 중인 분석 자동 처리
    const handlePendingAnalysis = async () => {
      const pendingData = sessionStorage.getItem("pendingFingerprintAnalysis");
      const pendingFile = sessionStorage.getItem(
        "pendingFingerprintAnalysisFile"
      );

      if (pendingData && pendingFile) {
        try {
          const fileData = JSON.parse(pendingData);

          // Base64를 File 객체로 변환
          const response = await fetch(pendingFile);
          const blob = await response.blob();
          const file = new File([blob], fileData.name, { type: fileData.type });

          setSelectedFile(file);
          if (fileData.preview) {
            setPreviewUrl(fileData.preview);
          }

          // 세션 스토리지 정리
          sessionStorage.removeItem("pendingFingerprintAnalysis");
          sessionStorage.removeItem("pendingFingerprintAnalysisFile");

          // 사용자 인증 확인 후 분석 시작
          const user = await getCurrentUser();
          if (user) {
            // 약간의 지연 후 분석 시작 (UI 업데이트 대기)
            setTimeout(() => {
              handleAnalyzeFingerprint();
            }, 500);
          }
        } catch (error) {
          console.error("대기 중인 분석 처리 오류:", error);
          sessionStorage.removeItem("pendingFingerprintAnalysis");
          sessionStorage.removeItem("pendingFingerprintAnalysisFile");
        }
      }
    };

    handlePendingAnalysis();
  }, []);

  // 채팅 초기 메시지
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "안녕하세요! 지문 분석에 관심을 가져주셔서 감사합니다. 궁금한 점이 있으시면 언제든지 문의해주세요. 😊",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isChatOpen, messages.length]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // 간단한 자동 응답 (실제로는 API 호출)
    setTimeout(() => {
      const responses = [
        "지문 분석에 대해 궁금하신 점이 있으시군요! 자세한 내용은 분석 페이지에서 확인하실 수 있습니다.",
        "지문 분석은 하워드 가드너의 다중지능 이론을 바탕으로 진행됩니다.",
        "더 자세한 문의가 필요하시면 카카오톡이나 네이버 예약을 통해 문의해주세요.",
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: randomResponse,
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAnalyzeFingerprint = async () => {
    if (!selectedFile) {
      alert("엄지 지문 사진을 선택해주세요.");
      return;
    }

    // 파일 크기 확인 (10MB 제한)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    // 인증 없이 바로 분석 진행

    // 사용 횟수 확인
    if (usageLimit && usageLimit.fingerprint_analysis_remaining <= 0) {
      alert(
        "분석회수를 초과했습니다. 더 자세한 대화는 선생님과의 예약이 필요합니다."
      );
      return;
    }

    setIsAnalyzing(true);
    setIsAnalysisModalOpen(true);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      console.log("지문 분석 시작:", selectedFile.name, selectedFile.size);

      const response = await fetch("/api/analyze-fingerprint", {
        method: "POST",
        body: formData,
        // 타임아웃 설정은 브라우저에서 직접 할 수 없으므로 서버에서 처리
      });

      console.log("응답 상태:", response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = "분석 실패";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error ||
            errorData.message ||
            `서버 오류 (${response.status})`;
          console.error("서버 오류 응답:", errorData);
        } catch (e) {
          errorMessage = `서버 오류 (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("분석 결과:", data);

      // 사용 횟수 초과 응답 처리
      if (data.success === false && data.error) {
        alert(data.error);
        // 사용 횟수 다시 조회
        const usageResponse = await fetch("/api/usage-limits");
        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          if (usageData.success) {
            setUsageLimit({
              fingerprint_analysis_remaining:
                usageData.usage.fingerprint_analysis_remaining,
              fingerprint_analysis_limit:
                usageData.usage.fingerprint_analysis_limit,
            });
          }
        }
        setIsAnalyzing(false);
        return;
      }

      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);

        // 사용 횟수 다시 조회
        const usageResponse = await fetch("/api/usage-limits");
        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          if (usageData.success) {
            setUsageLimit({
              fingerprint_analysis_remaining:
                usageData.usage.fingerprint_analysis_remaining,
              fingerprint_analysis_limit:
                usageData.usage.fingerprint_analysis_limit,
            });
          }
        }
      } else {
        throw new Error(data.error || "분석 결과를 받지 못했습니다");
      }
    } catch (error: any) {
      console.error("분석 오류 상세:", error);
      const errorMessage = error.message || "알 수 없는 오류가 발생했습니다";
      alert(
        `분석 중 오류가 발생했습니다:\n${errorMessage}\n\n콘솔을 확인해주세요.`
      );
      setIsAnalysisModalOpen(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const closeAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setAnalysisResult(null);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-pink-50 via-rose-50 to-white">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">
            <Brain className="w-4 h-4" />
            AI 기반 지문 분석
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
            하워드 가드너 지문상담
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-700">
            다중지능 이론 기반 아이 맞춤 상담
          </h2>
        </div>

        {/* 하워드 가드너 이론 개요 */}
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] p-8 mb-8 border border-pink-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-fuchsia-600 p-3 rounded-xl shadow-md">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              하워드 가드너의 다중지능 이론
            </h2>
          </div>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            하워드 가드너(Howard Gardner)는 1983년 '마음의 틀(Frames of
            Mind)'에서 기존의 단일 지능 개념을 비판하고, 인간은 8가지(또는
            9가지) 서로 다른 지능을 가지고 있다고 제시했습니다.
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="bg-pink-50 p-4 rounded-xl hover:bg-pink-100 transition-colors duration-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
              <span>
                모든 사람은 8가지 지능을 모두 가지고 있지만, 각 지능의 발달
                정도는 다릅니다
              </span>
            </li>
            <li className="bg-pink-50 p-4 rounded-xl hover:bg-pink-100 transition-colors duration-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
              <span>
                지능은 고정된 것이 아니라 교육과 경험을 통해 발달시킬 수
                있습니다
              </span>
            </li>
            <li className="bg-pink-50 p-4 rounded-xl hover:bg-pink-100 transition-colors duration-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
              <span>
                각 지능은 독립적으로 작동하며, 서로 다른 방식으로 조합될 수
                있습니다
              </span>
            </li>
            <li className="bg-pink-50 p-4 rounded-xl hover:bg-pink-100 transition-colors duration-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
              <span>아이의 강점 지능을 파악하면 맞춤형 교육이 가능합니다</span>
            </li>
          </ul>
        </div>

        {/* 지문 분석 소개 */}
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] p-8 mb-8 border border-pink-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 p-3 rounded-xl shadow-md">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
              지문 분석이란?
            </h2>
          </div>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            하워드 가드너(Howard Gardner)의 <strong>다중지능 이론</strong>을
            바탕으로 한 지문 분석입니다.
          </p>

          {/* 지문 형성 과정 이미지 및 설명 */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-l-4 border-pink-500 p-6 rounded-r-xl mb-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              지문이 처음 생기는 곳
            </h3>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  지문은 <strong>태아 시기 임신 13주부터</strong> 손가락
                  끝부분에 처음 생기기 시작합니다.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  지문은 세 곳에서 처음 형성됩니다:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>손가락 끝부분</li>
                  <li>중앙 부분</li>
                  <li>관절 바로 위 부분</li>
                </ul>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  이 세 곳에서 형성된 지문이 빈 공간을 채우며 퍼져나가 완전한
                  지문 패턴을 만듭니다. 완전히 형성된 지문은{" "}
                  <strong>
                    아치형(Arch), 고리형(Loop), 나선형(Whorl), 복합형
                    (Composite)
                  </strong>{" "}
                  네 가지 주요 패턴으로 분류됩니다.
                </p>
                <p className="text-lg leading-relaxed font-semibold text-pink-700">
                  ⚠️ 한번 형성된 지문 패턴은 평생 변하지 않습니다.
                </p>
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-700 leading-relaxed">
            아이의 손가락 지문을 분석하여 8가지 지능 유형(언어지능,
            논리수학지능, 공간지능, 음악지능, 신체운동지능, 대인지능,
            자기성찰지능, 자연지능) 중 어떤 영역이 발달되어 있는지 파악하고,
            아이에게 맞는 학습 방법과 진로 방향을 제안합니다.
          </p>
        </div>

        {/* 지문 분석 프로세스 */}
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] p-8 mb-8 border border-pink-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl shadow-md">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              지문 분석 프로세스
            </h2>
          </div>
          <ol className="space-y-4 text-gray-700">
            <li className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-xl hover:shadow-md transition-all duration-300 flex items-start gap-4">
              <span className="bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                1
              </span>
              <span className="pt-1.5">
                10개 손가락의 지문을 촬영하고 패턴을 분석합니다
              </span>
            </li>
            <li className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 p-5 rounded-xl hover:shadow-md transition-all duration-300 flex items-start gap-4">
              <span className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                2
              </span>
              <span className="pt-1.5">
                각 손가락의 지문 패턴을 분류합니다 (나선형, 고리형, 호형,
                복합형)
              </span>
            </li>
            <li className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl hover:shadow-md transition-all duration-300 flex items-start gap-4">
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                3
              </span>
              <span className="pt-1.5">
                패턴의 분포와 조합을 분석하여 강점 지능을 파악합니다
              </span>
            </li>
            <li className="bg-gradient-to-br from-rose-50 to-rose-100 p-5 rounded-xl hover:shadow-md transition-all duration-300 flex items-start gap-4">
              <span className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                4
              </span>
              <span className="pt-1.5">
                분석 결과를 바탕으로 맞춤형 학습 방법을 제안합니다
              </span>
            </li>
          </ol>
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg shadow-sm">
            <p className="text-sm text-yellow-800 font-semibold">
              ⚠️ 지문 분석은 참고 자료이며, 아이의 실제 행동과 관찰을 함께
              고려해야 합니다
            </p>
          </div>
        </div>

        {/* 지문별 특징 상세
        {fingerprintData?.fingerprint_characteristics && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {fingerprintData.fingerprint_characteristics.title}
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              {fingerprintData.fingerprint_characteristics.description}
            </p>
            <div className="space-y-6">
              {Object.entries(
                fingerprintData.fingerprint_characteristics.detailed_features
              ).map(([patternName, features]: [string, any]) => (
                <div
                  key={patternName}
                  className="border-l-4 border-purple-500 pl-6 py-4 bg-purple-50 rounded-r-lg"
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    🔸 {patternName}
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      <strong>시각적 특징:</strong>{" "}
                      {features.visual_description}
                    </p>
                    <p>
                      <strong>지능 연관성:</strong>{" "}
                      {features.intelligence_connection}
                    </p>
                    <p>
                      <strong>성격 지표:</strong>{" "}
                      {features.personality_indicators}
                    </p>
                    <div className="mt-3">
                      <strong className="text-green-700">강점:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {features.strengths.map(
                          (strength: string, idx: number) => (
                            <li key={idx}>{strength}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <div className="mt-3">
                      <strong className="text-blue-700">발달 영역:</strong>
                      <p className="ml-4 mt-1">{features.development_areas}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* 엄지 주성격 분석 */}
        {fingerprintData?.thumb_personality && (
          <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] p-8 mb-8 border border-pink-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-3 rounded-xl shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {fingerprintData.thumb_personality.title}
              </h2>
            </div>
            <p className="text-lg text-gray-700 mb-6">
              {fingerprintData.thumb_personality.description}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(fingerprintData.thumb_personality.patterns).map(
                ([patternName, pattern]: [string, any]) => (
                  <div
                    key={patternName}
                    className="bg-gradient-to-br from-pink-50 to-rose-50 border-l-4 border-pink-500 pl-4 rounded-r-xl p-5 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                  >
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent mb-3">
                      {patternName}
                    </h3>
                    <p className="text-gray-700 mb-3 font-semibold">
                      {pattern.personality}
                    </p>
                    <div className="mb-3">
                      <strong className="text-gray-800">특성:</strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pattern.traits.map((trait: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-gradient-to-r from-pink-100 to-fuchsia-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                      <strong>학습 스타일:</strong> {pattern.learning_style}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* 지문검사 결과 보고서 예시 */}
        {fingerprintData?.report_example && (
          <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] p-8 mb-8 border border-pink-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-fuchsia-500 to-pink-600 p-3 rounded-xl shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                {fingerprintData.report_example.title}
              </h2>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl p-6 space-y-6 shadow-inner">
              {fingerprintData.report_example.sections.map((section, idx) => (
                <div
                  key={idx}
                  className="border-b border-pink-200 pb-4 last:border-b-0"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {section.section_title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-fuchsia-50 border-l-4 border-pink-400 rounded-lg shadow-sm">
              <p className="text-sm text-pink-800 font-medium">
                💡 실제 지문검사 결과 보고서는 개인의 지문 패턴을 분석하여 더욱
                상세하고 맞춤형으로 제공됩니다.
              </p>
            </div>
          </div>
        )}

        {/* AI 주성향 파악 */}
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] p-8 mb-8 border-2 border-pink-200 relative overflow-hidden">
          {/* 배경 장식 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-200 to-fuchsia-200 rounded-full blur-3xl opacity-20 -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 -z-10"></div>

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-fuchsia-600 p-3 rounded-xl shadow-lg">
              <Brain className="w-7 h-7 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
              AI 주성향 파악
            </h2>
          </div>
          <p className="text-lg text-gray-700 mb-6 font-medium">
            엄지 손가락의 지문 사진을 업로드하면 AI가 지문 패턴을 분석하여 주된
            성격 특성을 파악해드립니다.
          </p>

          <div className="border-2 border-dashed border-pink-300 bg-gradient-to-br from-pink-50 to-white rounded-2xl p-8 text-center mb-6 hover:border-pink-400 transition-colors duration-300">
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="업로드된 지문"
                    className="max-w-full max-h-64 rounded-xl shadow-lg border-2 border-pink-200"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                      }
                    }}
                    className="text-sm text-pink-600 hover:text-pink-800 font-semibold underline"
                  >
                    다른 사진 선택
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="w-20 h-20 text-pink-400 mx-auto" />
                <div>
                  <label
                    htmlFor="fingerprint-upload"
                    className="cursor-pointer inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-bold text-lg hover:scale-105"
                  >
                    <Upload className="w-6 h-6" />
                    엄지 지문 사진 업로드
                  </label>
                  <input
                    id="fingerprint-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  JPG, PNG 형식의 이미지를 업로드해주세요
                </p>
              </div>
            )}
          </div>

          {/* 사용 횟수 표시 */}
          {usageLimit !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <span className="font-semibold">남은 분석 횟수:</span>
                <span className="font-bold text-blue-600">
                  {usageLimit.fingerprint_analysis_remaining} /{" "}
                  {usageLimit.fingerprint_analysis_limit}
                </span>
              </div>
            </div>
          )}

          {/* 사용 횟수 초과 안내 */}
          {usageLimit !== null &&
            usageLimit.fingerprint_analysis_remaining <= 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-red-800 mb-3">
                      <p className="font-semibold mb-1">
                        분석회수를 초과했습니다.
                      </p>
                      <p>더 자세한 대화는 선생님과의 예약이 필요합니다.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        href="/consultation"
                        className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        대화 예약하기
                      </Link>
                      <a
                        href={KAKAO_CHANNEL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        카카오톡 문의
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {selectedFile && (
            <div className="text-center">
              <button
                onClick={handleAnalyzeFingerprint}
                disabled={
                  isAnalyzing ||
                  (usageLimit !== null &&
                    usageLimit.fingerprint_analysis_remaining <= 0)
                }
                className="bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto hover:scale-105"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Brain className="w-6 h-6" />
                    AI 주성향 분석 시작
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 지문 분석 신청 */}
        <div className="bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 rounded-2xl shadow-2xl p-10 text-white text-center mb-8 relative overflow-hidden">
          {/* 배경 애니메이션 blob */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full opacity-10 blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full opacity-10 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full mb-4">
              <Brain className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-semibold">AI 기반 맞춤 분석</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 drop-shadow-lg">
              지문 분석으로 우리 아이의 강점을 발견하세요
            </h2>
            <p className="text-lg md:text-xl mb-10 opacity-95">
              하워드 가드너 다중지능 이론 기반 지문 분석
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-white text-pink-600 hover:bg-gray-50 hover:shadow-2xl px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:scale-105"
              >
                지문 분석 문의하기
              </button>
              <Link
                href="/consultation"
                className="bg-transparent border-3 border-white text-white hover:bg-white hover:text-fuchsia-600 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
              >
                대화·수업 안내로 이동
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 분석 결과 모달 */}
      {isAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 animate-pulse" />
                <h3 className="font-semibold text-lg">엄지 주성향 분석 결과</h3>
              </div>
              <button
                onClick={closeAnalysisModal}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 모달 내용 */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-pink-600 animate-spin mb-4" />
                  <p className="text-gray-700 text-lg font-semibold">
                    지문 패턴을 분석하고 있습니다...
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    잠시만 기다려주세요
                  </p>
                </div>
              ) : analysisResult ? (
                <div className="space-y-6">
                  {/* 업로드된 지문 이미지 */}
                  {previewUrl && (
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl shadow-lg p-6 border-2 border-pink-200">
                      <h4 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                        <ImageIcon className="w-5 h-5 text-pink-600" />
                        분석된 엄지 지문
                      </h4>
                      <div className="flex justify-center bg-white p-4 rounded-lg shadow-inner">
                        <div className="relative inline-block">
                          <div className="relative">
                            <img
                              src={previewUrl}
                              alt="분석된 지문"
                              className="max-w-full max-h-96 rounded-lg shadow-xl border-4 border-pink-200 object-contain"
                              style={{
                                filter:
                                  "contrast(1.3) brightness(0.9) grayscale(0.1)",
                              }}
                              id="fingerprint-image"
                            />
                            {/* 투명 빨간색 패턴 오버레이 */}
                            <svg
                              className="absolute inset-0 w-full h-full pointer-events-none"
                              style={{
                                mixBlendMode: "multiply",
                              }}
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                            >
                              {/* 중심점 표시 - 크기 증가 */}
                              <circle
                                cx="50"
                                cy="50"
                                r="6"
                                fill="rgba(255, 0, 0, 0.5)"
                                stroke="rgba(255, 0, 0, 0.8)"
                                strokeWidth="1.5"
                              />
                              {/* 나선형 패턴 표시 - 크기 증가 */}
                              {(analysisResult.pattern_type === "나선형" ||
                                analysisResult.pattern_type === "정기문") && (
                                <>
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="18"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.6)"
                                    strokeWidth="1.2"
                                    strokeDasharray="3,3"
                                  />
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="28"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.5)"
                                    strokeWidth="1.2"
                                    strokeDasharray="3,3"
                                  />
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="38"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.4)"
                                    strokeWidth="1.2"
                                    strokeDasharray="3,3"
                                  />
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.3)"
                                    strokeWidth="1"
                                    strokeDasharray="3,3"
                                  />
                                </>
                              )}
                              {/* 두형문 패턴 표시 - 크기 증가 */}
                              {analysisResult.pattern_type === "두형문" && (
                                <>
                                  <circle
                                    cx="35"
                                    cy="50"
                                    r="8"
                                    fill="rgba(255, 0, 0, 0.4)"
                                    stroke="rgba(255, 0, 0, 0.7)"
                                    strokeWidth="1.5"
                                  />
                                  <circle
                                    cx="65"
                                    cy="50"
                                    r="8"
                                    fill="rgba(255, 0, 0, 0.4)"
                                    stroke="rgba(255, 0, 0, 0.7)"
                                    strokeWidth="1.5"
                                  />
                                  <circle
                                    cx="35"
                                    cy="50"
                                    r="18"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.5)"
                                    strokeWidth="1.2"
                                    strokeDasharray="3,3"
                                  />
                                  <circle
                                    cx="35"
                                    cy="50"
                                    r="28"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.4)"
                                    strokeWidth="1"
                                    strokeDasharray="3,3"
                                  />
                                  <circle
                                    cx="65"
                                    cy="50"
                                    r="18"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.5)"
                                    strokeWidth="1.2"
                                    strokeDasharray="3,3"
                                  />
                                  <circle
                                    cx="65"
                                    cy="50"
                                    r="28"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.4)"
                                    strokeWidth="1"
                                    strokeDasharray="3,3"
                                  />
                                </>
                              )}
                              {/* 고리형 패턴 표시 - 크기 증가 */}
                              {analysisResult.pattern_type === "고리형" && (
                                <>
                                  <path
                                    d="M 50 25 Q 75 50, 50 75 Q 25 50, 50 25"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.6)"
                                    strokeWidth="1.5"
                                  />
                                  <path
                                    d="M 50 20 Q 80 50, 50 80 Q 20 50, 50 20"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.4)"
                                    strokeWidth="1.2"
                                    strokeDasharray="4,4"
                                  />
                                </>
                              )}
                              {/* 호형 패턴 표시 - 크기 증가 */}
                              {analysisResult.pattern_type === "호형" && (
                                <>
                                  <path
                                    d="M 15 65 Q 50 35, 85 65"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.6)"
                                    strokeWidth="1.5"
                                  />
                                  <path
                                    d="M 10 70 Q 50 30, 90 70"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.4)"
                                    strokeWidth="1.2"
                                    strokeDasharray="4,4"
                                  />
                                </>
                              )}
                              {/* 쌍기문 패턴 표시 - 크기 증가 */}
                              {analysisResult.pattern_type === "쌍기문" && (
                                <>
                                  <circle
                                    cx="42"
                                    cy="50"
                                    r="7"
                                    fill="rgba(255, 0, 0, 0.5)"
                                    stroke="rgba(255, 0, 0, 0.8)"
                                    strokeWidth="1.5"
                                  />
                                  <circle
                                    cx="58"
                                    cy="50"
                                    r="7"
                                    fill="rgba(255, 0, 0, 0.5)"
                                    stroke="rgba(255, 0, 0, 0.8)"
                                    strokeWidth="1.5"
                                  />
                                  <circle
                                    cx="42"
                                    cy="50"
                                    r="15"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.5)"
                                    strokeWidth="1.2"
                                    strokeDasharray="3,3"
                                  />
                                  <circle
                                    cx="58"
                                    cy="50"
                                    r="15"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.5)"
                                    strokeWidth="1.2"
                                    strokeDasharray="3,3"
                                  />
                                </>
                              )}
                              {/* 반기문 패턴 표시 - 크기 증가 */}
                              {analysisResult.pattern_type === "반기문" && (
                                <>
                                  <path
                                    d="M 50 50 A 18 18 0 0 1 75 50"
                                    fill="rgba(255, 0, 0, 0.5)"
                                    stroke="rgba(255, 0, 0, 0.8)"
                                    strokeWidth="1.5"
                                  />
                                  <path
                                    d="M 50 50 A 25 25 0 0 1 80 50"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.4)"
                                    strokeWidth="1.2"
                                    strokeDasharray="4,4"
                                  />
                                </>
                              )}
                              {/* 호형문 패턴 표시 */}
                              {analysisResult.pattern_type === "호형문" && (
                                <>
                                  <path
                                    d="M 15 65 Q 50 35, 85 65"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.6)"
                                    strokeWidth="1.5"
                                  />
                                  <path
                                    d="M 50 25 Q 75 50, 50 75"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.5)"
                                    strokeWidth="1.2"
                                    strokeDasharray="3,3"
                                  />
                                </>
                              )}
                              {/* 복합형 패턴 표시 */}
                              {analysisResult.pattern_type === "복합형" && (
                                <>
                                  <circle
                                    cx="50"
                                    cy="50"
                                    r="20"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.5)"
                                    strokeWidth="1.2"
                                    strokeDasharray="4,4"
                                  />
                                  <path
                                    d="M 50 30 Q 70 50, 50 70"
                                    fill="none"
                                    stroke="rgba(255, 0, 0, 0.5)"
                                    strokeWidth="1.2"
                                  />
                                </>
                              )}
                            </svg>
                          </div>
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10">
                            {analysisResult.pattern_type}
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-sm text-gray-600 mt-4">
                        위 지문 패턴을 분석한 결과입니다
                      </p>
                    </div>
                  )}

                  {/* 패턴 유형 */}
                  <div className="bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-md p-6 border-l-4 border-pink-500 hover:shadow-lg transition-shadow">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      지문 패턴 유형
                    </h4>
                    <p className="text-2xl font-semibold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                      {analysisResult.pattern_type}
                    </p>
                    <p className="text-gray-600 text-sm">
                      신뢰도: {analysisResult.confidence}
                    </p>
                  </div>

                  {/* 성격 특성 */}
                  <div className="bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h4 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
                      엄지 주성격 분석
                    </h4>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      엄지손가락의 지문 패턴은 개인의 주된 성격 특성을 나타내는
                      중요한 지표입니다.
                    </p>
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        {analysisResult.pattern_type} 패턴의 특성:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.personality_traits?.map(
                          (trait: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-gradient-to-r from-pink-100 to-fuchsia-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                            >
                              {trait}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        학습 스타일:
                      </h5>
                      <p className="text-gray-700 leading-relaxed">
                        {analysisResult.learning_style}
                      </p>
                    </div>
                  </div>

                  {/* 분석 요약 */}
                  {analysisResult.analysis_summary && (
                    <div className="bg-gradient-to-r from-pink-50 to-fuchsia-50 rounded-xl p-6 border-l-4 border-pink-400 shadow-md">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        분석 요약
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {analysisResult.analysis_summary}
                      </p>
                    </div>
                  )}

                  {/* 패턴 설명 */}
                  {analysisResult.pattern_description && (
                    <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl p-6 shadow-md">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        패턴 상세 설명
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {analysisResult.pattern_description}
                      </p>
                    </div>
                  )}

                  {/* 심층상담 버튼 */}
                  <div className="flex gap-4 pt-4">
                    <Link
                      href="/consultation"
                      onClick={closeAnalysisModal}
                      className="flex-1 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 text-center hover:scale-105"
                    >
                      심층상담 신청하기
                    </Link>
                    <button
                      onClick={closeAnalysisModal}
                      className="px-6 py-3 border-2 border-pink-300 text-gray-700 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 채팅 모달 */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-[600px] flex flex-col">
            {/* 채팅 헤더 */}
            <div className="bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold text-lg">지문상담 문의</h3>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 채팅 메시지 영역 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-md"
                        : "bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user"
                          ? "text-pink-100"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 입력 영역 */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white px-4 py-2 rounded-lg hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                더 자세한 상담은{" "}
                <Link
                  href="/consultation"
                  className="text-pink-600 hover:underline font-semibold"
                  onClick={() => setIsChatOpen(false)}
                >
                  상담 페이지
                </Link>
                에서 확인하세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
