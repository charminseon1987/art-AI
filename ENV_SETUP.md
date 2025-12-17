# 환경 변수 설정 가이드

## Supabase 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트 생성
2. 프로젝트 설정에서 다음 정보 확인:
   - Project URL (예: `https://ekkvukqgrwvbjeybcmcn.supabase.co`)
   - Anon/Public Key
   - Service Role Key (서버 사이드에서만 사용)

### 2. 데이터베이스 스키마 설정

`supabase_setup.sql` 파일의 내용을 Supabase 대시보드의 SQL Editor에서 실행하세요.

### 3. 환경 변수 설정

#### 프론트엔드 (`.env.local` 또는 `.env`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 백엔드 (`.env`)

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
OPENAI_API_KEY=your-openai-api-key
```

### 4. 초기 관리자 계정 생성

Supabase 대시보드의 Authentication > Users에서 수동으로 사용자를 생성하거나,
다음 SQL을 실행하여 관리자 역할을 부여할 수 있습니다:

```sql
-- 기존 사용자의 역할을 관리자로 변경
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

또는 회원가입 후 Supabase 대시보드에서 직접 역할을 변경할 수 있습니다.

## 역할 설명

- **user**: 일반 사용자 (기본값)
- **supervisor**: 슈퍼바이저 (관리자 페이지 접근 가능)
- **admin**: 관리자 (모든 권한)
