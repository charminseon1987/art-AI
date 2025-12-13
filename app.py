"""Streamlit 웹 애플리케이션 - AI 그림 상담 에이전트"""
import streamlit as st
import os
from datetime import datetime
from services.image_service import ImageService
from services.ai_service import AIService
from services.report_service import ReportService
from services.counseling_service import CounselingService
from services.scraping_service import ArtTherapyScrapingService
from models.report import ReportData
from langchain_openai import ChatOpenAI
from utils.setup import setup_directories
import uuid

# 필요한 디렉토리 생성
setup_directories()

# 페이지 설정
st.set_page_config(
    page_title="대전 초등 저학년 개인 미술수업",
    page_icon="🎨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 세션 상태 초기화
if 'reports' not in st.session_state:
    st.session_state.reports = []
if 'current_report' not in st.session_state:
    st.session_state.current_report = None
if 'counseling_responses' not in st.session_state:
    st.session_state.counseling_responses = []
if 'current_question_index' not in st.session_state:
    st.session_state.current_question_index = 0
if 'counseling_completed' not in st.session_state:
    st.session_state.counseling_completed = False
if 'professional_report' not in st.session_state:
    st.session_state.professional_report = None

# 서비스 초기화
@st.cache_resource
def init_services():
    """서비스 초기화"""
    # LLM 설정 (환경 변수에서 가져오기)
    api_key = os.getenv("OPENAI_API_KEY") or st.secrets.get("OPENAI_API_KEY", "")
    if not api_key:
        st.error("⚠️ OPENAI_API_KEY가 설정되지 않았습니다. .env 파일이나 Streamlit secrets에 설정해주세요.")
        st.stop()
    
    llm = ChatOpenAI(model="gpt-4o-mini", api_key=api_key, temperature=0.7)
    
    image_service = ImageService(openai_api_key=api_key)
    ai_service = AIService(llm)
    report_service = ReportService()
    scraping_service = ArtTherapyScrapingService()
    counseling_service = CounselingService(llm, scraping_service)
    
    return image_service, ai_service, report_service, counseling_service

image_service, ai_service, report_service, counseling_service = init_services()

# 사이드바
with st.sidebar:
    st.title("🎨 미술 수업 & 그림 상담")
    st.markdown("---")
    
    page = st.radio(
        "메뉴",
        ["🏠 홈", "🎨 미술 수업", "💬 그림 상담 (AI)", "📞 상담·수업 안내", "💌 문의"],
        label_visibility="collapsed"
    )
    
    st.markdown("---")
    st.markdown("### 관리자")
    admin_page = st.radio(
        "관리자 메뉴",
        ["📋 리포트 보기", "👨‍⚕️ 관리자 모드"],
        label_visibility="collapsed",
        key="admin_menu"
    )
    
    # 관리자 페이지가 선택되면 메인 페이지 변경
    if admin_page:
        page = admin_page
    
    st.markdown("---")
    st.markdown("### ℹ️ 안내")
    st.markdown("""
    **대전 초등 저학년 개인 미술수업**
    
    그림으로 아이 마음을 천천히 이해합니다.
    
    - 5살부터 고등학생까지
    - 그림 상담 & 미술 수업
    """)

# 메인 콘텐츠
if page == "🏠 홈":
    # Hero Section
    st.markdown("""
    <div style='text-align: center; padding: 40px 20px;'>
        <h1 style='font-size: 2.5em; margin-bottom: 20px; color: #2c3e50;'>
            대전 초등 저학년 개인 미술수업
        </h1>
        <h2 style='font-size: 1.5em; margin-bottom: 40px; color: #34495e; font-weight: normal;'>
            그림으로 아이 마음을 천천히 이해합니다
        </h2>
        <p style='font-size: 1.1em; color: #7f8c8d; margin-bottom: 50px; line-height: 1.8;'>
            5살부터 고등학생까지 함께해온 미술 선생님이<br>
            아이의 그림을 수업과 상담으로 연결합니다.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("💬 그림 상담 받아보기", use_container_width=True, type="primary", key="home_consult"):
            page = "💬 그림 상담 (AI)"
            st.rerun()
    with col2:
        if st.button("📞 미술 수업 상담 신청", use_container_width=True, key="home_class"):
            page = "📞 상담·수업 안내"
            st.rerun()
    
    st.markdown("---")
    
    # 신뢰 섹션
    st.markdown("""
    <div style='text-align: center; padding: 30px 20px; background-color: #f8f9fa; border-radius: 10px;'>
        <h3 style='color: #2c3e50; margin-bottom: 30px;'>신뢰</h3>
        <div style='font-size: 1.1em; line-height: 2;'>
            <p>✔ 5살부터 고등학생까지 지속 수업</p>
            <p>✔ 중학생 진로·심리 상담 35건 이상</p>
            <p>✔ 하워드 가드너 지문 상담 100건 이상</p>
        </div>
        <p style='margin-top: 20px; font-weight: bold; color: #34495e;'>
            📌 아이를 오래 만나온 경험이 가장 큰 기준입니다.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # 차별점 섹션
    st.markdown("### 이 수업이 다른 이유")
    st.markdown("""
    <div style='background-color: #fff; padding: 30px; border-left: 4px solid #3498db; border-radius: 5px;'>
        <h3 style='color: #2c3e50; margin-bottom: 20px;'>
            아이에게 "왜 이렇게 그렸어?"라고 묻지 않습니다
        </h3>
        <ul style='font-size: 1.1em; line-height: 2; color: #34495e;'>
            <li>그림을 평가하지 않습니다</li>
            <li>아이가 말할 준비가 될 때까지 기다립니다</li>
            <li>그림 → 대화 → 수업으로 자연스럽게 이어갑니다</li>
        </ul>
        <p style='margin-top: 20px; font-style: italic; color: #7f8c8d;'>
            아이의 그림은 결과가 아니라 이야기의 시작입니다.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # CTA
    st.markdown("""
    <div style='text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white;'>
        <h3 style='margin-bottom: 20px;'>우리 아이에게 맞는 방식인지</h3>
        <h3 style='margin-bottom: 30px;'>그림 상담으로 먼저 확인해보세요.</h3>
    </div>
    """, unsafe_allow_html=True)
    
    if st.button("💬 그림 상담 탭으로 이동", use_container_width=True, type="primary"):
        page = "💬 그림 상담 (AI)"
        st.rerun()

elif page == "🎨 미술 수업":
    st.markdown("""
    <div style='text-align: center; padding: 30px 20px;'>
        <h1 style='font-size: 2.2em; color: #2c3e50; margin-bottom: 10px;'>
            초등 저학년을 위한
        </h1>
        <h2 style='font-size: 1.8em; color: #34495e;'>
            부담 없는 1:1 개인 미술 수업
        </h2>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 수업 대상")
        st.markdown("""
        - **5세 ~ 초등 저학년**
        - 그림을 좋아하지만 말이 적은 아이
        - 감정 표현이 서툰 아이
        - 집중 시간이 짧은 아이
        """)
    
    with col2:
        st.markdown("### 수업 방식")
        st.markdown("""
        - 정해진 답 없는 미술 활동
        - 아이 속도에 맞춘 진행
        - 대화는 자연스럽게, 강요하지 않음
        - 필요 시 보호자 피드백 제공
        """)
    
    st.markdown("---")
    
    st.info("""
    💡 **아이가 "그리기 싫다"고 말해도**  
    수업은 그 지점에서 시작합니다.
    """)
    
    st.markdown("---")
    
    st.markdown("### 수업 장소")
    st.markdown("""
    - 대전 ○○동 (상담 시 상세 안내)
    - 개인 수업 / 소그룹 가능
    """)
    
    if st.button("📞 상담 신청하기", use_container_width=True, type="primary"):
        page = "📞 상담·수업 안내"
        st.rerun()

elif page == "💬 그림 상담 (AI)":
    st.markdown("""
    <div style='text-align: center; padding: 30px 20px;'>
        <h1 style='font-size: 2.2em; color: #2c3e50; margin-bottom: 10px;'>
            아이 그림, 바로 해석하지 않습니다
        </h1>
        <p style='font-size: 1.2em; color: #7f8c8d;'>
            AI는 그림을 정리하고<br>
            선생님은 상담으로 연결합니다
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # STEP 1: 그림 업로드
    st.markdown("### STEP 1. 그림 업로드")
    st.markdown("""
    <div style='background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;'>
        <p>✔ 잘 그린 그림일 필요 없습니다</p>
        <p>✔ 집에서 편하게 그린 그림이면 충분합니다</p>
    </div>
    """, unsafe_allow_html=True)
    
    # 기존 그림 업로드 코드
    col1, col2 = st.columns([2, 1])
    
    with col1:
        uploaded_file = st.file_uploader(
            "그림 파일을 선택하세요",
            type=['png', 'jpg', 'jpeg'],
            help="PNG, JPG, JPEG 형식을 지원합니다.",
            label_visibility="collapsed"
        )
        
        if uploaded_file:
            st.image(uploaded_file, caption="업로드된 그림", use_container_width=True)
            
            user_emotion = st.selectbox(
                "현재 감정을 선택하세요 (선택사항)",
                ["선택 안함", "기쁨", "슬픔", "화남", "불안", "평온", "혼란", "기타"],
                help="선택한 감정은 리포트 생성에 참고됩니다."
            )
            
            if user_emotion == "선택 안함":
                user_emotion = None
            
            if st.button("🔍 분석 시작", type="primary", use_container_width=True):
                with st.spinner("이미지를 분석하고 리포트를 생성하는 중..."):
                    try:
                        image_result = image_service.process_uploaded_image(uploaded_file)
                        
                        if not image_result.get("success"):
                            st.error(f"이미지 처리 오류: {image_result.get('error')}")
                        else:
                            report_data = ai_service.analyze_image(
                                image_result["description"],
                                user_emotion
                            )
                            
                            report_data.image_metadata = image_result["metadata"]
                            report_service.save_report(report_data)
                            report_service.save_markdown_report(report_data, ai_service)
                            
                            st.session_state.current_report = report_data
                            st.success("✅ 분석이 완료되었습니다! 아래 질문에 답변해주세요.")
                            st.balloons()
                            
                            # 리포트 생성 후 바로 STEP 2로 이동
                            st.rerun()
                            
                    except Exception as e:
                        st.error(f"오류가 발생했습니다: {str(e)}")
                        st.exception(e)
    
    with col2:
        st.markdown("### 💡 사용 팁")
        st.markdown("""
        1. **명확한 그림**: 선명하고 잘 보이는 그림을 업로드하세요.
        
        2. **감정 선택**: 현재 감정을 선택하면 더 정확한 분석이 가능합니다.
        
        3. **리포트 활용**: 생성된 리포트는 상담의 시작점으로 활용하세요.
        
        4. **개인정보**: 그림은 저장되지 않으며, 메타데이터만 저장됩니다.
        """)
    
    # STEP 2: Chat UI (기존 심리상담 코드 활용)
    if st.session_state.current_report:
        st.markdown("---")
        st.markdown("### STEP 2. 간단 질문 (Chat 시작)")
        st.info("💬 **정답은 없습니다. 아이의 말 그대로를 적어주세요.**")
        
        # 기존 심리상담 채팅 코드를 여기에 통합
        report = st.session_state.current_report
        
        if 'chat_initialized' not in st.session_state or st.session_state.get('chat_report_id') != report.id:
            st.session_state.counseling_responses = []
            st.session_state.current_question_index = 0
            st.session_state.counseling_completed = False
            st.session_state.professional_report = None
            st.session_state.chat_initialized = True
            st.session_state.chat_report_id = report.id
            if report.reflection_questions.questions:
                st.session_state.current_question = report.reflection_questions.questions[0]
            else:
                st.session_state.current_question = "이 그림을 그릴 때 어떤 기분이었나요? 말로 하기 어렵다면 짧게 써도 괜찮아요 🙂"
        
        # 채팅 인터페이스
        if st.session_state.counseling_responses:
            for idx, response in enumerate(st.session_state.counseling_responses):
                with st.chat_message("assistant"):
                    st.write(response['question'])
                with st.chat_message("user"):
                    st.write(response['answer'])
        
        if not st.session_state.counseling_completed and 'current_question' in st.session_state:
            with st.chat_message("assistant"):
                st.write(st.session_state.current_question)
            
            user_answer = st.chat_input("답변을 입력하세요...")
            
            if user_answer:
                st.session_state.counseling_responses.append({
                    'question': st.session_state.current_question,
                    'answer': user_answer
                })
                
                if report.reflection_questions.questions and len(st.session_state.counseling_responses) < len(report.reflection_questions.questions):
                    next_question = report.reflection_questions.questions[len(st.session_state.counseling_responses)]
                    st.session_state.current_question = next_question
                    st.session_state.current_question_index += 1
                else:
                    st.session_state.counseling_completed = True
                    st.session_state.current_question = None
                
                st.rerun()
        
        # STEP 3: 리포트 표시
        if st.session_state.counseling_completed:
            st.markdown("---")
            st.markdown("### STEP 3. AI 그림 관찰 리포트 생성")
            st.markdown("#### 📄 그림 관찰 기반 상담 참고 리포트")
            
            # 리포트 요약 표시
            st.markdown("##### 1️⃣ 그림에서 관찰된 점")
            observation_points = []
            if report.observation.colors:
                observation_points.append(f"- 여러 색이 자유롭게 사용되어 있음 ({', '.join(report.observation.colors[:3])})")
            if report.observation.shapes:
                observation_points.append(f"- 선의 움직임이 다양하게 나타남 ({', '.join(report.observation.shapes[:2])})")
            if report.observation.composition:
                observation_points.append("- 화면 공간을 비교적 넓게 활용함")
            
            if observation_points:
                for point in observation_points:
                    st.markdown(point)
            else:
                st.markdown("- 관찰 사항이 기록되었습니다.")
            
            st.markdown("##### 2️⃣ 표현 방식 정리")
            expression_points = []
            if report.emotional_language.emotional_tone:
                expression_points.append(f"- {report.emotional_language.emotional_tone}")
            if report.observation.details:
                expression_points.append(f"- {report.observation.details[0] if report.observation.details else ''}")
            
            if expression_points:
                for point in expression_points:
                    st.markdown(point)
            else:
                st.markdown("- 표현 방식이 분석되었습니다.")
            
            st.markdown("##### 3️⃣ 이야기로 이어질 수 있는 질문")
            if report.reflection_questions.questions:
                for i, q in enumerate(report.reflection_questions.questions[:5], 1):
                    st.markdown(f"{i}. {q}")
            else:
                st.markdown("- 질문이 생성되었습니다.")
            
            # 전체 리포트 다운로드 옵션
            with st.expander("📄 전체 리포트 보기"):
                md_report = ai_service.generate_markdown_report(report)
                st.markdown(md_report)
                
                col_dl1, col_dl2 = st.columns(2)
                with col_dl1:
                    st.download_button(
                        label="📥 전체 리포트 다운로드 (Markdown)",
                        data=md_report,
                        file_name=f"그림상담보고서_{report.created_at.strftime('%Y%m%d_%H%M%S')}_{report.id[:8]}.md",
                        mime="text/markdown",
                        use_container_width=True
                    )
                with col_dl2:
                    try:
                        pdf_data = report_service.generate_pdf_report(report, ai_service)
                        st.download_button(
                            label="📥 전체 리포트 다운로드 (PDF)",
                            data=pdf_data,
                            file_name=f"그림상담보고서_{report.created_at.strftime('%Y%m%d_%H%M%S')}_{report.id[:8]}.pdf",
                            mime="application/pdf",
                            use_container_width=True
                        )
                    except Exception as e:
                        st.error(f"PDF 생성 오류: {str(e)}")
            
            # STEP 4: CTA
            st.markdown("---")
            st.markdown("### STEP 4. 상담 연결")
            st.markdown("""
            <div style='background-color: #e8f5e9; padding: 30px; border-radius: 10px; text-align: center;'>
                <p style='font-size: 1.1em; margin-bottom: 20px;'>
                    이 리포트는<br>
                    아이를 더 잘 이해하기 위한 대화의 참고 자료입니다.
                </p>
            </div>
            """, unsafe_allow_html=True)
            
            if st.button("📞 선생님 상담으로 연결하기", use_container_width=True, type="primary"):
                # 상담 안내 페이지로 이동하는 대신 안내 메시지 표시
                st.info("""
                📞 **상담 신청 안내**
                
                카카오톡 또는 네이버 예약을 통해 상담을 신청해주세요.
                생성된 리포트를 바탕으로 20분간 보호자 상담을 진행합니다.
                """)
            
            st.markdown("---")
            st.warning("""
            ⚠ **중요 안내**
            
            본 그림 상담 리포트는 심리 진단이나 치료를 목적으로 하지 않으며,
            미술 수업과 상담을 돕기 위한 참고 자료입니다.
            """)

elif page == "📞 상담·수업 안내":
    st.markdown("""
    <div style='text-align: center; padding: 30px 20px;'>
        <h1 style='font-size: 2.2em; color: #2c3e50;'>
            상담·수업 안내
        </h1>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    st.markdown("### 진행 흐름")
    
    steps = [
        ("1️⃣", "그림 상담 (AI)", "아이의 그림을 AI로 분석하고 상담 질문을 통해 이야기를 나눕니다."),
        ("2️⃣", "보호자 상담 (20분)", "생성된 리포트를 바탕으로 보호자와 간단한 상담을 진행합니다."),
        ("3️⃣", "아이 맞춤 미술 수업 제안", "아이의 특성에 맞는 수업 방식을 제안합니다."),
        ("4️⃣", "정기 수업 진행", "아이의 속도에 맞춰 자연스럽게 수업을 진행합니다."),
    ]
    
    for num, title, desc in steps:
        st.markdown(f"""
        <div style='background-color: #f8f9fa; padding: 20px; margin-bottom: 15px; border-left: 4px solid #3498db; border-radius: 5px;'>
            <h4 style='color: #2c3e50; margin-bottom: 10px;'>{num} {title}</h4>
            <p style='color: #7f8c8d;'>{desc}</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    st.markdown("### 상담에 대해")
    st.info("""
    💡 **아이를 '문제'로 보지 않습니다.**  
    아이의 속도를 먼저 이해합니다.
    """)
    
    st.markdown("---")
    
    st.markdown("### 문의하기")
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("**카카오채널**")
        st.button("카카오톡으로 문의", use_container_width=True)
    with col2:
        st.markdown("**네이버 예약**")
        st.button("네이버 예약하기", use_container_width=True)

elif page == "💌 문의":
    st.markdown("""
    <div style='text-align: center; padding: 30px 20px;'>
        <h1 style='font-size: 2.2em; color: #2c3e50;'>
            문의하기
        </h1>
        <p style='font-size: 1.1em; color: #7f8c8d; margin-top: 20px;'>
            궁금한 점은 언제든 편하게 문의 주세요.<br>
            아이 이야기는 천천히 들어도 괜찮습니다.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("### 카카오채널")
        st.button("💬 카카오톡으로 문의", use_container_width=True, type="primary")
    with col2:
        st.markdown("### 네이버 예약")
        st.button("📅 네이버 예약하기", use_container_width=True, type="primary")
    
    st.markdown("---")
    
    st.markdown("### 간단 문의 폼")
    with st.form("contact_form"):
        name = st.text_input("이름")
        phone = st.text_input("연락처")
        child_age = st.selectbox("아이 연령", ["5세", "6세", "7세", "8세", "9세", "10세", "11세", "12세 이상"])
        message = st.text_area("문의 내용", height=150)
        submitted = st.form_submit_button("문의하기", use_container_width=True)
        
        if submitted:
            st.success("문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.")

elif page == "📤 그림 업로드":
    st.title("📤 그림 업로드 및 분석")
    st.markdown("그림을 업로드하면 AI가 분석하여 상담용 리포트를 생성합니다.")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        uploaded_file = st.file_uploader(
            "그림 파일을 선택하세요",
            type=['png', 'jpg', 'jpeg'],
            help="PNG, JPG, JPEG 형식을 지원합니다."
        )
        
        if uploaded_file:
            # 이미지 미리보기
            st.image(uploaded_file, caption="업로드된 그림", use_container_width=True)
            
            # 감정 선택 (선택사항)
            user_emotion = st.selectbox(
                "현재 감정을 선택하세요 (선택사항)",
                ["선택 안함", "기쁨", "슬픔", "화남", "불안", "평온", "혼란", "기타"],
                help="선택한 감정은 리포트 생성에 참고됩니다."
            )
            
            if user_emotion == "선택 안함":
                user_emotion = None
            
            # 분석 버튼
            if st.button("🔍 분석 시작", type="primary", use_container_width=True):
                with st.spinner("이미지를 분석하고 리포트를 생성하는 중..."):
                    try:
                        # 이미지 처리
                        image_result = image_service.process_uploaded_image(uploaded_file)
                        
                        if not image_result.get("success"):
                            st.error(f"이미지 처리 오류: {image_result.get('error')}")
                        else:
                            # AI 분석
                            report_data = ai_service.analyze_image(
                                image_result["description"],
                                user_emotion
                            )
                            
                            # 이미지 메타데이터 저장
                            report_data.image_metadata = image_result["metadata"]
                            
                            # 리포트 저장 (JSON)
                            report_service.save_report(report_data)
                            
                            # 리포트 마크다운 파일로 저장
                            md_file_path = report_service.save_markdown_report(report_data, ai_service)
                            
                            st.session_state.current_report = report_data
                            st.success("✅ 리포트가 생성되었습니다!")
                            st.info(f"📁 리포트가 저장되었습니다: `{md_file_path}`")
                            st.balloons()
                            
                            # 리포트 미리보기
                            st.markdown("---")
                            st.subheader("📄 생성된 리포트 미리보기")
                            md_report = ai_service.generate_markdown_report(report_data)
                            st.markdown(md_report)
                            
                            # 다운로드 버튼
                            col_dl1, col_dl2 = st.columns(2)
                            with col_dl1:
                                st.download_button(
                                    label="📥 리포트 다운로드 (Markdown)",
                                    data=md_report,
                                    file_name=f"그림상담보고서_{report_data.created_at.strftime('%Y%m%d_%H%M%S')}_{report_data.id[:8]}.md",
                                    mime="text/markdown",
                                    use_container_width=True
                                )
                            with col_dl2:
                                try:
                                    pdf_data = report_service.generate_pdf_report(report_data, ai_service)
                                    st.download_button(
                                        label="📥 리포트 다운로드 (PDF)",
                                        data=pdf_data,
                                        file_name=f"그림상담보고서_{report_data.created_at.strftime('%Y%m%d_%H%M%S')}_{report_data.id[:8]}.pdf",
                                        mime="application/pdf",
                                        use_container_width=True
                                    )
                                except Exception as e:
                                    st.error(f"PDF 생성 오류: {str(e)}")
                            
                    except Exception as e:
                        st.error(f"오류가 발생했습니다: {str(e)}")
                        st.exception(e)
    
    with col2:
        st.markdown("### 💡 사용 팁")
        st.markdown("""
        1. **명확한 그림**: 선명하고 잘 보이는 그림을 업로드하세요.
        
        2. **감정 선택**: 현재 감정을 선택하면 더 정확한 분석이 가능합니다.
        
        3. **리포트 활용**: 생성된 리포트는 상담의 시작점으로 활용하세요.
        
        4. **개인정보**: 그림은 저장되지 않으며, 메타데이터만 저장됩니다.
        """)

elif page == "📋 리포트 보기":
    st.title("📋 리포트 목록")
    
    reports = report_service.list_reports()
    
    if not reports:
        st.info("아직 생성된 리포트가 없습니다. 그림을 업로드하여 리포트를 생성해보세요.")
    else:
        st.markdown(f"총 **{len(reports)}**개의 리포트가 있습니다.")
        
        for report in reports:
            with st.expander(f"📄 리포트 - {report.created_at.strftime('%Y-%m-%d %H:%M:%S')}"):
                col1, col2 = st.columns([3, 1])
                
                with col1:
                    st.markdown(f"**리포트 ID**: `{report.id}`")
                    if report.user_emotion:
                        st.markdown(f"**선택한 감정**: {report.user_emotion}")
                    if report.counselor_comments:
                        st.markdown(f"**상담사 코멘트**: {report.counselor_comments}")
                
                with col2:
                    if st.button("보기", key=f"view_{report.id}"):
                        st.session_state.current_report = report
                        st.rerun()
                
                # 리포트 미리보기
                md_report = ai_service.generate_markdown_report(report)
                st.markdown("---")
                st.markdown(md_report[:500] + "..." if len(md_report) > 500 else md_report)
                
                # 다운로드 버튼
                col_dl1, col_dl2 = st.columns(2)
                with col_dl1:
                    st.download_button(
                        label="📥 Markdown 다운로드",
                        data=md_report,
                        file_name=f"report_{report.id}.md",
                        mime="text/markdown",
                        key=f"md_{report.id}"
                    )
                with col_dl2:
                    try:
                        pdf_data = report_service.generate_pdf_report(report, ai_service)
                        st.download_button(
                            label="📥 PDF 다운로드",
                            data=pdf_data,
                            file_name=f"report_{report.id}.pdf",
                            mime="application/pdf",
                            key=f"pdf_{report.id}"
                        )
                    except Exception as e:
                        st.error(f"PDF 생성 오류: {str(e)}")

elif page == "💬 심리상담":
    st.title("💬 심리상담 채팅")
    st.markdown("그림 분석 결과를 바탕으로 전문 상담사와 대화형 상담을 진행하고 전문 상담 보고서를 받아보세요.")
    
    # 리포트 선택
    reports = report_service.list_reports()
    
    if not reports:
        st.info("먼저 그림을 업로드하여 리포트를 생성해주세요.")
    else:
        # 리포트 선택
        report_options = {
            f"{r.created_at.strftime('%Y-%m-%d %H:%M')} - {r.id[:8]}": r.id 
            for r in reports
        }
        
        selected_report_key = st.selectbox("상담할 리포트 선택", list(report_options.keys()))
        selected_report_id = report_options[selected_report_key]
        
        if selected_report_id:
            report = report_service.load_report(selected_report_id)
            
            if report:
                # 리포트 요약 표시
                with st.expander("📊 선택한 리포트 요약", expanded=False):
                    st.markdown(f"**생성일**: {report.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
                    st.markdown(f"**주요 감정**: {', '.join(report.emotional_language.dominant_emotions) if report.emotional_language.dominant_emotions else '없음'}")
                    st.markdown(f"**감정적 톤**: {report.emotional_language.emotional_tone or '없음'}")
                
                # 상담 세션 초기화
                if 'chat_initialized' not in st.session_state or st.session_state.get('chat_report_id') != selected_report_id:
                    st.session_state.counseling_responses = []
                    st.session_state.current_question_index = 0
                    st.session_state.counseling_completed = False
                    st.session_state.professional_report = None
                    st.session_state.chat_initialized = True
                    st.session_state.chat_report_id = selected_report_id
                    if report.reflection_questions.questions:
                        st.session_state.current_question = report.reflection_questions.questions[0]
                    else:
                        st.session_state.current_question = "이 그림을 그릴 때 어떤 감정을 느꼈나요?"
                
                # 채팅 인터페이스
                st.markdown("---")
                st.markdown("### 💬 상담 대화")
                
                # 이전 대화 표시
                if st.session_state.counseling_responses:
                    for idx, response in enumerate(st.session_state.counseling_responses):
                        with st.chat_message("assistant"):
                            st.write(f"**질문 {idx + 1}**: {response['question']}")
                        with st.chat_message("user"):
                            st.write(response['answer'])
                
                # 현재 질문 표시
                if not st.session_state.counseling_completed and 'current_question' in st.session_state:
                    with st.chat_message("assistant"):
                        st.write(f"**질문 {st.session_state.current_question_index + 1}**: {st.session_state.current_question}")
                    
                    # 답변 입력
                    user_answer = st.chat_input("답변을 입력하세요...")
                    
                    if user_answer:
                        # 답변 저장
                        st.session_state.counseling_responses.append({
                            'question': st.session_state.current_question,
                            'answer': user_answer
                        })
                        
                        # 다음 질문 생성 또는 상담 완료
                        if len(st.session_state.counseling_responses) < len(report.reflection_questions.questions):
                            # 다음 질문 사용
                            next_question = report.reflection_questions.questions[len(st.session_state.counseling_responses)]
                            st.session_state.current_question = next_question
                            st.session_state.current_question_index += 1
                        else:
                            # 모든 질문 완료
                            st.session_state.counseling_completed = True
                            st.session_state.current_question = None
                        
                        st.rerun()
                    
                # 상담 완료 후 전문가 평가
                if st.session_state.counseling_completed:
                    if st.session_state.professional_report is None:
                        with st.chat_message("assistant"):
                            st.success("✅ 모든 상담 질문이 완료되었습니다!")
                            st.write("전문가 심리상담 보고서를 생성하시겠습니까?")
                        
                        if st.button("📋 전문가 심리상담 보고서 생성", use_container_width=True, type="primary"):
                            with st.spinner("30년 경력 심리상담 전문가가 평가 중입니다..."):
                                try:
                                    # 전문가 평가
                                    evaluation = counseling_service.conduct_counseling_session(
                                        report,
                                        st.session_state.counseling_responses
                                    )
                                    
                                    # 전문 상담 보고서 생성
                                    professional_report = counseling_service.generate_professional_report(
                                        report,
                                        evaluation
                                    )
                                    
                                    st.session_state.professional_report = professional_report
                                    st.session_state.evaluation = evaluation
                                    st.rerun()
                                    
                                except Exception as e:
                                    st.error(f"보고서 생성 오류: {str(e)}")
                                    st.exception(e)
                    else:
                        # 전문 상담 보고서 표시
                        st.markdown("---")
                        st.markdown("## 📋 전문 심리상담 보고서")
                        st.markdown("**30년 경력 심리상담 전문가가 작성한 보고서입니다.**")
                        st.markdown("---")
                        st.markdown(st.session_state.professional_report)
                        
                        # 다운로드 버튼
                        report_filename = f"심리상담보고서_{report.created_at.strftime('%Y%m%d_%H%M%S')}_{report.id[:8]}.md"
                        st.download_button(
                            label="📥 전문 상담 보고서 다운로드",
                            data=st.session_state.professional_report,
                            file_name=report_filename,
                            mime="text/markdown",
                            use_container_width=True
                        )

elif page == "👨‍⚕️ 관리자 모드":
    st.title("👨‍⚕️ 관리자 모드")
    st.markdown("상담사가 리포트를 수정하고 코멘트를 추가할 수 있습니다.")
    
    reports = report_service.list_reports()
    
    if not reports:
        st.info("수정할 리포트가 없습니다.")
    else:
        # 리포트 선택
        report_options = {
            f"{r.created_at.strftime('%Y-%m-%d %H:%M')} - {r.id[:8]}": r.id 
            for r in reports
        }
        
        selected_report_key = st.selectbox("리포트 선택", list(report_options.keys()))
        selected_report_id = report_options[selected_report_key]
        
        if selected_report_id:
            report = report_service.load_report(selected_report_id)
            
            if report:
                st.markdown("---")
                st.subheader("현재 리포트 내용")
                
                # 리포트 미리보기
                md_report = ai_service.generate_markdown_report(report)
                st.markdown(md_report)
                
                st.markdown("---")
                st.subheader("리포트 수정")
                
                # 상담사 코멘트 추가
                counselor_comments = st.text_area(
                    "상담사 코멘트 추가",
                    value=report.counselor_comments or "",
                    height=150,
                    help="상담사가 리포트에 추가 코멘트를 작성할 수 있습니다."
                )
                
                if st.button("💾 저장", type="primary"):
                    updated_report = report_service.update_report(
                        selected_report_id,
                        counselor_comments=counselor_comments if counselor_comments else None
                    )
                    
                    if updated_report:
                        st.success("✅ 리포트가 업데이트되었습니다!")
                        st.rerun()
                    else:
                        st.error("❌ 리포트 업데이트에 실패했습니다.")

# 푸터
st.markdown("---")
st.markdown(
    "<div style='text-align: center; color: #666; padding: 20px;'>"
    "대전 초등 저학년 개인 미술수업 | 그림으로 아이 마음을 천천히 이해합니다"
    "</div>",
    unsafe_allow_html=True
)

