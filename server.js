// Railway Deployment Server for Investment Receipt SBT DApp
// Node.js server using Hono framework

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = new Hono()

// Enable CORS for frontend-backend communication
app.use('/api/*', cors({
  origin: ['http://localhost:3000', 'https://*.railway.app', 'https://*.up.railway.app'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Serve static files from public directory
app.use('/static/*', serveStatic({ 
  root: './public',
  rewriteRequestPath: (path) => path.replace(/^\/static/, '')
}))

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
        installed: true, // Always available
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
        decimals: 18,
        rpcUrls: ['https://sepolia.infura.io/v3/', 'https://rpc.sepolia.org'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
        faucetUrls: ['https://sepoliafaucet.com', 'https://faucets.chain.link/sepolia'],
        isTestnet: true,
        recommended: true
      },
      {
        chainId: '0x5',
        name: 'Goerli Testnet', 
        symbol: 'ETH',
        decimals: 18,
        rpcUrls: ['https://goerli.infura.io/v3/', 'https://rpc.goerli.mudit.blog'],
        blockExplorerUrls: ['https://goerli.etherscan.io'],
        faucetUrls: ['https://goerlifaucet.com'],
        isTestnet: true,
        recommended: false
      },
      {
        chainId: '0x1',
        name: 'Ethereum Mainnet',
        symbol: 'ETH', 
        decimals: 18,
        rpcUrls: ['https://mainnet.infura.io/v3/', 'https://eth-mainnet.g.alchemy.com/v2/'],
        blockExplorerUrls: ['https://etherscan.io'],
        faucetUrls: [],
        isTestnet: false,
        recommended: false
      }
    ]
  })
})

app.get('/api/investment/contract-info', (c) => {
  return c.json({
    contract: {
      address: '0x6b52101F208B8b170942605C0367eF2296Ce779c',
      name: 'InvestmentReceiptSBT',
      symbol: 'IRSBT',
      network: 'Sepolia Testnet',
      networkId: '0xaa36a7',
      etherscanUrl: 'https://sepolia.etherscan.io/address/0x6b52101F208B8b170942605C0367eF2296Ce779c',
      openseaUrl: 'https://testnets.opensea.io/assets/sepolia/0x6b52101F208B8b170942605C0367eF2296Ce779c',
      isTestnet: true,
      version: '1.0.0'
    }
  })
})

app.get('/api/investment/templates', (c) => {
  return c.json({
    templates: [
      {
        id: 'fixed-term',
        name: 'Fixed Term Investment',
        description: 'Traditional fixed-term investment with guaranteed returns',
        minAmount: '0.01',
        maxAmount: '100.0', 
        targetAPYRange: { min: 5, max: 15 },
        durationRange: { min: 1, max: 24 },
        riskLevel: 'Low',
        features: ['Guaranteed Returns', 'Fixed Duration', 'Principal Protection']
      },
      {
        id: 'flexible-yield',
        name: 'Flexible Yield Pool',
        description: 'Dynamic yield farming with compound rewards',
        minAmount: '0.05',
        maxAmount: '50.0',
        targetAPYRange: { min: 8, max: 25 },
        durationRange: { min: 3, max: 18 },
        riskLevel: 'Medium', 
        features: ['Compound Interest', 'Flexible Terms', 'Higher Yields']
      },
      {
        id: 'defi-strategy',
        name: 'DeFi Strategy Pool', 
        description: 'Advanced DeFi strategies with maximum returns',
        minAmount: '0.5',
        maxAmount: '25.0',
        targetAPYRange: { min: 15, max: 40 },
        durationRange: { min: 6, max: 12 },
        riskLevel: 'High',
        features: ['Maximum Returns', 'DeFi Integration', 'Advanced Strategies']
      }
    ]
  })
})

// Mock PDF generation endpoint
app.post('/api/external/generate-pdf', async (c) => {
  try {
    const body = await c.req.json()
    const { investmentData, templateData, contractTerms } = body
    
    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return c.json({
      success: true,
      pdfSize: Math.floor(Math.random() * 500) + 200, // 200-700 KB
      documentHash: '0x' + Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      timestamp: Date.now(),
      message: 'PDF generated successfully (simulated)'
    })
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// IPFS upload endpoint (demo mode)
app.post('/api/external/upload-ipfs', async (c) => {
  try {
    const body = await c.req.json()
    const { content, filename, metadata } = body
    
    // Check environment variables for real API keys
    const pinataJWT = process.env.PINATA_JWT
    const useRealIPFS = pinataJWT && pinataJWT !== 'your-pinata-jwt-token-here'
    
    if (!useRealIPFS) {
      // Demo mode - return local document info instead of invalid IPFS URLs
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Use a deterministic hash based on content for consistency
      const crypto = await import('crypto')
      const contentHash = crypto.createHash('sha256').update(content).digest('hex')
      
      return c.json({
        success: true,
        ipfsHash: `demo_${contentHash.substring(0, 46)}`, // Clearly marked as demo
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
      
      const formData = new FormData()
      formData.append('file', new Blob([JSON.stringify(documentData, null, 2)], { type: 'application/json' }), filename)
      
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
      const crypto = await import('crypto')
      const contentHash = crypto.createHash('sha256').update(content).digest('hex')
      
      return c.json({
        success: true,
        ipfsHash: `demo_${contentHash.substring(0, 46)}`,
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
      ipfsHash: 'demo_AbC123dEf456GhI789jKl012MnO345pQr678StU901vWx234',
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
      ipfsHash: 'demo_XyZ789aBc012DeF345gHi678JkL901mNo234PqR567sT890',
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
app.get('/', (c) => {
  try {
    const htmlContent = readFileSync(join(__dirname, 'public', 'index.html'), 'utf-8')
    return c.html(htmlContent)
  } catch (error) {
    // Fallback HTML if file doesn't exist
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
                        animation: {
                            'gradient': 'gradient 15s ease infinite',
                            'float': 'float 6s ease-in-out infinite',
                            'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        },
                        keyframes: {
                            gradient: {
                                '0%, 100%': {
                                    'background-size': '200% 200%',
                                    'background-position': 'left center'
                                },
                                '50%': {
                                    'background-size': '200% 200%',
                                    'background-position': 'right center'
                                }
                            },
                            float: {
                                '0%, 100%': { transform: 'translateY(0px)' },
                                '50%': { transform: 'translateY(-20px)' }
                            }
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-gradient text-white">
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <header class="text-center mb-12">
                <div class="animate-float mb-6">
                    <div class="inline-block p-4 bg-white/10 backdrop-blur rounded-full">
                        <i class="fas fa-coins text-6xl text-yellow-400"></i>
                    </div>
                </div>
                <h1 class="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                    Investment Receipt SBT
                </h1>
                <p class="text-xl md:text-2xl text-gray-300 mb-8">
                    Blockchain-Verified Investment Contracts with Soul Bound Tokens
                </p>
                <div class="flex flex-wrap justify-center gap-4 text-sm">
                    <span class="bg-green-600/20 text-green-300 px-3 py-1 rounded-full border border-green-500/30">
                        <i class="fas fa-check mr-2"></i>Real ETH Transactions
                    </span>
                    <span class="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                        <i class="fas fa-link mr-2"></i>Live on Sepolia
                    </span>
                    <span class="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                        <i class="fas fa-shield-alt mr-2"></i>NFT/SBT Ready
                    </span>
                </div>
            </header>

            <!-- Connection Status -->
            <div id="connection-status" class="hidden mb-6 p-4 rounded-lg border-l-4">
                <div class="flex items-center">
                    <div id="status-icon" class="mr-3"></div>
                    <div>
                        <h4 id="status-title" class="font-semibold"></h4>
                        <p id="status-message" class="text-sm"></p>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div id="main-content">
                <!-- Landing page content will be loaded here -->
                <div class="text-center">
                    <div class="bg-white/10 backdrop-blur rounded-2xl p-8 mb-8 border border-white/20">
                        <h2 class="text-2xl font-bold mb-4">🚀 Deployed on Railway!</h2>
                        <p class="text-gray-300 mb-6">
                            Complete Web3 Investment DApp running on Railway cloud platform
                        </p>
                        <div class="grid md:grid-cols-3 gap-6 mb-8">
                            <div class="bg-white/5 rounded-lg p-4">
                                <i class="fas fa-wallet text-3xl text-blue-400 mb-3"></i>
                                <h3 class="font-semibold mb-2">Multi-Wallet Support</h3>
                                <p class="text-sm text-gray-400">MetaMask, Trust Wallet, Coinbase Wallet</p>
                            </div>
                            <div class="bg-white/5 rounded-lg p-4">
                                <i class="fas fa-file-contract text-3xl text-green-400 mb-3"></i>
                                <h3 class="font-semibold mb-2">Smart Contracts</h3>
                                <p class="text-sm text-gray-400">Real NFT/SBT minting on Sepolia</p>
                            </div>
                            <div class="bg-white/5 rounded-lg p-4">
                                <i class="fas fa-chart-line text-3xl text-purple-400 mb-3"></i>
                                <h3 class="font-semibold mb-2">Investment Tracking</h3>
                                <p class="text-sm text-gray-400">Dashboard with real blockchain data</p>
                            </div>
                        </div>
                        <button id="start-button" class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                            <i class="fas fa-rocket mr-2"></i>Start Investing
                        </button>
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

// Health check endpoint for Railway
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Investment Receipt SBT DApp',
    platform: 'Railway'
  })
})

// Get port from environment variable (Railway sets PORT automatically)
const port = parseInt(process.env.PORT) || 3000

console.log(`🚀 Starting Investment Receipt SBT DApp on Railway...`)
console.log(`📍 Server will be available on port ${port}`)
console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)

serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0'
})

console.log(`✅ Server running on port ${port}`)
console.log(`🔗 Health check: http://localhost:${port}/health`)
console.log(`🎯 Main app: http://localhost:${port}/`)