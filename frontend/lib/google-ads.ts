declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Ads 전환 이벤트 전송.
 * 마케팅 동의 시에만 gtag가 로드되므로, gtag 존재 시에만 호출하면 됨.
 */
export function trackConversion(sendTo?: string): void {
  if (typeof window === "undefined" || !window.gtag) return;
  const id = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  const target = sendTo ?? (id && label ? `${id}/${label}` : id);
  if (!target) return;
  window.gtag("event", "conversion", { send_to: target });
}
