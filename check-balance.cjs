const { ethers } = require("ethers");
require("dotenv").config();

async function check() {
  console.log("🔍 Checking wallet balance...");
  
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("📍 Wallet Address:", wallet.address);
    console.log("🌐 RPC URL:", process.env.SEPOLIA_RPC_URL);
    
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
    
    // 네트워크 정보도 확인
    const network = await provider.getNetwork();
    console.log("🌍 Network:", network.name, "ChainId:", network.chainId);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

check();
