import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle, MessageCircle, MailOpen, PhoneCall, Sparkles, Users, Palette, Calendar, Heart } from "lucide-react";

export default function ConsultationPage() {
  const t = useTranslations("consultation");

  const steps = [
    {
      num: "1",
      title: t("step1Title"),
      description: t("step1Description"),
      icon: Sparkles,
      color: "from-purple-500 to-fuchsia-600",
      bgColor: "from-purple-50 to-fuchsia-50",
      borderColor: "border-purple-500",
    },
    {
      num: "2",
      title: t("step2Title"),
      description: t("step2Description"),
      icon: Users,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-500",
    },
    {
      num: "3",
      title: t("step3Title"),
      description: t("step3Description"),
      icon: Palette,
      color: "from-pink-500 to-rose-600",
      bgColor: "from-pink-50 to-rose-50",
      borderColor: "border-pink-500",
    },
    {
      num: "4",
      title: t("step4Title"),
      description: t("step4Description"),
      icon: Calendar,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-500",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {t("title")}
          </h1>
        </div>

        {/* 문의하기 - 상단 배치 */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-8 rounded-2xl shadow-lg border border-amber-100 text-center hover:shadow-xl transition-all duration-300">
            <MailOpen className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{t("emailInquiry")}</h3>
            <p className="text-gray-600 mb-4 text-sm">
              {t("emailDescription")}
            </p>
            <a
              href="mailto:lovetree914@naver.com?subject=미술 수업 문의&body=안녕하세요. 문의드립니다."
              className="group inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-800 px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 transform"
            >
              <MailOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>{t("sendEmail")}</span>
            </a>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg border border-green-100 text-center hover:shadow-xl transition-all duration-300">
            <PhoneCall className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{t("phoneConsultation")}</h3>
            <p className="text-gray-600 mb-4 text-sm">
              {t("phoneDescription")}
            </p>
            <a
              href="tel:010-4159-1102"
              className="group inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 transform"
            >
              <PhoneCall className="w-5 h-5 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
              <span>{t("makeCall")}</span>
            </a>
          </div>
        </div>

        {/* 진행 흐름 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            {t("processFlow")}
          </h2>
          <div className="space-y-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className={`relative bg-gradient-to-br ${step.bgColor} p-8 rounded-2xl shadow-lg border-l-8 ${step.borderColor} hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="flex items-start gap-6">
                    {/* 아이콘과 번호 */}
                    <div className="flex-shrink-0">
                      <div className={`relative bg-gradient-to-br ${step.color} p-4 rounded-2xl shadow-lg`}>
                        <Icon className="w-10 h-10 text-white" />
                        <div className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-gray-800 shadow-md border-2 border-gray-200">
                          {step.num}
                        </div>
                      </div>
                    </div>

                    {/* 내용 */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* 연결선 (마지막 항목 제외) */}
                  {idx < steps.length - 1 && (
                    <div className="absolute left-[52px] bottom-0 transform translate-y-full h-6 w-1 bg-gradient-to-b from-gray-300 to-transparent"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 상담에 대해 */}
        <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 border-l-8 border-pink-500 p-8 rounded-2xl shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-3 rounded-xl">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{t("aboutConsultation")}</h2>
              <p className="text-lg text-gray-800 leading-relaxed">
                <strong className="text-pink-600">{t("notAProblem")}</strong>
                <br />
                {t("understandPace")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
