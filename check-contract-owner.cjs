// Check contract owner directly
const { ethers } = require('ethers');

async function checkContractOwner() {
    try {
        // Sepolia RPC endpoint
        const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/84842078b09946638c03157f83405213');
        
        const contractAddress = '0x6b52101F208B8b170942605C0367eF2296Ce779c';
        const providedAddress = '0xbeC016ccc51b89a8c40bdf67ec461e8549B64e75';
        
        // owner() function ABI
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
        
        console.log('🔍 컨트랙트 소유자 확인 중...');
        console.log('📍 컨트랙트 주소:', contractAddress);
        console.log('👤 제공된 주소:', providedAddress);
        console.log('');
        
        // Get actual owner
        const actualOwner = await contract.owner();
        console.log('✅ 실제 컨트랙트 소유자:', actualOwner);
        
        // Get contract balance
        const balance = await provider.getBalance(contractAddress);
        const balanceETH = ethers.utils.formatEther(balance);
        console.log('💰 컨트랙트 잔고:', balanceETH, 'ETH');
        
        // Compare addresses
        const isMatch = actualOwner.toLowerCase() === providedAddress.toLowerCase();
        console.log('');
        console.log('🔍 주소 비교 결과:');
        console.log('   실제 소유자:', actualOwner);
        console.log('   제공된 주소:', providedAddress);
        console.log('   일치 여부:', isMatch ? '✅ 일치함' : '❌ 일치하지 않음');
        
        if (!isMatch) {
            console.log('');
            console.log('⚠️  문제점:');
            console.log('   - 제공된 주소는 컨트랙트 소유자가 아닙니다.');
            console.log('   - 실제 소유자만 withdraw() 함수를 호출할 수 있습니다.');
            console.log('   - 컨트랙트 배포 시 사용한 주소가 소유자가 됩니다.');
        } else {
            console.log('');
            console.log('✅ 해결책:');
            console.log('   - 제공된 주소로 MetaMask에 연결하세요.');
            console.log('   - 소유자 패널에서 withdraw() 함수를 호출할 수 있습니다.');
        }
        
    } catch (error) {
        console.error('❌ 오류 발생:', error.message);
    }
}

checkContractOwner();