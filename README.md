# 🎨 AI 그림 상담 에이전트

유저가 그림을 업로드하면 AI가 관찰·질문·구조화를 통해 상담용 리포트를 자동 생성하는 웹 애플리케이션입니다.

## 🎯 핵심 기능

**"유저가 그림을 업로드 → AI가 '해석 아닌 관찰·질문·구조화' → 상담용 리포트 자동 생성"**

### 주요 특징

- ✅ 그림 업로드 및 AI 분석
- ✅ 4개의 전문 AI 에이전트 협업 분석
- ✅ 상담용 리포트 자동 생성
- ✅ 리포트 다운로드 (Markdown, PDF)
- ✅ 상담사 코멘트 추가 기능

## 🤖 AI 에이전트 구조

### Agent A. Image Observation Agent (핵심)

- 그림을 객관적으로 관찰하고 구조화된 정보 추출
- 색상, 형태, 구성, 세부사항 분석

### Agent B. Emotional Language Agent

- 그림에서 나타나는 감정적 표현과 상징 분석
- 감정적 톤과 강도 수준 식별

### Agent C. Reflection Question Agent

- 상담을 위한 반성 질문 생성
- 개방적이고 탐색적인 질문 제공

### Agent D. Report Composer Agent

- 모든 분석 결과를 종합하여 상담용 리포트 작성
- 구조화된 리포트 생성

## 📋 MVP 기능 목록

### 사용자 기능

- ✅ 그림 업로드
- ✅ 간단 감정 선택 (선택사항)
- ✅ 리포트 보기 / 다운로드

### AI 기능

- ✅ 이미지 분석
- ✅ 질문 생성
- ✅ 리포트 자동 생성

### 관리자/상담사 기능

- ✅ 리포트 수정
- ✅ 코멘트 추가

## 🚀 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
uv sync

# 또는 pip 사용 시
pip install -e .
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 OpenAI API 키를 설정하세요:

```bash
cp .env.example .env
# .env 파일을 열어서 OPENAI_API_KEY를 설정하세요
```

또는 Streamlit secrets를 사용할 수 있습니다:

- `.streamlit/secrets.toml` 파일 생성
- `OPENAI_API_KEY = "your_key_here"` 추가

### 3. 애플리케이션 실행

```bash
# API 서버 실행
./start.sh

# 또는 직접 실행
uvicorn api_server:app --reload
```

브라우저에서 `http://localhost:8000`로 접속하세요.

## 📁 프로젝트 구조

```
art-AI/
├── agents/              # AI 에이전트들
│   ├── image_observation_agent.py
│   ├── emotional_language_agent.py
│   ├── reflection_question_agent.py
│   └── report_composer_agent.py
├── models/              # 데이터 모델
│   ├── report.py
│   ├── class_work.py
│   └── contact.py
├── services/            # 비즈니스 로직
│   ├── image_service.py
│   ├── ai_service.py
│   ├── report_service.py
│   └── ...
├── frontend/            # Next.js 프론트엔드
├── api_server.py        # FastAPI 서버
├── app.py              # Streamlit 메인 앱
├── main.py             # 진입점
├── pyproject.toml      # 프로젝트 설정
└── README.md
```

## 🔧 기술 스택

- **프레임워크**: CrewAI (멀티 에이전트 시스템)
- **LLM**: OpenAI GPT-4o-mini
- **웹 프레임워크**: FastAPI, Next.js
- **이미지 처리**: Pillow
- **PDF 생성**: ReportLab
- **데이터 모델**: Pydantic

## 💡 사용 방법

1. **그림 업로드**: 메인 페이지에서 그림 파일을 업로드하세요 (PNG, JPG, JPEG 지원)
2. **감정 선택** (선택사항): 현재 감정을 선택하면 더 정확한 분석이 가능합니다
3. **분석 시작**: "분석 시작" 버튼을 클릭하면 AI가 그림을 분석합니다
4. **리포트 확인**: 생성된 리포트를 확인하고 다운로드할 수 있습니다
5. **상담사 모드**: 관리자 모드에서 리포트에 코멘트를 추가할 수 있습니다

## 🔒 보안 및 개인정보

- **그림 저장 안 함**: 그림 자체는 저장되지 않으며, 메타데이터만 저장됩니다
- **보안**: API 키는 환경 변수로 관리하며, `.env` 파일은 `.gitignore`에 포함되어 있습니다

## 📊 수익 모델 가능성

- 1회 그림 리포트
- 상담 전 사전 리포트
- 부모용 리포트 옵션
- 상담사 B2B 툴 라이선스

## 🎯 핵심 철학

이 기능의 성공 포인트는:

> **AI가 '말을 대신'하지 않고**  
> **👉 '말이 나오게 만드는 구조'를 제공한다**

AI는 해석이나 진단을 하지 않고, 객관적인 관찰과 구조화를 통해 상담의 시작점을 제공합니다.

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🤝 기여

이슈와 풀 리퀘스트를 환영합니다!
