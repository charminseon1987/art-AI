"use client";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("contact");
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

      alert(t("form.success"));

      // 폼 초기화
      setFormData({
        name: "",
        phone: "",
        childAge: "",
        message: "",
      });
    } catch (error: any) {
      alert(t("form.error") + ": " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 whitespace-pre-line">
            {t("subtitle")}
          </p>
        </div>

        <div className="mb-12">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-8 rounded-2xl shadow-lg border border-amber-100 text-center hover:shadow-xl transition-all duration-300 max-w-md mx-auto">
            <MailOpen className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {t("email.title")}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              {t("email.description")}
            </p>
            <a
              href="mailto:lovetree914@naver.com?subject=미술 수업 문의&body=안녕하세요. 문의드립니다."
              className="group inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-800 px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 transform"
            >
              <MailOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{t("email.button")}</span>
            </a>
          </div>
        </div>

        {/* 간단 문의 폼 */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl shadow-lg border border-pink-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {t("form.title")}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("form.name")}
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
                {t("form.phone")}
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
                {t("form.childAge")}
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
                <option value="">{t("form.select")}</option>
                <option>5{t("age.unit")}</option>
                <option>6{t("age.unit")}</option>
                <option>7{t("age.unit")}</option>
                <option>8{t("age.unit")}</option>
                <option>9{t("age.unit")}</option>
                <option>10{t("age.unit")}</option>
                <option>11{t("age.unit")}</option>
                <option>12{t("age.older")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("form.message")}
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
              {submitting ? t("form.submitting") : t("form.submit")}
              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
