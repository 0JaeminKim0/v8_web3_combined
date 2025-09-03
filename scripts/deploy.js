const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying Investment Receipt SBT to Sepolia Testnet...");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await deployer.getBalance();
    console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");
    
    if (balance.lt(ethers.utils.parseEther("0.01"))) {
        console.error("❌ Insufficient balance! Need at least 0.01 ETH for deployment");
        console.log("🚰 Get test ETH from: https://sepoliafaucet.com");
        return;
    }
    
    // Deploy contract
    const InvestmentReceiptSBT = await ethers.getContractFactory("InvestmentReceiptSBT");
    const contract = await InvestmentReceiptSBT.deploy();
    
    console.log("⏳ Waiting for deployment...");
    await contract.deployed();
    
    console.log("✅ Contract deployed successfully!");
    console.log("📍 Contract address:", contract.address);
    console.log("🔍 Etherscan URL: https://sepolia.etherscan.io/address/" + contract.address);
    console.log("🏷️  Contract name:", await contract.name());
    console.log("🎯 Contract symbol:", await contract.symbol());
    
    // Save deployment info
    const deploymentInfo = {
        network: "sepolia",
        contractAddress: contract.address,
        contractName: "InvestmentReceiptSBT",
        deployerAddress: deployer.address,
        blockNumber: contract.deployTransaction.blockNumber,
        transactionHash: contract.deployTransaction.hash,
        timestamp: new Date().toISOString(),
        etherscanUrl: `https://sepolia.etherscan.io/address/${contract.address}`
    };
    
    const fs = require('fs');
    fs.writeFileSync(
        './deployment-info.json', 
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment info saved to deployment-info.json");
    
    // Test minting a sample SBT
    console.log("\n🧪 Testing SBT minting...");
    try {
        const tx = await contract.mintInvestment(
            deployer.address,
            1200, // 12.00% APY  
            12,   // 12 months
            "demo_sample_ipfs_hash",
            "0x1234567890abcdef",
            "Fixed Term Investment",
            { value: ethers.utils.parseEther("0.001") } // 0.001 ETH
        );
        
        await tx.wait();
        console.log("✅ Test SBT minted successfully!");
        console.log("🔗 Transaction:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
        
        // Check total supply
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