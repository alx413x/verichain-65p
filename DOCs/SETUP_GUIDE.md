# VeriChain Passport - 本地运行指南

这是一个基于以太坊智能合约的产品生命周期管理 dApp。

## 🚀 快速开始

### 前置要求

1. **Node.js** (>=18)
2. **MetaMask** 浏览器扩展
3. **npm** 或 **yarn**

### 安装步骤

#### 1. 安装依赖

```bash
npm install
```

#### 2. 启动本地区块链节点

在一个终端窗口中运行:

```bash
npm run chain
```

这将启动一个本地 Hardhat 节点在 `http://127.0.0.1:8545`

**重要:** 保持这个终端窗口开启!

#### 3. 部署智能合约

在**另一个**终端窗口中运行:

```bash
npm run compile
npm run deploy:local
```

这将:
- 编译智能合约
- 部署到本地节点
- 生成 ABIs 和部署地址到 `contractsLogic/doc/`

#### 4. 复制合约文件到前端

```bash
bash setup-artifacts.sh
```

或手动复制:

```bash
mkdir -p public/abis
cp contractsLogic/doc/deployed.json public/deployed.json
cp contractsLogic/doc/abis/*.json public/abis/
```

#### 5. 配置 MetaMask

##### 添加本地网络:

1. 打开 MetaMask
2. 点击网络下拉菜单
3. 点击 "添加网络" → "手动添加网络"
4. 填入以下信息:
   - **网络名称:** Localhost 8545
   - **RPC URL:** http://127.0.0.1:8545
   - **链 ID:** 31337
   - **货币符号:** ETH

##### 导入测试账户:

Hardhat 本地节点会生成测试账户。在启动节点的终端中可以看到私钥列表。

复制第一个账户的私钥，在 MetaMask 中:
1. 点击账户图标
2. 选择 "导入账户"
3. 粘贴私钥

**示例私钥 (仅用于本地测试):**
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### 6. 启动前端

```bash
npm run dev
```

访问 `http://localhost:5173`

---

## 📱 连接 MetaMask

### ✅ **可以在本地运行时连接 MetaMask！**

**不需要部署到 Sepolia 测试网**。本地 Hardhat 节点完全支持 MetaMask 连接。

### 如何连接:

1. 确保 MetaMask 已切换到 "Localhost 8545" 网络
2. 在 dApp 中点击 "Connect Wallet"
3. MetaMask 会弹窗请求连接授权
4. 批准连接

### 功能说明:

- ✅ **读取合约数据** - 无需连接钱包
- ✅ **写入交易** - 需要 MetaMask 签名
- ✅ **角色管理** - 需要账户授权

---

## 🎯 使用指南

### 1. Manufacturer (制造商)
- 注册新产品
- 转移产品给零售商

### 2. Retailer (零售商)
- 管理库存
- 销售产品给客户

### 3. User (用户)
- 查看拥有的产品
- 提交保修申请

### 4. Service Center (服务中心)
- 审核保修申请
- 批准/拒绝申请

---

## 🔧 常见问题

### Q: MetaMask 显示 "错误的网络"
A: 确保切换到 "Localhost 8545" 网络

### Q: 交易失败
A: 重启 Hardhat 节点后需要:
1. 重新部署合约 (`npm run deploy:local`)
2. 复制新的 artifacts (`bash setup-artifacts.sh`)
3. 在 MetaMask 中重置账户 (设置 → 高级 → 重置账户)

### Q: 找不到合约地址
A: 确保已运行 `bash setup-artifacts.sh` 复制文件到 `public/`

### Q: "Failed to load artifacts"
A: 检查 `public/deployed.json` 和 `public/abis/*.json` 是否存在

---

## 📁 项目结构

```
├── contractsLogic/           # 智能合约
│   ├── contracts/           # Solidity 合约
│   ├── scripts/             # 部署脚本
│   └── doc/                 # 生成的 ABIs 和地址
├── src/
│   ├── contexts/            # React Context (ContractsProvider)
│   ├── hooks/               # 自定义 hooks (useEthers, useContract)
│   ├── components/          # React 组件
│   └── pages/               # 页面组件
├── public/
│   ├── deployed.json        # 部署的合约地址
│   └── abis/                # 合约 ABIs
└── hardhat.config.js        # Hardhat 配置
```

---

## 🛠️ 可用命令

```bash
npm run dev              # 启动前端开发服务器
npm run chain            # 启动本地区块链节点
npm run compile          # 编译智能合约
npm run deploy:local     # 部署合约到本地节点
npm run build            # 构建生产版本
bash setup-artifacts.sh  # 复制合约文件到 public/
```

---

## 📚 技术栈

- **前端:** React 19, Vite 7, Tailwind CSS
- **区块链:** Hardhat, Ethers.js v6, Solidity 0.8.20
- **钱包:** MetaMask

---

## 🎉 开发流程

每次开发时:

1. 启动本地节点: `npm run chain`
2. 部署合约: `npm run deploy:local`
3. 复制 artifacts: `bash setup-artifacts.sh`
4. 启动前端: `npm run dev`
5. 连接 MetaMask (确保使用 Localhost 8545 网络)

---

## ⚠️ 注意事项

- **本地节点重启后**，所有链上数据会丢失，需要重新部署
- **合约地址会变化**，记得重新复制 artifacts
- **MetaMask 账户**可能需要重置 (设置 → 高级 → 重置账户)
- **仅用于开发**，不要在生产环境使用测试私钥

---

## 📝 下一步

如果要部署到测试网 (Sepolia):

1. 获取 Sepolia 测试 ETH (从 faucet)
2. 配置 `.env` 文件与私钥
3. 更新 `hardhat.config.js` 添加 Sepolia 网络
4. 运行 `npx hardhat run scripts/deploy.js --network sepolia`

---
