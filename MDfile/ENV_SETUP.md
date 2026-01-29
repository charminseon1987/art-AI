# 환경 변수 설정 가이드

## 문제 해결: "placeholder.supabase.co" 오류

`placeholder.supabase.co`에 연결할 수 없다는 오류가 발생하는 경우, Supabase 환경 변수가 설정되지 않았기 때문입니다.

## 해결 방법

### 1. 프론트엔드 환경 변수 설정

`frontend` 디렉토리에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase 프로젝트 URL
# Supabase 대시보드 → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anon Key (공개 키)
# Supabase 대시보드 → Settings → API → Project API keys → anon public
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Python 백엔드 URL (선택사항)
# 개발 환경: http://localhost:8000
# 프로덕션: 실제 백엔드 URL
NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:8000
```

### 2. Supabase 프로젝트 정보 확인

1. [Supabase 대시보드](https://app.supabase.com/)에 로그인
2. 프로젝트 선택
3. Settings → API 메뉴로 이동
4. 다음 정보를 복사:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 사용
   - **anon public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용

### 3. 백엔드 환경 변수 설정 (선택사항)

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# Supabase 설정
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI API 키
OPENAI_API_KEY=your-openai-api-key

# 프론트엔드 URL (CORS 설정용)
FRONTEND_URL=http://localhost:3000
```

**주의**: `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용하세요. 절대 프론트엔드에 노출하지 마세요!

### 4. 환경 변수 적용

환경 변수를 변경한 후:

1. **프론트엔드**: 개발 서버를 재시작하세요

   ```bash
   cd frontend
   npm run dev
   ```

2. **백엔드**: Python 서버를 재시작하세요
   ```bash
   python api_server.py
   ```

## 환경 변수 확인

환경 변수가 제대로 설정되었는지 확인하려면:

1. 브라우저 콘솔을 열고 (F12)
2. 다음 명령어 실행:
   ```javascript
   console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
   ```
3. `undefined`가 아닌 실제 URL이 표시되어야 합니다

## 문제 해결

### 환경 변수가 적용되지 않는 경우

1. `.env.local` 파일이 `frontend` 디렉토리에 있는지 확인
2. 파일 이름이 정확히 `.env.local`인지 확인 (`.env.local.txt` 아님)
3. 개발 서버를 완전히 재시작 (Ctrl+C로 종료 후 다시 시작)
4. 브라우저 캐시를 지우고 하드 리프레시 (Ctrl+Shift+R)

### 여전히 "placeholder.supabase.co" 오류가 발생하는 경우

1. 브라우저 콘솔에서 환경 변수 확인
2. `.env.local` 파일의 내용이 올바른지 확인
3. 환경 변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필수)
4. Supabase 프로젝트 URL이 올바른지 확인

## 보안 주의사항

- `.env.local` 파일은 `.gitignore`에 추가되어 있어야 합니다
- 절대 공개 저장소에 환경 변수를 커밋하지 마세요
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 프론트엔드에 사용하지 마세요
