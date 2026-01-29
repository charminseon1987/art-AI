"""
Stripe Payment Service
Handles Stripe payment processing, checkout sessions, and webhook events
"""

import os
import logging
from typing import Dict, Optional, Any
import stripe

from utils.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

# Stripe API 키 설정
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

if not stripe.api_key:
    logger.warning("STRIPE_SECRET_KEY가 설정되지 않았습니다. Stripe 기능을 사용할 수 없습니다.")


class StripeService:
    """Service for Stripe payment processing"""

    def __init__(self):
        self.supabase = get_supabase_client()
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    def create_checkout_session(
        self,
        user_id: str,
        service_id: Optional[str] = None,
        amount: int = 0,
        currency: str = "krw",
        success_url: str = None,
        cancel_url: str = None,
        metadata: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Create a Stripe Checkout Session

        Args:
            user_id: User ID
            service_id: Service ID (optional)
            amount: Amount in KRW (won)
            currency: Currency code (default: krw)
            success_url: Success redirect URL
            cancel_url: Cancel redirect URL
            metadata: Additional metadata

        Returns:
            Dictionary with checkout session URL and session ID
        """
        if not stripe.api_key:
            raise ValueError("Stripe API 키가 설정되지 않았습니다.")

        try:
            # 기본 URL 설정
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
            if not success_url:
                success_url = f"{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
            if not cancel_url:
                cancel_url = f"{frontend_url}/payment/cancel"

            # 메타데이터 구성
            session_metadata = {
                "user_id": user_id,
            }
            if service_id:
                session_metadata["service_id"] = service_id
            if metadata:
                session_metadata.update(metadata)

            # Stripe Checkout Session 생성
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": currency,
                            "product_data": {
                                "name": "그림 상담 서비스",
                            },
                            "unit_amount": amount,  # KRW는 원 단위
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=session_metadata,
                customer_email=None,  # 필요시 추가
            )

            logger.info(f"Stripe Checkout Session 생성 성공: {session.id}")

            return {
                "success": True,
                "session_id": session.id,
                "url": session.url,
                "payment_intent_id": session.payment_intent,
            }

        except stripe.error.StripeError as e:
            logger.error(f"Stripe Checkout Session 생성 실패: {str(e)}")
            raise Exception(f"결제 세션 생성 실패: {str(e)}")
        except Exception as e:
            logger.error(f"결제 세션 생성 오류: {str(e)}")
            raise Exception(f"결제 세션 생성 실패: {str(e)}")

    def verify_payment(self, session_id: str) -> Dict[str, Any]:
        """
        Verify payment by retrieving checkout session

        Args:
            session_id: Stripe Checkout Session ID

        Returns:
            Payment verification result
        """
        if not stripe.api_key:
            raise ValueError("Stripe API 키가 설정되지 않았습니다.")

        try:
            session = stripe.checkout.Session.retrieve(session_id)

            return {
                "success": True,
                "session": session,
                "payment_status": session.payment_status,
                "payment_intent_id": session.payment_intent,
                "amount_total": session.amount_total,
                "currency": session.currency,
                "metadata": session.metadata,
            }

        except stripe.error.StripeError as e:
            logger.error(f"결제 확인 실패: {str(e)}")
            raise Exception(f"결제 확인 실패: {str(e)}")

    def refund_payment(
        self, payment_intent_id: str, amount: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Refund a payment

        Args:
            payment_intent_id: Stripe Payment Intent ID
            amount: Partial refund amount (None for full refund)

        Returns:
            Refund result
        """
        if not stripe.api_key:
            raise ValueError("Stripe API 키가 설정되지 않았습니다.")

        try:
            if amount:
                refund = stripe.Refund.create(
                    payment_intent=payment_intent_id, amount=amount
                )
            else:
                refund = stripe.Refund.create(payment_intent=payment_intent_id)

            logger.info(f"환불 성공: {refund.id}")

            return {
                "success": True,
                "refund_id": refund.id,
                "amount": refund.amount,
                "status": refund.status,
            }

        except stripe.error.StripeError as e:
            logger.error(f"환불 실패: {str(e)}")
            raise Exception(f"환불 실패: {str(e)}")

    def handle_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """
        Handle Stripe webhook events

        Args:
            payload: Raw webhook payload
            signature: Stripe signature header

        Returns:
            Webhook handling result
        """
        if not self.webhook_secret:
            raise ValueError("Stripe 웹훅 시크릿이 설정되지 않았습니다.")

        try:
            # 웹훅 서명 검증
            event = stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )

            event_type = event["type"]
            event_data = event["data"]["object"]

            logger.info(f"Stripe 웹훅 이벤트 수신: {event_type}")

            # 이벤트 타입별 처리
            if event_type == "checkout.session.completed":
                return self._handle_checkout_completed(event_data)
            elif event_type == "payment_intent.succeeded":
                return self._handle_payment_succeeded(event_data)
            elif event_type == "charge.refunded":
                return self._handle_refund_completed(event_data)
            else:
                logger.info(f"처리하지 않는 이벤트 타입: {event_type}")
                return {"success": True, "message": f"이벤트 {event_type}는 처리하지 않습니다."}

        except ValueError as e:
            logger.error(f"웹훅 페이로드 파싱 실패: {str(e)}")
            raise Exception(f"웹훅 처리 실패: {str(e)}")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"웹훅 서명 검증 실패: {str(e)}")
            raise Exception(f"웹훅 서명 검증 실패: {str(e)}")

    def _handle_checkout_completed(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Handle checkout.session.completed event"""
        try:
            session_id = session.get("id")
            payment_intent_id = session.get("payment_intent")
            metadata = session.get("metadata", {})
            user_id = metadata.get("user_id")
            service_id = metadata.get("service_id")

            logger.info(
                f"Checkout 완료: session_id={session_id}, user_id={user_id}, service_id={service_id}"
            )

            # 여기서 결제 기록을 데이터베이스에 저장하는 로직은 payment_service에서 처리
            # 이 서비스는 Stripe 관련 작업만 담당

            return {
                "success": True,
                "event": "checkout.session.completed",
                "session_id": session_id,
                "payment_intent_id": payment_intent_id,
            }

        except Exception as e:
            logger.error(f"Checkout 완료 처리 오류: {str(e)}")
            raise

    def _handle_payment_succeeded(self, payment_intent: Dict[str, Any]) -> Dict[str, Any]:
        """Handle payment_intent.succeeded event"""
        try:
            payment_intent_id = payment_intent.get("id")
            amount = payment_intent.get("amount")
            currency = payment_intent.get("currency")
            metadata = payment_intent.get("metadata", {})

            logger.info(f"결제 성공: payment_intent_id={payment_intent_id}, amount={amount}")

            return {
                "success": True,
                "event": "payment_intent.succeeded",
                "payment_intent_id": payment_intent_id,
                "amount": amount,
                "currency": currency,
            }

        except Exception as e:
            logger.error(f"결제 성공 처리 오류: {str(e)}")
            raise

    def _handle_refund_completed(self, charge: Dict[str, Any]) -> Dict[str, Any]:
        """Handle charge.refunded event"""
        try:
            charge_id = charge.get("id")
            refund_amount = charge.get("amount_refunded")

            logger.info(f"환불 완료: charge_id={charge_id}, amount={refund_amount}")

            return {
                "success": True,
                "event": "charge.refunded",
                "charge_id": charge_id,
                "refund_amount": refund_amount,
            }

        except Exception as e:
            logger.error(f"환불 완료 처리 오류: {str(e)}")
            raise


# Singleton instance
_stripe_service_instance: Optional[StripeService] = None


def get_stripe_service() -> StripeService:
    """Get or create StripeService singleton instance"""
    global _stripe_service_instance
    if _stripe_service_instance is None:
        _stripe_service_instance = StripeService()
    return _stripe_service_instance
