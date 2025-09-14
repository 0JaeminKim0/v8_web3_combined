import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// API route to serve projects data
app.get('/api/projects', (c) => {
  return c.json({ projects })
})



// Investment platform project data (enhanced from v8)
const projects = [
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
    investors: '3',
    distributionFreq: 'Monthly',
    tokenStandard: 'ERC-3643'
  },
  {
    id: 'scn',
    title: 'SCN — Stem Cell Therapy Clinic',
    sector: 'Healthcare',
    region: 'Thailand',
    issuer: 'Bangkok Medical Innovation',
    apy: '18.2%',
    totalRaised: '700000',
    targetAmount: '14000000',
    currency: 'USDT',
    minInvestment: '25000',
    tenor: '24-36 months',
    riskLevel: 'High',
    description: 'Licensed regenerative medicine clinic in Bangkok specializing in stem cell therapy.',
    keyFeatures: ['FDA‑Equivalent Licensing', 'Medical Tourism Focus', 'KOL Partnerships'],
    investors: '2',
    distributionFreq: 'Monthly',
    tokenStandard: 'ERC-3643'
  },
  {
    id: 'reh',
    title: 'REH — Renewable Energy Hub',
    sector: 'Infrastructure',
    region: 'Thailand',
    issuer: 'Southeast Asia Energy Partners',
    apy: '15.2%',
    totalRaised: '1000000',
    targetAmount: '20000000',
    currency: 'USDT',
    minInvestment: '50000',
    tenor: '36 months',
    riskLevel: 'Medium',
    description: 'Large‑scale solar and wind energy installation with government PPA contracts.',
    keyFeatures: ['Government PPAs', 'Industrial Off‑takers', 'Insurance Coverage'],
    investors: '1',
    distributionFreq: 'Monthly',
    tokenStandard: 'ERC-3643'
  }
]

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
    
    // Check environment variables for real API keys
    const pinataJWT = c.env?.PINATA_JWT || process.env?.PINATA_JWT
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

// Investment Contract DApp page
app.get('/invest', (c) => {
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
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="/static/investment-dapp.js"></script>
    </body>
    </html>
  `)
})

// New Investment Platform Homepage (v8 style)
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Infinity Ventures - Next-Gen Real World Asset Investment Platform</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
        <style>
            .step-circle { 
                @apply w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold;
            }
            .step-circle.active { 
                @apply bg-blue-600 border-blue-600 text-white;
            }
            .step-circle:not(.active) { 
                @apply border-gray-300 text-gray-400;
            }
        </style>
    </head>
    <body class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <h1 class="text-xl font-bold text-gray-900">
                                <i class="ri-rocket-line mr-2 text-blue-600"></i>
                                Infinity Ventures
                            </h1>
                        </div>
                        <nav class="hidden md:ml-8 md:flex space-x-8">
                            <a href="/" class="text-blue-600 font-medium px-3 py-2">Home</a>
                            <a href="/portfolio" class="text-gray-600 hover:text-blue-600 px-3 py-2">Portfolio</a>
                            <a href="/how-it-works" class="text-gray-600 hover:text-blue-600 px-3 py-2">How It Works</a>
                            <a href="/invest" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="ri-coins-line mr-2"></i>
                                Start Investing
                            </a>
                        </nav>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button id="connectWalletBtn" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                            <i class="ri-wallet-line mr-2"></i>
                            Connect Wallet
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Hero Section -->
        <div class="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-purple-900/95"></div>
            
            <div class="relative px-4 sm:px-6 py-16 sm:py-24 max-w-7xl mx-auto">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <!-- Left Content -->
                    <div>
                        <div class="inline-flex items-center space-x-2 bg-blue-800/30 backdrop-blur-sm text-blue-200 px-4 py-2 rounded-full text-sm mb-6">
                            <i class="ri-shield-check-line text-sm"></i>
                            <span>SEC Compliant • KYC Verified • Blockchain Secured</span>
                        </div>
                        
                        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Next-Gen <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Real World Asset</span> Investment Platform
                        </h1>
                        
                        <p class="text-lg lg:text-xl text-blue-100 mb-8 leading-relaxed">
                            Invest in institutional-grade real-world assets with blockchain verification. 
                            Experience monthly USDT distributions, KYC authentication, and innovative DeFi technology.
                        </p>

                        <div class="flex flex-col sm:flex-row gap-4 mb-8">
                            <a href="/invest" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all text-lg text-center">
                                <i class="ri-play-circle-line mr-2"></i>
                                Start Investing in 3 Minutes
                            </a>
                            <a href="/portfolio" class="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all text-lg border border-white/20 text-center">
                                <i class="ri-eye-line mr-2"></i>
                                Explore Opportunities
                            </a>
                        </div>

                        <!-- Live Stats -->
                        <div class="grid grid-cols-3 gap-6">
                            <div class="text-center">
                                <div class="text-2xl lg:text-3xl font-bold text-white mb-1">$5.0M+</div>
                                <div class="text-sm text-blue-200">Total Investments</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl lg:text-3xl font-bold text-white mb-1">14</div>
                                <div class="text-sm text-blue-200">Early Investors</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl lg:text-3xl font-bold text-white mb-1">15.8%</div>
                                <div class="text-sm text-blue-200">Average Returns</div>
                            </div>
                        </div>
                    </div>

                    <!-- Right - Quick Investment Calculator -->
                    <div class="lg:pl-8">
                        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                            <h3 class="text-2xl font-bold text-white mb-6">Quick Investment Calculator</h3>
                            
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-blue-200 mb-2">Investment Amount (USDT)</label>
                                    <input 
                                        type="number" 
                                        id="investmentAmount"
                                        value="10000"
                                        placeholder="10,000" 
                                        class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-blue-200 text-lg"
                                    />
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium text-blue-200 mb-2">Expected Returns</label>
                                    <select id="riskProfile" class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white">
                                        <option value="12.4" class="text-gray-900">Conservative (12.4% APY)</option>
                                        <option value="15.8" class="text-gray-900" selected>Balanced (15.8% APY)</option>
                                        <option value="19.2" class="text-gray-900">Aggressive (19.2% APY)</option>
                                    </select>
                                </div>

                                <div class="bg-white/10 rounded-lg p-4 mt-6">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="text-blue-200 text-sm">Monthly Expected Return</span>
                                        <span id="monthlyReturn" class="text-white font-bold text-lg">$131 USDT</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-blue-200 text-sm">Annual Expected Return</span>
                                        <span id="annualReturn" class="text-green-400 font-bold text-xl">$1,580 USDT</span>
                                    </div>
                                </div>

                                <a href="/invest" class="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all block text-center">
                                    <i class="ri-user-check-line mr-2"></i>
                                    Start Investment Process
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Investment Opportunities -->
        <div class="py-20 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6">
                <div class="text-center mb-16">
                    <div class="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm mb-4">
                        <i class="ri-award-line"></i>
                        <span>Curated Investment Opportunities</span>
                    </div>
                    <h2 class="text-4xl font-bold text-gray-900 mb-4">Real-World Asset Investments</h2>
                    <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                        Institutional-grade investments verified through regulatory compliance with blockchain transparency
                    </p>
                </div>

                <!-- Advanced Filtering System from V8 -->
                <div class="bg-white rounded-xl p-6 mb-8 border border-gray-200 shadow-sm">
                    <div class="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div class="flex items-center space-x-2">
                            <i class="ri-filter-line text-gray-600"></i>
                            <span class="font-medium text-gray-900">Filter Opportunities:</span>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row gap-4 flex-1">
                            <!-- Sector Filter -->
                            <div class="flex-1">
                                <label class="block text-sm text-gray-600 mb-2">Sector</label>
                                <select id="sectorFilter" class="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer">
                                    <option value="all">All Sectors</option>
                                    <option value="Agriculture">Agriculture</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Infrastructure">Infrastructure</option>
                                    <option value="Real Estate">Real Estate</option>
                                </select>
                            </div>

                            <!-- Risk Level Filter -->
                            <div class="flex-1">
                                <label class="block text-sm text-gray-600 mb-2">Risk Level</label>
                                <select id="riskFilter" class="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer">
                                    <option value="all">All Risk Levels</option>
                                    <option value="Low">Low Risk</option>
                                    <option value="Medium">Medium Risk</option>
                                    <option value="High">High Risk</option>
                                </select>
                            </div>

                            <!-- Min Investment Filter -->
                            <div class="flex-1">
                                <label class="block text-sm text-gray-600 mb-2">Max Min Investment</label>
                                <select id="minInvestmentFilter" class="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer">
                                    <option value="all">Any Amount</option>
                                    <option value="10000">Up to $10K</option>
                                    <option value="25000">Up to $25K</option>
                                    <option value="50000">Up to $50K</option>
                                    <option value="100000">Up to $100K</option>
                                </select>
                            </div>

                            <!-- Region Filter -->
                            <div class="flex-1">
                                <label class="block text-sm text-gray-600 mb-2">Region</label>
                                <select id="regionFilter" class="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer">
                                    <option value="all">All Regions</option>
                                    <option value="Thailand">Thailand</option>
                                    <option value="Southeast Asia">Southeast Asia</option>
                                    <option value="Global">Global</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Dynamic Projects Grid -->
                <div id="projectsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Projects will be dynamically loaded here -->
                </div>
                
                <div class="text-center mt-12">
                    <a href="/portfolio" class="inline-flex items-center space-x-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                        <span>View All Investment Opportunities</span>
                        <i class="ri-arrow-right-line"></i>
                    </a>
                </div>
            </div>
        </div>

        <!-- Platform Features -->
        <div class="py-20 bg-gray-50">
            <div class="max-w-7xl mx-auto px-4 sm:px-6">
                <div class="text-center mb-16">
                    <h2 class="text-4xl font-bold text-gray-900 mb-4">Why Choose Infinity Ventures?</h2>
                    <p class="text-xl text-gray-600">Built with institutional standards and blockchain innovation</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all">
                        <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                            <i class="ri-shield-check-line text-white text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Full Regulatory Compliance</h3>
                        <p class="text-gray-600 mb-4">ERC-3643 permissioned tokens with built-in KYC/AML verification and transfer restrictions for complete regulatory compliance.</p>
                    </div>

                    <div class="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all">
                        <div class="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                            <i class="ri-line-chart-line text-white text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Transparent Performance</h3>
                        <p class="text-gray-600 mb-4">Real-time proof of reserves with automated monitoring and transparent performance tracking through blockchain oracles.</p>
                    </div>

                    <div class="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all">
                        <div class="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                            <i class="ri-coin-line text-white text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Monthly USDT Distributions</h3>
                        <p class="text-gray-600 mb-4">Automated monthly USDT payments with verification systems and shareholder registry synchronization.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- CTA Section -->
        <div class="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
            <div class="absolute inset-0 bg-black/20"></div>
            <div class="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
                <h2 class="text-4xl lg:text-5xl font-bold mb-6">Ready to Start Investing?</h2>
                <p class="text-xl text-blue-100 mb-10">
                    Join early investors in institutional-grade real-world asset opportunities
                </p>
                
                <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <a href="/invest" class="bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                        <i class="ri-play-circle-line mr-2"></i>
                        Start Investing Now
                    </a>
                    <a href="/portfolio" class="bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30">
                        <i class="ri-search-line mr-2"></i>
                        Explore Opportunities
                    </a>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-gray-100 py-8">
            <div class="max-w-6xl mx-auto px-4 sm:px-6">
                <div class="text-center mb-6">
                    <p class="text-sm text-gray-600 mb-4 leading-relaxed">
                        <strong>Important:</strong> This service involves investment risks. All investments carry risk of principal loss. 
                        Regional qualification requirements vary and KYC verification is required.
                    </p>
                </div>
                
                <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div class="flex items-center gap-6 text-xs text-gray-500">
                        <a href="/legal/terms" class="hover:text-gray-700">Terms of Service</a>
                        <a href="/legal/privacy" class="hover:text-gray-700">Privacy Policy</a>
                        <a href="/legal/risk" class="hover:text-gray-700">Risk Disclosure</a>
                    </div>
                    
                    <div class="text-xs text-gray-500">
                        © 2024 Infinity Ventures. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script>
            // Investment Calculator
            function updateCalculator() {
                const amount = parseFloat(document.getElementById('investmentAmount').value) || 10000;
                const apy = parseFloat(document.getElementById('riskProfile').value) || 15.8;
                
                const monthlyReturn = (amount * apy / 100) / 12;
                const annualReturn = amount * apy / 100;
                
                document.getElementById('monthlyReturn').textContent = '$' + Math.round(monthlyReturn).toLocaleString() + ' USDT';
                document.getElementById('annualReturn').textContent = '$' + Math.round(annualReturn).toLocaleString() + ' USDT';
            }
            
            document.getElementById('investmentAmount').addEventListener('input', updateCalculator);
            document.getElementById('riskProfile').addEventListener('change', updateCalculator);
            
            // Wallet Connection (basic)
            document.getElementById('connectWalletBtn').addEventListener('click', function() {
                window.location.href = '/invest';
            });
            
            // Initialize calculator
            updateCalculator();
        </script>
    </body>
    </html>
  `)
})

// Portfolio page
app.get('/portfolio', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Investment Portfolio - Infinity Ventures</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    </head>
    <body class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <a href="/" class="flex-shrink-0">
                            <h1 class="text-xl font-bold text-gray-900">
                                <i class="ri-rocket-line mr-2 text-blue-600"></i>
                                Infinity Ventures
                            </h1>
                        </a>
                        <nav class="hidden md:ml-8 md:flex space-x-8">
                            <a href="/" class="text-gray-600 hover:text-blue-600 px-3 py-2">Home</a>
                            <a href="/portfolio" class="text-blue-600 font-medium px-3 py-2">Portfolio</a>
                            <a href="/how-it-works" class="text-gray-600 hover:text-blue-600 px-3 py-2">How It Works</a>
                            <a href="/invest" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="ri-coins-line mr-2"></i>
                                Start Investing
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </header>

        <!-- Portfolio Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-4">Investment Opportunities</h1>
                <p class="text-lg text-gray-600">Explore our curated selection of real-world asset investments</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${projects.map(project => `
                    <div class="bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <span class="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">${project.sector}</span>
                                <span class="text-2xl font-bold text-green-600">${project.apy}</span>
                            </div>
                            
                            <h3 class="text-xl font-bold text-gray-900 mb-3">${project.title}</h3>
                            <p class="text-gray-600 mb-4">${project.description}</p>
                            
                            <div class="space-y-2 mb-4">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">Min Investment</span>
                                    <span class="font-medium">$${parseInt(project.minInvestment).toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">Period</span>
                                    <span class="font-medium">${project.tenor}</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-500">Risk Level</span>
                                    <span class="font-medium">${project.riskLevel}</span>
                                </div>
                            </div>

                            <a href="/invest?project=${project.id}" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block">
                                <i class="ri-arrow-right-line mr-2"></i>
                                Invest Now
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- V8 Integration Scripts -->
        <script src="/static/v8-integration.js"></script>
        
        <!-- Quick Calculator Logic -->
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const amountInput = document.getElementById('investmentAmount');
                const riskSelect = document.getElementById('riskProfile');
                const monthlyReturn = document.getElementById('monthlyReturn');
                const annualReturn = document.getElementById('annualReturn');

                function updateCalculations() {
                    const amount = parseFloat(amountInput.value) || 10000;
                    const apy = parseFloat(riskSelect.value) || 15.8;
                    
                    const monthly = (amount * apy / 100 / 12);
                    const annual = (amount * apy / 100);
                    
                    monthlyReturn.textContent = '$' + monthly.toFixed(0) + ' USDT';
                    annualReturn.textContent = '$' + annual.toFixed(0) + ' USDT';
                }

                amountInput.addEventListener('input', updateCalculations);
                riskSelect.addEventListener('change', updateCalculations);
                updateCalculations();
            });
        </script>
    </body>
    </html>
  `)
})

export default app
