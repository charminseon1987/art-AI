import Link from "next/link";
import { ArrowRight, Users, Clock, MapPin } from "lucide-react";

export default function ClassPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤드라인 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            초등 저학년을 위한
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-600">
            부담 없는 1:1 개인 미술 수업
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* 수업 대상 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              수업 대상
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span><strong>5세 ~ 초등 저학년</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>그림을 좋아하지만 말이 적은 아이</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>감정 표현이 서툰 아이</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>집중 시간이 짧은 아이</span>
              </li>
            </ul>
          </div>

          {/* 수업 방식 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              수업 방식
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>정해진 답 없는 미술 활동</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>아이 속도에 맞춘 진행</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>대화는 자연스럽게, 강요하지 않음</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>필요 시 보호자 피드백 제공</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 핵심 메시지 */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
          <p className="text-lg text-gray-800">
            💡 <strong>아이가 "그리기 싫다"고 말해도</strong><br />
            수업은 그 지점에서 시작합니다.
          </p>
        </div>

        {/* 수업 장소 */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            수업 장소
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>대전 ○○동 (상담 시 상세 안내)</li>
            <li>개인 수업 / 소그룹 가능</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
          >
            상담 신청하기
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

