import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          대전 유아 · 초등 연계 개인 미술 수업
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
          5살부터 시작해<br />
          초등, 중·고등까지 함께 성장해온<br />
          미술 선생님의 개인 수업입니다.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Link
            href="/counseling"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            그림 상담 받아보기
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/consultation"
            className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            미술 수업 상담 신청
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* 신뢰 섹션 */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">신뢰</h3>
          <div className="space-y-4 text-lg text-gray-700 mb-6">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span>5살부터 고등학생까지 지속 수업</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span>중학생 진로·심리 상담 35건 이상</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span>하워드 가드너 지문 상담 100건 이상</span>
            </div>
          </div>
          <p className="font-bold text-gray-700 text-lg">
            📌 아이를 오래 만나온 경험이 가장 큰 기준입니다.
          </p>
        </div>
      </section>

      {/* 차별점 섹션 */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            이 수업이 다른 이유
          </h3>
          
          <div className="bg-white p-8 rounded-lg border-l-4 border-blue-500 shadow-md">
            <h4 className="text-2xl font-bold text-gray-800 mb-6">
              아이에게 "왜 이렇게 그렸어?"라고 묻지 않습니다
            </h4>
            <ul className="space-y-4 text-lg text-gray-700 mb-6">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>그림을 평가하지 않습니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>아이가 말할 준비가 될 때까지 기다립니다</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>그림 → 대화 → 수업으로 자연스럽게 이어갑니다</span>
              </li>
            </ul>
            <p className="text-gray-600 italic text-lg">
              아이의 그림은 결과가 아니라 이야기의 시작입니다.
            </p>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            우리 아이에게 맞는 방식인지
          </h3>
          <h3 className="text-2xl md:text-3xl font-bold mb-8">
            그림 상담으로 먼저 확인해보세요.
          </h3>
          <Link
            href="/counseling"
            className="inline-block bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors"
          >
            그림 상담 탭으로 이동
          </Link>
        </div>
      </section>
    </div>
  );
}

