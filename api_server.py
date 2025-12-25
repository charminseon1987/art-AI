"""FastAPI 서버 - Next.js 프론트엔드와 연동"""
from fastapi import FastAPI, File, UploadFile, Form, Header, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from typing import Optional, List, Dict
import os
import sys
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
from models.class_work import ClassWork
from models.contact import ContactInquiry
from langchain_openai import ChatOpenAI
from utils.setup import setup_directories
from utils.auth import verify_admin_token
from utils.supabase_auth import verify_supabase_token, require_admin_or_supervisor

# 디렉토리 설정
setup_directories()

# FastAPI 앱 생성
app = FastAPI(title="AI 그림 상담 API", version="1.0.0")

# CORS 설정
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# 프로덕션 프론트엔드 URL 추가 (환경 변수에서 읽기)
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

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

# ReportGeneratorService 초기화 (에러 발생 시에도 서버가 시작되도록)
try:
    report_generator_service = ReportGeneratorService(llm)
except Exception as e:
    print(f"Warning: ReportGeneratorService 초기화 실패: {e}")
    report_generator_service = None


@app.get("/")
async def root():
    return {"message": "AI 그림 상담 API 서버", "status": "running"}


@app.post("/api/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    emotion: Optional[str] = Form(None),
    authorization: Optional[str] = Header(None)
):
    """이미지 분석 API (인증 필요)"""
    # 토큰 검증
    try:
        user_info = verify_supabase_token(authorization)
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
        # 사용 횟수 확인 (인증된 사용자인 경우만)
        user_id = None
        kakao_id = None
        try:
            user_info = verify_supabase_token(authorization)
            user_id = user_info.get("id")
            
            # 카카오 사용자 ID 가져오기 (user_usage_limits 테이블에서)
            if user_id and usage_limit_service.supabase:
                try:
                    usage_response = usage_limit_service.supabase.table("user_usage_limits").select("kakao_id").eq("user_id", user_id).execute()
                    if usage_response.data and len(usage_response.data) > 0:
                        kakao_id = usage_response.data[0].get("kakao_id")
                except:
                    pass  # 카카오 ID 조회 실패해도 계속 진행
        except:
            pass  # 인증 실패 시 user_id는 None으로 유지
        
        if user_id:
            # 카카오 ID로 사용 횟수 확인 (카카오 ID가 있으면 우선 사용)
            if kakao_id:
                # 카카오 ID로 레코드 찾기
                try:
                    kakao_response = usage_limit_service.supabase.table("user_usage_limits").select("*").eq("kakao_id", kakao_id).execute()
                    if kakao_response.data and len(kakao_response.data) > 0:
                        kakao_limit = kakao_response.data[0]
                        count = kakao_limit.get("image_analysis_count", 0)
                        if count >= usage_limit_service.MAX_IMAGE_ANALYSIS:
                            return JSONResponse(
                                status_code=200,
                                content={
                                    "success": False,
                                    "error": "분석회수를 초과했습니다. 더 자세한 상담은 선생님과의 상담예약이 필요합니다."
                                }
                            )
                except:
                    pass  # 카카오 ID 조회 실패 시 user_id로 확인
            
            # user_id로 사용 횟수 확인
            is_allowed, error_message = usage_limit_service.check_image_analysis_limit(user_id)
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
        file_obj = BytesIO(contents)
        file_obj.name = file.filename
        
        # 이미지 처리
        image_result = image_service.process_uploaded_image(file_obj)
        
        if not image_result.get("success"):
            return JSONResponse(
                status_code=400,
                content={"error": image_result.get("error", "이미지 처리 실패")}
            )
        
        # AI 분석
        report_data = ai_service.analyze_image(
            image_result["description"],
            emotion
        )
        
        # 메타데이터 저장 (base64 이미지 포함)
        report_data.image_metadata = image_result["metadata"]
        report_data.image_metadata["base64"] = image_result.get("base64", "")
        
        # 리포트 저장
        report_service.save_report(report_data)
        
        # 사용 횟수 증가 (인증된 사용자인 경우만)
        if user_id:
            usage_limit_service.increment_image_analysis_count(user_id)
        
        # 응답 데이터 구성
        return {
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
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
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
        
        return {
            "success": True,
            "report_id": report_data.id,
            "simple_report": simple_report,
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
        return {
            "success": True,
            "reports": [
                {
                    "id": r.id,
                    "created_at": r.created_at.isoformat(),
                    "user_emotion": r.user_emotion,
                }
                for r in reports
            ]
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.post("/api/reports/{report_id}/counselor-answers")
async def save_counselor_answers(
    report_id: str,
    answers: dict,
    authorization: Optional[str] = Header(None)
):
    """상담사 답변 저장 및 종합 분석 생성 (관리자 전용)"""
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
        
        # 상담사 답변 저장
        counselor_answers = answers.get("answers", {})
        report_data.image_metadata = report_data.image_metadata or {}
        report_data.image_metadata["counselor_answers"] = counselor_answers
        
        # 상담사 답변이 있으면 AI 종합 분석 생성
        if counselor_answers:
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
                
                # 상담사 답변을 바탕으로 종합 분석 생성
                # 상담사 답변을 chat_responses 형식으로 변환
                counselor_responses = []
                if report_data.reflection_questions and report_data.reflection_questions.questions:
                    for idx, question in enumerate(report_data.reflection_questions.questions):
                        if idx in counselor_answers and counselor_answers[idx]:
                            counselor_responses.append({
                                "question": question,
                                "answer": counselor_answers[idx]
                            })
                
                # 종합 분석 생성
                conclusion_task = conclusion_agent.create_conclusion_task(
                    report_data.observation,
                    report_data.emotional_language,
                    report_data.reflection_questions,
                    report_data.user_emotion,
                    chat_responses=counselor_responses if counselor_responses else None
                )
                
                from crewai import Crew, Process
                conclusion_crew = Crew(
                    agents=[conclusion_agent.agent],
                    tasks=[conclusion_task],
                    process=Process.sequential,
                    verbose=True
                )
                conclusion_result = conclusion_crew.kickoff()
                
                # 상담사 답변 기반 종합 분석 저장
                report_data.image_metadata["counselor_based_analysis"] = str(conclusion_result)
                
            except Exception as e:
                import traceback
                print(f"상담사 답변 기반 종합 분석 생성 오류: {traceback.format_exc()}")
                # 오류 발생 시에도 답변은 저장
        
        # 리포트 저장
        report_service.save_report(report_data)
        
        return {
            "success": True,
            "message": "상담사 답변이 저장되었습니다."
        }
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"상담사 답변 저장 오류: {error_trace}")
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


@app.post("/api/reports/{report_id}/counseling")
async def conduct_counseling(report_id: str, responses: List[Dict]):
    """상담 세션 진행"""
    try:
        from services.counseling_service import CounselingService
        from services.scraping_service import ArtTherapyScrapingService
        
        report = report_service.load_report(report_id)
        if not report:
            return JSONResponse(
                status_code=404,
                content={"error": "리포트를 찾을 수 없습니다."}
            )
        
        scraping_service = ArtTherapyScrapingService()
        counseling_service = CounselingService(llm, scraping_service)
        
        # 상담 세션 진행
        evaluation = counseling_service.conduct_counseling_session(
            report,
            responses
        )
        
        # 전문 상담 보고서 생성
        professional_report = counseling_service.generate_professional_report(
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
    """지문상담 관련 데이터 반환"""
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
    """엄지 지문 분석 API (인증 필요)"""
    # 토큰 검증
    try:
        user_info = verify_supabase_token(authorization)
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
        # 사용 횟수 확인 (인증된 사용자인 경우만)
        user_id = None
        kakao_id = None
        try:
            user_info = verify_supabase_token(authorization)
            user_id = user_info.get("id")
            
            # 카카오 사용자 ID 가져오기 (user_usage_limits 테이블에서)
            if user_id and usage_limit_service.supabase:
                try:
                    usage_response = usage_limit_service.supabase.table("user_usage_limits").select("kakao_id").eq("user_id", user_id).execute()
                    if usage_response.data and len(usage_response.data) > 0:
                        kakao_id = usage_response.data[0].get("kakao_id")
                except:
                    pass  # 카카오 ID 조회 실패해도 계속 진행
        except:
            pass  # 인증 실패 시 user_id는 None으로 유지
        
        if user_id:
            # 카카오 ID로 사용 횟수 확인 (카카오 ID가 있으면 우선 사용)
            if kakao_id:
                # 카카오 ID로 레코드 찾기
                try:
                    kakao_response = usage_limit_service.supabase.table("user_usage_limits").select("*").eq("kakao_id", kakao_id).execute()
                    if kakao_response.data and len(kakao_response.data) > 0:
                        kakao_limit = kakao_response.data[0]
                        count = kakao_limit.get("fingerprint_analysis_count", 0)
                        if count >= usage_limit_service.MAX_FINGERPRINT_ANALYSIS:
                            return JSONResponse(
                                status_code=200,
                                content={
                                    "success": False,
                                    "error": "분석회수를 초과했습니다. 더 자세한 상담은 선생님과의 상담예약이 필요합니다."
                                }
                            )
                except:
                    pass  # 카카오 ID 조회 실패 시 user_id로 확인
            
            # user_id로 사용 횟수 확인
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
    """미술 심리 전문가 리포트 PDF 생성 (인증 필요)"""
    # 토큰 검증
    user_info = None
    try:
        user_info = verify_supabase_token(authorization)
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
        from fastapi.responses import Response
        
        # 리포트 로드
        report_data = report_service.load_report(report_id)
        if not report_data:
            return JSONResponse(
                status_code=404,
                content={"error": "리포트를 찾을 수 없습니다."}
            )
        
        # 사용자 권한 확인 (리포트 소유자 또는 관리자/슈퍼바이저만 접근 가능)
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
                title="그림 관찰 기반 상담 참고 리포트",
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
        filename_kr = f"그림상담보고서_{date_str}_{report_id_short}.pdf"
        filename_en = f"art_counseling_report_{date_str}_{report_id_short}.pdf"
        
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


if __name__ == "__main__":
    import uvicorn
    import uuid
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
