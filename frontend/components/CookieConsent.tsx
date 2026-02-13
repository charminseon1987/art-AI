"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Settings, Check } from "lucide-react";
import { useTranslations } from "next-intl";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_CONSENT_KEY = "cookie-consent";
const COOKIE_PREFERENCES_KEY = "cookie-preferences";

export default function CookieConsent() {
  const t = useTranslations("cookie");
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
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
    applyCookiePreferences(allAccepted);
    window.dispatchEvent(new CustomEvent("cookie-consent-updated"));
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
    applyCookiePreferences(onlyNecessary);
    window.dispatchEvent(new CustomEvent("cookie-consent-updated"));
  };

  const handleSavePreferences = () => {
    if (typeof window === "undefined") return;
    localStorage.setItem(COOKIE_CONSENT_KEY, "custom");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
    setHasConsent(true);
    applyCookiePreferences(preferences);
    window.dispatchEvent(new CustomEvent("cookie-consent-updated"));
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    if (prefs.analytics) {
      console.log("Analytics cookies enabled");
    }
    if (prefs.marketing) {
      console.log("Marketing cookies enabled");
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "necessary") return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isMounted) {
    return null;
  }

  if (!showBanner && !showSettings) {
    if (hasConsent) {
      return (
        <button
          onClick={() => setShowSettings(true)}
          className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
          aria-label={t("settings")}
        >
          <Settings className="w-4 h-4" />
          {t("settings")}
        </button>
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full pointer-events-auto border border-gray-200">
        {showSettings ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{t("modalTitle")}</h2>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowBanner(false);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label={t("close")}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-6 text-sm">
              {t("modalDescription")}{" "}
              <Link href="/cookies" className="text-pink-600 hover:underline">
                {t("policyLink")}
              </Link>
            </p>

            {/* Necessary Cookies */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{t("necessary.title")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("necessary.description")}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">{t("necessary.status")}</span>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{t("analytics.title")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("analytics.description")}
                  </p>
                </div>
                <button
                  onClick={() => togglePreference("analytics")}
                  className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.analytics ? "bg-pink-600" : "bg-gray-300"
                    }`}
                  aria-label={t("analytics.title")}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.analytics ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{t("marketing.title")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("marketing.description")}
                  </p>
                </div>
                <button
                  onClick={() => togglePreference("marketing")}
                  className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.marketing ? "bg-pink-600" : "bg-gray-300"
                    }`}
                  aria-label={t("marketing.title")}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preferences.marketing ? "translate-x-6" : "translate-x-1"
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
                {t("save")}
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  setShowBanner(false);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {t("title")}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  {t("description")}{" "}
                  <Link
                    href="/cookies"
                    className="text-pink-600 hover:underline"
                  >
                    {t("policyLink")}
                  </Link>
                </p>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                aria-label={t("close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptAll}
                className="flex-1 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-fuchsia-700 transition-colors"
              >
                {t("acceptAll")}
              </button>
              <button
                onClick={handleRejectAll}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                {t("rejectNecessary")}
              </button>
              <button
                onClick={() => {
                  setShowSettings(true);
                  setShowBanner(false);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {t("settings")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
