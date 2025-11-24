// src/hooks/useContract.js
import { useMemo } from 'react';
import { ethers } from 'ethers';

/*
  Options:
   - provider: ethers provider (BrowserProvider)
   - signer: ethers signer
   - address: contract address
   - abi: ABI JSON object or path to ABI in /public/abis (already fetched outside)
   - asSigner: boolean (true for send txs)
*/
export default function useContract({ address, abi, provider, signer, asSigner = true }) {
  const contract = useMemo(() => {
    if (!address || !abi || !provider) return null;
    const conn = asSigner && signer ? signer : provider;
    try {
      return new ethers.Contract(address, abi, conn);
    } catch (e) {
      console.error('useContract error', e);
      return null;
    }
  }, [address, abi, provider, signer, asSigner]);

  return contract;
}