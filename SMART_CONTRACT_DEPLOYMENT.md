# 🚀 실제 SBT 스마트 계약 배포 가이드

## 📋 배포 전 준비사항

### 1. 필요한 것들
- **MetaMask 지갑** (개인키 필요)
- **Sepolia 테스트 ETH** (최소 0.05 ETH 권장)
- **Infura 계정** (RPC 엔드포인트용)
- **Etherscan API 키** (계약 검증용)

### 2. 테스트넷 ETH 확보
```bash
# Sepolia Faucets
https://sepoliafaucet.com
https://faucets.chain.link/sepolia
https://sepolia-faucet.pk910.de
```

### 3. Infura 설정
1. **Infura 가입**: https://infura.io
2. **새 프로젝트 생성**: Ethereum > Create Project
3. **엔드포인트 복사**: Sepolia 네트워크 URL 복사

## 🛠️ 배포 단계

### 1단계: 의존성 설치
```bash
cd /home/user/webapp
npm install
```

### 2단계: 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
nano .env
```

**.env 파일 내용 예시:**
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
ETHERSCAN_API_KEY=ABC123DEF456GHI789JKL012MNO345PQR678STU
```

⚠️ **보안 주의**: `.env` 파일을 절대 공개하지 마세요!

### 3단계: 스마트 계약 컴파일
```bash
npm run contract:compile
```

### 4단계: 스마트 계약 배포
```bash
npm run contract:deploy
```

**배포 성공 시 출력 예시:**
```
🚀 Deploying Investment Receipt SBT to Sepolia Testnet...
📝 Deploying with account: 0x742d35Cc8058C65C0863a9e20C0be2A7C1234567
💰 Account balance: 0.123456789 ETH
⏳ Waiting for deployment...
✅ Contract deployed successfully!
📍 Contract address: 0xABC123DEF456GHI789JKL012MNO345PQR678STU
🔍 Etherscan URL: https://sepolia.etherscan.io/address/0xABC123DEF456GHI789JKL012MNO345PQR678STU
🏷️  Contract name: Investment Receipt SBT
🎯 Contract symbol: IRSBT
💾 Deployment info saved to deployment-info.json

🧪 Testing SBT minting...
✅ Test SBT minted successfully!
🔗 Transaction: https://sepolia.etherscan.io/tx/0x1234567890abcdef...
📊 Total SBT supply: 1

🎉 Deployment completed successfully!
```

### 5단계: 계약 주소 업데이트
배포 성공 후 프론트엔드 코드에 실제 계약 주소를 업데이트:

```javascript
// public/static/investment-dapp.js에서
this.contractInfo = {
    address: '0xABC123DEF456GHI789JKL012MNO345PQR678STU', // 실제 배포된 주소
    name: 'InvestmentReceiptSBT',
    network: 'Sepolia Testnet',
    networkId: '0xaa36a7',
    testnet: true
};
```

## 🔍 실제 SBT 토큰 확인 방법

### 1. Etherscan에서 확인
```
https://sepolia.etherscan.io/address/[CONTRACT_ADDRESS]
```

### 2. OpenSea 테스트넷에서 확인
```
https://testnets.opensea.io/assets/sepolia/[CONTRACT_ADDRESS]/[TOKEN_ID]
```

### 3. MetaMask에서 NFT 추가
1. **MetaMask 열기** → NFTs 탭
2. **Import NFT** 클릭
3. **Contract Address**: 배포된 계약 주소
4. **Token ID**: 발행된 토큰 ID (1부터 시작)

### 4. 웹 앱에서 확인
- **대시보드**: 실제 토큰이 "🔗 REAL" 배지와 함께 표시
- **트랜잭션 해시**: Etherscan에서 확인 가능
- **토큰 메타데이터**: IPFS 링크를 통해 계약서 확인

## 🎯 실제 SBT 발행 플로우

### 배포 후 앱 사용법:
1. **지갑 연결** → Sepolia 네트워크 확인
2. **투자 생성** → 실제 ETH 금액 입력  
3. **계약 생성** → PDF 및 메타데이터 생성
4. **실제 민팅** → 스마트 계약의 `mintInvestment()` 호출
5. **SBT 수령** → MetaMask에서 실제 NFT 확인 가능
6. **Etherscan 확인** → 블록체인에서 토큰 소유권 확인

## 🛡️ 스마트 계약 기능

### 주요 기능들:
- ✅ **Soul Bound Token**: 전송 불가능한 NFT
- ✅ **투자 메타데이터**: IPFS 해시, 계약 조건 저장
- ✅ **수익 계산**: 시간 경과에 따른 수익 자동 계산
- ✅ **소유권 증명**: 블록체인에 영구 기록
- ✅ **OpenZeppelin 기반**: 검증된 보안 표준 사용

### 계약 함수들:
- `mintInvestment()`: 새 SBT 발행
- `getInvestment()`: 투자 정보 조회
- `calculateCurrentValue()`: 현재 가치 계산
- `getInvestorTokens()`: 투자자 소유 토큰 목록

## 📊 배포 비용 예상

### Sepolia 테스트넷 (무료):
- **배포 비용**: ~0.01-0.02 ETH (가스비)
- **SBT 발행**: ~0.001-0.003 ETH per mint
- **총 테스트 비용**: ~0.05 ETH 권장

### 실제 이더리움 메인넷 (참고):
- **배포 비용**: ~$50-150 (가스비 변동)
- **SBT 발행**: ~$10-30 per mint
- **총 배포 비용**: ~$100-200 예상

## 🚀 다음 단계

배포 완료 후:
1. **계약 검증**: Etherscan에서 소스코드 공개
2. **보안 감사**: 코드 리뷰 및 테스트
3. **메인넷 배포**: 실제 서비스 런칭
4. **UI/UX 개선**: 사용자 경험 최적화

---

**배포 후 실제 SBT 토큰을 Etherscan과 OpenSea에서 확인할 수 있습니다!** 🎉