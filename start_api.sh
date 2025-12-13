#!/bin/bash

# API 서버 시작 스크립트
cd "$(dirname "$0")"

# .env 파일 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다."
    echo "📝 .env 파일을 생성하고 OPENAI_API_KEY를 설정해주세요."
    echo ""
    echo "예시:"
    echo "echo 'OPENAI_API_KEY=your-api-key-here' > .env"
    exit 1
fi

# 환경 변수 로드
export $(cat .env | grep -v '^#' | xargs)

# API 서버 실행
echo "🚀 API 서버를 시작합니다..."
echo "📍 서버 주소: http://localhost:8000"
echo "📚 API 문서: http://localhost:8000/docs"
echo ""
uv run python api_server.py

