"""FastAPI 서버 - Next.js 프론트엔드와 연동"""
from fastapi import FastAPI, File, UploadFile, Form
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
from models.class_work import ClassWork
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
class_work_service = ClassWorkService()

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
        
        # 전문 리포트 생성 (관리자용) - 20년 경력 전문가 리포트
        professional_report = None
        if report_generator_service:
            try:
                professional_report = report_generator_service.generate_chat_based_report(
                    report_data,
                    chat_responses_list
                )
            except Exception as e:
                print(f"전문 리포트 생성 실패: {e}")
                # 에러 발생 시 기본 전문 리포트 생성
                professional_report = f"""# 그림 기반 상담 참고 리포트 (20년 경력 미술 심리 전문가 작성)

## 1. 그림 관찰 요약
{', '.join(report_data.observation.colors[:5]) if report_data.observation.colors else '관찰된 색상이 있습니다.'}

## 2. 표현 방식 정리
{report_data.emotional_language.emotional_tone or '표현 방식이 관찰되었습니다.'}

## 3. 아이의 말 정리
{chr(10).join(f"- {r['answer']}" for r in chat_responses_list)}

## 4. 전문가 분석
{report_data.professional_conclusion.professional_assessment or '전문가 분석이 포함되었습니다.'}

## 5. 안내 문구
본 리포트는 그림의 시각적 요소와 아이의 이야기를 정리한 참고 자료이며, 심리 진단이나 치료를 목적으로 하지 않습니다."""
        
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


@app.post("/api/class-works")
async def create_class_work(
    thumbnail: UploadFile = File(...),
    age_range: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(default=None)
):
    """수업 작품 생성 (관리자용)"""
    try:
        import uuid
        import traceback
        
        # 이미지 저장 디렉토리
        images_dir = "data/class_images"
        os.makedirs(images_dir, exist_ok=True)
        
        # 섬네일 저장
        thumbnail_filename = f"thumb_{uuid.uuid4()}_{thumbnail.filename or 'image'}"
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
                    img_filename = f"{uuid.uuid4()}_{img.filename}"
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
            description=description
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
    """수업 작품 목록 조회"""
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
                "created_at": work.created_at.isoformat(),
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )


@app.delete("/api/class-works/{work_id}")
async def delete_class_work(work_id: str):
    """수업 작품 삭제 (관리자용)"""
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

@app.get("/uploads/class_images/{filename}")
async def get_class_image(filename: str):
    """수업 작품 이미지 서빙"""
    file_path = os.path.join("data/class_images", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"error": "이미지를 찾을 수 없습니다."})


if __name__ == "__main__":
    import uvicorn
    import uuid
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
