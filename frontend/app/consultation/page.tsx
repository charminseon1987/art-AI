import Link from "next/link";
import { ArrowRight, CheckCircle, MessageCircle } from "lucide-react";

export default function ConsultationPage() {
  const steps = [
    {
      num: "1️⃣",
      title: "그림 상담 (AI)",
      description: "아이의 그림을 AI로 분석하고 상담 질문을 통해 이야기를 나눕니다.",
    },
    {
      num: "2️⃣",
      title: "보호자 상담 (20분)",
      description: "생성된 리포트를 바탕으로 보호자와 간단한 상담을 진행합니다.",
    },
    {
      num: "3️⃣",
      title: "아이 맞춤 미술 수업 제안",
      description: "아이의 특성에 맞는 수업 방식을 제안합니다.",
    },
    {
      num: "4️⃣",
      title: "정기 수업 진행",
      description: "아이의 속도에 맞춰 자연스럽게 수업을 진행합니다.",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            상담·수업 안내
          </h1>
        </div>

        {/* 문의하기 - 상단 배치 */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            문의하기
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-6 py-4 rounded-lg font-semibold transition-colors">
              <MessageCircle className="w-5 h-5" />
              카카오톡으로 문의
            </button>
            <button className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg font-semibold transition-colors">
              <MessageCircle className="w-5 h-5" />
              네이버 예약하기
            </button>
          </div>
        </div>

        {/* 진행 흐름 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">진행 흐름</h2>
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {step.num} {step.title}
                </h3>
                <p className="text-gray-700">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 상담에 대해 */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">상담에 대해</h2>
          <p className="text-lg text-gray-800">
            💡 <strong>아이를 '문제'로 보지 않습니다.</strong><br />
            아이의 속도를 먼저 이해합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

