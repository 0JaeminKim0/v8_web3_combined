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
      { chainId: '0x1', name: 'Ethereum Mainnet', symbol: 'ETH' },
      { chainId: '0x89', name: 'Polygon', symbol: 'MATIC' },
      { chainId: '0xa4b1', name: 'Arbitrum One', symbol: 'ETH' },
      { chainId: '0xa', name: 'Optimism', symbol: 'ETH' },
      { chainId: '0x38', name: 'BSC', symbol: 'BNB' }
    ]
  })
})

// Main wallet connection page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Multi-Wallet Connection</title>
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
        </style>
    </head>
    <body class="gradient-bg min-h-screen flex items-center justify-center p-4">
        <div class="max-w-4xl w-full">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
                    <i class="fas fa-wallet mr-3"></i>
                    Connect Your Wallet
                </h1>
                <p class="text-xl text-gray-200 max-w-2xl mx-auto">
                    Choose your preferred wallet to connect to Web3. Support for MetaMask, Trust Wallet, Coinbase Wallet, and WalletConnect.
                </p>
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
            <div id="wallet-info" class="hidden bg-white/10 backdrop-blur rounded-xl p-6 text-white">
                <h3 class="text-xl font-semibold mb-4">
                    <i class="fas fa-check-circle text-green-400 mr-2"></i>
                    Wallet Connected
                </h3>
                <div class="grid md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Wallet Address</label>
                        <div id="wallet-address" class="bg-black/20 rounded p-3 font-mono text-sm break-all"></div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Network</label>
                        <div id="wallet-network" class="bg-black/20 rounded p-3 text-sm"></div>
                    </div>
                </div>
                <div class="mt-4 flex flex-wrap gap-3">
                    <button id="disconnect-btn" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors">
                        <i class="fas fa-sign-out-alt mr-2"></i>Disconnect
                    </button>
                    <button id="switch-network-btn" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
                        <i class="fas fa-exchange-alt mr-2"></i>Switch Network
                    </button>
                    <button id="sign-message-btn" class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors">
                        <i class="fas fa-signature mr-2"></i>Sign Message
                    </button>
                </div>
            </div>

            <!-- Features -->
            <div class="mt-8 grid md:grid-cols-3 gap-6 text-center text-white">
                <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div class="text-3xl mb-3">🔒</div>
                    <h3 class="font-semibold mb-2">Secure Connection</h3>
                    <p class="text-sm text-gray-200">Your wallet remains in your control. We never store your private keys.</p>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div class="text-3xl mb-3">⚡</div>
                    <h3 class="font-semibold mb-2">Multi-Chain Support</h3>
                    <p class="text-sm text-gray-200">Connect to Ethereum, Polygon, Arbitrum, and other popular networks.</p>
                </div>
                <div class="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div class="text-3xl mb-3">🌐</div>
                    <h3 class="font-semibold mb-2">Universal Compatibility</h3>
                    <p class="text-sm text-gray-200">Works with all major wallets and supports both mobile and desktop.</p>
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
        </div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/wallet-connect.js"></script>
    </body>
    </html>
  `)
})

export default app
