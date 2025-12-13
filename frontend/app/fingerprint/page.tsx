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
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  }, []);

  // 채팅 초기 메시지
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "안녕하세요! 지문상담에 관심을 가져주셔서 감사합니다. 궁금한 점이 있으시면 언제든지 문의해주세요. 😊",
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
        "지문상담에 대해 궁금하신 점이 있으시군요! 자세한 내용은 상담 페이지에서 확인하실 수 있습니다.",
        "지문 분석은 하워드 가드너의 다중지능 이론을 바탕으로 진행됩니다.",
        "더 자세한 상담이 필요하시면 카카오톡이나 네이버 예약을 통해 문의해주세요.",
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

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            하워드 가드너 지문상담
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600">
            다중지능 이론 기반 아이 맞춤 상담
          </h2>
        </div>

        {/* 하워드 가드너 이론 개요 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            하워드 가드너의 다중지능 이론
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            하워드 가드너(Howard Gardner)는 1983년 '마음의 틀(Frames of
            Mind)'에서 기존의 단일 지능 개념을 비판하고, 인간은 8가지(또는
            9가지) 서로 다른 지능을 가지고 있다고 제시했습니다.
          </p>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>
                모든 사람은 8가지 지능을 모두 가지고 있지만, 각 지능의 발달
                정도는 다릅니다
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>
                지능은 고정된 것이 아니라 교육과 경험을 통해 발달시킬 수
                있습니다
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>
                각 지능은 독립적으로 작동하며, 서로 다른 방식으로 조합될 수
                있습니다
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <span>아이의 강점 지능을 파악하면 맞춤형 교육이 가능합니다</span>
            </li>
          </ul>
        </div>

        {/* 지문상담 소개 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            지문상담이란?
          </h2>
          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            하워드 가드너(Howard Gardner)의 <strong>다중지능 이론</strong>을
            바탕으로 한 지문 분석 상담입니다.
          </p>

          {/* 지문 형성 과정 이미지 및 설명 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
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
                  <strong>아치형(Arch), 고리형(Loop), 나선형(Whorl)</strong> 세
                  가지 주요 패턴으로 분류됩니다.
                </p>
                <p className="text-lg leading-relaxed font-semibold text-blue-700">
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
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            지문 분석 프로세스
          </h2>
          <ol className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </span>
              <span className="pt-1">
                10개 손가락의 지문을 촬영하고 패턴을 분석합니다
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </span>
              <span className="pt-1">
                각 손가락의 지문 패턴을 분류합니다 (나선형, 고리형, 호형,
                복합형)
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </span>
              <span className="pt-1">
                패턴의 분포와 조합을 분석하여 강점 지능을 파악합니다
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </span>
              <span className="pt-1">
                분석 결과를 바탕으로 맞춤형 학습 방법을 제안합니다
              </span>
            </li>
          </ol>
          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
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
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {fingerprintData.thumb_personality.title}
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              {fingerprintData.thumb_personality.description}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(fingerprintData.thumb_personality.patterns).map(
                ([patternName, pattern]: [string, any]) => (
                  <div
                    key={patternName}
                    className="border-l-4 border-blue-500 pl-4 bg-blue-50 rounded-r-lg p-4"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
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
                            className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm"
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
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              {fingerprintData.report_example.title}
            </h2>
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 space-y-6">
              {fingerprintData.report_example.sections.map((section, idx) => (
                <div
                  key={idx}
                  className="border-b border-gray-300 pb-4 last:border-b-0"
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
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <p className="text-sm text-blue-800">
                💡 실제 지문검사 결과 보고서는 개인의 지문 패턴을 분석하여 더욱
                상세하고 맞춤형으로 제공됩니다.
              </p>
            </div>
          </div>
        )}

        {/* 블로그 콘텐츠 섹션 */}
        {fingerprintData?.blog_content && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {fingerprintData.blog_content.title || "지문상담 관련 정보"}
            </h2>

            {/* 블로그 이미지 갤러리 */}
            {fingerprintData.blog_content.images &&
              fingerprintData.blog_content.images.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {fingerprintData.blog_content.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={img.src}
                        alt={img.alt || `지문 패턴 이미지 ${idx + 1}`}
                        className="w-full h-auto object-contain max-h-96"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      {img.alt && (
                        <p className="p-2 text-sm text-gray-600 text-center bg-white">
                          {img.alt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

            {/* 블로그 텍스트 내용 */}
            {fingerprintData.blog_content.text_content &&
              fingerprintData.blog_content.text_content.length > 0 && (
                <div className="space-y-4 mb-6">
                  {fingerprintData.blog_content.text_content.map(
                    (text, idx) => (
                      <p
                        key={idx}
                        className="text-gray-700 leading-relaxed text-lg"
                      >
                        {text}
                      </p>
                    )
                  )}
                </div>
              )}

            {/* 블로그 섹션 */}
            {fingerprintData.blog_content.sections &&
              fingerprintData.blog_content.sections.length > 0 && (
                <div className="space-y-6">
                  {fingerprintData.blog_content.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-50 rounded-r-lg"
                    >
                      {section.title && (
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">
                          {section.title}
                        </h3>
                      )}
                      {section.image && (
                        <div className="mb-4">
                          <img
                            src={section.image}
                            alt={section.title || `섹션 이미지 ${idx + 1}`}
                            className="max-w-full h-auto rounded-lg shadow-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      {section.content && (
                        <p className="text-gray-700 leading-relaxed">
                          {section.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* 지문상담 신청 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            지문상담으로 우리 아이의 강점을 발견하세요
          </h2>
          <p className="text-lg mb-8">
            하워드 가드너 다중지능 이론 기반 지문 분석 상담
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 hover:shadow-xl px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:scale-105"
            >
              지문상담 문의하기
            </button>
            <Link
              href="/consultation"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              상담·수업 안내로 이동
            </Link>
          </div>
        </div>
      </div>

      {/* 채팅 모달 */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-[600px] flex flex-col">
            {/* 채팅 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
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
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user"
                          ? "text-blue-100"
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                더 자세한 상담은{" "}
                <Link
                  href="/consultation"
                  className="text-blue-600 hover:underline"
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
