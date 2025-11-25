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
    if (!address || !abi || !provider) {
      console.log('useContract: Missing required parameters:', { 
        hasAddress: !!address, 
        hasAbi: !!abi, 
        hasProvider: !!provider,
        address 
      });
      return null;
    }
    const conn = asSigner && signer ? signer : provider;
    try {
      const contractInstance = new ethers.Contract(address, abi, conn);
      console.log('Contract created successfully:', address);
      return contractInstance;
    } catch (e) {
      console.error('useContract error', e);
      return null;
    }
  }, [address, abi, provider, signer, asSigner]);

  return contract;
}