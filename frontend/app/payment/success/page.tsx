"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { verifyPayment } from "@/lib/api";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get("session_id");
  const paymentId = searchParams.get("payment_id");
  const checkoutId = searchParams.get("checkout_id");

  useEffect(() => {
    const verify = async () => {
      // Polar.sh checkout_id가 있는 경우 바로 성공 처리
      if (checkoutId) {
        setVerified(true);
        setVerifying(false);
        return;
      }

      // Stripe session_id가 있는 경우 기존 검증 로직 사용
      if (!sessionId) {
        setError("결제 세션 ID가 없습니다.");
        setVerifying(false);
        return;
      }

      try {
        setVerifying(true);
        const result = await verifyPayment(sessionId);

        if (result.success) {
          setVerified(true);
        } else {
          setError(result.message || "결제 확인에 실패했습니다.");
        }
      } catch (err: any) {
        console.error("결제 확인 오류:", err);
        setError(err.message || "결제 확인 중 오류가 발생했습니다.");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [sessionId, checkoutId]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">결제를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            결제 확인 실패
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              홈으로
            </Link>
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          결제가 완료되었습니다!
        </h2>
        <p className="text-gray-600 mb-6">
          결제가 성공적으로 처리되었습니다.
          <br />
          감사합니다.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="flex w-full px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:via-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl items-center justify-center gap-2"
          >
            홈으로 가기
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/admin"
            className="block w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            관리자 페이지
          </Link>
        </div>
      </div>
    </div>
  );
}
