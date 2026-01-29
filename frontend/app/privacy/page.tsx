import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            프라이버시 정책
          </h1>
          <div className="text-sm text-gray-500 mb-8">
            <p>최종 수정일: 2026년 1월 24일</p>
            <p>시행일: 2026년 1월 24일</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-gray-700 leading-relaxed">
                [회사명](이하 "회사")은 이용자의 프라이버시를 존중하며, 이용자가 제공하는 정보를 안전하게 보호하기 위해 최선을 다하고 있습니다. 본 프라이버시 정책은 회사가 수집하는 정보, 정보 사용 방법, 그리고 정보 보호 방법에 대해 설명합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. 수집하는 정보</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">1.1 직접 제공하는 정보</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>회원가입 시: 이름, 이메일 주소, 비밀번호, 전화번호</li>
                    <li>서비스 이용 시: 업로드한 그림 파일, 분석 요청 정보</li>
                    <li>예약 시: 예약 날짜, 시간, 아이 정보, 연락처</li>
                    <li>결제 시: 결제 정보 (신용카드 정보는 결제 대행사를 통해 처리되며 직접 저장하지 않음)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">1.2 자동으로 수집하는 정보</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>기기 정보: IP 주소, 브라우저 유형, 운영체제</li>
                    <li>이용 기록: 서비스 이용 시간, 페이지 방문 기록, 클릭 데이터</li>
                    <li>쿠키 및 유사 기술: 서비스 기능 향상을 위한 쿠키 데이터</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. 정보 사용 목적</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>회사는 수집한 정보를 다음 목적으로 사용합니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <span className="font-semibold">서비스 제공:</span> AI 그림 분석, 리포트 생성, 예약 관리 등 서비스 제공
                  </li>
                  <li>
                    <span className="font-semibold">서비스 개선:</span> 이용자 경험 향상, 서비스 품질 개선
                  </li>
                  <li>
                    <span className="font-semibold">고객 지원:</span> 문의 응답, 기술 지원 제공
                  </li>
                  <li>
                    <span className="font-semibold">보안:</span> 부정 이용 방지, 서비스 보안 유지
                  </li>
                  <li>
                    <span className="font-semibold">법적 의무 이행:</span> 관련 법령에 따른 의무 이행
                  </li>
                  <li>
                    <span className="font-semibold">마케팅:</span> 새로운 서비스 안내, 이벤트 정보 제공 (동의 시)
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. 정보 공유 및 제공</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <span className="font-semibold">서비스 제공을 위한 위탁:</span> 결제 처리(Stripe), 데이터 저장(Supabase), AI 분석(OpenAI) 등 서비스 제공을 위해 필요한 경우
                  </li>
                  <li>
                    <span className="font-semibold">법적 요구:</span> 법원의 명령, 수사기관의 요청 등 법적 의무 이행을 위해 필요한 경우
                  </li>
                  <li>
                    <span className="font-semibold">이용자 동의:</span> 이용자가 명시적으로 동의한 경우
                  </li>
                </ul>
                <p className="mt-4">
                  위탁 업체와의 계약 시 개인정보 보호를 위한 적절한 조치를 취하며, 위탁 업무가 종료되면 관련 정보를 즉시 파기합니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. 데이터 보안</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>회사는 이용자의 정보를 안전하게 보호하기 위해 다음과 같은 보안 조치를 취하고 있습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <span className="font-semibold">암호화:</span> 전송 중인 데이터는 SSL/TLS 암호화를 사용합니다.
                  </li>
                  <li>
                    <span className="font-semibold">접근 제한:</span> 개인정보에 대한 접근은 필요한 직원에게만 제한됩니다.
                  </li>
                  <li>
                    <span className="font-semibold">정기 보안 점검:</span> 정기적인 보안 점검 및 취약점 분석을 실시합니다.
                  </li>
                  <li>
                    <span className="font-semibold">데이터 백업:</span> 정기적인 데이터 백업을 통해 데이터 손실을 방지합니다.
                  </li>
                  <li>
                    <span className="font-semibold">그림 파일 미저장:</span> 업로드된 그림 파일 자체는 저장하지 않으며, 분석을 위한 메타데이터만 저장합니다.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. 쿠키 정책</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사는 서비스 제공을 위해 쿠키를 사용할 수 있습니다. 쿠키는 웹사이트를 방문할 때 사용자의 컴퓨터에 저장되는 작은 텍스트 파일입니다.</p>
                <p>2. 회사가 사용하는 쿠키의 종류:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    <span className="font-semibold">필수 쿠키:</span> 서비스 제공을 위해 반드시 필요한 쿠키
                  </li>
                  <li>
                    <span className="font-semibold">기능 쿠키:</span> 사용자 선호도 저장, 로그인 상태 유지 등
                  </li>
                  <li>
                    <span className="font-semibold">분석 쿠키:</span> 서비스 이용 통계 분석 (선택적)
                  </li>
                </ul>
                <p>3. 이용자는 웹브라우저 설정을 통해 쿠키 사용을 거부할 수 있습니다. 다만, 쿠키를 거부할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. 이용자 권리</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>이용자는 다음의 권리를 행사할 수 있습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <span className="font-semibold">접근권:</span> 자신의 개인정보에 대한 접근 및 열람 요청
                  </li>
                  <li>
                    <span className="font-semibold">수정권:</span> 잘못된 개인정보의 정정 요청
                  </li>
                  <li>
                    <span className="font-semibold">삭제권:</span> 개인정보 삭제 요청
                  </li>
                  <li>
                    <span className="font-semibold">처리정지권:</span> 개인정보 처리 정지 요청
                  </li>
                  <li>
                    <span className="font-semibold">동의 철회권:</span> 개인정보 처리에 대한 동의 철회
                  </li>
                </ul>
                <p className="mt-4">
                  권리 행사는 <a href="/contact" className="text-pink-600 hover:underline">문의하기</a> 페이지를 통해 요청하실 수 있으며, 회사는 지체 없이 조치하겠습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. 데이터 보유 기간</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>회사는 이용자의 개인정보를 다음과 같이 보유합니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <span className="font-semibold">회원 정보:</span> 회원 탈퇴 시까지 (단, 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관)
                  </li>
                  <li>
                    <span className="font-semibold">결제 정보:</span> 「전자상거래 등에서의 소비자 보호에 관한 법률」에 따라 5년간 보관
                  </li>
                  <li>
                    <span className="font-semibold">분석 데이터:</span> 분석 리포트 생성 후 3년간 보관 (이용자 요청 시 즉시 삭제 가능)
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. 아동의 프라이버시</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  본 서비스는 아동의 그림을 분석하는 서비스이지만, 서비스 이용 및 결제는 보호자(부모 또는 법정대리인)가 수행합니다. 
                  회사는 만 14세 미만 아동의 개인정보를 수집하지 않으며, 아동의 정보는 보호자의 동의 하에 보호자 정보로 관리됩니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. 국제 데이터 전송</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  회사는 서비스 제공을 위해 일부 데이터를 해외에 위치한 서비스 제공업체(예: Stripe, Supabase, OpenAI)에 전송할 수 있습니다. 
                  이러한 전송은 서비스 제공을 위해 필수적이며, 해당 업체들은 적절한 보안 조치를 취하고 있습니다.
                </p>
                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">GDPR 준수 (EU 거주자)</h3>
                  <p className="text-gray-700">
                    EU 거주자의 경우, GDPR Chapter V에 따라 국제 데이터 전송 시 다음 보호 조치를 적용합니다:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>표준 계약 조항(Standard Contractual Clauses, SCC) 사용</li>
                    <li>데이터 처리 계약 체결</li>
                    <li>암호화 및 기타 기술적 보안 조치</li>
                  </ul>
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">데이터 전송 대상</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li><strong>미국:</strong> Stripe (결제 처리), Supabase (데이터베이스), OpenAI (AI 서비스)</li>
                    <li>각 서비스 제공업체는 적절한 데이터 보호 조치를 취하고 있습니다.</li>
                  </ul>
                </div>
                <p className="text-gray-600 text-sm mt-4">
                  데이터 전송에 대한 자세한 내용은 <Link href="/privacy-policy" className="text-pink-600 hover:underline">개인정보 처리방침</Link>을 참고하시기 바랍니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">10. 정책 변경</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  회사는 법령 및 정책 변경에 따라 본 프라이버시 정책을 수정할 수 있습니다. 
                  중요한 변경사항이 있는 경우 서비스 내 공지사항 또는 이메일을 통해 안내드립니다.
                </p>
                <p>
                  본 정책의 최신 버전은 항상 서비스 내에서 확인하실 수 있습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">11. 문의</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  프라이버시 정책에 대한 문의사항이나 개인정보 관련 요청이 있으시면 아래 방법으로 연락주시기 바랍니다.
                </p>
                <div className="bg-gray-50 p-6 rounded-lg mt-4">
                  <ul className="space-y-2 text-gray-700">
                    <li>이메일: [이메일 주소]</li>
                    <li>전화: [전화번호]</li>
                    <li>문의하기: <a href="/contact" className="text-pink-600 hover:underline">문의하기 페이지</a></li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              본 프라이버시 정책은 2026년 1월 24일부터 시행됩니다.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              더 자세한 개인정보 처리 내용은 <a href="/privacy-policy" className="text-pink-600 hover:underline">개인정보 처리방침</a>을 참고하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
