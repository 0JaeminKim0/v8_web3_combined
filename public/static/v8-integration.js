// V8 Integration - Enhanced Investment Platform with Web3
let currentFilters = {
    sector: 'all',
    riskLevel: 'all',
    minInvestment: 'all',
    region: 'all'
};

let allProjects = [];
let filteredProjects = [];
let walletConnected = false;
let walletAddress = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadProjects();
    updateProjectDisplay();
});

function initializeApp() {
    console.log('Initializing V8 + Web3 Integration...');
    
    // Check if MetaMask is available
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask detected');
        setupWeb3();
    } else {
        console.log('MetaMask not detected');
        showMetaMaskInstallPrompt();
    }
}

function setupEventListeners() {
    // Wallet connection
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }

    // Filter selectors
    const sectorSelect = document.getElementById('sectorFilter');
    const riskSelect = document.getElementById('riskFilter');
    const minInvestmentSelect = document.getElementById('minInvestmentFilter');
    const regionSelect = document.getElementById('regionFilter');

    if (sectorSelect) sectorSelect.addEventListener('change', (e) => updateFilter('sector', e.target.value));
    if (riskSelect) riskSelect.addEventListener('change', (e) => updateFilter('riskLevel', e.target.value));
    if (minInvestmentSelect) minInvestmentSelect.addEventListener('change', (e) => updateFilter('minInvestment', e.target.value));
    if (regionSelect) regionSelect.addEventListener('change', (e) => updateFilter('region', e.target.value));
}

function setupWeb3() {
    // Check if already connected
    if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) {
                    walletAddress = accounts[0];
                    walletConnected = true;
                    updateWalletUI();
                }
            })
            .catch(console.error);
    }
}

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showMetaMaskInstallPrompt();
        return;
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
        });

        if (accounts.length > 0) {
            walletAddress = accounts[0];
            walletConnected = true;
            
            // Switch to Sepolia network if needed
            await switchToSepolia();
            
            updateWalletUI();
            console.log('Wallet connected:', walletAddress);
            
            // Show success message
            showNotification('Wallet connected successfully!', 'success');
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification('Failed to connect wallet', 'error');
    }
}

async function switchToSepolia() {
    const sepoliaChainId = '0xaa36a7'; // Sepolia testnet chain ID
    
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainId }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: sepoliaChainId,
                            chainName: 'Sepolia Test Network',
                            nativeCurrency: {
                                name: 'SepoliaETH',
                                symbol: 'ETH',
                                decimals: 18,
                            },
                            rpcUrls: ['https://sepolia.infura.io/v3/'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                        },
                    ],
                });
            } catch (addError) {
                console.error('Error adding Sepolia network:', addError);
            }
        } else {
            console.error('Error switching to Sepolia:', switchError);
        }
    }
}

function updateWalletUI() {
    const connectBtn = document.getElementById('connectWalletBtn');
    if (connectBtn && walletConnected) {
        connectBtn.innerHTML = `
            <i class="ri-wallet-3-line mr-2"></i>
            ${formatAddress(walletAddress)}
        `;
        connectBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        connectBtn.classList.remove('bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'hover:from-blue-700', 'hover:to-purple-700');
    }
}

function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function loadProjects() {
    // Load projects from API
    fetch('/api/projects')
        .then(response => response.json())
        .then(data => {
            allProjects = data.projects || [];
            filteredProjects = [...allProjects];
            updateProjectDisplay();
        })
        .catch(error => {
            console.error('Error loading projects:', error);
            // Fallback to default projects if API fails
            loadDefaultProjects();
        });
}

function loadDefaultProjects() {
    // Default project data as fallback
    allProjects = [
        {
            id: 'ptf',
            title: 'PTF — Potato Tokenized Finance',
            sector: 'Agriculture',
            region: 'Thailand',
            issuer: 'Agritech SPV',
            apy: '14.8%',
            totalRaised: '150000',
            targetAmount: '3000000',
            currency: 'USDT',
            minInvestment: '10000',
            tenor: '12 months',
            riskLevel: 'Medium',
            description: 'Seed potato cultivation and processing in Northern Thailand with indexed offtake contracts.',
            keyFeatures: ['Multi-site Weather Protection', 'Indexed Offtake Contracts', '3M+ Operating Reserve'],
            image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=250&fit=crop',
            tokenStandard: 'ERC-1155',
            investors: '3',
            distributionFreq: 'Quarterly'
        }
    ];
    filteredProjects = [...allProjects];
    updateProjectDisplay();
}

function updateFilter(filterType, value) {
    currentFilters[filterType] = value;
    applyFilters();
    updateProjectDisplay();
}

function applyFilters() {
    filteredProjects = allProjects.filter(project => {
        // Sector filter
        if (currentFilters.sector !== 'all' && 
            project.sector.toLowerCase() !== currentFilters.sector.toLowerCase()) {
            return false;
        }

        // Risk level filter
        if (currentFilters.riskLevel !== 'all' && 
            project.riskLevel.toLowerCase() !== currentFilters.riskLevel.toLowerCase()) {
            return false;
        }

        // Region filter
        if (currentFilters.region !== 'all' && 
            project.region.toLowerCase() !== currentFilters.region.toLowerCase()) {
            return false;
        }

        // Min investment filter
        if (currentFilters.minInvestment !== 'all') {
            const maxAmount = parseInt(currentFilters.minInvestment);
            const projectMinInvestment = parseInt(project.minInvestment);
            if (projectMinInvestment > maxAmount) {
                return false;
            }
        }

        return true;
    });
}

function updateProjectDisplay() {
    const projectsContainer = document.getElementById('projectsGrid');
    if (!projectsContainer) return;

    if (filteredProjects.length === 0) {
        projectsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="ri-search-line text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p class="text-gray-600">Try adjusting your filters to see more investment opportunities.</p>
            </div>
        `;
        return;
    }

    projectsContainer.innerHTML = filteredProjects.map(project => generateProjectCard(project)).join('');
    
    // Add event listeners to new project cards
    setupProjectCardListeners();
}

function generateProjectCard(project) {
    const progressPercentage = (parseFloat(project.totalRaised) / parseFloat(project.targetAmount)) * 100;
    
    const getRiskColor = (risk) => {
        switch (risk.toLowerCase()) {
            case 'low': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSectorIcon = (sector) => {
        switch (sector.toLowerCase()) {
            case 'agriculture': return 'ri-plant-line';
            case 'healthcare': return 'ri-hospital-line';
            case 'infrastructure': return 'ri-building-line';
            case 'technology': return 'ri-computer-line';
            case 'real estate': return 'ri-home-line';
            default: return 'ri-briefcase-line';
        }
    };

    const formatAmount = (amount) => {
        const num = parseFloat(amount);
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toLocaleString();
    };

    return `
        <div class="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 group">
            <!-- Project Image -->
            <div class="relative h-48 overflow-hidden">
                <img 
                    src="${project.image || 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=250&fit=crop'}"
                    alt="${project.title}"
                    class="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div class="absolute top-3 left-3">
                    <div class="${getRiskColor(project.riskLevel)} px-2 py-1 rounded-full text-xs font-medium">
                        ${project.riskLevel} Risk
                    </div>
                </div>
                <div class="absolute top-3 right-3">
                    <div class="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                        ${project.tokenStandard || 'ERC-1155'}
                    </div>
                </div>
            </div>

            <div class="p-6">
                <!-- Header -->
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="${getSectorIcon(project.sector)} text-blue-600"></i>
                        </div>
                        <div>
                            <div class="text-xs text-gray-500">${project.sector}</div>
                            <div class="text-xs text-gray-400">${project.region}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-green-600">${project.apy}</div>
                        <div class="text-xs text-gray-500">Target APY</div>
                    </div>
                </div>

                <!-- Title and Description -->
                <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">${project.title}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${project.description}</p>

                <!-- Key Features -->
                <div class="mb-4">
                    <div class="flex flex-wrap gap-1">
                        ${project.keyFeatures.slice(0, 2).map(feature => `
                            <span class="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">${feature}</span>
                        `).join('')}
                        ${project.keyFeatures.length > 2 ? `<span class="text-xs text-gray-500">+${project.keyFeatures.length - 2} more</span>` : ''}
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="mb-4">
                    <div class="flex justify-between text-sm mb-2">
                        <span class="text-gray-600">Raised: ${project.currency} ${formatAmount(project.totalRaised)}</span>
                        <span class="text-gray-600">Target: ${project.currency} ${formatAmount(project.targetAmount)}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: ${Math.min(progressPercentage, 100)}%"></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">${progressPercentage.toFixed(1)}% funded</div>
                </div>

                <!-- Investment Info -->
                <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                        <div class="text-gray-500">Min Investment</div>
                        <div class="font-medium">${project.currency} ${formatAmount(project.minInvestment)}</div>
                    </div>
                    <div>
                        <div class="text-gray-500">Tenor</div>
                        <div class="font-medium">${project.tenor}</div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex space-x-3">
                    <button 
                        onclick="viewProjectDetails('${project.id}')"
                        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                    >
                        View Details
                    </button>
                    <button 
                        onclick="investInProject('${project.id}')"
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium ${!walletConnected ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${!walletConnected ? 'disabled' : ''}
                    >
                        <i class="ri-coins-line mr-1"></i>
                        Invest Now
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupProjectCardListeners() {
    // Add any additional event listeners for project cards
    console.log('Project card listeners set up');
}

function viewProjectDetails(projectId) {
    const project = allProjects.find(p => p.id === projectId);
    if (project) {
        // Navigate to project detail page or open modal
        window.location.href = `/project/${projectId}`;
    }
}

function investInProject(projectId) {
    if (!walletConnected) {
        showNotification('Please connect your wallet first', 'warning');
        return;
    }

    const project = allProjects.find(p => p.id === projectId);
    if (project) {
        // Navigate to investment flow
        window.location.href = `/invest?project=${projectId}`;
    }
}

function showMetaMaskInstallPrompt() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="ri-warning-line mr-2"></i>
            <span>Please install MetaMask to use Web3 features</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-yellow-600 hover:text-yellow-800">
                <i class="ri-close-line"></i>
            </button>
        </div>
    `;
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-100 border-green-400 text-green-700',
        error: 'bg-red-100 border-red-400 text-red-700',
        warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
        info: 'bg-blue-100 border-blue-400 text-blue-700'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} px-4 py-3 rounded-lg shadow-lg z-50 border`;
    notification.innerHTML = `
        <div class="flex items-center">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:opacity-75">
                <i class="ri-close-line"></i>
            </button>
        </div>
    `;
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Export functions for global access
window.V8Integration = {
    connectWallet,
    viewProjectDetails,
    investInProject,
    updateFilter,
    showNotification
};