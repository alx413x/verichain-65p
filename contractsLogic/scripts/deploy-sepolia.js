const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("Deploying contracts to Sepolia...");

  // Deploy AccessControl
  const AccessControl = await hre.ethers.getContractFactory("AccessControlContract");
  const accessControl = await AccessControl.deploy();
  await accessControl.waitForDeployment();
  const accessAddr = await accessControl.getAddress();
  console.log("✅ AccessControl deployed to:", accessAddr);

  // Deploy ProductRegistry
  const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy(accessAddr);
  await productRegistry.waitForDeployment();
  const registryAddr = await productRegistry.getAddress();
  console.log("✅ ProductRegistry deployed to:", registryAddr);

  // Deploy OwnershipManager
  const OwnershipManager = await hre.ethers.getContractFactory("OwnershipManager");
  const ownershipManager = await OwnershipManager.deploy(accessAddr, registryAddr);
  await ownershipManager.waitForDeployment();
  const ownershipAddr = await ownershipManager.getAddress();
  console.log("✅ OwnershipManager deployed to:", ownershipAddr);

  // Deploy WarrantyManager
  const WarrantyManager = await hre.ethers.getContractFactory("WarrantyManager");
  const warrantyManager = await WarrantyManager.deploy(accessAddr, registryAddr);
  await warrantyManager.waitForDeployment();
  const warrantyAddr = await warrantyManager.getAddress();
  console.log("✅ WarrantyManager deployed to:", warrantyAddr);

  // Set manager addresses
  await productRegistry.setOwnershipManager(ownershipAddr);
  await productRegistry.setWarrantyManager(warrantyAddr);
  console.log("✅ Manager addresses set in ProductRegistry");

  // Save deployment info
  const deployment = {
    network: "sepolia",
    chainId: 11155111,
    contracts: {
      AccessControl: accessAddr,
      ProductRegistry: registryAddr,
      OwnershipManager: ownershipAddr,
      WarrantyManager: warrantyAddr
    },
    timestamp: new Date().toISOString(),
    etherscan: {
      AccessControl: `https://sepolia.etherscan.io/address/${accessAddr}`,
      ProductRegistry: `https://sepolia.etherscan.io/address/${registryAddr}`,
      OwnershipManager: `https://sepolia.etherscan.io/address/${ownershipAddr}`,
      WarrantyManager: `https://sepolia.etherscan.io/address/${warrantyAddr}`
    }
  };

  fs.writeFileSync(
    './deployed-sepolia.json',
    JSON.stringify(deployment, null, 2)
  );

  console.log("\n=== 🎉 Deployment Complete ===");
  console.log("\n📋 Contract Addresses:");
  console.log(`   AccessControl:     ${accessAddr}`);
  console.log(`   ProductRegistry:   ${registryAddr}`);
  console.log(`   OwnershipManager:  ${ownershipAddr}`);
  console.log(`   WarrantyManager:   ${warrantyAddr}`);
  
  console.log("\n🔍 View contracts on Etherscan:");
  console.log(`   AccessControl:     ${deployment.etherscan.AccessControl}`);
  console.log(`   ProductRegistry:   ${deployment.etherscan.ProductRegistry}`);
  console.log(`   OwnershipManager:  ${deployment.etherscan.OwnershipManager}`);
  console.log(`   WarrantyManager:   ${deployment.etherscan.WarrantyManager}`);
  
  console.log("\n📝 Next steps:");
  console.log("   1. Run: bash setup-artifacts.sh");
  console.log("   2. Update grant-roles.js with your Sepolia account addresses");
  console.log("   3. Run: npx hardhat run scripts/grant-roles.js --network sepolia");
  console.log("   4. Verify contracts (optional but recommended):");
  console.log(`      npx hardhat verify --network sepolia ${accessAddr}`);
  console.log(`      npx hardhat verify --network sepolia ${registryAddr} "${accessAddr}"`);
  console.log(`      npx hardhat verify --network sepolia ${ownershipAddr} "${accessAddr}" "${registryAddr}"`);
  console.log(`      npx hardhat verify --network sepolia ${warrantyAddr} "${accessAddr}" "${registryAddr}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
