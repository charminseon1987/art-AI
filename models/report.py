"""리포트 데이터 모델"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ImageObservation(BaseModel):
    """이미지 관찰 결과"""
    colors: List[str] = Field(default_factory=list, description="주요 색상")
    shapes: List[str] = Field(default_factory=list, description="주요 형태")
    composition: str = Field(default="", description="구성/배치")
    details: List[str] = Field(default_factory=list, description="세부 관찰 사항")
    overall_impression: str = Field(default="", description="전체적인 인상")


class EmotionalLanguage(BaseModel):
    """감정 언어 분석"""
    dominant_emotions: List[str] = Field(default_factory=list, description="주요 감정")
    emotional_tone: str = Field(default="", description="감정적 톤")
    symbolic_elements: List[str] = Field(default_factory=list, description="상징적 요소")
    intensity_level: str = Field(default="", description="강도 수준")


class ReflectionQuestion(BaseModel):
    """반성 질문"""
    questions: List[str] = Field(default_factory=list, description="생성된 질문들")
    categories: List[str] = Field(default_factory=list, description="질문 카테고리")
    purpose: str = Field(default="", description="질문의 목적")


class ProfessionalConclusion(BaseModel):
    """전문가 결론 및 종합 평가"""
    executive_summary: str = Field(default="", description="요약 및 핵심 인사이트")
    key_findings: List[str] = Field(default_factory=list, description="주요 발견 사항")
    counseling_direction: str = Field(default="", description="상담 방향성 제시")
    focus_areas: List[str] = Field(default_factory=list, description="집중 탐색 영역")
    professional_assessment: str = Field(default="", description="전문가 종합 평가")
    recommendations: List[str] = Field(default_factory=list, description="권장 사항")


class ReportData(BaseModel):
    """리포트 데이터"""
    id: str = Field(default="", description="리포트 ID")
    user_id: Optional[str] = Field(default=None, description="사용자 ID")
    image_metadata: Dict[str, Any] = Field(default_factory=dict, description="이미지 메타데이터")
    observation: ImageObservation = Field(default_factory=ImageObservation)
    emotional_language: EmotionalLanguage = Field(default_factory=EmotionalLanguage)
    reflection_questions: ReflectionQuestion = Field(default_factory=ReflectionQuestion)
    professional_conclusion: ProfessionalConclusion = Field(default_factory=ProfessionalConclusion, description="전문가 결론 및 종합 평가")
    user_emotion: Optional[str] = Field(default=None, description="사용자가 선택한 감정")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    counselor_comments: Optional[str] = Field(default=None, description="상담사 코멘트")
    counselor_modified: bool = Field(default=False, description="상담사 수정 여부")

