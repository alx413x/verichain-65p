# MetaMask 本地连接配置指南

## 📝 步骤 1: 添加本地网络到 MetaMask

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

## 🔑 步骤 2: 导入测试账户

Hardhat 本地节点提供了预配置的测试账户。您可以使用以下任一账户:

### 账户 #0 (推荐)
- **地址:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **私钥:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **余额:** 10000 ETH (测试币)

### 账户 #1
- **地址:** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **私钥:** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **余额:** 10000 ETH (测试币)

### 导入步骤:

1. 在 MetaMask 中点击右上角的账户图标
2. 选择 **"导入账户"**
3. 选择类型: **"私钥"**
4. 粘贴上面的私钥 (选择账户 #0 或 #1)
5. 点击 **"导入"**

## ✅ 步骤 3: 切换到本地网络

1. 确保 MetaMask 切换到 **"Localhost 8545"** 网络
2. 确认您看到账户余额为 10000 ETH

## 🚀 步骤 4: 连接 dApp

1. 访问应用: http://localhost:5173
2. 点击右上角的 **"Connect Wallet"** 按钮
3. MetaMask 会弹出授权请求
4. 点击 **"下一步"** → **"连接"**

## 🎯 已部署的合约地址

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

## 🔧 常见问题

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

## 🎉 测试功能

连接成功后，您可以测试:

1. ✅ **Manufacturer Portal** - 注册产品、转移给零售商
2. ✅ **Retailer Portal** - 管理库存、销售给用户
3. ✅ **User Dashboard** - 查看产品、申请保修
4. ✅ **Service Center** - 审核保修申请

每个写操作都会触发 MetaMask 签名请求！

---
