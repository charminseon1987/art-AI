import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            쿠키 정책
          </h1>
          <div className="text-sm text-gray-500 mb-8">
            <p>최종 수정일: 2026년 1월 24일</p>
            <p>시행일: 2026년 1월 24일</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-gray-700 leading-relaxed">
                [회사명](이하 "회사")은 이용자에게 개인화되고 맞춤화된 서비스를
                제공하기 위해 쿠키를 사용합니다. 본 쿠키 정책은 회사가 어떤
                쿠키를 사용하는지, 쿠키의 목적, 그리고 쿠키를 관리하는 방법에
                대해 설명합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                1. 쿠키란 무엇인가요?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                쿠키는 웹사이트를 방문할 때 사용자의 컴퓨터나 모바일 기기에
                저장되는 작은 텍스트 파일입니다. 쿠키는 웹사이트가 사용자의
                방문 정보를 기억하고, 사용자 경험을 개선하는 데 도움을 줍니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                2. 쿠키의 종류
              </h2>
              <div className="space-y-6">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    2.1 필수 쿠키 (Strictly Necessary Cookies)
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    필수 쿠키는 웹사이트가 정상적으로 작동하기 위해 반드시
                    필요한 쿠키입니다. 이러한 쿠키 없이는 서비스를 제공할 수
                    없습니다.
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>인증 및 보안: 로그인 상태 유지, 세션 관리</li>
                    <li>서비스 기능: 사용자 설정 저장, 장바구니 기능</li>
                    <li>부정 이용 방지: 보안 및 사기 방지</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>법적 근거:</strong> 서비스 제공을 위한 계약 이행
                    (GDPR Article 6(1)(b), 한국 개인정보보호법)
                  </p>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    2.2 분석 쿠키 (Analytics Cookies)
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    분석 쿠키는 웹사이트 방문자들이 어떻게 사이트를 이용하는지
                    이해하는 데 도움을 줍니다. 이러한 정보는 서비스 개선에
                    사용됩니다.
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>방문 통계: 페이지 조회수, 방문 경로</li>
                    <li>사용자 행동 분석: 클릭 패턴, 체류 시간</li>
                    <li>성능 모니터링: 페이지 로딩 속도, 오류 추적</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>법적 근거:</strong> 이용자 동의 (GDPR Article
                    6(1)(a), CCPA)
                  </p>
                </div>

                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    2.3 마케팅 쿠키 (Marketing Cookies)
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    마케팅 쿠키는 사용자의 관심사에 맞는 광고를 제공하고,
                    마케팅 캠페인의 효과를 측정하는 데 사용됩니다.
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>맞춤형 광고: 관심사 기반 광고 표시</li>
                    <li>리타겟팅: 방문했던 사이트에 대한 광고</li>
                    <li>캠페인 추적: 광고 효과 측정</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>법적 근거:</strong> 이용자 동의 (GDPR Article
                    6(1)(a), CCPA)
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                3. 사용하는 쿠키 목록
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        쿠키 이름
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        목적
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        유형
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left">
                        보유 기간
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        session_id
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        로그인 세션 유지
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        필수
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        세션 종료 시
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        cookie-consent
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        쿠키 동의 상태 저장
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        필수
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        1년
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">
                        _ga (Google Analytics)
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        방문자 통계 분석
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        분석
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        2년
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                4. 쿠키 관리 방법
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    4.1 브라우저 설정을 통한 쿠키 관리
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    대부분의 웹 브라우저는 쿠키를 자동으로 허용하도록 설정되어
                    있습니다. 그러나 브라우저 설정을 변경하여 쿠키를 차단하거나
                    쿠키 사용 시 알림을 받을 수 있습니다.
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>
                      <strong>Chrome:</strong> 설정 → 개인정보 및 보안 → 쿠키
                      및 기타 사이트 데이터
                    </li>
                    <li>
                      <strong>Safari:</strong> 환경설정 → 개인정보 보호 →
                      쿠키 및 웹 사이트 데이터
                    </li>
                    <li>
                      <strong>Firefox:</strong> 옵션 → 개인정보 보호 및 보안
                      → 쿠키 및 사이트 데이터
                    </li>
                    <li>
                      <strong>Edge:</strong> 설정 → 쿠키 및 사이트 권한 →
                      쿠키 및 사이트 데이터
                    </li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2">
                    참고: 쿠키를 차단하면 일부 서비스 기능이 제한될 수 있습니다.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    4.2 웹사이트 내 쿠키 설정
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    웹사이트 하단의 "쿠키 설정" 버튼을 통해 언제든지 쿠키
                    동의를 변경할 수 있습니다. 분석 쿠키와 마케팅 쿠키는
                    선택적으로 허용하거나 거부할 수 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                5. 제3자 쿠키
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                회사는 서비스 제공을 위해 다음과 같은 제3자 서비스의 쿠키를
                사용할 수 있습니다:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
                <li>
                  <strong>Google Analytics:</strong> 웹사이트 이용 통계 분석
                  (동의 시)
                </li>
                <li>
                  <strong>Stripe:</strong> 결제 처리 (필수)
                </li>
                <li>
                  <strong>Supabase:</strong> 인증 및 데이터베이스 서비스 (필수)
                </li>
              </ul>
              <p className="text-gray-600 text-sm mt-3">
                제3자 쿠키 사용에 대한 자세한 내용은 각 서비스 제공업체의
                개인정보 처리방침을 참고하시기 바랍니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                6. GDPR 및 CCPA 준수
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    6.1 GDPR (유럽 일반 개인정보 보호 규정)
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    EU 거주자의 경우, GDPR에 따라 쿠키 사용에 대한 명시적
                    동의를 받고 있습니다. 필수 쿠키를 제외한 모든 쿠키는
                    동의하신 경우에만 사용됩니다.
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>쿠키 사용 전 명시적 동의 요청</li>
                    <li>쿠키별 목적 및 보유 기간 명시</li>
                    <li>언제든지 동의 철회 가능</li>
                    <li>쿠키 설정 변경 권리 보장</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    6.2 CCPA (캘리포니아 소비자 개인정보 보호법)
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    캘리포니아 거주자의 경우, CCPA에 따라 다음 권리를 보장합니다:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>개인정보 판매 거부권 (회사는 개인정보를 판매하지 않음)</li>
                    <li>쿠키 사용 거부 권리</li>
                    <li>쿠키 사용에 대한 투명한 정보 제공</li>
                    <li>비차별 조항: 쿠키 거부 시에도 서비스 이용 가능</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                7. 아동의 쿠키 사용
              </h2>
              <p className="text-gray-700 leading-relaxed">
                본 서비스는 만 14세 미만 아동의 개인정보를 수집하지 않으며,
                아동 관련 쿠키도 사용하지 않습니다. 서비스 이용 및 결제는
                보호자(부모 또는 법정대리인)가 수행하며, COPPA(미국 아동 온라인
                개인정보 보호법)를 준수합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                8. 쿠키 정책 변경
              </h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 법령 및 정책 변경에 따라 본 쿠키 정책을 수정할 수
                있습니다. 중요한 변경사항이 있는 경우 서비스 내 공지사항 또는
                이메일을 통해 안내드립니다. 본 정책의 최신 버전은 항상 서비스
                내에서 확인하실 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. 문의</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                쿠키 정책에 대한 문의사항이 있으시면 아래 방법으로 연락주시기
                바랍니다.
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="space-y-2 text-gray-700">
                  <li>이메일: [이메일 주소]</li>
                  <li>전화: [전화번호]</li>
                  <li>
                    문의하기:{" "}
                    <Link
                      href="/contact"
                      className="text-pink-600 hover:underline"
                    >
                      문의하기 페이지
                    </Link>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              더 자세한 개인정보 처리 내용은{" "}
              <Link
                href="/privacy-policy"
                className="text-pink-600 hover:underline"
              >
                개인정보 처리방침
              </Link>
              을 참고하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
