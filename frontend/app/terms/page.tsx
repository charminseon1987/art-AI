import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            이용약관
          </h1>
          <div className="text-sm text-gray-500 mb-8">
            <p>최종 수정일: 2026년 1월 24일</p>
            <p>시행일: 2026년 1월 24일</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제1조 (목적)</h2>
              <p className="text-gray-700 leading-relaxed">
                본 약관은 [회사명](이하 "회사")이 제공하는 AI 그림 분석 및 상담 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제2조 (정의)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. "서비스"란 회사가 제공하는 AI 기반 그림 분석, 상담 리포트 생성, 미술 수업 예약 및 관련 서비스를 의미합니다.</p>
                <p>2. "이용자"란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</p>
                <p>3. "콘텐츠"란 서비스를 통해 업로드, 전송, 게시된 모든 자료, 정보, 텍스트, 이미지 등을 의미합니다.</p>
                <p>4. "계정"이란 이용자가 서비스 이용을 위해 회사에 등록한 이메일 주소 및 기타 정보를 의미합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제3조 (약관의 게시와 개정)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</p>
                <p>2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>
                <p>3. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기 화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</p>
                <p>4. 이용자는 개정된 약관에 동의하지 않을 경우 서비스 이용을 중단하고 이용 계약을 해지할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제4조 (서비스의 제공 및 변경)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사는 다음과 같은 서비스를 제공합니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>AI 기반 그림 분석 및 관찰 리포트 생성</li>
                  <li>감정 언어 분석 및 반성 질문 생성</li>
                  <li>상담용 리포트 다운로드 (Markdown, PDF)</li>
                  <li>미술 수업 예약 및 관리</li>
                  <li>지문 분석 서비스</li>
                  <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 일체의 서비스</li>
                </ul>
                <p>2. 회사는 서비스의 내용을 변경할 수 있으며, 변경 시 이용자에게 공지합니다.</p>
                <p>3. 회사는 운영상, 기술상의 필요에 따라 제공하는 서비스를 일시적으로 중단할 수 있으며, 이 경우 사전에 공지합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제5조 (서비스의 이용)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 서비스 이용은 회사의 서비스 사용 승낙과 이용자의 이용 신청에 의하여 성립됩니다.</p>
                <p>2. 이용자는 서비스 이용 시 다음 행위를 하여서는 안 됩니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>타인의 정보 도용</li>
                  <li>법령 또는 본 약관에 위반되는 행위</li>
                  <li>서비스의 안정적 운영을 방해하는 행위</li>
                  <li>악성 프로그램의 유포, 해킹, 바이러스 유포 등</li>
                  <li>타인의 지적재산권을 침해하는 행위</li>
                  <li>기타 공공질서 및 미풍양속에 반하는 행위</li>
                </ul>
                <p>3. 이용자가 위 행위를 한 경우 회사는 서비스 이용을 제한하거나 계약을 해지할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제6조 (콘텐츠의 관리)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 이용자가 업로드한 그림 및 관련 정보는 서비스 제공을 위해 필요한 범위 내에서 사용됩니다.</p>
                <p>2. 회사는 이용자가 업로드한 그림 자체를 저장하지 않으며, 분석을 위한 메타데이터만 저장합니다.</p>
                <p>3. 이용자는 자신이 업로드한 콘텐츠에 대한 권리를 보유하며, 회사는 서비스 제공을 위해 필요한 범위 내에서만 이를 사용합니다.</p>
                <p>4. 이용자가 업로드한 콘텐츠가 타인의 권리를 침해하는 경우, 회사는 해당 콘텐츠를 삭제할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제7조 (결제 및 환불)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 서비스 이용에 따른 요금은 회사가 정한 바에 따릅니다.</p>
                <p>2. 결제는 신용카드, 계좌이체 등 회사가 제공하는 결제 수단을 통해 이루어집니다.</p>
                <p>3. 환불에 관한 사항은 별도의 환불 규정에 따릅니다.</p>
                <p>4. 서비스 시작 전에는 100% 환불이 가능하며, 서비스 시작 후에는 환불이 불가능합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제8조 (지적재산권)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 서비스에 대한 저작권 및 지적재산권은 회사에 귀속됩니다.</p>
                <p>2. 이용자는 회사의 사전 승인 없이 서비스를 복제, 전송, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</p>
                <p>3. 회사가 제공하는 AI 분석 결과물에 대한 저작권은 회사에 귀속되며, 이용자는 개인적인 목적으로만 사용할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제9조 (면책조항)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
                <p>2. 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
                <p>3. 회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</p>
                <p>4. 회사는 AI 분석 결과의 정확성을 보장하지 않으며, 분석 결과는 참고용으로만 사용되어야 합니다.</p>
                <p>5. 회사는 이용자가 게시한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제10조 (분쟁의 해결)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.</p>
                <p>2. 회사와 이용자 간에 발생한 분쟁은 전자상거래법 등 관련 법령에 따라 해결합니다.</p>
                <p>3. EU 거주자의 경우, GDPR에 따라 거주 국가의 데이터 보호 감독 기관에 불만을 제기할 수 있습니다.</p>
                <p>4. 캘리포니아 거주자의 경우, CCPA에 따라 캘리포니아 법원에서 분쟁을 해결할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제11조 (국제 이용자)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 본 서비스는 전 세계 이용자에게 제공되며, 각 국가의 법률을 준수합니다.</p>
                <p>2. EU 거주자의 경우, GDPR에 따른 권리를 보장합니다. 자세한 내용은 <Link href="/privacy-policy" className="text-pink-600 hover:underline">개인정보 처리방침</Link>을 참고하시기 바랍니다.</p>
                <p>3. 캘리포니아 거주자의 경우, CCPA에 따른 권리를 보장합니다. 자세한 내용은 <Link href="/privacy-policy" className="text-pink-600 hover:underline">개인정보 처리방침</Link>을 참고하시기 바랍니다.</p>
                <p>4. 서비스 이용 시 해당 국가의 법률과 규정을 준수해야 하며, 회사는 관련 법률을 준수합니다.</p>
                <p>5. 일부 국가에서는 서비스 이용이 제한될 수 있으며, 이는 해당 국가의 법률에 따라 결정됩니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">부칙</h2>
              <p className="text-gray-700 leading-relaxed">
                본 약관은 2026년 1월 24일부터 시행됩니다.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              문의사항이 있으시면 <a href="/contact" className="text-pink-600 hover:underline">문의하기</a> 페이지를 통해 연락주시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
