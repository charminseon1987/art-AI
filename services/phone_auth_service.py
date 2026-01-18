"""
Phone Authentication Service
Handles phone number verification and user session management
"""

import os
import uuid
import secrets
import logging
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
from supabase import Client

from utils.supabase_client import get_supabase_client
from services.sms_service import get_sms_service

logger = logging.getLogger(__name__)


class PhoneAuthService:
    """Service for phone-based authentication"""

    def __init__(self):
        self.supabase: Client = get_supabase_client()
        self.sms_service = get_sms_service()

        # Rate limiting: max 3 SMS per hour per phone number
        self.rate_limit_count = 3
        self.rate_limit_window = 3600  # 1 hour in seconds

    def _check_rate_limit(self, phone_number: str) -> Tuple[bool, Optional[str]]:
        """
        Check if phone number has exceeded SMS rate limit

        Args:
            phone_number: Phone number to check

        Returns:
            Tuple of (is_allowed, error_message)
        """
        try:
            one_hour_ago = datetime.now() - timedelta(hours=1)

            # Count SMS sent to this number in the last hour
            result = self.supabase.table("phone_verifications").select("id").eq(
                "phone_number", phone_number
            ).gte("created_at", one_hour_ago.isoformat()).execute()

            count = len(result.data) if result.data else 0

            if count >= self.rate_limit_count:
                return False, f"인증번호 요청 횟수를 초과했습니다. 1시간 후 다시 시도해주세요."

            return True, None

        except Exception as e:
            logger.error(f"Rate limit check error: {str(e)}")
            # Allow on error (fail open)
            return True, None

    def send_verification_code(self, phone_number: str) -> Dict[str, any]:
        """
        Send SMS verification code to phone number

        Args:
            phone_number: Phone number in format 010-xxxx-xxxx

        Returns:
            Dictionary with success status and message
        """
        try:
            # Check rate limit
            is_allowed, error_msg = self._check_rate_limit(phone_number)
            if not is_allowed:
                return {
                    "success": False,
                    "message": error_msg
                }

            # Send SMS via NCP SENS
            sms_result = self.sms_service.send_verification_code(phone_number)

            if not sms_result["success"]:
                return sms_result

            # Store verification code in database
            code = sms_result["code"]
            expires_at = sms_result["expires_at"]

            self.supabase.table("phone_verifications").insert({
                "phone_number": phone_number,
                "verification_code": code,
                "is_verified": False,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now().isoformat()
            }).execute()

            logger.info(f"Verification code sent and stored for {phone_number}")

            return {
                "success": True,
                "message": "인증번호가 전송되었습니다. 5분 이내에 입력해주세요."
            }

        except Exception as e:
            logger.error(f"Send verification code error: {str(e)}")
            return {
                "success": False,
                "message": f"인증번호 전송 실패: {str(e)}"
            }

    def verify_code(self, phone_number: str, code: str) -> Dict[str, any]:
        """
        Verify SMS code and mark as verified

        Args:
            phone_number: Phone number
            code: 6-digit verification code

        Returns:
            Dictionary with success status, message, and verification_id
        """
        try:
            # Find most recent non-verified code for this phone number
            result = self.supabase.table("phone_verifications").select("*").eq(
                "phone_number", phone_number
            ).eq("verification_code", code).eq("is_verified", False).order(
                "created_at", desc=True
            ).limit(1).execute()

            if not result.data or len(result.data) == 0:
                return {
                    "success": False,
                    "message": "인증번호가 일치하지 않습니다."
                }

            verification = result.data[0]

            # Check if code has expired
            expires_at = datetime.fromisoformat(verification["expires_at"].replace("Z", "+00:00"))
            if datetime.now() > expires_at.replace(tzinfo=None):
                return {
                    "success": False,
                    "message": "인증번호가 만료되었습니다. 다시 요청해주세요."
                }

            # Mark as verified
            self.supabase.table("phone_verifications").update({
                "is_verified": True,
                "verified_at": datetime.now().isoformat()
            }).eq("id", verification["id"]).execute()

            logger.info(f"Phone number {phone_number} verified successfully")

            return {
                "success": True,
                "message": "인증되었습니다.",
                "verification_id": verification["id"]
            }

        except Exception as e:
            logger.error(f"Verify code error: {str(e)}")
            return {
                "success": False,
                "message": f"인증 실패: {str(e)}"
            }

    def find_or_create_user(self, phone_number: str) -> Dict[str, any]:
        """
        Find existing user by phone or create new user

        Args:
            phone_number: Verified phone number

        Returns:
            Dictionary with user data
        """
        try:
            # Check if user exists with this phone number
            result = self.supabase.table("profiles").select("*").eq(
                "phone_number", phone_number
            ).execute()

            if result.data and len(result.data) > 0:
                user = result.data[0]
                logger.info(f"Existing user found: {user['id']}")
                return {
                    "success": True,
                    "user": user,
                    "is_new_user": False
                }

            # Create new user
            user_id = str(uuid.uuid4())

            new_user = {
                "id": user_id,
                "phone_number": phone_number,
                "phone_verified_at": datetime.now().isoformat(),
                "auth_provider": "phone",
                "role": "user",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }

            user_result = self.supabase.table("profiles").insert(new_user).execute()

            # Also create usage limits entry
            self.supabase.table("user_usage_limits").insert({
                "user_id": user_id,
                "image_analysis_count": 0,
                "fingerprint_analysis_count": 0,
                "image_analysis_paid_count": 0,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            }).execute()

            logger.info(f"New user created: {user_id}")

            return {
                "success": True,
                "user": user_result.data[0],
                "is_new_user": True
            }

        except Exception as e:
            logger.error(f"Find or create user error: {str(e)}")
            return {
                "success": False,
                "message": f"사용자 생성 실패: {str(e)}"
            }

    def create_session(
        self,
        user_id: str,
        phone_number: str,
        expiry_hours: int = 24
    ) -> Dict[str, any]:
        """
        Create authentication session for user

        Args:
            user_id: User UUID
            phone_number: Phone number
            expiry_hours: Session expiry in hours (default 24)

        Returns:
            Dictionary with session token and expiry
        """
        try:
            # Generate secure session token
            session_token = secrets.token_urlsafe(32)

            # Calculate expiry
            expires_at = datetime.now() + timedelta(hours=expiry_hours)

            # Store session in database
            self.supabase.table("user_sessions").insert({
                "user_id": user_id,
                "session_token": session_token,
                "phone_number": phone_number,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now().isoformat(),
                "last_accessed_at": datetime.now().isoformat()
            }).execute()

            logger.info(f"Session created for user {user_id}")

            return {
                "success": True,
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "user_id": user_id
            }

        except Exception as e:
            logger.error(f"Create session error: {str(e)}")
            return {
                "success": False,
                "message": f"세션 생성 실패: {str(e)}"
            }

    def verify_session(self, session_token: str) -> Dict[str, any]:
        """
        Verify session token and return user info

        Args:
            session_token: Session token from client

        Returns:
            Dictionary with user data if valid
        """
        try:
            # Find session
            result = self.supabase.table("user_sessions").select(
                "*, profiles(*)"
            ).eq("session_token", session_token).execute()

            if not result.data or len(result.data) == 0:
                return {
                    "success": False,
                    "message": "유효하지 않은 세션입니다."
                }

            session = result.data[0]

            # Check expiry
            expires_at = datetime.fromisoformat(session["expires_at"].replace("Z", "+00:00"))
            if datetime.now() > expires_at.replace(tzinfo=None):
                return {
                    "success": False,
                    "message": "세션이 만료되었습니다. 다시 로그인해주세요."
                }

            # Update last accessed time
            self.supabase.table("user_sessions").update({
                "last_accessed_at": datetime.now().isoformat()
            }).eq("session_token", session_token).execute()

            return {
                "success": True,
                "user": session["profiles"],
                "session": session
            }

        except Exception as e:
            logger.error(f"Verify session error: {str(e)}")
            return {
                "success": False,
                "message": f"세션 확인 실패: {str(e)}"
            }

    def logout(self, session_token: str) -> Dict[str, any]:
        """
        Delete session (logout)

        Args:
            session_token: Session token to delete

        Returns:
            Dictionary with success status
        """
        try:
            self.supabase.table("user_sessions").delete().eq(
                "session_token", session_token
            ).execute()

            logger.info("Session deleted (logout)")

            return {
                "success": True,
                "message": "로그아웃되었습니다."
            }

        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return {
                "success": False,
                "message": f"로그아웃 실패: {str(e)}"
            }


# Singleton instance
_phone_auth_service_instance: Optional[PhoneAuthService] = None


def get_phone_auth_service() -> PhoneAuthService:
    """Get or create PhoneAuthService singleton instance"""
    global _phone_auth_service_instance
    if _phone_auth_service_instance is None:
        _phone_auth_service_instance = PhoneAuthService()
    return _phone_auth_service_instance
