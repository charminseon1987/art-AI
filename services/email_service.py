"""이메일 전송 서비스 (Resend API 사용)"""
import os
from typing import Optional, Dict, Any
from dotenv import load_dotenv
from models.report import ReportData
from models.contact import ContactInquiry
from utils.supabase_auth import supabase

load_dotenv()


class EmailService:
    """Resend API를 사용한 이메일 전송 서비스"""
    
    def __init__(self):
        self.resend_api_key = os.getenv("RESEND_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@yourdomain.com")
        
        if not self.resend_api_key:
            print("⚠️  RESEND_API_KEY가 설정되지 않았습니다. 이메일 전송 기능이 비활성화됩니다.")
    
    def get_user_email(self, user_id: str) -> Optional[str]:
        """
        Supabase에서 user_id로 이메일 주소 조회
        
        Args:
            user_id: 사용자 ID
            
        Returns:
            이메일 주소 또는 None
        """
        if not supabase:
            print(f"[EmailService] Supabase가 설정되지 않아 이메일을 조회할 수 없습니다.")
            return None
        
        try:
            # 먼저 profiles 테이블에서 email 조회 시도
            profile_response = supabase.table("profiles").select("email").eq("id", user_id).execute()
            
            if profile_response.data and profile_response.data[0].get("email"):
                return profile_response.data[0]["email"]
            
            # profiles에 email이 없다면 Supabase Admin API를 통해 auth.users에서 조회
            import requests
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            
            if not supabase_url or not supabase_service_key:
                print(f"[EmailService] Supabase URL 또는 Service Key가 설정되지 않았습니다.")
                return None
            
            # Admin API 엔드포인트 사용
            url = f"{supabase_url}/auth/v1/admin/users/{user_id}"
            headers = {
                "apikey": supabase_service_key,
                "Authorization": f"Bearer {supabase_service_key}"
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code == 200:
                user_data = response.json()
                email = user_data.get("email")
                if email:
                    return email
                else:
                    print(f"[EmailService] 사용자 데이터에 이메일이 없습니다: user_id={user_id}")
                    return None
            else:
                print(f"[EmailService] 사용자 이메일 조회 실패: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            import traceback
            print(f"[EmailService] 사용자 이메일 조회 오류: {str(e)}")
            print(traceback.format_exc())
            return None
    
    def send_report_email(
        self,
        report_data: ReportData,
        pdf_content: bytes,
        user_email: str
    ) -> Dict[str, Any]:
        """
        리포트 PDF를 이메일로 전송
        
        Args:
            report_data: 리포트 데이터
            pdf_content: PDF 파일 내용 (bytes)
            user_email: 수신자 이메일 주소
            
        Returns:
            전송 결과 딕셔너리 (success, message)
        """
        if not self.resend_api_key:
            return {
                "success": False,
                "message": "RESEND_API_KEY가 설정되지 않았습니다."
            }
        
        try:
            import requests
            import base64
            
            # 파일명 생성
            date_str = report_data.created_at.strftime('%Y%m%d_%H%M%S')
            report_id_short = report_data.id[:8] if report_data.id else "unknown"
            filename = f"그림분석보고서_{date_str}_{report_id_short}.pdf"
            
            # PDF를 base64로 인코딩
            pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
            
            # 이메일 본문 작성 (HTML 형식)
            email_body_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .container {{
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .content {{
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }}
        .info {{
            background-color: #e8f4f8;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #2c3e50;">그림 분석 리포트 생성 완료</h1>
        </div>
        <div class="content">
            <p>안녕하세요,</p>
            <p>그림 분석 리포트가 성공적으로 생성되었습니다.</p>
            
            <div class="info">
                <p><strong>리포트 ID:</strong> {report_data.id[:8] if report_data.id else "N/A"}</p>
                <p><strong>생성일시:</strong> {report_data.created_at.strftime('%Y년 %m월 %d일 %H:%M')}</p>
            </div>
            
            <p>첨부된 PDF 파일에서 상세한 분석 결과를 확인하실 수 있습니다.</p>
            <p>리포트에는 다음 내용이 포함되어 있습니다:</p>
            <ul>
                <li>이미지 관찰 결과</li>
                <li>감정언어 분석 결과</li>
                <li>미술심리 전문가 종합분석</li>
            </ul>
        </div>
        <div class="footer">
            <p>감사합니다.</p>
            <p>본 리포트는 참고 자료이며, 심리 진단이나 치료를 목적으로 하지 않습니다.</p>
        </div>
    </div>
</body>
</html>
"""
            
            # Resend API 호출
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {self.resend_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "from": self.from_email,
                "to": [user_email],
                "subject": "그림 분석 리포트가 생성되었습니다",
                "html": email_body_html,
                "attachments": [
                    {
                        "filename": filename,
                        "content": pdf_base64
                    }
                ]
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print(f"[EmailService] 이메일 전송 성공: {user_email}, id={result.get('id')}")
                return {
                    "success": True,
                    "message": "이메일이 성공적으로 전송되었습니다.",
                    "email_id": result.get("id")
                }
            else:
                error_msg = response.text
                print(f"[EmailService] 이메일 전송 실패: {response.status_code} - {error_msg}")
                return {
                    "success": False,
                    "message": f"이메일 전송 실패: {response.status_code} - {error_msg}"
                }
                
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"[EmailService] 이메일 전송 중 오류 발생: {error_trace}")
            return {
                "success": False,
                "message": f"이메일 전송 중 오류가 발생했습니다: {str(e)}"
            }

    def send_contact_notification(
        self,
        contact_data: ContactInquiry
    ) -> Dict[str, Any]:
        """
        새로운 문의 접수 시 관리자에게 이메일 알림 전송
        
        Args:
            contact_data: 문의 데이터
            
        Returns:
            전송 결과 딕셔너리 (success, message)
        """
        if not self.resend_api_key:
            return {
                "success": False,
                "message": "RESEND_API_KEY가 설정되지 않았습니다."
            }
        
        try:
            import requests
            
            # 수신자 이메일 (관리자)
            admin_email = os.getenv("ADMIN_EMAIL", "lovetree914@naver.com")
            
            # 이메일 본문 작성 (HTML 형식)
            email_body_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .container {{
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 10px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .content {{
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }}
        .info {{
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #e74c3c;">새로운 문의가 접수되었습니다</h1>
        </div>
        <div class="content">
            <p>안녕하세요 관리자님,</p>
            <p>사이트를 통해 새로운 간단 문의가 접수되었습니다. 내용을 확인해 주세요.</p>
            
            <div class="info">
                <p><strong>이름:</strong> {contact_data.name}</p>
                <p><strong>연락처:</strong> {contact_data.phone}</p>
                <p><strong>아이 연령:</strong> {contact_data.child_age}</p>
                <p><strong>접수일시:</strong> {contact_data.created_at.strftime('%Y년 %m월 %d일 %H:%M')}</p>
            </div>
            
            <p><strong>문의 내용:</strong></p>
            <div style="background-color: #fff9c4; padding: 15px; border-left: 5px solid #fbc02d; font-style: italic;">
                {contact_data.message.replace('\n', '<br>')}
            </div>
        </div>
        <div class="footer">
            <p>본 메일은 시스템에 의해 자동으로 발송되었습니다.</p>
        </div>
    </div>
</body>
</html>
"""
            
            # Resend API 호출
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {self.resend_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "from": self.from_email,
                "to": [admin_email],
                "subject": f"[문의접수] {contact_data.name}님의 새로운 문의",
                "html": email_body_html
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print(f"[EmailService] 문의 알림 이메일 전송 성공: {admin_email}, id={result.get('id')}")
                return {
                    "success": True,
                    "message": "문의 알림 이메일이 성공적으로 전송되었습니다.",
                    "email_id": result.get("id")
                }
            else:
                error_msg = response.text
                print(f"[EmailService] 문의 알림 이메일 전송 실패: {response.status_code} - {error_msg}")
                return {
                    "success": False,
                    "message": f"이메일 전송 실패: {response.status_code} - {error_msg}"
                }
                
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"[EmailService] 문의 알림 이메일 전송 중 오류 발생: {error_trace}")
            return {
                "success": False,
                "message": f"이메일 전송 중 오류가 발생했습니다: {str(e)}"
            }
