# VeriChain Passport - Complete Test Workflow

This document provides a step-by-step guide to test the complete product lifecycle from manufacturing to warranty claim resolution.

## Prerequisites

1. **MetaMask installed** in your browser
2. **Three terminal windows** open in the project directory
3. **Clean MetaMask state** (reset accounts if you've restarted the blockchain)

---

## Quick Start

### Terminal 1: Start Blockchain
```bash
npm run chain
```
Keep this running. You should see 20 accounts with their addresses and private keys.

### Terminal 2: Deploy Contracts
```bash
npm run deploy:local
bash setup-artifacts.sh
npm run grant-roles
```
Wait for "Roles granted successfully" message.

### Terminal 3: Start Frontend
```bash
npm run dev
```
Open http://localhost:5173 in your browser.

---

## Complete Test Workflow

### Phase 1: Manufacturer Creates Product

**Account to Use:** Account #1 (Manufacturer)
- Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

**Steps:**
1. Open MetaMask and import Account #1 using the private key above
2. Switch MetaMask network to **Localhost 8545** (Chain ID: 31337)
3. Click "Connect Wallet" on the homepage
4. Navigate to **Manufacturer Portal**
5. Click "Register New Product" button
6. Fill in the form:
   - Serial Number: `PHONE-001`
   - Model: `iPhone 16 Pro`
   - Warranty Duration (days): `730`
   - Allowed Claims: `3`
7. Click "Mint Product Passport"
8. Approve **3 MetaMask transactions**:
   - Transaction 1: Register product
   - Transaction 2: Create warranty
   - Transaction 3: Sync ownership
9. Wait for all confirmations
10. Product should appear in the list

**Expected Result:**
- PHONE-001 appears in manufacturer's product list
- Shows model "iPhone 16 Pro"
- Status shows as owned by manufacturer

---

### Phase 2: Transfer to Retailer

**Still using:** Account #1 (Manufacturer)

**Steps:**
1. Stay on Manufacturer Portal
2. Click "Transfer to retailer" button
3. In the modal:
   - Retailer Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
   - Select Product: `PHONE-001`
4. Click "Transfer Ownership"
5. Approve MetaMask transaction
6. Wait for confirmation

**Expected Result:**
- Product disappears from manufacturer's list (transferred out)
- Transaction confirmed in console

---

### Phase 3: Retailer Sells to Customer

**Account to Use:** Account #2 (Retailer)
- Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

**Steps:**
1. In MetaMask, switch to Account #2:
   - Remove Account #1 or add Account #2
   - Import using private key above
2. Refresh the page
3. Connect wallet (should auto-connect)
4. Navigate to **Retailer Portal**
5. You should see PHONE-001 in inventory
6. Click "Sell Product" button
7. Fill in the form:
   - Customer Address: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
   - Serial Number: `PHONE-001`
8. Click "Register Sale"
9. Approve MetaMask transaction
10. Wait for confirmation

**Expected Result:**
- PHONE-001 disappears from retailer's inventory
- Transaction confirmed
- Product now owned by customer

---

### Phase 4: Customer Claims Warranty

**Account to Use:** Account #3 (Customer)
- Address: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- Private Key: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`

**Steps:**
1. In MetaMask, switch to Account #3
2. Refresh the page
3. Connect wallet
4. Navigate to **User Dashboard**
5. You should see PHONE-001 in "My Digital Passports"
6. Verify the card shows:
   - Model: iPhone 16 Pro
   - Serial: PHONE-001
   - Status: Protected (green badge)
   - Warranty expiration date (2 years from now)
7. Click "Claim Warranty" button
8. In the modal, enter reason:
   ```
   Screen defect - multiple dead pixels in top-right corner
   ```
9. Click "Submit Claim Request"
10. Approve MetaMask transaction
11. Wait for confirmation

**Expected Result:**
- Alert: "Warranty claim submitted for iPhone 16 Pro"
- Product card refreshes
- Status might change to "In Review" or stay "Protected"

---

### Phase 5: Service Center Processes Claim

**Account to Use:** Account #4 (Service Center)
- Address: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`
- Private Key: `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`

**Steps:**
1. In MetaMask, switch to Account #4
2. Refresh the page
3. Connect wallet
4. Navigate to **Service Center Portal**
5. You should see a table with warranty claims
6. Find the claim for PHONE-001:
   - Claim ID: #0 (or #1, depends on if you've run tests before)
   - Product S/N: PHONE-001
   - Model: iPhone 16 Pro
   - Customer: `0x90F7...b906`
   - Reason: "Screen defect - multiple dead pixels..."
   - Status: Yellow badge "Pending"
7. Review the claim details
8. To **approve**: Click the green checkmark button
   - OR -
9. To **reject**: Click the red X button
10. Approve MetaMask transaction
11. Wait for confirmation

**Expected Result:**
- Claim status changes to "Approved" (green) or "Rejected" (red)
- Action buttons disappear, replaced by "Completed"
- Transaction confirmed on blockchain

---

## Verification Steps

### Verify Complete Lifecycle

**Check Manufacturer Portal (Account #1):**
- PHONE-001 should NOT be in the list (transferred out)

**Check Retailer Portal (Account #2):**
- PHONE-001 should NOT be in inventory (sold to customer)

**Check User Dashboard (Account #3):**
- PHONE-001 should be visible
- Shows warranty details
- Shows it's owned by this account

**Check Service Center Portal (Account #4):**
- Claim for PHONE-001 should be visible
- Shows approved/rejected status
- Cannot change status again (completed)

---

## Testing Role-Based Access Control

### Test 1: Non-Manufacturer Cannot Register Products
1. Switch to Account #3 (Customer)
2. Go to Manufacturer Portal
3. Observe: "Register New Product" button is grayed out
4. Clicking it does nothing

### Test 2: Non-Retailer Cannot Sell Products
1. Switch to Account #1 (Manufacturer)
2. Go to Retailer Portal
3. Observe: "Sell Product" button is grayed out
4. No text hint "(RETAILER only)" - just visually disabled

### Test 3: Non-Customer Cannot Claim Warranty
1. Switch to Account #1 (Manufacturer)
2. Go to User Dashboard
3. If any products are shown, "Claim Warranty" button is grayed out

### Test 4: Non-Service-Center Cannot Process Claims
1. Switch to Account #1 (Manufacturer)
2. Go to Service Center Portal
3. Claims are visible (read access)
4. Action buttons show "Requires SERVICE_CENTER role"

---

## Common Issues & Solutions

### Issue: "Wrong Network" Error
**Solution:** 
- Open MetaMask
- Click network dropdown
- Select "Localhost 8545" (Chain ID: 31337)
- If not available, add it manually:
  - Network Name: Localhost 8545
  - RPC URL: http://127.0.0.1:8545
  - Chain ID: 31337
  - Currency Symbol: ETH

### Issue: "Contract has no code at address"
**Solution:**
- Stop the blockchain (Ctrl+C in Terminal 1)
- Restart: `npm run chain`
- Redeploy: `npm run deploy:local`
- Re-grant roles: `npm run grant-roles`
- Refresh frontend

### Issue: "Nonce too high" or transaction errors
**Solution:**
- In MetaMask: Settings → Advanced → Reset Account
- This clears transaction history
- Do this EACH time you restart the blockchain

### Issue: Products/Claims not showing
**Solution:**
1. Check console for errors
2. Verify you're on the correct network (Chain ID: 31337)
3. Verify contracts are deployed (check Terminal 2 output)
4. Try refreshing the page
5. Check you're using the correct account for the role

### Issue: MetaMask not prompting for signature
**Solution:**
1. Check if MetaMask popup is blocked by browser
2. Click the MetaMask icon in browser extensions
3. Try refreshing the page and attempting action again

---

## Test Account Summary

| Role | Account # | Address | Private Key |
|------|-----------|---------|-------------|
| Admin | #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| Manufacturer | #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| Retailer | #2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| Customer | #3 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| Service Center | #4 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` |

**Note:** Admin (Account #0) has all permissions and can perform any action.

---

## Expected Behavior Summary

1. **Data Persistence:** All data is stored on blockchain, persists across page refreshes
2. **Real-time Updates:** UI refreshes automatically after blockchain transactions
3. **Role Enforcement:** Smart contracts enforce permissions (frontend is just UI)
4. **Transaction Signing:** Every state change requires MetaMask approval
5. **Visual Feedback:** Loading spinners during operations, success/error alerts
6. **Access Control:** Unauthorized users see grayed-out buttons without text hints

---

## Next Steps After Testing

Once you've verified the complete workflow:

1. Try creating multiple products
2. Test with different warranty durations
3. Submit multiple claims for the same product (up to the limit)
4. Try to submit claim after all allowed claims are used
5. Test expired warranties (change warranty duration to 1 day, wait, then try claiming)

Happy Testing!
