"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  const navItems = [
    { href: "/", label: "홈", icon: Home },
    { href: "/class", label: "미술 수업", icon: Palette },
    { href: "/counseling", label: "그림 상담", icon: MessageSquare },
    { href: "/fingerprint", label: "지문상담", icon: Search },
    { href: "/consultation", label: "상담·수업 안내", icon: Phone },
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

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-pink-600 transition-colors"
            onClick={closeMobileMenu}
          >
            <Palette className="w-6 h-6 text-pink-600" />
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
                      : "text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* 모바일 햄버거 버튼 */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-pink-600 transition-colors p-2 rounded-lg hover:bg-pink-50"
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
        <div className="px-4 pt-2 pb-4 space-y-2 bg-gradient-to-b from-white to-pink-50">
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
                    : "text-gray-700 hover:bg-pink-100 hover:text-pink-600 active:scale-95"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* 모바일 관리자 링크 */}
          {!isAdminPage && (
            <Link
              href="/admin"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 mt-4 border-t border-gray-200 pt-4"
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">관리자</span>
            </Link>
          )}
        </div>
      </div>

      {/* 데스크톱 관리자 링크 */}
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
      )}
    </nav>
  );
}
