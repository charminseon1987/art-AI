"use client";

import { Suspense, useRef, useEffect, useState, Component, ReactNode } from "react";
import { motion } from "framer-motion";
import Spline from "@splinetool/react-spline";
import { Application } from "@splinetool/runtime";
import { Loader2, Palette } from "lucide-react";

// 에러 바운더리 컴포넌트
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Spline error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface SplineSceneProps {
  scene: string;
  className?: string;
  onLoad?: (spline: Application) => void;
  interactive?: boolean;
  parallax?: boolean;
}

export default function SplineScene({
  scene,
  className = "",
  onLoad,
  interactive = true,
  parallax = false,
}: SplineSceneProps) {
  const splineRef = useRef<Application | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  // 타임아웃으로 에러 감지
  useEffect(() => {
    if (!scene) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Spline scene load timeout");
        setHasError(true);
        setIsLoading(false);
      }
    }, 10000); // 10초 타임아웃

    return () => clearTimeout(timeout);
  }, [scene, isLoading]);

  useEffect(() => {
    if (!parallax || !splineRef.current || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePosition({ x, y });

      // Spline 객체에 마우스 위치 전달
      if (splineRef.current) {
        try {
          const camera = splineRef.current.findObjectByName("Camera");
          if (camera) {
            camera.position.x = x * 50;
            camera.position.y = -y * 50;
          }
        } catch (error) {
          // 객체를 찾을 수 없는 경우 무시
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [parallax]);

  useEffect(() => {
    if (!parallax || !splineRef.current) return;

    const handleScroll = () => {
      if (!splineRef.current) return;
      const scrollY = window.scrollY;
      const scrollProgress = scrollY / window.innerHeight;

      try {
        const camera = splineRef.current.findObjectByName("Camera");
        if (camera) {
          camera.position.z = scrollProgress * 100;
        }
      } catch (error) {
        // 객체를 찾을 수 없는 경우 무시
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [parallax]);

  // 클라이언트 마운트 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 대체 3D 효과용 마우스 추적
  useEffect(() => {
    if (!hasError && scene) return; // Spline 씬이 정상이면 실행하지 않음
    if (!isMounted) return;
    
    if (!containerRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePos({ x, y });
    };

    const container = containerRef.current;
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [hasError, scene, isMounted]);

  const handleLoad = (spline: Application) => {
    splineRef.current = spline;
    setIsLoading(false);
    setHasError(false);
    if (onLoad) {
      onLoad(spline);
    }
  };

  // 에러 발생 시 대체 3D 효과 UI
  if (hasError || !scene) {
    return (
      <div
        ref={containerRef}
        className={`relative ${className} flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-lg overflow-hidden cursor-pointer`}
        style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
      >
        {/* 3D 플로팅 오브젝트들 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 중앙 메인 오브젝트 - 회전하는 구체 */}
          <motion.div
            className="relative"
            style={{
              transformStyle: "preserve-3d",
              rotateX: mousePos.y * 20,
              rotateY: mousePos.x * 20,
            }}
            animate={{
              rotateZ: [0, 360],
            }}
            transition={{
              rotateZ: {
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            {/* 구체를 이루는 원형 레이어들 - 글라스 효과 */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const radius = 60;
              const colors = [
                "6, 182, 212",    // cyan
                "59, 130, 246",   // blue
                "99, 102, 241",   // indigo
                "139, 92, 246",   // violet
                "14, 165, 233",   // sky
                "34, 211, 238",   // cyan-400
                "96, 165, 250",   // blue-400
                "129, 140, 248",  // indigo-400
              ];
              return (
                <motion.div
                  key={i}
                  className="absolute w-32 h-32 rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    marginLeft: "-64px",
                    marginTop: "-64px",
                    background: `linear-gradient(135deg, rgba(${colors[i]}, 0.3) 0%, rgba(${colors[i]}, 0.1) 100%)`,
                    backdropFilter: "blur(15px) saturate(180%)",
                    WebkitBackdropFilter: "blur(15px) saturate(180%)",
                    border: "2px solid rgba(255, 255, 255, 0.4)",
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6),
                      inset 0 -1px 0 rgba(255, 255, 255, 0.2)
                    `,
                    transform: `rotateY(${angle * (180 / Math.PI)}deg) translateZ(${radius}px)`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.9, 0.6],
                  }}
                  transition={{
                    duration: 2 + i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1,
                  }}
                >
                  {/* 내부 빛 효과 */}
                  <div
                    className="absolute inset-0 rounded-full opacity-40"
                    style={{
                      background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5) 0%, transparent 70%)",
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>

          {/* 주변 떠다니는 3D 카드들 */}
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const radius = 150;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <motion.div
                key={i}
                className="absolute w-20 h-20 rounded-xl"
                style={{
                  left: "50%",
                  top: "50%",
                  background: `linear-gradient(135deg, rgba(${
                    i === 0 ? "6, 182, 212" : i === 1 ? "59, 130, 246" : i === 2 ? "99, 102, 241" : i === 3 ? "139, 92, 246" : i === 4 ? "16, 185, 129" : "14, 165, 233"
                  }, 0.4) 0%, rgba(${
                    i === 0 ? "34, 211, 238" : i === 1 ? "96, 165, 250" : i === 2 ? "129, 140, 248" : i === 3 ? "167, 139, 250" : i === 4 ? "52, 211, 153" : "56, 189, 248"
                  }, 0.3) 100%)`,
                  backdropFilter: "blur(10px) saturate(180%)",
                  WebkitBackdropFilter: "blur(10px) saturate(180%)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.2)
                  `,
                  transformStyle: "preserve-3d",
                }}
                animate={{
                  x: [x, x * 1.2, x],
                  y: [y, y * 1.2, y],
                  rotateX: [0, 180, 360],
                  rotateY: [0, 180, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
                whileHover={{
                  scale: 1.3,
                  z: 100,
                  boxShadow: `
                    0 12px 48px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.7),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.3)
                  `,
                }}
              >
                <div className="w-full h-full flex items-center justify-center relative">
                  {/* 내부 빛 효과 */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-30"
                    style={{
                      background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%)",
                    }}
                  />
                  <Palette className="w-8 h-8 text-white opacity-90 relative z-10" />
                </div>
              </motion.div>
            );
          })}

          {/* 연결선 효과 - 클라이언트에서만 렌더링 */}
          {isMounted && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {[...Array(6)].map((_, i) => {
                const angle1 = (i / 6) * Math.PI * 2;
                const angle2 = ((i + 1) / 6) * Math.PI * 2;
                const radius = 150;
                // 값을 반올림하여 서버/클라이언트 불일치 방지
                const x1 = Math.round((50 + Math.cos(angle1) * (radius / 4)) * 100) / 100;
                const y1 = Math.round((50 + Math.sin(angle1) * (radius / 4)) * 100) / 100;
                const x2 = Math.round((50 + Math.cos(angle2) * (radius / 4)) * 100) / 100;
                const y2 = Math.round((50 + Math.sin(angle2) * (radius / 4)) * 100) / 100;
                
                return (
                  <motion.line
                    key={i}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="#06b6d4"
                    strokeWidth="2"
                    opacity="0.3"
                    animate={{
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                );
              })}
            </svg>
          )}
        </div>

        {/* 텍스트 오버레이 - 글라스 효과 */}
        <motion.div
          className="relative z-10 text-center p-8 rounded-3xl"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.6),
              inset 0 -1px 0 rgba(255, 255, 255, 0.2)
            `,
          }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* 글라스 내부 빛 효과 */}
          <div
            className="absolute inset-0 rounded-3xl opacity-50"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
              pointerEvents: "none",
            }}
          />
          
          <motion.div
            className="relative z-10"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 backdrop-blur-sm border border-white/30 flex items-center justify-center">
              <Palette className="w-8 h-8 text-cyan-600" />
            </div>
          </motion.div>
          <h3 
            className="text-4xl font-black mb-2 relative z-10" 
            style={{
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            art
          </h3>
          <p className="text-sm text-slate-700 relative z-10 font-medium">
            마우스를 움직여보세요
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-2" />
            <p className="text-sm text-slate-300">3D 씬 로딩 중...</p>
          </div>
        </div>
      )}
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
          </div>
        }
      >
        {scene ? (
          <ErrorBoundary
            fallback={
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                <div className="text-center">
                  <Palette className="w-16 h-16 text-pink-600 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Spline 씬을 로드하는 중 오류가 발생했습니다
                  </p>
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                    }}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm mt-2"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            }
          >
            <Spline
              scene={scene}
              onLoad={handleLoad}
              style={{
                width: "100%",
                height: "100%",
                pointerEvents: interactive ? "auto" : "none",
              }}
            />
          </ErrorBoundary>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
            <div className="text-center p-8">
              <motion.div
                className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: {
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
              >
                <Palette className="w-12 h-12 text-white" />
              </motion.div>
              <h3 className="text-4xl font-black text-gray-800 mb-2" style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "-0.02em",
              }}>
                art
              </h3>
              <p className="text-sm text-gray-600">
                마우스를 움직여보세요
              </p>
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
}
