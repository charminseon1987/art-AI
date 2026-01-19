"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles, Heart, Users, Image as ImageIcon, Scan, Palette, Pencil, Paintbrush, Palette as PaletteIcon, Scissors } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getPageContent } from "@/lib/api";

export default function Home() {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    trust: false,
    difference: false,
    cta: false,
    artAi: false,
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [artAiOpacity, setArtAiOpacity] = useState(0);
  const artAiSectionRef = useRef<HTMLDivElement>(null);
  const [cmsContent, setCmsContent] = useState<Record<string, string>>({});
  const [loadingContent, setLoadingContent] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const artToolsRef = useRef<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [randomValues, setRandomValues] = useState<{
    glassPieces: Array<{ width: number; height: number; left: number; top: number; background: number; transform: number; duration: number }>;
    stars: Array<{ width: number; height: number; left: number; top: number; background: number; duration: number; delay: number }>;
    particles: Array<{ left: number; top: number; background: number; duration: number; delay: number }>;
    pictureElements: Array<{ bounceDuration: number; bounceDelay: number }>;
  } | null>(null);

  useEffect(() => {
    // CMS 콘텐츠 로드
    const loadContent = async () => {
      try {
        const data = await getPageContent("/", "ko");
        if (data.success) {
          setCmsContent(data.contents || {});
        }
      } catch (error) {
        console.error("CMS 콘텐츠 로드 오류:", error);
        // 오류 발생 시 기본값 사용
      } finally {
        setLoadingContent(false);
      }
    };

    loadContent();

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

  // 마우스 위치 추적 (섹션 기준)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (artAiSectionRef.current) {
        const rect = artAiSectionRef.current.getBoundingClientRect();
        setMousePosition({ 
          x: e.clientX - rect.left, 
          y: e.clientY - rect.top 
        });
      } else {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 랜덤 값 생성 (클라이언트에서만)
  useEffect(() => {
    // 작은 유리 조각들 랜덤 값
    const glassPieces = Array.from({ length: 6 }, () => ({
      width: 40 + Math.random() * 30,
      height: 40 + Math.random() * 30,
      left: 10 + (Math.floor(Math.random() * 3) * 30),
      top: 20 + (Math.floor(Math.random() * 2) * 30),
      background: 0.2 + Math.random() * 0.2,
      transform: Math.random() * 360,
      duration: 5 + Math.random() * 3,
    }));

    // 별들 랜덤 값
    const stars = Array.from({ length: 30 }, () => ({
      width: 2 + Math.random() * 3,
      height: 2 + Math.random() * 3,
      left: Math.random() * 100,
      top: Math.random() * 100,
      background: 0.4 + Math.random() * 0.4,
      duration: 1.5 + Math.random() * 2,
      delay: Math.random() * 2,
    }));

    // 마법 파티클 랜덤 값
    const particles = Array.from({ length: 15 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      background: Math.random(),
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 2,
    }));

    // 그림 요소들 랜덤 값
    const pictureElements = [
      { bounceDuration: 2 + Math.random(), bounceDelay: Math.random() },
      { bounceDuration: 2.5 + Math.random(), bounceDelay: Math.random() },
      { bounceDuration: 2.2 + Math.random(), bounceDelay: Math.random() },
      { bounceDuration: 2.8 + Math.random(), bounceDelay: Math.random() },
    ];

    setRandomValues({
      glassPieces,
      stars,
      particles,
      pictureElements,
    });
  }, []);

  // 미술도구 초기 위치 설정
  useEffect(() => {
    if (artAiSectionRef.current) {
      const tools = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        delay: i * 0.1,
      }));
      artToolsRef.current = tools;
    }
  }, []);

  // 스크롤 애니메이션 효과
  useEffect(() => {
    const handleScroll = () => {
      if (!artAiSectionRef.current) return;

      const rect = artAiSectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionTop = rect.top;
      const sectionHeight = rect.height;

      // 섹션이 뷰포트에 들어오기 시작할 때
      if (sectionTop < windowHeight && sectionTop > -sectionHeight) {
        // 스크롤 진행도 계산 (0 ~ 1)
        // 섹션이 화면 중앙에 올 때 0.5가 되도록 조정
        const normalizedTop = Math.max(0, windowHeight - sectionTop);
        const progress = Math.min(1, Math.max(0, normalizedTop / (windowHeight + sectionHeight * 0.5)));
        setScrollProgress(progress);

        // 텍스트 opacity 계산 (스크롤에 따라 점진적으로 나타남)
        const opacity = Math.min(1, Math.max(0, (windowHeight - sectionTop) / (windowHeight * 0.8)));
        setArtAiOpacity(opacity);
        setIsVisible((prev) => ({ ...prev, artAi: opacity > 0.1 }));
      } else if (sectionTop > windowHeight) {
        // 섹션 위에 있을 때
        setScrollProgress(0);
        setArtAiOpacity(0);
      } else {
        // 섹션 아래에 있을 때
        setScrollProgress(1);
        setArtAiOpacity(1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // 초기 실행

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // CMS 콘텐츠가 있으면 사용, 없으면 기본값 사용
  const getContent = (key: string, defaultValue: string): string => {
    return cmsContent[key] || defaultValue;
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative text-center py-20 px-4 bg-gradient-to-b from-pink-50 via-rose-50 to-white overflow-hidden">
        {/* 배경 장식 요소 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div
          className={`relative z-10 transition-all duration-1000 ${
            isVisible.hero
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full mb-6 animate-bounce-slow">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {getContent("hero_badge", "5살부터 시작하는 평생 미술 여정")}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            {getContent("hero_title_line1", "유아 · 초등 연계")}
            <br />
            <span className="bg-gradient-to-r from-pink-500 to-fuchsia-600 bg-clip-text text-transparent">
              {getContent("hero_title_line2", "개인 미술 수업")}
            </span>
          </h1>

          <p
            className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
            dangerouslySetInnerHTML={{
              __html: getContent(
                "hero_description",
                `<span class="font-semibold text-pink-600">5살</span>부터 시작해<br />초등, 중·고등까지 함께 성장해온<br /><span class="font-semibold">미술 선생님의 개인 수업</span>입니다.`
              ),
            }}
          />

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link
              href="/counseling"
              className="group bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105 transform"
            >
              그림 상담 받아보기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/consultation"
              className="group bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:scale-105 transform"
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

      {/* Art | AI 스크롤 애니메이션 섹션 - 캐릭터가 그림 분석하는 스토리 */}
      <section
        ref={artAiSectionRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        data-section="artAi"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 182, 193, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 105, 180, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(147, 112, 219, 0.1) 0%, transparent 70%),
            linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 240, 245, 0.8) 100%)
          `,
        }}
      >
        {/* 애플 스타일 유리효과 배경 - 강화 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* 큰 유리 패널들 - 네모 형태 */}
          <div 
            className="absolute top-20 left-10 w-72 h-72 rounded-lg backdrop-blur-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 182, 193, 0.4) 50%, rgba(255, 255, 255, 0.3) 100%)",
              border: "2px solid rgba(255, 255, 255, 0.7)",
              boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.9), inset 0 -2px 0 rgba(255, 255, 255, 0.3)",
              transform: `rotate(${-5 + Math.sin(scrollProgress * Math.PI * 2) * 3}deg) translate(${Math.cos(scrollProgress * Math.PI) * 10}px, ${Math.sin(scrollProgress * Math.PI) * 10}px)`,
              opacity: artAiOpacity * 0.8,
              animationName: "glassFloat",
              animationDuration: "6s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/60 via-white/20 to-transparent" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/10 to-white/40" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60" viewBox="0 0 288 288">
              {/* 가족 그림 - 그림상담에 적합 */}
              <circle cx="144" cy="100" r="20" fill="#FFB6C1" opacity="0.8" />
              <circle cx="120" cy="100" r="18" fill="#FFB6C1" opacity="0.8" />
              <circle cx="168" cy="100" r="18" fill="#FFB6C1" opacity="0.8" />
              <rect x="100" y="120" width="88" height="60" fill="#87CEEB" opacity="0.6" />
              <circle cx="120" cy="140" r="6" fill="#333" opacity="0.7" />
              <circle cx="144" cy="140" r="6" fill="#333" opacity="0.7" />
              <circle cx="168" cy="140" r="6" fill="#333" opacity="0.7" />
              <path d="M 110 150 Q 120 155 130 150" stroke="#333" strokeWidth="2" fill="none" opacity="0.7" />
              <path d="M 134 150 Q 144 155 154 150" stroke="#333" strokeWidth="2" fill="none" opacity="0.7" />
              <path d="M 158 150 Q 168 155 178 150" stroke="#333" strokeWidth="2" fill="none" opacity="0.7" />
            </svg>
          </div>
          <div 
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full backdrop-blur-2xl"
            style={{
              background: "linear-gradient(225deg, rgba(255, 255, 255, 0.55) 0%, rgba(240, 248, 255, 0.4) 50%, rgba(255, 255, 255, 0.3) 100%)",
              border: "2px solid rgba(255, 255, 255, 0.7)",
              boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.9), inset 0 -2px 0 rgba(255, 255, 255, 0.3)",
              transform: `rotate(${8 + Math.cos(scrollProgress * Math.PI * 2) * 3}deg) translate(${-Math.sin(scrollProgress * Math.PI) * 15}px, ${-Math.cos(scrollProgress * Math.PI) * 15}px)`,
              opacity: artAiOpacity * 0.75,
              animationName: "glassFloat",
              animationDuration: "8s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: "1s",
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 via-white/20 to-transparent" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/40" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" viewBox="0 0 384 384">
              {/* 동물 그림 - 그림상담에 적합 */}
              <circle cx="192" cy="140" r="35" fill="#FFB6C1" opacity="0.8" />
              <circle cx="175" cy="130" r="8" fill="#333" opacity="0.7" />
              <circle cx="209" cy="130" r="8" fill="#333" opacity="0.7" />
              <ellipse cx="192" cy="145" rx="12" ry="8" fill="#FF69B4" opacity="0.6" />
              <ellipse cx="165" cy="160" rx="15" ry="20" fill="#FFB6C1" opacity="0.8" />
              <ellipse cx="219" cy="160" rx="15" ry="20" fill="#FFB6C1" opacity="0.8" />
              <path d="M 192 180 Q 180 200 192 220 Q 204 200 192 180" fill="#FFB6C1" opacity="0.8" />
              <circle cx="150" cy="200" r="8" fill="#FFB6C1" opacity="0.8" />
              <circle cx="234" cy="200" r="8" fill="#FFB6C1" opacity="0.8" />
            </svg>
          </div>
          <div 
            className="absolute top-1/2 left-1/4 w-56 h-56 backdrop-blur-2xl transform -translate-y-1/2"
            style={{
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            }}
            style={{
              background: "linear-gradient(45deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 182, 193, 0.3) 50%, rgba(255, 255, 255, 0.2) 100%)",
              border: "2px solid rgba(255, 255, 255, 0.6)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12), inset 0 2px 0 rgba(255, 255, 255, 0.8), inset 0 -2px 0 rgba(255, 255, 255, 0.3)",
              transform: `translateY(-50%) rotate(${-12 + Math.sin(scrollProgress * Math.PI * 3) * 5}deg)`,
              opacity: artAiOpacity * 0.7,
              animationName: "glassFloat",
              animationDuration: "7s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: "0.5s",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/15 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/30" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-55" viewBox="0 0 224 224">
              {/* 꽃 그림 - 그림상담에 적합 */}
              <circle cx="112" cy="120" r="8" fill="#FF69B4" opacity="0.9" />
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                return (
                  <ellipse
                    key={i}
                    cx={112 + Math.cos(angle) * 20}
                    cy={120 + Math.sin(angle) * 20}
                    rx="8"
                    ry="12"
                    fill="#FFB6C1"
                    opacity="0.8"
                    transform={`rotate(${angle * 180 / Math.PI} ${112 + Math.cos(angle) * 20} ${120 + Math.sin(angle) * 20})`}
                  />
                );
              })}
              <rect x="108" y="120" width="8" height="40" fill="#90EE90" opacity="0.7" />
              <ellipse cx="112" cy="160" rx="12" ry="6" fill="#90EE90" opacity="0.6" />
            </svg>
          </div>
          <div 
            className="absolute top-1/3 right-1/4 w-64 h-64 rounded-lg backdrop-blur-2xl"
            style={{
              background: "linear-gradient(315deg, rgba(255, 255, 255, 0.6) 0%, rgba(147, 112, 219, 0.3) 50%, rgba(255, 255, 255, 0.2) 100%)",
              border: "2px solid rgba(255, 255, 255, 0.7)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.12), inset 0 2px 0 rgba(255, 255, 255, 0.9), inset 0 -2px 0 rgba(255, 255, 255, 0.3)",
              transform: `rotate(${15 + Math.cos(scrollProgress * Math.PI * 2.5) * 4}deg)`,
              opacity: artAiOpacity * 0.75,
              animationName: "glassFloat",
              animationDuration: "9s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: "1.5s",
            }}
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/50 via-white/20 to-transparent" />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/10 to-white/40" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" viewBox="0 0 256 256">
              {/* 하트와 별 그림 - 그림상담에 적합 */}
              <path d="M 128 100 C 110 80, 80 80, 80 100 C 80 120, 128 160, 128 160 C 128 160, 176 120, 176 100 C 176 80, 146 80, 128 100 Z" fill="#FF69B4" opacity="0.8" />
              <path d="M 60 60 L 70 50 L 80 60 L 70 70 Z" fill="#FFD700" opacity="0.8" />
              <path d="M 176 60 L 186 50 L 196 60 L 186 70 Z" fill="#FFD700" opacity="0.8" />
              <path d="M 128 40 L 133 30 L 138 40 L 133 50 Z" fill="#FFD700" opacity="0.8" />
            </svg>
          </div>
          
          {/* 추가 중간 크기 유리 패널들 - 동그라미 */}
          <div 
            className="absolute top-10 right-1/3 w-52 h-52 rounded-full backdrop-blur-xl"
            style={{
              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(252, 186, 211, 0.3) 100%)",
              border: "1.5px solid rgba(255, 255, 255, 0.6)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              transform: `rotate(${20 + Math.sin(scrollProgress * Math.PI * 1.5) * 4}deg)`,
              opacity: artAiOpacity * 0.65,
              animationName: "glassFloat",
              animationDuration: "7.5s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: "0.8s",
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 to-transparent" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" viewBox="0 0 208 208">
              {/* 사람 그림 - 그림상담에 적합 */}
              <circle cx="104" cy="60" r="20" fill="#FFE4E1" opacity="0.9" />
              <circle cx="96" cy="58" r="3" fill="#333" opacity="0.8" />
              <circle cx="112" cy="58" r="3" fill="#333" opacity="0.8" />
              <path d="M 96 65 Q 104 68 112 65" stroke="#333" strokeWidth="2" fill="none" opacity="0.7" />
              <rect x="94" y="80" width="20" height="40" fill="#87CEEB" opacity="0.7" />
              <rect x="84" y="85" width="10" height="30" fill="#87CEEB" opacity="0.7" />
              <rect x="114" y="85" width="10" height="30" fill="#87CEEB" opacity="0.7" />
              <rect x="99" y="120" width="10" height="25" fill="#8B4513" opacity="0.7" />
              <rect x="89" y="120" width="10" height="25" fill="#8B4513" opacity="0.7" />
            </svg>
          </div>
          <div 
            className="absolute bottom-1/4 left-1/3 w-48 h-48 backdrop-blur-xl"
            style={{
              clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            }}
            style={{
              background: "linear-gradient(0deg, rgba(255, 255, 255, 0.45) 0%, rgba(170, 150, 218, 0.3) 100%)",
              border: "1.5px solid rgba(255, 255, 255, 0.6)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
              transform: `rotate(${-18 + Math.cos(scrollProgress * Math.PI * 2) * 3}deg)`,
              opacity: artAiOpacity * 0.6,
              animationName: "glassFloat",
              animationDuration: "8.5s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: "1.2s",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50" viewBox="0 0 192 192">
              {/* 나비 그림 - 그림상담에 적합 */}
              <ellipse cx="96" cy="100" rx="25" ry="15" fill="#FFB6C1" opacity="0.8" />
              <ellipse cx="80" cy="95" rx="15" ry="20" fill="#FF69B4" opacity="0.7" />
              <ellipse cx="112" cy="95" rx="15" ry="20" fill="#FF69B4" opacity="0.7" />
              <ellipse cx="70" cy="100" rx="12" ry="18" fill="#FFB6C1" opacity="0.6" />
              <ellipse cx="122" cy="100" rx="12" ry="18" fill="#FFB6C1" opacity="0.6" />
              <line x1="96" y1="100" x2="96" y2="120" stroke="#8B4513" strokeWidth="2" opacity="0.7" />
              <circle cx="96" cy="120" r="3" fill="#333" opacity="0.7" />
            </svg>
          </div>
          
          {/* 추가 작은 유리 조각들 - 다양한 형태 */}
          {randomValues?.glassPieces.map((piece, i) => {
            const shapes = ['rounded-full', 'rounded-lg', ''];
            const shapeClass = shapes[i % 3];
            const isTriangle = i % 3 === 2;
            return (
            <div
              key={i}
              className={`absolute backdrop-blur-xl ${shapeClass}`}
              style={isTriangle ? {
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              } : {}}
              style={{
                width: `${piece.width}px`,
                height: `${piece.height}px`,
                left: `${piece.left}%`,
                top: `${piece.top}%`,
                background: `linear-gradient(135deg, rgba(255, 255, 255, ${piece.background + 0.1}) 0%, rgba(255, 255, 255, ${piece.background * 0.5}) 100%)`,
                border: "1.5px solid rgba(255, 255, 255, 0.5)",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
                transform: `rotate(${piece.transform}deg)`,
                opacity: artAiOpacity * 0.4,
                animationName: "glassFloat",
                animationDuration: `${piece.duration}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/30 to-transparent ${isTriangle ? '' : 'rounded-xl'}`} style={isTriangle ? {} : {}} />
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100">
                {i % 4 === 0 && (
                  <>
                    {/* 별 그림 */}
                    <path d="M 50 20 L 52 35 L 67 35 L 55 45 L 60 60 L 50 50 L 40 60 L 45 45 L 33 35 L 48 35 Z" fill="#FFD700" opacity="0.8" />
                  </>
                )}
                {i % 4 === 1 && (
                  <>
                    {/* 하트 그림 */}
                    <path d="M 50 40 C 40 30, 25 30, 25 40 C 25 50, 50 70, 50 70 C 50 70, 75 50, 75 40 C 75 30, 60 30, 50 40 Z" fill="#FF69B4" opacity="0.7" />
                  </>
                )}
                {i % 4 === 2 && (
                  <>
                    {/* 작은 사람 */}
                    <circle cx="50" cy="30" r="8" fill="#FFE4E1" opacity="0.8" />
                    <rect x="46" y="38" width="8" height="15" fill="#87CEEB" opacity="0.6" />
                    <rect x="42" y="40" width="4" height="12" fill="#87CEEB" opacity="0.6" />
                    <rect x="54" y="40" width="4" height="12" fill="#87CEEB" opacity="0.6" />
                  </>
                )}
                {i % 4 === 3 && (
                  <>
                    {/* 작은 꽃 */}
                    <circle cx="50" cy="50" r="4" fill="#FF69B4" opacity="0.8" />
                    {[...Array(5)].map((_, j) => {
                      const angle = (j / 5) * Math.PI * 2;
                      return (
                        <ellipse
                          key={j}
                          cx={50 + Math.cos(angle) * 8}
                          cy={50 + Math.sin(angle) * 8}
                          rx="3"
                          ry="6"
                          fill="#FFB6C1"
                          opacity="0.7"
                        />
                      );
                    })}
                  </>
                )}
              </svg>
            </div>
            );
          })}
        </div>

        {/* 배경 별들 - 더 많고 화려하게 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {randomValues?.stars.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${star.width}px`,
                height: `${star.height}px`,
                left: `${star.left}%`,
                top: `${star.top}%`,
                background: `radial-gradient(circle, rgba(255, 182, 193, ${star.background}) 0%, transparent 70%)`,
                animationName: "twinkle",
                animationDuration: `${star.duration}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>

        {/* 배경 마법 파티클 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {scrollProgress > 0.1 && randomValues?.particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                background: `radial-gradient(circle, rgba(255, 105, 180, ${0.6 * scrollProgress * particle.background}) 0%, transparent 70%)`,
                animationName: "magicFloat",
                animationDuration: `${particle.duration}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${particle.delay}s`,
                opacity: scrollProgress * 0.7,
              }}
            />
          ))}
        </div>

        {/* 마우스를 따라다니는 미술도구들 - 그림을 그리는 효과 */}
        {artAiOpacity > 0.1 && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
            {[
              { icon: Pencil, color: "#FF6B6B", size: 24, trail: "#FF6B6B" },
              { icon: Paintbrush, color: "#4ECDC4", size: 24, trail: "#4ECDC4" },
              { icon: PaletteIcon, color: "#FFE66D", size: 24, trail: "#FFE66D" },
              { icon: Scissors, color: "#95E1D3", size: 20, trail: "#95E1D3" },
              { icon: Pencil, color: "#F38181", size: 22, trail: "#F38181" },
              { icon: Paintbrush, color: "#AA96DA", size: 24, trail: "#AA96DA" },
              { icon: PaletteIcon, color: "#FCBAD3", size: 26, trail: "#FCBAD3" },
              { icon: Scissors, color: "#FFD93D", size: 20, trail: "#FFD93D" },
            ].map((tool, index) => {
              const Icon = tool.icon;
              const delay = index * 0.1;
              const offsetX = (Math.cos(index * Math.PI / 4) * 100);
              const offsetY = (Math.sin(index * Math.PI / 4) * 100);
              
              return (
                <div key={index}>
                  {/* 그림을 그리는 궤적 효과 */}
                  <svg
                    className="absolute pointer-events-none"
                    style={{
                      left: `${mousePosition.x + offsetX - 50}px`,
                      top: `${mousePosition.y + offsetY - 50}px`,
                      width: "100px",
                      height: "100px",
                      opacity: artAiOpacity * 0.4,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <path
                      d={`M 50 50 Q ${50 + Math.sin(index) * 20} ${50 + Math.cos(index) * 20} ${50 + Math.sin(index * 2) * 30} ${50 + Math.cos(index * 2) * 30}`}
                      stroke={tool.trail}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      opacity="0.6"
                      style={{
                        animationName: "drawPath",
                        animationDuration: `${2 + index * 0.3}s`,
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                        filter: "blur(1px)",
                      }}
                    />
                  </svg>
                  
                  {/* 미술도구 */}
                  <div
                    className="absolute"
                    style={{
                      left: `${mousePosition.x + offsetX}px`,
                      top: `${mousePosition.y + offsetY}px`,
                      transform: `translate(-50%, -50%) rotate(${Math.sin(Date.now() / 1000 + index) * 20}deg)`,
                      opacity: artAiOpacity * 0.9,
                      transition: `left 0.3s ease-out ${delay}s, top 0.3s ease-out ${delay}s`,
                      filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))",
                    }}
                  >
                    <div
                      className="rounded-full backdrop-blur-xl p-3 relative"
                      style={{
                        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)`,
                        border: `2px solid rgba(255, 255, 255, 0.9)`,
                        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.15), 0 0 20px ${tool.color}40`,
                        animationName: "toolFloat",
                        animationDuration: `${2 + index * 0.2}s`,
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                        animationDelay: `${delay}s`,
                      }}
                    >
                      {/* 빛나는 효과 */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${tool.color}30 0%, transparent 70%)`,
                          animationName: "toolGlow",
                          animationDuration: `${2 + index * 0.2}s`,
                          animationTimingFunction: "ease-in-out",
                          animationIterationCount: "infinite",
                          animationDelay: `${delay}s`,
                        }}
                      />
                      <Icon 
                        size={tool.size} 
                        color={tool.color}
                        className="relative z-10"
                        style={{
                          animationName: "toolRotate",
                          animationDuration: `${3 + index * 0.3}s`,
                          animationTimingFunction: "ease-in-out",
                          animationIterationCount: "infinite",
                          animationDelay: `${delay}s`,
                          filter: `drop-shadow(0 2px 4px ${tool.color}60)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 색상이 흐르는 효과 */}
        {artAiOpacity > 0.2 && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
            <div
              className="absolute w-full h-full"
              style={{
                background: `
                  linear-gradient(${scrollProgress * 360}deg, 
                    rgba(255, 107, 107, ${0.1 * scrollProgress}) 0%,
                    rgba(78, 205, 196, ${0.1 * scrollProgress}) 25%,
                    rgba(255, 230, 109, ${0.1 * scrollProgress}) 50%,
                    rgba(170, 150, 218, ${0.1 * scrollProgress}) 75%,
                    rgba(252, 186, 211, ${0.1 * scrollProgress}) 100%
                  )
                `,
                animationName: "colorFlow",
                animationDuration: "8s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                opacity: artAiOpacity * 0.6,
                mixBlendMode: "multiply",
              }}
            />
          </div>
        )}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
          {/* 메인 컨테이너 */}
          <div className="relative flex items-center justify-center min-h-[80vh]">
            {/* 그림 종이 - 화면 가운데 */}
            <div
              className="relative z-10 transform transition-all duration-1000 ease-out"
              style={{
                opacity: artAiOpacity,
                transform: `scale(${0.8 + artAiOpacity * 0.2}) translateY(${(1 - artAiOpacity) * 50}px) rotate(${Math.sin(scrollProgress * Math.PI * 2) * 2}deg)`,
              }}
            >
              <div className="relative w-64 md:w-80 lg:w-96 h-80 md:h-96 lg:h-[28rem] bg-white rounded-lg shadow-2xl border-4 border-pink-200 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 group" style={{ zIndex: 10, position: "relative", overflow: "visible" }}>
                {/* 그림 종이 내부 - 아이 그림 스타일 */}
                <div className="absolute inset-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-md p-2 relative" style={{ zIndex: 1, position: "relative", overflow: "visible" }}>
                  {/* SVG로 그려지는 그림 효과 - 그림상담에 적합한 다양한 그림들 */}
                  {scrollProgress > 0.1 && scrollProgress < 0.2 && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ 
                      opacity: scrollProgress * 2,
                      transition: "opacity 0.5s ease-out"
                    }}>
                      {/* 가족 그림 */}
                      <circle
                        cx="60"
                        cy="50"
                        r={12 + scrollProgress * 2}
                        fill="#FFB6C1"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <circle
                        cx="45"
                        cy="50"
                        r={10 + scrollProgress * 2}
                        fill="#FFB6C1"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationDelay: "0.2s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <circle
                        cx="75"
                        cy="50"
                        r={10 + scrollProgress * 2}
                        fill="#FFB6C1"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationDelay: "0.4s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <rect
                        x="35"
                        y="62"
                        width="50"
                        height="35"
                        fill="#87CEEB"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationDelay: "0.6s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      
                      {/* 하트 그림 */}
                      <path
                        d="M 140 60 C 130 50, 115 50, 115 60 C 115 70, 140 90, 140 90 C 140 90, 165 70, 165 60 C 165 50, 150 50, 140 60 Z"
                        fill="#FF69B4"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationDelay: "0.8s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      
                      {/* 별 그림 */}
                      <path
                        d="M 200 50 L 202 58 L 210 58 L 204 63 L 206 71 L 200 66 L 194 71 L 196 63 L 190 58 L 198 58 Z"
                        fill="#FFD700"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationDelay: "1s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      
                      {/* 꽃 그림 */}
                      <circle
                        cx="50"
                        cy="120"
                        r={5 + scrollProgress}
                        fill="#FF69B4"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.8s",
                          animationDelay: "1.2s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      {[...Array(6)].map((_, i) => {
                        const angle = (i / 6) * Math.PI * 2;
                        return (
                          <ellipse
                            key={i}
                            cx={50 + Math.cos(angle) * 10}
                            cy={120 + Math.sin(angle) * 10}
                            rx="4"
                            ry="8"
                            fill="#FFB6C1"
                            opacity={scrollProgress}
                            style={{
                              animationName: "drawFill",
                              animationDuration: "0.8s",
                              animationDelay: `${1.2 + i * 0.1}s`,
                              animationTimingFunction: "ease-out",
                            }}
                          />
                        );
                      })}
                      <rect
                        x="48"
                        y="120"
                        width="4"
                        height="20"
                        fill="#90EE90"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.5s",
                          animationDelay: "1.8s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      
                      {/* 나비 그림 */}
                      <ellipse
                        cx="140"
                        cy="130"
                        rx={15 + scrollProgress * 2}
                        ry="8"
                        fill="#FFB6C1"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.8s",
                          animationDelay: "2s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <ellipse
                        cx="125"
                        cy="125"
                        rx="10"
                        ry="15"
                        fill="#FF69B4"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.8s",
                          animationDelay: "2.2s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <ellipse
                        cx="155"
                        cy="125"
                        rx="10"
                        ry="15"
                        fill="#FF69B4"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.8s",
                          animationDelay: "2.4s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <line
                        x1="140"
                        y1="130"
                        x2="140"
                        y2="150"
                        stroke="#8B4513"
                        strokeWidth="2"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.5s",
                          animationDelay: "2.6s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      
                      {/* 동물 그림 (강아지) */}
                      <circle
                        cx="200"
                        cy="130"
                        r={15 + scrollProgress * 2}
                        fill="#FFB6C1"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationDelay: "2.8s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <circle
                        cx="192"
                        cy="125"
                        r="4"
                        fill="#333"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.5s",
                          animationDelay: "3s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <circle
                        cx="208"
                        cy="125"
                        r="4"
                        fill="#333"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.5s",
                          animationDelay: "3.1s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <ellipse
                        cx="200"
                        cy="135"
                        rx="8"
                        ry="5"
                        fill="#FF69B4"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.5s",
                          animationDelay: "3.2s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <ellipse
                        cx="185"
                        cy="145"
                        rx="8"
                        ry="12"
                        fill="#FFB6C1"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.8s",
                          animationDelay: "3.4s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <ellipse
                        cx="215"
                        cy="145"
                        rx="8"
                        ry="12"
                        fill="#FFB6C1"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.8s",
                          animationDelay: "3.6s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      
                      {/* 집 그림 */}
                      <path
                        d="M 100 180 L 130 160 L 160 180 Z"
                        fill="#FF6B6B"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationDelay: "3.8s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <rect
                        x="105"
                        y="180"
                        width="50"
                        height="40"
                        fill="#87CEEB"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationDelay: "4s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <rect
                        x="120"
                        y="195"
                        width="15"
                        height="25"
                        fill="#8B4513"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.5s",
                          animationDelay: "4.2s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <rect
                        x="110"
                        y="185"
                        width="8"
                        height="8"
                        fill="#FFD700"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.5s",
                          animationDelay: "4.3s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <rect
                        x="142"
                        y="185"
                        width="8"
                        height="8"
                        fill="#FFD700"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.5s",
                          animationDelay: "4.4s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      
                      {/* 나무 그림 */}
                      <rect
                        x="180"
                        y="180"
                        width="12"
                        height="40"
                        fill="#8B4513"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "0.8s",
                          animationDelay: "4.6s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <circle
                        cx="186"
                        cy="175"
                        r={18 + scrollProgress * 2}
                        fill="#90EE90"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationDelay: "4.8s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <circle
                        cx="172"
                        cy="178"
                        r={15 + scrollProgress * 2}
                        fill="#90EE90"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationDelay: "5s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      <circle
                        cx="200"
                        cy="178"
                        r={15 + scrollProgress * 2}
                        fill="#90EE90"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill",
                          animationDuration: "1s",
                          animationDelay: "5.2s",
                          animationTimingFunction: "ease-out",
                        }}
                      />
                      
                      {/* 태양 그림 */}
                      <circle
                        cx="50"
                        cy="40"
                        r={12 + scrollProgress * 2}
                        fill="#FFD700"
                        opacity={scrollProgress}
                        style={{
                          animationName: "drawFill, sunPulse",
                          animationDuration: "1s, 2s",
                          animationTimingFunction: "ease-out, ease-in-out",
                          animationIterationCount: "1, infinite",
                          animationDelay: "5.4s, 0s",
                        }}
                      />
                      {[...Array(8)].map((_, i) => {
                        const angle = (i / 8) * Math.PI * 2;
                        return (
                          <line
                            key={i}
                            x1={50 + Math.cos(angle) * 15}
                            y1={40 + Math.sin(angle) * 15}
                            x2={50 + Math.cos(angle) * 22}
                            y2={40 + Math.sin(angle) * 22}
                            stroke="#FFA500"
                            strokeWidth="2"
                            opacity={scrollProgress}
                            style={{
                              animationName: "drawFill",
                              animationDuration: "0.5s",
                              animationDelay: `${5.5 + i * 0.05}s`,
                              animationTimingFunction: "ease-out",
                            }}
                          />
                        );
                      })}
                    </svg>
                  )}
                  
                  {/* 살아있는 그림 요소들 - 분석 결과가 나타나면 숨김 */}
                  {randomValues?.pictureElements && (
                    <>
                      <div 
                        className="absolute top-8 left-8 w-16 h-16 rounded-full opacity-80 z-0"
                        style={{
                          background: `radial-gradient(circle, #FFD700 0%, #FFA500 100%)`,
                          animationName: "bounceElement, colorShift",
                          animationDuration: `${randomValues.pictureElements[0].bounceDuration}s, 4s`,
                          animationTimingFunction: "ease-in-out, ease-in-out",
                          animationIterationCount: "infinite, infinite",
                          animationDelay: `${randomValues.pictureElements[0].bounceDelay}s, 0s`,
                          boxShadow: `0 4px 12px rgba(255, 215, 0, 0.5)`,
                          opacity: scrollProgress < 0.25 ? 0.8 : Math.max(0, 0.8 * (0.25 - (scrollProgress - 0.25)) / 0.25),
                          transition: "opacity 0.5s ease-out",
                        }}
                      >
                        {/* 내부 빛나는 효과 */}
                        <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping" style={{ animationDuration: "2s" }} />
                      </div>
                      <div 
                        className="absolute top-12 right-12 w-12 h-12 rounded-full opacity-80 z-0"
                        style={{
                          background: `radial-gradient(circle, #87CEEB 0%, #4682B4 100%)`,
                          animationName: "bounceElement, colorShift",
                          animationDuration: `${randomValues.pictureElements[1].bounceDuration}s, 4s`,
                          animationTimingFunction: "ease-in-out, ease-in-out",
                          animationIterationCount: "infinite, infinite",
                          animationDelay: `${randomValues.pictureElements[1].bounceDelay}s, 0.5s`,
                          boxShadow: `0 4px 12px rgba(135, 206, 235, 0.5)`,
                          opacity: scrollProgress < 0.25 ? 0.8 : Math.max(0, 0.8 * (0.25 - (scrollProgress - 0.25)) / 0.25),
                          transition: "opacity 0.5s ease-out",
                        }}
                      >
                        <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping" style={{ animationDuration: "2.5s" }} />
                      </div>
                      <div 
                        className="absolute bottom-16 left-12 w-20 h-20 rounded-full opacity-80 z-0"
                        style={{
                          background: `radial-gradient(circle, #90EE90 0%, #228B22 100%)`,
                          animationName: "bounceElement, colorShift",
                          animationDuration: `${randomValues.pictureElements[2].bounceDuration}s, 4s`,
                          animationTimingFunction: "ease-in-out, ease-in-out",
                          animationIterationCount: "infinite, infinite",
                          animationDelay: `${randomValues.pictureElements[2].bounceDelay}s, 1s`,
                          boxShadow: `0 4px 12px rgba(144, 238, 144, 0.5)`,
                          opacity: scrollProgress < 0.25 ? 0.8 : Math.max(0, 0.8 * (0.25 - (scrollProgress - 0.25)) / 0.25),
                          transition: "opacity 0.5s ease-out",
                        }}
                      >
                        <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping" style={{ animationDuration: "2.2s" }} />
                      </div>
                      <div 
                        className="absolute bottom-20 right-16 w-14 h-14 rounded-full opacity-80 z-0"
                        style={{
                          background: `radial-gradient(circle, #FF6B6B 0%, #DC143C 100%)`,
                          animationName: "bounceElement, colorShift",
                          animationDuration: `${randomValues.pictureElements[3].bounceDuration}s, 4s`,
                          animationTimingFunction: "ease-in-out, ease-in-out",
                          animationIterationCount: "infinite, infinite",
                          animationDelay: `${randomValues.pictureElements[3].bounceDelay}s, 1.5s`,
                          boxShadow: `0 4px 12px rgba(255, 107, 107, 0.5)`,
                          opacity: scrollProgress < 0.25 ? 0.8 : Math.max(0, 0.8 * (0.25 - (scrollProgress - 0.25)) / 0.25),
                          transition: "opacity 0.5s ease-out",
                        }}
                      >
                        <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping" style={{ animationDuration: "2.8s" }} />
                      </div>
                    </>
                  )}
                  
                  {/* 그림이 그려지는 듯한 파티클 */}
                  {scrollProgress > 0.2 && (
                    <div className="absolute inset-0 z-0" style={{
                      opacity: scrollProgress < 0.25 ? scrollProgress * 2 : Math.max(0, (0.25 - (scrollProgress - 0.25)) * 2),
                      transition: "opacity 0.5s ease-out"
                    }}>
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 rounded-full"
                          style={{
                            left: `${20 + (i % 5) * 15}%`,
                            top: `${30 + Math.floor(i / 5) * 20}%`,
                            background: [
                              "#FF6B6B", "#4ECDC4", "#FFE66D", "#AA96DA", "#FCBAD3"
                            ][i % 5],
                            opacity: scrollProgress * 0.8,
                            animationName: "paintDot",
                            animationDuration: `${1 + i * 0.1}s`,
                            animationTimingFunction: "ease-in-out",
                            animationIterationCount: "infinite",
                            animationDelay: `${i * 0.1}s`,
                            transform: `scale(${0.5 + scrollProgress * 0.5})`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* 분석 스캔 라인 효과 */}
                  {scrollProgress > 0.1 && scrollProgress < 0.25 && (
                    <div
                      className="absolute inset-0 rounded-md pointer-events-none overflow-hidden z-0"
                      style={{
                        opacity: scrollProgress * 0.8,
                      }}
                    >
                      <div
                        className="absolute w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent"
                        style={{
                          top: `${scrollProgress * 100}%`,
                          boxShadow: "0 0 20px rgba(255, 105, 180, 0.6)",
                          animationName: "scanLine",
                          animationDuration: "2s",
                          animationTimingFunction: "ease-in-out",
                          animationIterationCount: "infinite",
                        }}
                      />
                    </div>
                  )}
                  
                  {/* 분석 중 빛나는 효과 */}
                  {scrollProgress > 0.1 && scrollProgress < 0.25 && (
                    <div
                      className="absolute inset-0 rounded-md pointer-events-none z-0"
                      style={{
                        background: `radial-gradient(circle at ${scrollProgress * 100}% 50%, rgba(255, 192, 203, ${0.4 * scrollProgress}) 0%, transparent 60%)`,
                        animationName: "glow",
                        animationDuration: "2s",
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                      }}
                    />
                  )}
                  
                  {/* 분석 파티클 효과 */}
                  {scrollProgress > 0.1 && scrollProgress < 0.25 && (
                    <div className="absolute inset-0 overflow-hidden rounded-md pointer-events-none z-0">
                      {[...Array(12)].map((_, i) => {
                        const angle = (i / 12) * Math.PI * 2;
                        const radius = 30 + (scrollProgress * 40);
                        return (
                          <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                              left: `calc(50% + ${Math.cos(angle) * radius}%)`,
                              top: `calc(50% + ${Math.sin(angle) * radius}%)`,
                              background: `radial-gradient(circle, rgba(255, 105, 180, ${0.8 * scrollProgress}) 0%, transparent 70%)`,
                              opacity: scrollProgress > 0.2 ? 0.8 : 0,
                              animationName: "sparkle",
                              animationDuration: `${1 + i * 0.15}s`,
                              animationTimingFunction: "ease-in-out",
                              animationIterationCount: "infinite",
                              animationDelay: `${i * 0.1}s`,
                              transform: `translate(-50%, -50%) scale(${0.5 + scrollProgress * 0.5})`,
                            }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* 분석 결과 표시 - 네모 크기에 맞춰서, 점차적으로 나타남 */}
                  <div 
                    className="absolute inset-0 rounded-md overflow-y-auto"
                    style={{
                      opacity: scrollProgress > 0.15 ? 1 : (scrollProgress > 0.1 ? (scrollProgress - 0.1) * 20 : 0),
                      background: "rgba(255, 255, 255, 1)",
                      backdropFilter: "blur(10px)",
                      zIndex: 9999,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      transition: "opacity 0.3s ease-out",
                      transform: "translateY(0px) scale(1)",
                      pointerEvents: scrollProgress > 0.1 ? "auto" : "none",
                      border: "2px solid rgba(255, 182, 193, 0.5)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    <div className="p-4 space-y-3 text-xs relative" style={{ zIndex: 1001, position: "relative" }}>
                        {/* 감정 분석 */}
                        <div className="space-y-2" style={{
                          opacity: scrollProgress > 0.15 ? 1 : (scrollProgress > 0.1 ? (scrollProgress - 0.1) * 20 : 0),
                          transform: scrollProgress > 0.1 ? "translateY(0px)" : "translateY(10px)",
                          transition: "all 0.4s ease-out",
                        }}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                            <span className="font-bold text-gray-900 text-sm">감정 분석</span>
                          </div>
                          <div className="pl-4 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-800 text-xs font-medium min-w-[45px]">기쁨</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                                  style={{ width: `${scrollProgress > 0.1 ? Math.min(100, Math.max(0, (scrollProgress - 0.1) * 300)) : 0}%` }}
                                />
                              </div>
                              <span className="text-pink-600 font-bold text-xs min-w-[35px] text-right">{scrollProgress > 0.1 ? Math.round(Math.min(85, Math.max(0, (scrollProgress - 0.1) * 300))) : 0}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-800 text-xs font-medium min-w-[45px]">평온함</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
                                  style={{ width: `${scrollProgress > 0.15 ? Math.min(100, Math.max(0, (scrollProgress - 0.15) * 300)) : 0}%` }}
                                />
                              </div>
                              <span className="text-pink-600 font-bold text-xs min-w-[35px] text-right">{scrollProgress > 0.15 ? Math.round(Math.min(72, Math.max(0, (scrollProgress - 0.15) * 300))) : 0}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-800 text-xs font-medium min-w-[45px]">창의성</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all duration-500"
                                  style={{ width: `${scrollProgress > 0.2 ? Math.min(100, Math.max(0, (scrollProgress - 0.2) * 300)) : 0}%` }}
                                />
                              </div>
                              <span className="text-pink-600 font-bold text-xs min-w-[35px] text-right">{scrollProgress > 0.2 ? Math.round(Math.min(90, Math.max(0, (scrollProgress - 0.2) * 300))) : 0}%</span>
                            </div>
                          </div>
                        </div>

                        {/* 색상 분석 */}
                        <div className="space-y-2" style={{
                          opacity: 1,
                          transform: "translateY(0px)",
                          transition: "all 0.4s ease-out",
                        }}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            <span className="font-bold text-gray-900 text-sm">주요 색상</span>
                          </div>
                          <div className="pl-4 flex gap-2 flex-wrap">
                            {[
                              { color: "#FFD700", name: "노랑", percent: 25 },
                              { color: "#FF6B6B", name: "빨강", percent: 20 },
                              { color: "#87CEEB", name: "하늘", percent: 18 },
                              { color: "#90EE90", name: "초록", percent: 15 },
                            ].map((item, i) => (
                              <div 
                                key={i}
                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200"
                                style={{
                                  opacity: 1,
                                  transform: "scale(1)",
                                  transition: "all 0.3s ease-out",
                                }}
                              >
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-xs text-gray-800 font-medium">{item.name}</span>
                                <span className="text-xs text-gray-600">{item.percent}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 그림 요소 분석 */}
                        <div className="space-y-2" style={{
                          opacity: 1,
                          transform: "translateY(0px)",
                          transition: "all 0.4s ease-out",
                        }}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-bold text-gray-900 text-sm">발견된 요소</span>
                          </div>
                          <div className="pl-4 space-y-1">
                            {[
                              { icon: "☀️", name: "태양", meaning: "밝은 에너지" },
                              { icon: "🏠", name: "집", meaning: "안정감" },
                              { icon: "🌳", name: "나무", meaning: "성장" },
                              { icon: "☁️", name: "구름", meaning: "자유로움" },
                            ].map((item, i) => (
                              <div 
                                key={i}
                                className="flex items-center gap-2 text-xs"
                                style={{
                                  opacity: 1,
                                  transform: "translateX(0)",
                                  transition: "all 0.3s ease-out",
                                }}
                              >
                                <span className="text-sm">{item.icon}</span>
                                <span className="text-gray-800 font-medium">{item.name}</span>
                                <span className="text-gray-400">-</span>
                                <span className="text-gray-700">{item.meaning}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 종합 분석 */}
                        <div className="mt-2 p-2 rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200" style={{
                          opacity: 1,
                          transform: "translateY(0px) scale(1)",
                          transition: "all 0.4s ease-out",
                        }}>
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3 h-3 text-pink-600" />
                            <span className="font-bold text-gray-900 text-xs">종합 분석</span>
                          </div>
                          <p className="text-xs text-gray-800 leading-relaxed pl-4">
                            아이의 그림은 <span className="font-semibold text-pink-600">밝고 긍정적인</span> 에너지를 보여주며, 
                            <span className="font-semibold text-purple-600"> 창의적 표현</span>이 뛰어납니다.
                          </p>
                        </div>
                      </div>
                    </div>
                </div>
                
                {/* 그림 종이 그림자 - 더 깊게 */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-6 bg-black/15 blur-xl rounded-full"></div>
                
                {/* 그림 종이 주변 빛 효과 */}
                {scrollProgress > 0.2 && (
                  <div 
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      boxShadow: `0 0 ${20 + scrollProgress * 30}px rgba(255, 105, 180, ${0.3 * scrollProgress})`,
                      animationName: "paperGlow",
                      animationDuration: "2s",
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                    }}
                  />
                )}
              </div>
            </div>


            {/* 분석 텍스트 - 오른쪽 */}
            <div
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-right pr-4 md:pr-8 transition-all duration-1000 ease-out"
              style={{
                opacity: artAiOpacity * 0.9,
                transform: `translateY(-50%) translateX(${(1 - artAiOpacity) * 30}px)`,
              }}
            >
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
                <span 
                  className="bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 bg-clip-text text-transparent inline-block"
                  style={{
                    animationName: "textGlow",
                    animationDuration: "3s",
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDelay: "0s",
                  }}
                >
                  art
                </span>
                <span 
                  className="text-gray-300 mx-4 inline-block"
                  style={{
                    animationName: "blink",
                    animationDuration: "2s",
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                  }}
                >
                  |
                </span>
                <span 
                  className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 bg-clip-text text-transparent inline-block"
                  style={{
                    animationName: "textGlow",
                    animationDuration: "3s",
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDelay: "1.5s",
                  }}
                >
                  ai
                </span>
              </h2>
              <p 
                className="text-lg md:text-xl text-gray-600 mt-4"
                style={{
                  animationName: "fadeInUp",
                  animationDuration: "1s",
                  animationTimingFunction: "ease-out",
                  animationIterationCount: "1",
                }}
              >
                그림으로 아이의 마음을<br />
                <span className="text-pink-600 font-semibold">천천히</span> 이해합니다
              </p>
              
              {/* 분석 진행도 - 더 화려하게 */}
              {scrollProgress > 0.1 && (
                <div className="mt-8 w-64 ml-auto">
                  <div className="text-sm text-gray-500 mb-2 text-right flex items-center justify-end gap-2">
                    <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
                    <span className="font-semibold">분석 중...</span>
                    <span className="text-pink-600 font-bold">{Math.round(scrollProgress * 100)}%</span>
                  </div>
                  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{ width: `${scrollProgress * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-shimmer" />
                      {/* 진행도 끝에 빛나는 효과 */}
                      <div 
                        className="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-white opacity-50"
                        style={{
                          animationName: "progressGlow",
                          animationDuration: "1.5s",
                          animationTimingFunction: "ease-in-out",
                          animationIterationCount: "infinite",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/20 to-transparent pointer-events-none"></div>
      </section>

      {/* 신뢰 섹션 */}
      <section className="py-16 px-4 bg-white relative" data-section="trust">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center mb-12 transition-all duration-1000 ${
              isVisible.trust
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-red-500" />
              <h3 className="text-3xl font-bold text-gray-800">신뢰</h3>
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-gray-600 text-lg">
              오랜 시간 함께한 경험이 가장 큰 자산입니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* 카드 1 */}
            <div
              className={`group bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-pink-100 ${
                isVisible.trust
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "100ms" }}
            >
              <div className="bg-pink-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-pink-600 mb-2">10+</div>
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
              className={`group bg-gradient-to-br from-fuchsia-50 to-purple-50 p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-fuchsia-100 ${
                isVisible.trust
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="bg-fuchsia-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-fuchsia-600 mb-2">
                35+
              </div>
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
              className={`group bg-gradient-to-br from-rose-50 to-orange-50 p-8 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-rose-100 ${
                isVisible.trust
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <div className="bg-rose-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-rose-600 mb-2">100+</div>
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
            className={`text-center bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white p-6 rounded-2xl shadow-xl transition-all duration-1000 ${
              isVisible.trust ? "opacity-100 scale-100" : "opacity-0 scale-95"
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
        className="py-16 px-4 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 relative"
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
            이 수업이 <span className="text-pink-600">다른 이유</span>
          </h3>

          <div
            className={`group bg-white p-10 rounded-3xl border-l-8 border-pink-500 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] ${
              isVisible.difference
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-pink-100 p-3 rounded-full">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h4 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight flex-1">
                아이에게{" "}
                <span className="text-pink-600">"왜 이렇게 그렸어?"</span>
                <br className="hidden md:block" />
                라고 묻지 않습니다
              </h4>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">🎨</div>
                <h5 className="font-bold text-gray-800 mb-2 text-lg">
                  평가하지 않습니다
                </h5>
                <p className="text-gray-600 text-sm">
                  그림은 정답이 없는 자유로운 표현입니다
                </p>
              </div>

              <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 p-6 rounded-xl border border-fuchsia-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">⏰</div>
                <h5 className="font-bold text-gray-800 mb-2 text-lg">
                  기다립니다
                </h5>
                <p className="text-gray-600 text-sm">
                  아이가 말할 준비가 될 때까지 기다립니다
                </p>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-orange-100 p-6 rounded-xl border border-rose-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3">💬</div>
                <h5 className="font-bold text-gray-800 mb-2 text-lg">
                  자연스럽게
                </h5>
                <p className="text-gray-600 text-sm">
                  그림 → 대화 → 수업으로 이어집니다
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-500 to-fuchsia-600 p-6 rounded-xl">
              <p className="text-white text-xl font-semibold text-center italic">
                "아이의 그림은 결과가 아니라 이야기의 시작입니다"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section
        className="py-20 px-4 bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 text-white relative overflow-hidden"
        data-section="cta"
      >
        {/* 배경 장식 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-rose-300 rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
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
            className="inline-flex items-center gap-3 bg-white text-pink-600 hover:bg-gray-100 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform"
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

        @keyframes scanLine {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes characterBounce {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes waveWand {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }

        @keyframes magicSparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @keyframes magicFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) translateX(10px) scale(1.2);
            opacity: 1;
          }
        }

        @keyframes bounceElement {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.05);
          }
        }

        @keyframes starPulse {
          0%, 100% {
            r: 8;
            opacity: 0.8;
          }
          50% {
            r: 10;
            opacity: 1;
          }
        }

        @keyframes magicBeam {
          0%, 100% {
            opacity: 0.4;
            stroke-width: 2;
          }
          50% {
            opacity: 0.8;
            stroke-width: 4;
          }
        }

        @keyframes paperGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 105, 180, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 105, 180, 0.6);
          }
        }

        @keyframes textGlow {
          0%, 100% {
            filter: brightness(1);
            transform: scale(1);
          }
          50% {
            filter: brightness(1.2);
            transform: scale(1.02);
          }
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes progressGlow {
          0%, 100% {
            opacity: 0.5;
            transform: translateX(0);
          }
          50% {
            opacity: 1;
            transform: translateX(-4px);
          }
        }

        @keyframes toolFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.1);
          }
        }

        @keyframes toolRotate {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-5deg);
          }
          75% {
            transform: rotate(5deg);
          }
        }

        @keyframes toolGlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes drawPath {
          0% {
            stroke-dashoffset: 100;
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }

        @keyframes colorFlow {
          0%, 100% {
            transform: rotate(0deg) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: rotate(180deg) scale(1.2);
            opacity: 0.8;
          }
        }

        @keyframes drawLine {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.6;
          }
        }

        @keyframes colorShift {
          0%, 100% {
            filter: hue-rotate(0deg) brightness(1);
          }
          50% {
            filter: hue-rotate(20deg) brightness(1.2);
          }
        }

        @keyframes paintDot {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes glassFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) translateX(5px) rotate(2deg);
          }
          66% {
            transform: translateY(5px) translateX(-5px) rotate(-2deg);
          }
        }

        @keyframes sunPulse {
          0%, 100% {
            r: 15;
            opacity: 0.8;
          }
          50% {
            r: 18;
            opacity: 1;
          }
        }

        @keyframes drawFill {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes cloudFloat {
          0%, 100% {
            transform: translateX(0px);
            opacity: 0.7;
          }
          50% {
            transform: translateX(10px);
            opacity: 0.9;
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

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
