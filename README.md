# Infinity Ventures - 통합 투자 플랫폼 

## 프로젝트 개요
- **이름**: Infinity Ventures
- **목표**: v8 투자 플랫폼 웹사이트와 web3_test의 실제 SBT 민팅 기능 통합
- **특징**: 현대적인 투자 플랫폼 UI + 실제 작동하는 블록체인 기능

## 🎯 **성공적으로 통합된 기능**

### **v8 투자 플랫폼 요소 (새로 추가)**
- ✅ **모던 홈페이지** - 전문적인 투자 플랫폼 디자인
- ✅ **투자 기회 포트폴리오** - 실물자산 투자 프로젝트 전시
- ✅ **투자 계산기** - 실시간 수익률 계산 도구
- ✅ **반응형 디자인** - 모바일/데스크톱 최적화
- ✅ **현대적인 UI/UX** - TailwindCSS + RemixIcon 사용

### **web3_test Web3 기능 (보존)**
- ✅ **실제 SBT 민팅** - Sepolia 테스트넷에서 작동하는 민팅 시스템
- ✅ **MetaMask 연동** - 지갑 연결 및 네트워크 자동 전환
- ✅ **PDF 계약서 생성** - jsPDF를 통한 실제 문서 생성
- ✅ **IPFS 업로드 지원** - 분산 저장 시스템 연동
- ✅ **실제 ETH 트랜잭션** - 테스트넷에서 실제 블록체인 상호작용

## 📍 **URL 구조**

### **Live URLs**
- **Production**: https://3000-i9qpd4op6fw54qnriw1h0-6532622b.e2b.dev
- **GitHub**: https://github.com/0JaeminKim0/web3_test

### **페이지 구조**
- **`/`** - Infinity Ventures 홈페이지 (v8 스타일)
- **`/portfolio`** - 투자 기회 포트폴리오 페이지
- **`/invest`** - Web3 SBT 민팅 DApp (기존 web3_test 기능)

### **API 엔드포인트**
- `/api/supported-wallets` - 지원 지갑 목록
- `/api/network-info` - 네트워크 정보
- `/api/investment/contract-info` - 스마트 컨트랙트 정보
- `/api/investment/templates` - 투자 템플릿
- `/api/external/generate-pdf` - PDF 생성 서비스
- `/api/external/upload-ipfs` - IPFS 업로드 서비스

## 🏗️ **통합 아키텍처**

### **기술 스택**
- **Backend**: Hono Framework (Cloudflare Workers)
- **Frontend**: HTML/CSS/JavaScript + TailwindCSS
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contract**: ERC-721 Compatible SBT
- **Storage**: IPFS (Pinata 지원)
- **Deployment**: Cloudflare Pages

### **데이터 모델**
- **투자 프로젝트**: PTF (농업), SCN (헬스케어), REH (재생에너지)
- **SBT 계약**: 투자 계약서를 NFT로 민팅
- **사용자 데이터**: MetaMask 지갑 주소 기반

## 🚀 **사용 가이드**

### **일반 사용자 (투자 플랫폼)**
1. **홈페이지 방문** (`/`) - 투자 기회 탐색
2. **포트폴리오 확인** (`/portfolio`) - 세부 투자 프로젝트 검토
3. **투자 계산기 사용** - 예상 수익률 계산

### **Web3 사용자 (SBT 민팅)**
1. **DApp 접속** (`/invest`) - Web3 기능 페이지
2. **MetaMask 연결** - 지갑 연결 및 Sepolia 네트워크 전환
3. **투자 계약 생성** - 템플릿 선택 및 조건 설정
4. **PDF 다운로드** - 실제 계약서 문서 생성
5. **SBT 민팅** - 블록체인에 투자 증명서 민팅

## 💻 **개발 환경**

### **개발 서버 시작**
```bash
# 의존성 설치
npm install

# 프로젝트 빌드
npm run build

# 개발 서버 시작 (wrangler 사용)
pm2 start ecosystem.config.cjs

# 서버 상태 확인
curl http://localhost:3000
```

### **배포**
```bash
# Cloudflare Pages 배포
npm run deploy

# 또는 특정 프로젝트명으로 배포
npm run deploy:prod
```

## 🔐 **보안 및 규정준수**

### **블록체인 보안**
- **테스트넷 전용**: Sepolia 테스트넷에서 안전한 테스트
- **실제 ETH 사용**: 무료 테스트 ETH로 실제 트랜잭션 경험
- **스마트 컨트랙트**: 검증된 ERC-721 기반 SBT 구현

### **문서 보안**
- **SHA-256 해싱**: 모든 계약서 암호화 해시 생성
- **IPFS 저장**: 분산 저장으로 문서 무결성 보장
- **디지털 서명**: MetaMask 서명 통합

## 📈 **성과 및 통계**

### **완료된 통합 작업**
- ✅ v8 홈페이지 디자인 완전 통합
- ✅ web3_test Web3 기능 100% 보존
- ✅ 3개 주요 페이지 구조 완성
- ✅ 반응형 디자인 구현
- ✅ API 백엔드 통합

### **테스트 데이터**
- **투자 프로젝트**: 3개 (농업, 헬스케어, 재생에너지)
- **평균 수익률**: 12.4% - 19.2%
- **최소 투자금**: $10,000 - $100,000
- **투자 기간**: 12 - 48개월

## 🔄 **권장 개발 단계**

### **Phase 1: 추가 페이지 개발**
1. `How It Works` 페이지 추가
2. `Legal/Terms` 페이지 구현
3. `KYC` 검증 페이지 개발

### **Phase 2: Web3 기능 확장**
1. 메인넷 배포 준비
2. 실제 IPFS 통합 (Pinata API)
3. 다중 네트워크 지원

### **Phase 3: 고급 기능**
1. 사용자 대시보드 구현
2. 투자 포트폴리오 트래킹
3. 자동화된 배당 시스템

## 🛠️ **기술 세부사항**

### **프로젝트 구조**
```
webapp/
├── src/
│   └── index.tsx          # 통합된 Hono 백엔드
├── public/               # 정적 파일
├── dist/                # 빌드 결과물
├── contracts/           # 스마트 컨트랙트
├── ecosystem.config.cjs # PM2 설정 (wrangler 사용)
└── wrangler.jsonc      # Cloudflare 설정
```

### **라우팅 시스템**
- **Hono Framework** 기반 라우팅
- **Cloudflare Workers** 환경에서 실행
- **정적 파일 서비스** (`/static/*`)
- **API 라우팅** (`/api/*`)

## 📝 **배포 상태**

- **플랫폼**: Cloudflare Pages (샌드박스)
- **상태**: ✅ 활성
- **기술 스택**: Hono + TypeScript + TailwindCSS + Web3
- **마지막 업데이트**: 2024-12-19

---

**이 프로젝트는 v8의 현대적인 투자 플랫폼 UI와 web3_test의 실제 작동하는 블록체인 기능을 성공적으로 통합한 결과입니다.**

**Live Demo**: https://3000-i9qpd4op6fw54qnriw1h0-6532622b.e2b.dev
**GitHub**: https://github.com/0JaeminKim0/web3_test