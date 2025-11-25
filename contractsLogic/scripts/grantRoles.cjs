// scripts/grantRoles.cjs
const hre = require("hardhat");

async function main() {
  // Load deployed contract addresses
  const fs = require("fs");
  const path = require("path");
  const deployedPath = path.join(__dirname, "..", "doc", "deployed.json");
  
  if (!fs.existsSync(deployedPath)) {
    console.error("deployed.json not found. Please deploy contracts first.");
    process.exit(1);
  }

  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf8"));
  console.log("Loading AccessControl contract at:", deployed.AccessControlContract);

  const AccessControl = await hre.ethers.getContractFactory("AccessControlContract");
  const accessControl = AccessControl.attach(deployed.AccessControlContract);

  // Get the first few accounts from Hardhat
  const [deployer, manufacturer, retailer, customer, serviceCenter] = await hre.ethers.getSigners();

  console.log("\n=== Granting Roles ===\n");

  // Grant MANUFACTURER_ROLE to account #1
  console.log(`Granting MANUFACTURER_ROLE to ${manufacturer.address}...`);
  let tx = await accessControl.registerManufacturer(manufacturer.address);
  await tx.wait();
  console.log("✓ Manufacturer role granted");

  // Grant RETAILER_ROLE to account #2
  console.log(`Granting RETAILER_ROLE to ${retailer.address}...`);
  tx = await accessControl.registerRetailer(retailer.address);
  await tx.wait();
  console.log("✓ Retailer role granted");

  // Grant CUSTOMER_ROLE to account #3
  console.log(`Granting CUSTOMER_ROLE to ${customer.address}...`);
  tx = await accessControl.registerCustomer(customer.address);
  await tx.wait();
  console.log("✓ Customer role granted");

  // Grant SERVICE_CENTER_ROLE to account #4
  console.log(`Granting SERVICE_CENTER_ROLE to ${serviceCenter.address}...`);
  tx = await accessControl.registerServiceCenter(serviceCenter.address);
  await tx.wait();
  console.log("✓ Service Center role granted");

  console.log("\n=== Role Summary ===\n");
  console.log(`Admin (deployer):     ${deployer.address}`);
  console.log(`Manufacturer:         ${manufacturer.address}`);
  console.log(`Retailer:             ${retailer.address}`);
  console.log(`Customer:             ${customer.address}`);
  console.log(`Service Center:       ${serviceCenter.address}`);
  
  console.log("\n✓ All roles granted successfully!");
  console.log("\nTo use these accounts in MetaMask:");
  console.log("1. Import the private keys from the 'npm run chain' output");
  console.log("2. Account #0 is Admin");
  console.log("3. Account #1 is Manufacturer");
  console.log("4. Account #2 is Retailer");
  console.log("5. Account #3 is Customer");
  console.log("6. Account #4 is Service Center");
}

main().catch((error) => {
  console.error("Failed to grant roles:", error);
  process.exitCode = 1;
});
