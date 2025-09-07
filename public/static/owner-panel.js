// Contract Owner Panel - Withdraw Functions
class ContractOwnerPanel {
    constructor() {
        this.contractAddress = '0x6b52101F208B8b170942605C0367eF2296Ce779c';
        this.contractABI = [
            {
                "inputs": [],
                "name": "withdraw",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
        this.init();
    }

    async init() {
        if (typeof window.ethereum !== 'undefined') {
            // ethers v6 syntax
            this.provider = new ethers.BrowserProvider(window.ethereum);
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.provider);
        }
    }

    async connectWallet() {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.signer = await this.provider.getSigner();
            this.signedContract = this.contract.connect(this.signer);
            
            const address = await this.signer.getAddress();
            const owner = await this.contract.owner();
            
            document.getElementById('walletAddress').textContent = address;
            document.getElementById('ownerAddress').textContent = owner;
            document.getElementById('isOwner').textContent = (address.toLowerCase() === owner.toLowerCase()) ? 'YES' : 'NO';
            
            await this.updateBalance();
            
        } catch (error) {
            console.error('Wallet connection failed:', error);
            alert('지갑 연결 실패: ' + error.message);
        }
    }

    async updateBalance() {
        try {
            // Get contract ETH balance
            const balance = await this.provider.getBalance(this.contractAddress);
            const balanceETH = ethers.formatEther(balance);
            document.getElementById('contractBalance').textContent = balanceETH + ' ETH';
            
            // Get owner wallet balance
            const owner = await this.contract.owner();
            const ownerBalance = await this.provider.getBalance(owner);
            const ownerBalanceETH = ethers.formatEther(ownerBalance);
            document.getElementById('ownerBalance').textContent = ownerBalanceETH + ' ETH';
            
        } catch (error) {
            console.error('Balance update failed:', error);
        }
    }

    async withdrawFunds() {
        try {
            if (!this.signedContract) {
                alert('먼저 지갑을 연결하세요.');
                return;
            }

            const address = await this.signer.getAddress();
            const owner = await this.contract.owner();
            
            if (address.toLowerCase() !== owner.toLowerCase()) {
                alert('오직 컨트랙트 소유자만 출금할 수 있습니다.');
                return;
            }

            const balance = await this.provider.getBalance(this.contractAddress);
            if (balance.eq(0)) {
                alert('컨트랙트에 출금할 자금이 없습니다.');
                return;
            }

            document.getElementById('withdrawStatus').textContent = 'Withdrawing...';
            
            const tx = await this.signedContract.withdraw();
            console.log('Withdrawal transaction:', tx);
            
            document.getElementById('withdrawStatus').textContent = 'Transaction sent. Waiting for confirmation...';
            
            const receipt = await tx.wait();
            console.log('Withdrawal confirmed:', receipt);
            
            document.getElementById('withdrawStatus').textContent = 'Withdrawal successful!';
            
            // Update balances
            await this.updateBalance();
            
        } catch (error) {
            console.error('Withdrawal failed:', error);
            document.getElementById('withdrawStatus').textContent = 'Withdrawal failed: ' + error.message;
        }
    }
}

// Initialize on page load
let ownerPanel;
document.addEventListener('DOMContentLoaded', () => {
    ownerPanel = new ContractOwnerPanel();
});