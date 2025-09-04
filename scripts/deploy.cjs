const hre = require("hardhat");
const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
    console.log("🚀 Deploying Investment Receipt SBT to Sepolia Testnet...");
    
    // Provider 및 Wallet 직접 생성
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("📝 Deploying with account:", wallet.address);
    
    // Balance 확인
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
        console.error("❌ Insufficient balance! Need at least 0.01 ETH for deployment");
        console.log("🚰 Get test ETH from: https://sepoliafaucet.com");
        return;
    }
    
    // 컴파일된 컨트랙트 아티팩트 로드
    const contractArtifact = require("../artifacts/contracts/InvestmentReceiptSBT.sol/InvestmentReceiptSBT.json");
    
    // Contract factory 생성
    const contractFactory = new ethers.ContractFactory(
        contractArtifact.abi,
        contractArtifact.bytecode,
        wallet
    );
    
    console.log("⏳ Deploying contract...");
    
    // 배포 실행
    const contract = await contractFactory.deploy();
    
    console.log("⏳ Waiting for deployment confirmation...");
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    
    console.log("✅ Contract deployed successfully!");
    console.log("📍 Contract address:", contractAddress);
    console.log("🔍 Etherscan URL: https://sepolia.etherscan.io/address/" + contractAddress);
    
    // 배포 정보 저장
    const deploymentInfo = {
        network: "sepolia",
        contractAddress: contractAddress,
        contractName: "InvestmentReceiptSBT",
        deployerAddress: wallet.address,
        timestamp: new Date().toISOString(),
        etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`
    };
    
    const fs = require('fs');
    fs.writeFileSync(
        './deployment-info.json', 
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment info saved to deployment-info.json");
    
    // 테스트 민팅 (선택사항)
    console.log("\n🧪 Testing SBT minting...");
    try {
        const tx = await contract.mintInvestment(
            wallet.address,
            1200, // 12.00% APY
            12,   // 12 months
            "demo_sample_ipfs_hash",
            "0x1234567890abcdef",
            "Fixed Term Investment",
            { value: ethers.parseEther("0.001") } // 0.001 ETH
        );
        
        await tx.wait();
        console.log("✅ Test SBT minted successfully!");
        console.log("🔗 Transaction:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
        
        // 총 공급량 확인
        const totalSupply = await contract.totalSupply();
        console.log("📊 Total SBT supply:", totalSupply.toString());
        
    } catch (error) {
        console.error("❌ Test minting failed:", error.message);
    }
}

main()
    .then(() => {
        console.log("\n🎉 Deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
