# 미술 수업 & 그림 상담 프론트엔드

Next.js 16과 Tailwind CSS를 사용한 프론트엔드 애플리케이션입니다.

## 기술 스택

- **Next.js 16**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Lucide React**: 아이콘 라이브러리
- **Axios**: HTTP 클라이언트

## 시작하기

### 1. 의존성 설치

```bash
cd frontend
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음을 추가하세요:

```env
PYTHON_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 페이지 구조

- `/` - 홈 페이지 (Hero Section, 신뢰 섹션, 차별점, CTA)
- `/class` - 미술 수업 페이지
- `/counseling` - 그림 상담 (AI) 페이지
  - STEP 1: 그림 업로드
  - STEP 2: 간단 질문 (Chat)
  - STEP 3: AI 그림 관찰 리포트 생성
  - STEP 4: 상담 연결 CTA
- `/consultation` - 상담·수업 안내 페이지
- `/contact` - 문의 페이지

## 백엔드 연동

Python 백엔드 API 서버를 실행해야 합니다:

```bash
# 프로젝트 루트에서
python api_server.py
# 또는
uvicorn api_server:app --reload --port 8000
```

백엔드 API 엔드포인트:
- `POST /api/analyze-image` - 이미지 분석
- `GET /api/reports` - 리포트 목록
- `GET /api/reports/{report_id}` - 리포트 조회
- `POST /api/reports/{report_id}/counseling` - 상담 세션 진행

## 빌드

프로덕션 빌드:

```bash
npm run build
npm start
```

## 주요 기능

- ✅ 반응형 디자인 (모바일/데스크톱)
- ✅ 그림 업로드 및 분석
- ✅ 실시간 채팅 인터페이스
- ✅ 리포트 생성 및 다운로드
- ✅ Python 백엔드 API 연동
