const { ethers } = require('ethers');

async function verifyOwnership() {
    try {
        const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/84842078b09946638c03157f83405213');
        
        const contractAddress = '0x6b52101F208B8b170942605C0367eF2296Ce779c';
        const deployerAddress = '0xbeC016ccc51b89a8c40bdf67ec461e8549B64e75';
        const investorAddress = '0x2904d183F5dd3455D1D48D73577A759565f6e0b5';
        
        const ownerABI = [
            {
                "inputs": [],
                "name": "owner",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];

        const contract = new ethers.Contract(contractAddress, ownerABI, provider);
        
        console.log('🔍 주소 확인 결과:');
        console.log('');
        
        // Get actual owner
        const actualOwner = await contract.owner();
        console.log('✅ 실제 컨트랙트 소유자:', actualOwner);
        console.log('👤 배포자 주소:', deployerAddress);
        console.log('💰 투자자 주소:', investorAddress);
        
        // Get contract balance
        const balance = await provider.getBalance(contractAddress);
        const balanceETH = ethers.utils.formatEther(balance);
        console.log('💵 컨트랙트 잔고:', balanceETH, 'ETH');
        
        console.log('');
        console.log('📊 분석:');
        
        const deployerIsOwner = actualOwner.toLowerCase() === deployerAddress.toLowerCase();
        const investorIsOwner = actualOwner.toLowerCase() === investorAddress.toLowerCase();
        
        if (deployerIsOwner) {
            console.log('✅ 배포자가 소유자입니다!');
            console.log('💡 해결책: 배포자 주소 (0xbeC016...) 로 MetaMask 연결하여 withdraw() 호출');
        } else if (investorIsOwner) {
            console.log('✅ 투자자가 소유자입니다!');
            console.log('💡 해결책: 투자자 주소 (0x2904d183...) 로 MetaMask 연결하여 withdraw() 호출');
        } else {
            console.log('❓ 다른 주소가 소유자입니다:', actualOwner);
        }
        
        console.log('');
        console.log('🎯 다음 단계:');
        console.log('1️⃣ 소유자 주소로 MetaMask 연결');
        console.log('2️⃣ 소유자 패널에서 출금하기');
        console.log('3️⃣ URL: https://3000-iqmpxivtxcb6h9k70iens-6532622b.e2b.dev/owner-panel.html');
        
    } catch (error) {
        console.error('❌ 오류:', error.message);
    }
}

verifyOwnership();
