"use client";

import { useState, useEffect } from "react";

interface PhoneAuthProps {
  onSuccess: (userData: {
    sessionToken: string;
    user: {
      id: string;
      phone_number: string;
      role: string;
      name: string;
    };
    expiresAt: string;
    isNewUser: boolean;
  }) => void;
  onCancel?: () => void;
}

export default function PhoneAuth({ onSuccess, onCancel }: PhoneAuthProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for verification code expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as 010-xxxx-xxxx
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 7) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const digits = e.target.value.replace(/\D/g, "");
    if (digits.length <= 6) {
      setVerificationCode(digits);
    }
  };

  const requestVerificationCode = async () => {
    setError("");

    // Validate phone number format
    const phoneDigits = phoneNumber.replace(/\D/g, "");
    if (!phoneDigits.startsWith("010") || phoneDigits.length !== 11) {
      setError("올바른 휴대폰 번호를 입력해주세요. (010-xxxx-xxxx)");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/api/auth/phone/request-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            phone_number: phoneNumber,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setStep(2);
        setCountdown(300); // 5 minutes = 300 seconds
        setVerificationCode("");
      } else {
        setError(data.error || "인증번호 전송에 실패했습니다.");
      }
    } catch (err) {
      console.error("Request code error:", err);
      setError("인증번호 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError("");

    if (verificationCode.length !== 6) {
      setError("6자리 인증번호를 입력해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL}/api/auth/phone/verify-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            phone_number: phoneNumber,
            code: verificationCode,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Store session token in localStorage
        localStorage.setItem("session_token", data.session_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Call success callback
        onSuccess({
          sessionToken: data.session_token,
          user: data.user,
          expiresAt: data.expires_at,
          isNewUser: data.is_new_user,
        });
      } else {
        setError(data.error || "인증에 실패했습니다.");
      }
    } catch (err) {
      console.error("Verify code error:", err);
      setError("인증 확인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (verificationCode.length === 6 && step === 2) {
      verifyCode();
    }
  }, [verificationCode]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {step === 1 ? "휴대폰 인증" : "인증번호 확인"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              휴대폰 번호
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              onKeyPress={(e) => handleKeyPress(e, requestVerificationCode)}
              placeholder="010-0000-0000"
              maxLength={13}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500">
              입력하신 번호로 인증번호가 전송됩니다.
            </p>

            <button
              onClick={requestVerificationCode}
              disabled={loading || !phoneNumber}
              className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "전송 중..." : "인증번호 받기"}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-medium">{phoneNumber}</span>로<br />
              인증번호를 전송했습니다.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              인증번호 (6자리)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={verificationCode}
              onChange={handleCodeChange}
              onKeyPress={(e) => handleKeyPress(e, verifyCode)}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest text-gray-800"
              disabled={loading || countdown === 0}
              autoFocus
            />

            {countdown > 0 ? (
              <p className="mt-2 text-sm text-purple-600 text-center">
                남은 시간: <span className="font-bold">{formatCountdown(countdown)}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-red-600 text-center">
                인증번호가 만료되었습니다. 다시 요청해주세요.
              </p>
            )}

            <button
              onClick={verifyCode}
              disabled={loading || verificationCode.length !== 6 || countdown === 0}
              className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "확인 중..." : "인증하기"}
            </button>

            <button
              onClick={() => {
                setStep(1);
                setVerificationCode("");
                setCountdown(0);
                setError("");
              }}
              className="w-full mt-3 text-gray-600 text-sm hover:text-gray-800"
              disabled={loading}
            >
              다른 번호로 인증하기
            </button>
          </div>
        )}

        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full mt-4 text-gray-500 text-sm hover:text-gray-700"
            disabled={loading}
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
}
