"""수업 작품 모델"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class ClassWork(BaseModel):
    """수업 작품 모델"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    thumbnail_url: str  # 섬네일 이미지 URL
    age_range: str  # 나이 (예: "5-7세", "초등 1-2학년")
    title: str  # 작품 제목
    images: List[str] = []  # 상세 페이지 이미지 URL 리스트
    description: Optional[str] = None  # 설명
    category: int = Field(default=0, description="카테고리: 0=유아, 1=초등, 2=중등, 3=애니")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

