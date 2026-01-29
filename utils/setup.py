"""프로젝트 초기 설정 유틸리티"""
import os


def setup_directories():
    """필요한 디렉토리 생성"""
    directories = [
        "data/reports",
        "data/metadata",
        "prompts/ko",
        ".streamlit"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ 디렉토리 생성: {directory}")


if __name__ == "__main__":
    setup_directories()
    print("\n✅ 프로젝트 설정이 완료되었습니다!")

