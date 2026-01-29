"""
Payment Service
Handles payment business logic and database operations
"""

import os
import uuid
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from supabase import Client

from utils.supabase_client import get_supabase_client
from services.stripe_service import get_stripe_service

logger = logging.getLogger(__name__)


class PaymentService:
    """Service for payment business logic and database operations"""

    def __init__(self):
        try:
            self.supabase: Client = get_supabase_client()
            self.stripe_service = get_stripe_service()
        except Exception as e:
            logger.error(f"PaymentService 초기화 실패: {e}")
            self.supabase = None
            self.stripe_service = None

    def create_payment_session(
        self,
        user_id: str,
        service_id: Optional[str] = None,
        amount: int = 0,
        reservation_id: Optional[str] = None,
        payment_type: str = "full",
        metadata: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Create a payment session and save initial payment record

        Args:
            user_id: User ID
            service_id: Service ID (optional)
            amount: Amount in KRW
            reservation_id: Reservation ID (optional)
            payment_type: Payment type ('full', 'deposit', 'balance')
            metadata: Additional metadata

        Returns:
            Payment session information
        """
        if not self.supabase:
            raise Exception("Supabase가 설정되지 않았습니다.")
        if not self.stripe_service:
            raise Exception("Stripe 서비스가 설정되지 않았습니다.")

        try:
            # 서비스 정보 조회 (있는 경우)
            service_name = "그림 상담 서비스"
            if service_id:
                service_result = (
                    self.supabase.table("services")
                    .select("*")
                    .eq("id", service_id)
                    .execute()
                )
                if service_result.data and len(service_result.data) > 0:
                    service_name = service_result.data[0].get("name", service_name)

            # 메타데이터 구성
            session_metadata = {
                "payment_type": payment_type,
            }
            if service_id:
                session_metadata["service_id"] = service_id
            if reservation_id:
                session_metadata["reservation_id"] = reservation_id
            if metadata:
                session_metadata.update(metadata)

            # Stripe Checkout Session 생성
            checkout_result = self.stripe_service.create_checkout_session(
                user_id=user_id,
                service_id=service_id,
                amount=amount,
                metadata=session_metadata,
            )

            # 결제 기록 생성 (pending 상태)
            merchant_uid = f"payment_{uuid.uuid4().hex[:16]}"
            payment_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "service_id": service_id,
                "reservation_id": reservation_id,
                "merchant_uid": merchant_uid,
                "stripe_checkout_session_id": checkout_result["session_id"],
                "stripe_payment_intent_id": checkout_result.get("payment_intent_id"),
                "amount": amount,
                "payment_type": payment_type,
                "payment_method": "card",
                "payment_status": "pending",
                "stripe_response": {
                    "session_id": checkout_result["session_id"],
                    "payment_intent_id": checkout_result.get("payment_intent_id"),
                },
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            }

            result = (
                self.supabase.table("payments").insert(payment_data).execute()
            )

            if result.data and len(result.data) > 0:
                logger.info(
                    f"결제 세션 생성 성공: payment_id={result.data[0]['id']}, session_id={checkout_result['session_id']}"
                )
                return {
                    "success": True,
                    "payment_id": result.data[0]["id"],
                    "session_id": checkout_result["session_id"],
                    "checkout_url": checkout_result["url"],
                }
            else:
                raise Exception("결제 기록 생성에 실패했습니다.")

        except Exception as e:
            logger.error(f"결제 세션 생성 오류: {str(e)}")
            raise Exception(f"결제 세션 생성 실패: {str(e)}")

    def verify_and_complete_payment(
        self, session_id: str, user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Verify payment and update payment record

        Args:
            session_id: Stripe Checkout Session ID
            user_id: User ID for verification (optional)

        Returns:
            Payment verification result
        """
        if not self.supabase:
            raise Exception("Supabase가 설정되지 않았습니다.")
        if not self.stripe_service:
            raise Exception("Stripe 서비스가 설정되지 않았습니다.")

        try:
            # Stripe에서 결제 확인
            verification_result = self.stripe_service.verify_payment(session_id)
            session = verification_result["session"]

            # 결제 기록 조회
            payment_result = (
                self.supabase.table("payments")
                .select("*")
                .eq("stripe_checkout_session_id", session_id)
                .execute()
            )

            if not payment_result.data or len(payment_result.data) == 0:
                raise Exception("결제 기록을 찾을 수 없습니다.")

            payment = payment_result.data[0]

            # 사용자 확인 (있는 경우)
            if user_id and payment.get("user_id") != user_id:
                raise Exception("이 결제에 접근할 권한이 없습니다.")

            # 결제 상태 확인
            if session.payment_status == "paid":
                # 결제 완료로 업데이트
                update_data = {
                    "payment_status": "paid",
                    "stripe_payment_intent_id": session.payment_intent,
                    "stripe_response": {
                        "session_id": session_id,
                        "payment_intent_id": session.payment_intent,
                        "payment_status": session.payment_status,
                        "amount_total": session.amount_total,
                        "currency": session.currency,
                    },
                    "paid_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                }

                update_result = (
                    self.supabase.table("payments")
                    .update(update_data)
                    .eq("id", payment["id"])
                    .execute()
                )

                if update_result.data and len(update_result.data) > 0:
                    logger.info(f"결제 완료 처리: payment_id={payment['id']}")

                    # 예약이 있는 경우 예약 상태 업데이트
                    reservation_id = payment.get("reservation_id")
                    payment_type = payment.get("payment_type")

                    if reservation_id:
                        self._update_reservation_status(
                            reservation_id, payment_type, payment["id"]
                        )

                    return {
                        "success": True,
                        "payment": update_result.data[0],
                        "message": "결제가 완료되었습니다.",
                    }
                else:
                    raise Exception("결제 상태 업데이트에 실패했습니다.")
            else:
                return {
                    "success": False,
                    "payment_status": session.payment_status,
                    "message": f"결제가 완료되지 않았습니다. 상태: {session.payment_status}",
                }

        except Exception as e:
            logger.error(f"결제 확인 오류: {str(e)}")
            raise Exception(f"결제 확인 실패: {str(e)}")

    def _update_reservation_status(
        self, reservation_id: str, payment_type: str, payment_id: str
    ) -> None:
        """Update reservation status based on payment"""
        try:
            reservation_result = (
                self.supabase.table("reservations")
                .select("*")
                .eq("id", reservation_id)
                .execute()
            )

            if not reservation_result.data or len(reservation_result.data) == 0:
                logger.warning(f"예약을 찾을 수 없습니다: {reservation_id}")
                return

            reservation = reservation_result.data[0]
            current_status = reservation.get("status", "pending_deposit")

            update_data = {
                "updated_at": datetime.now().isoformat(),
            }

            if payment_type == "deposit":
                update_data["deposit_payment_id"] = payment_id
                update_data["deposit_paid_at"] = datetime.now().isoformat()
                if current_status == "pending_deposit":
                    update_data["status"] = "deposit_paid"
            elif payment_type == "balance":
                update_data["balance_payment_id"] = payment_id
                update_data["balance_paid_at"] = datetime.now().isoformat()
                if current_status == "deposit_confirmed":
                    update_data["status"] = "in_progress"

            self.supabase.table("reservations").update(update_data).eq(
                "id", reservation_id
            ).execute()

            logger.info(
                f"예약 상태 업데이트: reservation_id={reservation_id}, payment_type={payment_type}"
            )

        except Exception as e:
            logger.error(f"예약 상태 업데이트 오류: {str(e)}")

    def get_payments(
        self, user_id: Optional[str] = None, admin: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get payment list

        Args:
            user_id: User ID (None for all payments - admin only)
            admin: Admin mode

        Returns:
            List of payments
        """
        if not self.supabase:
            raise Exception("Supabase가 설정되지 않았습니다.")

        try:
            query = self.supabase.table("payments").select("*")

            if not admin and user_id:
                query = query.eq("user_id", user_id)

            result = query.order("created_at", desc=True).execute()

            return result.data if result.data else []

        except Exception as e:
            logger.error(f"결제 목록 조회 오류: {str(e)}")
            raise Exception(f"결제 목록 조회 실패: {str(e)}")

    def get_payment(self, payment_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get payment details

        Args:
            payment_id: Payment ID
            user_id: User ID for verification

        Returns:
            Payment details
        """
        if not self.supabase:
            raise Exception("Supabase가 설정되지 않았습니다.")

        try:
            result = (
                self.supabase.table("payments")
                .select("*")
                .eq("id", payment_id)
                .execute()
            )

            if not result.data or len(result.data) == 0:
                return None

            payment = result.data[0]

            # 사용자 확인
            if user_id and payment.get("user_id") != user_id:
                raise Exception("이 결제에 접근할 권한이 없습니다.")

            return payment

        except Exception as e:
            logger.error(f"결제 조회 오류: {str(e)}")
            raise Exception(f"결제 조회 실패: {str(e)}")

    def refund_payment(
        self, payment_id: str, amount: Optional[int] = None, admin_user_id: str = None
    ) -> Dict[str, Any]:
        """
        Refund a payment

        Args:
            payment_id: Payment ID
            amount: Partial refund amount (None for full refund)
            admin_user_id: Admin user ID who initiated the refund

        Returns:
            Refund result
        """
        if not self.supabase:
            raise Exception("Supabase가 설정되지 않았습니다.")
        if not self.stripe_service:
            raise Exception("Stripe 서비스가 설정되지 않았습니다.")

        try:
            # 결제 기록 조회
            payment = self.get_payment(payment_id, admin=True)

            if not payment:
                raise Exception("결제 기록을 찾을 수 없습니다.")

            payment_intent_id = payment.get("stripe_payment_intent_id")
            if not payment_intent_id:
                raise Exception("Stripe Payment Intent ID가 없습니다.")

            # 환불 처리
            refund_result = self.stripe_service.refund_payment(
                payment_intent_id, amount
            )

            # 결제 상태 업데이트
            update_data = {
                "payment_status": "refunded",
                "stripe_response": {
                    **payment.get("stripe_response", {}),
                    "refund_id": refund_result["refund_id"],
                    "refund_amount": refund_result["amount"],
                    "refund_status": refund_result["status"],
                },
                "updated_at": datetime.now().isoformat(),
            }

            self.supabase.table("payments").update(update_data).eq(
                "id", payment_id
            ).execute()

            logger.info(f"환불 완료: payment_id={payment_id}")

            return {
                "success": True,
                "refund_id": refund_result["refund_id"],
                "amount": refund_result["amount"],
                "message": "환불이 완료되었습니다.",
            }

        except Exception as e:
            logger.error(f"환불 처리 오류: {str(e)}")
            raise Exception(f"환불 처리 실패: {str(e)}")


# Singleton instance
_payment_service_instance: Optional[PaymentService] = None


def get_payment_service() -> PaymentService:
    """Get or create PaymentService singleton instance"""
    global _payment_service_instance
    if _payment_service_instance is None:
        _payment_service_instance = PaymentService()
    return _payment_service_instance
