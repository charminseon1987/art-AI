"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PaymentCheckout from "@/components/PaymentCheckout";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
}

function PaymentLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const serviceId = searchParams.get("service_id");
  const amount = parseInt(searchParams.get("amount") || "0");
  const reservationId = searchParams.get("reservation_id");
  const paymentType = (searchParams.get("payment_type") ||
    "full") as "full" | "deposit" | "balance";

  useEffect(() => {
    // 필수 파라미터 확인
    if (!amount || amount <= 0) {
      alert("결제 금액이 올바르지 않습니다.");
      router.push("/");
      return;
    }
    setLoading(false);
  }, [amount, router]);

  if (loading) {
    return <PaymentLoading />;
  }

  const handleSuccess = (paymentId: string) => {
    // 결제 성공 후 처리
    router.push(`/payment/success?payment_id=${paymentId}`);
  };

  const handleCancel = () => {
    router.push("/payment/cancel");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>돌아가기</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">결제</h1>
          <p className="text-gray-600 mt-2">
            안전하고 빠른 결제를 진행해주세요.
          </p>
        </div>

        {/* 결제 정보 요약 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">결제 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">결제 유형</span>
              <span className="font-semibold text-gray-800">
                {paymentType === "deposit"
                  ? "예약금"
                  : paymentType === "balance"
                  ? "잔금"
                  : "전액"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 금액</span>
              <span className="text-2xl font-bold text-gray-800">
                {amount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 결제 컴포넌트 */}
        <PaymentCheckout
          serviceId={serviceId || undefined}
          amount={amount}
          reservationId={reservationId || undefined}
          paymentType={paymentType}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />

        {/* 안내 사항 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            결제 안내
          </h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• 결제는 Stripe를 통해 안전하게 처리됩니다.</li>
            <li>• 결제 완료 후 자동으로 확인됩니다.</li>
            <li>• 문제가 발생하면 고객센터로 문의해주세요.</li>
            <li>• 환불은 관리자 승인 후 처리됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
