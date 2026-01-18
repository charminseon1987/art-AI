# Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 상단 프로젝트 선택 → 새 프로젝트
3. 프로젝트 이름 입력 (예: "Art AI OAuth")
4. 만들기 클릭

### 1.2 OAuth 동의 화면 구성

1. 왼쪽 메뉴 → API 및 서비스 → OAuth 동의 화면
2. 사용자 유형 선택:
   - **외부**: 일반 사용자용 (대부분의 경우)
   - **내부**: Google Workspace 조직 내부용
3. 앱 정보 입력:
   - 앱 이름: "Art AI" (또는 원하는 이름)
   - 사용자 지원 이메일: 본인 이메일
   - 앱 로고: 선택사항
   - 앱 도메인: 선택사항
   - 개발자 연락처 정보: 본인 이메일
4. 범위 추가 (선택사항):
   - 기본적으로 `email`, `profile`, `openid`가 포함됨
   - 추가 권한이 필요한 경우에만 추가
5. 테스트 사용자 추가 (외부 앱인 경우):
   - 테스트 단계에서는 테스트 사용자만 로그인 가능
   - 본인 이메일 추가
6. 저장 후 계속

### 1.3 OAuth 2.0 클라이언트 ID 생성

1. 왼쪽 메뉴 → API 및 서비스 → 사용자 인증 정보
2. 화면 상단 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. 이름 입력 (예: "Art AI Web Client")
5. 승인된 리디렉션 URI 추가:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   (Supabase 프로젝트의 실제 URL로 변경)
   - 개발 환경용으로 `http://localhost:3000`도 추가 가능 (선택사항)
6. 만들기 클릭
7. **Client ID**와 **Client Secret** 복사 (나중에 다시 볼 수 없으므로 안전하게 보관)

### 1.4 OAuth API 활성화

1. 왼쪽 메뉴 → API 및 서비스 → 라이브러리
2. "Google+ API" 또는 "Identity Toolkit API" 검색
3. 필요시 활성화 (일반적으로 자동 활성화됨)

## 2. Supabase 설정

### 2.1 Google Provider 활성화

1. [Supabase 대시보드](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴 → Authentication → Providers
4. **Google** 찾기 → **Enable** 클릭
5. 다음 정보 입력:
   - **Google Client ID (for OAuth)**: Google Cloud Console에서 복사한 Client ID
   - **Google Client Secret**: Google Cloud Console에서 복사한 Client Secret
6. **Save** 클릭

### 2.2 Redirect URL 확인

- Supabase가 자동으로 생성한 Redirect URL:
  ```
  https://your-project-id.supabase.co/auth/v1/callback
  ```
- 이 URL을 Google Cloud Console의 **승인된 리디렉션 URI**에 등록해야 함
- 정확히 일치해야 하므로 복사해서 사용

## 3. 환경 변수 설정

프로젝트 루트의 `.env` 파일에 다음이 이미 설정되어 있어야 합니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**참고**: Google OAuth는 Supabase를 통해 처리되므로, Google Client ID/Secret은 Supabase 대시보드에만 입력하면 됩니다. 환경 변수에 추가할 필요가 없습니다.

## 4. Google 사용자 ID 확인

Google 로그인 후 사용자 정보에서 Google 사용자 ID를 확인할 수 있습니다:

- `user.user_metadata.provider_id` 또는
- `user.app_metadata.provider_id` 또는
- `user.email` (fallback)

이 값은 `user_usage_limits` 테이블의 `google_id` 필드에 저장됩니다.

## 5. 테스트

### 5.1 개발 환경 테스트

1. Google Cloud Console에서 OAuth 동의 화면이 "테스트" 상태인지 확인
2. 테스트 사용자로 본인 이메일이 추가되어 있는지 확인
3. 이미지 업로드 페이지에서 이미지 선택
4. "Google로 로그인" 버튼 클릭 (또는 자동으로 리다이렉트)
5. Google 로그인 화면에서 로그인
6. 로그인 성공 후 상담 페이지로 리다이렉트되는지 확인

### 5.2 프로덕션 배포

1. Google Cloud Console → OAuth 동의 화면
2. 앱을 검토 제출하여 Google 검토 요청
3. 검토 승인 후 모든 사용자가 로그인 가능
4. 또는 테스트 사용자 목록에 사용자 이메일 추가

## 6. 코드에서 사용하는 방법

### 6.1 Google 로그인 시작

```typescript
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${window.location.origin}/api/auth/google?redirect=/counseling`,
  },
});

if (error) {
  console.error("Google 로그인 오류:", error);
}
```

### 6.2 현재 사용자 확인

```typescript
import { getCurrentUser } from "@/lib/auth";

const user = await getCurrentUser();
if (!user) {
  // 인증되지 않은 경우 Google 로그인으로 리다이렉트
}
```

## 7. 문제 해결

### 7.1 "provider is not enabled" 오류

**원인**: Supabase에서 Google Provider가 활성화되지 않음

**해결**:
1. Supabase 대시보드 → Authentication → Providers
2. Google 찾기 → Enable
3. Client ID와 Client Secret 입력 후 Save

### 7.2 Redirect URI 불일치 오류

**원인**: Google Cloud Console의 Redirect URI와 Supabase의 Redirect URL이 일치하지 않음

**해결**:
- Google Cloud Console의 **승인된 리디렉션 URI**에 다음을 정확히 추가:
  ```
  https://your-project-id.supabase.co/auth/v1/callback
  ```
- 프로토콜(https), 도메인, 경로가 모두 일치해야 함
- Supabase 대시보드의 Redirect URL을 복사해서 사용

### 7.3 "access_denied" 오류

**원인**: 
- OAuth 동의 화면이 테스트 모드이고 사용자가 테스트 사용자 목록에 없음
- 또는 앱이 Google 검토를 통과하지 않음

**해결**:
- 테스트 모드인 경우: OAuth 동의 화면 → 테스트 사용자에 이메일 추가
- 프로덕션 배포: Google 검토 제출 및 승인 대기

### 7.4 "invalid_client" 오류

**원인**: Client ID 또는 Client Secret이 잘못됨

**해결**:
1. Google Cloud Console에서 Client ID와 Client Secret 다시 확인
2. Supabase 대시보드에서 Google Provider 설정 확인
3. 공백이나 특수문자가 포함되지 않았는지 확인

### 7.5 Google 로그인 후 세션이 생성되지 않음

**원인**: API 라우트에서 세션 교환 실패

**해결**:
1. `frontend/app/api/auth/google/route.ts` 파일 확인
2. 브라우저 콘솔에서 에러 메시지 확인
3. Supabase 프로젝트 설정 확인

## 8. 보안 고려사항

1. **Client Secret 보안**:
   - Client Secret은 절대 클라이언트 코드에 노출하지 않음
   - Supabase 대시보드에만 입력
   - Git에 커밋하지 않음

2. **Redirect URI 검증**:
   - Google Cloud Console에서 승인된 URI만 허용
   - 와일드카드 사용 지양

3. **OAuth 동의 화면**:
   - 최소한의 권한만 요청
   - 사용자에게 명확한 권한 설명 제공

4. **HTTPS 사용**:
   - 프로덕션 환경에서는 반드시 HTTPS 사용
   - Google OAuth는 HTTP를 허용하지 않음 (localhost 제외)

## 9. 추가 리소스

- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Supabase Google Provider 설정](https://supabase.com/docs/guides/auth/social-login/auth-google)
