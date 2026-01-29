"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FileText, Sparkles, Palette, Wand2 } from "lucide-react";

interface Floating3DItem {
  id: number;
  icon: React.ReactNode;
  color: string;
  initialX: number;
  initialY: number;
  size: number;
}

// floatingItems를 컴포넌트 외부로 이동
const floatingItemsData: Omit<Floating3DItem, "icon">[] = [
  {
    id: 1,
    color: "from-cyan-500 to-blue-500",
    initialX: 10,
    initialY: 20,
    size: 60,
  },
  {
    id: 2,
    color: "from-blue-500 to-indigo-500",
    initialX: 80,
    initialY: 15,
    size: 50,
  },
  {
    id: 3,
    color: "from-indigo-500 to-violet-500",
    initialX: 15,
    initialY: 70,
    size: 55,
  },
  {
    id: 4,
    color: "from-sky-500 to-cyan-500",
    initialX: 85,
    initialY: 75,
    size: 45,
  },
  {
    id: 5,
    color: "from-blue-600 to-indigo-600",
    initialX: 50,
    initialY: 10,
    size: 40,
  },
  {
    id: 6,
    color: "from-cyan-400 to-blue-400",
    initialX: 5,
    initialY: 50,
    size: 48,
  },
];

const icons = [
  <Palette className="w-full h-full" key="palette1" />,
  <Sparkles className="w-full h-full" key="sparkles1" />,
  <Wand2 className="w-full h-full" key="wand1" />,
  <FileText className="w-full h-full" key="file1" />,
  <Palette className="w-full h-full" key="palette2" />,
  <Sparkles className="w-full h-full" key="sparkles2" />,
];

export default function Interactive3DElements() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // floatingItems를 useMemo로 생성
  const floatingItems = useMemo(() => {
    return floatingItemsData.map((item, index) => ({
      ...item,
      icon: icons[index],
    }));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePosition({ x, y });
      
      // 중앙 기준 상대 위치 계산
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const relativeX = (x - centerX) / centerX;
      const relativeY = (y - centerY) / centerY;
      
      mouseX.set(relativeX * 50);
      mouseY.set(relativeY * 50);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      return () => container.removeEventListener("mousemove", handleMouseMove);
    }
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ pointerEvents: "auto" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 가운데 보고서 로봇 */}
      <motion.div
        className="absolute top-1/2 left-1/2 z-20"
        style={{
          x,
          y,
          rotateX: y,
          rotateY: x,
        }}
        animate={{
          scale: isHovered ? 1.1 : 1,
          rotateZ: [0, 5, -5, 0],
        }}
        transition={{
          rotateZ: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        <div className="relative">
          {/* 로봇 본체 */}
          <motion.div
            className="relative w-32 h-32 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl shadow-2xl flex items-center justify-center"
            style={{
              transformStyle: "preserve-3d",
              transform: `perspective(1000px) rotateX(${y.get() * 0.1}deg) rotateY(${x.get() * 0.1}deg)`,
            }}
            animate={{
              boxShadow: [
                "0 20px 60px rgba(6, 182, 212, 0.4)",
                "0 20px 80px rgba(59, 130, 246, 0.6)",
                "0 20px 60px rgba(6, 182, 212, 0.4)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <FileText className="w-16 h-16 text-white" />
            
            {/* 빛나는 효과 */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* 로봇 주변 파티클 */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 80;
            return (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-white rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  x: Math.cos(angle) * radius,
                  y: Math.sin(angle) * radius,
                }}
                animate={{
                  scale: [0.5, 1, 0.5],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            );
          })}

          {/* 로봇 눈 */}
          <motion.div
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex gap-2"
            style={{
              x: x.get() * 0.2,
            }}
          >
            <motion.div
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.2,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* 주변에 떠다니는 3D 아이템들 */}
      {floatingItems.map((item, index) => {
        const offsetX = (item.initialX / 100) * (containerRef.current?.offsetWidth || 0);
        const offsetY = (item.initialY / 100) * (containerRef.current?.offsetHeight || 0);
        
        return (
          <motion.div
            key={item.id}
            className="absolute"
            style={{
              left: `${item.initialX}%`,
              top: `${item.initialY}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotateZ: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3,
            }}
          >
            <motion.div
              className={`relative bg-gradient-to-br ${item.color} rounded-xl shadow-lg flex items-center justify-center p-3 text-white cursor-pointer`}
              style={{
                width: `${item.size}px`,
                height: `${item.size}px`,
                x: useTransform(mouseX, (v) => v * 0.3),
                y: useTransform(mouseY, (v) => v * 0.3),
                rotateX: useTransform(mouseY, (v) => v * 0.1),
                rotateY: useTransform(mouseX, (v) => v * 0.1),
              }}
              whileHover={{
                scale: 1.2,
                z: 50,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              }}
            >
              <div className="relative z-10 w-8 h-8">{item.icon}</div>
              
              {/* 반사 효과 */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 to-transparent"
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* 아이템 주변 빛나는 효과 */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-xl blur-xl opacity-30`}
              style={{
                width: `${item.size * 1.5}px`,
                height: `${item.size * 1.5}px`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        );
      })}

      {/* 마우스 커서 효과 */}
      {isHovered && (
        <motion.div
          className="absolute pointer-events-none z-30"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
            x: -10,
            y: -10,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-20 h-20 border-2 border-pink-400 rounded-full bg-pink-400/20 backdrop-blur-sm" />
        </motion.div>
      )}
    </div>
  );
}
