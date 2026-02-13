"use client";

import { useEffect, useRef } from "react";

const COOKIE_PREFERENCES_KEY = "cookie-preferences";
const COOKIE_CONSENT_KEY = "cookie-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function hasMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!consent) return false;
  const prefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (!prefs) return false;
  try {
    const parsed = JSON.parse(prefs) as { marketing?: boolean };
    return parsed.marketing === true;
  } catch {
    return false;
  }
}

function loadGoogleAdsScript(id: string) {
  if (typeof window === "undefined" || !id || id.startsWith("AW-123456789")) return;
  if (window.gtag) {
    window.gtag("config", id);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", id);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
}

export default function GoogleAdsScript() {
  const loadedRef = useRef(false);

  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    if (!id) return;

    const tryLoad = () => {
      if (loadedRef.current) return;
      if (!hasMarketingConsent()) return;
      loadedRef.current = true;
      loadGoogleAdsScript(id);
    };

    tryLoad();

    const handleConsentUpdate = () => {
      if (loadedRef.current) return;
      if (hasMarketingConsent()) {
        loadedRef.current = true;
        loadGoogleAdsScript(id);
      }
    };

    window.addEventListener("cookie-consent-updated", handleConsentUpdate);
    return () => window.removeEventListener("cookie-consent-updated", handleConsentUpdate);
  }, []);

  return null;
}
