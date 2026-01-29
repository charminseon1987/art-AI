"""메인 진입점"""
import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.setup import setup_directories


def main():
    """메인 함수"""
    print("🎨 AI 그림 상담 에이전트")
    print("=" * 50)
    
    # 디렉토리 설정
    print("\n📁 프로젝트 디렉토리 설정 중...")
    setup_directories()
    
    print("\n✅ 설정 완료!")
    print("\n💡 애플리케이션 실행 방법:")
    print("   streamlit run app.py")
    print("\n📝 환경 변수 설정:")
    print("   .env 파일에 OPENAI_API_KEY를 설정하세요")
    print("   또는 .streamlit/secrets.toml 파일을 사용하세요")


if __name__ == "__main__":
    main()
