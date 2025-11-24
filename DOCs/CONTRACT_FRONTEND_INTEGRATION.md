## **Overview**
- **Goal:** Explain how to hook the Solidity contracts in `contractsLogic` to the React frontend in this repo.
- **Files referenced:** `contractsLogic/contracts/*.sol`, `contractsLogic/scripts/deploy.js`, `contractsLogic/doc/deployed.json` and `contractsLogic/doc/abis/*.json`.

## **Prerequisites**
- **Install deps:** Run `npm install` at the project root (Hardhat and frontend deps should already be in `package.json`).
- **Local node (optional):** For local development start a Hardhat node: `npx hardhat node`.

## **1. Build & Deploy contracts**
- **Compile:** `npx hardhat compile`
- **Start local node (optional):** `npx hardhat node`
- **Deploy:** Use the repo deploy script (this script writes deploy metadata into `doc/`):

```bash
# from repo root
npx hardhat run contractsLogic/scripts/deploy.js --network localhost
```

- After running, the deployment script will try to write `deployed.json` and copy ABIs into `doc/abis/` (see `contractsLogic/scripts/deploy.js`). Example output location: `contractsLogic/doc/deployed.json` and `contractsLogic/doc/abis/*.json`.

## **2. Make ABIs and deployed addresses available to the frontend**
- The frontend hook `src/hooks/loadArtifacts.js` expects the following files to be served from the app root (`public`):
  - `/deployed.json`
  - `/abis/AccessControlContract.json`, `/abis/ProductRegistry.json`, `/abis/OwnershipManager.json`, `/abis/WarrantyManager.json`

- To expose the contract artifacts to the frontend copy them into `public/` (example commands):

```bash
# copy deployed addresses and ABIs to the public folder so the client can fetch them
cp contractsLogic/doc/deployed.json public/deployed.json
mkdir -p public/abis
cp contractsLogic/doc/abis/*.json public/abis/
```

- Alternatively, modify the deploy script to write directly to `public/` instead of `doc/`.

## **3. Frontend: load artifacts and create contract instances**
- This repo already contains a `src/hooks/loadArtifacts.js` which fetches `/deployed.json` and the 4 ABI files. Use it on app init or in a provider component.

- Example pattern (React):

```javascript
import { useEffect, useState } from 'react';
import useEthers from './hooks/useEthers';
import useContract from './hooks/useContract';
import { loadArtifacts } from './hooks/loadArtifacts';

function useContractsLoaded() {
  const { provider, signer, connect } = useEthers();
  const [artifacts, setArtifacts] = useState(null);

  useEffect(() => {
    (async () => {
      const loaded = await loadArtifacts();
      setArtifacts(loaded);
    })();
  }, []);

  // Example: make a `productRegistry` contract instance
  const registryAbi = artifacts?.RegistryABI?.abi || artifacts?.RegistryABI;
  const registryAddr = artifacts?.deployed?.ProductRegistry;
  const productRegistry = useContract({ address: registryAddr, abi: registryAbi, provider, signer, asSigner: true });

  return { artifacts, productRegistry, connect };
}
```

- Notes:
  - Many artifact JSON files contain the full Hardhat artifact; the ABI array usually lives at `.abi`. The `loadArtifacts` helper returns the raw JSON artifact object; pass `artifact.abi` to `ethers.Contract` or the whole artifact if your hook unwraps it.
  - `useContract` in `src/hooks/useContract.js` expects an `abi` array or object accepted by `ethers.Contract` and a `provider` (and optionally `signer`). If you call state-mutating methods, pass `signer` or `asSigner: true`.

## **4. Example: calling contract functions from a component**
- Example for registering a product (manufacturer):

```javascript
async function registerProduct(productRegistry, serial, model) {
  if (!productRegistry) throw new Error('Contract not loaded');
  // productRegistry.registerProduct(serial, model) returns a transaction
  const tx = await productRegistry.registerProduct(serial, model);
  await tx.wait();
}
```

- Example for reading product details (view call, no signer required):

```javascript
const details = await productRegistry.getProductDetails(serial);
```

## **5. Wallet & provider choices**
- `src/hooks/useEthers.js` already implements a `connect()` function that uses `window.ethereum` and returns a `BrowserProvider` and `Signer`. Use `connect()` to prompt the user to connect MetaMask.
- For read-only access without a user wallet, you can instantiate a JSON-RPC provider in code:

```javascript
import { ethers } from 'ethers';
const rpc = import.meta.env.VITE_RPC_URL || 'http://localhost:8545';
const readProvider = new ethers.JsonRpcProvider(rpc);
```

## **6. Tips & common issues**
- ABI vs artifact: call `artifact.abi` when passing to `ethers.Contract` if the artifact includes other fields.
- Network mismatch: ensure the chain the frontend wallet is connected to matches where contracts were deployed (Hardhat default local addresses differ from public testnets). If you deploy to a local Hardhat node use the same network in the wallet (Hardhat prints the local chainId).
- CORS / static serving: ensure the JSON files are in `public/` so the dev server serves them (Vite serves `public` at `/`).
- Persistence between reloads: `deployed.json` contains addresses for a single run; redeploying (e.g., Hardhat node restart) changes addresses—update `public/deployed.json` after every deploy.

## **7. Where things live in this repo**
- **Contracts:** `contractsLogic/contracts/*.sol`
- **Deploy script:** `contractsLogic/scripts/deploy.js` (writes `doc/deployed.json` and `doc/abis/*`)
- **Current artifacts copy (example):** `contractsLogic/doc/deployed.json` and `contractsLogic/doc/abis/*.json`
- **Frontend artifact loader:** `src/hooks/loadArtifacts.js`
- **Frontend contract hook:** `src/hooks/useContract.js`
- **Wallet hook:** `src/hooks/useEthers.js`

## **8. Quick checklist**
- [ ] Compile contracts: `npx hardhat compile`
- [ ] Start local node (if using): `npx hardhat node`
- [ ] Deploy: `npx hardhat run contractsLogic/scripts/deploy.js --network localhost`
- [ ] Copy artifacts into `public/`:

```bash
cp contractsLogic/doc/deployed.json public/deployed.json
mkdir -p public/abis && cp contractsLogic/doc/abis/*.json public/abis/
```

- [ ] Start frontend: `npm run dev` (Vite)
- [ ] In app call `connect()` from `useEthers()` and create contracts using `useContract()` with the loaded ABIs/addresses.

- If you want, I can also:
  - copy the artifacts into `public/` automatically in the repo, or
  - patch `contractsLogic/scripts/deploy.js` to write directly to `public/` instead of `doc/`, or
  - add a small `ContractsProvider` React component to this repo that wires `loadArtifacts`, `useEthers`, and exposes contract instances via context.

---

Document generated from code in `contractsLogic` and `src/hooks`.
