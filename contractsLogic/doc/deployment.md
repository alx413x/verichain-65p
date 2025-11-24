# Deployment Guide (Local Hardhat)

This document explains how to run the project's smart contract deployments locally using Hardhat and ethers v6.

Prerequisites

- Node.js (>=18 recommended)
- npm

Install dependencies

```bash
npm install
```

Start a local Hardhat node (in one terminal):

```bash
npx hardhat node
```

Deploy contracts to the local node (in another terminal):

```bash
npm run deploy:local
```

What the `deploy` script does

- Deploys `AccessControlContract` (no constructor args)
- Deploys `ProductRegistry(accessAddress)`
- Deploys `OwnershipManager(accessAddress, registryAddress)`
- Deploys `WarrantyManager(accessAddress, registryAddress)`
- Calls `setOwnershipManager(ownershipAddress)` and `setWarrantyManager(warrantyAddress)` on `ProductRegistry`

Notes

- The project uses `ethers` v6 APIs (e.g. `contract.getAddress()`, `contract.waitForDeployment()`). The deploy script contains fallbacks for environments where v5 APIs (`deployed()`, `.address`) may be present.
- If you see errors about missing constructor arguments, check the order and count: `OwnershipManager` and `WarrantyManager` require both `accessAddress` and `registryAddress`.

Troubleshooting

- "Nothing to compile": no changes to compile, that is fine as long as artifacts/existing builds are present.
- If the deploy script errors about `waitForDeployment` not being a function, ensure `ethers` v6 is installed (see `package.json`) and run `npm install`.

