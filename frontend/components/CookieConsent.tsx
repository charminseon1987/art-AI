"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Settings, Check, X as XIcon } from "lucide-react";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_CONSENT_KEY = "cookie-consent";
const COOKIE_PREFERENCES_KEY = "cookie-preferences";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // 항상 true (필수)
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // 클라이언트에서만 실행
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setShowBanner(true);
        setHasConsent(false);
      } else {
        setHasConsent(true);
        const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
        if (savedPreferences) {
          try {
            setPreferences(JSON.parse(savedPreferences));
          } catch (e) {
            console.error("Failed to parse cookie preferences", e);
          }
        }
      }
    }
  }, []);

  const handleAcceptAll = () => {
    if (typeof window === "undefined") return;
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(allAccepted));
    setShowBanner(false);
    setShowSettings(false);
    setHasConsent(true);
    // 쿠키 설정 적용
    applyCookiePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    if (typeof window === "undefined") return;
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(onlyNecessary));
    setShowBanner(false);
    setShowSettings(false);
    setHasConsent(true);
    // 쿠키 설정 적용
    applyCookiePreferences(onlyNecessary);
  };

  const handleSavePreferences = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem(COOKIE_CONSENT_KEY, "custom");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
    setHasConsent(true);
    // 쿠키 설정 적용
    applyCookiePreferences(preferences);
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // 실제 쿠키 설정 로직 (필요시 구현)
    // 예: Google Analytics, 마케팅 툴 등
    if (prefs.analytics) {
      // 분석 쿠키 활성화
      console.log("Analytics cookies enabled");
    }
    if (prefs.marketing) {
      // 마케팅 쿠키 활성화
      console.log("Marketing cookies enabled");
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return; // 필수 쿠키는 변경 불가
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 서버 사이드 렌더링 중에는 아무것도 표시하지 않음
  if (!isMounted) {
    return null;
  }

  if (!showBanner && !showSettings) {
    // 설정 변경 버튼 (항상 표시)
    if (hasConsent) {
      return (
        <button
          onClick={() => setShowSettings(true)}
          className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
          aria-label="쿠키 설정 변경"
        >
          <Settings className="w-4 h-4" />
          쿠키 설정
        </button>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full pointer-events-auto border border-gray-200">
        {showSettings ? (
          // 상세 설정 모드
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">쿠키 설정</h2>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowBanner(false);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="닫기"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-6 text-sm">
              쿠키 사용에 대한 선택권을 가지고 있습니다. 아래에서 각 카테고리별로
              쿠키 사용을 허용하거나 거부할 수 있습니다.{" "}
              <Link href="/cookies" className="text-pink-600 hover:underline">
                쿠키 정책
              </Link>
              을 참고하세요.
            </p>

            {/* 필수 쿠키 */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">필수 쿠키</h3>
                  <p className="text-sm text-gray-600">
                    서비스 제공을 위해 반드시 필요한 쿠키입니다.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">항상 활성</span>
                </div>
              </div>
            </div>

            {/* 분석 쿠키 */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">분석 쿠키</h3>
                  <p className="text-sm text-gray-600">
                    서비스 이용 통계 및 개선을 위한 쿠키입니다.
                  </p>
                </div>
                <button
                  onClick={() => togglePreference("analytics")}
                  className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.analytics ? "bg-pink-600" : "bg-gray-300"
                  }`}
                  aria-label="분석 쿠키 토글"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.analytics ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 마케팅 쿠키 */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">마케팅 쿠키</h3>
                  <p className="text-sm text-gray-600">
                    맞춤형 광고 및 마케팅을 위한 쿠키입니다.
                  </p>
                </div>
                <button
                  onClick={() => togglePreference("marketing")}
                  className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.marketing ? "bg-pink-600" : "bg-gray-300"
                  }`}
                  aria-label="마케팅 쿠키 토글"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.marketing ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSavePreferences}
                className="flex-1 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-fuchsia-700 transition-colors"
              >
                설정 저장
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowBanner(false);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          // 배너 모드
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  쿠키 사용 동의
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  저희는 서비스 제공 및 개선을 위해 쿠키를 사용합니다. 필수 쿠키는
                  서비스 제공을 위해 필요하며, 선택적 쿠키는 동의하신 경우에만
                  사용됩니다.{" "}
                  <Link
                    href="/cookies"
                    className="text-pink-600 hover:underline"
                  >
                    쿠키 정책
                  </Link>
                  을 확인하세요.
                </p>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptAll}
                className="flex-1 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-fuchsia-700 transition-colors"
              >
                모두 허용
              </button>
              <button
                onClick={handleRejectAll}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                필수만 허용
              </button>
              <button
                onClick={() => {
                  setShowSettings(true);
                  setShowBanner(false);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                설정
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
