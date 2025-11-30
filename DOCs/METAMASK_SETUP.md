# MetaMask 本地连接配置指南

## 步骤 1: 添加本地网络到 MetaMask

1. 打开 MetaMask 扩展
2. 点击顶部的网络下拉菜单
3. 点击 **"添加网络"** 或 **"手动添加网络"**
4. 填入以下信息:

| 字段 | 值 |
|------|-----|
| **网络名称** | Localhost 8545 |
| **RPC URL** | http://127.0.0.1:8545 |
| **链 ID** | 31337 |
| **货币符号** | ETH |
| **区块浏览器 URL** | (留空) |

5. 点击 **"保存"**

## 步骤 2: 导入测试账户

在运行了 `npx hardhat node` 后，出现的是 Hardhat 本地节点提供的预配置测试账户：

### Account #0 (Admin)
- **地址:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **私钥:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **余额:** 10000 ETH (测试币)

### Account #1 (Manufacturer)
- **地址:** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **私钥:** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **余额:** 10000 ETH (测试币)

### Account #2 (Retailer)
- **地址:** `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- **私钥:** `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

### Account #3 (Customer)
- **地址:** `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- **私钥:** `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`

### Account #4 (Service Center)
- **地址:** `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` 
- **私钥:** `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`

### 导入步骤:

1. 在 MetaMask 中点击右上角的账户图标
2. 选择 **"导入账户"**
3. 选择类型: **"私钥"**
4. 粘贴上面的私钥 (选择账户 #0 或 #1)
5. 点击 **"导入"**

## 步骤 3: 切换到本地网络

1. 确保 MetaMask 切换到 **"Localhost 8545"** 网络
2. 确认您看到账户余额为 10000 ETH

## 步骤 4: 连接 dApp

1. 访问应用: http://localhost:5173
2. 点击右上角的 **"Connect Wallet"** 按钮
3. MetaMask 会弹出授权请求
4. 点击 **"下一步"** → **"连接"**

## 已部署的合约地址

当前部署的合约地址 (来自 `public/deployed.json`):

```json
{
  "AccessControlContract": "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  "ProductRegistry": "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
  "OwnershipManager": "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  "WarrantyManager": "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
}
```

⚠️ **注意:** 每次重启 Hardhat 节点后，这些地址会改变。需要重新部署并复制 artifacts。

## 常见问题

### Q1: MetaMask 显示 "错误的网络"
**A:** 确保已切换到 "Localhost 8545" 网络

### Q2: 交易失败或 Nonce 错误
**A:** Hardhat 节点重启后需要重置 MetaMask 账户:
1. 设置 → 高级 → 清除活动数据
2. 或者 设置 → 高级 → 重置账户

### Q3: 无法连接到本地节点
**A:** 确保 Hardhat 节点正在运行:
```bash
npm run chain
```

### Q4: "Failed to load artifacts"
**A:** 确保已复制 artifacts:
```bash
bash setup-artifacts.sh
```
