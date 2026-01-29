# Python 스크립트로 관리자 계정 생성 가이드

## 📋 사전 준비

### 1. 환경 변수 설정 확인

프로젝트 루트에 `.env` 파일이 있는지 확인하고, 다음 환경 변수가 설정되어 있어야 합니다:

```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**환경 변수 확인 방법:**

1. Supabase 대시보드 → Settings → API
2. **Project URL** → `SUPABASE_URL`에 복사
3. **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`에 복사

⚠️ **주의**: `service_role` 키는 절대 공개하지 마세요! 서버 사이드에서만 사용합니다.

---

## 🚀 사용 방법

### 방법 1: 명령줄로 바로 생성 (가장 빠름! ⚡)

이메일과 비밀번호를 명령줄에서 직접 입력하여 생성:

```bash
python utils/admin_account_helper.py create <이메일> <비밀번호> [이름]
```

**예시:**

```bash
# 기본 생성 (이메일, 비밀번호만)
python utils/admin_account_helper.py create admin@example.com Admin123!

# 이름 포함 생성
python utils/admin_account_helper.py create admin@example.com Admin123! 관리자
```

**실행 결과:**

```
📝 새 관리자 계정 생성

계정 생성 중...
  이메일: admin@example.com
  역할: admin

✅ 관리자 계정이 성공적으로 생성되었습니다!
   이메일: admin@example.com
   비밀번호: **********
   역할: admin

이제 이 계정으로 로그인할 수 있습니다.
```

---

### 방법 2: 대화형으로 생성

터미널에서 다음 명령어 실행:

```bash
python utils/admin_account_helper.py create
```

**실행 과정:**

1. **이메일 입력**

   ```
   이메일: admin@example.com
   ```

2. **비밀번호 입력** (화면에 표시되지 않음)

   ```
   비밀번호: ********
   ```

   - 최소 6자 이상 입력
   - 비밀번호는 화면에 표시되지 않습니다 (보안)

3. **이름 입력** (선택사항)

   ```
   이름 (선택사항): 관리자
   ```

4. **결과 확인**

   ```
   ✅ 관리자 계정이 성공적으로 생성되었습니다!
      이메일: admin@example.com
      역할: admin

   이제 이 계정으로 로그인할 수 있습니다.
   ```

**완료!** 이제 생성한 이메일과 비밀번호로 관리자 페이지에 로그인할 수 있습니다.

---

### 방법 3: 명령줄로 기존 계정에 권한 부여

이메일과 역할을 명령줄에서 직접 입력:

```bash
python utils/admin_account_helper.py set-role <이메일> <역할>
```

**예시:**

```bash
# admin 권한 부여
python utils/admin_account_helper.py set-role user@example.com admin

# supervisor 권한 부여
python utils/admin_account_helper.py set-role user@example.com supervisor
```

---

### 방법 4: 대화형으로 기존 계정에 권한 부여

이미 회원가입한 계정이 있다면, 관리자 권한만 부여할 수 있습니다:

```bash
python utils/admin_account_helper.py set-role
```

**실행 과정:**

1. **이메일 입력**

   ```
   이메일: existing-user@example.com
   ```

2. **현재 역할 확인**

   ```
   현재 계정 정보:
     이메일: existing-user@example.com
     이름: 사용자
     현재 역할: user
   ```

3. **역할 선택**

   ```
   부여할 역할을 선택하세요 (admin/supervisor): admin
   ```

4. **결과 확인**
   ```
   ✅ 'existing-user@example.com' 계정의 역할이 'admin'으로 변경되었습니다.
   이제 이 계정으로 관리자 페이지에 접근할 수 있습니다.
   ```

---

### 방법 5: 관리자 계정 목록 확인

현재 등록된 모든 관리자 계정을 확인:

```bash
python utils/admin_account_helper.py list
```

**출력 예시:**

```
🔍 관리자 계정 목록 조회 중...

✅ 총 2개의 관리자 계정을 찾았습니다:

--------------------------------------------------------------------------------
이메일                                    이름                  역할            생성일
--------------------------------------------------------------------------------
admin@example.com                        관리자                admin           2024-01-15
supervisor@example.com                   슈퍼바이저            supervisor      2024-01-10
--------------------------------------------------------------------------------
```

---

## 📝 전체 사용 예시

### 예시 1: 명령줄로 새 관리자 계정 생성 (추천)

```bash
$ python utils/admin_account_helper.py create admin@mycompany.com MySecurePassword123! 최고관리자

📝 새 관리자 계정 생성

계정 생성 중...
  이메일: admin@mycompany.com
  역할: admin

✅ 관리자 계정이 성공적으로 생성되었습니다!
   이메일: admin@mycompany.com
   비밀번호: *********************
   역할: admin

이제 이 계정으로 로그인할 수 있습니다.
```

### 예시 1-2: 대화형으로 새 관리자 계정 생성

```bash
$ python utils/admin_account_helper.py create

📝 새 관리자 계정 생성

이메일: admin@mycompany.com
비밀번호: MySecurePassword123!
이름 (선택사항): 최고관리자

계정 생성 중...

✅ 관리자 계정이 성공적으로 생성되었습니다!
   이메일: admin@mycompany.com
   역할: admin

이제 이 계정으로 로그인할 수 있습니다.
```

### 예시 2: 명령줄로 기존 사용자를 관리자로 승격

```bash
$ python utils/admin_account_helper.py set-role user@mycompany.com admin

🔧 기존 계정에 관리자 권한 부여

권한 부여 중...
  이메일: user@mycompany.com
  역할: admin

✅ 'user@mycompany.com' 계정의 역할이 'admin'으로 변경되었습니다.
이제 이 계정으로 관리자 페이지에 접근할 수 있습니다.
```

### 예시 2-2: 대화형으로 기존 사용자를 관리자로 승격

```bash
$ python utils/admin_account_helper.py set-role

🔧 기존 계정에 관리자 권한 부여

이메일: user@mycompany.com

권한 부여 중...

현재 계정 정보:
  이메일: user@mycompany.com
  이름: 일반사용자
  현재 역할: user

부여할 역할을 선택하세요 (admin/supervisor): admin

✅ 'user@mycompany.com' 계정의 역할이 'admin'으로 변경되었습니다.
이제 이 계정으로 관리자 페이지에 접근할 수 있습니다.
```

---

## ❌ 오류 해결

### 오류 1: 환경 변수가 설정되지 않았습니다

```
❌ 오류: 환경 변수가 설정되지 않았습니다.
다음 환경 변수를 설정하세요:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
```

**해결 방법:**

1. 프로젝트 루트에 `.env` 파일 생성
2. Supabase 대시보드에서 URL과 Service Role Key 복사
3. `.env` 파일에 추가:
   ```bash
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 오류 2: 계정 생성에 실패했습니다

```
❌ 오류 발생: User already registered
계정 생성에 실패했습니다. 이메일이 이미 사용 중일 수 있습니다.
```

**해결 방법:**

- 다른 이메일 사용
- 또는 `set-role` 명령어로 기존 계정에 권한 부여

### 오류 3: 비밀번호는 최소 6자 이상이어야 합니다

```
❌ 비밀번호는 최소 6자 이상이어야 합니다.
```

**해결 방법:**

- 6자 이상의 비밀번호 입력

### 오류 4: Supabase 연결 실패

```
❌ 오류 발생: Connection error
Supabase 연결을 확인하세요.
```

**해결 방법:**

1. `.env` 파일의 `SUPABASE_URL` 확인
2. 인터넷 연결 확인
3. Supabase 프로젝트가 활성화되어 있는지 확인

---

## 🔐 보안 권장사항

1. **강력한 비밀번호 사용**

   - 최소 12자 이상
   - 대소문자, 숫자, 특수문자 포함
   - 예: `MyAdmin@2024!Secure`

2. **Service Role Key 보호**

   - `.env` 파일을 `.gitignore`에 추가
   - 절대 GitHub에 업로드하지 않기
   - 프로덕션 환경에서는 환경 변수로 설정

3. **정기적인 계정 확인**

   ```bash
   python utils/admin_account_helper.py list
   ```

4. **불필요한 관리자 계정 제거**
   - Supabase 대시보드에서 삭제
   - 또는 SQL로 역할 변경:
     ```sql
     UPDATE profiles SET role = 'user' WHERE email = 'old-admin@example.com';
     ```

---

## 📚 추가 명령어

### 도움말 보기

```bash
python utils/admin_account_helper.py
```

**출력:**

```
관리자 계정 확인 및 복구 유틸리티

사용법:
    python utils/admin_account_helper.py list          # 모든 관리자 계정 목록 확인
    python utils/admin_account_helper.py create        # 새 관리자 계정 생성
    python utils/admin_account_helper.py set-role      # 기존 계정에 관리자 권한 부여

사용 가능한 명령어:
  list       - 모든 관리자 계정 목록 확인
  create     - 새 관리자 계정 생성
  set-role   - 기존 계정에 관리자 권한 부여
```

---

## ✅ 체크리스트

관리자 계정 생성 전 확인사항:

- [ ] `.env` 파일에 `SUPABASE_URL` 설정됨
- [ ] `.env` 파일에 `SUPABASE_SERVICE_ROLE_KEY` 설정됨
- [ ] Supabase 프로젝트가 활성화되어 있음
- [ ] `supabase_setup.sql`이 실행되어 `profiles` 테이블이 생성됨
- [ ] Python 환경에 `supabase-py` 패키지 설치됨

---

## 🎯 빠른 시작

1. **환경 변수 설정**

   ```bash
   # .env 파일 생성
   echo "SUPABASE_URL=https://your-project.supabase.co" >> .env
   echo "SUPABASE_SERVICE_ROLE_KEY=your-key" >> .env
   ```

2. **관리자 계정 생성**

   ```bash
   python utils/admin_account_helper.py create
   ```

3. **확인**

   ```bash
   python utils/admin_account_helper.py list
   ```

4. **로그인**
   - 관리자 페이지: `/admin/login`
   - 생성한 이메일과 비밀번호로 로그인

---

## 💡 팁

- **여러 관리자 계정 생성**: `create` 명령어를 여러 번 실행
- **일괄 권한 부여**: SQL Editor에서 실행:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email IN ('admin1@example.com', 'admin2@example.com');
  ```
- **비밀번호 변경**: Supabase 대시보드 → Authentication → Users에서 변경
