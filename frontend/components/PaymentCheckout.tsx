"use client";

import { useState, useEffect } from "react";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { createPaymentSession, verifyPayment } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

// Stripe publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentCheckoutProps {
  serviceId?: string;
  amount: number;
  reservationId?: string;
  paymentType?: "full" | "deposit" | "balance";
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}

function CheckoutForm({
  amount,
  onSuccess,
  onCancel,
}: {
  amount: number;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "결제 정보를 확인할 수 없습니다.");
        setIsProcessing(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message || "결제 처리 중 오류가 발생했습니다.");
        setPaymentStatus("failed");
      } else {
        setPaymentStatus("success");
        // 결제 성공 시 콜백 호출
        if (onSuccess) {
          // PaymentIntent ID는 elements에서 가져올 수 없으므로
          // 세션 ID를 URL에서 가져오거나 다른 방법 사용
          setTimeout(() => {
            onSuccess("");
          }, 1000);
        }
      }
    } catch (err: any) {
      setError(err.message || "결제 처리 중 오류가 발생했습니다.");
      setPaymentStatus("failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentStatus === "success") {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          결제가 완료되었습니다!
        </h3>
        <p className="text-gray-600">
          결제가 성공적으로 처리되었습니다.
        </p>
      </div>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <div className="text-center py-8">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          결제에 실패했습니다
        </h3>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <button
          onClick={() => {
            setPaymentStatus("idle");
            setError(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isProcessing}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:via-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              처리 중...
            </>
          ) : (
            <>
              {amount.toLocaleString()}원 결제하기
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function PaymentCheckout({
  serviceId,
  amount,
  reservationId,
  paymentType = "full",
  onSuccess,
  onCancel,
}: PaymentCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createSession = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await createPaymentSession({
          service_id: serviceId,
          amount: amount,
          reservation_id: reservationId,
          payment_type: paymentType,
        });

        // Stripe Checkout을 사용하는 경우, 세션 URL로 리다이렉트
        if (result.checkout_url) {
          window.location.href = result.checkout_url;
          return;
        }

        // Payment Element를 사용하는 경우 clientSecret 필요
        // 현재는 Checkout Session을 사용하므로 이 부분은 사용하지 않음
        setError("결제 세션을 생성할 수 없습니다.");
      } catch (err: any) {
        console.error("결제 세션 생성 오류:", err);
        setError(err.message || "결제 세션 생성 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    createSession();
  }, [serviceId, amount, reservationId, paymentType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">결제 세션을 준비하는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          오류가 발생했습니다
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // Checkout Session을 사용하므로 이 컴포넌트는 리다이렉트 후에는 표시되지 않음
  // Payment Element를 사용하려면 clientSecret이 필요함
  if (!clientSecret) {
    return null;
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "stripe",
    },
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">결제 정보</h2>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">결제 금액</span>
            <span className="text-2xl font-bold text-gray-800">
              {amount.toLocaleString()}원
            </span>
          </div>
        </div>

        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            amount={amount}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </div>
    </div>
  );
}
