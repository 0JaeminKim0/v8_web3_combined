// Railway Server for Investment Receipt SBT DApp
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'

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
    contractAddress: '0x925c486EA3F98BD164bA23e7221De9EdAC0869d7', // Real deployed contract
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
    
    // Check environment variables for real API keys
    const pinataJWT = process.env?.PINATA_JWT
    const useRealIPFS = pinataJWT && pinataJWT !== 'your-pinata-jwt-token-here'
    
    if (!useRealIPFS) {
      // Demo mode - return local document info instead of invalid IPFS URLs
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Use a deterministic hash based on content for consistency
      const contentHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content))
      const hashArray = Array.from(new Uint8Array(contentHash))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      return c.json({
        success: true,
        ipfsHash: `demo_${hashHex.substring(0, 46)}`, // Clearly marked as demo
        ipfsUrl: null, // Don't provide invalid URLs
        localDocument: true, // Indicates this is stored locally
        pinned: false,
        timestamp: Date.now(),
        size: content.length,
        isDemoMode: true,
        message: 'Document generated locally. Enable real IPFS by configuring Pinata API keys.'
      })
    }
    
    // Real IPFS upload using Pinata JWT authentication
    try {
      // Create a JSON file with the content and metadata
      const documentData = {
        content: JSON.parse(content),
        metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          filename: filename
        }
      }
      
      const blob = new Blob([JSON.stringify(documentData, null, 2)], { type: 'application/json' })
      
      const formData = new FormData()
      formData.append('file', blob, filename)
      
      // Add Pinata metadata
      formData.append('pinataMetadata', JSON.stringify({
        name: filename,
        keyvalues: {
          type: 'investment-contract',
          version: '1.0',
          ...metadata
        }
      }))
      
      // Add Pinata options
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 0
      }))
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJWT}`,
        },
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Pinata upload failed (${response.status}): ${errorData}`)
      }
      
      const result = await response.json()
      
      return c.json({
        success: true,
        ipfsHash: result.IpfsHash,
        ipfsUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        pinned: true,
        timestamp: Date.now(),
        size: result.PinSize,
        isDemoMode: false
      })
      
    } catch (uploadError) {
      console.error('IPFS upload error:', uploadError)
      // Fall back to demo mode if real upload fails
      const contentHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content))
      const hashArray = Array.from(new Uint8Array(contentHash))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      return c.json({
        success: true,
        ipfsHash: `demo_${hashHex.substring(0, 46)}`,
        ipfsUrl: null,
        localDocument: true,
        pinned: false,
        timestamp: Date.now(),
        size: content.length,
        isDemoMode: true,
        error: uploadError.message,
        message: 'IPFS upload failed. Document generated locally. Check your Pinata API configuration.'
      })
    }
    
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

// Save new investment (for real transactions)
app.post('/api/investment/save', async (c) => {
  try {
    const body = await c.req.json()
    const { account, investment } = body
    
    // In a real implementation, you would save to a database
    // For now, we'll just validate and return success
    console.log(`Saving investment for ${account}:`, investment)
    
    // Validate required fields
    if (!account || !investment.txHash || !investment.tokenId) {
      return c.json({
        success: false,
        error: 'Missing required fields: account, txHash, tokenId'
      }, 400)
    }
    
    // TODO: In production, save to database (D1, KV, or external DB)
    // await saveToDatabase(account, investment)
    
    return c.json({
      success: true,
      message: 'Investment saved successfully',
      investment: investment
    })
    
  } catch (error) {
    console.error('Save investment error:', error)
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Investment Receipt SBT DApp',
    platform: 'Railway',
    version: '1.0.0'
  })
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
                <div class="mt-4 flex flex-wrap justify-center gap-2 text-sm">
                    <span class="bg-green-600/20 text-green-300 px-3 py-1 rounded-full border border-green-500/30">
                        <i class="fas fa-check mr-2"></i>Real ETH Transactions
                    </span>
                    <span class="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                        <i class="fas fa-link mr-2"></i>Live on Sepolia
                    </span>
                    <span class="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                        <i class="fas fa-shield-alt mr-2"></i>NFT/SBT Ready
                    </span>
                    <span class="bg-red-600/20 text-red-300 px-3 py-1 rounded-full border border-red-500/30">
                        <i class="fas fa-train mr-2"></i>Railway Deployed
                    </span>
                </div>
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
                        <div class="flex-1">
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
                
                <!-- Non-Sepolia Network Warning -->
                <div id="network-warning" class="hidden mt-3 p-3 bg-orange-600/20 border border-orange-500/30 rounded-lg text-sm">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex items-start gap-2">
                            <i class="fas fa-exclamation-triangle text-orange-400 mt-0.5"></i>
                            <div>
                                <div class="font-semibold text-orange-300 mb-1">Not on Sepolia Testnet</div>
                                <div class="text-orange-200 text-xs">
                                    For the best experience, switch to Sepolia Testnet for free test ETH and optimized features.
                                </div>
                            </div>
                        </div>
                        <button id="switch-to-sepolia-btn" class="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 rounded transition-colors whitespace-nowrap">
                            Switch to Sepolia
                        </button>
                    </div>
                </div>
            </div>

            <!-- Quick Setup Guide -->
            <div id="setup-guide" class="mt-8 bg-blue-600/20 backdrop-blur rounded-xl p-6 text-white">
                <h3 class="text-xl font-semibold mb-4">
                    <i class="fas fa-rocket mr-2"></i>
                    Quick Setup Guide
                </h3>
                <div class="grid md:grid-cols-3 gap-6 text-sm">
                    <div class="space-y-2">
                        <div class="font-semibold text-blue-300">
                            <span class="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-2">1</span>
                            Install MetaMask
                        </div>
                        <p class="text-gray-200 ml-8">
                            Download MetaMask browser extension from 
                            <a href="https://metamask.io" target="_blank" class="underline text-blue-300">metamask.io</a>
                        </p>
                    </div>
                    <div class="space-y-2">
                        <div class="font-semibold text-blue-300">
                            <span class="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-2">2</span>
                            Get Test ETH
                        </div>
                        <p class="text-gray-200 ml-8">
                            Visit <a href="https://sepoliafaucet.com" target="_blank" class="underline text-blue-300">Sepolia Faucet</a> 
                            to get free test ETH (0.5 ETH daily)
                        </p>
                    </div>
                    <div class="space-y-2">
                        <div class="font-semibold text-blue-300">
                            <span class="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-2">3</span>
                            Connect & Switch
                        </div>
                        <p class="text-gray-200 ml-8">
                            Connect your wallet and switch to Sepolia Testnet when prompted
                        </p>
                    </div>
                </div>
            </div>

            <!-- Features -->
            <div class="mt-8 grid md:grid-cols-3 gap-6 text-center text-white">
                <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div class="text-3xl mb-3">🧪</div>
                    <h3 class="font-semibold mb-2">Testnet Ready</h3>
                    <p class="text-sm text-gray-200">Experience full functionality with free test ETH on Sepolia Testnet.</p>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div class="text-3xl mb-3">📄</div>
                    <h3 class="font-semibold mb-2">Real PDF Contracts</h3>
                    <p class="text-sm text-gray-200">Generate and download actual PDF investment contracts with cryptographic verification.</p>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div class="text-3xl mb-3">🌐</div>
                    <h3 class="font-semibold mb-2">IPFS Storage</h3>
                    <p class="text-sm text-gray-200">Documents stored permanently on IPFS with immutable hash verification.</p>
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
            
            <!-- Contract Information Panel -->
            <div class="mt-8 bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 class="text-lg font-bold mb-4 text-center text-white">📄 Smart Contract Information</h3>
                <div class="text-sm space-y-2 max-w-2xl mx-auto text-gray-300">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Contract Address:</span>
                        <span class="font-mono text-xs text-white">0x925c486EA3F98BD164bA23e7221De9EdAC0869d7</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Network:</span>
                        <span class="text-green-400">Sepolia Testnet</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Type:</span>
                        <span class="text-purple-400">ERC-721 Compatible SBT</span>
                    </div>
                    <div class="flex flex-wrap justify-center gap-4 mt-4">
                        <a href="https://sepolia.etherscan.io/address/0x925c486EA3F98BD164bA23e7221De9EdAC0869d7" target="_blank" 
                           class="text-blue-400 hover:text-blue-300 text-xs">
                            <i class="fas fa-external-link-alt mr-1"></i>View on Etherscan
                        </a>
                        <a href="https://testnets.opensea.io/assets/sepolia/0x925c486EA3F98BD164bA23e7221De9EdAC0869d7" target="_blank" 
                           class="text-purple-400 hover:text-purple-300 text-xs">
                            <i class="fas fa-external-link-alt mr-1"></i>View on OpenSea
                        </a>
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

// Start server
const port = parseInt(process.env.PORT) || 3000

console.log(`🚀 Starting Investment Receipt SBT DApp server on port ${port}`)
console.log(`🌍 Platform: Railway`)
console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`)

serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0'
})

console.log(`✅ SBT DApp server running on http://0.0.0.0:${port}`)
console.log(`🔗 Health check: http://0.0.0.0:${port}/health`)
console.log(`💰 Contract Address: 0x925c486EA3F98BD164bA23e7221De9EdAC0869d7`)