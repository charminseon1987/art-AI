"""예약 관리 서비스"""
import os
import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Any
from supabase import Client

from utils.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)


class ReservationService:
    """예약 생성, 조회, 입금 확인 서비스"""
    
    def __init__(self):
        try:
            self.supabase: Client = get_supabase_client()
        except Exception as e:
            logger.error(f"ReservationService 초기화 실패: {e}")
            self.supabase = None
    
    def create_reservation(
        self,
        user_id: str,
        reservation_date: str,
        reservation_time: str,
        child_name: str,
        child_age: str,
        parent_phone: str,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        예약 생성
        
        Args:
            user_id: 사용자 ID
            reservation_date: 예약 날짜 (YYYY-MM-DD)
            reservation_time: 예약 시간 (HH:MM:SS)
            child_name: 아이 이름
            child_age: 아이 연령
            parent_phone: 부모 전화번호
            notes: 메모
            
        Returns:
            생성된 예약 정보
        """
        if not self.supabase:
            raise Exception("Supabase가 설정되지 않았습니다.")
        
        try:
            # 예약금 및 입금 기한 설정
            deposit_amount = int(os.getenv("DEPOSIT_AMOUNT", "10000"))
            deposit_confirmation_deadline = (datetime.now() + timedelta(hours=5)).isoformat()
            
            # 예약 데이터 생성
            reservation_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "reservation_date": reservation_date,
                "reservation_time": reservation_time,
                "duration_minutes": 60,
                "status": "pending_deposit",
                "deposit_amount": deposit_amount,
                "deposit_confirmation_deadline": deposit_confirmation_deadline,
                "balance_amount": 40000,
                "child_name": child_name,
                "child_age": child_age,
                "parent_phone": parent_phone,
                "notes": notes,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }
            
            # 예약 생성
            result = self.supabase.table("reservations").insert(reservation_data).execute()
            
            if result.data and len(result.data) > 0:
                logger.info(f"예약 생성 성공: {result.data[0]['id']}")
                return {
                    "success": True,
                    "reservation": result.data[0]
                }
            else:
                raise Exception("예약 생성에 실패했습니다.")
                
        except Exception as e:
            logger.error(f"예약 생성 오류: {str(e)}")
            raise Exception(f"예약 생성 실패: {str(e)}")
    
    def get_reservations(self, user_id: Optional[str] = None, admin: bool = False) -> List[Dict[str, Any]]:
        """
        예약 목록 조회
        
        Args:
            user_id: 사용자 ID (None이면 모든 예약 조회 - 관리자용)
            admin: 관리자 모드 여부
            
        Returns:
            예약 목록
        """
        if not self.supabase:
            raise Exception("Supabase가 설정되지 않았습니다.")
        
        try:
            query = self.supabase.table("reservations").select("*")
            
            # 관리자가 아니면 본인 예약만 조회
            if not admin and user_id:
                query = query.eq("user_id", user_id)
            
            # 생성일 기준 내림차순 정렬
            result = query.order("created_at", desc=True).execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"예약 목록 조회 오류: {str(e)}")
            raise Exception(f"예약 목록 조회 실패: {str(e)}")
    
    def get_reservation(self, reservation_id: str, user_id: Optional[str] = None, admin: bool = False) -> Optional[Dict[str, Any]]:
        """
        예약 상세 조회
        
        Args:
            reservation_id: 예약 ID
            user_id: 사용자 ID (권한 확인용)
            admin: 관리자 모드 여부
            
        Returns:
            예약 정보
        """
        if not self.supabase:
            raise Exception("Supabase가 설정되지 않았습니다.")
        
        try:
            query = self.supabase.table("reservations").select("*").eq("id", reservation_id)
            
            result = query.execute()
            
            if not result.data or len(result.data) == 0:
                return None
            
            reservation = result.data[0]
            
            # 관리자가 아니면 본인 예약만 조회 가능
            if not admin and user_id and reservation.get("user_id") != user_id:
                raise Exception("이 예약에 접근할 권한이 없습니다.")
            
            return reservation
            
        except Exception as e:
            logger.error(f"예약 조회 오류: {str(e)}")
            raise Exception(f"예약 조회 실패: {str(e)}")
    
    def confirm_deposit(self, reservation_id: str, admin_user_id: str) -> Dict[str, Any]:
        """
        예약금 입금 확인 (관리자용)
        
        Args:
            reservation_id: 예약 ID
            admin_user_id: 확인한 관리자 ID
            
        Returns:
            업데이트된 예약 정보
        """
        if not self.supabase:
            raise Exception("Supabase가 설정되지 않았습니다.")
        
        try:
            # 예약 조회
            reservation = self.get_reservation(reservation_id, admin=True)
            
            if not reservation:
                raise Exception("예약을 찾을 수 없습니다.")
            
            if reservation.get("status") != "pending_deposit":
                raise Exception(f"이미 처리된 예약입니다. 현재 상태: {reservation.get('status')}")
            
            # 입금 확인 업데이트
            update_data = {
                "status": "deposit_confirmed",
                "deposit_confirmed_at": datetime.now().isoformat(),
                "deposit_confirmed_by": admin_user_id,
                "updated_at": datetime.now().isoformat()
            }
            
            result = self.supabase.table("reservations").update(update_data).eq("id", reservation_id).execute()
            
            if result.data and len(result.data) > 0:
                logger.info(f"예약금 입금 확인 완료: {reservation_id}")
                return {
                    "success": True,
                    "reservation": result.data[0]
                }
            else:
                raise Exception("입금 확인 업데이트에 실패했습니다.")
                
        except Exception as e:
            logger.error(f"입금 확인 오류: {str(e)}")
            raise Exception(f"입금 확인 실패: {str(e)}")


# Singleton instance
_reservation_service_instance: Optional[ReservationService] = None


def get_reservation_service() -> ReservationService:
    """Get or create ReservationService singleton instance"""
    global _reservation_service_instance
    if _reservation_service_instance is None:
        _reservation_service_instance = ReservationService()
    return _reservation_service_instance
