# Ethers.js v6 Compatibility Notes

This project targets `ethers` v6. The following patterns were applied to make deployment scripts robust across v5/v6 differences:

- Contract deployment and waiting:
  - v6: `const c = await Factory.deploy(...); await c.waitForDeployment();`
  - v5: `const c = await Factory.deploy(...); await c.deployed();`
  - Use runtime checks:
    ```js
    if (typeof c.waitForDeployment === 'function') await c.waitForDeployment();
    else if (typeof c.deployed === 'function') await c.deployed();
    ```

- Retrieving deployed address:
  - v6: `await c.getAddress()`
  - v5: `c.address`
  - Use: `const addr = c.getAddress ? await c.getAddress() : c.address;`

- Transaction receipts:
  - Some contract methods return a transaction-like object. To wait for the transaction to be mined, check for `.wait()` on the result (works for both libs):
    ```js
    const tx = await contract.someTx(...);
    if (tx.wait) await tx.wait();
    ```

Why we chose v6

- `@nomicfoundation/hardhat-toolbox` in recent versions ships with ethers v6 integrations and the newer API is preferred for future compatibility.

If you need to pin to a different ethers version, update `package.json` and `npm install` accordingly.
