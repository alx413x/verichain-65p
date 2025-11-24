// src/hooks/useEthers.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function useEthers() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      // handle account/network changes
      window.ethereum.on?.('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
      window.ethereum.on?.('chainChanged', () => {
        // reload or reinit provider on network change
        window.location.reload();
      });
    }
  }, []);

  async function connect() {
    if (!window.ethereum) throw new Error('No injected wallet found');
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    await browserProvider.send('eth_requestAccounts', []);
    const s = await browserProvider.getSigner();
    const a = await s.getAddress();
    const network = await browserProvider.getNetwork();
    setProvider(browserProvider);
    setSigner(s);
    setAccount(a);
    setChainId(network.chainId);
    return { provider: browserProvider, signer: s, account: a, chainId: network.chainId };
  }

  return { provider, signer, account, chainId, connect };
}