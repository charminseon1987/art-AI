# 🛠️ 기술 스택 (Tech Stack)

## 목차
1. [기술 스택 개요](#기술-스택-개요)
2. [백엔드](#백엔드)
3. [프론트엔드](#프론트엔드)
4. [AI/ML](#aiml)
5. [인프라 & DevOps](#인프라--devops)
6. [개발 도구](#개발-도구)
7. [외부 서비스](#외부-서비스)

---

## 기술 스택 개요

### 전체 스택 다이어그램

```
┌────────────────────────────────────────────────────────┐
│                     Frontend                            │
│  Next.js 14 + React 18 + TypeScript + Tailwind CSS    │
└────────────────────┬───────────────────────────────────┘
                     │ REST API (JSON)
                     ▼
┌────────────────────────────────────────────────────────┐
│                     Backend                             │
│  FastAPI + Python 3.12 + CrewAI + OpenAI              │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│                Infrastructure                           │
│  Railway (Backend) + Vercel (Frontend) + GitHub        │
└────────────────────────────────────────────────────────┘
```

---

## 백엔드

### Core Framework

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|-----------|
| **Python** | 3.12 | 메인 언어 | AI/ML 라이브러리 생태계, 타입 힌팅 지원 |
| **FastAPI** | 0.109.0+ | 웹 프레임워크 | 비동기 처리, 자동 API 문서, 고성능 |
| **Uvicorn** | 0.27.0+ | ASGI 서버 | FastAPI 표준 서버, 비동기 지원 |
| **Pydantic** | 2.5.0+ | 데이터 검증 | 타입 안전성, 자동 검증, FastAPI 통합 |

### AI/ML Stack

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|-----------|
| **CrewAI** | 0.80.0+ | 멀티 에이전트 프레임워크 | Role-based Agent, Task 관리, 협업 시스템 |
| **OpenAI** | 1.12.0+ | LLM API | GPT-4o-mini, Vision API, 구조화된 출력 |
| **LangChain** | - | AI 체인 관리 | OpenAI 통합, 프롬프트 관리 |
| **LiteLLM** | 1.0.0+ | LLM 통합 | 다양한 LLM 통합 가능 (확장성) |

### Data Processing

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|-----------|
| **Pandas** | 2.0.0+ | 데이터 처리 | 데이터 분석 및 변환 |
| **Pillow** | 10.0.0+ | 이미지 처리 | 리사이징, 포맷 변환, 메타데이터 추출 |
| **ReportLab** | 4.0.0+ | PDF 생성 | 리포트 PDF 다운로드 |

### Additional Tools

| 기술 | 버전 | 용도 |
|------|------|------|
| **python-dotenv** | 1.0.0+ | 환경 변수 관리 |
| **aiofiles** | 25.1.0+ | 비동기 파일 처리 |
| **python-multipart** | 0.0.6+ | 파일 업로드 처리 |
| **PyYAML** | 6.0.1+ | 설정 파일 관리 |

---

## 프론트엔드

### Core Framework

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|-----------|
| **Next.js** | 16.0.0 | React 프레임워크 | App Router, SSR/SSG, API Routes, 최적화 |
| **React** | 18.3.1 | UI 라이브러리 | 컴포넌트 기반, Virtual DOM, 생태계 |
| **TypeScript** | 5.x | 타입 시스템 | 타입 안전성, 개발 생산성, 유지보수성 |

### Styling & UI

| 기술 | 버전 | 용도 | 선택 이유 |
|------|------|------|-----------|
| **Tailwind CSS** | 3.4.1+ | CSS 프레임워크 | 유틸리티 퍼스트, 빠른 개발, 일관성 |
| **PostCSS** | 8.4.38+ | CSS 처리 | Tailwind 전처리 |
| **Autoprefixer** | 10.4.19+ | CSS 호환성 | 브라우저 접두사 자동 추가 |

### Additional Libraries

| 기술 | 버전 | 용도 |
|------|------|------|
| **Axios** | 1.6.7+ | HTTP 클라이언트 |
| **Lucide React** | 0.344.0+ | 아이콘 라이브러리 |

---

## AI/ML

### LLM 모델

| 모델 | 용도 | 비용 | 특징 |
|------|------|------|------|
| **GPT-4o-mini** | 텍스트 생성 | 저렴 | 빠른 응답, 비용 효율적 |
| **GPT-4o Vision** | 이미지 분석 | 중간 | 이미지 이해, 설명 생성 |

### CrewAI 에이전트

```python
# agents/ 구조
Agent 1: ImageObservationAgent
  - LLM: GPT-4o-mini
  - Role: 미술 관찰 전문가
  - Task: 객관적 관찰

Agent 2: EmotionalLanguageAgent
  - LLM: GPT-4o-mini
  - Role: 감정 분석가
  - Task: 감정 표현 식별

Agent 3: ReflectionQuestionAgent
  - LLM: GPT-4o-mini
  - Role: 질문 생성 전문가
  - Task: 탐색 질문 생성

Agent 4: ReportComposerAgent
  - LLM: GPT-4o-mini
  - Role: 리포트 작성자
  - Task: 통합 리포트 작성

Agent 5: ConclusionAgent
  - LLM: GPT-4o-mini
  - Role: 종합 분석가
  - Task: 최종 결론 도출

Agent 6: FingerprintAnalysisAgent
  - LLM: GPT-4o Vision
  - Role: 지문 분석 전문가
  - Task: 지문 패턴 인식
```

---

## 인프라 & DevOps

### 배포 플랫폼

| 서비스 | 용도 | 플랜 | 특징 |
|--------|------|------|------|
| **Railway** | 백엔드 호스팅 | Hobby ($5/월) | 자동 배포, 환경 변수, 로그 |
| **Vercel** | 프론트엔드 호스팅 | Free | CDN, 자동 배포, 최적화 |

### CI/CD

```yaml
Git Push → GitHub → Railway/Vercel → 자동 배포

Railway:
  - 트리거: Git Push (develop branch)
  - 빌드: pip install -r requirements.txt
  - 실행: uvicorn api_server:app --host 0.0.0.0 --port $PORT

Vercel:
  - 트리거: Git Push (develop branch)
  - 빌드: npm run build (Next.js)
  - 배포: Static Export + CDN
```

### 환경 변수 관리

```bash
# Railway (Backend)
OPENAI_API_KEY=sk-...
SERPER_API_KEY=...
GOOGLE_MAPS_API_KEY=...
FIRECRAWL_API_KEY=...
OpenWeather=...
ExchangeRate-API=...
FRONTEND_URL=https://art-ai.vercel.app

# Vercel (Frontend)
PYTHON_BACKEND_URL=https://art-ai.railway.app
```

---

## 개발 도구

### 패키지 관리

| 도구 | 용도 | 특징 |
|------|------|------|
| **uv** | Python 패키지 관리 | 빠른 설치, 의존성 관리 |
| **npm** | Node.js 패키지 관리 | Frontend 라이브러리 |

### 버전 관리

| 도구 | 용도 |
|------|------|
| **Git** | 소스 코드 버전 관리 |
| **GitHub** | 원격 저장소, 협업 |

### 개발 환경

```bash
# Python Virtual Environment
.venv/
python3.12 -m venv .venv
source .venv/bin/activate

# Node.js Environment
frontend/node_modules/
npm install
```

---

## 외부 서비스

### API 서비스

| 서비스 | 용도 | API Key 필요 |
|--------|------|-------------|
| **OpenAI API** | GPT-4o, Vision | ✅ |
| **Serper API** | 웹 검색 | ✅ |
| **Google Maps API** | 위치 검색 | ✅ |
| **Firecrawl API** | 웹 스크래핑 | ✅ |
| **OpenWeather** | 날씨 정보 | ✅ |
| **ExchangeRate API** | 환율 조회 | ✅ |

---

## 파일 구조

### 백엔드 디렉토리 구조

```
art-AI/
├── agents/                    # AI 에이전트
│   ├── image_observation_agent.py
│   ├── emotional_language_agent.py
│   ├── reflection_question_agent.py
│   ├── report_composer_agent.py
│   ├── conclusion_agent.py
│   └── fingerprint_analysis_agent.py
│
├── services/                  # 비즈니스 로직
│   ├── ai_service.py
│   ├── image_service.py
│   ├── report_service.py
│   ├── counseling_service.py
│   ├── class_work_service.py
│   ├── fingerprint_service.py
│   ├── admin_report_service.py
│   ├── simple_report_service.py
│   └── scraping_service.py
│
├── models/                    # 데이터 모델
│   ├── report.py
│   └── class_work.py
│
├── utils/                     # 유틸리티
│   ├── setup.py
│   └── auth.py
│
├── data/                      # 데이터 저장
│   ├── reports/
│   ├── counseling/
│   └── class_works/
│
├── api_server.py              # FastAPI 서버
├── app.py                     # Streamlit 앱
├── main.py                    # 진입점
├── requirements.txt           # Python 의존성
├── Procfile                   # Railway 설정
├── railway.json               # Railway 설정
├── runtime.txt                # Python 버전
└── .env                       # 환경 변수 (gitignore)
```

### 프론트엔드 디렉토리 구조

```
frontend/
├── app/                       # Next.js App Router
│   ├── page.tsx              # 메인 페이지
│   ├── layout.tsx            # 루트 레이아웃
│   ├── globals.css           # 전역 스타일
│   ├── admin/                # 관리자 페이지
│   ├── counseling/           # 상담 페이지
│   ├── class/                # 수업 관리
│   ├── fingerprint/          # 지문 분석
│   └── api/                  # API Routes
│
├── components/               # 재사용 컴포넌트
│
├── lib/                      # 유틸리티
│
├── public/                   # 정적 파일
│
├── package.json              # Node.js 의존성
├── tsconfig.json             # TypeScript 설정
├── tailwind.config.ts        # Tailwind 설정
├── next.config.js            # Next.js 설정
└── .env.local                # 환경 변수 (gitignore)
```

---

## 의존성 버전 관리

### requirements.txt (Backend)

```txt
# Core
crewai>=0.80.0
crewai-tools>=0.1.0
openai>=1.12.0
litellm>=1.0.0
langchain-openai>=0.1.0

# Web Framework
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
streamlit>=1.28.0

# Data
pandas>=2.0.0
pydantic>=2.5.0
python-dotenv>=1.0.0

# Image/PDF
pillow>=10.0.0
reportlab>=4.0.0

# Scraping
beautifulsoup4>=4.12.0
playwright>=1.40.0
firecrawl-py>=2.16.3

# APIs
googlemaps>=4.10.0
requests>=2.31.0
```

### package.json (Frontend)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next": "^16.0.0",
    "typescript": "^5",
    "tailwindcss": "^3.4.1",
    "axios": "^1.6.7",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "eslint": "^9",
    "eslint-config-next": "^16.0.0",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18"
  }
}
```

---

## 성능 최적화

### 백엔드 최적화

| 기법 | 구현 | 효과 |
|------|------|------|
| **비동기 처리** | FastAPI async/await | API 호출 블로킹 제거 |
| **이미지 리사이징** | Pillow thumbnail | 업로드 시간 70% 단축 |
| **Pydantic 검증** | BaseModel | 런타임 에러 사전 방지 |

### 프론트엔드 최적화

| 기법 | 구현 | 효과 |
|------|------|------|
| **SSR/SSG** | Next.js App Router | 초기 로딩 속도 개선 |
| **코드 스플리팅** | Next.js Dynamic Import | 번들 크기 감소 |
| **Tailwind JIT** | Just-In-Time Mode | CSS 크기 최소화 |
| **Vercel CDN** | 자동 배포 | 글로벌 응답 시간 단축 |

---

## 보안

### 백엔드 보안

| 기법 | 구현 | 목적 |
|------|------|------|
| **CORS** | CORSMiddleware | 도메인 접근 제어 |
| **환경 변수** | .env 파일 | API 키 보호 |
| **토큰 검증** | utils/auth.py | 관리자 인증 |

### 프론트엔드 보안

| 기법 | 구현 | 목적 |
|------|------|------|
| **환경 변수** | .env.local | API URL 보호 |
| **HTTPS** | Vercel 자동 | 통신 암호화 |

---

## 비용 분석

### 월간 예상 비용

| 서비스 | 플랜 | 비용 | 용도 |
|--------|------|------|------|
| Railway | Hobby | $5 | 백엔드 호스팅 |
| Vercel | Free | $0 | 프론트엔드 호스팅 |
| OpenAI API | Pay-as-you-go | ~$10-20 | GPT-4o-mini 호출 |
| **합계** | | **$15-25/월** | |

### 비용 최적화 전략

1. **GPT-4o-mini 사용**: GPT-4 대비 10배 저렴
2. **캐싱**: 반복 요청 최소화
3. **무료 티어**: Vercel Free 플랜 활용

---

## 향후 기술 스택 확장 계획

### 단기 (1-3개월)

- [ ] **PostgreSQL**: 파일 시스템 → 데이터베이스 마이그레이션
- [ ] **Redis**: 캐싱 레이어 추가
- [ ] **Sentry**: 에러 추적 및 모니터링

### 중기 (3-6개월)

- [ ] **Docker**: 컨테이너화
- [ ] **Kubernetes**: 오케스트레이션
- [ ] **GraphQL**: REST API 대안

### 장기 (6개월+)

- [ ] **WebSocket**: 실시간 통신
- [ ] **Celery**: 백그라운드 작업 큐
- [ ] **Elasticsearch**: 전문 검색

---

**문서 작성일**: 2024-12-14
**버전**: 1.0.0
