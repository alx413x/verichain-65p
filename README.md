# VeriChain Passport

- 项目状态：已完成并可运行
  - VeriChain Passport dApp 现在已经**完全可以在本地运行**，并支持 **MetaMask 钱包连接**！

---

## 已实现的功能

### 1. 智能合约部署
- Hardhat 配置完成
- 4个核心合约已部署到本地节点:
  - `AccessControlContract` - 访问控制
  - `ProductRegistry` - 产品注册
  - `OwnershipManager` - 所有权管理
  - `WarrantyManager` - 保修管理

### 2. MetaMask 钱包集成
- **完整的 MetaMask 连接功能**
- 实时钱包状态显示
- 账户地址格式化显示
- 连接/断开功能
- 网络切换检测

### 3. 前端集成
- `ContractsProvider` Context - 统一管理所有合约实例
- `useContracts` Hook - 在任何组件中访问合约
- `useEthers` Hook - 钱包连接管理
- `useContract` Hook - 合约实例创建
- 自动加载合约 ABIs 和地址

### 4. 用户界面
- 导航栏显示钱包连接状态
- "Connect Wallet" 按钮功能完整
- 所有页面路由正常工作:
  - Home - 产品搜索
  - Manufacturer - 制造商门户
  - Retailer - 零售商门户
  - User - 用户仪表盘
  - Service Center - 服务中心
  - Product Passport - 产品详情

---

## 如何运行

### 第一次启动 (完整流程):

```bash
# 1. 安装依赖
npm install

# 2. 编译合约
npm run compile

# 3. 启动本地区块链 (在一个终端中运行，保持打开)
npm run chain

# 4. 部署合约 (在另一个终端中)
npm run deploy:local

# 5. 复制 artifacts 到前端
bash setup-artifacts.sh

# 6. 分配角色
npm run grant-roles

# 7. 启动前端开发服务器
npm run dev
```

### 日常开发 (链已启动):

```bash
# 终端 1: 本地链 (如果还没启动)
npm run chain

# 终端 2: 前端
npm run dev
```

### 重新部署合约后:

```bash
npm run deploy:local
bash setup-artifacts.sh
```

---

## 关键文件说明

### 配置文件:
- `hardhat.config.cjs` - Hardhat 配置
- `package.json` - 项目依赖和脚本
- `setup-artifacts.sh` - 自动复制 artifacts 脚本

### 智能合约:
- `contractsLogic/contracts/*.sol` - Solidity 合约
- `contractsLogic/scripts/deploy.cjs` - 部署脚本
- `contractsLogic/doc/deployed.json` - 部署地址
- `contractsLogic/doc/abis/*.json` - 合约 ABIs

### 前端核心:
- `src/contexts/ContractsContext.jsx` - 合约 Context Provider
- `src/hooks/useEthers.js` - MetaMask 连接 Hook
- `src/hooks/useContract.js` - 合约实例 Hook
- `src/hooks/loadArtifacts.js` - 加载 ABIs 工具
- `src/App.jsx` - 主应用组件 (已集成钱包)

### 前端 Public:
- `public/deployed.json` - 部署的合约地址
- `public/abis/*.json` - 合约 ABIs (供前端使用)

---

## 当前运行状态

### 正在运行的服务:

1. **本地区块链节点** (终端 1)
   - URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - 20个测试账户，每个 10000 ETH

2. **前端开发服务器** (终端 2)
   - URL: http://localhost:5173
   - 支持热重载
   - 已加载合约 ABIs

---

## 技术实现细节

### MetaMask 集成流程:

1. **用户点击 "Connect Wallet"**
   ```javascript
   // App.jsx - handleConnect()
   await connect();  // 调用 useEthers 的 connect()
   ```

2. **触发 MetaMask 弹窗**
   ```javascript
   // useEthers.js
   await browserProvider.send('eth_requestAccounts', []);
   ```

3. **获取账户信息**
   ```javascript
   const signer = await browserProvider.getSigner();
   const account = await signer.getAddress();
   ```

4. **创建合约实例**
   ```javascript
   // ContractsContext.jsx
   const productRegistry = useContract({
     address: deployed.ProductRegistry,
     abi: RegistryABI.abi,
     provider,
     signer,
     asSigner: true
   });
   ```

### 合约调用示例:

```javascript
// 读取合约数据 (不需要签名)
const details = await productRegistry.getProductDetails(serialNumber);

// 写入交易 (需要 MetaMask 签名)
const tx = await productRegistry.registerProduct(serial, model);
await tx.wait(); // 等待交易确认
```

---

## 参考文档

1. **快速开始指南:** [SET GUIDE](./DOCs/SETUP_GUIDE.md)
2. **MetaMask 配置:** [METAMASK SETUP](./DOCs/METAMASK_SETUP.md)
3. **合约集成:** [Contract-Frontend Integration](./DOCs/CONTRACT_FRONTEND_INTEGRATION.md)
4. **PRD 需求文档:** [PRD](https://w0lse89rpgr.feishu.cn/wiki/BKGRwjlOsiuPRZkvdJ0cIUuKntf)

---

## 重要提示

### 本地开发注意事项:

1. **Hardhat 节点重启后**:
   - 所有链上数据丢失
   - 合约地址会改变
   - 需要重新部署: `npm run deploy:local && bash setup-artifacts.sh`
   - MetaMask 需要重置账户

2. **MetaMask Nonce 错误**:
   - 设置 → 高级 → 清除活动数据
   - 或 设置 → 高级 → 重置账户

3. **网络切换**:
   - 确保 MetaMask 在 "Localhost 8545" 网络
   - Chain ID 必须是 31337
