"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BumpStyleSection() {
  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* iOS 스타일 상태바 */}
      <div className="absolute top-0 left-0 right-0 z-50 px-6 pt-2 pb-1 flex justify-between items-center text-white text-sm font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-3 bg-white rounded-sm"
                style={{ opacity: i < 3 ? 1 : 0.3 }}
              />
            ))}
          </div>
          <div className="w-4 h-3 border border-white rounded-sm">
            <div className="w-full h-full bg-white rounded-sm" />
          </div>
          <div className="w-6 h-3 border-2 border-white rounded-sm relative">
            <div className="absolute inset-0.5 bg-white rounded-sm" />
          </div>
        </div>
      </div>

      {/* 배경 물결 레이어들 - 더 유기적인 형태 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 레이어 1 - 가장 뒤 (더 진한 파란색) */}
        <motion.div
          className="absolute inset-0"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            preserveAspectRatio="none"
          >
            <path
              d="M0,350 Q200,250 400,300 T800,320 T1200,350 L1200,800 L0,800 Z"
              fill="#1e3a8a"
              opacity="0.4"
            />
          </svg>
        </motion.div>

        {/* 레이어 2 - 중간 */}
        <motion.div
          className="absolute inset-0"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            preserveAspectRatio="none"
          >
            <path
              d="M0,450 Q300,350 600,400 T1200,450 L1200,800 L0,800 Z"
              fill="#2563eb"
              opacity="0.5"
            />
          </svg>
        </motion.div>

        {/* 레이어 3 - 앞 (더 밝은 파란색) */}
        <motion.div
          className="absolute inset-0"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 1200 800"
            preserveAspectRatio="none"
          >
            <path
              d="M0,500 Q250,400 500,450 T1000,480 T1200,500 L1200,800 L0,800 Z"
              fill="#3b82f6"
              opacity="0.6"
            />
          </svg>
        </motion.div>

        {/* 반복되는 "Bump" 텍스트 패턴 - 더 어둡고 미묘하게 */}
        {[...Array(24)].map((_, i) => {
          const cols = 6;
          const rows = 4;
          const x = ((i % cols) / cols) * 100;
          const y = (Math.floor(i / cols) / rows) * 100;
          return (
            <motion.div
              key={i}
              className="absolute text-blue-950/15 font-black"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                fontSize: "clamp(3rem, 8vw, 6rem)",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.02em",
              }}
              animate={{
                opacity: [0.08, 0.15, 0.08],
              }}
              transition={{
                duration: 4 + (i % 3) * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i % 4) * 0.3,
              }}
            >
              Bump
            </motion.div>
          );
        })}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-32">
        {/* 메인 로고 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Bump 텍스트 - 이미지와 동일한 스타일 */}
          <motion.h1
            className="text-7xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-black mb-2"
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: "#000000",
              textShadow: `
                -4px -4px 0 #ffffff,
                4px -4px 0 #ffffff,
                -4px 4px 0 #ffffff,
                4px 4px 0 #ffffff,
                0 0 30px rgba(255, 255, 255, 0.2)
              `,
              letterSpacing: "-0.03em",
              lineHeight: "0.9",
              fontWeight: 900,
            }}
            animate={{
              y: [0, -3, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Bump
          </motion.h1>

          {/* omo 텍스트 - 이미지와 동일한 스타일 */}
          <motion.p
            className="text-2xl md:text-3xl lg:text-4xl text-blue-400 font-light"
            style={{
              fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive, serif",
              marginTop: "-0.5rem",
              fontStyle: "italic",
              fontWeight: 300,
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            omo
          </motion.p>
        </motion.div>

        {/* CTA 버튼 - 이미지와 동일한 스타일 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-sm space-y-3"
        >
          <Link
            href="/counseling"
            className="block w-full"
          >
            <motion.button
              className="w-full py-4 px-6 rounded-2xl text-white font-semibold text-base md:text-lg relative overflow-hidden"
              style={{
                background: "linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Get me in</span>
            </motion.button>
          </Link>

          {/* 약관 텍스트 - 이미지와 동일한 스타일 */}
          <p className="text-center text-white/80 text-xs md:text-sm leading-relaxed">
            By tapping 'Get me in' you're accepting the{" "}
            <Link
              href="/contact"
              className="underline hover:text-white transition-colors"
            >
              terms
            </Link>
            .
          </p>
        </motion.div>
      </div>

      {/* 하단 푸터 - 이미지와 동일한 스타일 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* 왼쪽: Bump 로고 */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center relative">
              {/* 고스트/블롭 스타일 눈 */}
              <div className="absolute left-1.5 top-2 w-1 h-1 bg-white rounded-full" />
              <div className="absolute right-1.5 top-2 w-1 h-1 bg-white rounded-full" />
            </div>
            <span className="text-white font-semibold text-sm md:text-base">Bump</span>
          </div>
          
          {/* 오른쪽: Mobbin 크레딧 */}
          <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm">
            <span>curated by</span>
            <div className="flex items-center gap-1.5">
              {/* Mobbin 로고 - 두 개의 M */}
              <div className="flex items-center gap-0.5">
                <div className="w-4 h-4 bg-gray-600 rounded-sm flex items-center justify-center relative">
                  <span className="text-white text-[8px] font-bold">M</span>
                </div>
                <div className="w-4 h-4 bg-gray-600 rounded-sm flex items-center justify-center relative -ml-1">
                  <span className="text-white text-[8px] font-bold">M</span>
                </div>
              </div>
              <span className="text-white font-medium">Mobbin</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
