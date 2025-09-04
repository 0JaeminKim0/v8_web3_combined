# 🚂 Railway 배포 가이드

## 📋 Railway 배포 준비 완료!

Investment Receipt SBT DApp이 Railway 클라우드 플랫폼에 배포할 준비가 되었습니다.

### ✅ **배포 준비 사항**

**1. 필요한 파일들이 생성됨:**
- ✅ `server.js` - Railway용 Node.js 서버
- ✅ `railway.json` - Railway 설정 파일
- ✅ `Procfile` - 프로세스 시작 명령
- ✅ `.railwayignore` - 배포 제외 파일들
- ✅ `public/index.html` - Railway 전용 HTML

**2. Package.json 업데이트됨:**
- ✅ `start` 스크립트 추가
- ✅ `@hono/node-server` 의존성 추가
- ✅ Railway 전용 명령어들 추가

## 🚀 Railway 배포 방법

### **방법 1: Railway CLI 사용 (권장)**

**1단계: Railway CLI 설치**
```bash
# npm으로 설치
npm install -g @railway/cli

# 또는 curl로 설치
curl -fsSL https://railway.app/install.sh | sh
```

**2단계: Railway 로그인**
```bash
railway login
```

**3단계: 프로젝트 초기화 및 배포**
```bash
cd /home/user/webapp

# Railway 프로젝트 초기화
railway init

# 환경 변수 설정 (선택사항)
railway variables set NODE_ENV=production
railway variables set PINATA_JWT=your_pinata_jwt_here

# 배포 실행
railway up
```

### **방법 2: GitHub 연동 배포**

**1단계: GitHub에 푸시** (이미 완료)
```bash
git push origin main
```

**2단계: Railway 대시보드에서 설정**
1. https://railway.app 접속 및 로그인
2. "New Project" → "Deploy from GitHub repo" 선택
3. `0JaeminKim0/web3_test` 리포지토리 선택
4. Railway가 자동으로 빌드 및 배포

### **방법 3: Railway 대시보드 직접 배포**

**1단계: Railway 대시보드**
1. https://railway.app 접속
2. "New Project" 클릭
3. "Empty Project" 선택

**2단계: 서비스 추가**
1. "Add Service" → "GitHub Repo" 선택
2. `web3_test` 리포지토리 연결
3. 자동 배포 시작

## ⚙️ Railway 설정

### **환경 변수 설정**
Railway 대시보드에서 다음 환경 변수들을 설정하세요:

```bash
# 필수 환경 변수
NODE_ENV=production
PORT=$PORT  # Railway가 자동 설정

# 선택적 환경 변수 (IPFS 사용 시)
PINATA_JWT=your_pinata_jwt_token_here

# 데이터베이스 사용 시
DATABASE_URL=your_database_url_here
```

### **빌드 설정**
Railway는 자동으로 다음을 실행합니다:
```bash
# 빌드 명령
npm install
npm run build  # vite build 실행

# 시작 명령  
npm run start:railway  # node server.js 실행
```

## 🔍 배포 후 확인사항

### **1. 서비스 상태 확인**
```bash
# Railway CLI로 로그 확인
railway logs

# 또는 대시보드에서 확인
https://railway.app/dashboard
```

### **2. 앱 접속 테스트**
Railway가 제공하는 URL로 접속:
```
https://your-app-name.up.railway.app
```

### **3. Health Check 엔드포인트**
```
https://your-app-name.up.railway.app/health
```

**예상 응답:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-03T...",
  "service": "Investment Receipt SBT DApp",
  "platform": "Railway"
}
```

### **4. 주요 엔드포인트 테스트**
- `GET /` - 메인 페이지
- `GET /api/supported-wallets` - 지갑 목록
- `GET /api/network-info` - 네트워크 정보
- `GET /api/investment/contract-info` - 계약 정보
- `GET /health` - 상태 확인

## 🎯 Railway의 장점

### **✅ 자동화된 배포**
- GitHub 푸시 시 자동 배포
- 제로 다운타임 배포
- 자동 HTTPS 인증서

### **✅ 확장성**
- 자동 스케일링
- 로드 밸런싱
- CDN 통합

### **✅ 개발자 친화적**
- 실시간 로그 모니터링
- 환경 변수 관리
- 데이터베이스 통합

### **✅ 비용 효율적**
- 무료 티어 제공
- 사용량 기반 과금  
- 예측 가능한 비용

## 🔧 추가 설정

### **데이터베이스 연결**
Railway에서 PostgreSQL 추가:
```bash
railway add postgresql
```

### **도메인 설정**
커스텀 도메인 연결:
```bash
railway domain add yourdomain.com
```

### **모니터링 설정**
Railway 대시보드에서:
- CPU/메모리 사용량 모니터링
- 로그 스트리밍
- 알림 설정

## 🚨 주의사항

### **환경 차이점**
- Cloudflare Workers → Node.js 환경
- Edge Runtime → Traditional Server
- 일부 Cloudflare 전용 기능 비활성화

### **포트 설정**
Railway는 동적 포트를 사용합니다:
```javascript
const port = parseInt(process.env.PORT) || 3000
```

### **정적 파일 서빙**
Node.js 환경에서는 `@hono/node-server/serve-static` 사용:
```javascript
import { serveStatic } from '@hono/node-server/serve-static'
```

## 📊 성능 최적화

### **메모리 사용량**
```bash
# Railway에서 메모리 제한 설정
railway variables set RAILWAY_MEMORY_LIMIT=512
```

### **로그 레벨**
```bash
railway variables set LOG_LEVEL=info
```

### **Keep-Alive 설정**
server.js에서 이미 설정됨:
```javascript
serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0'  // Railway 필수 설정
})
```

## 🎉 완료!

Railway 배포가 성공하면:
- ✅ 실제 Web3 DApp이 클라우드에서 실행
- ✅ 실제 ETH 트랜잭션 가능
- ✅ NFT/SBT 민팅 기능 작동
- ✅ 전 세계에서 접속 가능

**Railway URL을 통해 완전한 블록체인 DApp을 경험하세요!** 🚀

---

### 💡 **도움이 필요하다면:**
- Railway 문서: https://docs.railway.app
- Railway 커뮤니티: https://discord.gg/railway
- Railway CLI 도움말: `railway help`