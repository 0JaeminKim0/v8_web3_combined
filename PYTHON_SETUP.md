# 🐍 Python 환경 설정 가이드

## 📋 Requirements 파일들

### 📦 **requirements.txt** (기본 - 권장)
핵심 Web3 개발 라이브러리들만 포함:
```bash
pip install -r requirements.txt
```

**포함된 라이브러리:**
- `web3` - 이더리움 블록체인 상호작용
- `eth-account` - 계정 관리 및 서명
- `cryptography` - 암호화 기능
- `requests` - HTTP API 호출
- `aiohttp` - 비동기 HTTP 클라이언트

### 🛠️ **requirements-dev.txt** (개발용)
개발 도구와 테스팅 프레임워크 포함:
```bash
pip install -r requirements-dev.txt
```

**추가 기능:**
- 테스팅: `pytest`, `pytest-asyncio`
- 코드 품질: `black`, `flake8`, `mypy`
- 개발 도구: `jupyter`, `ipython`
- 디버깅: `pdb++`, `memory-profiler`

### 🚀 **requirements-prod.txt** (프로덕션용)
프로덕션 배포용 최적화된 패키지들:
```bash
pip install -r requirements-prod.txt
```

**프로덕션 기능:**
- 웹 서버: `gunicorn`, `uvicorn`
- 데이터베이스: `psycopg2-binary`, `sqlalchemy`
- 모니터링: `sentry-sdk`, `structlog`
- 보안: `python-jose`, `bcrypt`

## 🚀 빠른 시작

### 1단계: 가상환경 생성
```bash
cd /home/user/webapp
python3 -m venv web3_env
source web3_env/bin/activate
```

### 2단계: 의존성 설치
```bash
# 기본 개발 환경
pip install -r requirements.txt

# 또는 전체 개발 환경  
pip install -r requirements-dev.txt

# 또는 프로덕션 환경
pip install -r requirements-prod.txt
```

### 3단계: 설치 확인
```bash
python3 -c "
from web3 import Web3
from eth_account import Account
print('✅ Web3 환경 준비 완료!')
print(f'📦 Web3 버전: {Web3.__version__ if hasattr(Web3, '__version__') else 'OK'}')
account = Account.create()
print(f'🔑 테스트 계정: {account.address[:10]}...')
"
```

## 💡 사용 예시

### 🔐 계정 생성
```python
from eth_account import Account

# 새 계정 생성
account = Account.create()
print(f"주소: {account.address}")
print(f"개인키: {account.key.hex()}")

# 기존 개인키로 계정 복구
private_key = "0x1234567890abcdef..."
account = Account.from_key(private_key)
```

### 🌐 블록체인 연결
```python
from web3 import Web3

# Sepolia 테스트넷 연결
w3 = Web3(Web3.HTTPProvider('https://sepolia.infura.io/v3/YOUR_PROJECT_ID'))

if w3.is_connected():
    print("✅ 블록체인 연결 성공")
    print(f"최신 블록: {w3.eth.block_number}")
    
    # 계정 잔액 확인
    balance = w3.eth.get_balance('0x742d35Cc8058C65C0863a9e20C0be2A7C1234567')
    print(f"잔액: {w3.from_wei(balance, 'ether')} ETH")
```

### 💰 트랜잭션 전송
```python
from web3 import Web3
from eth_account import Account

w3 = Web3(Web3.HTTPProvider('https://sepolia.infura.io/v3/YOUR_PROJECT_ID'))
account = Account.from_key('YOUR_PRIVATE_KEY')

# 트랜잭션 생성
transaction = {
    'to': '0x742d35Cc8058C65C0863a9e20C0be2A7C1234567',
    'value': w3.to_wei(0.01, 'ether'),
    'gas': 21000,
    'gasPrice': w3.to_wei('10', 'gwei'),
    'nonce': w3.eth.get_transaction_count(account.address),
}

# 서명 및 전송
signed_txn = w3.eth.account.sign_transaction(transaction, account.key)
tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
print(f"트랜잭션 해시: {tx_hash.hex()}")
```

### 📄 스마트 계약 상호작용
```python
from web3 import Web3

w3 = Web3(Web3.HTTPProvider('https://sepolia.infura.io/v3/YOUR_PROJECT_ID'))

# 계약 ABI와 주소
contract_abi = [...] # 계약 ABI
contract_address = '0x6b52101F208B8b170942605C0367eF2296Ce779c'

# 계약 인스턴스 생성
contract = w3.eth.contract(address=contract_address, abi=contract_abi)

# 읽기 함수 호출
result = contract.functions.balanceOf('0x742d35...').call()
print(f"토큰 잔액: {result}")

# 쓰기 함수 호출 (트랜잭션)
transaction = contract.functions.transfer('0x742d35...', 100).build_transaction({
    'from': account.address,
    'gas': 100000,
    'gasPrice': w3.to_wei('10', 'gwei'),
    'nonce': w3.eth.get_transaction_count(account.address)
})
```

## 🔧 추가 패키지 설치

### 데이터 분석용
```bash
pip install pandas numpy matplotlib seaborn
```

### API 서버용  
```bash
pip install flask fastapi django
```

### 데이터베이스용
```bash
pip install psycopg2-binary sqlalchemy redis pymongo
```

### 테스팅용
```bash
pip install pytest pytest-asyncio pytest-cov
```

## 🌟 프로젝트 구조 예시

```
webapp/
├── web3_env/                 # 가상환경
├── requirements.txt          # 기본 의존성
├── requirements-dev.txt      # 개발 의존성
├── requirements-prod.txt     # 프로덕션 의존성
├── scripts/
│   ├── account_manager.py    # 계정 관리
│   ├── contract_deployer.py  # 계약 배포
│   └── transaction_monitor.py # 트랜잭션 모니터링
├── contracts/
│   └── InvestmentReceiptSBT.sol
├── src/
│   ├── index.tsx            # Hono 백엔드
│   └── web3_utils.py        # Python Web3 유틸리티
└── public/
    └── static/
        └── investment-dapp.js
```

## 🎯 환경별 사용법

### 로컬 개발
```bash
source web3_env/bin/activate
pip install -r requirements-dev.txt
python3 scripts/your_script.py
```

### 프로덕션 배포
```bash
pip install -r requirements-prod.txt
gunicorn app:app --workers 4 --bind 0.0.0.0:8000
```

### CI/CD 파이프라인
```bash
pip install -r requirements.txt
pytest tests/
black --check .
flake8 .
```

---

**🎉 이제 완전한 Python Web3 개발 환경이 준비되었습니다!**

모든 requirements 파일이 생성되었고, 프로젝트의 필요에 따라 선택해서 사용할 수 있습니다.