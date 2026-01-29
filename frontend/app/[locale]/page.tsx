"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Palette,
  Wand2,
  ChevronDown,
} from "lucide-react";
import { getReports, getSampleGalleryImages } from "@/lib/api";

// 동적 import로 code splitting 적용
const PinterestGallery = dynamic(
  () => import("@/components/PinterestGallery"),
  {
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  },
);

const AIStudioSection = dynamic(() => import("@/components/AIStudioSection"), {
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
      <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const Interactive3DElements = dynamic(
  () => import("@/components/Interactive3DElements"),
  {
    ssr: false,
  },
);

// 분석 리포트 이미지 데이터는 컴포넌트 내에서 동적으로 로드

export default function Home() {
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [particles, setParticles] = useState<
    Array<{ left: number; top: number; duration: number; delay: number }>
  >([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // 입자 위치를 클라이언트에서만 생성
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    );
  }, []);

  // 리포트 데이터를 갤러리 아이템으로 변환하는 함수
  const transformReportsToGalleryItems = (reports: any[]) => {
    return reports
      .filter(
        (report: any) =>
          report &&
          report.image_metadata &&
          (report.image_metadata.image_url || report.image_metadata.base64),
      )
      .slice(0, 8)
      .map((report: any, index: number) => {
        const imageUrl = report.image_metadata?.image_url
          ? report.image_metadata.image_url
          : report.image_metadata?.base64
            ? `data:image/jpeg;base64,${report.image_metadata.base64}`
            : "";
        const dominantEmotions =
          report.emotional_language?.dominant_emotions || [];
        const colors = report.observation?.colors || [];
        const category = dominantEmotions[0] || colors[0] || "분석";
        const emotions = report.emotional_language?.dominant_emotions || [];
        const analysisSummary = report.observation?.overall_impression
          ? report.observation.overall_impression.substring(0, 80) + "..."
          : "AI가 분석한 그림입니다";
        return {
          id: report.id || `report-${index}`,
          image: imageUrl,
          title: `분석 리포트 #${index + 1}`,
          description: analysisSummary,
          width: report.image_metadata?.width || 400,
          height: report.image_metadata?.height || 600,
          category: category,
          reportData: {
            emotions: emotions,
            colors: report.observation?.colors || [],
            shapes: report.observation?.shapes || [],
            emotionalTone: report.emotional_language?.emotional_tone || "",
            intensity: report.emotional_language?.intensity_level || "",
            createdAt: report.created_at,
          },
        };
      });
  };

  // 분석 리포트 이미지 로드
  useEffect(() => {
    const loadAnalysisImages = async () => {
      try {
        setLoadingGallery(true);
        const response = await getReports();

        // response가 에러 객체인 경우 처리
        if (response && typeof response === "object" && "error" in response) {
          console.warn("리포트 로드 경고:", response.error);
          setGalleryItems([]);
          setGalleryError(response.error || "리포트를 불러올 수 없습니다.");
          // 리포트가 없으면 샘플 이미지 로드
          await loadSampleImages();
          return;
        }

        if (
          response &&
          response.success &&
          response.reports &&
          Array.isArray(response.reports)
        ) {
          const itemsWithImages = transformReportsToGalleryItems(
            response.reports,
          );
          if (itemsWithImages.length > 0) {
            setGalleryItems(itemsWithImages);
          } else {
            // 리포트가 없으면 샘플 이미지 로드
            await loadSampleImages();
          }
        } else {
          // 응답 형식이 예상과 다른 경우
          console.warn("예상하지 못한 응답 형식:", response);
          setGalleryItems([]);
          // 리포트가 없으면 샘플 이미지 로드
          await loadSampleImages();
        }
      } catch (error: any) {
        console.error("분석 이미지 로드 오류:", error);
        // 오류 시 빈 배열 유지 (앱 크래시 방지)
        setGalleryItems([]);
        setGalleryError(
          "분석 이미지를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        );
        // 리포트가 없으면 샘플 이미지 로드
        await loadSampleImages();
      } finally {
        setLoadingGallery(false);
      }
    };

    const loadSampleImages = async () => {
      try {
        const response = await getSampleGalleryImages();
        if (response.success && response.images && response.images.length > 0) {
          // 샘플 이미지를 갤러리 아이템 형식으로 변환
          const sampleItems = response.images.map((img, index) => ({
            id: `sample-${index}`,
            image: img.url,
            title: img.title,
            description: img.description,
            width: img.width,
            height: img.height,
            category: "샘플",
          }));
          setGalleryItems(sampleItems);
          setGalleryError(null); // 샘플 이미지가 있으면 에러 초기화
        }
      } catch (error: any) {
        console.error("샘플 이미지 로드 오류:", error);
        // 샘플 이미지 로드 실패해도 계속 진행 (빈 갤러리 표시)
      }
    };

    loadAnalysisImages();
  }, []);

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero 섹션 */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      >
        {/* 배경 장식 - 모던한 네온 효과 */}
        <div className="absolute inset-0 overflow-hidden">
          {/* 부드러운 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10" />

          {/* 애니메이션 blob 효과 */}
          <motion.div
            className="absolute top-20 left-20 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/30 to-blue-500/20 rounded-full mix-blend-screen filter blur-[120px]"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/30 to-indigo-500/20 rounded-full mix-blend-screen filter blur-[120px]"
            animate={{
              x: [0, -40, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-indigo-500/25 to-cyan-500/15 rounded-full mix-blend-screen filter blur-[100px]"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* 세련된 그리드 패턴 */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(148, 163, 184, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 163, 184, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />

          {/* 빛나는 입자 효과 */}
          {particles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          {/* 중앙 시각적 요소 - 그라데이션 원형 디자인 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mb-12 relative flex items-center justify-center"
          >
            {/* 큰 그라데이션 원형 배경 */}
            <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]">
              {/* 외부 빛나는 링 */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3), rgba(99, 102, 241, 0.3), rgba(6, 182, 212, 0.3))",
                  filter: "blur(20px)",
                }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />

              {/* 중간 그라데이션 링 */}
              <motion.div
                className="absolute inset-4 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(6, 182, 212, 0.4) 0%, rgba(59, 130, 246, 0.3) 50%, rgba(99, 102, 241, 0.2) 100%)",
                  filter: "blur(15px)",
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* 내부 중심 원 */}
              <motion.div
                className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 backdrop-blur-xl border border-cyan-400/30 flex items-center justify-center"
                style={{
                  boxShadow:
                    "0 0 60px rgba(6, 182, 212, 0.3), inset 0 0 40px rgba(59, 130, 246, 0.2)",
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                {/* 중앙 아이콘 */}
                <motion.div
                  animate={{
                    rotate: [0, -360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl">
                    <Palette className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 text-white" />
                  </div>
                </motion.div>
              </motion.div>

              {/* 떠다니는 작은 원들 */}
              {[...Array(6)].map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const radius = 120;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-cyan-400/60 to-blue-500/60 backdrop-blur-sm border border-cyan-300/50"
                    style={{
                      left: "50%",
                      top: "50%",
                      marginLeft: "-16px",
                      marginTop: "-16px",
                    }}
                    animate={{
                      x: [0, Math.cos(angle) * radius, 0],
                      y: [0, Math.sin(angle) * radius, 0],
                      scale: [1, 1.2, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 3 + i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* 텍스트 콘텐츠 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 backdrop-blur-xl border border-cyan-400/30 text-cyan-200 px-5 py-2.5 rounded-full mb-8 shadow-lg shadow-cyan-500/20"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <span className="text-sm font-semibold">
                AI로 그림을 분석하고 이해합니다
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight"
            >
              그림으로 아이의 마음을
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  천천히 이해합니다
                </span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: 1.2 }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-xl md:text-2xl text-slate-300/90 mb-14 max-w-3xl mx-auto leading-relaxed font-light"
            >
              최첨단 AI 기술과 3D 인터랙티브 경험으로
              <br />
              <span className="text-cyan-200">
                아이의 그림 속 숨겨진 의미를 발견하세요
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              <Link
                href="/analysis"
                className="group relative bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white px-10 py-5 rounded-2xl font-semibold transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-110 transform overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative z-10">그림 분석 시작하기</span>
                <motion.div
                  className="relative z-10"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
              <button
                onClick={scrollToGallery}
                className="group relative bg-slate-800/60 backdrop-blur-xl hover:bg-slate-700/70 text-white border-2 border-slate-600/50 hover:border-cyan-500/50 px-10 py-5 rounded-2xl font-semibold transition-all duration-500 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-110 transform"
              >
                <span className="relative z-10">작품 갤러리 보기</span>
                <motion.div
                  className="relative z-10"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 스크롤 인디케이터 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3 text-slate-400/80"
          >
            <span className="text-sm font-medium">스크롤하여 더 보기</span>
            <div className="relative">
              <motion.div
                className="w-6 h-10 border-2 border-cyan-500/50 rounded-full flex items-start justify-center p-2"
                animate={{
                  borderColor: [
                    "rgba(6, 182, 212, 0.5)",
                    "rgba(6, 182, 212, 1)",
                    "rgba(6, 182, 212, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                  animate={{ y: [0, 12, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 작은 갤러리 섹션 */}
      <section
        id="gallery"
        ref={galleryRef}
        className="relative py-12 px-4 bg-white overflow-hidden"
      >
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 text-cyan-600 px-4 py-2 rounded-full mb-4">
              <Palette className="w-4 h-4" />
              <span className="text-sm font-semibold">작품 갤러리</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              아이들의
              <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                창의적인 작품들
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              다양한 주제와 스타일로 표현된 아이들의 그림을 감상해보세요
            </p>
          </motion.div>

          <div className="relative">
            {loadingGallery ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">분석 이미지를 불러오는 중...</p>
                </div>
              </div>
            ) : galleryError ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-slate-600 mb-2 font-medium">
                  {galleryError}
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  백엔드 서버가 실행 중인지 확인해주세요
                </p>
                <button
                  onClick={async () => {
                    setGalleryError(null);
                    setLoadingGallery(true);
                    try {
                      const response = await getReports();
                      if (
                        response &&
                        response.success &&
                        response.reports &&
                        Array.isArray(response.reports)
                      ) {
                        const itemsWithImages = transformReportsToGalleryItems(
                          response.reports,
                        );
                        setGalleryItems(itemsWithImages);
                        setGalleryError(null);
                      } else {
                        setGalleryError("리포트를 불러올 수 없습니다.");
                      }
                    } catch (error) {
                      setGalleryError("다시 시도해도 오류가 발생했습니다.");
                    } finally {
                      setLoadingGallery(false);
                    }
                  }}
                  className="inline-block mt-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  다시 시도
                </button>
              </div>
            ) : galleryItems.length > 0 ? (
              <PinterestGallery items={galleryItems} columns={3} gap={12} />
            ) : (
              <div className="text-center py-20">
                <Palette className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">
                  아직 분석된 이미지가 없습니다
                </p>
                <Link
                  href="/analysis"
                  className="inline-block mt-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  첫 번째 분석 시작하기
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI Studio 섹션 */}
      <section id="studio" className="relative">
        <AIStudioSection />
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-500/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse animation-delay-2000" />

          {/* 그리드 패턴 */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <Sparkles className="w-12 h-12 mx-auto mb-6 animate-pulse text-cyan-400" />
          <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            지금 바로 시작해보세요
          </h3>
          <p className="text-xl mb-10 text-slate-300">
            AI로 아이의 그림을 분석하고 더 나은 미술 교육을 제공하세요
          </p>
          <Link
            href="/analysis"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:via-blue-700 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transform"
          >
            <Wand2 className="w-6 h-6" />
            그림 분석 시작하기
            <ArrowRight className="w-6 h-6" />
          </Link>
        </motion.div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-6 h-6 text-pink-600" />
                <span className="text-xl font-bold">Art AI Studio</span>
              </div>
              <p className="text-gray-400">
                AI로 그림을 분석하고 이해하는 미술 교육 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/analysis" className="hover:text-pink-400">
                    그림 분석
                  </Link>
                </li>
                <li>
                  <Link href="/class" className="hover:text-pink-400">
                    미술 수업
                  </Link>
                </li>
                <li>
                  <Link href="/fingerprint" className="hover:text-pink-400">
                    지문 상담
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">문의</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-pink-400">
                    연락하기
                  </Link>
                </li>
                <li>
                  <Link href="/info" className="hover:text-pink-400">
                    서비스 안내
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">법적 문서</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/terms" className="hover:text-pink-400">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-pink-400">
                    개인정보 처리방침
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-pink-400">
                    프라이버시 정책
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:text-pink-400">
                    환불 규정
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-pink-400">
                    쿠키 정책
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Art AI Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
      `}</style>
    </div>
  );
}
