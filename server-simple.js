// Simple Railway Server for Investment Receipt SBT DApp
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from '@hono/node-server/serve-static'
import { serve } from '@hono/node-server'

const app = new Hono()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Investment Receipt SBT DApp',
    platform: 'Railway'
  })
})

// Simple API endpoints
app.get('/api/supported-wallets', (c) => {
  return c.json({
    wallets: [
      { id: 'metamask', name: 'MetaMask', icon: '🦊' },
      { id: 'trustwallet', name: 'Trust Wallet', icon: '🛡️' },
      { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵' }
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
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
        isTestnet: true
      }
    ]
  })
})

// Main page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Investment SBT DApp - Railway</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gradient-to-br from-purple-900 to-blue-900 text-white min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold text-center mb-8">🚂 Railway Deployment Success!</h1>
            <div class="bg-white/10 rounded-lg p-8 text-center">
                <h2 class="text-2xl mb-4">Investment Receipt SBT DApp</h2>
                <p class="mb-6">Successfully deployed on Railway with Node.js + Hono</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-white/5 p-4 rounded">
                        <h3 class="font-bold">✅ Server Status</h3>
                        <p>Running on Railway</p>
                    </div>
                    <div class="bg-white/5 p-4 rounded">
                        <h3 class="font-bold">🔗 Blockchain</h3>
                        <p>Sepolia Testnet Ready</p>
                    </div>
                    <div class="bg-white/5 p-4 rounded">
                        <h3 class="font-bold">📱 Web3</h3>
                        <p>Multi-wallet Support</p>
                    </div>
                </div>
                <a href="/health" class="bg-green-600 hover:bg-green-700 px-6 py-2 rounded">
                    Health Check
                </a>
            </div>
        </div>
    </body>
    </html>
  `)
})

// Start server
const port = parseInt(process.env.PORT) || 3000

console.log(`🚀 Starting server on port ${port}`)

serve({
  fetch: app.fetch,
  port: port,
  hostname: '0.0.0.0'
})

console.log(`✅ Server running on http://0.0.0.0:${port}`)