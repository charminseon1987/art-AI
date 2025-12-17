"""Supabase 인증 유틸리티"""
from fastapi import HTTPException, Header, status
from typing import Optional
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase 클라이언트 초기화
supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# 환경 변수가 없을 때는 None으로 설정 (선택적 사용)
supabase: Optional[Client] = None

if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
    except Exception as e:
        print(f"Supabase 클라이언트 초기화 실패: {e}")
        print("Supabase 인증 기능이 비활성화됩니다.")
else:
    print("⚠️  SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.")
    print("Supabase 인증 기능이 비활성화됩니다. 기존 인증 방식을 사용합니다.")


def verify_supabase_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    Supabase 토큰 검증 및 사용자 정보 반환
    
    Args:
        authorization: Authorization 헤더 값 (Bearer token 형식)
    
    Returns:
        dict: 사용자 정보 (id, email, role 등)
    
    Raises:
        HTTPException: 인증 실패 시
    """
    # Supabase가 설정되지 않은 경우 예외 발생
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase가 설정되지 않았습니다.",
        )
    
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
    
    try:
        # Supabase에서 사용자 정보 가져오기
        user_response = supabase.auth.get_user(token)
        
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="유효하지 않은 토큰입니다.",
            )
        
        user = user_response.user
        
        # 프로필 정보 가져오기
        profile_response = supabase.table("profiles").select("*").eq("id", user.id).execute()
        
        profile = None
        if profile_response.data:
            profile = profile_response.data[0] if len(profile_response.data) > 0 else None
        
        return {
            "id": user.id,
            "email": user.email,
            "role": profile.get("role", "user") if profile else "user",
            "name": profile.get("name", "") if profile else "",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"토큰 검증 실패: {str(e)}",
        )


def require_role(allowed_roles: list[str]):
    """
    역할 기반 접근 제어 데코레이터
    
    Args:
        allowed_roles: 허용된 역할 리스트 (예: ["admin", "supervisor"])
    
    Returns:
        함수: 데코레이터 함수
    """
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # authorization 헤더에서 사용자 정보 가져오기
            authorization = kwargs.get("authorization") or args[0] if args else None
            
            if not authorization:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="인증이 필요합니다.",
                )
            
            user_info = verify_supabase_token(authorization)
            user_role = user_info.get("role", "user")
            
            if user_role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"이 작업을 수행할 권한이 없습니다. 필요한 역할: {', '.join(allowed_roles)}",
                )
            
            # 사용자 정보를 kwargs에 추가
            kwargs["user"] = user_info
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


def require_admin(func):
    """관리자만 접근 가능한 데코레이터"""
    return require_role(["admin"])(func)


def require_admin_or_supervisor(func):
    """관리자 또는 슈퍼바이저만 접근 가능한 데코레이터"""
    return require_role(["admin", "supervisor"])(func)
