"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Eye, Download, FileText, Brain, Palette, Sparkles } from "lucide-react";

interface GalleryItem {
  id: string;
  image: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  category?: string;
  reportData?: {
    emotions?: string[];
    colors?: string[];
    shapes?: string[];
    emotionalTone?: string;
    intensity?: string;
    createdAt?: string;
  };
}

interface PinterestGalleryProps {
  items: GalleryItem[];
  columns?: number;
  gap?: number;
}

export default function PinterestGallery({
  items,
  columns = 4,
  gap = 16,
}: PinterestGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [visibleItems, setVisibleItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [responsiveColumns, setResponsiveColumns] = useState(columns);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 반응형 컬럼 수 계산
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) {
        setResponsiveColumns(1);
      } else if (window.innerWidth < 1024) {
        setResponsiveColumns(2);
      } else if (window.innerWidth < 1280) {
        setResponsiveColumns(3);
      } else {
        setResponsiveColumns(columns);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [columns]);

  useEffect(() => {
    // 초기 아이템 로드
    setVisibleItems(items.slice(0, 12));
    setIsLoading(false);

    // Intersection Observer로 무한 스크롤 구현
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentLength = visibleItems.length;
            if (currentLength < items.length) {
              setVisibleItems(items.slice(0, currentLength + 12));
            }
          }
        });
      },
      { threshold: 0.1 },
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [items, visibleItems.length]);

  // Masonry 레이아웃 계산
  const getMasonryLayout = () => {
    const columnHeights = new Array(responsiveColumns).fill(0);
    const layout: Array<{ item: GalleryItem; column: number; top: number; height: number }> =
      [];

    visibleItems.forEach((item) => {
      const minHeight = Math.min(...columnHeights);
      const column = columnHeights.indexOf(minHeight);
      const aspectRatio =
        item.height && item.width ? item.height / item.width : 1.5;
      const itemHeight = 300 * aspectRatio;

      layout.push({
        item,
        column,
        top: columnHeights[column],
        height: itemHeight,
      });

      columnHeights[column] += itemHeight + gap;
    });

    return { layout, totalHeight: Math.max(...columnHeights) };
  };

  const { layout, totalHeight } = getMasonryLayout();

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ minHeight: totalHeight }}
      >
        <div
          className="relative w-full"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
            gap: `${gap}px`,
          }}
        >
          {layout.map(({ item, column, top, height }) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative group cursor-pointer"
              style={{
                gridColumn: column + 1,
                gridRow: "span 1",
                marginTop: `${top}px`,
              }}
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 bg-white">
                <div
                  className="relative w-full"
                  style={{ height: `${height}px`, position: "relative" }}
                >
                  <Image
                    src={item.image}
                    alt={item.title || "Gallery item"}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    {item.title && (
                      <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-200 line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}
                    {/* 분석 보고서 예시 정보 */}
                    {item.reportData && (
                      <div className="space-y-2 mt-3 pt-3 border-t border-white/20">
                        {item.reportData.emotions &&
                          item.reportData.emotions.length > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <Brain className="w-3 h-3 text-pink-300" />
                              <span className="text-gray-200">
                                {item.reportData.emotions
                                  .slice(0, 2)
                                  .join(", ")}
                                {item.reportData.emotions.length > 2 && "..."}
                              </span>
                            </div>
                          )}
                        {item.reportData.colors &&
                          item.reportData.colors.length > 0 && (
                            <div className="flex items-center gap-2 text-xs">
                              <Palette className="w-3 h-3 text-purple-300" />
                              <div className="flex gap-1">
                                {item.reportData.colors
                                  .slice(0, 3)
                                  .map((color, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 bg-white/20 rounded text-gray-200"
                                    >
                                      {color}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                        {item.reportData.emotionalTone && (
                          <div className="flex items-center gap-2 text-xs">
                            <Sparkles className="w-3 h-3 text-yellow-300" />
                            <span className="text-gray-200">
                              {item.reportData.emotionalTone}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors">
                    <Heart className="w-4 h-4 text-pink-600" />
                  </button>
                  <button className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
                {item.category && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-pink-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 모달 */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-800" />
              </button>
              <div className="relative w-full h-[60vh] bg-gray-100">
                <Image
                  src={selectedItem.image}
                  alt={selectedItem.title || "Gallery item"}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>
              <div className="p-6">
                {selectedItem.title && (
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-pink-600" />
                    {selectedItem.title}
                  </h2>
                )}
                {selectedItem.description && (
                  <p className="text-gray-600 mb-4">
                    {selectedItem.description}
                  </p>
                )}

                {/* 분석 보고서 상세 정보 */}
                {selectedItem.reportData && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                      분석 결과 요약
                    </h3>
                    <div className="space-y-3">
                      {selectedItem.reportData.emotions &&
                        selectedItem.reportData.emotions.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-gray-700 text-sm">
                                주요 감정
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedItem.reportData.emotions.map(
                                (emotion, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                                  >
                                    {emotion}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      {selectedItem.reportData.colors &&
                        selectedItem.reportData.colors.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Palette className="w-4 h-4 text-pink-600" />
                              <span className="font-semibold text-gray-700 text-sm">
                                주요 색상
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedItem.reportData.colors.map(
                                (color, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium"
                                  >
                                    {color}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      {selectedItem.reportData.shapes &&
                        selectedItem.reportData.shapes.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-gray-700 text-sm">
                                발견된 형태
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedItem.reportData.shapes.map(
                                (shape, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                                  >
                                    {shape}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      {selectedItem.reportData.emotionalTone && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-yellow-600" />
                            <span className="font-semibold text-gray-700 text-sm">
                              감정 톤
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {selectedItem.reportData.emotionalTone}
                          </p>
                        </div>
                      )}
                      {selectedItem.reportData.intensity && (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className="w-4 h-4 text-indigo-600" />
                            <span className="font-semibold text-gray-700 text-sm">
                              강도
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {selectedItem.reportData.intensity}
                          </p>
                        </div>
                      )}
                      {selectedItem.reportData.createdAt && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            분석일:{" "}
                            {new Date(
                              selectedItem.reportData.createdAt,
                            ).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Heart className="w-4 h-4" />
                    좋아요
                  </button>
                  <button className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors">
                    <Download className="w-4 h-4" />
                    다운로드
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
