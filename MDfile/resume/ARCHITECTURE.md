# 🏗️ 시스템 아키텍처 문서

## 목차
1. [전체 시스템 아키텍처](#전체-시스템-아키텍처)
2. [백엔드 아키텍처](#백엔드-아키텍처)
3. [프론트엔드 아키텍처](#프론트엔드-아키텍처)
4. [데이터 흐름](#데이터-흐름)
5. [에이전트 협업 구조](#에이전트-협업-구조)

---

## 전체 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         사용자 (User)                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Vercel (Frontend Hosting)                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │           Next.js 14 Application                        │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │     │
│  │  │  Pages   │  │ Components│  │   API    │             │     │
│  │  │  (UI)    │  │  (Reuse)  │  │  Routes  │             │     │
│  │  └──────────┘  └──────────┘  └──────────┘             │     │
│  └────────────────────┬───────────────────────────────────┘     │
└───────────────────────┼─────────────────────────────────────────┘
                        │
                        │ REST API (JSON)
                        │ https://backend.railway.app/api/*
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Railway (Backend Hosting)                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │           FastAPI Application                           │     │
│  │  ┌──────────────────────────────────────────────┐      │     │
│  │  │        API Server (api_server.py)             │      │     │
│  │  │  - 엔드포인트 라우팅                            │      │     │
│  │  │  - 요청 검증                                    │      │     │
│  │  │  - CORS 처리                                    │      │     │
│  │  └─────────┬────────────────────────────────────┘      │     │
│  │            │                                             │     │
│  │  ┌─────────▼──────────┐  ┌──────────────┐             │     │
│  │  │   Service Layer     │  │    Models    │             │     │
│  │  │  - AIService        │  │ - ReportData │             │     │
│  │  │  - ImageService     │  │ - ClassWork  │             │     │
│  │  │  - ReportService    │  └──────────────┘             │     │
│  │  │  - CounselingService│                                │     │
│  │  └─────────┬───────────┘                                │     │
│  │            │                                             │     │
│  │  ┌─────────▼──────────────────────────────────────┐    │     │
│  │  │         Agent Layer (CrewAI)                    │    │     │
│  │  │  ┌────────────┐  ┌─────────────┐               │    │     │
│  │  │  │  Agent 1   │  │   Agent 2   │               │    │     │
│  │  │  │ 이미지 관찰 │  │  감정 분석  │               │    │     │
│  │  │  └────────────┘  └─────────────┘               │    │     │
│  │  │  ┌────────────┐  ┌─────────────┐               │    │     │
│  │  │  │  Agent 3   │  │   Agent 4   │               │    │     │
│  │  │  │  질문 생성 │  │ 리포트 작성 │               │    │     │
│  │  │  └────────────┘  └─────────────┘               │    │     │
│  │  └─────────┬───────────────────────────────────────┘   │     │
│  └────────────┼─────────────────────────────────────────────    │
└───────────────┼─────────────────────────────────────────────────┘
                │
                │ OpenAI API
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OpenAI (External Service)                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  GPT-4o-mini API                                        │     │
│  │  - 텍스트 생성                                           │     │
│  │  - 이미지 분석 (Vision)                                 │     │
│  │  - 구조화된 출력                                         │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   File System (Data Storage)                     │
│  data/                                                           │
│  ├── reports/           # 리포트 JSON 파일                       │
│  ├── counseling/        # 상담 세션 데이터                       │
│  └── class_works/       # 수업 작품 데이터                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 백엔드 아키텍처

### 레이어 구조

```
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
│  api_server.py                                           │
│  - 라우팅: @app.post(), @app.get()                       │
│  - 요청 검증: Pydantic                                    │
│  - 응답 형식: JSONResponse                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Service Layer                            │
│  services/                                               │
│  ├── ai_service.py          # AI 분석 총괄               │
│  ├── image_service.py       # 이미지 처리                │
│  ├── report_service.py      # 리포트 CRUD                │
│  ├── counseling_service.py  # 상담 세션                  │
│  ├── class_work_service.py  # 수업 관리                  │
│  └── fingerprint_service.py # 지문 분석                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Agent Layer                              │
│  agents/                                                 │
│  ├── image_observation_agent.py                          │
│  ├── emotional_language_agent.py                         │
│  ├── reflection_question_agent.py                        │
│  ├── report_composer_agent.py                            │
│  ├── conclusion_agent.py                                 │
│  └── fingerprint_analysis_agent.py                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Model Layer                             │
│  models/                                                 │
│  ├── report.py              # ReportData                 │
│  └── class_work.py          # ClassWork                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Data Layer                               │
│  data/                                                   │
│  - JSON 파일로 저장                                       │
│  - 향후 PostgreSQL 마이그레이션 예정                      │
└─────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

#### 1. APIServer (api_server.py)
```python
class FastAPI:
    - CORS 미들웨어
    - 엔드포인트 정의
    - 의존성 주입 (서비스)
```

**주요 엔드포인트**:
- `POST /api/analyze-image` - 그림 분석
- `GET /api/reports` - 리포트 목록
- `POST /api/counseling` - 상담 세션
- `POST /api/analyze-fingerprint` - 지문 분석

#### 2. AIService
```python
class AIService:
    def __init__(self, llm):
        self.llm = llm  # GPT-4o-mini

    def analyze_image(self, description, emotion):
        # 1. 에이전트 초기화
        agents = [observation, emotional, question, composer]

        # 2. CrewAI Crew 생성
        crew = Crew(agents=agents, tasks=tasks)

        # 3. 실행 및 결과 반환
        return crew.kickoff()
```

#### 3. ImageService
```python
class ImageService:
    def process_uploaded_image(self, file):
        # 1. 이미지 리사이징
        # 2. base64 인코딩
        # 3. GPT-4o Vision으로 설명 생성
        # 4. 메타데이터 추출
```

---

## 프론트엔드 아키텍처

### 디렉토리 구조

```
frontend/
├── app/                      # Next.js 14 App Router
│   ├── page.tsx             # 메인 페이지 (/)
│   ├── layout.tsx           # 루트 레이아웃
│   ├── globals.css          # 전역 스타일
│   │
│   ├── admin/               # 관리자 페이지
│   │   └── page.tsx         # /admin
│   │
│   ├── counseling/          # 상담 페이지
│   │   └── page.tsx         # /counseling
│   │
│   ├── class/               # 수업 관리
│   │   ├── page.tsx         # /class
│   │   └── [id]/page.tsx    # /class/:id
│   │
│   ├── fingerprint/         # 지문 분석
│   │   └── page.tsx         # /fingerprint
│   │
│   └── api/                 # API Routes (BFF Pattern)
│       ├── analyze-image/route.ts
│       ├── reports/route.ts
│       ├── counseling/route.ts
│       └── analyze-fingerprint/route.ts
│
├── components/              # 재사용 컴포넌트
│   ├── ImageUploader.tsx
│   ├── ReportViewer.tsx
│   └── ChatInterface.tsx
│
└── lib/                     # 유틸리티
    └── api.ts              # API 클라이언트
```

### 데이터 흐름

```
User Action
    ↓
React Component
    ↓
Next.js API Route (BFF)
    ↓
FastAPI Backend
    ↓
Service Layer
    ↓
Agent Layer
    ↓
OpenAI API
    ↓
← Response (JSON)
    ↓
← React Component Update
    ↓
← UI Re-render
```

---

## 데이터 흐름

### 1. 그림 분석 플로우

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. 이미지 업로드
     ▼
┌─────────────────┐
│ Frontend        │
│ (ImageUploader) │
└────┬────────────┘
     │ 2. FormData 생성
     ▼
┌──────────────────────┐
│ API Route            │
│ /api/analyze-image   │
└────┬─────────────────┘
     │ 3. Proxy to Backend
     ▼
┌──────────────────────┐
│ Backend              │
│ POST /api/analyze    │
└────┬─────────────────┘
     │ 4. ImageService.process()
     ▼
┌──────────────────────┐
│ ImageService         │
│ - 리사이징           │
│ - base64 인코딩      │
└────┬─────────────────┘
     │ 5. OpenAI Vision API
     ▼
┌──────────────────────┐
│ GPT-4o Vision        │
│ - 이미지 설명 생성   │
└────┬─────────────────┘
     │ 6. description 반환
     ▼
┌──────────────────────┐
│ AIService            │
│ - 에이전트 초기화    │
└────┬─────────────────┘
     │ 7. Crew.kickoff()
     ▼
┌──────────────────────┐
│ Agent 1: 이미지 관찰 │
│ - 색상, 형태 분석    │
└────┬─────────────────┘
     │ 8. 결과 → Agent 2
     ▼
┌──────────────────────┐
│ Agent 2: 감정 분석   │
│ - 감정 표현 식별     │
└────┬─────────────────┘
     │ 9. 결과 → Agent 3
     ▼
┌──────────────────────┐
│ Agent 3: 질문 생성   │
│ - 탐색 질문 작성     │
└────┬─────────────────┘
     │ 10. 결과 → Agent 4
     ▼
┌──────────────────────┐
│ Agent 4: 리포트 작성 │
│ - 통합 리포트 생성   │
└────┬─────────────────┘
     │ 11. ReportData
     ▼
┌──────────────────────┐
│ ReportService        │
│ - JSON 파일 저장     │
└────┬─────────────────┘
     │ 12. report_id 반환
     ▼
┌──────────────────────┐
│ Frontend             │
│ - 리포트 표시        │
└──────────────────────┘
```

### 2. 상담 세션 플로우

```
User Message
    ↓
ChatInterface Component
    ↓
POST /api/counseling
    ↓
CounselingService.conduct_counseling()
    ↓
1. 세션 히스토리 로드
2. 컨텍스트 구성
3. GPT-4o API 호출
4. 응답 생성
5. 히스토리 저장
    ↓
← AI Response
    ↓
← ChatInterface Update
```

---

## 에이전트 협업 구조

### CrewAI 협업 패턴

```python
# agents/에서 각 에이전트 정의
Agent 1: ImageObservationAgent
  - Role: 미술 관찰 전문가
  - Goal: 객관적 관찰
  - Backstory: 미술 교육 전문가

Agent 2: EmotionalLanguageAgent
  - Role: 감정 분석가
  - Goal: 감정 표현 식별
  - Backstory: 심리학 전문가

Agent 3: ReflectionQuestionAgent
  - Role: 질문 전문가
  - Goal: 탐색 질문 생성
  - Backstory: 상담 전문가

Agent 4: ReportComposerAgent
  - Role: 리포트 작성자
  - Goal: 통합 리포트
  - Backstory: 미술 치료사
```

### 작업 흐름

```
Task 1: 이미지 관찰
  ↓ output
Task 2: 감정 분석 (Task 1 output 사용)
  ↓ output
Task 3: 질문 생성 (Task 1, 2 output 사용)
  ↓ output
Task 4: 리포트 작성 (모든 output 통합)
  ↓
Final Report (JSON)
```

### Pydantic 출력 스키마

```python
class ReportData(BaseModel):
    report_id: str
    title: str
    observation: str
    emotional_analysis: str
    questions: List[str]
    conclusion: str
    created_at: str
    image_metadata: Dict
```

---

## 배포 아키텍처

```
┌─────────────────────────────────────────────────┐
│              GitHub Repository                   │
│         charminseon1987/art-AI                   │
└────────┬──────────────────────┬─────────────────┘
         │                      │
         │ Git Push             │ Git Push
         │                      │
         ▼                      ▼
┌──────────────────┐   ┌──────────────────────┐
│  Vercel          │   │   Railway            │
│  (Frontend)      │   │   (Backend)          │
│                  │   │                      │
│  - Next.js Build │   │  - Python Install    │
│  - Static Export │   │  - pip install       │
│  - CDN Deploy    │   │  - uvicorn Start     │
└────────┬─────────┘   └──────┬───────────────┘
         │                    │
         │ HTTPS              │ HTTPS
         ▼                    ▼
    Frontend URL         Backend URL
    vercel.app           railway.app
         │                    │
         └────────┬───────────┘
                  │
              CORS 연결
```

---

## 보안 아키텍처

```
┌─────────────────────────────────────────┐
│         Environment Variables            │
│  - Railway: OPENAI_API_KEY               │
│  - Railway: FRONTEND_URL                 │
│  - Vercel: PYTHON_BACKEND_URL            │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         CORS Middleware                  │
│  - allow_origins: [FRONTEND_URL]         │
│  - allow_credentials: True               │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         Admin Authentication             │
│  - utils/auth.py                         │
│  - Token Verification                    │
└─────────────────────────────────────────┘
```

---

## 향후 아키텍처 개선 계획

### 1. 데이터베이스 도입
```
현재: File System (JSON)
개선: PostgreSQL + SQLAlchemy ORM

data/ (파일) → PostgreSQL (테이블)
- reports → reports 테이블
- counseling → sessions 테이블
- users → users 테이블
```

### 2. 캐싱 레이어
```
Redis 도입
- 자주 조회되는 리포트 캐싱
- 세션 데이터 관리
- API 응답 캐싱
```

### 3. 메시지 큐
```
Celery + RabbitMQ
- 비동기 AI 분석 작업
- 백그라운드 작업 처리
- 실패 재시도 로직
```

### 4. 마이크로서비스 분리
```
현재: 모놀리식 백엔드
개선:
- Auth Service
- AI Service
- Report Service
- File Service
```

---

**문서 작성일**: 2024-12-14
**버전**: 1.0.0
