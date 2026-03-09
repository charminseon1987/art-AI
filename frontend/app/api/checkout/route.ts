export const runtime = "edge";
import { NextRequest } from "next/server";
import { Checkout } from "@polar-sh/nextjs";

const accessToken = process.env.POLAR_ACCESS_TOKEN;
const rawSuccessUrl = process.env.POLAR_SUCCESS_URL;
// Polar 요구사항: successUrl은 반드시 절대 URL (https://...) 이어야 함
const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_URL?.replace(/^/, "https://") ||
  "http://localhost:3000";
const successUrl =
  rawSuccessUrl?.startsWith("http") === true
    ? rawSuccessUrl
    : `${baseUrl.replace(/\/$/, "")}/payment/success?checkout_id={CHECKOUT_ID}`;

const polarHandler = Checkout({
  accessToken: accessToken ?? undefined,
  successUrl,
  server: (process.env.POLAR_SERVER || process.env.POLAR_ENV) === "production" ? "production" : "sandbox",
});

export const GET = async (request: NextRequest) => {
  if (!accessToken?.trim()) {
    console.error("[Polar] POLAR_ACCESS_TOKEN이 설정되지 않았습니다.");
    return new Response(
      JSON.stringify({
        error: "결제 설정 오류",
        message:
          "POLAR_ACCESS_TOKEN 환경 변수를 설정해주세요. (.env.local 또는 배포 환경 변수)",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
  if (!rawSuccessUrl?.startsWith("http")) {
    console.warn(
      "[Polar] POLAR_SUCCESS_URL이 절대 URL이 아닙니다. baseUrl 기준으로 사용합니다:",
      successUrl
    );
  }
  return polarHandler(request);
};
