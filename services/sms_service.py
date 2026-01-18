"""
NCP SENS SMS Service
Handles SMS sending via Naver Cloud Platform Simple & Easy Notification Service (SENS)
"""

import os
import time
import hmac
import hashlib
import base64
import requests
import random
import logging
from typing import Dict, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class SMSService:
    """NCP SENS SMS service for sending verification codes"""

    def __init__(self):
        self.service_id = os.getenv("NCP_SENS_SERVICE_ID")
        self.access_key = os.getenv("NCP_SENS_ACCESS_KEY")
        self.secret_key = os.getenv("NCP_SENS_SECRET_KEY")
        self.from_number = os.getenv("SMS_FROM_NUMBER", "010-4159-1102")

        if not all([self.service_id, self.access_key, self.secret_key]):
            logger.error("Missing NCP SENS credentials in environment variables")
            raise ValueError("NCP SENS credentials not configured")

        self.base_url = f"https://sens.apigw.ntruss.com/sms/v2/services/{self.service_id}"

    def _generate_signature(self, timestamp: str, method: str, uri: str) -> str:
        """
        Generate HMAC signature for NCP API authentication

        Args:
            timestamp: Current timestamp in milliseconds
            method: HTTP method (POST)
            uri: API endpoint URI

        Returns:
            Base64 encoded HMAC signature
        """
        message = f"{method} {uri}\n{timestamp}\n{self.access_key}"
        message_bytes = message.encode('utf-8')
        secret_bytes = self.secret_key.encode('utf-8')

        signature = hmac.new(secret_bytes, message_bytes, hashlib.sha256).digest()
        return base64.b64encode(signature).decode('utf-8')

    def _make_request_headers(self, uri: str) -> Dict[str, str]:
        """
        Create authentication headers for NCP SENS API

        Args:
            uri: API endpoint URI

        Returns:
            Dictionary of headers
        """
        timestamp = str(int(time.time() * 1000))
        signature = self._generate_signature(timestamp, "POST", uri)

        return {
            "Content-Type": "application/json; charset=utf-8",
            "x-ncp-apigw-timestamp": timestamp,
            "x-ncp-iam-access-key": self.access_key,
            "x-ncp-apigw-signature-v2": signature
        }

    def generate_verification_code(self) -> str:
        """
        Generate a 6-digit random verification code

        Returns:
            6-digit string
        """
        return f"{random.randint(0, 999999):06d}"

    def send_verification_code(self, phone_number: str) -> Dict[str, any]:
        """
        Send SMS verification code to phone number

        Args:
            phone_number: Phone number in format 010-xxxx-xxxx or 01012345678

        Returns:
            Dictionary with:
                - success: Boolean
                - code: Verification code (if successful)
                - expires_at: Expiration datetime (if successful)
                - message: Status message
                - request_id: NCP request ID (if successful)
        """
        try:
            # Clean phone number (remove hyphens)
            clean_phone = phone_number.replace("-", "").replace(" ", "")

            # Validate Korean phone number format
            if not (clean_phone.startswith("010") and len(clean_phone) == 11):
                return {
                    "success": False,
                    "message": "유효하지 않은 전화번호 형식입니다. (010-xxxx-xxxx)"
                }

            # Generate verification code
            code = self.generate_verification_code()

            # Calculate expiration (5 minutes from now)
            expires_at = datetime.now() + timedelta(minutes=5)

            # Prepare SMS message
            message = f"[그림마음연구소] 인증번호는 [{code}]입니다. 5분 이내에 입력해주세요."

            # Prepare API request
            uri = f"/sms/v2/services/{self.service_id}/messages"
            url = self.base_url + "/messages"

            headers = self._make_request_headers(uri)

            payload = {
                "type": "SMS",
                "contentType": "COMM",
                "countryCode": "82",
                "from": self.from_number.replace("-", ""),
                "content": message,
                "messages": [
                    {
                        "to": clean_phone
                    }
                ]
            }

            # Send request to NCP SENS
            logger.info(f"Sending SMS to {phone_number}")
            response = requests.post(url, json=payload, headers=headers, timeout=10)

            if response.status_code == 202:  # Success
                result = response.json()
                logger.info(f"SMS sent successfully: {result.get('requestId')}")

                return {
                    "success": True,
                    "code": code,
                    "expires_at": expires_at,
                    "message": "인증번호가 전송되었습니다.",
                    "request_id": result.get("requestId")
                }
            else:
                logger.error(f"SMS send failed: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "message": f"SMS 전송 실패: {response.status_code}"
                }

        except requests.Timeout:
            logger.error("SMS request timeout")
            return {
                "success": False,
                "message": "SMS 전송 시간 초과"
            }
        except Exception as e:
            logger.error(f"SMS send error: {str(e)}")
            return {
                "success": False,
                "message": f"SMS 전송 오류: {str(e)}"
            }

    def send_custom_sms(
        self,
        phone_number: str,
        message: str,
        content_type: str = "COMM"
    ) -> Dict[str, any]:
        """
        Send custom SMS message

        Args:
            phone_number: Phone number in format 010-xxxx-xxxx or 01012345678
            message: SMS message content
            content_type: Message type (COMM=general, AD=advertisement)

        Returns:
            Dictionary with success status and message
        """
        try:
            # Clean phone number
            clean_phone = phone_number.replace("-", "").replace(" ", "")

            # Prepare API request
            uri = f"/sms/v2/services/{self.service_id}/messages"
            url = self.base_url + "/messages"

            headers = self._make_request_headers(uri)

            payload = {
                "type": "SMS",
                "contentType": content_type,
                "countryCode": "82",
                "from": self.from_number.replace("-", ""),
                "content": message,
                "messages": [
                    {
                        "to": clean_phone
                    }
                ]
            }

            # Send request
            logger.info(f"Sending custom SMS to {phone_number}")
            response = requests.post(url, json=payload, headers=headers, timeout=10)

            if response.status_code == 202:
                result = response.json()
                logger.info(f"Custom SMS sent successfully: {result.get('requestId')}")

                return {
                    "success": True,
                    "message": "메시지가 전송되었습니다.",
                    "request_id": result.get("requestId")
                }
            else:
                logger.error(f"Custom SMS send failed: {response.status_code} - {response.text}")
                return {
                    "success": False,
                    "message": f"메시지 전송 실패: {response.status_code}"
                }

        except Exception as e:
            logger.error(f"Custom SMS send error: {str(e)}")
            return {
                "success": False,
                "message": f"메시지 전송 오류: {str(e)}"
            }


# Singleton instance
_sms_service_instance: Optional[SMSService] = None


def get_sms_service() -> SMSService:
    """Get or create SMSService singleton instance"""
    global _sms_service_instance
    if _sms_service_instance is None:
        _sms_service_instance = SMSService()
    return _sms_service_instance
