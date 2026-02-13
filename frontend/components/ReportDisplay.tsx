"use client";

import { FileText, Download } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReportDisplayProps {
  reportData: any;
}

export default function ReportDisplay({ reportData }: ReportDisplayProps) {
  const t = useTranslations("analysis.report");
  const observation = reportData.observation || {};
  const emotionalLanguage = reportData.emotional_language || {};
  const reflectionQuestions = reportData.reflection_questions || {};

  return (
    <div className="space-y-6">
      {/* 1️⃣ 그림에서 관찰된 점 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-600">1️⃣</span>
          {t("section1.title")}
        </h4>
        <ul className="space-y-2 text-gray-700">
          {observation.colors && observation.colors.length > 0 && (
            <li>
              {t("section1.colors")} (
              {observation.colors.slice(0, 3).join(", ")})
            </li>
          )}
          {observation.shapes && observation.shapes.length > 0 && (
            <li>
              {t("section1.shapes")} (
              {observation.shapes.slice(0, 2).join(", ")})
            </li>
          )}
          {observation.composition && <li>{t("section1.composition")}</li>}
        </ul>
      </div>

      {/* 2️⃣ 표현 방식 정리 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-600">2️⃣</span>
          {t("section2.title")}
        </h4>
        <ul className="space-y-2 text-gray-700">
          {emotionalLanguage.emotional_tone && (
            <li>• {emotionalLanguage.emotional_tone}</li>
          )}
          {observation.details && observation.details.length > 0 && (
            <li>• {observation.details[0]}</li>
          )}
        </ul>
      </div>

      {/* 3️⃣ 이야기로 이어질 수 있는 질문 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-blue-600">3️⃣</span>
          {t("section3.title")}
        </h4>
        <ol className="space-y-2 text-gray-700 list-decimal list-inside">
          {reflectionQuestions.questions &&
            reflectionQuestions.questions
              .slice(0, 5)
              .map((q: string, idx: number) => (
                <li key={idx} className="ml-4">
                  {q}
                </li>
              ))}
        </ol>
      </div>

      {/* 다운로드 버튼 */}
      <div className="flex gap-4">
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
          <Download className="w-5 h-5" />
          {t("download")}
        </button>
      </div>
    </div>
  );
}
