import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            개인정보 처리방침
          </h1>
          <div className="text-sm text-gray-500 mb-8">
            <p>최종 수정일: 2026년 1월 24일</p>
            <p>시행일: 2026년 1월 24일</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-gray-700 leading-relaxed">
                [회사명](이하 "회사")은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제1조 (개인정보의 처리목적)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">1. 서비스 제공</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>AI 그림 분석 및 상담 리포트 생성</li>
                    <li>미술 수업 예약 및 관리</li>
                    <li>지문 분석 서비스 제공</li>
                    <li>콘텐츠 제공, 맞춤 서비스 제공</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">2. 회원 관리</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증</li>
                    <li>회원자격 유지·관리, 서비스 부정이용 방지</li>
                    <li>각종 고지·통지, 고충처리</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">3. 재화 또는 서비스의 제공</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>서비스 제공, 청구서 발송, 콘텐츠 제공</li>
                    <li>결제 및 결제대금 정산</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">4. 마케팅 및 광고에의 활용</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>신규 서비스 개발 및 맞춤 서비스 제공</li>
                    <li>이벤트 및 광고성 정보 제공 및 참여기회 제공</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제2조 (개인정보의 처리 및 보유기간)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                <p>2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</p>
                <div className="ml-4 space-y-2">
                  <div>
                    <p className="font-semibold">가. 회원 가입 및 관리</p>
                    <p className="ml-4">- 보유기간: 회원 탈퇴 시까지</p>
                    <p className="ml-4">- 다만, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료 시까지</p>
                  </div>
                  <div>
                    <p className="font-semibold">나. 재화 또는 서비스 제공</p>
                    <p className="ml-4">- 보유기간: 재화·서비스 공급완료 및 요금결제·정산 완료 시까지</p>
                    <p className="ml-4">- 다만, 「전자상거래 등에서의 소비자 보호에 관한 법률」에 따른 거래기록 보존:</p>
                    <ul className="list-disc list-inside ml-8 space-y-1">
                      <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                      <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                      <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">다. 그림 분석 데이터</p>
                    <p className="ml-4">- 보유기간: 분석 리포트 생성 후 3년</p>
                    <p className="ml-4">- 다만, 이용자가 삭제를 요청하는 경우 즉시 삭제</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제3조 (처리하는 개인정보의 항목)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                회사는 다음의 개인정보 항목을 처리하고 있습니다:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">1. 회원 가입 및 관리</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>필수항목: 이메일, 비밀번호, 이름, 전화번호</li>
                    <li>선택항목: 생년월일, 주소</li>
                    <li>자동 수집 항목: IP주소, 쿠키, MAC주소, 서비스 이용 기록, 접속 로그</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">2. 서비스 이용 과정에서 수집</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li>그림 파일 메타데이터 (파일명, 크기, 업로드 시간 등)</li>
                    <li>분석 결과 데이터 (색상, 형태, 감정 분석 등)</li>
                    <li>예약 정보 (예약 날짜, 시간, 아이 정보 등)</li>
                    <li>결제 정보 (결제 수단, 결제 금액, 결제 일시 등)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제4조 (개인정보의 제3자 제공)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
                <p>2. 회사는 원칙적으로 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>정보주체가 사전에 동의한 경우</li>
                  <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                  <li>결제 서비스 제공을 위해 결제 대행사(Stripe 등)에 필요한 최소한의 정보 제공</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제5조 (개인정보 처리의 위탁)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
                <div className="ml-4 space-y-3">
                  <div>
                    <p className="font-semibold">가. 결제 서비스</p>
                    <p className="ml-4">- 위탁받는 자: Stripe, Inc.</p>
                    <p className="ml-4">- 위탁하는 업무의 내용: 신용카드 결제 처리</p>
                  </div>
                  <div>
                    <p className="font-semibold">나. 클라우드 서비스</p>
                    <p className="ml-4">- 위탁받는 자: Supabase, Inc.</p>
                    <p className="ml-4">- 위탁하는 업무의 내용: 데이터베이스 및 인증 서비스 제공</p>
                  </div>
                  <div>
                    <p className="font-semibold">다. AI 서비스</p>
                    <p className="ml-4">- 위탁받는 자: OpenAI, LLC</p>
                    <p className="ml-4">- 위탁하는 업무의 내용: 그림 분석 및 리포트 생성</p>
                  </div>
                </div>
                <p>2. 회사는 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>개인정보 처리정지 요구권</li>
                  <li>개인정보 열람 요구</li>
                  <li>개인정보 정정·삭제 요구</li>
                  <li>개인정보 처리정지 요구</li>
                </ul>
                <p>2. 제1항에 따른 권리 행사는 회사에 대해 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
                <p>3. 정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</p>
                <p>4. 제1항에 따른 권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제7조 (개인정보의 파기)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
                <p>2. 개인정보 파기의 절차 및 방법은 다음과 같습니다:</p>
                <div className="ml-4 space-y-2">
                  <div>
                    <p className="font-semibold">가. 파기절차</p>
                    <p className="ml-4">회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</p>
                  </div>
                  <div>
                    <p className="font-semibold">나. 파기방법</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>전자적 파일 형태: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제</li>
                      <li>기록물, 인쇄물, 서면 등: 분쇄하거나 소각하여 파기</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제8조 (개인정보 보호책임자)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="font-semibold mb-2">개인정보 보호책임자</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>성명: [담당자명]</li>
                    <li>직책: [직책]</li>
                    <li>연락처: [전화번호], [이메일]</li>
                  </ul>
                  <p className="mt-4 text-sm text-gray-600">
                    ※ 개인정보 보호 담당부서로 연결됩니다.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제9조 (개인정보의 안전성 확보조치)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                회사는 「개인정보 보호법」 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.
              </p>
              <div className="space-y-2 text-gray-700">
                <p>1. 개인정보에 대한 접근 제한</p>
                <p>2. 개인정보의 암호화</p>
                <p>3. 해킹 등에 대비한 기술적 대책</p>
                <p>4. 개인정보처리시스템 등의 접근권한 관리</p>
                <p>5. 개인정보의 정기적 백업</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제10조 (쿠키의 운영 및 거부)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사는 이용자에게 개인화되고 맞춤화된 서비스를 제공하기 위해 쿠키를 사용할 수 있습니다.</p>
                <p>2. 쿠키는 웹사이트를 운영하는데 이용되는 서버가 이용자의 컴퓨터 브라우저에 보내는 소량의 텍스트 파일입니다.</p>
                <p>3. 이용자는 쿠키 설치에 대한 선택권을 가지고 있으며, 웹브라우저에서 옵션을 설정함으로써 쿠키에 대한 수용 여부를 결정할 수 있습니다.</p>
                <p>4. 다만, 쿠키 설치를 거부할 경우 서비스 이용에 어려움이 있을 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제11조 (개인정보 처리방침 변경)</h2>
              <p className="text-gray-700 leading-relaxed">
                이 개인정보 처리방침은 2026년 1월 24일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제12조 (GDPR 준수 - EU 거주자 권리)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                EU 거주자의 경우, GDPR(유럽 일반 개인정보 보호 규정)에 따라 다음 권리를 보장합니다:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">1. 접근권 (Right of Access)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    자신의 개인정보가 처리되고 있는지 여부와 처리 목적, 처리되는 개인정보의 범주, 보유 기간 등에 대한 정보를 요청할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">2. 정정권 (Right to Rectification)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    부정확하거나 불완전한 개인정보의 정정을 요청할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">3. 삭제권 (Right to Erasure, "잊혀질 권리")</h3>
                  <p className="text-gray-700 leading-relaxed">
                    다음의 경우 개인정보 삭제를 요청할 수 있습니다:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 mt-2">
                    <li>개인정보가 더 이상 필요한 목적을 달성하지 못하는 경우</li>
                    <li>처리에 대한 동의를 철회한 경우</li>
                    <li>불법적으로 처리된 경우</li>
                    <li>법적 의무 이행을 위해 필요한 경우를 제외하고 삭제가 필요한 경우</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">4. 처리 제한권 (Right to Restriction of Processing)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    특정 상황에서 개인정보 처리의 제한을 요청할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">5. 데이터 이동권 (Right to Data Portability)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    제공한 개인정보를 구조화되고 일반적으로 사용되는 형식으로 받아 다른 서비스 제공자에게 전송할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">6. 처리 거부권 (Right to Object)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    합법적 이익을 기반으로 한 개인정보 처리에 대해 이의를 제기할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">7. 자동화된 의사결정 거부권 (Right to Object to Automated Decision-Making)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    자동화된 의사결정(프로파일링 포함)에 대한 권리를 행사할 수 있습니다. 본 서비스는 자동화된 의사결정을 사용하지 않습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">8. 동의 철회권 (Right to Withdraw Consent)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    동의를 기반으로 한 처리에 대해 언제든지 동의를 철회할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">9. 감독 기관에 대한 불만 제기권</h3>
                  <p className="text-gray-700 leading-relaxed">
                    개인정보 처리와 관련하여 불만이 있는 경우, 거주 국가의 데이터 보호 감독 기관에 불만을 제기할 수 있습니다.
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                위 권리 행사는 <Link href="/contact" className="text-pink-600 hover:underline">문의하기</Link> 페이지를 통해 요청하실 수 있으며, 회사는 지체 없이 조치하겠습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제13조 (CCPA 준수 - 캘리포니아 거주자 권리)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                캘리포니아 거주자의 경우, CCPA(캘리포니아 소비자 개인정보 보호법)에 따라 다음 권리를 보장합니다:
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">1. 정보 공개권 (Right to Know)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    수집, 사용, 공유되는 개인정보의 범주와 목적에 대한 정보를 요청할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">2. 삭제권 (Right to Delete)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    특정 예외를 제외하고 수집한 개인정보의 삭제를 요청할 수 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">3. 판매 거부권 (Right to Opt-Out of Sale)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    회사는 개인정보를 제3자에게 판매하지 않습니다. 따라서 판매 거부 요청은 적용되지 않습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">4. 비차별 조항 (Non-Discrimination)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    개인정보 권리를 행사하더라도 서비스 이용에 대한 차별이나 불이익을 받지 않습니다. 권리 행사는 서비스 제공에 영향을 미치지 않습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">5. 대리인을 통한 권리 행사</h3>
                  <p className="text-gray-700 leading-relaxed">
                    인증된 대리인을 통해 권리를 행사할 수 있습니다.
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                위 권리 행사는 <Link href="/contact" className="text-pink-600 hover:underline">문의하기</Link> 페이지를 통해 요청하실 수 있으며, 회사는 45일 이내에 응답하겠습니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제14조 (국제 데이터 전송)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                회사는 서비스 제공을 위해 일부 데이터를 해외에 위치한 서비스 제공업체에 전송할 수 있습니다. 이러한 전송은 GDPR Chapter V를 준수합니다:
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">1. 적절한 보호 조치</h3>
                  <p className="text-gray-700 leading-relaxed">
                    해외 데이터 전송 시 다음 보호 조치를 적용합니다:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 mt-2">
                    <li>표준 계약 조항(Standard Contractual Clauses, SCC) 사용</li>
                    <li>데이터 처리 계약 체결</li>
                    <li>암호화 및 기타 기술적 보안 조치</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">2. 데이터 전송 대상 국가 및 서비스</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                    <li><strong>미국:</strong> Stripe (결제 처리), Supabase (데이터베이스), OpenAI (AI 서비스)</li>
                    <li>각 서비스 제공업체는 적절한 데이터 보호 조치를 취하고 있습니다.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">3. 데이터 전송 거부권</h3>
                  <p className="text-gray-700 leading-relaxed">
                    데이터 전송에 동의하지 않는 경우, 일부 서비스 이용이 제한될 수 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제15조 (아동 보호 - COPPA 준수)</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                회사는 COPPA(미국 아동 온라인 개인정보 보호법) 및 관련 법령을 준수합니다:
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">1. 아동 개인정보 수집 금지</h3>
                  <p className="text-gray-700 leading-relaxed">
                    만 13세 미만 아동의 개인정보를 보호자의 동의 없이 수집하지 않습니다. 본 서비스는 아동의 그림을 분석하지만, 서비스 이용 및 결제는 보호자가 수행합니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">2. 보호자 동의</h3>
                  <p className="text-gray-700 leading-relaxed">
                    만 13세 미만 아동의 정보를 수집하는 경우, 보호자의 명시적 동의를 받습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">3. 보호자 권리</h3>
                  <p className="text-gray-700 leading-relaxed">
                    보호자는 아동의 개인정보에 대한 열람, 삭제, 수정을 요청할 수 있습니다.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              개인정보 처리방침에 대한 문의사항이 있으시면 <a href="/contact" className="text-pink-600 hover:underline">문의하기</a> 페이지를 통해 연락주시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
