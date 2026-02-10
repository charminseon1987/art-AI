"use client";

import NextLink from "next/link";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import {
  Palette,
  Home,
  MessageSquare,
  Mail,
  Menu,
  X,
  FileText,
} from "lucide-react";
import { routing } from "@/i18n/routing";

export default function Navigation() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/counseling", label: t("artAnalysis"), icon: MessageSquare },
    { href: "/contact", label: t("contact"), icon: Mail },
  ];

  const isAdminPage = pathname === "/admin";

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
      ? "0 8px 32px 0 rgba(31, 38, 135, 0.25), 0 2px 8px 0 rgba(0, 0, 0, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)"
      : "0 4px 16px 0 rgba(31, 38, 135, 0.15), 0 1px 4px 0 rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)",
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
            <span className="hidden sm:inline">{t("brandName")}</span>
            <span className="sm:hidden">{t("brandNameMobile")}</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
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
            <div
              className={`ml-2 flex items-center gap-1 border-l pl-2 ${isScrolled ? "border-gray-200" : "border-white/30"}`}
            >
              {routing.locales.map((loc) => (
                <Link
                  key={loc}
                  href={pathname === "/admin" ? "/" : (pathname || "/")}
                  locale={loc}
                  className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                    locale === loc
                      ? "bg-pink-500/20 text-pink-600 font-semibold"
                      : isScrolled
                        ? "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                        : "text-white/90 hover:text-pink-200 hover:bg-white/20"
                  }`}
                >
                  {loc.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <div
              className={`flex items-center gap-1 ${isScrolled ? "text-gray-700" : "text-white"}`}
            >
              {routing.locales.map((loc) => (
                <Link
                  key={loc}
                  href={pathname === "/admin" ? "/" : (pathname || "/")}
                  locale={loc}
                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${locale === loc ? "underline font-semibold" : ""}`}
                >
                  {loc.toUpperCase()}
                </Link>
              ))}
            </div>
            <button
              onClick={toggleMobileMenu}
              className={`transition-colors p-2 rounded-lg ${
                isScrolled
                  ? "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                  : "text-white hover:text-pink-200 hover:bg-white/20"
              }`}
              aria-label={t("openMenu")}
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

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className="px-4 pt-2 pb-4 space-y-2"
          style={{
            ...navStyle,
            boxShadow: undefined,
            borderBottom: undefined,
            borderTop: undefined,
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
          {!isAdminPage && (
            <NextLink
              href="/admin"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mt-4 border-t pt-4 ${
                isScrolled
                  ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-gray-200"
                  : "text-white/80 hover:bg-white/20 hover:text-white border-white/20"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">{t("admin")}</span>
            </NextLink>
          )}
        </div>
      </div>
    </nav>
  );
}
