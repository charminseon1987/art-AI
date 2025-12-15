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

# 환경 변수 로드 (공백과 특수문자 처리)
# .env 파일을 읽어서 올바른 형식으로 변환 후 export
while IFS= read -r line || [ -n "$line" ]; do
  # 주석과 빈 줄 제외
  line_trimmed=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  if [[ "$line_trimmed" =~ ^# ]] || [[ -z "$line_trimmed" ]]; then
    continue
  fi
  
  # 등호 앞뒤 공백 제거
  # KEY = "VALUE" -> KEY="VALUE"
  cleaned=$(echo "$line_trimmed" | sed 's/[[:space:]]*=[[:space:]]*/=/' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  
  # 변수명에 하이픈이 있으면 언더스코어로 변경 (export에서 문제 방지)
  if [[ "$cleaned" =~ ^([^=]+)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
    # 하이픈을 언더스코어로 변경
    key="${key//-/_}"
    # 따옴표 제거
    value="${value#\"}"
    value="${value%\"}"
    value="${value#\'}"
    value="${value%\'}"
    # export
    export "$key=$value"
  fi
done < .env

# API 서버 실행
echo "🚀 API 서버를 시작합니다..."
echo "📍 서버 주소: http://localhost:8000"
echo "📚 API 문서: http://localhost:8000/docs"
echo ""
uv run python api_server.py

