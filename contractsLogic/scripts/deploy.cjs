// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // 1. Deploy AccessControl
  const AccessControl = await hre.ethers.getContractFactory("AccessControlContract");
  const access = await AccessControl.deploy();
  if (typeof access.waitForDeployment === "function") {
    await access.waitForDeployment();
  } else if (typeof access.deployed === "function") {
    await access.deployed();
  }
  const accessAddress = access.getAddress ? await access.getAddress() : access.address;
  console.log("AccessControlContract deployed to:", accessAddress);

  // 2. Deploy ProductRegistry
  const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
  const registry = await ProductRegistry.deploy(accessAddress);
  if (typeof registry.waitForDeployment === "function") {
    await registry.waitForDeployment();
  } else if (typeof registry.deployed === "function") {
    await registry.deployed();
  }
  const registryAddress = registry.getAddress ? await registry.getAddress() : registry.address;
  console.log("ProductRegistry deployed to:", registryAddress);

  // 3. Deploy OwnershipManager
  const OwnershipManager = await hre.ethers.getContractFactory("OwnershipManager");
  const ownership = await OwnershipManager.deploy(accessAddress, registryAddress);
  if (typeof ownership.waitForDeployment === "function") {
    await ownership.waitForDeployment();
  } else if (typeof ownership.deployed === "function") {
    await ownership.deployed();
  }
  const ownershipAddress = ownership.getAddress ? await ownership.getAddress() : ownership.address;
  console.log("OwnershipManager deployed to:", ownershipAddress);

  // 4. Deploy WarrantyManager
  const WarrantyManager = await hre.ethers.getContractFactory("WarrantyManager");
  const warranty = await WarrantyManager.deploy(accessAddress, registryAddress);
  if (typeof warranty.waitForDeployment === "function") {
    await warranty.waitForDeployment();
  } else if (typeof warranty.deployed === "function") {
    await warranty.deployed();
  }
  const warrantyAddress = warranty.getAddress ? await warranty.getAddress() : warranty.address;
  console.log("WarrantyManager deployed to:", warrantyAddress);

  // 5. Wire up ProductRegistry with manager addresses
  try {
    const registryContract = registry;
    if (registryContract.setOwnershipManager) {
      const tx1 = await registryContract.setOwnershipManager(ownershipAddress);
      if (tx1.wait) await tx1.wait();
    }
    if (registryContract.setWarrantyManager) {
      const tx2 = await registryContract.setWarrantyManager(warrantyAddress);
      if (tx2.wait) await tx2.wait();
    }
    console.log("ProductRegistry wired to OwnershipManager and WarrantyManager");
  } catch (err) {
    console.warn("Warning: failed to set manager addresses on ProductRegistry:", err);
  }
    // ========== export deployed addresses and ABIs to doc/ ==========
  try {
    const fs = require("fs");
    const path = require("path");
    const repoRoot = path.join(__dirname, "..");
    const docDir = path.join(repoRoot, "doc");
    if (!fs.existsSync(docDir)) fs.mkdirSync(docDir, { recursive: true });

    const deployed = {
      AccessControlContract: accessAddress,
      ProductRegistry: registryAddress,
      OwnershipManager: ownershipAddress,
      WarrantyManager: warrantyAddress
    };
    fs.writeFileSync(path.join(docDir, "deployed.json"), JSON.stringify(deployed, null, 2), "utf8");

    const artifactsDir = path.join(repoRoot, "artifacts", "contractsLogic", "contracts");
    const abisDir = path.join(docDir, "abis");
    if (!fs.existsSync(abisDir)) fs.mkdirSync(abisDir, { recursive: true });

    const contractFiles = [
      ["AccessControl.sol", "AccessControlContract.json"],
      ["ProductRegistry.sol", "ProductRegistry.json"],
      ["OwnershipManager.sol", "OwnershipManager.json"],
      ["WarrantyManager.sol", "WarrantyManager.json"]
    ];

    for (const [subdir, file] of contractFiles) {
      const src = path.join(artifactsDir, subdir, file);
      const dest = path.join(abisDir, file);
      if (fs.existsSync(src)) {
        const json = fs.readFileSync(src, "utf8");
        // copy full artifact (includes abi) so frontend/testers can use it
        fs.writeFileSync(dest, json, "utf8");
      } else {
        console.warn("Artifact not found, skipping ABI export:", src);
      }
    }
    console.log("Exported deployed.json and ABIs to doc/");
  } catch (e) {
    console.warn("Failed to export artifacts to doc/:", e);
  }
 // ...existing code...

  console.log("All contracts deployed successfully!");

}

// Error handling
main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});