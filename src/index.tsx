import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// API routes for wallet operations
app.get('/api/supported-wallets', (c) => {
  return c.json({
    wallets: [
      {
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        installed: false, // This will be detected on frontend
        deepLink: 'https://metamask.app.link/dapp/'
      },
      {
        id: 'trustwallet',
        name: 'Trust Wallet', 
        icon: '🛡️',
        installed: false,
        deepLink: 'https://link.trustwallet.com/open_url?coin_id=60&url='
      },
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: '🔵',
        installed: false,
        deepLink: 'https://go.cb-w.com/dapp?cb_url='
      },
      {
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: '🔗',
        installed: true, // Always available via QR/deep linking
        deepLink: null
      }
    ]
  })
})

app.get('/api/network-info', (c) => {
  return c.json({
    networks: [
      { 
        chainId: '0xaa36a7', 
        name: 'Sepolia Testnet', 
        symbol: 'ETH',
        testnet: true,
        faucet: 'https://sepoliafaucet.com',
        explorer: 'https://sepolia.etherscan.io'
      },
      { 
        chainId: '0x5', 
        name: 'Goerli Testnet', 
        symbol: 'ETH',
        testnet: true,
        faucet: 'https://goerlifaucet.com',
        explorer: 'https://goerli.etherscan.io'
      },
      { 
        chainId: '0x13881', 
        name: 'Polygon Mumbai', 
        symbol: 'MATIC',
        testnet: true,
        faucet: 'https://mumbaifaucet.com',
        explorer: 'https://mumbai.polygonscan.com'
      },
      { 
        chainId: '0x1', 
        name: 'Ethereum Mainnet', 
        symbol: 'ETH',
        testnet: false,
        explorer: 'https://etherscan.io'
      }
    ]
  })
})

// Investment Contract APIs
app.get('/api/investment/contract-info', (c) => {
  return c.json({
    contractAddress: '0x742d35Cc8058C65C0863a9e20C0be2A7C1234567', // Will be deployed on Sepolia
    contractName: 'InvestmentReceiptSBT',
    version: '1.0.0',
    network: 'Sepolia Testnet',
    networkId: '0xaa36a7',
    explorer: 'https://sepolia.etherscan.io',
    abi: 'https://api.example.com/abi/investment-receipt-sbt.json',
    testnet: true,
    faucets: [
      {
        name: 'Sepolia Faucet',
        url: 'https://sepoliafaucet.com',
        daily: '0.5 ETH'
      },
      {
        name: 'Alchemy Sepolia Faucet', 
        url: 'https://sepoliafaucet.io',
        daily: '0.5 ETH'
      }
    ]
  })
})

app.get('/api/investment/templates', (c) => {
  return c.json({
    templates: [
      {
        id: 'fixed-term',
        name: 'Fixed Term Investment',
        description: 'Traditional fixed-term investment with guaranteed APY',
        minAmount: '0.1',
        maxAmount: '100',
        terms: ['3 months', '6 months', '12 months'],
        targetAPYRange: { min: 5, max: 15 },
        features: ['Fixed APY', 'Principal Protected', 'Early Exit Penalty']
      },
      {
        id: 'variable-yield',
        name: 'Variable Yield Investment', 
        description: 'Market-linked investment with variable returns',
        minAmount: '0.5',
        maxAmount: '1000',
        terms: ['6 months', '12 months', '24 months'],
        targetAPYRange: { min: 8, max: 25 },
        features: ['Variable APY', 'Market Exposure', 'Flexible Exit']
      },
      {
        id: 'defi-strategy',
        name: 'DeFi Strategy Pool',
        description: 'Automated DeFi yield farming strategy',
        minAmount: '1',
        maxAmount: '500',
        terms: ['1 month', '3 months', '6 months'],
        targetAPYRange: { min: 12, max: 40 },
        features: ['DeFi Protocols', 'Auto-Compound', 'High Yield']
      }
    ]
  })
})

// Real PDF generation service (browser-based)
app.post('/api/external/generate-pdf', async (c) => {
  try {
    const body = await c.req.json()
    
    // Generate PDF content (will be handled on frontend using jsPDF)
    const pdfData = {
      investmentTerms: body,
      timestamp: new Date().toISOString(),
      contractVersion: '1.0.0'
    }
    
    // Calculate SHA-256 hash of the content
    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(pdfData, null, 2))
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return c.json({
      success: true,
      pdfData: pdfData,
      hash: hashHex,
      timestamp: Date.now(),
      needsFrontendGeneration: true // Signal that PDF should be generated on frontend
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Real IPFS upload service using Pinata
app.post('/api/external/upload-ipfs', async (c) => {
  try {
    const body = await c.req.json()
    const { content, filename, metadata } = body
    
    // For demo purposes, we'll simulate IPFS upload
    // In production, you would use actual Pinata API keys from environment variables
    const isDev = true // Set to false when you have real API keys
    
    if (isDev) {
      // Development simulation with more realistic data
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockHash = 'Qm' + Array.from({length: 44}, () => 
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
      ).join('')
      
      return c.json({
        success: true,
        ipfsHash: mockHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${mockHash}`,
        pinned: true,
        timestamp: Date.now(),
        size: content.length,
        isDemoMode: true
      })
    }
    
    // Production IPFS upload (uncomment when you have API keys)
    /*
    const PINATA_API_KEY = c.env?.PINATA_API_KEY
    const PINATA_SECRET_KEY = c.env?.PINATA_SECRET_API_KEY
    
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata API credentials not configured')
    }
    
    const formData = new FormData()
    formData.append('file', new Blob([content], { type: 'application/json' }), filename)
    
    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify({
        name: filename,
        keyvalues: metadata
      }))
    }
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    return c.json({
      success: true,
      ipfsHash: result.IpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      pinned: true,
      timestamp: Date.now(),
      size: result.PinSize
    })
    */
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// Mock investment data
app.get('/api/investment/user-investments/:address', (c) => {
  const address = c.req.param('address')
  
  // Mock user investments data
  const mockInvestments = [
    {
      tokenId: '1',
      investor: address,
      principal: '5.5',
      targetAPY: 12.5,
      startTime: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
      maturityTime: Date.now() + (335 * 24 * 60 * 60 * 1000), // 335 days from now  
      status: 'Active',
      contractType: 'Fixed Term Investment',
      ipfsHash: 'QmAbC123dEf456GhI789jKl012MnO345pQr678StU901vWx234',
      termsHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    },
    {
      tokenId: '2', 
      investor: address,
      principal: '2.0',
      targetAPY: 18.0,
      startTime: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
      maturityTime: Date.now() + (358 * 24 * 60 * 60 * 1000), // 358 days from now
      status: 'Active',
      contractType: 'DeFi Strategy Pool',
      ipfsHash: 'QmXyZ789aBc012DeF345gHi678JkL901mNo234PqR567sT890',
      termsHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    }
  ]
  
  return c.json({ investments: mockInvestments })
})

// Investment Contract DApp page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Investment Receipt SBT - Blockchain Investment Contracts</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            'crypto-blue': '#1e40af',
                            'crypto-purple': '#7c3aed',
                            'crypto-orange': '#ea580c'
                        }
                    }
                }
            }
        </script>
        <style>
            .gradient-bg {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .wallet-card {
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            .wallet-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .pulse-animation {
                animation: pulse 2s infinite;
            }
            .step-circle {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255,255,255,0.2);
                font-weight: bold;
                transition: all 0.3s ease;
            }
            .step-circle.active {
                background: #10b981;
                color: white;
            }
            .step-circle.completed {
                background: #059669;
                color: white;
            }
            .investment-card {
                transition: all 0.3s ease;
                border-left: 4px solid transparent;
            }
            .investment-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                border-left-color: #10b981;
            }
            .status-active {
                color: #10b981;
                background: rgba(16, 185, 129, 0.1);
            }
            .status-pending {
                color: #f59e0b;
                background: rgba(245, 158, 11, 0.1);
            }
            .status-completed {
                color: #6b7280;
                background: rgba(107, 114, 128, 0.1);
            }
        </style>
    </head>
    <body class="gradient-bg min-h-screen flex items-center justify-center p-4">
        <div class="max-w-4xl w-full">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
                    <i class="fas fa-file-contract mr-3"></i>
                    Investment Receipt SBT
                </h1>
                <p class="text-xl text-gray-200 max-w-2xl mx-auto">
                    Create blockchain-verified investment contracts with Soul Bound Token receipts. Transparent, secure, and immutable proof of investment terms.
                </p>
            </div>

            <!-- App Sections -->
            <div id="app-sections" class="space-y-8">
                <!-- Wallet Connection Section -->
                <div id="wallet-section" class="bg-white/10 backdrop-blur rounded-xl p-6">
                    <h2 class="text-2xl font-bold text-white mb-4">
                        <i class="fas fa-wallet mr-2"></i>
                        Step 1: Connect Your Wallet
                    </h2>
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <!-- Wallet cards will be populated here -->
                    </div>
                </div>

                <!-- Investment Dashboard Section -->
                <div id="dashboard-section" class="hidden bg-white/10 backdrop-blur rounded-xl p-6 text-white">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold">
                            <i class="fas fa-tachometer-alt mr-2"></i>
                            Investment Dashboard
                        </h2>
                        <button id="create-investment-btn" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors">
                            <i class="fas fa-plus mr-2"></i>New Investment
                        </button>
                    </div>
                    
                    <!-- User investments will be populated here -->
                    <div id="user-investments" class="space-y-4">
                        <!-- Investment cards will be populated -->
                    </div>
                </div>

                <!-- Investment Creation Section -->
                <div id="create-section" class="hidden bg-white/10 backdrop-blur rounded-xl p-6 text-white">
                    <h2 class="text-2xl font-bold mb-6">
                        <i class="fas fa-plus-circle mr-2"></i>
                        Create New Investment Contract
                    </h2>
                    
                    <!-- Step indicators -->
                    <div class="flex justify-between mb-8">
                        <div class="flex items-center text-sm">
                            <div class="step-circle active" data-step="1">1</div>
                            <span class="ml-2">Choose Template</span>
                        </div>
                        <div class="flex items-center text-sm">
                            <div class="step-circle" data-step="2">2</div>
                            <span class="ml-2">Set Terms</span>
                        </div>
                        <div class="flex items-center text-sm">
                            <div class="step-circle" data-step="3">3</div>
                            <span class="ml-2">Generate Contract</span>
                        </div>
                        <div class="flex items-center text-sm">
                            <div class="step-circle" data-step="4">4</div>
                            <span class="ml-2">Deposit & Mint</span>
                        </div>
                    </div>

                    <!-- Investment creation form -->
                    <div id="investment-form">
                        <!-- Form content will be populated here -->
                    </div>
                </div>
            </div>

            <!-- Connection Status -->
            <div id="connection-status" class="hidden mb-6 p-4 rounded-lg border-l-4">
                <div class="flex items-center">
                    <div id="status-icon" class="mr-3 text-2xl"></div>
                    <div>
                        <div id="status-title" class="font-semibold"></div>
                        <div id="status-message" class="text-sm"></div>
                    </div>
                </div>
            </div>

            <!-- Wallet Grid -->
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Wallet cards will be populated here -->
            </div>

            <!-- Connected Wallet Info -->
            <div id="wallet-info" class="hidden bg-green-600/20 backdrop-blur rounded-xl p-4 text-white border border-green-500/30">
                <div class="flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center flex-wrap gap-2">
                        <i class="fas fa-check-circle text-green-400"></i>
                        <span class="font-semibold">Connected:</span>
                        <span id="wallet-address-short" class="font-mono text-sm bg-white/20 px-2 py-1 rounded"></span>
                        <span class="text-xs">•</span>
                        <span id="wallet-network-display" class="text-xs bg-blue-600/30 px-2 py-1 rounded"></span>
                        <span id="testnet-badge" class="hidden text-xs bg-yellow-600/30 px-2 py-1 rounded">
                            <i class="fas fa-flask mr-1"></i>TESTNET
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <button id="get-test-eth-btn" class="hidden text-xs bg-yellow-600/80 hover:bg-yellow-600 px-3 py-1 rounded transition-colors">
                            <i class="fas fa-coins mr-1"></i>Get Test ETH
                        </button>
                        <button id="wallet-details-btn" class="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors">
                            <i class="fas fa-info-circle mr-1"></i>Details
                        </button>
                        <button id="disconnect-btn" class="text-xs bg-red-600/80 hover:bg-red-600 px-3 py-1 rounded transition-colors">
                            <i class="fas fa-sign-out-alt mr-1"></i>Disconnect
                        </button>
                    </div>
                </div>
                
                <!-- Testnet Information -->
                <div id="testnet-info" class="hidden mt-3 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg text-sm">
                    <div class="flex items-start gap-2">
                        <i class="fas fa-info-circle text-yellow-400 mt-0.5"></i>
                        <div>
                            <div class="font-semibold text-yellow-300 mb-1">Testnet Mode Active</div>
                            <div class="text-yellow-200 text-xs">
                                You're connected to a test network. Use test ETH for transactions.
                                <span id="faucet-links" class="block mt-1">
                                    <!-- Faucet links will be populated here -->
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Features -->
            <div class="mt-8 grid md:grid-cols-3 gap-6 text-center text-white">
                <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div class="text-3xl mb-3">📋</div>
                    <h3 class="font-semibold mb-2">Smart Contracts</h3>
                    <p class="text-sm text-gray-200">Automated investment terms with blockchain verification and SBT receipts.</p>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div class="text-3xl mb-3">🔗</div>
                    <h3 class="font-semibold mb-2">Soul Bound Tokens</h3>
                    <p class="text-sm text-gray-200">Non-transferable NFT receipts that prove your investment terms immutably.</p>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div class="text-3xl mb-3">📄</div>
                    <h3 class="font-semibold mb-2">IPFS Documentation</h3>
                    <p class="text-sm text-gray-200">Contract documents stored permanently on IPFS with cryptographic hashes.</p>
                </div>
            </div>

            <!-- Network Selection Modal -->
            <div id="network-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-xl max-w-md w-full p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Select Network</h3>
                        <button id="close-modal" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="networks-list" class="space-y-2">
                        <!-- Networks will be populated here -->
                    </div>
                </div>
            </div>

            <!-- Investment Details Modal -->
            <div id="investment-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Investment Contract Details</h3>
                        <button id="close-investment-modal" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="investment-details">
                        <!-- Investment details will be populated here -->
                    </div>
                </div>
            </div>

            <!-- Wallet Details Modal -->
            <div id="wallet-details-modal" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div class="bg-white rounded-xl max-w-md w-full p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Wallet Details</h3>
                        <button id="close-wallet-details-modal" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="wallet-details-content">
                        <!-- Wallet details will be populated here -->
                    </div>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="/static/investment-dapp.js"></script>
    </body>
    </html>
  `)
})

export default app
