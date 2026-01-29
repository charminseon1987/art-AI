# API 서버 실행 가이드

## 환경 설정

### 1. .env 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 다음을 추가하세요:

```env
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. API 서버 실행 방법

#### 방법 1: 스크립트 사용 (권장)

```bash
./start_api.sh
```

#### 방법 2: uv 사용

```bash
uv run python api_server.py
```

#### 방법 3: python3 사용

```bash
python3 api_server.py
```

#### 방법 4: uvicorn 직접 사용

```bash
uv run uvicorn api_server:app --reload --port 8000
```

## 서버 접속

- **API 서버**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
- **헬스 체크**: http://localhost:8000/

## API 엔드포인트

- `POST /api/analyze-image` - 이미지 분석
- `GET /api/reports` - 리포트 목록 조회
- `GET /api/reports/{report_id}` - 특정 리포트 조회
- `POST /api/reports/{report_id}/counseling` - 상담 세션 진행

## 문제 해결

### `python: command not found` 오류

macOS에서는 `python3`를 사용하거나 `uv run python`을 사용하세요.

### `OPENAI_API_KEY가 설정되지 않았습니다` 오류

`.env` 파일에 `OPENAI_API_KEY`를 설정했는지 확인하세요.

### 포트가 이미 사용 중입니다

다른 포트를 사용하려면:

```bash
uv run uvicorn api_server:app --reload --port 8001
```
