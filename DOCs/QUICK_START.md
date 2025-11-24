# VeriChain Passport - 快速启动卡片

## 30秒快速启动

```bash
# 终端 1 - 启动区块链 (保持运行)
npm run chain

# 终端 2 - 启动前端
npm run dev
```

然后访问: **http://localhost:5173**

---

## MetaMask 快速配置

### 添加网络:
- **网络名:** Localhost 8545
- **RPC URL:** http://127.0.0.1:8545
- **链 ID:** 31337
- **符号:** ETH

### 导入测试账户:
**私钥:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

---

## 常用命令

```bash
npm run chain          # 启动本地区块链
npm run compile        # 编译智能合约
npm run deploy:local   # 部署合约
npm run dev            # 启动前端
bash setup-artifacts.sh # 复制 artifacts
```

---

## 重启流程

如果重启了区块链节点:

```bash
npm run deploy:local        # 重新部署
bash setup-artifacts.sh     # 复制文件
```

然后在 MetaMask: **设置 → 高级 → 重置账户**

---

## 重要文件位置

- **合约源码:** `contractsLogic/contracts/`
- **部署脚本:** `contractsLogic/scripts/deploy.cjs`
- **前端代码:** `src/`
- **合约地址:** `public/deployed.json`
- **ABIs:** `public/abis/`

---

## 检查清单

- [ ] `npm run chain` 正在运行
- [ ] `npm run dev` 正在运行
- [ ] MetaMask 已切换到 Localhost 8545
- [ ] MetaMask 已导入测试账户
- [ ] 点击 "Connect Wallet" 成功连接

---

## 快速故障排除

| 问题 | 解决方案 |
|------|---------|
| 无法连接钱包 | 确保 MetaMask 在 Localhost 8545 网络 |
| 交易失败 | 重置 MetaMask 账户 |
| Failed to load artifacts | 运行 `bash setup-artifacts.sh` |
| 合约地址改变 | 正常现象，每次重启节点都会改变 |

---
