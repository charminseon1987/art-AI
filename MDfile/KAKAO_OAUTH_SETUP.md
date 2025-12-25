# 카카오 OAuth 설정 가이드

## 1. 카카오 개발자 콘솔 설정

### 1.1 앱 등록
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 → 애플리케이션 추가하기
3. 앱 이름, 사업자명 입력 후 저장

### 1.2 플랫폼 설정
1. 앱 설정 → 플랫폼 → Web 플랫폼 등록
2. 사이트 도메인 등록:
   - 개발: `http://localhost:3000`
   - 프로덕션: 실제 도메인 (예: `https://yourdomain.com`)

### 1.3 카카오 로그인 활성화
1. 제품 설정 → 카카오 로그인 → 활성화 설정: ON
2. Redirect URI 등록:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   (Supabase 프로젝트의 실제 URL로 변경)

### 1.4 동의 항목 설정
1. 제품 설정 → 카카오 로그인 → 동의항목
2. 필수 동의 항목:
   - 카카오계정(이메일) (선택)
   - 닉네임 (선택)
3. 선택 동의 항목:
   - 카카오계정(이메일) (필요시)

### 1.5 REST API 키 확인
1. 앱 설정 → 앱 키
2. **REST API 키** 복사 (Client ID로 사용)
3. 제품 설정 → 카카오 로그인 → 보안
4. **Client Secret** 생성 및 복사

## 2. Supabase 설정

### 2.1 카카오 Provider 활성화
1. Supabase 대시보드 → Authentication → Providers
2. Kakao 찾기 → Enable
3. 다음 정보 입력:
   - **Kakao Client ID (REST API 키)**: 카카오 개발자 콘솔에서 복사한 REST API 키
   - **Kakao Client Secret**: 카카오 개발자 콘솔에서 생성한 Client Secret
4. Save 클릭

### 2.2 Redirect URL 확인
- Supabase가 자동으로 생성한 Redirect URL:
  ```
  https://your-project-id.supabase.co/auth/v1/callback
  ```
- 이 URL을 카카오 개발자 콘솔의 Redirect URI에 등록해야 함

## 3. 환경 변수 설정

프로젝트 루트의 `.env` 파일에 다음이 이미 설정되어 있어야 합니다:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. 카카오 사용자 ID 확인

카카오 로그인 후 사용자 정보에서 카카오 사용자 ID를 확인할 수 있습니다:
- `user.user_metadata.provider_id` 또는
- `user.app_metadata.provider_id`

이 값은 `user_usage_limits` 테이블의 `kakao_id` 필드에 저장됩니다.

## 5. 테스트

1. 로그인 페이지에서 "카카오로 로그인" 버튼 클릭
2. 카카오 로그인 화면에서 로그인
3. 로그인 성공 후 관리자 페이지로 리다이렉트되는지 확인
4. 사용 횟수 제한이 정상 작동하는지 확인

## 문제 해결

### Redirect URI 불일치 오류
- 카카오 개발자 콘솔의 Redirect URI와 Supabase의 Redirect URL이 정확히 일치해야 합니다
- 프로토콜(https), 도메인, 경로가 모두 일치해야 합니다

### 카카오 로그인 실패
- REST API 키와 Client Secret이 올바른지 확인
- 카카오 개발자 콘솔에서 앱 상태가 "운영중"인지 확인
- Supabase Provider 설정에서 Kakao가 활성화되어 있는지 확인

