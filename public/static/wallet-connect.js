// Multi-Wallet Connection Manager
class WalletManager {
    constructor() {
        this.currentWallet = null;
        this.currentAccount = null;
        this.currentChainId = null;
        this.supportedWallets = [];
        this.networks = [];
        
        this.init();
    }

    async init() {
        await this.loadSupportedWallets();
        await this.loadNetworks();
        this.renderWalletCards();
        this.setupEventListeners();
        this.checkExistingConnection();
    }

    async loadSupportedWallets() {
        try {
            const response = await axios.get('/api/supported-wallets');
            this.supportedWallets = response.data.wallets;
            
            // Check which wallets are actually installed
            this.supportedWallets.forEach(wallet => {
                wallet.installed = this.isWalletInstalled(wallet.id);
            });
        } catch (error) {
            console.error('Failed to load supported wallets:', error);
        }
    }

    async loadNetworks() {
        try {
            const response = await axios.get('/api/network-info');
            this.networks = response.data.networks;
        } catch (error) {
            console.error('Failed to load networks:', error);
        }
    }

    isWalletInstalled(walletId) {
        switch (walletId) {
            case 'metamask':
                return typeof window.ethereum !== 'undefined' && 
                       (window.ethereum.isMetaMask || window.ethereum.providers?.some(p => p.isMetaMask));
            case 'trustwallet':
                return typeof window.ethereum !== 'undefined' && window.ethereum.isTrust;
            case 'coinbase':
                return typeof window.ethereum !== 'undefined' && 
                       (window.ethereum.isCoinbaseWallet || window.ethereum.providers?.some(p => p.isCoinbaseWallet));
            case 'walletconnect':
                return true; // Always available via QR code/deep linking
            default:
                return false;
        }
    }

    renderWalletCards() {
        const container = document.querySelector('.grid.md\\:grid-cols-2.lg\\:grid-cols-4');
        if (!container) return;

        container.innerHTML = this.supportedWallets.map(wallet => `
            <div class="wallet-card bg-white/10 backdrop-blur rounded-xl p-6 text-center text-white cursor-pointer hover:bg-white/20 transition-all"
                 data-wallet-id="${wallet.id}">
                <div class="text-4xl mb-4">${wallet.icon}</div>
                <h3 class="text-xl font-semibold mb-2">${wallet.name}</h3>
                <div class="text-sm mb-4 ${wallet.installed ? 'text-green-300' : 'text-gray-400'}">
                    ${wallet.installed ? '✓ Installed' : '⚠ Not Detected'}
                </div>
                <button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ${!wallet.installed && wallet.id !== 'walletconnect' ? 'opacity-50' : ''}">
                    ${wallet.installed || wallet.id === 'walletconnect' ? 'Connect' : 'Install & Connect'}
                </button>
            </div>
        `).join('');

        // Add click listeners
        container.querySelectorAll('.wallet-card').forEach(card => {
            card.addEventListener('click', () => {
                const walletId = card.dataset.walletId;
                this.connectWallet(walletId);
            });
        });
    }

    async connectWallet(walletId) {
        this.showStatus('connecting', `Connecting to ${this.getWalletName(walletId)}...`);

        try {
            switch (walletId) {
                case 'metamask':
                    await this.connectMetaMask();
                    break;
                case 'trustwallet':
                    await this.connectTrustWallet();
                    break;
                case 'coinbase':
                    await this.connectCoinbaseWallet();
                    break;
                case 'walletconnect':
                    await this.connectWalletConnect();
                    break;
                default:
                    throw new Error('Unsupported wallet');
            }
        } catch (error) {
            console.error('Wallet connection error:', error);
            this.showStatus('error', `Failed to connect: ${error.message}`);
            setTimeout(() => this.hideStatus(), 5000);
        }
    }

    async connectMetaMask() {
        if (!window.ethereum || !window.ethereum.isMetaMask) {
            if (this.isMobile()) {
                // Open in MetaMask mobile app
                window.open('https://metamask.app.link/dapp/' + window.location.host + window.location.pathname);
                return;
            }
            throw new Error('MetaMask is not installed. Please install MetaMask extension.');
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        this.handleSuccessfulConnection('metamask', accounts[0], chainId);
        this.setupWalletEventListeners();
    }

    async connectTrustWallet() {
        if (!window.ethereum || !window.ethereum.isTrust) {
            if (this.isMobile()) {
                // Open in Trust Wallet mobile app
                const url = 'https://link.trustwallet.com/open_url?coin_id=60&url=' + 
                           encodeURIComponent(window.location.href);
                window.open(url);
                return;
            }
            throw new Error('Trust Wallet is not installed. Please install Trust Wallet.');
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        this.handleSuccessfulConnection('trustwallet', accounts[0], chainId);
        this.setupWalletEventListeners();
    }

    async connectCoinbaseWallet() {
        if (!window.ethereum || !window.ethereum.isCoinbaseWallet) {
            if (this.isMobile()) {
                // Open in Coinbase Wallet mobile app
                const url = 'https://go.cb-w.com/dapp?cb_url=' + 
                           encodeURIComponent(window.location.href);
                window.open(url);
                return;
            }
            throw new Error('Coinbase Wallet is not installed. Please install Coinbase Wallet.');
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        this.handleSuccessfulConnection('coinbase', accounts[0], chainId);
        this.setupWalletEventListeners();
    }

    async connectWalletConnect() {
        // For now, show instructions for WalletConnect
        // In a production app, you'd implement the WalletConnect protocol
        this.showStatus('info', 'WalletConnect integration requires additional setup. Please use one of the other wallet options for now.');
        setTimeout(() => this.hideStatus(), 5000);
    }

    handleSuccessfulConnection(walletType, account, chainId) {
        this.currentWallet = walletType;
        this.currentAccount = account;
        this.currentChainId = chainId;
        
        this.showStatus('success', `Successfully connected to ${this.getWalletName(walletType)}!`);
        this.updateWalletInfo();
        
        // Store connection info
        localStorage.setItem('connectedWallet', walletType);
        localStorage.setItem('connectedAccount', account);
        
        setTimeout(() => this.hideStatus(), 3000);
    }

    updateWalletInfo() {
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');
        const walletNetwork = document.getElementById('wallet-network');

        walletAddress.textContent = this.currentAccount;
        
        const network = this.networks.find(n => n.chainId === this.currentChainId);
        walletNetwork.textContent = network ? `${network.name} (${network.symbol})` : 'Unknown Network';

        walletInfo.classList.remove('hidden');
    }

    setupWalletEventListeners() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.handleDisconnection();
                } else {
                    this.currentAccount = accounts[0];
                    this.updateWalletInfo();
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                this.currentChainId = chainId;
                this.updateWalletInfo();
            });
        }
    }

    setupEventListeners() {
        // Disconnect button
        document.getElementById('disconnect-btn')?.addEventListener('click', () => {
            this.disconnect();
        });

        // Switch network button
        document.getElementById('switch-network-btn')?.addEventListener('click', () => {
            this.showNetworkModal();
        });

        // Sign message button
        document.getElementById('sign-message-btn')?.addEventListener('click', () => {
            this.signMessage();
        });

        // Network modal
        document.getElementById('close-modal')?.addEventListener('click', () => {
            this.hideNetworkModal();
        });

        // Click outside modal to close
        document.getElementById('network-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'network-modal') {
                this.hideNetworkModal();
            }
        });
    }

    async checkExistingConnection() {
        const savedWallet = localStorage.getItem('connectedWallet');
        const savedAccount = localStorage.getItem('connectedAccount');

        if (savedWallet && savedAccount && window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.includes(savedAccount)) {
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    this.handleSuccessfulConnection(savedWallet, savedAccount, chainId);
                    this.setupWalletEventListeners();
                }
            } catch (error) {
                console.error('Failed to restore connection:', error);
                this.clearSavedConnection();
            }
        }
    }

    disconnect() {
        this.currentWallet = null;
        this.currentAccount = null;
        this.currentChainId = null;
        
        document.getElementById('wallet-info').classList.add('hidden');
        this.clearSavedConnection();
        this.showStatus('info', 'Wallet disconnected');
        setTimeout(() => this.hideStatus(), 3000);
    }

    clearSavedConnection() {
        localStorage.removeItem('connectedWallet');
        localStorage.removeItem('connectedAccount');
    }

    showNetworkModal() {
        const modal = document.getElementById('network-modal');
        const networksList = document.getElementById('networks-list');
        
        networksList.innerHTML = this.networks.map(network => `
            <button class="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors ${network.chainId === this.currentChainId ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}"
                    data-chain-id="${network.chainId}">
                <div class="font-medium">${network.name}</div>
                <div class="text-sm text-gray-600">${network.symbol} • Chain ID: ${parseInt(network.chainId, 16)}</div>
            </button>
        `).join('');

        // Add click listeners for network selection
        networksList.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchNetwork(btn.dataset.chainId);
            });
        });

        modal.classList.remove('hidden');
    }

    hideNetworkModal() {
        document.getElementById('network-modal').classList.add('hidden');
    }

    async switchNetwork(chainId) {
        if (!window.ethereum) return;

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }],
            });
            this.hideNetworkModal();
            this.showStatus('success', 'Network switched successfully!');
            setTimeout(() => this.hideStatus(), 3000);
        } catch (error) {
            console.error('Failed to switch network:', error);
            this.showStatus('error', `Failed to switch network: ${error.message}`);
            setTimeout(() => this.hideStatus(), 5000);
        }
    }

    async signMessage() {
        if (!window.ethereum || !this.currentAccount) return;

        const message = "Welcome to our Web3 application! This signature confirms your identity.";
        
        try {
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, this.currentAccount],
            });
            
            this.showStatus('success', 'Message signed successfully!');
            console.log('Signature:', signature);
            setTimeout(() => this.hideStatus(), 3000);
        } catch (error) {
            console.error('Failed to sign message:', error);
            this.showStatus('error', `Failed to sign message: ${error.message}`);
            setTimeout(() => this.hideStatus(), 5000);
        }
    }

    showStatus(type, message) {
        const statusEl = document.getElementById('connection-status');
        const iconEl = document.getElementById('status-icon');
        const titleEl = document.getElementById('status-title');
        const messageEl = document.getElementById('status-message');

        // Remove existing classes
        statusEl.className = 'mb-6 p-4 rounded-lg border-l-4';

        switch (type) {
            case 'connecting':
                statusEl.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-700');
                iconEl.innerHTML = '<i class="fas fa-spinner fa-spin text-blue-500"></i>';
                titleEl.textContent = 'Connecting...';
                break;
            case 'success':
                statusEl.classList.add('bg-green-50', 'border-green-500', 'text-green-700');
                iconEl.innerHTML = '<i class="fas fa-check-circle text-green-500"></i>';
                titleEl.textContent = 'Success';
                break;
            case 'error':
                statusEl.classList.add('bg-red-50', 'border-red-500', 'text-red-700');
                iconEl.innerHTML = '<i class="fas fa-exclamation-circle text-red-500"></i>';
                titleEl.textContent = 'Error';
                break;
            case 'info':
                statusEl.classList.add('bg-blue-50', 'border-blue-500', 'text-blue-700');
                iconEl.innerHTML = '<i class="fas fa-info-circle text-blue-500"></i>';
                titleEl.textContent = 'Info';
                break;
        }

        messageEl.textContent = message;
        statusEl.classList.remove('hidden');
    }

    hideStatus() {
        document.getElementById('connection-status').classList.add('hidden');
    }

    handleDisconnection() {
        this.disconnect();
        this.showStatus('info', 'Wallet disconnected');
        setTimeout(() => this.hideStatus(), 3000);
    }

    getWalletName(walletId) {
        const wallet = this.supportedWallets.find(w => w.id === walletId);
        return wallet ? wallet.name : 'Unknown Wallet';
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
}

// Initialize wallet manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.walletManager = new WalletManager();
});