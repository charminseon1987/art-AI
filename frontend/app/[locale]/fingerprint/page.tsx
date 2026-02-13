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

import { useTranslations } from "next-intl";

export default function FingerprintPage() {
  const t = useTranslations("fingerprint");

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
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });

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
          content: t("chatWelcome"),
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
        t("chatResponse1"),
        t("chatResponse2"),
        t("chatResponse3"),
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

  const showError = (message: string) => {
    setErrorModal({ isOpen: true, message });
  };

  const closeErrorModal = () => {
    setErrorModal({ isOpen: false, message: "" });
  };

  const handleAnalyzeFingerprint = async () => {
    if (!selectedFile) {
      showError(t("selectThumbPhoto"));
      return;
    }

    // 파일 크기 확인 (10MB 제한)
    if (selectedFile.size > 10 * 1024 * 1024) {
      showError(t("fileSizeLimit"));
      return;
    }

    // 인증 없이 바로 분석 진행

    // 사용 횟수 확인
    if (usageLimit && usageLimit.fingerprint_analysis_remaining <= 0) {
      showError(
        `${t("usageExceeded")} ${t("usageExceededDetail")}`
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
        let errorMessage = "지문사진이 아닙니다. 지문사진을 업로드해주세요.";
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error ||
            errorData.message ||
            t("notFingerprint");

          // 지문 관련 에러 메시지 정규화
          if (errorMessage.includes("엄지 손가락")) {
            errorMessage = t("notFingerprint");
          }

          console.error("서버 오류 응답:", errorData);
        } catch (e) {
          errorMessage = t("notFingerprint");
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("분석 결과:", data);

      // 사용 횟수 초과 응답 처리
      if (data.success === false && data.error) {
        let errorMessage = data.error;

        // 지문 관련 에러 메시지 정규화
        if (
          errorMessage.includes("지문") ||
          errorMessage.includes("지문 사진") ||
          errorMessage.includes("지문사진")
        ) {
          if (errorMessage.includes("엄지 손가락")) {
            errorMessage = t("notFingerprint");
          }
        }

        showError(errorMessage);
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
        setIsAnalysisModalOpen(false);
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
        throw new Error(data.error || t("noAnalysisResult"));
      }
    } catch (error: any) {
      console.error("분석 오류 상세:", error);
      let errorMessage = error.message || t("unknownError");

      // 네트워크 에러나 fetch 실패 시 지문 관련 에러로 처리
      if (
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("Network request failed")
      ) {
        errorMessage = t("notFingerprint");
      }

      // 지문 관련 에러 메시지 정규화
      if (
        errorMessage.includes("지문") ||
        errorMessage.includes("지문 사진") ||
        errorMessage.includes("지문사진")
      ) {
        // 서버에서 온 지문 관련 에러 메시지를 사용자가 원하는 형식으로 변환
        if (errorMessage.includes("엄지 손가락")) {
          errorMessage = t("notFingerprint");
        }
      }

      showError(errorMessage);
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
            {t("badge")}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-700">
            {t("subtitle")}
          </h2>
        </div>

        {/* 하워드 가드너 이론 개요 */}
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] p-8 mb-8 border border-pink-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-fuchsia-600 p-3 rounded-xl shadow-md">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
              {t("gardnerTheoryTitle")}
            </h2>
          </div>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            {t("gardnerTheoryDescription")}
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="bg-pink-50 p-4 rounded-xl hover:bg-pink-100 transition-colors duration-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
              <span>
                {t("gardnerPoint1")}
              </span>
            </li>
            <li className="bg-pink-50 p-4 rounded-xl hover:bg-pink-100 transition-colors duration-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
              <span>
                {t("gardnerPoint2")}
              </span>
            </li>
            <li className="bg-pink-50 p-4 rounded-xl hover:bg-pink-100 transition-colors duration-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
              <span>
                {t("gardnerPoint3")}
              </span>
            </li>
            <li className="bg-pink-50 p-4 rounded-xl hover:bg-pink-100 transition-colors duration-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
              <span>{t("gardnerPoint4")}</span>
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
              {t("whatIsTitle")}
            </h2>
          </div>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            {t("whatIsDescription")}
          </p>

          {/* 지문 형성 과정 이미지 및 설명 */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-l-4 border-pink-500 p-6 rounded-r-xl mb-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {t("formationTitle")}
            </h3>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  {t("formationDesc1")}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  {t("formationDesc2")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                  <li>{t("formationPoint1")}</li>
                  <li>{t("formationPoint2")}</li>
                  <li>{t("formationPoint3")}</li>
                </ul>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  {t("formationDesc3")}
                </p>
                <p className="text-lg leading-relaxed font-semibold text-pink-700">
                  ⚠️ {t("formationWarning")}
                </p>
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-700 leading-relaxed">
            {t("intelligenceDescription")}
          </p>
        </div>

        {/* 지문 분석 프로세스 */}
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] p-8 mb-8 border border-pink-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3 rounded-xl shadow-md">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t("processTitle")}
            </h2>
          </div>
          <ol className="space-y-4 text-gray-700">
            <li className="bg-gradient-to-br from-pink-50 to-pink-100 p-5 rounded-xl hover:shadow-md transition-all duration-300 flex items-start gap-4">
              <span className="bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                1
              </span>
              <span className="pt-1.5">
                {t("processStep1")}
              </span>
            </li>
            <li className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 p-5 rounded-xl hover:shadow-md transition-all duration-300 flex items-start gap-4">
              <span className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                2
              </span>
              <span className="pt-1.5">
                {t("processStep2")}
              </span>
            </li>
            <li className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl hover:shadow-md transition-all duration-300 flex items-start gap-4">
              <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                3
              </span>
              <span className="pt-1.5">
                {t("processStep3")}
              </span>
            </li>
            <li className="bg-gradient-to-br from-rose-50 to-rose-100 p-5 rounded-xl hover:shadow-md transition-all duration-300 flex items-start gap-4">
              <span className="bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                4
              </span>
              <span className="pt-1.5">
                {t("processStep4")}
              </span>
            </li>
          </ol>
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-lg shadow-sm">
            <p className="text-sm text-yellow-800 font-semibold">
              ⚠️ {t("processWarning")}
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
              {t("aiAnalysisTitle")}
            </h2>
          </div>
          <p className="text-lg text-gray-700 mb-6 font-medium">
            {t("aiAnalysisDescription")}
          </p>

          <div className="border-2 border-dashed border-pink-300 bg-gradient-to-br from-pink-50 to-white rounded-2xl p-8 text-center mb-6 hover:border-pink-400 transition-colors duration-300">
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt={t("uploadedFingerprint")}
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
                    {t("selectOtherPhoto")}
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
                    {t("uploadThumbprint")}
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
                  {t("uploadFormat")}
                </p>
              </div>
            )}
          </div>

          {/* 사용 횟수 표시 */}
          {usageLimit !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <span className="font-semibold">{t("remainingAnalysis")}</span>
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
                        {t("usageExceeded")}
                      </p>
                      <p>{t("usageExceededDetail")}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href={KAKAO_CHANNEL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        {t("kakaoInquiry")}
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
                    {t("analyzing")}
                  </>
                ) : (
                  <>
                    <Brain className="w-6 h-6" />
                    {t("startAnalysis")}
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
              <span className="text-sm font-semibold">{t("ctaBadge")}</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 drop-shadow-lg">
              {t("ctaTitle")}
            </h2>
            <p className="text-lg md:text-xl mb-10 opacity-95">
              {t("ctaSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button
                onClick={() => setIsChatOpen(true)}
                className="bg-white text-pink-600 hover:bg-gray-50 hover:shadow-2xl px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:scale-105"
              >
                {t("ctaButton")}
              </button>
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
                <h3 className="font-semibold text-lg">{t("analysisResultTitle")}</h3>
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
                    {t("analyzingPattern")}
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    {t("pleaseWait")}
                  </p>
                </div>
              ) : analysisResult ? (
                <div className="space-y-6">
                  {/* 업로드된 지문 이미지 */}
                  {previewUrl && (
                    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl shadow-lg p-6 border-2 border-pink-200">
                      <h4 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                        <ImageIcon className="w-5 h-5 text-pink-600" />
                        {t("analyzedThumbprint")}
                      </h4>
                      <div className="flex justify-center bg-white p-4 rounded-lg shadow-inner">
                        <div className="relative inline-block">
                          <div className="relative">
                            <img
                              src={previewUrl}
                              alt={t("analyzedThumbprint")}
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
                        {t("analysisResultNote")}
                      </p>
                    </div>
                  )}

                  {/* 패턴 유형 */}
                  <div className="bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-md p-6 border-l-4 border-pink-500 hover:shadow-lg transition-shadow">
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      {t("patternType")}
                    </h4>
                    <p className="text-2xl font-semibold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                      {analysisResult.pattern_type}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {t("confidence")} {analysisResult.confidence}
                    </p>
                  </div>

                  {/* 성격 특성 */}
                  <div className="bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <h4 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
                      {t("thumbPersonality")}
                    </h4>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {t("thumbPersonalityDesc")}
                    </p>
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        {analysisResult.pattern_type} {t("patternTraits")}
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
                        {t("learningStyle")}
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
                        {t("analysisSummary")}
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
                        {t("patternDescription")}
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {analysisResult.pattern_description}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={closeAnalysisModal}
                      className="flex-1 px-6 py-3 border-2 border-pink-300 text-gray-700 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
                    >
                      {t("close")}
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
                <h3 className="font-semibold text-lg">{t("chatTitle")}</h3>
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
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl p-3 ${message.role === "user"
                      ? "bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-md"
                      : "bg-white text-gray-800 shadow-sm"
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${message.role === "user"
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
                  placeholder={t("chatPlaceholder")}
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
            </div>
          </div>
        </div>
      )}

      {/* 에러 모달 */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scaleIn">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">{t("errorTitle")}</h3>
                  <p className="text-sm text-red-100 mt-1">{t("errorCheck")}</p>
                </div>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="p-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-4">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                  {errorModal.message}
                </p>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                onClick={closeErrorModal}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {t("errorConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
