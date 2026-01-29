export default function RefundPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            환불 규정
          </h1>
          <div className="text-sm text-gray-500 mb-8">
            <p>최종 수정일: 2026년 1월 24일</p>
            <p>시행일: 2026년 1월 24일</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-gray-700 leading-relaxed">
                [회사명](이하 "회사")은 「전자상거래 등에서의 소비자 보호에 관한 법률」 및 관련 법령에 따라 다음과 같이 환불 규정을 운영합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제1조 (환불 정책)</h2>
              <div className="space-y-4">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <h3 className="text-xl font-semibold text-green-800 mb-2">서비스 시작 전 환불</h3>
                  <p className="text-gray-700 leading-relaxed">
                    서비스가 시작되기 전에는 결제 금액의 100%를 환불해드립니다. 서비스 시작 시점은 다음과 같이 정의됩니다:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
                    <li>그림 분석 서비스: AI 분석 리포트 생성 완료 시점</li>
                    <li>미술 수업 예약: 예약된 수업 시작 시점</li>
                    <li>지문 분석 서비스: 분석 리포트 생성 완료 시점</li>
                  </ul>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <h3 className="text-xl font-semibold text-red-800 mb-2">서비스 시작 후 환불</h3>
                  <p className="text-gray-700 leading-relaxed">
                    서비스가 시작된 이후에는 환불이 불가능합니다. 다만, 다음의 경우에는 예외적으로 환불을 검토할 수 있습니다:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-gray-700">
                    <li>회사의 귀책사유로 인한 서비스 제공 불가</li>
                    <li>서비스의 중대한 결함으로 인한 이용 불가</li>
                    <li>기타 법령에 따라 환불이 필요한 경우</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제2조 (환불 절차)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 환불 신청은 다음의 방법으로 할 수 있습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>이메일: [이메일 주소]로 환불 신청서 작성 후 발송</li>
                  <li>전화: [전화번호]로 연락</li>
                  <li>문의하기 페이지: <a href="/contact" className="text-pink-600 hover:underline">문의하기</a> 페이지를 통한 신청</li>
                </ul>
                <p>2. 환불 신청 시 다음 정보를 제공해주시기 바랍니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>주문번호 또는 결제 번호</li>
                  <li>결제일자</li>
                  <li>결제 수단</li>
                  <li>환불 사유</li>
                  <li>환불 받을 계좌 정보 (계좌이체 결제의 경우)</li>
                </ul>
                <p>3. 환불 신청 접수 후, 회사는 신청 내용을 검토하여 환불 가능 여부를 결정합니다.</p>
                <p>4. 환불이 승인된 경우, 환불 절차를 진행합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제3조 (환불 처리 기간)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 환불 신청 접수 후, 회사는 3영업일 이내에 환불 가능 여부를 통지합니다.</p>
                <p>2. 환불 승인 후 실제 환불 처리는 다음과 같습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <span className="font-semibold">신용카드 결제:</span> 승인일로부터 3~5영업일 소요 (카드사에 따라 상이)
                  </li>
                  <li>
                    <span className="font-semibold">계좌이체 결제:</span> 승인일로부터 1~3영업일 소요
                  </li>
                  <li>
                    <span className="font-semibold">기타 결제 수단:</span> 해당 결제 대행사의 환불 정책에 따름
                  </li>
                </ul>
                <p>3. 환불 처리 중 발생하는 수수료는 원칙적으로 회사가 부담합니다. 다만, 이용자의 귀책사유로 인한 환불의 경우 수수료를 공제할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제4조 (환불 불가 사항)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>다음의 경우 환불이 불가능합니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>서비스가 시작된 경우 (AI 분석 리포트 생성 완료, 수업 시작 등)</li>
                  <li>이용자가 서비스를 이용한 경우</li>
                  <li>이용자의 귀책사유로 인한 환불 신청</li>
                  <li>무료로 제공된 서비스</li>
                  <li>프로모션 또는 할인 상품 중 환불 불가 상품</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제5조 (부분 환불)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 예약금과 잔금이 분리되어 결제된 경우, 예약금은 예약 취소 시 환불이 가능합니다.</p>
                <p>2. 예약금 환불은 예약 취소 신청일로부터 3영업일 이내에 처리됩니다.</p>
                <p>3. 잔금은 서비스 시작 전까지 환불이 가능하며, 서비스 시작 후에는 환불이 불가능합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제6조 (취소 및 변경)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 미술 수업 예약의 경우, 수업 시작 24시간 전까지 취소 또는 변경이 가능합니다.</p>
                <p>2. 24시간 이내 취소 또는 변경은 환불이 불가능할 수 있습니다.</p>
                <p>3. 예약 변경은 서비스 이용 가능 범위 내에서 가능하며, 추가 비용이 발생할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제7조 (환불 거부 및 이의제기)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사는 다음의 경우 환불을 거부할 수 있습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>서비스 시작 후 환불 신청</li>
                  <li>이용자의 귀책사유로 인한 환불 신청</li>
                  <li>환불 신청 정보가 부정확하거나 확인이 불가능한 경우</li>
                </ul>
                <p>2. 환불 거부 사유가 있는 경우, 회사는 신청인에게 그 사유를 통지합니다.</p>
                <p>3. 환불 거부에 이의가 있는 경우, <a href="/contact" className="text-pink-600 hover:underline">문의하기</a> 페이지를 통해 이의를 제기할 수 있습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">제8조 (소비자 분쟁 해결)</h2>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>1. 회사는 이용자와의 원활한 의사소통을 위해 고객센터를 운영합니다.</p>
                <p>2. 환불 관련 분쟁이 발생한 경우, 다음 기관에 도움을 요청할 수 있습니다:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>전자상거래분쟁조정위원회: <a href="http://www.ecmc.or.kr" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">www.ecmc.or.kr</a> / 1661-5714</li>
                  <li>한국소비자원: <a href="http://www.kca.go.kr" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">www.kca.go.kr</a> / 1372</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">부칙</h2>
              <p className="text-gray-700 leading-relaxed">
                본 환불 규정은 2026년 1월 24일부터 시행됩니다.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">환불 문의</h3>
              <p className="text-gray-700 mb-4">
                환불 관련 문의사항이 있으시면 아래 방법으로 연락주시기 바랍니다.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>이메일: [이메일 주소]</li>
                <li>전화: [전화번호]</li>
                <li>문의하기: <a href="/contact" className="text-pink-600 hover:underline">문의하기 페이지</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
