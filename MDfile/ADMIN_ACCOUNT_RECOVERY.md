# 관리자 계정 복구 가이드

관리자 로그인 아이디와 비밀번호를 잊어버린 경우 다음 방법으로 복구할 수 있습니다.

## 방법 1: Supabase 대시보드에서 비밀번호 재설정 (권장)

### 1단계: Supabase 대시보드 접속
1. [Supabase 대시보드](https://app.supabase.com/)에 로그인
2. 해당 프로젝트 선택

### 2단계: 관리자 계정 확인
1. 왼쪽 메뉴에서 **Authentication** → **Users** 클릭
2. 등록된 사용자 목록에서 관리자 계정 이메일 확인
   - `role`이 `admin` 또는 `supervisor`인 계정 찾기
   - 또는 `profiles` 테이블에서 확인

### 3단계: 비밀번호 재설정
1. 사용자 목록에서 관리자 계정 클릭
2. **"Send password reset email"** 버튼 클릭
3. 등록된 이메일로 비밀번호 재설정 링크가 전송됨
4. 이메일의 링크를 클릭하여 새 비밀번호 설정

### 4단계: SQL로 직접 확인 및 수정
Supabase 대시보드의 **SQL Editor**에서 다음 쿼리 실행:

```sql
-- 모든 사용자 이메일과 역할 확인
SELECT email, role, name, created_at
FROM profiles
WHERE role IN ('admin', 'supervisor')
ORDER BY created_at DESC;
```

이 쿼리로 관리자 계정의 이메일을 확인할 수 있습니다.

## 방법 2: 새 관리자 계정 생성

기존 계정을 찾을 수 없는 경우, 새 계정을 생성하고 관리자 권한을 부여할 수 있습니다.

### 1단계: 일반 계정으로 회원가입
1. 관리자 로그인 페이지(`/admin/login`) 접속
2. **"계정이 없으신가요? 회원가입"** 클릭
3. 이메일, 비밀번호, 이름 입력 후 회원가입

### 2단계: 관리자 권한 부여
Supabase 대시보드의 **SQL Editor**에서 다음 쿼리 실행:

```sql
-- 새로 생성한 계정의 이메일로 관리자 권한 부여
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

또는 Supabase 대시보드에서:
1. **Authentication** → **Users** → 해당 사용자 클릭
2. **User Metadata** 섹션에서 `role`을 `admin`으로 수정
3. **profiles** 테이블에서도 동일하게 수정

## 방법 3: 비밀번호 직접 변경 (Supabase SQL)

Supabase의 Service Role Key를 사용하여 비밀번호를 직접 변경할 수 있습니다.

**주의**: 이 방법은 Service Role Key가 필요하며, 보안상 주의가 필요합니다.

```sql
-- 이 방법은 직접 사용할 수 없습니다.
-- Supabase Auth API를 통해 비밀번호를 변경해야 합니다.
```

대신 Supabase 대시보드의 **Authentication** → **Users**에서 직접 비밀번호를 재설정하세요.

## 방법 4: 기존 계정 확인 (프로필 테이블 조회)

Supabase 대시보드의 **SQL Editor**에서 실행:

```sql
-- 모든 사용자 정보 확인
SELECT 
  p.email,
  p.name,
  p.role,
  p.created_at,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;
```

## 문제 해결

### "관리자 또는 슈퍼바이저 권한이 필요합니다" 오류
- 계정의 `role`이 `admin` 또는 `supervisor`인지 확인
- Supabase 대시보드에서 `profiles` 테이블의 `role` 컬럼 확인

### 비밀번호 재설정 이메일이 오지 않는 경우
1. 스팸 폴더 확인
2. Supabase 대시보드 → **Settings** → **Auth** → **Email Templates** 확인
3. 이메일 서비스 설정 확인

### 계정이 전혀 없는 경우
1. 회원가입으로 새 계정 생성
2. 위의 "방법 2"를 따라 관리자 권한 부여

## 보안 권장사항

1. **강력한 비밀번호 사용**: 최소 12자 이상, 대소문자, 숫자, 특수문자 포함
2. **이메일 확인**: 관리자 계정은 반드시 이메일 인증 완료
3. **2단계 인증**: 가능하면 Supabase에서 2FA 활성화
4. **정기적인 비밀번호 변경**: 보안을 위해 주기적으로 변경

## 빠른 참조

### 관리자 계정 확인 SQL
```sql
SELECT email, role FROM profiles WHERE role IN ('admin', 'supervisor');
```

### 관리자 권한 부여 SQL
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 역할 변경 SQL
```sql
-- supervisor로 변경
UPDATE profiles SET role = 'supervisor' WHERE email = 'your-email@example.com';

-- admin으로 변경
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

