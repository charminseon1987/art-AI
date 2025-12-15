"""문의 데이터 모델"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ContactInquiry(BaseModel):
    """문의 데이터"""
    id: str = Field(default="", description="문의 ID")
    name: str = Field(default="", description="이름")
    phone: str = Field(default="", description="연락처")
    child_age: str = Field(default="", description="아이 연령")
    message: str = Field(default="", description="문의 내용")
    created_at: datetime = Field(default_factory=datetime.now, description="생성일시")
    status: str = Field(default="pending", description="처리 상태 (pending, consultation_scheduled, consultation_completed, class_scheduled, completed)")
