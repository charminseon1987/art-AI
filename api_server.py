"""FastAPI 서버 - Next.js 프론트엔드와 연동"""
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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
from langchain_openai import ChatOpenAI
from utils.setup import setup_directories

# 디렉토리 설정
setup_directories()

# FastAPI 앱 생성
app = FastAPI(title="AI 그림 상담 API", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
    emotion: Optional[str] = Form(None)
):
    """이미지 분석 API"""
    try:
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
        
        # 메타데이터 저장
        report_data.image_metadata = image_result["metadata"]
        
        # 리포트 저장
        report_service.save_report(report_data)
        
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
    chat_responses: str = Form(...)  # JSON string
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
        
        # Chat 기반 리포트 생성
        if not report_generator_service:
            return JSONResponse(
                status_code=500,
                content={"error": "리포트 생성 서비스가 초기화되지 않았습니다."}
            )
        
        report_content = report_generator_service.generate_chat_based_report(
            report_data,
            chat_responses_list
        )
        
        # 간단 리포트 생성 (사용자용)
        simple_report = simple_report_service.generate_simple_report(
            report_data,
            chat_responses_list
        )
        
        # 전문 리포트 생성 (관리자용)
        professional_report = None
        if report_generator_service:
            try:
                professional_report = report_generator_service.generate_chat_based_report(
                    report_data,
                    chat_responses_list
                )
            except Exception as e:
                print(f"전문 리포트 생성 실패: {e}")
        
        # 리포트 저장 (chat_responses 포함)
        report_data.image_metadata = report_data.image_metadata or {}
        report_data.image_metadata["chat_responses"] = chat_responses_list
        report_data.image_metadata["simple_report"] = simple_report
        report_data.image_metadata["chat_based_report"] = report_content
        report_data.image_metadata["professional_report"] = professional_report
        
        report_service.save_report(report_data)
        
        return {
            "success": True,
            "report_id": report_data.id,
            "simple_report": simple_report,  # 사용자용 간단 리포트
            "report_content": report_content,  # Chat 기반 리포트
            "professional_report": professional_report,  # 전문 리포트 (관리자용)
            "formatted_report": report_generator_service.format_report_for_display(report_content) if report_generator_service else simple_report
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.get("/api/reports")
async def get_reports():
    """리포트 목록 조회"""
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


@app.get("/api/reports/{report_id}")
async def get_report(report_id: str):
    """특정 리포트 조회"""
    try:
        report = report_service.load_report(report_id)
        if not report:
            return JSONResponse(
                status_code=404,
                content={"error": "리포트를 찾을 수 없습니다."}
            )
        
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


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
