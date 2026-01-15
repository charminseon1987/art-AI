import { useState, useEffect, useRef } from "react";

interface MousePosition {
  x: number; // -1 to 1
  y: number; // -1 to 1
  rawX: number; // actual pixel position
  rawY: number; // actual pixel position
}

interface Use3DMouseOptions {
  elementRef?: React.RefObject<HTMLElement>;
  intensity?: number; // 0 to 1, default 1
  disabled?: boolean;
}

export function use3DMouse(options: Use3DMouseOptions = {}) {
  const { elementRef, intensity = 1, disabled = false } = options;
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    rawX: 0,
    rawY: 0,
  });
  const rafId = useRef<number | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const target = elementRef?.current || targetRef.current || document.documentElement;
        const rect = target.getBoundingClientRect();
        
        // Calculate normalized coordinates (-1 to 1)
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

        setMousePosition({
          x: x * intensity,
          y: y * intensity,
          rawX: e.clientX - rect.left,
          rawY: e.clientY - rect.top,
        });
      });
    };

    const handleMouseLeave = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        setMousePosition({
          x: 0,
          y: 0,
          rawX: 0,
          rawY: 0,
        });
      });
    };

    const target = elementRef?.current || document.documentElement;
    targetRef.current = target;

    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && !options.disabled) {
      // For mobile, use touch events with reduced intensity
      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          const rect = target.getBoundingClientRect();
          
          const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          const y = ((touch.clientY - rect.top) / rect.height) * 2 - 1;

          setMousePosition({
            x: x * intensity * 0.5, // Reduced intensity for mobile
            y: y * intensity * 0.5,
            rawX: touch.clientX - rect.left,
            rawY: touch.clientY - rect.top,
          });
        }
      };

      target.addEventListener("touchmove", handleTouchMove);
      target.addEventListener("touchend", handleMouseLeave);

      return () => {
        target.removeEventListener("touchmove", handleTouchMove);
        target.removeEventListener("touchend", handleMouseLeave);
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }
      };
    }

    target.addEventListener("mousemove", handleMouseMove);
    target.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      target.removeEventListener("mousemove", handleMouseMove);
      target.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [elementRef, intensity, disabled]);

  return mousePosition;
}
