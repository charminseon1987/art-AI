"""관리자 인증 유틸리티"""
from fastapi import HTTPException, Header, status
from typing import Optional
import os
import hashlib
import hmac
import time

# 관리자 비밀번호 (환경 변수에서 가져오거나 기본값 사용)
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# 간단한 토큰 검증을 위한 시크릿 키
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "admin_secret_key_change_in_production")


def verify_admin_token(authorization: Optional[str] = Header(None)) -> bool:
    """
    관리자 토큰 검증
    
    Args:
        authorization: Authorization 헤더 값 (Bearer token 형식)
    
    Returns:
        bool: 인증 성공 여부
    
    Raises:
        HTTPException: 인증 실패 시
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증 토큰이 필요합니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Bearer 토큰 형식 확인
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="잘못된 인증 형식입니다. Bearer 토큰을 사용하세요.",
        )
    
    token = authorization.replace("Bearer ", "").strip()
    
    # 토큰 검증 (간단한 검증 - 실제 운영 시 JWT 등 사용 권장)
    # 여기서는 토큰이 admin_으로 시작하는지만 확인
    if not token.startswith("admin_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 토큰입니다.",
        )
    
    # 토큰이 너무 오래되었는지 확인 (24시간)
    try:
        timestamp = int(token.split("_")[1]) if len(token.split("_")) > 1 else 0
        current_time = int(time.time() * 1000)  # 밀리초
        if current_time - timestamp > 24 * 60 * 60 * 1000:  # 24시간
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="토큰이 만료되었습니다. 다시 로그인해주세요.",
            )
    except (ValueError, IndexError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 토큰 형식입니다.",
        )
    
    return True


def verify_admin_password(password: str) -> bool:
    """
    관리자 비밀번호 검증
    
    Args:
        password: 입력된 비밀번호
    
    Returns:
        bool: 비밀번호 일치 여부
    """
    return password == ADMIN_PASSWORD


def generate_admin_token() -> str:
    """
    관리자 토큰 생성
    
    Returns:
        str: 생성된 토큰
    """
    timestamp = int(time.time() * 1000)
    random_str = os.urandom(16).hex()
    token = f"admin_{timestamp}_{random_str}"
    return token

