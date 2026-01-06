# Supabase OAuth를 사용한 카카오 인증 가이드

## 개요

이 프로젝트는 Supabase의 OAuth 기능을 사용하여 카카오 로그인을 구현합니다. Supabase는 OAuth 프로바이더와의 통합을 자동으로 처리하므로, 직접 OAuth 플로우를 구현할 필요가 없습니다.

## 작동 원리

### 1. 인증 플로우

```
사용자 클릭 → Supabase signInWithOAuth() 호출 → 카카오 로그인 페이지 →
카카오 인증 완료 → Supabase 콜백 URL로 리다이렉트 →
exchangeCodeForSession()로 세션 생성 → 앱으로 리다이렉트
```

### 2. 코드 구조

#### 프론트엔드 (`frontend/lib/supabase.ts`)

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
```

#### 카카오 로그인 시작 (`frontend/components/ImageUpload.tsx`)

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "kakao",
  options: {
    redirectTo: `${window.location.origin}/api/auth/kakao?redirect=/counseling`,
  },
});
```

#### 카카오 인증 콜백 처리 (`frontend/app/api/auth/kakao/route.ts`)

```typescript
// 1. 카카오에서 받은 코드로 세션 교환
const { data, error } = await supabase.auth.exchangeCodeForSession(code);

// 2. 카카오 사용자 ID 추출
const kakaoId =
  data.user.user_metadata?.provider_id ||
  data.user.app_metadata?.provider_id ||
  data.user.user_metadata?.kakao_account?.id;

// 3. user_usage_limits 테이블에 카카오 ID 저장
await supabase.from("user_usage_limits").insert({
  user_id: data.user.id,
  kakao_id: kakaoId.toString(),
  image_analysis_count: 0,
  fingerprint_analysis_count: 0,
});
```

## 설정 방법

### 1. 카카오 개발자 콘솔 설정

1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 → 애플리케이션 추가하기
3. 앱 설정 → 플랫폼 → Web 플랫폼 등록
   - 개발: `http://localhost:3000`
   - 프로덕션: 실제 도메인
4. 제품 설정 → 카카오 로그인 → 활성화 설정: ON
5. Redirect URI 등록:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   (Supabase 프로젝트의 실제 URL로 변경)
6. 앱 설정 → 앱 키에서 **REST API 키** 복사
7. 제품 설정 → 카카오 로그인 → 보안에서 **Client Secret** 생성

### 2. Supabase 설정

1. Supabase 대시보드 → Authentication → Providers
2. Kakao 찾기 → Enable
3. 다음 정보 입력:
   - **Kakao Client ID (REST API 키)**: 카카오 개발자 콘솔에서 복사한 REST API 키
   - **Kakao Client Secret**: 카카오 개발자 콘솔에서 생성한 Client Secret
4. Save 클릭

### 3. 환경 변수 설정

프로젝트 루트의 `.env` 파일:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 사용 방법

### 1. 카카오 로그인 시작

```typescript
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: "kakao",
  options: {
    redirectTo: `${window.location.origin}/api/auth/kakao?redirect=/fingerprint`,
  },
});
```

### 2. 현재 사용자 확인

```typescript
import { getCurrentUser } from "@/lib/auth";

const user = await getCurrentUser();
if (!user) {
  // 인증되지 않은 경우 카카오 로그인으로 리다이렉트
}
```

### 3. 세션 토큰 가져오기

```typescript
import { getSessionToken } from "@/lib/auth";

const token = await getSessionToken();
// API 호출 시 Authorization 헤더에 사용
headers["Authorization"] = `Bearer ${token}`;
```

## 카카오 사용자 ID 추출

카카오 로그인 후 사용자 정보에서 카카오 사용자 ID를 추출할 수 있습니다:

```typescript
const kakaoId =
  data.user.user_metadata?.provider_id ||
  data.user.app_metadata?.provider_id ||
  data.user.user_metadata?.kakao_account?.id;
```

이 값은 `user_usage_limits` 테이블의 `kakao_id` 필드에 저장되어 사용 횟수 제한에 사용됩니다.

## 사용 횟수 제한

카카오 ID당 2회까지 분석 가능:

- 그림 분석: `image_analysis_count` 필드로 관리
- 지문 분석: `fingerprint_analysis_count` 필드로 관리

사용 횟수 초과 시:

- 백엔드 API에서 403 에러 반환
- 프론트엔드에서 상담 예약 안내 표시

## 문제 해결

### Redirect URI 불일치 오류

- 카카오 개발자 콘솔의 Redirect URI와 Supabase의 Redirect URL이 정확히 일치해야 합니다
- 프로토콜(https), 도메인, 경로가 모두 일치해야 합니다
- Supabase 콜백 URL: `https://your-project-id.supabase.co/auth/v1/callback`

### 카카오 로그인 실패

- REST API 키와 Client Secret이 올바른지 확인
- 카카오 개발자 콘솔에서 앱 상태가 "운영중"인지 확인
- Supabase Provider 설정에서 Kakao가 활성화되어 있는지 확인

### 카카오 ID가 null인 경우

- Supabase에서 카카오 사용자 정보가 제대로 저장되지 않았을 수 있습니다
- `user_metadata` 또는 `app_metadata`에서 카카오 ID를 확인하세요
- 필요시 Supabase 대시보드에서 사용자 정보를 확인하세요

## 참고 자료

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Supabase OAuth 가이드](https://supabase.com/docs/guides/auth/social-login/auth-kakao)
- [카카오 개발자 문서](https://developers.kakao.com/docs)
