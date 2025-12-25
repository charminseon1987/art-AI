"""사용 횟수 제한 관리 서비스"""
from typing import Optional, Dict, Any
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase 클라이언트 초기화
supabase_url = os.getenv("SUPABASE_URL", "")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# 환경 변수가 없을 때는 None으로 설정 (선택적 사용)
_supabase_client: Optional[Client] = None

if supabase_url and supabase_key:
    try:
        _supabase_client = create_client(supabase_url, supabase_key)
    except Exception as e:
        print(f"UsageLimitService: Supabase 클라이언트 초기화 실패: {e}")


class UsageLimitService:
    """사용자별 분석 횟수 제한 관리 서비스"""
    
    MAX_IMAGE_ANALYSIS = 2
    MAX_FINGERPRINT_ANALYSIS = 2
    
    def __init__(self):
        self.supabase = _supabase_client
    
    def get_or_create_usage_limit(self, user_id: str, kakao_id: Optional[str] = None) -> Dict[str, Any]:
        """사용자별 사용 횟수 레코드 가져오기 또는 생성"""
        if not self.supabase:
            raise Exception("Supabase가 설정되지 않았습니다.")
        
        # 기존 레코드 조회
        response = self.supabase.table("user_usage_limits").select("*").eq("user_id", user_id).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        
        # 레코드가 없으면 생성
        new_record = {
            "user_id": user_id,
            "image_analysis_count": 0,
            "fingerprint_analysis_count": 0,
        }
        
        if kakao_id:
            new_record["kakao_id"] = kakao_id
        
        insert_response = self.supabase.table("user_usage_limits").insert(new_record).execute()
        
        if insert_response.data and len(insert_response.data) > 0:
            return insert_response.data[0]
        
        raise Exception("사용 횟수 레코드 생성에 실패했습니다.")
    
    def check_image_analysis_limit(self, user_id: str) -> tuple[bool, str]:
        """
        그림 분석 가능 여부 확인
        
        Returns:
            (is_allowed, message): 분석 가능 여부와 메시지
        """
        try:
            usage_limit = self.get_or_create_usage_limit(user_id)
            count = usage_limit.get("image_analysis_count", 0)
            
            if count >= self.MAX_IMAGE_ANALYSIS:
                return False, "분석회수를 초과했습니다. 더 자세한 상담은 선생님과의 상담예약이 필요합니다."
            
            return True, ""
        except Exception as e:
            # 오류 발생 시 기본적으로 허용 (서비스 안정성 우선)
            print(f"사용 횟수 확인 오류: {e}")
            return True, ""
    
    def check_fingerprint_analysis_limit(self, user_id: str) -> tuple[bool, str]:
        """
        지문 분석 가능 여부 확인
        
        Returns:
            (is_allowed, message): 분석 가능 여부와 메시지
        """
        try:
            usage_limit = self.get_or_create_usage_limit(user_id)
            count = usage_limit.get("fingerprint_analysis_count", 0)
            
            if count >= self.MAX_FINGERPRINT_ANALYSIS:
                return False, "분석회수를 초과했습니다. 더 자세한 상담은 선생님과의 상담예약이 필요합니다."
            
            return True, ""
        except Exception as e:
            # 오류 발생 시 기본적으로 허용 (서비스 안정성 우선)
            print(f"사용 횟수 확인 오류: {e}")
            return True, ""
    
    def increment_image_analysis_count(self, user_id: str) -> bool:
        """그림 분석 횟수 증가"""
        try:
            usage_limit = self.get_or_create_usage_limit(user_id)
            current_count = usage_limit.get("image_analysis_count", 0)
            
            response = self.supabase.table("user_usage_limits").update({
                "image_analysis_count": current_count + 1
            }).eq("user_id", user_id).execute()
            
            return response.data is not None
        except Exception as e:
            print(f"그림 분석 횟수 증가 오류: {e}")
            return False
    
    def increment_fingerprint_analysis_count(self, user_id: str) -> bool:
        """지문 분석 횟수 증가"""
        try:
            usage_limit = self.get_or_create_usage_limit(user_id)
            current_count = usage_limit.get("fingerprint_analysis_count", 0)
            
            response = self.supabase.table("user_usage_limits").update({
                "fingerprint_analysis_count": current_count + 1
            }).eq("user_id", user_id).execute()
            
            return response.data is not None
        except Exception as e:
            print(f"지문 분석 횟수 증가 오류: {e}")
            return False
    
    def get_usage_limits(self, user_id: str) -> Dict[str, Any]:
        """사용자별 사용 횟수 조회"""
        try:
            usage_limit = self.get_or_create_usage_limit(user_id)
            return {
                "image_analysis_count": usage_limit.get("image_analysis_count", 0),
                "fingerprint_analysis_count": usage_limit.get("fingerprint_analysis_count", 0),
                "image_analysis_remaining": max(0, self.MAX_IMAGE_ANALYSIS - usage_limit.get("image_analysis_count", 0)),
                "fingerprint_analysis_remaining": max(0, self.MAX_FINGERPRINT_ANALYSIS - usage_limit.get("fingerprint_analysis_count", 0)),
            }
        except Exception as e:
            print(f"사용 횟수 조회 오류: {e}")
            return {
                "image_analysis_count": 0,
                "fingerprint_analysis_count": 0,
                "image_analysis_remaining": self.MAX_IMAGE_ANALYSIS,
                "fingerprint_analysis_remaining": self.MAX_FINGERPRINT_ANALYSIS,
            }

