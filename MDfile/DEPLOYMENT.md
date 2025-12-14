# 🚀 배포 가이드 - Vercel (프론트엔드) + Railway (백엔드)

이 가이드는 AI 그림 상담 애플리케이션을 Vercel과 Railway를 사용하여 배포하는 방법을 설명합니다.

## 📋 배포 전 체크리스트

- [ ] OpenAI API 키 준비
- [ ] Railway 계정 생성 (https://railway.app/)
- [ ] Vercel 계정 생성 (https://vercel.com/)
- [ ] GitHub 저장소에 코드 푸시

---

## 🔧 1단계: 백엔드 배포 (Railway)

### 1.1 Railway 프로젝트 생성

1. **Railway 로그인**
   ```
   https://railway.app/
   ```

2. **New Project 클릭**
   - "Deploy from GitHub repo" 선택
   - 저장소 선택: `art-AI`
   - 루트 디렉토리 선택

3. **환경 변수 설정**

   Railway 대시보드에서 **Variables** 탭으로 이동하여 다음 환경 변수를 추가:

   ```bash
   OPENAI_API_KEY=your-actual-openai-key
   SERPER_API_KEY=your-serper-key
   GOOGLE_MAPS_API_KEY=your-google-maps-key
   FIRECRAWL_API_KEY=your-firecrawl-key
   OpenWeather=your-openweather-key
   ExchangeRate-API=your-exchange-rate-key
   FRONTEND_URL=https://your-app.vercel.app  # 나중에 업데이트
   ```

   ⚠️ **중요**: `.env` 파일의 키를 직접 복사하세요!

### 1.2 배포 설정 확인

Railway는 다음 파일들을 자동으로 감지합니다:
- ✅ `requirements.txt` - Python 의존성
- ✅ `Procfile` - 실행 명령어
- ✅ `runtime.txt` - Python 버전

배포가 자동으로 시작됩니다!

### 1.3 배포 URL 확인

1. Railway 대시보드에서 **Settings** 탭으로 이동
2. **Generate Domain** 클릭
3. 생성된 URL 복사 (예: `https://art-ai-backend-production.up.railway.app`)

### 1.4 백엔드 테스트

브라우저에서 접속:
```
https://your-backend-url.railway.app/docs
```

FastAPI 문서가 보이면 성공!

---

## 🎨 2단계: 프론트엔드 배포 (Vercel)

### 2.1 Vercel 프로젝트 생성

1. **Vercel 로그인**
   ```
   https://vercel.com/
   ```

2. **New Project 클릭**
   - GitHub 저장소 선택: `art-AI`
   - Framework Preset: **Next.js** (자동 감지)
   - Root Directory: `frontend` 선택

### 2.2 환경 변수 설정

**Important: Environment Variables** 섹션에서:

```bash
PYTHON_BACKEND_URL=https://your-backend-url.railway.app
```

⚠️ **1단계에서 복사한 Railway URL을 사용하세요!**

### 2.3 배포

1. **Deploy** 버튼 클릭
2. 빌드가 완료될 때까지 대기 (약 2-3분)
3. 배포 완료 후 URL 확인 (예: `https://art-ai.vercel.app`)

### 2.4 프론트엔드 테스트

브라우저에서 접속:
```
https://your-app.vercel.app
```

---

## 🔗 3단계: 상호 연결 확인

### 3.1 Railway에서 FRONTEND_URL 업데이트

1. Railway 대시보드로 돌아가기
2. **Variables** 탭에서 `FRONTEND_URL` 수정:
   ```bash
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. 저장하면 자동으로 재배포됩니다

### 3.2 연결 테스트

1. Vercel 앱에서 그림 업로드 테스트
2. 분석이 정상적으로 작동하는지 확인
3. 리포트 생성 확인

---

## 🛠️ 4단계: 문제 해결

### CORS 에러

**증상**: 브라우저 콘솔에 CORS 에러 표시

**해결**:
1. Railway에서 `FRONTEND_URL`이 올바르게 설정되었는지 확인
2. Vercel URL과 정확히 일치하는지 확인 (https:// 포함)

### 환경 변수 에러

**증상**: "OPENAI_API_KEY가 설정되지 않았습니다" 에러

**해결**:
1. Railway Variables 탭에서 모든 API 키 확인
2. 키 앞뒤에 공백이 없는지 확인
3. 재배포 (Deployments → Redeploy)

### 이미지 로딩 에러

**증상**: 이미지가 표시되지 않음

**해결**:
1. `frontend/next.config.js`에서 Railway 도메인 확인
2. Vercel에서 프로젝트 재배포

### 백엔드 응답 없음

**증상**: API 호출 시 timeout

**해결**:
1. Railway 로그 확인: Dashboard → Deployments → Logs
2. Playwright 설치 확인 (Railway가 자동으로 처리)
3. Railway 플랜 확인 (무료 플랜은 500시간/월)

---

## 📊 5단계: 모니터링 및 로그

### Railway 로그 보기

```
Railway Dashboard → Deployments → Logs
```

실시간 로그를 확인하여 에러를 디버깅할 수 있습니다.

### Vercel 로그 보기

```
Vercel Dashboard → Project → Deployments → Functions
```

API 라우트의 실행 로그를 확인할 수 있습니다.

---

## 🔄 6단계: 업데이트 배포

### 코드 변경 후

1. **Git에 푸시**:
   ```bash
   git add .
   git commit -m "Update: 기능 추가"
   git push origin main
   ```

2. **자동 배포**:
   - Railway: 자동으로 감지하고 재배포
   - Vercel: 자동으로 감지하고 재배포

### 환경 변수 변경 후

1. Railway 또는 Vercel 대시보드에서 변수 수정
2. 수동 재배포 필요 시:
   - Railway: Deployments → Redeploy
   - Vercel: Deployments → Redeploy

---

## 💰 비용 안내

### Railway
- **Free Tier**: $5 무료 크레딧/월
- **Hobby Plan**: $5/월
- 예상 비용: 무료 티어로 시작 가능

### Vercel
- **Free Tier**:
  - 100GB 대역폭
  - Serverless Functions: 100GB-Hrs
- 예상 비용: 무료 티어로 충분

---

## 🔐 보안 체크리스트

배포 전 확인:

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음
- [ ] GitHub에 API 키가 노출되지 않음
- [ ] Railway/Vercel에서만 환경 변수 설정
- [ ] `.env.example`에는 실제 키가 없음

---

## 📱 추가 설정 (선택사항)

### 커스텀 도메인 설정

#### Vercel (프론트엔드)
1. Vercel Dashboard → Project → Settings → Domains
2. 도메인 추가 (예: `myapp.com`)
3. DNS 설정 (A 레코드 또는 CNAME)

#### Railway (백엔드)
1. Railway Dashboard → Settings → Domains
2. Custom Domain 추가
3. DNS 설정

커스텀 도메인 설정 후:
- Railway `FRONTEND_URL` 업데이트
- Vercel `PYTHON_BACKEND_URL` 업데이트
- `frontend/next.config.js`의 `remotePatterns` 업데이트

---

## 🆘 지원

### 유용한 링크

- Railway 문서: https://docs.railway.app/
- Vercel 문서: https://vercel.com/docs
- FastAPI 문서: https://fastapi.tiangolo.com/
- Next.js 문서: https://nextjs.org/docs

### 문제 발생 시

1. Railway/Vercel 로그 확인
2. 브라우저 개발자 도구 콘솔 확인
3. GitHub Issues에 문의

---

## ✅ 배포 완료!

축하합니다! 이제 애플리케이션이 실시간으로 동작합니다.

**배포된 URL**:
- 프론트엔드: `https://your-app.vercel.app`
- 백엔드 API: `https://your-backend.railway.app`
- API 문서: `https://your-backend.railway.app/docs`

다음 단계:
- [ ] 실제 사용자 테스트
- [ ] 성능 모니터링 설정
- [ ] 백업 전략 수립
- [ ] 에러 추적 도구 설정 (Sentry 등)
