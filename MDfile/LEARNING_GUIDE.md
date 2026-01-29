# 📚 주니어 개발자 학습 가이드

> 이 프로젝트를 통해 배울 수 있는 모든 것

---

## 목차
1. [학습 로드맵](#학습-로드맵)
2. [레벨별 학습 가이드](#레벨별-학습-가이드)
3. [핵심 개념 설명](#핵심-개념-설명)
4. [실습 과제](#실습-과제)
5. [자주 하는 실수와 해결법](#자주-하는-실수와-해결법)
6. [추가 학습 자료](#추가-학습-자료)

---

## 학습 로드맵

### 전체 학습 경로

```
레벨 1 (1-2주) → 레벨 2 (2-3주) → 레벨 3 (3-4주) → 레벨 4 (4주+)
  기초 이해      백엔드 구축       프론트엔드        배포 & 최적화
```

### 레벨별 학습 목표

| 레벨 | 학습 목표 | 예상 시간 |
|------|-----------|----------|
| **레벨 1** | 프로젝트 구조 이해, 로컬 실행 | 1-2주 |
| **레벨 2** | 백엔드 로직 이해, API 개발 | 2-3주 |
| **레벨 3** | 프론트엔드 개발, UI/UX | 3-4주 |
| **레벨 4** | 배포, 최적화, 확장 | 4주+ |

---

## 레벨별 학습 가이드

### 📖 레벨 1: 프로젝트 이해하기 (1-2주)

#### 학습 목표
- 프로젝트 전체 구조 파악
- 로컬 환경에서 실행
- Git 사용법 익히기

#### 1단계: 환경 설정 (1일)

**필수 설치**:
```bash
# 1. Python 3.12 설치
https://www.python.org/downloads/

# 2. Node.js 설치
https://nodejs.org/

# 3. Git 설치
https://git-scm.com/

# 4. uv 설치 (Python 패키지 관리자)
pip install uv
```

**프로젝트 클론**:
```bash
git clone https://github.com/charminseon1987/art-AI.git
cd art-AI
```

#### 2단계: 백엔드 실행 (1-2일)

```bash
# 1. 가상환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. 의존성 설치
uv sync
# 또는
pip install -r requirements.txt

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 OpenAI API 키 입력

# 4. 서버 실행
python api_server.py
```

**확인**:
- 브라우저에서 `http://localhost:8000/docs` 접속
- API 문서가 보이면 성공!

#### 3단계: 프론트엔드 실행 (1-2일)

```bash
# 1. frontend 디렉토리로 이동
cd frontend

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에서 PYTHON_BACKEND_URL 확인

# 4. 개발 서버 실행
npm run dev
```

**확인**:
- 브라우저에서 `http://localhost:3000` 접속
- UI가 보이면 성공!

#### 4단계: 코드 탐색 (3-4일)

**읽어야 할 파일 순서**:

1. **README.md** - 프로젝트 개요
2. **ARCHITECTURE.md** - 시스템 구조
3. **api_server.py** - API 엔드포인트
4. **services/ai_service.py** - AI 로직
5. **agents/image_observation_agent.py** - 에이전트 예시
6. **frontend/app/page.tsx** - 프론트엔드 메인 페이지

**학습 체크리스트**:
- [ ] 프로젝트 디렉토리 구조 이해
- [ ] 백엔드-프론트엔드 통신 흐름 파악
- [ ] 환경 변수 역할 이해
- [ ] Git 기본 명령어 사용 가능

---

### 🔧 레벨 2: 백엔드 개발 (2-3주)

#### 학습 목표
- FastAPI로 REST API 개발
- CrewAI 멀티 에이전트 이해
- 데이터 모델링 (Pydantic)

#### 1단계: FastAPI 기초 (1주)

**학습 주제**:
1. **FastAPI 기본**
   ```python
   from fastapi import FastAPI

   app = FastAPI()

   @app.get("/")
   def read_root():
       return {"message": "Hello World"}
   ```

2. **경로 매개변수**
   ```python
   @app.get("/items/{item_id}")
   def read_item(item_id: int):
       return {"item_id": item_id}
   ```

3. **쿼리 매개변수**
   ```python
   @app.get("/items/")
   def read_items(skip: int = 0, limit: int = 10):
       return {"skip": skip, "limit": limit}
   ```

4. **요청 본문 (Pydantic)**
   ```python
   from pydantic import BaseModel

   class Item(BaseModel):
       name: str
       price: float

   @app.post("/items/")
   def create_item(item: Item):
       return item
   ```

**실습 과제**:
- [ ] 간단한 TODO API 만들기 (CRUD)
- [ ] Pydantic 모델로 데이터 검증
- [ ] FastAPI 자동 문서 (/docs) 활용

**참고 자료**:
- [FastAPI 공식 튜토리얼](https://fastapi.tiangolo.com/tutorial/)

#### 2단계: CrewAI 멀티 에이전트 (1주)

**학습 주제**:
1. **Agent 생성**
   ```python
   from crewai import Agent

   agent = Agent(
       role="미술 관찰 전문가",
       goal="그림을 객관적으로 관찰하고 설명한다",
       backstory="20년 경력의 미술 교육 전문가",
       llm=llm
   )
   ```

2. **Task 정의**
   ```python
   from crewai import Task

   task = Task(
       description="그림의 색상, 형태, 구성을 분석하세요",
       agent=agent,
       expected_output="객관적 관찰 결과"
   )
   ```

3. **Crew 실행**
   ```python
   from crewai import Crew

   crew = Crew(
       agents=[agent1, agent2],
       tasks=[task1, task2],
       process=Process.sequential
   )

   result = crew.kickoff()
   ```

**실습 과제**:
- [ ] 간단한 2-agent 시스템 구현
- [ ] Sequential vs Hierarchical 차이 이해
- [ ] `agents/` 코드 분석

**참고 자료**:
- [CrewAI 문서](https://docs.crewai.com/)

#### 3단계: 서비스 레이어 패턴 (1주)

**학습 주제**:

**왜 Service Layer가 필요한가?**
```python
# 나쁜 예: API에 모든 로직
@app.post("/analyze")
async def analyze(file: UploadFile):
    # 이미지 처리
    img = Image.open(file)
    img.thumbnail((1024, 1024))

    # AI 분석
    agent = Agent(...)
    result = crew.kickoff()

    # 저장
    with open("report.json", "w") as f:
        json.dump(result, f)

    return result
```

```python
# 좋은 예: Service Layer로 분리
@app.post("/analyze")
async def analyze(file: UploadFile):
    # 서비스에 위임
    result = ai_service.analyze_image(file)
    return result
```

**Service Layer 패턴**:
```python
# services/ai_service.py
class AIService:
    def __init__(self, llm):
        self.llm = llm

    def analyze_image(self, file):
        # 1. 이미지 처리
        image_data = self.image_service.process(file)

        # 2. AI 분석
        result = self._run_agents(image_data)

        # 3. 저장
        self.report_service.save(result)

        return result
```

**실습 과제**:
- [ ] 간단한 UserService 만들기
- [ ] API Layer와 Service Layer 분리
- [ ] `services/` 코드 분석

---

### 🎨 레벨 3: 프론트엔드 개발 (3-4주)

#### 학습 목표
- Next.js 14 App Router
- React 컴포넌트 설계
- TypeScript 타입 시스템

#### 1단계: React 기초 (1주)

**학습 주제**:

1. **컴포넌트**
   ```tsx
   // 함수형 컴포넌트
   function Button({ text, onClick }) {
     return <button onClick={onClick}>{text}</button>
   }
   ```

2. **State**
   ```tsx
   import { useState } from 'react'

   function Counter() {
     const [count, setCount] = useState(0)

     return (
       <div>
         <p>Count: {count}</p>
         <button onClick={() => setCount(count + 1)}>
           증가
         </button>
       </div>
     )
   }
   ```

3. **Effect**
   ```tsx
   import { useEffect } from 'react'

   function DataFetcher() {
     const [data, setData] = useState(null)

     useEffect(() => {
       fetch('/api/data')
         .then(res => res.json())
         .then(setData)
     }, []) // 빈 배열 = 컴포넌트 마운트 시 1회 실행

     return <div>{JSON.stringify(data)}</div>
   }
   ```

**실습 과제**:
- [ ] 간단한 카운터 앱
- [ ] TODO 리스트 앱
- [ ] API 호출하여 데이터 표시

**참고 자료**:
- [React 공식 문서](https://react.dev/)

#### 2단계: Next.js App Router (1주)

**학습 주제**:

1. **파일 기반 라우팅**
   ```
   app/
   ├── page.tsx           → /
   ├── about/
   │   └── page.tsx       → /about
   └── posts/
       ├── page.tsx       → /posts
       └── [id]/
           └── page.tsx   → /posts/:id
   ```

2. **Server Components vs Client Components**
   ```tsx
   // Server Component (기본)
   async function Page() {
     const data = await fetch('...')
     return <div>{data}</div>
   }

   // Client Component (상호작용 필요)
   'use client'

   import { useState } from 'react'

   function Interactive() {
     const [state, setState] = useState(0)
     return <button onClick={() => setState(state + 1)}>
       {state}
     </button>
   }
   ```

3. **API Routes**
   ```tsx
   // app/api/hello/route.ts
   export async function GET(request: Request) {
     return Response.json({ message: 'Hello' })
   }
   ```

**실습 과제**:
- [ ] 블로그 앱 만들기 (목록 + 상세)
- [ ] API Route로 데이터 제공
- [ ] `frontend/app/` 코드 분석

**참고 자료**:
- [Next.js 공식 문서](https://nextjs.org/docs)

#### 3단계: TypeScript (1-2주)

**학습 주제**:

1. **기본 타입**
   ```typescript
   let name: string = "Alice"
   let age: number = 25
   let isStudent: boolean = true
   let hobbies: string[] = ["reading", "coding"]
   ```

2. **인터페이스**
   ```typescript
   interface User {
     id: number
     name: string
     email: string
   }

   const user: User = {
     id: 1,
     name: "Alice",
     email: "alice@example.com"
   }
   ```

3. **제네릭**
   ```typescript
   function identity<T>(arg: T): T {
     return arg
   }

   const num = identity<number>(42)
   const str = identity<string>("hello")
   ```

**실습 과제**:
- [ ] 기존 JavaScript 코드를 TypeScript로 변환
- [ ] API 응답 타입 정의
- [ ] `frontend/` 타입 분석

**참고 자료**:
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/handbook/intro.html)

---

### 🚀 레벨 4: 배포 & 최적화 (4주+)

#### 학습 목표
- Railway, Vercel 배포
- 성능 최적화
- 모니터링 & 에러 추적

#### 1단계: 배포 (1주)

**학습 주제**:

1. **Railway 배포**
   - `DEPLOYMENT.md` 참고
   - 환경 변수 설정
   - 로그 확인

2. **Vercel 배포**
   - GitHub 연동
   - 자동 배포
   - 도메인 설정

**실습 과제**:
- [ ] Railway에 백엔드 배포
- [ ] Vercel에 프론트엔드 배포
- [ ] 두 서비스 연결

#### 2단계: 성능 최적화 (1-2주)

**학습 주제**:

1. **백엔드 최적화**
   ```python
   # 비동기 처리
   @app.post("/analyze")
   async def analyze(file: UploadFile):
       contents = await file.read()  # 비동기 I/O
       ...
   ```

2. **프론트엔드 최적화**
   ```tsx
   // 코드 스플리팅
   import dynamic from 'next/dynamic'

   const HeavyComponent = dynamic(() => import('./Heavy'))
   ```

3. **이미지 최적화**
   ```tsx
   // Next.js Image 컴포넌트
   import Image from 'next/image'

   <Image
     src="/image.jpg"
     width={500}
     height={300}
     alt="Description"
   />
   ```

**실습 과제**:
- [ ] 성능 측정 (Lighthouse)
- [ ] 최적화 적용
- [ ] 개선 효과 측정

#### 3단계: 모니터링 (1주)

**학습 주제**:

1. **로그 확인**
   - Railway Logs
   - Vercel Logs

2. **에러 추적**
   - Sentry 연동 (선택)

3. **성능 모니터링**
   - Vercel Analytics

---

## 핵심 개념 설명

### 1. RESTful API

**정의**: HTTP 프로토콜을 사용하여 자원을 CRUD하는 아키텍처

**HTTP 메서드**:
- `GET`: 조회
- `POST`: 생성
- `PUT`: 전체 수정
- `PATCH`: 부분 수정
- `DELETE`: 삭제

**예시**:
```python
GET    /api/reports        # 모든 리포트 조회
GET    /api/reports/123    # ID=123 리포트 조회
POST   /api/reports        # 새 리포트 생성
PUT    /api/reports/123    # ID=123 리포트 전체 수정
DELETE /api/reports/123    # ID=123 리포트 삭제
```

### 2. 비동기 프로그래밍

**정의**: I/O 작업 시 블로킹 없이 다른 작업 수행

**동기 vs 비동기**:
```python
# 동기 (블로킹)
def fetch_data():
    response = requests.get(url)  # 응답 대기 중 블로킹
    return response.json()

# 비동기 (논블로킹)
async def fetch_data():
    response = await httpx.get(url)  # 대기 중 다른 작업 가능
    return response.json()
```

### 3. 컴포넌트 기반 아키텍처

**정의**: UI를 재사용 가능한 독립적 부품으로 분리

**예시**:
```tsx
// 재사용 가능한 Button 컴포넌트
function Button({ children, onClick }) {
  return (
    <button
      className="bg-blue-500 text-white px-4 py-2"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// 사용
<Button onClick={handleClick}>클릭</Button>
```

### 4. 환경 변수

**정의**: 실행 환경에 따라 달라지는 설정값

**왜 필요한가?**
- API 키 보호 (Git에 커밋하지 않음)
- 환경별 설정 분리 (개발/프로덕션)

**사용법**:
```bash
# .env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...

# Python
import os
api_key = os.getenv("OPENAI_API_KEY")

# Next.js
const backendUrl = process.env.PYTHON_BACKEND_URL
```

---

## 실습 과제

### 과제 1: 새로운 에이전트 추가 (중급)

**목표**: 색상 분석 전문 에이전트 만들기

**요구사항**:
1. `agents/color_analysis_agent.py` 파일 생성
2. 색상 심리학 기반 분석
3. `AIService`에 통합
4. 리포트에 색상 분석 섹션 추가

**힌트**:
```python
class ColorAnalysisAgent:
    def create_agent(self):
        return Agent(
            role="색상 심리학 전문가",
            goal="그림의 색상을 분석하고 심리적 의미 해석",
            backstory="...",
            llm=self.llm
        )
```

### 과제 2: 리포트 필터링 API (초급)

**목표**: 날짜별로 리포트 필터링하는 API 추가

**요구사항**:
```python
GET /api/reports?date=2024-12-14
```

**힌트**:
```python
@app.get("/api/reports")
async def get_reports(date: Optional[str] = None):
    if date:
        # 날짜로 필터링
        ...
    else:
        # 모든 리포트
        ...
```

### 과제 3: 리포트 공유 기능 (고급)

**목표**: 리포트를 공유할 수 있는 공개 링크 생성

**요구사항**:
1. 공유 토큰 생성 API
2. 토큰으로 리포트 조회 (인증 불필요)
3. 프론트엔드에 "공유" 버튼 추가

---

## 자주 하는 실수와 해결법

### 실수 1: CORS 에러

**증상**:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**원인**: 프론트엔드와 백엔드 도메인이 다를 때

**해결**:
```python
# api_server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 실수 2: 환경 변수 미설정

**증상**:
```
ValueError: OPENAI_API_KEY가 설정되지 않았습니다
```

**해결**:
```bash
# .env 파일 생성
OPENAI_API_KEY=your-key-here

# 확인
echo $OPENAI_API_KEY
```

### 실수 3: 비동기 함수 동기 호출

**증상**:
```
RuntimeWarning: coroutine '...' was never awaited
```

**해결**:
```python
# 잘못된 예
result = async_function()  # ❌

# 올바른 예
result = await async_function()  # ✅
```

### 실수 4: Pydantic 모델 검증 실패

**증상**:
```
pydantic.ValidationError: 1 validation error for User
  name
    field required
```

**해결**:
```python
# 모델 정의 확인
class User(BaseModel):
    name: str  # 필수 필드

# 옵션 필드로 변경
class User(BaseModel):
    name: Optional[str] = None
```

---

## 추가 학습 자료

### 공식 문서
- [Python 공식 문서](https://docs.python.org/3/)
- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [CrewAI 문서](https://docs.crewai.com/)
- [React 문서](https://react.dev/)
- [Next.js 문서](https://nextjs.org/docs)
- [TypeScript 문서](https://www.typescriptlang.org/docs/)

### 유튜브 강의
- [FastAPI 튜토리얼 (영문)](https://www.youtube.com/watch?v=tLKKmouUams)
- [Next.js 13+ 강의 (한글)](https://www.youtube.com/watch?v=...)
- [CrewAI 소개](https://www.youtube.com/watch?v=...)

### 책
- "FastAPI 웹 개발" - Sebastian Ramirez
- "리액트를 다루는 기술" - 김민준
- "파이썬 코딩의 기술" - Brett Slatkin

### 커뮤니티
- [FastAPI Discord](https://discord.gg/fastapi)
- [React 한국 사용자 그룹](https://www.facebook.com/groups/react.ko/)
- [Python 한국 사용자 모임](https://www.facebook.com/groups/pythonkorea/)

---

## 학습 팁

### 1. 작은 것부터 시작
- 전체 프로젝트를 한 번에 이해하려 하지 마세요
- 하나의 파일, 하나의 함수부터 시작
- 이해한 것을 주석으로 적어보세요

### 2. 직접 코드 작성
- 복사-붙여넣기 대신 직접 타이핑
- 에러를 만나면 직접 해결해보기
- 작은 변형을 시도해보기

### 3. 문서화 습관
- 배운 것을 정리하는 습관
- README 작성 연습
- 주석 달기 연습

### 4. 코드 리뷰
- 다른 사람의 코드 읽기
- 오픈소스 프로젝트 참여
- 코드 리뷰 요청하기

---

**행운을 빕니다! 💪**

궁금한 점이 있으면 GitHub Issues에 질문해주세요.
