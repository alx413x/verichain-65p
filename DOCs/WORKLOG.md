# Development Worklog

## 连接实际合约功能

### 实现方式

将各个页面的模拟数据操作替换为真实的智能合约调用：

1. **Manufacturer Portal**
   - 注册产品：调用 `ProductRegistry.registerProduct(serialNumber, model, warrantyDuration, maxClaims)`
   - 转移给零售商：调用 `OwnershipManager.transferOwnership(productId, retailerAddress)`
   - 读取产品列表：监听 `ProductRegistered` 事件或调用合约的查询方法

2. **Retailer Portal**
   - 接收产品：从链上读取待接收的产品（通过 OwnershipTransferred 事件）
   - 销售给客户：调用 `OwnershipManager.transferOwnership(productId, customerAddress)`
   - 库存管理：查询当前用户拥有的所有产品

3. **User Dashboard**
   - 查看拥有的产品：通过 `ProductRegistry.getProductsByOwner(userAddress)` 或事件过滤
   - 提交保修申请：调用 `WarrantyManager.submitClaim(productId, reason)`
   - 查看保修状态：调用 `WarrantyManager.getClaimStatus(claimId)`

4. **Service Center Portal**
   - 查看待处理申请：读取 `WarrantyManager` 中的 pending claims
   - 批准申请：调用 `WarrantyManager.approveClaim(claimId)`
   - 拒绝申请：调用 `WarrantyManager.rejectClaim(claimId, reason)`

### 实现原因

- **数据真实性**：从区块链读取的数据是不可篡改的，保证产品溯源的可信度
- **交易透明**：所有操作都会触发 MetaMask 签名，用户明确知道链上发生了什么
- **业务逻辑一致**：合约中的业务规则（如保修期限、索赔次数限制）会自动执行
- **去中心化**：数据存储在区块链上，不依赖中心化服务器

### 技术要点

```javascript
// 写入操作（需要签名）
const tx = await productRegistry.registerProduct(serial, model, duration, claims);
await tx.wait(); // 等待交易确认

// 读取操作（免费）
const product = await productRegistry.getProduct(productId);

// 事件监听（实时更新）
productRegistry.on("ProductRegistered", (productId, manufacturer) => {
  // 更新 UI
});
```

---

## 角色管理

### 实现方式

使用 `AccessControlContract` 进行基于角色的访问控制（RBAC）：

1. **定义角色常量**
   ```javascript
   const ROLES = {
     MANUFACTURER: ethers.id("MANUFACTURER_ROLE"),
     RETAILER: ethers.id("RETAILER_ROLE"),
     SERVICE_CENTER: ethers.id("SERVICE_CENTER_ROLE"),
     ADMIN: ethers.id("ADMIN_ROLE")
   };
   ```

2. **检查用户角色**
   - 在页面加载时检查当前用户是否有权限
   - 调用 `accessControl.hasRole(roleHash, userAddress)`
   - 根据角色显示/隐藏特定功能

3. **权限门禁**
   - Manufacturer 页面：只有 MANUFACTURER_ROLE 的用户可以访问
   - Service Center 页面：只有 SERVICE_CENTER_ROLE 的用户可以操作
   - 合约层面：智能合约也会验证角色（双重保护）

4. **角色授予流程**
   - 由 ADMIN 角色通过 `accessControl.grantRole(role, address)` 授予
   - 在开发阶段，可以通过部署脚本预先设置测试角色
   - 生产环境由管理员通过专门的管理界面授权

### 实现原因

- **安全性**：防止未授权用户执行敏感操作（如注册产品、批准保修）
- **业务隔离**：不同角色看到不同的界面和功能，符合实际业务场景
- **审计追踪**：所有角色操作都记录在链上，可追溯
- **灵活性**：可以动态添加/移除角色，适应业务变化

### 技术要点

```javascript
// 检查角色
const isManufacturer = await accessControl.hasRole(MANUFACTURER_ROLE, account);

// 条件渲染
{isManufacturer ? (
  <ManufacturerActions />
) : (
  <AccessDenied message="需要制造商权限" />
)}

// 在合约调用前验证（可选，合约会再次验证）
if (!isManufacturer) {
  throw new Error("Unauthorized: MANUFACTURER_ROLE required");
}
```

### 用户体验优化

- **角色自动检测**：连接钱包后自动检测用户角色并导航到对应门户
- **友好提示**：无权限时显示清晰的提示信息而非报错
- **角色切换**：如果用户有多个角色，提供切换界面的选项
- **权限申请**：提供联系管理员申请权限的入口

---

## 实施优先级

1. **Phase 1**: 连接 Manufacturer 的注册产品功能（最简单，验证整个流程）
2. **Phase 2**: 添加角色检查（验证访问控制）
3. **Phase 3**: 连接 User 的保修申请和 Service Center 的审核功能
4. **Phase 4**: 完善 Retailer 的库存和销售功能
5. **Phase 5**: 添加事件监听，实现实时 UI 更新

---

## 下一步行动

准备开始实施时需要：
1. 确认合约方法签名（查看 Solidity 源码或 ABI）
2. 编写角色常量定义文件
3. 创建通用的错误处理和加载状态组件
4. 逐个页面实现合约集成

---

## 实施进度

### Phase 1: 角色管理系统 (Completed)

**已实现：**

1. **角色常量定义** (`src/utils/roles.js`)
   - 定义了所有角色的 keccak256 哈希值
   - 提供 `checkRole()` 和 `getUserRoles()` 辅助函数

2. **ContractsContext 增强**
   - 添加 `userRoles` 状态
   - 自动检测用户角色（当 account 变化时）
   - 提供便捷的角色检查方法：`isManufacturer`, `isRetailer`, `isCustomer`, `isServiceCenter`, `isAdmin`

3. **角色授予脚本** (`contractsLogic/scripts/grantRoles.cjs`)
   - 自动为 Hardhat 测试账户授予角色
   - Account #0: Admin
   - Account #1: Manufacturer
   - Account #2: Retailer
   - Account #3: Customer
   - Account #4: Service Center
   - 运行命令: `npm run grant-roles`

### Phase 2: Manufacturer Portal 合约集成 (Completed)

**已实现：**

1. **角色门禁**
   - 检查用户是否连接钱包
   - 检查用户是否有 MANUFACTURER_ROLE
   - 无权限时显示友好的拒绝页面

2. **注册产品功能**
   - 调用 `ProductRegistry.registerProduct(serialNumber, model)`
   - 调用 `ProductRegistry.createWarranty(serialNumber, duration, maxClaims)`
   - 调用 `OwnershipManager.syncOwnership(serialNumber)`
   - 交易确认后刷新产品列表

3. **产品列表加载**
   - 从 `OwnershipManager.getProductsByOwner(account)` 获取序列号列表
   - 对每个产品调用 `ProductRegistry.getProductDetails(serialNumber)`
   - 显示加载状态和空状态

4. **转移给零售商**
   - 调用 `OwnershipManager.transferOwnership(serialNumber, retailerAddress)`
   - 支持批量转移多个产品
   - 验证以太坊地址格式
   - 交易确认后刷新列表

5. **UI/UX 改进**
   - 加载指示器（loading spinner）
   - 按钮禁用状态（防止重复提交）
   - 成功/失败提示
   - 友好的错误消息

**使用流程：**

1. 确保本地链和前端都在运行
2. 运行 `npm run grant-roles` 授予角色
3. 在 MetaMask 导入 Account #1 的私钥 (Manufacturer)
4. 连接钱包后访问 Manufacturer Portal
5. 可以注册产品、创建保修、转移给零售商

### Phase 3: Other Portal Contract Integration (COMPLETED)

All portals now fully integrated with blockchain smart contracts.

**Retailer Portal - Completed:**

1. **Contract Integration**
   - Load inventory from blockchain via `OwnershipManager.getProductsByOwner(account)`
   - Get product details via `ProductRegistry.getProductDetails(serialNumber)`
   - Sell to customer via `OwnershipManager.transferOwnership(serialNumber, customerAddress)`
   - Address validation for Ethereum addresses

2. **UI Improvements**
   - Loading spinner during blockchain operations
   - Empty state message when no inventory
   - Auto-refresh inventory after successful sale
   - Disabled buttons for non-retailers (grayed out, no text hints)

3. **Usage Flow**
   - Import Account #2 (Retailer) into MetaMask
   - Connect wallet and switch to Localhost 8545
   - View products transferred from manufacturer
   - Sell products to customers by entering their address

**User Dashboard - Completed:**

1. **Contract Integration**
   - Load owned products via `OwnershipManager.getProductsByOwner(account)`
   - Get product details and warranty info via `ProductRegistry.getProductDetails(serialNumber)`
   - Calculate warranty expiration and status (Active/Expired)
   - Submit warranty claims via `WarrantyManager.submitClaim(serialNumber, reason)`

2. **Features Implemented**
   - Display all owned products in card grid layout
   - Show warranty status with color-coded badges (Active/Expired/In Review)
   - Show warranty expiration dates
   - Submit warranty claim with reason text
   - Real-time product list refresh after claim submission

3. **UI/UX**
   - Loading state during blockchain data fetch
   - Empty state when no products owned
   - Disabled claim button for non-customers (grayed out)
   - Submit button shows "Submitting..." during transaction
   - Product cards show purchase date and warranty expiration

4. **Usage Flow**
   - Import Account #3 (Customer) into MetaMask
   - Connect wallet and switch to Localhost 8545
   - View products purchased from retailers
   - Click "Claim Warranty" to submit claim with reason
   - Wait for MetaMask signature and transaction confirmation

**Service Center Portal - Completed:**

1. **Contract Integration**
   - Load all warranty claims via `WarrantyManager.listAllWarrantyClaims()`
   - Get product details for each claim via `ProductRegistry.getProductDetails()`
   - Approve claims via `WarrantyManager.approveClaim(claimId)`
   - Reject claims via `WarrantyManager.rejectClaim(claimId)`

2. **Features Implemented**
   - Display all warranty claims with details (Claim ID, Product, Customer, Reason)
   - Show claim status with color-coded badges (Pending/Approved/Rejected)
   - Approve/Reject buttons for pending claims
   - Real-time claim list refresh after action
   - Show product model and serial number
   - Display customer's claim reason

3. **UI/UX**
   - Loading state during blockchain data fetch
   - Empty state when no claims exist
   - Disabled action buttons during transaction processing
   - Role-based button visibility (grayed out for non-service-center users)
   - Clear visual feedback for claim status

4. **Usage Flow**
   - Import Account #4 (Service Center) into MetaMask
   - Connect wallet and switch to Localhost 8545
   - View all submitted warranty claims
   - Click green checkmark to approve or red X to reject
   - Wait for MetaMask signature and transaction confirmation
   - Claim list refreshes automatically

### Phase 3: Summary

All three portals (Retailer, User, Service Center) now have full blockchain integration:
- Load data from smart contracts
- Submit transactions with proper error handling
- Real-time UI updates after blockchain operations
- Role-based access control with grayed-out buttons
- Loading states and empty states
- Clean UI without text hints on disabled elements

**Bug Fixes (Nov 25, 2025):**
1. Fixed Service Center claims not displaying - removed `isServiceCenter` requirement for loading claims (claims are read-only for all roles, but only Service Center can approve/reject)
2. Fixed claim approval/rejection - updated to use correct contract method `reviewClaim(serialNumber, claimIndex, approve, reviewReason)` instead of non-existent `approveClaim`/`rejectClaim`
3. Fixed Home search - integrated with blockchain via `ProductRegistry.getProductDetails()` instead of mock data
4. Fixed Manufacturer transfer button - now shows blue color when products are selected, gray when disabled

### Phase 4: Event Listening (COMPLETED)

Implemented real-time blockchain event listening for automatic UI updates.

**Events Monitored:**

1. **ProductRegistered** (from ProductRegistry)
   - Emitted when: Manufacturer registers a new product
   - Parameters: `serialNumber`, `model`, `manufacturer`, `timestamp`, `initialOwner`
   - Triggers: Auto-refresh manufacturer product list

2. **OwnershipTransferred** (from OwnershipManager)
   - Emitted when: Product ownership changes (manufacturer to retailer, retailer to customer)
   - Parameters: `serialNumber`, `from`, `to`, `date`
   - Triggers: Auto-refresh relevant portal's inventory
     - Manufacturer: When `from === account` (transfer out)
     - Retailer: When `to === account` (receive) or `from === account` (sell)
     - User: When `to === account` (purchase)

3. **ClaimSubmitted** (from WarrantyManager)
   - Emitted when: Customer submits warranty claim
   - Parameters: `serialNumber`, `claimant`, `reason`
   - Triggers: Auto-refresh Service Center claims list, User product list

4. **ClaimReviewed** (from WarrantyManager)
   - Emitted when: Service Center approves/rejects claim
   - Parameters: `serialNumber`, `reviewer`, `status`, `reviewReason`
   - Triggers: Auto-refresh Service Center claims list, User product list

5. **WarrantyCreated** (from ProductRegistry)
   - Emitted when: Warranty is created for a product
   - Parameters: `serialNumber`, `startDate`, `expiration`
   - Logged to console for tracking

**Implementation Details:**

1. **ContractsContext Enhancement**
   - Added event listener setup in `useEffect` hook
   - Stores event history in `eventListeners` state
   - Provides `latestEvent` to all components via context
   - Automatic cleanup on unmount using `removeAllListeners()`

2. **Component Auto-Refresh**
   - Each portal listens to `latestEvent` via `useEffect`
   - Checks if event is relevant to current user/role
   - Automatically calls load function to refresh data
   - No manual refresh needed

3. **Event Listener Pattern**
   ```javascript
   contract.on('EventName', (param1, param2, ...) => {
     console.log('Event received:', param1, param2);
     setEventListeners(prev => [...prev, { type, data, id }]);
   });
   ```

4. **Console Logging**
   - All events logged to console with formatted data
   - Helps debugging and tracking blockchain activity
   - Timestamps converted to readable format

**Benefits:**

- Real-time UI updates without manual page refresh
- Multiple browser tabs stay synchronized
- Immediate feedback when other users perform actions
- Better UX with automatic data refresh
- Complete audit trail in console logs

**Usage Example:**

1. Open Manufacturer portal in one browser tab
2. Open Retailer portal in another tab (different MetaMask account)
3. Manufacturer transfers product to retailer
4. Retailer tab automatically refreshes and shows new product
5. No page reload needed

**Phase 4 Implementation Complete:**
- All required events monitored
- Auto-refresh implemented in all portals
- Event cleanup on component unmount
- Console logging for debugging

### Phase 5: 优化和完善 (COMPLETED ✅)

- [x] 错误处理优化
  - Toast 通知系统 (success, error, warning, info)
  - 区块链错误解析器 (交易拒绝、余额不足、网络错误等)
  - 替换所有 alert() 为友好的 toast 通知
- [x] Gas 估算
  - 实时 Gas 估算显示
  - 表单字段变化时自动更新估算
  - 以 ETH 单位显示预估费用
- [x] 产品图标选择
  - 制造商注册产品时可选择 24 个 emoji 图标
  - 图标存储在 localStorage
  - 用户界面显示对应的产品图标
- [ ] 交易历史记录 (未实现)
- [ ] 用户引导和帮助 (未实现)

**Phase 5 实现细节:**

1. **Toast 通知系统**
   - 文件: `src/components/Toast.jsx`, `src/contexts/ToastContext.jsx`
   - 4 种类型: success, error, warning, info
   - 自动消失 (默认 5 秒)
   - 从右侧滑入动画

2. **错误处理**
   - 文件: `src/utils/errorHandler.js`
   - 智能解析区块链错误
   - 提供用户友好的错误消息
   - 检测常见错误: ACTION_REJECTED, INSUFFICIENT_FUNDS, NETWORK_ERROR 等

3. **Gas 估算**
   - 应用于 Manufacturer Portal
   - 实时计算 registerProduct 和 transferOwnership 的 gas 费用
   - 显示格式: "Estimated Gas: ~0.0012 ETH"

4. **产品图标**
   - 24 个常用产品图标可选
   - 8 列网格布局，选中高亮
   - localStorage 存储映射关系
   - 图标在 User Dashboard 和 Product Passport 中显示

### Testing the Complete Workflow

**Test Scenario: Product Lifecycle from Manufacturing to Warranty Claim**

1. **Setup (Terminal 1)**
   ```bash
   npm run chain
   ```

2. **Deploy & Grant Roles (Terminal 2)**
   ```bash
   npm run deploy:local
   bash setup-artifacts.sh
   npm run grant-roles
   ```

3. **Start Frontend (Terminal 3)**
   ```bash
   npm run dev
   ```

4. **Step 1: Manufacturer Registers Product**
   - Import Account #1 private key to MetaMask:
     `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - Connect wallet, ensure on Localhost 8545
   - Navigate to Manufacturer Portal
   - Click "Register New Product"
   - Fill in:
     - Serial Number: `PHONE-001`
     - Model: `iPhone 16 Pro`
     - Warranty Duration: `730` (2 years in days)
     - Allowed Claims: `3`
   - Click "Mint Product Passport"
   - Approve 3 MetaMask transactions (register, warranty, sync)
   - Product appears in list

5. **Step 2: Manufacturer Transfers to Retailer**
   - Click "Transfer to retailer"
   - Enter Retailer address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
   - Select the product (PHONE-001)
   - Click transfer button
   - Approve MetaMask transaction
   - Product disappears from manufacturer's list

6. **Step 3: Retailer Sells to Customer**
   - Switch MetaMask to Account #2 (Retailer):
     `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
   - Refresh page, navigate to Retailer Portal
   - See PHONE-001 in inventory
   - Click "Sell Product"
   - Enter Customer address: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
   - Enter serial number: `PHONE-001`
   - Click "Register Sale"
   - Approve MetaMask transaction
   - Product disappears from retailer's inventory

7. **Step 4: Customer Submits Warranty Claim**
   - Switch MetaMask to Account #3 (Customer):
     `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`
   - Refresh page, navigate to User Dashboard
   - See PHONE-001 in "My Digital Passports"
   - Click "Claim Warranty"
   - Enter reason: `Screen defect - dead pixels`
   - Click "Submit Claim Request"
   - Approve MetaMask transaction
   - Alert confirms submission

8. **Step 5: Service Center Reviews Claim**
   - Switch MetaMask to Account #4 (Service Center):
     `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`
   - Refresh page, navigate to Service Center Portal
   - See claim for PHONE-001 with reason "Screen defect - dead pixels"
   - Click green checkmark to approve (or red X to reject)
   - Approve MetaMask transaction
   - Claim status changes to "Approved" or "Rejected"

**Expected Results:**
- Each role can only perform actions appropriate to their role
- All data persists on the blockchain
- UI updates in real-time after transactions
- MetaMask prompts for every state-changing operation
- Non-role users see grayed-out buttons without permission text

**Common Issues:**
- If "Wrong Network" error: Switch MetaMask to Localhost 8545
- If "Contract has no code": Redeploy with `npm run deploy:local`
- If "Not authorized": Rerun `npm run grant-roles`
- If Nonce error: Reset account in MetaMask (Settings > Advanced > Reset Account)

---

## 测试指南

### 准备工作

1. **启动本地区块链**
   ```bash
   npm run chain
   ```

2. **部署合约**
   ```bash
   npm run deploy:local
   bash setup-artifacts.sh
   ```

3. **授予角色**
   ```bash
   npm run grant-roles
   ```

4. **启动前端**
   ```bash
   npm run dev
   ```

### 测试 Manufacturer Portal

1. **导入 Manufacturer 账户到 MetaMask**
   - 从 `npm run chain` 输出复制 Account #1 的私钥
   - 默认地址: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
   - 默认私钥: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

2. **连接钱包**
   - 访问 http://localhost:5173
   - 点击 "Connect Wallet"
   - 确保切换到 Localhost 8545 网络

3. **注册产品**
   - 访问 Manufacturer Portal
   - 点击 "Register New Product"
   - 填写:
     - Serial Number: TEST001
     - Model: Test Product
     - Warranty Duration: 365
     - Allowed Claims: 2
   - 点击 "Mint Product Passport"
   - MetaMask 会弹出 3 次签名请求（register, create warranty, sync ownership）
   - 等待交易确认
   - 产品应该出现在列表中

4. **转移产品**
   - 点击 "Transfer to retailer"
   - 输入零售商地址 (Account #2): `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
   - 选择要转移的产品
   - 点击转移按钮
   - MetaMask 签名确认
   - 等待交易确认
   - 产品应该从列表中消失（已转移）

### 常见问题

**Q: 点击注册后没有反应？**
A: 检查浏览器控制台，可能是 MetaMask 弹窗被拦截

**Q: 交易失败 "Not manufacturer"？**
A: 确保已运行 `npm run grant-roles` 并使用正确的账户

**Q: 产品列表为空？**
A: 正常情况，新部署的合约没有数据。注册第一个产品后会显示

**Q: Nonce 错误？**
A: 重启 Hardhat 节点后需要在 MetaMask 重置账户（设置 → 高级 → 重置账户）

---

## 部署到 Sepolia 测试网

### 准备工作

1. **获取 Sepolia ETH**
   - 访问 Sepolia 水龙头: https://sepoliafaucet.com/ 或 https://www.alchemy.com/faucets/ethereum-sepolia
   - 需要一些 Sepolia ETH 用于部署合约和交易

2. **获取 Alchemy/Infura API Key**
   - 访问 https://www.alchemy.com/ 或 https://www.infura.io/
   - 创建账户并创建一个 Sepolia 项目
   - 复制 API Key

3. **配置环境变量**
   创建 `.env` 文件在项目根目录:
   ```env
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
   ETHERSCAN_API_KEY=your_etherscan_api_key  # 可选，用于合约验证
   ```

4. **更新 Hardhat 配置**
   在 `contractsLogic/hardhat.config.js` 中添加 Sepolia 网络配置:
   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   require('dotenv').config();

   module.exports = {
     solidity: "0.8.20",
     networks: {
       hardhat: {
         chainId: 31337
       },
       localhost: {
         url: "http://127.0.0.1:8545",
         chainId: 31337
       },
       sepolia: {
         url: process.env.SEPOLIA_RPC_URL || "",
         accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
         chainId: 11155111
       }
     },
     etherscan: {
       apiKey: process.env.ETHERSCAN_API_KEY
     }
   };
   ```

### 部署步骤

1. **部署合约到 Sepolia**
   ```bash
   cd contractsLogic
   npx hardhat run scripts/deploy.js --network sepolia
   ```

   部署后会输出合约地址，例如:
   ```
   AccessControl deployed to: 0x1234...
   ProductRegistry deployed to: 0x5678...
   OwnershipManager deployed to: 0x9abc...
   WarrantyManager deployed to: 0xdef0...
   ```

2. **保存部署信息**
   部署脚本会自动创建 `deployed.json` 文件，包含所有合约地址

3. **复制 ABI 文件**
   ```bash
   bash setup-artifacts.sh
   ```

4. **授予角色**
   修改 `contractsLogic/scripts/grant-roles.js` 中的账户地址为你的 Sepolia 账户:
   ```javascript
   const manufacturerAddr = "0xYourManufacturerAddress";
   const retailerAddr = "0xYourRetailerAddress";
   const customerAddr = "0xYourCustomerAddress";
   const serviceCenterAddr = "0xYourServiceCenterAddress";
   ```

   然后运行:
   ```bash
   npx hardhat run scripts/grant-roles.js --network sepolia
   ```

5. **验证合约 (可选，推荐)**
   ```bash
   # 验证 AccessControl
   npx hardhat verify --network sepolia DEPLOYED_ACCESS_CONTROL_ADDRESS

   # 验证 ProductRegistry
   npx hardhat verify --network sepolia DEPLOYED_PRODUCT_REGISTRY_ADDRESS "DEPLOYED_ACCESS_CONTROL_ADDRESS"

   # 验证 OwnershipManager
   npx hardhat verify --network sepolia DEPLOYED_OWNERSHIP_MANAGER_ADDRESS "DEPLOYED_ACCESS_CONTROL_ADDRESS" "DEPLOYED_PRODUCT_REGISTRY_ADDRESS"

   # 验证 WarrantyManager
   npx hardhat verify --network sepolia DEPLOYED_WARRANTY_MANAGER_ADDRESS "DEPLOYED_ACCESS_CONTROL_ADDRESS" "DEPLOYED_PRODUCT_REGISTRY_ADDRESS"
   ```

### 前端配置

1. **更新前端合约配置**
   前端会自动读取 `deployed.json` 和 ABI 文件，无需额外配置

2. **配置 MetaMask**
   - 添加 Sepolia 测试网络（通常已内置）
   - 切换到 Sepolia 网络
   - 导入你用于部署的账户

3. **启动前端**
   ```bash
   npm run dev
   ```

4. **连接钱包**
   - 访问 http://localhost:5173
   - 点击 "Connect Wallet"
   - 确保 MetaMask 切换到 Sepolia 网络

### 在 Etherscan 上查看

部署并验证合约后，你可以在 Sepolia Etherscan 上查看:

1. **访问 Sepolia Etherscan**
   - 主页: https://sepolia.etherscan.io/

2. **查看合约**
   - 输入合约地址: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
   - 如果已验证，可以看到 "Contract" 标签和源代码

3. **查看交易**
   - 每次注册产品、转移所有权、提交保修等操作都会产生交易
   - 在 Etherscan 上可以看到交易详情、Gas 费用、事件日志等

4. **读取合约数据**
   - 点击 "Read Contract" 标签
   - 可以直接调用 view 函数查询数据
   - 例如: `getProductDetails(serialNumber)`

5. **与合约交互**
   - 点击 "Write Contract" 标签
   - 连接钱包后可以直接在 Etherscan 上调用合约函数

### 验证合约的好处

1. **源代码公开**: 任何人都可以查看合约源代码
2. **交互界面**: Etherscan 提供友好的读写界面
3. **事件日志**: 可以看到所有事件的详细信息
4. **可信度**: 已验证的合约更值得信任

### 注意事项

1. **Gas 费用**: Sepolia 上的交易需要真实的 ETH (测试网 ETH)
2. **交易速度**: Sepolia 区块时间约 15 秒，比本地网络慢
3. **数据持久性**: Sepolia 上的数据会永久保存
4. **私钥安全**: 
   - ⚠️ **永远不要**将真实以太坊主网的私钥用于测试
   - ⚠️ **不要**将 `.env` 文件提交到 Git
   - 使用专门的测试账户

### 部署脚本示例

创建 `contractsLogic/scripts/deploy-sepolia.js`:
```javascript
const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("Deploying contracts to Sepolia...");

  // Deploy AccessControl
  const AccessControl = await hre.ethers.getContractFactory("AccessControlContract");
  const accessControl = await AccessControl.deploy();
  await accessControl.waitForDeployment();
  const accessAddr = await accessControl.getAddress();
  console.log("AccessControl deployed to:", accessAddr);

  // Deploy ProductRegistry
  const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy(accessAddr);
  await productRegistry.waitForDeployment();
  const registryAddr = await productRegistry.getAddress();
  console.log("ProductRegistry deployed to:", registryAddr);

  // Deploy OwnershipManager
  const OwnershipManager = await hre.ethers.getContractFactory("OwnershipManager");
  const ownershipManager = await OwnershipManager.deploy(accessAddr, registryAddr);
  await ownershipManager.waitForDeployment();
  const ownershipAddr = await ownershipManager.getAddress();
  console.log("OwnershipManager deployed to:", ownershipAddr);

  // Deploy WarrantyManager
  const WarrantyManager = await hre.ethers.getContractFactory("WarrantyManager");
  const warrantyManager = await WarrantyManager.deploy(accessAddr, registryAddr);
  await warrantyManager.waitForDeployment();
  const warrantyAddr = await warrantyManager.getAddress();
  console.log("WarrantyManager deployed to:", warrantyAddr);

  // Set manager addresses
  await productRegistry.setOwnershipManager(ownershipAddr);
  await productRegistry.setWarrantyManager(warrantyAddr);
  console.log("Manager addresses set in ProductRegistry");

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

  console.log("\n=== Deployment Complete ===");
  console.log("\nView contracts on Etherscan:");
  console.log(`AccessControl: ${deployment.etherscan.AccessControl}`);
  console.log(`ProductRegistry: ${deployment.etherscan.ProductRegistry}`);
  console.log(`OwnershipManager: ${deployment.etherscan.OwnershipManager}`);
  console.log(`WarrantyManager: ${deployment.etherscan.WarrantyManager}`);
  console.log("\nNext steps:");
  console.log("1. Run: bash setup-artifacts.sh");
  console.log("2. Update grant-roles.js with your account addresses");
  console.log("3. Run: npx hardhat run scripts/grant-roles.js --network sepolia");
  console.log("4. Verify contracts (optional but recommended)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

使用:
```bash
cd contractsLogic
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```
