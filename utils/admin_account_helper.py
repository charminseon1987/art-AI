"""
관리자 계정 확인 및 복구 유틸리티

사용법:
    python utils/admin_account_helper.py list          # 모든 관리자 계정 목록 확인
    python utils/admin_account_helper.py create        # 새 관리자 계정 생성
    python utils/admin_account_helper.py set-role      # 기존 계정에 관리자 권한 부여
"""

import os
import sys
from supabase import create_client, Client
from getpass import getpass

def get_supabase_client() -> Client:
    """Supabase 클라이언트 생성"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ 오류: 환경 변수가 설정되지 않았습니다.")
        print("다음 환경 변수를 설정하세요:")
        print("  - SUPABASE_URL")
        print("  - SUPABASE_SERVICE_ROLE_KEY")
        print("\n.env 파일을 확인하거나 환경 변수를 설정해주세요.")
        sys.exit(1)
    
    return create_client(supabase_url, supabase_key)


def list_admin_accounts():
    """모든 관리자 계정 목록 출력"""
    supabase = get_supabase_client()
    
    print("\n🔍 관리자 계정 목록 조회 중...\n")
    
    try:
        # profiles 테이블에서 admin/supervisor 역할 계정 조회
        response = supabase.table("profiles").select("email, name, role, created_at").in_("role", ["admin", "supervisor"]).execute()
        
        if not response.data:
            print("❌ 관리자 계정이 없습니다.")
            print("\n새 관리자 계정을 생성하려면:")
            print("  python utils/admin_account_helper.py create")
            return
        
        print(f"✅ 총 {len(response.data)}개의 관리자 계정을 찾았습니다:\n")
        print("-" * 80)
        print(f"{'이메일':<40} {'이름':<20} {'역할':<15} {'생성일'}")
        print("-" * 80)
        
        for account in response.data:
            email = account.get("email", "N/A")
            name = account.get("name", "N/A")
            role = account.get("role", "N/A")
            created_at = account.get("created_at", "N/A")
            
            if created_at != "N/A":
                created_at = created_at.split("T")[0]  # 날짜만 표시
            
            print(f"{email:<40} {name:<20} {role:<15} {created_at}")
        
        print("-" * 80)
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        print("\nSupabase 연결을 확인하세요.")


def create_admin_account():
    """새 관리자 계정 생성"""
    supabase = get_supabase_client()
    
    print("\n📝 새 관리자 계정 생성\n")
    
    email = input("이메일: ").strip()
    if not email:
        print("❌ 이메일을 입력해주세요.")
        return
    
    password = getpass("비밀번호: ")
    if not password or len(password) < 6:
        print("❌ 비밀번호는 최소 6자 이상이어야 합니다.")
        return
    
    name = input("이름 (선택사항): ").strip()
    
    print("\n계정 생성 중...")
    
    try:
        # Supabase Auth를 통해 사용자 생성
        auth_response = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,  # 이메일 인증 자동 완료
            "user_metadata": {
                "name": name or "",
                "role": "admin"
            }
        })
        
        if not auth_response.user:
            print("❌ 사용자 생성에 실패했습니다.")
            return
        
        user_id = auth_response.user.id
        
        # profiles 테이블에 관리자 역할로 추가
        profile_response = supabase.table("profiles").upsert({
            "id": user_id,
            "email": email,
            "name": name or "",
            "role": "admin"
        }).execute()
        
        print(f"\n✅ 관리자 계정이 성공적으로 생성되었습니다!")
        print(f"   이메일: {email}")
        print(f"   역할: admin")
        print(f"\n이제 이 계정으로 로그인할 수 있습니다.")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        print("\n계정 생성에 실패했습니다. 이메일이 이미 사용 중일 수 있습니다.")


def set_admin_role():
    """기존 계정에 관리자 권한 부여"""
    supabase = get_supabase_client()
    
    print("\n🔧 기존 계정에 관리자 권한 부여\n")
    
    email = input("이메일: ").strip()
    if not email:
        print("❌ 이메일을 입력해주세요.")
        return
    
    print("\n권한 부여 중...")
    
    try:
        # profiles 테이블에서 해당 이메일의 사용자 찾기
        response = supabase.table("profiles").select("id, email, name, role").eq("email", email).execute()
        
        if not response.data:
            print(f"❌ '{email}' 계정을 찾을 수 없습니다.")
            print("먼저 회원가입을 통해 계정을 생성하세요.")
            return
        
        user = response.data[0]
        current_role = user.get("role", "user")
        
        print(f"\n현재 계정 정보:")
        print(f"  이메일: {user.get('email')}")
        print(f"  이름: {user.get('name', 'N/A')}")
        print(f"  현재 역할: {current_role}")
        
        if current_role in ["admin", "supervisor"]:
            print(f"\n⚠️  이미 관리자 권한이 있습니다.")
            change = input("역할을 변경하시겠습니까? (y/n): ").strip().lower()
            if change != "y":
                return
        
        role_choice = input("\n부여할 역할을 선택하세요 (admin/supervisor): ").strip().lower()
        if role_choice not in ["admin", "supervisor"]:
            print("❌ 'admin' 또는 'supervisor'만 선택할 수 있습니다.")
            return
        
        # 역할 업데이트
        update_response = supabase.table("profiles").update({
            "role": role_choice
        }).eq("email", email).execute()
        
        print(f"\n✅ '{email}' 계정의 역할이 '{role_choice}'로 변경되었습니다.")
        print("이제 이 계정으로 관리자 페이지에 접근할 수 있습니다.")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")


def main():
    """메인 함수"""
    if len(sys.argv) < 2:
        print(__doc__)
        print("\n사용 가능한 명령어:")
        print("  list       - 모든 관리자 계정 목록 확인")
        print("  create     - 새 관리자 계정 생성")
        print("  set-role   - 기존 계정에 관리자 권한 부여")
        return
    
    command = sys.argv[1].lower()
    
    if command == "list":
        list_admin_accounts()
    elif command == "create":
        create_admin_account()
    elif command == "set-role":
        set_admin_role()
    else:
        print(f"❌ 알 수 없는 명령어: {command}")
        print(__doc__)


if __name__ == "__main__":
    main()

