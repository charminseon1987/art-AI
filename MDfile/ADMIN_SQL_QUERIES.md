# Supabase 관리자 계정 생성 및 관리 SQL 쿼리

## ⚠️ 중요 사항

**비밀번호는 SQL로 직접 생성할 수 없습니다.** Supabase Auth는 비밀번호를 해시화하여 저장하므로, 사용자 생성은 다음 중 하나의 방법을 사용해야 합니다:

1. Supabase 대시보드 → Authentication → Users에서 수동 생성
2. Python 스크립트 사용 (`utils/admin_account_helper.py`)
3. 회원가입 API 사용

SQL은 **기존 사용자에게 관리자 권한을 부여**하는 용도로만 사용할 수 있습니다.

---

## 1. 기존 사용자에 관리자 권한 부여

### 기본 쿼리

```sql
-- 이메일로 관리자 권한 부여
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

### 여러 사용자에게 한 번에 권한 부여

```sql
-- 여러 이메일에 관리자 권한 부여
UPDATE profiles
SET role = 'admin'
WHERE email IN ('admin1@example.com', 'admin2@example.com', 'admin3@example.com');
```

### Supervisor 권한 부여

```sql
-- Supervisor 권한 부여
UPDATE profiles
SET role = 'supervisor'
WHERE email = 'supervisor@example.com';
```

---

## 2. 관리자 계정 확인 및 조회

### 모든 관리자 계정 목록

```sql
-- 모든 관리자 및 슈퍼바이저 계정 조회
SELECT
  p.email,
  p.name,
  p.role,
  p.created_at,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.role IN ('admin', 'supervisor')
ORDER BY p.created_at DESC;
```

### 특정 이메일의 관리자 여부 확인

```sql
-- 특정 이메일의 역할 확인
SELECT
  email,
  name,
  role,
  created_at
FROM profiles
WHERE email = 'admin@example.com';
```

### 관리자 계정 개수 확인

```sql
-- 관리자 계정 개수
SELECT
  role,
  COUNT(*) as count
FROM profiles
WHERE role IN ('admin', 'supervisor')
GROUP BY role;
```

---

## 3. 역할 변경

### Admin으로 변경

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'user@example.com';
```

### Supervisor로 변경

```sql
UPDATE profiles
SET role = 'supervisor'
WHERE email = 'user@example.com';
```

### 일반 사용자로 변경 (권한 제거)

```sql
UPDATE profiles
SET role = 'user'
WHERE email = 'admin@example.com';
```

---

## 4. 사용자 및 프로필 정보 조회

### 모든 사용자 정보 조회

```sql
SELECT
  p.id,
  p.email,
  p.name,
  p.role,
  p.created_at,
  p.updated_at,
  au.email_confirmed_at,
  au.last_sign_in_at,
  au.confirmed_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;
```

### 특정 역할의 모든 사용자 조회

```sql
-- Admin 역할 사용자만 조회
SELECT email, name, role, created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;
```

---

## 5. 관리자 계정 삭제 (주의!)

### 프로필만 삭제 (auth.users는 유지)

```sql
-- 프로필 삭제 (사용자 인증 정보는 유지됨)
DELETE FROM profiles
WHERE email = 'admin@example.com';
```

### 완전 삭제는 Supabase 대시보드에서

**주의**: `auth.users` 테이블에서 직접 삭제하는 것은 권장되지 않습니다.
Supabase 대시보드 → Authentication → Users에서 삭제하세요.

---

## 6. 빠른 관리자 계정 생성 워크플로우

### Step 1: 사용자 생성 (Supabase 대시보드)

1. Supabase 대시보드 → Authentication → Users
2. "Add user" 클릭
3. 이메일과 비밀번호 입력
4. "Auto Confirm User" 체크
5. 생성

### Step 2: 관리자 권한 부여 (SQL Editor)

```sql
-- 방금 생성한 이메일로 관리자 권한 부여
UPDATE profiles
SET role = 'admin'
WHERE email = '생성한이메일@example.com';

-- 확인
SELECT email, name, role
FROM profiles
WHERE email = '생성한이메일@example.com';
```

---

## 7. 유용한 유틸리티 쿼리

### 최근 생성된 관리자 계정

```sql
SELECT email, name, role, created_at
FROM profiles
WHERE role IN ('admin', 'supervisor')
ORDER BY created_at DESC
LIMIT 10;
```

### 활성 관리자 계정 (최근 로그인)

```sql
SELECT
  p.email,
  p.name,
  p.role,
  au.last_sign_in_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.role IN ('admin', 'supervisor')
  AND au.last_sign_in_at IS NOT NULL
ORDER BY au.last_sign_in_at DESC;
```

### 역할별 사용자 통계

```sql
SELECT
  role,
  COUNT(*) as user_count,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d
FROM profiles
GROUP BY role
ORDER BY user_count DESC;
```

---

## 8. 문제 해결 쿼리

### 프로필이 없는 사용자 찾기

```sql
-- auth.users에는 있지만 profiles에는 없는 사용자
SELECT
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

### 프로필 생성 (누락된 경우)

```sql
-- 누락된 프로필 수동 생성
INSERT INTO profiles (id, email, name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', ''),
  COALESCE(raw_user_meta_data->>'role', 'user')
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

### 중복 이메일 확인

```sql
-- 중복된 이메일 찾기
SELECT email, COUNT(*) as count
FROM profiles
GROUP BY email
HAVING COUNT(*) > 1;
```

---

## 9. 보안 체크 쿼리

### 이메일 인증이 안 된 관리자 계정

```sql
SELECT
  p.email,
  p.name,
  p.role,
  au.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.role IN ('admin', 'supervisor')
  AND au.email_confirmed_at IS NULL;
```

### 오래된 관리자 계정 (비활성)

```sql
SELECT
  p.email,
  p.name,
  p.role,
  au.last_sign_in_at,
  NOW() - au.last_sign_in_at as days_since_login
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.role IN ('admin', 'supervisor')
  AND au.last_sign_in_at < NOW() - INTERVAL '90 days';
```

---

## 10. 실전 예제

### 시나리오 1: 새 관리자 계정 생성

```sql
-- 1. 사용자는 이미 Supabase 대시보드에서 생성됨
-- 2. 관리자 권한 부여
UPDATE profiles
SET role = 'admin'
WHERE email = 'newadmin@example.com';

-- 3. 확인
SELECT email, role, created_at
FROM profiles
WHERE email = 'newadmin@example.com';
```

### 시나리오 2: 기존 사용자를 관리자로 승격

```sql
-- 1. 현재 역할 확인
SELECT email, role FROM profiles WHERE email = 'user@example.com';

-- 2. 관리자로 승격
UPDATE profiles
SET role = 'admin'
WHERE email = 'user@example.com';

-- 3. 확인
SELECT email, role FROM profiles WHERE email = 'user@example.com';
```

### 시나리오 3: 관리자 권한 일괄 변경

```sql
-- 모든 supervisor를 admin으로 변경
UPDATE profiles
SET role = 'admin'
WHERE role = 'supervisor';

-- 확인
SELECT role, COUNT(*) FROM profiles GROUP BY role;
```

---

## 📝 참고사항

1. **RLS (Row Level Security)**: `profiles` 테이블은 RLS가 활성화되어 있지만, Service Role Key를 사용하는 SQL Editor에서는 모든 쿼리가 실행됩니다.

2. **트리거**: `handle_new_user()` 트리거가 있어서 `auth.users`에 사용자가 생성되면 자동으로 `profiles` 테이블에 레코드가 생성됩니다.

3. **권한**: SQL Editor에서 실행하는 쿼리는 Service Role 권한으로 실행되므로 모든 제약을 우회합니다.

4. **백업**: 중요한 변경 전에는 항상 백업을 권장합니다.
