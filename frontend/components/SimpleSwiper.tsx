"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SimpleSwiperProps {
  items: Array<{
    id: string;
    image: string;
    title?: string;
    description?: string;
  }>;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function SimpleSwiper({
  items,
  autoPlay = true,
  autoPlayInterval = 4000,
}: SimpleSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isPlaying || items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, items.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsPlaying(false);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* 메인 스와이퍼 */}
      <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-lg bg-slate-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <div className="relative w-full h-full">
              <img
                src={items[currentIndex].image}
                alt={items[currentIndex].title || "Gallery image"}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error("이미지 로드 실패:", items[currentIndex].image);
                }}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 네비게이션 버튼 */}
        {items.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-800 rounded-full p-2 shadow-md transition-all hover:scale-110"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-slate-800 rounded-full p-2 shadow-md transition-all hover:scale-110"
              aria-label="다음 이미지"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* 인디케이터 */}
        {items.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPlaying(false);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 제목과 설명 */}
      {(items[currentIndex].title || items[currentIndex].description) && (
        <div className="mt-4 text-center">
          {items[currentIndex].title && (
            <h3 className="text-lg font-semibold text-slate-900 mb-1">
              {items[currentIndex].title}
            </h3>
          )}
          {items[currentIndex].description && (
            <p className="text-sm text-slate-600">
              {items[currentIndex].description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
