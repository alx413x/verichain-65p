# Interaction Guide

This page shows quick, copy-paste workflows to interact with the deployed contracts. It assumes you've already deployed the contracts locally (see `doc/deployment.md`).

I exported the contract ABIs into `doc/abis/` and a `doc/deployed.json` file with address placeholders. After running `npm run deploy:local` replace the placeholders in `doc/deployed.json` with the printed addresses (or paste them into the examples below).

Files produced:
- `doc/deployed.json` — contains deployed addresses (placeholders until you run deploy).
- `doc/abis/*.json` — per-contract ABI files (`AccessControlContract.json`, `ProductRegistry.json`, `OwnershipManager.json`, `WarrantyManager.json`).

Two quick ways to interact:
- Hardhat console (explore and experiment)
- App / frontend (example code that imports `doc/deployed.json` and `doc/abis`)

1) Hardhat console (recommended for quick exploration)

- Start a local node if not already running:
```bash
npx hardhat node
```

- Open the Hardhat console in a new terminal (connects to localhost):
```bash
npx hardhat console --network localhost
```

- Example console session (reads addresses from `doc/deployed.json` manually):
```js
const deployed = require('../doc/deployed.json');
const accessAddr = deployed.AccessControlContract; // replace in file if still placeholder
const registryAddr = deployed.ProductRegistry;

const Access = await ethers.getContractFactory('AccessControlContract');
const access = await Access.attach(accessAddr);

const Registry = await ethers.getContractFactory('ProductRegistry');
const registry = await Registry.attach(registryAddr);

const [admin, manufacturer] = await ethers.getSigners();

// 1) admin registers manufacturer role for account[1]
await access.connect(admin).registerManufacturer(manufacturer.address);

// 2) manufacturer registers a product
const serial = 'SN-001';
const model = 'Model-A';
await registry.connect(manufacturer).registerProduct(serial, model);

// 3) verify
const details = await registry.getProductDetails(serial);
console.log(details);
```

2) One-shot script (reproducible)

- Use the helper script already in `scripts/register_and_registerProduct.js`:

```bash
ACCESS_ADDRESS=<accessAddr> REGISTRY_ADDRESS=<registryAddr> SERIAL=SN-001 MODEL=Model-A npx hardhat run scripts/register_and_registerProduct.js --network localhost
```

3) Frontend / Node example — import ABIs and addresses

Node (CommonJS) example:

```js
const { ethers } = require('ethers');
const deployed = require('../doc/deployed.json');
const AccessAbi = require('../doc/abis/AccessControlContract.json').abi;
const RegistryAbi = require('../doc/abis/ProductRegistry.json').abi;

const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
const signer = provider.getSigner(0);

const access = new ethers.Contract(deployed.AccessControlContract, AccessAbi, signer);
const registry = new ethers.Contract(deployed.ProductRegistry, RegistryAbi, signer);

// call read method
(async () => {
  const serial = 'SN-001';
  const product = await registry.getProductDetails(serial);
  console.log(product);
})();
```

Browser / bundler example (ESM):

```js
// If you copy doc/deployed.json and doc/abis into your frontend public/ or importable path,
// you can fetch them at runtime.
async function init() {
  const deployed = await (await fetch('/doc/deployed.json')).json();
  const AccessAbi = await (await fetch('/doc/abis/AccessControlContract.json')).then(r=>r.json()).then(j=>j.abi);

  const provider = new ethers.BrowserProvider(window.ethereum || new ethers.JsonRpcProvider('http://127.0.0.1:8545'));
  const signer = await provider.getSigner();
  const access = new ethers.Contract(deployed.AccessControlContract, AccessAbi, signer);
  // now call view functions or send txs via signer
}
```

Notes and troubleshooting

- Admin: By default the deployer (account[0]) receives `ADMIN_ROLE` in `AccessControlContract` during deployment. Use that account as admin to call `registerManufacturer`.
- Roles: The `registerProduct` call requires the caller to have the `MANUFACTURER_ROLE`. If you get a "Not manufacturer" revert, check that the correct account holds the role.
- Addresses: After running `npm run deploy:local`, copy the actual addresses from the deploy output into `doc/deployed.json` so the frontend can import them directly.
- Ethers: Project targets ethers v6; the examples assume ethers v6 APIs (`ethers.BrowserProvider` / `ethers.JsonRpcProvider`). If you use ethers v5, adjust the provider/contract constructors accordingly.

If you want, I can also add a small verification script that reads back the product and prints the owner, warranty state, and roles. Would you like that?
# Interaction Guide

This page shows quick, copy-paste workflows to interact with the deployed contracts. It assumes you've already deployed the contracts locally (see `doc/deployment.md`) and have the printed addresses for `AccessControlContract` and `ProductRegistry`.

Two options are shown:
- Interactive Hardhat console (good for exploring)
- One-shot Node script (reproducible)

1) Using Hardhat console (recommended for quick exploration)

- Start a local node if not already running:
```bash
npx hardhat node
```

- Open the Hardhat console in a new terminal (connects to localhost):
```bash
npx hardhat console --network localhost
```

- In the console, paste the following (replace addresses with your deployed values):
```js
const accessAddr = "<ACCESS_ADDRESS>"; // from deploy output
const registryAddr = "<REGISTRY_ADDRESS>"; // from deploy output

const Access = await ethers.getContractFactory("AccessControlContract");
const access = await Access.attach(accessAddr);

const Registry = await ethers.getContractFactory("ProductRegistry");
const registry = await Registry.attach(registryAddr);

const [admin, manufacturer] = await ethers.getSigners();

// 1) admin registers manufacturer role for account[1]
await access.connect(admin).registerManufacturer(manufacturer.address);
// wait for mined if needed: const tx = await access.connect(admin).registerManufacturer(manufacturer.address); await tx.wait();

// 2) manufacturer registers a product
const serial = "SN-001";
const model = "Model-A";
await registry.connect(manufacturer).registerProduct(serial, model);

// 3) verify
const details = await registry.getProductDetails(serial);
console.log(details);
```

2) Using the provided one-shot script (reproducible)

- Set environment variables and run the script with Hardhat run:

```bash
ACCESS_ADDRESS=<accessAddr> REGISTRY_ADDRESS=<registryAddr> SERIAL=SN-001 MODEL=Model-A npx hardhat run scripts/register_and_registerProduct.js --network localhost
```

- The script does two things:
  - Calls `registerManufacturer(manufacturerAddress)` from the admin signer (signer[0])
  - Calls `registerProduct(serial, model)` from the manufacturer signer (signer[1])

Notes and troubleshooting

- Admin: By default the deployer (account[0]) receives ADMIN_ROLE in `AccessControlContract` during deployment. Use that account as admin to call `registerManufacturer`.
- Roles: The `registerProduct` call requires the caller to have the `MANUFACTURER_ROLE`. If you get a "Not manufacturer" revert, check that the correct account holds the role.
- Ethers v6: Scripts use Hardhat's `ethers` (project uses ethers v6). Transaction results usually have `.wait()` — the helper script calls `.wait()` when present.

If you want, I can also add a small verification script that reads back the product and prints the owner, warranty state, and roles. Would you like that? 
