"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Palette,
  Home,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Search,
} from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

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

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-gray-800"
          >
            <Palette className="w-6 h-6 text-blue-600" />
            <span>미술 수업 & 그림 상담</span>
          </Link>

          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 관리자 링크 (하단) */}
      {!isAdminPage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-2">
          <Link
            href="/admin"
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            관리자
          </Link>
        </div>
      )}
    </nav>
  );
}
