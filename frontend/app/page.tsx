"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles, Heart, Users } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { use3DMouse } from "@/hooks/use3DMouse";

export default function Home() {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    trust: false,
    difference: false,
    cta: false,
  });

  const heroSectionRef = useRef<HTMLElement>(null);
  const mousePosition = use3DMouse({
    elementRef: heroSectionRef,
    intensity: 1,
  });

  useEffect(() => {
    // Hero 섹션은 즉시 표시
    setTimeout(() => setIsVisible((prev) => ({ ...prev, hero: true })), 100);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute("data-section");
            if (section) {
              setIsVisible((prev) => ({ ...prev, [section]: true }));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    // 각 섹션 관찰
    document.querySelectorAll("[data-section]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // 3D transform 계산
  const heroTransform = {
    transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
  };

  const blob1Transform = {
    transform: `translate3d(${mousePosition.x * 30}px, ${mousePosition.y * 30}px, ${mousePosition.y * -50}px)`,
  };

  const blob2Transform = {
    transform: `translate3d(${mousePosition.x * -25}px, ${mousePosition.y * -25}px, ${mousePosition.x * 50}px)`,
  };

  const blob3Transform = {
    transform: `translate3d(${mousePosition.x * 20}px, ${mousePosition.y * 20}px, ${mousePosition.y * 40}px)`,
  };

  const titleTransform = {
    transform: `perspective(1000px) rotateX(${mousePosition.y * 3}deg) rotateY(${mousePosition.x * 3}deg) translateZ(20px)`,
  };

  const buttonTransform1 = {
    transform: `perspective(1000px) rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 2}deg) translateZ(10px)`,
  };

  const buttonTransform2 = {
    transform: `perspective(1000px) rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 2}deg) translateZ(10px)`,
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroSectionRef}
        className="relative text-center py-20 px-4 bg-gradient-to-b from-blue-50 via-cyan-50 to-white overflow-hidden hero-3d-container"
        style={heroTransform}
      >
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
            style={blob1Transform}
          ></div>
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"
            style={blob2Transform}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
            style={blob3Transform}
          ></div>
        </div>

        <div
          className={`relative z-10 transition-all duration-1000 ${
            isVisible.hero
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6 animate-bounce-slow">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">5살부터 시작하는 평생 미술 여정</span>
          </div>

          <h1
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight"
            style={titleTransform}
          >
            유아 · 초등 연계
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
              개인 미술 수업
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            <span className="font-semibold text-blue-600">5살</span>부터 시작해
            <br />
            초등, 중·고등까지 함께 성장해온
            <br />
            <span className="font-semibold">미술 선생님의 개인 수업</span>입니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link
              href="/counseling"
              className="group bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105 transform"
              style={buttonTransform1}
            >
              그림 상담 받아보기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/consultation"
              className="group bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105 transform"
              style={buttonTransform2}
            >
              미술 수업 상담 신청
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 웨이브 디바이더 */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* 신뢰 섹션 */}
      <section
        className="py-16 px-4 bg-white relative"
        data-section="trust"
      >
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible.trust
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-blue-500" />
              <h3 className="text-3xl font-bold text-gray-800">신뢰</h3>
              <Heart className="w-6 h-6 text-blue-500" />
            </div>
            <p className="text-gray-600 text-lg">
              오랜 시간 함께한 경험이 가장 큰 자산입니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* 카드 1 */}
            <div
              className={`group bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100 ${
                isVisible.trust
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">
                지속 수업 연수
              </div>
              <p className="text-gray-600">
                5살부터 고등학생까지
                <br />
                함께 성장하는 여정
              </p>
            </div>

            {/* 카드 2 */}
            <div
              className={`group bg-gradient-to-br from-cyan-50 to-indigo-50 p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-cyan-100 ${
                isVisible.trust
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="bg-cyan-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-cyan-600 mb-2">35+</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">
                진로·심리 상담
              </div>
              <p className="text-gray-600">
                중학생 대상
                <br />
                깊이 있는 상담 경험
              </p>
            </div>

            {/* 카드 3 */}
            <div
              className={`group bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-indigo-100 ${
                isVisible.trust
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">100+</div>
              <div className="text-lg font-semibold text-gray-800 mb-2">
                지문 상담 건수
              </div>
              <p className="text-gray-600">
                하워드 가드너 지문분석
                <br />
                전문 상담 경험
              </p>
            </div>
          </div>

          <div
            className={`text-center bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-2xl shadow-xl transition-all duration-1000 ${
              isVisible.trust
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <p className="text-xl font-bold">
              📌 아이를 오래 만나온 경험이 가장 큰 기준입니다.
            </p>
          </div>
        </div>
      </section>

      {/* 차별점 섹션 */}
      <section
        className="py-16 px-4 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 relative"
        data-section="difference"
      >
        <div className="max-w-4xl mx-auto">
          <h3
            className={`text-4xl font-bold text-gray-800 mb-12 text-center transition-all duration-1000 ${
              isVisible.difference
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            이 수업이 <span className="text-blue-600">다른 이유</span>
          </h3>

          <div
            className={`group bg-white p-10 rounded-3xl border-l-8 border-blue-500 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] ${
              isVisible.difference
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight flex-1">
                아이에게 <span className="text-blue-600">"왜 이렇게 그렸어?"</span>
                <br className="hidden md:block" />
                라고 묻지 않습니다
              </h4>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">🎨</div>
                <h5 className="font-bold text-gray-800 mb-2 text-lg">평가하지 않습니다</h5>
                <p className="text-gray-600 text-sm">
                  그림은 정답이 없는 자유로운 표현입니다
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border border-cyan-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">⏰</div>
                <h5 className="font-bold text-gray-800 mb-2 text-lg">기다립니다</h5>
                <p className="text-gray-600 text-sm">
                  아이가 말할 준비가 될 때까지 기다립니다
                </p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-6 rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">💬</div>
                <h5 className="font-bold text-gray-800 mb-2 text-lg">자연스럽게</h5>
                <p className="text-gray-600 text-sm">
                  그림 → 대화 → 수업으로 이어집니다
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-xl">
              <p className="text-white text-xl font-semibold text-center italic">
                "아이의 그림은 결과가 아니라 이야기의 시작입니다"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section
        className="py-20 px-4 bg-gradient-to-r from-blue-500 via-cyan-600 to-indigo-600 text-white relative overflow-hidden"
        data-section="cta"
      >
        {/* 배경 장식 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        </div>

        <div
          className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-1000 ${
            isVisible.cta
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <Sparkles className="w-12 h-12 mx-auto mb-6 animate-pulse" />
          <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            우리 아이에게 맞는 방식인지
          </h3>
          <h3 className="text-3xl md:text-4xl font-bold mb-10 leading-tight">
            그림 상담으로 먼저 확인해보세요.
          </h3>
          <Link
            href="/counseling"
            className="inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-gray-100 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
          >
            <Sparkles className="w-6 h-6" />
            그림 상담 탭으로 이동
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }

        .hero-3d-container {
          perspective: 1000px;
          transform-style: preserve-3d;
          transition: transform 0.1s ease-out;
        }

        .hero-3d-container > * {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
