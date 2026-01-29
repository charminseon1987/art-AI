"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Palette,
  Home,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Search,
  Menu,
  X,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "홈", icon: Home },
    { href: "/counseling", label: "그림 분석", icon: MessageSquare },
    // { href: "/fingerprint", label: "지문 분석", icon: Search },
    { href: "/contact", label: "문의", icon: Mail },
  ];

  // 관리자 페이지는 별도로 표시
  const isAdminPage = pathname === "/admin";

  // 모바일 메뉴 토글
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 링크 클릭 시 모바일 메뉴 닫기
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // 스크롤 상태에 따른 스타일 값 (아이폰 스타일 글라스 효과)
  const navStyle = {
    backdropFilter: isScrolled
      ? "blur(40px) saturate(200%)"
      : "blur(30px) saturate(180%)",
    WebkitBackdropFilter: isScrolled
      ? "blur(40px) saturate(200%)"
      : "blur(30px) saturate(180%)",
    backgroundColor: isScrolled
      ? "rgba(255, 255, 255, 0.8)"
      : "rgba(255, 255, 255, 0.4)",
    backgroundImage: isScrolled
      ? "linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)"
      : "linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)",
    boxShadow: isScrolled
      ? `
        0 8px 32px 0 rgba(31, 38, 135, 0.25),
        0 2px 8px 0 rgba(0, 0, 0, 0.1),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.8),
        inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)
      `
      : `
        0 4px 16px 0 rgba(31, 38, 135, 0.15),
        0 1px 4px 0 rgba(0, 0, 0, 0.05),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
        inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)
      `,
    borderBottom: isScrolled
      ? "1px solid rgba(255, 255, 255, 0.5)"
      : "1px solid rgba(255, 255, 255, 0.3)",
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <nav className="sticky top-0 z-50" style={navStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link
            href="/"
            className={`flex items-center gap-2 text-xl font-bold transition-colors ${
              isScrolled
                ? "text-gray-800 hover:text-pink-600"
                : "text-white hover:text-pink-200"
            }`}
            onClick={closeMobileMenu}
          >
            <Palette
              className={`w-6 h-6 ${isScrolled ? "text-pink-600" : "text-pink-300"}`}
            />
            <span className="hidden sm:inline">Analyist AI Agent</span>
            <span className="sm:hidden">미술교실</span>
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-md"
                      : isScrolled
                        ? "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                        : "text-white hover:bg-white/20 hover:text-pink-200"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "" : isScrolled ? "text-gray-700" : "text-white"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* 모바일 햄버거 버튼 */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`transition-colors p-2 rounded-lg ${
                isScrolled
                  ? "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                  : "text-white hover:text-pink-200 hover:bg-white/20"
              }`}
              aria-label="메뉴 열기"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 드롭다운 */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className="px-4 pt-2 pb-4 space-y-2"
          style={{
            backdropFilter: isScrolled
              ? "blur(40px) saturate(200%)"
              : "blur(30px) saturate(180%)",
            WebkitBackdropFilter: isScrolled
              ? "blur(40px) saturate(200%)"
              : "blur(30px) saturate(180%)",
            backgroundColor: isScrolled
              ? "rgba(255, 255, 255, 0.8)"
              : "rgba(255, 255, 255, 0.4)",
            backgroundImage: isScrolled
              ? "linear-gradient(to bottom, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)"
              : "linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)",
            boxShadow: isScrolled
              ? `
                0 8px 32px 0 rgba(31, 38, 135, 0.25),
                0 2px 8px 0 rgba(0, 0, 0, 0.1),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.8),
                inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)
              `
              : `
                0 4px 16px 0 rgba(31, 38, 135, 0.15),
                0 1px 4px 0 rgba(0, 0, 0, 0.05),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
                inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)
              `,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-lg transform scale-[1.02]"
                    : isScrolled
                      ? "text-gray-700 hover:bg-pink-100 hover:text-pink-600 active:scale-95"
                      : "text-white hover:bg-white/20 hover:text-pink-200 active:scale-95"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "" : isScrolled ? "text-gray-700" : "text-white"}`}
                />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* 모바일 관리자 링크 */}
          {!isAdminPage && (
            <Link
              href="/admin"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mt-4 border-t pt-4 ${
                isScrolled
                  ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-gray-200"
                  : "text-white/80 hover:bg-white/20 hover:text-white border-white/20"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">관리자</span>
            </Link>
          )}
        </div>
      </div>

      {/* 데스크톱 관리자 링크
      {!isAdminPage && (
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
          <Link
            href="/admin"
            className="text-xs text-gray-500 hover:text-pink-600 flex items-center gap-1 transition-colors"
          >
            <FileText className="w-3 h-3" />
            관리자
          </Link>
        </div>
      )} */}
    </nav>
  );
}
