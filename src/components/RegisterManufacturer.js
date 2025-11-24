// src/components/RegisterManufacturer.js
import React, { useState } from 'react';
import useEthers from '../hooks/useEthers';
import useContract from '../hooks/useContract';

export default function RegisterManufacturer({ accessAddress, accessAbi }) {
  const { provider, signer, account, connect } = useEthers();
  const [addr, setAddr] = useState('');
  const access = useContract({ address: accessAddress, abi: accessAbi, provider, signer, asSigner: true });

  async function onRegister() {
    if (!access) return alert('Connect wallet or load contracts first');
    try {
      const tx = await access.registerManufacturer(addr);
      // ethers v6 tx.wait() returns the receipt; keep UI responsive
      await tx.wait();
      alert('Manufacturer registered');
    } catch (e) {
      console.error(e);
      alert('Error: ' + (e?.message || e));
    }
  }

  return (
    <div>
      <button onClick={() => connect()}>Connect Wallet</button>
      <div>Account: {account}</div>
      <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="0x..." />
      <button onClick={onRegister}>Register Manufacturer</button>
    </div>
  );
}