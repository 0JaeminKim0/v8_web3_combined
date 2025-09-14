// Railway-compatible server for Hono application
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Create a new Hono app for Railway
const app = new Hono()

// Enable CORS for all routes
app.use('*', cors())

// Serve static files from public directory using Node.js server
app.use('/static/*', serveStatic({
  root: './public',
  rewriteRequestPath: (path) => path.replace(/^\/static/, '')
}))

// Investment platform project data (same as original)
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

// API route to serve projects data
app.get('/api/projects', (c) => {
  return c.json({ projects })
})

// Project detail page
app.get('/project/:id', (c) => {
  const projectId = c.req.param('id')
  const project = projects.find(p => p.id === projectId)
  
  if (!project) {
    return c.html(generateNotFoundPage())
  }

  const progressPercentage = (parseFloat(project.totalRaised) / parseFloat(project.targetAmount)) * 100
  const remainingCapacity = parseFloat(project.targetAmount) - parseFloat(project.totalRaised)
  
  return c.html(generateProjectDetailPage(project, progressPercentage, remainingCapacity))
})

// Investment Contract DApp page
app.get('/invest', (c) => {
  return c.html(generateInvestPage())
})

// Portfolio page
app.get('/portfolio', (c) => {
  return c.html(generatePortfolioPage())
})

// API routes for wallet operations (same as original)
app.get('/api/supported-wallets', (c) => {
  return c.json({
    wallets: [
      {
        id: 'metamask',
        name: 'MetaMask',
        icon: '🦊',
        installed: false,
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
        installed: true,
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
    contractAddress: '0x742d35Cc8058C65C0863a9e20C0be2A7C1234567',
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
    templates: projects.map(project => ({
      id: project.id,
      name: project.title,
      description: project.description,
      minAmount: (parseFloat(project.minInvestment) / 1000).toFixed(1),
      maxAmount: (parseFloat(project.minInvestment) * 10 / 1000).toFixed(1),
      terms: [project.tenor],
      targetAPYRange: { 
        min: parseFloat(project.apy.replace('%', '')), 
        max: parseFloat(project.apy.replace('%', '')) 
      },
      features: project.keyFeatures,
      sector: project.sector,
      region: project.region,
      riskLevel: project.riskLevel,
      currency: project.currency
    }))
  })
})

// PDF generation service
app.post('/api/external/generate-pdf', async (c) => {
  try {
    const body = await c.req.json()
    
    const pdfData = {
      investmentTerms: body,
      timestamp: new Date().toISOString(),
      contractVersion: '1.0.0'
    }
    
    // Calculate SHA-256 hash of the content
    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(pdfData, null, 2))
    const crypto = globalThis.crypto || require('crypto').webcrypto
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    return c.json({
      success: true,
      pdfData: pdfData,
      hash: hashHex,
      timestamp: Date.now(),
      needsFrontendGeneration: true
    })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// IPFS upload service
app.post('/api/external/upload-ipfs', async (c) => {
  try {
    const body = await c.req.json()
    const { content, filename, metadata } = body
    
    // Demo mode - return local document info
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const crypto = globalThis.crypto || require('crypto').webcrypto
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
      message: 'Document generated locally. Enable real IPFS by configuring Pinata API keys.'
    })
    
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500)
  }
})

// User investments API
app.get('/api/investment/user-investments/:address', (c) => {
  const address = c.req.param('address')
  
  const mockInvestments = [
    {
      tokenId: '1',
      investor: address,
      principal: '50.0',
      targetAPY: 14.8,
      startTime: Date.now() - (30 * 24 * 60 * 60 * 1000),
      maturityTime: Date.now() + (335 * 24 * 60 * 60 * 1000),
      status: 'Active',
      contractType: 'PTF — Potato Tokenized Finance',
      ipfsHash: 'QmAbC123dEf456GhI789jKl012MnO345pQr678StU901vWx234',
      termsHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      sector: 'Agriculture',
      region: 'Thailand'
    }
  ]
  
  return c.json({ investments: mockInvestments })
})

// Save investment API
app.post('/api/investment/save', async (c) => {
  try {
    const body = await c.req.json()
    const { account, investment } = body
    
    if (!account || !investment.txHash || !investment.tokenId) {
      return c.json({
        success: false,
        error: 'Missing required fields: account, txHash, tokenId'
      }, 400)
    }
    
    return c.json({
      success: true,
      message: 'Investment saved successfully',
      investment: investment
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// Homepage
app.get('/', (c) => {
  return c.html(generateHomepage())
})

// Helper functions to generate HTML pages
function generateNotFoundPage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Not Found - Infinity Ventures</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    </head>
    <body class="min-h-screen bg-gray-50">
        <div class="flex items-center justify-center py-20 px-4">
            <div class="text-center">
                <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="ri-error-warning-line text-gray-400 text-2xl"></i>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
                <p class="text-gray-600 mb-4">The requested investment project could not be found.</p>
                <a href="/" class="text-blue-600 hover:text-blue-700">Return to Projects</a>
            </div>
        </div>
    </body>
    </html>
  `
}

function generateProjectDetailPage(project, progressPercentage, remainingCapacity) {
  // This would contain the full project detail page HTML
  // For brevity, I'll return a simplified version
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${project.title} - Infinity Ventures</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    </head>
    <body class="min-h-screen bg-gray-50">
        <div class="max-w-4xl mx-auto p-6">
            <h1 class="text-3xl font-bold mb-4">${project.title}</h1>
            <p class="text-gray-600 mb-6">${project.description}</p>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <span class="text-gray-500">Target APY:</span>
                    <span class="font-bold">${project.apy}</span>
                </div>
                <div>
                    <span class="text-gray-500">Min Investment:</span>
                    <span class="font-bold">${project.currency} ${parseInt(project.minInvestment).toLocaleString()}</span>
                </div>
            </div>
            
            <a href="/invest?project=${project.id}" 
               class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                <i class="ri-coins-line mr-2"></i>
                Invest in ${project.title.split(' —')[0]}
            </a>
        </div>
        
        <script src="/static/v8-integration.js"></script>
    </body>
    </html>
  `
}

function generateInvestPage() {
  // Return simplified invest page for Railway
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Investment Receipt SBT - Railway Version</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
        <div class="max-w-2xl w-full bg-white rounded-2xl p-8">
            <h1 class="text-3xl font-bold text-center mb-6">
                <i class="fas fa-file-contract mr-3"></i>
                Investment Receipt SBT
            </h1>
            <p class="text-center text-gray-600 mb-8">
                Railway deployment version - Connect your wallet to start investing
            </p>
            
            <div class="text-center">
                <button id="connectWallet" class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
                    Connect MetaMask Wallet
                </button>
            </div>
        </div>
        
        <script src="/static/investment-dapp.js"></script>
    </body>
    </html>
  `
}

function generatePortfolioPage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Portfolio - Infinity Ventures</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    </head>
    <body class="min-h-screen bg-gray-50">
        <div class="max-w-7xl mx-auto p-6">
            <h1 class="text-3xl font-bold mb-8">Investment Portfolio</h1>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${projects.map(project => `
                    <div class="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 class="text-xl font-semibold mb-2">${project.title}</h3>
                        <p class="text-gray-600 mb-4">${project.description}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-2xl font-bold text-green-600">${project.apy}</span>
                            <a href="/invest?project=${project.id}" 
                               class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                Invest
                            </a>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </body>
    </html>
  `
}

function generateHomepage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Infinity Ventures - Railway Deployment</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
    </head>
    <body class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <h1 class="text-xl font-bold text-gray-900">
                            <i class="ri-rocket-line mr-2 text-blue-600"></i>
                            Infinity Ventures
                        </h1>
                        <nav class="hidden md:ml-8 md:flex space-x-8">
                            <a href="/" class="text-blue-600 font-medium px-3 py-2">Home</a>
                            <a href="/portfolio" class="text-gray-600 hover:text-blue-600 px-3 py-2">Portfolio</a>
                            <a href="/invest" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="ri-coins-line mr-2"></i>
                                Start Investing
                            </a>
                        </nav>
                    </div>
                    <button id="connectWalletBtn" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                        <i class="ri-wallet-line mr-2"></i>
                        Connect Wallet
                    </button>
                </div>
            </div>
        </header>

        <!-- Hero Section -->
        <div class="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-20">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <h1 class="text-4xl md:text-6xl font-bold mb-6">
                    Next-Gen <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Real World Asset</span> Investment Platform
                </h1>
                <p class="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                    Railway Deployment - Invest in institutional-grade real-world assets with blockchain verification
                </p>
                <a href="/invest" class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all text-lg">
                    <i class="ri-play-circle-line mr-2"></i>
                    Start Investing Now
                </a>
            </div>
        </div>

        <!-- Projects Grid -->
        <div class="py-20 bg-white">
            <div class="max-w-7xl mx-auto px-4">
                <div class="text-center mb-16">
                    <h2 class="text-4xl font-bold text-gray-900 mb-4">Investment Opportunities</h2>
                    <p class="text-xl text-gray-600">Railway deployment with full Web3 functionality</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${projects.map(project => {
                      const progressPercentage = (parseFloat(project.totalRaised) / parseFloat(project.targetAmount)) * 100
                      return `
                        <div class="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                            <div class="p-6">
                                <div class="flex justify-between items-start mb-4">
                                    <span class="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">${project.sector}</span>
                                    <span class="text-2xl font-bold text-green-600">${project.apy}</span>
                                </div>
                                
                                <h3 class="text-xl font-bold text-gray-900 mb-3">${project.title}</h3>
                                <p class="text-gray-600 mb-4">${project.description}</p>
                                
                                <div class="mb-4">
                                    <div class="flex justify-between text-sm mb-2">
                                        <span>Raised: ${project.currency} ${(parseFloat(project.totalRaised)/1000).toFixed(0)}K</span>
                                        <span>Target: ${project.currency} ${(parseFloat(project.targetAmount)/1000000).toFixed(1)}M</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="bg-blue-600 h-2 rounded-full" style="width: ${Math.min(progressPercentage, 100)}%"></div>
                                    </div>
                                    <div class="text-xs text-gray-500 mt-1">${progressPercentage.toFixed(1)}% funded</div>
                                </div>
                                
                                <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <span class="text-gray-500">Min Investment:</span>
                                        <div class="font-medium">${project.currency} ${parseInt(project.minInvestment).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span class="text-gray-500">Tenor:</span>
                                        <div class="font-medium">${project.tenor}</div>
                                    </div>
                                </div>
                                
                                <div class="flex space-x-3">
                                    <a href="/project/${project.id}" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium text-center">
                                        View Details
                                    </a>
                                    <a href="/invest?project=${project.id}" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium text-center">
                                        <i class="ri-coins-line mr-1"></i>
                                        Invest
                                    </a>
                                </div>
                            </div>
                        </div>
                      `
                    }).join('')}
                </div>
            </div>
        </div>

        <!-- Footer -->
        <footer class="bg-gray-100 py-8">
            <div class="max-w-6xl mx-auto px-4 text-center">
                <p class="text-sm text-gray-600">
                    <strong>Railway Deployment</strong> - Next-Gen Real World Asset Investment Platform
                </p>
            </div>
        </footer>
        
        <script src="/static/v8-integration.js"></script>
    </body>
    </html>
  `
}

// Start the server
const port = process.env.PORT || 3000
console.log(`🚀 Infinity Ventures server starting on port ${port}`)

serve({
  fetch: app.fetch,
  port: parseInt(port),
  hostname: '0.0.0.0'
})

console.log('✅ Server is running on Railway!')