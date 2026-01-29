"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    // URL 파라미터에서 세션 정보 확인 (카카오 로그인 콜백)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionParam = urlParams.get("session");
    const userParam = urlParams.get("user");
    const errorParam = urlParams.get("error");

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }

    if (sessionParam && userParam) {
      try {
        const session = JSON.parse(sessionParam);
        const user = JSON.parse(userParam);

        // 세션 저장
        supabase.auth.setSession(session).then(() => {
          if (user.role === "admin" || user.role === "supervisor") {
            sessionStorage.setItem("user_role", user.role);
            sessionStorage.setItem("user_email", user.email);
            router.push("/admin");
          } else {
            setError("관리자 또는 슈퍼바이저 권한이 필요합니다.");
            supabase.auth.signOut();
          }
        });
      } catch (e) {
        console.error("세션 파싱 오류:", e);
      }
    } else {
      // 이미 로그인되어 있는지 확인
      checkSession();
    }
  }, []);

  const checkSession = async () => {
    const user = await getCurrentUser();
    if (user && (user.role === "admin" || user.role === "supervisor")) {
      router.push("/admin");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        // 회원가입
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (data.success) {
          alert("회원가입이 완료되었습니다. 로그인해주세요.");
          setIsSignUp(false);
          setPassword("");
        } else {
          setError(data.error || "회원가입에 실패했습니다.");
        }
      } else {
        // 로그인
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
          // 세션 저장
          if (data.session) {
            await supabase.auth.setSession(data.session);
          }

          // 역할 확인
          if (data.user.role === "admin" || data.user.role === "supervisor") {
            sessionStorage.setItem("user_role", data.user.role);
            sessionStorage.setItem("user_email", data.user.email);
            router.push("/admin");
          } else {
            setError("관리자 또는 슈퍼바이저 권한이 필요합니다.");
            await supabase.auth.signOut();
          }
        } else {
          setError(data.error || "로그인에 실패했습니다.");
        }
      }
    } catch (error: any) {
      setError("처리 중 오류가 발생했습니다.");
      console.error("인증 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isSignUp ? "회원가입" : "관리자 로그인"}
            </h1>
            <p className="text-gray-600 text-sm">
              {isSignUp
                ? "새 계정을 생성하세요"
                : "관리자 또는 슈퍼바이저 권한이 필요합니다"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="이름을 입력하세요"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              {loading ? "처리 중..." : isSignUp ? "회원가입" : "로그인"}
            </button>
          </form>


          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setPassword("");
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp
                ? "이미 계정이 있으신가요? 로그인"
                : "계정이 없으신가요? 회원가입"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
