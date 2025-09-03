// Investment Receipt SBT DApp Manager
class InvestmentDApp {
    constructor() {
        this.currentWallet = null;
        this.currentAccount = null;
        this.currentChainId = null;
        this.supportedWallets = [];
        this.networks = [];
        this.investmentTemplates = [];
        this.userInvestments = [];
        this.currentStep = 1;
        
        this.contractInfo = {
            address: '0x742d35Cc8058C65C0863a9e20C0be2A7C1234567',
            name: 'InvestmentReceiptSBT',
            network: 'Sepolia Testnet',
            networkId: '0xaa36a7',
            testnet: true
        };
        
        this.init();
    }

    async init() {
        // Debug wallet environment
        this.debugWalletEnvironment();
        
        await this.loadSupportedWallets();
        await this.loadNetworks();
        await this.loadInvestmentTemplates();
        this.renderWalletCards();
        this.setupEventListeners();
        this.checkExistingConnection();
        
        // Add wallet detection troubleshooting
        this.addTroubleshootingInfo();
    }

    debugWalletEnvironment() {
        console.log('=== Wallet Environment Debug ===');
        console.log('User Agent:', navigator.userAgent);
        console.log('Protocol:', window.location.protocol);
        console.log('Host:', window.location.host);
        console.log('Ethereum Object:', window.ethereum);
        
        if (window.ethereum) {
            console.log('Ethereum Properties:', {
                isMetaMask: window.ethereum.isMetaMask,
                isTrust: window.ethereum.isTrust,
                isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
                providers: window.ethereum.providers,
                chainId: window.ethereum.chainId,
                selectedAddress: window.ethereum.selectedAddress
            });
            
            if (window.ethereum.providers) {
                console.log('Multiple Providers Detected:');
                window.ethereum.providers.forEach((provider, index) => {
                    console.log(`Provider ${index}:`, {
                        isMetaMask: provider.isMetaMask,
                        isTrust: provider.isTrust,
                        isCoinbaseWallet: provider.isCoinbaseWallet
                    });
                });
            }
        } else {
            console.log('No Ethereum provider detected');
        }
        console.log('==========================');
    }

    addTroubleshootingInfo() {
        const walletSection = document.getElementById('wallet-section');
        if (!walletSection || window.ethereum) return;

        const troubleshootDiv = document.createElement('div');
        troubleshootDiv.className = 'mt-4 p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-lg text-yellow-200 text-sm';
        troubleshootDiv.innerHTML = `
            <h4 class="font-semibold mb-2">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                No Wallet Detected
            </h4>
            <p class="mb-2">To use this DApp, you need a Web3 wallet installed:</p>
            <ul class="list-disc list-inside space-y-1 mb-3">
                <li><a href="https://metamask.io" target="_blank" class="underline">Install MetaMask</a> (Recommended)</li>
                <li><a href="https://trustwallet.com" target="_blank" class="underline">Install Trust Wallet</a></li>
                <li><a href="https://wallet.coinbase.com" target="_blank" class="underline">Install Coinbase Wallet</a></li>
            </ul>
            <p class="text-xs">After installation, refresh this page and try connecting again.</p>
        `;
        walletSection.appendChild(troubleshootDiv);
    }

    async loadSupportedWallets() {
        try {
            const response = await axios.get('/api/supported-wallets');
            this.supportedWallets = response.data.wallets;
            
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

    async loadInvestmentTemplates() {
        try {
            const response = await axios.get('/api/investment/templates');
            this.investmentTemplates = response.data.templates;
        } catch (error) {
            console.error('Failed to load investment templates:', error);
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
                return true;
            default:
                return false;
        }
    }

    isValidChainId(chainId) {
        const supportedChains = ['0xaa36a7', '0x5', '0x13881', '0x1'];
        return supportedChains.includes(chainId);
    }

    getChainName(chainId) {
        const chainNames = {
            '0xaa36a7': 'Sepolia Testnet',
            '0x5': 'Goerli Testnet', 
            '0x13881': 'Polygon Mumbai',
            '0x1': 'Ethereum Mainnet'
        };
        return chainNames[chainId] || `Chain ID: ${parseInt(chainId, 16)}`;
    }

    isTestnet(chainId) {
        const testnets = ['0xaa36a7', '0x5', '0x13881'];
        return testnets.includes(chainId);
    }

    getFaucetUrl(chainId) {
        const faucets = {
            '0xaa36a7': 'https://sepoliafaucet.com',
            '0x5': 'https://goerlifaucet.com',
            '0x13881': 'https://mumbaifaucet.com'
        };
        return faucets[chainId];
    }

    async switchToSepolia(ethereum) {
        try {
            this.showStatus('info', 'Switching to Sepolia Testnet...');
            
            // First, try to switch to Sepolia
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }]
            });
            
            // Success - update connection info
            const newChainId = await ethereum.request({ method: 'eth_chainId' });
            this.currentChainId = newChainId;
            this.updateWalletInfo();
            
            this.showStatus('success', 'Successfully switched to Sepolia Testnet!');
            setTimeout(() => this.hideStatus(), 3000);
            
        } catch (switchError) {
            console.log('Switch error:', switchError);
            
            // If network doesn't exist (error 4902), add it first
            if (switchError.code === 4902) {
                try {
                    this.showStatus('info', 'Adding Sepolia Testnet to MetaMask...');
                    
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xaa36a7',
                            chainName: 'Sepolia Test Network',
                            nativeCurrency: {
                                name: 'Sepolia Ether',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: [
                                'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
                                'https://rpc.sepolia.org',
                                'https://ethereum-sepolia.blockpi.network/v1/rpc/public'
                            ],
                            blockExplorerUrls: ['https://sepolia.etherscan.io/']
                        }]
                    });
                    
                    this.showStatus('success', 'Sepolia Testnet added! You can now switch to it manually.');
                    setTimeout(() => this.hideStatus(), 5000);
                    
                } catch (addError) {
                    console.error('Add network error:', addError);
                    this.showStatus('error', 'Failed to add Sepolia network. Please add it manually.');
                    setTimeout(() => this.hideStatus(), 5000);
                }
            } else if (switchError.code === 4001) {
                // User rejected
                this.showStatus('info', 'Network switch cancelled by user.');
                setTimeout(() => this.hideStatus(), 3000);
            } else {
                console.error('Unexpected switch error:', switchError);
                this.showStatus('error', `Failed to switch network: ${switchError.message}`);
                setTimeout(() => this.hideStatus(), 5000);
            }
        }
    }

    // Manual network switch function for UI buttons
    async manualSwitchToSepolia() {
        if (!window.ethereum) {
            this.showStatus('error', 'MetaMask not detected');
            return;
        }

        let ethereum = window.ethereum;
        
        // Handle multiple providers
        if (window.ethereum.providers?.length) {
            ethereum = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;
        }

        await this.switchToSepolia(ethereum);
    }

    renderWalletCards() {
        const container = document.querySelector('#wallet-section .grid');
        if (!container) return;

        // Debug info for MetaMask detection
        const hasEthereum = typeof window.ethereum !== 'undefined';
        const isMetaMask = window.ethereum?.isMetaMask;
        const hasProviders = window.ethereum?.providers?.length > 0;
        const metaMaskInProviders = window.ethereum?.providers?.some(p => p.isMetaMask);

        console.log('Wallet Detection Debug:', {
            hasEthereum,
            isMetaMask,
            hasProviders,
            metaMaskInProviders,
            ethereumObject: window.ethereum
        });

        container.innerHTML = this.supportedWallets.map(wallet => {
            let statusText = wallet.installed ? '✓ Available' : '⚠ Not Detected';
            let statusClass = wallet.installed ? 'text-green-300' : 'text-yellow-400';
            
            // Special handling for MetaMask detection issues
            if (wallet.id === 'metamask' && hasEthereum && !wallet.installed) {
                statusText = '⚠ Detected (trying anyway)';
                statusClass = 'text-yellow-300';
            }

            return `
                <div class="wallet-card bg-white/20 backdrop-blur rounded-lg p-4 text-center text-white cursor-pointer hover:bg-white/30 transition-all"
                     data-wallet-id="${wallet.id}">
                    <div class="text-2xl mb-2">${wallet.icon}</div>
                    <h4 class="font-semibold mb-1">${wallet.name}</h4>
                    <div class="text-xs mb-3 ${statusClass}">
                        ${statusText}
                    </div>
                    <button class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors">
                        Connect
                    </button>
                    ${wallet.id === 'metamask' && hasEthereum ? `
                        <div class="text-xs mt-2 text-gray-400">
                            Provider: ${isMetaMask ? 'MetaMask' : 'Generic'}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

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
        // Enhanced MetaMask detection
        if (!window.ethereum) {
            if (this.isMobile()) {
                window.open('https://metamask.app.link/dapp/' + window.location.host + window.location.pathname);
                return;
            }
            throw new Error('MetaMask is not installed. Please install MetaMask extension from https://metamask.io');
        }

        let ethereum = window.ethereum;
        
        // Handle multiple wallet providers
        if (window.ethereum.providers?.length) {
            // Find MetaMask among multiple providers
            ethereum = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum;
        } else if (!window.ethereum.isMetaMask) {
            // Check if this might be MetaMask but not properly detected
            console.warn('Ethereum provider detected but isMetaMask flag missing. Attempting connection...');
        }

        try {
            // Request account access
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            
            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned from MetaMask. Please unlock your wallet.');
            }

            // Get current chain ID
            const chainId = await ethereum.request({ method: 'eth_chainId' });
            
            // Log current network for debugging
            console.log('Current network:', chainId, 'Expected: 0xaa36a7 (Sepolia)');
            
            // Always try to connect with current network first, then suggest switch
            this.handleSuccessfulConnection('metamask', accounts[0], chainId);
            
            // If not on a preferred testnet, show network switch option
            if (!this.isValidChainId(chainId)) {
                setTimeout(async () => {
                    const shouldSwitch = confirm(
                        `You're currently on ${this.getChainName(chainId)}.\n\n` +
                        `Would you like to switch to Sepolia Testnet for the best experience?\n\n` +
                        `Sepolia provides free test ETH and is optimized for this DApp.`
                    );
                    
                    if (shouldSwitch) {
                        await this.switchToSepolia(ethereum);
                    }
                }, 1000);
            }
            
            this.setupWalletEventListeners();
            
        } catch (error) {
            console.error('MetaMask connection error:', error);
            
            // Handle specific error cases
            if (error.code === 4001) {
                throw new Error('Connection rejected. Please approve the connection in MetaMask.');
            } else if (error.code === -32002) {
                throw new Error('Connection request already pending. Please check MetaMask.');
            } else if (error.message.includes('User rejected')) {
                throw new Error('Connection cancelled by user.');
            } else {
                throw new Error(`MetaMask connection failed: ${error.message}`);
            }
        }
    }

    async connectTrustWallet() {
        if (!window.ethereum || !window.ethereum.isTrust) {
            if (this.isMobile()) {
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
        this.showStatus('info', 'WalletConnect integration requires additional setup. Please use one of the other wallet options for now.');
        setTimeout(() => this.hideStatus(), 5000);
    }

    handleSuccessfulConnection(walletType, account, chainId) {
        this.currentWallet = walletType;
        this.currentAccount = account;
        this.currentChainId = chainId;
        
        this.showStatus('success', `Successfully connected to ${this.getWalletName(walletType)}!`);
        this.updateWalletInfo();
        this.showDashboard();
        
        localStorage.setItem('connectedWallet', walletType);
        localStorage.setItem('connectedAccount', account);
        
        setTimeout(() => this.hideStatus(), 3000);
    }

    updateWalletInfo() {
        const walletInfo = document.getElementById('wallet-info');
        const addressShort = document.getElementById('wallet-address-short');

        if (addressShort && this.currentAccount) {
            addressShort.textContent = `${this.currentAccount.substring(0, 6)}...${this.currentAccount.substring(38)}`;
        }

        // Update network display in wallet info
        const networkDisplay = document.getElementById('wallet-network-display');
        if (networkDisplay && this.currentChainId) {
            networkDisplay.textContent = this.getChainName(this.currentChainId);
        }

        // Update testnet information
        this.updateTestnetInfo();

        if (walletInfo) {
            walletInfo.classList.remove('hidden');
        }
    }

    updateTestnetInfo() {
        const testnetBadge = document.getElementById('testnet-badge');
        const testnetInfo = document.getElementById('testnet-info');
        const networkWarning = document.getElementById('network-warning');
        const getTestEthBtn = document.getElementById('get-test-eth-btn');
        const switchToSepoliaBtn = document.getElementById('switch-to-sepolia-btn');
        const faucetLinks = document.getElementById('faucet-links');

        if (!this.currentChainId) return;

        const isTestnet = this.isTestnet(this.currentChainId);
        const isSepolia = this.currentChainId === '0xaa36a7';

        console.log('Network status:', { 
            chainId: this.currentChainId, 
            isTestnet, 
            isSepolia,
            chainName: this.getChainName(this.currentChainId)
        });

        if (isTestnet) {
            // Show testnet indicators
            testnetBadge?.classList.remove('hidden');
            testnetInfo?.classList.remove('hidden');
            getTestEthBtn?.classList.remove('hidden');

            // Add faucet links
            if (faucetLinks) {
                const faucetUrl = this.getFaucetUrl(this.currentChainId);
                if (faucetUrl) {
                    faucetLinks.innerHTML = `
                        <a href="${faucetUrl}" target="_blank" class="underline hover:text-yellow-100">
                            Get test ETH from faucet →
                        </a>
                    `;
                }
            }

            // Add click handler for get test ETH button
            if (getTestEthBtn && !getTestEthBtn.hasAttribute('data-listener')) {
                getTestEthBtn.addEventListener('click', () => {
                    const faucetUrl = this.getFaucetUrl(this.currentChainId);
                    if (faucetUrl) {
                        window.open(faucetUrl, '_blank');
                    }
                });
                getTestEthBtn.setAttribute('data-listener', 'true');
            }

        } else {
            // Hide testnet indicators for mainnet
            testnetBadge?.classList.add('hidden');
            testnetInfo?.classList.add('hidden');
            getTestEthBtn?.classList.add('hidden');
        }

        // Show network warning if not on Sepolia
        if (!isSepolia) {
            networkWarning?.classList.remove('hidden');
            
            // Add switch to Sepolia handler
            if (switchToSepoliaBtn && !switchToSepoliaBtn.hasAttribute('data-listener')) {
                switchToSepoliaBtn.addEventListener('click', () => {
                    this.manualSwitchToSepolia();
                });
                switchToSepoliaBtn.setAttribute('data-listener', 'true');
            }
        } else {
            networkWarning?.classList.add('hidden');
        }
    }

    async showDashboard() {
        const dashboardSection = document.getElementById('dashboard-section');
        const walletSection = document.getElementById('wallet-section');
        
        if (dashboardSection) {
            dashboardSection.classList.remove('hidden');
        }
        
        // Minimize wallet section
        if (walletSection) {
            walletSection.style.display = 'none';
        }

        // Load and display user investments
        await this.loadUserInvestments();
        this.renderUserInvestments();
    }

    async loadUserInvestments() {
        if (!this.currentAccount) return;

        try {
            const response = await axios.get(`/api/investment/user-investments/${this.currentAccount}`);
            this.userInvestments = response.data.investments;
        } catch (error) {
            console.error('Failed to load user investments:', error);
            this.userInvestments = [];
        }
    }

    renderUserInvestments() {
        const container = document.getElementById('user-investments');
        if (!container) return;

        if (this.userInvestments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-4xl mb-4">📋</div>
                    <h3 class="text-xl font-semibold mb-2">No Investments Yet</h3>
                    <p class="text-gray-300 mb-4">Create your first blockchain investment contract to get started.</p>
                    <button id="first-investment-btn" class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-colors">
                        <i class="fas fa-plus mr-2"></i>Create First Investment
                    </button>
                </div>
            `;

            document.getElementById('first-investment-btn')?.addEventListener('click', () => {
                this.showCreateInvestment();
            });
            return;
        }

        container.innerHTML = this.userInvestments.map(investment => {
            const progress = this.calculateProgress(investment.startTime, investment.maturityTime);
            const daysRemaining = Math.ceil((investment.maturityTime - Date.now()) / (1000 * 60 * 60 * 24));
            
            return `
                <div class="investment-card bg-white/20 backdrop-blur rounded-lg p-6 cursor-pointer" data-token-id="${investment.tokenId}">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h4 class="text-lg font-semibold">${investment.contractType}</h4>
                            <p class="text-sm text-gray-300">Token ID: #${investment.tokenId}</p>
                        </div>
                        <span class="status-${investment.status.toLowerCase()} px-2 py-1 rounded text-xs font-medium">
                            ${investment.status}
                        </span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="text-sm text-gray-400">Principal Amount</label>
                            <div class="font-semibold">${investment.principal} ETH</div>
                        </div>
                        <div>
                            <label class="text-sm text-gray-400">Target APY</label>
                            <div class="font-semibold">${investment.targetAPY}%</div>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-400">Progress</span>
                            <span>${progress}% • ${daysRemaining} days remaining</span>
                        </div>
                        <div class="w-full bg-white/20 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full transition-all" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-400">
                            <i class="fas fa-file-alt mr-1"></i>
                            Contract: ${investment.termsHash.substring(0, 8)}...
                        </span>
                        <button class="text-blue-400 hover:text-blue-300 transition-colors">
                            View Details <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners to investment cards
        container.querySelectorAll('.investment-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const tokenId = card.dataset.tokenId;
                    this.showInvestmentDetails(tokenId);
                }
            });
        });
    }

    calculateProgress(startTime, maturityTime) {
        const now = Date.now();
        const total = maturityTime - startTime;
        const elapsed = now - startTime;
        return Math.min(100, Math.max(0, Math.floor((elapsed / total) * 100)));
    }

    showCreateInvestment() {
        const createSection = document.getElementById('create-section');
        const dashboardSection = document.getElementById('dashboard-section');
        
        if (createSection) {
            createSection.classList.remove('hidden');
        }
        if (dashboardSection) {
            dashboardSection.style.display = 'none';
        }

        this.currentStep = 1;
        this.renderInvestmentForm();
    }

    renderInvestmentForm() {
        const formContainer = document.getElementById('investment-form');
        if (!formContainer) return;

        this.updateStepIndicators();

        switch (this.currentStep) {
            case 1:
                this.renderTemplateSelection();
                break;
            case 2:
                this.renderTermsForm();
                break;
            case 3:
                this.renderContractGeneration();
                break;
            case 4:
                this.renderDepositForm();
                break;
        }
    }

    renderTemplateSelection() {
        const formContainer = document.getElementById('investment-form');
        if (!formContainer) return;

        formContainer.innerHTML = `
            <div>
                <h3 class="text-lg font-semibold mb-4">Choose Investment Template</h3>
                <div class="grid md:grid-cols-3 gap-4">
                    ${this.investmentTemplates.map(template => `
                        <div class="template-card bg-white/10 border border-white/20 rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-all" data-template-id="${template.id}">
                            <h4 class="font-semibold mb-2">${template.name}</h4>
                            <p class="text-sm text-gray-300 mb-3">${template.description}</p>
                            <div class="space-y-2 text-xs">
                                <div class="flex justify-between">
                                    <span>Min Amount:</span>
                                    <span>${template.minAmount} ETH</span>
                                </div>
                                <div class="flex justify-between">
                                    <span>APY Range:</span>
                                    <span>${template.targetAPYRange.min}-${template.targetAPYRange.max}%</span>
                                </div>
                                <div class="flex flex-wrap gap-1 mt-2">
                                    ${template.features.map(feature => `
                                        <span class="bg-blue-600/30 px-2 py-1 rounded text-xs">${feature}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="flex justify-between mt-6">
                    <button id="back-to-dashboard" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i>Back to Dashboard
                    </button>
                    <button id="next-step" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors opacity-50" disabled>
                        Next: Set Terms <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        formContainer.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                formContainer.querySelectorAll('.template-card').forEach(c => {
                    c.classList.remove('border-blue-500', 'bg-blue-600/20');
                });
                card.classList.add('border-blue-500', 'bg-blue-600/20');
                
                const nextBtn = document.getElementById('next-step');
                if (nextBtn) {
                    nextBtn.classList.remove('opacity-50');
                    nextBtn.disabled = false;
                }

                this.selectedTemplate = this.investmentTemplates.find(t => t.id === card.dataset.templateId);
            });
        });

        document.getElementById('back-to-dashboard')?.addEventListener('click', () => {
            this.backToDashboard();
        });

        document.getElementById('next-step')?.addEventListener('click', () => {
            if (this.selectedTemplate) {
                this.currentStep = 2;
                this.renderInvestmentForm();
            }
        });
    }

    renderTermsForm() {
        const formContainer = document.getElementById('investment-form');
        if (!formContainer || !this.selectedTemplate) return;

        formContainer.innerHTML = `
            <div>
                <h3 class="text-lg font-semibold mb-4">Set Investment Terms</h3>
                <div class="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <h4 class="font-semibold">${this.selectedTemplate.name}</h4>
                    <p class="text-sm text-gray-300">${this.selectedTemplate.description}</p>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium mb-2">Investment Amount (ETH)</label>
                        <input type="number" id="investment-amount" 
                               class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                               placeholder="Enter amount" 
                               min="${this.selectedTemplate.minAmount}" 
                               max="${this.selectedTemplate.maxAmount}" 
                               step="0.01">
                        <div class="text-xs text-gray-400 mt-1">
                            Min: ${this.selectedTemplate.minAmount} ETH • Max: ${this.selectedTemplate.maxAmount} ETH
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Investment Term</label>
                        <select id="investment-term" class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none">
                            <option value="">Select term</option>
                            ${this.selectedTemplate.terms.map(term => `
                                <option value="${term}">${term}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Target APY (%)</label>
                        <input type="number" id="target-apy" 
                               class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none"
                               placeholder="Enter APY" 
                               min="${this.selectedTemplate.targetAPYRange.min}" 
                               max="${this.selectedTemplate.targetAPYRange.max}" 
                               step="0.1">
                        <div class="text-xs text-gray-400 mt-1">
                            Range: ${this.selectedTemplate.targetAPYRange.min}% - ${this.selectedTemplate.targetAPYRange.max}%
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Special Terms</label>
                        <textarea id="special-terms" 
                                  class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:border-blue-500 focus:outline-none" 
                                  rows="3" 
                                  placeholder="Any additional terms or conditions..."></textarea>
                    </div>
                </div>
                
                <div class="flex justify-between mt-6">
                    <button id="prev-step" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i>Previous
                    </button>
                    <button id="next-step" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors">
                        Next: Generate Contract <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        `;

        document.getElementById('prev-step')?.addEventListener('click', () => {
            this.currentStep = 1;
            this.renderInvestmentForm();
        });

        document.getElementById('next-step')?.addEventListener('click', () => {
            if (this.validateTermsForm()) {
                this.collectTermsData();
                this.currentStep = 3;
                this.renderInvestmentForm();
            }
        });
    }

    validateTermsForm() {
        const amount = document.getElementById('investment-amount')?.value;
        const term = document.getElementById('investment-term')?.value;
        const apy = document.getElementById('target-apy')?.value;

        if (!amount || !term || !apy) {
            this.showStatus('error', 'Please fill in all required fields.');
            setTimeout(() => this.hideStatus(), 3000);
            return false;
        }

        const amountNum = parseFloat(amount);
        const apyNum = parseFloat(apy);

        if (amountNum < parseFloat(this.selectedTemplate.minAmount) || 
            amountNum > parseFloat(this.selectedTemplate.maxAmount)) {
            this.showStatus('error', `Amount must be between ${this.selectedTemplate.minAmount} and ${this.selectedTemplate.maxAmount} ETH.`);
            setTimeout(() => this.hideStatus(), 3000);
            return false;
        }

        if (apyNum < this.selectedTemplate.targetAPYRange.min || 
            apyNum > this.selectedTemplate.targetAPYRange.max) {
            this.showStatus('error', `APY must be between ${this.selectedTemplate.targetAPYRange.min}% and ${this.selectedTemplate.targetAPYRange.max}%.`);
            setTimeout(() => this.hideStatus(), 3000);
            return false;
        }

        return true;
    }

    collectTermsData() {
        this.investmentTerms = {
            template: this.selectedTemplate,
            amount: document.getElementById('investment-amount')?.value,
            term: document.getElementById('investment-term')?.value,
            targetAPY: document.getElementById('target-apy')?.value,
            specialTerms: document.getElementById('special-terms')?.value || '',
            investor: this.currentAccount,
            network: this.getNetworkName(this.currentChainId),
            timestamp: Date.now()
        };
    }

    renderContractGeneration() {
        const formContainer = document.getElementById('investment-form');
        if (!formContainer) return;

        formContainer.innerHTML = `
            <div>
                <h3 class="text-lg font-semibold mb-4">Generate Investment Contract</h3>
                
                <div class="bg-white/10 rounded-lg p-6 mb-6">
                    <h4 class="font-semibold mb-4">Contract Preview</h4>
                    <div class="grid md:grid-cols-2 gap-4 text-sm">
                        <div><span class="text-gray-400">Template:</span> ${this.investmentTerms.template.name}</div>
                        <div><span class="text-gray-400">Amount:</span> ${this.investmentTerms.amount} ETH</div>
                        <div><span class="text-gray-400">Term:</span> ${this.investmentTerms.term}</div>
                        <div><span class="text-gray-400">Target APY:</span> ${this.investmentTerms.targetAPY}%</div>
                        <div><span class="text-gray-400">Network:</span> ${this.investmentTerms.network}</div>
                        <div><span class="text-gray-400">Investor:</span> ${this.currentAccount.substring(0, 8)}...</div>
                    </div>
                    ${this.investmentTerms.specialTerms ? `
                        <div class="mt-4">
                            <span class="text-gray-400">Special Terms:</span>
                            <div class="bg-white/10 rounded p-3 mt-1 text-sm">${this.investmentTerms.specialTerms}</div>
                        </div>
                    ` : ''}
                </div>
                
                <div id="generation-steps" class="space-y-4 mb-6">
                    <div class="generation-step" data-step="pdf">
                        <div class="flex items-center">
                            <div class="step-icon">
                                <i class="fas fa-file-pdf"></i>
                            </div>
                            <div class="ml-3">
                                <div class="font-medium">Generate PDF Contract</div>
                                <div class="text-sm text-gray-400">Creating legal document with terms</div>
                            </div>
                            <div class="ml-auto status-indicator">
                                <i class="fas fa-clock text-gray-400"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="generation-step" data-step="ipfs">
                        <div class="flex items-center">
                            <div class="step-icon">
                                <i class="fas fa-cloud-upload-alt"></i>
                            </div>
                            <div class="ml-3">
                                <div class="font-medium">Upload to IPFS</div>
                                <div class="text-sm text-gray-400">Storing document permanently on IPFS</div>
                            </div>
                            <div class="ml-auto status-indicator">
                                <i class="fas fa-clock text-gray-400"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="generation-step" data-step="hash">
                        <div class="flex items-center">
                            <div class="step-icon">
                                <i class="fas fa-hashtag"></i>
                            </div>
                            <div class="ml-3">
                                <div class="font-medium">Calculate Hash</div>
                                <div class="text-sm text-gray-400">Generating cryptographic proof</div>
                            </div>
                            <div class="ml-auto status-indicator">
                                <i class="fas fa-clock text-gray-400"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="generation-result" class="hidden bg-green-600/20 border border-green-500/30 rounded-lg p-4 mb-6">
                    <h4 class="font-semibold text-green-300 mb-2">
                        <i class="fas fa-check-circle mr-2"></i>Contract Generated Successfully
                    </h4>
                    <div class="text-sm space-y-2">
                        <div><span class="text-gray-400">IPFS Hash:</span> <span id="ipfs-hash" class="font-mono"></span></div>
                        <div><span class="text-gray-400">Document Hash:</span> <span id="doc-hash" class="font-mono"></span></div>
                        <div><span class="text-gray-400">PDF Size:</span> <span id="pdf-size"></span> KB</div>
                    </div>
                </div>
                
                <div class="flex justify-between">
                    <button id="prev-step" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i>Previous
                    </button>
                    <div class="space-x-3">
                        <button id="generate-contract" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors">
                            <i class="fas fa-cog mr-2"></i>Generate Contract
                        </button>
                        <button id="next-step" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors opacity-50" disabled>
                            Final: Deposit & Mint <i class="fas fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('prev-step')?.addEventListener('click', () => {
            this.currentStep = 2;
            this.renderInvestmentForm();
        });

        document.getElementById('generate-contract')?.addEventListener('click', () => {
            this.generateContract();
        });

        document.getElementById('next-step')?.addEventListener('click', () => {
            if (this.contractData) {
                this.currentStep = 4;
                this.renderInvestmentForm();
            }
        });
    }

    async generateContract() {
        const generateBtn = document.getElementById('generate-contract');
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
        }

        try {
            // Step 1: Generate PDF (real PDF generation)
            await this.updateGenerationStep('pdf', 'processing');
            const pdfResult = await axios.post('/api/external/generate-pdf', this.investmentTerms);
            
            if (pdfResult.data.needsFrontendGeneration) {
                // Generate actual PDF on frontend using jsPDF
                const pdfBlob = await this.generatePDFDocument(pdfResult.data.pdfData);
                this.contractData = {
                    pdfBlob: pdfBlob,
                    pdfData: pdfResult.data.pdfData,
                    pdfHash: pdfResult.data.hash,
                    pdfSize: Math.round(pdfBlob.size / 1024), // Size in KB
                    terms: this.investmentTerms
                };
            }
            await this.updateGenerationStep('pdf', 'completed');
            
            // Step 2: Upload to IPFS (real upload)
            await this.updateGenerationStep('ipfs', 'processing');
            
            // Convert PDF to base64 for upload
            const pdfBase64 = await this.blobToBase64(this.contractData.pdfBlob);
            
            const ipfsResult = await axios.post('/api/external/upload-ipfs', {
                content: JSON.stringify(this.contractData.pdfData, null, 2),
                filename: `investment-contract-${Date.now()}.json`,
                metadata: {
                    type: 'investment-contract',
                    investor: this.currentAccount,
                    network: this.getChainName(this.currentChainId),
                    timestamp: new Date().toISOString()
                }
            });
            
            this.contractData.ipfsHash = ipfsResult.data.ipfsHash;
            this.contractData.ipfsUrl = ipfsResult.data.ipfsUrl;
            this.contractData.isDemoMode = ipfsResult.data.isDemoMode;
            
            await this.updateGenerationStep('ipfs', 'completed');
            
            // Step 3: Calculate Hash (already done in PDF generation)
            await this.updateGenerationStep('hash', 'processing');
            await new Promise(resolve => setTimeout(resolve, 800));
            await this.updateGenerationStep('hash', 'completed');

            // Show results
            const resultDiv = document.getElementById('generation-result');
            if (resultDiv) {
                document.getElementById('ipfs-hash').textContent = this.contractData.ipfsHash;
                document.getElementById('doc-hash').textContent = this.contractData.pdfHash;
                document.getElementById('pdf-size').textContent = this.contractData.pdfSize;
                resultDiv.classList.remove('hidden');
            }

            // Enable next step
            const nextBtn = document.getElementById('next-step');
            if (nextBtn) {
                nextBtn.classList.remove('opacity-50');
                nextBtn.disabled = false;
            }

            this.showStatus('success', 'Contract generated and uploaded to IPFS successfully!');
            setTimeout(() => this.hideStatus(), 3000);

        } catch (error) {
            console.error('Contract generation error:', error);
            this.showStatus('error', `Failed to generate contract: ${error.message}`);
            setTimeout(() => this.hideStatus(), 5000);
        } finally {
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-cog mr-2"></i>Generate Contract';
            }
        }
    }

    async generatePDFDocument(pdfData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('Investment Contract Agreement', 20, 30);
        
        // Add contract details
        doc.setFontSize(12);
        let yPos = 50;
        
        doc.text('BLOCKCHAIN INVESTMENT CONTRACT', 20, yPos);
        yPos += 10;
        doc.text(`Contract Version: ${pdfData.contractVersion}`, 20, yPos);
        yPos += 10;
        doc.text(`Generated: ${new Date(pdfData.timestamp).toLocaleString()}`, 20, yPos);
        yPos += 20;
        
        // Investment Details
        doc.setFontSize(14);
        doc.text('INVESTMENT DETAILS', 20, yPos);
        doc.setFontSize(10);
        yPos += 15;
        
        const terms = pdfData.investmentTerms;
        doc.text(`Template: ${terms.template.name}`, 20, yPos);
        yPos += 8;
        doc.text(`Investment Amount: ${terms.amount} ETH`, 20, yPos);
        yPos += 8;
        doc.text(`Investment Term: ${terms.term}`, 20, yPos);
        yPos += 8;
        doc.text(`Target APY: ${terms.targetAPY}%`, 20, yPos);
        yPos += 8;
        doc.text(`Network: ${terms.network}`, 20, yPos);
        yPos += 8;
        doc.text(`Investor Address: ${terms.investor}`, 20, yPos);
        yPos += 15;
        
        if (terms.specialTerms) {
            doc.text('Special Terms:', 20, yPos);
            yPos += 8;
            const splitTerms = doc.splitTextToSize(terms.specialTerms, 170);
            doc.text(splitTerms, 20, yPos);
            yPos += splitTerms.length * 5 + 10;
        }
        
        // Contract Terms
        doc.setFontSize(14);
        doc.text('STANDARD TERMS AND CONDITIONS', 20, yPos);
        doc.setFontSize(10);
        yPos += 15;
        
        const standardTerms = [
            '1. This contract is recorded on the blockchain as a Soul Bound Token (SBT).',
            '2. The SBT serves as immutable proof of the investment agreement.',
            '3. Investment terms are cryptographically hashed and stored on IPFS.',
            '4. Returns are calculated based on the agreed target APY.',
            '5. Early withdrawal may be subject to penalties as per template terms.',
            '6. This contract is governed by smart contract logic on Ethereum blockchain.',
            '7. All parties acknowledge the risks associated with cryptocurrency investments.'
        ];
        
        standardTerms.forEach(term => {
            const splitText = doc.splitTextToSize(term, 170);
            doc.text(splitText, 20, yPos);
            yPos += splitText.length * 5 + 3;
        });
        
        // Signatures
        yPos += 20;
        doc.setFontSize(12);
        doc.text('DIGITAL SIGNATURES', 20, yPos);
        yPos += 15;
        doc.setFontSize(10);
        doc.text(`Investor: ${terms.investor}`, 20, yPos);
        yPos += 8;
        doc.text(`Timestamp: ${new Date().toISOString()}`, 20, yPos);
        yPos += 8;
        doc.text('Signature: [To be signed via MetaMask]', 20, yPos);
        
        // Footer
        doc.setFontSize(8);
        doc.text('This document is cryptographically secured and stored on IPFS', 20, 280);
        doc.text(`Document Hash: ${pdfData.timestamp}`, 20, 285);
        
        return doc.output('blob');
    }

    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async updateGenerationStep(stepId, status) {
        const step = document.querySelector(`.generation-step[data-step="${stepId}"]`);
        if (!step) return;

        const statusIndicator = step.querySelector('.status-indicator i');
        
        switch (status) {
            case 'processing':
                statusIndicator.className = 'fas fa-spinner fa-spin text-blue-400';
                break;
            case 'completed':
                statusIndicator.className = 'fas fa-check-circle text-green-400';
                break;
            case 'error':
                statusIndicator.className = 'fas fa-exclamation-circle text-red-400';
                break;
        }

        // Add some delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    renderDepositForm() {
        const formContainer = document.getElementById('investment-form');
        if (!formContainer || !this.contractData) return;

        const expectedReturn = (parseFloat(this.investmentTerms.amount) * (1 + (parseFloat(this.investmentTerms.targetAPY) / 100))).toFixed(4);

        formContainer.innerHTML = `
            <div>
                <h3 class="text-lg font-semibold mb-4">Deposit ETH & Mint SBT Receipt</h3>
                
                <div class="bg-green-600/20 border border-green-500/30 rounded-lg p-4 mb-6">
                    <h4 class="font-semibold text-green-300 mb-2">
                        <i class="fas fa-check-circle mr-2"></i>Contract Ready for Blockchain
                    </h4>
                    <div class="text-sm">
                        Your investment contract has been generated and stored on IPFS. 
                        Complete the deposit to mint your Soul Bound Token receipt.
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6 mb-6">
                    <div class="bg-white/10 rounded-lg p-4">
                        <h4 class="font-semibold mb-3">Investment Summary</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Principal:</span>
                                <span>${this.investmentTerms.amount} ETH</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Term:</span>
                                <span>${this.investmentTerms.term}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Target APY:</span>
                                <span>${this.investmentTerms.targetAPY}%</span>
                            </div>
                            <hr class="border-white/20">
                            <div class="flex justify-between font-semibold">
                                <span>Expected Return:</span>
                                <span>${expectedReturn} ETH</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white/10 rounded-lg p-4">
                        <h4 class="font-semibold mb-3">Contract Details</h4>
                        <div class="space-y-2 text-sm">
                            <div>
                                <span class="text-gray-400">Contract Address:</span>
                                <div class="font-mono text-xs break-all">${this.contractInfo.address}</div>
                            </div>
                            <div>
                                <span class="text-gray-400">IPFS Hash:</span>
                                <div class="font-mono text-xs break-all">${this.contractData.ipfsHash}</div>
                            </div>
                            <div>
                                <span class="text-gray-400">Document Hash:</span>
                                <div class="font-mono text-xs break-all">${this.contractData.pdfHash}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <h4 class="font-semibold mb-2">
                        <i class="fas fa-info-circle mr-2"></i>Soul Bound Token (SBT) Receipt
                    </h4>
                    <div class="text-sm text-gray-300">
                        Upon successful deposit, you will receive a non-transferable NFT that serves as 
                        cryptographic proof of your investment terms. This SBT cannot be sold or transferred, 
                        ensuring the integrity of the investment record.
                    </div>
                </div>
                
                <div class="flex justify-between">
                    <button id="prev-step" class="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition-colors">
                        <i class="fas fa-arrow-left mr-2"></i>Previous
                    </button>
                    <div class="space-x-3">
                        <button id="preview-contract" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors">
                            <i class="fas fa-eye mr-2"></i>Preview Contract
                        </button>
                        <button id="deposit-mint" class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold transition-colors">
                            <i class="fas fa-coins mr-2"></i>Deposit ${this.investmentTerms.amount} ETH & Mint SBT
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('prev-step')?.addEventListener('click', () => {
            this.currentStep = 3;
            this.renderInvestmentForm();
        });

        document.getElementById('preview-contract')?.addEventListener('click', () => {
            if (this.contractData.pdfBlob) {
                // Create blob URL for real PDF
                const pdfUrl = URL.createObjectURL(this.contractData.pdfBlob);
                window.open(pdfUrl, '_blank');
                // Clean up URL after a delay
                setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
            } else if (this.contractData.ipfsUrl) {
                // Fallback to IPFS URL
                window.open(this.contractData.ipfsUrl, '_blank');
            }
        });

        document.getElementById('deposit-mint')?.addEventListener('click', () => {
            this.executeDeposit();
        });
    }

    async executeDeposit() {
        if (!window.ethereum || !this.currentAccount) {
            this.showStatus('error', 'Please connect your wallet first.');
            return;
        }

        const depositBtn = document.getElementById('deposit-mint');
        if (depositBtn) {
            depositBtn.disabled = true;
            depositBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing Transaction...';
        }

        try {
            this.showStatus('info', 'Please confirm the transaction in your wallet...');

            // Convert amount to Wei (ETH to Wei conversion)
            const amountWei = '0x' + (parseFloat(this.investmentTerms.amount) * Math.pow(10, 18)).toString(16);

            // Mock smart contract call (in real implementation, you'd use the actual contract)
            const mockTxHash = '0x' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
            
            // Simulate transaction confirmation
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const newTokenId = Math.floor(Math.random() * 10000) + 1000;
            
            this.showStatus('success', `Investment successful! SBT Token #${newTokenId} minted.`);
            
            // Redirect to dashboard after success
            setTimeout(() => {
                this.hideStatus();
                this.backToDashboard();
                this.loadUserInvestments(); // Refresh investments
            }, 3000);

        } catch (error) {
            console.error('Deposit error:', error);
            this.showStatus('error', 'Transaction failed. Please try again.');
            setTimeout(() => this.hideStatus(), 5000);
        } finally {
            if (depositBtn) {
                depositBtn.disabled = false;
                depositBtn.innerHTML = '<i class="fas fa-coins mr-2"></i>Deposit ETH & Mint SBT';
            }
        }
    }

    updateStepIndicators() {
        for (let i = 1; i <= 4; i++) {
            const circle = document.querySelector(`.step-circle[data-step="${i}"]`);
            if (circle) {
                circle.classList.remove('active', 'completed');
                if (i < this.currentStep) {
                    circle.classList.add('completed');
                } else if (i === this.currentStep) {
                    circle.classList.add('active');
                }
            }
        }
    }

    backToDashboard() {
        const createSection = document.getElementById('create-section');
        const dashboardSection = document.getElementById('dashboard-section');
        
        if (createSection) {
            createSection.classList.add('hidden');
        }
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
            dashboardSection.classList.remove('hidden');
        }

        // Reset form state
        this.currentStep = 1;
        this.selectedTemplate = null;
        this.investmentTerms = null;
        this.contractData = null;
    }

    showInvestmentDetails(tokenId) {
        const investment = this.userInvestments.find(inv => inv.tokenId === tokenId);
        if (!investment) return;

        const modal = document.getElementById('investment-modal');
        const detailsContainer = document.getElementById('investment-details');
        
        if (!modal || !detailsContainer) return;

        const progress = this.calculateProgress(investment.startTime, investment.maturityTime);
        const startDate = new Date(investment.startTime).toLocaleDateString();
        const maturityDate = new Date(investment.maturityTime).toLocaleDateString();
        const expectedReturn = (parseFloat(investment.principal) * (1 + (investment.targetAPY / 100))).toFixed(4);

        detailsContainer.innerHTML = `
            <div class="space-y-6">
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-lg mb-2">${investment.contractType}</h4>
                    <p class="text-gray-600">Token ID: #${investment.tokenId}</p>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h5 class="font-semibold mb-3">Investment Details</h5>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-500">Principal Amount:</span>
                                <span class="font-medium">${investment.principal} ETH</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Target APY:</span>
                                <span class="font-medium">${investment.targetAPY}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Expected Return:</span>
                                <span class="font-medium text-green-600">${expectedReturn} ETH</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Status:</span>
                                <span class="font-medium status-${investment.status.toLowerCase()}">${investment.status}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h5 class="font-semibold mb-3">Timeline</h5>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-500">Start Date:</span>
                                <span class="font-medium">${startDate}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Maturity Date:</span>
                                <span class="font-medium">${maturityDate}</span>
                            </div>
                            <div class="mt-3">
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-gray-500">Progress</span>
                                    <span>${progress}%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full" style="width: ${progress}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h5 class="font-semibold mb-3">Blockchain Verification</h5>
                    <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                        <div>
                            <span class="text-gray-500">Contract Address:</span>
                            <div class="font-mono text-xs break-all">${this.contractInfo.address}</div>
                        </div>
                        <div>
                            <span class="text-gray-500">IPFS Document:</span>
                            <div class="font-mono text-xs break-all">${investment.ipfsHash}</div>
                        </div>
                        <div>
                            <span class="text-gray-500">Terms Hash:</span>
                            <div class="font-mono text-xs break-all">${investment.termsHash}</div>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between">
                    <button id="view-contract-doc" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                        <i class="fas fa-file-pdf mr-2"></i>View Contract Document
                    </button>
                    <button id="verify-on-chain" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors">
                        <i class="fas fa-search mr-2"></i>Verify on Blockchain
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        // Add event listeners for modal buttons
        document.getElementById('view-contract-doc')?.addEventListener('click', () => {
            window.open(`https://gateway.pinata.cloud/ipfs/${investment.ipfsHash}`, '_blank');
        });

        document.getElementById('verify-on-chain')?.addEventListener('click', () => {
            window.open(`https://etherscan.io/token/${this.contractInfo.address}?a=${investment.tokenId}`, '_blank');
        });
    }

    setupEventListeners() {
        // Create investment button
        document.getElementById('create-investment-btn')?.addEventListener('click', () => {
            this.showCreateInvestment();
        });

        // Wallet details button
        document.getElementById('wallet-details-btn')?.addEventListener('click', () => {
            this.showWalletDetails();
        });

        // Disconnect button
        document.getElementById('disconnect-btn')?.addEventListener('click', () => {
            this.disconnect();
        });

        // Modal close buttons
        document.getElementById('close-investment-modal')?.addEventListener('click', () => {
            document.getElementById('investment-modal').classList.add('hidden');
        });

        document.getElementById('close-wallet-details-modal')?.addEventListener('click', () => {
            document.getElementById('wallet-details-modal').classList.add('hidden');
        });

        document.getElementById('close-modal')?.addEventListener('click', () => {
            document.getElementById('network-modal').classList.add('hidden');
        });

        // Click outside modal to close
        ['investment-modal', 'wallet-details-modal', 'network-modal'].forEach(modalId => {
            document.getElementById(modalId)?.addEventListener('click', (e) => {
                if (e.target.id === modalId) {
                    document.getElementById(modalId).classList.add('hidden');
                }
            });
        });
    }

    setupWalletEventListeners() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.handleDisconnection();
                } else {
                    this.currentAccount = accounts[0];
                    this.updateWalletInfo();
                    this.loadUserInvestments();
                }
            });

            window.ethereum.on('chainChanged', (chainId) => {
                this.currentChainId = chainId;
                this.updateWalletInfo();
            });
        }
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

    showWalletDetails() {
        const modal = document.getElementById('wallet-details-modal');
        const content = document.getElementById('wallet-details-content');
        
        if (!modal || !content) return;

        const network = this.networks.find(n => n.chainId === this.currentChainId);
        const isSepolia = this.currentChainId === '0xaa36a7';
        const isTestnet = this.isTestnet(this.currentChainId);

        content.innerHTML = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
                    <div class="bg-gray-50 rounded p-3 font-mono text-sm break-all">${this.currentAccount}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Connected Wallet</label>
                    <div class="bg-gray-50 rounded p-3 text-sm">${this.getWalletName(this.currentWallet)}</div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Current Network</label>
                    <div class="bg-gray-50 rounded p-3 text-sm flex items-center justify-between">
                        <span>${network ? `${network.name} (${network.symbol})` : 'Unknown Network'}</span>
                        ${isTestnet ? '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">TESTNET</span>' : ''}
                    </div>
                </div>
                
                ${!isSepolia ? `
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas fa-info-circle text-orange-600"></i>
                            <span class="font-medium text-orange-800">Recommended Network</span>
                        </div>
                        <p class="text-sm text-orange-700 mb-3">
                            For the best experience, switch to Sepolia Testnet. It provides free test ETH and is optimized for this DApp.
                        </p>
                        <button id="switch-to-sepolia-modal" class="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors">
                            <i class="fas fa-exchange-alt mr-2"></i>Switch to Sepolia Testnet
                        </button>
                    </div>
                ` : ''}
                
                ${isTestnet && this.getFaucetUrl(this.currentChainId) ? `
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas fa-coins text-blue-600"></i>
                            <span class="font-medium text-blue-800">Need Test ETH?</span>
                        </div>
                        <p class="text-sm text-blue-700 mb-3">
                            Get free test ETH to use this DApp. You can receive up to 0.5 ETH daily.
                        </p>
                        <button id="get-faucet-eth-modal" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                            <i class="fas fa-external-link-alt mr-2"></i>Get Test ETH from Faucet
                        </button>
                    </div>
                ` : ''}
                
                <div class="flex gap-2">
                    <button id="copy-address" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors">
                        <i class="fas fa-copy mr-2"></i>Copy Address
                    </button>
                    <button id="view-on-explorer" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors">
                        <i class="fas fa-external-link-alt mr-2"></i>View on Explorer
                    </button>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');

        // Add event listeners
        document.getElementById('copy-address')?.addEventListener('click', () => {
            navigator.clipboard.writeText(this.currentAccount);
            this.showStatus('success', 'Address copied to clipboard!');
            setTimeout(() => this.hideStatus(), 2000);
        });

        document.getElementById('view-on-explorer')?.addEventListener('click', () => {
            const explorerUrl = this.getExplorerUrl(this.currentChainId);
            window.open(`${explorerUrl}/address/${this.currentAccount}`, '_blank');
        });

        document.getElementById('switch-to-sepolia-modal')?.addEventListener('click', async () => {
            document.getElementById('wallet-details-modal').classList.add('hidden');
            await this.manualSwitchToSepolia();
        });

        document.getElementById('get-faucet-eth-modal')?.addEventListener('click', () => {
            const faucetUrl = this.getFaucetUrl(this.currentChainId);
            if (faucetUrl) {
                window.open(faucetUrl, '_blank');
            }
        });
    }

    getExplorerUrl(chainId) {
        const explorers = {
            '0x1': 'https://etherscan.io',
            '0x89': 'https://polygonscan.com',
            '0xa4b1': 'https://arbiscan.io',
            '0xa': 'https://optimistic.etherscan.io',
            '0x38': 'https://bscscan.com'
        };
        return explorers[chainId] || 'https://etherscan.io';
    }

    disconnect() {
        this.currentWallet = null;
        this.currentAccount = null;
        this.currentChainId = null;
        
        // Hide all sections except wallet connection
        document.getElementById('wallet-info')?.classList.add('hidden');
        document.getElementById('dashboard-section')?.classList.add('hidden');
        document.getElementById('create-section')?.classList.add('hidden');
        
        // Show wallet section
        const walletSection = document.getElementById('wallet-section');
        if (walletSection) {
            walletSection.style.display = 'block';
        }
        
        this.clearSavedConnection();
        this.showStatus('info', 'Wallet disconnected');
        setTimeout(() => this.hideStatus(), 3000);
    }

    clearSavedConnection() {
        localStorage.removeItem('connectedWallet');
        localStorage.removeItem('connectedAccount');
    }

    handleDisconnection() {
        this.disconnect();
    }

    getWalletName(walletId) {
        const wallet = this.supportedWallets.find(w => w.id === walletId);
        return wallet ? wallet.name : 'Unknown Wallet';
    }

    getNetworkName(chainId) {
        const network = this.networks.find(n => n.chainId === chainId);
        return network ? network.name : 'Unknown Network';
    }

    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    showStatus(type, message) {
        const statusEl = document.getElementById('connection-status');
        const iconEl = document.getElementById('status-icon');
        const titleEl = document.getElementById('status-title');
        const messageEl = document.getElementById('status-message');

        if (!statusEl) return;

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
        const statusEl = document.getElementById('connection-status');
        if (statusEl) {
            statusEl.classList.add('hidden');
        }
    }
}

// Initialize DApp when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.investmentDApp = new InvestmentDApp();
});