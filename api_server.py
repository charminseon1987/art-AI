"""FastAPI 서버 - Next.js 프론트엔드와 연동"""
from fastapi import FastAPI, File, UploadFile, Form, Header, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from typing import Optional, List, Dict
from datetime import datetime
import os
import sys
import logging
import asyncio
import random
from io import BytesIO

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.image_service import ImageService
from services.ai_service import AIService
from services.report_service import ReportService
from services.report_generator_service import ReportGeneratorService
from services.simple_report_service import SimpleReportService
from services.class_work_service import ClassWorkService
from services.fingerprint_service import FingerprintService
from services.contact_service import ContactService
from services.usage_limit_service import UsageLimitService
from services.phone_auth_service import get_phone_auth_service
from services.reservation_service import get_reservation_service
from services.payment_service import get_payment_service
from services.stripe_service import get_stripe_service
from services.email_service import EmailService
from models.class_work import ClassWork
from models.contact import ContactInquiry
from langchain_openai import ChatOpenAI
from utils.setup import setup_directories
from utils.auth import verify_admin_token
from utils.supabase_auth import verify_supabase_token, require_admin_or_supervisor, supabase as supabase_client

# 디렉토리 설정
setup_directories()

# 로거 설정
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(title="AI 그림 분석 도구 API", version="1.0.0")

# CORS 설정
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# 프로덕션 프론트엔드 URL 추가 (환경 변수에서 읽기)
# Cloudflare Pages URL도 여기에 포함됩니다
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

# Cloudflare Pages 도메인 패턴 추가 (환경 변수로 설정 가능)
cloudflare_pages_url = os.getenv("CLOUDFLARE_PAGES_URL")
if cloudflare_pages_url:
    allowed_origins.append(cloudflare_pages_url)

# Cloudflare Tunnel을 통한 접근도 허용 (필요시)
# Tunnel을 사용하는 경우, Tunnel 도메인도 CORS에 추가해야 합니다

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서비스 초기화
api_key = os.getenv("OPENAI_API_KEY", "")
if not api_key:
    raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다.")

llm = ChatOpenAI(model="gpt-4o-mini", api_key=api_key, temperature=0.7)
image_service = ImageService(openai_api_key=api_key)
ai_service = AIService(llm)
report_service = ReportService()
simple_report_service = SimpleReportService(llm)
class_work_service = ClassWorkService()
fingerprint_service = FingerprintService(llm, image_service)
contact_service = ContactService()
usage_limit_service = UsageLimitService()

# PhoneAuthService 초기화 (에러 발생 시에도 서버가 시작되도록)
try:
    phone_auth_service = get_phone_auth_service()
except Exception as e:
    print(f"Warning: PhoneAuthService 초기화 실패: {e}")
    print("NCP SENS 자격 증명이 설정되지 않았습니다. 전화 인증 기능은 사용할 수 없습니다.")
    phone_auth_service = None

# ReportGeneratorService 초기화 (에러 발생 시에도 서버가 시작되도록)
try:
    report_generator_service = ReportGeneratorService(llm)
except Exception as e:
    print(f"Warning: ReportGeneratorService 초기화 실패: {e}")
    report_generator_service = None

# EmailService 초기화 (에러 발생 시에도 서버가 시작되도록)
try:
    email_service = EmailService()
except Exception as e:
    print(f"Warning: EmailService 초기화 실패: {e}")
    print("Resend API 키가 설정되지 않았습니다. 이메일 전송 기능은 사용할 수 없습니다.")
    email_service = None

# ReservationService 초기화
try:
    reservation_service = get_reservation_service()
except Exception as e:
    print(f"Warning: ReservationService 초기화 실패: {e}")
    reservation_service = None

# PaymentService 초기화
try:
    payment_service = get_payment_service()
except Exception as e:
    print(f"Warning: PaymentService 초기화 실패: {e}")
    payment_service = None

# StripeService 초기화
try:
    stripe_service = get_stripe_service()
except Exception as e:
    print(f"Warning: StripeService 초기화 실패: {e}")
    stripe_service = None


@app.get("/")
async def root():
    return {"message": "AI 그림 분석 도구 API 서버", "status": "running"}


@app.get("/api/stats")
async def get_public_stats():
    """랜딩 페이지용 공개 집계 (인증 불필요). 실제 데이터만 반환."""
    if not supabase_client:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "통계를 불러올 수 없습니다.",
                "total_analyses": 0,
                "total_users": 0,
            },
        )
    try:
        total_analyses = 0
        total_users = 0

        # user_usage_limits 전체 합산 (image + fingerprint)
        usage_res = supabase_client.table("user_usage_limits").select(
            "image_analysis_count", "fingerprint_analysis_count"
        ).execute()
        if usage_res.data:
            for row in usage_res.data:
                total_analyses += (row.get("image_analysis_count") or 0) + (
                    row.get("fingerprint_analysis_count") or 0
                )

        # profiles 행 수
        profiles_res = supabase_client.table("profiles").select("id").execute()
        if profiles_res.data is not None:
            total_users = len(profiles_res.data)

        return {
            "success": True,
            "total_analyses": total_analyses,
            "total_users": total_users,
        }
    except Exception as e:
        logger.exception("공개 통계 조회 실패: %s", e)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "통계를 불러오는 중 오류가 발생했습니다.",
                "total_analyses": 0,
                "total_users": 0,
            },
        )


@app.post("/api/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    emotion: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    """이미지 분석 API"""
    # 토큰 검증 (선택적)
    user_id = None
    try:
        if authorization:
            user_info = verify_supabase_token(authorization)
            user_id = user_info.get("id")
    except Exception as e:
        # 인증 실패해도 계속 진행 (인증은 선택적)
        print(f"인증 토큰 검증 실패 (계속 진행): {e}")
        pass
    
    try:
        print(f"[analyze-image] 요청 받음: 파일명={file.filename}, 크기={file.size if hasattr(file, 'size') else 'unknown'}, 감정={emotion}")
        
        # 사용 횟수 확인 (인증된 사용자인 경우만)
        if user_id:
            print(f"[analyze-image] 사용자 ID: {user_id}, 사용 횟수 확인 중...")
            is_allowed, error_message = usage_limit_service.check_image_analysis_limit(user_id)
            if not is_allowed:
                print(f"[analyze-image] 사용 횟수 초과: {error_message}")
                return JSONResponse(
                    status_code=200,
                    content={
                        "success": False,
                        "error": error_message
                    }
                )
        
        # 파일 읽기
        print("[analyze-image] 파일 읽기 시작...")
        contents = await file.read()
        if not contents:
            print("[analyze-image] 파일이 비어있음")
            return JSONResponse(
                status_code=400,
                content={"error": "파일이 비어있습니다."}
            )
        
        file_obj = BytesIO(contents)
        file_obj.name = file.filename
        print(f"[analyze-image] 파일 읽기 완료: {len(contents)} bytes")
        
        # 이미지 처리
        print("[analyze-image] 이미지 처리 시작...")
        image_result = image_service.process_uploaded_image(file_obj)
        
        if not image_result.get("success"):
            error_msg = image_result.get("error", "이미지 처리 실패")
            print(f"[analyze-image] 이미지 처리 실패: {error_msg}")
            return JSONResponse(
                status_code=400,
                content={"error": f"이미지 처리 실패: {error_msg}"}
            )
        
        print("[analyze-image] 이미지 처리 완료, AI 분석 시작...")
        desc = image_result.get("description", "") or ""
        logger.info("[analyze-image] image_result['description'] length=%s, preview=%s", len(desc), (desc[:200] + "..." if len(desc) > 200 else desc))
        # AI 분석 (동기 Crew 실행을 스레드에서 수행해 이벤트 루프 블로킹 방지)
        try:
            report_data = await asyncio.to_thread(
                ai_service.analyze_image,
                image_result["description"],
                emotion,
            )
            print(f"[analyze-image] AI 분석 완료: report_id={report_data.id}")
        except Exception as ai_error:
            import traceback
            ai_error_trace = traceback.format_exc()
            print(f"[analyze-image] AI 분석 중 에러 발생:")
            print(ai_error_trace)
            # 개발 환경에서는 상세한 트레이스백 포함
            error_detail = {
                "error": f"AI 분석 중 오류가 발생했습니다: {str(ai_error)}",
                "error_type": type(ai_error).__name__
            }
            if os.getenv("DEBUG", "false").lower() == "true":
                error_detail["traceback"] = ai_error_trace
            return JSONResponse(
                status_code=500,
                content=error_detail
            )
        
        # 메타데이터 저장 (base64 이미지 포함)
        report_data.image_metadata = image_result["metadata"]
        report_data.image_metadata["base64"] = image_result.get("base64", "")
        
        # 리포트 저장
        print("[analyze-image] 리포트 저장 중...")
        try:
            report_service.save_report(report_data)
            print("[analyze-image] 리포트 저장 완료")
        except Exception as save_error:
            import traceback
            save_error_trace = traceback.format_exc()
            print(f"[analyze-image] 리포트 저장 중 에러 발생:")
            print(save_error_trace)
            return JSONResponse(
                status_code=500,
                content={
                    "error": f"리포트 저장 중 오류가 발생했습니다: {str(save_error)}",
                    "error_type": type(save_error).__name__
                }
            )
        
        # 사용 횟수 증가 (인증된 사용자인 경우만)
        if user_id:
            print(f"[analyze-image] 사용 횟수 증가: user_id={user_id}")
            usage_limit_service.increment_image_analysis_count(user_id)
        
        # 응답 데이터 구성
        print("[analyze-image] 응답 생성 중...")
        try:
            response_data = {
                "success": True,
                "report_id": report_data.id,
                "report": {
                    "id": report_data.id,
                    "observation": report_data.observation.model_dump(),
                    "emotional_language": report_data.emotional_language.model_dump(),
                    "reflection_questions": report_data.reflection_questions.model_dump(),
                    "professional_conclusion": report_data.professional_conclusion.model_dump(),
                    "user_emotion": report_data.user_emotion,
                    "created_at": report_data.created_at.isoformat(),
                },
                "chat_ready": True  # Chat 인터페이스 준비 완료
            }
            print("[analyze-image] 응답 생성 완료, 반환 중...")
            return response_data
        except Exception as response_error:
            import traceback
            response_error_trace = traceback.format_exc()
            print(f"[analyze-image] 응답 생성 중 에러 발생:")
            print(response_error_trace)
            return JSONResponse(
                status_code=500,
                content={
                    "error": f"응답 생성 중 오류가 발생했습니다: {str(response_error)}",
                    "error_type": type(response_error).__name__
                }
            )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"[analyze-image] 에러 발생:")
        print(error_trace)
        error_detail = {
            "error": str(e),
            "error_type": type(e).__name__
        }
        # 개발 환경에서는 상세한 트레이스백 포함
        if os.getenv("DEBUG", "false").lower() == "true":
            error_detail["traceback"] = error_trace
        return JSONResponse(
            status_code=500,
            content=error_detail
        )


@app.post("/api/generate-report")
async def generate_report(
    report_id: str = Form(...),
    chat_responses: str = Form(...),  # JSON string
    age: Optional[str] = Form(None),
    gender: Optional[str] = Form(None)
):
    """Chat 응답을 포함한 리포트 생성 API"""
    try:
        import json
        
        # 리포트 로드
        report_data = report_service.load_report(report_id)
        if not report_data:
            return JSONResponse(
                status_code=404,
                content={"error": "리포트를 찾을 수 없습니다."}
            )
        
        # Chat 응답 파싱
        try:
            chat_responses_list = json.loads(chat_responses)
        except:
            return JSONResponse(
                status_code=400,
                content={"error": "Chat 응답 형식이 올바르지 않습니다."}
            )
        
        # 사용자가 기본 질문에 답변한 경우, 종합결론을 업데이트하여 사용자 답변을 반영
        if chat_responses_list:
            try:
                from agents.conclusion_agent import ConclusionAgent
                from langchain_openai import ChatOpenAI
                from services.scraping_service import ArtTherapyScrapingService
                import os
                
                # ConclusionAgent 생성 (참고 자료 포함)
                llm = ChatOpenAI(
                    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                    temperature=0.7
                )
                scraping_service = ArtTherapyScrapingService()
                reference_material = scraping_service.get_reference_material()
                conclusion_agent = ConclusionAgent(llm, reference_material=reference_material)
                
                # 사용자 답변을 포함하여 종합결론 재생성
                conclusion_task = conclusion_agent.create_conclusion_task(
                    report_data.observation,
                    report_data.emotional_language,
                    report_data.reflection_questions,
                    report_data.user_emotion,
                    chat_responses=chat_responses_list  # 사용자의 기본 질문 답변 포함
                )
                
                from crewai import Crew, Process
                conclusion_crew = Crew(
                    agents=[conclusion_agent.agent],
                    tasks=[conclusion_task],
                    process=Process.sequential,
                    verbose=True
                )
                conclusion_result = conclusion_crew.kickoff()
                
                # 업데이트된 professional_report 저장
                report_data.image_metadata = report_data.image_metadata or {}
                report_data.image_metadata["professional_report"] = str(conclusion_result)
                
                # professional_conclusion도 업데이트 시도
                try:
                    updated_conclusion = conclusion_agent.parse_conclusion(str(conclusion_result))
                    if updated_conclusion.professional_assessment:
                        report_data.professional_conclusion = updated_conclusion
                except:
                    pass  # 파싱 실패 시 기존 conclusion 유지
                    
            except Exception as e:
                import traceback
                print(f"종합결론 업데이트 오류 (계속 진행): {traceback.format_exc()}")
                # 오류 발생 시 기존 리포트 사용

        # 채팅 응답이 있으면 분석 에이전트(교육용 상세 분석) 실행
        if chat_responses_list:
            try:
                from services.analysis_service import AnalysisService
                from services.scraping_service import ArtTherapyScrapingService
                scraping_service = ArtTherapyScrapingService()
                analysis_service = AnalysisService(llm, scraping_service)

                def run_analysis_session():
                    evaluation = analysis_service.conduct_analysis_session(
                        report_data, chat_responses_list
                    )
                    return analysis_service.generate_professional_report(
                        report_data, evaluation
                    )

                professional_analysis_report = await asyncio.to_thread(run_analysis_session)
                report_data.image_metadata = report_data.image_metadata or {}
                report_data.image_metadata["professional_analysis_report"] = (
                    professional_analysis_report
                )
                print("[generate-report] 분석 에이전트(교육용 상세 분석) 실행 완료")
            except Exception as analysis_err:
                import traceback
                print(f"[generate-report] 분석 에이전트 실행 오류 (계속 진행): {traceback.format_exc()}")
                # 오류 시에도 리포트 생성은 진행

        # 간단 리포트 생성 (미술 심리 전문가 리포트 - 최종본)
        simple_report = simple_report_service.generate_simple_report(
            report_data,
            chat_responses_list,
            age=age,
            gender=gender
        )
        
        # 리포트 저장 (chat_responses 및 간단 리포트 포함)
        report_data.image_metadata = report_data.image_metadata or {}
        report_data.image_metadata["chat_responses"] = chat_responses_list
        report_data.image_metadata["simple_report"] = simple_report
        if age:
            report_data.image_metadata["age"] = age
        if gender:
            report_data.image_metadata["gender"] = gender
        
        report_service.save_report(report_data)
        
        # 이메일 전송 (user_id가 있는 경우에만)
        email_sent = False
        if email_service and report_data.user_id:
            try:
                print(f"[generate-report] 이메일 전송 시도: user_id={report_data.user_id}")
                
                # 사용자 이메일 조회
                user_email = email_service.get_user_email(report_data.user_id)
                
                if user_email:
                    # PDF 생성
                    image_base64 = report_data.image_metadata.get("base64", None) if report_data.image_metadata else None
                    
                    pdf_content = report_service.generate_pdf_from_markdown(
                        simple_report,
                        title="그림 관찰 기반 분석 리포트",
                        image_base64=image_base64,
                        user_info=None,  # 이메일 전송 시에는 user_info 불필요
                        report_user_id=report_data.user_id
                    )
                    
                    # 이메일 전송
                    email_result = email_service.send_report_email(
                        report_data,
                        pdf_content,
                        user_email
                    )
                    
                    if email_result.get("success"):
                        print(f"[generate-report] 이메일 전송 성공: {user_email}")
                        email_sent = True
                    else:
                        print(f"[generate-report] 이메일 전송 실패: {email_result.get('message')}")
                else:
                    print(f"[generate-report] 사용자 이메일을 찾을 수 없습니다: user_id={report_data.user_id}")
            except Exception as email_error:
                import traceback
                email_error_trace = traceback.format_exc()
                print(f"[generate-report] 이메일 전송 중 오류 발생 (리포트 생성은 성공): {email_error_trace}")
                # 이메일 전송 실패해도 리포트 생성은 성공으로 처리
        
        return {
            "success": True,
            "report_id": report_data.id,
            "simple_report": simple_report,
            "email_sent": email_sent,  # 이메일 전송 여부 포함
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"리포트 생성 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"리포트 생성 실패: {str(e)}"}
        )


@app.get("/api/reports")
async def get_reports(authorization: Optional[str] = Header(None)):
    """리포트 목록 조회 (관리자 전용)"""
    # 관리자 인증 확인
    # verify_admin_token(authorization)  # 테스트용 비활성화
    try:
        reports = report_service.list_reports()
        
        # 리포트 데이터 변환 시 에러 핸들링
        report_list = []
        for r in reports:
            try:
                report_list.append({
                    "id": r.id,
                    "created_at": r.created_at.isoformat() if hasattr(r, 'created_at') and r.created_at else datetime.now().isoformat(),
                    "user_emotion": getattr(r, 'user_emotion', None),
                })
            except Exception as e:
                print(f"경고: 리포트 {r.id if hasattr(r, 'id') else 'unknown'} 변환 실패: {e}")
                continue
        
        return {
            "success": True,
            "reports": report_list
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"리포트 목록 조회 오류:\n{error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"리포트 목록을 불러오는 중 오류가 발생했습니다: {str(e)}"}
        )


@app.post("/api/reports/{report_id}/analyzer-answers")
async def save_analyzer_answers(
    report_id: str,
    answers: dict,
    authorization: Optional[str] = Header(None)
):
    """분석 답변 저장 및 종합 분석 생성 (관리자 전용)"""
    # 관리자 인증 확인
    # verify_admin_token(authorization)  # 테스트용 비활성화
    try:
        # 리포트 로드
        report_data = report_service.load_report(report_id)
        if not report_data:
            return JSONResponse(
                status_code=404,
                content={"error": "리포트를 찾을 수 없습니다."}
            )
        
        # 분석 답변 저장
        analyzer_answers = answers.get("answers", {})
        report_data.image_metadata = report_data.image_metadata or {}
        report_data.image_metadata["analyzer_answers"] = analyzer_answers

        # 분석 답변이 있으면 AI 종합 분석 생성
        if analyzer_answers:
            try:
                from agents.conclusion_agent import ConclusionAgent
                from langchain_openai import ChatOpenAI
                from services.scraping_service import ArtTherapyScrapingService
                import os
                
                # ConclusionAgent 생성 (참고 자료 포함)
                llm = ChatOpenAI(
                    model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
                    temperature=0.7
                )
                scraping_service = ArtTherapyScrapingService()
                reference_material = scraping_service.get_reference_material()
                conclusion_agent = ConclusionAgent(llm, reference_material=reference_material)
                
                # 분석 답변을 바탕으로 종합 분석 생성
                # 분석 답변을 chat_responses 형식으로 변환
                analyzer_responses = []
                if report_data.reflection_questions and report_data.reflection_questions.questions:
                    for idx, question in enumerate(report_data.reflection_questions.questions):
                        if idx in analyzer_answers and analyzer_answers[idx]:
                            analyzer_responses.append({
                                "question": question,
                                "answer": analyzer_answers[idx]
                            })

                # 종합 분석 생성
                conclusion_task = conclusion_agent.create_conclusion_task(
                    report_data.observation,
                    report_data.emotional_language,
                    report_data.reflection_questions,
                    report_data.user_emotion,
                    chat_responses=analyzer_responses if analyzer_responses else None
                )
                
                from crewai import Crew, Process
                conclusion_crew = Crew(
                    agents=[conclusion_agent.agent],
                    tasks=[conclusion_task],
                    process=Process.sequential,
                    verbose=True
                )
                conclusion_result = conclusion_crew.kickoff()
                
                # 분석 답변 기반 종합 분석 저장
                report_data.image_metadata["analyzer_based_analysis"] = str(conclusion_result)

            except Exception as e:
                import traceback
                print(f"분석 답변 기반 종합 분석 생성 오류: {traceback.format_exc()}")
                # 오류 발생 시에도 답변은 저장

        # 리포트 저장
        report_service.save_report(report_data)

        return {
            "success": True,
            "message": "분석 답변이 저장되었습니다."
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"분석 답변 저장 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"답변 저장 실패: {str(e)}"}
        )


@app.get("/api/reports/{report_id}")
async def get_report(report_id: str, authorization: Optional[str] = Header(None)):
    """특정 리포트 조회 (관리자 전용)"""
    # 관리자 인증 확인
    # verify_admin_token(authorization)  # 테스트용 비활성화
    try:
        report = report_service.load_report(report_id)
        if not report:
            return JSONResponse(
                status_code=404,
                content={"error": "리포트를 찾을 수 없습니다."}
            )
        
        # image_metadata에서 base64 이미지 추출
        image_metadata = report.image_metadata.copy() if report.image_metadata else {}
        base64_image = image_metadata.get("base64", "")
        
        return {
            "success": True,
            "report": {
                "id": report.id,
                "observation": report.observation.model_dump(),
                "emotional_language": report.emotional_language.model_dump(),
                "reflection_questions": report.reflection_questions.model_dump(),
                "professional_conclusion": report.professional_conclusion.model_dump(),
                "user_emotion": report.user_emotion,
                "created_at": report.created_at.isoformat(),
                "chat_responses": report.image_metadata.get("chat_responses", []),
                "chat_based_report": report.image_metadata.get("chat_based_report", None),
                "professional_report": report.image_metadata.get("professional_report", None),
                "image_metadata": {
                    **image_metadata,
                    "base64": base64_image,  # base64 이미지 포함
                },
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.post("/api/reports/{report_id}/analyze")
async def conduct_analysis(report_id: str, responses: List[Dict]):
    """분석 세션 진행"""
    try:
        from services.analysis_service import AnalysisService
        from services.scraping_service import ArtTherapyScrapingService

        report = report_service.load_report(report_id)
        if not report:
            return JSONResponse(
                status_code=404,
                content={"error": "리포트를 찾을 수 없습니다."}
            )

        scraping_service = ArtTherapyScrapingService()
        analysis_service = AnalysisService(llm, scraping_service)

        # 분석 세션 진행
        evaluation = analysis_service.conduct_analysis_session(
            report,
            responses
        )

        # 전문 분석 보고서 생성
        professional_report = analysis_service.generate_professional_report(
            report,
            evaluation
        )

        return {
            "success": True,
            "professional_report": professional_report,
            "evaluation": evaluation
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.post("/api/class-works")
async def create_class_work(
    thumbnail: UploadFile = File(...),
    age_range: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(default=None),
    category: int = Form(0),  # 0=유아, 1=초등, 2=중등, 3=애니
    authorization: Optional[str] = Header(None)
):
    """수업 작품 생성 (관리자 전용)"""
    # 관리자 인증 확인
    try:
        user_info = verify_supabase_token(authorization)
        if user_info.get("role") not in ["admin", "supervisor"]:
            return JSONResponse(
                status_code=403,
                content={"error": "관리자 또는 슈퍼바이저 권한이 필요합니다."}
            )
    except HTTPException as e:
        # Supabase 인증 실패 시 기존 방식으로 폴백 (하위 호환성)
        if e.status_code == 503:  # Supabase가 설정되지 않은 경우
            try:
                verify_admin_token(authorization)
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )
        else:
            return JSONResponse(
                status_code=e.status_code,
                content={"error": e.detail}
            )
    except Exception as e:
        # 기타 오류 시 기존 방식으로 폴백
        try:
            verify_admin_token(authorization)
        except:
            return JSONResponse(
                status_code=401,
                content={"error": "인증이 필요합니다."}
            )
    
    try:
        import uuid
        import traceback
        
        # 이미지 저장 디렉토리
        images_dir = "data/class_images"
        os.makedirs(images_dir, exist_ok=True)
        
        # 섬네일 저장
        original_filename = thumbnail.filename or 'image'
        # 파일 확장자 추출
        file_ext = os.path.splitext(original_filename)[1] or '.jpg'
        # 파일명에 공백이나 특수문자가 없도록 UUID만 사용
        thumbnail_filename = f"thumb_{uuid.uuid4()}{file_ext}"
        thumbnail_path = os.path.join(images_dir, thumbnail_filename)
        with open(thumbnail_path, "wb") as f:
            contents = await thumbnail.read()
            f.write(contents)
        
        thumbnail_url = f"/uploads/class_images/{thumbnail_filename}"
        
        # 상세 이미지 저장
        image_urls = []
        if images:
            for img in images:
                if img.filename:  # 파일명이 있는 경우만 처리
                    original_filename = img.filename
                    file_ext = os.path.splitext(original_filename)[1] or '.jpg'
                    img_filename = f"{uuid.uuid4()}{file_ext}"
                    img_path = os.path.join(images_dir, img_filename)
                    with open(img_path, "wb") as f:
                        contents = await img.read()
                        f.write(contents)
                    image_urls.append(f"/uploads/class_images/{img_filename}")
        
        # ClassWork 생성
        class_work = ClassWork(
            thumbnail_url=thumbnail_url,
            age_range=age_range,
            title=title,
            images=image_urls,
            description=description,
            category=category
        )
        
        # 저장
        class_work_service.save_class_work(class_work)
        
        return {
            "success": True,
            "class_work": {
                "id": class_work.id,
                "thumbnail_url": class_work.thumbnail_url,
                "age_range": class_work.age_range,
                "title": class_work.title,
                "images": class_work.images,
                "description": class_work.description,
                "created_at": class_work.created_at.isoformat(),
            }
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"수업 작품 생성 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"작품 등록 실패: {str(e)}"}
        )


@app.get("/api/class-works")
async def get_class_works():
    """수업 작품 목록 조회 (일반 사용자 접근 가능)"""
    try:
        works = class_work_service.list_class_works()
        return {
            "success": True,
            "works": [
                {
                    "id": work.id,
                    "thumbnail_url": work.thumbnail_url,
                    "age_range": work.age_range,
                    "title": work.title,
                    "images": work.images,
                    "description": work.description,
                    "category": getattr(work, 'category', 0),  # 기본값 0 (유아)
                    "created_at": work.created_at.isoformat(),
                }
                for work in works
            ]
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.get("/api/class-works/{work_id}")
async def get_class_work(work_id: str):
    """수업 작품 상세 조회"""
    try:
        work = class_work_service.load_class_work(work_id)
        if not work:
            return JSONResponse(
                status_code=404,
                content={"error": "작품을 찾을 수 없습니다."}
            )
        
        return {
            "success": True,
            "class_work": {
                "id": work.id,
                "thumbnail_url": work.thumbnail_url,
                "age_range": work.age_range,
                "title": work.title,
                "images": work.images,
                "description": work.description,
                "category": getattr(work, 'category', 0),  # 기본값 0 (유아)
                "created_at": work.created_at.isoformat(),
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.delete("/api/class-works/{work_id}")
async def delete_class_work(
    work_id: str,
    authorization: Optional[str] = Header(None)
):
    """수업 작품 삭제 (관리자 전용)"""
    # 관리자 인증 확인
    # verify_admin_token(authorization)  # 테스트용 비활성화
    try:
        success = class_work_service.delete_class_work(work_id)
        if not success:
            return JSONResponse(
                status_code=404,
                content={"error": "작품을 찾을 수 없습니다."}
            )
        
        return {"success": True}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


# 정적 파일 서빙 (이미지)

@app.get("/api/fingerprint-data")
async def get_fingerprint_data():
    """지문 분석 관련 데이터 반환"""
    try:
        from services.scraping_service import ArtTherapyScrapingService
        scraping_service = ArtTherapyScrapingService()
        gardner_info = scraping_service.scrape_howard_gardner_info()
        blog_content = scraping_service.scrape_fingerprint_blog()
        
        # 필요한 데이터만 추출
        fingerprint_data = {
            "thumb_personality": gardner_info.get("thumb_personality"),
            "fingerprint_characteristics": gardner_info.get("fingerprint_characteristics"),
            "report_example": gardner_info.get("report_example"),
            "blog_content": blog_content,
        }
        
        return {
            "success": True,
            "data": fingerprint_data
        }
    except Exception as e:
        import traceback
        print(f"지문 데이터 로드 오류: {traceback.format_exc()}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.post("/api/analyze-fingerprint")
async def analyze_fingerprint(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    """엄지 지문 분석 API"""
    # 토큰 검증 (선택적)
    user_id = None
    try:
        if authorization:
            user_info = verify_supabase_token(authorization)
            user_id = user_info.get("id")
    except Exception as e:
        # 인증 실패해도 계속 진행 (인증은 선택적)
        print(f"인증 토큰 검증 실패 (계속 진행): {e}")
        pass
    
    try:
        # 사용 횟수 확인 (인증된 사용자인 경우만)
        if user_id:
            is_allowed, error_message = usage_limit_service.check_fingerprint_analysis_limit(user_id)
            if not is_allowed:
                return JSONResponse(
                    status_code=200,
                    content={
                        "success": False,
                        "error": error_message
                    }
                )
        
        # 파일 읽기
        contents = await file.read()
        
        if not contents or len(contents) == 0:
            return JSONResponse(
                status_code=400,
                content={"error": "파일이 비어있습니다"}
            )
        
        file_obj = BytesIO(contents)
        file_obj.name = file.filename or "fingerprint.jpg"
        
        print(f"지문 분석 시작: 파일명={file.filename}, 크기={len(contents)} bytes")
        
        # 지문 분석
        result = fingerprint_service.analyze_thumb_fingerprint(file_obj)
        
        print(f"지문 분석 결과: success={result.get('success')}")
        
        if not result.get("success"):
            error_msg = result.get("error", "지문 분석 실패")
            print(f"지문 분석 실패: {error_msg}")
            return JSONResponse(
                status_code=400,
                content={"error": error_msg}
            )
        
        analysis = result.get("analysis", {})
        if not analysis:
            return JSONResponse(
                status_code=500,
                content={"error": "분석 결과가 비어있습니다"}
            )
        
        print(f"지문 분석 성공: 패턴={analysis.get('pattern_type', '알 수 없음')}")
        
        # 사용 횟수 증가 (인증된 사용자인 경우만)
        if user_id:
            usage_limit_service.increment_fingerprint_analysis_count(user_id)
        
        return {
            "success": True,
            "analysis": analysis
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"지문 분석 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"지문 분석 중 오류가 발생했습니다: {str(e)}"}
        )


@app.get("/uploads/class_images/{filename:path}")
async def get_class_image(filename: str):
    """수업 작품 이미지 서빙"""
    import urllib.parse
    # URL 디코딩 처리
    decoded_filename = urllib.parse.unquote(filename)
    file_path = os.path.join("data/class_images", decoded_filename)
    
    # 파일 존재 확인
    if not os.path.exists(file_path):
        # 파일명이 정확히 일치하지 않으면 부분 매칭 시도
        images_dir = "data/class_images"
        if os.path.exists(images_dir):
            for file in os.listdir(images_dir):
                if decoded_filename in file or file.endswith(decoded_filename):
                    file_path = os.path.join(images_dir, file)
                    break
    
    if os.path.exists(file_path):
        # MIME 타입 자동 감지
        from pathlib import Path
        file_ext = Path(file_path).suffix.lower()
        media_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
        }
        media_type = media_types.get(file_ext, 'image/jpeg')
        return FileResponse(file_path, media_type=media_type)
    
    return JSONResponse(status_code=404, content={"error": f"이미지를 찾을 수 없습니다: {decoded_filename}"})


@app.get("/api/reports/{report_id}/pdf")
async def generate_pdf_report(
    report_id: str,
    authorization: Optional[str] = Header(None)
):
    """미술 심리 전문가 리포트 PDF 생성 (인증 선택적)"""
    print(f"[PDF 다운로드] 요청 받음: report_id={report_id}, authorization 존재={bool(authorization)}")
    
    # 토큰 검증 (선택적) - authorization이 None이거나 빈 문자열이면 인증 없이 진행
    user_info = None
    if authorization and authorization.strip() and authorization.strip().startswith("Bearer "):
        print(f"[PDF 다운로드] 인증 토큰 검증 시도...")
        try:
            # verify_supabase_token을 직접 호출하지 않고, 내부 로직을 사용
            from utils.supabase_auth import supabase
            if supabase:
                token = authorization.replace("Bearer ", "").strip()
                try:
                    user_response = supabase.auth.get_user(token)
                    if user_response.user:
                        profile_response = supabase.table("profiles").select("*").eq("id", user_response.user.id).execute()
                        profile = profile_response.data[0] if profile_response.data else None
                        user_info = {
                            "id": user_response.user.id,
                            "email": user_response.user.email,
                            "role": profile.get("role", "user") if profile else "user",
                            "name": profile.get("name", "") if profile else "",
                        }
                        print(f"[PDF 다운로드] 인증 성공: user_id={user_info.get('id')}")
                    else:
                        print(f"[PDF 다운로드] 유효하지 않은 토큰, 계속 진행")
                except Exception as token_error:
                    print(f"[PDF 다운로드] 토큰 검증 실패 (계속 진행): {token_error}")
            else:
                print(f"[PDF 다운로드] Supabase가 설정되지 않음, 계속 진행")
        except Exception as e:
            print(f"[PDF 다운로드] 인증 처리 중 오류 (계속 진행): {e}")
    else:
        print(f"[PDF 다운로드] 인증 토큰 없음 또는 형식 오류 - 인증 없이 진행")
    
    try:
        from fastapi.responses import Response
        
        # 리포트 로드
        print(f"[PDF 다운로드] 리포트 로드 시작: report_id={report_id}")
        report_data = report_service.load_report(report_id)
        if not report_data:
            print(f"[PDF 다운로드] 리포트를 찾을 수 없음: report_id={report_id}")
            return JSONResponse(
                status_code=404,
                content={"error": "리포트를 찾을 수 없습니다."}
            )
        print(f"[PDF 다운로드] 리포트 로드 완료")
        
        # 사용자 권한 확인 (인증된 경우에만 권한 체크)
        if user_info:
            user_id = user_info.get("id")
            user_role = user_info.get("role", "user")
            report_user_id = report_data.user_id
            
            if user_role not in ["admin", "supervisor"] and user_id != report_user_id:
                return JSONResponse(
                    status_code=403,
                    content={"error": "이 리포트에 접근할 권한이 없습니다."}
                )
        
        # 간단 리포트 생성 (미술 심리 전문가 리포트)
        chat_responses = report_data.image_metadata.get("chat_responses", [])
        
        try:
            simple_report = simple_report_service.generate_simple_report(
                report_data,
                chat_responses
            )
        except Exception as e:
            import traceback
            print(f"간단 리포트 생성 오류: {traceback.format_exc()}")
            raise Exception(f"리포트 생성 실패: {str(e)}")
        
        # PDF 생성 (이미지 포함)
        try:
            # base64 이미지 가져오기
            image_base64 = report_data.image_metadata.get("base64", None)
            
            pdf_content = report_service.generate_pdf_from_markdown(
                simple_report,
                title="그림 관찰 기반 분석 리포트",
                image_base64=image_base64,
                user_info=user_info,
                report_user_id=report_data.user_id
            )
        except Exception as e:
            import traceback
            print(f"PDF 생성 오류: {traceback.format_exc()}")
            raise Exception(f"PDF 생성 실패: {str(e)}")
        
        # 파일명 생성 (한글 파일명 인코딩 처리)
        date_str = report_data.created_at.strftime('%Y%m%d_%H%M%S')
        report_id_short = report_data.id[:8] if report_data.id else "unknown"
        filename_kr = f"그림분석보고서_{date_str}_{report_id_short}.pdf"
        filename_en = f"art_analysis_report_{date_str}_{report_id_short}.pdf"
        
        # RFC 5987 형식으로 한글 파일명 인코딩
        from urllib.parse import quote
        # UTF-8로 인코딩한 후 percent-encoding
        filename_encoded = quote(filename_kr, safe='', encoding='utf-8')
        
        # Content-Disposition 헤더 생성 (한글 파일명 지원)
        # filename* 부분은 이미 percent-encoded 되어 있어 ASCII 문자만 포함
        content_disposition = f'attachment; filename="{filename_en}"; filename*=UTF-8\'\'{filename_encoded}'
        
        # StreamingResponse를 사용하여 헤더 인코딩 문제 회피
        from fastapi.responses import StreamingResponse
        from io import BytesIO
        
        pdf_stream = BytesIO(pdf_content)
        
        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={
                "Content-Disposition": content_disposition
            }
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"PDF 생성 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"PDF 생성 실패: {str(e)}"}
        )


@app.get("/api/reports/{report_id}/admin-pdf")
async def generate_admin_pdf_report(
    report_id: str,
    authorization: Optional[str] = Header(None)
):
    """관리자용 전문 리포트 PDF 생성 (관리자 전용)"""
    # 관리자 인증 확인
    user_info = None
    try:
        user_info = verify_supabase_token(authorization)
        if user_info.get("role") not in ["admin", "supervisor"]:
            return JSONResponse(
                status_code=403,
                content={"error": "관리자 또는 슈퍼바이저 권한이 필요합니다."}
            )
    except HTTPException as e:
        # Supabase 인증 실패 시 기존 방식으로 폴백 (하위 호환성)
        if e.status_code == 503:  # Supabase가 설정되지 않은 경우
            try:
                verify_admin_token(authorization)
                # 기존 방식에서는 user_info를 None으로 유지
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )
        else:
            return JSONResponse(
                status_code=e.status_code,
                content={"error": e.detail}
            )
    except Exception as e:
        # 기타 오류 시 기존 방식으로 폴백
        try:
            verify_admin_token(authorization)
            # 기존 방식에서는 user_info를 None으로 유지
        except:
            return JSONResponse(
                status_code=401,
                content={"error": "인증이 필요합니다."}
            )
    
    try:
        from fastapi.responses import StreamingResponse
        from io import BytesIO
        from services.admin_report_service import AdminReportService
        
        # 리포트 로드
        report_data = report_service.load_report(report_id)
        if not report_data:
            return JSONResponse(
                status_code=404,
                content={"error": "리포트를 찾을 수 없습니다."}
            )
        
        # 관리자용 전문 리포트 마크다운 생성
        admin_report_service = AdminReportService()
        try:
            admin_report_markdown = admin_report_service.generate_admin_report_markdown(report_data)
        except Exception as e:
            import traceback
            print(f"관리자 리포트 생성 오류: {traceback.format_exc()}")
            raise Exception(f"리포트 생성 실패: {str(e)}")
        
        # PDF 생성 (이미지 포함)
        try:
            # base64 이미지 가져오기
            image_base64 = report_data.image_metadata.get("base64", None) if report_data.image_metadata else None
            
            pdf_content = report_service.generate_pdf_from_markdown(
                admin_report_markdown,
                title="전문 리포트",
                image_base64=image_base64,
                user_info=user_info,
                report_user_id=report_data.user_id
            )
        except Exception as e:
            import traceback
            print(f"PDF 생성 오류: {traceback.format_exc()}")
            raise Exception(f"PDF 생성 실패: {str(e)}")
        
        # 파일명 생성 (한글 파일명 인코딩 처리)
        date_str = report_data.created_at.strftime('%Y%m%d_%H%M%S')
        report_id_short = report_data.id[:8] if report_data.id else "unknown"
        filename_kr = f"전문리포트_{date_str}_{report_id_short}.pdf"
        filename_en = f"professional_report_{date_str}_{report_id_short}.pdf"
        
        # RFC 5987 형식으로 한글 파일명 인코딩
        from urllib.parse import quote
        filename_encoded = quote(filename_kr, safe='', encoding='utf-8')
        
        # Content-Disposition 헤더 생성 (한글 파일명 지원)
        content_disposition = f'attachment; filename="{filename_en}"; filename*=UTF-8\'\'{filename_encoded}'
        
        pdf_stream = BytesIO(pdf_content)
        
        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={
                "Content-Disposition": content_disposition
            }
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"관리자 PDF 생성 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"PDF 생성 실패: {str(e)}"}
        )


@app.post("/api/contact")
async def create_contact(
    name: str = Form(...),
    phone: str = Form(...),
    child_age: str = Form(...),
    message: str = Form(...)
):
    """문의 생성 API"""
    try:
        contact_data = ContactInquiry(
            name=name,
            phone=phone,
            child_age=child_age,
            message=message
        )
        
        contact_service.save_contact(contact_data)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "문의가 접수되었습니다.",
                "contact_id": contact_data.id
            }
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"문의 생성 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"문의 접수 실패: {str(e)}"}
        )


@app.get("/api/contacts")
async def get_contacts(
    authorization: Optional[str] = Header(None)
):
    """문의 목록 조회 API (관리자/슈퍼바이저 전용)"""
    # Supabase 인증 확인 (설정된 경우)
    try:
        user_info = verify_supabase_token(authorization)
        if user_info.get("role") not in ["admin", "supervisor"]:
            return JSONResponse(
                status_code=403,
                content={"error": "관리자 또는 슈퍼바이저 권한이 필요합니다."}
            )
    except HTTPException as e:
        # Supabase 인증 실패 시 기존 방식으로 폴백 (하위 호환성)
        if e.status_code == 503:  # Supabase가 설정되지 않은 경우
            try:
                verify_admin_token(authorization)
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )
        else:
            return JSONResponse(
                status_code=e.status_code,
                content={"error": e.detail}
            )
    except Exception as e:
        # 기타 오류 시 기존 방식으로 폴백
        try:
            verify_admin_token(authorization)
        except:
            return JSONResponse(
                status_code=401,
                content={"error": "인증이 필요합니다."}
            )
    try:
        contacts = contact_service.list_contacts()
        
        # Pydantic 모델을 dict로 변환
        contacts_dict = []
        for contact in contacts:
            contact_dict = contact.model_dump()
            contact_dict['created_at'] = contact.created_at.isoformat()
            contacts_dict.append(contact_dict)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "contacts": contacts_dict
            }
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"문의 목록 조회 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"문의 목록 조회 실패: {str(e)}"}
        )


@app.patch("/api/contacts/{contact_id}/status")
async def update_contact_status(
    contact_id: str,
    status: str = Form(...),
    authorization: Optional[str] = Header(None)
):
    """문의 상태 업데이트 API (관리자/슈퍼바이저 전용)"""
    # Supabase 인증 확인 (설정된 경우)
    try:
        user_info = verify_supabase_token(authorization)
        if user_info.get("role") not in ["admin", "supervisor"]:
            return JSONResponse(
                status_code=403,
                content={"error": "관리자 또는 슈퍼바이저 권한이 필요합니다."}
            )
    except HTTPException as e:
        # Supabase 인증 실패 시 기존 방식으로 폴백 (하위 호환성)
        if e.status_code == 503:  # Supabase가 설정되지 않은 경우
            try:
                verify_admin_token(authorization)
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )
        else:
            return JSONResponse(
                status_code=e.status_code,
                content={"error": e.detail}
            )
    except Exception as e:
        # 기타 오류 시 기존 방식으로 폴백
        try:
            verify_admin_token(authorization)
        except:
            return JSONResponse(
                status_code=401,
                content={"error": "인증이 필요합니다."}
            )
    try:
        contact = contact_service.update_contact_status(contact_id, status)
        
        if not contact:
            return JSONResponse(
                status_code=404,
                content={"error": "문의를 찾을 수 없습니다."}
            )
        
        contact_dict = contact.model_dump()
        contact_dict['created_at'] = contact.created_at.isoformat()
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "contact": contact_dict
            }
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"문의 상태 업데이트 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"문의 상태 업데이트 실패: {str(e)}"}
        )


# ====================== PHONE AUTHENTICATION ENDPOINTS ======================

@app.post("/api/auth/phone/request-code")
async def request_phone_verification_code(phone_number: str = Form(...)):
    """
    Request SMS verification code

    Args:
        phone_number: Phone number in format 010-xxxx-xxxx

    Returns:
        Success status and message
    """
    if not phone_auth_service:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": "전화 인증 서비스가 사용할 수 없습니다. NCP SENS 자격 증명이 설정되지 않았습니다."
            }
        )
    
    try:
        result = phone_auth_service.send_verification_code(phone_number)

        if result["success"]:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": result["message"]
                }
            )
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": result["message"]
                }
            )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"인증번호 요청 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"인증번호 요청 실패: {str(e)}"}
        )


@app.post("/api/auth/phone/verify-code")
async def verify_phone_code(
    phone_number: str = Form(...),
    code: str = Form(...)
):
    """
    Verify SMS code and create user session

    Args:
        phone_number: Phone number
        code: 6-digit verification code

    Returns:
        Session token and user information
    """
    try:
        if not phone_auth_service:
            return JSONResponse(
                status_code=503,
                content={
                    "success": False,
                    "error": "전화 인증 서비스가 사용할 수 없습니다. NCP SENS 자격 증명이 설정되지 않았습니다."
                }
            )
        
        # Verify the code
        verify_result = phone_auth_service.verify_code(phone_number, code)

        if not verify_result["success"]:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": verify_result["message"]
                }
            )

        # Find or create user
        if not phone_auth_service:
            return JSONResponse(
                status_code=503,
                content={
                    "success": False,
                    "error": "전화 인증 서비스가 사용할 수 없습니다. NCP SENS 자격 증명이 설정되지 않았습니다."
                }
            )
        
        user_result = phone_auth_service.find_or_create_user(phone_number)

        if not user_result["success"]:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": user_result["message"]
                }
            )

        user = user_result["user"]

        # Create session
        if not phone_auth_service:
            return JSONResponse(
                status_code=503,
                content={
                    "success": False,
                    "error": "전화 인증 서비스가 사용할 수 없습니다. NCP SENS 자격 증명이 설정되지 않았습니다."
                }
            )
        
        session_result = phone_auth_service.create_session(
            user_id=user["id"],
            phone_number=phone_number,
            expiry_hours=24
        )

        if not session_result["success"]:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": session_result["message"]
                }
            )

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "인증되었습니다.",
                "session_token": session_result["session_token"],
                "expires_at": session_result["expires_at"],
                "user": {
                    "id": user["id"],
                    "phone_number": user["phone_number"],
                    "role": user.get("role", "user"),
                    "name": user.get("name", "")
                },
                "is_new_user": user_result["is_new_user"]
            }
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"인증 확인 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"인증 확인 실패: {str(e)}"}
        )


@app.post("/api/auth/phone/logout")
async def phone_logout(
    authorization: Optional[str] = Header(None)
):
    """
    Logout and delete session

    Args:
        authorization: Bearer token with session_token

    Returns:
        Success status
    """
    try:
        if not authorization or not authorization.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"error": "인증 토큰이 필요합니다."}
            )

        session_token = authorization.replace("Bearer ", "").strip()

        if not phone_auth_service:
            return JSONResponse(
                status_code=503,
                content={
                    "success": False,
                    "error": "전화 인증 서비스가 사용할 수 없습니다. NCP SENS 자격 증명이 설정되지 않았습니다."
                }
            )

        result = phone_auth_service.logout(session_token)

        if result["success"]:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": result["message"]
                }
            )
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": result["message"]
                }
            )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"로그아웃 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"로그아웃 실패: {str(e)}"}
        )


@app.get("/api/auth/phone/verify-session")
async def verify_phone_session(
    authorization: Optional[str] = Header(None)
):
    """
    Verify session token and get user info

    Args:
        authorization: Bearer token with session_token

    Returns:
        User information if session is valid
    """
    try:
        if not authorization or not authorization.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"error": "인증 토큰이 필요합니다."}
            )

        session_token = authorization.replace("Bearer ", "").strip()

        if not phone_auth_service:
            return JSONResponse(
                status_code=503,
                content={
                    "success": False,
                    "error": "전화 인증 서비스가 사용할 수 없습니다. NCP SENS 자격 증명이 설정되지 않았습니다."
                }
            )

        result = phone_auth_service.verify_session(session_token)

        if result["success"]:
            user = result["user"]
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "user": {
                        "id": user["id"],
                        "phone_number": user.get("phone_number"),
                        "role": user.get("role", "user"),
                        "name": user.get("name", ""),
                        "email": user.get("email", "")
                    }
                }
            )
        else:
            return JSONResponse(
                status_code=401,
                content={
                    "success": False,
                    "error": result["message"]
                }
            )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"세션 확인 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"세션 확인 실패: {str(e)}"}
        )


@app.post("/api/reservations")
async def create_reservation(
    reservation_date: str = Form(...),
    reservation_time: str = Form(...),
    child_name: str = Form(...),
    child_age: str = Form(...),
    parent_phone: str = Form(...),
    notes: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    """예약 생성 API"""
    try:
        if not reservation_service:
            return JSONResponse(
                status_code=503,
                content={"error": "예약 서비스가 사용할 수 없습니다."}
            )
        
        # 토큰 검증
        user_info = None
        try:
            user_info = verify_supabase_token(authorization)
        except HTTPException as e:
            if e.status_code == 503:
                # Supabase가 설정되지 않은 경우, 기존 방식으로 폴백
                try:
                    verify_admin_token(authorization)
                except:
                    return JSONResponse(
                        status_code=401,
                        content={"error": "인증이 필요합니다."}
                    )
            else:
                return JSONResponse(
                    status_code=e.status_code,
                    content={"error": e.detail}
                )
        except Exception:
            try:
                verify_admin_token(authorization)
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )
        
        # 인증이 없으면 전화번호로 사용자 찾기 또는 생성
        user_id = None
        if not user_info:
            # 전화번호로 기존 사용자 찾기
            try:
                if reservation_service and reservation_service.supabase:
                    # 전화번호로 사용자 찾기
                    user_result = reservation_service.supabase.table("profiles").select("id").eq(
                        "phone_number", parent_phone
                    ).execute()
                    
                    if user_result.data and len(user_result.data) > 0:
                        user_id = user_result.data[0]["id"]
                    else:
                        # 새 사용자 생성 (전화번호 기반)
                        import uuid
                        from datetime import datetime
                        user_id = str(uuid.uuid4())
                        new_user = {
                            "id": user_id,
                            "phone_number": parent_phone,
                            "phone_verified_at": datetime.now().isoformat(),
                            "auth_provider": "phone",
                            "role": "user",
                            "created_at": datetime.now().isoformat(),
                            "updated_at": datetime.now().isoformat()
                        }
                        reservation_service.supabase.table("profiles").insert(new_user).execute()
                        
                        # 사용 횟수 제한 레코드도 생성
                        reservation_service.supabase.table("user_usage_limits").insert({
                            "user_id": user_id,
                            "image_analysis_count": 0,
                            "fingerprint_analysis_count": 0,
                            "image_analysis_paid_count": 0,
                            "created_at": datetime.now().isoformat(),
                            "updated_at": datetime.now().isoformat()
                        }).execute()
                else:
                    return JSONResponse(
                        status_code=503,
                        content={"error": "예약 서비스가 사용할 수 없습니다."}
                    )
            except Exception as e:
                import traceback
                print(f"사용자 생성/조회 오류: {traceback.format_exc()}")
                return JSONResponse(
                    status_code=500,
                    content={"error": f"사용자 처리 실패: {str(e)}"}
                )
        else:
            user_id = user_info.get("id")
        
        if not user_id:
            return JSONResponse(
                status_code=500,
                content={"error": "사용자 ID를 가져올 수 없습니다."}
            )
        
        # 예약 생성
        result = reservation_service.create_reservation(
            user_id=user_id,
            reservation_date=reservation_date,
            reservation_time=reservation_time,
            child_name=child_name,
            child_age=child_age,
            parent_phone=parent_phone,
            notes=notes
        )
        
        if result["success"]:
            reservation = result["reservation"]
            
            # 입금 안내 정보 생성
            deposit_bank_account = os.getenv("DEPOSIT_BANK_ACCOUNT", "123-456-789012")
            deposit_bank_name = os.getenv("DEPOSIT_BANK_NAME", "국민은행")
            deposit_amount = reservation.get("deposit_amount", 10000)
            deposit_deadline = reservation.get("deposit_confirmation_deadline")
            
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "reservation": reservation,
                    "deposit_info": {
                        "bank_name": deposit_bank_name,
                        "account_number": deposit_bank_account,
                        "amount": deposit_amount,
                        "deadline": deposit_deadline
                    }
                }
            )
        else:
            return JSONResponse(
                status_code=500,
                content={"error": "예약 생성에 실패했습니다."}
            )
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"예약 생성 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"예약 생성 실패: {str(e)}"}
        )


@app.get("/api/reservations")
async def get_reservations(
    authorization: Optional[str] = Header(None)
):
    """예약 목록 조회 API"""
    try:
        if not reservation_service:
            return JSONResponse(
                status_code=503,
                content={"error": "예약 서비스가 사용할 수 없습니다."}
            )
        
        # 토큰 검증
        user_info = None
        is_admin = False
        try:
            user_info = verify_supabase_token(authorization)
            if user_info:
                user_role = user_info.get("role", "user")
                is_admin = user_role in ["admin", "supervisor"]
        except HTTPException as e:
            if e.status_code == 503:
                try:
                    verify_admin_token(authorization)
                    is_admin = True
                except:
                    return JSONResponse(
                        status_code=401,
                        content={"error": "인증이 필요합니다."}
                    )
            else:
                return JSONResponse(
                    status_code=e.status_code,
                    content={"error": e.detail}
                )
        except Exception:
            try:
                verify_admin_token(authorization)
                is_admin = True
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )
        
        user_id = user_info.get("id") if user_info else None
        
        # 예약 목록 조회
        reservations = reservation_service.get_reservations(
            user_id=user_id,
            admin=is_admin
        )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "reservations": reservations
            }
        )
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"예약 목록 조회 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"예약 목록 조회 실패: {str(e)}"}
        )


@app.get("/api/reservations/{reservation_id}")
async def get_reservation(
    reservation_id: str,
    authorization: Optional[str] = Header(None)
):
    """예약 상세 조회 API"""
    try:
        if not reservation_service:
            return JSONResponse(
                status_code=503,
                content={"error": "예약 서비스가 사용할 수 없습니다."}
            )
        
        # 토큰 검증
        user_info = None
        is_admin = False
        try:
            user_info = verify_supabase_token(authorization)
            if user_info:
                user_role = user_info.get("role", "user")
                is_admin = user_role in ["admin", "supervisor"]
        except HTTPException as e:
            if e.status_code == 503:
                try:
                    verify_admin_token(authorization)
                    is_admin = True
                except:
                    return JSONResponse(
                        status_code=401,
                        content={"error": "인증이 필요합니다."}
                    )
            else:
                return JSONResponse(
                    status_code=e.status_code,
                    content={"error": e.detail}
                )
        except Exception:
            try:
                verify_admin_token(authorization)
                is_admin = True
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )
        
        user_id = user_info.get("id") if user_info else None
        
        # 예약 조회
        reservation = reservation_service.get_reservation(
            reservation_id=reservation_id,
            user_id=user_id,
            admin=is_admin
        )
        
        if not reservation:
            return JSONResponse(
                status_code=404,
                content={"error": "예약을 찾을 수 없습니다."}
            )
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "reservation": reservation
            }
        )
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"예약 조회 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"예약 조회 실패: {str(e)}"}
        )


@app.patch("/api/reservations/{reservation_id}/confirm-deposit")
async def confirm_deposit(
    reservation_id: str,
    authorization: Optional[str] = Header(None)
):
    """예약금 입금 확인 API (관리자용)"""
    try:
        if not reservation_service:
            return JSONResponse(
                status_code=503,
                content={"error": "예약 서비스가 사용할 수 없습니다."}
            )
        
        # 관리자 권한 확인
        user_info = None
        is_admin = False
        try:
            user_info = verify_supabase_token(authorization)
            if user_info:
                user_role = user_info.get("role", "user")
                is_admin = user_role in ["admin", "supervisor"]
        except HTTPException as e:
            if e.status_code == 503:
                try:
                    verify_admin_token(authorization)
                    is_admin = True
                except:
                    return JSONResponse(
                        status_code=401,
                        content={"error": "인증이 필요합니다."}
                    )
            else:
                return JSONResponse(
                    status_code=e.status_code,
                    content={"error": e.detail}
                )
        except Exception:
            try:
                verify_admin_token(authorization)
                is_admin = True
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )
        
        if not is_admin:
            return JSONResponse(
                status_code=403,
                content={"error": "관리자 권한이 필요합니다."}
            )
        
        admin_user_id = user_info.get("id") if user_info else None
        if not admin_user_id:
            # 기존 방식에서는 임시 ID 사용
            admin_user_id = "admin"
        
        # 입금 확인
        result = reservation_service.confirm_deposit(
            reservation_id=reservation_id,
            admin_user_id=admin_user_id
        )
        
        if result["success"]:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "reservation": result["reservation"],
                    "message": "입금 확인이 완료되었습니다."
                }
            )
        else:
            return JSONResponse(
                status_code=500,
                content={"error": "입금 확인에 실패했습니다."}
            )
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"입금 확인 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"입금 확인 실패: {str(e)}"}
        )


# ==================== Payment API Endpoints ====================

@app.post("/api/payments/create-session")
async def create_payment_session(
    service_id: Optional[str] = Form(None),
    amount: int = Form(...),
    reservation_id: Optional[str] = Form(None),
    payment_type: str = Form("full"),
    authorization: Optional[str] = Header(None)
):
    """결제 세션 생성 API"""
    try:
        if not payment_service:
            return JSONResponse(
                status_code=503,
                content={"error": "결제 서비스가 사용할 수 없습니다."}
            )

        # 사용자 인증
        user_info = None
        try:
            user_info = verify_supabase_token(authorization)
        except HTTPException as e:
            if e.status_code == 503:
                # Supabase가 설정되지 않은 경우 기존 인증 방식 시도
                try:
                    verify_admin_token(authorization)
                    # 관리자 모드에서는 임시 user_id 사용
                    user_info = {"id": "admin"}
                except:
                    return JSONResponse(
                        status_code=401,
                        content={"error": "인증이 필요합니다."}
                    )
            else:
                return JSONResponse(
                    status_code=e.status_code,
                    content={"error": e.detail}
                )
        except Exception:
            try:
                verify_admin_token(authorization)
                user_info = {"id": "admin"}
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )

        if not user_info:
            return JSONResponse(
                status_code=401,
                content={"error": "사용자 인증이 필요합니다."}
            )

        user_id = user_info.get("id")
        if not user_id:
            return JSONResponse(
                status_code=401,
                content={"error": "사용자 ID를 찾을 수 없습니다."}
            )

        # 결제 세션 생성
        result = payment_service.create_payment_session(
            user_id=user_id,
            service_id=service_id,
            amount=amount,
            reservation_id=reservation_id,
            payment_type=payment_type,
        )

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "payment_id": result["payment_id"],
                "session_id": result["session_id"],
                "checkout_url": result["checkout_url"],
            }
        )

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"결제 세션 생성 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"결제 세션 생성 실패: {str(e)}"}
        )


@app.get("/api/payments/verify/{session_id}")
async def verify_payment(
    session_id: str,
    authorization: Optional[str] = Header(None)
):
    """결제 확인 API"""
    try:
        if not payment_service:
            return JSONResponse(
                status_code=503,
                content={"error": "결제 서비스가 사용할 수 없습니다."}
            )

        # 사용자 인증
        user_info = None
        try:
            user_info = verify_supabase_token(authorization)
        except HTTPException as e:
            if e.status_code == 503:
                try:
                    verify_admin_token(authorization)
                    user_info = {"id": "admin"}
                except:
                    return JSONResponse(
                        status_code=401,
                        content={"error": "인증이 필요합니다."}
                    )
            else:
                return JSONResponse(
                    status_code=e.status_code,
                    content={"error": e.detail}
                )
        except Exception:
            try:
                verify_admin_token(authorization)
                user_info = {"id": "admin"}
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )

        user_id = user_info.get("id") if user_info else None

        # 결제 확인
        result = payment_service.verify_and_complete_payment(
            session_id=session_id,
            user_id=user_id
        )

        return JSONResponse(
            status_code=200,
            content=result
        )

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"결제 확인 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"결제 확인 실패: {str(e)}"}
        )


@app.post("/api/payments/webhook")
async def stripe_webhook(request: Request):
    """Stripe 웹훅 엔드포인트"""
    try:
        if not stripe_service:
            return JSONResponse(
                status_code=503,
                content={"error": "Stripe 서비스가 사용할 수 없습니다."}
            )

        # 웹훅 서명 가져오기
        signature = request.headers.get("stripe-signature")
        if not signature:
            return JSONResponse(
                status_code=400,
                content={"error": "Stripe 서명이 없습니다."}
            )

        # 요청 본문 읽기
        payload = await request.body()

        # 웹훅 처리
        result = stripe_service.handle_webhook(payload, signature)

        # 웹훅 이벤트에 따라 결제 상태 업데이트
        if result.get("success") and result.get("event") == "checkout.session.completed":
            session_id = result.get("session_id")
            if session_id:
                try:
                    # 결제 완료 처리
                    payment_service.verify_and_complete_payment(
                        session_id=session_id,
                        user_id=None  # 웹훅에서는 user_id 검증 생략
                    )
                except Exception as e:
                    logger.error(f"웹훅 후 결제 처리 오류: {str(e)}")

        return JSONResponse(
            status_code=200,
            content={"success": True, "received": True}
        )

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"웹훅 처리 오류: {error_trace}")
        return JSONResponse(
            status_code=400,
            content={"error": f"웹훅 처리 실패: {str(e)}"}
        )


@app.get("/api/payments")
async def get_payments(
    authorization: Optional[str] = Header(None)
):
    """결제 목록 조회 API"""
    try:
        if not payment_service:
            return JSONResponse(
                status_code=503,
                content={"error": "결제 서비스가 사용할 수 없습니다."}
            )

        # 사용자 인증 및 권한 확인
        user_info = None
        is_admin = False
        try:
            user_info = verify_supabase_token(authorization)
            if user_info:
                user_role = user_info.get("role", "user")
                is_admin = user_role in ["admin", "supervisor"]
        except HTTPException as e:
            if e.status_code == 503:
                try:
                    verify_admin_token(authorization)
                    is_admin = True
                except:
                    return JSONResponse(
                        status_code=401,
                        content={"error": "인증이 필요합니다."}
                    )
            else:
                return JSONResponse(
                    status_code=e.status_code,
                    content={"error": e.detail}
                )
        except Exception:
            try:
                verify_admin_token(authorization)
                is_admin = True
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )

        user_id = user_info.get("id") if user_info else None

        # 결제 목록 조회
        payments = payment_service.get_payments(
            user_id=user_id,
            admin=is_admin
        )

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "payments": payments
            }
        )

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"결제 목록 조회 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"결제 목록 조회 실패: {str(e)}"}
        )


@app.get("/api/payments/{payment_id}")
async def get_payment(
    payment_id: str,
    authorization: Optional[str] = Header(None)
):
    """결제 상세 조회 API"""
    try:
        if not payment_service:
            return JSONResponse(
                status_code=503,
                content={"error": "결제 서비스가 사용할 수 없습니다."}
            )

        # 사용자 인증
        user_info = None
        try:
            user_info = verify_supabase_token(authorization)
        except HTTPException as e:
            if e.status_code == 503:
                try:
                    verify_admin_token(authorization)
                    user_info = {"id": "admin", "role": "admin"}
                except:
                    return JSONResponse(
                        status_code=401,
                        content={"error": "인증이 필요합니다."}
                    )
            else:
                return JSONResponse(
                    status_code=e.status_code,
                    content={"error": e.detail}
                )
        except Exception:
            try:
                verify_admin_token(authorization)
                user_info = {"id": "admin", "role": "admin"}
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )

        user_id = user_info.get("id") if user_info else None

        # 결제 조회
        payment = payment_service.get_payment(
            payment_id=payment_id,
            user_id=user_id
        )

        if not payment:
            return JSONResponse(
                status_code=404,
                content={"error": "결제를 찾을 수 없습니다."}
            )

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "payment": payment
            }
        )

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"결제 조회 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"결제 조회 실패: {str(e)}"}
        )


@app.post("/api/payments/{payment_id}/refund")
async def refund_payment(
    payment_id: str,
    amount: Optional[int] = Form(None),
    authorization: Optional[str] = Header(None)
):
    """환불 처리 API (관리자용)"""
    try:
        if not payment_service:
            return JSONResponse(
                status_code=503,
                content={"error": "결제 서비스가 사용할 수 없습니다."}
            )

        # 관리자 권한 확인
        user_info = None
        is_admin = False
        try:
            user_info = verify_supabase_token(authorization)
            if user_info:
                user_role = user_info.get("role", "user")
                is_admin = user_role in ["admin", "supervisor"]
        except HTTPException as e:
            if e.status_code == 503:
                try:
                    verify_admin_token(authorization)
                    is_admin = True
                except:
                    return JSONResponse(
                        status_code=401,
                        content={"error": "인증이 필요합니다."}
                    )
            else:
                return JSONResponse(
                    status_code=e.status_code,
                    content={"error": e.detail}
                )
        except Exception:
            try:
                verify_admin_token(authorization)
                is_admin = True
            except:
                return JSONResponse(
                    status_code=401,
                    content={"error": "인증이 필요합니다."}
                )

        if not is_admin:
            return JSONResponse(
                status_code=403,
                content={"error": "관리자 권한이 필요합니다."}
            )

        admin_user_id = user_info.get("id") if user_info else "admin"

        # 환불 처리
        result = payment_service.refund_payment(
            payment_id=payment_id,
            amount=amount,
            admin_user_id=admin_user_id
        )

        return JSONResponse(
            status_code=200,
            content=result
        )

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"환불 처리 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={"error": f"환불 처리 실패: {str(e)}"}
        )


@app.get("/api/gallery/sample-images")
async def get_sample_gallery_images():
    """갤러리 샘플 이미지 가져오기 API (아이들의 그림)"""
    try:
        # 실제 아이들이 그린 그림 작품 이미지 URL들
        # Unsplash에서 찾은 실제 아이들의 그림 이미지 (CC0 라이선스)
        # 상담을 위해 그려진 다양한 주제와 스타일의 아이들의 그림
        # 칠판 분필, 종이 크레용/색연필 등 다양한 매체 사용
        sample_images = [
            {
                "url": "https://images.unsplash.com/photo-1696527018053-3343b9853505?w=800&h=1200&fit=crop&q=80",
                "width": 800,
                "height": 1200,
                "title": "아이의 꽃 그림",
                "description": "크레용으로 그린 아이의 꽃 그림 작품"
            },
            {
                "url": "https://images.unsplash.com/photo-1696527014256-4755b3ac0b4a?w=800&h=1200&fit=crop&q=80",
                "width": 800,
                "height": 1200,
                "title": "칠판에 그린 아이의 그림",
                "description": "분필로 칠판에 그린 태양, 집, 나비가 있는 아이의 그림"
            },
            {
                "url": "https://images.unsplash.com/photo-1633219661729-e61a0c759cd3?w=800&h=1200&fit=crop&q=80",
                "width": 800,
                "height": 1200,
                "title": "아이가 그린 그림",
                "description": "아이가 종이에 그린 창의적인 작품"
            },
            {
                "url": "https://images.unsplash.com/photo-1633219664502-f7c0ad898f29?w=800&h=1200&fit=crop&q=80",
                "width": 800,
                "height": 1200,
                "title": "어린이의 그림",
                "description": "아이의 상상력이 돋보이는 그림 작품"
            },
            {
                "url": "https://images.unsplash.com/photo-1669663723170-bde6e7891176?w=800&h=1200&fit=crop&q=80",
                "width": 800,
                "height": 1200,
                "title": "아이의 미술 작품",
                "description": "흰 종이에 크레용으로 그린 아이의 그림"
            },
            {
                "url": "https://images.unsplash.com/photo-1620248303767-1f62972a0401?w=800&h=1200&fit=crop&q=80",
                "width": 800,
                "height": 1200,
                "title": "아이의 집 그림",
                "description": "갈색과 파란색으로 그린 아이의 집 그림"
            },
            {
                "url": "https://images.unsplash.com/photo-1633219661729-e61a0c759cd3?w=700&h=1000&fit=crop&q=80",
                "width": 700,
                "height": 1000,
                "title": "아이의 동물 그림",
                "description": "색연필로 그린 아이의 동물 그림"
            },
            {
                "url": "https://images.unsplash.com/photo-1633219664502-f7c0ad898f29?w=700&h=1000&fit=crop&q=80",
                "width": 700,
                "height": 1000,
                "title": "아이의 자연 그림",
                "description": "크레용으로 그린 아이의 자연 풍경"
            },
            {
                "url": "https://images.unsplash.com/photo-1696527018053-3343b9853505?w=600&h=900&fit=crop&q=80",
                "width": 600,
                "height": 900,
                "title": "아이의 가족 그림",
                "description": "아이가 그린 가족의 모습"
            },
            {
                "url": "https://images.unsplash.com/photo-1696527014256-4755b3ac0b4a?w=600&h=900&fit=crop&q=80",
                "width": 600,
                "height": 900,
                "title": "아이의 우주 그림",
                "description": "별과 행성이 그려진 아이의 우주 그림"
            },
            {
                "url": "https://images.unsplash.com/photo-1669663723170-bde6e7891176?w=750&h=1100&fit=crop&q=80",
                "width": 750,
                "height": 1100,
                "title": "아이의 자동차 그림",
                "description": "다양한 색상으로 그린 아이의 자동차 그림"
            },
            {
                "url": "https://images.unsplash.com/photo-1620248303767-1f62972a0401?w=750&h=1100&fit=crop&q=80",
                "width": 750,
                "height": 1100,
                "title": "아이의 인물 그림",
                "description": "크레용으로 그린 아이의 인물화"
            },
            {
                "url": "https://images.unsplash.com/photo-1696527018053-3343b9853505?w=650&h=950&fit=crop&q=80",
                "width": 650,
                "height": 950,
                "title": "칠판에 그린 아이의 그림",
                "description": "분필로 칠판에 그린 밝고 생동감 있는 아이의 그림"
            },
            {
                "url": "https://images.unsplash.com/photo-1633219661729-e61a0c759cd3?w=680&h=1020&fit=crop&q=80",
                "width": 680,
                "height": 1020,
                "title": "아이의 감정 표현 그림",
                "description": "상담을 위해 그린 아이의 감정 표현 작품"
            },
            {
                "url": "https://images.unsplash.com/photo-1633219664502-f7c0ad898f29?w=720&h=1080&fit=crop&q=80",
                "width": 720,
                "height": 1080,
                "title": "아이의 꿈 그림",
                "description": "아이의 꿈과 희망을 표현한 그림"
            }
        ]
        
        # 랜덤하게 섞어서 반환 (매번 다른 이미지 순서)
        random.shuffle(sample_images)
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "images": sample_images[:12]  # 최대 12개 반환
            }
        )
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"샘플 이미지 가져오기 오류: {error_trace}")
        print(f"샘플 이미지 가져오기 오류: {error_trace}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"샘플 이미지를 가져올 수 없습니다: {str(e)}",
                "images": []
            }
        )


if __name__ == "__main__":
    import uvicorn
    import uuid
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
