"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  Brain,
  Image as ImageIcon,
  Wand2,
  Zap,
  ArrowRight,
  Play,
  Pause,
  FileText,
  Palette,
} from "lucide-react";

interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const aiFeatures: AIFeature[] = [
  {
    id: "image-analysis",
    title: "그림 분석",
    description: "AI가 아이의 그림을 분석하여 감정과 심리 상태를 파악합니다.",
    icon: <ImageIcon className="w-8 h-8" />,
    color: "pink",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "emotion-detection",
    title: "감정 인식",
    description: "그림 속 색상과 형태를 통해 아이의 감정을 정확히 감지합니다.",
    icon: <Brain className="w-8 h-8" />,
    color: "indigo",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "creative-insights",
    title: "창의성 인사이트",
    description: "아이의 창의적 표현을 분석하고 발전 방향을 제시합니다.",
    icon: <Sparkles className="w-8 h-8" />,
    color: "violet",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    id: "ai-generation",
    title: "AI 생성",
    description: "AI가 아이의 그림을 바탕으로 새로운 작품을 생성합니다.",
    icon: <Wand2 className="w-8 h-8" />,
    color: "cyan",
    gradient: "from-cyan-500 to-sky-500",
  },
];

export default function AIStudioSection() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [backgroundParticles, setBackgroundParticles] = useState<
    Array<{ left: number; top: number; duration: number; delay: number }>
  >([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);

  // 클라이언트에서만 랜덤 값 생성 (hydration mismatch 방지)
  useEffect(() => {
    setBackgroundParticles(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % aiFeatures.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-20 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
    >
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-slate-800/30 to-slate-900/30" />
      
      {/* 애니메이션 배경 요소 */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundParticles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div
          style={{ opacity, y }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full mb-6"
          >
            <Zap className="w-5 h-5" />
            <span className="font-semibold">AI Studio</span>
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            AI로 그림을
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              분석하고 이해합니다
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            최첨단 AI 기술로 아이의 그림 속 숨겨진 의미를 발견하고,
            <br />
            더 나은 미술 교육을 제공합니다.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 왼쪽: 샘플 결과 보고서 */}
          <motion.div
            style={{ opacity, y }}
            className="relative h-[500px] lg:h-[600px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
            <div className="relative w-full h-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              {/* 보고서 헤더 */}
              <div className="bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border-b border-white/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">그림 상담 결과 보고서</h3>
                    <p className="text-xs text-slate-300">리포트 ID: SAMPLE-2024-001</p>
                  </div>
                </div>
              </div>

              {/* 보고서 내용 */}
              <div className="p-6 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
                {/* 1. 관찰 사항 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-bold text-white">관찰 사항</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-300 mb-2">색상 분석:</p>
                      <div className="flex flex-wrap gap-2">
                        {["빨간색", "파란색", "노란색", "초록색"].map((color, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-cyan-500/20 text-cyan-200 rounded-full text-xs border border-cyan-400/30"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-300 mb-1">형태:</p>
                      <p className="text-xs text-slate-200">원형, 직선, 곡선 형태가 다양하게 표현됨</p>
                    </div>
                  </div>
                </motion.div>

                {/* 2. 감정 분석 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">감정 분석</h4>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-300 mb-2">주요 감정:</p>
                      <div className="flex flex-wrap gap-2">
                        {["기쁨", "에너지", "활기"].map((emotion, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded-full text-xs border border-blue-400/30"
                          >
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-300 mb-1">감정 톤:</p>
                      <p className="text-xs text-slate-200">밝고 역동적인 감정이 주를 이룸</p>
                    </div>
                  </div>
                </motion.div>

                {/* 3. 종합 평가 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-indigo-400/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-white">종합 평가</h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    아이의 그림은 다양한 색상과 형태를 통해 창의적 표현력과 긍정적인 감정 상태를 보여줍니다. 
                    자유로운 선의 움직임과 밝은 색상 사용은 활발한 상상력과 에너지를 나타냅니다.
                  </p>
                </motion.div>

                {/* 하단 액센트 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-center gap-2 pt-2 border-t border-white/10"
                >
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">AI 분석 결과</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* 오른쪽: 기능 카드 */}
          <div className="space-y-4">
            {aiFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setActiveFeature(index);
                  setIsPlaying(false);
                }}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                  activeFeature === index
                    ? `bg-gradient-to-r ${feature.gradient} text-white shadow-2xl scale-105`
                    : "bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      activeFeature === index
                        ? "bg-white/20"
                        : `bg-gradient-to-r ${feature.gradient}`
                    }`}
                  >
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  {activeFeature === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* 재생/일시정지 버튼 */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full transition-all duration-300"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>일시정지</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>재생</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 하단 통계 */}
        <motion.div
          style={{ opacity }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {[
            { label: "분석된 그림", value: "10,000+", icon: ImageIcon },
            { label: "정확도", value: "95%", icon: Brain },
            { label: "AI 모델", value: "GPT-4", icon: Sparkles },
            { label: "사용자", value: "5,000+", icon: Zap },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6"
            >
              <stat.icon className="w-8 h-8 text-pink-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
