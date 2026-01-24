"use client";

import { useState } from "react";
import {
  MessageCircle,
  Calendar,
  Send,
  MailOpen,
  PhoneCall,
} from "lucide-react";
import { submitContact } from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    childAge: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitContact(
        formData.name,
        formData.phone,
        formData.childAge,
        formData.message
      );

      alert("문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.");

      // 폼 초기화
      setFormData({
        name: "",
        phone: "",
        childAge: "",
        message: "",
      });
    } catch (error: any) {
      alert("문의 접수 중 오류가 발생했습니다: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            문의하기
          </h1>
          <p className="text-lg text-gray-600">
            궁금한 점은 언제든 편하게 문의 주세요.
            <br />
            아이 이야기는 천천히 들어도 괜찮습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-8 rounded-2xl shadow-lg border border-amber-100 text-center hover:shadow-xl transition-all duration-300">
            <MailOpen className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              이메일 문의
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              문의 사항은 이메일로 보내주세요.
            </p>
            <a
              href="mailto:lovetree914@naver.com?subject=미술 수업 문의&body=안녕하세요. 문의드립니다."
              className="group inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-800 px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 transform"
            >
              <MailOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>이메일 보내기</span>
            </a>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg border border-green-100 text-center hover:shadow-xl transition-all duration-300">
            <PhoneCall className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">전화 문의</h3>
            <p className="text-gray-600 mb-4 text-sm">
              전화 문의는 오전 10시부터 오후 5시까지 가능합니다.
            </p>
            <a
              href="tel:010-4159-1102"
              className="group inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 transform"
            >
              <PhoneCall className="w-5 h-5 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
              <span>전화 걸기</span>
            </a>
          </div>
        </div>

        {/* 간단 문의 폼 */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl shadow-lg border border-pink-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            간단 문의 폼
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
                style={{ color: "black" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락처
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
                style={{ color: "black" }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이 연령
              </label>
              <select
                value={formData.childAge}
                onChange={(e) =>
                  setFormData({ ...formData, childAge: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
                style={{ color: "black" }}
              >
                <option value="">선택하세요</option>
                <option>5세</option>
                <option>6세</option>
                <option>7세</option>
                <option>8세</option>
                <option>9세</option>
                <option>10세</option>
                <option>11세</option>
                <option>12세 이상</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                문의 내용
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
                style={{ color: "black" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group w-full bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 transform flex items-center justify-center gap-2"
            >
              {submitting ? "접수 중..." : "문의하기"}
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
