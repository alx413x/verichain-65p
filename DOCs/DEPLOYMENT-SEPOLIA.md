# Deploying to Sepolia Testnet

This guide explains how to deploy the Product Warranty System to the Sepolia Ethereum testnet and verify contracts on Etherscan.

## Prerequisites

### 1. Get Sepolia ETH

You need Sepolia ETH to pay for deployment and transactions:
- **Alchemy Faucet**: https://www.alchemy.com/faucets/ethereum-sepolia
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Chainlink Faucet**: https://faucets.chain.link/sepolia

> 💡 You'll need approximately 0.05-0.1 Sepolia ETH for deployment

### 2. Get an RPC Provider API Key

Choose one of these providers:
- **Alchemy** (Recommended): https://www.alchemy.com/
  1. Create a free account
  2. Create a new app
  3. Select "Ethereum" → "Sepolia"
  4. Copy the HTTPS URL
  
- **Infura**: https://www.infura.io/
  1. Create a free account
  2. Create a new project
  3. Copy the Sepolia endpoint

### 3. Get an Etherscan API Key (Optional but Recommended)

For contract verification:
1. Visit https://etherscan.io/myapikey
2. Sign up/login
3. Create a new API key
4. Copy the key

## Configuration

### Step 1: Install Dependencies

```bash
# Install dotenv for environment variables
npm install dotenv --save-dev
```

### Step 2: Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```env
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
   PRIVATE_KEY=your_wallet_private_key_without_0x
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

   > ⚠️ **SECURITY WARNING**:
   > - **NEVER** use your mainnet private key for testing!
   > - **NEVER** commit `.env` to git
   > - Use a dedicated test wallet only

### Step 3: Export Private Key from MetaMask

1. Open MetaMask
2. Click account menu → Account details
3. Click "Show private key"
4. Enter password
5. Copy private key (without the 0x prefix)

## Deployment

### Deploy Contracts

```bash
cd contractsLogic
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

**Expected Output:**
```
Deploying contracts to Sepolia...
✅ AccessControl deployed to: 0x1234...
✅ ProductRegistry deployed to: 0x5678...
✅ OwnershipManager deployed to: 0x9abc...
✅ WarrantyManager deployed to: 0xdef0...
✅ Manager addresses set in ProductRegistry

=== 🎉 Deployment Complete ===

📋 Contract Addresses:
   AccessControl:     0x1234...
   ProductRegistry:   0x5678...
   OwnershipManager:  0x9abc...
   WarrantyManager:   0xdef0...

🔍 View contracts on Etherscan:
   AccessControl:     https://sepolia.etherscan.io/address/0x1234...
   ProductRegistry:   https://sepolia.etherscan.io/address/0x5678...
   OwnershipManager:  https://sepolia.etherscan.io/address/0x9abc...
   WarrantyManager:   https://sepolia.etherscan.io/address/0xdef0...
```

Deployment info is saved to `contractsLogic/deployed-sepolia.json`

### Copy ABIs to Frontend

```bash
cd ..
bash setup-artifacts.sh
```

This copies contract ABIs and addresses to the `public/` folder.

### Grant Roles

1. Edit `contractsLogic/scripts/grant-roles.js` with your Sepolia addresses:
   ```javascript
   const manufacturerAddr = "0xYourManufacturerAddress";
   const retailerAddr = "0xYourRetailerAddress";
   const customerAddr = "0xYourCustomerAddress";
   const serviceCenterAddr = "0xYourServiceCenterAddress";
   ```

2. Run the script:
   ```bash
   cd contractsLogic
   npx hardhat run scripts/grant-roles.js --network sepolia
   ```

## Contract Verification

Verify contracts on Etherscan to make source code public:

```bash
# Verify AccessControl
npx hardhat verify --network sepolia <ACCESS_CONTROL_ADDRESS>

# Verify ProductRegistry
npx hardhat verify --network sepolia <PRODUCT_REGISTRY_ADDRESS> "<ACCESS_CONTROL_ADDRESS>"

# Verify OwnershipManager
npx hardhat verify --network sepolia <OWNERSHIP_MANAGER_ADDRESS> "<ACCESS_CONTROL_ADDRESS>" "<PRODUCT_REGISTRY_ADDRESS>"

# Verify WarrantyManager
npx hardhat verify --network sepolia <WARRANTY_MANAGER_ADDRESS> "<ACCESS_CONTROL_ADDRESS>" "<PRODUCT_REGISTRY_ADDRESS>"
```

Replace `<ADDRESS>` with actual addresses from deployment output.

### Benefits of Verification:
- ✅ Source code publicly visible
- ✅ Read/Write contract UI on Etherscan
- ✅ Better transparency and trust
- ✅ Easy debugging with event logs

## Frontend Configuration

### Configure MetaMask

1. **Add Sepolia Network** (if not already added):
   - Network Name: `Sepolia`
   - RPC URL: `https://sepolia.infura.io/v3/...`
   - Chain ID: `11155111`
   - Currency: `SepoliaETH`
   - Block Explorer: `https://sepolia.etherscan.io`

2. **Import Test Accounts**:
   - Import the accounts you used in grant-roles.js
   - Make sure they have Sepolia ETH

### Start Frontend

```bash
npm run dev
```

1. Visit http://localhost:5173
2. Connect MetaMask
3. **Switch to Sepolia network**
4. Start using the application!

## Using Etherscan

### View Contract

Visit: `https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>`

**Features:**
- **Transactions**: View all contract transactions
- **Contract**: View source code (if verified)
- **Read Contract**: Query contract state
- **Write Contract**: Execute contract functions
- **Events**: View emitted events

### Example Queries

**Read Product Details:**
1. Go to contract on Etherscan
2. Click "Read Contract"
3. Find `getProductDetails`
4. Enter serial number
5. Click "Query"

**Submit Warranty Claim:**
1. Go to WarrantyManager contract
2. Click "Write Contract"
3. Connect wallet
4. Find `submitClaim`
5. Enter parameters
6. Click "Write"
7. Confirm in MetaMask

## Testing

### Test Complete Workflow

1. **Register Product** (as Manufacturer):
   - Open Manufacturer Portal
   - Register a product with warranty
   - Check transaction on Etherscan

2. **Transfer to Retailer**:
   - Transfer product to retailer address
   - Verify on Etherscan

3. **Sell to Customer**:
   - Switch to retailer account
   - Sell product to customer
   - Check ownership change on Etherscan

4. **Submit Warranty Claim**:
   - Switch to customer account
   - Submit a warranty claim
   - View claim event on Etherscan

5. **Review Claim**:
   - Switch to service center account
   - Approve/reject claim
   - Verify final status on Etherscan

## Troubleshooting

### Common Issues

**"Insufficient funds for gas"**
- Get more Sepolia ETH from faucets
- Check your balance: https://sepolia.etherscan.io/address/YOUR_ADDRESS

**"Invalid API Key" (Etherscan)**
- Verify your Etherscan API key in `.env`
- Make sure you're using Ethereum API key (not BSC, Polygon, etc.)

**"Nonce too high"**
- Reset account in MetaMask: Settings → Advanced → Reset Account

**"Network Error"**
- Check your RPC URL in `.env`
- Try a different RPC provider (Alchemy/Infura)

**Contract verification failed**
- Make sure constructor arguments match deployment
- Use quotes around address parameters
- Check Solidity version matches (0.8.20)

### Network Information

- **Network Name**: Sepolia
- **Chain ID**: 11155111
- **RPC URL**: https://sepolia.infura.io/v3/...
- **Block Explorer**: https://sepolia.etherscan.io
- **Currency**: SepoliaETH
- **Faucets**: See "Get Sepolia ETH" section

## Gas Costs (Approximate)

- Deploy AccessControl: ~0.002 ETH
- Deploy ProductRegistry: ~0.004 ETH
- Deploy OwnershipManager: ~0.003 ETH
- Deploy WarrantyManager: ~0.003 ETH
- Grant Roles: ~0.0005 ETH per role
- Register Product: ~0.0008 ETH
- Transfer Ownership: ~0.0003 ETH
- Submit Claim: ~0.0004 ETH

**Total deployment cost**: ~0.015-0.02 Sepolia ETH

## Security Checklist

- [ ] Using dedicated test wallet (not mainnet wallet)
- [ ] `.env` file is in `.gitignore`
- [ ] Never committed private keys to git
- [ ] Tested all functionality on localhost first
- [ ] Contract addresses saved to `deployed-sepolia.json`
- [ ] ABIs copied to frontend
- [ ] Roles granted to correct addresses
- [ ] Contracts verified on Etherscan

## Next Steps

After successful Sepolia deployment:

1. **Test thoroughly** with different user roles
2. **Monitor gas costs** for optimization
3. **Document issues** and edge cases
4. **Prepare for mainnet** (when ready)
5. **Share Etherscan links** with stakeholders

## Useful Links

- **Sepolia Etherscan**: https://sepolia.etherscan.io
- **Alchemy Dashboard**: https://dashboard.alchemy.com
- **Hardhat Docs**: https://hardhat.org/docs
- **MetaMask**: https://metamask.io
- **Sepolia Faucets**: https://sepoliafaucet.com

---

**Need Help?**
- Check WORKLOG.md for testing guide
- Review contract source code in `contractsLogic/contracts/`
- Check Hardhat console for detailed error messages
