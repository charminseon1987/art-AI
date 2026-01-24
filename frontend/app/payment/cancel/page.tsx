"use client";

import { XCircle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          결제가 취소되었습니다
        </h2>
        <p className="text-gray-600 mb-6">
          결제가 취소되었습니다.
          <br />
          언제든지 다시 결제하실 수 있습니다.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:via-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            홈으로 가기
          </Link>
          <button
            onClick={() => window.history.back()}
            className="block w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
