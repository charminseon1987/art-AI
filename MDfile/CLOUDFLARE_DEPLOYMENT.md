# 🚀 Cloudflare 배포 가이드

이 가이드는 AI 그림 상담 애플리케이션을 Cloudflare Pages (프론트엔드)와 Cloudflare Tunnel (백엔드)을 사용하여 배포하는 방법을 설명합니다.

## 📋 배포 전 체크리스트

- [ ] Cloudflare 계정 생성 (https://dash.cloudflare.com/)
- [ ] GitHub 저장소에 코드 푸시
- [ ] Railway 계정 및 백엔드 배포 완료
- [ ] OpenAI API 키 준비
- [ ] Supabase 프로젝트 설정 완료
- [ ] Stripe 계정 설정 완료

---

## 🎨 1단계: 프론트엔드 배포 (Cloudflare Pages)

### 1.1 Cloudflare Pages 프로젝트 생성

1. **Cloudflare 대시보드 접속**
   ```
   https://dash.cloudflare.com/
   ```

2. **Workers & Pages → Pages → Create a project** 클릭

3. **GitHub 저장소 연결**
   - "Connect to Git" 선택
   - GitHub 인증 및 저장소 선택: `art-AI`
   - "Begin setup" 클릭

4. **빌드 설정**
   - **Project name**: `art-ai-frontend` (원하는 이름)
   - **Production branch**: `main` 또는 `master`
   - **Framework preset**: `Next.js` (자동 감지)
   - **Root directory**: `frontend`
   - **Build command**: `npm run build` (또는 `pnpm build`)
   - **Build output directory**: `.next` (Next.js 기본값)
   - **Node.js version**: `20` (권장)

5. **Environment variables** 섹션에서 환경 변수 추가 (아래 참조)

6. **Save and Deploy** 클릭

### 1.2 환경 변수 설정

Cloudflare Pages 프로젝트 설정에서 **Environment variables** 탭으로 이동하여 다음 변수들을 추가:

#### Production 환경 변수

```bash
# 백엔드 API URL (Cloudflare Tunnel URL - 나중에 설정)
NEXT_PUBLIC_PYTHON_BACKEND_URL=https://api.yourdomain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key

# Polar.sh (선택사항)
POLAR_ACCESS_TOKEN=your-polar-token
POLAR_SUCCESS_URL=https://your-app.pages.dev/payment/success?checkout_id={CHECKOUT_ID}
```

⚠️ **중요**: 
- `NEXT_PUBLIC_PYTHON_BACKEND_URL`은 Cloudflare Tunnel 설정 완료 후 업데이트합니다.
- 초기 배포 시에는 임시로 Railway URL을 사용할 수 있습니다.

### 1.3 배포 확인

1. 배포가 완료되면 Cloudflare Pages에서 자동 생성된 URL 확인
   - 예: `https://art-ai-frontend.pages.dev`
2. 브라우저에서 접속하여 프론트엔드가 정상 작동하는지 확인

---

## 🔒 2단계: 백엔드 설정 (Cloudflare Tunnel)

Cloudflare Tunnel을 사용하면 Railway에 배포된 백엔드를 Cloudflare 네트워크를 통해 안전하게 노출할 수 있습니다.

### 2.1 Cloudflare Tunnel 생성

#### 방법 1: Cloudflare 대시보드에서 생성 (권장)

1. **Cloudflare 대시보드 → Zero Trust → Networks → Tunnels**

2. **Create a tunnel** 클릭

3. **Tunnel 이름 입력**: `art-ai-backend`

4. **Connector 선택**: 
   - **Cloudflared** 선택 (Railway에서 실행)

5. **Tunnel 생성 후 인증 토큰 복사**
   - ⚠️ 이 토큰은 한 번만 표시되므로 안전하게 보관하세요!

#### 방법 2: 명령줄에서 생성

```bash
# cloudflared 설치 (macOS)
brew install cloudflare/cloudflare/cloudflared

# 또는 Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared

# Tunnel 로그인
cloudflared tunnel login

# Tunnel 생성
cloudflared tunnel create art-ai-backend
```

### 2.2 Tunnel 설정 파일 생성

프로젝트 루트에 `cloudflare-tunnel-config.yml` 파일이 생성되어 있습니다.

**설정 파일 수정**:

1. `cloudflare-tunnel-config.yml` 파일 열기
2. `<YOUR_TUNNEL_ID>`를 실제 Tunnel ID로 교체
   - Tunnel ID는 Cloudflare 대시보드에서 확인 가능
3. `hostname`을 실제 도메인으로 변경
   - 예: `api.yourdomain.com` 또는 `art-ai-backend.yourdomain.com`

### 2.3 Railway에서 Tunnel 실행

#### 옵션 A: Railway에 cloudflared 서비스 추가

1. **Railway 프로젝트에 새 서비스 추가**

2. **Dockerfile 생성** (`cloudflared/Dockerfile`):
   ```dockerfile
   FROM cloudflare/cloudflared:latest
   COPY cloudflare-tunnel-config.yml /etc/cloudflared/config.yml
   ENTRYPOINT ["cloudflared", "tunnel", "--config", "/etc/cloudflared/config.yml", "run"]
   ```

3. **환경 변수 추가**:
   ```bash
   TUNNEL_TOKEN=<YOUR_TUNNEL_TOKEN>
   ```

4. **Railway에서 배포**

#### 옵션 B: 기존 Railway 서비스에 cloudflared 통합

Railway의 `railway.json` 또는 `Procfile`을 수정하여 cloudflared를 함께 실행:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn api_server:app --host 0.0.0.0 --port $PORT & cloudflared tunnel --config cloudflare-tunnel-config.yml run art-ai-backend",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### 옵션 C: 별도 서버에서 실행 (권장)

로컬 서버나 VPS에서 cloudflared를 서비스로 실행:

```bash
# cloudflared 설치
sudo cloudflared service install <YOUR_TUNNEL_TOKEN>

# 설정 파일 배치
sudo cp cloudflare-tunnel-config.yml /etc/cloudflared/config.yml

# 서비스 시작
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# 상태 확인
sudo systemctl status cloudflared
```

### 2.4 Tunnel 라우팅 설정

Cloudflare 대시보드에서:

1. **Zero Trust → Networks → Tunnels → art-ai-backend → Configure**

2. **Public Hostname** 추가:
   - **Subdomain**: `api` (또는 원하는 이름)
   - **Domain**: `yourdomain.com` (또는 `pages.dev`)
   - **Service**: `http://localhost:8000` (Railway 내부 주소)
   - 또는 Railway의 공개 URL 사용: `https://your-backend.railway.app`

3. **Save** 클릭

4. **DNS 레코드 자동 생성 확인**
   - Cloudflare가 자동으로 DNS 레코드를 생성합니다

### 2.5 Tunnel 연결 확인

```bash
# Tunnel 상태 확인
cloudflared tunnel info art-ai-backend

# 또는 Cloudflare 대시보드에서 확인
# Zero Trust → Networks → Tunnels → art-ai-backend
```

---

## 🔗 3단계: 상호 연결 설정

### 3.1 Cloudflare Pages 환경 변수 업데이트

1. **Cloudflare Pages → 프로젝트 → Settings → Environment variables**

2. **`NEXT_PUBLIC_PYTHON_BACKEND_URL` 업데이트**:
   ```bash
   NEXT_PUBLIC_PYTHON_BACKEND_URL=https://api.yourdomain.com
   ```
   (또는 Tunnel로 생성한 도메인)

3. **Redeploy** 실행

### 3.2 Railway 환경 변수 업데이트

Railway 대시보드에서:

1. **Variables** 탭으로 이동

2. **`FRONTEND_URL` 업데이트**:
   ```bash
   FRONTEND_URL=https://art-ai-frontend.pages.dev
   ```
   (또는 커스텀 도메인)

3. **`CLOUDFLARE_PAGES_URL` 추가** (선택사항):
   ```bash
   CLOUDFLARE_PAGES_URL=https://art-ai-frontend.pages.dev
   ```

4. **재배포** (자동으로 트리거됨)

### 3.3 연결 테스트

1. **프론트엔드 접속**: `https://art-ai-frontend.pages.dev`
2. **이미지 업로드 테스트**
3. **브라우저 개발자 도구 → Network** 탭에서 API 호출 확인
4. **CORS 에러가 없는지 확인**

---

## 🌐 4단계: 커스텀 도메인 설정 (선택사항)

### 4.0 도메인 확장자 선택 가이드

커스텀 도메인을 설정하기 전에 적합한 도메인 확장자를 선택하는 것이 중요합니다. 각 확장자는 가격, 용도, SEO 영향 등에서 차이가 있습니다.

#### 주요 도메인 확장자 비교

**범용 도메인**:
- **`.com`**: 가장 인기 있는 범용 도메인
  - 가격: $10-15/년
  - 특징: 신뢰도 높음, SEO에 유리, 브랜드 인식도 최고
  - 권장: 비즈니스, 전자상거래, 일반 웹사이트
  - 단점: 원하는 도메인명이 이미 등록되어 있을 가능성 높음

- **`.co`**: 짧고 기억하기 쉬운 대안
  - 가격: $10-15/년
  - 특징: `.com`의 대안으로 인기, 짧고 세련됨
  - 권장: 스타트업, 브랜드명이 짧은 경우

**지역 도메인**:
- **`.uk`**: 영국 지역 도메인
  - 가격: $5-10/년
  - 특징: 영국 비즈니스에 적합, 영국 거주자만 등록 가능
  - 권장: 영국 시장 타겟팅 비즈니스
  - 제한: 영국 거주자 또는 영국 법인만 등록 가능

- **`.kr`**: 한국 지역 도메인
  - 가격: $10-20/년
  - 특징: 한국 비즈니스에 적합, 한국 거주자만 등록 가능
  - 권장: 한국 시장 타겟팅 비즈니스

**산업 특화 도메인**:
- **`.studio`**: 창작 및 디자인 서비스
  - 가격: $3-8/년
  - 특징: 저렴한 가격, 창작 분야에 적합
  - 권장: 디자인 스튜디오, 포트폴리오, 창작 서비스
  - 장점: 가격이 저렴하고 도메인명 선택의 폭이 넓음

- **`.dev`**: 개발자 및 기술 서비스
  - 가격: $15-20/년
  - 특징: 개발자 커뮤니티에서 인기, HTTPS 필수
  - 권장: 개발자 도구, 기술 블로그, 개발 서비스

- **`.app`**: 앱 및 모바일 서비스
  - 가격: $15-20/년
  - 특징: 앱 서비스에 적합, HTTPS 필수
  - 권장: 모바일 앱, 웹 앱, 서비스 플랫폼

- **`.io`**: 기술 스타트업
  - 가격: $30-50/년
  - 특징: 기술 스타트업에서 매우 인기, 가격이 비쌈
  - 권장: 기술 스타트업, SaaS 서비스
  - 단점: 가격이 높음

#### 가격 차이의 이유

1. **등록 기관(Registry) 정책**
   - 각 도메인 확장자는 별도의 등록 기관이 관리
   - 등록 기관이 가격 정책을 결정

2. **수요와 공급**
   - 인기 있는 확장자(.com, .io)는 수요가 높아 가격이 높음
   - 새로운 확장자(.studio 등)는 경쟁이 적어 가격이 저렴

3. **특수 목적 도메인**
   - `.dev`, `.app` 등은 특정 목적을 위해 설계되어 프리미엄 가격
   - HTTPS 필수, 보안 요구사항 등 추가 기능 제공

4. **지역 제한**
   - `.uk`, `.kr` 등 지역 도메인은 해당 지역 거주자만 등록 가능
   - 제한으로 인해 가격이 상대적으로 낮을 수 있음

#### 서비스 차이

**SEO 영향**:
- `.com`이 검색 엔진에서 가장 신뢰도가 높음
- 지역 도메인(.uk, .kr)은 해당 지역 검색에 유리
- 새로운 확장자(.studio, .dev)도 SEO에 큰 차이는 없지만, 사용자 신뢰도는 `.com`이 더 높음

**브랜드 인식**:
- 일반 사용자는 `.com`을 가장 친숙하게 느낌
- 기술 커뮤니티는 `.dev`, `.io`를 잘 이해함
- 산업 특화 도메인은 해당 산업에서 브랜드 정체성을 강조

**기술적 차이**:
- `.dev`, `.app`은 HTTPS 필수 (자동 보안)
- 일부 확장자는 특정 DNS 기능 제한 가능
- 대부분의 확장자는 Cloudflare와 호환됨

#### 권장사항

**비즈니스용**:
1. `.com`을 우선적으로 고려 (예산이 있으면)
2. 예산이 제한적이면 `.studio`, `.co` 등 대안 고려
3. 브랜드 보호를 위해 여러 확장자 동시 등록 고려

**개인 프로젝트/포트폴리오**:
1. `.studio` (저렴하고 창작 분야에 적합)
2. `.dev` (개발자 포트폴리오)
3. `.co` (짧고 세련됨)

**지역 비즈니스**:
1. 해당 지역 도메인 (`.uk`, `.kr` 등) 고려
2. `.com`과 함께 등록하여 글로벌 타겟팅

**기술 스타트업**:
1. `.io` (인기 있지만 비쌈)
2. `.dev` (개발자 친화적)
3. `.app` (서비스 플랫폼)

#### 도메인 구매 추천 사이트

- **Cloudflare Registrar**: 가장 저렴한 가격, 무료 WHOIS 보호
- **Namecheap**: 사용하기 쉬운 인터페이스, 저렴한 가격
- **Google Domains**: 간단한 관리, Google 서비스 통합
- **GoDaddy**: 다양한 확장자, 마케팅 강함 (가격은 비쌈)

> 💡 **팁**: Cloudflare Registrar를 사용하면 DNS 관리가 간편하고, 대부분의 확장자에서 가장 저렴한 가격을 제공합니다.

---

### 4.1 Cloudflare에 도메인 추가 (DNS 설정)

도메인을 Cloudflare에서 관리하려면 먼저 Cloudflare 계정에 도메인을 추가해야 합니다.

#### 4.1.1 도메인 등록 확인

1. **도메인 등록 상태 확인**
   - 도메인을 이미 구매했다면 등록 기관에서 확인
   - 아직 구매하지 않았다면 Cloudflare Registrar 또는 다른 등록 기관에서 구매

2. **도메인 등록 기관 확인**
   - 현재 도메인을 어디서 구매했는지 확인
   - 예: GoDaddy, Namecheap, Google Domains 등

#### 4.1.2 Cloudflare에 도메인 추가

1. **Cloudflare 대시보드 접속**
   ```
   https://dash.cloudflare.com/
   ```

2. **Add a Site** 클릭
   - 대시보드 우측 상단 또는 왼쪽 메뉴에서 "Add a Site" 선택

3. **도메인 입력**
   - 예: `yourdomain.com` (서브도메인 없이 루트 도메인만)
   - "Add site" 클릭

4. **플랜 선택**
   - **Free 플랜** 선택 (대부분의 경우 무료 플랜으로 충분)
   - "Continue" 클릭

5. **DNS 레코드 스캔**
   - Cloudflare가 기존 DNS 레코드를 자동으로 스캔
   - 확인 후 "Continue" 클릭

#### 4.1.3 네임서버 변경

Cloudflare에 도메인을 추가하면 새로운 네임서버가 제공됩니다.

1. **Cloudflare 네임서버 확인**
   - 예: `alice.ns.cloudflare.com`, `bob.ns.cloudflare.com`
   - 대시보드에서 제공된 네임서버 주소 복사

2. **도메인 등록 기관에서 네임서버 변경**
   - 도메인을 구매한 등록 기관(GoDaddy, Namecheap 등)에 로그인
   - DNS 설정 또는 네임서버 설정 메뉴로 이동
   - Cloudflare에서 제공한 네임서버로 변경
   - 저장

3. **네임서버 전파 대기**
   - 변경 사항이 전 세계에 전파되는데 보통 24-48시간 소요
   - 실제로는 대부분 몇 시간 내에 완료됨
   - 전파 상태 확인: https://www.whatsmydns.net/

4. **Cloudflare에서 활성화 확인**
   - Cloudflare 대시보드에서 도메인 상태가 "Active"로 변경되면 완료
   - DNS 레코드가 Cloudflare를 통해 관리됨

#### 4.1.4 DNS 레코드 확인

1. **DNS 탭으로 이동**
   - Cloudflare 대시보드 → 도메인 선택 → DNS

2. **기존 레코드 확인**
   - 기존에 있던 DNS 레코드가 자동으로 복사됨
   - 필요한 레코드가 있는지 확인

3. **필요한 레코드 추가**
   - A 레코드, CNAME 레코드 등 필요 시 추가

### 4.2 Cloudflare Pages에 커스텀 도메인 연결

#### 4.2.1 Pages 프로젝트에 도메인 추가

1. **Cloudflare Pages 대시보드 접속**
   - Workers & Pages → Pages → 프로젝트 선택

2. **Custom domains 탭으로 이동**
   - 프로젝트 설정에서 "Custom domains" 클릭

3. **도메인 추가**
   - "Add a domain" 또는 "Set up a custom domain" 클릭
   - 도메인 입력: `yourdomain.com` (루트 도메인)
   - "Continue" 클릭

4. **DNS 레코드 확인**
   - Cloudflare가 자동으로 필요한 DNS 레코드를 생성
   - CNAME 레코드가 자동으로 추가됨
   - "Activate domain" 클릭

5. **www 서브도메인 추가 (선택사항)**
   - `www.yourdomain.com`도 함께 사용하려면:
   - "Add a domain" 클릭 → `www.yourdomain.com` 입력
   - Cloudflare가 자동으로 `www`를 루트 도메인으로 리다이렉트 설정

#### 4.2.2 SSL 인증서 자동 발급 확인

1. **SSL/TLS 탭 확인**
   - Cloudflare 대시보드 → 도메인 → SSL/TLS
   - "Overview"에서 SSL 모드 확인

2. **SSL 모드 설정**
   - **Full (strict)** 권장 (Cloudflare Pages는 자동으로 HTTPS 지원)
   - 또는 **Full** 모드 사용

3. **인증서 발급 대기**
   - Cloudflare가 자동으로 SSL 인증서를 발급
   - 보통 몇 분에서 몇 시간 소요
   - "Edge Certificates" 탭에서 발급 상태 확인

4. **인증서 상태 확인**
   - "Edge Certificates" → "Always Use HTTPS" 활성화
   - "Automatic HTTPS Rewrites" 활성화 (권장)

#### 4.2.3 도메인 연결 확인

1. **브라우저에서 접속 테스트**
   - `https://yourdomain.com` 접속
   - SSL 인증서가 정상적으로 작동하는지 확인 (자물쇠 아이콘)

2. **www 리다이렉트 확인** (설정한 경우)
   - `https://www.yourdomain.com` 접속
   - 루트 도메인으로 자동 리다이렉트되는지 확인

### 4.3 Cloudflare Tunnel 도메인 설정

#### 4.3.1 Tunnel Public Hostname 설정

1. **Cloudflare Zero Trust 대시보드 접속**
   - Cloudflare 대시보드 → Zero Trust → Networks → Tunnels

2. **Tunnel 선택**
   - 이전에 생성한 `art-ai-backend` Tunnel 선택
   - "Configure" 클릭

3. **Public Hostname 추가/수정**
   - "Public Hostname" 탭으로 이동
   - 기존 호스트명이 있다면 수정, 없다면 "Add a public hostname" 클릭

4. **호스트명 설정**
   - **Subdomain**: `api` (또는 원하는 서브도메인)
   - **Domain**: `yourdomain.com` (Cloudflare에 추가한 도메인)
   - **Service**: `http://localhost:8000` (Railway 내부 주소)
     - 또는 Railway의 공개 URL: `https://your-backend.railway.app`
   - "Save hostname" 클릭

5. **DNS 레코드 자동 생성 확인**
   - Cloudflare가 자동으로 CNAME 레코드를 생성
   - DNS 탭에서 `api.yourdomain.com` CNAME 레코드 확인

#### 4.3.2 Tunnel 설정 파일 업데이트

1. **`cloudflare-tunnel-config.yml` 파일 수정**
   ```yaml
   tunnel: <YOUR_TUNNEL_ID>
   credentials-file: /etc/cloudflared/<YOUR_TUNNEL_ID>.json

   ingress:
     - hostname: api.yourdomain.com  # 실제 도메인으로 변경
       service: http://localhost:8000
       originRequest:
         connectTimeout: 30s
         tcpKeepAlive: 30s
         httpHostHeader: api.yourdomain.com
         noHappyEyeballs: false
         keepAliveConnections: 100
         keepAliveTimeout: 90s
     - service: http_status:404
   
   loglevel: info
   metrics: 0.0.0.0:9090
   ```

2. **Tunnel 재시작** (필요한 경우)
   - Railway에서 재배포하거나
   - 로컬 서버에서 cloudflared 재시작

#### 4.3.3 Tunnel 연결 검증

1. **Tunnel 상태 확인**
   ```bash
   cloudflared tunnel info art-ai-backend
   ```
   - 또는 Cloudflare 대시보드에서 Tunnel 상태 확인

2. **API 엔드포인트 테스트**
   - 브라우저에서 `https://api.yourdomain.com/health` 접속
   - 또는 `curl https://api.yourdomain.com/health`
   - 정상 응답이 오는지 확인

3. **SSL 인증서 확인**
   - `https://api.yourdomain.com` 접속
   - SSL 인증서가 정상적으로 작동하는지 확인

### 4.4 DNS 레코드 수동 설정 (필요한 경우)

일부 경우에는 DNS 레코드를 수동으로 설정해야 할 수 있습니다.

#### 4.4.1 CNAME 레코드 설정

1. **Cloudflare DNS 탭으로 이동**
   - 도메인 → DNS → Records

2. **CNAME 레코드 추가**
   - "Add record" 클릭
   - **Type**: CNAME
   - **Name**: `api` (서브도메인)
   - **Target**: Tunnel이 제공하는 주소 또는 Pages 주소
   - **Proxy status**: Proxied (오렌지 구름) - Cloudflare 보호 활성화
   - "Save" 클릭

#### 4.4.2 A 레코드 설정 (필요한 경우)

일부 서비스는 A 레코드가 필요할 수 있습니다:

1. **A 레코드 추가**
   - **Type**: A
   - **Name**: `@` (루트 도메인) 또는 서브도메인
   - **IPv4 address**: Cloudflare Pages IP 주소
   - **Proxy status**: Proxied
   - "Save" 클릭

> ⚠️ **참고**: Cloudflare Pages는 주로 CNAME을 사용하며, A 레코드는 특수한 경우에만 필요합니다.

#### 4.4.3 DNS 전파 확인

1. **전파 상태 확인 도구 사용**
   - https://www.whatsmydns.net/
   - https://dnschecker.org/
   - 도메인과 레코드 타입 입력하여 전 세계 전파 상태 확인

2. **로컬에서 확인**
   ```bash
   # macOS/Linux
   dig yourdomain.com
   nslookup yourdomain.com
   
   # Windows
   nslookup yourdomain.com
   ```

3. **전파 대기 시간**
   - 일반적으로 몇 분에서 몇 시간 소요
   - 최대 48시간까지 걸릴 수 있지만, 대부분은 빠르게 완료됨

### 4.5 SSL/TLS 인증서 설정

#### 4.5.1 Cloudflare SSL 모드 확인

1. **SSL/TLS 탭으로 이동**
   - Cloudflare 대시보드 → 도메인 → SSL/TLS → Overview

2. **SSL 모드 선택**
   - **Full (strict)**: 권장 (Cloudflare와 원본 서버 간 암호화)
   - **Full**: 원본 서버 인증서 검증 없이 암호화
   - **Flexible**: Cloudflare와 사용자 간만 암호화 (권장하지 않음)

3. **Always Use HTTPS 활성화**
   - SSL/TLS → Edge Certificates
   - "Always Use HTTPS" 토글 활성화
   - HTTP 요청을 자동으로 HTTPS로 리다이렉트

#### 4.5.2 인증서 발급 확인

1. **Edge Certificates 확인**
   - SSL/TLS → Edge Certificates
   - "Universal SSL" 상태가 "Active"인지 확인

2. **인증서 발급 대기**
   - 새 도메인 추가 시 인증서 발급에 시간이 걸릴 수 있음
   - 보통 몇 분에서 몇 시간 소요

3. **인증서 문제 해결**
   - 발급이 지연되면 24시간 대기
   - 문제가 계속되면 Cloudflare 지원팀에 문의

### 4.6 환경 변수 업데이트

도메인 설정이 완료되면 모든 환경 변수를 새 도메인으로 업데이트해야 합니다.

#### 4.6.1 Cloudflare Pages 환경 변수 업데이트

1. **Cloudflare Pages → 프로젝트 → Settings → Environment variables**

2. **`NEXT_PUBLIC_PYTHON_BACKEND_URL` 업데이트**
   ```bash
   NEXT_PUBLIC_PYTHON_BACKEND_URL=https://api.yourdomain.com
   ```
   - 기존 `pages.dev` URL을 새 도메인으로 변경

3. **다른 도메인 관련 변수 확인**
   - `POLAR_SUCCESS_URL` 등 다른 URL 변수도 업데이트

4. **Redeploy 실행**
   - "Save" 후 자동으로 재배포되거나
   - Deployments 탭에서 수동으로 "Retry deployment" 클릭

#### 4.6.2 Railway 환경 변수 업데이트

1. **Railway 대시보드 → 프로젝트 → Variables**

2. **`FRONTEND_URL` 업데이트**
   ```bash
   FRONTEND_URL=https://yourdomain.com
   ```
   - 기존 `pages.dev` URL을 새 도메인으로 변경

3. **`CLOUDFLARE_PAGES_URL` 업데이트** (있는 경우)
   ```bash
   CLOUDFLARE_PAGES_URL=https://yourdomain.com
   ```

4. **재배포 확인**
   - Railway가 자동으로 재배포
   - Deployments 탭에서 배포 상태 확인

#### 4.6.3 `cloudflare-tunnel-config.yml` 파일 업데이트

프로젝트의 `cloudflare-tunnel-config.yml` 파일도 업데이트:

```yaml
ingress:
  - hostname: api.yourdomain.com  # 실제 도메인으로 변경
    service: http://localhost:8000
    # ... 나머지 설정
```

### 4.7 도메인 설정 검증

모든 설정이 완료되었는지 확인합니다.

#### 4.7.1 도메인 접속 테스트

1. **프론트엔드 도메인 테스트**
   - 브라우저에서 `https://yourdomain.com` 접속
   - 정상적으로 로드되는지 확인
   - SSL 인증서 확인 (자물쇠 아이콘)

2. **www 리다이렉트 테스트** (설정한 경우)
   - `https://www.yourdomain.com` 접속
   - 루트 도메인으로 리다이렉트되는지 확인

#### 4.7.2 API 엔드포인트 테스트

1. **API 도메인 테스트**
   ```bash
   curl https://api.yourdomain.com/health
   ```
   - 또는 브라우저에서 접속
   - 정상 응답이 오는지 확인

2. **프론트엔드에서 API 호출 테스트**
   - 프론트엔드에서 이미지 업로드 등 기능 테스트
   - 브라우저 개발자 도구 → Network 탭에서 API 호출 확인
   - CORS 에러가 없는지 확인

#### 4.7.3 SSL 인증서 확인

1. **SSL Labs 테스트** (선택사항)
   - https://www.ssllabs.com/ssltest/
   - 도메인 입력하여 SSL 인증서 상태 확인
   - A 등급 이상 권장

2. **브라우저에서 확인**
   - 주소창의 자물쇠 아이콘 클릭
   - 인증서 정보 확인
   - "연결이 안전합니다" 메시지 확인

#### 4.7.4 DNS 전파 확인

1. **전파 상태 확인**
   - https://www.whatsmydns.net/
   - 도메인과 레코드 타입 선택
   - 전 세계 DNS 서버에서 올바른 IP로 확인되는지 확인

2. **로컬 DNS 캐시 클리어** (필요한 경우)
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   
   # Windows
   ipconfig /flushdns
   ```

### 4.8 도메인 설정 완료 체크리스트

도메인 설정이 완료되었는지 확인:

- [ ] Cloudflare에 도메인 추가 완료
- [ ] 네임서버 변경 완료 및 전파 확인
- [ ] Cloudflare Pages에 커스텀 도메인 연결 완료
- [ ] SSL 인증서 발급 완료 (Universal SSL Active)
- [ ] Tunnel Public Hostname 설정 완료
- [ ] DNS 레코드 자동 생성 확인
- [ ] Cloudflare Pages 환경 변수 업데이트 완료
- [ ] Railway 환경 변수 업데이트 완료
- [ ] `cloudflare-tunnel-config.yml` 파일 업데이트 완료
- [ ] 프론트엔드 도메인 접속 테스트 성공
- [ ] API 엔드포인트 접속 테스트 성공
- [ ] SSL 인증서 정상 작동 확인
- [ ] DNS 전파 완료 확인
- [ ] CORS 에러 없음 확인

---

## 🛠️ 5단계: 문제 해결

### CORS 에러

**증상**: 브라우저 콘솔에 CORS 에러 표시

**해결**:
1. `api_server.py`의 `allowed_origins` 확인
2. Railway 환경 변수 `FRONTEND_URL` 확인
3. Cloudflare Pages URL이 정확히 일치하는지 확인 (https:// 포함)
4. Railway 재배포

### Tunnel 연결 실패

**증상**: Tunnel이 연결되지 않음

**해결**:
1. Tunnel 토큰 확인
2. `cloudflare-tunnel-config.yml` 파일 경로 확인
3. Railway 로그 확인
4. Tunnel 서비스 상태 확인:
   ```bash
   cloudflared tunnel list
   cloudflared tunnel info art-ai-backend
   ```

### 빌드 실패

**증상**: Cloudflare Pages 빌드 실패

**해결**:
1. Cloudflare Pages 빌드 로그 확인
2. Node.js 버전 확인 (20 권장)
3. `package.json`의 의존성 확인
4. `frontend/next.config.js` 설정 확인

### 백엔드 응답 없음

**증상**: API 호출 시 timeout 또는 연결 실패

**해결**:
1. Tunnel이 정상 작동하는지 확인
2. Railway 백엔드가 실행 중인지 확인
3. Tunnel 라우팅 설정 확인 (Public Hostname)
4. DNS 레코드 확인

### DNS 전파 지연

**증상**: 도메인을 설정했지만 접속이 안 되거나 오래 걸림

**해결**:
1. DNS 전파 상태 확인: https://www.whatsmydns.net/
2. 로컬 DNS 캐시 클리어 (위의 4.7.4 참조)
3. 다른 네트워크에서 테스트 (모바일 데이터 등)
4. 최대 48시간까지 기다릴 수 있지만, 보통 몇 시간 내 완료됨
5. Cloudflare DNS 설정이 올바른지 확인

### SSL 인증서 발급 실패

**증상**: SSL 인증서가 발급되지 않거나 오래 걸림

**해결**:
1. Cloudflare 대시보드 → SSL/TLS → Edge Certificates에서 상태 확인
2. 도메인 추가 후 최대 24시간 대기
3. "Always Use HTTPS"가 활성화되어 있는지 확인
4. DNS 레코드가 올바르게 설정되어 있는지 확인
5. 도메인이 Cloudflare에 정상적으로 추가되었는지 확인
6. 문제가 계속되면 Cloudflare 지원팀에 문의

### 도메인 연결 실패

**증상**: Cloudflare Pages에 도메인을 추가했지만 연결되지 않음

**해결**:
1. 도메인이 Cloudflare에 추가되어 있는지 확인
2. DNS 레코드가 자동으로 생성되었는지 확인
3. CNAME 레코드가 올바른지 확인
4. Proxy 상태가 "Proxied" (오렌지 구름)인지 확인
5. Pages 프로젝트가 정상 배포되어 있는지 확인
6. 도메인 추가 후 몇 분 대기 (DNS 전파 시간)

### CORS 에러 (도메인 변경 후)

**증상**: 도메인을 변경한 후 브라우저 콘솔에 CORS 에러 표시

**해결**:
1. `api_server.py`의 `allowed_origins`에 새 도메인 추가
   ```python
   allowed_origins = [
       "https://yourdomain.com",
       "https://www.yourdomain.com",
       # 기존 도메인도 유지 (필요한 경우)
   ]
   ```
2. Railway 환경 변수 `FRONTEND_URL` 업데이트
3. Railway 재배포
4. 브라우저 캐시 클리어 후 다시 테스트

### 도메인 등록 기관 문제

**증상**: 네임서버 변경이 안 되거나 도메인 설정에 문제가 있음

**해결**:
1. 도메인 등록 기관(GoDaddy, Namecheap 등)에 로그인
2. DNS 설정 또는 네임서버 설정 메뉴 확인
3. Cloudflare 네임서버로 정확히 변경 (오타 확인)
4. 등록 기관의 DNS 잠금(DNS Lock) 기능이 있는지 확인하고 해제
5. 등록 기관 지원팀에 문의 (필요한 경우)

### www 리다이렉트 문제

**증상**: www와 루트 도메인이 모두 작동하지 않거나 리다이렉트가 안 됨

**해결**:
1. Cloudflare Pages에서 www 도메인도 추가했는지 확인
2. Page Rules에서 리다이렉트 규칙 확인 (필요한 경우)
3. DNS 레코드에서 www CNAME이 올바른지 확인
4. SSL 인증서가 www에도 발급되었는지 확인

---

## 📊 6단계: 모니터링 및 로그

### Cloudflare Pages 로그

```
Cloudflare Dashboard → Pages → 프로젝트 → Deployments → Functions
```

### Cloudflare Tunnel 로그

```bash
# 로컬에서 실행하는 경우
cloudflared tunnel --loglevel debug run art-ai-backend

# 또는 Railway 로그 확인
Railway Dashboard → Deployments → Logs
```

### Railway 로그

```
Railway Dashboard → Deployments → Logs
```

---

## 🔄 7단계: 업데이트 배포

### 코드 변경 후

1. **Git에 푸시**:
   ```bash
   git add .
   git commit -m "Update: 기능 추가"
   git push origin main
   ```

2. **자동 배포**:
   - Cloudflare Pages: 자동으로 감지하고 재배포
   - Railway: 자동으로 감지하고 재배포

### 환경 변수 변경 후

1. Cloudflare Pages 또는 Railway 대시보드에서 변수 수정
2. 수동 재배포 필요 시:
   - Cloudflare Pages: Deployments → Retry deployment
   - Railway: Deployments → Redeploy

---

## 💰 비용 안내

### Cloudflare Pages
- **Free Tier**: 무제한 요청, 무제한 대역폭
- **Builds**: 500 builds/월 (무료)
- 예상 비용: **무료**

### Cloudflare Tunnel
- **Free Tier**: 무제한 연결, 무제한 트래픽
- 예상 비용: **무료**

### Railway
- **Free Tier**: $5 무료 크레딧/월
- **Hobby Plan**: $5/월
- 예상 비용: 무료 티어로 시작 가능

---

## 🔐 보안 체크리스트

배포 전 확인:

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있음
- [ ] GitHub에 API 키가 노출되지 않음
- [ ] Cloudflare Pages에서만 환경 변수 설정
- [ ] Tunnel 토큰이 안전하게 보관됨
- [ ] `.env.example`에는 실제 키가 없음
- [ ] CORS 설정이 올바르게 구성됨

---

## 📱 추가 설정 (선택사항)

### Cloudflare Workers로 API 프록시 (고급)

더 세밀한 제어가 필요한 경우 Cloudflare Workers를 사용하여 API를 프록시할 수 있습니다:

1. **Workers 프로젝트 생성**
2. **프록시 코드 작성**
3. **Tunnel 대신 Workers 사용**

### 성능 최적화

- **Cloudflare Pages**: 자동으로 최적화됨
- **Tunnel**: Cloudflare 네트워크를 통해 자동으로 최적화됨
- **이미지 최적화**: Next.js Image 컴포넌트 사용

---

## 🆘 지원

### 유용한 링크

- Cloudflare Pages 문서: https://developers.cloudflare.com/pages/
- Cloudflare Tunnel 문서: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- Next.js 문서: https://nextjs.org/docs
- Railway 문서: https://docs.railway.app/

### 문제 발생 시

1. Cloudflare Pages/Railway 로그 확인
2. 브라우저 개발자 도구 콘솔 확인
3. Tunnel 상태 확인
4. GitHub Issues에 문의

---

## ✅ 배포 완료!

축하합니다! 이제 애플리케이션이 Cloudflare를 통해 배포되었습니다.

**배포된 URL**:
- 프론트엔드: `https://art-ai-frontend.pages.dev` (또는 커스텀 도메인)
- 백엔드 API: `https://api.yourdomain.com` (Tunnel을 통해)

다음 단계:
- [ ] 실제 사용자 테스트
- [ ] 성능 모니터링 설정
- [ ] 에러 추적 도구 설정 (Sentry 등)
- [ ] 백업 전략 수립
